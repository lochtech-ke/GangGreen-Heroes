import type { UserRole } from '../../types/user.types';

export interface NavItemConfig {
  to: string;
  label: string;
  icon: string;
  roles?: UserRole[];
  badge?: number;
}

export interface UserMenuItemConfig {
  to?: string;
  label: string;
  icon: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}
