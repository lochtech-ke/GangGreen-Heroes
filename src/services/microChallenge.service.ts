import { supabase } from './supabase';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import type {
  MicroChallenge,
  MicroChallengeRow,
  UserChallengeProgress,
  UserChallengeProgressRow,
  ChallengeFilters,
  JoinChallengeParams,
  UpdateProgressParams,
  CompleteChallengeParams,
  ChallengeServiceResponse,
} from '../types/microChallenge.types';

/**
 * Micro-Challenge Service
 * Manages micro-challenges and user participation
 */
class MicroChallengeService {
  /**
   * Get all active challenges with optional filters
   */
  async getChallenges(
    filters?: ChallengeFilters
  ): Promise<ChallengeServiceResponse<MicroChallenge[]>> {
    try {
      console.log('[MicroChallengeService] Fetching challenges with filters:', filters);

      const result = await withRetry(
        async () => {
          let query = supabase.from('micro_challenges').select('*');

          // Apply filters
          if (filters?.difficulty) {
            query = query.eq('difficulty', filters.difficulty);
          }
          if (filters?.category) {
            query = query.eq('category', filters.category);
          }
          if (filters?.isActive !== undefined) {
            query = query.eq('is_active', filters.isActive);
          } else {
            // Default to active challenges only
            query = query.eq('is_active', true);
          }

          query = query.order('created_at', { ascending: false });

          const response = await query;
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getChallenges'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error fetching challenges:', error);
        return { data: null, error: new Error('Failed to fetch challenges') };
      }

      const challenges = data.map((row: MicroChallengeRow) => this.transformChallengeData(row));
      return { data: challenges, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception fetching challenges:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch challenges'),
      };
    }
  }

  /**
   * Get a single challenge by ID
   */
  async getChallengeById(
    challengeId: string
  ): Promise<ChallengeServiceResponse<MicroChallenge>> {
    try {
      console.log('[MicroChallengeService] Fetching challenge:', challengeId);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('micro_challenges')
            .select('*')
            .eq('id', challengeId)
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getChallengeById'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error fetching challenge:', error);
        return { data: null, error: new Error('Failed to fetch challenge') };
      }

