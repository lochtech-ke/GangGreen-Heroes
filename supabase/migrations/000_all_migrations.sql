-- ============================================================================
-- GangGreen Platform - Complete Database Schema
-- ============================================================================
-- This file contains all migrations combined for easy execution
-- Execute this in Supabase SQL Editor to set up the complete database schema
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- MIGRATION 001: Users and Profiles
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'organization', 'community', 'individual')),
  forest_preference TEXT CHECK (forest_preference IN ('kakamega', 'karura', 'mau')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  location TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_forest_preference ON users(forest_preference);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 002: Initiatives
-- ============================================================================

CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  target_trees INTEGER NOT NULL CHECK (target_trees > 0),
  trees_planted INTEGER DEFAULT 0 CHECK (trees_planted >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  area_hectares DECIMAL(10, 2) CHECK (area_hectares > 0),
  organization_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE initiative_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trees_contributed INTEGER DEFAULT 0 CHECK (trees_contributed >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, user_id)
);

CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_organization ON initiatives(organization_id);
CREATE INDEX idx_initiatives_start_date ON initiatives(start_date);
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);

CREATE INDEX idx_initiative_participants_initiative ON initiative_participants(initiative_id);
CREATE INDEX idx_initiative_participants_user ON initiative_participants(user_id);

CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 003: Trees
-- ============================================================================

CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  planted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  antugrow_id TEXT UNIQUE,
  current_height_cm DECIMAL(10, 2) CHECK (current_height_cm >= 0),
  current_diameter_cm DECIMAL(10, 2) CHECK (current_diameter_cm >= 0),
  health_status TEXT CHECK (health_status IN ('healthy', 'stressed', 'diseased', 'dead')),
  last_monitored TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tree_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  antugrow_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trees_initiative ON trees(initiative_id);
CREATE INDEX idx_trees_planted_by ON trees(planted_by);
CREATE INDEX idx_trees_species ON trees(species);
CREATE INDEX idx_trees_health_status ON trees(health_status);
CREATE INDEX idx_trees_antugrow_id ON trees(antugrow_id);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
CREATE INDEX idx_trees_planted_date ON trees(planted_date);

CREATE INDEX idx_tree_images_tree ON tree_images(tree_id);
CREATE INDEX idx_tree_images_captured_at ON tree_images(captured_at);

CREATE TRIGGER update_trees_updated_at
  BEFORE UPDATE ON trees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 004: Carbon Credits
-- ============================================================================

CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  quantity_tons DECIMAL(10, 2) NOT NULL CHECK (quantity_tons > 0),
  price_per_ton DECIMAL(10, 2) NOT NULL CHECK (price_per_ton > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'KES', 'EUR')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_certificate_url TEXT,
  available_quantity DECIMAL(10, 2) NOT NULL CHECK (available_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_available_quantity CHECK (available_quantity <= quantity_tons)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  credit_id UUID REFERENCES carbon_credits(id) ON DELETE SET NULL,
  quantity_tons DECIMAL(10, 2) NOT NULL CHECK (quantity_tons > 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_url TEXT
);

CREATE INDEX idx_carbon_credits_initiative ON carbon_credits(initiative_id);
CREATE INDEX idx_carbon_credits_verification_status ON carbon_credits(verification_status);
CREATE INDEX idx_carbon_credits_currency ON carbon_credits(currency);

CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_credit ON transactions(credit_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

CREATE TRIGGER update_carbon_credits_updated_at
  BEFORE UPDATE ON carbon_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 005: Notifications
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('initiative', 'milestone', 'transaction', 'system', 'achievement', 'quest')),
  read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- ============================================================================
-- MIGRATION 006: Web3 Tables
-- ============================================================================

CREATE TABLE web3_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  chain_id INTEGER NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('ethereum', 'polygon', 'mumbai', 'sepolia')),
  is_primary BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, wallet_address)
);

CREATE TABLE crypto_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('ETH', 'MATIC', 'USDC', 'USDT')),
  amount_usd DECIMAL(10, 2),
  transaction_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT,
  chain_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_web3_wallets_address ON web3_wallets(wallet_address);
CREATE INDEX idx_web3_wallets_user ON web3_wallets(user_id);
CREATE INDEX idx_web3_wallets_network ON web3_wallets(network);
CREATE INDEX idx_web3_wallets_primary ON web3_wallets(user_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX idx_crypto_donations_tx_hash ON crypto_donations(transaction_hash);
CREATE INDEX idx_crypto_donations_user ON crypto_donations(user_id);
CREATE INDEX idx_crypto_donations_initiative ON crypto_donations(initiative_id);
CREATE INDEX idx_crypto_donations_status ON crypto_donations(status);
CREATE INDEX idx_crypto_donations_wallet ON crypto_donations(wallet_address);
CREATE INDEX idx_crypto_donations_created_at ON crypto_donations(created_at DESC);

-- ============================================================================
-- MIGRATION 007: NFT Badges
-- ============================================================================

CREATE TABLE nft_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('tree_planter', 'donor', 'monitor', 'ambassador', 'legend')),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  rarity_score INTEGER DEFAULT 0 CHECK (rarity_score >= 0),
  transaction_hash TEXT NOT NULL,
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attributes JSONB,
  UNIQUE(contract_address, token_id)
);

