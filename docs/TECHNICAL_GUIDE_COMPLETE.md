# #GangGreen Platform - Technical Guide

**Version**: 1.4  
**Last Updated**: November 13, 2025  
**Status**: Sprint 2 - 50% Complete

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [Database Schema](#database-schema)
6. [API Services](#api-services)
7. [Testing Infrastructure](#testing-infrastructure)
8. [Deployment](#deployment)
9. [Development Workflow](#development-workflow)
10. [Security](#security)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │   Admin      │     │
│  │   (React)    │  │  (Responsive)│  │   Dashboard  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Context API (Global State Management)         │  │
│  │  - AuthContext, ForestContext, Web3Context           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic Services                              │  │
│  │  - auth.service, initiative.service, tree.service    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Supabase Backend       │    │   Antugrow API           │
│  ┌────────────────────┐  │    │  ┌────────────────────┐ │
│  │  PostgreSQL DB     │  │    │  │  Tree Monitoring   │ │
│  │  - 20 tables       │  │    │  │  - Growth Tracking │ │
│  │  - RLS policies    │  │    │  │  - AI Analysis     │ │
│  │  - Indexes         │  │    │  │  - Health Status   │ │
│  └────────────────────┘  │    │  └────────────────────┘ │
│  ┌────────────────────┐  │    └──────────────────────────┘
│  │  Auth Service      │  │
│  │  - JWT Tokens      │  │
│  │  - Row Level Sec   │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Storage Buckets   │  │
│  │  - Tree Images     │  │
│  │  - Documents       │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Component Architecture

```
src/
├── components/          # React UI components
│   ├── auth/           # ✅ Authentication (COMPLETE)
│   ├── dashboard/      # 📋 Dashboard (PLANNED)
│   ├── initiatives/    # 📋 Initiatives (PLANNED)
│   ├── trees/          # 📋 Trees (PLANNED)
│   └── common/         # 📋 Shared UI (PLANNED)
├── services/           # Business logic
│   ├── supabase.ts    # ✅ Supabase client
│   ├── auth.service.ts # ✅ Auth operations
│   └── *.service.ts   # 📋 Other services
├── contexts/           # Global state
│   └── AuthContext.tsx # ✅ Auth state
├── hooks/              # Custom hooks
│   └── useAuth.ts     # ✅ Auth hook
├── types/              # TypeScript types
│   └── user.types.ts  # ✅ User types
└── test/               # Test infrastructure
    ├── setup.ts       # ✅ Test config
    └── README.md      # ✅ Test guide
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8 (fast development, optimized builds)
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router 6.21.0
- **State Management**: React Context API

### Backend (Supabase)
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage for images/documents
- **Real-time**: Supabase real-time subscriptions

### Testing
- **Framework**: Vitest 4.0.8
- **Component Testing**: Testing Library React 16.3.0
- **DOM Testing**: Testing Library DOM 10.4.1
- **Matchers**: Testing Library jest-dom 6.9.1
- **User Events**: Testing Library user-event 14.6.1
- **Environment**: jsdom 27.2.0

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

### External Integrations
- **Antugrow API**: AI-powered tree monitoring (planned)
- **Mapbox/Leaflet**: Geospatial visualization (planned)

---

## Project Structure

### Directory Organization

```
ganggreen-platform/
├── .kiro/                      # Kiro configuration
│   ├── specs/                  # Project specifications
│   └── steering/               # Development rules
├── src/                        # Source code
│   ├── components/             # React components
│   │   └── auth/              # ✅ Auth components (5 files)
│   ├── pages/                  # Page components
│   │   ├── LoginPage.tsx      # ✅ Login page
│   │   ├── RegisterPage.tsx   # ✅ Register page
│   │   ├── ResetPasswordPage.tsx # ✅ Reset page
│   │   └── DashboardPage.tsx  # ✅ Dashboard
│   ├── services/              # Business logic
│   │   ├── supabase.ts        # ✅ Supabase client
│   │   ├── auth.service.ts    # ✅ Auth service
│   │   └── profile.service.ts # ✅ Profile service
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # ✅ Auth context
│   ├── hooks/                 # Custom hooks
│   │   └── useAuth.ts         # ✅ Auth hook
│   ├── types/                 # TypeScript types
│   │   └── user.types.ts      # ✅ User types
│   ├── utils/                 # Utilities
│   │   ├── constants.ts       # ✅ Constants
│   │   └── helpers.ts         # ✅ Helper functions
│   ├── test/                  # Test infrastructure
│   │   ├── setup.ts           # ✅ Test setup
│   │   └── README.md          # ✅ Test guide
│   ├── App.tsx                # ✅ Root component
│   ├── main.tsx               # ✅ Entry point
│   └── index.css              # ✅ Global styles
├── supabase/                   # Database
│   ├── migrations/            # ✅ SQL migrations (9 files)
│   └── storage/               # ✅ Storage config
├── docs/                       # Documentation
│   ├── TECHNICAL_GUIDE.md     # This file
│   ├── USER_GUIDE.md          # User documentation
│   └── PROJECT_STATUS.md      # Project status
├── tests/                      # Test files
│   ├── src/services/          # ✅ Service tests
│   └── src/components/auth/   # ✅ Component tests
├── package.json               # ✅ Dependencies
├── vite.config.ts             # ✅ Vite config
├── vitest.config.ts           # ✅ Vitest config
├── tailwind.config.js         # ✅ Tailwind config
└── tsconfig.json              # ✅ TypeScript config
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `LoginForm.tsx`)
- **Services**: camelCase with `.service.ts` suffix
- **Hooks**: camelCase with `use` prefix
- **Types**: PascalCase with `.types.ts` suffix
- **Tests**: Same name with `.test.ts` or `.test.tsx` suffix

---

## Authentication System

### Overview

The authentication system is **90% complete** with comprehensive test coverage. It provides secure user registration, login, password reset, and role-based access control.

### Architecture

```
User Interface (Pages/Components)
        ↓
useAuth Hook (Convenience Layer)
        ↓
AuthContext (Global State)
        ↓
auth.service (Business Logic)
        ↓
Supabase Auth (Backend)
```


### Components

#### 1. AuthContext Provider

**File**: `src/contexts/AuthContext.tsx`

**Purpose**: Provides global authentication state throughout the application.

**Interface**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}
```

**Features**:
- Loads user on mount from Supabase session
- Subscribes to real-time auth state changes
- Automatic session persistence
- Graceful error handling

**Usage**:
```typescript
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app */}
    </AuthProvider>
  );
}
```

#### 2. useAuth Hook

**File**: `src/hooks/useAuth.ts`

**Purpose**: Provides convenient access to auth state and operations.

**Interface**:
```typescript
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{success: boolean; error?: string}>;
  register: (data: RegisterData) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{success: boolean; error?: string}>;
  updatePassword: (newPassword: string) => Promise<{success: boolean; error?: string}>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isOrganization: () => boolean;
  refreshUser: () => Promise<void>;
}
```

**Features**:
- 13 methods and properties
- Consistent error handling
- Automatic loading states
- Role-based access helpers
- Automatic navigation on logout

**Usage**:
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, loading, login, logout, isAdmin } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>Welcome, {user?.profile?.full_name}</h1>
      {isAdmin() && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 3. auth.service

**File**: `src/services/auth.service.ts`

**Purpose**: Encapsulates all authentication business logic.

**Methods**:
```typescript
class AuthService {
  // User registration
  register(data: RegisterData): Promise<{user: User | null; error: Error | null}>;
  
