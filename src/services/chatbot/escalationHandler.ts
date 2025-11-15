import { supabase } from '../supabase';
import type {
  ConversationContext,
  SupportTicket,
  ContactInfo,
  EscalationReason,
} from '../../types/chatbot.types';

const CONFIDENCE_THRESHOLD = 70; // 70% confidence threshold
const MAX_ATTEMPTS = 2; // Maximum attempts before suggesting escalation

/**
 * EscalationHandler
 * Handles escalation to human support when needed
 */
class EscalationHandler {
  private attemptCounts: Map<string, number> = new Map();

  /**
   * Determine if escalation is needed
   */
  shouldEscalate(confidence: number, conversationId: string): boolean {
    // Check confidence threshold
    if (confidence < CONFIDENCE_THRESHOLD) {
      return true;
    }

    // Check attempt count
    const attempts = this.attemptCounts.get(conversationId) || 0;
    if (attempts >= MAX_ATTEMPTS) {
      return true;
    }

    return false;
  }

  /**
   * Increment attempt count for a conversation
   */
  incrementAttempts(conversationId: string): number {
    const current = this.attemptCounts.get(conversationId) || 0;
    const newCount = current + 1;
    this.attemptCounts.set(conversationId, newCount);
    return newCount;
  }

  /**
   * Reset attempt count for a conversation
   */
  resetAttempts(conversationId: string): void {
    this.attemptCounts.delete(conversationId);
  }

  /**
   * Create a support ticket
   */
  async createSupportTicket(
    conversation: ConversationContext
  ): Promise<SupportTicket> {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine priority based on context
    const priority = this.determinePriority(conversation);

    // Determine category based on last intent
    const category = this.mapIntentToCategory(conversation.lastIntent);

    const ticket: SupportTicket = {
      ticketId,
      conversationId: conversation.conversationId,
      userId: conversation.userId,
      messageHistory: conversation.messageHistory,
      priority,
      category,
      createdAt: new Date(),
    };

    try {
      // Save to Supabase
      const { error } = await supabase.from('support_tickets').insert({
        ticket_id: ticket.ticketId,
        conversation_id: ticket.conversationId,
        user_id: ticket.userId,
        message_history: JSON.stringify(ticket.messageHistory),
        priority: ticket.priority,
        category: ticket.category,
        created_at: ticket.createdAt.toISOString(),
        status: 'open',
      });

      if (error) {
        console.error('Failed to create support ticket:', error);
        throw error;
      }

      console.log(`Support ticket created: ${ticketId}`);
      return ticket;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  /**
   * Get contact information
   */
  getContactInfo(): ContactInfo {
    return {
      email: 'support@ganggreen.org',
      expectedResponseTime: '24 hours',
      supportHours: '9 AM - 5 PM EAT (Monday - Friday)',
    };
  }

  /**
   * Track escalation for analytics
   */
  trackEscalation(conversationId: string, reason: EscalationReason): void {
    // Log escalation event
    console.log(`Escalation tracked: ${conversationId} - Reason: ${reason}`);

    // In a real implementation, this would send to analytics service
    // For now, we'll just log it
    try {
      // Could send to analytics service here
      const event = {
        type: 'chatbot_escalation',
        conversationId,
        reason,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage for now (in production, send to analytics API)
      const existingEvents = localStorage.getItem('chatbot_escalation_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);
      localStorage.setItem('chatbot_escalation_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to track escalation:', error);
    }
  }

  /**
   * Generate escalation message
   */
  generateEscalationMessage(reason: EscalationReason): string {
    const contactInfo = this.getContactInfo();

    switch (reason) {
      case 'low-confidence':
        return `I'm having trouble finding the right answer for you. Let me connect you with our support team who can help better.\n\n📧 Email: ${contactInfo.email}\n⏰ Response time: ${contactInfo.expectedResponseTime}\n🕐 Support hours: ${contactInfo.supportHours}\n\nWould you like me to create a support ticket for you?`;

      case 'user-request':
        return `Of course! I'll connect you with our support team.\n\n📧 Email: ${contactInfo.email}\n⏰ Response time: ${contactInfo.expectedResponseTime}\n🕐 Support hours: ${contactInfo.supportHours}\n\nShall I create a support ticket with our conversation history?`;

      case 'repeated-failure':
        return `I apologize for not being able to help you effectively. Let me get you in touch with our support team who can provide better assistance.\n\n📧 Email: ${contactInfo.email}\n⏰ Response time: ${contactInfo.expectedResponseTime}\n🕐 Support hours: ${contactInfo.supportHours}\n\nI can create a support ticket that includes our conversation so they have full context.`;

      case 'complex-query':
        return `This seems like a complex question that would be better handled by our support team. They have more expertise to help you.\n\n📧 Email: ${contactInfo.email}\n⏰ Response time: ${contactInfo.expectedResponseTime}\n🕐 Support hours: ${contactInfo.supportHours}\n\nWould you like me to create a support ticket?`;

      default:
        return `I think our support team would be better equipped to help you with this.\n\n📧 Email: ${contactInfo.email}\n⏰ Response time: ${contactInfo.expectedResponseTime}\n🕐 Support hours: ${contactInfo.supportHours}`;
    }
  }

  /**
   * Get escalation statistics
   */
  getEscalationStats(): {
    totalEscalations: number;
    byReason: Record<EscalationReason, number>;
  } {
    try {
      const eventsData = localStorage.getItem('chatbot_escalation_events');
      if (!eventsData) {
        return {
          totalEscalations: 0,
          byReason: {
            'low-confidence': 0,
            'user-request': 0,
            'repeated-failure': 0,
            'complex-query': 0,
          },
        };
      }

      const events = JSON.parse(eventsData);
      const byReason: Record<EscalationReason, number> = {
        'low-confidence': 0,
        'user-request': 0,
        'repeated-failure': 0,
        'complex-query': 0,
      };

      events.forEach((event: { reason: EscalationReason }) => {
        byReason[event.reason] = (byReason[event.reason] || 0) + 1;
      });

      return {
        totalEscalations: events.length,
        byReason,
      };
    } catch (error) {
      console.error('Failed to get escalation stats:', error);
      return {
        totalEscalations: 0,
        byReason: {
          'low-confidence': 0,
          'user-request': 0,
          'repeated-failure': 0,
          'complex-query': 0,
        },
      };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Determine ticket priority based on conversation context
   */
  private determinePriority(
    conversation: ConversationContext
  ): 'low' | 'medium' | 'high' {
    // High priority if user has been trying for a while
    if (conversation.messageHistory.length > 10) {
      return 'high';
    }

    // High priority for support-related queries
    if (conversation.lastIntent === 'support') {
      return 'high';
    }

    // Medium priority for sponsorship queries
    if (conversation.lastIntent === 'sponsorship') {
      return 'medium';
    }

    // Default to low priority
    return 'low';
  }

  /**
   * Map intent to support category
   */
  private mapIntentToCategory(intent: string): string {
    const categoryMap: Record<string, string> = {
      'getting-started': 'Onboarding',
      'find-projects': 'Projects',
      'join-project': 'Projects',
      education: 'Education',
      community: 'Community',
      verification: 'Verification',
      sponsorship: 'Sponsorship',
      support: 'Technical Support',
      unknown: 'General',
    };

    return categoryMap[intent] || 'General';
  }
}

// Export singleton instance
export const escalationHandler = new EscalationHandler();
