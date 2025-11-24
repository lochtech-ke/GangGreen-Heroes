# Design Document

## Overview

This design addresses the missing `/badges` route configuration in the #GangGreen platform's React Router setup. The solution involves adding the badges route to the main App.tsx router configuration with proper authentication protection and layout wrapping, ensuring consistency with other protected routes in the application.

## Architecture

The application uses React Router v6 for client-side routing with the following architecture:

```
BrowserRouter
└── AppWithRouter (handles preloader logic)
    └── AuthProvider (provides authentication context)
        └── JourneyProviderWrapper (provides journey context)
            └── AppContent (main routing logic)
                ├── Routes (route definitions)
                └── ChatbotWrapper (global chatbot)
```

The fix will be implemented at the Routes level within AppContent, following the existing pattern for protected routes.

## Components and Interfaces

### Existing Components

**BadgesPage Component** (`src/pages/BadgesPage.tsx`)
- Already exists and is fully implemented
- Displays user badge progression using BadgeProgressionView
- Shows HummingbirdWelcome modal for onboarding
- Requires authenticated user (has built-in check)

**ProtectedRoute Component** (`src/components/auth`)
- Wrapper component that enforces authentication
- Redirects unauthenticated users to login page
- Preserves intended destination for post-login redirect

**Layout Component** (`src/components/layout`)
- Provides consistent navigation header and footer
- Used by all main application pages
- Handles responsive design and common UI elements

### Route Configuration Pattern

All protected routes in the application follow this pattern:

```tsx
<Route
  path="/route-path"
  element={
    <ProtectedRoute>
      <Layout>
        <PageComponent />
      </Layout>
    </ProtectedRoute>
  }
/>
```

## Data Models

No new data models are required. The existing routing and authentication models are sufficient:

**Route Definition**
- `path`: string - URL path pattern
- `element`: ReactElement - Component to render

**User Context** (from AuthContext)
- `user`: User | null - Current authenticated user
- `loading`: boolean - Authentication state loading indicator

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a user clicks a link to "/badges" THEN the system SHALL navigate to the BadgesPage component
Thoughts: This is about the routing system correctly matching the path and rendering the component. We can test this by navigating to /badges and verifying the BadgesPage component is rendered.
Testable: yes - example

1.2 WHEN the badges route is accessed THEN the system SHALL wrap the page in the Layout component for consistent navigation
Thoughts: This is about ensuring the Layout wrapper is present. We can test by checking that navigation elements from Layout are present when on the badges route.
Testable: yes - example

1.3 WHEN an unauthenticated user attempts to access "/badges" THEN the system SHALL redirect them to the login page
Thoughts: This is about authentication protection working correctly. We can test by accessing /badges without authentication and verifying redirect to login.
Testable: yes - example

1.4 WHEN the badges page loads THEN the system SHALL display the user's badge progression without errors
Thoughts: This is about the page rendering successfully. We can test by loading the page and checking for the BadgeProgressionView component and no console errors.
Testable: yes - example

1.5 WHEN the router processes the "/badges" path THEN the system SHALL match it to the configured route without warnings
Thoughts: This is about the router not producing "No routes matched" warnings. We can test by navigating to /badges and checking console for warnings.
Testable: yes - example

2.1 WHEN the application initializes THEN the system SHALL have all referenced routes configured in the router
Thoughts: This is about completeness of route configuration. We can test by scanning navigation links and verifying each has a corresponding route definition.
Testable: yes - example

2.2 WHEN a user navigates to any internal link THEN the system SHALL not produce "No routes matched location" console warnings
Thoughts: This is about router configuration completeness. We can test by navigating to all internal links and checking for console warnings.
Testable: yes - example

2.3 WHEN reviewing the codebase THEN the system SHALL have all navigation links pointing to configured routes
Thoughts: This is a static analysis requirement about code consistency. Not runtime testable.
Testable: no

2.4 WHEN a route is protected THEN the system SHALL use the ProtectedRoute wrapper component
Thoughts: This is about consistent use of the ProtectedRoute pattern. We can verify by checking that protected routes use the wrapper.
Testable: yes - example

2.5 WHEN a route needs layout THEN the system SHALL wrap the page component in the Layout component
Thoughts: This is about consistent use of the Layout pattern. We can verify by checking that routes use the Layout wrapper.
Testable: yes - example

3.1 WHEN navigating between pages THEN the system SHALL maintain consistent layout and navigation elements
Thoughts: This is about UI consistency across navigation. We can test by navigating between pages and verifying navigation elements persist.
Testable: yes - example

3.2 WHEN accessing protected pages while authenticated THEN the system SHALL display the requested page immediately
Thoughts: This is about authenticated access working correctly. We can test by authenticating and accessing protected pages.
Testable: yes - example

3.3 WHEN accessing protected pages while unauthenticated THEN the system SHALL redirect to login and return after authentication
Thoughts: This is about the authentication flow working correctly. We can test the redirect and return behavior.
Testable: yes - example

3.4 WHEN the router configuration changes THEN the system SHALL maintain backward compatibility with existing links
Thoughts: This is about not breaking existing functionality. We can test by verifying all existing routes still work.
Testable: yes - example

