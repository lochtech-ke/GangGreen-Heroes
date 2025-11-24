-- Migration: Initialize Journey Progress for Existing Users
-- Description: Creates journey records for users who existed before migration 025
-- Date: 2025-11-24
-- Related: Migration 025 created the table and trigger, but existing users need initialization

-- =====================================================
-- Initialize journey progress for all existing users who don't have one
-- =====================================================

INSERT INTO user_journey_progress (user_id, current_stage)
SELECT 
  u.id,
  'awareness'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 
  FROM user_journey_progress ujp 
  WHERE ujp.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================

-- Check how many journey records were created
SELECT 
  COUNT(*) as total_users,
  COUNT(ujp.id) as users_with_journey,
  COUNT(*) - COUNT(ujp.id) as users_without_journey
FROM users u
LEFT JOIN user_journey_progress ujp ON u.id = ujp.user_id;

-- This should show users_without_journey = 0
