# Profile Components

This directory contains components for user profile management and display.

## Components

### UserProfile

Displays user profile information in a read-only view.

**Features:**
- Profile completeness indicator
- Avatar display with fallback to initials
- Contact information display
- Organization details (for organization accounts)
- Forest preference display
- Account creation date

**Usage:**

```typescript
import { UserProfile } from '@/components/profile/UserProfile';
import { useAuth } from '@/hooks/useAuth';

function ProfileView() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <UserProfile 
      user={user} 
      onEdit={() => console.log('Edit clicked')} 
    />
  );
}
```

**Props:**
- `user: User` - The user object to display
- `onEdit?: () => void` - Optional callback when edit button is clicked

### ProfileEditForm

Form component for editing user profile information.

**Features:**
- Avatar upload with preview
- Full name editing
- Phone number input
- Location input
- Organization name (for organization accounts)
- Forest preference selector
- Form validation
- Loading states
- Error handling

**Usage:**

```typescript
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { useAuth } from '@/hooks/useAuth';

function EditProfile() {
  const { user, refreshUser } = useAuth();

  if (!user) return null;

  const handleSuccess = async () => {
    await refreshUser();
    console.log('Profile updated!');
  };

  return (
    <ProfileEditForm 
      user={user}
      onSuccess={handleSuccess}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

**Props:**
- `user: User` - The user object to edit
- `onSuccess?: () => void` - Optional callback when profile is successfully updated
- `onCancel?: () => void` - Optional callback when cancel button is clicked

## Profile Page

The `ProfilePage` component combines both `UserProfile` and `ProfileEditForm` to create a complete profile management experience.

**Usage:**

```typescript
import { ProfilePage } from '@/pages/ProfilePage';

// In your router configuration
<Route path="/profile" element={<ProfilePage />} />
```

**Features:**
- Toggle between view and edit modes
- Automatic user refresh after updates
- Authentication check
- Responsive layout

## Styling

All components use Tailwind CSS for styling and follow the platform's design system:
- Primary color: Green (#059669)
- Rounded corners for cards and inputs
- Shadow effects for depth
- Responsive design for mobile and desktop

## Avatar Upload

The avatar upload feature:
- Accepts JPEG, PNG, and WebP formats
- Maximum file size: 5MB
- Uploads to Supabase Storage
- Generates public URLs
- Shows preview before upload
- Validates file type and size

## Forest Preference

Users can select their preferred forest from:
- Kakamega Forest
- Karura Forest
- Mau Forest

This preference is used for personalized notifications and content filtering.

## Profile Completeness

The profile completeness indicator tracks:
- Full name (required)
- Phone number
- Organization (for organization accounts)
- Location
- Avatar

Completeness percentage is calculated based on filled fields.
