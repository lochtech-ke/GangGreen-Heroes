import type { UserRole } from '../../types/user.types';
import type { NavItemConfig, NavGroupConfig } from './types';

// Standalone navigation items (not in groups)
export const standaloneNavigationItems: NavItemConfig[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: 'home',
  },
  {
    to: '/gamification',
    label: 'Rewards',
    icon: 'trophy',
    badge: 0, // Will be updated dynamically
  },
];

// Navigation groups for mega menu dropdowns
export const navigationGroups: NavGroupConfig[] = [
  {
    id: 'community',
    label: 'Community',
    icon: 'users',
    items: [
      {
        to: '/social-feed',
        label: 'Social Feed',
        icon: 'hash',
        description: 'Share and discover conservation stories',
      },
      {
        to: '/forums',
        label: 'Forums',
        icon: 'message-square',
        description: 'Discuss with the community',
      },
      {
        to: '/events',
        label: 'Events',
        icon: 'calendar',
        description: 'Join local conservation events',
      },
    ],
  },
  {
    id: 'conservation',
    label: 'Conservation',
    icon: 'tree',
    items: [
      {
        to: '/initiatives',
        label: 'Initiatives',
        icon: 'tree',
        description: 'Browse and join conservation projects',
      },
      {
        to: '/trees',
        label: 'Tree Registry',
        icon: 'leaf',
        description: 'Track planted trees and their impact',
      },
      {
        to: '/journey',
        label: 'My Journey',
        icon: 'map',
        description: 'Your personal conservation journey',
      },
      {
        to: '/initiatives/create',
        label: 'Create Initiative',
        icon: 'plus',
        description: 'Start a new conservation project',
        roles: ['organization'],
      },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: 'shopping-bag',
    items: [
      {
        to: '/marketplace',
        label: 'Carbon Credits',
        icon: 'cloud',
        description: 'Trade verified carbon credits',
      },
      {
        to: '/nft-badges',
        label: 'NFT Badges',
        icon: 'award',
        description: 'Collect achievement badges',
        badge: 0, // Will be updated dynamically
      },
      {
        to: '/donate',
        label: 'Donate',
        icon: 'heart',
        description: 'Support conservation efforts',
      },
    ],
  },
];

// Admin-specific navigation items
export const adminNavigationItems: NavItemConfig[] = [
  {
    to: '/admin/moderation',
    label: 'Moderation',
    icon: 'shield',
    description: 'Content moderation dashboard',
    roles: ['admin'],
  },
  {
    to: '/admin/analytics',
    label: 'Analytics',
    icon: 'bar-chart',
    description: 'Platform analytics and insights',
    roles: ['admin'],
  },
];

// Footer navigation items (Settings & Profile)
export const footerNavigationItems: NavItemConfig[] = [
  {
    to: '/settings',
    label: 'Settings',
    icon: 'settings',
    description: 'Manage your account settings',
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: 'user',
    description: 'View and edit your profile',
  },
];

/**
 * Get footer navigation items filtered by user role
 * @param userRole - The role of the current user
 * @returns Array of footer navigation items
 */
export function getFooterItems(userRole?: UserRole): NavItemConfig[] {
  return filterByRole(footerNavigationItems, userRole);
}

/**
 * Filter navigation items based on user role
 * @param items - Array of navigation items to filter
 * @param userRole - The role of the current user
 * @returns Filtered array of navigation items
 */
function filterByRole(items: NavItemConfig[], userRole?: UserRole): NavItemConfig[] {
  if (!userRole) return items.filter((item) => !item.roles);
  
  return items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });
}

/**
 * Get navigation groups filtered by user role
 * @param userRole - The role of the current user
 * @returns Array of navigation groups with filtered items
 */
export function getNavigationGroups(userRole?: UserRole): NavGroupConfig[] {
  return navigationGroups.map((group) => ({
    ...group,
    items: filterByRole(group.items, userRole),
  }));
}

/**
 * Get standalone navigation items filtered by user role
 * @param userRole - The role of the current user
 * @returns Array of standalone navigation items
 */
export function getStandaloneItems(userRole?: UserRole): NavItemConfig[] {
  return filterByRole(standaloneNavigationItems, userRole);
}

/**
 * Get admin navigation items if user has admin role
 * @param userRole - The role of the current user
 * @returns Array of admin navigation items or empty array
 */
export function getAdminItems(userRole?: UserRole): NavItemConfig[] {
  if (userRole === 'admin') {
    return adminNavigationItems;
  }
  return [];
}

/**
 * Get all navigation items (flattened) filtered by user role
 * @param userRole - The role of the current user
 * @returns Array of all navigation items the user has access to
 */
export function getAllNavigationItems(userRole?: UserRole): NavItemConfig[] {
  const standalone = getStandaloneItems(userRole);
  const groups = getNavigationGroups(userRole);
  const groupItems = groups.flatMap((group) => group.items);
  const admin = getAdminItems(userRole);
  
  return [...standalone, ...groupItems, ...admin];
}

/**
 * Check if a user has access to a specific route
 * @param route - The route to check
 * @param userRole - The role of the current user
 * @returns True if the user has access to the route
 */
export function hasRouteAccess(route: string, userRole?: UserRole): boolean {
  const items = getAllNavigationItems(userRole);
  return items.some((item) => item.to === route || route.startsWith(`${item.to}/`));
}

/**
 * Get the active navigation group for a given route
 * @param route - The current route
 * @returns The ID of the active navigation group or null
 */
export function getActiveGroup(route: string): string | null {
  for (const group of navigationGroups) {
    const isActive = group.items.some(
      (item) => item.to === route || route.startsWith(`${item.to}/`)
    );
    if (isActive) return group.id;
  }
  return null;
}

// Legacy support - keep for backward compatibility
export const baseNavigationItems = standaloneNavigationItems;
export function getNavigationItems(userRole?: UserRole): NavItemConfig[] {
  return getAllNavigationItems(userRole);
}