CREATE TABLE badge_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type TEXT NOT NULL,
  tier TEXT NOT NULL,
  required_points INTEGER NOT NULL CHECK (required_points >= 0),
  required_trees_planted INTEGER DEFAULT 0 CHECK (required_trees_planted >= 0),
  required_donations_made INTEGER DEFAULT 0 CHECK (required_donations_made >= 0),
  required_trees_monitored INTEGER DEFAULT 0 CHECK (required_trees_monitored >= 0),
  required_referrals INTEGER DEFAULT 0 CHECK (required_referrals >= 0),
  max_supply INTEGER CHECK (max_supply > 0),
  current_supply INTEGER DEFAULT 0 CHECK (current_supply >= 0),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_type, tier),
  CONSTRAINT valid_supply CHECK (max_supply IS NULL OR current_supply <= max_supply)
);

CREATE INDEX idx_nft_badges_owner ON nft_badges(owner_address);
CREATE INDEX idx_nft_badges_user ON nft_badges(user_id);
CREATE INDEX idx_nft_badges_type ON nft_badges(badge_type, tier);
CREATE INDEX idx_nft_badges_contract ON nft_badges(contract_address);
CREATE INDEX idx_nft_badges_minted_at ON nft_badges(minted_at DESC);

CREATE INDEX idx_badge_criteria_type_tier ON badge_criteria(badge_type, tier);
CREATE INDEX idx_badge_criteria_active ON badge_criteria(active) WHERE active = TRUE;

-- ============================================================================
-- MIGRATION 008: Gamification
-- ============================================================================

CREATE TABLE user_gamification (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  experience_to_next_level INTEGER DEFAULT 100 CHECK (experience_to_next_level >= 0),
  rank_global INTEGER,
  rank_forest INTEGER,
  badges_earned INTEGER DEFAULT 0 CHECK (badges_earned >= 0),
  achievements_unlocked INTEGER DEFAULT 0 CHECK (achievements_unlocked >= 0),
  referrals_count INTEGER DEFAULT 0 CHECK (referrals_count >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gamified_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('tree_plant', 'donation', 'monitor', 'referral', 'share', 'verify')),
  points_awarded INTEGER NOT NULL CHECK (points_awarded >= 0),
  multiplier DECIMAL(3, 2) DEFAULT 1.0 CHECK (multiplier > 0),
  description TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  points_reward INTEGER NOT NULL CHECK (points_reward >= 0),
  action_type TEXT NOT NULL,
  required_count INTEGER NOT NULL CHECK (required_count > 0),
  timeframe TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_gamification_points ON user_gamification(total_points DESC);
CREATE INDEX idx_user_gamification_level ON user_gamification(level DESC);
CREATE INDEX idx_user_gamification_rank_global ON user_gamification(rank_global);
CREATE INDEX idx_user_gamification_rank_forest ON user_gamification(rank_forest);

CREATE INDEX idx_gamified_actions_user ON gamified_actions(user_id);
CREATE INDEX idx_gamified_actions_type ON gamified_actions(action_type);
CREATE INDEX idx_gamified_actions_date ON gamified_actions(created_at DESC);

CREATE INDEX idx_achievements_active ON achievements(active) WHERE active = TRUE;
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 009: Quests and Referrals
-- ============================================================================

CREATE TABLE challenge_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forest TEXT CHECK (forest IN ('kakamega', 'karura', 'mau')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  objectives JSONB NOT NULL,
  rewards JSONB NOT NULL,
  participants_count INTEGER DEFAULT 0 CHECK (participants_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_quest_dates CHECK (end_date > start_date)
);

CREATE TABLE quest_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES challenge_quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress JSONB,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referee_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referee_id)
);

CREATE INDEX idx_challenge_quests_status ON challenge_quests(status);
CREATE INDEX idx_challenge_quests_forest ON challenge_quests(forest);
CREATE INDEX idx_challenge_quests_dates ON challenge_quests(start_date, end_date);

CREATE INDEX idx_quest_participants_user ON quest_participants(user_id);
CREATE INDEX idx_quest_participants_quest ON quest_participants(quest_id);
CREATE INDEX idx_quest_participants_completed ON quest_participants(completed);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- All tables, indexes, and triggers have been created successfully
-- Next steps: Configure Row Level Security (RLS) policies
-- ============================================================================
