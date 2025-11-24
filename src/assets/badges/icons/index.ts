/**
 * Badge Icons Index
 * Central export point for all achievement icons
 */

import { AchievementType } from '../../../types/badge.types';

/**
 * Icon file mapping
 * Track 3 Focus: Community Engagement and Sustainability
 */
export const ICON_FILES: Record<AchievementType, string> = {
  tree_planter: 'community-builder.svg',
  carbon_warrior: 'social-mobilizer.svg',
  water_guardian: 'collaboration-champion.svg',
  biodiversity_champion: 'knowledge-sharer.svg',
  community_leader: 'community-leader.svg',
  climate_hero: 'climate-advocate.svg',
  forest_protector: 'initiative-champion.svg',
  green_ambassador: 'green-ambassador.svg',
  welcome_badge: 'hummingbird.svg',
  ganggreen_hero: 'hero-crown.svg',
};

/**
 * Get icon file name for achievement type
 */
export function getIconFileName(achievementType: AchievementType): string {
  return ICON_FILES[achievementType];
}

/**
 * Get full icon path
 */
export function getIconFilePath(achievementType: AchievementType): string {
  return `/src/assets/badges/icons/${ICON_FILES[achievementType]}`;
}

/**
 * Check if icon exists for achievement type
 */
export function hasIcon(achievementType: AchievementType): boolean {
  return achievementType in ICON_FILES;
}

/**
 * Get all available icon types
 */
export function getAvailableIcons(): AchievementType[] {
  return Object.keys(ICON_FILES) as AchievementType[];
}

/**
 * Icon specifications
 */
export const ICON_SPECS = {
  viewBox: '0 0 120 120',
  defaultSize: 120,
  strokeWidth: 4,
  color: '#FFFFFF',
  minSize: 50,
  maxSize: 200,
} as const;
