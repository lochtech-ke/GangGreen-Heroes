# #GangGreen Platform - Technical Guide

**Last Updated**: November 17, 2025  
**Version**: 4.0  
**Status**: Sprint 4 - Antugrow Sync & Carbon Marketplace (20% Complete)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Tree Registry & Monitoring System](#tree-registry--monitoring-system)
7. [Antugrow AI Integration](#antugrow-ai-integration)
8. [Antugrow Sync Mechanism](#antugrow-sync-mechanism)
9. [Geospatial Features](#geospatial-features)
10. [Database Schema](#database-schema)
11. [API Services](#api-services)
12. [Component Architecture](#component-architecture)
13. [State Management](#state-management)
14. [Security](#security)
15. [Testing](#testing)
16. [Deployment](#deployment)

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
│  │  Antugrow Sync │ Marketplace (coming)                │  │
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
│  │  Tree Analysis │ Growth Tracking │ Health Monitoring │  │
│  │  Webhooks ← → Background Sync                        │  │
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
UI Re-render (with Maps/Charts)
```

### Sync Flow

```
Background Timer (60 min)
   ↓
Antugrow Sync Service
   ↓
Fetch Trees with Antugrow IDs
   ↓
For Each Tree:
   - Get Growth Data from Antugrow API
   - Update Local Database
   ↓
Update Sync Status
   ↓
UI Reflects Changes

Parallel:
Antugrow Webhook
   ↓
Webhook Handler
   ↓
Process Event (analysis/update/alert)
   ↓
Update Database
   ↓
Create Notifications
   ↓
Real-time UI Update
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
- **Antugrow API**: AI-powered tree monitoring and analysis
- **OpenStreetMap**: Free map tiles for Leaflet

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

[Previous authentication documentation remains the same...]

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

[Previous profile documentation remains the same...]

---

## Initiative Management System

### Overview

The initiative management system enables organizations to create and manage tree planting initiatives with geospatial tracking, participant management, and progress monitoring.

**Status**: ✅ Complete

[Previous initiative documentation remains the same...]

---

## Tree Registry & Monitoring System

### Overview

The tree registry system enables community members to register trees, upload monitoring photos, and track growth with AI-powered health analysis.

**Status**: ✅ Complete

[Previous tree registry documentation remains the same...]

---

## Antugrow AI Integration

### Overview

The Antugrow integration provides AI-powered tree monitoring, health analysis, growth tracking, and care recommendations through the Antugrow API.

**Status**: ✅ Complete with Sync

[Previous Antugrow documentation remains the same...]

---

## Antugrow Sync Mechanism

### Overview

The Antugrow sync mechanism provides automatic background synchronization of tree data between the local database and Antugrow API, with webhook support for real-time updates.

**Status**: ✅ Complete (Task 7.3)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Sync Architecture                         │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  Auto-Sync   │────────▶│  Sync All    │                │
│  │  Timer       │         │  Trees       │                │
│  │  (60 min)    │         │              │                │
│  └──────────────┘         └──────┬───────┘                │
│                                   │                         │
│                                   ▼                         │
│                          ┌──────────────┐                  │
│                          │  For Each    │                  │
│                          │  Tree        │                  │
│                          └──────┬───────┘                  │
│                                 │                           │
│                                 ▼                           │
│                        ┌──────────────┐                    │
│                        │  Fetch from  │                    │
│                        │  Antugrow    │                    │
│                        └──────┬───────┘                    │
│                               │                             │
│                               ▼                             │
│                      ┌──────────────┐                      │
│                      │  Update DB   │                      │
│                      └──────────────┘                      │
│                                                              │
│  Parallel:                                                   │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  Antugrow    │────────▶│  Webhook     │                │
│  │  Webhook     │         │  Handler     │                │
│  └──────────────┘         └──────┬───────┘                │
│                                   │                         │
│                                   ▼                         │
│                          ┌──────────────┐                  │
│                          │  Process     │                  │
│                          │  Event       │                  │
│                          └──────┬───────┘                  │
│                                 │                           │
│                                 ▼                           │
│                        ┌──────────────┐                    │
│                        │  Update DB   │                    │
│                        │  + Notify    │                    │
│                        └──────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Antugrow Sync Service

**Location**: `src/services/antugrow-sync.service.ts`

**Purpose**: Manage automatic synchronization and webhook processing

**Key Features**:

1. **Automatic Background Sync**
   - Configurable sync intervals (default: 60 minutes)
   - Automatic initial sync on start
   - Prevents concurrent sync operations
   - Syncs all trees with Antugrow IDs

2. **Individual Tree Sync**
   - Sync single tree by ID
   - Fetch growth data from Antugrow
   - Update local tree records
   - Error handling per tree

3. **Webhook Processing**
   - Process incoming Antugrow webhooks
   - Support for multiple event types
   - Automatic tree lookup
   - Database updates based on events

4. **Sync Status Tracking**
   - Track last sync timestamp
   - Count trees synced
   - Record error count
   - Monitor sync progress

5. **Data Reconciliation**
   - Map health scores to status
   - Update measurements
   - Sync health changes
   - Maintain consistency

**Methods**:

```typescript
class AntugrowSyncService {
  // Start automatic background sync
  startAutoSync(intervalMinutes?: number): void;

  // Stop automatic background sync
  stopAutoSync(): void;

  // Sync all trees with Antugrow IDs
  async syncAllTrees(): Promise<SyncResult>;

  // Sync a single tree
  async syncTree(treeId: string, antugrowId: string): Promise<void>;

  // Process webhook from Antugrow
  async processWebhook(payload: any): Promise<{
    success: boolean;
    message: string;
  }>;

  // Get current sync status
  async getSyncStatus(): Promise<SyncStatus>;

  // Check if sync is in progress
  isSyncInProgress(): boolean;
}
```

**Types**:

```typescript
interface SyncStatus {
  last_sync: string | null;
  trees_synced: number;
  errors: number;
  in_progress: boolean;
}

interface SyncResult {
  success: boolean;
  trees_synced: number;
  errors: string[];
}
```

### Usage Examples

#### Start Automatic Sync

```typescript
import { antugrowSyncService } from '@/services';

// Start auto-sync with default interval (60 minutes)
antugrowSyncService.startAutoSync();

// Start with custom interval (30 minutes)
antugrowSyncService.startAutoSync(30);

// Stop auto-sync
antugrowSyncService.stopAutoSync();
```

#### Manual Sync

```typescript
// Sync all trees
const result = await antugrowSyncService.syncAllTrees();

if (result.success) {
  console.log(`Synced ${result.trees_synced} trees`);
} else {
  console.error('Sync errors:', result.errors);
}

// Sync single tree
await antugrowSyncService.syncTree(treeId, antugrowId);
```

#### Check Sync Status

```typescript
const status = await antugrowSyncService.getSyncStatus();

console.log('Last sync:', status.last_sync);
console.log('Trees synced:', status.trees_synced);
console.log('Errors:', status.errors);
console.log('In progress:', status.in_progress);
```

#### Process Webhook

```typescript
// In your webhook endpoint
const result = await antugrowSyncService.processWebhook({
  event: 'analysis.completed',
  data: {
    antugrow_id: 'ant_123',
    analysis: {
      health_score: 85,
      diseases: [],
      pests: [],
    },
  },
});

if (result.success) {
  console.log(result.message);
}
```

### Webhook Events

#### 1. Analysis Completed

**Event**: `analysis.completed`

**Payload**:
```typescript
{
  event: 'analysis.completed',
  data: {
    antugrow_id: string;
    analysis: {
      health_score: number;
      diseases: string[];
      pests: string[];
      recommendations: string[];
    };
  }
}
```

**Action**:
- Find tree by antugrow_id
- Update health status based on score
- Store analysis results
- Return success/failure

#### 2. Tree Updated

**Event**: `tree.updated`

**Payload**:
```typescript
{
  event: 'tree.updated',
  data: {
    antugrow_id: string;
    measurements: {
      height_cm: number;
      diameter_cm: number;
    };
    health_status: string;
  }
}
```

**Action**:
- Find tree by antugrow_id
- Update height and diameter
- Update health status
- Return success/failure

#### 3. Health Alert

**Event**: `health.alert`

**Payload**:
```typescript
{
  event: 'health.alert',
  data: {
    antugrow_id: string;
    alert_type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }
}
```

**Action**:
- Find tree and owner
- Create notification for owner
- Include alert details
- Return success/failure

### Data Reconciliation

#### Health Score Mapping

```typescript
// Map Antugrow health score (0-100) to local status
healthScore >= 80 → 'healthy'
healthScore >= 60 → 'stressed'
healthScore >= 40 → 'diseased'
healthScore < 40  → 'dead'
```

#### Measurement Updates

- Height (cm) synced from Antugrow
- Diameter (cm) synced from Antugrow
- Automatic validation
- Historical data preserved

#### Status Synchronization

- Health status kept in sync
- Growth stage updates
- Disease/pest detection
- Care recommendations

### Sync Status Indicator Component

**Location**: `src/components/trees/SyncStatusIndicator.tsx`

**Purpose**: Display sync status and trigger manual sync

**Props**:
```typescript
interface SyncStatusIndicatorProps {
  showDetails?: boolean;      // Show detailed view
  onSyncClick?: () => void;   // Custom sync handler
}
```

**Features**:

**Compact View**:
- Small button with sync icon
- Shows sync status (syncing/synced/errors)
- Tooltip with last sync time
- Click to trigger manual sync
- Disabled during sync

**Detailed View**:
- Full sync status panel
- Last sync timestamp (relative time)
- Trees synced count
- Error count display
- Progress bar during sync
- Manual sync button

**Real-time Updates**:
- Auto-refresh every 30 seconds
- Live sync progress indicator
- Animated icons during sync
- Color-coded status

**Usage**:

```typescript
import { SyncStatusIndicator } from '@/components/trees';

// Compact view
<SyncStatusIndicator />

// Detailed view
<SyncStatusIndicator showDetails={true} />

// Custom sync handler
<SyncStatusIndicator 
  onSyncClick={() => {
    // Custom logic
    antugrowSyncService.syncAllTrees();
  }}
/>
```

### Error Handling

#### Sync Errors

- Individual tree failures don't stop sync
- Errors collected and reported
- Sync continues for remaining trees
- Error count tracked in status

#### Webhook Errors

- Invalid payload handled gracefully
- Unknown event types logged
- Tree not found errors reported
- Database errors caught and returned

#### Network Errors

- Retry logic in Antugrow service
- Exponential backoff
- Maximum retry attempts
- Timeout handling

### Performance Considerations

#### Sync Optimization

- Batch processing possible
- Configurable intervals
- Prevents concurrent syncs
- Efficient database queries

#### Webhook Processing

- Async processing
- Quick response times
- Background database updates
- Non-blocking operations

#### Resource Usage

- Minimal memory footprint
- Efficient API calls
- Scheduled sync reduces load
- Webhook-based real-time updates

---

## Geospatial Features

[Previous geospatial documentation remains the same...]

---

## Database Schema

### Key Tables

[Previous database schema remains the same...]

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
5. **antugrowService** - Antugrow API integration
6. **antugrowSyncService** - Automatic sync and webhooks (NEW)

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile management
│   ├── initiatives/       # Initiative components (8 components)
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
│       ├── SyncStatusIndicator.tsx (NEW)
│       ├── index.ts
│       └── README.md
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts
│   ├── tree.service.ts
│   ├── antugrow.service.ts
│   ├── antugrow-sync.service.ts (NEW)
│   ├── index.ts
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

### API Security

1. **Antugrow API**: API key authentication
2. **Webhook Verification**: Signature validation (recommended)
3. **Rate Limiting**: Implemented in Antugrow service
4. **Error Handling**: No sensitive data in errors

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

**Pending**:
- ⏳ Antugrow sync service tests (Task 7.4)
- ⏳ SyncStatusIndicator tests
- ⏳ Integration tests for sync

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
- Sync operation: < 30 seconds (100 trees)
- Test execution: < 10 seconds

### Optimization

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Map Optimization**: Marker clustering (future)
4. **Bundle Size**: Tree shaking, minification
5. **Sync Optimization**: Configurable intervals, batch processing

---

## Future Enhancements

### Planned Features

1. **Task 7.4**: Antugrow Integration Tests (Next - Week of Nov 18)
2. **Task 8**: Carbon Marketplace (Week of Nov 20)
3. **Task 9**: Impact Dashboard (December 2025)
4. **Task 10**: Notification System (December 2025)
5. **Task 21-24**: Web3 Integration (January 2026)
6. **Task 25-27**: Gamification (February 2026)

### Technical Improvements

1. **Server-Side Sync**: Move sync to server-side cron jobs
2. **Webhook Verification**: Add signature validation
3. **Sync Optimization**: Implement batch processing
4. **Real-time Updates**: Add Supabase real-time subscriptions
5. **Error Monitoring**: Add Sentry or similar service

---

**Document Version**: 4.0  
**Last Updated**: November 17, 2025  
**Next Update**: Upon completion of Task 7.4 (Antugrow Integration Tests)
