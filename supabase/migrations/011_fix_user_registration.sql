-- ============================================================================
-- Fix User Registration
-- ============================================================================
-- This migration adds a trigger to automatically create user records
-- when new auth users are created, avoiding RLS issues during registration
-- ============================================================================

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own user record" ON users;

-- Create a function to handle new user creation
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

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- User records will now be automatically created when auth users sign up
-- This bypasses RLS issues during the registration process
-- ============================================================================
