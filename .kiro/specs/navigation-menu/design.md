# Navigation Menu Design Document

## Overview

This design document outlines the redesign of the navigation system for the #GangGreen platform to accommodate the significant feature growth. The updated navigation will organize features into logical groups, provide quick access to common actions, display user rewards and notifications, and offer an improved mobile experience with bottom navigation. The system will remain responsive, accessible, and role-aware while handling the expanded feature set without overwhelming users.

## Architecture

### Component Hierarchy

```
Layout (existing)
├── DesktopNavigation (updated)
│   ├── Logo
│   ├── NavGroups
│   │   ├── NavDropdown (Community)
│   │   │   ├── Social Feed
│   │   │   ├── Forums (future)
│   │   │   └── Events (future)
│   │   ├── NavDropdown (Conservation)
│   │   │   ├── Initiatives
│   │   │   ├── Tree Registry
│   │   │   ├── My Journey
│   │   │   └── Create Initiative (org only)
│   │   └── NavDropdown (Marketplace)
│   │       ├── Carbon Credits
│   │       ├── NFT Badges
│   │       └── Donate
│   ├── QuickActions (new)
│   │   └── ActionDropdown
│   ├── SearchButton (new)
│   ├── NotificationCenter (new)
│   │   ├── NotificationBell
│   │   └── NotificationDropdown
│   ├── GGCoinDisplay (new)
│   └── UserMenu (updated)
│       ├── UserButton (with avatar + level)
│       └── UserDropdown
│           ├── Profile
│           ├── My Journey
│           ├── NFT Badges
│           ├── Settings
│           └── Logout
├── MobileNavigation (updated)
│   ├── TopBar
│   │   ├── MenuButton
│   │   ├── Logo
│   │   ├── NotificationBell
│   │   └── UserAvatar
│   ├── SideDrawer (hamburger menu)
│   │   └── Full navigation tree
│   └── BottomNavBar (new)
│       ├── Home
│       ├── Community
│       ├── Conservation
│       ├── Marketplace
│       └── Profile
└── Page Content
```

### Routing Structure

The navigation will integrate with React Router and support the following routes:

**Core Pages:**
- `/` - Home page (public)
- `/dashboard` - Main dashboard (authenticated)

**Community Section:**
- `/social-feed` - Social media feed (existing)
- `/forums` - Community forums (future)
- `/events` - Community events (future)

**Conservation Section:**
- `/initiatives` - Initiative list (existing)
- `/initiatives/create` - Create initiative (org role)
- `/initiatives/:id` - Initiative details
- `/trees` - Tree registry (existing)
- `/trees/:id` - Tree details
- `/journey` - Individual user journey (existing)

**Marketplace Section:**
- `/marketplace` - Carbon credit marketplace (existing)
- `/nft-badges` - NFT badge marketplace (existing)
- `/donate` - Donation page (future)

**Gamification:**
- `/gamification` - Gamification dashboard (existing)
- `/leaderboard` - Global leaderboard (future)

**User Pages:**
- `/profile` - User profile (existing)
- `/settings` - User settings (existing)

**Admin Pages:**
- `/admin/moderation` - Content moderation (admin only)
- `/admin/analytics` - Platform analytics (admin only)

**Legal Pages:**
- `/legal/terms` - Terms of Service (existing)
- `/legal/privacy` - Privacy Policy (existing)
- `/legal/cookies` - Cookie Policy (existing)
- `/legal/tax-receipts` - Tax Receipt Policy (existing)
- `/legal/acceptable-use` - Acceptable Use Policy (existing)

## Visual Structure

### Desktop Navigation Bar Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] [Dashboard] [Community▼] [Conservation▼] [Marketplace▼] [Rewards]│
│                                                                           │
│                    [🔍] [🔔3] [💰1,250] [👤 User▼]                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Only 5-6 main buttons visible in center
- Dropdowns contain the detailed navigation items
- Right side has utility items (search, notifications, coins, user)

### Community Dropdown Example

