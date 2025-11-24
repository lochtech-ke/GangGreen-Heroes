# Hero Badge Reward Distribution Cron Setup Guide

## Overview

The Hero Badge system requires automated daily reward distribution. This guide explains how to set up the cron jobs for automated reward distribution, retry logic, and system monitoring.

## Architecture

The system consists of three main cron jobs:

1. **Daily Reward Distribution** - Runs daily at midnight UTC
2. **Retry Failed Distributions** - Runs hourly to retry failed distributions
3. **Health Check** - Runs every 15 minutes to monitor system health

## Implementation Options

### Option 1: Supabase Edge Functions (Recommended)

Create three Edge Functions in `supabase/functions/`:

#### 1. Daily Distribution Function

```typescript
// supabase/functions/hero-rewards-daily/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the reward distribution function
    const { data, error } = await supabase.rpc('distribute_hero_daily_rewards');

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### 2. Retry Function

```typescript
// supabase/functions/hero-rewards-retry/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase.rpc('retry_failed_hero_rewards');

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### 3. Health Check Function

```typescript
// supabase/functions/hero-rewards-health/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check system health
    const { data, error } = await supabase.rpc('check_hero_reward_system_health');

    if (error) throw error;

    // Send alert if unhealthy
    if (!data.healthy) {
      // Send notification (implement your notification logic)
      console.error('Hero reward system unhealthy:', data);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Setup Cron Jobs in Supabase

Use an external cron service (like cron-job.org or EasyCron) to trigger these functions:

```bash
# Daily at midnight UTC
0 0 * * * curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-daily" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Hourly retry
0 * * * * curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-retry" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Every 15 minutes health check
*/15 * * * * curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-health" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 2: GitHub Actions

Create a workflow file:

```yaml
# .github/workflows/hero-rewards.yml
name: Hero Rewards Distribution

on:
  schedule:
    # Daily at midnight UTC
    - cron: '0 0 * * *'
    # Retry every hour
    - cron: '0 * * * *'
    # Health check every 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch:

jobs:
  distribute-rewards:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 0 * * *'
    steps:
      - name: Distribute Daily Rewards
        run: |
          curl -X POST "${{ secrets.SUPABASE_FUNCTION_URL }}/hero-rewards-daily" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  retry-failed:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 * * * *'
    steps:
      - name: Retry Failed Distributions
        run: |
          curl -X POST "${{ secrets.SUPABASE_FUNCTION_URL }}/hero-rewards-retry" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  health-check:
    runs-on: ubuntu-latest
    if: github.event.schedule == '*/15 * * * *'
    steps:
      - name: Health Check
        run: |
          curl -X POST "${{ secrets.SUPABASE_FUNCTION_URL }}/hero-rewards-health" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 3: External Cron Service

Use services like:
- **cron-job.org** (Free, reliable)
- **EasyCron** (Free tier available)
- **Cronitor** (Monitoring included)

Configure three jobs:

1. **Daily Distribution**
   - URL: `https://your-project.supabase.co/functions/v1/hero-rewards-daily`
   - Schedule: `0 0 * * *`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

2. **Retry Failed**
   - URL: `https://your-project.supabase.co/functions/v1/hero-rewards-retry`
   - Schedule: `0 * * * *`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Health Check**
   - URL: `https://your-project.supabase.co/functions/v1/hero-rewards-health`
   - Schedule: `*/15 * * * *`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

## Database Functions

Create these PostgreSQL functions in Supabase:

