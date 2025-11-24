# Google OAuth Database Error Fix - Summary

## Problem Identified
Users attempting to sign in with Google OAuth were encountering:
```
error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

This error occurred **during the OAuth signup process** in Supabase, before users were even redirected back to the application.

## Root Cause
The database trigger `handle_new_user()` was failing because:
1. OAuth users don't provide `role` or `forest_preference` in their metadata during initial signup
2. The trigger was trying to insert these values, causing a database error
3. This failure prevented the entire OAuth authentication flow from completing

## Solution Implemented

### 1. Database Migration (023_fix_oauth_trigger_for_google.sql)
- Updated the `handle_new_user()` trigger function
- Added default value handling for OAuth users
- Implemented error handling to prevent auth failures
- OAuth users now get `role='individual'` by default
- `forest_preference` can be null and set later during onboarding

### 2. Enhanced ensureUserProfile() Method
Updated `src/services/auth.service.ts`:
- Added fallback logic to manually create user records if trigger fails
- Improved metadata extraction from Google OAuth response
- Better handling of `full_name` and `avatar_url` from various OAuth metadata fields
- Enhanced retry logic for race conditions
- More robust error handling

### 3. Improved OAuth Callback Handler
Updated `src/pages/AuthCallbackPage.tsx`:
- Added detection of OAuth errors in URL parameters
- Better error messages for users
- Graceful handling of profile creation failures
- Users can proceed to dashboard even if profile creation has issues

## Changes Made

### Files Modified:
1. `src/services/auth.service.ts` - Enhanced `ensureUserProfile()` method
2. `src/pages/AuthCallbackPage.tsx` - Improved error handling

### Files Created:
1. `supabase/migrations/023_fix_oauth_trigger_for_google.sql` - Database fix
2. `supabase/migrations/DEPLOY_023_GUIDE.md` - Deployment instructions
3. `docs/OAUTH_FIX_SUMMARY.md` - This summary

## Deployment Required

⚠️ **IMPORTANT**: You need to apply BOTH database migrations to fix the issue:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Run SQL directly in Supabase SQL Editor
# Copy and paste the contents of:
# 1. supabase/migrations/023_fix_oauth_trigger_for_google.sql
# 2. supabase/migrations/024_fix_oauth_gamification_init.sql
```

**Migration 023**: Fixes the trigger to handle OAuth users without role/forest_preference
**Migration 024**: Initializes user_gamification record to prevent RLS policy violations

## Testing Steps

After deploying the migration:

1. **Test New User Signup**
   - Click "Sign in with Google"
   - Complete Google OAuth consent
   - Verify successful redirect to dashboard
   - Check that user record exists in `users` table with `role='individual'`

2. **Test Returning User**
   - Sign out
   - Sign in with Google again
   - Verify successful authentication

3. **Verify Database Records**
   ```sql
   -- Check user was created
   SELECT id, email, role, forest_preference 
   FROM users 
   WHERE email = 'your-test-email@gmail.com';
   
   -- Check profile was created
   SELECT id, full_name, avatar_url 
   FROM user_profiles 
   WHERE id = (SELECT id FROM users WHERE email = 'your-test-email@gmail.com');
   ```

## Expected Behavior After Fix

✅ Google OAuth signup completes successfully
✅ User record created with `role='individual'`
✅ User profile created with name and avatar from Google
✅ User redirected to dashboard
✅ `forest_preference` can be set during onboarding

## Rollback Plan

If issues occur, you can rollback the trigger to the previous version (see DEPLOY_023_GUIDE.md).

## Related Requirements

This fix addresses:
- **Requirement 1.3**: WHEN Google authentication succeeds THEN the system SHALL create or retrieve the user account
- **Requirement 1.5**: WHEN a new user signs in with Google for the first time THEN the system SHALL create a user profile
- **Requirement 2.4**: WHEN a new user authenticates with Google THEN the system SHALL create a record in the users table
- **Requirement 2.5**: WHEN creating a user profile from Google data THEN the system SHALL store the profile information

## Next Steps

1. Deploy the migration to Supabase
2. Test Google OAuth flow
3. Monitor for any errors
4. Complete remaining optional tasks (property tests, unit tests)
