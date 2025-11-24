/**
 * Hero Reward Distribution Types
 * Types for the Hero badge daily reward distribution system
 */

import type { GGCoinTransaction } from './ggCoin.types';

// Daily Reward Configuration
export interface DailyRewardConfig {
  baseAmount: number;
  bonusMultipliers: {
    consecutiveDays: number[];
    activityLevel: number;
  };
  maxDailyReward: number;
  maxConsecutiveDays: number;
}

// Reward Distribution Result
export interface RewardDistributionResult {
  success: boolean;
  totalHolders: number;
  successfulDistributions: number;
  failedDistributions: number;
  totalAmountDistributed: number;
  errors: string[];
  distributionDate: string;
  processingTimeMs: number;
}

// Individual User Reward Calculation
export interface UserRewardCalculation {
  userId: string;
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  consecutiveDays: number;
  activityMultiplier: number;
  lastRewardDate?: string;
}

// Hero Daily Reward Record
export interface HeroDailyReward {
  id: string;
  userId: string;
  rewardDate: string;
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  consecutiveDays: number;
  activityMultiplier: number;
  ggCoinTransactionId?: string;
  createdAt: string;
}

// Reward Distribution Parameters
export interface DistributeRewardsParams {
  targetDate?: string; // ISO date string, defaults to today
  dryRun?: boolean; // If true, calculates but doesn't distribute
  userIds?: string[]; // If provided, only distribute to these users
}

// Reward History Query Parameters
export interface RewardHistoryParams {
  userId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Reward History Result
export interface RewardHistoryResult {
  success: boolean;
  rewards?: HeroDailyReward[];
  transactions?: GGCoinTransaction[];
  total?: number;
  totalAmount?: number;
  error?: string;
}

// Reward Analytics
export interface RewardAnalytics {
  totalRewardsDistributed: number;
  totalAmountDistributed: number;
  averageRewardAmount: number;
  uniqueRecipients: number;
  distributionDays: number;
  consecutiveDaysBonuses: number;
  activityBonuses: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// Failed Reward Distribution
export interface FailedRewardDistribution {
  userId: string;
  rewardDate: string;
  calculatedAmount: number;
  errorType: 'insufficient_balance' | 'user_suspended' | 'system_error' | 'duplicate_reward';
  errorMessage: string;
  attemptCount: number;
  lastAttempt: string;
  nextRetry?: string;
}

// Reward Distribution Status
export interface RewardDistributionStatus {
  isRunning: boolean;
  lastRun?: string;
  nextScheduledRun?: string;
  lastResult?: RewardDistributionResult;
  failedDistributions: FailedRewardDistribution[];
}

// Activity Level Calculation
export interface UserActivityLevel {
  userId: string;
  activityScore: number;
  activityMultiplier: number;
  factors: {
    initiativeParticipation: number;
    socialEngagement: number;
    platformUsage: number;
    recentActions: number;
  };
  calculatedAt: string;
}

// Database row types (matching database schema)
export interface HeroDailyRewardRow {
  id: string;
  user_id: string;
  reward_date: string;
  base_amount: number;
  bonus_amount: number;
  total_amount: number;
  consecutive_days: number;
  activity_multiplier: number;
  gg_coin_transaction_id?: string;
  created_at: string;
}

// Service Operation Results
export interface HeroRewardOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Reward Retry Configuration
export interface RewardRetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier: number;
  maxRetryDelayMs: number;
}

// Constants
export const DEFAULT_DAILY_REWARD_CONFIG: DailyRewardConfig = {
  baseAmount: 0.100,
  bonusMultipliers: {
    consecutiveDays: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5], // Days 1-6+
    activityLevel: 1.2, // Up to 20% bonus for high activity
  },
  maxDailyReward: 0.500,
  maxConsecutiveDays: 30,
};

export const DEFAULT_RETRY_CONFIG: RewardRetryConfig = {
  maxRetries: 3,
  retryDelayMs: 1000,
  backoffMultiplier: 2,
  maxRetryDelayMs: 10000,
};

// Type guards
export function isHeroDailyReward(obj: any): obj is HeroDailyReward {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.rewardDate === 'string' &&
    typeof obj.baseAmount === 'number' &&
    typeof obj.totalAmount === 'number'
  );
}

export function isRewardDistributionResult(obj: any): obj is RewardDistributionResult {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean' &&
    typeof obj.totalHolders === 'number' &&
    typeof obj.successfulDistributions === 'number'
  );
}