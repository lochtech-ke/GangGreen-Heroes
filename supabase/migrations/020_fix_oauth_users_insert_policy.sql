-- ============================================================================
-- Fix OAuth User Registration - Add INSERT Policy for Users Table
-- ============================================================================
-- This migration adds an INSERT policy to allow OAuth users to create their
-- own user records during the authentication flow
-- ============================================================================

-- Allow users to insert their own user record
-- This is required for OAuth authentication where the user needs to create
-- their record in the custom users table after Supabase creates the auth.users record
CREATE POLICY "Users can insert own user record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Policy Added Successfully
-- ============================================================================
-- OAuth users can now create their own user records during authentication
-- ============================================================================