  // User login
  login(credentials: LoginCredentials): Promise<{user: User | null; error: Error | null}>;
  
  // User logout
  logout(): Promise<{error: Error | null}>;
  
  // Get current user
  getCurrentUser(): Promise<User | null>;
  
  // Password reset request
  requestPasswordReset(email: string): Promise<{error: Error | null}>;
  
  // Update password
  updatePassword(newPassword: string): Promise<{error: Error | null}>;
  
  // Auth state subscription
  onAuthStateChange(callback: (user: User | null) => void): {data: {subscription: any}};
  
  // Role checking
  hasRole(user: User | null, role: UserRole): boolean;
  hasAnyRole(user: User | null, roles: UserRole[]): boolean;
  isAdmin(user: User | null): boolean;
  isOrganization(user: User | null): boolean;
}
```

**Features**:
- Wraps Supabase Auth API
- Creates user profiles automatically
- Fetches complete user data with profile
- Consistent error handling
- Role-based access control helpers

#### 4. UI Components

**LoginForm** (`src/components/auth/LoginForm.tsx`):
- Email and password inputs
- Client-side validation
- Error display
- Loading states
- Forgot password link

**RegisterForm** (`src/components/auth/RegisterForm.tsx`):
- Full registration form
- Role selection (individual, community, organization)
- Forest preference dropdown
- Conditional organization field
- Password confirmation
- Two-column responsive layout

**ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`):
- Route guard for authenticated pages
- Role-based access control
- Loading state
- Access denied page
- Automatic redirect

