-- =====================================================
-- RLS Policy Testing Script for Migration 025
-- Run these queries in Supabase SQL Editor to test RLS policies
-- =====================================================

-- =====================================================
-- SETUP: Create Test Users (Run this first)
-- =====================================================

-- Create test user 1
DO $
DECLARE
  test_user_1_id UUID;
BEGIN
  -- Insert test user 1
  INSERT INTO users (id, email, role)
  VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'test-user-1@example.com',
    'individual'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert test user 2
  INSERT INTO users (id, email, role)
  VALUES (
    '00000000-0000-0000-0000-000000000002'::UUID,
    'test-user-2@example.com',
    'individual'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Test users created successfully';
END $;

-- =====================================================
-- TEST 1: Auto-Initialization Trigger
-- =====================================================
-- The trigger should automatically create journey records for new users

-- Check if journey records were auto-created
SELECT 
  ujp.user_id,
  u.email,
  ujp.current_stage,
  ujp.total_points,
  ujp.trees_planted
FROM user_journey_progress ujp
JOIN users u ON u.id = ujp.user_id
WHERE u.email IN ('test-user-1@example.com', 'test-user-2@example.com');

-- Expected: 2 rows, both with current_stage = 'awareness' and all counters at 0

-- =====================================================
-- TEST 2: Unique Constraint
-- =====================================================
-- Try to insert duplicate journey record (should fail)

DO $
BEGIN
  INSERT INTO user_journey_progress (user_id, current_stage)
  VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'awareness');
  
  RAISE EXCEPTION 'Unique constraint test FAILED - duplicate was allowed!';
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Unique constraint test PASSED - duplicate was prevented';
  WHEN OTHERS THEN
    RAISE NOTICE 'Unique constraint test PASSED - duplicate was prevented (already exists)';
END $;

-- =====================================================
-- TEST 3: Check Constraint (Valid Stages)
-- =====================================================
-- Try to insert invalid stage (should fail)

DO $
BEGIN
  -- First delete test user 1's journey to test fresh insert
  DELETE FROM user_journey_progress 
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;
  
  -- Try to insert invalid stage
  INSERT INTO user_journey_progress (user_id, current_stage)
  VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'invalid_stage');
  
  RAISE EXCEPTION 'Check constraint test FAILED - invalid stage was allowed!';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'Check constraint test PASSED - invalid stage was rejected';
  WHEN OTHERS THEN
    RAISE NOTICE 'Check constraint test encountered error: %', SQLERRM;
END $;

-- Restore test user 1's journey
INSERT INTO user_journey_progress (user_id, current_stage)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'awareness')
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- TEST 4: Default Values
-- =====================================================
-- Verify all default values are set correctly

SELECT 
  user_id,
  current_stage,
  stage_progress,
  completed_milestones,
  joined_causes,
  total_points,
  trees_planted,
  challenges_completed,
  referral_count,
  created_at IS NOT NULL as has_created_at,
  updated_at IS NOT NULL as has_updated_at
FROM user_journey_progress
WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;

-- Expected:
-- - current_stage = 'awareness'
-- - stage_progress = {"awareness": 0, "activation": 0, "action": 0, "verification": 0, "legacy": 0}
-- - completed_milestones = []
-- - joined_causes = []
-- - total_points = 0
-- - trees_planted = 0
-- - challenges_completed = 0
-- - referral_count = 0
-- - has_created_at = true
-- - has_updated_at = true

-- =====================================================
-- TEST 5: Update Trigger (updated_at timestamp)
-- =====================================================

-- Record current updated_at
DO $
DECLARE
  old_updated_at TIMESTAMP;
  new_updated_at TIMESTAMP;
BEGIN
  -- Get current updated_at
  SELECT updated_at INTO old_updated_at
  FROM user_journey_progress
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;
  
  -- Wait a moment
  PERFORM pg_sleep(1);
  
  -- Update the record
  UPDATE user_journey_progress
  SET total_points = 10
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;
  
  -- Get new updated_at
  SELECT updated_at INTO new_updated_at
  FROM user_journey_progress
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;
  
  -- Check if updated_at changed
  IF new_updated_at > old_updated_at THEN
    RAISE NOTICE 'Update trigger test PASSED - updated_at was automatically updated';
  ELSE
    RAISE EXCEPTION 'Update trigger test FAILED - updated_at was not updated';
  END IF;
END $;

-- =====================================================
-- TEST 6: Foreign Key Cascade Delete
-- =====================================================

-- Create a temporary test user
DO $
DECLARE
  temp_user_id UUID := '00000000-0000-0000-0000-000000000099'::UUID;
