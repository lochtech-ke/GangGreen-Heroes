// Chatbot Type Definitions
import { UserRole, ForestPreference, UserProfile } from './user.types';

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    confidence?: number;
    matchedQuestion?: string;
    escalated?: boolean;
  };
}

// ============================================================================
// Knowledge Base Types
// ============================================================================

export interface KnowledgeBaseEntry {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
  relatedQuestions?: string[];
}

// ============================================================================
// Conversation Context Types
// ============================================================================

export type Intent =
  | 'getting-started'
  | 'find-projects'
  | 'join-project'
  | 'education'
  | 'community'
  | 'verification'
  | 'sponsorship'
  | 'support'
  | 'unknown';

export interface ConversationContext {
  conversationId: string;
  userId?: string;
  messageHistory: Message[];
  topicsDiscussed: string[];
  lastIntent: Intent;
  startTime: Date;
  lastActivityTime: Date;
  userType?: 'individual' | 'corporate' | 'partner' | 'sponsor';
  mode?: 'general' | 'onboarding';
  onboardingSessionId?: string;
}


// ============================================================================
// Onboarding Types
// ============================================================================

export type OnboardingStep =
  | 'welcome'
  | 'full_name'
  | 'role'
  | 'forest_preference'
  | 'phone'
  | 'location'
  | 'organization'
  | 'complete';

export interface OnboardingSession {
  sessionId: string;
  userId: string;
  email: string;
  currentStep: OnboardingStep;
  collectedData: Partial<UserProfile & { role?: UserRole; forest_preference?: ForestPreference }>;
  startedAt: Date;
}

export interface OnboardingStepResult {
  message: string;
  nextStep: OnboardingStep;
  isValid: boolean;
  validationError?: string;
  progress: number; // 0-100
}

export interface ProfileCompletionResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
}

// ============================================================================
// Query Processing Types
// ============================================================================

export interface Entity {
  type: 'user-type' | 'project-type' | 'action' | 'location';
  value: string;
  confidence: number;
}

export interface ProcessedQuery {
  originalQuery: string;
  normalizedQuery: string;
  intent: Intent;
  entities: Entity[];
  context: ConversationContext;
}

// ============================================================================
// Matching Types
// ============================================================================

export interface MatchResult {
  entry: KnowledgeBaseEntry;
  confidence: number;
  similarityScore: number;
}

export interface RankedMatch {
  question: string;
  score: number;
  index: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  query: string;
  category: 'getting-started' | 'projects' | 'support' | 'education' | 'community' | 'verification' | 'sponsorship';
}

export interface GeneratedResponse {
  text: string;
  confidence: number;
  followUpActions: QuickAction[];
  relatedQuestions: string[];
  metadata: {
    sourceQuestion: string;
    personalized: boolean;
  };
}

export interface ChatResponse {
  answer: string;
  confidence: number;
  matchedQuestion?: string;
  suggestedActions?: QuickAction[];
  requiresEscalation: boolean;
  onboardingProgress?: OnboardingProgress;
  isOnboardingComplete?: boolean;
}

// ============================================================================
// Escalation Types
// ============================================================================

export type EscalationReason =
  | 'low-confidence'
  | 'user-request'
  | 'repeated-failure'
  | 'complex-query';

export interface SupportTicket {
  ticketId: string;
  conversationId: string;
  userId?: string;
  messageHistory: Message[];
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
}

export interface ContactInfo {
  email: string;
  expectedResponseTime: string;
  supportHours: string;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StoredConversation {
  conversationId: string;
  messages: Message[];
  context: ConversationContext;
  lastUpdated: Date;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface ChatbotAnalyticsEvent {
  eventType: string;
  conversationId: string;
  userId?: string;
  timestamp: Date;
  metadata: {
    query?: string;
    confidence?: number;
    intent?: Intent;
    escalationReason?: EscalationReason;
    actionId?: string;
    actionLabel?: string;
    messageCount?: number;
    durationSeconds?: number;
    step?: string;
    [key: string]: any; // Allow additional properties
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorResponse {
  error: true;
  message: string;
  fallbackAction?: QuickAction;
  contactInfo?: ContactInfo;
  retryable: boolean;
}
