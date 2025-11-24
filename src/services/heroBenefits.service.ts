import { supabase } from './supabase';
import { gangGreenHeroBadgeService } from './gangGreenHeroBadge.service';
import type {
  HeroBenefits,
  BenefitUsageAnalytics,
  BenefitUsageParams,
  BenefitType,
  BenefitUsageRow,
  RewardMultiplierParams,
  FeeDiscountParams,
  ContentPriorityParams,
} from '../types/heroBenefit.types';
import { DEFAULT_HERO_BENEFITS } from '../types/heroBenefit.types';

/**
 * Hero Benefits Service
 * Manages Hero badge holder benefits including reward multipliers, fee discounts, and content priority
 */
class HeroBenefitsService {
  /**
   * Get Hero badge benefits configuration
   * @returns Hero benefits structure with all multipliers and privileges
   */
  async getHeroBenefits(): Promise<HeroBenefits> {
    try {
      // Get the Hero badge configuration from the database
      const config = await gangGreenHeroBadgeService.getHeroBadgeConfig();

      if (!config) {
        // Return default benefits if config not found
        return DEFAULT_HERO_BENEFITS;
      }

      // Map database config to benefits structure
      return {
        enhancedRewards: {
          initiativeMultiplier: config.benefitMultipliers.initiativeRewards,
          achievementBonus: 1.2, // Fixed bonus for achievements
        },
        platformPrivileges: {
          reducedFees: config.benefitMultipliers.marketplaceDiscount,
          prioritySupport: true,
          exclusiveFeatures: ['early_access', 'beta_features', 'premium_analytics'],
        },
        socialBenefits: {
          contentPriority: config.benefitMultipliers.contentPriority,
          specialBadge: true,
          heroFlair: true,
        },
      };
    } catch (error) {
      console.error('Error getting Hero benefits:', error);
      return DEFAULT_HERO_BENEFITS;
    }
  }

  /**
   * Apply reward multiplier for Hero badge holders
   * @param params - User ID and base reward amount
   * @returns Multiplied reward amount
   */
  async applyRewardMultiplier(params: RewardMultiplierParams): Promise<number> {
    const { userId, baseReward, context } = params;

    try {
      // Check if user is a Hero badge holder
      const isHero = await gangGreenHeroBadgeService.isHeroUser(userId);

      if (!isHero) {
        return baseReward;
      }

      // Get Hero benefits configuration
      const benefits = await this.getHeroBenefits();
      const multiplier = benefits.enhancedRewards.initiativeMultiplier;

      // Calculate multiplied reward
      const multipliedReward = baseReward * multiplier;

      // Track benefit usage
      await this.trackBenefitUsage({
        userId,
        benefitType: 'reward_multiplier',
        usageContext: context || 'initiative_participation',
        valueApplied: multipliedReward - baseReward,
        metadata: {
          baseReward,
          multiplier,
          multipliedReward,
        },
      });

      return multipliedReward;
    } catch (error) {
      console.error('Error applying reward multiplier:', error);
      return baseReward; // Return base reward on error
    }
  }

  /**
   * Calculate fee discount for Hero badge holders
   * @param params - User ID and base fee amount
   * @returns Discounted fee amount
   */
  async calculateFeeDiscount(params: FeeDiscountParams): Promise<number> {
    const { userId, baseFee, transactionType } = params;

    try {
      // Check if user is a Hero badge holder
      const isHero = await gangGreenHeroBadgeService.isHeroUser(userId);

      if (!isHero) {
        return baseFee;
      }

      // Get Hero benefits configuration
      const benefits = await this.getHeroBenefits();
      const discountRate = benefits.platformPrivileges.reducedFees;

      // Calculate discounted fee
      const discount = baseFee * discountRate;
      const discountedFee = baseFee - discount;

      // Track benefit usage
      await this.trackBenefitUsage({
        userId,
        benefitType: 'fee_discount',
        usageContext: transactionType || 'marketplace_transaction',
        valueApplied: discount,
        metadata: {
          baseFee,
          discountRate,
          discountedFee,
        },
      });

      return discountedFee;
    } catch (error) {
      console.error('Error calculating fee discount:', error);
      return baseFee; // Return base fee on error
    }
  }

