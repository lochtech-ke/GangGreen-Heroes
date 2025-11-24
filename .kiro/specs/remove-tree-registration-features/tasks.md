# Implementation Plan

- [x] 1. Remove "Register Your Tree" hero card from Dashboard





  - Remove the hero card JSX block from DashboardPage component (lines containing the hero card with "Register Your Tree!" heading, image, and action buttons)
  - Verify the "For You" section moves up to fill the space
  - Ensure proper spacing between Badge Progress Widget and For You section
  - _Requirements: 1.1, 1.2, 1.4_

- [ ]* 1.1 Write component test for Dashboard hero card removal
  - **Example 1: Dashboard hero card removal**
  - **Validates: Requirements 1.1**
  - Test that Dashboard renders without "Register Your Tree" text
  - Test that no hero card elements are present in the DOM
  - _Requirements: 1.1_

- [ ]* 1.2 Write component test for Dashboard layout preservation
  - **Example 2: Dashboard component preservation**
  - **Validates: Requirements 1.2, 1.4**
  - Test that Stats Cards are present
  - Test that Badge Progress Widget is present
  - Test that For You Section is present
  - Test that components appear in correct order
  - _Requirements: 1.2, 1.4_

- [x] 2. Remove "Plant a Tree" quick action from Journey Dashboard





  - Remove the "Plant a Tree" button from the Quick Actions section in JourneyDashboardPage component
  - Verify other quick action buttons remain intact
  - Ensure proper spacing in the Quick Actions widget
  - _Requirements: 2.1, 2.2, 2.4_

- [ ]* 2.1 Write component test for Journey quick action removal
  - **Example 3: Journey quick action removal**
  - **Validates: Requirements 2.1**
  - Test that Journey Dashboard renders without "Plant a Tree" button
  - Test that Quick Actions section doesn't contain tree planting link
  - _Requirements: 2.1_

- [ ]* 2.2 Write component test for Journey quick actions preservation
  - **Example 4: Journey quick actions preservation**
  - **Validates: Requirements 2.2, 2.4**
  - Test that "View Badges" button is present
  - Test that "View Challenges" button is present
  - Test that "View Petitions" button is present
  - Test that "Invite Friends" button is present
  - _Requirements: 2.2, 2.4_

- [x] 3. Search and remove any navigation links to tree registration





  - Search codebase for references to `/trees/plant` route
  - Search for any other tree registration related routes
  - Remove any found navigation links
  - Document any routes that need to be deprecated
  - _Requirements: 3.1_

- [ ]* 3.1 Write test for navigation link removal
  - **Example 5: No broken navigation links**
  - **Validates: Requirements 3.1**
  - Search rendered components for tree registration links
  - Verify no links to `/trees/plant` exist
  - _Requirements: 3.1_

- [ ] 4. Verify route handling for removed features
  - Check if `/trees/plant` route exists in router configuration
  - If route exists, either remove it or add proper 404/redirect handling
  - Test that navigating to removed routes doesn't crash the app
  - _Requirements: 3.3_

- [ ]* 4.1 Write test for route handling
  - **Example 6: Route handling**
  - **Validates: Requirements 3.3**
  - Test navigation to removed tree registration URLs
  - Verify app doesn't crash or throw errors
  - Verify appropriate fallback behavior (404 or redirect)
  - _Requirements: 3.3_

- [ ] 5. Final verification and cleanup
  - Run all tests to ensure nothing is broken
  - Manually test Dashboard page in browser
  - Manually test Journey Dashboard page in browser
  - Check for console errors
  - Verify responsive layouts on different screen sizes
  - Remove any orphaned imports or unused code
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_
