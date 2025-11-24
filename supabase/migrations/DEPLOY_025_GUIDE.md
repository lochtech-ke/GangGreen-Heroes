# Migration 025: Fix Journey Progress Table Reference

## Overview

This migration fixes a critical issue in the `user_journey_progress` table created by migration 017. The original migration incorrectly referenced `auth.users(id)` instead of `users(id)`, causing foreign key constraint issues. This migration drops and recreates the table with the correct reference.

## What This Migration Does

1. **Drops existing table**: Removes the incorrectly configured `user_journey_progress` table
2. **Recreates table**: Creates the table with correct foreign key reference to `users(id)`
3. **Adds indexes**: Creates performance indexes for common query patterns
4. **Implements triggers**: Sets up automatic timestamp updates
5. **Configures RLS**: Establishes Row Level Security policies for data protection
6. **Auto-initialization**: Adds trigger to automatically create journey records for new users

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Database connection configured
- Admin access to Supabase project
- **Warning**: This migration will drop existing journey progress data if any exists

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd /path/to/ganggreen-platform

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `025_fix_journey_progress_table_reference.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 3: Using PowerShell Script

```powershell
# Run the deployment script
.\supabase\deploy-025.ps1
```

## Verification Queries

After deployment, run these queries to verify the migration was successful:

### 1. Verify Table Exists

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_journey_progress';
```

**Expected Result**: One row with `user_journey_progress`

### 2. Verify Columns and Types

```sql
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_journey_progress'
ORDER BY ordinal_position;
```

**Expected Columns**:
- `id` (uuid)
- `user_id` (uuid, NOT NULL)
- `current_stage` (character varying, NOT NULL, default 'awareness')
- `stage_progress` (jsonb, NOT NULL)
- `completed_milestones` (ARRAY, default '{}')
- `joined_causes` (ARRAY, default '{}')
- `total_points` (integer, default 0)
- `trees_planted` (integer, default 0)
- `challenges_completed` (integer, default 0)
- `referral_count` (integer, default 0)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### 3. Verify Foreign Key Reference

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_journey_progress';
```

**Expected Result**: Foreign key from `user_id` to `users(id)`

### 4. Verify Indexes

```sql
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'user_journey_progress'
ORDER BY indexname;
```

**Expected Indexes**:
- `idx_journey_user_id`
- `idx_journey_current_stage`
- `idx_journey_user_stage`
- `idx_journey_updated_at`
- `unique_user_journey` (unique constraint)

### 5. Verify RLS is Enabled

```sql
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_journey_progress';
```

**Expected Result**: `rowsecurity` should be `true`

### 6. Verify RLS Policies

```sql
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_journey_progress'
ORDER BY policyname;
```

**Expected Policies**:
- `Users can view own journey progress` (SELECT)
- `Users can update own journey progress` (UPDATE)
- `Users can insert own journey progress` (INSERT)
- `Service role has full access` (ALL)

### 7. Verify Triggers

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_journey_progress'
   OR event_object_table = 'users'
   AND trigger_name LIKE '%journey%'
ORDER BY trigger_name;
```

**Expected Triggers**:
- `journey_updated_at_trigger` on `user_journey_progress`
- `trigger_initialize_user_journey` on `users`

### 8. Test Journey Initialization

```sql
-- This should automatically create a journey record for the test user
INSERT INTO users (id, email, role)
VALUES (gen_random_uuid(), 'test@example.com', 'individual')
RETURNING id;

-- Check if journey was auto-created (use the returned id)
SELECT * FROM user_journey_progress 
WHERE user_id = '<insert-id-from-above>';

-- Clean up test data
DELETE FROM users WHERE email = 'test@example.com';
```

**Expected Result**: Journey record should be automatically created with `current_stage = 'awareness'`

## Testing the Journey Feature

After deployment, test the journey feature in the application:

1. **Login** to the Gang Green platform
2. **Navigate** to the Journey Dashboard page
3. **Click** "Start my journey" button
4. **Verify** that:
   - No 404 errors occur
   - Journey progress loads successfully
   - Current stage shows as "Awareness"
   - Stage progress displays correctly

## Rollback Procedure

If you need to rollback this migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS journey_updated_at_trigger ON user_journey_progress;
DROP TRIGGER IF EXISTS trigger_initialize_user_journey ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_journey_updated_at();
DROP FUNCTION IF EXISTS initialize_user_journey();

-- Drop table
DROP TABLE IF EXISTS user_journey_progress CASCADE;
```

**Note**: Rollback will delete all journey progress data. Ensure you have a backup if needed.

## Troubleshooting

### Issue: Foreign Key Constraint Error

**Error**: `ERROR: insert or update on table "user_journey_progress" violates foreign key constraint`

**Solution**: Ensure the `users` table exists and the user_id being inserted exists in the `users` table.

### Issue: RLS Policy Prevents Access

**Error**: `new row violates row-level security policy`

**Solution**: Verify that `auth.uid()` matches the `user_id` being inserted/updated. Check that the user is properly authenticated.

### Issue: Trigger Not Firing

**Error**: Journey not auto-created for new users

**Solution**: 
1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_initialize_user_journey';`
2. Check trigger function: `SELECT prosrc FROM pg_proc WHERE proname = 'initialize_user_journey';`
3. Ensure trigger is on `users` table, not `auth.users`

### Issue: Migration Already Applied

**Error**: `relation "user_journey_progress" already exists`

**Solution**: The migration includes `DROP TABLE IF EXISTS` so this shouldn't occur. If it does, manually drop the table first:

```sql
DROP TABLE IF EXISTS user_journey_progress CASCADE;
```

Then re-run the migration.

## Post-Deployment Tasks

1. **Monitor logs** for any journey-related errors
2. **Test journey feature** with multiple user accounts
3. **Verify analytics** queries work correctly
4. **Update documentation** if needed
5. **Mark task 1.1** in `.kiro/specs/individual-user-journey/tasks.md` as complete

## Related Files

- Migration: `supabase/migrations/025_fix_journey_progress_table_reference.sql`
- Journey Service: `src/services/journey.service.ts`
- Journey Context: `src/contexts/JourneyContext.tsx`
- Journey Types: `src/types/journey.types.ts`
- Original Migration: `supabase/migrations/017_add_individual_user_journey_tables.sql`

## Notes

- This migration fixes the issue from migration 017 which incorrectly referenced `auth.users` instead of `users`
- The Gang Green platform uses a custom `users` table that extends Supabase's `auth.users`
- All journey data will be lost when this migration runs (if any exists from migration 017)
- Future users will have journey records automatically created on registration

## Support

If you encounter issues during deployment:
1. Check Supabase logs in the dashboard
2. Review the verification queries above
3. Consult the troubleshooting section
4. Contact the development team with error details
