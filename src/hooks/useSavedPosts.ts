import { useState, useEffect, useCallback } from 'react';
import { socialFeedService } from '../services/socialFeed.service';

interface UseSavedPostsReturn {
  savedPostIds: Set<string>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  isSaved: (postId: string) => boolean;
  loading: boolean;
}

export function useSavedPosts(userId: string | null): UseSavedPostsReturn {
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch saved post IDs on mount
  useEffect(() => {
    if (!userId) {
      setSavedPostIds(new Set());
      return;
    }

    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const ids = await socialFeedService.getSavedPostIds(userId);
        setSavedPostIds(ids);
      } catch (error) {
        console.error('[useSavedPosts] Error fetching saved posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [userId]);

  const savePost = useCallback(
    async (postId: string) => {
      if (!userId) {
        console.warn('[useSavedPosts] Cannot save post: user not authenticated');
        return;
      }

      // Optimistic update
      setSavedPostIds((prev) => new Set([...prev, postId]));

      try {
        const result = await socialFeedService.savePost(postId, userId);
        if (!result.success) {
          // Revert on failure
          setSavedPostIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          console.error('[useSavedPosts] Failed to save post:', result.error);
        }
      } catch (error) {
        // Revert on error
        setSavedPostIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        console.error('[useSavedPosts] Error saving post:', error);
      }
    },
    [userId]
  );

  const unsavePost = useCallback(
    async (postId: string) => {
      if (!userId) {
        console.warn('[useSavedPosts] Cannot unsave post: user not authenticated');
        return;
      }

      // Optimistic update
      setSavedPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });

      try {
        const result = await socialFeedService.unsavePost(postId, userId);
        if (!result.success) {
          // Revert on failure
          setSavedPostIds((prev) => new Set([...prev, postId]));
          console.error('[useSavedPosts] Failed to unsave post:', result.error);
        }
      } catch (error) {
        // Revert on error
        setSavedPostIds((prev) => new Set([...prev, postId]));
        console.error('[useSavedPosts] Error unsaving post:', error);
      }
    },
    [userId]
  );

  const isSaved = useCallback(
    (postId: string): boolean => {
      return savedPostIds.has(postId);
    },
    [savedPostIds]
  );

  return {
    savedPostIds,
    savePost,
    unsavePost,
    isSaved,
    loading,
  };
}
