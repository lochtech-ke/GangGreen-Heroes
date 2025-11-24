# Implementation Plan

- [x] 1. Update feature deprecation service to separate badge marketplace from carbon credits





  - Remove `MARKETPLACE` from deprecated features set
  - Remove `/marketplace` from route redirects array
  - Keep `/carbon-credits` as deprecated
  - Update comments to clarify badge marketplace vs carbon credits marketplace
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 2. Restore marketplace route in App.tsx





  - Remove `/marketplace` from DeprecatedRouteHandler
  - Add proper route for MarketplacePage with ProtectedRoute wrapper
  - Ensure route uses Layout component
  - Keep `/carbon-credits` route as deprecated
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. Add badge marketplace to navigation configuration





  - Add marketplace item to standalone navigation items
  - Use 'shopping-bag' icon
  - Set label as "Badge Marketplace"
  - Add description: "Purchase NFT badges and earn GG Coins"
  - Ensure it's visible to all authenticated users
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 4. Write unit tests for route configuration
  - Test that `/marketplace` route renders MarketplacePage
  - Test that authenticated users can access marketplace
  - Test that `/carbon-credits` still redirects
  - Test that unauthenticated users are redirected to login
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 5. Write unit tests for navigation configuration
  - Test that marketplace item appears in navigation
  - Test that marketplace item has correct icon and label
  - Test that marketplace item links to `/marketplace`
  - Test that item is visible to authenticated users
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 6. Write unit tests for feature deprecation service
  - Test that `MARKETPLACE` is not in deprecated features
  - Test that `/marketplace` is not in route redirects
  - Test that carbon credits remain deprecated
  - Test that feature separation is maintained
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 7. Verify existing badge purchase integration





  - Confirm badgePurchaseService.initiatePurchase() works from marketplace
  - Confirm ggCoinService.creditCoins() is called after purchase
  - Confirm 200 KES price is displayed correctly
  - Confirm +1 GG Coin reward is shown
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 8. Write property test for marketplace route accessibility
  - **Property 1: Marketplace route accessibility**
  - **Validates: Requirements 1.1, 1.5**
  - Generate random authenticated user states
  - Verify marketplace route always renders without redirects
  - Run 100 iterations minimum

- [ ]* 9. Write property test for GG Coin reward calculation
  - **Property 5: GG Coin reward calculation**
  - **Validates: Requirements 4.3, 4.4**
  - Generate random purchase amounts (multiples of 200 KES)
  - Verify calculation: amount / 200 = GG Coins
  - Verify precision to 3 decimal places
  - Run 100 iterations minimum

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
