# Authentication Components

This directory contains all authentication-related UI components for the #GangGreen platform.

## Components

### LoginForm

A form component for user authentication with email and password.

**Props:**
- `onSuccess?: () => void` - Callback function called after successful login
- `onForgotPassword?: () => void` - Callback function called when user clicks "Forgot password?"

**Features:**
- Email and password validation
- Error handling and display
- Loading states
- Forgot password link

**Usage:**
```tsx
import { LoginForm } from './components/auth';

function LoginPage() {
  const handleSuccess = () => {
    console.log('User logged in successfully');
  };

  return <LoginForm onSuccess={handleSuccess} />;
}
```

### RegisterForm

A comprehensive registration form with role selection and forest preference.

**Props:**
- `onSuccess?: () => void` - Callback function called after successful registration

**Features:**
- Full name, email, and password fields
- Password confirmation validation
- Role selection (individual, community, organization)
- Forest preference selection (Kakamega, Karura, Mau)
- Optional fields: phone, location, organization name
- Conditional organization field for organization accounts
- Comprehensive validation

**Usage:**
```tsx
import { RegisterForm } from './components/auth';

function RegisterPage() {
  const handleSuccess = () => {
    console.log('User registered successfully');
  };

  return <RegisterForm onSuccess={handleSuccess} />;
}
```

### ProtectedRoute

A route guard component that restricts access to authenticated users only.

**Props:**
- `children: ReactNode` - The protected content to render
- `requiredRoles?: UserRole[]` - Optional array of roles required to access the route
- `redirectTo?: string` - Path to redirect unauthenticated users (default: '/login')

**Features:**
- Checks user authentication status
- Validates user roles if specified
- Shows loading state while checking auth
- Redirects unauthenticated users
- Shows access denied message for unauthorized roles
- Subscribes to auth state changes

**Usage:**
```tsx
import { ProtectedRoute } from './components/auth';

// Protect any route
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

// Protect with role requirements
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  }
/>

// Protect with custom redirect
<Route
  path="/profile"
  element={
    <ProtectedRoute redirectTo="/welcome">
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

### PasswordResetRequest

A form component for requesting a password reset email.

**Props:**
- `onSuccess?: () => void` - Callback function called after reset email is sent
- `onCancel?: () => void` - Callback function called when user cancels

**Features:**
- Email validation
- Success confirmation message
- Cancel button
- Auto-redirect after success

**Usage:**
```tsx
import { PasswordResetRequest } from './components/auth';

function ForgotPasswordPage() {
  const handleSuccess = () => {
    console.log('Reset email sent');
  };

  return (
    <PasswordResetRequest
      onSuccess={handleSuccess}
      onCancel={() => navigate('/login')}
    />
  );
}
```

### PasswordResetConfirm

A form component for setting a new password after clicking the reset link.

**Props:**
- `onSuccess?: () => void` - Callback function called after password is updated

**Features:**
- New password input with confirmation
- Password strength validation (minimum 8 characters)
- Password match validation
- Success confirmation message
- Auto-redirect after success

**Usage:**
```tsx
import { PasswordResetConfirm } from './components/auth';

function ResetPasswordPage() {
  const handleSuccess = () => {
    navigate('/login');
  };

  return <PasswordResetConfirm onSuccess={handleSuccess} />;
}
```

## Authentication Flow

### Registration Flow
1. User fills out RegisterForm
2. Form validates all inputs
3. authService.register() creates user account
4. User profile is created in database
5. User is automatically logged in
6. onSuccess callback is triggered

### Login Flow
1. User enters credentials in LoginForm
2. Form validates inputs
3. authService.login() authenticates user
4. Session is established
5. onSuccess callback is triggered

### Password Reset Flow
1. User requests reset via PasswordResetRequest
2. Reset email is sent with secure link
3. User clicks link and lands on ResetPasswordPage
4. User enters new password in PasswordResetConfirm
5. Password is updated via authService.updatePassword()
6. User is redirected to login

### Protected Routes
1. ProtectedRoute checks authentication status
2. If not authenticated, redirects to login
3. If authenticated but wrong role, shows access denied
4. If authorized, renders protected content
5. Subscribes to auth changes for real-time updates

## Styling

All components use Tailwind CSS for styling with the following design system:

- **Primary Color**: Green (green-600, green-700)
- **Error Color**: Red (red-50, red-200, red-600)
- **Success Color**: Green (green-500)
- **Background**: White with green gradient backgrounds
- **Shadows**: shadow-lg for cards
- **Rounded Corners**: rounded-md for inputs, rounded-lg for cards
- **Focus States**: ring-2 ring-green-500

## Validation Rules

### Email
- Required field
- Must contain '@' symbol
- Standard email format

### Password
- Required field
- Minimum 8 characters
- Must match confirmation password (for registration and reset)

### Full Name
- Required for registration
- Text input

### Role
- Required for registration
- Options: individual, community, organization

### Organization Name
- Required only if role is 'organization'
- Text input

### Forest Preference
- Optional field
- Options: kakamega, karura, mau

## Error Handling

All components handle errors gracefully:
- Display user-friendly error messages
- Show validation errors inline
- Handle network errors
- Handle authentication errors from Supabase
- Provide clear feedback for all error states

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- Proper label associations
- ARIA attributes where needed
- Keyboard navigation support
- Focus indicators
- Disabled states for loading
- Clear error messages

## Integration with Auth Service

All components use the `authService` singleton from `src/services/auth.service.ts`:

- `authService.login()` - Authenticate user
- `authService.register()` - Create new user account
- `authService.logout()` - Sign out user
- `authService.getCurrentUser()` - Get current user data
- `authService.requestPasswordReset()` - Send reset email
- `authService.updatePassword()` - Update user password
- `authService.onAuthStateChange()` - Subscribe to auth changes
- `authService.hasRole()` - Check user role
- `authService.hasAnyRole()` - Check multiple roles

## Requirements Fulfilled

This implementation fulfills **Requirement 1: User Authentication and Authorization** from the requirements document:

✅ 1.1 - User registration with encrypted credentials  
✅ 1.2 - User login with authentication  
✅ 1.3 - Protected resource access control  
✅ 1.4 - Role-based permission enforcement  
✅ 1.5 - Password reset functionality  

All acceptance criteria are met with proper validation, error handling, and user feedback.
