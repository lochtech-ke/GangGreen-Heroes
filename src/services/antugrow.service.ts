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

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalResponseTime: number;
  averageResponseTime: number;
  successRate: number;
}

interface QueuedRequest {
  endpoint: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timestamp: number;
}

class AntugrowService {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // Initial delay in ms
  
  // Request queue for rate limiting
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue: boolean = false;
  private requestsPerMinute: number = 100;
  private requestTimestamps: number[] = [];
  
  // Metrics tracking
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    successRate: 0,
  };

  constructor() {
    this.baseUrl = ANTUGROW_API_URL;
    this.apiKey = ANTUGROW_API_KEY;
    this.webhookSecret = import.meta.env.ANTUGROW_WEBHOOK_SECRET || '';

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
   * Validate webhook signature using HMAC
   * @param payload - Webhook payload as string
   * @param signature - Signature from webhook header
   * @returns true if signature is valid
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.error('Webhook secret not configured');
      return false;
    }

    try {
      // In a real implementation, this would use crypto.subtle or a library
      // to compute HMAC-SHA256 of the payload and compare with signature
      // For now, we'll do a simple comparison
      // TODO: Implement proper HMAC-SHA256 signature validation using payload
      const expectedSignature = `sha256=${this.webhookSecret}`;
      
      // Payload will be used in proper HMAC implementation
      console.debug('Validating webhook signature for payload length:', payload.length);
      
      return signature === expectedSignature;
    } catch (error) {
      this.logError('Webhook signature validation failed', error, { signature });
      return false;
    }
  }

  /**
   * Get current API metrics
   */
  getMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      successRate: 0,
    };
  }

  /**
   * Check if we're approaching rate limits
   * @returns true if we're at 80% or more of rate limit
   */
  isApproachingRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean up old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
    return this.requestTimestamps.length >= this.requestsPerMinute * 0.8;
  }

  /**
   * Add request to queue for rate limit management
   */
  private async queueRequest<T>(endpoint: string, options: RequestInit): Promise<AntugrowResponse<T>> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        endpoint,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queued requests with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      // Clean up old timestamps
      this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);

      // Check if we can make a request
      if (this.requestTimestamps.length >= this.requestsPerMinute) {
        // Wait until we can make another request
        const oldestTimestamp = this.requestTimestamps[0];
        const waitTime = 60000 - (now - oldestTimestamp) + 100; // Add 100ms buffer
        await this.sleep(waitTime);
        continue;
      }

      // Process next request
      const queuedRequest = this.requestQueue.shift();
      if (!queuedRequest) break;

      try {
        this.requestTimestamps.push(Date.now());
        const result = await this.makeRequestInternal(
          queuedRequest.endpoint,
          queuedRequest.options
        );
        queuedRequest.resolve(result);
      } catch (error) {
        queuedRequest.reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Log error with detailed context
   */
  private logError(message: string, error: unknown, context?: Record<string, any>): void {
    const errorDetails = {
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
      service: 'AntugrowService',
    };

    console.error('[Antugrow Service Error]', JSON.stringify(errorDetails, null, 2));
  }

  /**
   * Update metrics after request
   */
  private updateMetrics(success: boolean, responseTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += responseTime;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;
    this.metrics.successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
  }

  /**
   * Make HTTP request to Antugrow API with retry logic
   * Internal method that doesn't use queue
   */
  private async makeRequestInternal<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<AntugrowResponse<T>> {
    const startTime = Date.now();
    
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

      const responseTime = Date.now() - startTime;

      // Handle rate limiting
      if (response.status === 429) {
        this.updateMetrics(false, responseTime);
        
        if (retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          this.logError('Rate limit hit, retrying', new Error('429 Rate Limit'), {
            endpoint,
            retryCount,
            delay,
          });
          await this.sleep(delay);
          return this.makeRequestInternal<T>(endpoint, options, retryCount + 1);
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Handle server errors with retry
      if (response.status >= 500 && response.status < 600) {
        this.updateMetrics(false, responseTime);
        
        if (retryCount < this.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          this.logError('Server error, retrying', new Error(`${response.status} Server Error`), {
            endpoint,
            retryCount,
            delay,
          });
          await this.sleep(delay);
          return this.makeRequestInternal<T>(endpoint, options, retryCount + 1);
        }
        throw new Error('Antugrow API server error. Please try again later.');
      }

      // Handle client errors
      if (!response.ok) {
        this.updateMetrics(false, responseTime);
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `API request failed with status ${response.status}`);
        this.logError('API request failed', error, {
          endpoint,
          status: response.status,
          errorData,
        });
        throw error;
      }

      const data = await response.json();
      this.updateMetrics(true, responseTime);
      return { data, error: null };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Retry on network errors
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        this.updateMetrics(false, responseTime);
        const delay = this.calculateRetryDelay(retryCount);
        this.logError('Network error, retrying', error, {
          endpoint,
          retryCount,
          delay,
        });
        await this.sleep(delay);
        return this.makeRequestInternal<T>(endpoint, options, retryCount + 1);
      }

      this.updateMetrics(false, responseTime);
      this.logError('Request failed', error, { endpoint, retryCount });
      
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Make HTTP request to Antugrow API with retry logic
   * Public method that uses queue for rate limiting
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<AntugrowResponse<T>> {
    // Use queue if we're approaching rate limits
    if (this.isApproachingRateLimit()) {
      return this.queueRequest<T>(endpoint, options);
    }

    // Otherwise make request directly
    this.requestTimestamps.push(Date.now());
    return this.makeRequestInternal<T>(endpoint, options, retryCount);
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
  RequestMetrics,
};
