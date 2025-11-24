-- Migration: 020_add_track3_badge_system.sql
-- Description: Add Track 3 badge progression system with community engagement focus
-- Date: 2025-11-24

-- ============================================================================
-- BADGE TIER SYSTEM
-- ============================================================================

-- Badge definitions table for Track 3 progression
CREATE TABLE IF NOT EXISTS badge_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  tier_order INTEGER NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  requirements JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on tier_order for efficient ordering queries
CREATE INDEX idx_badge_tiers_order ON badge_tiers(tier_order);

-- Insert Track 3 badge tiers
INSERT INTO badge_tiers (name, tier_order, description, icon_url, requirements) VALUES
('Hummingbird', 1, 'Welcome badge - Your journey begins', '/badges/hummingbird.svg', 
  '{"actions": 0, "description": "Awarded upon signup"}'::jsonb),
('Community Contributor', 2, 'Active community member', '/badges/community-contributor.svg',
  '{"actions": 25, "social_posts": 5, "description": "Complete 25 actions and create 5 social posts"}'::jsonb),
('Climate Advocate', 3, 'Dedicated climate champion', '/badges/climate-advocate.svg',
  '{"actions": 100, "social_posts": 20, "initiatives": 3, "description": "Complete 100 actions, 20 posts, join 3 initiatives"}'::jsonb),
('Environmental Champion', 4, 'Environmental leader', '/badges/environmental-champion.svg',
  '{"actions": 250, "social_posts": 50, "initiatives": 10, "referrals": 10, "description": "Complete 250 actions, 50 posts, 10 initiatives, 10 referrals"}'::jsonb),
