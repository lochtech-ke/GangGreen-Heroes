import { supabase } from './supabase';
import { badgePurchaseService } from './badgePurchase.service';
import type {
  HeroBadgeConfig,
  HeroBadgeConfigRow,
  HeroBadgeHolder,
  HeroBadgeHolderRow,
  HeroBadgePurchaseParams,
  HeroBadgePurchaseResult,
  HeroStatusResult,
  GrantHeroStatusParams,
  SuspendHeroStatusParams,
  ReinstateHeroStatusParams,
  HeroBadgeOperationResult,
  GetHeroHoldersResult,
} from '../types/heroBadge.types';
import {
  HERO_BADGE_TYPE,
  HERO_BADGE_TIER,
} from '../types/heroBadge.types';

/**
 * GangGreen Hero Badge Service
 * Handles Hero badge purchases, status management, and configuration
 */
class GangGreenHeroBadgeService {
  private configCache: HeroBadgeConfig | null = null;
  private configCacheTimestamp: number = 0;
  private readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Purchase a GangGreen Hero badge
   * Initiates the purchase process through the existing badge purchase system
   */
  async purchaseHeroBadge(params: HeroBadgePurchaseParams): Promise<HeroBadgePurchaseResult> {
    try {
      console.log(`[GangGreenHeroBadgeService] Initiating Hero badge purchase for user ${params.userId}`);

      // Check if user already has Hero status
      const existingStatus = await this.isHeroUser(params.userId);
      if (existingStatus) {
        console.log('[GangGreenHeroBadgeService] User already has Hero status');
        return {
          success: false,
          error: 'User already owns a GangGreen Hero badge',
        };
      }

      // Get Hero badge configuration
      const config = await this.getHeroBadgeConfig();
      if (!config) {
        console.error('[GangGreenHeroBadgeService] Hero badge configuration not found');
        return {
          success: false,
          error: 'Hero badge configuration not available',
        };
      }

      if (!config.isActive) {
        console.log('[GangGreenHeroBadgeService] Hero badge sales are currently disabled');
        return {
          success: false,
          error: 'Hero badge sales are currently disabled',
        };
      }

      // Initiate purchase through existing badge purchase service
      const purchaseResult = await badgePurchaseService.initiatePurchase({
        userId: params.userId,
        badgeType: HERO_BADGE_TYPE,
        tier: HERO_BADGE_TIER,
        email: params.email,
        metadata: {
          ...params.metadata,
          isHeroBadge: true,
          heroBadgeConfig: config,
        },
      });

      if (!purchaseResult.success) {
        console.error('[GangGreenHeroBadgeService] Purchase initiation failed:', purchaseResult.error);
        return purchaseResult;
      }

      // Mark the purchase as a Hero badge in the database
      if (purchaseResult.purchase) {
        await supabase
          .from('badge_purchases')
          .update({ 
            is_hero_badge: true,
            amount_kes: config.priceKes, // Ensure correct Hero badge price
          })
          .eq('id', purchaseResult.purchase.id);
      }

      console.log('[GangGreenHeroBadgeService] Hero badge purchase initiated successfully');

      return {
        ...purchaseResult,
        heroBadgeConfig: config,
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Purchase Hero badge exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate Hero badge purchase',
      };
    }
  }

