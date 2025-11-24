import { heroRewardEngineService } from './heroRewardEngine.service';
import { gangGreenHeroBadgeService } from './gangGreenHeroBadge.service';
import type {
  RewardDistributionResult,
  RewardDistributionStatus,
  HeroRewardOperationResult,
} from '../types/heroReward.types';

/**
 * Hero Reward Scheduler Service
 * Handles automated scheduling and monitoring of Hero badge reward distributions
 */
class HeroRewardSchedulerService {
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isSchedulerRunning = false;
  private lastScheduledRun: string | null = null;
  private nextScheduledRun: string | null = null;
  private schedulerConfig = {
    enabled: false,
    intervalHours: 24, // Run daily
    retryIntervalHours: 1, // Retry failed distributions every hour
    maxRetryAttempts: 3,
  };

  /**
   * Start the automated reward distribution scheduler
   * Runs daily reward distribution at specified intervals
   */
  startScheduler(config?: Partial<typeof this.schedulerConfig>): HeroRewardOperationResult {
    try {
      if (this.isSchedulerRunning) {
        console.log('[HeroRewardSchedulerService] Scheduler already running');
        return {
          success: false,
          error: 'Scheduler is already running',
        };
      }

      // Update configuration if provided
      if (config) {
        this.schedulerConfig = { ...this.schedulerConfig, ...config };
      }

      if (!this.schedulerConfig.enabled) {
        console.log('[HeroRewardSchedulerService] Scheduler is disabled in configuration');
        return {
          success: false,
          error: 'Scheduler is disabled in configuration',
        };
      }

      console.log('[HeroRewardSchedulerService] Starting reward distribution scheduler');
      console.log(`[HeroRewardSchedulerService] Interval: ${this.schedulerConfig.intervalHours} hours`);

      // Calculate next run time
      const now = new Date();
      const nextRun = new Date(now.getTime() + (this.schedulerConfig.intervalHours * 60 * 60 * 1000));
      this.nextScheduledRun = nextRun.toISOString();

      // Set up interval
      const intervalMs = this.schedulerConfig.intervalHours * 60 * 60 * 1000;
      this.schedulerInterval = setInterval(async () => {
        await this.executeScheduledDistribution();
      }, intervalMs) as NodeJS.Timeout;

      this.isSchedulerRunning = true;

      console.log(`[HeroRewardSchedulerService] Scheduler started, next run: ${this.nextScheduledRun}`);

      return {
        success: true,
        data: {
          nextScheduledRun: this.nextScheduledRun,
          intervalHours: this.schedulerConfig.intervalHours,
        },
      };
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Error starting scheduler:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start scheduler',
      };
    }
  }

  /**
   * Stop the automated reward distribution scheduler
   */
  stopScheduler(): HeroRewardOperationResult {
    try {
      if (!this.isSchedulerRunning) {
        console.log('[HeroRewardSchedulerService] Scheduler is not running');
        return {
          success: false,
          error: 'Scheduler is not running',
        };
      }

      console.log('[HeroRewardSchedulerService] Stopping reward distribution scheduler');

      if (this.schedulerInterval) {
        clearInterval(this.schedulerInterval);
        this.schedulerInterval = null;
      }

      this.isSchedulerRunning = false;
      this.nextScheduledRun = null;

      console.log('[HeroRewardSchedulerService] Scheduler stopped');

      return {
        success: true,
        data: {
          message: 'Scheduler stopped successfully',
        },
      };
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Error stopping scheduler:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop scheduler',
      };
    }
  }

  /**
   * Execute scheduled reward distribution
   * Called automatically by the scheduler or manually by admin
   */
  async executeScheduledDistribution(): Promise<RewardDistributionResult> {
    try {
      console.log('[HeroRewardSchedulerService] Executing scheduled reward distribution');

      const now = new Date();
      this.lastScheduledRun = now.toISOString();

      // Calculate next run time
      const nextRun = new Date(now.getTime() + (this.schedulerConfig.intervalHours * 60 * 60 * 1000));
      this.nextScheduledRun = nextRun.toISOString();

      // Check if Hero badge system is active
      const heroBadgeConfig = await gangGreenHeroBadgeService.getHeroBadgeConfig();
      if (!heroBadgeConfig || !heroBadgeConfig.isActive) {
        console.log('[HeroRewardSchedulerService] Hero badge system is not active, skipping distribution');
        return {
          success: false,
          totalHolders: 0,
          successfulDistributions: 0,
          failedDistributions: 0,
          totalAmountDistributed: 0,
          errors: ['Hero badge system is not active'],
          distributionDate: now.toISOString().split('T')[0],
          processingTimeMs: 0,
        };
      }

      // Execute daily reward distribution
      const distributionResult = await heroRewardEngineService.distributeDailyRewards();

      // Log results
      if (distributionResult.success) {
        console.log(`[HeroRewardSchedulerService] Distribution completed successfully:`);
        console.log(`  - Total holders: ${distributionResult.totalHolders}`);
        console.log(`  - Successful: ${distributionResult.successfulDistributions}`);
        console.log(`  - Failed: ${distributionResult.failedDistributions}`);
        console.log(`  - Amount distributed: ${distributionResult.totalAmountDistributed} GG Coins`);
      } else {
        console.error('[HeroRewardSchedulerService] Distribution failed:', distributionResult.errors);
      }

      // If there were failures, schedule retry
      if (distributionResult.failedDistributions > 0) {
        console.log(`[HeroRewardSchedulerService] Scheduling retry for ${distributionResult.failedDistributions} failed distributions`);
        setTimeout(async () => {
          await this.retryFailedDistributions();
        }, this.schedulerConfig.retryIntervalHours * 60 * 60 * 1000);
      }

      return distributionResult;
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Exception during scheduled distribution:', error);
      
      return {
        success: false,
        totalHolders: 0,
        successfulDistributions: 0,
        failedDistributions: 0,
        totalAmountDistributed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        distributionDate: new Date().toISOString().split('T')[0],
        processingTimeMs: 0,
      };
    }
  }

  /**
   * Retry failed reward distributions
   * Called automatically after failed distributions or manually by admin
   */
  async retryFailedDistributions(): Promise<RewardDistributionResult> {
    try {
      console.log('[HeroRewardSchedulerService] Retrying failed reward distributions');

      const retryResult = await heroRewardEngineService.retryFailedDistributions();

      if (retryResult.success) {
        console.log(`[HeroRewardSchedulerService] Retry completed:`);
        console.log(`  - Successful retries: ${retryResult.successfulDistributions}`);
        console.log(`  - Failed retries: ${retryResult.failedDistributions}`);
        console.log(`  - Amount distributed: ${retryResult.totalAmountDistributed} GG Coins`);
      } else {
        console.error('[HeroRewardSchedulerService] Retry failed:', retryResult.errors);
      }

      return retryResult;
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Exception during retry:', error);
      throw error;
    }
  }

  /**
   * Get scheduler status and configuration
   */
  getSchedulerStatus(): {
    isRunning: boolean;
    config: {
      enabled: boolean;
      intervalHours: number;
      retryIntervalHours: number;
      maxRetryAttempts: number;
    };
    lastScheduledRun: string | null;
    nextScheduledRun: string | null;
    distributionStatus: RewardDistributionStatus;
  } {
    return {
      isRunning: this.isSchedulerRunning,
      config: { ...this.schedulerConfig },
      lastScheduledRun: this.lastScheduledRun,
      nextScheduledRun: this.nextScheduledRun,
      distributionStatus: heroRewardEngineService.getDistributionStatus(),
    };
  }

  /**
   * Update scheduler configuration
   * Admin function to modify scheduler settings
   */
  updateSchedulerConfig(config: Partial<typeof this.schedulerConfig>): HeroRewardOperationResult {
    try {
      console.log('[HeroRewardSchedulerService] Updating scheduler configuration:', config);

      const oldConfig = { ...this.schedulerConfig };
      this.schedulerConfig = { ...this.schedulerConfig, ...config };

      // If interval changed and scheduler is running, restart it
      if (this.isSchedulerRunning && config.intervalHours && config.intervalHours !== oldConfig.intervalHours) {
        console.log('[HeroRewardSchedulerService] Interval changed, restarting scheduler');
        this.stopScheduler();
        this.startScheduler();
      }

      // If scheduler was disabled, stop it
      if (this.isSchedulerRunning && config.enabled === false) {
        console.log('[HeroRewardSchedulerService] Scheduler disabled, stopping');
        this.stopScheduler();
      }

      // If scheduler was enabled and not running, start it
      if (!this.isSchedulerRunning && config.enabled === true) {
        console.log('[HeroRewardSchedulerService] Scheduler enabled, starting');
        this.startScheduler();
      }

      return {
        success: true,
        data: {
          oldConfig,
          newConfig: { ...this.schedulerConfig },
        },
      };
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Error updating configuration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update configuration',
      };
    }
  }

  /**
   * Perform health check on the reward distribution system
   * Checks Hero badge configuration, database connectivity, and recent distributions
   */
  async performHealthCheck(): Promise<HeroRewardOperationResult> {
    try {
      console.log('[HeroRewardSchedulerService] Performing health check');

      const healthStatus = {
        timestamp: new Date().toISOString(),
        scheduler: {
          isRunning: this.isSchedulerRunning,
          enabled: this.schedulerConfig.enabled,
          nextRun: this.nextScheduledRun,
        },
        heroBadgeSystem: {
          configAvailable: false,
          configActive: false,
          totalHolders: 0,
        },
        recentDistribution: {
          hasRecentDistribution: false,
          lastDistributionDate: null as string | null,
          lastDistributionSuccess: false,
        },
        issues: [] as string[],
      };

      // Check Hero badge configuration
      try {
        const heroBadgeConfig = await gangGreenHeroBadgeService.getHeroBadgeConfig();
        if (heroBadgeConfig) {
          healthStatus.heroBadgeSystem.configAvailable = true;
          healthStatus.heroBadgeSystem.configActive = heroBadgeConfig.isActive;
        } else {
          healthStatus.issues.push('Hero badge configuration not found');
        }
      } catch (error) {
        healthStatus.issues.push(`Hero badge config error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Check Hero badge holders
      try {
        const holdersResult = await gangGreenHeroBadgeService.getHeroHolders(1, 0, 'active');
        if (holdersResult.success) {
          healthStatus.heroBadgeSystem.totalHolders = holdersResult.total || 0;
        } else {
          healthStatus.issues.push('Failed to fetch Hero badge holders');
        }
      } catch (error) {
        healthStatus.issues.push(`Hero holders error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Check recent distribution
      const distributionStatus = heroRewardEngineService.getDistributionStatus();
      if (distributionStatus.lastResult) {
        healthStatus.recentDistribution.hasRecentDistribution = true;
        healthStatus.recentDistribution.lastDistributionDate = distributionStatus.lastResult.distributionDate;
        healthStatus.recentDistribution.lastDistributionSuccess = distributionStatus.lastResult.success;

        if (!distributionStatus.lastResult.success) {
          healthStatus.issues.push('Last reward distribution failed');
        }
      }

      // Check for failed distributions
      if (distributionStatus.failedDistributions.length > 0) {
        healthStatus.issues.push(`${distributionStatus.failedDistributions.length} failed distributions pending retry`);
      }

      const isHealthy = healthStatus.issues.length === 0;

      console.log(`[HeroRewardSchedulerService] Health check completed: ${isHealthy ? 'HEALTHY' : 'ISSUES FOUND'}`);
      if (!isHealthy) {
        console.log('[HeroRewardSchedulerService] Issues found:', healthStatus.issues);
      }

      return {
        success: true,
        data: {
          healthy: isHealthy,
          status: healthStatus,
        },
      };
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Exception during health check:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Generate reward distribution report
   * Creates a summary report of recent reward distributions
   */
  async generateDistributionReport(days: number = 7): Promise<HeroRewardOperationResult> {
    try {
      console.log(`[HeroRewardSchedulerService] Generating distribution report for last ${days} days`);

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

      // Get reward analytics
      const analytics = await heroRewardEngineService.getRewardAnalytics(startDate, endDate);

      // Get scheduler status
      const schedulerStatus = this.getSchedulerStatus();

      // Get Hero badge system status
      const heroBadgeConfig = await gangGreenHeroBadgeService.getHeroBadgeConfig();
      const holdersResult = await gangGreenHeroBadgeService.getHeroHolders(1, 0, 'active');

      const report = {
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          days,
          startDate,
          endDate,
        },
        analytics,
        schedulerStatus: {
          isRunning: schedulerStatus.isRunning,
          enabled: schedulerStatus.config.enabled,
          intervalHours: schedulerStatus.config.intervalHours,
          lastRun: schedulerStatus.lastScheduledRun,
          nextRun: schedulerStatus.nextScheduledRun,
        },
        systemStatus: {
          heroBadgeConfigActive: heroBadgeConfig?.isActive || false,
          totalActiveHolders: holdersResult.success ? holdersResult.total || 0 : 0,
          dailyRewardAmount: heroBadgeConfig?.dailyGGCoinReward || 0,
        },
        distributionStatus: schedulerStatus.distributionStatus,
      };

      console.log('[HeroRewardSchedulerService] Distribution report generated successfully');

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      console.error('[HeroRewardSchedulerService] Exception generating report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      };
    }
  }
}

// Export singleton instance
export const heroRewardSchedulerService = new HeroRewardSchedulerService();