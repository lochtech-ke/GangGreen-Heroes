-- ============================================================================
-- Fix OAuth User Gamification Initialization
-- ============================================================================
-- This migration updates the handle_new_user() trigger to also initialize
-- the user_gamification record, preventing RLS policy violations
-- ============================================================================

-- Drop and recreate the trigger function with gamification initialization
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
  
  -- Initialize user_gamification record for the new user
  -- This prevents RLS policy violations when other parts of the system
  -- try to access or create gamification data
  INSERT INTO public.user_gamification (
    id,
    total_points,
    level,
    experience_to_next_level,
    badges_earned,
    achievements_unlocked,
    referrals_count,
    streak_days,
    last_activity_date
  )
  VALUES (
    NEW.id,
    0,      -- total_points
    1,      -- level
    100,    -- experience_to_next_level
    0,      -- badges_earned
    0,      -- achievements_unlocked
    0,      -- referrals_count
    0,      -- streak_days
    CURRENT_DATE  -- last_activity_date
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
-- OAuth users will now have both users and user_gamification records created
-- This prevents RLS policy violations during user creation
-- ============================================================================
