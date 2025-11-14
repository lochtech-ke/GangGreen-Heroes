# #GangGreen Platform - Technical Guide

**Last Updated**: November 14, 2025  
**Version**: 2.1  
**Status**: Sprint 3 - Onboarding Integration

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Database Schema](#database-schema)
6. [API Services](#api-services)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Security](#security)
10. [Testing](#testing)
11. [Deployment](#deployment)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │   Admin      │     │
│  │   (Vite)     │  │  (Responsive)│  │   Dashboard  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth Service │ Profile Service │ Initiative Service │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 20 tables       │  │  - JWT tokens      │           │
│  │  - RLS policies    │  │  - Session mgmt    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐                                    │
│  │  Storage Buckets   │                                    │
│  │  - Tree images     │                                    │
│  │  - Avatars         │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

---

## Authentication System

### Overview

The authentication system provides secure user registration, login, and session management with role-based access control.

**Status**: ✅ Complete (with onboarding enhancement)

### Architecture

```
User Registration Flow (Updated November 14, 2025):

1. RegisterForm (email/password)
   ↓
2. Supabase Auth (create account)
   ↓
3. RegisterPage (onboarding state)
   ↓
4. Onboarding Chatbot (profile completion)
   ↓
5. Profile Service (create/update profile)
   ↓
6. Dashboard (authenticated user)
```


### Components

#### 1. RegisterForm (Simplified)

**Location**: `src/components/auth/RegisterForm.tsx`

**Purpose**: Minimal registration form collecting only email and password

**Props**:
```typescript
interface RegisterFormProps {
  onSuccess?: (userId: string, email: string) => void;
}
```

**State**:
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState<string>('');
const [loading, setLoading] = useState(false);
```

**Validation**:
- Email: Required, must contain '@'
- Password: Required, minimum 8 characters
- Confirm Password: Must match password

**Flow**:
1. User enters email and password
2. Client-side validation
3. Call `authService.register({ email, password })`
4. On success: call `onSuccess(userId, email)`
5. RegisterPage triggers onboarding chatbot

**Changes from Previous Version**:
- Removed: full_name, role, forest_preference, phone, organization, location
- Simplified: Only email/password collection
- Updated: onSuccess callback now provides userId and email
- Deferred: Profile completion to onboarding chatbot

#### 2. RegisterPage (Enhanced)

**Location**: `src/pages/RegisterPage.tsx`

**Purpose**: Manages registration and onboarding flow

**State**:
```typescript
const [onboardingState, setOnboardingState] = useState<{
  isActive: boolean;
  userId: string | null;
  userEmail: string | null;
}>({
  isActive: false,
  userId: null,
  userEmail: null,
});
```

**Handlers**:
```typescript
const handleRegisterSuccess = (userId: string, email: string) => {
  setOnboardingState({
    isActive: true,
    userId,
    userEmail: email,
  });
};

const handleOnboardingComplete = () => {
  setOnboardingState({
    isActive: false,
    userId: null,
    userEmail: null,
  });
  navigate('/dashboard');
};
```

**UI States**:
- **Initial**: Shows RegisterForm
- **Onboarding Active**: Shows chatbot placeholder (Task 8.1)
- **Complete**: Redirects to dashboard

#### 3. LoginForm

**Location**: `src/components/auth/LoginForm.tsx`

**Purpose**: User authentication with email/password

**Props**:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}
```

**Features**:
- Email/password validation
- Error handling
- Loading states
- Forgot password link

**No changes** - login flow remains unchanged

#### 4. AuthContext

**Location**: `src/contexts/AuthContext.tsx`

**Purpose**: Global authentication state management

**Context Value**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}
```

**Features**:
- Session persistence
- Real-time auth state updates
- Automatic user refresh
- Supabase auth subscription

#### 5. useAuth Hook

**Location**: `src/hooks/useAuth.ts`

**Purpose**: Comprehensive authentication operations

**Return Value**:
```typescript
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isOrganization: () => boolean;
  refreshUser: () => Promise<void>;
}
```

### Auth Service

**Location**: `src/services/auth.service.ts`

**Methods**:

```typescript
class AuthService {
  // Registration (simplified)
  async register(data: { email: string; password: string }): Promise<{
    user: User | null;
    error: Error | null;
  }>;

  // Login
  async login(credentials: LoginCredentials): Promise<{
    user: User | null;
    error: Error | null;
  }>;

  // Logout
  async logout(): Promise<{ error: Error | null }>;

  // Get current user
  async getCurrentUser(): Promise<User | null>;

  // Password reset
  async requestPasswordReset(email: string): Promise<{ error: Error | null }>;
  async updatePassword(newPassword: string): Promise<{ error: Error | null }>;

  // Role checking
  hasRole(user: User | null, role: UserRole): boolean;
  hasAnyRole(user: User | null, roles: UserRole[]): boolean;
  isAdmin(user: User | null): boolean;
  isOrganization(user: User | null): boolean;

  // Auth state subscription
  onAuthStateChange(callback: (user: User | null) => void): {
    data: { subscription: { unsubscribe: () => void } };
  };
}
```

**Updated Register Method**:
```typescript
async register(data: { email: string; password: string }) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) return { user: null, error: authError };

  // 2. User record created automatically by Supabase
  // 3. Profile completion deferred to onboarding chatbot
  
  return { user: authData.user, error: null };
}
```

### Security Features

1. **Password Requirements**:
   - Minimum 8 characters
   - Confirmation required
   - Encrypted by Supabase Auth

2. **Session Management**:
   - JWT tokens
   - Automatic refresh
   - Secure HTTP-only cookies

3. **Row Level Security**:
   - Users can only access their own data
   - Role-based access control
   - Database-level enforcement

4. **Input Validation**:
   - Client-side validation
   - Server-side validation (Supabase)
   - XSS prevention

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete (with onboarding integration)

### Profile Service

**Location**: `src/services/profile.service.ts`

**Methods**:

```typescript
class ProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<{
    profile: UserProfile | null;
    error: Error | null;
  }>;

  // Create profile (called by onboarding chatbot)
  async createProfile(userId: string, data: ProfileData): Promise<{
    profile: UserProfile | null;
    error: Error | null;
  }>;

  // Update profile
  async updateProfile(userId: string, data: Partial<ProfileData>): Promise<{
    profile: UserProfile | null;
    error: Error | null;
  }>;

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<{
    url: string | null;
    error: Error | null;
  }>;
}
```

**Profile Data Structure**:
```typescript
interface ProfileData {
  full_name: string;
  role: 'individual' | 'community' | 'organization' | 'admin';
  forest_preference?: 'kakamega' | 'karura' | 'mau';
  organization?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
}
```

### Onboarding Integration (Task 8.1)

**Flow**:
1. User registers with email/password
2. RegisterPage activates onboarding state
3. Onboarding chatbot collects profile data:
   - Full name (required)
   - Role selection (required)
   - Organization name (if role = organization)
   - Forest preference (optional)
   - Phone and location (optional)
4. Chatbot calls `profileService.createProfile()`
5. User redirected to dashboard

**Chatbot Questions** (planned):
```
Bot: "Welcome! Let's complete your profile. What's your full name?"
User: "John Doe"

