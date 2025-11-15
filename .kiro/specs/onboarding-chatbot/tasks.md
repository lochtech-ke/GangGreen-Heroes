# Implementation Plan

- [ ] 0. Simplify registration form and prepare for onboarding integration
  - Update RegisterForm to only collect email and password
  - Modify registration success handler to trigger chatbot onboarding
  - Update auth service to return user ID and email on registration
  - _Requirements: 0.1, 0.2_

- [ ] 0.1 Simplify RegisterForm component
  - Remove all fields except email, password, and confirm password from RegisterForm.tsx
  - Remove validation logic for optional fields (name, role, phone, location, organization)
  - Update form layout to be more compact with only essential fields
  - Keep error handling and loading states
  - _Requirements: 0.1_

- [ ] 0.2 Update registration success flow
  - Modify RegisterPage.tsx to accept userId and email from registration
  - Add state management for chatbot onboarding trigger
  - Pass onboarding props to ChatWidget component
  - Prevent redirect to dashboard until onboarding is complete
  - _Requirements: 0.2, 0.8_

- [ ] 0.3 Update auth service registration response
  - Ensure authService.register() returns userId and email on success
  - Update RegisterData type to only require email and password
  - Remove profile creation from registration flow (will be done by chatbot)
  - _Requirements: 0.1, 0.7_

- [ ] 1. Set up project structure and data foundation
  - Create directory structure for chatbot components and services
  - Add knowledge base JSON file with the 20 FAQ entries
  - Define TypeScript interfaces and types for all data models
  - _Requirements: 11.1, 11.2_

- [x] 1.1 Create chatbot directory structure


  - Create `src/components/chatbot/` directory
  - Create `src/services/chatbot/` directory
  - Create `src/types/chatbot.types.ts` file
  - Create `src/data/` directory for knowledge base
  - _Requirements: 11.1_




- [ ] 1.2 Add knowledge base JSON file
  - Create `src/data/chatbot-knowledge-base.json` with the 20 FAQ entries provided


  - Add category and keywords fields to each entry for better matching
  - Validate JSON structure
  - _Requirements: 11.1, 11.2_

- [ ] 1.3 Define core TypeScript interfaces
  - Define `Message`, `ConversationContext`, `KnowledgeBaseEntry` interfaces in `src/types/chatbot.types.ts`
  - Define `ChatResponse`, `MatchResult`, `Intent` types



  - Define `QuickAction`, `ProcessedQuery` interfaces
  - Define `OnboardingSession`, `OnboardingStep`, `OnboardingStepResult` interfaces
  - Define `ProfileCompletionResult`, `OnboardingProgress` interfaces
  - Export all types for use across components
  - _Requirements: 11.1, 0.3_

- [ ] 1.4 Implement OnboardingFlowManager service
  - Create `src/services/chatbot/onboardingFlowManager.ts`
  - Implement `startOnboarding()` to initialize onboarding session
  - Implement `processOnboardingResponse()` to handle user answers and validate inputs
  - Implement step progression logic (welcome → full_name → role → forest_preference → phone → location → organization → complete)
  - Add validation for each field (email format, role options, forest options)
  - Implement `skipCurrentStep()` for optional fields
  - Implement `completeOnboarding()` to save profile to Supabase
  - Add `getOnboardingProgress()` to track completion percentage
  - _Requirements: 0.3, 0.4, 0.5, 0.6, 0.7_

- [ ] 1.5 Write unit tests for onboarding flow
  - Test onboarding session initialization
  - Test step progression and validation
  - Test skip logic for optional fields
  - Test profile completion and database save
  - Test error handling for invalid inputs
  - _Requirements: 0.4, 0.5, 0.7_

- [ ] 2. Implement knowledge base manager and semantic matcher
  - Build knowledge base loading and caching system
  - Implement semantic matching algorithm with similarity scoring
  - Add validation for knowledge base structure
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 2.1 Implement KnowledgeBaseManager service


  - Create `src/services/chatbot/knowledgeBaseManager.ts`
  - Implement `loadKnowledgeBase()` to fetch and parse JSON
  - Implement in-memory caching with `reloadKnowledgeBase()` for hot-reload
  - Add `validateKnowledgeBase()` to check JSON structure
  - _Requirements: 11.3, 11.5_

- [x] 2.2 Implement SemanticMatcher service



  - Create `src/services/chatbot/semanticMatcher.ts`
  - Implement `calculateSimilarity()` using TF-IDF and cosine similarity
  - Implement `findBestMatch()` to return highest confidence match
  - Add fuzzy string matching for typo tolerance
  - Implement `rankMatches()` to return top 3 matches
  - _Requirements: 11.4, 1.2_

