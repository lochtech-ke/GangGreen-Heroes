# #GangGreen Platform - Technical Guide (Complete)

**Last Updated**: November 16, 2025  
**Version**: 4.0  
**Status**: Sprint 3 Complete - Tree Registry & Monitoring System Fully Operational

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Tree Registry & Monitoring System](#tree-registry--monitoring-system)
7. [Antugrow AI Integration](#antugrow-ai-integration)
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
│              External Services (Antugrow AI)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tree Analysis │ Health Assessment │ Growth Tracking │  │
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
- **Charts**: Recharts 2.10.0
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### External Integrations
- **Antugrow API**: AI-powered tree monitoring and health analysis
- **OpenStreetMap**: Free map tiles for Leaflet.js

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

### Key Features

- Email/password authentication
- Session persistence with JWT tokens
- Role-based access control (admin, organization, community, individual)
- Password reset flow
- Real-time auth state updates
- Protected routes

### Auth Service

**Location**: `src/services/auth.service.ts`

**Key Methods**:
```typescript
// Registration
await authService.register({ email, password });

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Password reset
await authService.requestPasswordReset(email);
await authService.updatePassword(newPassword);

// Role checking
authService.isAdmin(user);
authService.isOrganization(user);
authService.hasRole(user, 'community');
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
- `refreshUser()` - Manual refresh

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

### Profile Service

**Location**: `src/services/profile.service.ts`

**Key Methods**:
```typescript
// Get profile
await profileService.getProfile(userId);

// Create profile
await profileService.createProfile(userId, data);

// Update profile
await profileService.updateProfile(userId, updates);

// Upload avatar
await profileService.uploadAvatar(userId, file);
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

**Status**: ✅ Complete (Service Layer + UI Components + Geospatial Features + Participation Features)

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
// Create initiative
await initiativeService.createInitiative({
  title: 'Kakamega Restoration 2025',
  description: 'Plant 10,000 indigenous trees',
  forest: 'kakamega',
  target_trees: 10000,
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  location: { type: 'Point', coordinates: [34.8522, 0.2827] },
  area_hectares: 50,
  organization_id: userId
});

// Get initiatives with filters
await initiativeService.getInitiatives({
  forest: 'kakamega',
  status: 'active',
  search: 'restoration'
});

// Join initiative
await initiativeService.joinInitiative(initiativeId, userId);

// Calculate progress
await initiativeService.calculateProgress(initiativeId);
```

### Initiative Components

**Location**: `src/components/initiatives/`

**Components**:
1. **InitiativeCard** - Summary card display
2. **InitiativeList** - Grid with filtering
3. **InitiativeForm** - Creation form with map picker
4. **InitiativeDetails** - Full details page
5. **ForestSelector** - Visual forest picker
6. **InitiativeMap** - Interactive map display
7. **LocationPicker** - Location selection tool
8. **ForestBoundaryMap** - Forest boundary visualization
9. **ParticipantList** - Participant display
10. **ContributionTracker** - Contribution management
11. **JoinInitiativeButton** - Smart join/leave button
12. **MilestoneNotifications** - Progress milestones

---

## Tree Registry & Monitoring System

### Overview

The tree registry and monitoring system enables community members to register trees, upload monitoring photos, and track tree health and growth with AI-powered analysis.

**Status**: ✅ Complete (Service Layer + UI Components + Image Upload + AI Integration)

### Type Definitions

**Location**: `src/types/tree.types.ts`

**Core Types**:

```typescript
// Tree status
type TreeStatus = 'healthy' | 'at_risk' | 'deceased';

// Main tree interface
interface Tree {
  id: string;
  species: string;
  planting_date: string;
  location: GeoPoint;
  initiative_id?: string;
  forest: ForestPreference;
  planted_by: string;
  current_height?: number;
  current_health_status: TreeStatus;
  notes?: string;
  antugrow_tree_id?: string;
  created_at: string;
  updated_at: string;
}

// Tree image
interface TreeImage {
  id: string;
  tree_id: string;
  image_url: string;
  capture_date: string;
  uploaded_by: string;
  notes?: string;
  created_at: string;
}

// Tree statistics
interface TreeStatistics {
  total_trees: number;
  healthy_trees: number;
  at_risk_trees: number;
  deceased_trees: number;
  trees_by_species: Record<string, number>;
  trees_by_forest: Record<string, number>;
}
```

### Tree Service

**Location**: `src/services/tree.service.ts`

**Key Methods**:

```typescript
// Create tree
await treeService.createTree({
  species: 'Acacia mearnsii',
  planting_date: '2025-01-15',
  location: { type: 'Point', coordinates: [34.8522, 0.2827] },
  initiative_id: 'initiative-uuid',
  forest: 'kakamega',
  planted_by: userId,
  current_height: 0.5,
  notes: 'Planted near stream'
});

// Get trees with filters
await treeService.getTrees({
  forest: 'kakamega',
  status: 'healthy',
  species: 'Acacia',
  initiative_id: 'initiative-uuid'
});

// Upload tree image
await treeService.uploadTreeImage(treeId, file, {
  capture_date: '2025-02-01',
  notes: 'First month growth'
});

// Calculate statistics
await treeService.calculateTreeStatistics({
  forest: 'kakamega',
  initiative_id: 'initiative-uuid'
});
```

### Tree Components

**Location**: `src/components/trees/`

**Components**:
1. **TreeCard** - Summary card with image
2. **TreeRegistry** - Grid with filtering
3. **TreeDetails** - Full details page
4. **SpeciesSelector** - Species selection dropdown
5. **TreeImageUpload** - Drag-and-drop image upload
6. **ImageGallery** - Photo gallery with lightbox
7. **TreeHealthStatus** - Visual health indicator
8. **TreeGrowthChart** - Growth visualization
9. **AntugrowAnalysisDisplay** - AI analysis results
10. **AnalysisNotification** - Analysis alerts

---

## Antugrow AI Integration

### Overview

The Antugrow AI integration provides automated tree health analysis, growth tracking, and care recommendations using computer vision and machine learning.

**Status**: ✅ Complete (Service Wrapper + UI Components)

### Antugrow Service

**Location**: `src/services/antugrow.service.ts`

**Key Methods**:

```typescript
// Register tree with Antugrow
await antugrowService.registerTree({
  species: 'Acacia mearnsii',
  planting_date: '2025-01-15',
  location: { latitude: 0.2827, longitude: 34.8522 },
  initial_height: 0.5
});

// Submit image for analysis
await antugrowService.submitImageAnalysis(antugrowTreeId, imageUrl, {
  capture_date: '2025-02-01',
  height: 0.8
});

// Get analysis results
await antugrowService.getAnalysisResults(antugrowTreeId);

// Get growth data
await antugrowService.getGrowthData(antugrowTreeId);

// Get health recommendations
await antugrowService.getHealthRecommendations(antugrowTreeId);
```

### Features

1. **Tree Registration**: Register trees with Antugrow for tracking
2. **Image Analysis**: Submit photos for AI-powered health assessment
3. **Growth Tracking**: Monitor height and growth rate over time
4. **Health Assessment**: Detect diseases, pests, and stress indicators
5. **Care Recommendations**: Receive actionable care suggestions
6. **Retry Logic**: Exponential backoff for failed API requests

### Antugrow Data Types

```typescript
interface AntugrowTree {
  id: string;
  species: string;
  planting_date: string;
  location: { latitude: number; longitude: number };
  current_height: number;
  health_status: 'healthy' | 'at_risk' | 'critical';
}

interface AntugrowAnalysis {
  id: string;
  tree_id: string;
  analysis_date: string;
  health_score: number; // 0-100
  diseases_detected: string[];
  pests_detected: string[];
  stress_indicators: string[];
  growth_rate: number;
  recommendations: string[];
  confidence_score: number; // 0-1
}

interface GrowthData {
  tree_id: string;
  measurements: Array<{
    date: string;
    height: number;
    diameter?: number;
  }>;
  growth_trend: 'increasing' | 'stable' | 'declining';
  predicted_height: number;
}
```

---

## Geospatial Features

### Overview

The platform includes comprehensive geospatial features for visualizing and managing tree planting initiatives and trees across Kenya's pilot forests.

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

**Usage**:
```typescript
<InitiativeMap
  initiatives={initiatives}
  center={[0.2827, 34.8522]}
  zoom={10}
  height="600px"
  onMarkerClick={(initiative) => navigate(`/initiatives/${initiative.id}`)}
  selectedInitiativeId={selectedId}
/>
```

#### 2. LocationPicker

**Purpose**: Interactive location selection for creating initiatives/trees

**Features**:
- Click-to-place marker
- Preset location buttons (Kakamega, Karura, Mau)
- Manual coordinate input fields
- Real-time marker updates
- Disabled state support

**Usage**:
```typescript
<LocationPicker
  value={location}
  onChange={(newLocation) => setLocation(newLocation)}
  height="400px"
  disabled={loading}
/>
```

#### 3. ForestBoundaryMap

**Purpose**: Visualize forest boundaries as polygons

**Features**:
- Color-coded forest polygons
- Semi-transparent fill for visibility
- Popups with forest information
- Single or all forest display
- Configurable height

**Usage**:
```typescript
// Show single forest
<ForestBoundaryMap forest="kakamega" height="500px" />

// Show all forests
<ForestBoundaryMap showAllForests={true} height="600px" />
```

### Database Integration

**PostGIS Extension**: Enabled for spatial queries

**Location Storage**: GEOMETRY(Point, 4326) column type

**Spatial Index**: Created for performance
```sql
CREATE INDEX idx_initiatives_location 
ON initiatives USING GIST(location);

CREATE INDEX idx_trees_location 
ON trees USING GIST(location);
```

**GeoJSON Conversion**: Automatic conversion between GeoJSON (client) and PostGIS (database)

---

## Database Schema

### Key Tables

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
```

#### trees
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species TEXT NOT NULL,
  planting_date DATE NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  initiative_id UUID REFERENCES initiatives(id),
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  planted_by UUID NOT NULL REFERENCES users(id),
  current_height DECIMAL(10, 2),
  current_health_status TEXT DEFAULT 'healthy' CHECK (current_health_status IN ('healthy', 'at_risk', 'deceased')),
  notes TEXT,
  antugrow_tree_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### tree_images
```sql
CREATE TABLE tree_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  capture_date DATE NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Buckets

1. **avatars** (Public, 2MB limit)
2. **tree-images** (Public, 10MB limit)
3. **documents** (Private, 20MB limit)
4. **nft-badges** (Public, 5MB limit)

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
4. **treeService** - Tree registry and monitoring
5. **antugrowService** - AI-powered tree analysis

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components (7 components)
│   ├── profile/           # Profile management (2 components)
│   ├── initiatives/       # Initiative components (12 components)
│   └── trees/             # Tree registry components (10 components)
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts
│   ├── tree.service.ts
│   ├── antugrow.service.ts
│   └── README.md
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
└── types/
    ├── user.types.ts
    ├── initiative.types.ts
    └── tree.types.ts
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

**Current**: ~75% (target: 80%)

**Tested**:
- ✅ Auth service (90% coverage)
- ✅ LoginForm (85% coverage)
- ✅ RegisterForm (85% coverage)
- ✅ Profile service (80% coverage)
- ✅ Initiative service (85% coverage)
- ✅ Tree service (90% coverage)

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

1. **Antugrow Sync** (Task 7.3) - Next
2. **Carbon Marketplace** (Task 8)
3. **Web3 Integration** (Task 21-24)
4. **Gamification** (Task 25-27)

---

**Document Version**: 4.0  
**Last Updated**: November 16, 2025  
**Next Update**: Upon completion of Task 7.3 (Antugrow Sync Mechanism)
