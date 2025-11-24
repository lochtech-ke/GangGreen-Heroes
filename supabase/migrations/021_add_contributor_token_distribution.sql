-- Migration: Add Contributor Token Distribution System
-- Description: Creates tables for GitHub contributor tracking, token distribution cycles, feature suggestions, and contributor badges
-- Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5, 7.1-7.5, 8.1-8.5, 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.5, 13.1-13.5, 14.1-14.5

-- ============================================================================
-- GITHUB ACCOUNT LINKING
-- ============================================================================

-- GitHub accounts table
CREATE TABLE IF NOT EXISTS github_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  github_username VARCHAR(100) NOT NULL,
  github_id BIGINT NOT NULL UNIQUE,
  github_email VARCHAR(255),
  avatar_url TEXT,
  profile_url TEXT,
  access_token_encrypted TEXT,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_github_username CHECK (github_username ~ '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$')
);

-- ============================================================================
-- DISTRIBUTION CYCLES
-- ============================================================================

-- Distribution cycles table
CREATE TABLE IF NOT EXISTS distribution_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_number INTEGER NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculating', 'completed', 'distributed')),
  total_token_pool INTEGER NOT NULL CHECK (total_token_pool > 0),
  tokens_distributed INTEGER DEFAULT 0 CHECK (tokens_distributed >= 0),
  contributors_count INTEGER DEFAULT 0 CHECK (contributors_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT tokens_not_exceed_pool CHECK (tokens_distributed <= total_token_pool)
);

-- ============================================================================
-- CONTRIBUTION TRACKING
-- ============================================================================

-- Contribution scores table
CREATE TABLE IF NOT EXISTS contribution_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(100) NOT NULL,
  cycle_id UUID NOT NULL REFERENCES distribution_cycles(id) ON DELETE CASCADE,
  commits_count INTEGER DEFAULT 0 CHECK (commits_count >= 0),
  prs_merged_count INTEGER DEFAULT 0 CHECK (prs_merged_count >= 0),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  lines_added INTEGER DEFAULT 0 CHECK (lines_added >= 0),
  lines_deleted INTEGER DEFAULT 0 CHECK (lines_deleted >= 0),
  documentation_changes INTEGER DEFAULT 0 CHECK (documentation_changes >= 0),
  raw_score DECIMAL(10, 2) DEFAULT 0 CHECK (raw_score >= 0),
  weighted_score DECIMAL(10, 2) DEFAULT 0 CHECK (weighted_score >= 0),
  token_allocation INTEGER DEFAULT 0 CHECK (token_allocation >= 0),
  rank INTEGER CHECK (rank > 0),
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cycle_id)
);

-- ============================================================================
-- TOKEN DISTRIBUTION
-- ============================================================================

-- Token distributions table
CREATE TABLE IF NOT EXISTS token_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES distribution_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(100) NOT NULL,
  tokens_awarded INTEGER NOT NULL CHECK (tokens_awarded > 0),
  contribution_score DECIMAL(10, 2) NOT NULL CHECK (contribution_score >= 0),
  distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('automated', 'manual_bonus')),
  justification TEXT,
  distributed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cycle_id, user_id, distribution_type)
);

-- Distribution configuration table
CREATE TABLE IF NOT EXISTS distribution_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_frequency VARCHAR(20) NOT NULL CHECK (cycle_frequency IN ('weekly', 'monthly', 'quarterly')),
  token_pool_per_cycle INTEGER NOT NULL CHECK (token_pool_per_cycle > 0),
  minimum_contribution_threshold INTEGER NOT NULL DEFAULT 10 CHECK (minimum_contribution_threshold >= 0),
  max_tokens_per_contributor INTEGER NOT NULL DEFAULT 1000 CHECK (max_tokens_per_contributor > 0),
  commit_weight DECIMAL(5, 2) NOT NULL DEFAULT 1.0 CHECK (commit_weight >= 0),
  pr_merged_weight DECIMAL(5, 2) NOT NULL DEFAULT 3.0 CHECK (pr_merged_weight >= 0),
  review_weight DECIMAL(5, 2) NOT NULL DEFAULT 2.0 CHECK (review_weight >= 0),
  documentation_weight DECIMAL(5, 2) NOT NULL DEFAULT 1.5 CHECK (documentation_weight >= 0),
  lines_of_code_multiplier DECIMAL(5, 4) NOT NULL DEFAULT 0.001 CHECK (lines_of_code_multiplier >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Manual token awards table
CREATE TABLE IF NOT EXISTS manual_token_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens_awarded INTEGER NOT NULL CHECK (tokens_awarded > 0),
  awarded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  justification TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('architecture', 'mentorship', 'documentation', 'community', 'other')),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT justification_not_empty CHECK (LENGTH(TRIM(justification)) > 0)
);

-- ============================================================================
-- FEATURE SUGGESTIONS
-- ============================================================================

