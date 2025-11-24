# GangGreen Platform - Technical Architecture

**A Deep Dive into the System Design and Implementation**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Security Architecture](#security-architecture)
7. [Performance Optimization](#performance-optimization)
8. [Scalability Considerations](#scalability-considerations)

---

## 🏗️ System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite + TypeScript)                           │   │
│  │  - Component-based UI                                    │   │
│  │  - Context API for state                                 │   │
│  │  - React Router for navigation                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Supabase API                                            │   │
│  │  - REST API (PostgREST)                                  │   │
│  │  - Real-time subscriptions (WebSocket)                   │   │
│  │  - Authentication (GoTrue)                               │   │
│  │  - Storage API                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Edge        │  │  Database    │  │  External    │          │
│  │  Functions   │  │  Functions   │  │  APIs        │          │
│  │              │  │              │  │              │          │
│  │ - Webhooks   │  │ - Triggers   │  │ - Antugrow   │          │
│  │ - Cron Jobs  │  │ - RLS        │  │ - Paystack   │          │
│  │ - Moderation │  │ - Validation │  │ - Strapi     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL + PostGIS                                    │   │
│  │  - Relational data                                       │   │
│  │  - Geospatial data                                       │   │
│  │  - Full-text search                                      │   │
│  │  - JSONB for flexible schemas                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Supabase Storage                                        │   │
│  │  - User avatars                                          │   │
│  │  - Tree images                                           │   │
│  │  - Badge assets                                          │   │
│  │  - Social media uploads                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Blockchain Layer                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Polygon Network                                         │   │
│  │  - Smart contracts (Solidity)                            │   │
│  │  - NFT minting (ERC-721)                                 │   │
│  │  - Petition signatures                                   │   │
│  │  - Governance tokens                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **State Management** | React Context API, Custom Hooks |
| **Routing** | React Router v6 |
| **UI Components** | Custom Glassmorphism, Lucide Icons |
| **Maps** | Leaflet.js, OpenStreetMap |
| **Charts** | Recharts |
| **Animation** | PixiJS, CSS Animations |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Functions) |
| **Database** | PostgreSQL 15 + PostGIS |
| **Authentication** | Supabase Auth (JWT) |
| **Real-time** | Supabase Realtime (WebSocket) |
| **Edge Functions** | Deno Runtime |
| **Blockchain** | Polygon, Solidity, ethers.js |
| **External APIs** | Antugrow, Paystack, Strapi |
| **Deployment** | Vercel (Frontend), Supabase Cloud (Backend) |

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── AuthContext
│   └── JourneyContext
│       ├── Navigation
│       │   ├── UserMenu
│       │   ├── NotificationCenter
│       │   ├── QuickActions
│       │   └── GGCoinDisplay
│       ├── Routes
│       │   ├── HomePage
│       │   │   ├── HeroSection (PixiPreloader)
│       │   │   ├── ImpactMetrics
│       │   │   ├── PilotForestsMap
│       │   │   ├── FeatureHighlights
│       │   │   ├── NFTBadgeShowcase
│       │   │   ├── LeaderboardPreview
│       │   │   ├── SocialProofSection
│       │   │   ├── PartnershipSection
│       │   │   └── UserJourneyVisualization
│       │   ├── InitiativesPage
│       │   │   ├── InitiativeList
│       │   │   │   └── InitiativeCard
│       │   │   └── InitiativeFilters
│       │   ├── InitiativeDetailsPage
│       │   │   ├── InitiativeDetails
│       │   │   ├── ParticipantList
│       │   │   ├── ContributionTracker
│       │   │   ├── MilestoneNotifications
│       │   │   └── JoinInitiativeButton
│       │   ├── CreateInitiativePage
│       │   │   └── InitiativeForm
│       │   │       └── LocationPicker
│       │   ├── TreesPage
│       │   │   ├── TreeList
│       │   │   ├── TreeMap
│       │   │   └── TreeFilters
│       │   ├── MarketplacePage
│       │   │   ├── BadgeMarketplace
│       │   │   ├── BadgePurchaseModal
│       │   │   └── PurchaseConfirmation
│       │   ├── SocialFeedPage
│       │   │   ├── FeedGrid
│       │   │   ├── FeedFilters
│       │   │   ├── PostCard
│       │   │   └── PostDetailModal
│       │   ├── GovernancePage
│       │   │   ├── ProposalList
│       │   │   ├── PetitionList
│       │   │   └── VotingInterface
│       │   ├── JourneyDashboardPage
│       │   │   ├── ProgressTracker
│       │   │   ├── MicroChallenges
│       │   │   └── ReferralStats
│       │   └── ProfilePage
│       │       ├── UserProfile
│       │       ├── BadgeGallery
│       │       └── ActivityFeed
│       └── UnifiedFooter
└── ChatWidget (Onboarding Chatbot)
```

### State Management Strategy

#### 1. **Global State (Context API)**

```typescript
// AuthContext - User authentication state
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}

// JourneyContext - User journey state
interface JourneyContextType {
  journey: UserJourney | null;
  challenges: MicroChallenge[];
  referrals: Referral[];
  updateProgress: (challengeId: string) => Promise<void>;
  claimReward: (challengeId: string) => Promise<void>;
}
```

#### 2. **Local State (useState)**
- Component-specific UI state
- Form inputs
- Modal visibility
- Loading states

#### 3. **Server State (Custom Hooks)**

```typescript
// Example: useSocialFeed hook
export function useSocialFeed(filters?: FeedFilters) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadPosts();
  }, [filters]);

  const loadPosts = async () => {
    const { data, error } = await socialFeedService.getPosts(filters);
    if (error) setError(error);
    else setPosts(data);
    setLoading(false);
  };

  return { posts, loading, error, refresh: loadPosts };
}
```

### Routing Strategy

```typescript
// App.tsx routing configuration
<Routes>
  {/* Public routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/initiatives" element={<InitiativesPage />} />
    <Route path="/initiatives/:id" element={<InitiativeDetailsPage />} />
    <Route path="/initiatives/create" element={<CreateInitiativePage />} />
    <Route path="/trees" element={<TreesPage />} />
    <Route path="/marketplace" element={<MarketplacePage />} />
    <Route path="/social" element={<SocialFeedPage />} />
    <Route path="/governance" element={<GovernancePage />} />
    <Route path="/journey" element={<JourneyDashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
  
  {/* Legal routes */}
  <Route path="/legal/terms" element={<TermsOfServicePage />} />
  <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
  
  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### Component Design Patterns