('Green Hero', 5, 'Ultimate environmental hero', '/badges/green-hero.svg',
  '{"actions": 500, "social_posts": 100, "initiatives": 20, "referrals": 25, "description": "Complete 500 actions, 100 posts, 20 initiatives, 25 referrals"}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- GREEN HERO VARIANTS
-- ============================================================================

-- Green Hero specialized variants table
CREATE TABLE IF NOT EXISTS green_hero_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  requirements JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Green Hero variants
INSERT INTO green_hero_variants (name, description, icon_url, requirements) VALUES
('Social Mobilizer', 'Master of community growth', '/badges/social-mobilizer.svg',
  '{"referrals": 100, "social_engagement": 1000, "description": "100 referrals and 1000 social engagements"}'::jsonb),
('Initiative Leader', 'Community project champion', '/badges/initiative-leader.svg',
  '{"initiatives_created": 10, "initiatives_completed": 10, "description": "Create and complete 10 initiatives"}'::jsonb),
('Knowledge Sharer', 'Environmental educator', '/badges/knowledge-sharer.svg',
  '{"educational_posts": 50, "post_engagement": 500, "description": "50 educational posts with 500+ engagements"}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- USER BADGE PROGRESS
-- ============================================================================

-- User badge progress tracking table
CREATE TABLE IF NOT EXISTS user_badge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_badge_id UUID REFERENCES badge_tiers(id) NOT NULL,
  actions_completed INTEGER DEFAULT 0 CHECK (actions_completed >= 0),
  social_posts_created INTEGER DEFAULT 0 CHECK (social_posts_created >= 0),
  initiatives_joined INTEGER DEFAULT 0 CHECK (initiatives_joined >= 0),
  initiatives_created INTEGER DEFAULT 0 CHECK (initiatives_created >= 0),
  referrals_made INTEGER DEFAULT 0 CHECK (referrals_made >= 0),
  referrals_active INTEGER DEFAULT 0 CHECK (referrals_active >= 0),
  social_engagement_score INTEGER DEFAULT 0 CHECK (social_engagement_score >= 0),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_badge_progress_user ON user_badge_progress(user_id);
CREATE INDEX idx_badge_progress_badge ON user_badge_progress(current_badge_id);
CREATE INDEX idx_badge_progress_updated ON user_badge_progress(last_updated DESC);

-- ============================================================================
-- USER EARNED BADGES
-- ============================================================================

-- User earned badges table (history of all badges earned)
CREATE TABLE IF NOT EXISTS user_earned_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badge_tiers(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_earned_badges_user ON user_earned_badges(user_id);
CREATE INDEX idx_earned_badges_badge ON user_earned_badges(badge_id);
CREATE INDEX idx_earned_badges_earned_at ON user_earned_badges(earned_at DESC);

-- ============================================================================
-- USER EARNED VARIANTS
-- ============================================================================

-- User earned Green Hero variants table
CREATE TABLE IF NOT EXISTS user_earned_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES green_hero_variants(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, variant_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_earned_variants_user ON user_earned_variants(user_id);
CREATE INDEX idx_earned_variants_variant ON user_earned_variants(variant_id);
CREATE INDEX idx_earned_variants_earned_at ON user_earned_variants(earned_at DESC);

-- ============================================================================
-- ENGAGEMENT ACTIONS TRACKING
-- ============================================================================

-- Engagement actions tracking table
CREATE TABLE IF NOT EXISTS engagement_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
    'micro_challenge', 'social_post', 'social_like', 'social_comment', 
    'initiative_join', 'initiative_create', 'initiative_task', 'referral'
  )),
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_engagement_user ON engagement_actions(user_id);
CREATE INDEX idx_engagement_type ON engagement_actions(action_type);
CREATE INDEX idx_engagement_created ON engagement_actions(created_at DESC);
CREATE INDEX idx_engagement_user_type ON engagement_actions(user_id, action_type);

-- ============================================================================
-- ENGAGEMENT SUMMARY MATERIALIZED VIEW
-- ============================================================================

-- Materialized view for efficient engagement summary queries
CREATE MATERIALIZED VIEW IF NOT EXISTS user_engagement_summary AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE action_type = 'micro_challenge') as challenges_completed,
  COUNT(*) FILTER (WHERE action_type = 'social_post') as posts_created,
  COUNT(*) FILTER (WHERE action_type = 'social_like') as likes_given,
  COUNT(*) FILTER (WHERE action_type = 'social_comment') as comments_made,
  COUNT(*) FILTER (WHERE action_type = 'initiative_join') as initiatives_joined,
  COUNT(*) FILTER (WHERE action_type = 'initiative_create') as initiatives_created,
  COUNT(*) FILTER (WHERE action_type = 'initiative_task') as tasks_completed,
  COUNT(*) FILTER (WHERE action_type = 'referral') as referrals_made,
  SUM(points_awarded) as total_points,
  MAX(created_at) as last_activity
FROM engagement_actions
GROUP BY user_id;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_engagement_summary_user ON user_engagement_summary(user_id);

-- Function to refresh engagement summary
CREATE OR REPLACE FUNCTION refresh_engagement_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FEATURE FLAGS FOR DEPRECATION
-- ============================================================================

-- Feature flags table for managing deprecated features
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name VARCHAR(100) NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  deprecated_at TIMESTAMPTZ,
  removal_date TIMESTAMPTZ,
  alternative_feature VARCHAR(100),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on feature_name for fast lookups
CREATE INDEX idx_feature_flags_name ON feature_flags(feature_name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- Insert Track 3 feature flags
INSERT INTO feature_flags (feature_name, is_enabled, deprecated_at, alternative_feature, message) VALUES
('tree_planting', false, NOW(), 'initiatives', 'Tree planting features are not included in Track 3 submission'),
('carbon_credits', false, NOW(), 'initiatives', 'Carbon credit marketplace is not included in Track 3 submission'),
('marketplace', false, NOW(), 'badges', 'Marketplace features are not included in Track 3 submission')
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  deprecated_at = EXCLUDED.deprecated_at,
  alternative_feature = EXCLUDED.alternative_feature,
  message = EXCLUDED.message,
  updated_at = NOW();

-- Function to check if feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(feature VARCHAR(100))
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_enabled, false) FROM feature_flags WHERE feature_name = feature;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_badge_tiers_updated_at
  BEFORE UPDATE ON badge_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_green_hero_variants_updated_at
  BEFORE UPDATE ON green_hero_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically award Hummingbird badge on user creation
CREATE OR REPLACE FUNCTION award_hummingbird_badge()
RETURNS TRIGGER AS $$
DECLARE
  hummingbird_badge_id UUID;
BEGIN
  -- Get the Hummingbird badge ID
  SELECT id INTO hummingbird_badge_id 
  FROM badge_tiers 
  WHERE name = 'Hummingbird' 
  LIMIT 1;

  -- Initialize user badge progress with Hummingbird badge
  IF hummingbird_badge_id IS NOT NULL THEN
    INSERT INTO user_badge_progress (user_id, current_badge_id)
    VALUES (NEW.id, hummingbird_badge_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Record the earned badge
    INSERT INTO user_earned_badges (user_id, badge_id)
    VALUES (NEW.id, hummingbird_badge_id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award Hummingbird badge on user creation
CREATE TRIGGER award_hummingbird_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION award_hummingbird_badge();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE badge_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_hero_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_earned_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Badge tiers: Public read access
CREATE POLICY "Badge tiers are viewable by everyone"
  ON badge_tiers FOR SELECT
  USING (true);

-- Green Hero variants: Public read access
CREATE POLICY "Green Hero variants are viewable by everyone"
  ON green_hero_variants FOR SELECT
  USING (true);

-- User badge progress: Users can view their own progress
CREATE POLICY "Users can view their own badge progress"
  ON user_badge_progress FOR SELECT
  USING (auth.uid() = user_id);

-- User badge progress: Users can view others' progress (for leaderboards)
CREATE POLICY "Users can view others badge progress"
  ON user_badge_progress FOR SELECT
  USING (true);

-- User earned badges: Users can view their own earned badges
CREATE POLICY "Users can view their own earned badges"
  ON user_earned_badges FOR SELECT
  USING (auth.uid() = user_id);

-- User earned badges: Public read for leaderboards
CREATE POLICY "Users can view others earned badges"
  ON user_earned_badges FOR SELECT
  USING (true);

-- User earned variants: Users can view their own variants
CREATE POLICY "Users can view their own earned variants"
  ON user_earned_variants FOR SELECT
  USING (auth.uid() = user_id);

-- User earned variants: Public read
CREATE POLICY "Users can view others earned variants"
  ON user_earned_variants FOR SELECT
  USING (true);

-- Engagement actions: Users can view their own actions
CREATE POLICY "Users can view their own engagement actions"
  ON engagement_actions FOR SELECT
  USING (auth.uid() = user_id);

-- Feature flags: Public read access
CREATE POLICY "Feature flags are viewable by everyone"
  ON feature_flags FOR SELECT
  USING (true);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE badge_tiers IS 'Track 3 badge progression tiers from Hummingbird to Green Hero';
COMMENT ON TABLE green_hero_variants IS 'Specialized Green Hero badge variants for advanced achievements';
COMMENT ON TABLE user_badge_progress IS 'Tracks user progress toward next badge tier';
COMMENT ON TABLE user_earned_badges IS 'History of all badges earned by users';
COMMENT ON TABLE user_earned_variants IS 'Green Hero variants earned by users';
COMMENT ON TABLE engagement_actions IS 'Tracks all user engagement actions for badge progression';
COMMENT ON TABLE feature_flags IS 'Feature flags for managing deprecated features in Track 3';
COMMENT ON MATERIALIZED VIEW user_engagement_summary IS 'Aggregated engagement metrics for efficient queries';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 020_add_track3_badge_system.sql completed successfully';
END $$;
