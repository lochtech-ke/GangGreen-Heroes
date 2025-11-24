# Implementation Plan

- [x] 1. Add badges route to App.tsx router configuration


  - Import BadgesPage component at the top of App.tsx
  - Add route definition for /badges path in the Routes component
  - Wrap BadgesPage with ProtectedRoute and Layout components
  - Place route after /journey route for logical organization
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5_

- [x] 1.1 Write integration test for badges route


  - Test that /badges route renders BadgesPage component
  - Test that unauthenticated access redirects to login
  - Test that authenticated access displays badges page
  - Test that Layout wrapper is present
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Verify all navigation links point to configured routes


  - Search codebase for all instances of navigate('/badges')
  - Search codebase for all instances of href="/badges"
  - Verify each navigation link works after route is added
  - Test navigation from dashboard badge progress card
  - Test navigation from profile page
  - _Requirements: 2.2, 2.3, 3.1, 3.5_

- [x] 2.1 Write unit tests for navigation links


  - Test badge progress card navigation link
  - Test profile page navigation link
  - Test URL updates correctly on navigation
  - _Requirements: 2.2, 3.5_

- [x] 3. Manual testing and verification


  - Start development server and navigate to /badges
  - Verify no console warnings about unmatched routes
  - Test authentication flow (logout, access /badges, login, verify redirect)
  - Test navigation between dashboard and badges pages
  - Test browser back/forward buttons
  - Verify badge progression displays correctly
  - _Requirements: 1.4, 1.5, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.
