-- Migration: Add GangGreen Hero Badge System
-- Description: Creates tables for Hero badge purchases, daily rewards, benefits tracking, and configuration
-- Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3

-- ============================================================================
-- HERO BADGE CONFIGURATION
-- ============================================================================

-- Hero badge configuration table
CREATE TABLE IF NOT EXISTS hero_badge_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type VARCHAR(50) NOT NULL DEFAULT 'ganggreen_hero',
  tier VARCHAR(20) NOT NULL DEFAULT 'hero',
  price_kes INTEGER NOT NULL DEFAULT 500,
  daily_gg_coin_reward DECIMAL(10,3) NOT NULL DEFAULT 0.100,
  initiative_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.50,
  marketplace_discount DECIMAL(5,2) NOT NULL DEFAULT 0.10,
  content_priority_boost INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BADGE PURCHASES TABLE (Create if not exists)
-- ============================================================================

-- Badge purchases table (extends existing badge purchase system)
CREATE TABLE IF NOT EXISTS badge_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id VARCHAR(100),
  badge_type VARCHAR(50) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  amount_kes INTEGER NOT NULL,
  paystack_reference VARCHAR(100) NOT NULL UNIQUE,
  paystack_access_code VARCHAR(100),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'abandoned')),
  gg_coins_awarded DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  gg_coins_credited BOOLEAN DEFAULT FALSE,
  transaction_hash VARCHAR(100),
  badge_svg TEXT,
  badge_metadata JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add hero badge specific columns to badge_purchases table
ALTER TABLE badge_purchases 
ADD COLUMN IF NOT EXISTS is_hero_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_benefits_activated BOOLEAN DEFAULT false;

-- ============================================================================
-- GG COIN TABLES (Create if not exists)
-- ============================================================================

-- GG Coin balances table
CREATE TABLE IF NOT EXISTS gg_coin_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,3) NOT NULL DEFAULT 0.000 CHECK (balance >= 0),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GG Coin transactions table
CREATE TABLE IF NOT EXISTS gg_coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'purchase_reward', 'referral_bonus', 'achievement_reward', 'admin_adjustment', 'hero_daily_reward')),
  amount DECIMAL(10,3) NOT NULL,
  balance_before DECIMAL(10,3) NOT NULL,
  balance_after DECIMAL(10,3) NOT NULL,
  reference_type VARCHAR(30) CHECK (reference_type IN ('badge_purchase', 'referral', 'achievement', 'admin', 'hero_reward', 'other')),
  reference_id VARCHAR(100),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- HERO BADGE HOLDERS
-- ============================================================================

-- Hero badge holders table
CREATE TABLE IF NOT EXISTS hero_badge_holders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_purchase_id UUID NOT NULL REFERENCES badge_purchases(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_reward_date TIMESTAMP WITH TIME ZONE,
  total_rewards_earned DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  consecutive_reward_days INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  suspension_reason TEXT,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended'))
);

-- ============================================================================
-- HERO DAILY REWARDS
-- ============================================================================

-- Hero daily rewards table
CREATE TABLE IF NOT EXISTS hero_daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  base_amount DECIMAL(10,3) NOT NULL,
  bonus_amount DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  total_amount DECIMAL(10,3) NOT NULL,
  consecutive_days INTEGER NOT NULL DEFAULT 1,
  activity_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  gg_coin_transaction_id UUID REFERENCES gg_coin_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, reward_date)
);

-- ============================================================================
-- HERO BENEFIT USAGE
-- ============================================================================

-- Hero benefit usage table
CREATE TABLE IF NOT EXISTS hero_benefit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_type VARCHAR(50) NOT NULL,
  usage_context VARCHAR(100),
  value_applied DECIMAL(10,3),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Hero badge config indexes
