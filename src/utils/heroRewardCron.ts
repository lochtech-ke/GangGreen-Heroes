/**
 * Hero Reward Cron Utilities
 * Utilities for setting up automated Hero badge reward distribution
 * 
 * This module provides functions to integrate with external cron services
 * or cloud functions for automated reward distribution.
 */

import { heroRewardSchedulerService } from '../services/heroRewardScheduler.service';
import type { RewardDistributionResult } from '../types/heroReward.types';

/**
 * Cron job configuration for Hero reward distribution
 */
export interface HeroRewardCronConfig {
  enabled: boolean;
  schedule: string; // Cron expression (e.g., "0 0 * * *" for daily at midnight)
  timezone: string; // Timezone for scheduling (e.g., "UTC", "Africa/Nairobi")
  retryOnFailure: boolean;
  maxRetries: number;
  notificationWebhook?: string; // Optional webhook for notifications
}

/**
 * Default cron configuration for Hero rewards
 */
export const DEFAULT_HERO_REWARD_CRON_CONFIG: HeroRewardCronConfig = {
  enabled: true,
  schedule: '0 0 * * *', // Daily at midnight UTC
  timezone: 'UTC',
  retryOnFailure: true,
  maxRetries: 3,
};

/**
 * Execute Hero reward distribution (called by cron job)
 * This function should be called by external cron services
 */
export async function executeHeroRewardCron(): Promise<RewardDistributionResult> {
  try {
    console.log('[HeroRewardCron] Starting scheduled Hero reward distribution');
    
    const result = await heroRewardSchedulerService.executeScheduledDistribution();
    
    // Send notification if webhook is configured
    if (process.env.HERO_REWARD_NOTIFICATION_WEBHOOK) {
      await sendDistributionNotification(result);
    }
    
    return result;
  } catch (error) {
    console.error('[HeroRewardCron] Error in cron execution:', error);
    throw error;
  }
}

/**
 * Execute retry for failed Hero reward distributions
 * This function should be called by retry cron jobs
 */
export async function executeHeroRewardRetry(): Promise<RewardDistributionResult> {
  try {
    console.log('[HeroRewardCron] Starting retry for failed Hero reward distributions');
    
    const result = await heroRewardSchedulerService.retryFailedDistributions();
    
    // Send notification if webhook is configured
    if (process.env.HERO_REWARD_NOTIFICATION_WEBHOOK) {
      await sendRetryNotification(result);
    }
    
    return result;
  } catch (error) {
    console.error('[HeroRewardCron] Error in retry execution:', error);
    throw error;
  }
}

/**
 * Health check for Hero reward system (called by monitoring cron)
 * This function should be called by health check cron jobs
 */
