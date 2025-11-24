import { supabase } from './supabase';
import { badgeProgressionService } from './badgeProgression.service';
import type {
  EngagementAction,
  EngagementActionRecord,
  EngagementScore,
  EngagementBreakdown,
  SocialMetrics,
  InitiativeMetrics,
  ReferralMetrics,
  ReferralMilestone,
  ActionFilters,
  UserEngagementSummary,
  EngagementActionType,
} from '../types/communityEngagement.types';
import { ENGAGEMENT_POINTS } from '../types/communityEngagement.types';

/**
 * Community Engagement Service
 * Manages Track 3 community engagement tracking and metrics
 */
class CommunityEngagementService {
  // Point values for different actions
  private readonly POINTS: typeof ENGAGEMENT_POINTS = {
    micro_challenge: 5,
    social_post: 5,
    social_like: 1,
    social_comment: 2,
    initiative_join: 10,
    initiative_create: 50,
    initiative_task: 3,
    referral: 15,
    referral_active_bonus: 5,
  };

  /**
   * Track a user engagement action
   */
  async trackAction(userId: string, action: EngagementAction): Promise<boolean> {
    try {
      const points = action.points || this.POINTS[action.type] || 0;

      // Insert engagement action
      const { error: actionError } = await supabase
        .from('engagement_actions')
        .insert({
          user_id: userId,
          action_type: action.type,
          points_awarded: points,
          metadata: action.metadata || {},
        });

      if (actionError) {
        console.error('[CommunityEngagementService] Error tracking action:', actionError);
        return false;
      }

      // Update user badge progress
      await this.updateBadgeProgress(userId, action.type, points);

      // Check if user earned a new badge
      await this.checkAndAwardBadges(userId);

      return true;
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in trackAction:', error);
      return false;
    }
  }

  /**
   * Calculate engagement score for a user
   */
  async calculateEngagementScore(userId: string): Promise<EngagementScore> {
    try {
      const summary = await this.getEngagementSummary(userId);
      
      if (!summary) {
        return {
          total: 0,
          breakdown: { actions: 0, social: 0, initiatives: 0, referrals: 0 },
          rank: 0,
          percentile: 0,
        };
      }

      // Calculate breakdown
      const actions = summary.challenges_completed * this.POINTS.micro_challenge;
      const social =
        summary.posts_created * this.POINTS.social_post +
        summary.likes_given * this.POINTS.social_like +
        summary.comments_made * this.POINTS.social_comment;
      const initiatives =
        summary.initiatives_joined * this.POINTS.initiative_join +
        summary.initiatives_created * this.POINTS.initiative_create +
        summary.tasks_completed * this.POINTS.initiative_task;
      const referrals = summary.referrals_made * this.POINTS.referral;

      const total = summary.total_points || (actions + social + initiatives + referrals);

      // Calculate rank and percentile
      const { rank, percentile } = await this.calculateRankAndPercentile(userId, total);

      return {
        total,
        breakdown: { actions, social, initiatives, referrals },
        rank,
        percentile,
      };
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in calculateEngagementScore:', error);
      return {
        total: 0,
        breakdown: { actions: 0, social: 0, initiatives: 0, referrals: 0 },
        rank: 0,
        percentile: 0,
      };
    }
  }

  /**
   * Get engagement breakdown for a user
   */
  async getEngagementBreakdown(userId: string): Promise<EngagementBreakdown | null> {
    try {
      const summary = await this.getEngagementSummary(userId);
      
      if (!summary) {
        return null;
      }

      return {
        actionsCompleted: summary.challenges_completed,
        socialPostsCreated: summary.posts_created,
        postsLiked: summary.likes_given,
        commentsPosted: summary.comments_made,
        initiativesJoined: summary.initiatives_joined,
        initiativesCreated: summary.initiatives_created,
        referralsMade: summary.referrals_made,
        referralsActive: 0, // Would need additional tracking
        totalPoints: summary.total_points,
        lastActivity: summary.last_activity,
      };
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in getEngagementBreakdown:', error);
      return null;
    }
  }

