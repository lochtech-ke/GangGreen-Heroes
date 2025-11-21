/**
 * Tier Style Definitions
 * Color schemes and visual styles for each badge tier
 */

import { TierStyle, BadgeTier } from '../../../types/badge.types';

export const TIER_STYLES: Record<BadgeTier, TierStyle> = {
  bronze: {
    primaryColor: '#CD7F32',
    gradientStart: '#CD7F32',
    gradientEnd: '#8B4513',
    borderStyle: 'brushed-metal',
    glowIntensity: 0.3,
  },
  silver: {
    primaryColor: '#C0C0C0',
    gradientStart: '#E8E8E8',
    gradientEnd: '#A0A0A0',
    borderStyle: 'polished-shine',
    glowIntensity: 0.5,
  },
  gold: {
    primaryColor: '#FFD700',
    gradientStart: '#FFD700',
    gradientEnd: '#FFA500',
    borderStyle: 'radiant-glow',
    glowIntensity: 0.7,
  },
  platinum: {
    primaryColor: '#E5E4E2',
    gradientStart: '#FFFFFF',
    gradientEnd: '#C0C0C0',
    borderStyle: 'mirror-finish',
    glowIntensity: 0.8,
  },
  diamond: {
    primaryColor: '#B9F2FF',
    gradientStart: '#E0FFFF',
    gradientEnd: '#87CEEB',
    borderStyle: 'prismatic-sparkle',
    glowIntensity: 1.0,
  },
};

/**
 * Get tier style configuration
 */
export function getTierStyle(tier: BadgeTier): TierStyle {
  return TIER_STYLES[tier];
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: BadgeTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

/**
 * Get tier level number (for sorting/comparison)
 */
export function getTierLevel(tier: BadgeTier): number {
  const levels: Record<BadgeTier, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
  };
  return levels[tier];
}

/**
 * Generate linear gradient definition for tier
 */
export function generateTierGradient(tier: BadgeTier, id: string = 'tierGradient'): string {
  const style = TIER_STYLES[tier];
  
  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.gradientStart}" />
      <stop offset="50%" stop-color="${style.primaryColor}" />
      <stop offset="100%" stop-color="${style.gradientEnd}" />
    </linearGradient>
  `;
}

/**
 * Generate radial gradient for shine effect
 */
export function generateShineGradient(tier: BadgeTier, id: string = 'shineGradient'): string {
  const style = TIER_STYLES[tier];
  const intensity = style.glowIntensity;
  
  return `
    <radialGradient id="${id}" cx="30%" cy="30%">
      <stop offset="0%" stop-color="rgba(255,255,255,${intensity * 0.8})" />
      <stop offset="50%" stop-color="rgba(255,255,255,${intensity * 0.4})" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  `;
}

/**
 * Generate metallic border gradient based on tier
 */
export function generateMetallicBorderGradient(tier: BadgeTier, id: string = 'borderGradient'): string {
  const style = TIER_STYLES[tier];
  
  // Create metallic effect with multiple stops
  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${lightenColor(style.primaryColor, 30)}" />
      <stop offset="25%" stop-color="${style.primaryColor}" />
      <stop offset="50%" stop-color="${darkenColor(style.primaryColor, 20)}" />
      <stop offset="75%" stop-color="${style.primaryColor}" />
      <stop offset="100%" stop-color="${darkenColor(style.primaryColor, 30)}" />
    </linearGradient>
  `;
}

/**
 * Get glow filter intensity for tier
 */
export function getTierGlowIntensity(tier: BadgeTier): number {
  return TIER_STYLES[tier].glowIntensity;
}

/**
 * Get border style class for tier
 */
export function getTierBorderStyle(tier: BadgeTier): string {
  return TIER_STYLES[tier].borderStyle;
}

/**
 * Lighten a hex color by percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, ((num >> 16) & 0xff) + amt);
  const G = Math.min(255, ((num >> 8) & 0xff) + amt);
  const B = Math.min(255, (num & 0xff) + amt);
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color by percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, ((num >> 16) & 0xff) - amt);
  const G = Math.max(0, ((num >> 8) & 0xff) - amt);
  const B = Math.max(0, (num & 0xff) - amt);
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}
