-- Create nft_badges table
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

-- Create badge_criteria table
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

-- Create indexes
CREATE INDEX idx_nft_badges_owner ON nft_badges(owner_address);
CREATE INDEX idx_nft_badges_user ON nft_badges(user_id);
CREATE INDEX idx_nft_badges_type ON nft_badges(badge_type, tier);
CREATE INDEX idx_nft_badges_contract ON nft_badges(contract_address);
CREATE INDEX idx_nft_badges_minted_at ON nft_badges(minted_at DESC);

CREATE INDEX idx_badge_criteria_type_tier ON badge_criteria(badge_type, tier);
CREATE INDEX idx_badge_criteria_active ON badge_criteria(active) WHERE active = TRUE;
