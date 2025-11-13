# Custom Hooks

This directory contains custom React hooks for the #GangGreen platform.

## useAuth

A comprehensive authentication hook that provides access to the auth context and authentication operations.

### Usage

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    hasRole,
    hasAnyRole,
    isAdmin,
    isOrganization,
    refreshUser,
  } = useAuth();

  // Use the auth state and methods
}
```

### Return Values

#### State Properties

- **user**: `User | null` - The currently authenticated user object, or null if not authenticated
- **loading**: `boolean` - True when any auth operation is in progress
- **isAuthenticated**: `boolean` - True if a user is currently authenticated

#### Methods

##### login(credentials: LoginCredentials)
Authenticates a user with email and password.

```tsx
const handleLogin = async () => {
  const { success, error } = await login({
    email: 'user@example.com',
    password: 'password123',
  });

  if (success) {
    console.log('Login successful');
  } else {
    console.error('Login failed:', error);
  }
};
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

##### register(data: RegisterData)
Creates a new user account.

```tsx
const handleRegister = async () => {
  const { success, error } = await register({
    email: 'user@example.com',
    password: 'password123',
    full_name: 'John Doe',
    role: 'individual',
    forest_preference: 'kakamega',
  });

  if (success) {
    console.log('Registration successful');
  } else {
    console.error('Registration failed:', error);
  }
};
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

##### logout()
Signs out the current user and redirects to login page.

```tsx
const handleLogout = async () => {
  await logout();
  // User is automatically redirected to /login
};
```

**Returns**: `Promise<void>`

##### requestPasswordReset(email: string)
Sends a password reset email to the specified address.

```tsx
const handleResetRequest = async () => {
  const { success, error } = await requestPasswordReset('user@example.com');

  if (success) {
    console.log('Reset email sent');
  } else {
    console.error('Failed to send reset email:', error);
  }
};
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

##### updatePassword(newPassword: string)
Updates the current user's password.

```tsx
const handlePasswordUpdate = async () => {
  const { success, error } = await updatePassword('newPassword123');

  if (success) {
    console.log('Password updated');
  } else {
    console.error('Failed to update password:', error);
  }
};
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

##### hasRole(role: UserRole)
Checks if the current user has a specific role.

```tsx
if (hasRole('admin')) {
  console.log('User is an admin');
}
```

**Returns**: `boolean`

##### hasAnyRole(roles: UserRole[])
Checks if the current user has any of the specified roles.

```tsx
if (hasAnyRole(['admin', 'organization'])) {
  console.log('User is admin or organization');
}
```

**Returns**: `boolean`

##### isAdmin()
Checks if the current user is an admin.

```tsx
if (isAdmin()) {
  console.log('User is an admin');
}
```

**Returns**: `boolean`

##### isOrganization()
Checks if the current user is an organization.

```tsx
if (isOrganization()) {
  console.log('User is an organization');
}
```

**Returns**: `boolean`

##### refreshUser()
Manually refreshes the current user data from the server.

```tsx
const handleRefresh = async () => {
  await refreshUser();
  console.log('User data refreshed');
};
```

**Returns**: `Promise<void>`

### Complete Example

```tsx
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const {
    user,
    loading,
    isAuthenticated,
    logout,
    hasRole,
    refreshUser,
  } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.profile?.full_name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      {hasRole('admin') && (
        <button>Admin Panel</button>
      )}

      <button onClick={refreshUser}>
        Refresh Profile
      </button>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}
```

### Error Handling

All async methods return an object with `success` and optional `error` properties:

```tsx
const { success, error } = await login(credentials);

if (!success) {
  // Handle error
  console.error(error);
  // Show error message to user
}
```

### Loading States

The hook provides a `loading` state that is true during any auth operation:

```tsx
const { loading, login } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}
```

### Session Persistence

The hook automatically:
- Loads the user on mount
- Subscribes to auth state changes
- Persists session across page refreshes
- Updates user state in real-time

### Integration with AuthContext

The `useAuth` hook uses the `AuthContext` under the hood, so your app must be wrapped with `AuthProvider`:

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### Requirements Fulfilled

This hook fulfills **Requirement 1.2 and 1.3** from the requirements document:

✅ Session persistence and refresh logic  
✅ Global auth state management  
✅ Real-time auth state updates  
✅ Role-based access control helpers  

## Best Practices

1. **Always check loading state** before rendering auth-dependent content
2. **Handle errors gracefully** with user-friendly messages
3. **Use role checks** for conditional rendering
4. **Refresh user data** after profile updates
5. **Don't store sensitive data** in component state
