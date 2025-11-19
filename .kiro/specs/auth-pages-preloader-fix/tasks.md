# Implementation Plan

- [x] 1. Restructure App component to enable route-based preloader logic



  - Move BrowserRouter to the outermost level in the App component
  - Create a new AppWithRouter component that uses useLocation hook
  - Move preloader state management and rendering logic into AppWithRouter
  - Define excludedRoutes array containing ['/login', '/register', '/reset-password']
  - Add conditional logic to check if current route is in excludedRoutes
  - Update preloader rendering to respect both showPreloader state and route exclusion
  - Add comments explaining the route exclusion logic
  - Ensure AuthProvider and JourneyProviderWrapper remain in the correct position in the component tree
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_