Bot: "Great! How would you like to participate?"
Options: Individual, Community Member, Organization

Bot: "Which forest would you like to focus on?"
Options: Kakamega, Karura, Mau, No preference

[If organization selected]
Bot: "What's your organization name?"
User: "Green Earth NGO"

Bot: "Perfect! Your profile is complete. Let's get started!"
```

### Profile Components

#### 1. UserProfile (Display)

**Location**: `src/components/profile/UserProfile.tsx`

**Purpose**: Display user profile information

**Features**:
- Avatar display
- Profile fields
- Edit button
- Loading states

#### 2. ProfileEditForm

**Location**: `src/components/profile/ProfileEditForm.tsx`

**Purpose**: Edit existing profile

**Features**:
- All profile fields editable
- Avatar upload
- Validation
- Save/cancel actions

---

## Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'organization', 'community', 'individual')),
  forest_preference TEXT CHECK (forest_preference IN ('kakamega', 'karura', 'mau')),
  phone TEXT,
  organization TEXT,
  location TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security

**user_profiles policies**:
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Storage Buckets

1. **avatars** (Public, 2MB limit)
   - User profile pictures
   - Allowed: image/jpeg, image/png, image/webp

2. **tree-images** (Public, 10MB limit)
   - Tree monitoring photos
   - Allowed: image/jpeg, image/png, image/webp

3. **documents** (Private, 20MB limit)
   - Certificates, reports
   - Allowed: application/pdf, image/*

4. **nft-badges** (Public, 5MB limit)
   - NFT badge artwork
   - Allowed: image/jpeg, image/png, image/svg+xml

---

## API Services

### Supabase Client

**Location**: `src/services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Service Pattern

All services follow this pattern:

```typescript
class ServiceName {
  // Methods return { data, error } pattern
  async method(): Promise<{ data: Type | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*');
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const serviceName = new ServiceName();
```

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx (simplified)
│   │   ├── ProtectedRoute.tsx
│   │   ├── PasswordResetRequest.tsx
│   │   ├── PasswordResetConfirm.tsx
│   │   ├── AuthOptions.tsx
│   │   ├── Web3Login.tsx
│   │   ├── index.ts
│   │   └── README.md
│   ├── profile/           # Profile management
│   │   ├── UserProfile.tsx
│   │   ├── ProfileEditForm.tsx
│   │   ├── index.ts
│   │   └── README.md
│   └── common/            # Shared components (future)
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx (enhanced)
│   ├── ResetPasswordPage.tsx
│   ├── DashboardPage.tsx
│   └── ProfilePage.tsx
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   └── README.md
├── contexts/
│   ├── AuthContext.tsx
│   └── README.md
├── hooks/
│   ├── useAuth.ts
│   └── README.md
└── types/
    └── user.types.ts
