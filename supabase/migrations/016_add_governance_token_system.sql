-- Migration: Add Governance Token System
-- Description: Creates tables for governance tokens, proposals, voting, petitions, and blockchain integration
-- Requirements: 1.1-1.10, 9.1-9.5, 10.1-10.5

-- ============================================================================
-- GOVERNANCE TOKENS
-- ============================================================================

-- Governance tokens table
CREATE TABLE IF NOT EXISTS governance_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  earned_total INTEGER NOT NULL DEFAULT 0 CHECK (earned_total >= 0),
  delegated_to UUID REFERENCES users(id) ON DELETE SET NULL,
  delegated_amount INTEGER NOT NULL DEFAULT 0 CHECK (delegated_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Token transactions table for audit trail
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'delegated', 'revoked')),
  source VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token earning rules configuration
CREATE TABLE IF NOT EXISTS token_earning_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(100) UNIQUE NOT NULL,
  tokens_awarded INTEGER NOT NULL CHECK (tokens_awarded > 0),
  minimum_threshold INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROPOSALS AND VOTING
-- ============================================================================

-- Proposal categories configuration
CREATE TABLE IF NOT EXISTS proposal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  voting_period_days INTEGER NOT NULL DEFAULT 7 CHECK (voting_period_days > 0),
  minimum_tokens_to_create INTEGER NOT NULL DEFAULT 100 CHECK (minimum_tokens_to_create >= 0),
  quorum_percentage INTEGER NOT NULL DEFAULT 20 CHECK (quorum_percentage >= 0 AND quorum_percentage <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'policy', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'tie', 'invalid')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_starts_at TIMESTAMP WITH TIME ZONE,
  voting_ends_at TIMESTAMP WITH TIME ZONE,
  quorum_required INTEGER NOT NULL DEFAULT 0,
  votes_for INTEGER NOT NULL DEFAULT 0 CHECK (votes_for >= 0),
  votes_against INTEGER NOT NULL DEFAULT 0 CHECK (votes_against >= 0),
  votes_abstain INTEGER NOT NULL DEFAULT 0 CHECK (votes_abstain >= 0),
  total_voting_power INTEGER NOT NULL DEFAULT 0 CHECK (total_voting_power >= 0),
  tie_breaker_vote VARCHAR(10) CHECK (tie_breaker_vote IN ('for', 'against')),
  tie_breaker_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  implementation_timeline TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
  voting_power INTEGER NOT NULL CHECK (voting_power >= 0),
  is_tie_breaker BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Voting snapshots table for power calculation at proposal start
CREATE TABLE IF NOT EXISTS voting_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voting_power_at_start INTEGER NOT NULL CHECK (voting_power_at_start >= 0),
  delegated_power INTEGER NOT NULL DEFAULT 0 CHECK (delegated_power >= 0),
  total_power INTEGER NOT NULL CHECK (total_power >= 0),
  snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- ============================================================================
-- TIE-BREAKING SYSTEM
-- ============================================================================

-- Senior users table for tie-breaking authority
CREATE TABLE IF NOT EXISTS senior_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  seniority_level INTEGER NOT NULL CHECK (seniority_level > 0),
  role VARCHAR(50) NOT NULL,
  can_break_ties BOOLEAN DEFAULT TRUE,
  tie_breaks_count INTEGER DEFAULT 0 CHECK (tie_breaks_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PETITIONS AND BLOCKCHAIN INTEGRATION
-- ============================================================================

-- Petition configuration table
CREATE TABLE IF NOT EXISTS petition_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) UNIQUE NOT NULL,
  minimum_tokens_to_create INTEGER NOT NULL DEFAULT 50 CHECK (minimum_tokens_to_create >= 0),
  default_signature_threshold INTEGER NOT NULL DEFAULT 100 CHECK (default_signature_threshold > 0),
  maximum_duration_days INTEGER NOT NULL DEFAULT 30 CHECK (maximum_duration_days > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Petitions table
CREATE TABLE IF NOT EXISTS petitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'policy', 'urgent', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'successful', 'failed', 'converted')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  signature_threshold INTEGER NOT NULL CHECK (signature_threshold > 0),
  current_signatures INTEGER NOT NULL DEFAULT 0 CHECK (current_signatures >= 0),
  contract_address VARCHAR(42),
  blockchain_tx_hash VARCHAR(66),
  converted_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT deadline_after_creation CHECK (deadline > created_at)
);