```
┌─────────────────────────────────────┐
│ 📱 Social Feed                      │
│    Share conservation stories       │
│                                     │
│ 💬 Forums                           │
│    Discuss with community           │
│                                     │
│ 📅 Events                           │
│    Join local events                │
└─────────────────────────────────────┘
```

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

### 6. NavDropdown Component

Dropdown menu for grouped navigation items (mega menu style).

```typescript
interface NavDropdownProps {
  group: NavGroupConfig;
  isOpen: boolean;
  onToggle: () => void;
}

export function NavDropdown({ group, isOpen, onToggle }: NavDropdownProps): JSX.Element
```

**Features:**
- Hover to open (desktop)
- Click to open (mobile)
- Grid layout for items
- Item descriptions
- Icons for each item
- Smooth animations

### 7. QuickActions Component

Quick access to frequently used actions.

```typescript
interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  roles?: UserRole[];
}

interface QuickActionsProps {
  actions: QuickAction[];
  maxVisible?: number;
}

export function QuickActions({ actions, maxVisible = 4 }: QuickActionsProps): JSX.Element
```

**Features:**
- Customizable actions
- Role-based filtering
- Dropdown for overflow
- Persistent preferences

### 8. NotificationCenter Component

Notification bell with dropdown.

```typescript
interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps): JSX.Element
```

**State:**
- `notifications: Notification[]` - List of notifications
- `unreadCount: number` - Count of unread notifications
- `isOpen: boolean` - Dropdown visibility

**Features:**
- Real-time updates via Supabase
- Unread count badge
- Mark as read functionality
- Grouped by type
- Link to full notifications page

### 9. GGCoinDisplay Component

Display user's GG Coin balance.

```typescript
interface GGCoinDisplayProps {
  balance: number;
  showAnimation?: boolean;
}

export function GGCoinDisplay({ balance, showAnimation = true }: GGCoinDisplayProps): JSX.Element
```

**Features:**
- Real-time balance updates
- Animation on balance change
- Click to view transaction history
- Tooltip with recent transactions

### 10. SearchModal Component

Global search functionality.

```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps): JSX.Element
```

**Features:**
- Keyboard shortcut (Cmd/Ctrl + K)
- Search across initiatives, trees, users, pages
- Grouped results
- Recent searches
- Keyboard navigation
- Fuzzy search

### 11. BottomNavBar Component

Mobile bottom navigation bar.

```typescript
interface BottomNavBarProps {
  activeSection: string;
}

export function BottomNavBar({ activeSection }: BottomNavBarProps): JSX.Element
```

**Features:**
- Fixed bottom position
- 5 primary sections
- Active state highlighting
- Badge support
- Hide on keyboard open
- Smooth transitions

## Data Models

### Navigation Configuration

