import type { UserRole } from '../../types/user.types';

/**
 * Configuration for a single navigation item
 */
export interface NavItemConfig {
  to: string;
  label: string;
  icon: string;
  description?: string;
  badge?: number | string | (() => number | string);
  roles?: UserRole[];
}

/**
 * Configuration for a navigation group (dropdown menu)
 */
export interface NavGroupConfig {
  id: string;
  label: string;
  icon: string;
  items: NavItemConfig[];
}

/**
 * Overall navigation configuration
 */
export interface NavigationConfig {
  standalone: NavItemConfig[];
  groups: NavGroupConfig[];
  admin: NavItemConfig[];
}

/**
 * Configuration for a user menu item
 */
export interface UserMenuItemConfig {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

/**
 * Configuration for a quick action
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  roles?: UserRole[];
}
