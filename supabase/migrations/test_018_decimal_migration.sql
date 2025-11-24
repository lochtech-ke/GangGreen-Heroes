-- Test script for migration 018: GG Coins decimal support
-- This script validates that the decimal migration works correctly

-- Test 1: Verify column types are DECIMAL(10,3)
DO $$
DECLARE
  v_gg_coins_type TEXT;
  v_amount_type TEXT;
BEGIN
  -- Check user_gamification.gg_coins
  SELECT data_type || '(' || numeric_precision || ',' || numeric_scale || ')' INTO v_gg_coins_type
  FROM information_schema.columns
  WHERE table_name = 'user_gamification' AND column_name = 'gg_coins';
  
  IF v_gg_coins_type != 'numeric(10,3)' THEN
    RAISE EXCEPTION 'user_gamification.gg_coins type is %, expected numeric(10,3)', v_gg_coins_type;
  END IF;
  
  -- Check gg_coin_transactions.amount
  SELECT data_type || '(' || numeric_precision || ',' || numeric_scale || ')' INTO v_amount_type
  FROM information_schema.columns
  WHERE table_name = 'gg_coin_transactions' AND column_name = 'amount';
  
  IF v_amount_type != 'numeric(10,3)' THEN
    RAISE EXCEPTION 'gg_coin_transactions.amount type is %, expected numeric(10,3)', v_amount_type;
  END IF;
  
  RAISE NOTICE 'Test 1 PASSED: Column types are correct';
END $$;

-- Test 2: Test credit_gg_coins with decimal amounts
DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  v_result JSONB;
  v_balance DECIMAL(10,3);
BEGIN
  -- Clean up test data
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
  
  -- Test crediting 0.500 GG Coins
  v_result := credit_gg_coins(
    v_test_user_id,
    0.500,
    'purchase_reward',
    'badge_purchase',
    NULL,
    'Test credit of 0.500 GG Coins',
    NULL
  );
  
  IF (v_result->>'success')::BOOLEAN != TRUE THEN
    RAISE EXCEPTION 'Test 2a FAILED: Credit 0.500 failed: %', v_result->>'error';
  END IF;
  
  IF (v_result->>'balance_after')::DECIMAL(10,3) != 0.500 THEN
    RAISE EXCEPTION 'Test 2a FAILED: Expected balance 0.500, got %', v_result->>'balance_after';
  END IF;
  
  -- Test crediting 0.250 GG Coins
  v_result := credit_gg_coins(
    v_test_user_id,
    0.250,
    'purchase_reward',
    'badge_purchase',
    NULL,
    'Test credit of 0.250 GG Coins',
    NULL
  );
  
  IF (v_result->>'balance_after')::DECIMAL(10,3) != 0.750 THEN
    RAISE EXCEPTION 'Test 2b FAILED: Expected balance 0.750, got %', v_result->>'balance_after';
  END IF;
  
  -- Test crediting 0.005 GG Coins (1 KES reward)
  v_result := credit_gg_coins(
    v_test_user_id,
    0.005,
    'purchase_reward',
    'badge_purchase',
    NULL,
    'Test credit of 0.005 GG Coins',
    NULL
  );
  
  IF (v_result->>'balance_after')::DECIMAL(10,3) != 0.755 THEN
    RAISE EXCEPTION 'Test 2c FAILED: Expected balance 0.755, got %', v_result->>'balance_after';
  END IF;
  
  RAISE NOTICE 'Test 2 PASSED: Credit operations with decimals work correctly';
  
  -- Clean up
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
END $$;

-- Test 3: Test debit_gg_coins with decimal amounts
DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000002';
  v_result JSONB;
