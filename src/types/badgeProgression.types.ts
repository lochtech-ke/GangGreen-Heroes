/**
 * Badge Progression Types
 * Types for Track 3 badge progression system
 */

export enum BadgeTier {
  HUMMINGBIRD = 'hummingbird',
  COMMUNITY_CONTRIBUTOR = 'community_contributor',
  CLIMATE_ADVOCATE = 'climate_advocate',
  ENVIRONMENTAL_CHAMPION = 'environmental_champion',
  GREEN_HERO = 'green_hero',
}

export enum GreenHeroVariant {
  SOCIAL_MOBILIZER = 'social_mobilizer',
  INITIATIVE_LEADER = 'initiative_leader',
  KNOWLEDGE_SHARER = 'knowledge_sharer',
}

export type BadgeRequirementType = 'actions' | 'social_posts' | 'initiatives' | 'referrals';

export interface BadgeRequirement {
  type: BadgeRequirementType;
  count: number;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  tier: BadgeTier;
  tier_order: number;
  description: string;
  requirements: BadgeRequirement[];
  icon_url: string;
  created_at: string;
  updated_at: string;
}

export interface GreenHeroVariantBadge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirements: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserBadgeProgress {
  id: string;
  user_id: string;
  current_badge_id: string;
  actions_completed: number;
  social_posts_created: number;
  initiatives_joined: number;
  initiatives_created: number;
  referrals_made: number;
  referrals_active: number;
  social_engagement_score: number;
  last_updated: string;
  created_at: string;
}

export interface UserEarnedBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface UserEarnedVariant {
  id: string;
  user_id: string;
  variant_id: string;
  earned_at: string;
}

export interface RequirementProgress {
  requirement: BadgeRequirement;
  current: number;
  target: number;
  isComplete: boolean;
  percentage: number;
}

export interface BadgeProgress {
  currentBadge: Badge;
  nextBadge: Badge | null;
  progressPercentage: number;
  requirementProgress: RequirementProgress[];
  userProgress: UserBadgeProgress;
}

export interface BadgeAward {
  badge: Badge;
  user_id: string;
  earned_at: string;
  is_new: boolean;
}

export interface VariantEligibility {
  variant: GreenHeroVariantBadge;
  is_eligible: boolean;
  is_earned: boolean;
  progress: Record<string, number>;
  requirements: Record<string, number>;
}

// Database response types
export interface BadgeTierRow {
  id: string;
  name: string;
  tier_order: number;
  description: string;
  icon_url: string;
  requirements: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface GreenHeroVariantRow {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirements: any; // JSONB
  created_at: string;
  updated_at: string;
}
