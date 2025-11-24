import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { journeyService } from '../services/journey.service';
import { supabase } from '../services/supabase';
import type {
  JourneyProgress,
  JourneyStage,
  UserAction,
  Milestone,
  Recommendation,
} from '../types/journey.types';

interface JourneyContextValue {
  progress: JourneyProgress | null;
  loading: boolean;
  error: Error | null;
  currentStage: JourneyStage | null;
  nextMilestone: Milestone | null;
  recommendations: Recommendation[];
  advanceStage: (stage: JourneyStage) => Promise<void>;
  trackAction: (action: UserAction) => Promise<void>;
  updateStageProgress: (stage: JourneyStage, progress: number) => Promise<void>;
  completeMilestone: (milestoneId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(undefined);

interface JourneyProviderProps {
  children: React.ReactNode;
  userId: string | null;
}

export function JourneyProvider({ children, userId }: JourneyProviderProps) {
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  /**
   * Fetch journey progress for current user
   */
  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await journeyService.getJourneyProgress(userId);

      if (fetchError) {
        console.error('[JourneyContext] Error fetching progress:', fetchError);
        setError(fetchError);
        setProgress(null);
      } else {
        setProgress(data);

        // Fetch recommendations
        if (data) {
          const { data: recs } = await journeyService.getRecommendations(userId);
          if (recs) {
            setRecommendations(recs);
          }
        }
      }
    } catch (err) {
      console.error('[JourneyContext] Exception fetching progress:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch journey progress'));
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Initialize and subscribe to journey updates
   */
  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchProgress();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`journey:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_journey_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[JourneyContext] Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            // Transform and update progress
            const newData = payload.new as any;
            if (newData) {
              setProgress({
                id: newData.id,
                userId: newData.user_id,
                currentStage: newData.current_stage,
                stageProgress: newData.stage_progress,
                completedMilestones: newData.completed_milestones,
                joinedCauses: newData.joined_causes,
                totalPoints: newData.total_points,
                treesPlanted: newData.trees_planted,
                challengesCompleted: newData.challenges_completed,
                referralCount: newData.referral_count,
                createdAt: new Date(newData.created_at),
                updatedAt: new Date(newData.updated_at),
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchProgress]);

  /**
   * Advance to a specific stage
   */
  const advanceStage = useCallback(
    async (stage: JourneyStage) => {
      if (!userId) return;

      try {
        setError(null);
        const { data, error: advanceError } = await journeyService.advanceStage(userId, stage);

        if (advanceError) {
          console.error('[JourneyContext] Error advancing stage:', advanceError);
          setError(advanceError);
        } else if (data) {
          setProgress(data);
          
          // Refresh recommendations
          const { data: recs } = await journeyService.getRecommendations(userId);
          if (recs) {
            setRecommendations(recs);
          }
        }
      } catch (err) {
        console.error('[JourneyContext] Exception advancing stage:', err);
        setError(err instanceof Error ? err : new Error('Failed to advance stage'));
      }
    },
    [userId]
  );

  /**
   * Track a user action
   */
  const trackAction = useCallback(
    async (action: UserAction) => {
      if (!userId) return;

      try {
        setError(null);
        const { data, error: trackError } = await journeyService.trackAction(userId, action);

        if (trackError) {
          console.error('[JourneyContext] Error tracking action:', trackError);
          setError(trackError);
        } else if (data) {
          setProgress(data);
        }
      } catch (err) {
        console.error('[JourneyContext] Exception tracking action:', err);
        setError(err instanceof Error ? err : new Error('Failed to track action'));
      }
    },
    [userId]
  );

  /**
   * Update stage progress percentage
   */
  const updateStageProgress = useCallback(
    async (stage: JourneyStage, progressValue: number) => {
      if (!userId) return;

      try {
        setError(null);
        const { data, error: updateError } = await journeyService.updateStageProgress(
          userId,
          stage,
          progressValue
        );

        if (updateError) {
          console.error('[JourneyContext] Error updating progress:', updateError);
          setError(updateError);
        } else if (data) {
          setProgress(data);
        }
      } catch (err) {
        console.error('[JourneyContext] Exception updating progress:', err);
        setError(err instanceof Error ? err : new Error('Failed to update progress'));
      }
    },
    [userId]
  );

  /**
   * Complete a milestone
   */
  const completeMilestone = useCallback(
    async (milestoneId: string) => {
      if (!userId) return;

      try {
        setError(null);
        const { data, error: completeError } = await journeyService.completeMilestone(
          userId,
          milestoneId
        );

        if (completeError) {
          console.error('[JourneyContext] Error completing milestone:', completeError);
          setError(completeError);
        } else if (data) {
          setProgress(data);
        }
      } catch (err) {
        console.error('[JourneyContext] Exception completing milestone:', err);
        setError(err instanceof Error ? err : new Error('Failed to complete milestone'));
      }
    },
    [userId]
  );

  /**
   * Manually refresh progress
   */
  const refreshProgress = useCallback(async () => {
    await fetchProgress();
  }, [fetchProgress]);

  // Calculate next milestone
  const nextMilestone = progress ? journeyService.getNextMilestone(progress) : null;

  const value: JourneyContextValue = {
    progress,
    loading,
    error,
    currentStage: progress?.currentStage || null,
    nextMilestone,
    recommendations,
    advanceStage,
    trackAction,
    updateStageProgress,
    completeMilestone,
    refreshProgress,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

/**
 * Hook to use journey context
 */
export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
