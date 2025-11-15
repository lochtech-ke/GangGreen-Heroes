# Registration Fix

## Problem
User registration was hanging because of Row Level Security (RLS) policies. The `users` table had RLS enabled but no INSERT policy, preventing new users from being created during signup.

## Solution
Created a database trigger that automatically creates user records when new auth users sign up. This bypasses the RLS issue by using `SECURITY DEFINER` which runs with elevated privileges.

## Migration Applied
- **File**: `supabase/migrations/011_fix_user_registration.sql`
- **Changes**:
  - Added `handle_new_user()` function
  - Added trigger on `auth.users` table
  - Automatically creates user record with role and forest preference from metadata

## Code Changes
- **File**: `src/services/auth.service.ts`
  - Removed manual user record insertion (now handled by trigger)
  - Simplified registration flow

- **File**: `src/components/auth/RegisterForm.tsx`
  - Improved error handling
  - Added `finally` block to ensure loading state is reset

## To Apply This Fix

### Option 1: Supabase CLI (Recommended)
```bash
supabase db push
```

### Option 2: Supabase Dashboard
1. Go to your Supabase project: https://wobpryllvdjaapzjbsxx.supabase.co
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/011_fix_user_registration.sql`
4. Paste and execute

### Option 3: Direct SQL
Run the SQL from the migration file directly in your PostgreSQL database.

## Testing
After applying the migration:
1. Try registering a new user with email and password
2. The registration should complete successfully
3. User should be redirected or see success message
4. Check that user record exists in both `auth.users` and `public.users` tables

## Notes
- The trigger uses `SECURITY DEFINER` to bypass RLS during user creation
- User metadata (role, forest_preference) is stored in auth.users and copied to public.users
- Profile creation is still handled separately (via onboarding chatbot)
