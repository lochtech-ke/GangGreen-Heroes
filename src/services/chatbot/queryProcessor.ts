import type {
  ProcessedQuery,
  Intent,
  Entity,
  ConversationContext,
} from '../../types/chatbot.types';

/**
 * QueryProcessor
 * Preprocesses user queries, extracts intent and entities
 */
class QueryProcessor {
  /**
   * Process a user query
   */
  process(query: string, context: ConversationContext): ProcessedQuery {
    const normalizedQuery = this.normalizeQuery(query);
    const intent = this.extractIntent(normalizedQuery);
    const entities = this.extractEntities(normalizedQuery);

    return {
      originalQuery: query,
      normalizedQuery,
      intent,
      entities,
      context,
    };
  }

  /**
   * Normalize query text
   */
  normalizeQuery(query: string): string {
    return (
      query
        .trim()
        // Convert to lowercase
        .toLowerCase()
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove special characters but keep basic punctuation
        .replace(/[^\w\s?!.,'-]/g, '')
    );
  }

  /**
   * Extract intent from query
   */
  extractIntent(query: string): Intent {
    const queryLower = query.toLowerCase();

    // Getting started intent
    if (
      this.matchesKeywords(queryLower, [
        'what is',
        'about',
        'get started',
        'getting started',
        'how to start',
        'begin',
        'sign up',
        'register',
        'join',
      ])
    ) {
      return 'getting-started';
    }

    // Find projects intent
    if (
      this.matchesKeywords(queryLower, [
        'find project',
        'search project',
        'browse project',
        'available project',
        'list project',
        'show project',
      ])
    ) {
      return 'find-projects';
    }

    // Join project intent
    if (
      this.matchesKeywords(queryLower, [
        'join project',
        'participate',
        'contribute',
        'volunteer',
        'how to join',
        'get involved',
      ])
    ) {
      return 'join-project';
    }

    // Education intent
    if (
      this.matchesKeywords(queryLower, [
        'learn',
        'education',
        'training',
        'course',
        'tutorial',
        'gamification',
        'challenge',
        'badge',
        'achievement',
      ])
    ) {
      return 'education';
    }

    // Community intent
    if (
      this.matchesKeywords(queryLower, [
        'community',
        'group',
        'team',
        'local',
        'network',
        'connect',
        'social',
      ])
    ) {
      return 'community';
    }

    // Verification intent
    if (
      this.matchesKeywords(queryLower, [
        'verify',
        'verification',
        'track',
        'tracking',
        'proof',
        'report',
        'impact',
        'transparency',
      ])
    ) {
      return 'verification';
    }

    // Sponsorship intent
    if (
      this.matchesKeywords(queryLower, [
        'sponsor',
        'sponsorship',
        'donate',
        'funding',
        'corporate',
        'partner',
        'partnership',
      ])
    ) {
      return 'sponsorship';
    }

    // Support intent
    if (
      this.matchesKeywords(queryLower, [
        'help',
        'support',
        'problem',
        'issue',
        'bug',
        'error',
        'trouble',
        'contact',
      ])
    ) {
      return 'support';
    }

    return 'unknown';
  }

  /**
   * Extract entities from query
   */
  extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    const queryLower = query.toLowerCase();

    // Extract user type entities
    if (queryLower.includes('individual') || queryLower.includes('person')) {
      entities.push({
        type: 'user-type',
        value: 'individual',
        confidence: 0.9,
      });
    }

    if (
      queryLower.includes('organization') ||
      queryLower.includes('company') ||
      queryLower.includes('corporate')
    ) {
      entities.push({
        type: 'user-type',
        value: 'organization',
        confidence: 0.9,
      });
    }

    if (queryLower.includes('community') || queryLower.includes('group')) {
      entities.push({
        type: 'user-type',
        value: 'community',
        confidence: 0.8,
      });
    }

    // Extract forest/location entities
    if (queryLower.includes('kakamega')) {
      entities.push({
        type: 'location',
        value: 'kakamega',
        confidence: 1.0,
      });
    }

    if (queryLower.includes('karura')) {
      entities.push({
        type: 'location',
        value: 'karura',
        confidence: 1.0,
      });
    }

    if (queryLower.includes('mau')) {
      entities.push({
        type: 'location',
        value: 'mau',
        confidence: 1.0,
      });
    }

    // Extract project type entities
    if (
      queryLower.includes('tree planting') ||
      queryLower.includes('plant tree') ||
      queryLower.includes('reforestation')
    ) {
      entities.push({
        type: 'project-type',
        value: 'tree-planting',
        confidence: 0.9,
      });
    }

    if (
      queryLower.includes('conservation') ||
      queryLower.includes('protect') ||
      queryLower.includes('preserve')
    ) {
      entities.push({
        type: 'project-type',
        value: 'conservation',
        confidence: 0.8,
      });
    }

    // Extract action entities
    const actions = [
      'register',
      'sign up',
      'join',
      'create',
      'donate',
      'volunteer',
      'participate',
    ];

    actions.forEach((action) => {
      if (queryLower.includes(action)) {
        entities.push({
          type: 'action',
          value: action.replace(' ', '-'),
          confidence: 0.85,
        });
      }
    });

    return entities;
  }

  /**
   * Check if query matches any of the keywords
   */
  private matchesKeywords(query: string, keywords: string[]): boolean {
    return keywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Get query complexity score (for determining if escalation might be needed)
   */
  getComplexityScore(query: string): number {
    let score = 0;

    // Length factor
    const wordCount = query.split(/\s+/).length;
    if (wordCount > 20) score += 0.3;
    else if (wordCount > 10) score += 0.1;

    // Question marks (multiple questions)
    const questionMarks = (query.match(/\?/g) || []).length;
    if (questionMarks > 1) score += 0.2;

    // Technical terms
    const technicalTerms = [
      'api',
      'integration',
      'blockchain',
      'nft',
      'smart contract',
      'database',
      'authentication',
    ];
    if (technicalTerms.some((term) => query.toLowerCase().includes(term))) {
      score += 0.3;
    }

    // Negative sentiment
    const negativeWords = [
      'not working',
      'broken',
      'failed',
      'error',
      'problem',
      'issue',
      'bug',
    ];
    if (negativeWords.some((word) => query.toLowerCase().includes(word))) {
      score += 0.2;
    }

    return Math.min(1.0, score);
  }

  /**
   * Detect if query is a greeting
   */
  isGreeting(query: string): boolean {
    const greetings = [
      'hello',
      'hi',
      'hey',
      'greetings',
      'good morning',
      'good afternoon',
      'good evening',
    ];

    const queryLower = query.toLowerCase().trim();
    return greetings.some((greeting) => queryLower.startsWith(greeting));
  }

  /**
   * Detect if query is a farewell
   */
  isFarewell(query: string): boolean {
    const farewells = [
      'bye',
      'goodbye',
      'see you',
      'thanks',
      'thank you',
      'that\'s all',
      'no more questions',
    ];

    const queryLower = query.toLowerCase().trim();
    return farewells.some((farewell) => queryLower.includes(farewell));
  }

  /**
   * Detect if user wants to skip (for onboarding)
   */
  isSkipRequest(query: string): boolean {
    const skipKeywords = ['skip', 'pass', 'next', 'later', 'no thanks'];
    const queryLower = query.toLowerCase().trim();
    return skipKeywords.some((keyword) => queryLower === keyword || queryLower.includes(keyword));
  }
}

// Export singleton instance
export const queryProcessor = new QueryProcessor();
