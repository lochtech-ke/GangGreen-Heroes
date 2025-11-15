# Implementation Plan

- [x] 1. Create core navigation components structure



  - Create `src/components/navigation/` directory
  - Create `Navigation.tsx` component with basic structure
  - Create `NavItem.tsx` component for individual navigation links
  - Create `index.ts` barrel export file
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Implement desktop navigation with routing





  - [ ] 2.1 Build Navigation component with logo and nav links
    - Add #GangGreen logo and brand name
    - Implement horizontal navigation layout
    - Add navigation items (Dashboard, Initiatives, Trees, Marketplace, Gamification)
    - Style with Tailwind CSS for desktop view


    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ] 2.2 Implement NavItem with active state detection
    - Use `useLocation` hook to detect active route
    - Add active state styling with green highlight


    - Implement hover states with smooth transitions
    - Add focus indicators for keyboard navigation
    - _Requirements: 1.3, 4.1, 4.2, 4.3, 7.2_
  
  - [ ] 2.3 Create navigation configuration system
    - Define `NavItemConfig` interface
    - Create `navigationConfig` array with all routes
    - Implement role-based filtering logic
    - Add support for optional role restrictions
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3. Implement UserMenu component



  - [x] 3.1 Create UserMenu dropdown component


    - Create `UserMenu.tsx` component
    - Add user button with avatar or initials
    - Implement dropdown menu with profile, settings, logout
    - Add click outside to close functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [x] 3.2 Integrate logout functionality


    - Connect to `authService.logout()`
    - Handle logout errors with toast notifications
    - Redirect to login page after successful logout
    - Add loading state during logout
    - _Requirements: 2.4_
  
  - [x] 3.3 Add keyboard navigation to UserMenu


    - Support Tab key navigation through menu items
    - Support Escape key to close dropdown
    - Support Enter key to activate menu items
    - Maintain focus management
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Create Layout wrapper component



  - [x] 4.1 Build Layout component structure


    - Create `src/components/layout/Layout.tsx`
    - Render Navigation component at top
    - Provide main content area with proper spacing
    - Add responsive container styling
    - _Requirements: 1.1, 1.5_
  
  - [x] 4.2 Integrate Layout into App routing


    - Update `App.tsx` to wrap protected routes with Layout
    - Remove logout button from DashboardPage
    - Test navigation appears on all authenticated pages
    - Verify navigation persists across route changes
    - _Requirements: 1.1_

- [x] 5. Implement mobile responsive navigation


  - [x] 5.1 Create MobileMenu component


    - Create `MobileMenu.tsx` with slide-in drawer
    - Add overlay backdrop with click to close
    - Implement slide-in animation from left
    - Style for full-height mobile view
    - _Requirements: 3.1, 3.3_
  
  - [x] 5.2 Add hamburger menu button


    - Create hamburger icon button
    - Show only on mobile viewports (<768px)
    - Toggle mobile menu open/close state
    - Add animation for hamburger to X transition
    - _Requirements: 3.1, 3.2_
  
  - [x] 5.3 Implement mobile menu auto-close


    - Close menu when navigation link is clicked
    - Close menu when overlay is tapped
    - Prevent body scroll when menu is open
    - Add smooth transitions
    - _Requirements: 3.4, 3.5_
  
  - [x] 5.4 Test responsive behavior across breakpoints


    - Test mobile view (<768px)
    - Test tablet view (768px-1024px)
    - Test desktop view (≥1024px)
    - Verify smooth transitions between breakpoints
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Add notification badge system


  - [x] 6.1 Create notification badge component


    - Create `NotificationBadge.tsx` component
    - Display count when less than 10
    - Display "9+" when count exceeds 9
    - Style with red background and white text
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 6.2 Integrate badge with navigation items


    - Add badge prop to NavItem component
    - Position badge on top-right of nav item
    - Add badge to Gamification nav item
    - Test badge visibility and positioning
    - _Requirements: 6.1_
  
  - [ ]* 6.3 Implement real-time badge updates
    - Create notification service hook
    - Subscribe to Supabase real-time notifications
    - Update badge count when notifications change
    - Clear badge when user views notifications
    - _Requirements: 6.4, 6.5_

- [x] 7. Implement role-based navigation features



  - [x] 7.1 Add role-specific navigation items


    - Show "Create Initiative" for organization users
    - Show "Admin" menu for admin users
    - Filter navigation items based on user role
    - Update navigation when user role changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 7.2 Create placeholder pages for new routes


    - Create `InitiativesPage.tsx` with basic layout
    - Create `TreesPage.tsx` with basic layout
    - Create `MarketplacePage.tsx` with basic layout
    - Create `GamificationPage.tsx` with basic layout
    - Create `SettingsPage.tsx` with basic layout
    - _Requirements: 1.2_
  
  - [x] 7.3 Add routes to App.tsx


    - Add `/initiatives` route
    - Add `/trees` route
    - Add `/marketplace` route
    - Add `/gamification` route
    - Add `/settings` route
    - Wrap all new routes with ProtectedRoute
    - _Requirements: 1.2_

- [x] 8. Enhance accessibility and polish



  - [x] 8.1 Add ARIA attributes


    - Add `aria-label` to navigation
    - Add `aria-expanded` to dropdown buttons
    - Add `role="menu"` to dropdowns
    - Add `role="menuitem"` to menu items
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 8.2 Implement focus management


    - Add visible focus indicators (2px outline)
    - Implement focus trap in mobile menu
    - Return focus to trigger on dropdown close
    - Test keyboard navigation flow
    - _Requirements: 4.4, 7.1, 7.2, 7.5_
  
  - [x] 8.3 Add smooth transitions and animations


    - Add hover transition effects
    - Add dropdown fade-in animation
    - Add mobile menu slide-in animation
    - Add active state transition
    - _Requirements: 4.3_
  
  - [ ]* 8.4 Create navigation component tests
    - Test Navigation renders all items
    - Test active route highlighting
    - Test role-based filtering
    - Test UserMenu open/close
    - Test mobile menu functionality
    - Test keyboard navigation
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 7.1_

- [x] 9. Final integration and testing



  - [x] 9.1 Update all existing pages to use Layout


    - Wrap DashboardPage with Layout
    - Wrap ProfilePage with Layout
    - Remove redundant navigation elements
    - Test all page transitions
    - _Requirements: 1.1_
  
  - [x] 9.2 Test complete navigation flow


    - Test navigation between all pages
    - Test logout from different pages
    - Test mobile menu on actual devices
    - Test role-based navigation for different user types
    - _Requirements: 1.1, 1.2, 2.4, 3.1, 5.1_
  
  - [x] 9.3 Verify accessibility compliance


    - Run keyboard navigation test
    - Test with screen reader
    - Verify all ARIA attributes
    - Check color contrast ratios
    - _Requirements: 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 9.4 Performance optimization


    - Memoize navigation items calculation
    - Use React.memo for NavItem components
    - Optimize re-renders on route changes
    - Test navigation performance
    - _Requirements: 1.1, 1.5_
