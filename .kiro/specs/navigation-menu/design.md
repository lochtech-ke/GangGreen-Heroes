# Navigation Menu Design Document

## Overview

This design document outlines the implementation of a comprehensive navigation system for the #GangGreen platform. The navigation will provide authenticated users with easy access to all platform features through a responsive, accessible, and role-aware menu system.

## Architecture

### Component Hierarchy

```
Layout (new)
├── Navigation (new)
│   ├── Logo
│   ├── NavLinks
│   │   ├── NavItem (Dashboard)
│   │   ├── NavItem (Initiatives)
│   │   ├── NavItem (Tree Registry)
│   │   ├── NavItem (Marketplace)
│   │   └── NavItem (Gamification)
│   ├── UserMenu (new)
│   │   ├── UserButton
│   │   └── UserDropdown
│   │       ├── ProfileLink
│   │       ├── SettingsLink
│   │       └── LogoutButton
│   └── MobileMenuButton
└── Page Content
```

### Routing Structure

The navigation will integrate with React Router and support the following routes:

- `/dashboard` - Main dashboard (existing)
- `/initiatives` - Initiative list and management (to be created)
- `/initiatives/create` - Create new initiative (organization role)
- `/initiatives/:id` - Initiative details
- `/trees` - Tree registry (to be created)
- `/trees/:id` - Tree details
- `/marketplace` - Carbon credit marketplace (to be created)
- `/gamification` - Gamification dashboard (to be created)
- `/profile` - User profile (existing page)
- `/settings` - User settings (to be created)

## Components and Interfaces

### 1. Layout Component

A wrapper component that provides consistent navigation across all authenticated pages.

```typescript
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): JSX.Element
```

**Responsibilities:**
- Render Navigation component
- Provide main content area
- Handle responsive layout

### 2. Navigation Component

The main navigation bar component.

```typescript
interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps): JSX.Element
```

**State:**
- `isMobileMenuOpen: boolean` - Controls mobile menu visibility
- `isUserMenuOpen: boolean` - Controls user dropdown visibility

**Responsibilities:**
- Render logo and brand
- Display navigation links
- Show user menu
- Handle mobile menu toggle
- Manage dropdown states

### 3. NavItem Component

Individual navigation link with active state highlighting.

```typescript
interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClick?: () => void;
}

export function NavItem({ to, icon, label, badge, onClick }: NavItemProps): JSX.Element
```

**Features:**
- Active route detection using `useLocation`
- Icon support
- Optional notification badge
- Hover and focus states

### 4. UserMenu Component

User profile dropdown menu.

```typescript
interface UserMenuProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps): JSX.Element
```

**State:**
- `isOpen: boolean` - Dropdown visibility

**Features:**
- User avatar or initials
- Dropdown with profile, settings, logout
- Click outside to close
- Keyboard navigation support

### 5. MobileMenu Component

Responsive mobile navigation overlay.

```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItemConfig[];
  user: User;
  onLogout: () => Promise<void>;
}

export function MobileMenu({ isOpen, onClose, navItems, user, onLogout }: MobileMenuProps): JSX.Element
```

**Features:**
- Slide-in animation
- Overlay backdrop
- Full-screen on mobile
- Touch-friendly targets

## Data Models

### Navigation Configuration

```typescript
interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // Optional: restrict to specific roles
  badge?: () => number; // Optional: function to get badge count
}

const navigationConfig: NavItemConfig[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
  },
  {
    to: '/initiatives',
    label: 'Initiatives',
    icon: TreeIcon,
  },
  {
    to: '/trees',
    label: 'Tree Registry',
    icon: LeafIcon,
  },
  {
    to: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingCartIcon,
  },
  {
    to: '/gamification',
    label: 'Gamification',
    icon: TrophyIcon,
    badge: () => getUnclaimedRewardsCount(),
  },
];
```

### User Menu Configuration

```typescript
interface UserMenuItemConfig {
  to?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

const userMenuConfig: UserMenuItemConfig[] = [
  {
    to: '/profile',
    label: 'Profile',
    icon: UserIcon,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: SettingsIcon,
  },
  {
    label: 'Logout',
    icon: LogoutIcon,
    onClick: handleLogout,
    variant: 'danger',
  },
];
```

## Styling and Theming

### Desktop Navigation (≥768px)

- Fixed top position
- White background with subtle shadow
- Height: 64px
- Logo on left
- Navigation links centered
- User menu on right
- Horizontal layout

### Mobile Navigation (<768px)

- Fixed top position
- Hamburger menu button on left
- Logo centered
- User avatar on right
- Slide-in drawer from left
- Full-height overlay

### Color Scheme

```css
/* Primary Navigation */
--nav-bg: #ffffff;
--nav-border: #e5e7eb;
--nav-text: #374151;
--nav-text-hover: #059669;
--nav-active: #059669;
--nav-active-bg: #d1fae5;

/* User Menu */
--user-menu-bg: #ffffff;
--user-menu-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--user-menu-hover: #f3f4f6;

/* Mobile Menu */
--mobile-menu-bg: #ffffff;
--mobile-overlay-bg: rgba(0, 0, 0, 0.5);
```

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: ≥ 1024px

## Role-Based Navigation

### Role-Specific Items