export async function executeHeroRewardHealthCheck(): Promise<any> {
  try {
    console.log('[HeroRewardCron] Performing Hero reward system health check');
    
    const healthResult = await heroRewardSchedulerService.performHealthCheck();
    
    // Send alert if system is unhealthy
    if (!healthResult.success || (healthResult.data && !healthResult.data.healthy)) {
      await sendHealthAlert(healthResult);
    }
    
    return healthResult;
  } catch (error) {
    console.error('[HeroRewardCron] Error in health check:', error);
    
    // Send critical alert
    await sendHealthAlert({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    throw error;
  }
}

/**
 * Send distribution notification to webhook
 */
async function sendDistributionNotification(result: RewardDistributionResult): Promise<void> {
  try {
    const webhookUrl = process.env.HERO_REWARD_NOTIFICATION_WEBHOOK;
    if (!webhookUrl) return;

    const notification = {
      type: 'hero_reward_distribution',
      timestamp: new Date().toISOString(),
      success: result.success,
      data: {
        distributionDate: result.distributionDate,
        totalHolders: result.totalHolders,
        successfulDistributions: result.successfulDistributions,
        failedDistributions: result.failedDistributions,
        totalAmountDistributed: result.totalAmountDistributed,
        processingTimeMs: result.processingTimeMs,
        errors: result.errors,
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      console.error('[HeroRewardCron] Failed to send notification:', response.statusText);
    }
  } catch (error) {
    console.error('[HeroRewardCron] Error sending notification:', error);
  }
}

/**
 * Send retry notification to webhook
 */
async function sendRetryNotification(result: RewardDistributionResult): Promise<void> {
  try {
    const webhookUrl = process.env.HERO_REWARD_NOTIFICATION_WEBHOOK;
    if (!webhookUrl) return;

    const notification = {
      type: 'hero_reward_retry',
      timestamp: new Date().toISOString(),
      success: result.success,
      data: {
        successfulRetries: result.successfulDistributions,
        failedRetries: result.failedDistributions,
        totalAmountDistributed: result.totalAmountDistributed,
        errors: result.errors,
      },
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
  } catch (error) {
    console.error('[HeroRewardCron] Error sending retry notification:', error);
  }
}

/**
 * Send health alert to webhook
 */
async function sendHealthAlert(healthResult: any): Promise<void> {
  try {
    const webhookUrl = process.env.HERO_REWARD_NOTIFICATION_WEBHOOK;
    if (!webhookUrl) return;

    const alert = {
      type: 'hero_reward_health_alert',
      timestamp: new Date().toISOString(),
      severity: healthResult.success ? 'warning' : 'critical',
      data: healthResult,
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    });
  } catch (error) {
    console.error('[HeroRewardCron] Error sending health alert:', error);
  }
}

/**
 * Generate cron job configuration for different platforms
 */
export function generateCronConfig(platform: 'vercel' | 'netlify' | 'github-actions' | 'generic'): string {
  const config = DEFAULT_HERO_REWARD_CRON_CONFIG;
  
  switch (platform) {
    case 'vercel':
      return `
// vercel.json cron configuration
{
  "crons": [
    {
      "path": "/api/cron/hero-rewards",
      "schedule": "${config.schedule}"
    },
    {
      "path": "/api/cron/hero-rewards-retry",
      "schedule": "0 */1 * * *"
    },
    {
      "path": "/api/cron/hero-rewards-health",
      "schedule": "*/15 * * * *"
    }
  ]
}`;

    case 'netlify':
      return `
// netlify.toml cron configuration
[[functions]]
  name = "hero-rewards-cron"
  schedule = "${config.schedule}"
  
[[functions]]
  name = "hero-rewards-retry"
  schedule = "0 */1 * * *"
  
[[functions]]
  name = "hero-rewards-health"
  schedule = "*/15 * * * *"`;

    case 'github-actions':
      return `
# .github/workflows/hero-rewards.yml
name: Hero Rewards Distribution
on:
  schedule:
    - cron: '${config.schedule}'
    - cron: '0 */1 * * *'  # Retry every hour
    - cron: '*/15 * * * *'  # Health check every 15 minutes
  workflow_dispatch:

jobs:
  distribute-rewards:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Hero Rewards Distribution
        run: |
          curl -X POST "\${{ secrets.HERO_REWARDS_WEBHOOK_URL }}" \\
            -H "Content-Type: application/json" \\
            -d '{"action": "distribute"}'`;

    case 'generic':
    default:
      return `
# Generic cron configuration
# Daily reward distribution at midnight UTC
${config.schedule} /usr/bin/curl -X POST "https://your-app.com/api/cron/hero-rewards"

# Retry failed distributions every hour
0 */1 * * * /usr/bin/curl -X POST "https://your-app.com/api/cron/hero-rewards-retry"

# Health check every 15 minutes
*/15 * * * * /usr/bin/curl -X POST "https://your-app.com/api/cron/hero-rewards-health"`;
  }
}

/**
 * Validate cron configuration
 */
export function validateCronConfig(config: HeroRewardCronConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate cron expression (basic validation)
  const cronParts = config.schedule.split(' ');
  if (cronParts.length !== 5) {
    errors.push('Invalid cron expression: must have 5 parts (minute hour day month weekday)');
  }

  // Validate timezone
  try {
    new Date().toLocaleString('en-US', { timeZone: config.timezone });
  } catch (error) {
    errors.push(`Invalid timezone: ${config.timezone}`);
  }

  // Validate retry configuration
  if (config.retryOnFailure && config.maxRetries < 1) {
    errors.push('maxRetries must be at least 1 when retryOnFailure is enabled');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get environment-specific cron setup instructions
 */
export function getCronSetupInstructions(): string {
  return `
# Hero Reward Distribution Cron Setup Instructions

## Environment Variables Required:
- HERO_REWARD_NOTIFICATION_WEBHOOK (optional): Webhook URL for notifications

## API Endpoints to Create:

### 1. Daily Distribution Endpoint
POST /api/cron/hero-rewards
- Calls: executeHeroRewardCron()
- Schedule: Daily at midnight UTC (0 0 * * *)

### 2. Retry Failed Distributions Endpoint  
POST /api/cron/hero-rewards-retry
- Calls: executeHeroRewardRetry()
- Schedule: Every hour (0 */1 * * *)

### 3. Health Check Endpoint
POST /api/cron/hero-rewards-health
- Calls: executeHeroRewardHealthCheck()
- Schedule: Every 15 minutes (*/15 * * * *)

## Platform-Specific Setup:

### Vercel:
1. Add cron configuration to vercel.json
2. Create API routes in pages/api/cron/
3. Deploy with cron functions enabled

### Netlify:
1. Add functions to netlify/functions/
2. Configure schedules in netlify.toml
3. Deploy with scheduled functions

### GitHub Actions:
1. Create workflow file in .github/workflows/
2. Set up secrets for webhook URLs
3. Configure schedule triggers

### Generic Server:
1. Add cron jobs to crontab
2. Use curl to trigger API endpoints
3. Set up monitoring and alerting

## Testing:
- Use dry run mode for testing: { dryRun: true }
- Monitor logs for successful execution
- Set up alerts for failed distributions
- Verify GG coin transactions are created correctly
`;
}