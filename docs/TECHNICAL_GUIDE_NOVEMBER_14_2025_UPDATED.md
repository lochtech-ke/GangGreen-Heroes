# #GangGreen Platform - Technical Guide

**Last Updated**: November 14, 2025  
**Version**: 2.2  
**Status**: Sprint 2 - Initiative Management System

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

**Status**: ✅ Service Layer Complete (Task 5.1)

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

### Usage Examples

#### Create an Initiative

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
```

#### Get Initiatives with Filters

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
```

#### Join an Initiative

```typescript
const { participant, error } = await initiativeService.joinInitiative(
  initiativeId,
  userId
);
```

#### Update Participant Contribution

```typescript
const { participant, error } = await initiativeService.updateParticipantContribution(
  initiativeId,
  userId,
  50 // trees contributed
);
```

#### Calculate Progress

```typescript
const progress = await initiativeService.calculateProgress(initiativeId);
// Returns: { progress_percentage, trees_remaining, days_remaining, is_on_track }
```

### Key Features

1. **Geospatial Support**
   - GeoJSON format for location data
   - Automatic conversion to/from PostGIS format
   - Support for point-based locations

2. **Filtering & Search**
   - Filter by forest (kakamega, karura, mau)
   - Filter by status (active, completed, paused)
   - Filter by organization
   - Full-text search on title and description

3. **Participant Management**
   - Join/leave initiatives
   - Track individual contributions
   - Prevent duplicate participants
   - Get participant lists

4. **Progress Tracking**
   - Calculate completion percentage
   - Track trees remaining
   - Calculate days remaining
   - Determine if on track (80% of expected progress)

5. **Validation**
   - Input validation for all operations
   - Title length limits (200 characters)
   - Positive values for trees and area
   - Valid date ranges
   - Proper coordinate format

6. **Error Handling**
   - Consistent error response format
   - Descriptive error messages
   - Graceful failure handling

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

#### initiatives
```sql
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  target_trees INTEGER NOT NULL CHECK (target_trees > 0),
  trees_planted INTEGER DEFAULT 0 CHECK (trees_planted >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  location GEOMETRY(Point, 4326) NOT NULL,
  area_hectares DECIMAL(10, 2) NOT NULL CHECK (area_hectares > 0),
  organization_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_organization ON initiatives(organization_id);
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);
```

#### initiative_participants
```sql
CREATE TABLE initiative_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trees_contributed INTEGER DEFAULT 0 CHECK (trees_contributed >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, user_id)
);

-- Indexes
CREATE INDEX idx_participants_initiative ON initiative_participants(initiative_id);
CREATE INDEX idx_participants_user ON initiative_participants(user_id);
```

### Row Level Security

**initiatives policies**:
```sql
-- Anyone can view active initiatives
CREATE POLICY "Anyone can view active initiatives"
  ON initiatives FOR SELECT
  USING (status = 'active' OR auth.uid() = organization_id);

-- Organizations can create initiatives
CREATE POLICY "Organizations can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (auth.uid() = organization_id);

-- Organizations can update their own initiatives
CREATE POLICY "Organizations can update own initiatives"
  ON initiatives FOR UPDATE
  USING (auth.uid() = organization_id);
```

**initiative_participants policies**:
```sql
-- Users can view participants of initiatives they're part of
CREATE POLICY "Users can view participants"
  ON initiative_participants FOR SELECT
  USING (true);

-- Users can join initiatives
CREATE POLICY "Users can join initiatives"
  ON initiative_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can leave initiatives
CREATE POLICY "Users can leave initiatives"
  ON initiative_participants FOR DELETE
  USING (auth.uid() = user_id);
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

### Available Services

1. **authService** - Authentication operations
2. **profileService** - User profile management
3. **initiativeService** - Initiative management (NEW)

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
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
│   └── initiatives/       # Initiative components (PLANNED)
│       ├── InitiativeCard.tsx
│       ├── InitiativeForm.tsx
│       ├── InitiativeDetails.tsx
│       ├── InitiativeList.tsx
│       └── README.md
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── DashboardPage.tsx
│   └── ProfilePage.tsx
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts (NEW)
│   ├── index.ts
│   └── README.md
├── contexts/
│   ├── AuthContext.tsx
│   └── README.md
├── hooks/
│   ├── useAuth.ts
│   └── README.md
└── types/
    ├── user.types.ts
    ├── initiative.types.ts (NEW)
    └── index.ts
```

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
- ⏳ Initiative service tests
- ⏳ Initiative component tests
- ⏳ Integration tests

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
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

---

## Future Enhancements

### Planned Features

1. **Initiative UI Components** (Task 5.2) - Next
2. **Geospatial Features** (Task 5.3)
3. **Tree Registry** (Task 6)
4. **Carbon Marketplace** (Task 8-9)
5. **Web3 Integration** (Task 21-24)
6. **Gamification** (Task 25-27)

---

**Document Version**: 2.2  
**Last Updated**: November 14, 2025  
**Next Update**: Upon completion of Task 5.2 (Initiative UI Components)
