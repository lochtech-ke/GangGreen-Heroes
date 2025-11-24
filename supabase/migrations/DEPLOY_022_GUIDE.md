# Migration 022: GangGreen Hero Badge System Deployment Guide

## Overview
This migration adds the complete GangGreen Hero Badge system including:
- Hero badge configuration
- Badge purchases table (with Hero badge support)
- GG Coin system tables
- Hero badge holders tracking
- Daily rewards system
- Benefit usage analytics

## Prerequisites
- Supabase project must be set up
- Auth system must be configured
- Previous migrations (001-021) should be applied

## Deployment Steps

### 1. Apply Migration
```sql
-- Execute in Supabase SQL Editor
\i supabase/migrations/022_add_hero_badge_system.sql
```

### 2. Verify Tables Created
Check that all tables were created successfully:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'hero_badge_config',
  'badge_purchases', 
  'gg_coin_balances',
  'gg_coin_transactions',
  'hero_badge_holders',
  'hero_daily_rewards',
  'hero_benefit_usage'
);
```

### 3. Verify Seed Data
Check that default configuration was inserted:
```sql
SELECT * FROM hero_badge_config WHERE badge_type = 'ganggreen_hero';
```

Expected result:
- badge_type: 'ganggreen_hero'
- tier: 'hero'
- price_kes: 500
- daily_gg_coin_reward: 0.100
- initiative_multiplier: 1.50
- marketplace_discount: 0.10
- content_priority_boost: 2

### 4. Verify Indexes
Check that performance indexes were created:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN (
  'hero_badge_config',
  'badge_purchases',
  'gg_coin_balances', 
  'gg_coin_transactions',
  'hero_badge_holders',
  'hero_daily_rewards',
  'hero_benefit_usage'
)
ORDER BY tablename, indexname;
```

### 5. Verify RLS Policies
Check that Row Level Security policies are active:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN (
  'hero_badge_config',
  'badge_purchases',
  'gg_coin_balances',
  'gg_coin_transactions', 
  'hero_badge_holders',
  'hero_daily_rewards',
  'hero_benefit_usage'
)
ORDER BY tablename, policyname;
```

## Configuration

### Hero Badge Settings
The default Hero badge configuration can be modified:
```sql
UPDATE hero_badge_config 
SET 
  price_kes = 500,                    -- Badge price in KES
  daily_gg_coin_reward = 0.100,       -- Daily reward amount
  initiative_multiplier = 1.50,       -- Initiative reward multiplier
  marketplace_discount = 0.10,        -- 10% marketplace discount
  content_priority_boost = 2          -- Content priority level
WHERE badge_type = 'ganggreen_hero';
```

## Testing

### 1. Test Hero Badge Purchase Flow
```sql
-- Insert test badge purchase
INSERT INTO badge_purchases (
  user_id, badge_type, tier, amount_kes, 
  paystack_reference, payment_status, 
  gg_coins_awarded, is_hero_badge
) VALUES (
  'test-user-id', 'ganggreen_hero', 'hero', 500,
  'test-ref-123', 'success', 2.500, true
);

-- Insert hero badge holder
INSERT INTO hero_badge_holders (
  user_id, badge_purchase_id, purchase_date
) VALUES (
  'test-user-id', 
  (SELECT id FROM badge_purchases WHERE paystack_reference = 'test-ref-123'),
  NOW()
);
```

### 2. Test Daily Reward System
```sql
-- Insert test daily reward
INSERT INTO hero_daily_rewards (
  user_id, reward_date, base_amount, total_amount
) VALUES (
  'test-user-id', CURRENT_DATE, 0.100, 0.100
);
```

### 3. Test GG Coin System
```sql
-- Insert test GG coin balance
INSERT INTO gg_coin_balances (user_id, balance) 
VALUES ('test-user-id', 5.000);

-- Insert test transaction
INSERT INTO gg_coin_transactions (
  user_id, transaction_type, amount, 
  balance_before, balance_after,
  reference_type, description
) VALUES (
  'test-user-id', 'hero_daily_reward', 0.100,
  4.900, 5.000, 'hero_reward',
  'Daily Hero badge reward'
);
```

## Rollback (if needed)

If you need to rollback this migration:
```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS hero_benefit_usage CASCADE;
DROP TABLE IF EXISTS hero_daily_rewards CASCADE;
DROP TABLE IF EXISTS hero_badge_holders CASCADE;
DROP TABLE IF EXISTS gg_coin_transactions CASCADE;
DROP TABLE IF EXISTS gg_coin_balances CASCADE;

-- Remove Hero badge columns from badge_purchases
ALTER TABLE badge_purchases 
DROP COLUMN IF EXISTS is_hero_badge,
DROP COLUMN IF EXISTS hero_benefits_activated;

DROP TABLE IF EXISTS hero_badge_config CASCADE;
```

## Post-Deployment

1. **Update Application Configuration**: Ensure environment variables are set for Hero badge pricing and rewards
2. **Test Payment Integration**: Verify Paystack integration works with Hero badge purchases
3. **Set Up Cron Jobs**: Configure daily reward distribution automation
4. **Monitor Performance**: Check query performance with the new indexes
5. **Verify Security**: Test RLS policies with different user roles

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check that auth.users table exists and previous migrations are applied
2. **Trigger Already Exists Error**: This migration is now idempotent - it will drop existing triggers before recreating them. If you still see errors, manually drop the conflicting trigger:
   ```sql
   DROP TRIGGER IF EXISTS update_badge_purchases_updated_at ON badge_purchases;
   ```
3. **RLS Policies Not Working**: Verify user roles are properly set in auth.users.raw_user_meta_data
4. **Indexes Not Created**: Check for naming conflicts with existing indexes
5. **Seed Data Missing**: Verify the INSERT statement executed successfully

### Performance Monitoring
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE tablename IN (
  'hero_badge_holders', 'hero_daily_rewards', 'gg_coin_transactions'
);
```

## Support
For issues with this migration, check:
1. Supabase logs for detailed error messages
2. Database connection and permissions
3. Previous migration status
4. Auth system configuration