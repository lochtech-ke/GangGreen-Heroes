# Navigation Links Audit - Tree Registration Features

## Date: November 24, 2025

## Summary

This document records the audit of navigation links and routes related to tree registration features that have been removed from the GangGreen platform.

## Routes Removed from Code

### 1. Journey Service Recommendations

**File**: `src/services/journey.service.ts`

**Removed References**:
- `/trees/plant` - "Plant Your First Tree" recommendation in ACTION stage
- `/trees/monitor` - "Monitor Your Trees" recommendation in VERIFICATION stage

**Action Taken**: Removed both tree-related recommendations from the journey service. These were suggesting individual tree registration and monitoring, which conflicts with the platform's focus on organizational initiatives.

## Routes Already Handled

### 1. Deprecated Route Handler

**File**: `src/App.tsx`

**Status**: ✅ Already properly handled

The `/trees` route is already configured to use the `DeprecatedRouteHandler` component, which redirects users to appropriate alternatives. This handles:
- `/trees` (base route)
- `/trees/plant` (no specific route defined, falls back to `/trees` handler)
- `/trees/register` (no specific route defined, falls back to `/trees` handler)
- `/trees/monitor` (no specific route defined, falls back to `/trees` handler)

**Implementation**: The DeprecatedRouteHandler uses the featureDeprecationService to determine appropriate redirects for deprecated features.

## Routes Not Requiring Changes

### 1. Initiative Tree Details

**File**: `src/pages/InitiativeDetailsPage.tsx`

**Route**: `/trees/${tree.id}`

**Status**: ✅ Keep as-is

This navigation is for viewing individual tree details within organizational initiatives, which is different from the individual tree registration feature being removed. This supports the platform's focus on organizational initiatives.

### 2. Antugrow API Endpoints

**File**: `src/services/antugrow.service.ts`

**Routes**: 
- `/trees/register` (API endpoint)
- `/trees/${antugrowId}/growth` (API endpoint)
- `/trees/${antugrowId}/analyses` (API endpoint)
- `/trees/${antugrowId}/recommendations` (API endpoint)

**Status**: ✅ Keep as-is

These are external API endpoints for the Antugrow service, not navigation routes in the application.

## Unused/Deprecated Files

### 1. TreesPage Component

**File**: `src/pages/TreesPage.tsx`

**Status**: ⚠️ Orphaned but not imported

This file contains references to:
- `navigate('/trees/register')` in `handleRegisterTree` function
- `navigate('/trees/${tree.id}')` in `handleTreeClick` function

**Action**: No action required. This file is not imported or used anywhere in the application. It's already effectively deprecated.

## Search Results Summary

### Navigation Links Found
- ✅ No `<Link>` components pointing to tree registration routes
- ✅ No active button handlers navigating to `/trees/plant`
- ✅ No active button handlers navigating to `/trees/register`

### Route Definitions Found
- ✅ No specific routes defined for `/trees/plant`
- ✅ No specific routes defined for `/trees/register`
- ✅ No specific routes defined for `/trees/monitor`
- ✅ Base `/trees` route properly handled by DeprecatedRouteHandler

## Verification

### Routes That Will Be Handled Gracefully

1. **`/trees`** → Redirected by DeprecatedRouteHandler
2. **`/trees/plant`** → Caught by `/trees` route, redirected by DeprecatedRouteHandler
3. **`/trees/register`** → Caught by `/trees` route, redirected by DeprecatedRouteHandler
4. **`/trees/monitor`** → Caught by `/trees` route, redirected by DeprecatedRouteHandler

All tree registration routes will be handled without errors, satisfying Requirement 3.3.

## Conclusion

✅ **Task Complete**: All navigation links to tree registration features have been identified and removed or verified as properly handled.

### Changes Made:
1. Removed `/trees/plant` recommendation from journey service (ACTION stage)
2. Removed `/trees/monitor` recommendation from journey service (VERIFICATION stage)

### No Changes Needed:
1. Router configuration already handles deprecated routes via DeprecatedRouteHandler
2. Initiative tree details navigation is intentionally kept (different feature)
3. Antugrow API endpoints are external service calls, not app navigation

### Requirements Satisfied:
- ✅ 3.1: No navigation links to tree registration pages remain in active code
- ✅ 3.3: Removed feature URLs are handled gracefully without errors
- ✅ 3.4: No orphaned code in active use (TreesPage.tsx is not imported anywhere)
