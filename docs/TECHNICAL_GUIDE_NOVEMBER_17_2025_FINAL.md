# #GangGreen Platform - Technical Guide (Updated November 17, 2025)

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Antugrow API Integration](#antugrow-api-integration) ⭐ NEW
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Development Guide](#development-guide)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    #GangGreen Platform                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Services   │  │  Components  │      │
│  │  (React +    │──│   (Business  │──│     (UI)     │      │
│  │  TypeScript) │  │    Logic)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                            ▼                                  │
│              ┌──────────────────────────┐                    │
│              │   Supabase Backend       │                    │
│              │  - PostgreSQL + PostGIS  │                    │
│              │  - Authentication        │                    │
│              │  - Storage               │                    │
│              │  - Real-time             │                    │
│              └──────────────────────────┘                    │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
     ┌──────────────────┐     ┌──────────────────┐
     │  Antugrow API    │     │  Blockchain      │
     │  (AI Monitoring) │     │  (Web3/NFTs)     │
     └──────────────────┘     └──────────────────┘
```

### Data Flow

1. **User Interaction** → React Components
2. **Business Logic** → Service Layer
3. **Data Persistence** → Supabase (PostgreSQL)
4. **AI Analysis** → Antugrow API ⭐ NEW
5. **Real-time Updates** → Supabase Subscriptions
6. **Background Jobs** → Sync Service ⭐ NEW

---

## Technology Stack

### Frontend
- **React** 18.3.1 - UI library
- **TypeScript** 5.6.2 - Type safety
- **Vite** 6.0.1 - Build tool
- **Tailwind CSS** 3.4.17 - Styling
- **React Router** 7.1.1 - Routing
- **Leaflet.js** 1.9.4 - Interactive maps

### Backend (Supabase)
- **PostgreSQL** 15+ - Database
- **PostGIS** 3.4+ - Geospatial extension
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage
- **Supabase Realtime** - WebSocket subscriptions

### Testing
- **Vitest** 4.0.8 - Test framework
- **Testing Library** 16.3.0 - Component testing
- **jest-dom** 6.9.1 - DOM matchers
- **user-event** 14.6.1 - User interactions
- **jsdom** 27.2.0 - DOM simulation

### External APIs
- **Antugrow API** - AI tree monitoring ⭐ NEW
- **Mapbox** - Map tiles (optional)

### Blockchain (Planned)
- **ethers.js** - Web3 library
- **Hardhat** - Smart contract development
- **Solidity** - Smart contract language

---

## Project Structure

```
ganggreen-platform/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── profile/        # Profile management
│   │   ├── initiatives/    # Initiative components
│   │   └── trees/          # Tree registry components ⭐ UPDATED
│   │       ├── TreeCard.tsx
│   │       ├── TreeRegistry.tsx
│   │       ├── TreeDetails.tsx
│   │       ├── TreeImageUpload.tsx
│   │       ├── AntugrowAnalysisDisplay.tsx ⭐ NEW
│   │       ├── AnalysisNotification.tsx ⭐ NEW
│   │       ├── SyncStatusIndicator.tsx ⭐ NEW
│   │       ├── TreeHealthStatus.tsx ⭐ NEW
│   │       └── TreeGrowthChart.tsx ⭐ NEW
│   ├── services/           # Business logic
│   │   ├── supabase.ts
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── initiative.service.ts
│   │   ├── tree.service.ts
│   │   ├── antugrow.service.ts ⭐ NEW
│   │   └── antugrow-sync.service.ts ⭐ NEW
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.ts
│   ├── types/              # TypeScript types
│   │   ├── user.types.ts
│   │   ├── initiative.types.ts
│   │   └── tree.types.ts
│   ├── test/               # Test configuration
│   │   ├── setup.ts
│   │   └── README.md
│   └── utils/              # Utility functions
├── supabase/               # Database migrations
│   ├── migrations/
│   └── storage/
├── docs/                   # Documentation
└── vitest.config.ts        # Test configuration
```

---


## Antugrow API Integration ⭐ NEW

### Overview

The Antugrow API integration provides AI-powered tree monitoring capabilities including health assessment, growth tracking, disease detection, and care recommendations.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   #GangGreen Platform                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │  Tree Registry  │────────▶│  Antugrow API    │      │
│  │   Components    │         │     Service      │      │
│  └─────────────────┘         └──────────────────┘      │
│         │                             │                  │
│         │                             │                  │
│         ▼                             ▼                  │
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │   Monitoring    │◀────────│   Sync Service   │      │
│  │      UI         │         │   (Background)   │      │
│  └─────────────────┘         └──────────────────┘      │
│         │                             │                  │
│         │                             │                  │
│         ▼                             ▼                  │
│  ┌─────────────────────────────────────────────┐       │
│  │          Supabase Database                   │       │
│  │  (trees, tree_images, notifications)         │       │
│  └─────────────────────────────────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Webhooks
                         ▼
              ┌──────────────────┐
              │  Antugrow API    │
              │   (External)     │
              └──────────────────┘
```

### Antugrow Service (`antugrow.service.ts`)

#### Configuration

```typescript
// Environment variables
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=your_api_key_here
```

#### API Methods

**Tree Registration**
```typescript
const { data, error } = await antugrowService.registerTree({
  tree_id: 'tree-123',
  species: 'Acacia',
  location: {
    latitude: 0.2827,
    longitude: 34.8522
  },
  planted_date: '2025-01-01'
});

// Response
{
  antugrow_id: 'antugrow-456'
}
```

**Image Analysis**
```typescript
const { data, error } = await antugrowService.analyzeImage({
  tree_id: 'tree-123',
  image_url: 'https://example.com/tree.jpg',
  captured_at: '2025-01-01T12:00:00Z'
});

// Response
{
  antugrow_id: 'analysis-789',
  health_score: 85,
  growth_rate: 12.5,
  disease_detected: false,
  recommendations: ['Continue current care routine'],
  analyzed_at: '2025-01-01T12:05:00Z',
  confidence_score: 92
}
```

**Growth Data**
```typescript
const { data, error } = await antugrowService.getGrowthData('antugrow-456');

// Response
{
  tree_id: 'tree-123',
  antugrow_id: 'antugrow-456',
  measurements: {
    height_cm: 150,
    diameter_cm: 12,
    canopy_area_m2: 8.5
  },
  health_status: 'healthy',
  last_updated: '2025-01-01T12:00:00Z'
}
```

**Analysis History**
```typescript
const { data, error } = await antugrowService.getTreeAnalyses('antugrow-456');

// Response: Array of analysis results
[
  {
    antugrow_id: 'analysis-1',
    health_score: 85,
    growth_rate: 12.5,
    disease_detected: false,
    recommendations: ['Continue current care'],
    analyzed_at: '2025-01-01T12:00:00Z'
  },
  // ... more analyses
]
```

**Recommendations**
```typescript
const { data, error } = await antugrowService.getRecommendations('antugrow-456');

// Response
{
  recommendations: [
    'Water twice weekly during dry season',
    'Apply organic fertilizer monthly',
    'Prune dead branches in spring'
  ]
}
```

**Status Check**
```typescript
const { data, error } = await antugrowService.getStatus();

// Response
{
  status: 'ok',
  version: '1.0.0'
}
```

**Configuration Check**
```typescript
const isConfigured = antugrowService.isConfigured();
// Returns: boolean
```

#### Error Handling

The service includes comprehensive error handling:

```typescript
interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

// Usage
const { data, error } = await antugrowService.registerTree(treeData);

if (error) {
  console.error('Registration failed:', error.message);
  // Handle error
} else {
  console.log('Tree registered:', data.antugrow_id);
  // Use data
}
```

#### Retry Logic

Automatic retry for:
- **429 Rate Limit**: Exponential backoff
- **500 Server Error**: Up to 3 retries
- **Network Errors**: Automatic retry

```typescript
// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000;    // 10 seconds

// Exponential backoff formula
delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
```

### Sync Service (`antugrow-sync.service.ts`)

#### Batch Synchronization

```typescript
// Sync all trees with Antugrow IDs
const result = await antugrowSyncService.syncAllTrees();

// Response
{
  success: true,
  trees_synced: 150,
  errors: []
}
```

#### Webhook Processing

```typescript
// Process webhook from Antugrow
const result = await antugrowSyncService.processWebhook({
  event: 'analysis.completed',
  data: {
    antugrow_id: 'antugrow-456',
    analysis: {
      health_score: 85,
      growth_rate: 12.5,
      disease_detected: false
    }
  }
});

// Response
{
  success: true,
  message: 'Analysis processed for tree tree-123'
}
```

**Supported Webhook Events**:
1. `analysis.completed` - New AI analysis available
2. `tree.updated` - Tree measurements updated
3. `health.alert` - Health issue detected

#### Auto-Sync

```typescript
// Start auto-sync (runs every 60 minutes by default)
antugrowSyncService.startAutoSync();

// Custom interval (in minutes)
antugrowSyncService.startAutoSync(30); // Every 30 minutes

// Stop auto-sync
antugrowSyncService.stopAutoSync();

// Check if sync is running
const isRunning = antugrowSyncService.isSyncInProgress();
```

#### Sync Status

```typescript
const status = await antugrowSyncService.getSyncStatus();

// Response
{
  in_progress: false,
  last_sync: '2025-01-01T12:00:00Z',
  trees_synced: 150,
  errors: 0
}
```

#### Health Status Mapping

```typescript
// Health score to status mapping
function mapHealthScore(score: number): HealthStatus {
  if (score >= 80) return 'healthy';
  if (score >= 60) return 'stressed';
  if (score >= 40) return 'diseased';
  return 'dead';
}
```

### UI Components

#### AntugrowAnalysisDisplay

Display AI analysis results:

```typescript
import { AntugrowAnalysisDisplay } from './components/trees';

<AntugrowAnalysisDisplay
  analysis={{
    health_score: 85,
    growth_rate: 12.5,
    disease_detected: false,
    recommendations: ['Continue current care'],
    analyzed_at: '2025-01-01T12:00:00Z',
    confidence_score: 92
  }}
  onRefresh={handleRefresh}
/>
```

#### TreeHealthStatus

Visual health status indicator:

```typescript
import { TreeHealthStatus } from './components/trees';

<TreeHealthStatus
  healthStatus="healthy"
  healthScore={85}
  lastUpdated="2025-01-01T12:00:00Z"
/>
```

#### TreeGrowthChart

Growth visualization:

```typescript
import { TreeGrowthChart } from './components/trees';

<TreeGrowthChart
  treeId="tree-123"
  measurements={[
    {
      date: '2025-01-01',
      height_cm: 100,
      diameter_cm: 8
    },
    {
      date: '2025-02-01',
      height_cm: 110,
      diameter_cm: 9
    }
  ]}
/>
```

#### SyncStatusIndicator

Sync status display:

```typescript
import { SyncStatusIndicator } from './components/trees';

<SyncStatusIndicator
  onManualSync={handleManualSync}
/>
```

#### AnalysisNotification

Real-time notifications:

```typescript
import { AnalysisNotification } from './components/trees';

<AnalysisNotification
  notification={{
    type: 'health_alert',
    message: 'Disease detected on tree',
    tree_id: 'tree-123',
    timestamp: '2025-01-01T12:00:00Z'
  }}
  onDismiss={handleDismiss}
/>
```

### TypeScript Types

```typescript
// Antugrow tree registration
interface AntugrowTreeRegistration {
  tree_id: string;
  species: string;
  location: {
    latitude: number;
    longitude: number;
  };
  planted_date: string;
}

// Image analysis request
interface AntugrowImageAnalysis {
  tree_id: string;
  image_url: string;
  captured_at: string;
}

// Analysis result
interface AntugrowAnalysisResult {
  antugrow_id: string;
  health_score: number;
  growth_rate: number;
  disease_detected: boolean;
  recommendations: string[];
  analyzed_at: string;
  confidence_score?: number;
}

// Growth data
interface AntugrowGrowthData {
  tree_id: string;
  antugrow_id: string;
  measurements: {
    height_cm: number;
    diameter_cm: number;
    canopy_area_m2?: number;
  };
  health_status: 'healthy' | 'stressed' | 'diseased' | 'dead';
  last_updated: string;
}

// Webhook payload
interface WebhookPayload {
  event: 'analysis.completed' | 'tree.updated' | 'health.alert';
  data: any;
}

// Sync result
interface SyncResult {
  success: boolean;
  trees_synced: number;
  errors: string[];
}
```

### Database Schema Updates

**trees table** (updated):
```sql
ALTER TABLE trees
ADD COLUMN antugrow_id TEXT UNIQUE,
ADD COLUMN last_analysis_at TIMESTAMPTZ,
ADD COLUMN health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100);

CREATE INDEX idx_trees_antugrow_id ON trees(antugrow_id);
```

**tree_images table** (updated):
```sql
ALTER TABLE tree_images
ADD COLUMN analysis_id TEXT,
ADD COLUMN analysis_completed BOOLEAN DEFAULT FALSE;
```

### Testing

**Unit Tests** (45+ tests):
```bash
# Run Antugrow service tests
npm test antugrow.service.test.ts

# Run sync service tests
npm test antugrow-sync.service.test.ts
```

**Test Coverage**:
- Antugrow Service: ~90%
- Sync Service: ~90%
- Total: 45+ tests, 100% pass rate

**Example Test**:
```typescript
describe('AntugrowService', () => {
  it('should register tree successfully', async () => {
    const mockResponse = { antugrow_id: 'antugrow-456' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const result = await antugrowService.registerTree({
      tree_id: 'tree-123',
      species: 'Acacia',
      location: { latitude: 0.2827, longitude: 34.8522 },
      planted_date: '2025-01-01'
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual(mockResponse);
  });
});
```

### Performance Considerations

**API Rate Limits**:
- Antugrow API: 100 requests/minute
- Automatic retry on 429 errors
- Exponential backoff implemented

**Optimization Strategies**:
1. **Batch Processing**: Sync multiple trees in parallel
2. **Caching**: Store analysis results locally
3. **Background Sync**: Run during off-peak hours
4. **Error Isolation**: One tree failure doesn't stop batch
5. **Concurrent Prevention**: Only one sync at a time

**Performance Metrics**:
- Average API response: < 500ms
- Image analysis: 2-5 minutes
- Batch sync (100 trees): ~30 seconds
- Webhook processing: < 100ms

### Security

**API Key Management**:
- Store in environment variables
- Never commit to version control
- Rotate keys regularly
- Use different keys for dev/prod

**Data Validation**:
- Validate all inputs before API calls
- Sanitize webhook payloads
- Verify webhook signatures (if available)
- Rate limit webhook endpoints

**Error Handling**:
- Never expose API keys in errors
- Log errors securely
- Sanitize error messages for users
- Monitor for suspicious activity

### Monitoring and Logging

**Metrics to Track**:
- API success/failure rates
- Average response times
- Sync completion rates
- Error frequencies
- Webhook processing times

**Logging**:
```typescript
// Service logs
console.log('[Antugrow] Registering tree:', treeId);
console.error('[Antugrow] Registration failed:', error);

// Sync logs
console.log('[Sync] Starting batch sync');
console.log('[Sync] Synced 150 trees in 30s');
console.error('[Sync] Failed to sync tree:', treeId, error);
```

### Troubleshooting

**Common Issues**:

1. **API Key Not Configured**
   - Check environment variables
   - Verify `.env` file exists
   - Restart development server

2. **Rate Limit Exceeded**
   - Wait for rate limit reset
   - Reduce sync frequency
   - Implement request queuing

3. **Analysis Taking Too Long**
   - Normal: 2-5 minutes
   - Check Antugrow API status
   - Verify image quality
   - Contact Antugrow support

4. **Sync Errors**
   - Check internet connection
   - Verify API key validity
   - Review error logs
   - Try manual sync

5. **Webhook Not Processing**
   - Verify webhook URL
   - Check webhook signature
   - Review payload format
   - Test with sample payload

---

