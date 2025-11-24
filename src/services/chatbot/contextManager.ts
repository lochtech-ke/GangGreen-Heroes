import type { ConversationContext, Message, Intent } from '../../types/chatbot.types';

const STORAGE_KEY_PREFIX = 'ganggreen_chatbot_conversation_';
const MAX_MESSAGE_HISTORY = 5;
const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

/**
 * ContextManager
 * Manages conversation context, history, and session state
 */
class ContextManager {
  private contexts: Map<string, ConversationContext> = new Map();

  /**
   * Initialize a new conversation context
   */
  initializeContext(conversationId: string, userId?: string): ConversationContext {
    const context: ConversationContext = {
      conversationId,
      userId,
      messageHistory: [],
      topicsDiscussed: [],
      lastIntent: 'unknown',
      startTime: new Date(),
      lastActivityTime: new Date(),
      mode: 'general',
    };

    this.contexts.set(conversationId, context);
    this.saveToStorage(context);

    return context;
  }

  /**
   * Add a message to conversation history
   */
  addMessage(conversationId: string, message: Message): void {
    const context = this.getContext(conversationId);

    if (!context) {
      console.warn(`Context not found for conversation ${conversationId}`);
      return;
    }

    // Add message to history
    context.messageHistory.push(message);

    // Keep only last N messages
    if (context.messageHistory.length > MAX_MESSAGE_HISTORY) {
      context.messageHistory = context.messageHistory.slice(-MAX_MESSAGE_HISTORY);
    }

    // Update last activity time
    context.lastActivityTime = new Date();

    // Update context
    this.contexts.set(conversationId, context);
    this.saveToStorage(context);
  }

  /**
   * Get conversation context
   */
  getContext(conversationId: string): ConversationContext | null {
    // Check in-memory cache first
    let context = this.contexts.get(conversationId);

    // If not in memory, try to load from storage
    if (!context) {
      const loadedContext = this.loadFromStorage(conversationId);
      if (loadedContext) {
        this.contexts.set(conversationId, loadedContext);
        context = loadedContext;
      }
    }

    // Check if context is expired
    if (context && this.isContextExpired(conversationId)) {
      this.clearContext(conversationId);
      return null;
    }

    return context || null;
  }

  /**
   * Update conversation context
   */
  updateContext(
    conversationId: string,
    updates: Partial<ConversationContext>
  ): void {
    const context = this.getContext(conversationId);

    if (!context) {
      console.warn(`Context not found for conversation ${conversationId}`);
      return;
    }

    // Merge updates
    const updatedContext = {
      ...context,
      ...updates,
      lastActivityTime: new Date(),
    };

    this.contexts.set(conversationId, updatedContext);
    this.saveToStorage(updatedContext);
  }

  /**
   * Clear conversation context
   */
  clearContext(conversationId: string): void {
    this.contexts.delete(conversationId);
    this.removeFromStorage(conversationId);
  }

  /**
   * Check if context is expired
   */
  isContextExpired(conversationId: string): boolean {
    const context = this.contexts.get(conversationId);

    if (!context) {
      return true;
    }

    const now = new Date().getTime();
    const lastActivity = new Date(context.lastActivityTime).getTime();
    const timeSinceActivity = now - lastActivity;

    return timeSinceActivity > SESSION_TIMEOUT_MS;
  }

  /**
   * Add a topic to the discussed topics list
   */
  addTopic(conversationId: string, topic: string): void {
    const context = this.getContext(conversationId);

    if (!context) {
      return;
    }

    if (!context.topicsDiscussed.includes(topic)) {
      context.topicsDiscussed.push(topic);
      this.contexts.set(conversationId, context);
      this.saveToStorage(context);
    }
  }

  /**
   * Update the last intent
   */
  updateIntent(conversationId: string, intent: Intent): void {
    this.updateContext(conversationId, { lastIntent: intent });
  }

