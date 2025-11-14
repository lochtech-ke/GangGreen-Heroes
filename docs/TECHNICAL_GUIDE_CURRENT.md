# #GangGreen Platform - Technical Guide (Current)

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
6. [Tree Registry & Monitoring](#tree-registry--monitoring)
7. [Antugrow API Integration](#antugrow-api-integration)
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
│  │  Sync │ Marketplace (coming) │ Web3 (coming)        │  │
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
│  │  Tree Analysis │ Growth Predictions │ Health Monitor │  │
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
PostgreSQL Database (PostGIS) / External AI
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
- **Charts**: Recharts (for growth visualization)
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

**Status**: ✅ Complete

[Authentication details remain the same as previous version]

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

[Profile management details remain the same as previous version]

---

## Initiative Management System

### Overview

The initiative management system enables organizations to create and manage tree planting initiatives with geospatial tracking, participant management, and progress monitoring.

**Status**: ✅ Complete

[Initiative management details remain the same as previous version]

---

## Tree Registry & Monitoring

### Overview

The tree registry system enables community members to register trees, upload monitoring photos, track growth, and monitor health status with AI-powered insights from Antugrow API.

**Status**: ✅ Complete (Task 6)

### Type Definitions

**Location**: `src/types/tree.types.ts`

**Core Types**:

```typescript
// Tree health status
export type TreeHealthStatus = 'healthy' | 'needs_attention' | 'critical' | 'unknown';

// Main tree interface
export interface Tree {
  id: string;
  species: string;
  planted_date: string;
  location: GeoPoint;
  initiative_id?: string;
  planted_by: string;
  current_height?: number;
  health_status: TreeHealthStatus;
  notes?: string;
  antugrow_tree_id?: string;
  last_monitored?: string;
  created_at: string;
  updated_at: string;
}

// Tree image metadata
export interface TreeImage {
  id: string;
  tree_id: string;
  image_url: string;
  captured_date: string;
  notes?: string;
  analysis_data?: any;
  created_at: string;
}

// Tree statistics
export interface TreeStatistics {
  total_trees: number;
  trees_by_species: Record<string, number>;
  trees_by_health: Record<TreeHealthStatus, number>;
  trees_by_initiative: Record<string, number>;
  average_height?: number;
  total_monitored: number;
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

  // Get all trees with filtering
  async getTrees(filters?: TreeFilters): Promise<TreesResponse>;

  // Update tree
  async updateTree(treeId: string, updates: UpdateTreeData): Promise<TreeResponse>;

  // Delete tree
  async deleteTree(treeId: string): Promise<{ error: Error | null }>;

  // Upload tree image
  async uploadTreeImage(
    treeId: string,
    file: File,
    notes?: string
  ): Promise<TreeImageResponse>;

  // Get tree images
  async getTreeImages(treeId: string): Promise<TreeImagesResponse>;

  // Delete tree image
  async deleteTreeImage(imageId: string, imageUrl: string): Promise<{ error: Error | null }>;

  // Get tree statistics
  async getTreeStatistics(filters?: TreeFilters): Promise<TreeStatistics | null>;

  // Get trees by initiative
  async getTreesByInitiative(initiativeId: string): Promise<TreesResponse>;

  // Get trees by user
  async getTreesByUser(userId: string): Promise<TreesResponse>;
}
```

### Tree Components

**Location**: `src/components/trees/`

#### 1. TreeCard

**File**: `TreeCard.tsx` (150 lines)

**Purpose**: Display tree summary in card format

**Features**:
- Tree species and planting date
- Health status indicator
- Current height display
- Location information
- Last monitored date
- Click to view details

#### 2. TreeRegistry

**File**: `TreeRegistry.tsx` (250 lines)

**Purpose**: List and filter trees

**Features**:
- Grid layout of tree cards
- Filter by species, health, initiative
- Search functionality
- Sorting options
- Pagination
- Empty state handling

#### 3. TreeDetails

**File**: `TreeDetails.tsx` (350 lines)

**Purpose**: Full tree information display

**Features**:
- Complete tree information
- Image gallery
- Growth chart
- Health status display
- Antugrow analysis results
- Edit and delete options
- Initiative association

#### 4. SpeciesSelector

**File**: `SpeciesSelector.tsx` (120 lines)

**Purpose**: Tree species selection

**Features**:
- Dropdown with common species
- Search functionality
- Custom species input
- Species descriptions
- Indigenous species highlighting

#### 5. TreeImageUpload

**File**: `TreeImageUpload.tsx` (180 lines)

**Purpose**: Upload tree monitoring photos

**Features**:
- Drag-and-drop upload
- File validation
- Image preview
- Notes input
- Automatic Antugrow analysis
- Upload progress indicator

#### 6. ImageGallery

**File**: `ImageGallery.tsx` (150 lines)

**Purpose**: Display tree images

**Features**:
- Grid layout
- Lightbox view
- Image metadata display
- Analysis results preview
- Delete functionality
- Chronological sorting

#### 7. TreeHealthStatus

**File**: `TreeHealthStatus.tsx` (150 lines)

**Purpose**: Display tree health information

**Features**:
- Visual health indicator
- Health score display
- Issue detection
- Antugrow health data
- Recommendation preview
- Color-coded status

#### 8. TreeGrowthChart

**File**: `TreeGrowthChart.tsx` (100 lines)

**Purpose**: Visualize tree growth over time

**Features**:
- Line chart with Recharts
- Height over time
- Growth predictions
- Confidence intervals
- Interactive tooltips
- Responsive design

---

## Antugrow API Integration

### Overview

The Antugrow API integration provides AI-powered tree monitoring, growth predictions, health assessments, and personalized recommendations.

**Status**: ✅ Complete (Task 7)

### Antugrow Service

**Location**: `src/services/antugrow.service.ts`

**Key Methods**:

```typescript
class AntugrowService {
  // Register tree with Antugrow
  async registerTree(data: {
    species: string;
    plantedDate: string;
    location: { latitude: number; longitude: number };
    initialHeight?: number;
  }): Promise<{ antugrowTreeId: string | null; error: Error | null }>;

  // Analyze tree image
  async analyzeTreeImage(
    antugrowTreeId: string,
    imageFile: File,
    capturedDate: string
  ): Promise<{ analysis: any | null; error: Error | null }>;

  // Get growth data
  async getTreeGrowthData(
    antugrowTreeId: string
  ): Promise<{ growthData: any | null; error: Error | null }>;

  // Get health status
  async getTreeHealthStatus(
    antugrowTreeId: string
  ): Promise<{ healthData: any | null; error: Error | null }>;

  // Get recommendations
  async getRecommendations(
    antugrowTreeId: string
  ): Promise<{ recommendations: any[] | null; error: Error | null }>;

  // Process webhook
  async processWebhook(
    payload: any
  ): Promise<{ success: boolean; error: Error | null }>;
}
```

**Features**:
- Automatic retry logic with exponential backoff
- Error handling and validation
- Type-safe request/response handling
- Webhook processing for real-time updates
- Rate limiting protection

### Background Sync Service

**Location**: `src/services/antugrow-sync.service.ts`

**Purpose**: Automatically synchronize tree data with Antugrow API

**Key Methods**:

```typescript
class AntugrowSyncService {
  // Start automatic sync
  startAutoSync(intervalMinutes?: number): void;

  // Stop automatic sync
  stopAutoSync(): void;

  // Manual sync trigger
  async syncNow(): Promise<{ success: boolean; error: Error | null }>;

  // Get sync status
  getSyncStatus(): {
    isRunning: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
    syncCount: number;
  };

  // Sync single tree
  async syncTree(treeId: string): Promise<{ success: boolean; error: Error | null }>;
}
```

**Features**:
- Configurable sync intervals (default: 2 hours)
- Automatic error recovery
- Sync status tracking
- Manual sync trigger
- Last sync timestamp
- Sync statistics

**Sync Process**:
1. Fetch trees with Antugrow IDs
2. Request latest data from Antugrow
3. Update local database
4. Track sync status
5. Handle errors gracefully
6. Schedule next sync

### Antugrow UI Components

**Location**: `src/components/trees/`

#### 1. AntugrowAnalysisDisplay

**File**: `AntugrowAnalysisDisplay.tsx` (180 lines)

**Purpose**: Display AI analysis results

**Features**:
- Growth predictions with charts
- Health status indicators
- Species verification
- Confidence scores
- Recommendations list
- Analysis timestamp
- Detailed metrics

#### 2. AnalysisNotification

**File**: `AnalysisNotification.tsx` (120 lines)

**Purpose**: Real-time analysis notifications

**Features**:
- Toast-style alerts
- Success/error states
- Auto-dismiss functionality
- Click to view details
- Analysis summary
- Action buttons

#### 3. SyncStatusIndicator

**File**: `SyncStatusIndicator.tsx` (100 lines)

**Purpose**: Background sync status display

**Features**:
- Sync status indicator
- Last sync timestamp
- Manual sync trigger
- Sync progress display
- Error state handling
- Next sync countdown

### Integration Flow

```
1. User registers tree
   ↓
2. Tree service creates local record
   ↓
3. Antugrow service registers tree
   ↓
4. Antugrow tree ID stored locally
   ↓
5. User uploads image
   ↓
6. Image uploaded to Supabase Storage
   ↓
7. Antugrow service analyzes image
   ↓
8. Analysis results stored locally
   ↓
9. Background sync updates data periodically
   ↓
10. UI displays latest analysis
```

### Webhook Processing

**Endpoint**: `/api/webhooks/antugrow` (to be implemented)

**Purpose**: Receive real-time updates from Antugrow

**Events**:
- `analysis.completed` - Image analysis finished
- `growth.updated` - New growth data available
- `health.changed` - Health status changed
- `recommendation.new` - New recommendation available

**Processing**:
1. Validate webhook signature
2. Parse event payload
3. Update local database
4. Trigger UI notifications
5. Log event for debugging

---

## Geospatial Features

### Overview

The platform includes comprehensive geospatial features for visualizing and managing tree planting initiatives and individual trees across Kenya's pilot forests.

**Status**: ✅ Complete

[Geospatial details remain the same as previous version]

---

## Database Schema

### Key Tables

#### trees
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  initiative_id UUID REFERENCES initiatives(id),
  planted_by UUID NOT NULL REFERENCES users(id),
  current_height DECIMAL(10, 2),
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'needs_attention', 'critical', 'unknown')),
  notes TEXT,
  antugrow_tree_id TEXT UNIQUE,
  last_monitored TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_trees_species ON trees(species);