#### 1. **Composition Pattern**

```typescript
// GlassCard component with composition
<GlassCard variant="elevated" blur="medium">
  <GlassCard.Header>
    <h2>Initiative Title</h2>
  </GlassCard.Header>
  <GlassCard.Body>
    <p>Initiative description...</p>
  </GlassCard.Body>
  <GlassCard.Footer>
    <GlassButton>Join Initiative</GlassButton>
  </GlassCard.Footer>
</GlassCard>
```

#### 2. **Render Props Pattern**

```typescript
// MapView component with render props
<MapView
  center={[lat, lng]}
  zoom={10}
  renderMarkers={(map) => (
    initiatives.map(init => (
      <Marker
        key={init.id}
        position={[init.location.coordinates[1], init.location.coordinates[0]]}
        onClick={() => handleMarkerClick(init)}
      />
    ))
  )}
/>
```

#### 3. **Custom Hooks Pattern**

```typescript
// useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage
const { user, signIn, signOut } = useAuth();
```

---

## 🔧 Backend Architecture

### Supabase Configuration

#### 1. **Database Schema**

```sql
-- Core tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  forest_preference TEXT CHECK (forest_preference IN ('kakamega', 'karura', 'mau')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initiatives with geospatial support
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  target_trees INTEGER NOT NULL CHECK (target_trees > 0),
  trees_planted INTEGER DEFAULT 0 CHECK (trees_planted >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  area_hectares DECIMAL(10, 2),
  organization_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index
CREATE INDEX initiatives_location_idx ON initiatives USING GIST(location);

-- GG Coins with decimal precision
CREATE TABLE gg_coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'transfer')),
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE gg_coin_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for initiatives
CREATE POLICY "Anyone can view active initiatives"
  ON initiatives FOR SELECT
  USING (status = 'active' OR auth.uid() = organization_id);

CREATE POLICY "Authenticated users can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Organization owners can update their initiatives"
  ON initiatives FOR UPDATE
  USING (auth.uid() = organization_id);

-- Policies for gg_coin_transactions
CREATE POLICY "Users can view own transactions"
  ON gg_coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON gg_coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 3. **Database Functions**

```sql
-- Function to calculate user's GG Coin balance
CREATE OR REPLACE FUNCTION get_gg_coin_balance(user_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN transaction_type = 'earn' THEN amount
      WHEN transaction_type = 'spend' THEN -amount
      WHEN transaction_type = 'transfer' THEN amount
      ELSE 0
    END
  ), 0)
  FROM gg_coin_transactions
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to update initiative progress
CREATE OR REPLACE FUNCTION update_initiative_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE initiatives
  SET trees_planted = (
    SELECT COALESCE(SUM(trees_contributed), 0)
    FROM initiative_participants
    WHERE initiative_id = NEW.initiative_id
  ),
  updated_at = NOW()
  WHERE id = NEW.initiative_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update initiative progress