-- Feature suggestions table
CREATE TABLE IF NOT EXISTS feature_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ui_ux', 'backend', 'blockchain', 'gamification', 'performance', 'other')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_consideration', 'approved_for_voting', 'declined', 'converted')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  github_issue_number INTEGER,
  github_issue_url TEXT,
  upvotes_count INTEGER DEFAULT 0 CHECK (upvotes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  priority_score DECIMAL(10, 2) DEFAULT 0 CHECK (priority_score >= 0),
  estimated_effort VARCHAR(20) CHECK (estimated_effort IN ('small', 'medium', 'large', 'extra_large')),
  expected_impact VARCHAR(20) CHECK (expected_impact IN ('low', 'medium', 'high', 'critical')),
  converted_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  decline_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Feature suggestion upvotes table
CREATE TABLE IF NOT EXISTS feature_suggestion_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID NOT NULL REFERENCES feature_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- Feature suggestion comments table
CREATE TABLE IF NOT EXISTS feature_suggestion_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID NOT NULL REFERENCES feature_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT comment_not_empty CHECK (LENGTH(TRIM(comment)) > 0)
);

-- ============================================================================
-- CONTRIBUTOR BADGES
-- ============================================================================

-- Contributor badges table
CREATE TABLE IF NOT EXISTS contributor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('commits', 'prs', 'reviews', 'tokens', 'special')),
  criteria_threshold INTEGER NOT NULL CHECK (criteria_threshold > 0),
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES contributor_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_showcased BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- GitHub accounts indexes
CREATE INDEX IF NOT EXISTS idx_github_accounts_user ON github_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_github_accounts_username ON github_accounts(github_username);
CREATE INDEX IF NOT EXISTS idx_github_accounts_github_id ON github_accounts(github_id);

-- Distribution cycles indexes
CREATE INDEX IF NOT EXISTS idx_distribution_cycles_status ON distribution_cycles(status);
CREATE INDEX IF NOT EXISTS idx_distribution_cycles_dates ON distribution_cycles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_distribution_cycles_number ON distribution_cycles(cycle_number);

-- Contribution scores indexes
CREATE INDEX IF NOT EXISTS idx_contribution_scores_cycle ON contribution_scores(cycle_id);
CREATE INDEX IF NOT EXISTS idx_contribution_scores_user ON contribution_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_contribution_scores_rank ON contribution_scores(rank) WHERE rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contribution_scores_flagged ON contribution_scores(is_flagged) WHERE is_flagged = TRUE;

-- Token distributions indexes
CREATE INDEX IF NOT EXISTS idx_token_distributions_cycle ON token_distributions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_token_distributions_user ON token_distributions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_distributions_type ON token_distributions(distribution_type);
CREATE INDEX IF NOT EXISTS idx_token_distributions_distributed_at ON token_distributions(distributed_at DESC);

