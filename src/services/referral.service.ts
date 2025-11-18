import { supabase } from './supabase';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import type {
  UserReferral,
  UserReferralRow,
  ReferralStats,
  ReferralMilestone,
  CreateReferralParams,
  ActivateReferralParams,
  ReferralServiceResponse,
} from '../types/referral.types';

/**
 * Referral Service
 * Manages user referrals and rewards
 */
class ReferralService {
  // Define referral milestones
  private readonly milestones: ReferralMilestone[] = [
    { threshold: 1, reward: { points: 50 }, achieved: false },
    { threshold: 5, reward: { points: 300, badge: 'referrer-bronze' }, achieved: false },
    { threshold: 10, reward: { points: 750, badge: 'referrer-silver' }, achieved: false },
    { threshold: 25, reward: { points: 2000, badge: 'referrer-gold' }, achieved: false },
    { threshold: 50, reward: { points: 5000, badge: 'referrer-platinum' }, achieved: false },
    { threshold: 100, reward: { points: 12000, badge: 'referrer-diamond' }, achieved: false },
  ];

  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: string): Promise<ReferralServiceResponse<string>> {
    try {
      console.log('[ReferralService] Generating referral code for user:', userId);

      // Call the database function to generate a unique code
      const { data, error } = await supabase.rpc('generate_referral_code', {
        user_uuid: userId,
      });

      if (error) {
        console.error('[ReferralService] Error generating referral code:', error);
        return { data: null, error: new Error('Failed to generate referral code') };
      }

      return { data: data as string, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception generating referral code:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to generate referral code'),
      };
    }
  }

  /**
   * Create a referral record
   */
  async createReferral(
    params: CreateReferralParams
  ): Promise<ReferralServiceResponse<UserReferral>> {
    try {
      console.log('[ReferralService] Creating referral:', params);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_referrals')
            .insert({
              referrer_id: params.referrerId,
              referred_id: params.referredId,
              referral_code: params.referralCode,
              status: 'pending',
              points_awarded: 0,
            })
            .select()
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'createReferral'
      );

      const { data, error } = result;

      if (error) {
        console.error('[ReferralService] Error creating referral:', error);
        return { data: null, error: new Error('Failed to create referral') };
      }

      const referral = this.transformReferralData(data);
      return { data: referral, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception creating referral:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create referral'),
      };
    }
  }

  /**
   * Activate a referral (when referred user completes first action)
   */
  async activateReferral(
    params: ActivateReferralParams
  ): Promise<ReferralServiceResponse<UserReferral>> {
    try {
      console.log('[ReferralService] Activating referral:', params);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_referrals')
            .update({
              status: 'active',
              points_awarded: params.pointsToAward,
              activated_at: new Date().toISOString(),
            })
            .eq('referred_id', params.referredId)
            .eq('status', 'pending')
            .select()
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'activateReferral'
      );

      const { data, error } = result;

      if (error) {
        console.error('[ReferralService] Error activating referral:', error);
        return { data: null, error: new Error('Failed to activate referral') };
      }

      const referral = this.transformReferralData(data);
      console.log('[ReferralService] Referral activated successfully');

      return { data: referral, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception activating referral:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to activate referral'),
      };
    }
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: string): Promise<ReferralServiceResponse<ReferralStats>> {
    try {
      console.log('[ReferralService] Fetching referral stats for user:', userId);

      // Get or generate referral code
      const { data: codeData } = await this.generateReferralCode(userId);
      const referralCode = codeData || '';

      // Fetch all referrals made by this user
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_referrals')
            .select('*')
            .eq('referrer_id', userId);

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getReferralStats'
      );

      const { data, error } = result;

      if (error) {
        console.error('[ReferralService] Error fetching referral stats:', error);
        return { data: null, error: new Error('Failed to fetch referral stats') };
      }

      // Calculate statistics
      const totalReferrals = data.length;
      const activeReferrals = data.filter((r: UserReferralRow) => r.status === 'active').length;
      const pendingReferrals = data.filter((r: UserReferralRow) => r.status === 'pending').length;
      const pointsEarned = data.reduce(
        (sum: number, r: UserReferralRow) => sum + r.points_awarded,
        0
      );

      // Calculate milestone achievements
      const milestones = this.milestones.map((milestone) => ({
        ...milestone,
        achieved: activeReferrals >= milestone.threshold,
      }));

      const stats: ReferralStats = {
        referralCode,
        referralLink: this.generateReferralLink(referralCode),
        totalReferrals,
        activeReferrals,
        pendingReferrals,
        pointsEarned,
        milestones,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception fetching referral stats:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch referral stats'),
      };
    }
  }

  /**
   * Get all referrals made by a user
   */
  async getUserReferrals(userId: string): Promise<ReferralServiceResponse<UserReferral[]>> {
    try {
      console.log('[ReferralService] Fetching referrals for user:', userId);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_referrals')
            .select('*')
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false });

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getUserReferrals'
      );

      const { data, error } = result;

      if (error) {
        console.error('[ReferralService] Error fetching referrals:', error);
        return { data: null, error: new Error('Failed to fetch referrals') };
      }

      const referrals = data.map((row: UserReferralRow) => this.transformReferralData(row));
      return { data: referrals, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception fetching referrals:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch referrals'),
      };
    }
  }

  /**
   * Get referral by referred user ID
   */
  async getReferralByReferredId(
    referredId: string
  ): Promise<ReferralServiceResponse<UserReferral>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_referrals')
            .select('*')
            .eq('referred_id', referredId)
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getReferralByReferredId'
      );

      const { data, error } = result;

      if (error) {
        if ((error as any).code === 'PGRST116') {
          // No referral found
          return { data: null, error: null };
        }
        console.error('[ReferralService] Error fetching referral:', error);
        return { data: null, error: new Error('Failed to fetch referral') };
      }

      const referral = this.transformReferralData(data);
      return { data: referral, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception fetching referral:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch referral'),
      };
    }
  }

  /**
   * Validate a referral code
   */
  async validateReferralCode(code: string): Promise<ReferralServiceResponse<boolean>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_referrals')
            .select('referral_code')
            .eq('referral_code', code)
            .limit(1);

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'validateReferralCode'
      );

      const { data, error } = result;

      if (error) {
        console.error('[ReferralService] Error validating referral code:', error);
        return { data: false, error: new Error('Failed to validate referral code') };
      }

      return { data: data.length > 0, error: null };
    } catch (error) {
      console.error('[ReferralService] Exception validating referral code:', error);
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Failed to validate referral code'),
      };
    }
  }

  /**
   * Generate referral link from code
   */
  private generateReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}`;
  }

  /**
   * Transform database row to UserReferral type
   */
  private transformReferralData(row: UserReferralRow): UserReferral {
    return {
      id: row.id,
      referrerId: row.referrer_id,
      referredId: row.referred_id,
      referralCode: row.referral_code,
      status: row.status,
      pointsAwarded: row.points_awarded,
      createdAt: new Date(row.created_at),
      activatedAt: row.activated_at ? new Date(row.activated_at) : undefined,
    };
  }
}

// Export singleton instance
export const referralService = new ReferralService();