```typescript
interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string; // For mega menu descriptions
  roles?: UserRole[]; // Optional: restrict to specific roles
  badge?: () => number; // Optional: function to get badge count
  children?: NavItemConfig[]; // For nested navigation
}

interface NavGroupConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItemConfig[];
}

const navigationGroups: NavGroupConfig[] = [
  {
    id: 'community',
    label: 'Community',
    icon: UsersIcon,
    items: [
      {
        to: '/social-feed',
        label: 'Social Feed',
        icon: HashIcon,
        description: 'Share and discover conservation stories',
      },
      {
        to: '/forums',
        label: 'Forums',
        icon: MessageSquareIcon,
        description: 'Discuss with the community',
      },
      {
        to: '/events',
        label: 'Events',
        icon: CalendarIcon,
        description: 'Join local conservation events',
      },
    ],
  },
  {
    id: 'conservation',
    label: 'Conservation',
    icon: TreeIcon,
    items: [
      {
        to: '/initiatives',
        label: 'Initiatives',
        icon: TreeIcon,
        description: 'Browse and join conservation projects',
      },
      {
        to: '/trees',
        label: 'Tree Registry',
        icon: LeafIcon,
        description: 'Track planted trees and their impact',
      },
      {
        to: '/journey',
        label: 'My Journey',
        icon: MapIcon,
        description: 'Your personal conservation journey',
      },
      {
        to: '/initiatives/create',
        label: 'Create Initiative',
        icon: PlusIcon,
        description: 'Start a new conservation project',
        roles: ['organization'],
      },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBagIcon,
    items: [
      {
        to: '/marketplace',
        label: 'Carbon Credits',
        icon: CloudIcon,
        description: 'Trade verified carbon credits',
      },
      {
        to: '/nft-badges',
        label: 'NFT Badges',
        icon: AwardIcon,
        description: 'Collect achievement badges',
        badge: () => getNewBadgesCount(),
      },
      {
        to: '/donate',
        label: 'Donate',
        icon: HeartIcon,
        description: 'Support conservation efforts',
      },
    ],
  },
];

// Standalone navigation items (not in groups)
const standaloneItems: NavItemConfig[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
  },
  {
    to: '/gamification',
    label: 'Rewards',
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
- Height: 72px (increased for additional elements)
- Logo on left
- **Center section shows ONLY**: Dashboard, Community (dropdown), Conservation (dropdown), Marketplace (dropdown), Rewards
- **Right section shows**: Quick actions, notifications, GG coins, user menu
- Horizontal layout with dropdowns
- **Individual pages (Social Feed, Initiatives, NFT Badges, etc.) are HIDDEN inside dropdowns**

### Mobile Navigation (<768px)

**Top Bar:**
- Fixed top position
- Height: 56px
- Hamburger menu button on left
- Logo centered
- Notification bell and user avatar on right

**Bottom Navigation Bar:**
- Fixed bottom position
- Height: 64px
- 5 icon buttons with labels
- Active state with color and indicator
- Safe area insets for iOS

**Side Drawer:**
- Slide-in from left
- Full-height overlay
- Organized sections
- Touch-friendly targets (min 44px)

### Color Scheme

```css
/* Primary Navigation */
--nav-bg: #ffffff;
--nav-border: #e5e7eb;
--nav-text: #374151;
--nav-text-hover: #059669;
--nav-active: #059669;
--nav-active-bg: #d1fae5;

/* Dropdowns & Mega Menus */
--dropdown-bg: #ffffff;
--dropdown-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
--dropdown-border: #e5e7eb;
--dropdown-item-hover: #f3f4f6;

/* User Menu */
--user-menu-bg: #ffffff;
--user-menu-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--user-menu-hover: #f3f4f6;

/* Mobile Menu */
--mobile-menu-bg: #ffffff;
--mobile-overlay-bg: rgba(0, 0, 0, 0.5);
--bottom-nav-bg: #ffffff;
--bottom-nav-border: #e5e7eb;
--bottom-nav-active: #059669;

/* Notifications */
--notification-badge-bg: #ef4444;
--notification-badge-text: #ffffff;
--notification-unread-bg: #f0fdf4;

/* GG Coins */
--gg-coin-bg: #fef3c7;
--gg-coin-text: #92400e;
--gg-coin-border: #fbbf24;
```

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: ≥ 1024px

### Animation Timings

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

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

### Phase 1: Navigation Restructuring
- Update navigationConfig with groups
- Implement NavDropdown component
- Add mega menu styling
- Test dropdown interactions

### Phase 2: Quick Actions & Search
- Create QuickActions component
- Implement SearchModal component
- Add keyboard shortcuts
- Integrate search service

### Phase 3: Notifications & Rewards
- Create NotificationCenter component
- Implement GGCoinDisplay component
- Add real-time subscriptions
- Test notification updates

### Phase 4: Mobile Bottom Navigation
- Create BottomNavBar component
- Implement mobile-specific layout
- Add touch interactions
- Test on actual devices

### Phase 5: Enhanced User Menu
- Update UserMenu with level/points
- Add NFT badges link
- Add My Journey link
- Style user stats display

### Phase 6: Polish & Optimization
- Add animations and transitions
- Optimize performance
- Accessibility audit
- Cross-browser testing

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
