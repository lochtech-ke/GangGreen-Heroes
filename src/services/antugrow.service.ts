/**
 * Antugrow API Service
 * Handles integration with Antugrow's AI-powered tree monitoring API
 * Provides tree registration, image analysis, and growth tracking
 */

const ANTUGROW_API_URL = import.meta.env.VITE_ANTUGROW_API_URL || 'https://api.antugrow.com';
const ANTUGROW_API_KEY = import.meta.env.VITE_ANTUGROW_API_KEY || '';

interface AntugrowTreeRegistration {
  tree_id: string;
  species: string;
  location: {
    latitude: number;
    longitude: number;
  };
  planted_date: string;
}

interface AntugrowImageAnalysis {
  tree_id: string;
  image_url: string;
  captured_at: string;
}

interface AntugrowAnalysisResult {
  antugrow_id: string;
  health_score: number;
  growth_rate: number;
  disease_detected: boolean;
  recommendations: string[];
  analyzed_at: string;
  confidence_score?: number;
}

interface AntugrowGrowthData {
  tree_id: string;
  antugrow_id: string;
  measurements: {
    height_cm?: number;
    diameter_cm?: number;
    canopy_area_m2?: number;
  };
  health_status: 'healthy' | 'stressed' | 'diseased' | 'dead';
  last_updated: string;
}

interface AntugrowResponse<T> {
  data: T | null;
  error: Error | null;
}

class AntugrowService {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // Initial delay in ms

  constructor() {
    this.baseUrl = ANTUGROW_API_URL;
    this.apiKey = ANTUGROW_API_KEY;

    if (!this.apiKey) {
      console.warn('Antugrow API key not configured. Set VITE_ANTUGROW_API_KEY in environment variables.');
    }
  }

  /**
   * Register a tree with Antugrow for monitoring
   */
  async registerTree(data: AntugrowTreeRegistration): Promise<AntugrowResponse<{ antugrow_id: string }>> {
    try {
      const response = await this.makeRequest<{ antugrow_id: string }>('/trees/register', {
        method: 'POST',
        body: JSON.stringify({
          external_id: data.tree_id,
          species: data.species,
          location: data.location,
          planted_date: data.planted_date,
        }),
      });

      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to register tree'),
      };
    }
  }

  /**
   * Submit tree image for AI analysis
   */
  async analyzeImage(data: AntugrowImageAnalysis): Promise<AntugrowResponse<AntugrowAnalysisResult>> {
    try {
      const response = await this.makeRequest<AntugrowAnalysisResult>('/analysis/image', {
        method: 'POST',
        body: JSON.stringify({
          tree_id: data.tree_id,
          image_url: data.image_url,
          captured_at: data.captured_at,
        }),
      });

      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to analyze image'),
      };
    }
  }

  /**
   * Get growth data for a tree
   */
  async getGrowthData(antugrowId: string): Promise<AntugrowResponse<AntugrowGrowthData>> {
    try {
      const response = await this.makeRequest<AntugrowGrowthData>(`/trees/${antugrowId}/growth`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch growth data'),
      };
    }
  }

  /**
   * Get all analysis results for a tree
   */
  async getTreeAnalyses(antugrowId: string): Promise<AntugrowResponse<AntugrowAnalysisResult[]>> {
    try {
      const response = await this.makeRequest<AntugrowAnalysisResult[]>(`/trees/${antugrowId}/analyses`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch analyses'),
      };
    }
  }

  /**
   * Get health recommendations for a tree
   */
  async getRecommendations(antugrowId: string): Promise<AntugrowResponse<{ recommendations: string[] }>> {
    try {
      const response = await this.makeRequest<{ recommendations: string[] }>(
        `/trees/${antugrowId}/recommendations`,
        {
          method: 'GET',
        }
      );

      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch recommendations'),
      };
    }
  }

  /**
   * Make HTTP request to Antugrow API with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<AntugrowResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        if (retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          await this.sleep(delay);
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Handle server errors with retry
      if (response.status >= 500 && response.status < 600) {
        if (retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          await this.sleep(delay);
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
        throw new Error('Antugrow API server error. Please try again later.');
      }

      // Handle client errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      // Retry on network errors
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.sleep(delay);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return this.retryDelay * Math.pow(2, retryCount);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
      return true; // Network errors are typically TypeErrors
    }
    if (error instanceof Error) {
      return error.message.includes('network') || error.message.includes('fetch');
    }
    return false;
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }

  /**
   * Get API status
   */
  async getStatus(): Promise<AntugrowResponse<{ status: string; version: string }>> {
    try {
      const response = await this.makeRequest<{ status: string; version: string }>('/status', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to check API status'),
      };
    }
  }
}

// Export singleton instance
export const antugrowService = new AntugrowService();

// Export types
export type {
  AntugrowTreeRegistration,
  AntugrowImageAnalysis,
  AntugrowAnalysisResult,
  AntugrowGrowthData,
  AntugrowResponse,
};
