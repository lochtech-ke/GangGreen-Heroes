import { supabase } from './supabase';
import type {
  GGCoinTransaction,
  CreditGGCoinsParams,
  DebitGGCoinsParams,
  GGCoinOperationResult,
} from '../types/ggCoin.types';

/**
 * GG Coin Service
 * Handles GG Coin balance management and transaction operations
 */
class GGCoinService {
  private balanceCache: Map<string, { balance: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Credit GG Coins to a user's account
   * Uses database function for atomic transaction with logging
   */
  async creditCoins(params: CreditGGCoinsParams): Promise<GGCoinOperationResult> {
    const { userId, amount, transactionType, referenceType, referenceId, description, metadata } = params;

    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    let lastError: Error | null = null;

    // Retry logic for failed credit operations
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[GGCoinService] Crediting ${amount} coins to user ${userId} (attempt ${attempt})`);

        const { data, error } = await supabase.rpc('credit_gg_coins', {
          p_user_id: userId,
          p_amount: amount,
          p_transaction_type: transactionType,
          p_reference_type: referenceType || null,
          p_reference_id: referenceId || null,
          p_description: description || null,
          p_metadata: metadata || null,
        });

        if (error) {
          console.error(`[GGCoinService] Credit error (attempt ${attempt}):`, error);
          lastError = error;
          
          if (attempt < this.MAX_RETRIES) {
            await this.delay(this.RETRY_DELAY * attempt);
            continue;
          }
          
          return {
            success: false,
            error: error.message,
          };
        }

        // Clear cache for this user
        this.balanceCache.delete(userId);

        console.log(`[GGCoinService] Successfully credited ${amount} coins to user ${userId}`);
        return data as GGCoinOperationResult;
      } catch (error) {
        console.error(`[GGCoinService] Credit exception (attempt ${attempt}):`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
          continue;
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Failed to credit coins after multiple attempts',
    };
  }

  /**
   * Debit GG Coins from a user's account
   * Uses database function for atomic transaction with logging
   */
  async debitCoins(params: DebitGGCoinsParams): Promise<GGCoinOperationResult> {
    const { userId, amount, transactionType, referenceType, referenceId, description, metadata } = params;

    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    try {
      console.log(`[GGCoinService] Debiting ${amount} coins from user ${userId}`);

      const { data, error } = await supabase.rpc('debit_gg_coins', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
        p_description: description || null,
        p_metadata: metadata || null,
      });

      if (error) {
        console.error('[GGCoinService] Debit error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Clear cache for this user
      this.balanceCache.delete(userId);

      console.log(`[GGCoinService] Successfully debited ${amount} coins from user ${userId}`);
      return data as GGCoinOperationResult;
    } catch (error) {
      console.error('[GGCoinService] Debit exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to debit coins',
      };
    }
  }

  /**
   * Get user's GG Coin balance
   * Uses caching to reduce database queries
   */
  async getBalance(userId: string): Promise<number> {
    // Check cache first
    const cached = this.balanceCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[GGCoinService] Balance served from cache for user ${userId}`);
      return cached.balance;
    }

    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('gg_coins')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[GGCoinService] Error fetching balance:', error);
        return 0;
      }

      const balance = data?.gg_coins || 0;

      // Update cache
      this.balanceCache.set(userId, {
        balance,
        timestamp: Date.now(),
      });

      return balance;
    } catch (error) {
      console.error('[GGCoinService] Exception fetching balance:', error);
      return 0;
    }
  }

  /**
   * Get user's GG Coin transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GGCoinTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('gg_coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[GGCoinService] Error fetching transaction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[GGCoinService] Exception fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Clear balance cache for a specific user or all users
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.balanceCache.delete(userId);
      console.log(`[GGCoinService] Cache cleared for user ${userId}`);
    } else {
      this.balanceCache.clear();
      console.log('[GGCoinService] All balance cache cleared');
    }
  }

  /**
   * Subscribe to balance changes for a user
   */
  subscribeToBalance(userId: string, callback: (balance: number) => void) {
    const channel = supabase
      .channel(`gg_coins_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_gamification',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = payload.new.gg_coins || 0;
          
          // Update cache
          this.balanceCache.set(userId, {
            balance: newBalance,
            timestamp: Date.now(),
          });
          
          callback(newBalance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Helper method to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const ggCoinService = new GGCoinService();
