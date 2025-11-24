-- Migration: 027_assign_hummingbird_to_existing_users.sql
-- Description: Assign Hummingbird badge to all existing users who don't have badge progression initialized
-- Date: 2025-11-24
-- Requirements: 5.1, 5.2, 5.3, 5.4, 5.5

-- ============================================================================
-- ASSIGN HUMMINGBIRD BADGE TO EXISTING USERS
-- ============================================================================

-- This migration ensures all existing users receive the Hummingbird welcome badge
-- retroactively, allowing them to participate in the badge progression system.

DO $$
DECLARE
  v_hummingbird_badge_id UUID;
  v_users_updated INTEGER := 0;
  v_badges_awarded INTEGER := 0;
BEGIN
  -- Get the Hummingbird badge ID
  SELECT id INTO v_hummingbird_badge_id
  FROM badge_tiers
  WHERE name = 'Hummingbird'
  LIMIT 1;

  IF v_hummingbird_badge_id IS NULL THEN
    RAISE EXCEPTION 'Hummingbird badge not found in badge_tiers table. Please ensure migration 020 has been applied.';
  END IF;

  RAISE NOTICE 'Found Hummingbird badge with ID: %', v_hummingbird_badge_id;

  -- ============================================================================
  -- Step 1: Initialize user_badge_progress for users without badge progression
  -- ============================================================================
  
  INSERT INTO user_badge_progress (
    user_id,
    current_badge_id,
    actions_completed,
    social_posts_created,
    initiatives_joined,
    initiatives_created,
    referrals_made,
    referrals_active,
    social_engagement_score,
    last_updated
  )
  SELECT 
    u.id,
    v_hummingbird_badge_id,
    0,  -- actions_completed
    0,  -- social_posts_created
    0,  -- initiatives_joined
    0,  -- initiatives_created
    0,  -- referrals_made
    0,  -- referrals_active
    0,  -- social_engagement_score
    NOW()
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 
    FROM user_badge_progress ubp 
    WHERE ubp.user_id = u.id
  )
  ON CONFLICT (user_id) DO NOTHING;

  GET DIAGNOSTICS v_users_updated = ROW_COUNT;
  RAISE NOTICE 'Initialized badge progression for % users', v_users_updated;

  -- ============================================================================
  -- Step 2: Award Hummingbird badge to users (set earned_at to registration date)
  -- ============================================================================
  
  INSERT INTO user_earned_badges (
    user_id,
    badge_id,
    earned_at
  )
  SELECT 
    u.id,
    v_hummingbird_badge_id,
    COALESCE(u.created_at, NOW())  -- Use user registration date, fallback to NOW()
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 
    FROM user_earned_badges ueb 
    WHERE ueb.user_id = u.id 
    AND ueb.badge_id = v_hummingbird_badge_id
  )
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  GET DIAGNOSTICS v_badges_awarded = ROW_COUNT;
  RAISE NOTICE 'Awarded Hummingbird badge to % users', v_badges_awarded;

  -- ============================================================================
  -- Step 3: Verification
  -- ============================================================================
  
  -- Log summary
  RAISE NOTICE '=== Migration 027 Summary ===';
  RAISE NOTICE 'Users with badge progression initialized: %', v_users_updated;
  RAISE NOTICE 'Hummingbird badges awarded: %', v_badges_awarded;
  
  -- Verify all users now have badge progression
  DECLARE
    v_total_users INTEGER;
    v_users_with_badges INTEGER;
    v_users_without_badges INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_total_users FROM users;
    
    SELECT COUNT(DISTINCT ubp.user_id) INTO v_users_with_badges
    FROM user_badge_progress ubp;
    
    v_users_without_badges := v_total_users - v_users_with_badges;
    
    RAISE NOTICE 'Total users: %', v_total_users;
    RAISE NOTICE 'Users with badge progression: %', v_users_with_badges;
    RAISE NOTICE 'Users without badge progression: %', v_users_without_badges;
    
    IF v_users_without_badges > 0 THEN
      RAISE WARNING 'Some users still do not have badge progression initialized!';
    ELSE
      RAISE NOTICE 'SUCCESS: All users have badge progression initialized';
    END IF;
  END;

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check badge progression coverage
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT ubp.user_id) as users_with_progression,
  COUNT(DISTINCT ueb.user_id) as users_with_hummingbird,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT ubp.user_id) as users_missing_progression
FROM users u
LEFT JOIN user_badge_progress ubp ON u.id = ubp.user_id
LEFT JOIN user_earned_badges ueb ON u.id = ueb.user_id 
  AND ueb.badge_id = (SELECT id FROM badge_tiers WHERE name = 'Hummingbird' LIMIT 1);

-- ============================================================================
-- ROLLBACK SCRIPT (for safe deployment)
-- ============================================================================

-- To rollback this migration, run the following SQL:
/*

DO $$
DECLARE
  v_hummingbird_badge_id UUID;
BEGIN
  -- Get the Hummingbird badge ID
  SELECT id INTO v_hummingbird_badge_id
  FROM badge_tiers
  WHERE name = 'Hummingbird'
  LIMIT 1;

  -- Remove Hummingbird badges awarded by this migration
  -- (Keep badges for users who earned them through normal registration)
  DELETE FROM user_earned_badges
  WHERE badge_id = v_hummingbird_badge_id
  AND user_id IN (
    SELECT u.id 
    FROM users u
    WHERE u.created_at < '2025-11-24'  -- Adjust this date to migration date
  );

  -- Remove badge progression for users who didn't have it before
  -- (This is more complex - only remove if you're certain)
  -- DELETE FROM user_badge_progress
  -- WHERE user_id IN (
  --   SELECT u.id 
  --   FROM users u
  --   WHERE u.created_at < '2025-11-24'  -- Adjust this date to migration date
  -- );

  RAISE NOTICE 'Rollback completed';
END $$;

*/

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_badge_progress IS 'Tracks user progress toward next badge tier. Migration 027 ensures all existing users have Hummingbird badge.';
COMMENT ON TABLE user_earned_badges IS 'History of all badges earned by users. Migration 027 retroactively awards Hummingbird to existing users.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 027 completed successfully';
  RAISE NOTICE 'All existing users now have Hummingbird badge';
  RAISE NOTICE '========================================';
END $$;
