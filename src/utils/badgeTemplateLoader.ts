/**
 * Badge Template Loader
 * Utilities for loading and processing SVG badge templates
 */

import { BadgeConfig, BadgeMetadata } from '../types/badge.types';
import { getTierStyle, getTierDisplayName } from '../assets/badges/styles/tierStyles';
import { getForestTheme } from '../assets/badges/styles/forestThemes';
import { getAchievementConfig } from '../assets/badges/styles/achievementConfig';

/**
 * Load base template
 */
export async function loadBaseTemplate(): Promise<string> {
  try {
    const response = await fetch('/src/assets/badges/templates/base-template.svg');
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading base template:', error);
    return getFallbackTemplate();
  }
}

/**
 * Load forest pattern
 */
export async function loadForestPattern(forest: string): Promise<string> {
  try {
    const response = await fetch(`/src/assets/badges/patterns/${forest}-pattern.svg`);
    if (!response.ok) {
      throw new Error(`Failed to load pattern: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading ${forest} pattern:`, error);
    return '';
  }
}

/**
 * Replace template placeholders with actual values
 */
export function replacePlaceholders(template: string, config: BadgeConfig): string {
  const tierStyle = getTierStyle(config.tier);
  const forestTheme = getForestTheme(config.forest);
  const achievementConfig = getAchievementConfig(config.achievement);
  
  const replacements: Record<string, string> = {
    '{{gradientStart}}': tierStyle.gradientStart,
    '{{primaryColor}}': tierStyle.primaryColor,
    '{{gradientEnd}}': tierStyle.gradientEnd,
    '{{badgeName}}': config.metadata.badgeName,
    '{{tierLevel}}': config.metadata.tierLevel.toString(),
    '{{forestName}}': forestTheme.name,
    '{{achievementType}}': config.achievement,
    '{{achievementName}}': achievementConfig.displayName,
    '{{achievementCount}}': config.metadata.achievementCount.toString(),
    '{{achievementUnit}}': getAchievementUnit(config.achievement),
    '{{earnedDate}}': config.metadata.earnedDate,
    '{{uniqueBadgeId}}': config.metadata.uniqueBadgeId,
    '{{userId}}': config.metadata.userId,
    '{{tierName}}': getTierDisplayName(config.tier),
  };
  
  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return result;
}

/**
 * Get achievement unit text
 */
function getAchievementUnit(achievement: string): string {
  const units: Record<string, string> = {
    tree_planter: 'Trees Planted',
    carbon_warrior: 'Tons CO₂ Offset',
    water_guardian: 'Liters Protected',
    biodiversity_champion: 'Species Supported',
    community_leader: 'People Engaged',
    climate_hero: 'Actions Taken',
    forest_protector: 'Hectares Protected',
    green_ambassador: 'People Reached',
  };
  return units[achievement] || 'Achievements';
}

/**
 * Extract SVG content without wrapper
 */
export function extractSVGContent(svgString: string): string {
  const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match ? match[1] : svgString;
}

/**
 * Embed metadata in SVG
 */
export function embedMetadata(svg: string, metadata: BadgeMetadata): string {
  const metadataXML = `
  <metadata>
    <badge>
      <name>${escapeXML(metadata.badgeName)}</name>
      <tier>${metadata.tierLevel}</tier>
      <forest>${escapeXML(metadata.forestName)}</forest>
      <achievement>${escapeXML(metadata.achievementType)}</achievement>
      <count>${metadata.achievementCount}</count>
      <date>${metadata.earnedDate}</date>
      <id>${metadata.uniqueBadgeId}</id>
      <user>${metadata.userId}</user>
    </badge>
  </metadata>
  `;
  
  // Insert metadata after opening svg tag
  return svg.replace(/<svg([^>]*)>/, `<svg$1>${metadataXML}`);
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validate badge configuration
 */
export function validateBadgeConfig(config: BadgeConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.id || config.id.trim() === '') {
    errors.push('Badge ID is required');
  }
  
  if (!['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(config.tier)) {
    errors.push('Invalid tier');
  }
  
  if (!['kakamega', 'karura', 'mau'].includes(config.forest)) {
    errors.push('Invalid forest');
  }
  
  // Only validate UUID format if uniqueBadgeId looks like a UUID (contains hyphens)
  if (config.metadata.uniqueBadgeId.includes('-') && 
      !config.metadata.uniqueBadgeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    errors.push('Invalid UUID format for badge ID');
  }
  
  // Make date validation more lenient - accept any ISO-like date
  if (!config.metadata.earnedDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    errors.push('Invalid ISO 8601 date format');
  }
  
  if (config.metadata.achievementCount < 0) {
    errors.push('Achievement count must be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Fallback template when loading fails
 */
function getFallbackTemplate(): string {
  return `
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#10B981" rx="20"/>
  <text x="200" y="200" text-anchor="middle" font-size="24" fill="white">
    Badge Template Error
  </text>
</svg>
  `;
}

/**
 * Optimize SVG output
 */
export function optimizeSVG(svg: string): string {
  // Remove unnecessary whitespace
  let optimized = svg.replace(/>\s+</g, '><');
  
  // Remove comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove empty groups
  optimized = optimized.replace(/<g[^>]*>\s*<\/g>/g, '');
  
  return optimized.trim();
}
