# #GangGreen Platform - Technical Guide

**Last Updated**: November 18, 2025  
**Version**: 4.0  
**Status**: Sprint 4 - Onboarding Chatbot Backend 95% Complete

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
│  │  Auth │ Profile │ Initiative │ Tree │ Chatbot       │  │
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
│  ┌────────────────────┐                                    │
│  │  Storage Buckets   │                                    │
│  │  - Tree images     │                                    │
│  │  - Avatars         │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Antugrow API      │  │  OpenStreetMap     │           │
│  │  (AI Monitoring)   │  │  (Maps)            │           │
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
Supabase Client (API) / External APIs
   ↓
PostgreSQL Database (PostGIS) / External Services
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
- **Charts**: Recharts (for tree growth visualization)
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

[Previous authentication documentation remains the same...]

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

[Previous profile management documentation remains the same...]

---

## Initiative Management System

### Overview

The initiative management system enables organizations to create and manage tree planting initiatives with geospatial tracking, participant management, and progress monitoring.

**Status**: ✅ Complete

[Previous initiative management documentation remains the same...]

---

## Tree Registry and Monitoring

### Overview

The tree registry system enables users to register trees, upload monitoring photos, track growth, and receive AI-powered health analysis through Antugrow API integration.

**Status**: ✅ Complete

[Previous tree registry documentation remains the same...]

---

## Antugrow API Integration

### Overview

The Antugrow API integration provides AI-powered tree monitoring, growth tracking, and health analysis with automatic background synchronization.

**Status**: ✅ Complete

[Previous Antugrow documentation remains the same...]

---

## Onboarding Chatbot System

### Overview

The onboarding chatbot system provides conversational post-registration profile completion and general support through an AI-powered assistant with semantic matching and context-aware responses.

**Status**: 🚧 Backend 95% Complete, UI Pending

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ChatEngine (Orchestrator)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Conversation Management                            │  │
│  │  • Mode Switching (General/Onboarding)               │  │
│  │  • Pipeline Orchestration                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────┐
│   General Mode       │          │  Onboarding Mode     │
│  ┌────────────────┐  │          │  ┌────────────────┐  │
│  │ QueryProcessor │  │          │  │ OnboardingFlow │  │
│  │ SemanticMatcher│  │          │  │    Manager     │  │
│  │ KnowledgeBase  │  │          │  │                │  │
│  │ ResponseGen    │  │          │  │ • Step Logic   │  │
│  │ Escalation     │  │          │  │ • Validation   │  │
│  └────────────────┘  │          │  │ • Profile Save │  │
└──────────────────────┘          │  └────────────────┘  │
                                  └──────────────────────┘
         │                                    │
         └────────────────┬───────────────────┘
                          ▼
                 ┌──────────────────┐
                 │  ContextManager  │
                 │  • Message History│
                 │  • Session State │
                 │  • Mode Tracking │
                 └──────────────────┘
```

### Type Definitions

**Location**: `src/types/chatbot.types.ts`

**Core Types**:

```typescript
// Message structure
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    confidence?: number;
    matchedQuestion?: string;
    [key: string]: any;
  };
}

// Conversation context
export interface ConversationContext {
  conversationId: string;
  userId?: string;
  messages: Message[];
  intent?: string;
  mode: 'general' | 'onboarding';
  onboardingSessionId?: string;
  createdAt: Date;
  lastActivity: Date;
}

// Knowledge base entry
export interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  relatedQuestions?: string[];
}

// Chat response
export interface ChatResponse {
  answer: string;
  confidence: number;
  matchedQuestion?: string;
  suggestedActions?: QuickAction[];
  requiresEscalation: boolean;
  onboardingProgress?: OnboardingProgress;
  isOnboardingComplete?: boolean;
}

// Quick action
export interface QuickAction {
  id: string;
  label: string;
  query: string;
  category: 'getting-started' | 'projects' | 'education' | 'support';
}

// Onboarding session
export interface OnboardingSession {
  sessionId: string;
  userId: string;
  email: string;
  currentStep: OnboardingStep;
  profileData: Partial<ProfileData>;
  startedAt: Date;
  completedAt?: Date;
}

