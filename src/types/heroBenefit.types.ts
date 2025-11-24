/**
 * Hero Benefits Types
 * Types for Hero badge holder benefits including multipliers, discounts, and usage tracking
 */

// Hero Benefits Structure
export interface HeroBenefits {
  enhancedRewards: {
    initiativeMultiplier: number;
    achievementBonus: number;
  };
  platformPrivileges: {
    reducedFees: number;
    prioritySupport: boolean;
    exclusiveFeatures: string[];
  };
  socialBenefits: {
    contentPriority: number;
    specialBadge: boolean;
    heroFlair: boolean;
  };
}

// Benefit Types
export type BenefitType =
  | 'reward_multiplier'
  | 'fee_discount'
  | 'content_priority'
  | 'priority_support'
  | 'exclusive_feature';

// Benefit Usage Parameters
export interface BenefitUsageParams {
  userId: string;
  benefitType: BenefitType;
  usageContext?: string;
  valueApplied?: number;
  metadata?: Record<string, any>;
}

// Benefit Usage Record
export interface BenefitUsageRecord {
  id: string;
  userId: string;
  benefitType: BenefitType;
  usageContext?: string;
  valueApplied?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Benefit Usage Analytics
export interface BenefitUsageAnalytics {
  userId: string;
  benefitType: BenefitType;
  usageCount: number;
  lastUsed?: string;
  valueGenerated: number;
  averageValue: number;
}

// Reward Multiplier Parameters
export interface RewardMultiplierParams {
  userId: string;
  baseReward: number;
  context?: string;
}

// Fee Discount Parameters
export interface FeeDiscountParams {
  userId: string;
  baseFee: number;
  transactionType?: string;
}

// Content Priority Parameters
export interface ContentPriorityParams {
  userId: string;
  contentId: string;
  contentType: string;
}

// Service Operation Results
export interface HeroBenefitsOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface BenefitAnalyticsResult {
  success: boolean;
  analytics?: BenefitUsageAnalytics[];
  total?: number;
  error?: string;
}

// Database row types (matching database schema)
export interface BenefitUsageRow {
  id: string;
  user_id: string;
  benefit_type: string;
  usage_context?: string;
  value_applied?: number;
  metadata?: any;
  created_at: string;
}

// Type guards
export function isBenefitUsageRecord(obj: any): obj is BenefitUsageRecord {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.benefitType === 'string' &&
    typeof obj.createdAt === 'string'
  );
}

export function isBenefitUsageAnalytics(obj: any): obj is BenefitUsageAnalytics {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.benefitType === 'string' &&
    typeof obj.usageCount === 'number'
  );
}

// Constants
export const DEFAULT_HERO_BENEFITS: HeroBenefits = {
  enhancedRewards: {
    initiativeMultiplier: 1.5,
    achievementBonus: 1.2,
  },
  platformPrivileges: {
    reducedFees: 0.1, // 10% discount
    prioritySupport: true,
    exclusiveFeatures: ['early_access', 'beta_features', 'premium_analytics'],
  },
  socialBenefits: {
    contentPriority: 2, // Priority boost level
    specialBadge: true,
    heroFlair: true,
  },
};