      const challenge = this.transformChallengeData(data);
      return { data: challenge, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception fetching challenge:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch challenge'),
      };
    }
  }

  /**
   * Get user's active challenges
   */
  async getUserChallenges(
    userId: string
  ): Promise<ChallengeServiceResponse<UserChallengeProgress[]>> {
    try {
      console.log('[MicroChallengeService] Fetching user challenges:', userId);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_challenge_progress')
            .select(
              `
              *,
              micro_challenges (*)
            `
            )
            .eq('user_id', userId)
            .order('started_at', { ascending: false });

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getUserChallenges'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error fetching user challenges:', error);
        return { data: null, error: new Error('Failed to fetch user challenges') };
      }

      const userChallenges = data.map((row: any) =>
        this.transformUserChallengeData(row)
      );
      return { data: userChallenges, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception fetching user challenges:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch user challenges'),
      };
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(
    params: JoinChallengeParams
  ): Promise<ChallengeServiceResponse<UserChallengeProgress>> {
    try {
      console.log('[MicroChallengeService] Joining challenge:', params);

      // Check if user already joined this challenge
      const existing = await this.getUserChallengeProgress(params.userId, params.challengeId);
      if (existing.data) {
        return existing;
      }

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_challenge_progress')
            .insert({
              user_id: params.userId,
              challenge_id: params.challengeId,
              status: 'active',
              progress: {},
            })
            .select(
              `
              *,
              micro_challenges (*)
            `
            )
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'joinChallenge'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error joining challenge:', error);
        return { data: null, error: new Error('Failed to join challenge') };
      }

      // Increment participant count
      await this.incrementParticipantCount(params.challengeId);

      const userChallenge = this.transformUserChallengeData(data);
      console.log('[MicroChallengeService] Successfully joined challenge');

      return { data: userChallenge, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception joining challenge:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to join challenge'),
      };
    }
  }

  /**
   * Update challenge progress
   */
  async updateProgress(
    params: UpdateProgressParams
  ): Promise<ChallengeServiceResponse<UserChallengeProgress>> {
    try {
      console.log('[MicroChallengeService] Updating progress:', params);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_challenge_progress')
            .update({
              progress: params.progress,
            })
            .eq('user_id', params.userId)
            .eq('challenge_id', params.challengeId)
            .select(
              `
              *,
              micro_challenges (*)
            `
            )
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'updateProgress'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error updating progress:', error);
        return { data: null, error: new Error('Failed to update progress') };
      }

      const userChallenge = this.transformUserChallengeData(data);
      return { data: userChallenge, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception updating progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to update progress'),
      };
    }
  }

  /**
   * Complete a challenge
   */
  async completeChallenge(
    params: CompleteChallengeParams
  ): Promise<ChallengeServiceResponse<UserChallengeProgress>> {
    try {
      console.log('[MicroChallengeService] Completing challenge:', params);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_challenge_progress')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('user_id', params.userId)
            .eq('challenge_id', params.challengeId)
            .select(
              `
              *,
              micro_challenges (*)
            `
            )
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'completeChallenge'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error completing challenge:', error);
        return { data: null, error: new Error('Failed to complete challenge') };
      }

      // Increment completion count
      await this.incrementCompletionCount(params.challengeId);

      const userChallenge = this.transformUserChallengeData(data);
      console.log('[MicroChallengeService] Successfully completed challenge');

      return { data: userChallenge, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception completing challenge:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to complete challenge'),
      };
    }
  }

  /**
   * Abandon a challenge
   */
  async abandonChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeServiceResponse<UserChallengeProgress>> {
    try {
      console.log('[MicroChallengeService] Abandoning challenge:', { userId, challengeId });

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_challenge_progress')
            .update({
              status: 'abandoned',
            })
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .select(
              `
              *,
              micro_challenges (*)
            `
            )
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'abandonChallenge'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error abandoning challenge:', error);
        return { data: null, error: new Error('Failed to abandon challenge') };
      }

      const userChallenge = this.transformUserChallengeData(data);
      return { data: userChallenge, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception abandoning challenge:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to abandon challenge'),
      };
    }
  }

  /**
   * Get user's progress for a specific challenge
   */
  async getUserChallengeProgress(
    userId: string,
    challengeId: string
  ): Promise<ChallengeServiceResponse<UserChallengeProgress>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('user_challenge_progress')
            .select(
              `
              *,
              micro_challenges (*)
            `
            )
            .eq('user_id', userId)
            .eq('challenge_id', challengeId)
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getUserChallengeProgress'
      );

      const { data, error } = result;

      if (error) {
        if ((error as any).code === 'PGRST116') {
          // No progress found
          return { data: null, error: null };
        }
        console.error('[MicroChallengeService] Error fetching progress:', error);
        return { data: null, error: new Error('Failed to fetch progress') };
      }

      const userChallenge = this.transformUserChallengeData(data);
      return { data: userChallenge, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception fetching progress:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch progress'),
      };
    }
  }

  /**
   * Get challenge categories
   */
  async getCategories(): Promise<ChallengeServiceResponse<string[]>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('micro_challenges')
            .select('category')
            .eq('is_active', true);

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getCategories'
      );

      const { data, error } = result;

      if (error) {
        console.error('[MicroChallengeService] Error fetching categories:', error);
        return { data: null, error: new Error('Failed to fetch categories') };
      }

      // Extract unique categories
      const categories = [...new Set(data.map((row: any) => row.category))];
      return { data: categories, error: null };
    } catch (error) {
      console.error('[MicroChallengeService] Exception fetching categories:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch categories'),
      };
    }
  }

  /**
   * Increment participant count for a challenge
   */
  private async incrementParticipantCount(challengeId: string): Promise<void> {
    try {
      await supabase.rpc('increment', {
        table_name: 'micro_challenges',
        row_id: challengeId,
        column_name: 'participant_count',
      });
    } catch (error) {
      console.error('[MicroChallengeService] Error incrementing participant count:', error);
    }
  }

  /**
   * Increment completion count for a challenge
   */
  private async incrementCompletionCount(challengeId: string): Promise<void> {
    try {
      await supabase.rpc('increment', {
        table_name: 'micro_challenges',
        row_id: challengeId,
        column_name: 'completion_count',
      });
    } catch (error) {
      console.error('[MicroChallengeService] Error incrementing completion count:', error);
    }
  }

  /**
   * Transform database row to MicroChallenge type
   */
  private transformChallengeData(row: MicroChallengeRow): MicroChallenge {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      points: row.points,
      category: row.category,
      requirements: row.requirements || [],
      timeLimit: row.time_limit || undefined,
      isActive: row.is_active,
      participantCount: row.participant_count,
      completionCount: row.completion_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Transform database row to UserChallengeProgress type
   */
  private transformUserChallengeData(row: any): UserChallengeProgress {
    const progress: UserChallengeProgress = {
      id: row.id,
      userId: row.user_id,
      challengeId: row.challenge_id,
      status: row.status,
      progress: row.progress || {},
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    };

    // Include challenge data if available
    if (row.micro_challenges) {
      const challengeData = Array.isArray(row.micro_challenges)
        ? row.micro_challenges[0]
        : row.micro_challenges;
      if (challengeData) {
        progress.challenge = this.transformChallengeData(challengeData);
      }
    }

    return progress;
  }
}

// Export singleton instance
export const microChallengeService = new MicroChallengeService();
