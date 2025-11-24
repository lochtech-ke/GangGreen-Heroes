import { supabase } from './supabase';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import type {
  Badge,
  BadgeProgress,
  BadgeAward,
  GreenHeroVariantBadge,
  UserBadgeProgress,
  RequirementProgress,
  BadgeRequirement,
  VariantEligibility,
  BadgeTierRow,
} from '../types/badgeProgression.types';

/**
 * Badge Progression Service
 * Manages Track 3 badge progression system with community engagement focus
 */
class BadgeProgressionService {
  /**
   * Get current badge for a user
   */
  async getCurrentBadge(userId: string): Promise<Badge | null> {
    try {
      const result = await withRetry(
        () =>
          supabase
            .from('user_badge_progress')
            .select(`
              current_badge_id,
              badge_tiers!user_badge_progress_current_badge_id_fkey (*)
            `)
            .eq('user_id', userId)
            .single(),
        DEFAULT_RETRY_CONFIG,
        'getCurrentBadge'
      );

      const { data, error } = result as any;

      if (error) {
        console.error('[BadgeProgressionService] Error fetching current badge:', error);
        return null;
      }

      if (!data || !data.badge_tiers) {
        return null;
      }

      return this.transformBadgeData(data.badge_tiers as any);
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in getCurrentBadge:', error);
      return null;
    }
  }

  /**
   * Get next badge in progression for a user
   */
  async getNextBadge(userId: string): Promise<Badge | null> {
    try {
      const currentBadge = await this.getCurrentBadge(userId);
      if (!currentBadge) {
        return null;
      }

      const result = await withRetry(
        () =>
          supabase
            .from('badge_tiers')
            .select('*')
            .eq('tier_order', currentBadge.tier_order + 1)
            .single(),
        DEFAULT_RETRY_CONFIG,
        'getNextBadge'
      );

      const { data, error } = result as any;

      if (error || !data) {
        // No next badge (user is at max tier)
        return null;
      }

      return this.transformBadgeData(data);
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in getNextBadge:', error);
      return null;
    }
  }

  /**
   * Check if user is eligible for a specific badge
   */
  async checkBadgeEligibility(userId: string, badgeId: string): Promise<boolean> {
    try {
      const [badge, progress] = await Promise.all([
        this.getBadgeById(badgeId),
        this.getUserProgress(userId),
      ]);

      if (!badge || !progress) {
        return false;
      }

      return this.meetsRequirements(badge, progress);
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in checkBadgeEligibility:', error);
      return false;
    }
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: string, badgeId: string): Promise<BadgeAward | null> {
    try {
      const badge = await this.getBadgeById(badgeId);
      if (!badge) {
        console.error('[BadgeProgressionService] Badge not found:', badgeId);
        return null;
      }

      // Check if already earned
      const { data: existing } = await supabase
        .from('user_earned_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .maybeSingle();

      const isNew = !existing;

      // Record earned badge
      const { error: earnError } = await supabase
        .from('user_earned_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
        })
        .select()
        .single();

      if (earnError && !earnError.message.includes('duplicate')) {
        console.error('[BadgeProgressionService] Error recording earned badge:', earnError);
        return null;
      }

      // Update current badge if this is a higher tier
      const currentBadge = await this.getCurrentBadge(userId);
      if (!currentBadge || badge.tier_order > currentBadge.tier_order) {
        const { error: updateError } = await supabase
          .from('user_badge_progress')
          .update({
            current_badge_id: badgeId,
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[BadgeProgressionService] Error updating current badge:', updateError);
        }
      }

      // Create notification (if notification system exists)
      if (isNew) {
        await this.createBadgeNotification(userId, badge);
      }

      return {
        badge,
        user_id: userId,
        earned_at: new Date().toISOString(),
        is_new: isNew,
      };
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in awardBadge:', error);
      return null;
    }
  }

  /**
   * Get progress toward next badge
   */
  async getProgressToNextBadge(userId: string): Promise<BadgeProgress | null> {
    try {
      const [currentBadge, nextBadge, userProgress] = await Promise.all([
        this.getCurrentBadge(userId),
        this.getNextBadge(userId),
        this.getUserProgress(userId),
      ]);

      if (!currentBadge || !userProgress) {
        return null;
      }

      // If no next badge, user is at max tier
      if (!nextBadge) {
        return {
          currentBadge,
          nextBadge: null,
          progressPercentage: 100,
          requirementProgress: [],
          userProgress,
        };
      }

      const requirementProgress = this.calculateRequirementProgress(nextBadge, userProgress);
      const progressPercentage = this.calculateOverallProgress(requirementProgress);

      return {
        currentBadge,
        nextBadge,
        progressPercentage,
        requirementProgress,
        userProgress,
      };
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in getProgressToNextBadge:', error);
      return null;
    }
  }

  /**
   * Calculate engagement score for a user
   */
  async calculateEngagementScore(userId: string): Promise<number> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) {
        return 0;
      }

