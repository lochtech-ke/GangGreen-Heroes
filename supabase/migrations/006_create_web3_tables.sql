-- Create web3_wallets table
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

-- Create crypto_donations table
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

-- Create indexes
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
