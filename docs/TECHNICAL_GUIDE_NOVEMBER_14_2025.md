# #GangGreen Platform - Technical Guide

**Last Updated**: November 14, 2025  
**Version**: 1.4  
**Status**: Sprint 2 - Authentication & Core Setup (50% Complete)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [Database Schema](#database-schema)
6. [API Integration](#api-integration)
7. [Onboarding Chatbot System](#onboarding-chatbot-system)
8. [Web3 Integration](#web3-integration)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Development Workflow](#development-workflow)

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
│                     API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Supabase Client SDK                         │  │
│  │  (Auth, Database, Storage, Real-time)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Supabase Backend       │    │   Antugrow API           │
│  ┌────────────────────┐  │    │  ┌────────────────────┐ │
│  │  PostgreSQL DB     │  │    │  │  Tree Monitoring   │ │
│  │  - 20 Tables       │  │    │  │  - Growth Tracking │ │
│  │  - RLS Policies    │  │    │  │  - AI Analysis     │ │
│  │  - 80+ Indexes     │  │    │  │  - Health Status   │ │
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
├── components/          # React UI Components
│   ├── auth/           # Authentication (✅ Complete)
│   ├── chatbot/        # Onboarding Chatbot (📋 Planned)
│   ├── dashboard/      # Dashboard (📋 Planned)
│   ├── initiatives/    # Initiatives (📋 Planned)
│   ├── trees/          # Tree Registry (📋 Planned)
│   ├── marketplace/    # Carbon Credits (📋 Planned)
│   ├── web3/           # Web3 Wallet (📋 Planned)
│   ├── nft/            # NFT Badges (📋 Planned)
│   ├── gamification/   # Gamification (📋 Planned)
│   └── common/         # Shared Components (📋 Planned)
├── services/           # Business Logic & API Clients
│   ├── supabase.ts     # Supabase Client (✅ Complete)
│   ├── auth.service.ts # Auth Service (✅ Complete)
│   ├── chatbot.service.ts # Chatbot Engine (📋 Planned)
│   └── *.service.ts    # Other Services (📋 Planned)
├── contexts/           # React Context Providers
│   └── AuthContext.tsx # Auth Context (✅ Complete)
├── hooks/              # Custom React Hooks
│   └── useAuth.ts      # Auth Hook (✅ Complete)
├── types/              # TypeScript Definitions
│   └── user.types.ts   # User Types (✅ Complete)
├── utils/              # Utility Functions
├── contracts/          # Smart Contracts (📋 Planned)
└── test/               # Test Setup (✅ Complete)
```

---

## Technology Stack

### Frontend (✅ Implemented)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 18.2.0 | UI Framework | ✅ Installed |
| TypeScript | 5.2.2 | Type Safety | ✅ Configured |
| Vite | 5.0.8 | Build Tool | ✅ Configured |
| Tailwind CSS | 3.4.0 | Styling | ✅ Configured |
| React Router | 6.21.0 | Routing | ✅ Installed |

### Backend (✅ Configured)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Supabase | 2.81.1 | BaaS Platform | ✅ Connected |
| PostgreSQL | 15+ | Database | ✅ Schema Designed |
| PostGIS | 3.3+ | Geospatial | ✅ Planned |

### Testing (✅ Implemented)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Vitest | 4.0.8 | Unit Testing | ✅ Configured |
| Testing Library | 16.3.0 | Component Testing | ✅ Installed |
| jsdom | 27.2.0 | DOM Simulation | ✅ Installed |

### Development Tools (✅ Configured)

| Tool | Version | Purpose | Status |
|------|---------|---------|--------|
| ESLint | 8.55.0 | Linting | ✅ Configured |
| Prettier | 3.1.1 | Formatting | ✅ Configured |
| Git | - | Version Control | ✅ Initialized |

---

## Project Structure

### Current Implementation Status


**Completed** (✅):
- Project setup and configuration
- Database schema design (20 tables)
- Authentication system (service, UI, context, hooks)
- Test infrastructure (Vitest + Testing Library)
- 25+ authentication tests (100% pass rate)

**In Progress** (🚧):
- Authentication tests (60% complete)
- Database migration execution

**Planned** (📋):
- Core features (initiatives, trees, monitoring)
- Carbon credit marketplace
- Web3 integration
- Gamification system
- Onboarding chatbot

---

## Authentication System

### Overview

The authentication system is **fully implemented** and provides:
- User registration with profile creation
- Email/password login
- Password reset flow
- Session management
- Role-based access control
- Protected routes
- Global auth state management

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  LoginForm   │  │ RegisterForm │  │ProtectedRoute│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Hook Layer                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  useAuth Hook (13 methods)                       │  │
│  │  - login, register, logout                       │  │
│  │  - hasRole, isAdmin, isOrganization              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Context Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AuthContext (Global State)                      │  │
│  │  - user, loading, isAuthenticated                │  │
│  │  - Session persistence                           │  │
│  │  - Real-time subscriptions                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  authService (Business Logic)                    │  │
│  │  - register, login, logout                       │  │
│  │  - getCurrentUser, onAuthStateChange             │  │
│  │  - requestPasswordReset, updatePassword          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Supabase Auth + PostgreSQL                      │  │
│  │  - users table                                   │  │
│  │  - user_profiles table                           │  │
│  │  - JWT tokens                                    │  │
│  │  - RLS policies                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### TypeScript Interfaces

```typescript
// User Types
interface User {
  id: string;
  email: string;
  role: 'admin' | 'organization' | 'community' | 'individual';
  forest_preference?: 'kakamega' | 'karura' | 'mau';
  created_at: string;
  profile?: UserProfile;
}

interface UserProfile {
  full_name: string;
  phone?: string;
  organization?: string;
  location?: string;
  avatar_url?: string;
}

// Auth Operations
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  phone?: string;
  organization?: string;
  location?: string;
}

interface AuthResponse {
  user: User | null;
  error: Error | null;
}
```

### Auth Service API

```typescript
// src/services/auth.service.ts

class AuthService {
  // Registration
  async register(data: RegisterData): Promise<AuthResponse>
  
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  
  // Logout
  async logout(): Promise<{ error: Error | null }>
  
  // Session Management
  async getCurrentUser(): Promise<User | null>
  async getSession(): Promise<Session | null>
  onAuthStateChange(callback: (user: User | null) => void)
  
  // Password Reset
  async requestPasswordReset(email: string): Promise<{ error: Error | null }>
  async updatePassword(newPassword: string): Promise<{ error: Error | null }>
  
  // Role Checking
  hasRole(user: User | null, role: UserRole): boolean
  hasAnyRole(user: User | null, roles: UserRole[]): boolean
  isAdmin(user: User | null): boolean
  isOrganization(user: User | null): boolean
}

export const authService = new AuthService();
```

### useAuth Hook

```typescript
// src/hooks/useAuth.ts

interface UseAuthReturn {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Methods
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Role Checking
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isOrganization: () => boolean;
  
  // Utilities
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn;
```

### Usage Examples

**Registration**:
```typescript
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
  const { register, loading } = useAuth();
  
  const handleSubmit = async (data: RegisterData) => {
    const { success, error } = await register(data);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(error);
    }
  };
  
  return <RegisterForm onSubmit={handleSubmit} loading={loading} />;
}
```

**Protected Routes**:
```typescript
import { ProtectedRoute } from '../components/auth';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

// With role requirements
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

**Role-Based UI**:
```typescript
function DashboardPage() {
  const { user, isAdmin, hasRole } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user?.profile?.full_name}</h1>
      
      {isAdmin() && <AdminPanel />}
      {hasRole('organization') && <OrgDashboard />}
    </div>
  );
}
```

---

## Database Schema

### Overview

The database consists of **20 tables** organized into 5 functional areas:
1. **Core**: Users, profiles, initiatives, trees
2. **Marketplace**: Carbon credits, transactions
3. **Web3**: Wallets, crypto donations, NFT badges
4. **Gamification**: Points, achievements, quests, referrals
5. **System**: Notifications

### Entity Relationship Diagram

```
users (1) ──────< (M) user_profiles
  │
  ├──< initiatives (organization_id)
  │     │
  │     ├──< initiative_participants
  │     ├──< trees
  │     └──< carbon_credits
  │
  ├──< transactions (buyer_id)
  ├──< web3_wallets
  ├──< crypto_donations
  ├──< nft_badges (user_id)
  ├──< user_gamification (1:1)
  ├──< gamified_actions
  ├──< user_achievements
  ├──< quest_participants
  └──< referrals (referrer_id, referee_id)
```

### Core Tables

**users**:
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

**user_profiles**:
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

### Indexes

**Performance Indexes** (80+ total):
- Primary key indexes (automatic)
- Foreign key indexes
- Query optimization indexes
- Geospatial GIST indexes
- Partial indexes for filtered queries

Example:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
```

### Row Level Security (RLS)

**Policy Examples**:
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can view active initiatives
CREATE POLICY "Anyone can view active initiatives"
  ON initiatives FOR SELECT
  USING (status = 'active' OR auth.uid() = organization_id);

-- Only organizations can create initiatives
CREATE POLICY "Organizations can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id AND 
    (SELECT role FROM users WHERE id = auth.uid()) = 'organization'
  );
```

---

## Onboarding Chatbot System

### Overview

The Onboarding Chatbot is an **AI-powered conversational interface** that:
- Guides new users through profile completion after registration
- Answers 27 frequently asked questions
- Provides context-aware responses
- Escalates complex queries to human support

**Status**: 📋 Planned for Sprint 6 (Week 13+)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ ChatWidget   │  │ProfileCompletion│ │QuickActions│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ChatEngine (Orchestration)                      │  │
│  │  - Query processing                              │  │
│  │  - Mode switching (FAQ / Profile Completion)    │  │
│  │  - Response generation                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Semantic    │  │   Context    │  │  Response    │
│  Matcher     │  │   Manager    │  │  Generator   │
│  (TF-IDF)    │  │  (History)   │  │(Personalize) │
└──────────────┘  └──────────────┘  └──────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Knowledge    │  │ Conversation │  │   Support    │ │
│  │ Base (JSON)  │  │ State (Local)│  │ Tickets (DB) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Post-Registration Profile Completion (NEW)

**Feature**: Conversational profile setup after registration

**Flow**:
```
1. User registers with email/password
2. Chatbot auto-opens in profile completion mode
3. Chatbot greets user: "Hi [Name]! Let's set up your profile..."
4. Chatbot asks questions sequentially:
   - "What's your full name?"
   - "What type of account? (Individual/Community/Organization)"
   - "Which forest interests you? (Kakamega/Karura/Mau)"
   - "Phone number? (optional)"
   - "Where are you located? (optional)"
   - "Organization name?" (if applicable)
5. User answers conversationally
6. Chatbot validates each answer
7. Profile saved to database
8. Chatbot transitions to general help mode
```

**Benefits**:
- ✅ Reduced registration friction (email/password only initially)
- ✅ Conversational, friendly onboarding
- ✅ Progressive disclosure of information
- ✅ Higher completion rates expected (80%+ vs ~50%)
- ✅ Immediate engagement with chatbot

### TypeScript Interfaces

```typescript
// Chat Widget
interface ChatWidgetProps {
  mode?: 'faq' | 'profile-completion';
  userId?: string;
  userEmail?: string;
  onProfileComplete?: (profile: UserProfile) => void;
}

// Profile Completion Flow
interface ProfileCompletionFlowProps {
  userId: string;
  userEmail: string;
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

interface ProfileQuestion {
  id: string;
  question: string;
  fieldName: keyof UserProfile | 'role' | 'forest_preference';
  fieldType: 'text' | 'select' | 'tel';
  options?: string[];
  required: boolean;
  validation?: (value: string) => boolean;
}

// Chat Engine
interface ChatEngineService {
  processQuery(query: string, context: ConversationContext): Promise<ChatResponse>;
  startProfileCompletion(userId: string): Promise<ProfileQuestion>;
  submitProfileAnswer(questionId: string, answer: string): Promise<ProfileQuestion | null>;
  completeProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean>;
}

// Semantic Matcher
interface SemanticMatcher {
  findBestMatch(query: string): Promise<MatchResult>;
  rankMatches(query: string, candidates: FAQEntry[]): RankedMatch[];
}

interface MatchResult {
  question: string;
  answer: string;
  confidence: number;
  relatedQuestions: string[];
}

// Context Manager
interface ContextManager {
  addMessage(role: 'user' | 'assistant', content: string): void;
  getContext(): ConversationContext;
  clearContext(): void;
}

interface ConversationContext {
  messages: Message[];
  userId?: string;
  mode: 'faq' | 'profile-completion';
  profileData?: Partial<UserProfile>;
}

// Response Generator
interface ResponseGenerator {
  generateResponse(match: MatchResult, context: ConversationContext): GeneratedResponse;
  personalizeResponse(response: string, user: User): string;
}

interface GeneratedResponse {
  text: string;
  quickActions?: QuickAction[];
  relatedQuestions?: string[];
}

// Escalation Handler
interface EscalationHandler {
  shouldEscalate(confidence: number, attemptCount: number): boolean;
  createSupportTicket(context: ConversationContext): Promise<SupportTicket>;
}

interface SupportTicket {
  id: string;
  userId: string;
  conversationHistory: Message[];
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}
```

### Knowledge Base Structure

```json
{
  "faqs": [
    {
      "id": "q1",
      "question": "What is Gang Green and how can I get involved?",
      "answer": "Gang Green is a platform connecting people with climate action projects...",
      "category": "getting-started",
      "keywords": ["about", "overview", "get started", "join"],
      "relatedQuestions": ["q2", "q6", "q7"]
    },
    {
      "id": "q2",
      "question": "How do I sign up as an individual?",
      "answer": "Click 'Sign Up', enter your email and password...",
      "category": "getting-started",
      "keywords": ["register", "sign up", "individual", "account"],
      "relatedQuestions": ["q1", "q3"]
    }
    // ... 25 more FAQs
  ]
}
```

### Profile Completion Questions

```typescript
const PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: 'full_name',
    question: "What's your full name?",
    fieldName: 'full_name',
    fieldType: 'text',
    required: true,
    validation: (value) => value.length >= 2
  },
  {
    id: 'role',
    question: "What type of account would you like? (Individual, Community Member, or Organization)",
    fieldName: 'role',
    fieldType: 'select',
    options: ['individual', 'community', 'organization'],
    required: true
  },
  {
    id: 'forest_preference',
    question: "Which forest interests you most? (Kakamega, Karura, or Mau)",
    fieldName: 'forest_preference',
    fieldType: 'select',
    options: ['kakamega', 'karura', 'mau'],
    required: false
  },
  {
    id: 'phone',
    question: "What's your phone number? (optional - you can skip this)",
    fieldName: 'phone',
    fieldType: 'tel',
    required: false,
    validation: (value) => !value || /^\+?[\d\s-()]+$/.test(value)
  },
  {
    id: 'location',
    question: "Where are you located? (optional)",
    fieldName: 'location',
    fieldType: 'text',
    required: false
  },
  {
    id: 'organization',
    question: "What's your organization name?",
    fieldName: 'organization',
    fieldType: 'text',
    required: false, // Required only if role === 'organization'
    validation: (value, profile) => profile.role !== 'organization' || !!value
  }
];
```

### Implementation Example

```typescript
// src/services/chatbot.service.ts

class ChatbotService {
  private currentQuestionIndex = 0;
  private profileData: Partial<UserProfile> = {};
  
  async startProfileCompletion(userId: string, userEmail: string): Promise<ProfileQuestion> {
    this.currentQuestionIndex = 0;
    this.profileData = {};
    return PROFILE_QUESTIONS[0];
  }
  
  async submitProfileAnswer(
    questionId: string,
    answer: string,
    userId: string
  ): Promise<ProfileQuestion | null> {
    const question = PROFILE_QUESTIONS.find(q => q.id === questionId);
    if (!question) throw new Error('Invalid question ID');
    
    // Validate answer
    if (question.validation && !question.validation(answer, this.profileData)) {
      throw new Error('Invalid answer');
    }
    
    // Store answer
    this.profileData[question.fieldName] = answer;
    
    // Move to next question
    this.currentQuestionIndex++;
    
    // Check if done
    if (this.currentQuestionIndex >= PROFILE_QUESTIONS.length) {
      await this.saveProfile(userId);
      return null; // Profile complete
    }
    
    // Return next question
    return PROFILE_QUESTIONS[this.currentQuestionIndex];
  }
  
  private async saveProfile(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...this.profileData,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Also update users table if role or forest_preference provided
    if (this.profileData.role || this.profileData.forest_preference) {
      await supabase
        .from('users')
        .update({
          role: this.profileData.role,
          forest_preference: this.profileData.forest_preference,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }
  }
}

export const chatbotService = new ChatbotService();
```

### Integration with Registration

```typescript
// src/pages/RegisterPage.tsx

function RegisterPage() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const handleRegistrationSuccess = (user: User) => {
    setUserId(user.id);
    setShowChatbot(true); // Auto-open chatbot
  };
  
  const handleProfileComplete = (profile: UserProfile) => {
    setShowChatbot(false);
    navigate('/dashboard');
  };
  
  return (
    <div>
      <RegisterForm onSuccess={handleRegistrationSuccess} />
      
      {showChatbot && userId && (
        <ChatWidget
          mode="profile-completion"
          userId={userId}
          onProfileComplete={handleProfileComplete}
        />
      )}
    </div>
  );
}
```

### Performance Targets

- **Query Processing**: < 500ms (95th percentile)
- **Knowledge Base Load**: < 2 seconds
- **UI Render**: < 100ms
- **Memory Usage**: < 50MB for 20 messages
- **Profile Completion Time**: < 2 minutes average

### Security Features

- **Input Sanitization**: XSS prevention
- **Rate Limiting**: 10 queries/minute per user
- **DOMPurify**: Markdown rendering safety
- **Data Privacy**: No sensitive data logged
- **Anonymization**: Support tickets anonymized

### Accessibility

- **WCAG 2.1 AA Compliant**
- **Full Keyboard Navigation**
- **Screen Reader Compatible**
- **Focus Trap**: When chatbot open
- **High Contrast Mode**: Available

---

## Testing Strategy

### Test Infrastructure (✅ Implemented)

**Framework**: Vitest + Testing Library + jsdom

**Configuration** (`vitest.config.ts`):
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

**Setup** (`src/test/setup.ts`):
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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

### Test Coverage

**Current Status**:
- **Total Tests**: 25+
- **Pass Rate**: 100%
- **Coverage**: ~60% (target: 80%)

**Test Files**:
- `src/services/auth.service.test.ts` (15+ tests)
- `src/components/auth/LoginForm.test.tsx` (7 tests)
- `src/components/auth/RegisterForm.test.tsx` (8 tests)

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

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
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

---

## API Integration

### Supabase Client

```typescript
// src/services/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Queries

```typescript
// Fetch initiatives
const { data, error } = await supabase
  .from('initiatives')
  .select('*')
  .eq('forest', 'kakamega')
  .eq('status', 'active');

// Insert tree
const { data, error } = await supabase
  .from('trees')
  .insert({
    initiative_id: initiativeId,
    species: 'Acacia',
    planted_date: new Date().toISOString(),
    location: `POINT(${lng} ${lat})`,
    planted_by: userId
  });

// Real-time subscription
const subscription = supabase
  .channel('initiatives')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'initiatives'
  }, (payload) => {
    console.log('New initiative:', payload.new);
  })
  .subscribe();
```

---

## Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Database Deployment (Supabase)

**Option 1: Dashboard** (Recommended):
1. Go to https://app.supabase.com
2. Select project: `wobpryllvdjaapzjbsxx`
3. Open SQL Editor
4. Copy content of `supabase/migrations/000_all_migrations.sql`
5. Paste and run
6. Repeat for `010_rls_policies.sql`
7. Create storage buckets via Storage UI

**Option 2: CLI**:
```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref wobpryllvdjaapzjbsxx

# Push migrations
npx supabase db push
```

---

## Summary

The #GangGreen platform is built on a modern, scalable architecture with:

✅ **Completed**:
- React + TypeScript + Vite setup
- Supabase integration
- Complete authentication system
- Test infrastructure
- Database schema design

🚧 **In Progress**:
- Authentication tests (60% complete)
- Database migration execution

📋 **Planned**:
- Core features (initiatives, trees, monitoring)
- Onboarding chatbot with profile completion
- Carbon credit marketplace
- Web3 integration
- Gamification system

**Next Steps**: Complete authentication tests, execute database migrations, begin core feature development.

---

**Document Version**: 1.4  
**Last Updated**: November 14, 2025  
**Next Update**: Upon Sprint 2 completion or major feature implementation