      // Calculate weighted score
      const score =
        progress.actions_completed * 1 +
        progress.social_posts_created * 5 +
        progress.initiatives_joined * 10 +
        progress.initiatives_created * 50 +
        progress.referrals_made * 15 +
        progress.social_engagement_score;

      return score;
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in calculateEngagementScore:', error);
      return 0;
    }
  }

  /**
   * Check which Green Hero variants a user is eligible for
   */
  async checkVariantEligibility(userId: string): Promise<VariantEligibility[]> {
    try {
      // Check if user has Green Hero badge
      const currentBadge = await this.getCurrentBadge(userId);
      if (!currentBadge || currentBadge.tier !== 'green_hero') {
        return [];
      }

      const [variants, progress, earnedVariants] = await Promise.all([
        this.getAllVariants(),
        this.getUserProgress(userId),
        this.getEarnedVariants(userId),
      ]);

      if (!progress) {
        return [];
      }

      const earnedVariantIds = new Set(earnedVariants.map(v => v.variant_id));

      return variants.map(variant => {
        const requirements = variant.requirements as Record<string, number>;
        const progressData: Record<string, number> = {};
        let isEligible = true;

        // Check each requirement
        for (const [key, required] of Object.entries(requirements)) {
          let current = 0;

          switch (key) {
            case 'referrals':
              current = progress.referrals_made;
              break;
            case 'social_engagement':
              current = progress.social_engagement_score;
              break;
            case 'initiatives_created':
              current = progress.initiatives_created;
              break;
            case 'initiatives_completed':
              // Would need additional tracking
              current = 0;
              break;
            case 'educational_posts':
              // Would need additional tracking
              current = 0;
              break;
            case 'post_engagement':
              current = progress.social_engagement_score;
              break;
          }

          progressData[key] = current;
          if (current < required) {
            isEligible = false;
          }
        }

        return {
          variant,
          is_eligible: isEligible,
          is_earned: earnedVariantIds.has(variant.id),
          progress: progressData,
          requirements,
        };
      });
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in checkVariantEligibility:', error);
      return [];
    }
  }

  /**
   * Award a Green Hero variant to a user
   */
  async awardVariant(userId: string, variantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_earned_variants')
        .insert({
          user_id: userId,
          variant_id: variantId,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('[BadgeProgressionService] Error awarding variant:', error);
        return false;
      }

      // Create notification
      const variant = await this.getVariantById(variantId);
      if (variant) {
        await this.createVariantNotification(userId, variant);
      }

      return true;
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in awardVariant:', error);
      return false;
    }
  }

  /**
   * Get all badge tiers
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      const result = await withRetry(
        () =>
          supabase
            .from('badge_tiers')
            .select('*')
            .order('tier_order', { ascending: true }),
        DEFAULT_RETRY_CONFIG,
        'getAllBadges'
      );

      const { data, error } = result as any;

      if (error || !data) {
        console.error('[BadgeProgressionService] Error fetching badges:', error);
        return [];
      }

      return data.map(row => this.transformBadgeData(row));
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in getAllBadges:', error);
      return [];
    }
  }

  /**
   * Get all Green Hero variants
   */
  async getAllVariants(): Promise<GreenHeroVariantBadge[]> {
    try {
      const { data, error } = await supabase
        .from('green_hero_variants')
        .select('*');

      if (error || !data) {
        console.error('[BadgeProgressionService] Error fetching variants:', error);
        return [];
      }

      return data as GreenHeroVariantBadge[];
    } catch (error) {
      console.error('[BadgeProgressionService] Exception in getAllVariants:', error);
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getBadgeById(badgeId: string): Promise<Badge | null> {
    const { data, error } = await supabase
      .from('badge_tiers')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.transformBadgeData(data);
  }

  private async getVariantById(variantId: string): Promise<GreenHeroVariantBadge | null> {
    const { data, error } = await supabase
      .from('green_hero_variants')
      .select('*')
      .eq('id', variantId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as GreenHeroVariantBadge;
  }

  private async getUserProgress(userId: string): Promise<UserBadgeProgress | null> {
    const { data, error } = await supabase
      .from('user_badge_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as UserBadgeProgress;
  }

  private async getEarnedVariants(userId: string) {
    const { data, error } = await supabase
      .from('user_earned_variants')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) {
      return [];
    }

    return data;
  }

  private meetsRequirements(badge: Badge, progress: UserBadgeProgress): boolean {
    for (const req of badge.requirements) {
      let current = 0;

      switch (req.type) {
        case 'actions':
          current = progress.actions_completed;
          break;
        case 'social_posts':
          current = progress.social_posts_created;
          break;
        case 'initiatives':
          current = progress.initiatives_joined + progress.initiatives_created;
          break;
        case 'referrals':
          current = progress.referrals_made;
          break;
      }

      if (current < req.count) {
        return false;
      }
    }

    return true;
  }

  private calculateRequirementProgress(
    badge: Badge,
    progress: UserBadgeProgress
  ): RequirementProgress[] {
    return badge.requirements.map(req => {
      let current = 0;

      switch (req.type) {
        case 'actions':
          current = progress.actions_completed;
          break;
        case 'social_posts':
          current = progress.social_posts_created;
          break;
        case 'initiatives':
          current = progress.initiatives_joined + progress.initiatives_created;
          break;
        case 'referrals':
          current = progress.referrals_made;
          break;
      }

      const percentage = Math.min(100, Math.round((current / req.count) * 100));

      return {
        requirement: req,
        current,
        target: req.count,
        isComplete: current >= req.count,
        percentage,
      };
    });
  }

  private calculateOverallProgress(requirementProgress: RequirementProgress[]): number {
    if (requirementProgress.length === 0) {
      return 0;
    }

    const totalPercentage = requirementProgress.reduce(
      (sum, req) => sum + req.percentage,
      0
    );

    return Math.round(totalPercentage / requirementProgress.length);
  }

  private transformBadgeData(row: any): Badge {
    const requirements = typeof row.requirements === 'string'
      ? JSON.parse(row.requirements)
      : row.requirements;

    // Transform requirements object to array
    const requirementArray: BadgeRequirement[] = [];
    
    if (requirements.actions !== undefined) {
      requirementArray.push({
        type: 'actions',
        count: requirements.actions,
        description: `Complete ${requirements.actions} actions`,
      });
    }
    
    if (requirements.social_posts !== undefined) {
      requirementArray.push({
        type: 'social_posts',
        count: requirements.social_posts,
        description: `Create ${requirements.social_posts} social posts`,
      });
    }
    
    if (requirements.initiatives !== undefined) {
      requirementArray.push({
        type: 'initiatives',
        count: requirements.initiatives,
        description: `Join ${requirements.initiatives} initiatives`,
      });
    }
    
    if (requirements.referrals !== undefined) {
      requirementArray.push({
        type: 'referrals',
        count: requirements.referrals,
        description: `Make ${requirements.referrals} referrals`,
      });
    }

    return {
      id: row.id,
      name: row.name,
      tier: row.name.toLowerCase().replace(/ /g, '_') as BadgeTier,
      tier_order: row.tier_order,
      description: row.description,
      requirements: requirementArray,
      icon_url: row.icon_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async createBadgeNotification(userId: string, badge: Badge): Promise<void> {
    try {
      // Check if notifications table exists
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'badge_earned',
        title: `New Badge Earned: ${badge.name}!`,
        message: `Congratulations! You've earned the ${badge.name} badge. ${badge.description}`,
        metadata: {
          badge_id: badge.id,
          badge_name: badge.name,
          badge_tier: badge.tier,
        },
      });

      if (error) {
        console.warn('[BadgeProgressionService] Could not create notification:', error);
      }
    } catch (error) {
      console.warn('[BadgeProgressionService] Notification system not available:', error);
    }
  }

  private async createVariantNotification(
    userId: string,
    variant: GreenHeroVariantBadge
  ): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'variant_earned',
        title: `Green Hero Variant Unlocked: ${variant.name}!`,
        message: `Amazing achievement! You've unlocked the ${variant.name} variant. ${variant.description}`,
        metadata: {
          variant_id: variant.id,
          variant_name: variant.name,
        },
      });
    } catch (error) {
      console.warn('[BadgeProgressionService] Could not create variant notification:', error);
    }
  }
}

// Export singleton instance
export const badgeProgressionService = new BadgeProgressionService();
