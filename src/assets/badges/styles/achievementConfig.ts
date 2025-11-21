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

export const ACHIEVEMENT_CONFIGS: Record<AchievementType, AchievementConfig> = {
  tree_planter: {
    type: 'tree_planter',
    displayName: 'Tree Planter',
    description: 'Planted trees to restore forest ecosystems',
    iconFile: 'tree-planter.svg',
    category: 'conservation',
  },
  carbon_warrior: {
    type: 'carbon_warrior',
    displayName: 'Carbon Warrior',
    description: 'Offset carbon emissions through verified credits',
    iconFile: 'carbon-warrior.svg',
    category: 'impact',
  },
  water_guardian: {
    type: 'water_guardian',
    displayName: 'Water Guardian',
    description: 'Protected water sources and watersheds',
    iconFile: 'water-guardian.svg',
    category: 'conservation',
  },
  biodiversity_champion: {
    type: 'biodiversity_champion',
    displayName: 'Biodiversity Champion',
    description: 'Supported diverse species and ecosystems',
    iconFile: 'biodiversity-champion.svg',
    category: 'conservation',
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
    displayName: 'Climate Hero',
    description: 'Took action against climate change',
    iconFile: 'climate-hero.svg',
    category: 'impact',
  },
  forest_protector: {
    type: 'forest_protector',
    displayName: 'Forest Protector',
    description: 'Defended forests from threats',
    iconFile: 'forest-protector.svg',
    category: 'conservation',
  },
  green_ambassador: {
    type: 'green_ambassador',
    displayName: 'Green Ambassador',
    description: 'Spread environmental awareness',
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
