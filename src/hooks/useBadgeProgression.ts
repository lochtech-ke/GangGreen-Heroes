import { useState, useEffect } from 'react';
import { badgeProgressionService } from '../services/badgeProgression.service';
import type { BadgeProgress } from '../types/badgeProgression.types';

/**
 * Custom hook for badge progression data
 * Fetches and manages badge progression state for a user
 */
export function useBadgeProgression(userId: string | undefined) {
  const [progress, setProgress] = useState<BadgeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await badgeProgressionService.getProgressToNextBadge(userId);
        
        if (mounted) {
          setProgress(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load badge progress');
          console.error('[useBadgeProgression] Error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProgress();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return {
    progress,
    currentBadge: progress?.currentBadge || null,
    nextBadge: progress?.nextBadge || null,
    progressPercentage: progress?.progressPercentage || 0,
    requirementProgress: progress?.requirementProgress || [],
    loading,
    error,
    refresh: async () => {
      if (userId) {
        const data = await badgeProgressionService.getProgressToNextBadge(userId);
        setProgress(data);
      }
    },
  };
}