```sql
-- Function to distribute daily rewards
CREATE OR REPLACE FUNCTION distribute_hero_daily_rewards()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_holder RECORD;
  v_config RECORD;
  v_total_holders INTEGER := 0;
  v_successful INTEGER := 0;
  v_failed INTEGER := 0;
  v_total_amount DECIMAL(10,3) := 0;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get active Hero badge configuration
  SELECT * INTO v_config
  FROM hero_badge_config
  WHERE is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active Hero badge configuration found'
    );
  END IF;

  -- Get all active Hero badge holders
  FOR v_holder IN
    SELECT * FROM hero_badge_holders
    WHERE status = 'active'
    AND (last_reward_date IS NULL OR last_reward_date < v_today)
  LOOP
    v_total_holders := v_total_holders + 1;

    BEGIN
      -- Calculate reward with bonus
      DECLARE
        v_reward_amount DECIMAL(10,3);
        v_bonus_multiplier DECIMAL(3,2) := 1.0;
      BEGIN
        -- Apply consecutive day bonus (up to 1.5x)
        IF v_holder.consecutive_reward_days >= 30 THEN
          v_bonus_multiplier := 1.5;
        ELSIF v_holder.consecutive_reward_days >= 7 THEN
          v_bonus_multiplier := 1.2;
        END IF;

        v_reward_amount := v_config.daily_gg_coin_reward * v_bonus_multiplier;

        -- Create GG coin transaction
        INSERT INTO gg_coin_transactions (
          user_id,
          amount,
          transaction_type,
          description,
          metadata
        ) VALUES (
          v_holder.user_id,
          v_reward_amount,
          'hero_daily_reward',
          'Daily Hero Badge Reward',
          jsonb_build_object(
            'badge_holder_id', v_holder.id,
            'consecutive_days', v_holder.consecutive_reward_days,
            'bonus_multiplier', v_bonus_multiplier
          )
        );

        -- Update holder record
        UPDATE hero_badge_holders
        SET
          last_reward_date = v_today,
          total_rewards_earned = total_rewards_earned + v_reward_amount,
          consecutive_reward_days = consecutive_reward_days + 1,
          updated_at = NOW()
        WHERE id = v_holder.id;

        -- Record successful distribution
        INSERT INTO hero_daily_rewards (
          holder_id,
          reward_date,
          amount,
          bonus_multiplier,
          consecutive_days,
          status
        ) VALUES (
          v_holder.id,
          v_today,
          v_reward_amount,
          v_bonus_multiplier,
          v_holder.consecutive_reward_days + 1,
          'completed'
        );

        v_successful := v_successful + 1;
        v_total_amount := v_total_amount + v_reward_amount;
      END;
    EXCEPTION WHEN OTHERS THEN
      -- Record failed distribution
      INSERT INTO hero_daily_rewards (
        holder_id,
        reward_date,
        amount,
        status,
        error_message
      ) VALUES (
        v_holder.id,
        v_today,
        v_config.daily_gg_coin_reward,
        'failed',
        SQLERRM
      );

      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'totalHolders', v_total_holders,
    'successfulDistributions', v_successful,
    'failedDistributions', v_failed,
    'totalAmountDistributed', v_total_amount,
    'distributionDate', v_today
  );
END;
$$;

-- Function to retry failed distributions
CREATE OR REPLACE FUNCTION retry_failed_hero_rewards()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_failed_reward RECORD;
  v_config RECORD;
  v_successful INTEGER := 0;
  v_failed INTEGER := 0;
  v_total_amount DECIMAL(10,3) := 0;
BEGIN
  -- Get active Hero badge configuration
  SELECT * INTO v_config
  FROM hero_badge_config
  WHERE is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active Hero badge configuration found'
    );
  END IF;

  -- Get failed rewards from today
  FOR v_failed_reward IN
    SELECT hdr.*, hbh.user_id
    FROM hero_daily_rewards hdr
    JOIN hero_badge_holders hbh ON hdr.holder_id = hbh.id
    WHERE hdr.status = 'failed'
    AND hdr.reward_date = CURRENT_DATE
    AND hdr.retry_count < 3
  LOOP
    BEGIN
      -- Create GG coin transaction
      INSERT INTO gg_coin_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        metadata
      ) VALUES (
        v_failed_reward.user_id,
        v_failed_reward.amount,
        'hero_daily_reward',
        'Daily Hero Badge Reward (Retry)',
        jsonb_build_object(
          'badge_holder_id', v_failed_reward.holder_id,
          'retry_attempt', v_failed_reward.retry_count + 1
        )
      );

      -- Update reward record
      UPDATE hero_daily_rewards
      SET
        status = 'completed',
        retry_count = retry_count + 1,
        error_message = NULL,
        updated_at = NOW()
      WHERE id = v_failed_reward.id;

      -- Update holder record
      UPDATE hero_badge_holders
      SET
        last_reward_date = CURRENT_DATE,
        total_rewards_earned = total_rewards_earned + v_failed_reward.amount,
        consecutive_reward_days = consecutive_reward_days + 1,
        updated_at = NOW()
      WHERE id = v_failed_reward.holder_id;

      v_successful := v_successful + 1;
      v_total_amount := v_total_amount + v_failed_reward.amount;
    EXCEPTION WHEN OTHERS THEN
      -- Update retry count
      UPDATE hero_daily_rewards
      SET
        retry_count = retry_count + 1,
        error_message = SQLERRM,
        updated_at = NOW()
      WHERE id = v_failed_reward.id;

      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'successfulRetries', v_successful,
    'failedRetries', v_failed,
    'totalAmountDistributed', v_total_amount
  );
END;
$$;

-- Function to check system health
CREATE OR REPLACE FUNCTION check_hero_reward_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_holders INTEGER;
  v_pending_rewards INTEGER;
  v_failed_today INTEGER;
  v_config_active BOOLEAN;
  v_healthy BOOLEAN := true;
  v_issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check if configuration is active
  SELECT is_active INTO v_config_active
  FROM hero_badge_config
  WHERE is_active = true
  LIMIT 1;

  IF NOT FOUND OR NOT v_config_active THEN
    v_healthy := false;
    v_issues := array_append(v_issues, 'Hero badge configuration is not active');
  END IF;

  -- Count active holders
  SELECT COUNT(*) INTO v_active_holders
  FROM hero_badge_holders
  WHERE status = 'active';

  -- Count pending rewards (holders who haven't received today's reward)
  SELECT COUNT(*) INTO v_pending_rewards
  FROM hero_badge_holders
  WHERE status = 'active'
  AND (last_reward_date IS NULL OR last_reward_date < CURRENT_DATE);

  -- Count failed distributions today
  SELECT COUNT(*) INTO v_failed_today
  FROM hero_daily_rewards
  WHERE reward_date = CURRENT_DATE
  AND status = 'failed';

  -- Check for issues
  IF v_failed_today > 0 THEN
    v_issues := array_append(v_issues, format('%s failed distributions today', v_failed_today));
  END IF;

  IF v_pending_rewards > v_active_holders * 0.1 THEN
    v_healthy := false;
    v_issues := array_append(v_issues, format('%s holders have pending rewards', v_pending_rewards));
  END IF;

  RETURN jsonb_build_object(
    'healthy', v_healthy,
    'activeHolders', v_active_holders,
    'pendingRewards', v_pending_rewards,
    'failedToday', v_failed_today,
    'issues', v_issues,
    'checkedAt', NOW()
  );
END;
$$;
```

