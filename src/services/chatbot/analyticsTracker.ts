import { supabase } from '../supabase';
import type { ChatbotAnalyticsEvent, Intent, EscalationReason } from '../../types/chatbot.types';

/**
 * AnalyticsTracker
 * Tracks chatbot usage and interaction events
 */
class AnalyticsTracker {
  /**
   * Track chatbot opened event
   */
  async trackChatbotOpened(conversationId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_opened',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {},
    });
  }

  /**
   * Track query sent event
   */
  async trackQuerySent(
    conversationId: string,
    query: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_query_sent',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        query: this.sanitizeQuery(query),
      },
    });
  }

  /**
   * Track response generated event
   */
  async trackResponseGenerated(
    conversationId: string,
    confidence: number,
    intent: Intent,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_response_generated',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        confidence,
        intent,
      },
    });
  }

  /**
   * Track escalation event
   */
  async trackEscalation(
    conversationId: string,
    reason: EscalationReason,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_escalated',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        escalationReason: reason,
      },
    });
  }

  /**
   * Track quick action clicked event
   */
  async trackQuickActionClicked(
    conversationId: string,
    actionId: string,
    actionLabel: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_quick_action_clicked',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        actionId,
        actionLabel,
      },
    });
  }

  /**
   * Track conversation ended event
   */
  async trackConversationEnded(
    conversationId: string,
    messageCount: number,
    duration: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_conversation_ended',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        messageCount,
        durationSeconds: Math.round(duration / 1000),
      },
    });
  }

  /**
   * Track onboarding started event
   */
  async trackOnboardingStarted(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_onboarding_started',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {},
    });
  }

  /**
   * Track onboarding completed event
   */
  async trackOnboardingCompleted(
    conversationId: string,
    userId: string,
    duration: number
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_onboarding_completed',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        durationSeconds: Math.round(duration / 1000),
      },
    });
  }

  /**
   * Track onboarding step completed event
   */
  async trackOnboardingStep(
    conversationId: string,
    step: string,
    userId: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'chatbot_onboarding_step',
      conversationId,
      userId,
      timestamp: new Date(),
      metadata: {
        step,
      },
    });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalConversations: number;
    totalQueries: number;
    totalEscalations: number;
    averageConfidence: number;
    topIntents: Array<{ intent: string; count: number }>;
  }> {
    try {
      let query = supabase
        .from('chatbot_analytics')
        .select('event_type, metadata');

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data
      const conversations = new Set<string>();
      let totalQueries = 0;
      let totalEscalations = 0;
      let totalConfidence = 0;
      let confidenceCount = 0;
      const intentCounts: Record<string, number> = {};

      data?.forEach((event) => {
        if (event.event_type === 'chatbot_opened') {
          conversations.add(event.metadata.conversationId || '');
        }

        if (event.event_type === 'chatbot_query_sent') {
          totalQueries++;
        }

        if (event.event_type === 'chatbot_escalated') {
          totalEscalations++;
        }

        if (event.event_type === 'chatbot_response_generated') {
          if (event.metadata.confidence !== undefined) {
            totalConfidence += event.metadata.confidence;
            confidenceCount++;
          }

          if (event.metadata.intent) {
            intentCounts[event.metadata.intent] =
              (intentCounts[event.metadata.intent] || 0) + 1;
          }
        }
      });

      // Get top intents
      const topIntents = Object.entries(intentCounts)
        .map(([intent, count]) => ({ intent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalConversations: conversations.size,
        totalQueries,
        totalEscalations,
        averageConfidence:
          confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0,
        topIntents,
      };
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return {
        totalConversations: 0,
        totalQueries: 0,
        totalEscalations: 0,
        averageConfidence: 0,
        topIntents: [],
      };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Track an analytics event
   */
  private async trackEvent(event: ChatbotAnalyticsEvent): Promise<void> {
    try {
      // Store in Supabase
      const { error } = await supabase.from('chatbot_analytics').insert({
        event_type: event.eventType,
        conversation_id: event.conversationId,
        user_id: event.userId,
        timestamp: event.timestamp.toISOString(),
        metadata: event.metadata,
      });

      if (error) {
        console.error('Failed to track analytics event:', error);
      }

      // Also store in localStorage as backup
      this.storeEventLocally(event);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Fallback to localStorage only
      this.storeEventLocally(event);
    }
  }

  /**
   * Store event in localStorage as backup
   */
  private storeEventLocally(event: ChatbotAnalyticsEvent): void {
    try {
      const key = 'chatbot_analytics_events';
      const existing = localStorage.getItem(key);
      const events = existing ? JSON.parse(existing) : [];

      events.push({
        ...event,
        timestamp: event.timestamp.toISOString(),
      });

      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store event locally:', error);
    }
  }

  /**
   * Sanitize query to remove PII
   */
  private sanitizeQuery(query: string): string {
    // Remove potential email addresses
    let sanitized = query.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');

    // Remove potential phone numbers
    sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

    // Remove potential credit card numbers
    sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]');

    return sanitized;
  }

  /**
   * Get local analytics events
   */
  getLocalEvents(): ChatbotAnalyticsEvent[] {
    try {
      const key = 'chatbot_analytics_events';
      const existing = localStorage.getItem(key);
      if (!existing) return [];

      const events = JSON.parse(existing);
      return events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get local events:', error);
      return [];
    }
  }

  /**
   * Clear local analytics events
   */
  clearLocalEvents(): void {
    try {
      localStorage.removeItem('chatbot_analytics_events');
    } catch (error) {
      console.error('Failed to clear local events:', error);
    }
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker();