-- Feature suggestions indexes
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_status ON feature_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_priority_score ON feature_suggestions(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_category ON feature_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_created_by ON feature_suggestions(created_by);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_created_at ON feature_suggestions(created_at DESC);

-- Feature suggestion upvotes indexes
CREATE INDEX IF NOT EXISTS idx_feature_suggestion_upvotes_suggestion ON feature_suggestion_upvotes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_feature_suggestion_upvotes_user ON feature_suggestion_upvotes(user_id);

-- Feature suggestion comments indexes
CREATE INDEX IF NOT EXISTS idx_feature_suggestion_comments_suggestion ON feature_suggestion_comments(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_feature_suggestion_comments_user ON feature_suggestion_comments(user_id);

-- Contributor badges indexes
CREATE INDEX IF NOT EXISTS idx_contributor_badges_criteria_type ON contributor_badges(criteria_type);
CREATE INDEX IF NOT EXISTS idx_contributor_badges_active ON contributor_badges(is_active) WHERE is_active = TRUE;

-- User badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_showcased ON user_badges(is_showcased) WHERE is_showcased = TRUE;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_distribution_config_updated_at BEFORE UPDATE ON distribution_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_suggestions_updated_at BEFORE UPDATE ON feature_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC COUNTS
-- ============================================================================

-- Function to update upvotes count on feature suggestions
CREATE OR REPLACE FUNCTION update_feature_suggestion_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_suggestions
    SET upvotes_count = upvotes_count + 1
    WHERE id = NEW.suggestion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_suggestions
    SET upvotes_count = upvotes_count - 1
    WHERE id = OLD.suggestion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_upvotes_count
AFTER INSERT OR DELETE ON feature_suggestion_upvotes
FOR EACH ROW EXECUTE FUNCTION update_feature_suggestion_upvotes_count();

-- Function to update comments count on feature suggestions
CREATE OR REPLACE FUNCTION update_feature_suggestion_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_suggestions
    SET comments_count = comments_count + 1
    WHERE id = NEW.suggestion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_suggestions
    SET comments_count = comments_count - 1
    WHERE id = OLD.suggestion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON feature_suggestion_comments
FOR EACH ROW EXECUTE FUNCTION update_feature_suggestion_comments_count();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default distribution configuration
INSERT INTO distribution_config (
  cycle_frequency,
  token_pool_per_cycle,
  minimum_contribution_threshold,
  max_tokens_per_contributor,
  commit_weight,
  pr_merged_weight,
  review_weight,
  documentation_weight,
  lines_of_code_multiplier,
  is_active
) VALUES (
  'monthly',
  10000,
  10,
  1000,
  1.0,
  3.0,
  2.0,
  1.5,
  0.001,
  TRUE
) ON CONFLICT DO NOTHING;

-- Insert contributor badges
INSERT INTO contributor_badges (name, description, criteria_type, criteria_threshold, rarity) VALUES
  ('Committed Developer', 'Awarded for reaching 100 commits to the repository', 'commits', 100, 'common'),
  ('Code Contributor', 'Awarded for having 10 merged pull requests', 'prs', 10, 'common'),
  ('Code Reviewer', 'Awarded for completing 25 code reviews', 'reviews', 25, 'rare'),
  ('Token Holder', 'Awarded for earning 500 governance tokens through contributions', 'tokens', 500, 'rare'),
  ('Elite Contributor', 'Awarded for earning 2000 governance tokens through contributions', 'tokens', 2000, 'epic'),
  ('Legend', 'Awarded for earning 5000 governance tokens through contributions', 'tokens', 5000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- Insert initial feature suggestions (17 suggestions across priority levels)
INSERT INTO feature_suggestions (
  title,
  description,
  category,
  priority,
  status,
  estimated_effort,
  expected_impact,
  priority_score
) VALUES
  -- Critical Priority
  ('Improve mobile responsiveness', 'Enhance the mobile experience across all pages with better touch interactions and responsive layouts', 'ui_ux', 'critical', 'pending', 'large', 'critical', 95.0),
  ('Add real-time notifications', 'Implement WebSocket-based real-time notifications for important events', 'backend', 'critical', 'pending', 'medium', 'high', 90.0),
  
  -- High Priority
  ('Implement dark mode', 'Add a dark mode theme option for better user experience in low-light conditions', 'ui_ux', 'high', 'pending', 'medium', 'high', 85.0),
  ('Add search functionality', 'Implement global search across initiatives, trees, and users', 'backend', 'high', 'pending', 'large', 'high', 82.0),
  ('Optimize database queries', 'Improve performance by optimizing slow database queries and adding caching', 'performance', 'high', 'pending', 'medium', 'high', 80.0),
  ('Add export to PDF', 'Allow users to export their impact reports and certificates as PDF', 'ui_ux', 'high', 'pending', 'small', 'medium', 75.0),
  
  -- Medium Priority
  ('Add social sharing', 'Enable users to share their achievements on social media platforms', 'ui_ux', 'medium', 'pending', 'small', 'medium', 70.0),
  ('Implement email notifications', 'Send email notifications for important events and updates', 'backend', 'medium', 'pending', 'medium', 'medium', 68.0),
  ('Add multi-language support', 'Implement internationalization for multiple languages', 'ui_ux', 'medium', 'pending', 'extra_large', 'high', 65.0),
  ('Improve onboarding flow', 'Create a better onboarding experience for new users', 'ui_ux', 'medium', 'pending', 'medium', 'medium', 62.0),
  ('Add analytics dashboard', 'Provide detailed analytics for administrators', 'backend', 'medium', 'pending', 'large', 'medium', 60.0),
  ('Implement rate limiting', 'Add rate limiting to prevent API abuse', 'backend', 'medium', 'pending', 'small', 'medium', 58.0),
  
  -- Low Priority
  ('Add keyboard shortcuts', 'Implement keyboard shortcuts for power users', 'ui_ux', 'low', 'pending', 'small', 'low', 45.0),
  ('Improve error messages', 'Make error messages more user-friendly and actionable', 'ui_ux', 'low', 'pending', 'small', 'low', 42.0),
  ('Add tooltips', 'Add helpful tooltips throughout the interface', 'ui_ux', 'low', 'pending', 'small', 'low', 40.0),
  ('Optimize images', 'Implement image optimization and lazy loading', 'performance', 'low', 'pending', 'medium', 'low', 38.0),
  ('Add accessibility features', 'Improve accessibility with ARIA labels and keyboard navigation', 'ui_ux', 'low', 'pending', 'medium', 'medium', 35.0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE github_accounts IS 'Links platform user accounts to GitHub accounts for contribution tracking';
COMMENT ON TABLE distribution_cycles IS 'Defines time periods for token distribution to contributors';
COMMENT ON TABLE contribution_scores IS 'Tracks contributor activity and calculates token allocation';
COMMENT ON TABLE token_distributions IS 'Records actual token distributions to contributors';
COMMENT ON TABLE distribution_config IS 'Configuration for token distribution parameters and weights';
COMMENT ON TABLE manual_token_awards IS 'Manual bonus token awards for exceptional contributions';
COMMENT ON TABLE feature_suggestions IS 'Community-submitted feature suggestions and improvements';
COMMENT ON TABLE feature_suggestion_upvotes IS 'User upvotes for feature suggestions';
COMMENT ON TABLE feature_suggestion_comments IS 'Comments and discussions on feature suggestions';
COMMENT ON TABLE contributor_badges IS 'Achievement badges for contributor milestones';
COMMENT ON TABLE user_badges IS 'Badges earned by users';