```

### Component Patterns

#### 1. Form Components
- Controlled inputs
- Local state management
- Validation before submission
- Error display
- Loading states
- Success callbacks

#### 2. Page Components
- Route-level components
- Compose smaller components
- Handle navigation
- Manage page-level state

#### 3. Service Integration
- Import service singleton
- Call async methods
- Handle { data, error } responses
- Update UI based on results

---

## State Management

### React Context API

**AuthContext**: Global authentication state
- User object
- Loading state
- isAuthenticated flag
- refreshUser method

**Usage**:
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginPrompt />;
  
  return <div>Welcome, {user.profile?.full_name}</div>;
}
```

### Local State

Components use `useState` for:
- Form inputs
- UI state (modals, dropdowns)
- Loading indicators
- Error messages

### Future: Zustand (Optional)

For complex state management beyond auth:
- Initiative filters
- Tree registry state
- Marketplace cart
- Gamification progress

---

## Security

### Authentication Security

1. **Password Storage**: Encrypted by Supabase Auth
2. **Session Tokens**: JWT with automatic refresh
3. **HTTPS Only**: All API calls over HTTPS
4. **CORS**: Configured in Supabase dashboard

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only access their own data
- Public data (initiatives, trees) readable by all
- Write operations restricted by role

### Input Validation

1. **Client-Side**: React form validation
2. **Server-Side**: Supabase database constraints
3. **Sanitization**: Prevent XSS attacks

### API Keys

Environment variables (never committed):
```
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A5qSpuvL1M7QhqkB2bkqUQ_QmE9dpra
```

---

## Testing

### Test Framework

- **Unit Tests**: Vitest
- **Component Tests**: Testing Library
- **E2E Tests**: Playwright (future)

### Test Coverage

**Current**: ~60% (target: 80%)

**Tested**:
- ✅ Auth service (90% coverage)
- ✅ LoginForm (85% coverage)
- ✅ RegisterForm (85% coverage)
- ✅ Profile service (80% coverage)

**Pending**:
- ⏳ Onboarding chatbot
- ⏳ Profile components
- ⏳ Integration tests

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Examples

**Service Test**:
```typescript
describe('AuthService', () => {
  it('should register user with email/password', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(result.error).toBeNull();
    expect(result.user).toBeDefined();
  });
});
```

**Component Test**:
```typescript
describe('RegisterForm', () => {
  it('should call onSuccess with userId and email', async () => {
    const onSuccess = vi.fn();
    render(<RegisterForm onSuccess={onSuccess} />);
    
    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.any(String), // userId
        'test@example.com'  // email
      );
    });
  });
});
```

---

## Deployment

### Development

```bash
npm install
npm run dev
# Open http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

### Environment Variables

**Required**:
```
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A5qSpuvL1M7QhqkB2bkqUQ_QmE9dpra
```

**Optional** (future):
```
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=<secret>
VITE_MAPBOX_TOKEN=<secret>
```

### Hosting

**Recommended**: Vercel
- Automatic deployments from Git
- Environment variable management
- HTTPS by default
- Global CDN

**Alternative**: Netlify, AWS Amplify

---

## Performance

### Metrics

- Initial load: < 3 seconds
- API response: < 500ms
- Test execution: < 5 seconds

### Optimization

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Caching**: Service worker (future)
4. **Bundle Size**: Tree shaking, minification

---

## Future Enhancements

### Planned Features

1. **Onboarding Chatbot** (Task 8.1) - In Progress
2. **Initiative Management** (Task 5)
3. **Tree Registry** (Task 6)
4. **Carbon Marketplace** (Task 9)
5. **Web3 Integration** (Task 10-11)
6. **Gamification** (Task 13-15)

### Technical Debt

- Add E2E tests with Playwright
- Implement error boundary components
- Add analytics tracking
- Optimize bundle size
- Add service worker for offline support

---

## Troubleshooting

### Common Issues

**Issue**: "Supabase client not initialized"
**Solution**: Check environment variables are set

**Issue**: "RLS policy violation"
**Solution**: Ensure user is authenticated and accessing own data

**Issue**: "Tests failing"
**Solution**: Run `npm install` and check mock setup

### Debug Mode

```typescript
// Enable Supabase debug logging
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Testing Library**: https://testing-library.com

---

**Document Version**: 2.1  
**Last Updated**: November 14, 2025  
**Next Update**: Upon completion of Task 8.1 (Onboarding Chatbot)
