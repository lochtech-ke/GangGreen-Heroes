import { LucideIcon } from 'lucide-react';

/**
 * Icon category types for organizing icons by their usage context
 */
export type IconCategory =
  | 'nature'
  | 'achievement'
  | 'community'
  | 'gamification'
  | 'web3'
  | 'action'
  | 'social'
  | 'location'
  | 'time'
  | 'navigation'
  | 'admin'
  | 'finance'
  | 'governance';

/**
 * Icon size presets based on usage context
 */
export type IconSize = 'ui' | 'feature' | 'hero';

/**
 * Icon size mapping in pixels
 */
export interface IconSizeMap {
  ui: 24;
  feature: 48;
  hero: 64;
}

/**
 * Icon configuration entry with metadata
 */
export interface IconConfig {
  name: string;
  component: LucideIcon;
  category: IconCategory;
  defaultSize: IconSize;
  ariaLabel: string;
}

/**
 * Icon map entry with size variants
 */
export interface IconMapEntry {
  component: LucideIcon;
  category: IconCategory;
  size: {
    ui: number;
    feature: number;
    hero: number;
  };
}

/**
 * Props for the Icon component wrapper
 */
export interface IconProps {
  name: string;
  size?: IconSize | number;
  className?: string;
  strokeWidth?: number;
  ariaLabel?: string;
  ariaHidden?: boolean;
  onClick?: () => void;
}
