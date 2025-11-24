# Quick Fix: Initialize Journey for Existing Users

## Issue

Users who existed before migration 025 was deployed don't have journey records because the auto-initialization trigger only fires for NEW users created AFTER the migration.

## Error Seen

```
GET .../user_journey_progress?...user_id=eq.15a50772... 406 (Not Acceptable)
{code: 'PGRST116', details: 'The result contains 0 rows', ...}
```

## Solution

Run migration 026 to create journey records for all existing users.

## Deployment Steps

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx
   - Navigate to **SQL Editor**

2. **Run Migration 026**
   - Copy contents of `supabase/migrations/026_initialize_existing_users_journey.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify**
   - The query will show how many users now have journey records
   - `users_without_journey` should be 0

## Expected Result

```
total_users | users_with_journey | users_without_journey
------------|-------------------|---------------------
     X      |         X         |          0
```

## Test

1. Refresh your application
2. Login with your account (derryace@gmail.com)
3. Click "Start my journey"
4. Should work without errors now!

## Why This Happened

- Migration 025 created the trigger for NEW users
- But existing users (created before the migration) don't trigger it
- This migration backfills journey records for those existing users

## Future Users

All users created AFTER migration 025 will automatically get journey records via the trigger. This migration is a one-time fix for existing users.