// Onboarding step
export type OnboardingStep =
  | 'welcome'
  | 'full_name'
  | 'role'
  | 'forest_preference'
  | 'phone'
  | 'location'
  | 'organization'
  | 'complete';

// Onboarding progress
export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  percentComplete: number;
}
```

### ChatEngine Service

**Location**: `src/services/chatbot/chatEngine.service.ts`

**Purpose**: Main orchestration service that coordinates all chatbot components

**Key Methods**:

```typescript
class ChatEngine {
  // Initialization
  async initialize(): Promise<void>;

  // Conversation Management
  initializeConversation(
    mode: 'general' | 'onboarding',
    userId?: string
  ): string;

  getConversationHistory(conversationId: string): Message[];
  isOnboardingMode(conversationId: string): boolean;
  clearConversation(conversationId: string): void;

  // Onboarding Flow
  async startOnboarding(
    userId: string,
    email: string,
    conversationId: string
  ): Promise<ChatResponse>;

  async processOnboardingResponse(
    response: string,
    conversationId: string
  ): Promise<ChatResponse>;

  // General Query Processing
  async processQuery(
    query: string,
    conversationId: string
  ): Promise<ChatResponse>;

  // Statistics
  getStats(): {
    isInitialized: boolean;
    knowledgeBaseStats: any;
    contextStats: any;
    escalationStats: any;
  };
}
```

### Usage Examples

#### Initialize Chat Engine

```typescript
import { chatEngine } from '@/services/chatbot/chatEngine.service';

// Initialize on app load
await chatEngine.initialize();
```

#### Start Onboarding After Registration

```typescript
// After successful registration
const conversationId = chatEngine.initializeConversation('onboarding', userId);

const response = await chatEngine.startOnboarding(
  userId,
  email,
  conversationId
);

console.log(response.answer); // Welcome message
console.log(response.onboardingProgress); // Progress tracking
```

#### Process Onboarding Responses

```typescript
// User provides their name
const response = await chatEngine.processOnboardingResponse(
  'John Doe',
  conversationId
);

console.log(response.answer); // Next question
console.log(response.onboardingProgress); // Updated progress
console.log(response.isOnboardingComplete); // false

// Continue until complete
// When complete, response.isOnboardingComplete will be true
```

#### Process General Support Queries

```typescript
// Initialize general conversation
const conversationId = chatEngine.initializeConversation('general', userId);

// Process query
const response = await chatEngine.processQuery(
  'How do I join an initiative?',
  conversationId
);

console.log(response.answer); // Answer from knowledge base
console.log(response.confidence); // Confidence score (0-100)
console.log(response.suggestedActions); // Follow-up actions
console.log(response.requiresEscalation); // false if confident
```

#### Get Conversation History

```typescript
const history = chatEngine.getConversationHistory(conversationId);

