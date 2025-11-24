-- ============================================================================
-- Fix OAuth Trigger for Google Authentication
-- ============================================================================
-- This migration fixes the handle_new_user() trigger to properly handle
-- OAuth users who don't have role or forest_preference in their metadata
-- ============================================================================

-- Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with default values for OAuth users
  INSERT INTO public.users (id, email, role, forest_preference)
  VALUES (
    NEW.id,
    NEW.email,
    -- Default to 'individual' if role is not provided (OAuth users)
    COALESCE(NEW.raw_user_meta_data->>'role', 'individual'),
    -- Forest preference can be null for OAuth users, they'll set it later
    NEW.raw_user_meta_data->>'forest_preference'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- OAuth users will now be created with default 'individual' role
-- Forest preference can be set later through profile completion
-- ============================================================================