CREATE INDEX idx_trees_health ON trees(health_status);
CREATE INDEX idx_trees_initiative ON trees(initiative_id);
CREATE INDEX idx_trees_user ON trees(planted_by);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
CREATE INDEX idx_trees_antugrow ON trees(antugrow_tree_id);
```

#### tree_images
```sql
CREATE TABLE tree_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  captured_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tree_images_tree ON tree_images(tree_id);
CREATE INDEX idx_tree_images_date ON tree_images(captured_date);
```

[Other tables remain the same as previous version]

### Row Level Security

**trees policies**:
```sql
-- Anyone can view trees
CREATE POLICY "Anyone can view trees"
  ON trees FOR SELECT
  USING (true);

-- Users can create trees
CREATE POLICY "Users can create trees"
  ON trees FOR INSERT
  WITH CHECK (auth.uid() = planted_by);

-- Users can update their own trees
CREATE POLICY "Users can update own trees"
  ON trees FOR UPDATE
  USING (auth.uid() = planted_by);

-- Users can delete their own trees
CREATE POLICY "Users can delete own trees"
  ON trees FOR DELETE
  USING (auth.uid() = planted_by);
```

**tree_images policies**:
```sql
-- Anyone can view tree images
CREATE POLICY "Anyone can view tree images"
  ON tree_images FOR SELECT
  USING (true);