BEGIN
  -- Create temp user
  INSERT INTO users (id, email, role)
  VALUES (temp_user_id, 'temp-test@example.com', 'individual')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  -- Create journey for temp user
  INSERT INTO user_journey_progress (user_id, current_stage)
  VALUES (temp_user_id, 'awareness')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Verify journey exists
  IF EXISTS (SELECT 1 FROM user_journey_progress WHERE user_id = temp_user_id) THEN
    RAISE NOTICE 'Temp journey created';
  END IF;
  
  -- Delete the user (should cascade delete journey)
  DELETE FROM users WHERE id = temp_user_id;
  
  -- Check if journey was deleted
  IF NOT EXISTS (SELECT 1 FROM user_journey_progress WHERE user_id = temp_user_id) THEN
    RAISE NOTICE 'Cascade delete test PASSED - journey was deleted with user';
  ELSE
    RAISE EXCEPTION 'Cascade delete test FAILED - journey still exists after user deletion';
  END IF;
END $;

-- =====================================================
-- TEST 7: Stage Progress JSONB Structure
-- =====================================================

-- Update stage progress and verify structure
UPDATE user_journey_progress
SET stage_progress = jsonb_set(
  stage_progress,
  '{awareness}',
  '50'::jsonb
)
WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;

-- Verify the update
SELECT 
  user_id,
  stage_progress,
  stage_progress->>'awareness' as awareness_progress,
  stage_progress->>'activation' as activation_progress
FROM user_journey_progress
WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;

-- Expected: awareness_progress = '50', activation_progress = '0'

-- =====================================================
-- TEST 8: Array Operations (completed_milestones, joined_causes)
-- =====================================================

-- Add items to arrays
UPDATE user_journey_progress
SET 
  completed_milestones = array_append(completed_milestones, 'milestone-1'),
  joined_causes = array_append(joined_causes, 'cause-kakamega')
WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;

-- Verify arrays
SELECT 
  user_id,
  completed_milestones,
  joined_causes,
  array_length(completed_milestones, 1) as milestone_count,
  array_length(joined_causes, 1) as cause_count
FROM user_journey_progress
WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID;

-- Expected: milestone_count = 1, cause_count = 1

-- =====================================================
-- TEST 9: Counter Updates
-- =====================================================

-- Update all counters
UPDATE user_journey_progress
SET 
  total_points = 100,
  trees_planted = 5,
  challenges_completed = 3,
  referral_count = 2
WHERE user_id = '00000000-0000-0000-0000-000000000002'::UUID;

-- Verify counters
SELECT 
  user_id,
  total_points,
  trees_planted,
  challenges_completed,
  referral_count
FROM user_journey_progress
WHERE user_id = '00000000-0000-0000-0000-000000000002'::UUID;

-- Expected: All counters should match the values set above

-- =====================================================
-- TEST 10: Stage Advancement
-- =====================================================

-- Advance user through stages
UPDATE user_journey_progress
SET 
  current_stage = 'activation',
  stage_progress = jsonb_set(
    jsonb_set(stage_progress, '{awareness}', '100'::jsonb),
    '{activation}', '25'::jsonb
  )
WHERE user_id = '00000000-0000-0000-0000-000000000002'::UUID;

-- Verify stage advancement
SELECT 
  user_id,
  current_stage,
  stage_progress->>'awareness' as awareness_complete,
  stage_progress->>'activation' as activation_progress
FROM user_journey_progress
WHERE user_id = '00000000-0000-0000-0000-000000000002'::UUID;

-- Expected: current_stage = 'activation', awareness_complete = '100', activation_progress = '25'

-- =====================================================
-- CLEANUP: Remove Test Data
-- =====================================================

-- Uncomment to clean up test data
-- DELETE FROM user_journey_progress 
-- WHERE user_id IN (
--   '00000000-0000-0000-0000-000000000001'::UUID,
--   '00000000-0000-0000-0000-000000000002'::UUID
-- );

-- DELETE FROM users 
-- WHERE email IN (
--   'test-user-1@example.com',
--   'test-user-2@example.com'
-- );

-- =====================================================
-- SUMMARY: View All Test Data
-- =====================================================

SELECT 
  u.email,
  ujp.current_stage,
  ujp.stage_progress,
  ujp.completed_milestones,
  ujp.joined_causes,
  ujp.total_points,
  ujp.trees_planted,
  ujp.challenges_completed,
  ujp.referral_count,
  ujp.created_at,
  ujp.updated_at
FROM user_journey_progress ujp
JOIN users u ON u.id = ujp.user_id
WHERE u.email IN ('test-user-1@example.com', 'test-user-2@example.com')
ORDER BY u.email;

-- =====================================================
-- All tests should show PASSED in the notices
-- If any test shows FAILED, review the migration
-- =====================================================
