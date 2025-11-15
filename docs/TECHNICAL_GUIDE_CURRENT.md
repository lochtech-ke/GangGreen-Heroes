# #GangGreen Platform - Technical Guide

**Last Updated**: November 18, 2025  
**Version**: 4.0  
**Status**: Sprint 4 - Onboarding Chatbot Backend Complete

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Tree Registry and Monitoring](#tree-registry-and-monitoring)
7. [Antugrow API Integration](#antugrow-api-integration)
8. [Onboarding Chatbot System](#onboarding-chatbot-system)
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
│  │  Chatbot (8 services) │ Marketplace │ Web3          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 22 tables       │  │  - JWT tokens      │           │
│  │  - PostGIS         │  │  - Session mgmt    │           │
│  │  - RLS policies    │  │                    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Storage Buckets   │  │  Real-time         │           │
│  │  - Tree images     │  │  - Subscriptions   │           │
│  │  - Avatars         │  │  - Live updates    │           │
│  └────────────────────┘  └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Integrations                       │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Antugrow API      │  │  OpenStreetMap     │           │
│  │  - Tree analysis   │  │  - Map tiles       │           │
│  │  - Growth tracking │  │  - Geospatial      │           │
│  └────────────────────┘  └────────────────────┘           │
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
Supabase Client (API) / External API
   ↓
PostgreSQL Database / External Service
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
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### External Integrations
- **Antugrow API**: AI-powered tree monitoring and analysis
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

**Status**: ✅ Complete (95% - tests in progress)

### Key Features

- Email/password authentication
- Session persistence with JWT tokens
- Role-based access control (admin, organization, community, individual)
- Password reset flow
- Real-time auth state updates
- Protected routes
- Database trigger for automatic user record creation

### Auth Service

**Location**: `src/services/auth.service.ts`

**Key Methods**:
```typescript
// Registration (user record created automatically via database trigger)
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
```

### Initiative Service

**Location**: `src/services/initiative.service.ts`

**Key Methods**:

```typescript
// Create initiative
await initiativeService.createInitiative(data);

// Get initiatives with filters
await initiativeService.getInitiatives({ forest, status, search });

// Join initiative
await initiativeService.joinInitiative(initiativeId, userId);

// Calculate progress
await initiativeService.calculateProgress(initiativeId);
```

### Initiative Components

**Location**: `src/components/initiatives/`

**Components** (8 total):
1. **InitiativeCard** - Summary card display
2. **InitiativeList** - Grid with filtering
3. **InitiativeForm** - Creation form with map picker
4. **InitiativeDetails** - Full details page
5. **ForestSelector** - Visual forest picker
6. **InitiativeMap** - Interactive map display
7. **LocationPicker** - Location selection tool
8. **ForestBoundaryMap** - Forest boundary visualization

---

## Tree Registry and Monitoring

### Overview

The tree registry system enables users to register trees, upload monitoring photos, track growth, and receive AI-powered health analysis.

**Status**: ✅ Complete (Service Layer + UI Components + Tests)

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
  initiative_id?: string;
  planted_by: string;
  health_status: TreeHealthStatus;
  height_cm?: number;
  diameter_cm?: number;
  notes?: string;
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
```

### Tree Service

**Location**: `src/services/tree.service.ts`

**Key Methods**:

```typescript
// Register tree
await treeService.registerTree(data);

// Get trees with filters
await treeService.getTrees({ species, health_status, initiative_id });

// Upload image
await treeService.uploadTreeImage(treeId, file, caption);

// Update health status
await treeService.updateHealthStatus(treeId, status);

// Get statistics
await treeService.getTreeStatistics(userId);
```

### Tree Components

**Location**: `src/components/trees/`

**Components** (8 total):
1. **TreeCard** - Summary card display
2. **TreeRegistry** - Grid with filtering
3. **TreeDetails** - Full details page
4. **SpeciesSelector** - Species selection
5. **TreeImageUpload** - Image upload interface
6. **ImageGallery** - Photo gallery
7. **TreeHealthStatus** - Health indicator
8. **TreeGrowthChart** - Growth visualization

---

## Antugrow API Integration

### Overview

The Antugrow API integration provides AI-powered tree monitoring, growth tracking, and health analysis.

**Status**: ✅ Complete (Service Layer + Background Sync + UI Components + Tests)

### Antugrow Service

**Location**: `src/services/antugrow.service.ts`

**Key Methods**:

```typescript
// Register tree with Antugrow
await antugrowService.registerTree(treeData);

// Analyze tree image
await antugrowService.analyzeTreeImage(treeId, imageUrl);

// Get growth data
await antugrowService.getGrowthData(antugrowTreeId);

// Get health analysis
await antugrowService.getHealthAnalysis(antugrowTreeId);

// Get recommendations
await antugrowService.getRecommendations(antugrowTreeId);
```

### Background Sync Service

**Location**: `src/services/antugrow-sync.service.ts`

**Features**:
- Automatic synchronization of tree data
- Periodic health checks
- Growth data updates
- Error handling and retry logic
- Configurable sync intervals

**Key Methods**:

```typescript
// Start auto-sync
antugrowSyncService.startAutoSync(intervalMinutes);

// Stop auto-sync
antugrowSyncService.stopAutoSync();

// Manual sync
await antugrowSyncService.syncTree(treeId);

// Sync all trees
await antugrowSyncService.syncAllTrees();
```

### Monitoring Components

**Location**: `src/components/trees/`

**Components** (5 total):
1. **AntugrowAnalysisDisplay** - AI analysis results
2. **AnalysisNotification** - New analysis alerts
3. **SyncStatusIndicator** - Sync status display
4. **TreeHealthStatus** - Health visualization
5. **TreeGrowthChart** - Growth trends

---

## Onboarding Chatbot System

### Overview

The onboarding chatbot provides AI-powered conversational assistance for post-registration profile completion and general platform support.

**Status**: ✅ Backend Complete (8 services), UI Pending

### Architecture

```
ChatEngine (Main Orchestrator)
├── OnboardingFlowManager
│   ├── Session management
│   ├── Step progression
│   ├── Validation
│   └── Profile saving
├── KnowledgeBaseManager
│   ├── JSON loading
│   ├── Caching
│   └── Search
├── SemanticMatcher
│   ├── TF-IDF vectorization
│   ├── Cosine similarity
│   └── Fuzzy matching
├── ContextManager
│   ├── History tracking
│   ├── Session state
│   └── Persistence
├── QueryProcessor
│   ├── Normalization
│   ├── Intent extraction
│   └── Entity extraction
├── ResponseGenerator
│   ├── Formatting
│   ├── Personalization
│   └── Follow-ups
├── EscalationHandler
│   ├── Threshold checking
│   ├── Ticket creation
│   └── Analytics
└── AnalyticsTracker
    ├── Event logging
    └── Supabase integration
```

### Type Definitions

**Location**: `src/types/chatbot.types.ts`

**Core Types**:

```typescript
// Message
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Conversation context
interface ConversationContext {
  conversationId: string;
  messages: Message[];
  lastActivity: Date;
  mode: 'general' | 'onboarding';
  onboardingSessionId?: string;
  onboardingProgress?: number;
}

// Knowledge base entry
interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  relatedQuestions?: string[];
}

// Onboarding session
interface OnboardingSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  currentStep: OnboardingStep;
  collectedData: Partial<ProfileData>;
  startedAt: Date;
  completedAt?: Date;
}
```

### Chat Engine Service

**Location**: `src/services/chatbot/chatEngine.service.ts`

**Key Methods**:

```typescript
// Initialize conversation
const conversationId = await chatEngine.initializeConversation('general');

// Start onboarding
const response = await chatEngine.startOnboarding(userId, userEmail);

// Process general query
const response = await chatEngine.processQuery(conversationId, query);

// Process onboarding response
const response = await chatEngine.processOnboardingResponse(
  conversationId,
  userResponse
);

// Get conversation history
const history = await chatEngine.getConversationHistory(conversationId);
```

### Onboarding Flow Manager

**Location**: `src/services/chatbot/onboardingFlowManager.ts`

**Features**:
- Post-registration profile completion
- Step-by-step conversational flow
- Field validation
- Skip logic for optional fields
- Profile saving to Supabase
- Progress tracking

**Onboarding Steps**:
1. Welcome message
2. Full name (required)
3. Role selection (required)
4. Forest preference (required)
5. Phone number (optional)
6. Location (optional)
7. Organization name (conditional)
8. Completion confirmation

### Knowledge Base Manager

**Location**: `src/services/chatbot/knowledgeBaseManager.ts`

**Features**:
- JSON loading and caching
- Hot-reload functionality
- Structure validation
- Category-based search
- Statistics tracking

**Knowledge Base** (28 entries):
- Getting started: 5 entries
- Projects: 8 entries
- Education & gamification: 3 entries
- Community: 3 entries
- Verification & tracking: 3 entries
- Sponsorship: 3 entries
- Support: 3 entries

### Semantic Matcher

**Location**: `src/services/chatbot/semanticMatcher.ts`

**Features**:
- TF-IDF vectorization
- Cosine similarity calculation
- Fuzzy string matching
- Confidence scoring (0-100%)
- Top-N match ranking
- Typo tolerance

**Matching Algorithm**:
```typescript
1. Normalize query (lowercase, remove punctuation)
2. Calculate TF-IDF vectors for query and all KB entries
3. Compute cosine similarity scores
4. Apply fuzzy matching for short queries
5. Rank by confidence score
6. Return best match if confidence >= 70%
```

### Context Manager

**Location**: `src/services/chatbot/contextManager.ts`

**Features**:
- Conversation history (last 5 messages)
- Session state management
- localStorage persistence
- 20-minute timeout
- Onboarding mode tracking

### Query Processor

**Location**: `src/services/chatbot/queryProcessor.ts`

**Features**:
- Query normalization
- Intent extraction (8 types)
- Entity extraction
- Greeting/farewell detection
- Skip request detection

**Intent Types**:
- getting-started
- find-projects
- join-project
- education
- community
- verification
- sponsorship
- support

### Response Generator

**Location**: `src/services/chatbot/responseGenerator.ts`

**Features**:
- Response formatting and personalization
- Context-aware customization
- Follow-up action generation
- Greeting/farewell responses
- Category-specific quick actions

### Escalation Handler

**Location**: `src/services/chatbot/escalationHandler.ts`

**Features**:
- 70% confidence threshold
- Attempt tracking (max 2 attempts)
- Support ticket creation
- Priority determination
- Escalation analytics

**Escalation Triggers**:
- Low confidence match (<70%)
- Multiple failed attempts (>2)
- Explicit support request
- Complex query detection

### Analytics Tracker

**Location**: `src/services/chatbot/analyticsTracker.ts`

**Tracked Events**:
- query_sent
- response_generated
- escalation_triggered
- onboarding_started
- onboarding_step_completed
- onboarding_completed
- support_ticket_created

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

#### trees
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  initiative_id UUID REFERENCES initiatives(id),
  planted_by UUID NOT NULL REFERENCES users(id),
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'critical', 'deceased')),
  height_cm DECIMAL(10, 2),
  diameter_cm DECIMAL(10, 2),
  notes TEXT,
  antugrow_tree_id TEXT UNIQUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trees_species ON trees(species);
CREATE INDEX idx_trees_health_status ON trees(health_status);
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

#### support_tickets
```sql
CREATE TABLE support_tickets (
  ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  message_history JSONB NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
```

#### chatbot_analytics
```sql
CREATE TABLE chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  conversation_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_chatbot_analytics_event_type ON chatbot_analytics(event_type);
CREATE INDEX idx_chatbot_analytics_user ON chatbot_analytics(user_id);
CREATE INDEX idx_chatbot_analytics_timestamp ON chatbot_analytics(timestamp);
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

**trees policies**:
```sql
-- Anyone can view trees
CREATE POLICY "Anyone can view trees"
  ON trees FOR SELECT
  USING (true);

-- Users can register trees
CREATE POLICY "Users can register trees"
  ON trees FOR INSERT
  WITH CHECK (auth.uid() = planted_by);

-- Users can update their own trees
CREATE POLICY "Users can update own trees"
  ON trees FOR UPDATE
  USING (auth.uid() = planted_by);
```

**support_tickets policies**:
```sql
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
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
4. **treeService** - Tree registry and monitoring
5. **antugrowService** - Antugrow API integration
6. **antugrowSyncService** - Background synchronization
7. **chatEngine** - Chatbot orchestration
8. **onboardingFlowManager** - Onboarding flow
9. **knowledgeBaseManager** - FAQ management
10. **semanticMatcher** - Query matching
11. **contextManager** - Conversation context
12. **queryProcessor** - Query processing
13. **responseGenerator** - Response generation
14. **escalationHandler** - Support escalation

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile management
│   ├── initiatives/       # Initiative components (8)
│   ├── trees/             # Tree components (8)
│   ├── chatbot/           # Chatbot components (pending)
│   └── common/            # Shared components
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts
│   ├── tree.service.ts
│   ├── antugrow.service.ts
│   ├── antugrow-sync.service.ts
│   └── chatbot/           # Chatbot services (8)
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── types/
│   ├── user.types.ts
│   ├── initiative.types.ts
│   ├── tree.types.ts
│   └── chatbot.types.ts
└── data/
    └── chatbot-knowledge-base.json
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
- ✅ Tree service (85% coverage)
- ✅ Antugrow service (80% coverage)

**Pending**:
- ⏳ Chatbot services
- ⏳ Initiative tests
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
- Chatbot query: < 500ms
- Test execution: < 5 seconds

### Optimization

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Map Optimization**: Marker clustering (future)
4. **Bundle Size**: Tree shaking, minification
5. **Caching**: Knowledge base in-memory caching

---

## Future Enhancements

### Planned Features

1. **Chatbot UI** (Task 6) - In Progress
2. **Carbon Marketplace** (December 2025)
3. **Web3 Integration** (January 2026)
4. **Gamification** (February 2026)

---

**Document Version**: 4.0  
**Last Updated**: November 18, 2025  
**Next Update**: Upon completion of Task 6 (Chatbot UI Components)
