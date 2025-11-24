import { supabase } from './supabase';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import { JourneyStage } from '../types/journey.types';
import type {
  JourneyProgress,
  JourneyProgressRow,
  UserAction,
  Milestone,
  Recommendation,
  StageRequirements,
  JourneyServiceResponse,
} from '../types/journey.types';

/**
 * Journey Service
 * Manages user journey progression through the 5 stages:
 * Awareness → Activation → Action → Verification → Legacy
 */
class JourneyService {
  // Define stage order for progression
  private readonly stageOrder: JourneyStage[] = [
    JourneyStage.AWARENESS,
    JourneyStage.ACTIVATION,
    JourneyStage.ACTION,
    JourneyStage.VERIFICATION,
    JourneyStage.LEGACY,
  ];

  // Define stage requirements
  private readonly stageRequirements: Record<JourneyStage, StageRequirements> = {
    [JourneyStage.AWARENESS]: {
      stage: JourneyStage.AWARENESS,
      prerequisites: {},
    },
    [JourneyStage.ACTIVATION]: {
      stage: JourneyStage.ACTIVATION,
      prerequisites: {
        requiredCauses: 1, // Must join at least one cause
      },
    },
    [JourneyStage.ACTION]: {
      stage: JourneyStage.ACTION,
      prerequisites: {
        minPoints: 50, // Must earn some initial points
        requiredCauses: 1,
      },
    },
    [JourneyStage.VERIFICATION]: {
      stage: JourneyStage.VERIFICATION,
      prerequisites: {
        minTrees: 1, // Must plant at least one tree
        minChallenges: 1, // Must complete at least one challenge
      },
    },
    [JourneyStage.LEGACY]: {
      stage: JourneyStage.LEGACY,
      prerequisites: {
        minPoints: 500,
        minTrees: 5,
        minChallenges: 3,
      },
    },
  };