- [ ] 2.3 Write unit tests for knowledge base and matching
  - Test knowledge base loading and validation
  - Test semantic matching with various query phrasings
  - Test similarity scoring accuracy
  - Test fuzzy matching for common typos
  - _Requirements: 11.4_

- [ ] 3. Implement context management and query processing
  - Build conversation context tracking system
  - Implement query preprocessing and intent extraction
  - Add session timeout handling
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 3.1 Implement ContextManager service


  - Create `src/services/chatbot/contextManager.ts`
  - Implement `addMessage()` and `getContext()` for conversation history
  - Implement context storage with 5-message history limit
  - Add `isContextExpired()` with 20-minute timeout check
  - Implement localStorage persistence for conversation state
  - Add support for onboarding mode tracking in context
  - Store onboarding session ID and progress in context
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 0.3_

- [x] 3.2 Implement QueryProcessor service



  - Create `src/services/chatbot/queryProcessor.ts`
  - Implement `normalizeQuery()` to clean and standardize input
  - Implement `extractIntent()` to categorize query type
  - Add entity extraction for user types, project types, locations
  - Implement `process()` to orchestrate preprocessing pipeline
  - _Requirements: 9.2, 9.3_

- [ ] 3.3 Write unit tests for context and query processing
  - Test context storage and retrieval
  - Test session timeout logic
  - Test query normalization with various inputs
  - Test intent extraction accuracy
  - _Requirements: 9.1, 9.4_

- [ ] 4. Implement response generation and escalation handling
  - Build response formatting and personalization system
  - Implement escalation detection logic
  - Add support ticket creation functionality
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 4.1 Implement ResponseGenerator service


  - Create `src/services/chatbot/responseGenerator.ts`
  - Implement `generate()` to format responses from knowledge base
  - Implement `personalize()` to add context-aware customization
  - Implement `addFollowUps()` to suggest related questions
  - Add logic to generate quick action buttons based on response
  - _Requirements: 1.2, 9.2_

- [x] 4.2 Implement EscalationHandler service


  - Create `src/services/chatbot/escalationHandler.ts`
  - Implement `shouldEscalate()` with 70% confidence threshold
  - Implement `createSupportTicket()` to store in Supabase
  - Implement `getContactInfo()` to return support email and hours
  - Add `trackEscalation()` for analytics
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 4.3 Create Supabase support_tickets table



  - Write migration to create `support_tickets` table
  - Add columns: id, conversation_id, user_id, message_history, priority, category, created_at
  - Add RLS policies for support team access
  - _Requirements: 10.3_

- [ ] 4.4 Write unit tests for response generation and escalation
  - Test response formatting and personalization
  - Test escalation threshold logic
  - Test support ticket creation
  - Test follow-up suggestion generation
  - _Requirements: 10.1, 10.4_

- [ ] 5. Implement chat engine orchestration service
  - Build main chat engine to coordinate all services
  - Implement conversation initialization and management
  - Add error handling and fallback responses
  - _Requirements: 1.1, 1.2, 8.1, 8.2, 8.3_

- [x] 5.1 Implement ChatEngine service



  - Create `src/services/chatbot/chatEngine.service.ts`
  - Implement `processQuery()` to orchestrate full pipeline for general queries
  - Implement `processOnboardingResponse()` to handle onboarding flow responses
  - Implement `initializeConversation()` with mode parameter ('general' or 'onboarding')
  - Implement `startOnboarding()` to begin post-registration profile completion
  - Implement `getConversationHistory()` to retrieve past messages
  - Add `isOnboardingMode()` to check if conversation is in onboarding
  - Add error handling for each pipeline stage with fallback responses
  - Route messages to OnboardingFlowManager when in onboarding mode
  - _Requirements: 1.1, 1.2, 8.1, 8.2, 0.2, 0.3_

- [x] 5.2 Add analytics tracking to chat engine



  - Implement event tracking for query sent, response generated, escalation
  - Create `src/services/chatbot/analyticsTracker.ts`
  - Integrate with existing analytics service
  - Store events in Supabase `chatbot_analytics` table
  - _Requirements: 8.1_

- [x] 5.3 Create Supabase chatbot_analytics table


  - Write migration to create `chatbot_analytics` table
  - Add columns: id, event_type, conversation_id, user_id, timestamp, metadata
  - Add indexes for efficient querying
  - _Requirements: 8.1_

- [ ] 5.4 Write integration tests for chat engine
  - Test complete query-to-response pipeline
  - Test onboarding flow from start to completion
  - Test mode switching between general and onboarding
  - Test error handling and fallback responses
  - Test analytics event tracking
  - Test conversation initialization and history retrieval
  - _Requirements: 1.1, 1.2, 8.1, 0.8_

