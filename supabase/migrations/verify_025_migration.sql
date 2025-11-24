-- =====================================================
-- Verification Script for Migration 025
-- Run these queries in Supabase SQL Editor to verify the migration
-- =====================================================

-- =====================================================
-- 1. Verify Table Exists
-- =====================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_journey_progress';
-- Expected: 1 row with table_name = 'user_journey_progress'

-- =====================================================
-- 2. Verify All Columns Exist with Correct Types
-- =====================================================
SELECT 
  column_name, 
  data_type,
  udt_name,
  column_default,
  is_nullable,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_journey_progress'
ORDER BY ordinal_position;
-- Expected: 12 columns (id, user_id, current_stage, stage_progress, completed_milestones, joined_causes, total_points, trees_planted, challenges_completed, referral_count, created_at, updated_at)

-- =====================================================
-- 3. Verify Foreign Key Reference (CRITICAL CHECK)
-- =====================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_journey_progress';
-- Expected: Foreign key from user_id to users(id) with CASCADE delete
-- IMPORTANT: foreign_table_name should be 'users', NOT 'auth.users'

-- =====================================================
-- 4. Verify Unique Constraint
-- =====================================================
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_journey_progress'
  AND tc.constraint_type = 'UNIQUE';
-- Expected: unique_user_journey constraint on user_id column

-- =====================================================
-- 5. Verify Check Constraint (Valid Stages)
-- =====================================================
SELECT
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_journey_progress'
  AND tc.constraint_type = 'CHECK';
-- Expected: valid_stage constraint checking for 'awareness', 'activation', 'action', 'verification', 'legacy'

-- =====================================================
-- 6. Verify Indexes
-- =====================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'user_journey_progress'
ORDER BY indexname;
-- Expected indexes:
-- - idx_journey_user_id
-- - idx_journey_current_stage
-- - idx_journey_user_stage
-- - idx_journey_updated_at
-- - unique_user_journey (unique constraint index)
-- - user_journey_progress_pkey (primary key)

-- =====================================================
-- 7. Verify RLS is Enabled
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_journey_progress';
-- Expected: rowsecurity = true

-- =====================================================
-- 8. Verify RLS Policies
-- =====================================================
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_journey_progress'
ORDER BY policyname;
-- Expected 4 policies:
-- - Users can view own journey progress (SELECT)
-- - Users can update own journey progress (UPDATE)
-- - Users can insert own journey progress (INSERT)
-- - Service role has full access (ALL)

-- =====================================================
-- 9. Verify Triggers
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('user_journey_progress', 'users')
  AND trigger_name LIKE '%journey%'
ORDER BY trigger_name;
-- Expected triggers:
-- - journey_updated_at_trigger on user_journey_progress (BEFORE UPDATE)
-- - trigger_initialize_user_journey on users (AFTER INSERT)

-- =====================================================
-- 10. Verify Functions Exist
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_journey_updated_at', 'initialize_user_journey')
ORDER BY routine_name;
-- Expected: Both functions should exist

-- =====================================================
-- 11. Test Default Values (Safe Test)
-- =====================================================
-- This query shows what the default values would be without inserting data
SELECT 
  column_name,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_journey_progress'
  AND column_default IS NOT NULL
ORDER BY ordinal_position;
-- Expected defaults:
-- - id: uuid_generate_v4()
-- - current_stage: 'awareness'
-- - stage_progress: JSONB with all stages at 0
-- - completed_milestones: '{}'
-- - joined_causes: '{}'
-- - total_points: 0
-- - trees_planted: 0
-- - challenges_completed: 0
-- - referral_count: 0
-- - created_at: now()
-- - updated_at: now()

-- =====================================================
-- 12. Count Existing Records (Should be 0 or few)
-- =====================================================
SELECT COUNT(*) as total_journey_records
FROM user_journey_progress;
-- Expected: 0 (if fresh migration) or small number (if data exists)

-- =====================================================
-- 13. Verify Table Comments
-- =====================================================
SELECT 
  obj_description('user_journey_progress'::regclass) as table_comment;
-- Expected: Description about tracking user journey progress

-- =====================================================
-- SUMMARY QUERY - Run this for a quick overview
-- =====================================================
SELECT 
  'Table Exists' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_journey_progress'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END as status
UNION ALL
SELECT 
  'Correct FK Reference',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'user_journey_progress'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'users'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'RLS Enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_journey_progress' 
      AND rowsecurity = true
  ) THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Has Indexes',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_indexes 
    WHERE tablename = 'user_journey_progress'
  ) >= 4 THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Has Triggers',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.triggers
    WHERE event_object_table IN ('user_journey_progress', 'users')
      AND trigger_name LIKE '%journey%'
  ) >= 2 THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Has RLS Policies',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_policies 
    WHERE tablename = 'user_journey_progress'
  ) >= 4 THEN '✓ PASS' ELSE '✗ FAIL' END;

-- =====================================================
-- If all checks show ✓ PASS, the migration was successful!
-- =====================================================
