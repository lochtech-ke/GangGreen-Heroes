-- Migration: Update GG Coins from INTEGER to DECIMAL(10,3)
-- This migration adds support for fractional GG Coins with 3 decimal places precision
-- Supports up to 9,999,999.999 GG Coins

-- Step 1: Update user_gamification table
-- Change gg_coins from INTEGER to DECIMAL(10,3)
ALTER TABLE user_gamification
ALTER COLUMN gg_coins TYPE DECIMAL(10,3) USING gg_coins::DECIMAL(10,3);

-- Update the check constraint to work with decimals
ALTER TABLE user_gamification
DROP CONSTRAINT IF EXISTS user_gamification_gg_coins_check;

ALTER TABLE user_gamification
ADD CONSTRAINT user_gamification_gg_coins_check CHECK (gg_coins >= 0);

-- Step 2: Update nft_badges table
-- Change gg_coin_reward from INTEGER to DECIMAL(10,3)
ALTER TABLE nft_badges
ALTER COLUMN gg_coin_reward TYPE DECIMAL(10,3) USING gg_coin_reward::DECIMAL(10,3);

-- Update the check constraint
ALTER TABLE nft_badges
DROP CONSTRAINT IF EXISTS nft_badges_gg_coin_reward_check;

ALTER TABLE nft_badges
ADD CONSTRAINT nft_badges_gg_coin_reward_check CHECK (gg_coin_reward >= 0);

-- Step 3: Update badge_purchases table
-- Change gg_coins_awarded from INTEGER to DECIMAL(10,3)
ALTER TABLE badge_purchases
ALTER COLUMN gg_coins_awarded TYPE DECIMAL(10,3) USING gg_coins_awarded::DECIMAL(10,3);

-- Update the check constraint
ALTER TABLE badge_purchases
DROP CONSTRAINT IF EXISTS badge_purchases_gg_coins_awarded_check;

ALTER TABLE badge_purchases
ADD CONSTRAINT badge_purchases_gg_coins_awarded_check CHECK (gg_coins_awarded >= 0);

-- Step 4: Update gg_coin_transactions table
-- Change amount, balance_before, and balance_after to DECIMAL(10,3)
ALTER TABLE gg_coin_transactions
ALTER COLUMN amount TYPE DECIMAL(10,3) USING amount::DECIMAL(10,3),
ALTER COLUMN balance_before TYPE DECIMAL(10,3) USING balance_before::DECIMAL(10,3),
ALTER COLUMN balance_after TYPE DECIMAL(10,3) USING balance_after::DECIMAL(10,3);

-- Update the check constraints
ALTER TABLE gg_coin_transactions
DROP CONSTRAINT IF EXISTS gg_coin_transactions_amount_check,
DROP CONSTRAINT IF EXISTS gg_coin_transactions_balance_before_check,
DROP CONSTRAINT IF EXISTS gg_coin_transactions_balance_after_check;

ALTER TABLE gg_coin_transactions
ADD CONSTRAINT gg_coin_transactions_amount_check CHECK (amount != 0),
ADD CONSTRAINT gg_coin_transactions_balance_before_check CHECK (balance_before >= 0),
ADD CONSTRAINT gg_coin_transactions_balance_after_check CHECK (balance_after >= 0);

-- Step 5: Update credit_gg_coins function to handle DECIMAL values
CREATE OR REPLACE FUNCTION credit_gg_coins(
  p_user_id UUID,
  p_amount DECIMAL(10,3),
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
  v_balance_before DECIMAL(10,3);
  v_balance_after DECIMAL(10,3);
  v_transaction_id UUID;
BEGIN
  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be greater than zero'
    );
  END IF;

  -- Get current balance with row-level locking to prevent race conditions
  SELECT COALESCE(gg_coins, 0) INTO v_balance_before
  FROM user_gamification
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- If user doesn't have gamification record, create one
  IF NOT FOUND THEN
    INSERT INTO user_gamification (id, gg_coins)
    VALUES (p_user_id, 0)
    ON CONFLICT (id) DO NOTHING;
    v_balance_before := 0;
  END IF;
  
  -- Calculate new balance (round to 3 decimal places)
  v_balance_after := ROUND(v_balance_before + p_amount, 3);
  
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
    ROUND(p_amount, 3),
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
    'amount_credited', ROUND(p_amount, 3)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Step 6: Update debit_gg_coins function to handle DECIMAL values
CREATE OR REPLACE FUNCTION debit_gg_coins(
  p_user_id UUID,
  p_amount DECIMAL(10,3),
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
  v_balance_before DECIMAL(10,3);
  v_balance_after DECIMAL(10,3);
  v_transaction_id UUID;
BEGIN
  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be greater than zero'
    );
  END IF;

  -- Get current balance with row-level locking to prevent race conditions
  SELECT COALESCE(gg_coins, 0) INTO v_balance_before
  FROM user_gamification
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user has sufficient balance
  IF v_balance_before < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient GG Coins balance'
    );
  END IF;
  
  -- Calculate new balance (round to 3 decimal places)
  v_balance_after := ROUND(v_balance_before - p_amount, 3);
  
  -- Ensure balance doesn't go negative due to rounding
  IF v_balance_after < 0 THEN
    v_balance_after := 0;
  END IF;
  
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
    -ROUND(p_amount, 3),
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
    'amount_debited', ROUND(p_amount, 3)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Re-grant execute permissions on updated functions
GRANT EXECUTE ON FUNCTION credit_gg_coins TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION debit_gg_coins TO authenticated, service_role;

-- Add comment to document the change
COMMENT ON COLUMN user_gamification.gg_coins IS 'GG Coin balance with 3 decimal places precision (0.001 = 1 cent)';
COMMENT ON COLUMN gg_coin_transactions.amount IS 'Transaction amount with 3 decimal places precision (positive for credit, negative for debit)';
COMMENT ON COLUMN gg_coin_transactions.balance_before IS 'Balance before transaction with 3 decimal places precision';
COMMENT ON COLUMN gg_coin_transactions.balance_after IS 'Balance after transaction with 3 decimal places precision';