-- Petition signatures table
CREATE TABLE IF NOT EXISTS petition_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  signature TEXT NOT NULL,
  blockchain_tx_hash VARCHAR(66) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(petition_id, user_id),
  UNIQUE(petition_id, wallet_address)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Governance tokens indexes
CREATE INDEX IF NOT EXISTS idx_governance_tokens_user ON governance_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_governance_tokens_delegated_to ON governance_tokens(delegated_to) WHERE delegated_to IS NOT NULL;

-- Token transactions indexes
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created ON token_transactions(created_at DESC);

-- Proposals indexes
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON proposals(category);
CREATE INDEX IF NOT EXISTS idx_proposals_voting_ends ON proposals(voting_ends_at);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);

-- Votes indexes
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(created_at DESC);

-- Voting snapshots indexes
CREATE INDEX IF NOT EXISTS idx_voting_snapshots_proposal ON voting_snapshots(proposal_id);
CREATE INDEX IF NOT EXISTS idx_voting_snapshots_user ON voting_snapshots(user_id);

-- Petitions indexes
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_category ON petitions(category);
CREATE INDEX IF NOT EXISTS idx_petitions_deadline ON petitions(deadline);
CREATE INDEX IF NOT EXISTS idx_petitions_created_by ON petitions(created_by);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petitions_contract_address ON petitions(contract_address) WHERE contract_address IS NOT NULL;

-- Petition signatures indexes
CREATE INDEX IF NOT EXISTS idx_petition_signatures_petition ON petition_signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_user ON petition_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_wallet ON petition_signatures(wallet_address);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_signed_at ON petition_signatures(signed_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_governance_tokens_updated_at BEFORE UPDATE ON governance_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_earning_rules_updated_at BEFORE UPDATE ON token_earning_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_categories_updated_at BEFORE UPDATE ON proposal_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_senior_users_updated_at BEFORE UPDATE ON senior_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petition_config_updated_at BEFORE UPDATE ON petition_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petitions_updated_at BEFORE UPDATE ON petitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default proposal categories
INSERT INTO proposal_categories (name, voting_period_days, minimum_tokens_to_create, quorum_percentage) VALUES
  ('feature', 7, 100, 20),
  ('improvement', 5, 50, 15),
  ('policy', 10, 150, 25),
  ('other', 7, 75, 20)
ON CONFLICT (name) DO NOTHING;

-- Insert default token earning rules
INSERT INTO token_earning_rules (action_type, tokens_awarded, minimum_threshold) VALUES
  ('tree_planting', 10, 1),
  ('initiative_creation', 50, NULL),
  ('initiative_participation', 5, NULL),
  ('community_engagement', 3, NULL),
  ('proposal_creation', 25, NULL),
  ('voting_participation', 2, NULL)
ON CONFLICT (action_type) DO NOTHING;

-- Insert default petition configuration
INSERT INTO petition_config (category, minimum_tokens_to_create, default_signature_threshold, maximum_duration_days) VALUES
  ('feature', 50, 100, 30),
  ('improvement', 30, 75, 21),
  ('policy', 75, 150, 45),
  ('urgent', 100, 200, 14),
  ('other', 50, 100, 30)
ON CONFLICT (category) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE governance_tokens IS 'Stores governance token balances and delegation information for users';
COMMENT ON TABLE token_transactions IS 'Audit trail for all governance token transactions';
COMMENT ON TABLE token_earning_rules IS 'Configuration for how users earn governance tokens';
COMMENT ON TABLE proposal_categories IS 'Configuration for different types of proposals';
COMMENT ON TABLE proposals IS 'Community proposals for platform features and changes';
COMMENT ON TABLE votes IS 'Individual votes cast on proposals';
COMMENT ON TABLE voting_snapshots IS 'Captures voting power at the start of each proposal';
COMMENT ON TABLE senior_users IS 'Users with tie-breaking authority';
COMMENT ON TABLE petition_config IS 'Configuration for petition creation and thresholds';
COMMENT ON TABLE petitions IS 'Community petitions with blockchain-based signatures';
COMMENT ON TABLE petition_signatures IS 'Digital signatures for petitions recorded on-chain';