  /**
   * Apply content priority boost for Hero badge holders
   * @param params - User ID, content ID, and content type
   * @returns Priority boost level
   */
  async applyContentPriority(params: ContentPriorityParams): Promise<number> {
    const { userId, contentId, contentType } = params;

    try {
      // Check if user is a Hero badge holder
      const isHero = await gangGreenHeroBadgeService.isHeroUser(userId);

      if (!isHero) {
        return 0; // No priority boost for non-Hero users
      }

      // Get Hero benefits configuration
      const benefits = await this.getHeroBenefits();
      const priorityBoost = benefits.socialBenefits.contentPriority;

      // Track benefit usage
      await this.trackBenefitUsage({
        userId,
        benefitType: 'content_priority',
        usageContext: contentType,
        valueApplied: priorityBoost,
        metadata: {
          contentId,
          contentType,
          priorityBoost,
        },
      });

      return priorityBoost;
    } catch (error) {
      console.error('Error applying content priority:', error);
      return 0; // Return no boost on error
    }
  }

  /**
   * Track benefit usage for analytics
   * @param params - Benefit usage parameters
   */
  async trackBenefitUsage(params: BenefitUsageParams): Promise<void> {
    const { userId, benefitType, usageContext, valueApplied, metadata } = params;

    try {
      const { error } = await supabase.from('hero_benefit_usage').insert({
        user_id: userId,
        benefit_type: benefitType,
        usage_context: usageContext,
        value_applied: valueApplied,
        metadata: metadata || {},
      });

      if (error) {
        console.error('Error tracking benefit usage:', error);
      }
    } catch (error) {
      console.error('Error tracking benefit usage:', error);
    }
  }

  /**
   * Get benefit usage analytics for a user
   * @param userId - User ID
   * @returns Array of benefit usage analytics
   */
  async getBenefitAnalytics(userId: string): Promise<BenefitUsageAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('hero_benefit_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting benefit analytics:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Aggregate analytics by benefit type
      const analyticsMap = new Map<BenefitType, BenefitUsageAnalytics>();

      for (const row of data as BenefitUsageRow[]) {
        const benefitType = row.benefit_type as BenefitType;
        const existing = analyticsMap.get(benefitType);

        if (existing) {
          existing.usageCount += 1;
          existing.valueGenerated += row.value_applied || 0;
          existing.lastUsed = row.created_at;
        } else {
          analyticsMap.set(benefitType, {
            userId,
            benefitType,
            usageCount: 1,
            lastUsed: row.created_at,
            valueGenerated: row.value_applied || 0,
            averageValue: row.value_applied || 0,
          });
        }
      }

      // Calculate average values
      const analytics = Array.from(analyticsMap.values());
      for (const analytic of analytics) {
        analytic.averageValue = analytic.valueGenerated / analytic.usageCount;
      }

      return analytics;
    } catch (error) {
      console.error('Error getting benefit analytics:', error);
      return [];
    }
  }

  /**
   * Get total value generated from Hero benefits for a user
   * @param userId - User ID
   * @returns Total value generated
   */
  async getTotalBenefitValue(userId: string): Promise<number> {
    try {
      const analytics = await this.getBenefitAnalytics(userId);
      return analytics.reduce((total, analytic) => total + analytic.valueGenerated, 0);
    } catch (error) {
      console.error('Error getting total benefit value:', error);
      return 0;
    }
  }

  /**
   * Check if user has access to exclusive features
   * @param userId - User ID
   * @param featureName - Feature name to check
   * @returns True if user has access
   */
  async hasExclusiveFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    try {
      const isHero = await gangGreenHeroBadgeService.isHeroUser(userId);

      if (!isHero) {
        return false;
      }

      const benefits = await this.getHeroBenefits();
      return benefits.platformPrivileges.exclusiveFeatures.includes(featureName);
    } catch (error) {
      console.error('Error checking exclusive feature access:', error);
      return false;
    }
  }

  /**
   * Get all Hero badge holders with their benefit usage statistics
   * @returns Array of holders with benefit statistics
   */
  async getHolderBenefitStatistics(): Promise<any[]> {
    try {
      const holdersResult = await gangGreenHeroBadgeService.getHeroHolders();

      if (!holdersResult.success || !holdersResult.holders) {
        return [];
      }

      const statistics = await Promise.all(
        holdersResult.holders.map(async (holder) => {
          const analytics = await this.getBenefitAnalytics(holder.userId);
          const totalValue = await this.getTotalBenefitValue(holder.userId);

          return {
            userId: holder.userId,
            status: holder.status,
            purchaseDate: holder.purchaseDate,
            totalRewardsEarned: holder.totalRewardsEarned,
            benefitUsage: analytics,
            totalBenefitValue: totalValue,
          };
        })
      );

      return statistics;
    } catch (error) {
      console.error('Error getting holder benefit statistics:', error);
      return [];
    }
  }
}

// Export singleton instance
export const heroBenefitsService = new HeroBenefitsService();
export default heroBenefitsService;
