/**
 * Badge Icons Index
 * Central export point for all achievement icons
 */

import { AchievementType } from '../../../types/badge.types';

/**
 * Icon file mapping
 */
export const ICON_FILES: Record<AchievementType, string> = {
  tree_planter: 'tree-planter.svg',
  carbon_warrior: 'carbon-warrior.svg',
  water_guardian: 'water-guardian.svg',
  biodiversity_champion: 'biodiversity-champion.svg',
  community_leader: 'community-leader.svg',
  climate_hero: 'climate-hero.svg',
  forest_protector: 'forest-protector.svg',
  green_ambassador: 'green-ambassador.svg',
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
