/**
 * Achievement Type Configuration
 * Metadata and display information for each achievement type
 */

import { AchievementType } from '../../../types/badge.types';

export interface AchievementConfig {
  type: AchievementType;
  displayName: string;
  description: string;
  iconFile: string;
  category: 'conservation' | 'community' | 'impact';
}

// Track 3 Focus: Community Engagement and Sustainability
export const ACHIEVEMENT_CONFIGS: Record<AchievementType, AchievementConfig> = {
  tree_planter: {
    type: 'tree_planter',
    displayName: 'Community Builder',
    description: 'Built strong community connections through engagement',
    iconFile: 'community-builder.svg',
    category: 'community',
  },
  carbon_warrior: {
    type: 'carbon_warrior',
    displayName: 'Social Mobilizer',
    description: 'Mobilized community members for climate action',
    iconFile: 'social-mobilizer.svg',
    category: 'community',
  },
  water_guardian: {
    type: 'water_guardian',
    displayName: 'Collaboration Champion',
    description: 'Fostered collaboration on conservation initiatives',
    iconFile: 'collaboration-champion.svg',
    category: 'community',
  },
  biodiversity_champion: {
    type: 'biodiversity_champion',
    displayName: 'Knowledge Sharer',
    description: 'Shared environmental knowledge and education',
    iconFile: 'knowledge-sharer.svg',
    category: 'community',
  },
  community_leader: {
    type: 'community_leader',
    displayName: 'Community Leader',
    description: 'Led community conservation initiatives',
    iconFile: 'community-leader.svg',
    category: 'community',
  },
  climate_hero: {
    type: 'climate_hero',
    displayName: 'Climate Advocate',
    description: 'Advocated for climate action and sustainability',
    iconFile: 'climate-advocate.svg',
    category: 'impact',
  },
  forest_protector: {
    type: 'forest_protector',
    displayName: 'Initiative Champion',
    description: 'Championed conservation initiatives',
    iconFile: 'initiative-champion.svg',
    category: 'impact',
  },
  green_ambassador: {
    type: 'green_ambassador',
    displayName: 'Green Ambassador',
    description: 'Spread environmental awareness and inspired action',
    iconFile: 'green-ambassador.svg',
    category: 'community',
  },
};

/**
 * Get achievement configuration
 */
export function getAchievementConfig(type: AchievementType): AchievementConfig {
  return ACHIEVEMENT_CONFIGS[type];
}

/**
 * Get achievement display name
 */
export function getAchievementDisplayName(type: AchievementType): string {
  return ACHIEVEMENT_CONFIGS[type].displayName;
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  category: 'conservation' | 'community' | 'impact'
): AchievementConfig[] {
  return Object.values(ACHIEVEMENT_CONFIGS).filter((config) => config.category === category);
}

/**
 * Get all achievement types
 */
export function getAllAchievementTypes(): AchievementType[] {
  return Object.keys(ACHIEVEMENT_CONFIGS) as AchievementType[];
}
