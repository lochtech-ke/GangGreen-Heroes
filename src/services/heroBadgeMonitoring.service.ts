/**
 * Hero Badge Monitoring Service
 * Provides monitoring, metrics tracking, and alerting for the Hero badge system
 */

import { supabase } from './supabase';
import type { HeroRewardOperationResult } from '../types/heroReward.types';

/**
 * System Health Status
 */
export interface SystemHealthStatus {
  healthy: boolean;
  timestamp: string;
  metrics: {
    activeHolders: number;
    pendingRewards: number;
    failedDistributionsToday: number;
    successRateToday: number;
    averageProcessingTimeMs: number;
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  period: 'day' | 'week' | 'month';
  totalDistributions: number;
  successfulDistributions: number;
  failedDistributions: number;
  successRate: number;
  totalAmountDistributed: number;
  averageRewardAmount: number;
  averageProcessingTimeMs: number;
  peakProcessingTimeMs: number;
}

/**
 * Business Metrics
 */
export interface BusinessMetrics {
  totalHeroHolders: number;
  activeHeroHolders: number;
  suspendedHeroHolders: number;
  totalRevenue: number;
  totalRewardsDistributed: number;
  netRevenue: number;
  averageHolderLifetimeDays: number;
  retentionRate: number;
}

/**
 * Alert Configuration
 */
export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    failureRate: number; // Alert if failure rate exceeds this (e.g., 0.05 = 5%)
    pendingRewards: number; // Alert if pending rewards exceed this count
    processingTime: number; // Alert if processing time exceeds this (ms)
    suspendedHolders: number; // Alert if suspended holders exceed this count
  };
  webhookUrl?: string;
  emailRecipients?: string[];
}

/**
 * Hero Badge Monitoring Service Class
 */
class HeroBadgeMonitoringService {
  private alertConfig: AlertConfig = {
    enabled: true,
    thresholds: {
      failureRate: 0.05, // 5%
      pendingRewards: 10,
      processingTime: 30000, // 30 seconds
      suspendedHolders: 5,
    },
  };