  /**
   * Get Hero badge configuration
   * Returns cached config if available, otherwise fetches from database
   */
  async getHeroBadgeConfig(): Promise<HeroBadgeConfig | null> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.configCache && (now - this.configCacheTimestamp) < this.CACHE_TTL) {
        return this.configCache;
      }

      console.log('[GangGreenHeroBadgeService] Fetching Hero badge configuration');

      const { data, error } = await supabase
        .from('hero_badge_config')
        .select('*')
        .eq('badge_type', HERO_BADGE_TYPE)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[GangGreenHeroBadgeService] Error fetching config:', error);
        return null;
      }

      if (!data) {
        console.warn('[GangGreenHeroBadgeService] No active Hero badge configuration found');
        return null;
      }

      // Transform database row to typed config
      const config: HeroBadgeConfig = this.transformConfigRow(data);

      // Update cache
      this.configCache = config;
      this.configCacheTimestamp = now;

      return config;
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception fetching config:', error);
      return null;
    }
  }

  /**
   * Check if a user has Hero status
   * Returns true if user owns an active Hero badge
   */
  async isHeroUser(userId: string): Promise<boolean> {
    try {
      const status = await this.getHeroStatus(userId);
      return status.isHero && status.holder?.status === 'active';
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception checking Hero status:', error);
      return false;
    }
  }

  /**
   * Get detailed Hero status for a user
   * Returns Hero status with holder information and config
   */
  async getHeroStatus(userId: string): Promise<HeroStatusResult> {
    try {
      console.log(`[GangGreenHeroBadgeService] Checking Hero status for user ${userId}`);

      const { data, error } = await supabase
        .from('hero_badge_holders')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[GangGreenHeroBadgeService] Error fetching Hero status:', error);
        return { isHero: false };
      }

      if (!data) {
        return { isHero: false };
      }

      const holder = this.transformHolderRow(data);
      const config = await this.getHeroBadgeConfig();

      return {
        isHero: true,
        holder,
        config: config || undefined,
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception getting Hero status:', error);
      return { isHero: false };
    }
  }

  /**
   * Get all Hero badge holders
   * Returns paginated list of Hero badge holders
   */
  async getHeroHolders(
    limit: number = 50,
    offset: number = 0,
    status?: 'active' | 'suspended'
  ): Promise<GetHeroHoldersResult> {
    try {
      console.log('[GangGreenHeroBadgeService] Fetching Hero badge holders');

      let query = supabase
        .from('hero_badge_holders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('[GangGreenHeroBadgeService] Error fetching holders:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const holders = data?.map(row => this.transformHolderRow(row)) || [];

      return {
        success: true,
        holders,
        total: count || 0,
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception fetching holders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Hero badge holders',
      };
    }
  }

  /**
   * Grant Hero status to a user
   * Called after successful Hero badge purchase
   */
  async grantHeroStatus(params: GrantHeroStatusParams): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[GangGreenHeroBadgeService] Granting Hero status to user ${params.userId}`);

      // Check if user already has Hero status
      const existingStatus = await this.isHeroUser(params.userId);
      if (existingStatus) {
        console.log('[GangGreenHeroBadgeService] User already has Hero status');
        return {
          success: true,
          data: { message: 'User already has Hero status' },
        };
      }

      // Insert Hero badge holder record
      const { data, error } = await supabase
        .from('hero_badge_holders')
        .insert({
          user_id: params.userId,
          badge_purchase_id: params.badgePurchaseId,
          purchase_date: params.purchaseDate,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('[GangGreenHeroBadgeService] Error granting Hero status:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Update badge purchase to mark Hero benefits as activated
      await supabase
        .from('badge_purchases')
        .update({ hero_benefits_activated: true })
        .eq('id', params.badgePurchaseId);

      console.log('[GangGreenHeroBadgeService] Hero status granted successfully');

      return {
        success: true,
        data: this.transformHolderRow(data),
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception granting Hero status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grant Hero status',
      };
    }
  }

  /**
   * Suspend Hero status for a user
   * Temporarily disables Hero benefits while preserving the badge
   */
  async suspendHeroStatus(params: SuspendHeroStatusParams): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[GangGreenHeroBadgeService] Suspending Hero status for user ${params.userId}`);

      const { data, error } = await supabase
        .from('hero_badge_holders')
        .update({
          status: 'suspended',
          suspension_reason: params.reason,
          suspended_at: new Date().toISOString(),
          suspended_by: params.suspendedBy,
        })
        .eq('user_id', params.userId)
        .select()
        .single();

      if (error) {
        console.error('[GangGreenHeroBadgeService] Error suspending Hero status:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Hero badge holder not found',
        };
      }

      console.log('[GangGreenHeroBadgeService] Hero status suspended successfully');

      return {
        success: true,
        data: this.transformHolderRow(data),
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception suspending Hero status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suspend Hero status',
      };
    }
  }

  /**
   * Reinstate Hero status for a user
   * Restores Hero benefits after suspension
   */
  async reinstateHeroStatus(params: ReinstateHeroStatusParams): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[GangGreenHeroBadgeService] Reinstating Hero status for user ${params.userId}`);

      const { data, error } = await supabase
        .from('hero_badge_holders')
        .update({
          status: 'active',
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null,
        })
        .eq('user_id', params.userId)
        .select()
        .single();

      if (error) {
        console.error('[GangGreenHeroBadgeService] Error reinstating Hero status:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Hero badge holder not found',
        };
      }

      console.log('[GangGreenHeroBadgeService] Hero status reinstated successfully');

      return {
        success: true,
        data: this.transformHolderRow(data),
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception reinstating Hero status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reinstate Hero status',
      };
    }
  }

  /**
   * Update Hero badge configuration
   * Admin function to modify Hero badge settings
   */
  async updateHeroBadgeConfig(updates: Partial<HeroBadgeConfigRow>): Promise<HeroBadgeOperationResult> {
    try {
      console.log('[GangGreenHeroBadgeService] Updating Hero badge configuration');

      const { data, error } = await supabase
        .from('hero_badge_config')
        .update(updates)
        .eq('badge_type', HERO_BADGE_TYPE)
        .select()
        .single();

      if (error) {
        console.error('[GangGreenHeroBadgeService] Error updating config:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Clear cache to force refresh
      this.configCache = null;
      this.configCacheTimestamp = 0;

      console.log('[GangGreenHeroBadgeService] Hero badge configuration updated successfully');

      return {
        success: true,
        data: this.transformConfigRow(data),
      };
    } catch (error) {
      console.error('[GangGreenHeroBadgeService] Exception updating config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update Hero badge configuration',
      };
    }
  }

  /**
   * Transform database config row to typed config object
   */
  private transformConfigRow(row: HeroBadgeConfigRow): HeroBadgeConfig {
    return {
      id: row.id,
      badgeType: 'ganggreen_hero',
      tier: 'hero',
      priceKes: row.price_kes,
      dailyGGCoinReward: row.daily_gg_coin_reward,
      benefitMultipliers: {
        initiativeRewards: row.initiative_multiplier,
        marketplaceDiscount: row.marketplace_discount,
        contentPriority: row.content_priority_boost,
      },
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Transform database holder row to typed holder object
   */
  private transformHolderRow(row: HeroBadgeHolderRow): HeroBadgeHolder {
    return {
      id: row.id,
      userId: row.user_id,
      badgePurchaseId: row.badge_purchase_id,
      purchaseDate: row.purchase_date,
      lastRewardDate: row.last_reward_date,
      totalRewardsEarned: row.total_rewards_earned,
      consecutiveRewardDays: row.consecutive_reward_days,
      status: row.status as 'active' | 'suspended',
      suspensionReason: row.suspension_reason,
      suspendedAt: row.suspended_at,
      suspendedBy: row.suspended_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Clear configuration cache
   * Useful for testing or when configuration changes
   */
  clearConfigCache(): void {
    this.configCache = null;
    this.configCacheTimestamp = 0;
  }
}

// Export singleton instance
export const gangGreenHeroBadgeService = new GangGreenHeroBadgeService();