# Design Document

## Overview

This design document outlines the removal of two tree registration features from the GangGreen platform: the "Register Your Tree" hero card on the Dashboard and the "Plant a Tree" quick action on the Journey Dashboard. These features are being removed to align the platform with its core mission of facilitating community-driven, verified organizational initiatives rather than individual tree registration.

The removal is a simplification effort that will:
- Reduce user confusion about the platform's primary purpose
- Direct users toward verified organizational initiatives
- Maintain clean, focused user interfaces
- Eliminate unused or underutilized features

## Architecture

### Affected Components

1. **DashboardPage Component** (`src/pages/DashboardPage.tsx`)
   - Contains the "Register Your Tree" hero card section
   - Needs removal of the hero card JSX block
   - Layout adjustment to remove spacing

2. **JourneyDashboardPage Component** (`src/pages/JourneyDashboardPage.tsx`)
   - Contains the "Plant a Tree" quick action button
   - Needs removal of the specific button from Quick Actions sidebar
   - Maintain other quick action buttons

3. **Quick Actions Service** (`src/services/quickActions.service.ts`)
   - Currently manages user preferences for quick actions
   - No changes required (service remains for other quick actions)

### Component Hierarchy

```
DashboardPage
├── Stats Cards
├── Badge Progress Widget
├── [REMOVE] Register Tree Hero Card
└── For You Section
    ├── Initiative Card
    ├── Fun Segment Card
    └── Leaderboard Card

JourneyDashboardPage
├── Header
├── Stage Progress
├── Stats & Impact
└── Sidebar
    ├── Your Causes
    ├── Milestones
    └── Quick Actions
        ├── View Badges
        ├── View Challenges
        ├── [REMOVE] Plant a Tree
        ├── View Petitions
        └── Invite Friends
```

## Components and Interfaces

### DashboardPage Modifications

**Current Structure:**
```typescript
<div className="space-y-8">
  {/* Welcome Section */}
  {/* Stats Cards */}
  {/* Badge Progress Widget */}
  {/* Register Tree Hero Card - TO BE REMOVED */}
  {/* For You Section */}
  {/* Hummingbird Welcome Modal */}
</div>
```

**Modified Structure:**
```typescript
<div className="space-y-8">
  {/* Welcome Section */}
  {/* Stats Cards */}
  {/* Badge Progress Widget */}
  {/* For You Section - moves up */}
  {/* Hummingbird Welcome Modal */}
</div>
```

### JourneyDashboardPage Modifications

**Current Quick Actions:**
```typescript
<div className="space-y-2">
  <button>View Badges</button>
  <button>View Challenges</button>
  <button>Plant a Tree</button> {/* TO BE REMOVED */}
  <button>View Petitions</button>
  <button>Invite Friends</button>
</div>
```

**Modified Quick Actions:**
```typescript
<div className="space-y-2">
  <button>View Badges</button>
  <button>View Challenges</button>
  <button>View Petitions</button>
  <button>Invite Friends</button>
</div>
```

## Data Models

No database schema changes are required. This is a pure UI removal with no backend data model impacts.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a user views the Dashboard THEN the system SHALL NOT display the "Register Your Tree" hero card
  Thoughts: This is testing that a specific UI element is absent from the rendered page. We can test this by rendering the Dashboard component and asserting that no element with the hero card's identifying characteristics (text content, class names, or test IDs) exists in the DOM.
  Testable: yes - example

1.2 WHEN the hero card is removed THEN the system SHALL maintain all other Dashboard components in their current positions
  Thoughts: This is about ensuring that removing one component doesn't break the layout of other components. We can test this by verifying that all expected components (Stats Cards, Badge Progress Widget, For You Section) are still present and rendered in the correct order.
  Testable: yes - example

1.3 WHEN the hero card is removed THEN the system SHALL NOT leave empty space or layout gaps on the Dashboard
  Thoughts: This is a visual regression test about layout. While we could test for specific spacing values, this is more about visual appearance which is difficult to test programmatically without visual regression tools.
  Testable: no

1.4 WHEN a user views the Dashboard THEN the system SHALL display the "For You" section immediately after the stats cards and badge progress widget
  Thoughts: This is testing the order of rendered components. We can verify this by checking the DOM structure and ensuring the "For You" section appears in the correct position relative to other components.
  Testable: yes - example

2.1 WHEN a user views the Journey Dashboard THEN the system SHALL NOT display the "Plant a Tree" button in the Quick Actions sidebar
  Thoughts: This is testing that a specific button is absent from the rendered page. We can test this by rendering the Journey Dashboard and asserting that no button with "Plant a Tree" text exists in the Quick Actions section.
  Testable: yes - example

2.2 WHEN the quick action is removed THEN the system SHALL maintain all other quick action buttons in the Quick Actions widget
  Thoughts: This is about ensuring that removing one button doesn't affect the others. We can test this by verifying that all expected buttons (View Badges, View Challenges, View Petitions, Invite Friends) are still present.
  Testable: yes - example

2.3 WHEN the quick action is removed THEN the system SHALL preserve the visual layout and spacing of the Quick Actions widget
  Thoughts: This is about visual layout consistency. Similar to 1.3, this is difficult to test programmatically without visual regression tools.
  Testable: no