history.forEach((message) => {
  console.log(`${message.sender}: ${message.text}`);
});
```

### Supporting Services

#### 1. KnowledgeBaseManager

**Location**: `src/services/chatbot/knowledgeBaseManager.ts`

**Purpose**: Loads and manages the FAQ knowledge base

**Methods**:
- `loadKnowledgeBase()` - Loads knowledge base from JSON
- `reloadKnowledgeBase()` - Hot-reloads knowledge base
- `validateKnowledgeBase()` - Validates structure
- `getStats()` - Returns statistics

#### 2. SemanticMatcher

**Location**: `src/services/chatbot/semanticMatcher.ts`

**Purpose**: Matches user queries to knowledge base entries using semantic similarity

**Methods**:
- `findBestMatch()` - Returns best matching entry
- `calculateSimilarity()` - Computes similarity score
- `rankMatches()` - Returns top N matches

**Algorithm**: TF-IDF + Cosine Similarity + Fuzzy Matching

#### 3. ContextManager

**Location**: `src/services/chatbot/contextManager.ts`

**Purpose**: Manages conversation state and message history

**Methods**:
- `initializeContext()` - Creates new conversation
- `getContext()` - Retrieves conversation state
- `addMessage()` - Adds message to history
- `updateIntent()` - Updates conversation intent
- `setMode()` - Switches between general/onboarding
- `clearContext()` - Cleans up conversation

**Features**:
- 5-message history limit
- 20-minute session timeout
- localStorage persistence
- Mode tracking

#### 4. QueryProcessor

**Location**: `src/services/chatbot/queryProcessor.ts`

**Purpose**: Preprocesses and analyzes user queries

**Methods**:
- `process()` - Main processing pipeline
- `normalizeQuery()` - Cleans and standardizes input
- `extractIntent()` - Categorizes query type
- `isGreeting()` - Detects greetings
- `isFarewell()` - Detects farewells
- `isSkipRequest()` - Detects skip requests

#### 5. ResponseGenerator

**Location**: `src/services/chatbot/responseGenerator.ts`

**Purpose**: Generates formatted, context-aware responses

**Methods**:
- `generate()` - Creates response from match
- `personalize()` - Adds context-aware customization
- `generateGreeting()` - Creates greeting message
- `generateFarewell()` - Creates farewell message
- `generateFallback()` - Creates fallback response
- `generateLowConfidenceResponse()` - Handles uncertain matches

#### 6. EscalationHandler

**Location**: `src/services/chatbot/escalationHandler.ts`

**Purpose**: Manages escalation to human support

**Methods**:
- `shouldEscalate()` - Determines if escalation needed
- `trackEscalation()` - Records escalation attempt
- `createSupportTicket()` - Creates ticket in database
- `getContactInfo()` - Returns support contact details
- `resetAttempts()` - Resets escalation counter

**Threshold**: 70% confidence

#### 7. OnboardingFlowManager

**Location**: `src/services/chatbot/onboardingFlowManager.ts`

**Purpose**: Manages post-registration profile completion flow

**Methods**:
- `startOnboarding()` - Initializes onboarding session
- `processOnboardingResponse()` - Handles user responses
- `skipCurrentStep()` - Skips optional fields
- `completeOnboarding()` - Saves profile to database
- `getOnboardingProgress()` - Returns progress metrics
- `getWelcomeMessage()` - Generates welcome message

**Flow**:
1. Welcome → 2. Full Name → 3. Role → 4. Forest Preference → 5. Phone (optional) → 6. Location (optional) → 7. Organization (if role=organization) → 8. Complete

### Knowledge Base

**Location**: `src/data/chatbot-knowledge-base.json`

**Structure**:
```json
{
  "entries": [
    {
      "id": "kb-001",
      "question": "How do I get started with Gang Green?",
      "answer": "Welcome to Gang Green! Getting started is easy...",
      "category": "getting-started",
      "keywords": ["start", "begin", "new", "first time"],
      "relatedQuestions": ["kb-002", "kb-003"]
    }
  ]
}
```

**Categories**:
- `getting-started` - Platform introduction
- `projects` - Initiative information
- `education` - Learning resources
- `support` - Help and contact

**Total Entries**: 28 FAQ entries

### Database Tables

#### support_tickets

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL,
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
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);
```

### Integration Points

#### 1. Registration Flow Integration

```typescript
// In RegisterPage.tsx (planned)
const handleRegisterSuccess = async (userId: string, email: string) => {
  // Initialize chatbot in onboarding mode
  const conversationId = chatEngine.initializeConversation('onboarding', userId);
  
  // Start onboarding
  const response = await chatEngine.startOnboarding(userId, email, conversationId);
  
  // Show chat widget with onboarding
  setChatbotOpen(true);
  setChatbotMode('onboarding');
  
  // Prevent redirect until onboarding complete
  setOnboardingComplete(false);
};
```

#### 2. General Support Integration

```typescript
// In App.tsx (planned)
<ChatWidget
  userId={user?.id}
  mode="general"
  onEscalation={(ticket) => {
    // Handle support ticket creation
    console.log('Support ticket created:', ticket);
  }}
/>
```

### Key Features

1. **Dual Mode Operation**
   - Onboarding mode for profile completion
   - General mode for support queries
   - Automatic mode switching

2. **Semantic Matching**
   - TF-IDF vectorization
   - Cosine similarity scoring
   - Fuzzy string matching for typos
   - Confidence thresholds

