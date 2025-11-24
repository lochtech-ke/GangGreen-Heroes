# Migration 018 Deployment Guide

## Overview
This migration updates the GG Coins system to support decimal precision (3 decimal places) instead of integers. This allows for fractional GG Coins like 0.500, 0.250, and 0.005.

## What Changes
- `user_gamification.gg_coins`: INTEGER → DECIMAL(10,3)
- `nft_badges.gg_coin_reward`: INTEGER → DECIMAL(10,3)
- `badge_purchases.gg_coins_awarded`: INTEGER → DECIMAL(10,3)
- `gg_coin_transactions.amount`: INTEGER → DECIMAL(10,3)
- `gg_coin_transactions.balance_before`: INTEGER → DECIMAL(10,3)
- `gg_coin_transactions.balance_after`: INTEGER → DECIMAL(10,3)
- Updated `credit_gg_coins()` function to handle decimals
- Updated `debit_gg_coins()` function to handle decimals

## Pre-Deployment Checklist

1. **Backup Database**
   ```sql
   -- Export current GG Coin data
   COPY (SELECT * FROM user_gamification WHERE gg_coins > 0) TO '/tmp/gg_coins_backup.csv' CSV HEADER;
   COPY (SELECT * FROM gg_coin_transactions) TO '/tmp/gg_coin_transactions_backup.csv' CSV HEADER;
   ```

2. **Check Current Data**
   ```sql
   -- Count users with GG Coins
   SELECT COUNT(*) FROM user_gamification WHERE gg_coins > 0;
   
   -- Count transactions
   SELECT COUNT(*) FROM gg_coin_transactions;
   
   -- Check for any active operations
   SELECT COUNT(*) FROM badge_purchases WHERE gg_coins_credited = FALSE;
   ```

3. **Notify Users** (if applicable)
   - Schedule maintenance window
   - Inform users of brief downtime (estimated 1-2 minutes)

## Deployment Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Navigate to SQL Editor in the left sidebar

3. **Execute Migration**
   - Copy the contents of `018_update_gg_coins_to_decimal.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for completion (should take < 30 seconds)

4. **Verify Migration**
   - Copy the contents of `test_018_decimal_migration.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Check that all tests pass

### Option 2: Using Supabase CLI

```bash
# Ensure you're logged in
supabase login

# Link to your project
supabase link --project-ref wobpryllvdjaapzjbsxx

# Apply migration
supabase db push

# Or apply specific migration
psql $DATABASE_URL -f supabase/migrations/018_update_gg_coins_to_decimal.sql
```

## Post-Deployment Verification

### 1. Check Column Types
```sql
SELECT 
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name IN ('user_gamification', 'gg_coin_transactions', 'badge_purchases', 'nft_badges')
  AND column_name LIKE '%gg_coin%' OR column_name IN ('amount', 'balance_before', 'balance_after');
```

Expected output:
- All GG Coin columns should be `numeric` with precision 10 and scale 3

### 2. Test Functions
```sql
-- Test credit function
SELECT credit_gg_coins(
  auth.uid(),
  0.500,
  'purchase_reward',
  'badge_purchase',
  NULL,
  'Test decimal credit',
  NULL
);

-- Check balance
SELECT gg_coins FROM user_gamification WHERE id = auth.uid();
```

### 3. Verify Existing Data
```sql
-- Check that existing balances were preserved
SELECT 
  id,
  gg_coins,
  CASE 
    WHEN gg_coins = FLOOR(gg_coins) THEN 'Integer preserved'
    ELSE 'Has decimals'
  END as status
FROM user_gamification
WHERE gg_coins > 0
LIMIT 10;
```

### 4. Run Test Suite
Execute the test script:
```sql
-- Run all tests
\i supabase/migrations/test_018_decimal_migration.sql
```

All tests should pass with "ALL TESTS PASSED!" message.

## Rollback Plan

If issues occur, you can rollback the migration:

```sql
-- Rollback to INTEGER (WARNING: This will truncate decimal values!)
ALTER TABLE user_gamification
ALTER COLUMN gg_coins TYPE INTEGER USING FLOOR(gg_coins);

ALTER TABLE nft_badges
ALTER COLUMN gg_coin_reward TYPE INTEGER USING FLOOR(gg_coin_reward);

ALTER TABLE badge_purchases
ALTER COLUMN gg_coins_awarded TYPE INTEGER USING FLOOR(gg_coins_awarded);

ALTER TABLE gg_coin_transactions
ALTER COLUMN amount TYPE INTEGER USING FLOOR(amount),
ALTER COLUMN balance_before TYPE INTEGER USING FLOOR(balance_before),
ALTER COLUMN balance_after TYPE INTEGER USING FLOOR(balance_after);

-- Restore old functions (copy from migration 014)
```

**Note**: Rollback will lose decimal precision. Only use if critical issues occur.

## Expected Impact

### Performance
- Minimal impact: DECIMAL operations are slightly slower than INTEGER but negligible for this use case
- Indexes remain efficient
- No change to query patterns

### Data Integrity
- All existing integer values are preserved (e.g., 5 becomes 5.000)
- No data loss during migration
- Constraints remain enforced

### Application Code
- TypeScript service layer needs update to handle decimal values
- UI components need update to display decimals (e.g., "1.500 GG Coins")
- Reward calculation needs implementation

## Troubleshooting

### Issue: Migration fails with constraint violation
**Solution**: Check for any negative balances or invalid data
```sql
SELECT * FROM user_gamification WHERE gg_coins < 0;
SELECT * FROM gg_coin_transactions WHERE balance_before < 0 OR balance_after < 0;
```

### Issue: Function execution fails
**Solution**: Verify function signatures
```sql
SELECT routine_name, data_type 
FROM information_schema.routines 
WHERE routine_name IN ('credit_gg_coins', 'debit_gg_coins');
```

### Issue: Existing data looks wrong
**Solution**: Restore from backup
```sql
-- Restore from backup CSV
COPY user_gamification FROM '/tmp/gg_coins_backup.csv' CSV HEADER;
```

## Next Steps

After successful deployment:

1. Update TypeScript service (`src/services/ggCoin.service.ts`)
2. Update type definitions (`src/types/ggCoin.types.ts`)
3. Implement `calculatePurchaseReward()` method
4. Update UI components to display decimals
5. Run integration tests
6. Monitor for any issues

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Review error messages carefully
3. Consult the test script for validation
4. Contact development team if needed

## Estimated Downtime

- Small databases (< 1000 users): < 10 seconds
- Medium databases (1000-10000 users): 10-30 seconds
- Large databases (> 10000 users): 30-60 seconds

The migration is designed to be fast and non-blocking where possible.