  /**
   * Initialize journey progress for a new user
   */
  async initializeJourney(userId: string): Promise<JourneyServiceResponse<JourneyProgress>> {
    try {
      console.log('[JourneyService] Initializing journey for user:', userId);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_journey_progress')
            .insert({
              user_id: userId,
              current_stage: JourneyStage.AWARENESS,
              stage_progress: {
                awareness: 0,
                activation: 0,
                action: 0,
                verification: 0,
                legacy: 0,
              },
            })
            .select()
            .single();
          
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'initializeJourney'
      );

      const { data, error } = result;

      if (error) {
        // If journey already exists, fetch it instead
        if ((error as any).code === '23505') {
          console.log('[JourneyService] Journey already exists, fetching...');
          return this.getJourneyProgress(userId);
        }
        console.error('[JourneyService] Error initializing journey:', error);
        return { data: null, error: new Error('Failed to initialize journey') };
      }

      const progress = this.transformJourneyData(data);
      console.log('[JourneyService] Journey initialized:', progress);

      return { data: progress, error: null };
    } catch (error) {
      console.error('[JourneyService] Exception initializing journey:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to initialize journey'),
      };
    }
  }

  /**
   * Get current journey progress for a user
   */
  async getJourneyProgress(userId: string): Promise<JourneyServiceResponse<JourneyProgress>> {
    try {
      console.log('[JourneyService] Fetching journey progress for user:', userId);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_journey_progress')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getJourneyProgress'
      );

      const { data, error } = result;

      if (error) {
        // If no journey exists, initialize it
        if ((error as any).code === 'PGRST116') {
          console.log('[JourneyService] No journey found, initializing...');
          return this.initializeJourney(userId);
        }
        console.error('[JourneyService] Error fetching journey:', error);
        return { data: null, error: new Error('Failed to fetch journey progress') };
      }

      const progress = this.transformJourneyData(data);
      return { data: progress, error: null };
    } catch (error) {
      console.error('[JourneyService] Exception fetching journey:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch journey progress'),
      };
    }
  }

  /**
   * Track a user action and update journey progress
   */
  async trackAction(
    userId: string,
    action: UserAction
  ): Promise<JourneyServiceResponse<JourneyProgress>> {
    try {
      console.log('[JourneyService] Tracking action:', { userId, action });

      // Get current progress
      const { data: currentProgress, error: fetchError } = await this.getJourneyProgress(userId);
      if (fetchError || !currentProgress) {
        return { data: null, error: fetchError || new Error('Failed to fetch progress') };
      }

      // Update counters based on action type
      const updates: Partial<JourneyProgressRow> = {};

      switch (action.type) {
        case 'tree_planted':
          updates.trees_planted = currentProgress.treesPlanted + 1;
          break;
        case 'challenge_completed':
          updates.challenges_completed = currentProgress.challengesCompleted + 1;
          break;
        case 'cause_joined':
          if (action.metadata?.causeId) {
            const causes = [...currentProgress.joinedCauses];
            if (!causes.includes(action.metadata.causeId)) {
              causes.push(action.metadata.causeId);
              updates.joined_causes = causes;
            }
          }
          break;
        case 'referral_made':
          updates.referral_count = currentProgress.referralCount + 1;
          break;
      }

      // Update the progress
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_journey_progress')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
          
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'trackAction'
      );

      const { data, error } = result;

      if (error) {
        console.error('[JourneyService] Error tracking action:', error);
        return { data: null, error: new Error('Failed to track action') };
      }

      const updatedProgress = this.transformJourneyData(data);

      // Check if user should advance to next stage
      await this.checkStageAdvancement(userId, updatedProgress);

      return { data: updatedProgress, error: null };
    } catch (error) {
      console.error('[JourneyService] Exception tracking action:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to track action'),
      };
    }
  }

  /**
   * Advance user to a specific stage
   */
  async advanceStage(
    userId: string,
    targetStage: JourneyStage
  ): Promise<JourneyServiceResponse<JourneyProgress>> {
    try {
      console.log('[JourneyService] Advancing to stage:', { userId, targetStage });

      // Get current progress
      const { data: currentProgress, error: fetchError } = await this.getJourneyProgress(userId);
      if (fetchError || !currentProgress) {
        return { data: null, error: fetchError || new Error('Failed to fetch progress') };
      }

      // Validate stage advancement
      const canAdvance = await this.validateStageAdvancement(currentProgress, targetStage);
      if (!canAdvance) {
        return {
          data: null,
          error: new Error('Prerequisites not met for stage advancement'),
        };
      }

      // Update to new stage
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_journey_progress')
            .update({
              current_stage: targetStage,
              stage_progress: {
                ...currentProgress.stageProgress,
                [currentProgress.currentStage]: 100, // Mark previous stage as complete
              },
            })
            .eq('user_id', userId)
            .select()
            .single();
          
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'advanceStage'
      );

      const { data, error } = result;

      if (error) {
        console.error('[JourneyService] Error advancing stage:', error);
        return { data: null, error: new Error('Failed to advance stage') };
      }

      const updatedProgress = this.transformJourneyData(data);
      console.log('[JourneyService] Stage advanced successfully:', updatedProgress);

      return { data: updatedProgress, error: null };
    } catch (error) {
      console.error('[JourneyService] Exception advancing stage:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to advance stage'),
      };
    }
  }

  /**
   * Update stage progress percentage
   */
  async updateStageProgress(
    userId: string,
    stage: JourneyStage,
    progress: number
  ): Promise<JourneyServiceResponse<JourneyProgress>> {
    try {
      // Clamp progress between 0 and 100
      const clampedProgress = Math.max(0, Math.min(100, progress));

      const { data: currentProgress, error: fetchError } = await this.getJourneyProgress(userId);
      if (fetchError || !currentProgress) {
        return { data: null, error: fetchError || new Error('Failed to fetch progress') };
      }

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_journey_progress')
            .update({
              stage_progress: {
                ...currentProgress.stageProgress,
                [stage]: clampedProgress,
              },
            })
            .eq('user_id', userId)
            .select()
            .single();
          
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'updateStageProgress'
      );

      const { data, error } = result;

      if (error) {
        console.error('[JourneyService] Error updating stage progress:', error);
        return { data: null, error: new Error('Failed to update stage progress') };
      }

      return { data: this.transformJourneyData(data), error: null };
    } catch (error) {
      console.error('[JourneyService] Exception updating stage progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to update stage progress'),
      };
    }
  }

  /**
   * Mark a milestone as completed
   */
  async completeMilestone(
    userId: string,
    milestoneId: string
  ): Promise<JourneyServiceResponse<JourneyProgress>> {
    try {
      const { data: currentProgress, error: fetchError } = await this.getJourneyProgress(userId);
      if (fetchError || !currentProgress) {
        return { data: null, error: fetchError || new Error('Failed to fetch progress') };
      }

      // Check if milestone already completed
      if (currentProgress.completedMilestones.includes(milestoneId)) {
        return { data: currentProgress, error: null };
      }

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_journey_progress')
            .update({
              completed_milestones: [...currentProgress.completedMilestones, milestoneId],
            })
            .eq('user_id', userId)
            .select()
            .single();
          
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'completeMilestone'
      );

      const { data, error } = result;

      if (error) {
        console.error('[JourneyService] Error completing milestone:', error);
        return { data: null, error: new Error('Failed to complete milestone') };
      }

      return { data: this.transformJourneyData(data), error: null };
    } catch (error) {
      console.error('[JourneyService] Exception completing milestone:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to complete milestone'),
      };
    }
  }

  /**
   * Get recommended actions for user based on current stage
   */
  async getRecommendations(userId: string): Promise<JourneyServiceResponse<Recommendation[]>> {
    try {
      const { data: progress, error } = await this.getJourneyProgress(userId);
      if (error || !progress) {
        return { data: null, error: error || new Error('Failed to fetch progress') };
      }

      const recommendations: Recommendation[] = [];

      // Generate recommendations based on current stage
      switch (progress.currentStage) {
        case JourneyStage.AWARENESS:
          recommendations.push({
            id: 'start-onboarding',
            type: 'cause',
            title: 'Start Your Journey',
            description: 'Complete onboarding and select your causes',
            priority: 1,
            actionUrl: '/onboarding',
          });
          break;

        case JourneyStage.ACTIVATION:
          if (progress.joinedCauses.length === 0) {
            recommendations.push({
              id: 'join-cause',
              type: 'cause',
              title: 'Join a Cause',
              description: 'Select environmental causes you care about',
              priority: 1,
              actionUrl: '/causes',
            });
          }
          recommendations.push({
            id: 'first-challenge',
            type: 'challenge',
            title: 'Complete Your First Challenge',
            description: 'Take on a micro-challenge to earn points',
            priority: 2,
            actionUrl: '/challenges',
          });
          break;

        case JourneyStage.ACTION:
          recommendations.push({
            id: 'more-challenges',
            type: 'challenge',
            title: 'Complete More Challenges',
            description: 'Keep building your impact with micro-challenges',
            priority: 1,
            actionUrl: '/challenges',
          });
          break;

        case JourneyStage.VERIFICATION:
          recommendations.push({
            id: 'sign-petition',
            type: 'petition',
            title: 'Support a Petition',
            description: 'Advocate for environmental policy changes',
            priority: 1,
            actionUrl: '/petitions',
          });
          break;

        case JourneyStage.LEGACY:
          recommendations.push({
            id: 'refer-friends',
            type: 'challenge',
            title: 'Invite Friends',
            description: 'Expand your impact by inviting others to join',
            priority: 1,
            actionUrl: '/referrals',
          });
          recommendations.push({
            id: 'create-petition',
            type: 'petition',
            title: 'Create a Petition',
            description: 'Start your own environmental advocacy campaign',
            priority: 2,
            actionUrl: '/petitions/create',
          });
          break;
      }

      return { data: recommendations, error: null };
    } catch (error) {
      console.error('[JourneyService] Exception getting recommendations:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to get recommendations'),
      };
    }
  }

  /**
   * Get next milestone for user
   */
  getNextMilestone(progress: JourneyProgress): Milestone | null {
    // This would typically fetch from a milestones table
    // For now, return a simple milestone based on current stage
    const milestones: Record<JourneyStage, Milestone> = {
      [JourneyStage.AWARENESS]: {
        id: 'complete-onboarding',
        name: 'Complete Onboarding',
        description: 'Finish the onboarding process and select your causes',
        stage: JourneyStage.AWARENESS,
        requiredActions: [{ type: 'cause_join', count: 1, description: 'Join at least one cause' }],
        reward: { points: 50 },
      },
      [JourneyStage.ACTIVATION]: {
        id: 'first-action',
        name: 'Take First Action',
        description: 'Complete your first environmental action',
        stage: JourneyStage.ACTIVATION,
        requiredActions: [
          { type: 'challenge_complete', count: 1, description: 'Complete one challenge' },
        ],
        reward: { points: 100, badge: 'action-taker' },
      },
      [JourneyStage.ACTION]: {
        id: 'plant-first-tree',
        name: 'Plant Your First Tree',
        description: 'Make a lasting impact by planting a tree',
        stage: JourneyStage.ACTION,
        requiredActions: [{ type: 'tree_plant', count: 1, description: 'Plant one tree' }],
        reward: { points: 200, badge: 'tree-planter' },
      },
      [JourneyStage.VERIFICATION]: {
        id: 'verified-impact',
        name: 'Verified Impact',
        description: 'Have your environmental actions verified',
        stage: JourneyStage.VERIFICATION,
        requiredActions: [
          { type: 'tree_plant', count: 3, description: 'Plant 3 verified trees' },
        ],
        reward: { points: 500, badge: 'verified-hero' },
      },
      [JourneyStage.LEGACY]: {
        id: 'legacy-builder',
        name: 'Legacy Builder',
        description: 'Build a lasting environmental legacy',
        stage: JourneyStage.LEGACY,
        requiredActions: [
          { type: 'tree_plant', count: 10, description: 'Plant 10 trees' },
          { type: 'referral', count: 5, description: 'Refer 5 friends' },
        ],
        reward: { points: 1000, badge: 'legacy-hero' },
      },
    };

    return milestones[progress.currentStage] || null;
  }

  /**
   * Check if user should advance to next stage
   */
  private async checkStageAdvancement(
    userId: string,
    progress: JourneyProgress
  ): Promise<void> {
    const currentStageIndex = this.stageOrder.indexOf(progress.currentStage);
    if (currentStageIndex === this.stageOrder.length - 1) {
      // Already at final stage
      return;
    }

    const nextStage = this.stageOrder[currentStageIndex + 1];
    const canAdvance = await this.validateStageAdvancement(progress, nextStage);

    if (canAdvance) {
      console.log('[JourneyService] Auto-advancing to next stage:', nextStage);
      await this.advanceStage(userId, nextStage);
    }
  }

  /**
   * Validate if user meets requirements for stage advancement
   */
  private async validateStageAdvancement(
    progress: JourneyProgress,
    targetStage: JourneyStage
  ): Promise<boolean> {
    const requirements = this.stageRequirements[targetStage];
    if (!requirements) return false;

    const { prerequisites } = requirements;

    // Check all prerequisites
    if (prerequisites.minPoints && progress.totalPoints < prerequisites.minPoints) {
      return false;
    }

    if (prerequisites.minTrees && progress.treesPlanted < prerequisites.minTrees) {
      return false;
    }

    if (prerequisites.minChallenges && progress.challengesCompleted < prerequisites.minChallenges) {
      return false;
    }

    if (prerequisites.requiredCauses && progress.joinedCauses.length < prerequisites.requiredCauses) {
      return false;
    }

    if (prerequisites.requiredMilestones) {
      const hasAllMilestones = prerequisites.requiredMilestones.every((milestone) =>
        progress.completedMilestones.includes(milestone)
      );
      if (!hasAllMilestones) return false;
    }

    return true;
  }

  /**
   * Transform database row to JourneyProgress type
   */
  private transformJourneyData(data: JourneyProgressRow): JourneyProgress {
    return {
      id: data.id,
      userId: data.user_id,
      currentStage: data.current_stage as JourneyStage,
      stageProgress: data.stage_progress as Record<JourneyStage, number>,
      completedMilestones: data.completed_milestones,
      joinedCauses: data.joined_causes,
      totalPoints: data.total_points,
      treesPlanted: data.trees_planted,
      challengesCompleted: data.challenges_completed,
      referralCount: data.referral_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Export singleton instance
export const journeyService = new JourneyService();
