# #GangGreen Platform - Technical Guide

**Last Updated**: November 17, 2025  
**Version**: 4.0  
**Status**: Sprint 3 Complete - AI-Powered Tree Monitoring Operational

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Tree Registry System](#tree-registry-system)
7. [AI-Powered Monitoring](#ai-powered-monitoring)
8. [Geospatial Features](#geospatial-features)
9. [Database Schema](#database-schema)
10. [API Services](#api-services)
11. [Component Architecture](#component-architecture)
12. [State Management](#state-management)
13. [Security](#security)
14. [Testing](#testing)
15. [Deployment](#deployment)

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
│  │  Auth │ Profile │ Initiative │ Tree │ Antugrow      │  │
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
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services (Antugrow API)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Analysis │ Growth Tracking │ Health Monitoring   │  │
│  └──────────────────────────────────────────────────────┘  │
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
Supabase Client (API) / Antugrow API
   ↓
PostgreSQL Database (PostGIS) / AI Analysis
   ↓
Response
   ↓
Component State Update
   ↓
UI Re-render (with Maps/Charts)
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **Charts**: Recharts (for growth and health visualizations)
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### External Services
- **Antugrow API**: AI-powered tree monitoring, growth tracking, health analysis

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

---

## Authentication System

### Overview

The authentication system provides secure user registration, login, and session management with role-based access control.

**Status**: ✅ Complete (95%)

### Key Features

- Email/password authentication with automatic user record creation
- Email confirmation flow with user-friendly screens
- Web3 wallet authentication (MetaMask, WalletConnect)
- Session persistence with JWT tokens
- Role-based access control (admin, organization, community, individual)
- Protected routes with automatic redirects
- Password reset flow
- Real-time auth state updates

### Registration Flow

```
1. User enters email and password
   ↓
2. RegisterForm validates input
   ↓
3. authService.register() called
   ↓
4. Supabase creates auth user
   ↓
5. Database trigger creates user record automatically
   ↓
6. Email confirmation screen shown (if required)
   ↓
7. User confirms email via link
   ↓
8. User can log in
   ↓
9. Profile completion (optional during registration)
```

### Auth Service

**Location**: `src/services/auth.service.ts`

**Key Methods**:
```typescript
class AuthService {
  // Registration (user record created automatically via database trigger)
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

### useAuth Hook

**Location**: `src/hooks/useAuth.ts`

**Provides**:
- `user` - Current user object
- `loading` - Loading state
- `isAuthenticated` - Boolean auth status
- `login()` - Login method
- `register()` - Register method
- `logout()` - Logout method
- `hasRole()` - Role checking
- `isAdmin()` - Admin check
- `isOrganization()` - Organization check
- `refreshUser()` - Manual refresh

### Components

1. **RegisterForm** - Simplified registration (email/password only)
2. **LoginForm** - Login with validation
3. **Web3Login** - Web3 wallet authentication
4. **AuthOptions** - Authentication method selector
5. **ProtectedRoute** - Route guard component
6. **PasswordResetRequest** - Request password reset
7. **PasswordResetConfirm** - Confirm password reset

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

### Profile Service

**Location**: `src/services/profile.service.ts`

**Key Methods**:
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

### Profile Data Structure

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

**Status**: ✅ Complete

### Type Definitions

**Location**: `src/types/initiative.types.ts`

**Core Types**:

```typescript
// Initiative status
type InitiativeStatus = 'active' | 'completed' | 'paused';

// Geospatial point (GeoJSON format)
interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Main initiative interface
interface Initiative {
  id: string;
  title: string;
  description: string;
  forest: ForestPreference;
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
interface InitiativeParticipant {
  id: string;
  initiative_id: string;
  user_id: string;
  trees_contributed: number;
  joined_at: string;
}

// Progress tracking
interface InitiativeProgress {
  initiative_id: string;
  progress_percentage: number;
  trees_remaining: number;
  days_remaining?: number;
  is_on_track: boolean;
}
```

### Initiative Service

**Location**: `src/services/initiative.service.ts`

**Key Methods**:

```typescript
class InitiativeService {
  // Create a new initiative
  async createInitiative(data: CreateInitiativeData): Promise<InitiativeResponse>;

  // Get initiative by ID
  async getInitiative(initiativeId: string): Promise<InitiativeResponse>;

  // Get all initiatives with optional filtering
  async getInitiatives(filters?: InitiativeFilters): Promise<InitiativesResponse>;

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
}
```

### Initiative Components

**Location**: `src/components/initiatives/`

**Components** (11 total):
1. **InitiativeCard** - Summary card display
2. **InitiativeList** - Grid with filtering
3. **InitiativeForm** - Creation form with map picker
4. **InitiativeDetails** - Full details page
5. **ForestSelector** - Visual forest picker
6. **InitiativeMap** - Interactive map display
7. **LocationPicker** - Location selection tool
8. **ForestBoundaryMap** - Forest boundary visualization
9. **ParticipantList** - Participant display
10. **ContributionTracker** - Contribution tracking
11. **JoinInitiativeButton** - Join/leave button
12. **MilestoneNotifications** - Milestone celebrations

---

## Tree Registry System

### Overview

The tree registry system enables community members to register trees, upload images, track health status, and monitor growth.

**Status**: ✅ Complete

### Type Definitions

**Location**: `src/types/tree.types.ts`

**Core Types**:

```typescript
// Tree health status
type TreeHealthStatus = 'healthy' | 'needs_attention' | 'critical' | 'deceased';

// Main tree interface
interface Tree {
  id: string;
  species: string;
  planted_date: string;
  location: GeoPoint;
  health_status: TreeHealthStatus;
  height_cm?: number;
  diameter_cm?: number;
  notes?: string;
  initiative_id?: string;
  planted_by: string;
  created_at: string;
  updated_at: string;
}

// Tree image
interface TreeImage {
  id: string;
  tree_id: string;
  image_url: string;
  caption?: string;
  uploaded_at: string;
}

// Tree statistics
interface TreeStatistics {
  total_trees: number;
  healthy_trees: number;
  trees_needing_attention: number;
  critical_trees: number;
  deceased_trees: number;
  average_height_cm: number;
  average_diameter_cm: number;
}
```

### Tree Service

**Location**: `src/services/tree.service.ts`

**Key Methods**:

```typescript
class TreeService {
  // Create a new tree
  async createTree(data: CreateTreeData): Promise<TreeResponse>;

  // Get tree by ID
  async getTree(treeId: string): Promise<TreeResponse>;

  // Get all trees with optional filtering
  async getTrees(filters?: TreeFilters): Promise<TreesResponse>;

  // Update tree
  async updateTree(
    treeId: string,
    updates: UpdateTreeData
  ): Promise<TreeResponse>;

  // Delete tree
  async deleteTree(treeId: string): Promise<{ error: Error | null }>;

  // Upload tree image
  async uploadTreeImage(
    treeId: string,
    file: File,
    caption?: string
  ): Promise<TreeImageResponse>;

  // Get tree images
  async getTreeImages(treeId: string): Promise<TreeImagesResponse>;

  // Delete tree image
  async deleteTreeImage(imageId: string): Promise<{ error: Error | null }>;

  // Get tree statistics
  async getTreeStatistics(filters?: TreeFilters): Promise<TreeStatistics | null>;
}
```

### Tree Components

**Location**: `src/components/trees/`

**Components** (8 total):
1. **TreeCard** - Summary card display
2. **TreeRegistry** - Grid with filtering
3. **TreeDetails** - Full details page
4. **SpeciesSelector** - Species selection
5. **TreeImageUpload** - Image upload
6. **ImageGallery** - Image gallery with lightbox
7. **TreeHealthStatus** - Health status display
8. **TreeGrowthChart** - Growth visualization

---

## AI-Powered Monitoring

### Overview

The AI-powered monitoring system integrates with Antugrow API to provide automated tree analysis, growth tracking, health monitoring, and AI-powered recommendations.

**Status**: ✅ Complete

### Antugrow Service

**Location**: `src/services/antugrow.service.ts`

**Key Methods**:

```typescript
class AntugrowService {
  // Register tree with Antugrow
  async registerTree(treeData: AntugrowTreeRegistration): Promise<AntugrowTreeResponse>;

  // Analyze tree image
  async analyzeTreeImage(
    treeId: string,
    imageUrl: string
  ): Promise<AntugrowAnalysisResponse>;

  // Get tree growth data
  async getTreeGrowthData(treeId: string): Promise<AntugrowGrowthDataResponse>;

  // Get tree health status
  async getTreeHealthStatus(treeId: string): Promise<AntugrowHealthResponse>;

  // Get AI recommendations
  async getRecommendations(treeId: string): Promise<AntugrowRecommendationsResponse>;

  // Process webhook
  async processWebhook(payload: AntugrowWebhookPayload): Promise<void>;
}
```

### Antugrow Sync Service

**Location**: `src/services/antugrow-sync.service.ts`

**Key Methods**:

```typescript
class AntugrowSyncService {
  // Sync single tree
  async syncTree(treeId: string): Promise<SyncResult>;

  // Sync all trees
  async syncAllTrees(): Promise<SyncSummary>;

  // Get sync status
  async getSyncStatus(treeId: string): Promise<SyncStatus | null>;

  // Enable/disable auto-sync
  setAutoSync(enabled: boolean): void;

  // Get auto-sync status
  isAutoSyncEnabled(): boolean;
}
```

### Monitoring Components

**Location**: `src/components/trees/`

**Components** (5 total):
1. **AntugrowAnalysisDisplay** - AI analysis results
2. **AnalysisNotification** - Analysis alerts
3. **SyncStatusIndicator** - Sync status display
4. **TreeHealthStatus** - Health monitoring
5. **TreeGrowthChart** - Growth tracking

---

## Geospatial Features

### Overview

The platform includes comprehensive geospatial features for visualizing and managing tree planting initiatives and tree locations across Kenya's pilot forests.

**Status**: ✅ Complete

### Technology Stack

**Mapping Library**: Leaflet.js 1.9.4
- Open-source JavaScript library
- Mobile-friendly and lightweight (39 KB gzipped)
- Extensive plugin ecosystem
- No API key required with OpenStreetMap

**React Integration**: react-leaflet 4.2.1
- Official React components for Leaflet
- Declarative API with hooks
- Full TypeScript support

**Map Tiles**: OpenStreetMap
- Free and open-source
- No API key required
- Global coverage
- Community-maintained

### Coordinate System

**Format**: WGS84 (EPSG:4326)
- Standard GPS coordinate system
- Latitude: -90 to 90 (North/South)
- Longitude: -180 to 180 (East/West)

**GeoJSON Point Format**:
```typescript
interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}
```

### Forest Coordinates

**Kakamega Forest**:
- Center: 0.2827°N, 34.8522°E
- Area: 238 km²
- Bounds: 0.2°N to 0.35°N, 34.8°E to 34.9°E

**Karura Forest**:
- Center: -1.2411°N, 36.8344°E
- Area: 10.5 km²
- Bounds: -1.25°N to -1.23°N, 36.82°E to 36.85°E

**Mau Forest**:
- Center: -0.5°N, 35.5833°E
- Area: 400 km²
- Bounds: -0.7°N to -0.3°N, 35.4°E to 35.8°E

### Map Components

#### 1. InitiativeMap

**Purpose**: Display multiple initiatives on an interactive map

**Features**:
- Color-coded markers by status (green=active, blue=completed, yellow=paused)
- Custom SVG markers with dynamic colors
- Clickable markers with detailed popups
- Configurable center, zoom, and height
- Selected initiative highlighting

#### 2. LocationPicker

**Purpose**: Interactive location selection for creating initiatives

**Features**:
- Click-to-place marker
- Preset location buttons (Kakamega, Karura, Mau)
- Manual coordinate input fields
- Real-time marker updates
- Disabled state support

#### 3. ForestBoundaryMap

**Purpose**: Visualize forest boundaries as polygons

**Features**:
- Color-coded forest polygons
- Semi-transparent fill for visibility
- Popups with forest information
- Single or all forest display
- Configurable height

---

## Database Schema

### Key Tables

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

#### trees
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'critical', 'deceased')),
  height_cm DECIMAL(10, 2),
  diameter_cm DECIMAL(10, 2),
  notes TEXT,
  initiative_id UUID REFERENCES initiatives(id),
  planted_by UUID NOT NULL REFERENCES users(id),
  antugrow_tree_id TEXT UNIQUE,
  last_analysis_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trees_species ON trees(species);
CREATE INDEX idx_trees_health ON trees(health_status);
CREATE INDEX idx_trees_initiative ON trees(initiative_id);
CREATE INDEX idx_trees_planted_by ON trees(planted_by);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
```

#### tree_images
```sql
CREATE TABLE tree_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tree_images_tree ON tree_images(tree_id);
```

### Row Level Security

All tables have RLS enabled:
- Users can only access their own data
- Public data (initiatives, trees) readable by all
- Write operations restricted by role

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

### Service Pattern

All services follow this pattern:

```typescript
class ServiceName {
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
3. **initiativeService** - Initiative management
4. **treeService** - Tree registry operations
5. **antugrowService** - AI-powered monitoring
6. **antugrowSyncService** - Background sync

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components (8)
│   ├── profile/           # Profile management (2)
│   ├── initiatives/       # Initiative components (11)
│   └── trees/             # Tree components (8)
├── services/              # Business logic (6 services)
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
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

**Current**: ~70% (target: 80%)

**Tested**:
- ✅ Auth service (90% coverage, 15+ tests)
- ✅ LoginForm (85% coverage, 7 tests)
- ✅ RegisterForm (85% coverage, 8 tests)
- ✅ Tree service (85% coverage, 20+ tests)
- ✅ Antugrow service (90% coverage, 45+ tests)

**Total**: 65+ tests, 100% pass rate

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

---

## Performance

### Metrics

- Initial load: < 3 seconds
- API response: < 500ms
- Map rendering: < 1 second
- Test execution: < 5 seconds

### Optimization

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Map Optimization**: Marker clustering (future)
4. **Bundle Size**: Tree shaking, minification

---

## Future Enhancements

### Planned Features

1. **Initiative Participation** (Task 5.4)
2. **Initiative Tests** (Task 5.5)
3. **Carbon Marketplace** (Tasks 8-9)
4. **Web3 Integration** (Tasks 21-24)
5. **Gamification** (Tasks 25-27)

---

**Document Version**: 4.0  
**Last Updated**: November 17, 2025  
**Next Update**: Upon completion of Task 5.4 (Initiative Participation Features)