**PasswordResetRequest** (`src/components/auth/PasswordResetRequest.tsx`):
- Email input
- Reset email sending
- Success confirmation
- Auto-redirect

**PasswordResetConfirm** (`src/components/auth/PasswordResetConfirm.tsx`):
- New password input
- Password confirmation
- Strength validation
- Success confirmation

### User Types

**File**: `src/types/user.types.ts`

```typescript
export type UserRole = 'admin' | 'organization' | 'community' | 'individual';
export type ForestPreference = 'kakamega' | 'karura' | 'mau';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  organization?: string;
  location?: string;
  avatar_url?: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  phone?: string;
  organization?: string;
  location?: string;
}
```

### Authentication Flow

#### Registration Flow
1. User fills RegisterForm
2. Form validates inputs (email, password, required fields)
3. authService.register() called
4. Supabase Auth creates user account
5. User record created in `users` table
6. User profile created in `user_profiles` table
7. User automatically logged in
8. AuthContext updates with new user
9. Redirect to dashboard

#### Login Flow
1. User enters credentials in LoginForm
2. Form validates inputs
3. authService.login() called
4. Supabase Auth authenticates user
5. User data fetched from database with profile
6. Session established
7. AuthContext updates with user
8. Redirect to dashboard

#### Password Reset Flow
1. User requests reset via PasswordResetRequest
2. authService.requestPasswordReset() called
3. Supabase sends reset email with secure link
4. User clicks link, lands on ResetPasswordPage
5. User enters new password in PasswordResetConfirm
6. authService.updatePassword() called
7. Password updated in Supabase
8. Success confirmation shown
9. Redirect to login

### Session Management

**Persistence**:
- Sessions stored in browser localStorage
- Automatic restoration on page refresh
- Token refresh handled by Supabase

**Real-time Updates**:
- AuthContext subscribes to auth state changes
- Automatic user state updates on login/logout
- Token refresh events handled automatically

**Security**:
- JWT tokens with expiration
- Secure HTTP-only cookies (Supabase)
- Row Level Security on database
- Password hashing (bcrypt via Supabase)

---

## Database Schema

### Overview

