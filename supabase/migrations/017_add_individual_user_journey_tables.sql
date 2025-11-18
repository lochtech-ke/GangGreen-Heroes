-- Migration: Individual User Journey Tables
-- Description: Creates tables for user journey tracking, micro-challenges, climate nuggets, referrals, petitions, and certificates
-- Date: 2025-01-19

-- =====================================================
-- PART 1: Journey Progress Tracking
-- =====================================================

-- Create user_journey_progress table
CREATE TABLE IF NOT EXISTS user_journey_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_stage VARCHAR(50) NOT NULL CHECK (current_stage IN ('awareness', 'activation', 'action', 'verification', 'legacy')),
  stage_progress JSONB NOT NULL DEFAULT '{"awareness": 0, "activation": 0, "action": 0, "verification": 0, "legacy": 0}'::jsonb,
  completed_milestones TEXT[] DEFAULT '{}',
  joined_causes TEXT[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  trees_planted INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for journey progress
CREATE INDEX IF NOT EXISTS idx_journey_stage ON user_journey_progress(current_stage);
CREATE INDEX IF NOT EXISTS idx_journey_user ON user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_updated ON user_journey_progress(updated_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journey_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_journey_progress_timestamp
  BEFORE UPDATE ON user_journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_journey_progress_timestamp();

-- =====================================================
-- PART 2: Micro-Challenges
-- =====================================================

-- Create micro_challenges table
CREATE TABLE IF NOT EXISTS micro_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL CHECK (points > 0),
  category VARCHAR(100) NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_limit INTEGER, -- minutes
  is_active BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for micro_challenges
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON micro_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON micro_challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON micro_challenges(is_active) WHERE is_active = true;

-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES micro_challenges(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- Create indexes for user_challenge_progress
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenge_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_completed ON user_challenge_progress(completed_at) WHERE completed_at IS NOT NULL;

-- =====================================================
-- PART 3: Climate Nuggets
-- =====================================================

-- Create climate_nuggets table
CREATE TABLE IF NOT EXISTS climate_nuggets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  read_time INTEGER NOT NULL CHECK (read_time > 0), -- minutes
  related_causes TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for climate_nuggets
CREATE INDEX IF NOT EXISTS idx_nuggets_category ON climate_nuggets(category);
CREATE INDEX IF NOT EXISTS idx_nuggets_published ON climate_nuggets(is_published) WHERE is_published = true;

-- Create user_climate_nuggets table
CREATE TABLE IF NOT EXISTS user_climate_nuggets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nugget_id UUID REFERENCES climate_nuggets(id) ON DELETE CASCADE NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nugget_id)
);

-- Create indexes for user_climate_nuggets
CREATE INDEX IF NOT EXISTS idx_user_nuggets_user ON user_climate_nuggets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nuggets_read ON user_climate_nuggets(is_read);
CREATE INDEX IF NOT EXISTS idx_user_nuggets_saved ON user_climate_nuggets(is_saved) WHERE is_saved = true;

-- =====================================================
-- PART 4: Referrals
-- =====================================================

-- Create user_referrals table
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id),
  CHECK (referrer_id != referred_id)
);

-- Create indexes for user_referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON user_referrals(status);

-- =====================================================
-- PART 5: Petitions
-- =====================================================

-- Create petitions table
CREATE TABLE IF NOT EXISTS petitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  target_signatures INTEGER NOT NULL CHECK (target_signatures > 0),
  current_signatures INTEGER DEFAULT 0 CHECK (current_signatures >= 0),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'successful', 'expired', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for petitions
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_category ON petitions(category);
CREATE INDEX IF NOT EXISTS idx_petitions_created_by ON petitions(created_by);
CREATE INDEX IF NOT EXISTS idx_petitions_expires ON petitions(expires_at) WHERE expires_at IS NOT NULL;

-- Create petition_signatures table
CREATE TABLE IF NOT EXISTS petition_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petition_id UUID REFERENCES petitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(petition_id, user_id)
);

-- Create indexes for petition_signatures
CREATE INDEX IF NOT EXISTS idx_signatures_petition ON petition_signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_signatures_user ON petition_signatures(user_id);

-- Trigger to update petition signature count
CREATE OR REPLACE FUNCTION update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE petitions 
    SET current_signatures = current_signatures + 1,
        updated_at = NOW()
    WHERE id = NEW.petition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE petitions 
    SET current_signatures = GREATEST(0, current_signatures - 1),
        updated_at = NOW()
    WHERE id = OLD.petition_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_petition_signatures
  AFTER INSERT OR DELETE ON petition_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_petition_signature_count();

-- =====================================================
-- PART 6: Certificates
-- =====================================================

-- Create user_certificates table
CREATE TABLE IF NOT EXISTS user_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hero_badge', 'milestone', 'achievement')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  shareable_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user ON user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON user_certificates(type);
CREATE INDEX IF NOT EXISTS idx_certificates_earned ON user_certificates(earned_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_nuggets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_climate_nuggets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;

-- Journey Progress Policies
CREATE POLICY "Users can view their own journey progress"
  ON user_journey_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey progress"
  ON user_journey_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert journey progress"
  ON user_journey_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Micro Challenges Policies
CREATE POLICY "Anyone can view active challenges"
  ON micro_challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON micro_challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- User Challenge Progress Policies
CREATE POLICY "Users can view their own challenge progress"
  ON user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
  ON user_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON user_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Climate Nuggets Policies
CREATE POLICY "Anyone can view published nuggets"
  ON climate_nuggets FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage nuggets"
  ON climate_nuggets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- User Climate Nuggets Policies
CREATE POLICY "Users can view their own nugget interactions"
  ON user_climate_nuggets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own nugget interactions"
  ON user_climate_nuggets FOR ALL
  USING (auth.uid() = user_id);

-- Referrals Policies
CREATE POLICY "Users can view referrals they made"
  ON user_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON user_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON user_referrals FOR UPDATE
  USING (true);

-- Petitions Policies
CREATE POLICY "Anyone can view active petitions"
  ON petitions FOR SELECT
  USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create petitions"
  ON petitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Petition creators can update their petitions"
  ON petitions FOR UPDATE
  USING (auth.uid() = created_by);

-- Petition Signatures Policies
CREATE POLICY "Anyone can view petition signatures"
  ON petition_signatures FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can sign petitions"
  ON petition_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Certificates Policies
CREATE POLICY "Users can view their own certificates"
  ON user_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert certificates"
  ON user_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Helper Functions
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
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_journey();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  code VARCHAR(50);
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a code using first 8 chars of UUID + random 4 chars
    code := UPPER(SUBSTRING(REPLACE(user_uuid::TEXT, '-', '') FROM 1 FOR 8) || 
                  SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM user_referrals WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE user_journey_progress IS 'Tracks individual user progress through the 5-stage journey (awareness, activation, action, verification, legacy)';
COMMENT ON TABLE micro_challenges IS 'Defines small actionable environmental tasks users can complete for points and badges';
COMMENT ON TABLE user_challenge_progress IS 'Tracks user participation and completion of micro-challenges';
COMMENT ON TABLE climate_nuggets IS 'Educational content about environmental issues and conservation';
COMMENT ON TABLE user_climate_nuggets IS 'Tracks which climate nuggets users have read or saved';
COMMENT ON TABLE user_referrals IS 'Tracks user referrals and rewards for bringing new users to the platform';
COMMENT ON TABLE petitions IS 'Environmental petitions created by users for policy changes and community action';
COMMENT ON TABLE petition_signatures IS 'Records of users signing petitions';
COMMENT ON TABLE user_certificates IS 'Digital certificates and hero badges earned by users for significant contributions';
