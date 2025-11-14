# #GangGreen Platform - Technical Guide (Complete)

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
6. [Geospatial Features](#geospatial-features)
7. [Database Schema](#database-schema)
8. [API Services](#api-services)
9. [Component Architecture](#component-architecture)
10. [State Management](#state-management)
11. [Security](#security)
12. [Testing](#testing)
13. [Deployment](#deployment)

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
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Geospatial Layer (Leaflet)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Maps │ Markers │ Polygons │ Location Picker        │  │
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
Supabase Client (API)
   ↓
PostgreSQL Database (PostGIS)
   ↓
Response
   ↓
Component State Update
   ↓
UI Re-render (with Maps)
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### Geospatial
- **Mapping Library**: Leaflet.js 1.9.4
- **React Integration**: react-leaflet 4.2.1
- **Map Tiles**: OpenStreetMap (free, no API key)
- **Coordinate System**: WGS84 (EPSG:4326)
- **Database Extension**: PostGIS for spatial queries

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

**Status**: ✅ Complete (Service Layer + UI Components + Geospatial Features)

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

---

## Geospatial Features

### Overview

The platform includes comprehensive geospatial features for visualizing and managing tree planting initiatives across Kenya's pilot forests.

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

**Purpose**: Interactive location selection for creating initiatives

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

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile management
│   └── initiatives/       # Initiative components
│       ├── InitiativeCard.tsx
│       ├── InitiativeList.tsx
│       ├── InitiativeForm.tsx
│       ├── InitiativeDetails.tsx
│       ├── ForestSelector.tsx
│       ├── InitiativeMap.tsx
│       ├── LocationPicker.tsx
│       ├── ForestBoundaryMap.tsx
│       ├── index.ts
│       └── README.md
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts
│   └── README.md
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
└── types/
    ├── user.types.ts
    └── initiative.types.ts
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

**Current**: ~60% (target: 80%)

**Tested**:
- ✅ Auth service (90% coverage)
- ✅ LoginForm (85% coverage)
- ✅ RegisterForm (85% coverage)
- ✅ Profile service (80% coverage)

**Pending**:
- ⏳ Initiative service tests
- ⏳ Initiative component tests
- ⏳ Map component tests

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

**Optional**:
```
VITE_MAPBOX_TOKEN=<secret>  # For Mapbox tiles (optional)
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
3. **Tree Registry** (Task 6)
4. **Carbon Marketplace** (Task 8-9)
5. **Web3 Integration** (Task 21-24)
6. **Gamification** (Task 25-27)

---

**Document Version**: 3.0  
**Last Updated**: November 14, 2025  
**Next Update**: Upon completion of Task 5.4 (Initiative Participation Features)
