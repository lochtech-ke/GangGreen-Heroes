import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { userCache } from './userCache';
import type { User } from '../types/user.types';

describe('UserCache', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'individual',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Clear cache before each test
    userCache.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get and set operations', () => {
    it('should return null for non-existent cache entry', () => {
      const result = userCache.get('non-existent-id');
      expect(result).toBeNull();
    });

    it('should store and retrieve user from cache', () => {
      userCache.set(mockUser.id, mockUser);
      const result = userCache.get(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should update existing cache entry', () => {
      userCache.set(mockUser.id, mockUser);

      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      userCache.set(mockUser.id, updatedUser);

      const result = userCache.get(mockUser.id);
      expect(result).toEqual(updatedUser);
    });

    it('should handle multiple users in cache', () => {
      const user1 = { ...mockUser, id: 'user-1' };
      const user2 = { ...mockUser, id: 'user-2' };
      const user3 = { ...mockUser, id: 'user-3' };

      userCache.set(user1.id, user1);
      userCache.set(user2.id, user2);
      userCache.set(user3.id, user3);

      expect(userCache.get(user1.id)).toEqual(user1);
      expect(userCache.get(user2.id)).toEqual(user2);
      expect(userCache.get(user3.id)).toEqual(user3);
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired cache entry', () => {
      // Use fake timers
      vi.useFakeTimers();

      userCache.set(mockUser.id, mockUser);

      // Fast-forward time by 6 minutes (TTL is 5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000);

      const result = userCache.get(mockUser.id);
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should return user if accessed before expiration', () => {
      vi.useFakeTimers();

      userCache.set(mockUser.id, mockUser);

      // Fast-forward time by 4 minutes (before TTL)
      vi.advanceTimersByTime(4 * 60 * 1000);

      const result = userCache.get(mockUser.id);
      expect(result).toEqual(mockUser);

      vi.useRealTimers();
    });

    it('should remove expired entry from cache on get', () => {
      vi.useFakeTimers();

      userCache.set(mockUser.id, mockUser);
      const statsBefore = userCache.getStats();
      expect(statsBefore.size).toBe(1);

      // Fast-forward time past expiration
      vi.advanceTimersByTime(6 * 60 * 1000);

      userCache.get(mockUser.id);

      const statsAfter = userCache.getStats();
      expect(statsAfter.size).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('invalidation and clear', () => {
    it('should invalidate specific user cache entry', () => {
      userCache.set(mockUser.id, mockUser);
      expect(userCache.get(mockUser.id)).toEqual(mockUser);

      userCache.invalidate(mockUser.id);
      expect(userCache.get(mockUser.id)).toBeNull();
    });

    it('should not affect other entries when invalidating one', () => {
      const user1 = { ...mockUser, id: 'user-1' };
      const user2 = { ...mockUser, id: 'user-2' };

      userCache.set(user1.id, user1);
      userCache.set(user2.id, user2);

      userCache.invalidate(user1.id);

      expect(userCache.get(user1.id)).toBeNull();
      expect(userCache.get(user2.id)).toEqual(user2);
    });

    it('should clear all cache entries', () => {
      const user1 = { ...mockUser, id: 'user-1' };
      const user2 = { ...mockUser, id: 'user-2' };
      const user3 = { ...mockUser, id: 'user-3' };

      userCache.set(user1.id, user1);
      userCache.set(user2.id, user2);
      userCache.set(user3.id, user3);

      userCache.clear();

      expect(userCache.get(user1.id)).toBeNull();
      expect(userCache.get(user2.id)).toBeNull();
      expect(userCache.get(user3.id)).toBeNull();
    });

    it('should reset size to 0 after clear', () => {
      userCache.set('user-1', mockUser);
      userCache.set('user-2', mockUser);

      userCache.clear();

      const stats = userCache.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('cache statistics', () => {
    it('should track cache hits', () => {
      userCache.set(mockUser.id, mockUser);

      userCache.get(mockUser.id); // Hit
      userCache.get(mockUser.id); // Hit

      const stats = userCache.getStats();
      expect(stats.hits).toBe(2);
    });

    it('should track cache misses', () => {
      userCache.get('non-existent-1'); // Miss
      userCache.get('non-existent-2'); // Miss

      const stats = userCache.getStats();
      expect(stats.misses).toBe(2);
    });

    it('should track both hits and misses', () => {
      userCache.set(mockUser.id, mockUser);

      userCache.get(mockUser.id); // Hit
      userCache.get('non-existent'); // Miss
      userCache.get(mockUser.id); // Hit

      const stats = userCache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should track cache size', () => {
      const stats1 = userCache.getStats();
      expect(stats1.size).toBe(0);

      userCache.set('user-1', mockUser);
      const stats2 = userCache.getStats();
      expect(stats2.size).toBe(1);

      userCache.set('user-2', mockUser);
      const stats3 = userCache.getStats();
      expect(stats3.size).toBe(2);
    });

    it('should update size when invalidating', () => {
      userCache.set('user-1', mockUser);
      userCache.set('user-2', mockUser);

      userCache.invalidate('user-1');

      const stats = userCache.getStats();
      expect(stats.size).toBe(1);
    });

    it('should calculate hit rate correctly', () => {
      userCache.set(mockUser.id, mockUser);

      userCache.get(mockUser.id); // Hit
      userCache.get(mockUser.id); // Hit
      userCache.get('non-existent'); // Miss

      const hitRate = userCache.getHitRate();
      expect(hitRate).toBeCloseTo(66.67, 1); // 2 hits out of 3 total
    });

    it('should return 0 hit rate when no operations', () => {
      const hitRate = userCache.getHitRate();
      expect(hitRate).toBe(0);
    });

    it('should return 100 hit rate when all hits', () => {
      userCache.set(mockUser.id, mockUser);

      userCache.get(mockUser.id);
      userCache.get(mockUser.id);

      const hitRate = userCache.getHitRate();
      expect(hitRate).toBe(100);
    });

    it('should return 0 hit rate when all misses', () => {
      userCache.get('non-existent-1');
      userCache.get('non-existent-2');

      const hitRate = userCache.getHitRate();
      expect(hitRate).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries during cleanup', () => {
      vi.useFakeTimers();

      const user1 = { ...mockUser, id: 'user-1' };
      const user2 = { ...mockUser, id: 'user-2' };

      userCache.set(user1.id, user1);

      // Fast-forward 3 minutes
      vi.advanceTimersByTime(3 * 60 * 1000);

      userCache.set(user2.id, user2);

      // Fast-forward another 3 minutes (user1 expired, user2 still valid)
      vi.advanceTimersByTime(3 * 60 * 1000);

      userCache.cleanup();

      expect(userCache.get(user1.id)).toBeNull();
      expect(userCache.get(user2.id)).toEqual(user2);

      vi.useRealTimers();
    });

    it('should update size after cleanup', () => {
      vi.useFakeTimers();

      userCache.set('user-1', mockUser);
      userCache.set('user-2', mockUser);

      // Fast-forward past expiration
      vi.advanceTimersByTime(6 * 60 * 1000);

      userCache.cleanup();

      const stats = userCache.getStats();
      expect(stats.size).toBe(0);

      vi.useRealTimers();
    });

    it('should not remove valid entries during cleanup', () => {
      vi.useFakeTimers();

      userCache.set(mockUser.id, mockUser);

      // Fast-forward 2 minutes (still valid)
      vi.advanceTimersByTime(2 * 60 * 1000);

      userCache.cleanup();

      expect(userCache.get(mockUser.id)).toEqual(mockUser);

      vi.useRealTimers();
    });

    it('should handle cleanup with no entries', () => {
      expect(() => userCache.cleanup()).not.toThrow();
    });

    it('should handle cleanup with all valid entries', () => {
      userCache.set('user-1', mockUser);
      userCache.set('user-2', mockUser);

      userCache.cleanup();

      const stats = userCache.getStats();
      expect(stats.size).toBe(2);
    });
  });
});
