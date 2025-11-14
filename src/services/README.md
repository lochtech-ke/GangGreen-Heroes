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

## Profile Service (`profile.service.ts`)

The profile service handles user profile management, updates, and avatar uploads.

### Features

- Get user profile
- Update profile information
- Upload and delete avatar images
- Update forest preference
- Profile validation
- Profile completeness calculation

### Usage Examples

#### Get user profile

```typescript
import { profileService } from '@/services';

const { profile, error } = await profileService.getProfile(userId);
if (error) {
  console.error('Failed to fetch profile:', error);
} else {
  console.log('Profile:', profile);
}
```

#### Update profile

```typescript
const { profile, error } = await profileService.updateProfile(userId, {
  full_name: 'Jane Doe',
  phone: '+254712345678',
  organization: 'Green Initiative',
  location: 'Nairobi, Kenya',
});

if (error) {
  console.error('Failed to update profile:', error);
} else {
  console.log('Updated profile:', profile);
}
```

#### Upload avatar

```typescript
const file = event.target.files[0]; // From file input
const { url, error } = await profileService.uploadAvatar(userId, file);

if (error) {
  console.error('Failed to upload avatar:', error);
} else {
  console.log('Avatar uploaded:', url);
}
```

#### Delete avatar

```typescript
const { error } = await profileService.deleteAvatar(userId, avatarUrl);
if (error) {
  console.error('Failed to delete avatar:', error);
}
```

#### Update forest preference

```typescript
const { error } = await profileService.updateForestPreference(userId, 'karura');
if (error) {
  console.error('Failed to update forest preference:', error);
}
```

#### Check profile completeness

```typescript
const completeness = profileService.getProfileCompleteness(profile);
console.log(`Profile is ${completeness}% complete`);
```

## Initiative Service (`initiative.service.ts`)

The initiative service handles tree planting initiative management, filtering, participant tracking, and progress calculations.

### Features

- Create, read, update, and delete initiatives
- Filter initiatives by forest, status, organization, or search term
- Manage initiative participants (join/leave)
- Track participant contributions
- Calculate initiative progress and metrics
- Support for geospatial data

### Usage Examples

#### Create an initiative

```typescript
import { initiativeService } from '@/services';

const { initiative, error } = await initiativeService.createInitiative({
  title: 'Kakamega Forest Restoration 2025',
  description: 'Community-led initiative to plant 10,000 indigenous trees',
  forest: 'kakamega',
  target_trees: 10000,
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  location: {
    type: 'Point',
    coordinates: [34.8522, 0.2827], // [longitude, latitude]
  },
  area_hectares: 50,
  organization_id: 'org-uuid',
});

if (error) {
  console.error('Failed to create initiative:', error);
} else {
  console.log('Initiative created:', initiative);
}
```

#### Get all initiatives with filters

```typescript
// Get all active initiatives in Kakamega forest
const { initiatives, error } = await initiativeService.getInitiatives({
  forest: 'kakamega',
  status: 'active',
});

// Search initiatives
const { initiatives, error } = await initiativeService.getInitiatives({
  search: 'restoration',
});

// Get initiatives by organization
const { initiatives, error } = await initiativeService.getInitiatives({
  organization_id: 'org-uuid',
});
```

#### Get single initiative

```typescript
const { initiative, error } = await initiativeService.getInitiative(initiativeId);
if (error) {
  console.error('Failed to fetch initiative:', error);
} else {
  console.log('Initiative:', initiative);
}
```

#### Update initiative

```typescript
const { initiative, error } = await initiativeService.updateInitiative(initiativeId, {
  title: 'Updated Initiative Title',
  target_trees: 15000,
  status: 'completed',
});

if (error) {
  console.error('Failed to update initiative:', error);
} else {
  console.log('Initiative updated:', initiative);
}
```

#### Join an initiative

```typescript
const { participant, error } = await initiativeService.joinInitiative(
  initiativeId,
  userId
);

if (error) {
  console.error('Failed to join initiative:', error);
} else {
  console.log('Joined initiative:', participant);
}
```

#### Leave an initiative

```typescript
const { error } = await initiativeService.leaveInitiative(initiativeId, userId);
if (error) {
  console.error('Failed to leave initiative:', error);
}
```

#### Get participants

```typescript
const { participants, error } = await initiativeService.getParticipants(initiativeId);
if (error) {
  console.error('Failed to fetch participants:', error);
} else {
  console.log('Participants:', participants);
}
```

#### Update participant contribution

```typescript
const { participant, error } = await initiativeService.updateParticipantContribution(
  initiativeId,
  userId,
  50 // trees contributed
);

if (error) {
  console.error('Failed to update contribution:', error);
} else {
  console.log('Contribution updated:', participant);
}
```

#### Calculate initiative progress

```typescript
const progress = await initiativeService.calculateProgress(initiativeId);
if (progress) {
  console.log(`Progress: ${progress.progress_percentage}%`);
  console.log(`Trees remaining: ${progress.trees_remaining}`);
  console.log(`Days remaining: ${progress.days_remaining}`);
  console.log(`On track: ${progress.is_on_track}`);
}
```

#### Get initiative with participants

```typescript
const { initiative, error } = await initiativeService.getInitiativeWithParticipants(
  initiativeId
);

if (error) {
  console.error('Failed to fetch initiative:', error);
} else {
  console.log('Initiative:', initiative);
  console.log('Participants count:', initiative.participants_count);
  console.log('Participants:', initiative.participants);
}
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
