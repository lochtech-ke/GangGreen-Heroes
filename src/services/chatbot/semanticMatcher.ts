import type { KnowledgeBaseEntry, MatchResult, RankedMatch } from '../../types/chatbot.types';

/**
 * SemanticMatcher
 * Implements semantic matching using TF-IDF and cosine similarity
 */
class SemanticMatcher {
  /**
   * Find the best matching entry for a query
   */
  findBestMatch(
    query: string,
    knowledgeBase: KnowledgeBaseEntry[]
  ): MatchResult | null {
    if (!query.trim() || knowledgeBase.length === 0) {
      return null;
    }

    const rankedMatches = this.rankMatches(
      query,
      knowledgeBase.map((entry) => entry.question)
    );

    if (rankedMatches.length === 0) {
      return null;
    }

    const bestMatch = rankedMatches[0];
    const entry = knowledgeBase[bestMatch.index];

    // Calculate confidence based on similarity score
    const confidence = this.scoreToConfidence(bestMatch.score);

    return {
      entry,
      confidence,
      similarityScore: bestMatch.score,
    };
  }

  /**
   * Calculate similarity between query and question
   */
  calculateSimilarity(query: string, question: string): number {
    const queryTokens = this.tokenize(query);
    const questionTokens = this.tokenize(question);

    if (queryTokens.length === 0 || questionTokens.length === 0) {
      return 0;
    }

    // Calculate cosine similarity
    const cosineSim = this.cosineSimilarity(queryTokens, questionTokens);

    // Calculate fuzzy match bonus
    const fuzzyBonus = this.fuzzyMatchScore(query, question);

    // Combine scores (70% cosine, 30% fuzzy)
    return cosineSim * 0.7 + fuzzyBonus * 0.3;
  }

  /**
   * Rank all matches by similarity score
   */
  rankMatches(query: string, questions: string[]): RankedMatch[] {
    const matches: RankedMatch[] = questions
      .map((question, index) => ({
        question,
        score: this.calculateSimilarity(query, question),
        index,
      }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score);

    return matches.slice(0, 3); // Return top 3 matches
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter((token) => token.length > 2) // Remove short words
      .filter((token) => !this.isStopWord(token)); // Remove stop words
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the',
      'is',
      'at',
      'which',
      'on',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'with',
      'to',
      'for',
      'of',
      'as',
      'by',
      'that',
      'this',
      'it',
      'from',
      'are',
      'was',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'can',
      'may',
      'might',
    ]);

    return stopWords.has(word);
  }

  /**
   * Calculate cosine similarity between two token arrays
   */
  private cosineSimilarity(tokens1: string[], tokens2: string[]): number {
    // Create term frequency maps
    const tf1 = this.termFrequency(tokens1);
    const tf2 = this.termFrequency(tokens2);

    // Get all unique terms
    const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);

    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allTerms.forEach((term) => {
      const freq1 = tf1[term] || 0;
      const freq2 = tf2[term] || 0;

      dotProduct += freq1 * freq2;
      magnitude1 += freq1 * freq1;
      magnitude2 += freq2 * freq2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate term frequency
   */
  private termFrequency(tokens: string[]): Record<string, number> {
    const tf: Record<string, number> = {};

    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });

    return tf;
  }

  /**
   * Calculate fuzzy match score (for typo tolerance)
   */
  private fuzzyMatchScore(query: string, question: string): number {
    const queryLower = query.toLowerCase();
    const questionLower = question.toLowerCase();

    // Exact match
    if (queryLower === questionLower) {
      return 1.0;
    }

    // Contains match
    if (questionLower.includes(queryLower)) {
      return 0.8;
    }

    if (queryLower.includes(questionLower)) {
      return 0.7;
    }

    // Levenshtein distance for short queries
    if (queryLower.length < 20) {
      const distance = this.levenshteinDistance(queryLower, questionLower);
      const maxLength = Math.max(queryLower.length, questionLower.length);
      const similarity = 1 - distance / maxLength;
      return Math.max(0, similarity);
    }

    // Word overlap
    const queryWords = new Set(queryLower.split(/\s+/));
    const questionWords = new Set(questionLower.split(/\s+/));
    const intersection = new Set(
      [...queryWords].filter((word) => questionWords.has(word))
    );

    const overlap = intersection.size / Math.max(queryWords.size, questionWords.size);
    return overlap * 0.6;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create matrix
    const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Convert similarity score to confidence percentage
   */
  private scoreToConfidence(score: number): number {
    // Map score (0-1) to confidence (0-100)
    // Apply sigmoid-like curve to make high scores more confident
    const confidence = Math.pow(score, 0.7) * 100;
    return Math.min(100, Math.max(0, Math.round(confidence)));
  }
}

// Export singleton instance
export const semanticMatcher = new SemanticMatcher();
