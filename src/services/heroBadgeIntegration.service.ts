import { supabase } from './supabase';
import { gangGreenHeroBadgeService } from './gangGreenHeroBadge.service';
import type { HeroBadgeOperationResult } from '../types/heroBadge.types';

// Extended BadgePurchase type with Hero badge fields
interface HeroBadgePurchase {
  id: string;
  user_id: string;
  badge_type: string;
  tier: string;
  amount_kes: number;
  paystack_reference: string;
  payment_status: string;
  is_hero_badge: boolean;
  hero_benefits_activated: boolean;
  created_at: string;
  completed_at?: string;
}

/**
 * Hero Badge Integration Service
 * Handles integration between Hero badge system and existing badge purchase workflow
 */
class HeroBadgeIntegrationService {
  /**
   * Process Hero badge purchase completion
   * Called when a Hero badge purchase is successfully completed
   */
  async processHeroBadgePurchaseCompletion(purchase: HeroBadgePurchase): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[HeroBadgeIntegrationService] Processing Hero badge purchase completion: ${purchase.id}`);

      // Verify this is a Hero badge purchase
      if (!purchase.is_hero_badge || purchase.badge_type !== 'ganggreen_hero') {
        return {
          success: false,
          error: 'Purchase is not a Hero badge',
        };
      }

      // Check if Hero status already granted
      const existingStatus = await gangGreenHeroBadgeService.isHeroUser(purchase.user_id);
      if (existingStatus) {
        console.log('[HeroBadgeIntegrationService] Hero status already granted');
        return {
          success: true,
          data: { message: 'Hero status already granted' },
        };
      }

      // Grant Hero status
      const grantResult = await gangGreenHeroBadgeService.grantHeroStatus({
        userId: purchase.user_id,
        badgePurchaseId: purchase.id,
        purchaseDate: purchase.completed_at || purchase.created_at,
      });

      if (!grantResult.success) {
        console.error('[HeroBadgeIntegrationService] Failed to grant Hero status:', grantResult.error);
        return grantResult;
      }

      console.log('[HeroBadgeIntegrationService] Hero badge purchase processed successfully');

      return {
        success: true,
        data: {
          heroBadgeHolder: grantResult.data,
          message: 'Hero badge purchase processed and status granted',
        },
      };
    } catch (error) {
      console.error('[HeroBadgeIntegrationService] Exception processing Hero badge purchase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process Hero badge purchase',
      };
    }
  }

  /**
   * Handle Hero badge purchase webhook
   * Called from Paystack webhook when Hero badge purchase is confirmed
   */
  async handleHeroBadgePurchaseWebhook(paystackReference: string): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[HeroBadgeIntegrationService] Handling Hero badge purchase webhook: ${paystackReference}`);

      // Fetch purchase record
      const { data: purchase, error } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('paystack_reference', paystackReference)
        .eq('is_hero_badge', true)
        .single();

      if (error || !purchase) {
        console.error('[HeroBadgeIntegrationService] Hero badge purchase not found:', error);
        return {
          success: false,
          error: 'Hero badge purchase not found',
        };
      }

      // Process the purchase completion
      return await this.processHeroBadgePurchaseCompletion(purchase);
    } catch (error) {
      console.error('[HeroBadgeIntegrationService] Exception handling webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle Hero badge purchase webhook',
      };
    }
  }

  /**
   * Validate Hero badge purchase eligibility
   * Checks if user can purchase a Hero badge
   */
  async validateHeroBadgePurchaseEligibility(userId: string): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[HeroBadgeIntegrationService] Validating Hero badge purchase eligibility for user ${userId}`);

      // Check if user already has Hero status
      const isHero = await gangGreenHeroBadgeService.isHeroUser(userId);
      if (isHero) {
        return {
          success: false,
          error: 'User already owns a GangGreen Hero badge',
        };
      }

      // Check if user has any pending Hero badge purchases
      const { data: pendingPurchases, error } = await supabase
        .from('badge_purchases')
        .select('id, payment_status')
        .eq('user_id', userId)
        .eq('is_hero_badge', true)
        .eq('payment_status', 'pending');

      if (error) {
        console.error('[HeroBadgeIntegrationService] Error checking pending purchases:', error);
        return {
          success: false,
          error: 'Failed to validate purchase eligibility',
        };
      }

      if (pendingPurchases && pendingPurchases.length > 0) {
        return {
          success: false,
          error: 'User has a pending Hero badge purchase',
        };
      }

      // Get Hero badge configuration to ensure it's available
      const config = await gangGreenHeroBadgeService.getHeroBadgeConfig();
      if (!config || !config.isActive) {
        return {
          success: false,
          error: 'Hero badge is not currently available for purchase',
        };
      }

      return {
        success: true,
        data: {
          eligible: true,
          config,
        },
      };
    } catch (error) {
      console.error('[HeroBadgeIntegrationService] Exception validating eligibility:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate purchase eligibility',
      };
    }
  }

  /**
   * Get Hero badge purchase analytics
   * Returns statistics about Hero badge purchases
   */
  async getHeroBadgePurchaseAnalytics(dateRange?: { start: string; end: string }): Promise<HeroBadgeOperationResult> {
    try {
      console.log('[HeroBadgeIntegrationService] Fetching Hero badge purchase analytics');

      let query = supabase
        .from('badge_purchases')
        .select('*')
        .eq('is_hero_badge', true);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data: purchases, error } = await query;

      if (error) {
        console.error('[HeroBadgeIntegrationService] Error fetching analytics:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Calculate analytics
      const totalPurchases = purchases?.length || 0;
      const successfulPurchases = purchases?.filter(p => p.payment_status === 'success').length || 0;
      const pendingPurchases = purchases?.filter(p => p.payment_status === 'pending').length || 0;
      const failedPurchases = purchases?.filter(p => p.payment_status === 'failed').length || 0;
      const totalRevenue = purchases
        ?.filter(p => p.payment_status === 'success')
        .reduce((sum, p) => sum + p.amount_kes, 0) || 0;

      // Get Hero badge holders count
      const holdersResult = await gangGreenHeroBadgeService.getHeroHolders(1, 0);
      const totalHolders = holdersResult.success ? holdersResult.total || 0 : 0;

      const analytics = {
        totalPurchases,
        successfulPurchases,
        pendingPurchases,
        failedPurchases,
        totalRevenue,
        totalHolders,
        conversionRate: totalPurchases > 0 ? (successfulPurchases / totalPurchases) * 100 : 0,
        averageOrderValue: successfulPurchases > 0 ? totalRevenue / successfulPurchases : 0,
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      console.error('[HeroBadgeIntegrationService] Exception fetching analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Hero badge analytics',
      };
    }
  }

  /**
   * Cleanup failed Hero badge purchases
   * Removes abandoned or failed purchases older than specified days
   */
  async cleanupFailedHeroBadgePurchases(olderThanDays: number = 7): Promise<HeroBadgeOperationResult> {
    try {
      console.log(`[HeroBadgeIntegrationService] Cleaning up failed Hero badge purchases older than ${olderThanDays} days`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await supabase
        .from('badge_purchases')
        .delete()
        .eq('is_hero_badge', true)
        .in('payment_status', ['failed', 'abandoned'])
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('[HeroBadgeIntegrationService] Error cleaning up purchases:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const cleanedCount = data?.length || 0;
      console.log(`[HeroBadgeIntegrationService] Cleaned up ${cleanedCount} failed Hero badge purchases`);

      return {
        success: true,
        data: {
          cleanedCount,
          cutoffDate: cutoffDate.toISOString(),
        },
      };
    } catch (error) {
      console.error('[HeroBadgeIntegrationService] Exception cleaning up purchases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup failed purchases',
      };
    }
  }
}

// Export singleton instance
export const heroBadgeIntegrationService = new HeroBadgeIntegrationService();