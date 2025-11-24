import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  LegalDocument,
  BlogPost,
  Partner,
  FAQ,
  StrapiCollectionResponse,
  BlogPostQueryParams,
  PartnerQueryParams,
  FAQQueryParams,
  StrapiError as StrapiErrorType,
} from '../types/strapi.types';

// Custom error class
export class StrapiError extends Error implements StrapiErrorType {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class StrapiService {
  private client: AxiosInstance;
  private cache: Map<string, CacheEntry<any>>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const strapiUrl = import.meta.env.VITE_STRAPI_URL;
    const apiToken = import.meta.env.VITE_STRAPI_API_TOKEN;

    if (!strapiUrl) {
      console.warn('VITE_STRAPI_URL is not configured. Strapi service will not work.');
    }

    this.client = axios.create({
      baseURL: `${strapiUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
      },
      timeout: 10000, // 10 second timeout
    });

    this.cache = new Map();

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log(`[Strapi] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        console.error('[Strapi] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  // Error handler
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      // Server responded with error status
      const message = (error.response.data as any)?.error?.message || 'Failed to fetch content from CMS';
      throw new StrapiError(message, error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      throw new StrapiError('No response from CMS server. Please check your connection.', 0);
    } else {
      // Error in request setup
      throw new StrapiError(error.message || 'An error occurred while fetching content');
    }
  }

  // Generic fetch with caching
  private async fetchWithCache<T>(
    endpoint: string,
    params?: any
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params || {})}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log(`[Strapi] Cache hit for ${endpoint}`);
      return cached.data;
    }

    // Fetch fresh data
    console.log(`[Strapi] Cache miss for ${endpoint}, fetching...`);
    const response = await this.client.get(endpoint, { params });
    const data = response.data;

    // Store in cache
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // Fetch with retry logic
  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      // Don't retry on 4xx errors (client errors)
      if (error instanceof StrapiError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      console.log(`[Strapi] Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.fetchWithRetry(fn, retries - 1, delay * 2);
    }
  }

  // Invalidate cache for specific endpoint
  invalidateCache(endpoint: string): void {
    let invalidatedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(endpoint)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    console.log(`[Strapi] Invalidated ${invalidatedCount} cache entries for ${endpoint}`);
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    console.log('[Strapi] Cache cleared');
  }

  // ==================== Legal Documents ====================

  async getLegalDocument(slug: string): Promise<LegalDocument> {
    return this.fetchWithRetry(async () => {
      const response = await this.fetchWithCache<StrapiCollectionResponse<LegalDocument>>(
        '/legal-documents',
        {
          filters: { slug: { $eq: slug } },
          populate: '*',
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new StrapiError(`Legal document with slug "${slug}" not found`, 404);
      }

      return response.data[0];
    });
  }

  async getAllLegalDocuments(): Promise<LegalDocument[]> {
    return this.fetchWithRetry(async () => {
      const response = await this.fetchWithCache<StrapiCollectionResponse<LegalDocument>>(
        '/legal-documents',
        {
          sort: 'documentType:asc',
          populate: '*',
        }
      );

      return response.data || [];
    });
  }

  // ==================== Blog Posts ====================

  async getBlogPosts(params?: BlogPostQueryParams): Promise<StrapiCollectionResponse<BlogPost>> {
    return this.fetchWithRetry(async () => {
      const filters: any = {};

      if (params?.category) {
        filters.category = { $eq: params.category };
      }
      if (params?.forestLocation) {
        filters.forestLocation = { $eq: params.forestLocation };
      }
      if (params?.tags?.length) {
        filters.tags = { slug: { $in: params.tags } };
      }

      const response = await this.fetchWithCache<StrapiCollectionResponse<BlogPost>>(
        '/blog-posts',
        {
          filters,
          sort: 'publishedAt:desc',
          populate: ['featuredImage', 'author', 'author.avatar', 'tags'],
          pagination: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        }
      );

      return response;
    });
  }

  async getBlogPost(slug: string): Promise<BlogPost> {
    return this.fetchWithRetry(async () => {
      const response = await this.fetchWithCache<StrapiCollectionResponse<BlogPost>>(
        '/blog-posts',
        {
          filters: { slug: { $eq: slug } },
          populate: ['featuredImage', 'author', 'author.avatar', 'tags'],
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new StrapiError(`Blog post with slug "${slug}" not found`, 404);
      }

      return response.data[0];
    });
  }

  // ==================== Partners ====================

  async getPartners(params?: PartnerQueryParams): Promise<Partner[]> {
    return this.fetchWithRetry(async () => {
      const filters: any = {};

      if (params?.featured !== undefined) {
        filters.isFeatured = { $eq: params.featured };
      }

      const response = await this.fetchWithCache<StrapiCollectionResponse<Partner>>(
        '/partners',
        {
          filters,
          sort: 'displayOrder:asc',
          populate: 'logo',
        }
      );

      return response.data || [];
    });
  }

  async getPartner(slug: string): Promise<Partner> {
    return this.fetchWithRetry(async () => {
      const response = await this.fetchWithCache<StrapiCollectionResponse<Partner>>(
        '/partners',
        {
          filters: { slug: { $eq: slug } },
          populate: 'logo',
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new StrapiError(`Partner with slug "${slug}" not found`, 404);
      }

      return response.data[0];
    });
  }

  // ==================== FAQs ====================

  async getFAQs(params?: FAQQueryParams): Promise<FAQ[]> {
    return this.fetchWithRetry(async () => {
      const filters: any = { isPublished: { $eq: true } };

      if (params?.category) {
        filters.category = { $eq: params.category };
      }

      const response = await this.fetchWithCache<StrapiCollectionResponse<FAQ>>(
        '/faqs',
        {
          filters,
          sort: 'displayOrder:asc',
        }
      );

      return response.data || [];
    });
  }

  // ==================== Utility Methods ====================

  // Get media URL (handles both relative and absolute URLs)
  getMediaUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const strapiUrl = import.meta.env.VITE_STRAPI_URL;
    return `${strapiUrl}${url}`;
  }

  // Check if Strapi is configured
  isConfigured(): boolean {
    return !!import.meta.env.VITE_STRAPI_URL;
  }
}

// Export singleton instance
export const strapiService = new StrapiService();