  /**
   * Get action history for a user
   */
  async getActionHistory(
    userId: string,
    filters?: ActionFilters
  ): Promise<EngagementActionRecord[]> {
    try {
      let query = supabase
        .from('engagement_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('[CommunityEngagementService] Error fetching action history:', error);
        return [];
      }

      return data as EngagementActionRecord[];
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in getActionHistory:', error);
      return [];
    }
  }

  /**
   * Get social metrics for a user
   */
  async getSocialMetrics(userId: string): Promise<SocialMetrics> {
    try {
      const summary = await this.getEngagementSummary(userId);
      
      if (!summary) {
        return {
          postsCreated: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          engagementRate: 0,
        };
      }

      // Get social post stats from social_posts table if it exists
      const { data: socialStats } = await supabase
        .from('social_posts')
        .select('id, content, likes_count, comments_count')
        .eq('user_id', userId)
        .order('likes_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      const topPost = socialStats
        ? {
            id: socialStats.id,
            content: socialStats.content,
            likes: socialStats.likes_count || 0,
            comments: socialStats.comments_count || 0,
          }
        : undefined;

      // Calculate engagement rate (likes + comments per post)
      const engagementRate = summary.posts_created > 0
        ? ((summary.likes_given + summary.comments_made) / summary.posts_created)
        : 0;

      return {
        postsCreated: summary.posts_created,
        totalLikes: summary.likes_given,
        totalComments: summary.comments_made,
        totalShares: 0, // Would need additional tracking
        engagementRate: Math.round(engagementRate * 100) / 100,
        topPost,
      };
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in getSocialMetrics:', error);
      return {
        postsCreated: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        engagementRate: 0,
      };
    }
  }

  /**
   * Track social engagement (likes, comments, shares)
   */
  async trackSocialEngagement(
    userId: string,
    engagementType: 'like' | 'comment' | 'share',
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const actionTypeMap = {
      like: 'social_like' as EngagementActionType,
      comment: 'social_comment' as EngagementActionType,
      share: 'social_post' as EngagementActionType, // Treat share as post for now
    };

    return this.trackAction(userId, {
      type: actionTypeMap[engagementType],
      points: this.POINTS[actionTypeMap[engagementType]],
      metadata,
    });
  }

  /**
   * Get initiative metrics for a user
   */
  async getInitiativeMetrics(userId: string): Promise<InitiativeMetrics> {
    try {
      const summary = await this.getEngagementSummary(userId);
      
      if (!summary) {
        return {
          joined: 0,
          created: 0,
          completed: 0,
          tasksCompleted: 0,
          impactScore: 0,
        };
      }

      // Calculate impact score based on initiatives
      const impactScore =
        summary.initiatives_created * 100 +
        summary.initiatives_joined * 10 +
        summary.tasks_completed * 5;

      return {
        joined: summary.initiatives_joined,
        created: summary.initiatives_created,
        completed: 0, // Would need additional tracking
        tasksCompleted: summary.tasks_completed,
        impactScore,
      };
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in getInitiativeMetrics:', error);
      return {
        joined: 0,
        created: 0,
        completed: 0,
        tasksCompleted: 0,
        impactScore: 0,
      };
    }
  }

  /**
   * Get referral metrics for a user
   */
  async getReferralMetrics(userId: string): Promise<ReferralMetrics> {
    try {
      const summary = await this.getEngagementSummary(userId);
      
      if (!summary) {
        return {
          totalReferrals: 0,
          activeReferrals: 0,
          conversionRate: 0,
          pointsEarned: 0,
          nextMilestone: this.getNextReferralMilestone(0),
        };
      }

      const totalReferrals = summary.referrals_made;
      const pointsEarned = totalReferrals * this.POINTS.referral;

      return {
        totalReferrals,
        activeReferrals: 0, // Would need additional tracking
        conversionRate: 0, // Would need additional tracking
        pointsEarned,
        nextMilestone: this.getNextReferralMilestone(totalReferrals),
      };
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in getReferralMetrics:', error);
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        conversionRate: 0,
        pointsEarned: 0,
        nextMilestone: this.getNextReferralMilestone(0),
      };
    }
  }

