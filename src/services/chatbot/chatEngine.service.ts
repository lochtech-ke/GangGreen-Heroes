import { knowledgeBaseManager } from './knowledgeBaseManager';
import { semanticMatcher } from './semanticMatcher';
import { contextManager } from './contextManager';
import { queryProcessor } from './queryProcessor';
import { responseGenerator } from './responseGenerator';
import { escalationHandler } from './escalationHandler';
import { onboardingFlowManager } from './onboardingFlowManager';
import { analyticsTracker } from './analyticsTracker';
import type { ChatResponse, Message } from '../../types/chatbot.types';

/**
 * ChatEngine
 * Main orchestration service for the chatbot
 */
class ChatEngine {
  private isInitialized = false;

  /**
   * Initialize the chat engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load knowledge base
      await knowledgeBaseManager.loadKnowledgeBase();
      this.isInitialized = true;
      console.log('Chat engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chat engine:', error);
      throw error;
    }
  }

  /**
   * Initialize a new conversation
   */
  initializeConversation(
    mode: 'general' | 'onboarding' = 'general',
    userId?: string
  ): string {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    contextManager.initializeContext(conversationId, userId);
    contextManager.setMode(conversationId, mode);
    
    // Track chatbot opened
    analyticsTracker.trackChatbotOpened(conversationId, userId);
    
    return conversationId;
  }

  /**
   * Start onboarding flow
   */
  async startOnboarding(
    userId: string,
    email: string,
    conversationId: string
  ): Promise<ChatResponse> {
    // Set conversation to onboarding mode
    const session = onboardingFlowManager.startOnboarding(userId, email);
    contextManager.setMode(conversationId, 'onboarding', session.sessionId);

    // Track onboarding started
    await analyticsTracker.trackOnboardingStarted(conversationId, userId);

    // Get welcome message
    const welcomeMessage = onboardingFlowManager.getWelcomeMessage(email);

    // Add bot message to context
    const botMessage: Message = {
      id: `msg_${Date.now()}`,
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
    };
    contextManager.addMessage(conversationId, botMessage);

    return {
      answer: welcomeMessage,
      confidence: 100,
      requiresEscalation: false,
      onboardingProgress: onboardingFlowManager.getOnboardingProgress(session.sessionId),
      isOnboardingComplete: false,
    };
  }

  /**
   * Process onboarding response
   */
  async processOnboardingResponse(
    response: string,
    conversationId: string
  ): Promise<ChatResponse> {
    const context = contextManager.getContext(conversationId);

    if (!context || !context.onboardingSessionId) {
      return {
        answer: 'Session not found. Please start over.',
        confidence: 0,
        requiresEscalation: true,
      };
    }

    // Add user message to context
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: response,
      sender: 'user',
      timestamp: new Date(),
    };
    contextManager.addMessage(conversationId, userMessage);

    // Check if user wants to skip
    if (queryProcessor.isSkipRequest(response)) {
      const skipResult = onboardingFlowManager.skipCurrentStep(
        context.onboardingSessionId
      );

      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: skipResult.message,
        sender: 'bot',
        timestamp: new Date(),
      };
      contextManager.addMessage(conversationId, botMessage);

      // Check if onboarding is complete
      if (skipResult.nextStep === 'complete') {
        const completionResult = await onboardingFlowManager.completeOnboarding(
          context.onboardingSessionId
        );

        if (completionResult.success) {
          // Switch to general mode
          contextManager.setMode(conversationId, 'general');

          return {
            answer: skipResult.message,
            confidence: 100,
            requiresEscalation: false,
            isOnboardingComplete: true,
          };
        }
      }