CREATE TRIGGER update_initiative_progress_trigger
AFTER INSERT OR UPDATE ON initiative_participants
FOR EACH ROW
EXECUTE FUNCTION update_initiative_progress();
```

### Edge Functions

#### 1. **Paystack Webhook Handler**

```typescript
// supabase/functions/paystack-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    if (!verifySignature(body, signature)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});
```

#### 2. **Content Moderation Function**

```typescript
// supabase/functions/moderate-content/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { content, contentType } = await req.json();

  // AI-powered content moderation
  const moderationResult = await moderateContent(content);

  if (moderationResult.flagged) {
    // Flag content for review
    await flagContentForReview(contentType, content, moderationResult.reasons);
  }

  return new Response(JSON.stringify(moderationResult), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

#### 3. **Post Aggregation Cron Job**

```typescript
// supabase/functions/aggregate-posts/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Run daily at midnight
  const today = new Date().toISOString().split('T')[0];

  // Aggregate post statistics
  const stats = await aggregatePostStats(today);

  // Store in analytics table
  await storeAnalytics(stats);

  return new Response('Aggregation complete', { status: 200 });
});
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
users (1) ──────< (M) user_profiles
  │
  ├──< (M) initiatives (as organization_id)
  │     │
  │     ├──< (M) initiative_participants
  │     │     │
  │     │     └──> (1) users (as user_id)
  │     │
  │     └──< (M) trees
  │           │
  │           └──< (M) tree_images
  │
  ├──< (M) gg_coin_transactions
  │
  ├──< (M) badge_purchases
  │     │
  │     └──> (1) nft_badges
  │
  ├──< (M) social_posts
  │     │
  │     ├──< (M) post_likes
  │     ├──< (M) post_comments
  │     └──< (M) saved_posts
  │
  ├──< (M) proposals
  │     │
  │     └──< (M) votes
  │
  ├──< (M) petitions
  │     │
  │     └──< (M) petition_signatures
  │
  └──< (M) user_journey_progress
        │
        ├──< (M) micro_challenge_completions
        └──< (M) referrals
```

### Key Design Decisions

#### 1. **Geospatial Data**
- **Decision**: Use PostGIS GEOGRAPHY type for locations
- **Rationale**: Accurate distance calculations, spatial indexing
- **Trade-off**: Slightly more complex queries, but better accuracy

#### 2. **Decimal for Currency**
- **Decision**: Use DECIMAL(10,2) for GG Coins
- **Rationale**: Avoid floating-point precision errors
- **Trade-off**: Slightly more storage, but critical for financial accuracy

#### 3. **JSONB for Flexible Data**
- **Decision**: Use JSONB for badge metadata, Antugrow analysis
- **Rationale**: Flexible schema, indexable, queryable
- **Trade-off**: Less type safety, but more flexibility

#### 4. **Soft Deletes**
- **Decision**: Use `deleted_at` timestamp instead of hard deletes
- **Rationale**: Data recovery, audit trail
- **Trade-off**: More complex queries, but better data integrity

---

## 🔌 API Design

### Service Layer Pattern

All services follow a consistent API pattern:

```typescript
// Standard service response format
interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

// Example: Initiative Service
export const initiativeService = {
  // Create
  createInitiative: (data: CreateInitiativeData): Promise<ServiceResponse<Initiative>>,
  
  // Read
  getInitiative: (id: string): Promise<ServiceResponse<Initiative>>,
  getInitiatives: (filters?: InitiativeFilters): Promise<ServiceResponse<Initiative[]>>,
  
  // Update
  updateInitiative: (id: string, data: UpdateInitiativeData): Promise<ServiceResponse<Initiative>>,
  
  // Delete
  deleteInitiative: (id: string): Promise<ServiceResponse<void>>,
  
  // Business logic
  joinInitiative: (initiativeId: string, userId: string): Promise<ServiceResponse<Participant>>,
  leaveInitiative: (initiativeId: string, userId: string): Promise<ServiceResponse<void>>,
  calculateProgress: (initiativeId: string): Promise<InitiativeProgress | null>,
};
```

### Error Handling Strategy

```typescript
// Centralized error handling
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Service error handling
try {
  const { data, error } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new AppError(
      'Failed to fetch initiative',
      'INITIATIVE_NOT_FOUND',
      404
    );
  }

  return { data, error: null };
} catch (error) {
  console.error('Initiative service error:', error);
  return { data: null, error };
}
```

---

## 🔒 Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Supabase Auth validates
   ↓
3. JWT token generated
   ↓
4. Token stored in localStorage
   ↓
5. Token included in all API requests
   ↓
6. Supabase validates token
   ↓
7. RLS policies enforced
   ↓
8. Data returned to client
```

### Security Best Practices

#### 1. **Row Level Security (RLS)**
- All tables have RLS enabled
- Policies enforce data access rules
- No direct database access from client

#### 2. **API Key Management**
- Environment variables for all keys
- Separate keys for dev/staging/prod
- Keys never committed to git

#### 3. **Input Validation**
- Client-side validation for UX
- Server-side validation for security
- SQL injection prevention via parameterized queries

#### 4. **XSS Prevention**
- React's built-in XSS protection
- Content Security Policy headers
- Sanitize user-generated content

#### 5. **CSRF Protection**
- SameSite cookie attribute
- CSRF tokens for state-changing operations
- Origin validation

---

## ⚡ Performance Optimization

### Frontend Optimization

#### 1. **Code Splitting**
```typescript
// Lazy load routes
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Suspense boundary
<Suspense fallback={<FallbackLoader />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</Suspense>
```

#### 2. **Image Optimization**
- WebP format with fallbacks
- Lazy loading with Intersection Observer
- Responsive images with srcset
- CDN delivery via Supabase Storage

#### 3. **Caching Strategy**
```typescript
// User cache for frequently accessed data
export class UserCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

### Backend Optimization

#### 1. **Database Indexing**
```sql
-- Indexes for common queries
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_created_at ON initiatives(created_at DESC);
CREATE INDEX idx_trees_initiative_id ON trees(initiative_id);
CREATE INDEX idx_gg_coin_user_id ON gg_coin_transactions(user_id);

-- Composite indexes
CREATE INDEX idx_initiatives_forest_status ON initiatives(forest, status);
```

#### 2. **Query Optimization**
```typescript
// Efficient query with select specific columns
const { data } = await supabase
  .from('initiatives')
  .select('id, title, forest, trees_planted, target_trees')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20);

// Avoid N+1 queries with joins
const { data } = await supabase
  .from('initiatives')
  .select(`
    *,
    participants:initiative_participants(
      user_id,
      trees_contributed,
      user:users(full_name, avatar_url)
    )
  `)
  .eq('id', initiativeId)
  .single();
```

#### 3. **Connection Pooling**
- Supabase handles connection pooling automatically
- Max connections: 100 (configurable)
- Connection timeout: 30 seconds

---

## 📈 Scalability Considerations

### Horizontal Scaling

#### 1. **Frontend**
- Deployed on Vercel Edge Network
- Automatic CDN distribution
- Serverless functions for API routes

#### 2. **Backend**
- Supabase auto-scales based on load
- Read replicas for read-heavy workloads
- Connection pooling for efficient resource use

#### 3. **Database**
- PostgreSQL supports vertical scaling
- Read replicas for read scaling
- Partitioning for large tables (future)

### Vertical Scaling

#### 1. **Database**
- Current: 2 GB RAM, 1 CPU
- Can scale to: 64 GB RAM, 16 CPU
- Storage: Auto-scaling

#### 2. **Edge Functions**
- Automatic scaling based on requests
- Cold start optimization
- Regional deployment

### Caching Strategy

#### 1. **Client-Side**
- React Query for server state
- LocalStorage for user preferences
- IndexedDB for offline support (future)

#### 2. **Server-Side**
- Supabase built-in caching
- CDN caching for static assets
- Redis for session storage (future)

### Monitoring & Observability

#### 1. **Metrics**
- Supabase Dashboard for database metrics
- Vercel Analytics for frontend performance
- Custom logging for business metrics

#### 2. **Alerts**
- Database connection pool exhaustion
- High error rates
- Slow query detection

---

**Last Updated**: November 22, 2025
**Architecture Version**: 1.0.0
**Status**: Production Ready
