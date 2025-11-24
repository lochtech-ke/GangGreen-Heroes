import type { KnowledgeBaseEntry } from '../../types/chatbot.types';
import knowledgeBaseData from '../../data/chatbot-knowledge-base.json';

/**
 * KnowledgeBaseManager
 * Manages loading, caching, and querying the chatbot knowledge base
 */
class KnowledgeBaseManager {
  private knowledgeBase: KnowledgeBaseEntry[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Load knowledge base from JSON file
   */
  async loadKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
    // If already loaded, return cached data
    if (this.isLoaded) {
      return this.knowledgeBase;
    }

    // If currently loading, wait for that to complete
    if (this.loadPromise) {
      await this.loadPromise;
      return this.knowledgeBase;
    }

    // Start loading
    this.loadPromise = this._loadData();
    await this.loadPromise;
    this.loadPromise = null;

    return this.knowledgeBase;
  }

  /**
   * Reload knowledge base (for hot-reload functionality)
   */
  async reloadKnowledgeBase(): Promise<void> {
    this.isLoaded = false;
    this.knowledgeBase = [];
    await this.loadKnowledgeBase();
  }

  /**
   * Get a specific entry by ID
   */
  getEntry(id: string): KnowledgeBaseEntry | null {
    if (!this.isLoaded) {
      console.warn('Knowledge base not loaded. Call loadKnowledgeBase() first.');
      return null;
    }

    return this.knowledgeBase.find((entry) => entry.id === id) || null;
  }

  /**
   * Search entries by query (simple keyword matching)
   */
  searchEntries(query: string): KnowledgeBaseEntry[] {
    if (!this.isLoaded) {
      console.warn('Knowledge base not loaded. Call loadKnowledgeBase() first.');
      return [];
    }

    const queryLower = query.toLowerCase();
    
    return this.knowledgeBase.filter((entry) => {
      // Check question
      if (entry.question.toLowerCase().includes(queryLower)) {
        return true;
      }

      // Check keywords
      if (entry.keywords?.some((keyword) => keyword.toLowerCase().includes(queryLower))) {
        return true;
      }

      // Check category
      if (entry.category?.toLowerCase().includes(queryLower)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get all entries in a specific category
   */
  getEntriesByCategory(category: string): KnowledgeBaseEntry[] {
    if (!this.isLoaded) {
      console.warn('Knowledge base not loaded. Call loadKnowledgeBase() first.');
      return [];
    }

    return this.knowledgeBase.filter(
      (entry) => entry.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    if (!this.isLoaded) {
      console.warn('Knowledge base not loaded. Call loadKnowledgeBase() first.');
      return [];
    }

    const categories = new Set<string>();
    this.knowledgeBase.forEach((entry) => {
      if (entry.category) {
        categories.add(entry.category);
      }
    });

    return Array.from(categories);
  }

  /**
   * Validate knowledge base structure
   */
  validateKnowledgeBase(data: unknown): boolean {
    if (!Array.isArray(data)) {
      console.error('Knowledge base must be an array');
      return false;
    }

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];

      if (typeof entry !== 'object' || entry === null) {
        console.error(`Entry at index ${i} is not an object`);
        return false;
      }

      // Check required fields
      if (typeof entry.question !== 'string' || !entry.question.trim()) {
        console.error(`Entry at index ${i} missing valid 'question' field`);
        return false;
      }

      if (typeof entry.answer !== 'string' || !entry.answer.trim()) {
        console.error(`Entry at index ${i} missing valid 'answer' field`);
        return false;
      }

      // Check optional fields
      if (entry.id !== undefined && typeof entry.id !== 'string') {
        console.error(`Entry at index ${i} has invalid 'id' field`);
        return false;
      }

      if (entry.category !== undefined && typeof entry.category !== 'string') {
        console.error(`Entry at index ${i} has invalid 'category' field`);
        return false;
      }

      if (entry.keywords !== undefined) {
        if (!Array.isArray(entry.keywords)) {
          console.error(`Entry at index ${i} has invalid 'keywords' field (must be array)`);
          return false;
        }
        if (!entry.keywords.every((k: unknown) => typeof k === 'string')) {
          console.error(`Entry at index ${i} has non-string values in 'keywords' array`);
          return false;
        }
      }

      if (entry.relatedQuestions !== undefined) {
        if (!Array.isArray(entry.relatedQuestions)) {
          console.error(
            `Entry at index ${i} has invalid 'relatedQuestions' field (must be array)`
          );
          return false;
        }
        if (!entry.relatedQuestions.every((q: unknown) => typeof q === 'string')) {
          console.error(
            `Entry at index ${i} has non-string values in 'relatedQuestions' array`
          );
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get knowledge base statistics
   */
  getStats(): {
    totalEntries: number;
    categories: number;
    averageKeywordsPerEntry: number;
  } {
    if (!this.isLoaded) {
      return {
        totalEntries: 0,
        categories: 0,
        averageKeywordsPerEntry: 0,
      };
    }

    const categories = this.getCategories();
    const totalKeywords = this.knowledgeBase.reduce(
      (sum, entry) => sum + (entry.keywords?.length || 0),
      0
    );

    return {
      totalEntries: this.knowledgeBase.length,
      categories: categories.length,
      averageKeywordsPerEntry:
        this.knowledgeBase.length > 0
          ? Math.round((totalKeywords / this.knowledgeBase.length) * 10) / 10
          : 0,
    };
  }

  /**
   * Check if knowledge base is loaded
   */
  isKnowledgeBaseLoaded(): boolean {
    return this.isLoaded;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Internal method to load data
   */
  private async _loadData(): Promise<void> {
    try {
      // Validate the data
      if (!this.validateKnowledgeBase(knowledgeBaseData)) {
        throw new Error('Knowledge base validation failed');
      }

      // Cast and store
      this.knowledgeBase = knowledgeBaseData as KnowledgeBaseEntry[];
      this.isLoaded = true;

      console.log(
        `Knowledge base loaded successfully: ${this.knowledgeBase.length} entries`
      );
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      this.isLoaded = false;
      this.knowledgeBase = [];
      throw error;
    }
  }
}

// Export singleton instance
export const knowledgeBaseManager = new KnowledgeBaseManager();