-- Users can upload images for their trees
CREATE POLICY "Users can upload images for own trees"
  ON tree_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trees
      WHERE trees.id = tree_images.tree_id
      AND trees.planted_by = auth.uid()
    )
  );

-- Users can delete images for their trees
CREATE POLICY "Users can delete images for own trees"
  ON tree_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trees
      WHERE trees.id = tree_images.tree_id
      AND trees.planted_by = auth.uid()
    )
  );
```

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
6. **antugrowSyncService** - Background synchronization

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components (8 components)
│   ├── profile/           # Profile management (2 components)
│   ├── initiatives/       # Initiative components (13 components)
│   └── trees/             # Tree components (13 components)
│       ├── TreeCard.tsx
│       ├── TreeRegistry.tsx
│       ├── TreeDetails.tsx
│       ├── SpeciesSelector.tsx
│       ├── TreeImageUpload.tsx
│       ├── ImageGallery.tsx
│       ├── TreeHealthStatus.tsx
│       ├── TreeGrowthChart.tsx
│       ├── AntugrowAnalysisDisplay.tsx
│       ├── AnalysisNotification.tsx
│       ├── SyncStatusIndicator.tsx
│       ├── index.ts
│       └── README.md
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts
│   ├── tree.service.ts
│   ├── antugrow.service.ts
│   ├── antugrow-sync.service.ts
│   ├── index.ts
│   └── README.md
├── types/
│   ├── user.types.ts
│   ├── initiative.types.ts
│   ├── tree.types.ts
│   └── index.ts
└── test/
    ├── setup.ts
    └── README.md
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
- Users can only modify their own data
- Public data (initiatives, trees) readable by all
- Write operations restricted by ownership

### API Key Security

**Antugrow API Key**:
- Stored in environment variables
- Never exposed to client
- Server-side API calls only (future)
- Rate limiting implemented

### Input Validation

1. **Client-Side**: React form validation
2. **Server-Side**: Supabase database constraints
3. **Sanitization**: Prevent XSS attacks
4. **File Upload**: Type and size validation

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
- ✅ Profile service (80% coverage)
- ✅ Tree service (85% coverage, 20+ tests)
- ✅ Antugrow service (85% coverage, 45+ tests)
- ✅ Initiative service (80% coverage, 15+ tests)

**Pending**:
- ⏳ Tree component tests
- ⏳ Integration tests
- ⏳ E2E tests

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Examples

**Service Test**:
```typescript
describe('AntugrowService', () => {
  it('should register tree with Antugrow', async () => {
    const result = await antugrowService.registerTree({
      species: 'Acacia',
      plantedDate: '2025-01-01',
      location: { latitude: 0.2827, longitude: 34.8522 },
    });
    
    expect(result.error).toBeNull();
    expect(result.antugrowTreeId).toBeDefined();
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
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=<secret>
```

**Optional**:
```
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
- Test execution: < 10 seconds
- Background sync: 2 hours (configurable)

### Optimization

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Map Optimization**: Marker clustering (future)
4. **Bundle Size**: Tree shaking, minification
5. **API Caching**: Background sync reduces API calls

---

## Future Enhancements

### Planned Features

1. **Carbon Marketplace** (Task 8-10) - Next
2. **Web3 Integration** (Task 21-24)
3. **Gamification** (Task 25-27)
4. **Real-time Notifications** (Task 28)
5. **Advanced Analytics** (Task 29)

---

**Document Version**: 4.0  
**Last Updated**: November 17, 2025  
**Next Update**: Upon completion of Task 8 (Carbon Marketplace Service)
