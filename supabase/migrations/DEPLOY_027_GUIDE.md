# Migration 027 Deployment Guide

## Overview
This migration assigns the Hummingbird welcome badge to all existing users who don't have badge progression initialized, ensuring they can participate in the badge progression system.

## Prerequisites
- Migration 020 (Track 3 badge system) must be deployed
- Migration 008 (user_gamification table) must be deployed
- Supabase CLI installed and configured
- Database backup completed

## What This Migration Does

### 1. Initializes Badge Progression
- Identifies users without entries in `user_badge_progress`
- Creates badge progression records with Hummingbird as current badge
- Initializes all progress counters to 0

### 2. Awards Hummingbird Badge
- Identifies users without Hummingbird badge in `user_earned_badges`
- Awards Hummingbird badge with `earned_at` set to user registration date
- Ensures no duplicate badge awards

### 3. Verification
- Counts users with badge progression
- Counts users with Hummingbird badge
- Reports any users still missing badge progression

## Pre-Deployment Checklist

- [ ] Verify migration 020 is deployed (badge_tiers table exists)
- [ ] Verify Hummingbird badge exists in badge_tiers table
- [ ] Create database backup
- [ ] Test migration on development/staging environment
- [ ] Review rollback script
- [ ] Notify users about new badge system (optional)

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Navigate to project root
cd /path/to/ganggreen-platform

# 2. Verify connection to Supabase
supabase db remote status

# 3. Apply the migration
supabase db push

# 4. Verify migration was applied
supabase db remote commit list
```

### Option 2: Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `027_assign_hummingbird_to_existing_users.sql`
3. Paste into SQL Editor
4. Click "Run" to execute
5. Review the output messages for success/warnings

### Option 3: Using psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/027_assign_hummingbird_to_existing_users.sql

# Exit
\q
```

## Post-Deployment Verification

### 1. Check Migration Output
Look for these success messages in the output:
```
NOTICE:  Found Hummingbird badge with ID: [UUID]
NOTICE:  Initialized badge progression for [N] users
NOTICE:  Awarded Hummingbird badge to [N] users
NOTICE:  SUCCESS: All users have badge progression initialized
```

### 2. Run Verification Queries

```sql
-- Check badge progression coverage
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT ubp.user_id) as users_with_progression,
  COUNT(DISTINCT ueb.user_id) as users_with_hummingbird,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT ubp.user_id) as users_missing_progression
FROM users u
LEFT JOIN user_badge_progress ubp ON u.id = ubp.user_id
LEFT JOIN user_earned_badges ueb ON u.id = ueb.user_id 
  AND ueb.badge_id = (SELECT id FROM badge_tiers WHERE name = 'Hummingbird' LIMIT 1);
```

Expected result:
- `users_missing_progression` should be 0
- `users_with_progression` should equal `total_users`
- `users_with_hummingbird` should equal `total_users`

### 3. Test User Experience

1. Log in as an existing user
2. Navigate to the Badges page
3. Verify Hummingbird badge is displayed as earned
4. Check that badge progression shows correctly
5. Verify welcome modal appears (if implemented)

## Rollback Procedure

If you need to rollback this migration:

```sql
DO $$
DECLARE
  v_hummingbird_badge_id UUID;
BEGIN
  -- Get the Hummingbird badge ID
  SELECT id INTO v_hummingbird_badge_id
  FROM badge_tiers
  WHERE name = 'Hummingbird'
  LIMIT 1;

  -- Remove Hummingbird badges awarded by this migration
  DELETE FROM user_earned_badges
  WHERE badge_id = v_hummingbird_badge_id
  AND user_id IN (
    SELECT u.id 
    FROM users u
    WHERE u.created_at < '2025-11-24'  -- Adjust to migration date
  );

  RAISE NOTICE 'Rollback completed';
END $$;
```

**Warning:** Only rollback if absolutely necessary. Users may have already seen their Hummingbird badge.

## Troubleshooting

### Issue: "Hummingbird badge not found"
**Solution:** Ensure migration 020 has been applied. Run:
```sql
SELECT * FROM badge_tiers WHERE name = 'Hummingbird';
```

### Issue: "Some users still do not have badge progression"
**Solution:** Check for users with NULL IDs or other data issues:
```sql
SELECT u.id, u.email, u.created_at
FROM users u
LEFT JOIN user_badge_progress ubp ON u.id = ubp.user_id
WHERE ubp.user_id IS NULL;
```

### Issue: Duplicate key violations
**Solution:** This is expected and handled by `ON CONFLICT DO NOTHING`. The migration is idempotent.

## Performance Considerations

- **Execution Time:** Approximately 1-5 seconds per 1000 users
- **Database Load:** Low to moderate (mostly INSERT operations)
- **Downtime:** None required (migration can run while app is live)
- **Locking:** Minimal row-level locks during INSERT operations

## Expected Impact

### Database Changes
- New rows in `user_badge_progress` (one per existing user without progression)
- New rows in `user_earned_badges` (one per existing user without Hummingbird)

### User Experience
- Existing users will see Hummingbird badge in their profile
- Welcome modal may appear on next login (if implemented)
- Badge progression tracking becomes available

## Monitoring

After deployment, monitor:
- User login success rates
- Badge page load times
- Database query performance
- User feedback about new badge system

## Support

If issues arise:
1. Check Supabase logs for errors
2. Review verification query results
3. Test with a single user account first
4. Contact development team if problems persist

## Related Documentation

- [Requirements Document](.kiro/specs/hummingbird-ui-integration/requirements.md)
- [Design Document](.kiro/specs/hummingbird-ui-integration/design.md)
- [Migration 020 - Badge System](./020_add_track3_badge_system.sql)
- [Badge Progression Service](../../src/services/badgeProgression.service.ts)

## Changelog

- **2025-11-24:** Initial migration created
- Assigns Hummingbird badge to all existing users
- Initializes badge progression tracking
- Sets earned_at to user registration date
