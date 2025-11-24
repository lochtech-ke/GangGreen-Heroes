# #GangGreen Platform - Technical Guide

**Last Updated**: November 14, 2025  
**Version**: 3.0  
**Status**: Sprint 2 Complete - Initiative Management System Fully Operational

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Database Schema](#database-schema)
7. [API Services](#api-services)
8. [Component Architecture](#component-architecture)
9. [State Management](#state-management)
10. [Security](#security)
11. [Testing](#testing)
12. [Deployment](#deployment)

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
│  │  Auth │ Profile │ Initiative │ Tree │ Marketplace   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 20 tables       │  │  - JWT tokens      │           │
│  │  - PostGIS         │  │  - Session mgmt    │           │
│  │  - RLS policies    │  │                    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐                                    │
│  │  Storage Buckets   │                                    │
│  │  - Tree images     │                                    │
│  │  - Avatars         │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow

```
User Action
   ↓
React Component (UI)
   ↓
Service Layer (Business Logic)
   ↓
Supabase Client (API)
   ↓
PostgreSQL Database
   ↓
Response
   ↓
Component State Update
   ↓
UI Re-render
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

**Status**: ✅ Complete

### Architecture

```
User Registration Flow:

1. RegisterForm (email/password)
   ↓
2. Supabase Auth (create account)
   ↓
3. Profile Completion (ProfileEditForm)
   ↓
4. Dashboard (authenticated user)
```

### Components

#### 1. RegisterForm

**Location**: `src/components/auth/RegisterForm.tsx`

**Purpose**: Simplified registration form collecting email and password

**Props**:
```typescript
interface RegisterFormProps {
  onSuccess?: (userId: string, email: string) => void;
}
```

**Validation**:
- Email: Required, must contain '@'
- Password: Required, minimum 8 characters
- Confirm Password: Must match password

#### 2. LoginForm

**Location**: `src/components/auth/LoginForm.tsx`

**Purpose**: User authentication with email/password

**Props**:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}
```

#### 3. AuthContext

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

#### 4. useAuth Hook

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
  // Registration
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

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

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

  // Create profile
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

---

## Initiative Management System

### Overview

The initiative management system enables organizations to create and manage tree planting initiatives with geospatial tracking, participant management, and progress monitoring.

**Status**: ✅ Complete (Service Layer + UI Components)

### Type Definitions

**Location**: `src/types/initiative.types.ts`

**Core Types**:

```typescript
// Initiative status
export type InitiativeStatus = 'active' | 'completed' | 'paused';

// Geospatial point (GeoJSON format)
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Main initiative interface
export interface Initiative {
  id: string;
  title: string;
  description: string;
  forest: ForestPreference; // 'kakamega' | 'karura' | 'mau'
  target_trees: number;
  trees_planted: number;
  start_date: string;
  end_date?: string;
  status: InitiativeStatus;
  location: GeoPoint;
  area_hectares: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Participant tracking
export interface InitiativeParticipant {
  id: string;
  initiative_id: string;
  user_id: string;
  trees_contributed: number;
  joined_at: string;
}

// Progress tracking
export interface InitiativeProgress {
  initiative_id: string;
  progress_percentage: number;
  trees_remaining: number;
  days_remaining?: number;
  is_on_track: boolean;
}
```

**Request/Response Types**:

```typescript
// Create initiative data
export interface CreateInitiativeData {
  title: string;
  description: string;
  forest: ForestPreference;
  target_trees: number;
  start_date: string;
  end_date?: string;
  location: GeoPoint;
  area_hectares: number;
  organization_id: string;
}

// Update initiative data
export interface UpdateInitiativeData {
  title?: string;
  description?: string;
  target_trees?: number;
  end_date?: string;
  status?: InitiativeStatus;
  area_hectares?: number;
}

// Filter options
export interface InitiativeFilters {
  forest?: ForestPreference;
  status?: InitiativeStatus;
  organization_id?: string;
  search?: string;
}

// Response types
export interface InitiativeResponse {
  initiative: Initiative | null;
  error: Error | null;
}

export interface InitiativesResponse {
  initiatives: Initiative[];
  error: Error | null;
}

export interface ParticipantResponse {
  participant: InitiativeParticipant | null;
  error: Error | null;
}
```

### Initiative Service

**Location**: `src/services/initiative.service.ts`

**Methods**:

```typescript
class InitiativeService {
  // Create a new initiative
  async createInitiative(data: CreateInitiativeData): Promise<InitiativeResponse>;

  // Get initiative by ID
  async getInitiative(initiativeId: string): Promise<InitiativeResponse>;

  // Get all initiatives with optional filtering
  async getInitiatives(filters?: InitiativeFilters): Promise<InitiativesResponse>;

  // Get initiatives by forest
  async getInitiativesByForest(forest: string): Promise<InitiativesResponse>;

  // Update initiative
  async updateInitiative(
    initiativeId: string,
    updates: UpdateInitiativeData
  ): Promise<InitiativeResponse>;

  // Delete initiative
  async deleteInitiative(initiativeId: string): Promise<{ error: Error | null }>;

  // Add participant to initiative
  async joinInitiative(
    initiativeId: string,
    userId: string
  ): Promise<ParticipantResponse>;

  // Remove participant from initiative
  async leaveInitiative(
    initiativeId: string,
    userId: string
  ): Promise<{ error: Error | null }>;

  // Get participants for an initiative
  async getParticipants(initiativeId: string): Promise<{
    participants: InitiativeParticipant[];
    error: Error | null;
  }>;

  // Update participant contribution
  async updateParticipantContribution(
    initiativeId: string,
    userId: string,
    treesContributed: number
  ): Promise<ParticipantResponse>;

  // Calculate initiative progress
  async calculateProgress(initiativeId: string): Promise<InitiativeProgress | null>;

  // Get initiative with participants count
  async getInitiativeWithParticipants(
    initiativeId: string
  ): Promise<{ initiative: InitiativeWithParticipants | null; error: Error | null }>;
}
```

### Initiative Components

**Location**: `src/components/initiatives/`

#### 1. InitiativeCard

**File**: `InitiativeCard.tsx` (150 lines)

**Purpose**: Display initiative summary in card format

**Props**:
```typescript
interface InitiativeCardProps {
  initiative: Initiative;
  onClick?: () => void;
}
```

**Features**:
- Initiative title and description
- Progress bar with percentage
- Status badge (active/completed/paused)
- Forest badge
- Tree counts (planted/target)
- Area and timeline information
- Hover effects and click handling

**Usage**:
```typescript
<InitiativeCard
  initiative={initiative}
  onClick={() => navigate(`/initiatives/${initiative.id}`)}
/>
```

#### 2. InitiativeForm

**File**: `InitiativeForm.tsx` (280 lines)

**Purpose**: Form for creating new initiatives

**Props**:
```typescript
interface InitiativeFormProps {
  organizationId: string;
  onSuccess?: (initiative: Initiative) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateInitiativeData>;
}
```

**Features**:
- Title and description inputs
- Forest selector dropdown
- Target trees and area inputs
- Date range picker
- Locupabase Client

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
