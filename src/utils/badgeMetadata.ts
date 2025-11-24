/**
 * Badge Metadata Utilities
 * Helper functions for creating and managing badge metadata
 */

import { BadgeMetadata, BadgeTier, ForestType, AchievementType } from '../types/badge.types';
import { v4 as uuidv4 } from 'uuid';
import { getTierLevel } from '../assets/badges/styles/tierStyles';
import { getForestDisplayName } from '../assets/badges/styles/forestThemes';
import { getAchievementDisplayName } from '../assets/badges/styles/achievementConfig';

/**
 * Create badge metadata
 */
export function createBadgeMetadata(params: {
  tier: BadgeTier;
  forest: ForestType;
  achievement: AchievementType;
  achievementCount: number;
  userId: string;
}): BadgeMetadata {
  const { tier, forest, achievement, achievementCount, userId } = params;

  return {
    badgeName: generateBadgeName(tier, forest, achievement),
    tierLevel: getTierLevel(tier),
    forestName: getForestDisplayName(forest),
    achievementType: achievement,
    achievementCount,
    earnedDate: new Date().toISOString(),
    uniqueBadgeId: uuidv4(),
    userId,
  };
}

/**
 * Generate badge name
 */
export function generateBadgeName(
  tier: BadgeTier,
  forest: ForestType,
  achievement: AchievementType
): string {
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const forestName = getForestDisplayName(forest);
  const achievementName = getAchievementDisplayName(achievement);

  return `${tierName} ${forestName} ${achievementName}`;
}

/**
 * Extract metadata from SVG
 */
export function extractMetadataFromSVG(svgString: string): BadgeMetadata | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    const metadata = doc.querySelector('metadata badge');
    if (!metadata) {
      return null;
    }

    const getValue = (tag: string): string => {
      const element = metadata.querySelector(tag);
      return element?.textContent || '';
    };

    return {
      badgeName: getValue('name'),
      tierLevel: parseInt(getValue('tier'), 10),
      forestName: getValue('forest'),
      achievementType: getValue('achievement'),
      achievementCount: parseInt(getValue('count'), 10),
      earnedDate: getValue('date'),
      uniqueBadgeId: getValue('id'),
      userId: getValue('user'),
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return null;
  }
}

/**
 * Validate metadata
 */
export function validateMetadata(metadata: BadgeMetadata): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metadata.badgeName || metadata.badgeName.trim() === '') {
    errors.push('Badge name is required');
  }

  if (metadata.tierLevel < 1 || metadata.tierLevel > 5) {
    errors.push('Tier level must be between 1 and 5');
  }

  if (!metadata.forestName || metadata.forestName.trim() === '') {
    errors.push('Forest name is required');
  }

  if (!metadata.achievementType || metadata.achievementType.trim() === '') {
    errors.push('Achievement type is required');
  }

  if (metadata.achievementCount < 0) {
    errors.push('Achievement count must be non-negative');
  }

  // Validate ISO 8601 date format
  if (!metadata.earnedDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)) {
    errors.push('Invalid date format (must be ISO 8601)');
  }

  // Validate UUID v4 format
  if (!metadata.uniqueBadgeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    errors.push('Invalid badge ID format (must be UUID v4)');
  }

  if (!metadata.userId || metadata.userId.trim() === '') {
    errors.push('User ID is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format metadata for display
 */
export function formatMetadataForDisplay(metadata: BadgeMetadata): Record<string, string> {
  return {
    'Badge Name': metadata.badgeName,
    'Tier': `Level ${metadata.tierLevel}`,
    'Forest': metadata.forestName,
    'Achievement': metadata.achievementType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    'Count': metadata.achievementCount.toLocaleString(),
    'Earned': new Date(metadata.earnedDate).toLocaleDateString(),
    'Badge ID': metadata.uniqueBadgeId,
  };
}

/**
 * Compare two metadata objects
 */
export function compareMetadata(a: BadgeMetadata, b: BadgeMetadata): boolean {
  return (
    a.badgeName === b.badgeName &&
    a.tierLevel === b.tierLevel &&
    a.forestName === b.forestName &&
    a.achievementType === b.achievementType &&
    a.achievementCount === b.achievementCount &&
    a.earnedDate === b.earnedDate &&
    a.uniqueBadgeId === b.uniqueBadgeId &&
    a.userId === b.userId
  );
}

/**
 * Create metadata hash for verification
 */
export function createMetadataHash(metadata: BadgeMetadata): string {
  const data = `${metadata.uniqueBadgeId}|${metadata.userId}|${metadata.earnedDate}|${metadata.achievementCount}`;
  
  // Simple hash function (in production, use a proper crypto hash)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Serialize metadata to JSON
 */
export function serializeMetadata(metadata: BadgeMetadata): string {
  return JSON.stringify(metadata, null, 2);
}

/**
 * Deserialize metadata from JSON
 */
export function deserializeMetadata(json: string): BadgeMetadata | null {
  try {
    const metadata = JSON.parse(json);
    const validation = validateMetadata(metadata);
    
    if (!validation.valid) {
      console.error('Invalid metadata:', validation.errors);
      return null;
    }
    
    return metadata;
  } catch (error) {
    console.error('Error deserializing metadata:', error);
    return null;
  }
}