2.4 WHEN a user views the Quick Actions widget THEN the system SHALL display the remaining actions: "View Badges", "View Challenges", "View Petitions", and "Invite Friends"
  Thoughts: This is testing that specific buttons are present in the rendered output. We can verify this by checking that each expected button text appears in the Quick Actions section.
  Testable: yes - example

3.1 WHEN tree registration features are removed THEN the system SHALL NOT contain any navigation links to tree registration pages
  Thoughts: This is about ensuring no broken links remain. We can test this by searching the codebase for navigation links to tree registration routes and asserting none exist.
  Testable: yes - example

3.2 WHEN tree registration features are removed THEN the system SHALL NOT contain any service methods that reference individual tree registration
  Thoughts: This is about code cleanliness. We can verify this by checking that no service methods related to individual tree registration exist in the codebase.
  Testable: yes - example

3.3 WHEN a user attempts to navigate to a removed feature URL THEN the system SHALL handle the route gracefully without errors
  Thoughts: This is testing error handling for non-existent routes. We can test this by attempting to navigate to tree registration URLs and verifying the app doesn't crash and handles it appropriately (404 or redirect).
  Testable: yes - example

3.4 WHEN the codebase is reviewed THEN the system SHALL contain no orphaned code related to individual tree registration
  Thoughts: This is about code cleanliness and is more of a manual code review task than an automated test. We could search for specific keywords, but determining if code is "orphaned" requires human judgment.
  Testable: no

### Property Reflection

After reviewing all testable criteria, I've identified that all testable items are specific examples rather than universal properties. Since this is a feature removal task focused on UI elements and code cleanup, example-based testing is appropriate. No redundancy exists between the test cases as each validates a distinct aspect of the removal.

### Correctness Properties

**Example 1: Dashboard hero card removal**
*For the* Dashboard page, when rendered, the "Register Your Tree" hero card should not be present in the DOM
**Validates: Requirements 1.1**

**Example 2: Dashboard component preservation**
*For the* Dashboard page, when rendered, all expected components (Stats Cards, Badge Progress Widget, For You Section) should be present and in the correct order
**Validates: Requirements 1.2, 1.4**

**Example 3: Journey quick action removal**
*For the* Journey Dashboard page, when rendered, the "Plant a Tree" button should not be present in the Quick Actions sidebar
**Validates: Requirements 2.1**

**Example 4: Journey quick actions preservation**
*For the* Journey Dashboard page, when rendered, all expected quick action buttons (View Badges, View Challenges, View Petitions, Invite Friends) should be present
**Validates: Requirements 2.2, 2.4**

**Example 5: No broken navigation links**
*For the* entire application, no navigation links should point to tree registration pages
**Validates: Requirements 3.1**

**Example 6: Route handling**
*For the* application router, attempting to navigate to removed tree registration URLs should not cause errors
**Validates: Requirements 3.3**

## Error Handling

### Potential Issues

1. **Broken Navigation Links**
   - Issue: Other components may link to tree registration features
   - Solution: Search codebase for all references to tree registration routes and remove them
   - Fallback: Implement 404 handling for removed routes

2. **Layout Shifts**
   - Issue: Removing large components may cause unexpected layout changes
   - Solution: Test responsive layouts after removal
   - Fallback: Adjust spacing/margins if needed

3. **User Confusion**
   - Issue: Users may look for removed features
   - Solution: This is a product decision; no technical error handling needed
   - Note: Consider adding help documentation if users ask about tree registration

## Testing Strategy

### Unit Tests

Since this is a feature removal task, we'll focus on component rendering tests to verify the features are properly removed:

1. **Dashboard Component Tests**
   - Test that Dashboard renders without the hero card
   - Test that all other components are still present
   - Test that component order is correct

2. **Journey Dashboard Component Tests**
   - Test that Journey Dashboard renders without "Plant a Tree" button
   - Test that other quick action buttons are still present
   - Test that quick actions are in correct order

3. **Navigation Tests**
   - Test that no links to `/trees/plant` or tree registration routes exist
   - Test that navigating to removed routes doesn't crash the app

### Integration Tests

1. **Full Page Rendering**
   - Render Dashboard and verify complete layout
   - Render Journey Dashboard and verify complete layout
   - Test navigation between pages works correctly

2. **User Flow Tests**
   - Test that users can navigate through the app without encountering removed features
   - Test that all remaining quick actions work correctly

### Manual Testing Checklist

1. Visual inspection of Dashboard page
2. Visual inspection of Journey Dashboard page
3. Check for any console errors
4. Verify responsive layouts on mobile/tablet/desktop
5. Test all remaining quick action buttons
6. Verify no broken links throughout the application

### Testing Framework

- **Unit/Integration Tests**: Vitest with React Testing Library
- **Component Rendering**: `@testing-library/react`
- **User Interactions**: `@testing-library/user-event`
- **Test Coverage Target**: 100% for modified components (since we're removing code, coverage should be straightforward)

### Test Implementation Notes

- Tests should verify absence of removed elements using `queryBy*` methods (which return null if not found)
- Tests should verify presence of remaining elements using `getBy*` methods (which throw if not found)
- Use `screen.debug()` during development to inspect rendered output
- Mock navigation hooks (`useNavigate`) to test routing behavior
