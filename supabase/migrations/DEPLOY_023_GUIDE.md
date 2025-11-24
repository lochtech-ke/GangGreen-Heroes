# Migration 023: Fix OAuth Trigger for Google Authentication

## Overview
This migration fixes the `handle_new_user()` database trigger to properly handle OAuth users (specifically Google OAuth) who don't have `role` or `forest_preference` in their metadata during signup.

## Problem
When users sign up via Google OAuth, Supabase was returning "Database error saving new user" because:
1. The trigger expected `role` and `forest_preference` in user metadata
2. OAuth users don't provide these values during initial signup
3. The trigger was failing, causing the entire OAuth flow to fail

## Solution
- Updated the trigger to use default values for OAuth users
- Added error handling to prevent auth failures
- OAuth users now get `role='individual'` by default
- `forest_preference` can be null and set later during onboarding

## Deployment Steps

### 1. Apply Migration to Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- Run the migration
\i supabase/migrations/023_fix_oauth_trigger_for_google.sql
```

Or apply via Supabase CLI:

```bash
supabase db push
```

### 2. Verify Trigger

Check that the trigger is working:

```sql
-- Check trigger exists
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### 3. Test OAuth Flow

1. Try signing up with Google OAuth
2. Check that user record is created in `users` table
3. Verify `role` is set to 'individual'
4. Verify `forest_preference` is null (will be set during onboarding)

### 4. Monitor Logs

Watch for any warnings in Supabase logs:
```sql
-- Check for trigger warnings
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%handle_new_user%';
```

## Rollback

If you need to rollback:

```sql
-- Restore previous trigger version
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Impact
- ✅ OAuth users can now sign up successfully
- ✅ Default role is 'individual' for OAuth users
- ✅ Forest preference can be set during onboarding
- ✅ No breaking changes to existing functionality

## Related Files
- `supabase/migrations/023_fix_oauth_trigger_for_google.sql`
- `src/services/auth.service.ts` (ensureUserProfile method)
- `src/pages/AuthCallbackPage.tsx` (OAuth callback handler)
