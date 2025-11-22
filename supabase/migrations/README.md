# Database Migrations

This directory contains SQL migration scripts for the GangGreen platform database schema.

## Migration Files

1. **001_create_users_and_profiles.sql** - User authentication and profile tables
2. **002_create_initiatives.sql** - Tree planting initiatives and participants
3. **003_create_trees.sql** - Tree registry and monitoring
4. **004_create_carbon_credits.sql** - Carbon credit marketplace and transactions
5. **005_create_notifications.sql** - User notification system
6. **006_create_web3_tables.sql** - Web3 wallets and crypto donations
7. **007_create_nft_badges.sql** - NFT badge reward system
8. **008_create_gamification.sql** - Gamification and achievement system
9. **009_create_quests_and_referrals.sql** - Challenge quests and referral system
10. **010_rls_policies.sql** - Row-level security policies
11. **011_fix_user_registration.sql** - User registration fixes
12. **012_create_chatbot_tables.sql** - Chatbot conversation tables
13. **013_add_paystack_fields.sql** - Paystack payment integration
14. **014_add_badge_purchases_and_gg_coins.sql** - Badge purchases and GG Coins system
15. **015_add_social_feed_tables.sql** - Social media feed tables
16. **016_add_governance_token_system.sql** - Governance token system
17. **017_add_individual_user_journey_tables.sql** - Individual user journey tracking
18. **018_update_gg_coins_to_decimal.sql** - Update GG Coins to support decimal precision (3 decimal places)
19. **019_add_antugrow_integration_tables.sql** - Antugrow API integration (sync logs, webhooks, SMS alerts)

## How to Execute Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard at https://app.supabase.com
2. Navigate to the SQL Editor
3. Copy and paste each migration file content in order (001 → 009)
4. Execute each migration by clicking "Run"
5. Verify successful execution before proceeding to the next migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wobpryllvdjaapzjbsxx

# Run migrations
supabase db push
```

### Option 3: Manual Execution

If you prefer to run all migrations at once:

```bash
# Concatenate all migrations into a single file
cat supabase/migrations/*.sql > supabase/migrations/all_migrations.sql

# Then execute via Supabase Dashboard SQL Editor
```

## Post-Migration Steps

After running all migrations:

1. Verify all tables are created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. Check indexes:
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```

3. Verify extensions:
   ```sql
   SELECT * FROM pg_extension;
   ```

## Database Schema Overview

### Core Tables
- `users` - User accounts with roles
- `user_profiles` - Extended user profile information
- `initiatives` - Tree planting initiatives
- `trees` - Individual tree records with geospatial data
- `carbon_credits` - Carbon credit marketplace
- `transactions` - Financial transactions

### Web3 Tables
- `web3_wallets` - Connected cryptocurrency wallets
- `crypto_donations` - Blockchain donation records
- `nft_badges` - NFT badge ownership
- `badge_criteria` - Badge earning requirements

### Gamification Tables
- `user_gamification` - User points, levels, and rankings
- `gamified_actions` - Tracked user actions
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements
- `challenge_quests` - Time-limited challenges
- `quest_participants` - Quest participation tracking
- `referrals` - User referral system

### Supporting Tables
- `notifications` - User notifications
- `initiative_participants` - Initiative participation
- `tree_images` - Tree monitoring images

## Important Notes

- All migrations use UUID primary keys
- PostGIS extension is required for geospatial features
- Timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- Foreign keys use appropriate `ON DELETE` actions
- Indexes are created for frequently queried columns
- Check constraints ensure data integrity
- Triggers automatically update `updated_at` columns

## Troubleshooting

If you encounter errors:

1. **Extension errors**: Ensure you have permissions to create extensions
2. **PostGIS errors**: Verify PostGIS is available in your Supabase project
3. **Foreign key errors**: Run migrations in the correct order
4. **Duplicate errors**: Drop existing tables if re-running migrations

To drop all tables and start fresh:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

**⚠️ WARNING**: This will delete all data. Only use in development!