- [x] 6. Build chat widget UI components



  - Create main chat widget component with open/close functionality
  - Implement message display component
  - Add quick actions component
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2_

- [x] 6.1 Create ChatWidget component


  - Create `src/components/chatbot/ChatWidget.tsx`
  - Implement open/close toggle with minimize/maximize states
  - Add message list with auto-scroll to bottom
  - Implement text input with submit on Enter key
  - Add typing indicator display
  - Add onboarding progress bar when in onboarding mode
  - Accept autoStartOnboarding, userId, and userEmail props
  - Automatically initialize onboarding flow when autoStartOnboarding is true
  - Disable close button during onboarding to ensure completion
  - Style with Tailwind CSS (bottom-right positioning, shadow, rounded corners)
  - _Requirements: 1.1, 9.1, 0.1, 0.2_

- [x] 6.2 Create Message component


  - Create `src/components/chatbot/Message.tsx`
  - Implement user vs bot message styling (different colors/alignment)
  - Add timestamp display
  - Implement markdown rendering for bot responses using react-markdown
  - Add message fade-in animation
  - _Requirements: 1.1, 1.2_


- [x] 6.3 Create QuickActions component

  - Create `src/components/chatbot/QuickActions.tsx`
  - Implement button grid for suggested actions
  - Add click handlers to populate input with query
  - Style buttons with green border and hover effects
  - Implement dynamic action updates based on conversation context
  - _Requirements: 3.1, 3.2, 3.3_



- [x] 6.4 Add chat widget toggle button

  - Create floating action button in bottom-right corner
  - Add message icon and notification badge
  - Implement click handler to open/close chat widget
  - Add pulse animation for first-time users
  - _Requirements: 1.1_

- [x] 6.5 Write component tests for UI


  - Test ChatWidget rendering and interactions
  - Test onboarding mode initialization
  - Test progress bar display during onboarding
  - Test Message component with user and bot messages
  - Test QuickActions button clicks
  - Test keyboard navigation and accessibility
  - _Requirements: 1.1, 0.2_

- [ ] 7. Implement responsive design and accessibility
  - Add mobile-responsive layouts
  - Implement keyboard navigation
  - Add ARIA labels and screen reader support
  - _Requirements: 1.1_

- [ ] 7.1 Add responsive breakpoints
  - Implement full-screen overlay for mobile (<768px)
  - Adjust widget size for tablet (768px-1024px)
  - Ensure touch targets are minimum 44px on mobile
  - Add bottom sheet drag-to-close on mobile
  - _Requirements: 1.1_

- [ ] 7.2 Implement accessibility features
  - Add ARIA labels to all interactive elements
  - Implement focus trap when widget is open
  - Add keyboard shortcuts (Escape to close, Tab navigation)
  - Ensure color contrast meets WCAG AA standards
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: 1.1_

- [x] 8. Integrate chatbot with main application



  - Add chatbot to main app layout
  - Connect to Supabase for authentication context
  - Implement analytics integration
  - Add feature flag for enable/disable
  - _Requirements: 1.1, 2.1, 8.1_

- [x] 8.1 Add ChatWidget to RegisterPage.tsx


  - Import and render ChatWidget component in RegisterPage
  - Add state for chatbot onboarding trigger (isOpen, userId, email)
  - Update handleRegisterSuccess to set onboarding state
  - Pass autoStartOnboarding, userId, and userEmail props to ChatWidget
  - Delay dashboard redirect until onboarding is complete
  - _Requirements: 0.2, 0.8_

- [x] 8.2 Add ChatWidget to App.tsx for general use


  - Import and render ChatWidget component in main layout
  - Pass user authentication context from Supabase Auth
  - Initialize chat engine service on app load
  - Add feature flag check to conditionally render chatbot
  - Ensure chatbot is available on all pages after onboarding
  - _Requirements: 1.1_

- [x] 8.3 Connect authentication context


  - Pass logged-in user info to chat engine for personalization
  - Pre-fill support tickets with user details
  - Customize welcome message based on user type
  - Check if user has completed profile and skip onboarding if already done
  - _Requirements: 2.1, 10.3, 0.8_

- [x] 8.4 Integrate with analytics service


  - Connect chatbot analytics tracker to main analytics service
  - Track chatbot usage metrics (opens, queries, escalations)
  - Track onboarding completion rates and drop-off points
  - Track average time to complete onboarding
  - Add conversion tracking from registration to profile completion
  - _Requirements: 8.1, 0.8_

