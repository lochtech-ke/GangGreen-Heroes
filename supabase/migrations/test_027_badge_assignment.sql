-- Test Script for Migration 027: Hummingbird Badge Assignment
-- This script tests the badge assignment migration in a safe way

-- ============================================================================
-- TEST SETUP
-- ============================================================================

DO $$
DECLARE
  v_test_user_id_1 UUID;
  v_test_user_id_2 UUID;
  v_test_user_id_3 UUID;
  v_hummingbird_badge_id UUID;
  v_test_passed BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting Migration 027 Test Suite';
  RAISE NOTICE '========================================';

  -- Get Hummingbird badge ID
  SELECT id INTO v_hummingbird_badge_id
  FROM badge_tiers
  WHERE name = 'Hummingbird'
  LIMIT 1;

  IF v_hummingbird_badge_id IS NULL THEN
    RAISE EXCEPTION 'TEST FAILED: Hummingbird badge not found. Ensure migration 020 is applied.';
  END IF;

  RAISE NOTICE 'Hummingbird badge ID: %', v_hummingbird_badge_id;

  -- ============================================================================
  -- TEST 1: Create test users without badge progression
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 1: Creating test users without badge progression';
  
  -- Create test user 1 (no badge progression)
  INSERT INTO users (id, email, created_at)
  VALUES (
    gen_random_uuid(),
    'test_user_027_1@example.com',
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_test_user_id_1;
  
  -- Create test user 2 (no badge progression)
  INSERT INTO users (id, email, created_at)
  VALUES (
    gen_random_uuid(),
    'test_user_027_2@example.com',
    NOW() - INTERVAL '60 days'
  )
  RETURNING id INTO v_test_user_id_2;
  
  -- Create test user 3 (already has badge progression - should be skipped)
  INSERT INTO users (id, email, created_at)
  VALUES (
    gen_random_uuid(),
    'test_user_027_3@example.com',
    NOW() - INTERVAL '90 days'
  )
  RETURNING id INTO v_test_user_id_3;
  
  -- Give user 3 existing badge progression
  INSERT INTO user_badge_progress (user_id, current_badge_id)
  VALUES (v_test_user_id_3, v_hummingbird_badge_id);
  
  INSERT INTO user_earned_badges (user_id, badge_id, earned_at)
  VALUES (v_test_user_id_3, v_hummingbird_badge_id, NOW() - INTERVAL '90 days');
  
  RAISE NOTICE 'Created test users:';
  RAISE NOTICE '  User 1 (no progression): %', v_test_user_id_1;
  RAISE NOTICE '  User 2 (no progression): %', v_test_user_id_2;
  RAISE NOTICE '  User 3 (has progression): %', v_test_user_id_3;

  -- ============================================================================
  -- TEST 2: Run badge assignment logic (simulating migration)
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 2: Running badge assignment logic';
  
  -- Initialize badge progression for users without it
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
    0, 0, 0, 0, 0, 0, 0,
    NOW()
  FROM users u
  WHERE u.id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3)
  AND NOT EXISTS (
    SELECT 1 FROM user_badge_progress ubp WHERE ubp.user_id = u.id
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Award Hummingbird badges
  INSERT INTO user_earned_badges (user_id, badge_id, earned_at)
  SELECT 
    u.id,
    v_hummingbird_badge_id,
    COALESCE(u.created_at, NOW())
  FROM users u
  WHERE u.id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3)
  AND NOT EXISTS (
    SELECT 1 FROM user_earned_badges ueb 
    WHERE ueb.user_id = u.id AND ueb.badge_id = v_hummingbird_badge_id
  )
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RAISE NOTICE 'Badge assignment logic executed';

  -- ============================================================================
  -- TEST 3: Verify badge progression was created
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 3: Verifying badge progression';
  
  -- Check user 1
  IF NOT EXISTS (
    SELECT 1 FROM user_badge_progress 
    WHERE user_id = v_test_user_id_1 
    AND current_badge_id = v_hummingbird_badge_id
  ) THEN
    RAISE WARNING 'TEST FAILED: User 1 does not have badge progression';
    v_test_passed := FALSE;
  ELSE
    RAISE NOTICE '✓ User 1 has badge progression';
  END IF;
  
  -- Check user 2
  IF NOT EXISTS (
    SELECT 1 FROM user_badge_progress 
    WHERE user_id = v_test_user_id_2 
    AND current_badge_id = v_hummingbird_badge_id
  ) THEN
    RAISE WARNING 'TEST FAILED: User 2 does not have badge progression';
    v_test_passed := FALSE;
  ELSE
    RAISE NOTICE '✓ User 2 has badge progression';
  END IF;
  
  -- Check user 3 (should still have progression)
  IF NOT EXISTS (
    SELECT 1 FROM user_badge_progress 
    WHERE user_id = v_test_user_id_3 
    AND current_badge_id = v_hummingbird_badge_id
  ) THEN
    RAISE WARNING 'TEST FAILED: User 3 lost badge progression';
    v_test_passed := FALSE;
  ELSE
    RAISE NOTICE '✓ User 3 still has badge progression';
  END IF;

  -- ============================================================================
  -- TEST 4: Verify badges were awarded
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 4: Verifying badge awards';
  
  -- Check user 1
  IF NOT EXISTS (
    SELECT 1 FROM user_earned_badges 
    WHERE user_id = v_test_user_id_1 
    AND badge_id = v_hummingbird_badge_id
  ) THEN
    RAISE WARNING 'TEST FAILED: User 1 did not receive Hummingbird badge';
    v_test_passed := FALSE;
  ELSE
    RAISE NOTICE '✓ User 1 received Hummingbird badge';
  END IF;
  
  -- Check user 2
  IF NOT EXISTS (
    SELECT 1 FROM user_earned_badges 
    WHERE user_id = v_test_user_id_2 
    AND badge_id = v_hummingbird_badge_id
  ) THEN
    RAISE WARNING 'TEST FAILED: User 2 did not receive Hummingbird badge';
    v_test_passed := FALSE;
  ELSE
    RAISE NOTICE '✓ User 2 received Hummingbird badge';
  END IF;
  
  -- Check user 3 (should still have badge)
  IF NOT EXISTS (
    SELECT 1 FROM user_earned_badges 
    WHERE user_id = v_test_user_id_3 
    AND badge_id = v_hummingbird_badge_id
  ) THEN
    RAISE WARNING 'TEST FAILED: User 3 lost Hummingbird badge';
    v_test_passed := FALSE;
  ELSE
    RAISE NOTICE '✓ User 3 still has Hummingbird badge';
  END IF;

  -- ============================================================================
  -- TEST 5: Verify earned_at dates match registration dates
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 5: Verifying earned_at dates';
  
  DECLARE
    v_user_created_at TIMESTAMPTZ;
    v_badge_earned_at TIMESTAMPTZ;
  BEGIN
    -- Check user 1
    SELECT u.created_at, ueb.earned_at 
    INTO v_user_created_at, v_badge_earned_at
    FROM users u
    JOIN user_earned_badges ueb ON u.id = ueb.user_id
    WHERE u.id = v_test_user_id_1
    AND ueb.badge_id = v_hummingbird_badge_id;
    
    IF v_user_created_at::DATE != v_badge_earned_at::DATE THEN
      RAISE WARNING 'TEST FAILED: User 1 earned_at (%) does not match created_at (%)', 
        v_badge_earned_at, v_user_created_at;
      v_test_passed := FALSE;
    ELSE
      RAISE NOTICE '✓ User 1 earned_at matches registration date';
    END IF;
    
    -- Check user 2
    SELECT u.created_at, ueb.earned_at 
    INTO v_user_created_at, v_badge_earned_at
    FROM users u
    JOIN user_earned_badges ueb ON u.id = ueb.user_id
    WHERE u.id = v_test_user_id_2
    AND ueb.badge_id = v_hummingbird_badge_id;
    
    IF v_user_created_at::DATE != v_badge_earned_at::DATE THEN
      RAISE WARNING 'TEST FAILED: User 2 earned_at (%) does not match created_at (%)', 
        v_badge_earned_at, v_user_created_at;
      v_test_passed := FALSE;
    ELSE
      RAISE NOTICE '✓ User 2 earned_at matches registration date';
    END IF;
  END;

  -- ============================================================================
  -- TEST 6: Verify progress data initialization
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 6: Verifying progress data initialization';
  
  DECLARE
    v_progress_record RECORD;
  BEGIN
    SELECT * INTO v_progress_record
    FROM user_badge_progress
    WHERE user_id = v_test_user_id_1;
    
    IF v_progress_record.actions_completed != 0 OR
       v_progress_record.social_posts_created != 0 OR
       v_progress_record.initiatives_joined != 0 OR
       v_progress_record.initiatives_created != 0 OR
       v_progress_record.referrals_made != 0 OR
       v_progress_record.social_engagement_score != 0 THEN
      RAISE WARNING 'TEST FAILED: Progress data not initialized to zero';
      v_test_passed := FALSE;
    ELSE
      RAISE NOTICE '✓ Progress data initialized correctly';
    END IF;
  END;

  -- ============================================================================
  -- TEST 7: Verify idempotency (running migration twice)
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'TEST 7: Testing idempotency';
  
  DECLARE
    v_count_before INTEGER;
    v_count_after INTEGER;
  BEGIN
    -- Count existing records
    SELECT COUNT(*) INTO v_count_before
    FROM user_badge_progress
    WHERE user_id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3);
    
    -- Run assignment logic again
    INSERT INTO user_badge_progress (
      user_id, current_badge_id, actions_completed, social_posts_created,
      initiatives_joined, initiatives_created, referrals_made, 
      referrals_active, social_engagement_score, last_updated
    )
    SELECT u.id, v_hummingbird_badge_id, 0, 0, 0, 0, 0, 0, 0, NOW()
    FROM users u
    WHERE u.id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3)
    AND NOT EXISTS (SELECT 1 FROM user_badge_progress ubp WHERE ubp.user_id = u.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO user_earned_badges (user_id, badge_id, earned_at)
    SELECT u.id, v_hummingbird_badge_id, COALESCE(u.created_at, NOW())
    FROM users u
    WHERE u.id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3)
    AND NOT EXISTS (
      SELECT 1 FROM user_earned_badges ueb 
      WHERE ueb.user_id = u.id AND ueb.badge_id = v_hummingbird_badge_id
    )
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    
    -- Count after second run
    SELECT COUNT(*) INTO v_count_after
    FROM user_badge_progress
    WHERE user_id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3);
    
    IF v_count_before != v_count_after THEN
      RAISE WARNING 'TEST FAILED: Migration is not idempotent (% vs %)', 
        v_count_before, v_count_after;
      v_test_passed := FALSE;
    ELSE
      RAISE NOTICE '✓ Migration is idempotent';
    END IF;
  END;

  -- ============================================================================
  -- CLEANUP
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE 'Cleaning up test data...';
  
  DELETE FROM user_earned_badges 
  WHERE user_id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3);
  
  DELETE FROM user_badge_progress 
  WHERE user_id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3);
  
  DELETE FROM users 
  WHERE id IN (v_test_user_id_1, v_test_user_id_2, v_test_user_id_3);
  
  RAISE NOTICE 'Test data cleaned up';

  -- ============================================================================
  -- TEST RESULTS
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  IF v_test_passed THEN
    RAISE NOTICE 'ALL TESTS PASSED ✓';
    RAISE NOTICE 'Migration 027 is ready for deployment';
  ELSE
    RAISE WARNING 'SOME TESTS FAILED ✗';
    RAISE WARNING 'Review warnings above before deploying';
  END IF;
  RAISE NOTICE '========================================';

END $$;
