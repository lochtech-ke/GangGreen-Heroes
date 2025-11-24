import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Glass effect variant types
 */
export type GlassVariant = 'default' | 'dark' | 'green' | 'heavy';

/**
 * Hover effect types for glass components
 */
export type HoverEffect = 'lift' | 'glow' | 'tilt' | 'none';

/**
 * Glass component configuration
 */
export interface GlassConfig {
  background: string;
  backdropFilter: string;
  border: string;
  borderRadius: string;
  boxShadow: string;
}

/**
 * Glass variant configuration mapping
 */
export interface GlassVariantConfig {
  [key: string]: GlassConfig;
}

/**
 * Props for GlassCard component
 */
export interface GlassCardProps {
  variant?: GlassVariant;
  hover?: HoverEffect;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Button size variants
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Props for GlassButton component
 */
export interface GlassButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

/**
 * Tooltip position types
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Props for GlassTooltip component
 */
export interface GlassTooltipProps {
  content: string | ReactNode;
  position?: TooltipPosition;
  delay?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Animation preset types
 */
export type AnimationPreset = 'fadeInUp' | 'slideInRight' | 'scaleIn' | 'rotateIn';

/**
 * Props for AnimatedSection component
 */
export interface AnimatedSectionProps {
  animation?: AnimationPreset;
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
  children: ReactNode;
  className?: string;
}