```typescript
function getNavigationItems(userRole: UserRole): NavItemConfig[] {
  const baseItems = navigationConfig;
  
  // Add role-specific items
  if (userRole === 'organization') {
    return [
      ...baseItems,
      {
        to: '/initiatives/create',
        label: 'Create Initiative',
        icon: PlusIcon,
        roles: ['organization'],
      },
    ];
  }
  
  if (userRole === 'admin') {
    return [
      ...baseItems,
      {
        to: '/admin',
        label: 'Admin',
        icon: ShieldIcon,
        roles: ['admin'],
      },
    ];
  }
  
  return baseItems;
}
```

## Notification Badges

### Badge Service

```typescript
interface NotificationBadgeService {
  getUnreadCount(): Promise<number>;
  subscribeToUpdates(callback: (count: number) => void): () => void;
}
```

**Implementation:**
- Use Supabase real-time subscriptions
- Update badge count on notification changes
- Cache count in React state
- Debounce updates to prevent excessive re-renders

## Accessibility Features

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate links
- Escape to close dropdowns
- Arrow keys for dropdown navigation

### ARIA Attributes

```typescript
// Navigation
<nav aria-label="Main navigation">

// Mobile menu button
<button aria-label="Open menu" aria-expanded={isOpen}>

// User menu
<button aria-haspopup="true" aria-expanded={isUserMenuOpen}>

// Dropdown
<div role="menu" aria-orientation="vertical">

// Menu items
<a role="menuitem">
```

### Focus Management

- Visible focus indicators (2px outline)
- Focus trap in mobile menu
- Return focus to trigger on close
- Skip to main content link

## Error Handling

### Navigation Errors

1. **Route Not Found**
   - Display 404 page
   - Provide navigation back to dashboard
   - Log error for monitoring

2. **Permission Denied**
   - Redirect to dashboard
   - Show toast notification
   - Log unauthorized access attempt

3. **Logout Failure**
   - Show error message
   - Retry mechanism
   - Force logout after 3 attempts

## Performance Considerations

### Code Splitting

```typescript
// Lazy load page components
const InitiativesPage = lazy(() => import('./pages/InitiativesPage'));
const TreesPage = lazy(() => import('./pages/TreesPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
```

### Optimization Strategies

1. **Memoization**
   - Memoize navigation items calculation
   - Use React.memo for NavItem components
   - Cache user permissions

2. **Event Handling**
   - Debounce scroll events
   - Use passive event listeners
   - Cleanup event listeners on unmount

3. **Bundle Size**
   - Tree-shake unused icons
   - Use SVG sprites for icons
   - Minimize CSS with Tailwind purge

## Testing Strategy

### Unit Tests

1. **Navigation Component**
   - Renders all navigation items
   - Highlights active route
   - Shows/hides based on authentication
   - Filters items by user role

2. **UserMenu Component**
   - Opens/closes dropdown
   - Calls logout function
   - Closes on outside click
   - Keyboard navigation works

3. **MobileMenu Component**
   - Opens/closes on button click
   - Closes on navigation
   - Closes on overlay click
   - Prevents body scroll when open

### Integration Tests

1. **Navigation Flow**
   - Navigate between pages
   - Active state updates correctly
   - User menu actions work
   - Mobile menu responsive behavior

2. **Role-Based Access**
   - Organization sees create button
   - Admin sees admin menu
   - Community member sees appropriate items
   - Unauthorized routes redirect

### Accessibility Tests

1. **Keyboard Navigation**
   - Tab order is logical
   - All interactive elements focusable
   - Escape closes dropdowns
   - Focus visible on all elements

2. **Screen Reader**
   - ARIA labels present
   - Roles correctly assigned
   - State changes announced
   - Navigation landmarks identified

## Implementation Phases

### Phase 1: Core Navigation Structure
- Create Layout component
- Implement Navigation component
- Add basic routing
- Desktop-only styling

### Phase 2: User Menu
- Implement UserMenu component
- Add dropdown functionality
- Integrate logout
- Add profile/settings links

### Phase 3: Mobile Responsiveness
- Create MobileMenu component
- Add hamburger button
- Implement slide-in animation
- Test touch interactions

### Phase 4: Role-Based Features
- Implement role filtering
- Add organization-specific items
- Add admin menu
- Test permission logic

### Phase 5: Notifications & Polish
- Add notification badges
- Implement real-time updates
- Add animations and transitions
- Accessibility audit

## Dependencies

### New Dependencies
- None required (using existing React Router, Tailwind CSS)

### Icon Library
- Use Heroicons (already available via Tailwind)
- Or install `lucide-react` for more icon options

```bash
npm install lucide-react
```

## Migration Strategy

### Updating Existing Pages

1. Wrap authenticated routes with Layout component
2. Remove individual logout buttons from pages
3. Update App.tsx routing structure
4. Test all page transitions

### Backward Compatibility

- Existing pages continue to work
- Gradual migration page by page
- No breaking changes to existing components

## Future Enhancements

1. **Search Bar**
   - Global search in navigation
   - Quick access to initiatives/trees
   - Keyboard shortcut (Cmd+K)

2. **Breadcrumbs**
   - Show current location hierarchy
   - Quick navigation to parent pages

3. **Customization**
   - User preference for collapsed/expanded
   - Theme switching (light/dark)
   - Reorderable navigation items

4. **Progressive Web App**
   - Bottom navigation for mobile PWA
   - Install prompt in navigation
   - Offline indicator
