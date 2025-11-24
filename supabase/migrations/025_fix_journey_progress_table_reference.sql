-- Migration: Fix Journey Progress Table User Reference
-- Description: Fixes the foreign key reference in user_journey_progress from auth.users to users table
-- Date: 2025-11-24
-- Related: Migration 017 created the table but referenced auth.users instead of users

-- =====================================================
-- PART 1: Drop and Recreate Journey Progress Table
-- =====================================================

-- Drop existing table if it exists (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS user_journey_progress CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_journey_progress_timestamp() CASCADE;

-- Drop the auto-initialize trigger function if it exists  
DROP FUNCTION IF EXISTS initialize_user_journey() CASCADE;

-- Create user_journey_progress table with correct reference
CREATE TABLE user_journey_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_stage VARCHAR(50) NOT NULL DEFAULT 'awareness',
  stage_progress JSONB NOT NULL DEFAULT '{"awareness": 0, "activation": 0, "action": 0, "verification": 0, "legacy": 0}'::jsonb,
  completed_milestones TEXT[] DEFAULT '{}',
  joined_causes TEXT[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  trees_planted INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_journey UNIQUE(user_id),
  CONSTRAINT valid_stage CHECK (current_stage IN ('awareness', 'activation', 'action', 'verification', 'legacy'))
);

-- =====================================================
-- PART 2: Create Indexes for Performance
-- =====================================================

-- Primary lookup by user
CREATE INDEX idx_journey_user_id ON user_journey_progress(user_id);

-- Analytics queries by stage
CREATE INDEX idx_journey_current_stage ON user_journey_progress(current_stage);

-- Composite index for stage-based user queries
CREATE INDEX idx_journey_user_stage ON user_journey_progress(user_id, current_stage);

-- Index for updated_at (useful for cache invalidation)
CREATE INDEX idx_journey_updated_at ON user_journey_progress(updated_at);

-- =====================================================
-- PART 3: Automatic Timestamp Updates
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on UPDATE
CREATE TRIGGER journey_updated_at_trigger
  BEFORE UPDATE ON user_journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_journey_updated_at();

-- =====================================================
-- PART 4: Row Level Security Policies
-- =====================================================

-- Enable RLS
ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own journey progress
CREATE POLICY "Users can view own journey progress"
  ON user_journey_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own journey progress
CREATE POLICY "Users can update own journey progress"
  ON user_journey_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own journey progress
CREATE POLICY "Users can insert own journey progress"
  ON user_journey_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can bypass RLS for system operations
CREATE POLICY "Service role has full access"
  ON user_journey_progress
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- =====================================================
-- PART 5: Helper Function for Auto-Initialization
-- =====================================================

-- Function to initialize journey progress for new users
CREATE OR REPLACE FUNCTION initialize_user_journey()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_journey_progress (user_id, current_stage)
  VALUES (NEW.id, 'awareness')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-initialize journey for new users
CREATE TRIGGER trigger_initialize_user_journey
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_journey();

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE user_journey_progress IS 'Tracks individual user progress through the 5-stage journey (awareness, activation, action, verification, legacy)';
COMMENT ON COLUMN user_journey_progress.current_stage IS 'Current journey stage: awareness, activation, action, verification, or legacy';
COMMENT ON COLUMN user_journey_progress.stage_progress IS 'Progress percentage (0-100) for each stage stored as JSONB';
COMMENT ON COLUMN user_journey_progress.completed_milestones IS 'Array of milestone IDs that the user has completed';
COMMENT ON COLUMN user_journey_progress.joined_causes IS 'Array of cause IDs that the user has joined';
COMMENT ON COLUMN user_journey_progress.total_points IS 'Total gamification points earned by the user';
COMMENT ON COLUMN user_journey_progress.trees_planted IS 'Number of trees planted by the user';
COMMENT ON COLUMN user_journey_progress.challenges_completed IS 'Number of micro-challenges completed by the user';
COMMENT ON COLUMN user_journey_progress.referral_count IS 'Number of successful referrals made by the user';

-- =====================================================
-- ROLLBACK SCRIPT (for reference)
-- =====================================================
-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS journey_updated_at_trigger ON user_journey_progress;
-- DROP TRIGGER IF EXISTS trigger_initialize_user_journey ON users;
-- DROP FUNCTION IF EXISTS update_journey_updated_at();
-- DROP FUNCTION IF EXISTS initialize_user_journey();
-- DROP TABLE IF EXISTS user_journey_progress CASCADE;
