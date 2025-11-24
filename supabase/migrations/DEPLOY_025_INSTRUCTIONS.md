# Quick Deployment Instructions for Migration 025

## Option 1: Supabase Dashboard (Recommended for Remote Instance)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx
   - Navigate to **SQL Editor**

2. **Run the Migration**
   - Click **New Query**
   - Copy the entire contents of `supabase/migrations/025_fix_journey_progress_table_reference.sql`
   - Paste into the SQL editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Check for any error messages

## Option 2: Using Supabase CLI (If Linked)

```bash
# Make sure you're in the project root
cd /path/to/ganggreen-platform

# Link to your project (if not already linked)
npx supabase link --project-ref wobpryllvdjaapzjbsxx

# Push the migration
npx supabase db push
```

## What This Migration Does

- Drops the existing `user_journey_progress` table (if it exists)
- Recreates it with the correct foreign key reference to `users(id)` instead of `auth.users(id)`
- Adds all necessary indexes, triggers, and RLS policies
- Sets up auto-initialization for new users

## After Deployment

Run the verification queries from `DEPLOY_025_GUIDE.md` to confirm everything is working correctly.

## Need Help?

If you encounter any errors, check the troubleshooting section in `DEPLOY_025_GUIDE.md`.
