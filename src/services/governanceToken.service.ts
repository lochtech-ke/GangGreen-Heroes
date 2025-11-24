import { supabase } from './supabase';
import type {
  GovernanceToken,
  TokenTransaction,
  GovernanceErrorCode,
  ServiceResponse,
} from '../types/governance.types';

/**
 * Governance Token Service
 * 
 * Manages governance token distribution, balances, delegation, and voting power calculations.
 */
class GovernanceTokenService {
  /**
   * Get user's governance token balance
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('governance_tokens')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, return 0
          return 0;
        }
        throw error;
      }

      return data?.balance || 0;
    } catch (error) {
      console.error('Error fetching governance token balance:', error);
      throw new Error('Failed to fetch governance token balance');
    }
  }

  /**
   * Get user's complete governance token record
   */
  async getTokenRecord(userId: string): Promise<GovernanceToken | null> {
    try {
      const { data, error } = await supabase
        .from('governance_tokens')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching governance token record:', error);
      return null;
    }
  }

  /**
   * Award governance tokens to a user
   */
  async awardTokens(
    userId: string,
    amount: number,
    source: string,
    metadata?: Record<string, any>
  ): Promise<ServiceResponse<GovernanceToken>> {
    try {
      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN_AMOUNT' as GovernanceErrorCode,
            message: 'Token amount must be greater than 0',
          },
        };
      }

      // Get or create token record
      let tokenRecord = await this.getTokenRecord(userId);

      if (!tokenRecord) {
        // Create new record
        const { data: newRecord, error: createError } = await supabase
          .from('governance_tokens')
          .insert({
            user_id: userId,
            balance: amount,
            earned_total: amount,
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!newRecord) throw new Error('Failed to create token record');
        tokenRecord = newRecord;
      } else {
        // Update existing record
        const { data: updatedRecord, error: updateError } = await supabase
          .from('governance_tokens')
          .update({
            balance: tokenRecord.balance + amount,
            earned_total: tokenRecord.earned_total + amount,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        tokenRecord = updatedRecord || tokenRecord;
      }

      // Record transaction
      await this.recordTransaction(userId, amount, 'earned', source, metadata);

      if (!tokenRecord) {
        throw new Error('Token record is null after update');
      }

      return {
        success: true,
        data: tokenRecord,
      };
    } catch (error) {
      console.error('Error awarding tokens:', error);
      return {
        success: false,
        error: {
          code: 'TOKEN_TRANSFER_FAILED' as GovernanceErrorCode,
          message: 'Failed to award tokens',
          details: error,
        },
      };
    }
  }

  /**
   * Record a token transaction
   */
  private async recordTransaction(
    userId: string,
    amount: number,
    transactionType: 'earned' | 'delegated' | 'revoked',
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('token_transactions').insert({
        user_id: userId,
        amount,
        transaction_type: transactionType,
        source,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
      // Don't throw - transaction recording is secondary
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<TokenTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Delegate voting power to another user
   */
  async delegateTokens(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<ServiceResponse<GovernanceToken>> {
    try {
      // Validation
      if (fromUserId === toUserId) {
        return {
          success: false,
          error: {
            code: 'CANNOT_DELEGATE_TO_SELF' as GovernanceErrorCode,
            message: 'Cannot delegate tokens to yourself',
          },
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN_AMOUNT' as GovernanceErrorCode,
            message: 'Delegation amount must be greater than 0',
          },
        };
      }

      // Check circular delegation
      const hasCircular = await this.checkCircularDelegation(fromUserId, toUserId);
      if (hasCircular) {
        return {
          success: false,
          error: {
            code: 'CIRCULAR_DELEGATION' as GovernanceErrorCode,
            message: 'Circular delegation detected',
          },
        };
      }

      // Get delegator's token record
      const fromRecord = await this.getTokenRecord(fromUserId);
      if (!fromRecord || fromRecord.balance < amount) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_TOKENS' as GovernanceErrorCode,
            message: 'Insufficient tokens to delegate',
          },
        };
      }

      // Update delegator's record
      const { data: updatedRecord, error: updateError } = await supabase
        .from('governance_tokens')
        .update({
          delegated_to: toUserId,
          delegated_amount: amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', fromUserId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction
      await this.recordTransaction(fromUserId, amount, 'delegated', `delegation_to_${toUserId}`);

      return {
        success: true,
        data: updatedRecord,
      };
    } catch (error) {
      console.error('Error delegating tokens:', error);
      return {
        success: false,
        error: {
          code: 'INVALID_DELEGATION' as GovernanceErrorCode,
          message: 'Failed to delegate tokens',
          details: error,
        },
      };
    }
  }

  /**
   * Revoke token delegation
   */
  async revokeDelegation(userId: string): Promise<ServiceResponse<GovernanceToken>> {
    try {
      const tokenRecord = await this.getTokenRecord(userId);
      if (!tokenRecord || !tokenRecord.delegated_to) {
        return {
          success: false,
          error: {
            code: 'DELEGATION_NOT_FOUND' as GovernanceErrorCode,
            message: 'No active delegation found',
          },
        };
      }

      const delegatedAmount = tokenRecord.delegated_amount;

      // Update record
      const { data: updatedRecord, error: updateError } = await supabase
        .from('governance_tokens')
        .update({
          delegated_to: null,
          delegated_amount: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction
      await this.recordTransaction(userId, delegatedAmount, 'revoked', 'delegation_revoked');

      return {
        success: true,
        data: updatedRecord,
      };
    } catch (error) {
      console.error('Error revoking delegation:', error);
      return {
        success: false,
        error: {
          code: 'INVALID_DELEGATION' as GovernanceErrorCode,
          message: 'Failed to revoke delegation',
          details: error,
        },
      };
    }
  }

  /**
   * Check for circular delegation
   */
  private async checkCircularDelegation(
    fromUserId: string,
    toUserId: string,
    visited: Set<string> = new Set()
  ): Promise<boolean> {
    if (visited.has(toUserId)) {
      return true; // Circular delegation detected
    }

    visited.add(toUserId);

    const toRecord = await this.getTokenRecord(toUserId);
    if (!toRecord || !toRecord.delegated_to) {
      return false; // No further delegation
    }

    if (toRecord.delegated_to === fromUserId) {
      return true; // Direct circular delegation
    }

    // Check recursively
    return this.checkCircularDelegation(fromUserId, toRecord.delegated_to, visited);
  }

  /**
   * Get voting power for a user (including delegated power)
   * @param proposalId - Optional proposal ID for snapshot-based voting power (future use)
   */
  async getVotingPower(userId: string, _proposalId?: string): Promise<number> {
    try {
      // Get user's own tokens
      const userRecord = await this.getTokenRecord(userId);
      let votingPower = userRecord?.balance || 0;

      // If user has delegated their tokens, they have no voting power
      if (userRecord?.delegated_to) {
        votingPower = 0;
      }

      // Add delegated power from others
      const { data: delegators, error } = await supabase
        .from('governance_tokens')
        .select('delegated_amount')
        .eq('delegated_to', userId);

      if (!error && delegators) {
        const delegatedPower = delegators.reduce(
          (sum, record) => sum + (record.delegated_amount || 0),
          0
        );
        votingPower += delegatedPower;
      }

      return votingPower;
    } catch (error) {
      console.error('Error calculating voting power:', error);
      return 0;
    }
  }
}

export const governanceTokenService = new GovernanceTokenService();
export default governanceTokenService;
