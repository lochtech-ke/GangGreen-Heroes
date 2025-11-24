/**
 * Forest Pattern Index
 * Central export point for forest theme patterns
 */

import { ForestType } from '../../../types/badge.types';

/**
 * Pattern file mapping
 */
export const PATTERN_FILES: Record<ForestType, string> = {
  kakamega: 'kakamega-pattern.svg',
  karura: 'karura-pattern.svg',
  mau: 'mau-pattern.svg',
};

/**
 * Get pattern file name for forest type
 */
export function getPatternFileName(forest: ForestType): string {
  return PATTERN_FILES[forest];
}

/**
 * Get full pattern path
 */
export function getPatternFilePath(forest: ForestType): string {
  return `/src/assets/badges/patterns/${PATTERN_FILES[forest]}`;
}

/**
 * Check if pattern exists for forest type
 */
export function hasPattern(forest: ForestType): boolean {
  return forest in PATTERN_FILES;
}

/**
 * Get all available forest patterns
 */
export function getAvailablePatterns(): ForestType[] {
  return Object.keys(PATTERN_FILES) as ForestType[];
}

/**
 * Pattern specifications
 */
export const PATTERN_SPECS = {
  viewBox: '0 0 400 400',
  defaultSize: 400,
  defaultOpacity: 0.2,
  minOpacity: 0.1,
  maxOpacity: 0.3,
} as const;

/**
 * Forest pattern descriptions
 */
export const PATTERN_DESCRIPTIONS: Record<ForestType, string> = {
  kakamega: 'Tropical rainforest with dense canopy, vines, and butterflies',
  karura: 'Urban forest with mixed trees, city skyline, and pathways',
  mau: 'Highland forest with mountain ridges, water streams, and mist',
};

/**
 * Get pattern description
 */
export function getPatternDescription(forest: ForestType): string {
  return PATTERN_DESCRIPTIONS[forest];
}
