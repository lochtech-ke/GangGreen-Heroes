import { useState, useEffect, useCallback, useRef } from 'react';
import { socialFeedService } from '../services/socialFeed.service';
import type { SocialPost, FeedFilters as FeedFiltersType } from '../types/socialFeed.types';

interface UseSocialFeedReturn {
  posts: SocialPost[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  filters: FeedFiltersType;
  setFilters: (filters: FeedFiltersType) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const POSTS_PER_PAGE = 20;

interface CacheEntry {
  posts: SocialPost[];
  timestamp: number;
  hasMore: boolean;
  total: number;
}

const cache = new Map<string, CacheEntry>();

export function useSocialFeed(): UseSocialFeedReturn {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<FeedFiltersType>({
    platform: 'all',
    location: 'all',
    sortBy: 'recent',
  });

  const loadingRef = useRef(false);
  const filtersRef = useRef(filters);

  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const getCacheKey = (currentFilters: FeedFiltersType, currentPage: number): string => {
    return JSON.stringify({ filters: currentFilters, page: currentPage });
  };

  const getCachedData = (key: string): CacheEntry | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    cache.delete(key);
    return null;
  };

  const fetchPosts = useCallback(async (currentPage: number, append: boolean = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const cacheKey = getCacheKey(filtersRef.current, currentPage);
      const cached = getCachedData(cacheKey);

      if (cached) {
        console.log('[useSocialFeed] Using cached data');
        if (append) {
          setPosts((prev) => [...prev, ...cached.posts]);
        } else {
          setPosts(cached.posts);
        }
        setHasMore(cached.hasMore);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      console.log('[useSocialFeed] Fetching posts', { page: currentPage, filters: filtersRef.current });

      const response = await socialFeedService.getPosts(
        filtersRef.current,
        currentPage,
        POSTS_PER_PAGE
      );

      // Cache the response
      cache.set(cacheKey, {
        posts: response.posts,
        timestamp: Date.now(),
        hasMore: response.hasMore,
        total: response.total,
      });

      if (append) {
        setPosts((prev) => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }

      setHasMore(response.hasMore);
    } catch (err) {
      console.error('[useSocialFeed] Error fetching posts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, true);
  }, [hasMore, page, fetchPosts]);

  const refresh = useCallback(async () => {
    console.log('[useSocialFeed] Refreshing feed');
    cache.clear();
    setPage(1);
    setPosts([]);
    setHasMore(true);
    await fetchPosts(1, false);
  }, [fetchPosts]);

  const setFilters = useCallback((newFilters: FeedFiltersType) => {
    console.log('[useSocialFeed] Filters changed', newFilters);
    setFiltersState(newFilters);
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, []);

  // Initial load and filter changes
  useEffect(() => {
    fetchPosts(1, false);
  }, [filters]);

  return {
    posts,
    loading,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh,
  };
}
