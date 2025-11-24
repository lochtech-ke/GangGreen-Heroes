# Migration 020: Track 3 Badge System Deployment Guide

## Overview
This migration adds the complete Track 3 badge progression system with community engagement focus, replacing tree planting metrics with social engagement, initiatives, and referrals.

## What This Migration Does

### New Tables Created
1. **badge_tiers** - Defines the 5-tier badge progression (Hummingbird → Green Hero)
2. **green_hero_variants** - Specialized Green Hero variants (Social Mobilizer, Initiative Leader, Knowledge Sharer)
3. **user_badge_progress** - Tracks user progress toward next badge
4. **user_earned_badges** - History of all badges earned by users
5. **user_earned_variants** - Green Hero variants earned by users
6. **engagement_actions** - Tracks all user engagement actions
7. **feature_flags** - Manages deprecated features (tree planting, carbon credits, marketplace)

### Materialized View
- **user_engagement_summary** - Aggregated engagement metrics for performance

### Functions Created
- `refresh_engagement_summary()` - Refreshes the materialized view
- `is_feature_enabled(feature)` - Checks if a feature is enabled
- `award_hummingbird_badge()` - Automatically awards Hummingbird badge on signup
- `update_updated_at_column()` - Updates timestamp on record changes

### Triggers Created
- Auto-award Hummingbird badge on user creation
- Auto-update `updated_at` timestamps

### Initial Data
- 5 badge tiers (Hummingbird, Community Contributor, Climate Advocate, Environmental Champion, Green Hero)
- 3 Green Hero variants
- 3 feature flags (tree_planting, carbon_credits, marketplace - all disabled)

## Pre-Deployment Checklist

- [ ] Backup your database
- [ ] Verify you're on the correct environment
- [ ] Ensure migration 019 has been applied
- [ ] Review the migration SQL file
- [ ] Test on staging environment first

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Pull latest migrations
supabase db pull

# 2. Apply the migration
supabase db push

# 3. Verify migration was applied
supabase db diff
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `020_add_track3_badge_system.sql`
4. Paste and execute the SQL
5. Verify all tables were created successfully

### Option 3: Using psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/020_add_track3_badge_system.sql

# Verify tables exist
\dt badge_tiers
\dt user_badge_progress
\dt engagement_actions
```

## Post-Deployment Verification

### 1. Verify Tables Created

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'badge_tiers', 
  'green_hero_variants', 
  'user_badge_progress',
  'user_earned_badges',
  'user_earned_variants',
  'engagement_actions',
  'feature_flags'
);
```

Expected: 7 rows

### 2. Verify Badge Tiers Inserted

```sql
SELECT name, tier_order, description 
FROM badge_tiers 
ORDER BY tier_order;
```

Expected: 5 badges (Hummingbird through Green Hero)

### 3. Verify Green Hero Variants

```sql
SELECT name, description 
FROM green_hero_variants;
```

Expected: 3 variants (Social Mobilizer, Initiative Leader, Knowledge Sharer)

### 4. Verify Feature Flags

```sql
SELECT feature_name, is_enabled, alternative_feature 
FROM feature_flags;
```

Expected: 3 flags (all disabled)

### 5. Test Hummingbird Badge Auto-Award

Create a test user and verify they automatically receive the Hummingbird badge:

```sql
-- This should happen automatically via trigger
-- Check if existing users have Hummingbird badge
SELECT u.email, bt.name as badge_name
FROM users u
LEFT JOIN user_badge_progress ubp ON u.id = ubp.user_id
LEFT JOIN badge_tiers bt ON ubp.current_badge_id = bt.id
LIMIT 5;
```

### 6. Verify Materialized View

```sql
-- Check materialized view exists and is populated
SELECT COUNT(*) FROM user_engagement_summary;

-- Test refresh function
SELECT refresh_engagement_summary();
```

### 7. Test Feature Flag Function

