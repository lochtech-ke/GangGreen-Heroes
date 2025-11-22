# UUID Validation Fix

## Issue

The NFT Badge Showcase on the homepage was displaying console errors:

```
[BadgeSvgService] Invalid configuration: Invalid UUID format for badge ID
```

This error occurred for all badge IDs like:
- `badge-001-kakamega-tree-planter`
- `badge-002-karura-forest-guardian`
- `badge-003-mau-carbon-warrior`
- etc.

## Root Cause

The `validateBadgeConfig` function in `src/utils/badgeTemplateLoader.ts` was incorrectly treating any hyphenated string as a potential UUID and validating it against the UUID format.

The original validation logic:
```typescript
// Only validate UUID format if uniqueBadgeId looks like a UUID (contains hyphens)
if (config.metadata.uniqueBadgeId && 
    config.metadata.uniqueBadgeId.includes('-') && 
    !config.metadata.uniqueBadgeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
  errors.push('Invalid UUID format for badge ID');
}
```

This logic assumed that **any string containing hyphens** might be a UUID, which is incorrect. Badge IDs like `badge-001-kakamega-tree-planter` contain hyphens but are not UUIDs.

## Solution

Updated the validation logic to only check UUID format for strings that **actually start with a UUID pattern** (8 hex characters followed by a hyphen and 4 hex characters):

```typescript
// Only validate UUID format if uniqueBadgeId looks like a UUID
// A UUID has exactly 5 groups: 8-4-4-4-12 hex characters
// Badge IDs like "badge-001-kakamega-tree-planter" are not UUIDs
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (config.metadata.uniqueBadgeId && 
    config.metadata.uniqueBadgeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}/i) && // Starts like a UUID
    !config.metadata.uniqueBadgeId.match(uuidPattern)) {
  errors.push('Invalid UUID format for badge ID');
}
```

## Changes Made

**File:** `src/utils/badgeTemplateLoader.ts`

**Function:** `validateBadgeConfig`

**Change:** Updated UUID validation logic to properly distinguish between:
- **UUIDs**: `550e8400-e29b-41d4-a716-446655440000` (validated)
- **Badge IDs**: `badge-001-kakamega-tree-planter` (not validated as UUID)

## Testing

After this fix:
1. Badge IDs like `badge-001-kakamega-tree-planter` will pass validation
2. Actual UUIDs will still be validated for correct format
3. The NFT Badge Showcase should display without console errors
4. Badge SVG generation should succeed

## Impact

- ✅ Fixes console errors on homepage
- ✅ Allows human-readable badge IDs
- ✅ Maintains UUID validation for actual UUIDs
- ✅ No breaking changes to existing functionality

## Next Steps

1. Refresh the browser to see the fix in action
2. Verify no console errors appear
3. Check that badges display correctly on homepage
4. Continue with remaining tasks (MarketplacePage and navigation)
