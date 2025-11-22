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
  private readonly REWARD_RATIO = 200; // 1 GG Coin per 200 KES
  private readonly DECIMAL_PRECISION = 3; // 3 decimal places

  /**
   * Calculate GG Coin reward for a purchase amount in KES
   * 
   * Formula: GG Coins = round(amount_kes / 200, 3)
   * 
   * Examples:
   * - 200 KES → 1.000 GG Coins
   * - 100 KES → 0.500 GG Coins
   * - 50 KES → 0.250 GG Coins
   * - 10 KES → 0.050 GG Coins
   * - 1 KES → 0.005 GG Coins
   * - 1000 KES → 5.000 GG Coins
   * - 2500 KES → 12.500 GG Coins
   * 
   * @param amountKes - Purchase amount in Kenyan Shillings
   * @returns GG Coin reward rounded to 3 decimal places
   */
  calculatePurchaseReward(amountKes: number): number {
    if (amountKes < 0) {
      console.warn('[GGCoinService] Negative amount provided to calculatePurchaseReward:', amountKes);
      return 0;
    }

    // Calculate reward: amount / 200
    const reward = amountKes / this.REWARD_RATIO;

    // Round to 3 decimal places
    const roundedReward = Math.round(reward * Math.pow(10, this.DECIMAL_PRECISION)) / Math.pow(10, this.DECIMAL_PRECISION);

    console.log(`[GGCoinService] Calculated reward for ${amountKes} KES: ${roundedReward} GG Coins`);

    return roundedReward;
  }

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
   * Get total GG Coins in circulation across all users
   * Useful for platform statistics and monitoring
   */
  async getTotalCoinsInCirculation(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('gg_coins');

      if (error) {
        console.error('[GGCoinService] Error fetching total coins:', error);
        return 0;
      }

      const total = data?.reduce((sum, user) => sum + (user.gg_coins || 0), 0) || 0;
      
      // Round to 3 decimal places
      return Math.round(total * 1000) / 1000;
    } catch (error) {
      console.error('[GGCoinService] Exception fetching total coins:', error);
      return 0;
    }
  }

  /**
   * Get top users by GG Coin balance (leaderboard)
   * 
   * @param limit - Number of top users to return (default: 10)
   * @returns Array of users with their balances, sorted by balance descending
   */
  async getTopUsersByBalance(limit: number = 10): Promise<Array<{ user_id: string; balance: number }>> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('id, gg_coins')
        .order('gg_coins', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[GGCoinService] Error fetching top users:', error);
        return [];
      }

      return data?.map(user => ({
        user_id: user.id,
        balance: user.gg_coins || 0,
      })) || [];
    } catch (error) {
      console.error('[GGCoinService] Exception fetching top users:', error);
      return [];
    }
  }

  /**
   * Get transaction statistics for a user
   * 
   * @param userId - User ID to get statistics for
   * @returns Statistics including total credits, debits, and transaction count
   */
  async getTransactionStatistics(userId: string): Promise<{
    total_credits: number;
    total_debits: number;
    transaction_count: number;
    average_credit: number;
    average_debit: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('gg_coin_transactions')
        .select('amount')
        .eq('user_id', userId);

      if (error) {
        console.error('[GGCoinService] Error fetching transaction statistics:', error);
        return {
          total_credits: 0,
          total_debits: 0,
          transaction_count: 0,
          average_credit: 0,
          average_debit: 0,
        };
      }

      const transactions = data || [];
      const credits = transactions.filter(t => t.amount > 0);
      const debits = transactions.filter(t => t.amount < 0);

      const total_credits = credits.reduce((sum, t) => sum + t.amount, 0);
      const total_debits = Math.abs(debits.reduce((sum, t) => sum + t.amount, 0));
      const average_credit = credits.length > 0 ? total_credits / credits.length : 0;
      const average_debit = debits.length > 0 ? total_debits / debits.length : 0;

      return {
        total_credits: Math.round(total_credits * 1000) / 1000,
        total_debits: Math.round(total_debits * 1000) / 1000,
        transaction_count: transactions.length,
        average_credit: Math.round(average_credit * 1000) / 1000,
        average_debit: Math.round(average_debit * 1000) / 1000,
      };
    } catch (error) {
      console.error('[GGCoinService] Exception fetching transaction statistics:', error);
      return {
        total_credits: 0,
        total_debits: 0,
        transaction_count: 0,
        average_credit: 0,
        average_debit: 0,
      };
    }
  }

  /**
   * Export transaction history to CSV format
   * 
   * @param userId - User ID to export transactions for
   * @returns CSV string with transaction history
   */
  async exportTransactionHistory(userId: string): Promise<string> {
    try {
      const transactions = await this.getTransactionHistory(userId, 1000, 0);

      if (transactions.length === 0) {
        return 'No transactions found';
      }

      // CSV header
      const header = 'Date,Type,Amount,Balance Before,Balance After,Reference Type,Description\n';

      // CSV rows
      const rows = transactions.map(t => {
        const date = new Date(t.created_at).toISOString();
        const amount = t.amount.toFixed(3);
        const balanceBefore = t.balance_before.toFixed(3);
        const balanceAfter = t.balance_after.toFixed(3);
        const refType = t.reference_type || '';
        const desc = (t.description || '').replace(/,/g, ';'); // Replace commas to avoid CSV issues

        return `${date},${t.transaction_type},${amount},${balanceBefore},${balanceAfter},${refType},"${desc}"`;
      }).join('\n');

      return header + rows;
    } catch (error) {
      console.error('[GGCoinService] Exception exporting transaction history:', error);
      return 'Error exporting transactions';
    }
  }

  /**
   * Format GG Coins for display with proper decimal formatting
   * 
   * @param amount - Amount to format
   * @param showTrailingZeros - Whether to show trailing zeros (e.g., "1.500" vs "1.5")
   * @returns Formatted string
   */
  formatGGCoins(amount: number, showTrailingZeros: boolean = true): string {
    if (showTrailingZeros) {
      return amount.toFixed(3);
    } else {
      // Remove trailing zeros but keep at least one decimal place
      const formatted = amount.toFixed(3);
      return formatted.replace(/\.?0+$/, '');
    }
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
