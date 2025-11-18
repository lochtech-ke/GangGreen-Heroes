-- Add GG Coins column to user_gamification table
ALTER TABLE user_gamification
ADD COLUMN gg_coins INTEGER DEFAULT 0 CHECK (gg_coins >= 0);

-- Add price and reward columns to nft_badges table
ALTER TABLE nft_badges
ADD COLUMN price_kes INTEGER CHECK (price_kes >= 0),
ADD COLUMN gg_coin_reward INTEGER DEFAULT 1 CHECK (gg_coin_reward >= 0),
ADD COLUMN is_purchasable BOOLEAN DEFAULT FALSE;

-- Create badge_purchases table
CREATE TABLE badge_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES nft_badges(id) ON DELETE SET NULL,
  badge_type TEXT NOT NULL,
  tier TEXT NOT NULL,
  amount_kes INTEGER NOT NULL CHECK (amount_kes > 0),
  paystack_reference TEXT NOT NULL UNIQUE,
  paystack_access_code TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'abandoned')),
  gg_coins_awarded INTEGER DEFAULT 0 CHECK (gg_coins_awarded >= 0),
  gg_coins_credited BOOLEAN DEFAULT FALSE,
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gg_coin_transactions table for audit trail
CREATE TABLE gg_coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'purchase_reward', 'referral_bonus', 'achievement_reward', 'admin_adjustment')),
  amount INTEGER NOT NULL CHECK (amount != 0),
  balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  reference_type TEXT CHECK (reference_type IN ('badge_purchase', 'referral', 'achievement', 'admin', 'other')),
  reference_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for badge_purchases
CREATE INDEX idx_badge_purchases_user ON badge_purchases(user_id);
CREATE INDEX idx_badge_purchases_status ON badge_purchases(payment_status);
CREATE INDEX idx_badge_purchases_reference ON badge_purchases(paystack_reference);
CREATE INDEX idx_badge_purchases_created_at ON badge_purchases(created_at DESC);
CREATE INDEX idx_badge_purchases_badge ON badge_purchases(badge_id);
CREATE INDEX idx_badge_purchases_coins_credited ON badge_purchases(gg_coins_credited) WHERE gg_coins_credited = FALSE;

-- Create indexes for gg_coin_transactions
CREATE INDEX idx_gg_coin_transactions_user ON gg_coin_transactions(user_id);
CREATE INDEX idx_gg_coin_transactions_type ON gg_coin_transactions(transaction_type);
CREATE INDEX idx_gg_coin_transactions_created_at ON gg_coin_transactions(created_at DESC);
CREATE INDEX idx_gg_coin_transactions_reference ON gg_coin_transactions(reference_type, reference_id);

-- Create index for gg_coins on user_gamification
CREATE INDEX idx_user_gamification_gg_coins ON user_gamification(gg_coins DESC);

-- Add trigger for updated_at on badge_purchases
CREATE TRIGGER update_badge_purchases_updated_at
  BEFORE UPDATE ON badge_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for badge_purchases
ALTER TABLE badge_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own badge purchases"
  ON badge_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own purchases
CREATE POLICY "Users can create own badge purchases"
  ON badge_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update purchases (for webhook)
CREATE POLICY "Service role can update badge purchases"
  ON badge_purchases FOR UPDATE
  USING (true);

-- Add RLS policies for gg_coin_transactions
ALTER TABLE gg_coin_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own GG Coin transactions"
  ON gg_coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert transactions
CREATE POLICY "Service role can insert GG Coin transactions"
  ON gg_coin_transactions FOR INSERT
  WITH CHECK (true);

-- Create function to credit GG Coins with transaction logging
CREATE OR REPLACE FUNCTION credit_gg_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT COALESCE(gg_coins, 0) INTO v_balance_before
  FROM user_gamification
  WHERE id = p_user_id;
  
  -- If user doesn't have gamification record, create one
  IF v_balance_before IS NULL THEN
    INSERT INTO user_gamification (id, gg_coins)
    VALUES (p_user_id, 0)
    ON CONFLICT (id) DO NOTHING;
    v_balance_before := 0;
  END IF;
  
  -- Calculate new balance
  v_balance_after := v_balance_before + p_amount;
  
  -- Update balance
  UPDATE user_gamification
  SET gg_coins = v_balance_after,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log transaction
  INSERT INTO gg_coin_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    reference_type,
    reference_id,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount,
    v_balance_before,
    v_balance_after,
    p_reference_type,
    p_reference_id,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'amount_credited', p_amount
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Create function to debit GG Coins with transaction logging
CREATE OR REPLACE FUNCTION debit_gg_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT COALESCE(gg_coins, 0) INTO v_balance_before
  FROM user_gamification
  WHERE id = p_user_id;
  
  -- Check if user has sufficient balance
  IF v_balance_before < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient GG Coins balance'
    );
  END IF;
  
  -- Calculate new balance
  v_balance_after := v_balance_before - p_amount;
  
  -- Update balance
  UPDATE user_gamification
  SET gg_coins = v_balance_after,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log transaction (amount is negative for debit)
  INSERT INTO gg_coin_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    reference_type,
    reference_id,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_transaction_type,
    -p_amount,
    v_balance_before,
    v_balance_after,
    p_reference_type,
    p_reference_id,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'amount_debited', p_amount
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION credit_gg_coins TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION debit_gg_coins TO authenticated, service_role;
