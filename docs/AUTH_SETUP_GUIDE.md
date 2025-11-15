# Authentication Setup Guide

## Current Status
✅ Build is successful  
✅ Registration creates auth users  
✅ Email confirmation UI added  
⚠️ Database trigger not applied yet  
⚠️ Login fails because user records don't exist in `users` table  

## The Problem
When you register, Supabase creates an auth user, but the `users` table record isn't created because the database trigger doesn't exist yet. Without this record, login fails even after email confirmation.

## Solution: Apply the Database Migration

### Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://wobpryllvdjaapzjbsxx.supabase.co
2. Log in to your Supabase account

### Step 2: Open SQL Editor
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** button

### Step 3: Run the Migration
1. Open the file `supabase/migrations/011_fix_user_registration.sql` in your code editor
2. Copy ALL the contents (the entire SQL script)
3. Paste it into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify Success
You should see a success message like:
```
Success. No rows returned
```

This means the trigger was created successfully.

### Step 5: Fix Existing Users (If Any)
If you already created test accounts that can't login, you need to manually create their user records:

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Note the User ID of your test account
3. Go back to **SQL Editor**
4. Run this query (replace `YOUR_USER_ID` and `YOUR_EMAIL` with actual values):

```sql
INSERT INTO public.users (id, email, role, forest_preference)
VALUES (
  'YOUR_USER_ID',
  'YOUR_EMAIL',
  'individual',
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

Example:
```sql
INSERT INTO public.users (id, email, role, forest_preference)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'agesandrew@gmail.com',
  'individual',
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

## Testing After Migration

### Test 1: New Registration
1. Try registering with a NEW email address
2. You should see a "Check Your Email" message
3. Check your email and click the confirmation link
4. Try logging in - it should work!

### Test 2: Existing Account
1. If you already have an account and ran the fix query above
2. Try logging in with your credentials
3. It should work now!

## What the Migration Does

The migration creates a PostgreSQL trigger that:
1. Automatically runs when a new user signs up in Supabase Auth
2. Creates a matching record in the `public.users` table
3. Copies the role and forest_preference from the auth metadata
4. Uses `SECURITY DEFINER` to bypass RLS restrictions

This solves the chicken-and-egg problem where:
- Users can't be created due to RLS policies
- But RLS policies require authenticated users

## Troubleshooting

### "Email not confirmed" error
- Check your email inbox (and spam folder)
- Click the confirmation link
- Try logging in again

### "Invalid login credentials" error
- Double-check your email and password
- Make sure you confirmed your email
- If you're sure the credentials are correct, the user record might be missing (see Step 5 above)

### Still can't login after everything
1. Go to Supabase Dashboard → Authentication → Users
2. Check if your user exists and is confirmed
3. Go to SQL Editor and run:
```sql
SELECT * FROM public.users WHERE email = 'your@email.com';
```
4. If no results, run the INSERT query from Step 5

## Email Confirmation Settings

By default, Supabase requires email confirmation. You can change this in:
1. Supabase Dashboard → Authentication → Settings
2. Look for "Enable email confirmations"
3. For development, you can disable this (not recommended for production)

## Next Steps

After authentication works:
1. Users will see the onboarding chatbot placeholder
2. They can skip it for now and access the dashboard
3. The actual chatbot will be implemented in a future task