3.5 WHEN navigation occurs THEN the system SHALL update the browser URL to reflect the current page
Thoughts: This is about browser history working correctly. We can test by navigating and checking the URL bar.
Testable: yes - example

### Property Reflection

After reviewing the prework, all identified testable criteria are examples rather than universal properties. This is appropriate for routing configuration, which is primarily about specific behaviors at specific paths rather than universal rules. The criteria focus on:

1. Specific route behavior (/badges route)
2. Authentication flow examples
3. Layout consistency examples
4. Navigation behavior examples

No redundancy exists between the examples - each tests a distinct aspect of the routing system.

### Correctness Properties

Since all testable acceptance criteria are specific examples rather than universal properties, we will validate them through example-based testing rather than property-based testing. The routing system is deterministic and path-specific, making example-based testing more appropriate than property-based testing.

**Example 1: Badges route renders correctly**
When navigating to "/badges" while authenticated, the BadgesPage component should render within the Layout wrapper
**Validates: Requirements 1.1, 1.2**

**Example 2: Authentication protection works**
When navigating to "/badges" while unauthenticated, the system should redirect to "/login"
**Validates: Requirements 1.3, 3.3**

**Example 3: No routing warnings**
When navigating to "/badges", the console should not contain "No routes matched location" warnings
**Validates: Requirements 1.5, 2.2**

**Example 4: Layout consistency**
When navigating from "/dashboard" to "/badges", the navigation header should remain visible and functional
**Validates: Requirements 3.1**

**Example 5: URL updates correctly**
When clicking a link to "/badges", the browser URL should update to reflect the new location
**Validates: Requirements 3.5**

## Error Handling

### Route Not Found
- Existing behavior: React Router displays no content and logs warning
- After fix: Route will be properly matched and component rendered
- No additional error handling needed

### Authentication Failures
- Handled by existing ProtectedRoute component
- Redirects to login page with return URL preserved
- No changes needed to existing error handling

### Component Loading Errors
- BadgesPage has built-in null check for user
- Displays "Please sign in" message if user is null
- No additional error handling needed

## Testing Strategy

### Unit Testing

We will use Vitest for unit testing with React Testing Library. Tests will focus on:

**Route Configuration Tests**
- Verify /badges route is defined in router
- Verify route uses ProtectedRoute wrapper
- Verify route uses Layout wrapper
- Verify route renders BadgesPage component

**Navigation Tests**
- Test navigation to /badges from other pages
- Test URL updates when navigating to /badges
- Test browser back/forward buttons work correctly

**Authentication Tests**
- Test authenticated access to /badges succeeds
- Test unauthenticated access redirects to login
- Test post-login redirect returns to /badges

### Integration Testing

Integration tests will verify the complete navigation flow:

**End-to-End Navigation Flow**
1. Start at home page
2. Click link to badges page
3. Verify redirect to login (if not authenticated)
4. Complete login
5. Verify redirect to badges page
6. Verify BadgesPage content renders
7. Verify navigation header is present

**Cross-Route Navigation**
1. Navigate to dashboard
2. Click badge progress card link to /badges
3. Verify badges page loads
4. Navigate back to dashboard
5. Verify dashboard loads correctly

### Manual Testing Checklist

- [ ] Navigate to /badges while logged out → redirects to login
- [ ] Log in and verify redirect to /badges
- [ ] Verify badges page displays correctly
- [ ] Verify navigation header is present
- [ ] Click dashboard link in header → navigates to dashboard
- [ ] Click badges link in dashboard → navigates to badges
- [ ] Check browser console for routing warnings
- [ ] Test browser back button functionality
- [ ] Test browser forward button functionality
- [ ] Test direct URL entry: http://localhost:5173/badges

## Implementation Notes

### File to Modify

**src/App.tsx**
- Add route definition for /badges
- Place after /dashboard route for logical grouping
- Follow existing pattern for protected routes

### Code Location

Insert the new route in the Routes component within AppContent, after the /journey route and before the /initiatives route:

```tsx
<Route
  path="/badges"
  element={
    <ProtectedRoute>
      <Layout>
        <BadgesPage />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### Required Import

Add BadgesPage to the imports at the top of App.tsx:

```tsx
import { BadgesPage } from './pages/BadgesPage';
```

### Verification Steps

After implementation:
1. Start development server
2. Navigate to http://localhost:5173/badges
3. Verify no "No routes matched location" warning in console
4. Verify page renders correctly
5. Test authentication protection
6. Test navigation from other pages

## Dependencies

- React Router v6 (already installed)
- BadgesPage component (already exists)
- ProtectedRoute component (already exists)
- Layout component (already exists)
- No new dependencies required

## Performance Considerations

- Route configuration is evaluated at build time
- No runtime performance impact
- BadgesPage uses lazy loading for badge SVGs
- No additional optimization needed

## Security Considerations

- Authentication enforced by ProtectedRoute wrapper
- Follows existing security patterns
- No new security concerns introduced
- User data access controlled by existing auth service

## Accessibility

- BadgesPage already implements ARIA labels
- Navigation follows existing accessibility patterns
- Keyboard navigation supported by React Router
- No additional accessibility work needed

## Browser Compatibility

- React Router v6 supports all modern browsers
- No browser-specific code required
- Follows existing compatibility standards