- [ ] 9. Add welcome flow and default quick actions
  - Implement welcome message on first open
  - Add default quick action buttons for common queries
  - Create category-based quick actions
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 9.1 Implement welcome message logic
  - Display welcome message when conversation starts
  - Include brief introduction to chatbot capabilities
  - Show 4-6 quick action buttons for common queries
  - Detect first-time users and show onboarding tips
  - _Requirements: 1.1_

- [ ] 9.2 Create default quick actions
  - Define quick actions for "Getting Started", "Find Projects", "How to Join", "Contact Support"
  - Organize actions by category (getting-started, projects, education, support)
  - Implement dynamic action updates based on conversation flow
  - _Requirements: 3.1, 3.2_

- [ ] 10. Implement error handling and fallback responses
  - Add error boundaries for component failures
  - Implement network error handling
  - Add fallback responses for low confidence matches
  - _Requirements: 8.1, 8.2, 8.3, 10.1_

- [ ] 10.1 Add error boundary component
  - Create `src/components/chatbot/ChatErrorBoundary.tsx`
  - Catch and display component errors gracefully
  - Provide fallback UI with contact information
  - Log errors to monitoring service
  - _Requirements: 8.1_

- [ ] 10.2 Implement network error handling
  - Add retry logic for failed knowledge base loads
  - Display offline indicator when network is unavailable
  - Queue messages for retry when connection restored
  - Show user-friendly error messages
  - _Requirements: 8.4_

- [ ] 10.3 Add low confidence response handling
  - Display disclaimer for matches below 70% confidence
  - Show "I'm not entirely sure, but..." prefix
  - Offer escalation option with every low confidence response
  - Suggest rephrasing or provide quick actions
  - _Requirements: 10.1, 8.3_

- [ ] 11. Add performance optimizations
  - Implement lazy loading for chat widget
  - Add virtual scrolling for long message histories
  - Optimize knowledge base caching
  - _Requirements: 11.3_

- [ ] 11.1 Implement lazy loading
  - Use React.lazy() to load ChatWidget component on demand
  - Load chat engine service only when widget is first opened
  - Defer analytics initialization until after first interaction
  - _Requirements: 11.3_

- [ ] 11.2 Add virtual scrolling for messages
  - Implement react-window for message list virtualization
  - Only render visible messages in DOM
  - Optimize for conversations with 50+ messages
  - _Requirements: 9.1_

- [ ] 11.3 Optimize knowledge base caching
  - Cache knowledge base in memory on first load
  - Implement service worker caching for offline support
  - Add cache invalidation on knowledge base updates
  - _Requirements: 11.3, 11.5_

- [ ] 12. Add security measures
  - Implement input sanitization
  - Add rate limiting
  - Sanitize markdown rendering
  - _Requirements: 1.1, 1.2_

- [ ] 12.1 Implement input sanitization
  - Sanitize all user input to prevent XSS attacks
  - Validate input length (max 500 characters)
  - Strip HTML tags from user messages
  - Use DOMPurify for markdown rendering in bot responses
  - _Requirements: 1.1, 1.2_

- [ ] 12.2 Add rate limiting
  - Limit queries to 10 per minute per user
  - Implement exponential backoff for rapid submissions
  - Display friendly message when rate limit reached
  - Track rate limit violations in analytics
  - _Requirements: 1.1_

- [ ] 13. End-to-end testing and validation
  - Test complete user flows
  - Validate response accuracy
  - Test escalation workflows
  - Test onboarding flow
  - Verify performance metrics
  - _Requirements: 1.1, 1.2, 10.1, 10.2, 0.8_

- [ ] 13.1 Write E2E tests for user flows
  - Test new user registration and onboarding flow
  - Test complete onboarding from start to profile save
  - Test skipping optional fields during onboarding
  - Test onboarding validation errors and retry
  - Test existing user asking about getting started
  - Test follow-up question with context
  - Test unclear question handling
  - Test low confidence escalation flow
  - Test explicit support request
  - _Requirements: 1.1, 1.2, 10.1, 10.2, 0.1, 0.8_

- [ ] 13.2 Validate response accuracy
  - Test all 20 FAQ questions with exact phrasing
  - Test variations and paraphrasing of questions
  - Verify confidence scores are appropriate
  - Test related question suggestions
  - _Requirements: 1.2, 11.4_

- [ ] 13.3 Performance validation
  - Measure query processing time (target <500ms)
  - Measure knowledge base load time (target <2s)
  - Measure UI render time (target <100ms)
  - Test memory usage with long conversations
  - _Requirements: 1.2, 11.3_
