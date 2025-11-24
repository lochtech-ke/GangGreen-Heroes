# Google OAuth Fix - Deployment Instructions

## Current Status

✅ **OAuth authentication is working!** Users can successfully authenticate with Google.

❌ **Database setup incomplete** - The database trigger needs to be deployed to properly create user records.

## The Issue

When users sign in with Google OAuth:
1. ✅ Google authentication succeeds
2. ✅ Session is created
3. ❌ User record is not created in the `users` table (trigger not deployed)
4. ❌ Manual creation fails due to RLS policy on `user_badge_progress` table

## The Solution

Deploy the database migration that fixes the trigger to use `SECURITY DEFINER`, which bypasses RLS policies.

## Deployment Options

### Option 1: Using Supabase CLI (Recommended)

```bash
# Windows
scripts\deploy-oauth-fix.bat

# Mac/Linux
chmod +x scripts/deploy-oauth-fix.sh
./scripts/deploy-oauth-fix