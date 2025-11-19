import type { UserRole } from '../../types/user.types';

export interface NavItemConfig {
  to: string;
  label: string;
  icon: string;
  description?: string; // For mega menu descriptions
  roles?: UserRole[];
  badge?: number | (() => number); // Support function for dynamic badge count
  children?: NavItemConfig[]; // For nested navigation
}

export interface NavGroupConfig {
  id: string;
  label: string;
  icon: string;
  items: NavItemConfig[];
}

export interface UserMenuItemConfig {
  to?: string;
  label: string;
  icon: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  roles?: UserRole[];
}
