import type { UserRole } from '../../types/user.types';
import type { NavItemConfig } from './types';

// Base navigation items available to all authenticated users
export const baseNavigationItems: NavItemConfig[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: 'home',
  },
  {
    to: '/initiatives',
    label: 'Initiatives',
    icon: 'tree',
  },
  {
    to: '/trees',
    label: 'Tree Registry',
    icon: 'leaf',
  },
  {
    to: '/marketplace',
    label: 'Marketplace',
    icon: 'shopping-cart',
  },
  {
    to: '/gamification',
    label: 'Gamification',
    icon: 'trophy',
  },
];

// Role-specific navigation items
export const roleSpecificItems: Record<UserRole, NavItemConfig[]> = {
  organization: [
    {
      to: '/initiatives/create',
      label: 'Create Initiative',
      icon: 'plus',
      roles: ['organization'],
    },
  ],
  admin: [
    {
      to: '/admin',
      label: 'Admin',
      icon: 'shield',
      roles: ['admin'],
    },
  ],
  community: [],
  individual: [],
};

/**
 * Get navigation items filtered by user role
 * @param userRole - The role of the current user
 * @returns Array of navigation items the user has access to
 */
export function getNavigationItems(userRole?: UserRole): NavItemConfig[] {
  if (!userRole) {
    return baseNavigationItems;
  }

  const roleItems = roleSpecificItems[userRole] || [];
  return [...baseNavigationItems, ...roleItems];
}

/**
 * Check if a user has access to a specific route
 * @param route - The route to check
 * @param userRole - The role of the current user
 * @returns True if the user has access to the route
 */
export function hasRouteAccess(route: string, userRole?: UserRole): boolean {
  const items = getNavigationItems(userRole);
  return items.some((item) => item.to === route || route.startsWith(`${item.to}/`));
}