CREATE INDEX IF NOT EXISTS idx_hero_badge_config_active ON hero_badge_config(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_hero_badge_config_type ON hero_badge_config(badge_type);

-- Badge purchases indexes
CREATE INDEX IF NOT EXISTS idx_badge_purchases_user ON badge_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_purchases_reference ON badge_purchases(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_badge_purchases_status ON badge_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_badge_purchases_hero ON badge_purchases(is_hero_badge) WHERE is_hero_badge = TRUE;
CREATE INDEX IF NOT EXISTS idx_badge_purchases_created_at ON badge_purchases(created_at DESC);

-- GG Coin balances indexes
CREATE INDEX IF NOT EXISTS idx_gg_coin_balances_balance ON gg_coin_balances(balance DESC);

-- GG Coin transactions indexes
CREATE INDEX IF NOT EXISTS idx_gg_coin_transactions_user ON gg_coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gg_coin_transactions_type ON gg_coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gg_coin_transactions_reference ON gg_coin_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_gg_coin_transactions_created_at ON gg_coin_transactions(created_at DESC);

-- Hero badge holders indexes
CREATE INDEX IF NOT EXISTS idx_hero_badge_holders_user ON hero_badge_holders(user_id);
CREATE INDEX IF NOT EXISTS idx_hero_badge_holders_status ON hero_badge_holders(status);
CREATE INDEX IF NOT EXISTS idx_hero_badge_holders_last_reward ON hero_badge_holders(last_reward_date);
CREATE INDEX IF NOT EXISTS idx_hero_badge_holders_purchase ON hero_badge_holders(badge_purchase_id);

-- Hero daily rewards indexes
CREATE INDEX IF NOT EXISTS idx_hero_daily_rewards_user ON hero_daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_hero_daily_rewards_date ON hero_daily_rewards(reward_date DESC);
CREATE INDEX IF NOT EXISTS idx_hero_daily_rewards_transaction ON hero_daily_rewards(gg_coin_transaction_id);

-- Hero benefit usage indexes
CREATE INDEX IF NOT EXISTS idx_hero_benefit_usage_user ON hero_benefit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_hero_benefit_usage_type ON hero_benefit_usage(benefit_type);
CREATE INDEX IF NOT EXISTS idx_hero_benefit_usage_date ON hero_benefit_usage(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Create or replace the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at (idempotent - drop if exists first)
DROP TRIGGER IF EXISTS update_hero_badge_config_updated_at ON hero_badge_config;
CREATE TRIGGER update_hero_badge_config_updated_at 
  BEFORE UPDATE ON hero_badge_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_badge_purchases_updated_at ON badge_purchases;
CREATE TRIGGER update_badge_purchases_updated_at 
  BEFORE UPDATE ON badge_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_badge_holders_updated_at ON hero_badge_holders;
CREATE TRIGGER update_hero_badge_holders_updated_at 
  BEFORE UPDATE ON hero_badge_holders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gg_coin_balances_updated_at ON gg_coin_balances;
CREATE TRIGGER update_gg_coin_balances_updated_at 
  BEFORE UPDATE ON gg_coin_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default Hero badge configuration
INSERT INTO hero_badge_config (
  badge_type, 
  tier, 
  price_kes, 
  daily_gg_coin_reward,
  initiative_multiplier, 
  marketplace_discount, 
  content_priority_boost
) VALUES (
  'ganggreen_hero', 
  'hero', 
  500, 
  0.100,
  1.50, 
  0.10, 
  2
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE hero_badge_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE gg_coin_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE gg_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_badge_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_benefit_usage ENABLE ROW LEVEL SECURITY;

-- Hero badge config policies (read-only for users, full access for admins)
CREATE POLICY "Hero badge config is viewable by everyone" ON hero_badge_config
  FOR SELECT USING (true);

CREATE POLICY "Hero badge config is manageable by admins" ON hero_badge_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Badge purchases policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own badge purchases" ON badge_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badge purchases" ON badge_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badge purchases" ON badge_purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all badge purchases" ON badge_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- GG Coin balances policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own GG coin balance" ON gg_coin_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage GG coin balances" ON gg_coin_balances
  FOR ALL USING (true);

-- GG Coin transactions policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own GG coin transactions" ON gg_coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert GG coin transactions" ON gg_coin_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all GG coin transactions" ON gg_coin_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Hero badge holders policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own hero badge status" ON hero_badge_holders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage hero badge holders" ON hero_badge_holders
  FOR ALL USING (true);

-- Hero daily rewards policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own hero daily rewards" ON hero_daily_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage hero daily rewards" ON hero_daily_rewards
  FOR ALL USING (true);

-- Hero benefit usage policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own hero benefit usage" ON hero_benefit_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert hero benefit usage" ON hero_benefit_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all hero benefit usage" ON hero_benefit_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE hero_badge_config IS 'Configuration settings for GangGreen Hero badges including pricing and rewards';
COMMENT ON TABLE badge_purchases IS 'Records of all badge purchases including Hero badges with Paystack integration';
COMMENT ON TABLE gg_coin_balances IS 'Current GG Coin balances for all users';
COMMENT ON TABLE gg_coin_transactions IS 'Transaction history for all GG Coin operations';
COMMENT ON TABLE hero_badge_holders IS 'Users who own GangGreen Hero badges and their status';
COMMENT ON TABLE hero_daily_rewards IS 'Daily GG Coin rewards distributed to Hero badge holders';
COMMENT ON TABLE hero_benefit_usage IS 'Tracking of Hero badge benefits usage for analytics';

COMMENT ON COLUMN hero_badge_config.daily_gg_coin_reward IS 'Daily GG Coin reward amount for Hero badge holders (3 decimal precision)';
COMMENT ON COLUMN hero_badge_config.initiative_multiplier IS 'Multiplier applied to initiative rewards for Hero users';
COMMENT ON COLUMN hero_badge_config.marketplace_discount IS 'Discount percentage applied to marketplace transactions';
COMMENT ON COLUMN hero_badge_config.content_priority_boost IS 'Priority boost level for Hero user content in feeds';

COMMENT ON COLUMN badge_purchases.is_hero_badge IS 'Flag indicating if this purchase is for a Hero badge';
COMMENT ON COLUMN badge_purchases.hero_benefits_activated IS 'Flag indicating if Hero benefits have been activated for this purchase';

COMMENT ON COLUMN hero_badge_holders.consecutive_reward_days IS 'Number of consecutive days user has received rewards';
COMMENT ON COLUMN hero_badge_holders.total_rewards_earned IS 'Total GG Coins earned through Hero badge rewards';

COMMENT ON COLUMN hero_daily_rewards.consecutive_days IS 'Consecutive days of rewards at time of this reward';
COMMENT ON COLUMN hero_daily_rewards.activity_multiplier IS 'Multiplier based on user activity level';