The database consists of **20 tables** with comprehensive indexes and Row Level Security policies.

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'organization', 'community', 'individual')),
  forest_preference TEXT CHECK (forest_preference IN ('kakamega', 'karura', 'mau')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Core user accounts linked to Supabase Auth.

**Indexes**:
- Primary key on `id`
- Unique index on `email`
- Index on `role`

**RLS Policies**:
- Users can read their own record
- Only admins can read all users

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  location TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Extended user profile information.

**Indexes**:
- Primary key on `id` (foreign key to users)

**RLS Policies**:
- Users can read their own profile
- Users can update their own profile
- Admins can read all profiles

#### initiatives
```sql
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  target_trees INTEGER NOT NULL,
  trees_planted INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  area_hectares DECIMAL(10, 2),
  organization_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Tree planting initiatives.

**Indexes**:
- Primary key on `id`
- Index on `forest`
- Index on `status`
- Index on `organization_id`
- GIST index on `location` (geospatial)

**RLS Policies**:
- Anyone can view active initiatives
- Organizations can create initiatives
- Organizations can update their own initiatives

#### trees
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  planted_by UUID REFERENCES users(id),
  antugrow_id TEXT UNIQUE,
  current_height_cm DECIMAL(10, 2),
  current_diameter_cm DECIMAL(10, 2),
  health_status TEXT CHECK (health_status IN ('healthy', 'stressed', 'diseased', 'dead')),
  last_monitored TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Individual tree registry.

**Indexes**:
- Primary key on `id`
- Index on `initiative_id`
- Index on `planted_by`
- Unique index on `antugrow_id`
- GIST index on `location`

**RLS Policies**:
- Anyone can view trees
- Authenticated users can register trees
- Users can update trees they planted

### Additional Tables

- **initiative_participants**: Links users to initiatives
- **tree_images**: Stores tree photos with AI analysis
- **carbon_credits**: Carbon credit marketplace
- **transactions**: Purchase history
- **notifications**: User notifications
- **web3_wallets**: Cryptocurrency wallet addresses
- **crypto_donations**: Blockchain donation tracking
- **nft_badges**: NFT achievement badges
- **badge_criteria**: Badge earning requirements
- **user_gamification**: Points, levels, streaks
- **gamified_actions**: Action tracking for points
- **achievements**: Achievement definitions
- **user_achievements**: Unlocked achievements
- **challenge_quests**: Time-limited challenges
- **quest_participants**: Quest participation
- **referrals**: Referral tracking

### Database Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "postgis";     -- Geospatial data
```

### Indexes

**Total**: 80+ indexes for query optimization

**Types**:
- B-tree indexes on foreign keys
- Unique indexes on email, antugrow_id
- Partial indexes on status fields
- GIST indexes on geography columns
- Composite indexes on frequently queried combinations

### Triggers

**updated_at Trigger**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to all tables with updated_at column
```

---

## API Services

### Supabase Client

**File**: `src/services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Configuration**:
- URL: `https://wobpryllvdjaapzjbsxx.supabase.co`
- Anon Key: `sb_publishable_A5qSpuvL1M7QhqkB2bkqUQ_QmE9dpra`

**Features**:
- Automatic JWT token management
- Real-time subscriptions
- Row Level Security enforcement
- File upload/download

### Service Pattern

All services follow a consistent pattern:

```typescript
class ExampleService {
  // CRUD operations
  async create(data: CreateData): Promise<{data: Entity | null; error: Error | null}> {
    // Implementation
  }
  
  async read(id: string): Promise<{data: Entity | null; error: Error | null}> {
    // Implementation
  }
  
  async update(id: string, data: UpdateData): Promise<{data: Entity | null; error: Error | null}> {
    // Implementation
  }
  
  async delete(id: string): Promise<{error: Error | null}> {
    // Implementation
  }
  
  // Additional methods
  async list(filters?: Filters): Promise<{data: Entity[]; error: Error | null}> {
    // Implementation
  }
}

export const exampleService = new ExampleService();
```

**Benefits**:
- Consistent error handling
- Type-safe operations
- Testable business logic
- Separation of concerns

### Implemented Services

1. **auth.service.ts** ✅
   - User registration
   - User login/logout
   - Password reset
   - Role checking

2. **profile.service.ts** ✅
   - Profile CRUD operations
   - Avatar upload
   - Profile validation

### Planned Services

3. **initiative.service.ts** 📋
   - Initiative CRUD
   - Participant management
   - Progress tracking

4. **tree.service.ts** 📋
   - Tree registry
   - Image upload
   - Growth tracking

5. **antugrow.service.ts** 📋
   - AI analysis integration
   - Health monitoring
   - Growth predictions

6. **web3.service.ts** 📋
   - Wallet connection
   - Crypto donations
   - NFT minting

---

## Testing Infrastructure

### Overview

The testing infrastructure is **complete** with 25+ tests achieving ~60% code coverage (target: 80%).

### Test Framework

**Vitest Configuration** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**Features**:
- Fast execution (< 5 seconds for all tests)
- Watch mode for development
- Coverage reporting
- React component support

### Test Setup

**File**: `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Test Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Test Structure

**Unit Tests**:
- Located next to source files
- Test individual functions/methods
- Mock external dependencies
- Fast execution

**Component Tests**:
- Test React components
- Use Testing Library
- Test user interactions
- Verify rendering

**Integration Tests**:
- Test component + service integration
- Test complete flows
- Use real-like data
- Verify end-to-end behavior

### Test Coverage

**Current Coverage** (~60%):
- Auth Service: ~90%
- LoginForm: ~85%
- RegisterForm: ~85%
- AuthContext: 0% (pending)
- useAuth Hook: 0% (pending)

**Target Coverage**: 80%

### Testing Best Practices

1. **Descriptive Names**: `it('should show validation error for empty fields')`
2. **Arrange-Act-Assert**: Clear test structure
3. **One Assertion**: Focus on single behavior
4. **Mock Dependencies**: Isolate code under test
5. **Test Behavior**: Not implementation details

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { authService } from '../../services/auth.service';

vi.mock('../../services/auth.service');

describe('LoginForm', () => {
  it('should call authService.login with correct credentials', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({ user: { id: '123' } as any, error: null });

    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## Deployment

### Environment Variables

**Required**:
```env
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A5qSpuvL1M7QhqkB2bkqUQ_QmE9dpra
```

**Optional** (for future features):
```env
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=<secret>
VITE_MAPBOX_TOKEN=<secret>
```

### Build Process

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Targets

**Frontend**: Vercel (planned)
- Automatic deployments from Git
- Preview deployments for PRs
- Environment variable management
- CDN distribution

**Backend**: Supabase Cloud (active)
- PostgreSQL database
- Authentication service
- Storage buckets
- Real-time subscriptions

### Database Migration

**Status**: ⏳ Pending execution

**Files**:
- `supabase/migrations/000_all_migrations.sql` - Main schema
- `supabase/migrations/010_rls_policies.sql` - Security policies
- `supabase/storage/buckets.sql` - Storage configuration

**Execution**:
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Execute migration files in order
4. Verify table creation
5. Test RLS policies

---

## Development Workflow

### Getting Started

```bash
# Clone repository
git clone <repository-url>
cd ganggreen-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:5173
```

### Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Quality

**ESLint**:
- TypeScript rules
- React hooks rules
- Import order rules
- Unused variable detection

**Prettier**:
- Consistent formatting
- Auto-fix on save
- 2-space indentation
- Single quotes

**TypeScript**:
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals

### Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Run tests: `npm test`
4. Push branch: `git push origin feature/my-feature`
5. Create pull request
6. Review and merge

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## Security

### Authentication Security

**Password Requirements**:
- Minimum 8 characters
- Hashed with bcrypt (Supabase)
- Stored securely in Supabase Auth

**Session Management**:
- JWT tokens with expiration
- Secure HTTP-only cookies
- Automatic token refresh
- Logout clears all tokens

**Row Level Security**:
- Enabled on all tables
- User-specific data access
- Role-based permissions
- Automatic enforcement

### Input Validation

**Client-Side**:
- Email format validation
- Password strength checking
- Required field validation
- Type checking with TypeScript

**Server-Side**:
- RLS policies enforce access
- Database constraints
- Type validation
- SQL injection prevention (Supabase)

### File Upload Security

**Planned**:
- File type validation
- File size limits (10MB for images)
- Virus scanning (optional)
- Signed URLs for access
- Storage bucket policies

### API Security

**Supabase**:
- Anon key for public access
- Service key for admin operations (not exposed)
- RLS enforces data access
- Rate limiting (Supabase)

**Future**:
- CORS configuration
- Security headers
- Rate limiting
- Request validation

---

## Performance

### Current Metrics

**Build**:
- Build time: ~10 seconds
- Bundle size: ~500KB (gzipped)
- Code splitting: Automatic (Vite)

**Runtime**:
- Initial load: < 2 seconds
- Time to interactive: < 3 seconds
- Test execution: < 5 seconds

### Optimization Strategies

**Code Splitting**:
- Route-based splitting (React Router)
- Lazy loading components
- Dynamic imports

**Caching**:
- Browser caching (service worker planned)
- Supabase query caching
- Image optimization

**Database**:
- 80+ indexes for fast queries
- Geospatial indexes (GIST)
- Partial indexes on status fields

---

## Troubleshooting

### Common Issues

**Build Errors**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

**Test Failures**:
- Clear test cache: `npm test -- --clearCache`
- Check mock implementations
- Verify async operations with `waitFor`

**Database Connection**:
- Verify environment variables
- Check Supabase project status
- Test connection in Supabase Dashboard

**Authentication Issues**:
- Clear browser localStorage
- Check Supabase Auth settings
- Verify RLS policies

---

## Next Steps

### Immediate (Sprint 2)
1. Complete Task 3.4 (Authentication Tests) - 40% remaining
2. Execute database migrations (Task 2.2)
3. Set up storage buckets (Task 2.3)
4. Test authentication end-to-end

### Sprint 3 (Weeks 3-5)
1. Task 4: User Profile Management
2. Task 5: Initiative Management System
3. Task 6: Tree Registry and Monitoring
4. Task 7: Antugrow API Integration

### Future Sprints
1. Carbon Credit Marketplace (Sprint 4)
2. Web3 Integration (Sprint 5)
3. Gamification System (Sprint 6)
4. Testing and Launch (Sprint 7)

---

## Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Vitest Docs](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)

### Project Files
- Technical Guide: `docs/TECHNICAL_GUIDE.md`
- User Guide: `docs/USER_GUIDE.md`
- Project Status: `docs/PROJECT_STATUS.md`
- Test Guide: `src/test/README.md`

### Support
- Email: support@ganggreen.org
- GitHub Issues: [Repository Issues]
- Documentation: `docs/` directory

---

**Document Version**: 1.4  
**Last Updated**: November 13, 2025  
**Status**: Sprint 2 - 50% Complete  
**Next Update**: Upon completion of Sprint 2 or major feature addition
