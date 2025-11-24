# Design Document

## Overview

This design restores the badge marketplace functionality that was incorrectly removed during Track 3 refactoring. The badge marketplace is essential for community engagement as it enables badge purchases and GG Coin rewards. The design ensures clear separation between the badge marketplace (active) and carbon credits marketplace (deprecated).

## Architecture

### Component Structure

```
src/
├── pages/
│   └── MarketplacePage.tsx (existing - already correct)
├── components/
│   └── nft/
│       ├── BadgeMarketplace.tsx (existing - already correct)
│       ├── BadgePurchaseModal.tsx (existing)
│       └── BadgePurchaseConfirmation.tsx (existing)
├── services/
│   ├── badgePurchase.service.ts (existing - already correct)
│   ├── ggCoin.service.ts (existing - already correct)
│   └── featureDeprecation.service.ts (needs update)
└── App.tsx (needs update)
```

### Route Configuration

- **Active Route**: `/marketplace` → Badge Marketplace (MarketplacePage)
- **Deprecated Route**: `/carbon-credits` → Redirects to `/initiatives`
- **Distinction**: Clear separation in routing and deprecation service

## Components and Interfaces

### Updated Route Configuration (App.tsx)

```typescript
// Remove marketplace from deprecated routes
<Route
  path="/marketplace"
  element={
    <ProtectedRoute>
      <Layout>
        <MarketplacePage />
      </Layout>
    </ProtectedRoute>
  }
/>

// Keep carbon-credits as deprecated
<Route path="/carbon-credits" element={<DeprecatedRouteHandler />} />
```

### Updated Navigation Configuration

```typescript
// Add to standalone navigation items
{
  to: '/marketplace',
  label: 'Badge Marketplace',
  icon: 'shopping-bag',
  description: 'Purchase NFT badges and earn GG Coins',
}
```

### Updated Feature Deprecation Service

```typescript
// Separate badge marketplace from carbon credits
private readonly deprecatedFeatures = new Set<DeprecatedFeature>([
  DeprecatedFeature.TREE_PLANTING,
  DeprecatedFeature.CARBON_CREDITS,
  // Remove MARKETPLACE - it's for badges, not carbon credits
]);

// Update route redirects
private readonly routeRedirects: RouteRedirect[] = [
  {
    from: '/trees',
    to: '/initiatives',
    message: 'Tree planting features have been moved to Initiatives for Track 3',
  },
  {
    from: '/carbon-credits',
    to: '/initiatives',
    message: 'Carbon credit features are not available in Track 3',
  },
  // Remove /marketplace redirect - it's for badges
];
```

## Data Models

No changes needed. Existing models are correct:
- `BadgePurchase` (badge_purchases table)
- `GGCoinTransaction` (gg_coin_transactions table)
- Badge catalog (hardcoded in BadgeMarketplace.tsx)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Marketplace route accessibility
*For any* authenticated user, navigating to `/marketplace` should display the badge marketplace page without redirects
**Validates: Requirements 1.1, 1.5**

### Property 2: Navigation item visibility
*For any* authenticated user, the navigation menu should contain a "Badge Marketplace" item that links to `/marketplace`
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Feature separation
*For any* feature check, the deprecation service should return `false` for carbon credits marketplace and `true` for badge marketplace
**Validates: Requirements 3.1, 3.2**

### Property 4: Purchase flow integration
*For any* badge purchase initiated from the marketplace, the system should use `badgePurchaseService.initiatePurchase()` and credit GG Coins via `ggCoinService.creditCoins()`
**Validates: Requirements 4.1, 4.2**

### Property 5: GG Coin reward calculation
*For any* badge purchase of 200 KES, the system should credit exactly 1.000 GG Coins to the user's account
**Validates: Requirements 4.3, 4.4**

## Error Handling

### Route Access Errors
- **Scenario**: User tries to access marketplace while not authenticated
- **Handling**: Redirect to login page via ProtectedRoute component
- **User Feedback**: Standard authentication prompt

### Payment Errors
- **Scenario**: Paystack payment initialization fails
- **Handling**: Existing error handling in badgePurchaseService
- **User Feedback**: Error modal with retry option

### Navigation Errors
- **Scenario**: Navigation item doesn't appear
- **Handling**: Check user authentication state and role
- **User Feedback**: None needed (item simply won't show if not applicable)

## Testing Strategy

### Unit Tests

1. **Route Configuration Test**
   - Verify `/marketplace` route renders MarketplacePage
   - Verify `/carbon-credits` route redirects
   - Verify authenticated users can access marketplace

2. **Navigation Configuration Test**
   - Verify marketplace item appears in navigation
   - Verify correct icon and label
   - Verify link points to `/marketplace`

3. **Feature Deprecation Test**
   - Verify `MARKETPLACE` is not in deprecated features set
   - Verify `/marketplace` is not in route redirects
   - Verify carbon credits remain deprecated

### Integration Tests

1. **End-to-End Marketplace Access**
   - User logs in
   - User navigates to marketplace via navigation menu
   - User sees badge catalog
   - User can initiate purchase

2. **Purchase Flow Integration**
   - User selects badge
   - Payment modal opens
   - Paystack integration works
   - GG Coins are credited

### Property-Based Tests

Property-based testing will use **fast-check** library for TypeScript/JavaScript.

Each property test should run a minimum of 100 iterations.

1. **Property Test: Route Accessibility**
   - **Feature: restore-badge-marketplace, Property 1: Marketplace route accessibility**
   - Generate random authenticated user states
   - Verify marketplace route always renders correctly
   - Verify no redirects occur

2. **Property Test: GG Coin Calculation**
   - **Feature: restore-badge-marketplace, Property 5: GG Coin reward calculation**
   - Generate random purchase amounts (multiples of 200 KES)
   - Verify GG Coin calculation: `amount / 200`
   - Verify precision to 3 decimal places

## Implementation Notes

### Minimal Changes Required

The good news is that most of the code is already correct:
- `MarketplacePage.tsx` - Already implemented correctly
- `BadgeMarketplace.tsx` - Already implemented correctly
- `badgePurchaseService.ts` - Already implemented correctly
- `ggCoinService.ts` - Already implemented correctly

Only need to update:
1. Remove `/marketplace` from deprecated routes in `App.tsx`
2. Remove `MARKETPLACE` from deprecated features in `featureDeprecation.service.ts`
3. Add marketplace navigation item to `navigationConfig.ts`

### Backward Compatibility

- Existing badge purchases will continue to work
- GG Coin rewards will continue to be credited
- No database migrations needed
- No breaking changes to APIs

### Future Considerations

- Consider renaming route to `/badges/marketplace` for clarity
- Add feature flag for badge marketplace (independent of carbon credits)
- Add analytics tracking for marketplace visits and purchases