  /**
   * Refresh the engagement summary materialized view
   */
  async refreshEngagementSummary(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('refresh_engagement_summary');

      if (error) {
        console.error('[CommunityEngagementService] Error refreshing summary:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[CommunityEngagementService] Exception in refreshEngagementSummary:', error);
      return false;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getEngagementSummary(userId: string): Promise<UserEngagementSummary | null> {
    const { data, error } = await supabase
      .from('user_engagement_summary')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as UserEngagementSummary;
  }

  private async updateBadgeProgress(
    userId: string,
    actionType: EngagementActionType,
    points: number
  ): Promise<void> {
    try {
      const updates: Partial<Record<string, number>> = {};

      switch (actionType) {
        case 'micro_challenge':
          updates.actions_completed = 1;
          break;
        case 'social_post':
          updates.social_posts_created = 1;
          updates.social_engagement_score = points;
          break;
        case 'social_like':
        case 'social_comment':
          updates.social_engagement_score = points;
          break;
        case 'initiative_join':
          updates.initiatives_joined = 1;
          break;
        case 'initiative_create':
          updates.initiatives_created = 1;
          break;
        case 'referral':
          updates.referrals_made = 1;
          break;
      }

      if (Object.keys(updates).length > 0) {
        // Get current values
        const { data: current } = await supabase
          .from('user_badge_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (current) {
          // Increment values
          const incrementedUpdates: Record<string, number> = {};
          for (const [key, increment] of Object.entries(updates)) {
            incrementedUpdates[key] = (current[key] || 0) + increment;
          }

          await supabase
            .from('user_badge_progress')
            .update({
              ...incrementedUpdates,
              last_updated: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
      }
    } catch (error) {
      console.error('[CommunityEngagementService] Error updating badge progress:', error);
    }
  }

  private async checkAndAwardBadges(userId: string): Promise<void> {
    try {
      const progress = await badgeProgressionService.getProgressToNextBadge(userId);
      
      if (!progress || !progress.nextBadge) {
        return;
      }

      // Check if user meets requirements for next badge
      const isEligible = await badgeProgressionService.checkBadgeEligibility(
        userId,
        progress.nextBadge.id
      );

      if (isEligible) {
        await badgeProgressionService.awardBadge(userId, progress.nextBadge.id);
      }
    } catch (error) {
      console.error('[CommunityEngagementService] Error checking badges:', error);
    }
  }

  private async calculateRankAndPercentile(
    userId: string,
    _userScore: number
  ): Promise<{ rank: number; percentile: number }> {
    try {
      // Get all user scores
      const { data, error } = await supabase
        .from('user_engagement_summary')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });

      if (error || !data) {
        return { rank: 0, percentile: 0 };
      }

      // Find user's rank
      const rank = data.findIndex(u => u.user_id === userId) + 1;
      
      // Calculate percentile
      const totalUsers = data.length;
      const percentile = totalUsers > 0
        ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100)
        : 0;

      return { rank, percentile };
    } catch (error) {
      console.error('[CommunityEngagementService] Error calculating rank:', error);
      return { rank: 0, percentile: 0 };
    }
  }

  private getNextReferralMilestone(current: number): ReferralMilestone {
    const milestones = [
      { name: 'Referral Starter', target: 5, reward: 'Referral Starter Badge' },
      { name: 'Referral Champion', target: 10, reward: 'Referral Champion Badge' },
      { name: 'Community Builder', target: 25, reward: 'Community Builder Badge' },
      { name: 'Social Mobilizer', target: 100, reward: 'Green Hero - Social Mobilizer Variant' },
    ];

    const nextMilestone = milestones.find(m => m.target > current) || milestones[milestones.length - 1];

    return {
      ...nextMilestone,
      current,
    };
  }
}

// Export singleton instance
export const communityEngagementService = new CommunityEngagementService();
