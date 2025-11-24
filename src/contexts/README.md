# React Contexts

This directory contains React Context providers for global state management in the #GangGreen platform.

## AuthContext

The AuthContext provides global authentication state and user information throughout the application.

### Overview

The AuthContext manages:
- Current user state
- Authentication status
- Loading states
- Session persistence
- Real-time auth state updates

### Setup

Wrap your application with the `AuthProvider` at the root level:

```tsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Your app routes and components */}
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Usage

#### Using the Context Hook

```tsx
import { useAuthContext } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, isAuthenticated, refreshUser } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.profile?.full_name}</h1>
      <button onClick={refreshUser}>Refresh</button>
    </div>
  );
}
```

#### Using the useAuth Hook (Recommended)

For most use cases, use the `useAuth` hook instead, which provides additional functionality:

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  // ... component logic
}
```

### Context Value

The AuthContext provides the following values:

#### user
- **Type**: `User | null`
- **Description**: The currently authenticated user object, or null if not authenticated
- **Properties**:
  - `id`: User's unique identifier
  - `email`: User's email address
  - `role`: User's role (admin, organization, community, individual)
  - `forest_preference`: User's preferred forest (kakamega, karura, mau)
  - `created_at`: Account creation timestamp
  - `profile`: User profile data (full_name, phone, organization, location, avatar_url)

```tsx
const { user } = useAuthContext();

if (user) {
  console.log(user.email);
  console.log(user.role);
  console.log(user.profile?.full_name);
}
```

#### loading
- **Type**: `boolean`
- **Description**: True when the initial user load is in progress
- **Use Case**: Show loading spinner while checking authentication status

```tsx
const { loading } = useAuthContext();

if (loading) {
  return <LoadingSpinner />;
}
```

#### isAuthenticated
- **Type**: `boolean`
- **Description**: True if a user is currently authenticated
- **Use Case**: Conditional rendering based on auth status

```tsx
const { isAuthenticated } = useAuthContext();

return (
  <div>
    {isAuthenticated ? (
      <UserMenu />
    ) : (
      <LoginButton />
    )}
  </div>
);
```

#### refreshUser
- **Type**: `() => Promise<void>`
- **Description**: Manually refreshes the current user data from the server
- **Use Case**: Update user data after profile changes

```tsx
const { refreshUser } = useAuthContext();

const handleProfileUpdate = async () => {
  await updateProfile(data);
  await refreshUser(); // Refresh to get updated data
};
```

### Features

#### Automatic Session Persistence

The AuthContext automatically:
- Loads user data on mount
- Persists session across page refreshes
- Restores user state from Supabase session

```tsx
// User is automatically loaded when app starts
// No manual initialization needed
```

#### Real-time Auth State Updates

The context subscribes to Supabase auth state changes:
- Login events
- Logout events
- Session refresh
- Token expiration

```tsx
// User state automatically updates when:
// - User logs in
// - User logs out
// - Session expires
// - Token is refreshed
```

#### Error Handling

The context handles errors gracefully:
- Logs errors to console
- Sets user to null on error
- Continues app execution

### Implementation Details

#### Provider Component

```tsx
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial user
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    loadUser();

    // Subscribe to auth changes
    const { data: authListener } = authService.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Context Hook

```tsx
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
```

### Error Prevention

The context hook throws an error if used outside of AuthProvider:

```tsx
// ❌ This will throw an error
function MyComponent() {
  const { user } = useAuthContext(); // Error: must be within AuthProvider
}

// ✅ This works correctly
function App() {
  return (
    <AuthProvider>
      <MyComponent /> {/* Now it works */}
    </AuthProvider>
  );
}
```

### Performance Considerations

#### Memoization

The context value is not memoized by default. For performance-critical applications, consider memoizing:

```tsx
const value = useMemo(
  () => ({ user, loading, isAuthenticated: !!user, refreshUser }),
  [user, loading]
);
```

#### Selective Subscriptions

Components only re-render when the context value changes. Use selective destructuring:

```tsx
// Only re-renders when user changes
const { user } = useAuthContext();

// Re-renders when any context value changes
const authContext = useAuthContext();
```

### Integration with Other Features

#### Protected Routes

```tsx
import { ProtectedRoute } from './components/auth';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

#### Conditional Navigation

```tsx
const { isAuthenticated } = useAuthContext();

useEffect(() => {
  if (!isAuthenticated) {
    navigate('/login');
  }
}, [isAuthenticated, navigate]);
```

#### User-Specific Content

```tsx
const { user } = useAuthContext();

return (
  <div>
    {user?.role === 'admin' && <AdminPanel />}
    {user?.role === 'organization' && <OrgDashboard />}
  </div>
);
```

### Testing

When testing components that use AuthContext:

```tsx
import { AuthProvider } from '../contexts/AuthContext';
import { render } from '@testing-library/react';

test('renders user name', () => {
  render(
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
  // ... test assertions
});
```

### Requirements Fulfilled

This context fulfills **Requirement 1.2 and 1.3** from the requirements document:

✅ Global auth state management  
✅ Session persistence across page refreshes  
✅ Real-time auth state updates  
✅ Automatic session refresh  
✅ Centralized user data access  

## Best Practices

1. **Always wrap your app** with AuthProvider at the root level
2. **Use useAuth hook** instead of useAuthContext for most cases
3. **Check loading state** before rendering auth-dependent content
4. **Handle null user** gracefully in your components
5. **Refresh user data** after profile updates
6. **Don't modify user state** directly - use refreshUser()
7. **Subscribe to auth changes** via the context, not manually
