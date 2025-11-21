/**
 * Forest Theme Definitions
 * Visual themes for the three pilot forests
 */

import { ForestTheme, ForestType } from '../../../types/badge.types';

export const FOREST_THEMES: Record<ForestType, ForestTheme> = {
  kakamega: {
    name: 'Kakamega Forest',
    colors: ['#1B4D3E', '#2D5F4F', '#4A7C59'],
    pattern: 'tropical-canopy',
    decorativeElements: ['tropical-leaves', 'butterflies', 'rainfall'],
    borderAccent: 'vine-pattern',
  },
  karura: {
    name: 'Karura Forest',
    colors: ['#4A7C59', '#8B7355', '#87CEEB'],
    pattern: 'urban-forest',
    decorativeElements: ['mixed-trees', 'birds', 'pathways'],
    borderAccent: 'geometric-nature',
  },
  mau: {
    name: 'Mau Forest',
    colors: ['#3A5F5F', '#5B8A8A', '#B0C4C4'],
    pattern: 'highland-mountains',
    decorativeElements: ['mountains', 'water-streams', 'clouds'],
    borderAccent: 'wave-mountain',
  },
};

/**
 * Get forest theme configuration
 */
export function getForestTheme(forest: ForestType): ForestTheme {
  return FOREST_THEMES[forest];
}

/**
 * Get forest display name
 */
export function getForestDisplayName(forest: ForestType): string {
  return FOREST_THEMES[forest].name;
}

/**
 * Get primary forest color
 */
export function getForestPrimaryColor(forest: ForestType): string {
  return FOREST_THEMES[forest].colors[0];
}
