# Design Document

## Overview

This design addresses the NFT badge display issues on the homepage and implements a functional badge marketplace page. The solution focuses on robust error handling in badge SVG generation, proper component integration, and a seamless user experience for browsing and purchasing badges.

## Architecture

### Component Structure

```
HomePage
├── NFTBadgeShowcase (enhanced with error handling)
│   ├── FeaturedBadgeCard (with fallback rendering)
│   └── Badge SVG generation with error boundaries

MarketplacePage (new implementation)
├── BadgeMarketplace
│   ├── Badge Grid
│   ├── Filters (search, tier, type)
│   ├── BadgePurchaseModal
│   └── BadgePurchaseConfirmation

Navigation
└── Marketplace link added to menu
```

### Service Layer

```
BadgeSvgService
├── Enhanced error handling
├── Fallback template generation
├── Graceful degradation
└── Detailed error logging

BadgePurchaseService
└── Existing implementation (no changes needed)
```

## Components and Interfaces

### Enhanced NFTBadgeShowcase Component

**Location:** `src/components/home/NFTBadgeShowcase.tsx`

**Changes:**
- Add error boundary for badge SVG generation
- Implement fallback rendering when SVG generation fails
- Add loading states for badge generation
- Improve error logging

**Interface:**
```typescript
interface FeaturedBadge {
  id: string;
  name: string;
  imageUrl?: string;
  description: string;
  priceGGCoins: number;
  priceKES: number;
  tier: BadgeTier;
  forest: ForestType;
  achievement: AchievementType;
  unlockRequirement?: string;
}

interface BadgeShowcaseProps {
  featuredBadges: FeaturedBadge[];
  onBadgeClick: (badgeId: string) => void;
  onViewAll: () => void;
}
```

### New MarketplacePage Component

**Location:** `src/pages/MarketplacePage.tsx`

**Purpose:** Replace placeholder with functional badge marketplace

**Features:**
- Display all available badges
- Filter by tier, type, and search
- Purchase flow integration
- Responsive grid layout
- Empty states

**Interface:**
```typescript
interface MarketplacePageProps {
  // No props needed - uses auth context
}
```

### Enhanced BadgeSvgService

**Location:** `src/services/badgeSvg.service.ts`

**Changes:**
- Add try-catch blocks around all async operations
- Implement fallback SVG generation
- Add detailed error logging
- Handle missing templates gracefully

**New Methods:**
```typescript
class BadgeSvgService {
  // Existing methods...
  
  /**
   * Generate fallback badge SVG when generation fails
   */
  private generateFallbackBadge(config: BadgeConfig): string;
  
  /**
   * Check if templates are available
   */
  async checkTemplateAvailability(): Promise<boolean>;
}
```

## Data Models

### Badge Display Model

```typescript
interface BadgeDisplay {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  forest: ForestType;
  achievement: AchievementType;
  priceGGCoins: number;
  priceKES: number;
  imageUrl?: string;
  svgData?: string;
  unlockRequirement?: string;
  isAvailable: boolean;
}
```

### Badge Filter State

```typescript
interface BadgeFilters {
  searchQuery: string;
  tier: BadgeTier | 'all';
  type: AchievementType | 'all';
  sortBy: 'name' | 'price' | 'tier' | 'rarity';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Badge showcase always renders

*For any* homepage load, the NFT Badge Showcase section should render successfully even if individual badge SVG generation fails

**Validates: Requirements 1.1, 1.3**

### Property 2: Fallback rendering on SVG failure

*For any* badge where SVG generation fails, the component should display a fallback placeholder without crashing

**Validates: Requirements 1.3, 3.3**

### Property 3: Marketplace navigation accessibility

*For any* authenticated or unauthenticated user, clicking the marketplace link should navigate to the badge marketplace page

**Validates: Requirements 4.1, 4.2**

### Property 4: Filter consistency

*For any* combination of filters applied in the marketplace, the displayed badges should match all active filter criteria

**Validates: Requirements 2.3**

### Property 5: Error logging completeness

*For any* badge SVG generation error, the system should log detailed error information to the console

**Validates: Requirements 3.1, 3.4**

## Error Handling

### Badge SVG Generation Errors

**Strategy:** Graceful degradation with fallback rendering

**Implementation:**
1. Wrap all async operations in try-catch blocks
2. Return structured error results instead of throwing
3. Log errors with context (badge ID, tier, forest, achievement)
4. Provide fallback SVG or placeholder icon
5. Continue rendering other badges even if one fails

**Error Types:**
- Template loading failure → Use inline fallback template
- Forest pattern loading failure → Use default pattern
- Icon rendering failure → Use simple geometric shape
- Metadata embedding failure → Continue without metadata

### Marketplace Loading Errors

**Strategy:** Display user-friendly error messages

**Implementation:**
1. Show loading skeleton while fetching badges
2. Display error message if fetch fails
3. Provide retry button
4. Log errors for debugging

### Purchase Flow Errors

**Strategy:** Existing error handling in BadgePurchaseService (no changes needed)

## Testing Strategy

### Unit Tests

**Badge SVG Service:**
- Test successful badge generation
- Test error handling for missing templates
- Test fallback generation
- Test cache functionality

**NFTBadgeShowcase Component:**
- Test rendering with valid badges
- Test rendering with SVG generation failures
- Test fallback placeholder display
- Test navigation on badge click

**MarketplacePage Component:**
- Test badge grid rendering
- Test filter functionality
- Test search functionality
- Test empty state display

### Integration Tests

- Test homepage to marketplace navigation flow
- Test badge purchase flow from marketplace
- Test filter combinations
- Test error recovery scenarios

### Manual Testing Checklist

- [ ] Homepage loads with badge showcase visible
- [ ] Badges display with SVG or fallback
- [ ] Clicking "View All Badges" navigates to marketplace
- [ ] Marketplace displays all badges
- [ ] Filters work correctly
- [ ] Search filters badges
- [ ] Purchase modal opens on click
- [ ] Error states display properly
- [ ] Console shows no critical errors

## Implementation Notes

### Template Loading

The badge template system uses dynamic imports. If templates are missing:
1. Check that template files exist in `src/assets/badges/templates/`
2. Verify forest patterns exist in `src/assets/badges/patterns/`
3. Ensure icon files exist in `src/assets/badges/icons/`

### Fallback Strategy

When SVG generation fails, use this fallback hierarchy:
1. Try to use imageUrl if provided
2. Generate simple SVG with tier colors and Award icon
3. Use placeholder image as last resort

### Performance Considerations

- Cache generated SVGs to avoid regeneration
- Lazy load badges in marketplace (implement pagination if needed)
- Use React.memo for badge cards to prevent unnecessary re-renders
- Debounce search input to reduce filter operations

## Navigation Integration

Add marketplace link to navigation menu:

**Location:** `src/components/navigation/navigationConfig.ts`

**Addition:**
```typescript
{
  label: 'Badges',
  path: '/marketplace',
  icon: 'Award',
  requiresAuth: false,
  description: 'Browse and purchase NFT badges'
}
```

## Deployment Considerations

### Environment Variables

No new environment variables needed.

### Database

No database changes needed - uses existing `badge_purchases` table.

### Assets

Ensure all badge assets are included in build:
- Template files
- Forest patterns
- Icon files

### Testing Before Deployment

1. Test on development environment
2. Verify badge generation works
3. Test purchase flow end-to-end
4. Check console for errors
5. Test on mobile devices
6. Verify navigation links work