3. **Context Awareness**
   - Message history tracking
   - Intent extraction
   - Session persistence
   - Timeout handling

4. **Escalation Management**
   - Confidence-based escalation
   - Support ticket creation
   - Contact information provision
   - Escalation tracking

5. **Onboarding Flow**
   - Step-by-step profile completion
   - Input validation
   - Skip optional fields
   - Progress tracking
   - Database persistence

6. **Error Handling**
   - Graceful degradation
   - Fallback responses
   - Error logging
   - User-friendly messages

---

## Database Schema

### Key Tables

[Previous database schema documentation remains the same, plus:]

#### support_tickets
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  message_history JSONB NOT NULL,
  priority TEXT DEFAULT 'medium',
  category TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Total Tables**: 22 (20 existing + 2 chatbot tables)

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
5. **antugrowService** - AI monitoring integration
6. **antugrowSyncService** - Background synchronization
7. **chatEngine** - Chatbot orchestration (NEW)
8. **knowledgeBaseManager** - Knowledge base management (NEW)
9. **semanticMatcher** - Query matching (NEW)
10. **contextManager** - Conversation state (NEW)
11. **queryProcessor** - Query preprocessing (NEW)
12. **responseGenerator** - Response formatting (NEW)
13. **escalationHandler** - Support escalation (NEW)
14. **onboardingFlowManager** - Profile completion (NEW)

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile management
│   ├── initiatives/       # Initiative components (8 components)
│   ├── trees/             # Tree registry components (8 components)
│   └── chatbot/           # Chatbot components (PLANNED)
│       ├── ChatWidget.tsx
│       ├── Message.tsx
│       ├── QuickActions.tsx
│       └── ChatErrorBoundary.tsx
├── services/
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── initiative.service.ts
│   ├── tree.service.ts
│   ├── antugrow.service.ts
│   ├── antugrow-sync.service.ts
│   └── chatbot/           # Chatbot services
│       ├── chatEngine.service.ts (NEW)
│       ├── knowledgeBaseManager.ts (NEW)
│       ├── semanticMatcher.ts (NEW)
│       ├── contextManager.ts (NEW)
│       ├── queryProcessor.ts (NEW)
│       ├── responseGenerator.ts (NEW)
│       ├── escalationHandler.ts (NEW)
│       └── onboardingFlowManager.ts (NEW)
├── data/
│   └── chatbot-knowledge-base.json (NEW)
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
└── types/
    ├── user.types.ts
    ├── initiative.types.ts
    ├── tree.types.ts
    └── chatbot.types.ts (NEW)
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
4. **Chatbot Input**: Length limits, HTML stripping

---

## Testing

### Test Framework

- **Unit Tests**: Vitest
- **Component Tests**: Testing Library
- **E2E Tests**: Playwright (future)

### Test Coverage

**Current**: ~65% (target: 80%)

**Tested**:
- ✅ Auth service (90% coverage)
- ✅ LoginForm (85% coverage)
- ✅ RegisterForm (85% coverage)
- ✅ Profile service (80% coverage)
- ✅ Tree service (85% coverage)
- ✅ Antugrow service (90% coverage)

**Pending**:
- ⏳ Chatbot services (Task 5.4)
- ⏳ Chatbot components (Task 6.5)
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
- Chatbot query processing: < 500ms
- Map rendering: < 1 second
- Test execution: < 5 seconds

### Optimization

1. **Code Splitting**: React.lazy() for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Map Optimization**: Marker clustering (future)
4. **Bundle Size**: Tree shaking, minification
5. **Chatbot**: Knowledge base caching, virtual scrolling (planned)

---

## Future Enhancements

### Planned Features

1. **Chatbot UI Components** (Task 6) - In Progress
2. **Chatbot Integration** (Task 8) - Next Week
3. **Carbon Marketplace** (Sprint 5)
4. **Web3 Integration** (Sprint 6)
5. **Gamification** (Sprint 7)

---

**Document Version**: 4.0  
**Last Updated**: November 18, 2025  
**Next Update**: Upon completion of Task 6.1 (ChatWidget Component)