```sql
-- Should return false for deprecated features
SELECT is_feature_enabled('tree_planting');
SELECT is_feature_enabled('carbon_credits');
SELECT is_feature_enabled('marketplace');
```

Expected: All should return `false`

## Backfill Existing Users

If you have existing users who don't have the Hummingbird badge, run this backfill:

```sql
-- Backfill Hummingbird badges for existing users
DO $$
DECLARE
  hummingbird_badge_id UUID;
  user_record RECORD;
BEGIN
  -- Get Hummingbird badge ID
  SELECT id INTO hummingbird_badge_id 
  FROM badge_tiers 
  WHERE name = 'Hummingbird';

  -- Award to all users who don't have it
  FOR user_record IN 
    SELECT id FROM users 
    WHERE id NOT IN (SELECT user_id FROM user_badge_progress)
  LOOP
    -- Initialize badge progress
    INSERT INTO user_badge_progress (user_id, current_badge_id)
    VALUES (user_record.id, hummingbird_badge_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Record earned badge
    INSERT INTO user_earned_badges (user_id, badge_id)
    VALUES (user_record.id, hummingbird_badge_id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Backfill complete';
END $$;
```

## Performance Optimization

### Refresh Materialized View Periodically

Set up a cron job or scheduled function to refresh the engagement summary:

```sql
-- Create a scheduled job (if using pg_cron extension)
SELECT cron.schedule(
  'refresh-engagement-summary',
  '*/5 * * * *', -- Every 5 minutes
  'SELECT refresh_engagement_summary();'
);
```

Or manually refresh as needed:

```sql
SELECT refresh_engagement_summary();
```

## Rollback Plan

If you need to rollback this migration:

```sql
-- WARNING: This will delete all Track 3 badge data!

-- Drop triggers first
DROP TRIGGER IF EXISTS award_hummingbird_on_user_creation ON users;
DROP TRIGGER IF EXISTS update_badge_tiers_updated_at ON badge_tiers;
DROP TRIGGER IF EXISTS update_green_hero_variants_updated_at ON green_hero_variants;
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;

-- Drop functions
DROP FUNCTION IF EXISTS award_hummingbird_badge();
DROP FUNCTION IF EXISTS refresh_engagement_summary();
DROP FUNCTION IF EXISTS is_feature_enabled(VARCHAR);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS user_engagement_summary;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS engagement_actions;
DROP TABLE IF EXISTS user_earned_variants;
DROP TABLE IF EXISTS user_earned_badges;
DROP TABLE IF EXISTS user_badge_progress;
DROP TABLE IF EXISTS feature_flags;
DROP TABLE IF EXISTS green_hero_variants;
DROP TABLE IF EXISTS badge_tiers;
```

## Troubleshooting

### Issue: Trigger not firing for new users

**Solution**: Verify the trigger exists and the users table has the correct structure:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'award_hummingbird_on_user_creation';
```

### Issue: Materialized view not updating

**Solution**: Manually refresh the view:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_summary;
```

### Issue: RLS policies blocking access

**Solution**: Check RLS policies are correctly set:

```sql
SELECT * FROM pg_policies WHERE tablename IN (
  'badge_tiers', 'user_badge_progress', 'engagement_actions'
);
```

## Next Steps

After successful deployment:

1. ✅ Implement `BadgeProgressionService` (Task 3)
2. ✅ Implement `CommunityEngagementService` (Task 4)
3. ✅ Implement `FeatureDeprecationService` (Task 5)
4. ✅ Update UI components to use new badge system
5. ✅ Test badge progression flow end-to-end

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review the migration SQL for syntax errors
3. Verify all prerequisites are met
4. Test on a staging environment first

## Migration Metadata

- **Migration Number**: 020
- **Created**: 2025-11-24
- **Dependencies**: Migration 019 (Antugrow integration)
- **Breaking Changes**: None (additive only)
- **Estimated Duration**: 2-5 minutes
- **Rollback Safe**: Yes (with data loss)
