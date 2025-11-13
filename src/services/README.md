# Services

This directory contains service modules that handle business logic and external API interactions.

## Authentication Service (`auth.service.ts`)

The authentication service provides a complete wrapper around Supabase Auth with additional functionality for user management.

### Features

- User registration with email/password
- User login
- Password reset flow
- Session management
- Role-based access control helpers
- Auth state change subscriptions

### Usage Examples

#### Register a new user

```typescript
import { authService } from '@/services';

const result = await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123',
  full_name: 'John Doe',
  role: 'individual',
  forest_preference: 'kakamega',
  phone: '+254712345678',
});

if (result.error) {
  console.error('Registration failed:', result.error);
} else {
  console.log('User registered:', result.user);
}
```

#### Login

```typescript
const result = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123',
});

if (result.error) {
  console.error('Login failed:', result.error);
} else {
  console.log('User logged in:', result.user);
}
```

#### Get current user

```typescript
const user = await authService.getCurrentUser();
if (user) {
  console.log('Current user:', user);
}
```

#### Logout

```typescript
const { error } = await authService.logout();
if (error) {
  console.error('Logout failed:', error);
}
```

#### Password reset

```typescript
// Request reset email
const { error } = await authService.requestPasswordReset('user@example.com');

// Update password (after clicking reset link)
const { error } = await authService.updatePassword('NewSecurePass123');
```

#### Role-based access control

```typescript
const user = await authService.getCurrentUser();

// Check specific role
if (authService.isAdmin(user)) {
  console.log('User is admin');
}

if (authService.isOrganization(user)) {
  console.log('User is organization');
}

// Check multiple roles
if (authService.hasAnyRole(user, ['admin', 'organization'])) {
  console.log('User can create initiatives');
}
```

#### Subscribe to auth state changes

```typescript
const { data: subscription } = authService.onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user);
  } else {
    console.log('User signed out');
  }
});

// Unsubscribe when component unmounts
subscription.subscription.unsubscribe();
```

## Supabase Client (`supabase.ts`)

The base Supabase client configuration used by all services.

### Usage

```typescript
import { supabase } from '@/services';

// Direct database queries
const { data, error } = await supabase
  .from('initiatives')
  .select('*')
  .eq('forest', 'kakamega');
```

## Adding New Services

When creating new services:

1. Create a new file in this directory (e.g., `initiative.service.ts`)
2. Export a singleton instance or class
3. Add the export to `index.ts`
4. Document usage in this README

Example structure:

```typescript
import { supabase } from './supabase';

class InitiativeService {
  async getAll() {
    // Implementation
  }
}

export const initiativeService = new InitiativeService();
```
