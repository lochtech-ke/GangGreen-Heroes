import type { User } from '../types/user.types';

/**
 * Cached user data with metadata
 */
interface CachedUser {
  user: User;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache statistics for monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

/**
 * User Cache Service
 * Provides in-memory caching for user data to reduce database queries
 */
class UserCache {
  private cache: Map<string, CachedUser>;
  private TTL: number;
  private stats: CacheStats;

  constructor(ttlMinutes: number = 5) {
    this.cache = new Map();
    this.TTL = ttlMinutes * 60 * 1000; // Convert minutes to milliseconds
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
    };
  }

  /**
   * Get user from cache if valid
   * @param userId - User ID to retrieve
   * @returns User object if cached and valid, null otherwise
   */
  get(userId: string): User | null {
    const cached = this.cache.get(userId);

    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(userId);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    this.stats.hits++;
    return cached.user;
  }

  /**
   * Store user in cache
   * @param userId - User ID to cache
   * @param user - User object to store
   */
  set(userId: string, user: User): void {
    const now = Date.now();
    const cached: CachedUser = {
      user,
      timestamp: now,
      expiresAt: now + this.TTL,
    };

    this.cache.set(userId, cached);
    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate a specific user's cache entry
   * @param userId - User ID to invalidate
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate as percentage
   * @returns Hit rate percentage (0-100)
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return (this.stats.hits / total) * 100;
  }

  /**
   * Clean up expired entries
   * Should be called periodically to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(userId);
        cleaned++;
      }
    }

    this.stats.size = this.cache.size;

    if (cleaned > 0) {
      console.log(`[UserCache] Cleaned up ${cleaned} expired entries`);
    }
  }
}

// Export singleton instance with 5-minute TTL
export const userCache = new UserCache(5);
