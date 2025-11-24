/**
 * Referral Types
 * Type definitions for the user referral system
 */

export type ReferralStatus = 'pending' | 'active' | 'completed';

export interface UserReferral {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: ReferralStatus;
  pointsAwarded: number;
  createdAt: Date;
  activatedAt?: Date;
}

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  pointsEarned: number;
  milestones: ReferralMilestone[];
}

export interface ReferralMilestone {
  threshold: number;
  reward: {
    points: number;
    badge?: string;
  };
  achieved: boolean;
}

// Database row types (snake_case from Supabase)
export interface UserReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: ReferralStatus;
  points_awarded: number;
  created_at: string;
  activated_at: string | null;
}

// Service parameters
export interface CreateReferralParams {
  referrerId: string;
  referredId: string;
  referralCode: string;
}

export interface ActivateReferralParams {
  referredId: string;
  pointsToAward: number;
}

// Service response types
export interface ReferralServiceResponse<T> {
  data: T | null;
  error: Error | null;
}