  /**
   * Check system health
   */
  async checkSystemHealth(): Promise<HeroRewardOperationResult> {
    try {
      console.log('[HeroBadgeMonitoringService] Checking system health');

      // Check Hero badge configuration
      const { data: config, error: configError } = await supabase
        .from('hero_badge_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (configError || !config) {
        return {
          success: false,
          error: 'Hero badge configuration is not active',
        };
      }

      // Get active holders count
      const { count: activeHolders, error: holdersError } = await supabase
        .from('hero_badge_holders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (holdersError) {
        console.error('[HeroBadgeMonitoringService] Error counting active holders:', holdersError);
      }

      // Get pending rewards count (holders who haven't received today's reward)
      const today = new Date().toISOString().split('T')[0];
      const { count: pendingRewards, error: pendingError } = await supabase
        .from('hero_badge_holders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .or(`last_reward_date.is.null,last_reward_date.lt.${today}`);

      if (pendingError) {
        console.error('[HeroBadgeMonitoringService] Error counting pending rewards:', pendingError);
      }

      // Get failed distributions today
      const { count: failedToday, error: failedError } = await supabase
        .from('hero_daily_rewards')
        .select('*', { count: 'exact', head: true })
        .eq('reward_date', today)
        .eq('status', 'failed');

      if (failedError) {
        console.error('[HeroBadgeMonitoringService] Error counting failed distributions:', failedError);
      }

      // Get successful distributions today
      const { count: successfulToday, error: successError } = await supabase
        .from('hero_daily_rewards')
        .select('*', { count: 'exact', head: true })
        .eq('reward_date', today)
        .eq('status', 'completed');

      if (successError) {
        console.error('[HeroBadgeMonitoringService] Error counting successful distributions:', successError);
      }

      // Calculate success rate
      const totalToday = (successfulToday || 0) + (failedToday || 0);
      const successRate = totalToday > 0 ? (successfulToday || 0) / totalToday : 1;

      // Determine health status
      const issues: string[] = [];
      const recommendations: string[] = [];
      let healthy = true;

      if (failedToday && failedToday > 0) {
        issues.push(`${failedToday} failed distributions today`);
        recommendations.push('Review error logs and retry failed distributions');
      }

      if (pendingRewards && pendingRewards > (activeHolders || 0) * 0.1) {
        healthy = false;
        issues.push(`${pendingRewards} holders have pending rewards (>${10}% of active holders)`);
        recommendations.push('Run manual distribution or check cron job status');
      }

      if (successRate < 0.95 && totalToday > 0) {
        healthy = false;
        issues.push(`Success rate is ${(successRate * 100).toFixed(1)}% (below 95% threshold)`);
        recommendations.push('Investigate distribution failures and improve error handling');
      }

      const healthStatus: SystemHealthStatus = {
        healthy,
        timestamp: new Date().toISOString(),
        metrics: {
          activeHolders: activeHolders || 0,
          pendingRewards: pendingRewards || 0,
          failedDistributionsToday: failedToday || 0,
          successRateToday: successRate,
          averageProcessingTimeMs: 0, // Would need to calculate from logs
        },
        issues,
        recommendations,
      };

      // Send alert if unhealthy
      if (!healthy && this.alertConfig.enabled) {
        await this.sendHealthAlert(healthStatus);
      }

      console.log('[HeroBadgeMonitoringService] Health check completed:', {
        healthy,
        issueCount: issues.length,
      });

      return {
        success: true,
        data: healthStatus,
      };
    } catch (error) {
      console.error('[HeroBadgeMonitoringService] Error checking system health:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check system health',
      };
    }
  }

  /**
   * Get performance metrics for a period
   */
  async getPerformanceMetrics(period: 'day' | 'week' | 'month' = 'day'): Promise<HeroRewardOperationResult> {
    try {
      console.log(`[HeroBadgeMonitoringService] Getting performance metrics for ${period}`);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get all distributions in period
      const { data: distributions, error: distError } = await supabase
        .from('hero_daily_rewards')
        .select('*')
        .gte('reward_date', startDateStr)
        .lte('reward_date', endDateStr);

      if (distError) {
        throw distError;
      }

      const totalDistributions = distributions?.length || 0;
      const successfulDistributions = distributions?.filter(d => d.status === 'completed').length || 0;
      const failedDistributions = distributions?.filter(d => d.status === 'failed').length || 0;
      const successRate = totalDistributions > 0 ? successfulDistributions / totalDistributions : 0;

      const totalAmount = distributions
        ?.filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0) || 0;

      const averageRewardAmount = successfulDistributions > 0 ? totalAmount / successfulDistributions : 0;

      const metrics: PerformanceMetrics = {
        period,
        totalDistributions,
        successfulDistributions,
        failedDistributions,
        successRate,
        totalAmountDistributed: totalAmount,
        averageRewardAmount,
        averageProcessingTimeMs: 0, // Would need processing time tracking
        peakProcessingTimeMs: 0,
      };

      console.log('[HeroBadgeMonitoringService] Performance metrics retrieved:', {
        period,
        successRate: `${(successRate * 100).toFixed(1)}%`,
        totalAmount,
      });

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error('[HeroBadgeMonitoringService] Error getting performance metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance metrics',
      };
    }
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(): Promise<HeroRewardOperationResult> {
    try {
      console.log('[HeroBadgeMonitoringService] Getting business metrics');

      // Get holder counts
      const { data: holders, error: holdersError } = await supabase
        .from('hero_badge_holders')
        .select('*');

      if (holdersError) {
        throw holdersError;
      }

      const totalHolders = holders?.length || 0;
      const activeHolders = holders?.filter(h => h.status === 'active').length || 0;
      const suspendedHolders = holders?.filter(h => h.status === 'suspended').length || 0;

      // Get total rewards distributed
      const totalRewardsDistributed = holders?.reduce(
        (sum, h) => sum + parseFloat(h.total_rewards_earned || '0'),
        0
      ) || 0;

      // Get Hero badge configuration for pricing
      const { data: config } = await supabase
        .from('hero_badge_config')
        .select('price_kes')
        .eq('is_active', true)
        .single();

      const priceKes = config?.price_kes || 500;
      const totalRevenue = totalHolders * priceKes;
      const netRevenue = totalRevenue - (totalRewardsDistributed * 100); // Assuming 1 GG Coin = 100 KES

      // Calculate average holder lifetime
      const lifetimes = holders?.map(h => {
        const purchaseDate = new Date(h.purchase_date);
        const now = new Date();
        return Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      }) || [];

      const averageLifetime = lifetimes.length > 0
        ? lifetimes.reduce((sum, days) => sum + days, 0) / lifetimes.length
        : 0;

      // Calculate retention rate (active / total)
      const retentionRate = totalHolders > 0 ? activeHolders / totalHolders : 0;

      const metrics: BusinessMetrics = {
        totalHeroHolders: totalHolders,
        activeHeroHolders: activeHolders,
        suspendedHeroHolders: suspendedHolders,
        totalRevenue,
        totalRewardsDistributed,
        netRevenue,
        averageHolderLifetimeDays: averageLifetime,
        retentionRate,
      };

      console.log('[HeroBadgeMonitoringService] Business metrics retrieved:', {
        totalHolders,
        activeHolders,
        retentionRate: `${(retentionRate * 100).toFixed(1)}%`,
      });

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error('[HeroBadgeMonitoringService] Error getting business metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get business metrics',
      };
    }
  }

  /**
   * Send health alert
   */
  private async sendHealthAlert(healthStatus: SystemHealthStatus): Promise<void> {
    try {
      console.log('[HeroBadgeMonitoringService] Sending health alert');

      const alert = {
        type: 'hero_badge_health_alert',
        severity: healthStatus.healthy ? 'warning' : 'critical',
        timestamp: healthStatus.timestamp,
        status: healthStatus,
      };

      // Send to webhook if configured
      if (this.alertConfig.webhookUrl) {
        await fetch(this.alertConfig.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alert),
        });
      }

      // Log alert
      console.warn('[HeroBadgeMonitoringService] Health alert sent:', {
        severity: alert.severity,
        issueCount: healthStatus.issues.length,
      });
    } catch (error) {
      console.error('[HeroBadgeMonitoringService] Error sending health alert:', error);
    }
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
    console.log('[HeroBadgeMonitoringService] Alert configuration updated:', this.alertConfig);
  }

  /**
   * Get alert configuration
   */
  getAlertConfig(): AlertConfig {
    return { ...this.alertConfig };
  }

  /**
   * Get fraud detection metrics
   */
  async getFraudDetectionMetrics(): Promise<HeroRewardOperationResult> {
    try {
      console.log('[HeroBadgeMonitoringService] Getting fraud detection metrics');

      // Get suspended holders
      const { data: suspendedHolders, error: suspendedError } = await supabase
        .from('hero_badge_holders')
        .select('*')
        .eq('status', 'suspended');

      if (suspendedError) {
        throw suspendedError;
      }

      // Get recent suspensions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSuspensions = suspendedHolders?.filter(h => {
        if (!h.suspended_at) return false;
        return new Date(h.suspended_at) >= sevenDaysAgo;
      }) || [];

      // Group by suspension reason
      const suspensionReasons: Record<string, number> = {};
      suspendedHolders?.forEach(h => {
        const reason = h.suspension_reason || 'Unknown';
        suspensionReasons[reason] = (suspensionReasons[reason] || 0) + 1;
      });

      const metrics = {
        totalSuspended: suspendedHolders?.length || 0,
        recentSuspensions: recentSuspensions.length,
        suspensionReasons,
        suspensionRate: 0, // Would need total holders count
      };

      // Send alert if suspensions exceed threshold
      if (metrics.totalSuspended > this.alertConfig.thresholds.suspendedHolders) {
        console.warn('[HeroBadgeMonitoringService] Suspended holders exceed threshold:', {
          count: metrics.totalSuspended,
          threshold: this.alertConfig.thresholds.suspendedHolders,
        });
      }

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error('[HeroBadgeMonitoringService] Error getting fraud detection metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get fraud detection metrics',
      };
    }
  }

  /**
   * Generate monitoring report
   */
  async generateMonitoringReport(): Promise<HeroRewardOperationResult> {
    try {
      console.log('[HeroBadgeMonitoringService] Generating monitoring report');

      const [healthResult, performanceResult, businessResult, fraudResult] = await Promise.all([
        this.checkSystemHealth(),
        this.getPerformanceMetrics('day'),
        this.getBusinessMetrics(),
        this.getFraudDetectionMetrics(),
      ]);

      const report = {
        generatedAt: new Date().toISOString(),
        health: healthResult.data,
        performance: performanceResult.data,
        business: businessResult.data,
        fraud: fraudResult.data,
      };

      console.log('[HeroBadgeMonitoringService] Monitoring report generated');

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      console.error('[HeroBadgeMonitoringService] Error generating monitoring report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate monitoring report',
      };
    }
  }
}

// Export singleton instance
export const heroBadgeMonitoringService = new HeroBadgeMonitoringService();

// Export class for testing
export { HeroBadgeMonitoringService };