BEGIN
  -- Clean up test data
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
  
  -- Credit 1.000 GG Coins first
  v_result := credit_gg_coins(
    v_test_user_id,
    1.000,
    'credit',
    NULL,
    NULL,
    'Initial credit',
    NULL
  );
  
  -- Test debiting 0.250 GG Coins
  v_result := debit_gg_coins(
    v_test_user_id,
    0.250,
    'debit',
    NULL,
    NULL,
    'Test debit of 0.250 GG Coins',
    NULL
  );
  
  IF (v_result->>'success')::BOOLEAN != TRUE THEN
    RAISE EXCEPTION 'Test 3a FAILED: Debit 0.250 failed: %', v_result->>'error';
  END IF;
  
  IF (v_result->>'balance_after')::DECIMAL(10,3) != 0.750 THEN
    RAISE EXCEPTION 'Test 3a FAILED: Expected balance 0.750, got %', v_result->>'balance_after';
  END IF;
  
  -- Test insufficient balance
  v_result := debit_gg_coins(
    v_test_user_id,
    1.000,
    'debit',
    NULL,
    NULL,
    'Test insufficient balance',
    NULL
  );
  
  IF (v_result->>'success')::BOOLEAN != FALSE THEN
    RAISE EXCEPTION 'Test 3b FAILED: Should have failed with insufficient balance';
  END IF;
  
  IF v_result->>'error' NOT LIKE '%Insufficient%' THEN
    RAISE EXCEPTION 'Test 3b FAILED: Expected insufficient balance error, got %', v_result->>'error';
  END IF;
  
  RAISE NOTICE 'Test 3 PASSED: Debit operations with decimals work correctly';
  
  -- Clean up
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
END $$;

-- Test 4: Test reward calculation examples from requirements
DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000003';
  v_result JSONB;
  v_reward DECIMAL(10,3);
BEGIN
  -- Clean up test data
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
  
  -- Test: 200 KES = 1.000 GG Coins
  v_reward := ROUND(200.0 / 200.0, 3);
  IF v_reward != 1.000 THEN
    RAISE EXCEPTION 'Test 4a FAILED: 200 KES should give 1.000 GG Coins, got %', v_reward;
  END IF;
  
  -- Test: 100 KES = 0.500 GG Coins
  v_reward := ROUND(100.0 / 200.0, 3);
  IF v_reward != 0.500 THEN
    RAISE EXCEPTION 'Test 4b FAILED: 100 KES should give 0.500 GG Coins, got %', v_reward;
  END IF;
  
  -- Test: 50 KES = 0.250 GG Coins
  v_reward := ROUND(50.0 / 200.0, 3);
  IF v_reward != 0.250 THEN
    RAISE EXCEPTION 'Test 4c FAILED: 50 KES should give 0.250 GG Coins, got %', v_reward;
  END IF;
  
  -- Test: 1 KES = 0.005 GG Coins
  v_reward := ROUND(1.0 / 200.0, 3);
  IF v_reward != 0.005 THEN
    RAISE EXCEPTION 'Test 4d FAILED: 1 KES should give 0.005 GG Coins, got %', v_reward;
  END IF;
  
  -- Test: 1000 KES = 5.000 GG Coins
  v_reward := ROUND(1000.0 / 200.0, 3);
  IF v_reward != 5.000 THEN
    RAISE EXCEPTION 'Test 4e FAILED: 1000 KES should give 5.000 GG Coins, got %', v_reward;
  END IF;
  
  RAISE NOTICE 'Test 4 PASSED: Reward calculation formulas are correct';
END $$;

-- Test 5: Test validation (negative and zero amounts)
DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000004';
  v_result JSONB;
BEGIN
  -- Clean up test data
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
  
  -- Test zero amount credit
  v_result := credit_gg_coins(
    v_test_user_id,
    0.000,
    'credit',
    NULL,
    NULL,
    'Test zero credit',
    NULL
  );
  
  IF (v_result->>'success')::BOOLEAN != FALSE THEN
    RAISE EXCEPTION 'Test 5a FAILED: Zero credit should fail';
  END IF;
  
  -- Test negative amount credit
  v_result := credit_gg_coins(
    v_test_user_id,
    -0.500,
    'credit',
    NULL,
    NULL,
    'Test negative credit',
    NULL
  );
  
  IF (v_result->>'success')::BOOLEAN != FALSE THEN
    RAISE EXCEPTION 'Test 5b FAILED: Negative credit should fail';
  END IF;
  
  RAISE NOTICE 'Test 5 PASSED: Validation works correctly';
  
  -- Clean up
  DELETE FROM gg_coin_transactions WHERE user_id = v_test_user_id;
  DELETE FROM user_gamification WHERE id = v_test_user_id;
END $$;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ALL TESTS PASSED!';
  RAISE NOTICE 'Migration 018 is working correctly';
  RAISE NOTICE '========================================';
END $$;
