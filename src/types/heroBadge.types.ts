/**
 * GangGreen Hero Badge Types
 * Types for the Hero badge system including configuration, purchases, and status management
 */

import type { InitiatePurchaseResult } from './badgePurchase.types';

// Hero Badge Configuration
export interface HeroBadgeConfig {
  id: string;
  badgeType: 'ganggreen_hero';
  tier: 'hero';
  priceKes: number;
  dailyGGCoinReward: number;
  benefitMultipliers: {
    initiativeRewards: number;
    marketplaceDiscount: number;
    contentPriority: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hero Badge Purchase Parameters
export interface HeroBadgePurchaseParams {
  userId: string;
  email: string;
  metadata?: {
    referralCode?: string;
    campaignSource?: string;
    [key: string]: any;
  };
}

// Hero Badge Holder
export interface HeroBadgeHolder {
  id: string;
  userId: string;
  badgePurchaseId: string;
  purchaseDate: string;
  lastRewardDate?: string;
  totalRewardsEarned: number;
  consecutiveRewardDays: number;
  status: 'active' | 'suspended';
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Hero Status Check Result
export interface HeroStatusResult {
  isHero: boolean;
  holder?: HeroBadgeHolder;
  config?: HeroBadgeConfig;
}

// Hero Badge Management Operations
export interface GrantHeroStatusParams {
  userId: string;
  badgePurchaseId: string;
  purchaseDate: string;
}

export interface SuspendHeroStatusParams {
  userId: string;
  reason: string;
  suspendedBy: string;
}

export interface ReinstateHeroStatusParams {
  userId: string;
}

// Service Operation Results
export interface HeroBadgeOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface GetHeroHoldersResult {
  success: boolean;
  holders?: HeroBadgeHolder[];
  total?: number;
  error?: string;
}

// Hero Badge Purchase Result (extends base purchase result)
export interface HeroBadgePurchaseResult extends InitiatePurchaseResult {
  heroBadgeConfig?: HeroBadgeConfig;
}

// Database row types (matching database schema)
export interface HeroBadgeConfigRow {
  id: string;
  badge_type: string;
  tier: string;
  price_kes: number;
  daily_gg_coin_reward: number;
  initiative_multiplier: number;
  marketplace_discount: number;
  content_priority_boost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroBadgeHolderRow {
  id: string;
  user_id: string;
  badge_purchase_id: string;
  purchase_date: string;
  last_reward_date?: string;
  total_rewards_earned: number;
  consecutive_reward_days: number;
  status: string;
  suspension_reason?: string;
  suspended_at?: string;
  suspended_by?: string;
  created_at: string;
  updated_at: string;
}

// Type guards
export function isHeroBadgeConfig(obj: any): obj is HeroBadgeConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.badgeType === 'ganggreen_hero' &&
    obj.tier === 'hero' &&
    typeof obj.priceKes === 'number' &&
    typeof obj.dailyGGCoinReward === 'number'
  );
}

export function isHeroBadgeHolder(obj: any): obj is HeroBadgeHolder {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    typeof obj.badgePurchaseId === 'string' &&
    ['active', 'suspended'].includes(obj.status)
  );
}

// Constants
export const HERO_BADGE_TYPE = 'ganggreen_hero' as const;
export const HERO_BADGE_TIER = 'hero' as const;
export const DEFAULT_HERO_PRICE_KES = 500;
export const DEFAULT_DAILY_REWARD = 0.100;
export const DEFAULT_INITIATIVE_MULTIPLIER = 1.50;
export const DEFAULT_MARKETPLACE_DISCOUNT = 0.10;
export const DEFAULT_CONTENT_PRIORITY_BOOST = 2;