  /**
   * Set conversation mode (general or onboarding)
   */
  setMode(
    conversationId: string,
    mode: 'general' | 'onboarding',
    onboardingSessionId?: string
  ): void {
    this.updateContext(conversationId, {
      mode,
      onboardingSessionId,
    });
  }

  /**
   * Get conversation mode
   */
  getMode(conversationId: string): 'general' | 'onboarding' {
    const context = this.getContext(conversationId);
    return context?.mode || 'general';
  }

  /**
   * Check if conversation is in onboarding mode
   */
  isOnboardingMode(conversationId: string): boolean {
    return this.getMode(conversationId) === 'onboarding';
  }

  /**
   * Get message history
   */
  getMessageHistory(conversationId: string): Message[] {
    const context = this.getContext(conversationId);
    return context?.messageHistory || [];
  }

  /**
   * Get recent user queries (for context-aware responses)
   */
  getRecentQueries(conversationId: string, count: number = 3): string[] {
    const context = this.getContext(conversationId);

    if (!context) {
      return [];
    }

    return context.messageHistory
      .filter((msg) => msg.sender === 'user')
      .slice(-count)
      .map((msg) => msg.text);
  }

  /**
   * Clean up expired contexts
   */
  cleanupExpiredContexts(): number {
    let cleanedCount = 0;

    this.contexts.forEach((_context, conversationId) => {
      if (this.isContextExpired(conversationId)) {
        this.clearContext(conversationId);
        cleanedCount++;
      }
    });

    return cleanedCount;
  }

  /**
   * Get all active conversation IDs
   */
  getActiveConversations(): string[] {
    return Array.from(this.contexts.keys()).filter(
      (id) => !this.isContextExpired(id)
    );
  }

  /**
   * Get context statistics
   */
  getStats(): {
    activeConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  } {
    const activeConversations = this.getActiveConversations();
    const totalMessages = activeConversations.reduce((sum, id) => {
      const context = this.contexts.get(id);
      return sum + (context?.messageHistory.length || 0);
    }, 0);

    return {
      activeConversations: activeConversations.length,
      totalMessages,
      averageMessagesPerConversation:
        activeConversations.length > 0
          ? Math.round((totalMessages / activeConversations.length) * 10) / 10
          : 0,
    };
  }

  // ============================================================================
  // Private Storage Methods
  // ============================================================================

  /**
   * Save context to localStorage
   */
  private saveToStorage(context: ConversationContext): void {
    try {
      const key = STORAGE_KEY_PREFIX + context.conversationId;
      const data = {
        conversationId: context.conversationId,
        userId: context.userId,
        messageHistory: context.messageHistory,
        topicsDiscussed: context.topicsDiscussed,
        lastIntent: context.lastIntent,
        startTime: context.startTime.toISOString(),
        lastActivityTime: context.lastActivityTime.toISOString(),
        mode: context.mode,
        onboardingSessionId: context.onboardingSessionId,
      };

      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save context to storage:', error);
    }
  }

  /**
   * Load context from localStorage
   */
  private loadFromStorage(conversationId: string): ConversationContext | null {
    try {
      const key = STORAGE_KEY_PREFIX + conversationId;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);

      return {
        conversationId: parsed.conversationId,
        userId: parsed.userId,
        messageHistory: parsed.messageHistory.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        topicsDiscussed: parsed.topicsDiscussed,
        lastIntent: parsed.lastIntent,
        startTime: new Date(parsed.startTime),
        lastActivityTime: new Date(parsed.lastActivityTime),
        mode: parsed.mode || 'general',
        onboardingSessionId: parsed.onboardingSessionId,
      };
    } catch (error) {
      console.error('Failed to load context from storage:', error);
      return null;
    }
  }

  /**
   * Remove context from localStorage
   */
  private removeFromStorage(conversationId: string): void {
    try {
      const key = STORAGE_KEY_PREFIX + conversationId;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove context from storage:', error);
    }
  }
}

// Export singleton instance
export const contextManager = new ContextManager();