## Environment Variables

Add these to your `.env` file:

```bash
# Cron secret for authentication
CRON_SECRET=your-secure-random-secret

# Notification webhook (optional)
HERO_REWARD_NOTIFICATION_WEBHOOK=https://your-webhook-url.com/notify
```

## Monitoring and Alerts

### Set up monitoring for:

1. **Distribution Success Rate**
   - Alert if success rate < 95%
   - Check daily distribution logs

2. **Failed Distributions**
   - Alert if failed count > 5
   - Monitor retry success rate

3. **System Health**
   - Alert if health check fails
   - Monitor pending rewards count

4. **Performance**
   - Track distribution processing time
   - Monitor database query performance

### Recommended Monitoring Tools:

- **Supabase Dashboard** - Built-in monitoring
- **Sentry** - Error tracking
- **Datadog** - Full observability
- **PagerDuty** - Incident management

## Testing

### Manual Testing:

```bash
# Test daily distribution
curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-daily" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test retry
curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-retry" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test health check
curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-health" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Dry Run Mode:

Add a query parameter for testing:

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/hero-rewards-daily?dryRun=true" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Troubleshooting

### Common Issues:

1. **Distributions not running**
   - Check cron job configuration
   - Verify authentication token
   - Check Supabase function logs

2. **Failed distributions**
   - Check database connection
   - Verify GG coin transaction creation
   - Review error logs in hero_daily_rewards table

3. **Performance issues**
   - Add database indexes
   - Optimize batch processing
   - Consider pagination for large holder counts

## Next Steps

1. Deploy Supabase Edge Functions
2. Set up external cron service
3. Configure monitoring and alerts
4. Test with dry run mode
5. Enable production cron jobs
6. Monitor first few distributions closely

## Support

For issues or questions:
- Check Supabase function logs
- Review database error logs
- Contact platform administrators
