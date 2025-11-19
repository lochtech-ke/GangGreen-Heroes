# Design Document

## Overview

This design addresses the issue where the PixiPreloader component blocks user interaction on authentication pages. The solution conditionally renders the preloader based on the current route, excluding authentication pages while maintaining the preloader experience on all other pages.

## Architecture

### Component Structure

```
App (Root)
├── PixiPreloader (conditional)
└── BrowserRouter
    ├── AuthProvider
    └── Routes
        ├── /login (no preloader)
        ├── /register (no preloader)
        ├── /reset-password (no preloader)
        └── other routes (with preloader)
```

### Route Detection Strategy

The App component will use React Router's `useLocation` hook to detect the current route and conditionally render the PixiPreloader. Since `useLocation` must be called within a `BrowserRouter`, we'll need to restructure the App component slightly.

## Components and Interfaces

### Modified App Component Structure

```typescript
// New structure
function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}

function AppWithRouter() {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);
  
  // Routes where preloader should NOT be shown
  const excludedRoutes = ['/login', '/register', '/reset-password'];
  const shouldShowPreloader = !excludedRoutes.includes(location.pathname);
  
  return (
    <>
      {shouldShowPreloader && showPreloader && (
        <PixiPreloader
          minDisplayDuration={3000}
          fadeOutDuration={500}
          autoHide={true}
          allowSkip={false}
          onComplete={() => setShowPreloader(false)}
        />
      )}
      <AuthProvider>
        <JourneyProviderWrapper>
          <AppContent />
        </JourneyProviderWrapper>
      </AuthProvider>
    </>
  );
}
```

### Key Design Decisions

1. **Route-based Conditional Rendering**: Use `useLocation()` to check the current path and exclude authentication routes from showing the preloader

2. **Excluded Routes Array**: Maintain a clear list of routes that should not show the preloader, making it easy to add or remove routes in the future

3. **Component Restructuring**: Move the BrowserRouter to the outermost level so that `useLocation` can be used in the inner component

4. **State Management**: Keep the `showPreloader` state management logic intact, but add an additional condition based on the current route

## Data Models

No new data models are required. The solution uses existing React Router location data.

## Error Handling

### Edge Cases

1. **Route Changes**: If a user navigates from an auth page to a non-auth page, the preloader should not show again (handled by the existing `showPreloader` state)

2. **Direct Navigation**: If a user directly navigates to an auth page via URL, the preloader should not show

3. **Browser Back/Forward**: Navigation via browser controls should respect the route exclusion logic

### Error Prevention

- The `excludedRoutes` array uses exact path matching to prevent false positives
- The preloader state is managed independently from route detection to prevent re-showing on route changes

## Testing Strategy

### Manual Testing

1. Navigate directly to `/login` - verify no preloader shows and form is immediately clickable
2. Navigate directly to `/register` - verify no preloader shows and form is immediately clickable
3. Navigate directly to `/reset-password` - verify no preloader shows
4. Navigate to `/` (home page) - verify preloader shows and completes normally
5. Navigate from home to login - verify no preloader shows on login page
6. Navigate from login to home - verify preloader does not show again (already completed)

### Automated Testing (Optional)

- Unit test for route exclusion logic
- Integration test for preloader rendering based on routes

## Implementation Notes

### Files to Modify

- `src/App.tsx` - Restructure to enable route-based preloader logic

### No Changes Required

- `src/components/common/PixiPreloader.tsx` - No modifications needed
- Authentication page components - No modifications needed
- Other page components - No modifications needed

### Performance Considerations

- The route check is a simple array lookup with minimal performance impact
- No additional re-renders are introduced beyond what React Router already provides
- The preloader state management remains efficient

## Alternative Approaches Considered

### Alternative 1: Modify PixiPreloader to Accept Route Exclusions
**Rejected**: This would couple the preloader component to routing logic, reducing its reusability

### Alternative 2: Add z-index Override to Auth Pages
**Rejected**: This is a CSS hack that doesn't address the root cause and could lead to other z-index conflicts

### Alternative 3: Delay Preloader Start
**Rejected**: This doesn't solve the problem for users who navigate directly to auth pages

## Deployment Considerations

- This is a client-side only change with no backend dependencies
- No database migrations required
- No environment variable changes needed
- Can be deployed independently without coordination