      return {
        answer: skipResult.message,
        confidence: 100,
        requiresEscalation: false,
        onboardingProgress: onboardingFlowManager.getOnboardingProgress(
          context.onboardingSessionId
        ),
        isOnboardingComplete: false,
      };
    }

    // Process the response
    const result = onboardingFlowManager.processOnboardingResponse(
      context.onboardingSessionId,
      response
    );

    const botMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      text: result.message,
      sender: 'bot',
      timestamp: new Date(),
    };
    contextManager.addMessage(conversationId, botMessage);

    // Check if onboarding is complete
    if (result.nextStep === 'complete') {
      const completionResult = await onboardingFlowManager.completeOnboarding(
        context.onboardingSessionId
      );

      if (completionResult.success) {
        // Track onboarding completed
        const duration = Date.now() - new Date(context.startTime).getTime();
        await analyticsTracker.trackOnboardingCompleted(conversationId, context.userId!, duration);

        // Switch to general mode
        contextManager.setMode(conversationId, 'general');

        return {
          answer: result.message,
          confidence: 100,
          requiresEscalation: false,
          isOnboardingComplete: true,
        };
      } else {
        return {
          answer: `There was an error saving your profile: ${completionResult.error}. Please try again or contact support.`,
          confidence: 0,
          requiresEscalation: true,
        };
      }
    }

    return {
      answer: result.message,
      confidence: 100,
      requiresEscalation: false,
      onboardingProgress: onboardingFlowManager.getOnboardingProgress(
        context.onboardingSessionId
      ),
      isOnboardingComplete: false,
    };
  }

  /**
   * Process a general query
   */
  async processQuery(
    query: string,
    conversationId: string
  ): Promise<ChatResponse> {
    try {
      // Ensure initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get or create context
      let context = contextManager.getContext(conversationId);
      if (!context) {
        context = contextManager.initializeContext(conversationId);
      }

      // Add user message to context
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        text: query,
        sender: 'user',
        timestamp: new Date(),
      };
      contextManager.addMessage(conversationId, userMessage);

      // Track query sent
      await analyticsTracker.trackQuerySent(conversationId, query, context.userId);

      // Handle greetings
      if (queryProcessor.isGreeting(query)) {
        const greeting = responseGenerator.generateGreeting(context);
        const botMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          text: greeting,
          sender: 'bot',
          timestamp: new Date(),
        };
        contextManager.addMessage(conversationId, botMessage);

        return {
          answer: greeting,
          confidence: 100,
          requiresEscalation: false,
          suggestedActions: this.getDefaultQuickActions(),
        };
      }

      // Handle farewells
      if (queryProcessor.isFarewell(query)) {
        const farewell = responseGenerator.generateFarewell();
        const botMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          text: farewell,
          sender: 'bot',
          timestamp: new Date(),
        };
        contextManager.addMessage(conversationId, botMessage);

        return {
          answer: farewell,
          confidence: 100,
          requiresEscalation: false,
        };
      }

      // Process query
      const processedQuery = queryProcessor.process(query, context);

      // Update context with intent
      contextManager.updateIntent(conversationId, processedQuery.intent);

      // Get knowledge base
      const knowledgeBase = await knowledgeBaseManager.loadKnowledgeBase();

      // Find best match
      const matchResult = semanticMatcher.findBestMatch(query, knowledgeBase);

      if (!matchResult) {
        // No match found
        const fallback = responseGenerator.generateFallback(query);
        const botMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          text: fallback,
          sender: 'bot',
          timestamp: new Date(),
        };
        contextManager.addMessage(conversationId, botMessage);

        escalationHandler.trackEscalation(conversationId, 'low-confidence');

        return {
          answer: fallback,
          confidence: 0,
          requiresEscalation: true,
          suggestedActions: this.getDefaultQuickActions(),
        };
      }

      // Check if escalation is needed
      const needsEscalation = escalationHandler.shouldEscalate(
        matchResult.confidence,
        conversationId
      );

      let answer: string;
      let requiresEscalation = false;

      if (needsEscalation) {
        // Low confidence response
        answer = responseGenerator.generateLowConfidenceResponse(matchResult);
        requiresEscalation = true;
        escalationHandler.trackEscalation(conversationId, 'low-confidence');
      } else {
        // Generate response
        const generatedResponse = responseGenerator.generate(matchResult, context);
        answer = generatedResponse.text;

        // Reset escalation attempts on successful response
        escalationHandler.resetAttempts(conversationId);
      }

      // Add bot message to context
      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: answer,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          confidence: matchResult.confidence,
          matchedQuestion: matchResult.entry.question,
        },
      };
      contextManager.addMessage(conversationId, botMessage);

      // Generate response with actions
      const generatedResponse = responseGenerator.generate(matchResult, context);

      // Track response generated
      await analyticsTracker.trackResponseGenerated(
        conversationId,
        matchResult.confidence,
        processedQuery.intent,
        context.userId
      );

      // Track escalation if needed
      if (requiresEscalation) {
        await analyticsTracker.trackEscalation(
          conversationId,
          'low-confidence',
          context.userId
        );
      }

      return {
        answer,
        confidence: matchResult.confidence,
        matchedQuestion: matchResult.entry.question,
        suggestedActions: generatedResponse.followUpActions,
        requiresEscalation,
      };
    } catch (error) {
      console.error('Error processing query:', error);

      return {
        answer:
          'I encountered an error processing your request. Please try again or contact support.',
        confidence: 0,
        requiresEscalation: true,
      };
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId: string): Message[] {
    return contextManager.getMessageHistory(conversationId);
  }

  /**
   * Check if conversation is in onboarding mode
   */
  isOnboardingMode(conversationId: string): boolean {
    return contextManager.isOnboardingMode(conversationId);
  }

  /**
   * Clear conversation
   */
  clearConversation(conversationId: string): void {
    contextManager.clearContext(conversationId);
  }

  /**
   * Get engine statistics
   */
  getStats(): {
    isInitialized: boolean;
    knowledgeBaseStats: ReturnType<typeof knowledgeBaseManager.getStats>;
    contextStats: ReturnType<typeof contextManager.getStats>;
    escalationStats: ReturnType<typeof escalationHandler.getEscalationStats>;
  } {
    return {
      isInitialized: this.isInitialized,
      knowledgeBaseStats: knowledgeBaseManager.getStats(),
      contextStats: contextManager.getStats(),
      escalationStats: escalationHandler.getEscalationStats(),
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Get default quick actions
   */
  private getDefaultQuickActions() {
    return [
      {
        id: 'action-getting-started',
        label: 'Getting Started',
        query: 'How do I get started with Gang Green?',
        category: 'getting-started' as const,
      },
      {
        id: 'action-find-projects',
        label: 'Find Projects',
        query: 'How do I find projects?',
        category: 'projects' as const,
      },
      {
        id: 'action-support',
        label: 'Contact Support',
        query: 'How do I contact support?',
        category: 'support' as const,
      },
    ];
  }
}

// Export singleton instance
export const chatEngine = new ChatEngine();
