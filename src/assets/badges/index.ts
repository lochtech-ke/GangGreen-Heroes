/**
 * Badge System Exports
 * Central export point for all badge-related configurations and utilities
 */

// Type definitions
export * from '../../types/badge.types';

// Style configurations
export * from './styles/tierStyles';
export * from './styles/forestThemes';
export * from './styles/achievementConfig';

// Constants
export const BADGE_VIEWBOX = '0 0 400 400';
export const BADGE_SIZE = 400;
export const BADGE_EXPORT_SIZE = 1200;
export const BADGE_MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

// Social media export sizes
export const SOCIAL_MEDIA_SIZES = {
  twitter: { width: 1200, height: 1200 },
  facebook: { width: 1200, height: 1200 },
  instagram: { width: 1080, height: 1080 },
  linkedin: { width: 1200, height: 627 },
} as const;

// Badge generation constants
export const BADGE_GENERATION_TIMEOUT = 5000; // 5 seconds
export const BADGE_CACHE_SIZE = 100; // Maximum cached badges
export const BADGE_RETRY_ATTEMPTS = 3;

// Validation patterns
export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
