# Migration 024: Fix OAuth Gamification Initialization

## Overview
This migration fixes the RLS policy violation error that occurs when OAuth users sign up. The issue was that the `handle_new_user()` trigger only created the `users` record, but not the `user_gamification` record, causing RLS policy violations when other parts of the system tried to access gamification data.

## Problem
When OAuth users signed up, the error occurred:
```
new row violates row-level security policy for table "user_badge_progress"
```

This happened because:
1. The trigger created a `users` record
2. Other code tried to create/access `user_gamification` record
3. RLS policies blocked the operation because it wasn't using `SECURITY DEFINER`

## Solution
Updated the `handle_new_user()` trigger to:
- Create both `users` AND `user_gamification` records
- Use `SECURITY DEFINER` to bypass RLS policies
- Initialize gamification with default values (level 1, 0 points, etc.)

## Deployment Steps

### 1. Apply Migration to Supabase

Run this SQL in your Supabase SQL Editor:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual SQL execution
# Copy and paste the contents of:
# supabase/migrations/024_fix_oauth_gamification_init.sql
```

### 2. Verify Trigger

Check that the trigger is working:

```sql
-- Check trigger exists
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check function exists and has SECURITY DEFINER
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'handle_new_user';
-- prosecdef should be 't' (true)
```

### 3. Test OAuth Flow

1. Clear any existing test users from database
2. Try signing up with Google OAuth
3. Verify successful authentication
4. Check database records:

```sql
-- Check user was created
SELECT id, email, role, forest_preference 
FROM users 
WHERE email = 'your-test-email@gmail.com';

-- Check gamification was initialized
SELECT id, total_points, level, experience_to_next_level 
FROM user_gamification 
WHERE id = (SELECT id FROM users WHERE email = 'your-test-email@gmail.com');

-- Check profile was created
SELECT id, full_name, avatar_url 
FROM user_profiles 
WHERE id = (SELECT id FROM users WHERE email = 'your-test-email@gmail.com');
```

### 4. Monitor Logs

Watch for any warnings in Supabase logs:
```sql
-- Check for trigger warnings
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%handle_new_user%';
```

## Rollback

If you need to rollback to migration 023:

```sql
-- Restore previous trigger version (without gamification init)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, forest_preference)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'individual'),
    NEW.raw_user_meta_data->>'forest_preference'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Expected Behavior After Fix

✅ OAuth users can sign up successfully
✅ User record created with `role='individual'`
✅ Gamification record initialized with default values
✅ Profile record created with Google data
✅ User redirected to dashboard
✅ No RLS policy violations

## Impact
- ✅ Fixes OAuth signup for all providers (Google, GitHub, etc.)
- ✅ Initializes gamification system for new users
- ✅ No breaking changes to existing functionality
- ✅ Existing users unaffected

## Related Files
- `supabase/migrations/024_fix_oauth_gamification_init.sql`
- `supabase/migrations/023_fix_oauth_trigger_for_google.sql` (previous fix)
- `src/services/auth.service.ts` (ensureUserProfile method)
- `src/pages/AuthCallbackPage.tsx` (OAuth callback handler)
