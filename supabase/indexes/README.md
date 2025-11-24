# Database Indexes Documentation

All database indexes have been created as part of the migration scripts. This document provides an overview of the indexing strategy and performance optimization.

## Indexing Strategy

### 1. Primary Keys
All tables use UUID primary keys with automatic generation:
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

### 2. Foreign Key Indexes
Indexes are automatically created on foreign key columns to optimize JOIN operations.

### 3. Query-Specific Indexes
Indexes are created based on common query patterns identified in the requirements.

## Index Inventory

### Users and Profiles
```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_forest_preference ON users(forest_preference);

-- Use cases:
-- - Login by email
-- - Filter users by role
-- - Filter users by forest preference
```

### Initiatives
```sql
-- Initiatives table
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_organization ON initiatives(organization_id);
CREATE INDEX idx_initiatives_start_date ON initiatives(start_date);
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);

-- Initiative participants
CREATE INDEX idx_initiative_participants_initiative ON initiative_participants(initiative_id);
CREATE INDEX idx_initiative_participants_user ON initiative_participants(user_id);

-- Use cases:
-- - Filter initiatives by forest (Kakamega, Karura, Mau)
-- - Filter by status (active, completed, paused)
-- - Find initiatives by organization
-- - Sort by start date
-- - Geospatial queries (find nearby initiatives)
-- - Find user's participated initiatives
```

### Trees
```sql
-- Trees table
CREATE INDEX idx_trees_initiative ON trees(initiative_id);
CREATE INDEX idx_trees_planted_by ON trees(planted_by);
CREATE INDEX idx_trees_species ON trees(species);
CREATE INDEX idx_trees_health_status ON trees(health_status);
CREATE INDEX idx_trees_antugrow_id ON trees(antugrow_id);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
CREATE INDEX idx_trees_planted_date ON trees(planted_date);

-- Tree images
CREATE INDEX idx_tree_images_tree ON tree_images(tree_id);
CREATE INDEX idx_tree_images_captured_at ON tree_images(captured_at);

-- Use cases:
-- - Find trees in an initiative
-- - Find trees planted by user
-- - Filter by species
-- - Filter by health status
-- - Lookup by Antugrow ID
-- - Geospatial queries (find trees in area)
-- - Sort by planting date
-- - Find images for a tree
-- - Sort images by capture date
```

### Carbon Credits and Transactions
```sql
-- Carbon credits
CREATE INDEX idx_carbon_credits_initiative ON carbon_credits(initiative_id);
CREATE INDEX idx_carbon_credits_verification_status ON carbon_credits(verification_status);
CREATE INDEX idx_carbon_credits_currency ON carbon_credits(currency);

-- Transactions
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_credit ON transactions(credit_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

-- Use cases:
-- - Find credits for an initiative
-- - Filter by verification status
-- - Filter by currency
-- - Find user's transactions
-- - Track credit purchases
-- - Filter by payment status
-- - Sort transactions by date (most recent first)
```

### Notifications
```sql
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Use cases:
-- - Find user's notifications
-- - Filter by read/unread status
-- - Filter by notification type
-- - Sort by creation date
-- - Efficiently query unread notifications (partial index)
```

### Web3 and Crypto
```sql
-- Web3 wallets
CREATE INDEX idx_web3_wallets_address ON web3_wallets(wallet_address);
CREATE INDEX idx_web3_wallets_user ON web3_wallets(user_id);
CREATE INDEX idx_web3_wallets_network ON web3_wallets(network);
CREATE INDEX idx_web3_wallets_primary ON web3_wallets(user_id, is_primary) WHERE is_primary = TRUE;

-- Crypto donations
CREATE INDEX idx_crypto_donations_tx_hash ON crypto_donations(transaction_hash);
CREATE INDEX idx_crypto_donations_user ON crypto_donations(user_id);
CREATE INDEX idx_crypto_donations_initiative ON crypto_donations(initiative_id);
CREATE INDEX idx_crypto_donations_status ON crypto_donations(status);
CREATE INDEX idx_crypto_donations_wallet ON crypto_donations(wallet_address);
CREATE INDEX idx_crypto_donations_created_at ON crypto_donations(created_at DESC);

-- Use cases:
-- - Lookup wallet by address
-- - Find user's wallets
-- - Filter by network
-- - Find primary wallet (partial index)
-- - Lookup donation by transaction hash
-- - Find user's donations
-- - Find donations to initiative
-- - Filter by confirmation status
-- - Track donations from wallet
-- - Sort donations by date
```

### NFT Badges
```sql
-- NFT badges
CREATE INDEX idx_nft_badges_owner ON nft_badges(owner_address);
CREATE INDEX idx_nft_badges_user ON nft_badges(user_id);
CREATE INDEX idx_nft_badges_type ON nft_badges(badge_type, tier);
CREATE INDEX idx_nft_badges_contract ON nft_badges(contract_address);
CREATE INDEX idx_nft_badges_minted_at ON nft_badges(minted_at DESC);

-- Badge criteria
CREATE INDEX idx_badge_criteria_type_tier ON badge_criteria(badge_type, tier);
CREATE INDEX idx_badge_criteria_active ON badge_criteria(active) WHERE active = TRUE;

-- Use cases:
-- - Find badges by owner address
-- - Find user's badges
-- - Filter by badge type and tier (composite index)
-- - Find badges from contract
-- - Sort by minting date
-- - Lookup badge criteria
-- - Query active criteria only (partial index)
```

### Gamification
```sql
-- User gamification
CREATE INDEX idx_user_gamification_points ON user_gamification(total_points DESC);
CREATE INDEX idx_user_gamification_level ON user_gamification(level DESC);
CREATE INDEX idx_user_gamification_rank_global ON user_gamification(rank_global);
CREATE INDEX idx_user_gamification_rank_forest ON user_gamification(rank_forest);

-- Gamified actions
CREATE INDEX idx_gamified_actions_user ON gamified_actions(user_id);
CREATE INDEX idx_gamified_actions_type ON gamified_actions(action_type);
CREATE INDEX idx_gamified_actions_date ON gamified_actions(created_at DESC);

-- Achievements
CREATE INDEX idx_achievements_active ON achievements(active) WHERE active = TRUE;
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- User achievements
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- Use cases:
-- - Leaderboard queries (sort by points/level)
-- - Find user's rank
-- - Find user's actions
-- - Filter actions by type
-- - Sort actions by date
-- - Query active achievements only
-- - Filter by rarity
-- - Find user's unlocked achievements
```

### Quests and Referrals
```sql
-- Challenge quests
CREATE INDEX idx_challenge_quests_status ON challenge_quests(status);
CREATE INDEX idx_challenge_quests_forest ON challenge_quests(forest);
CREATE INDEX idx_challenge_quests_dates ON challenge_quests(start_date, end_date);

-- Quest participants
CREATE INDEX idx_quest_participants_user ON quest_participants(user_id);
CREATE INDEX idx_quest_participants_quest ON quest_participants(quest_id);
CREATE INDEX idx_quest_participants_completed ON quest_participants(completed);

-- Referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Use cases:
-- - Filter quests by status
-- - Filter quests by forest
-- - Find active quests in date range
-- - Find user's quest participation
-- - Find participants of a quest
-- - Filter by completion status
-- - Find referrals by referrer
-- - Find referrals by referee
-- - Lookup by referral code
-- - Filter by referral status
```

## Geospatial Indexes (PostGIS)

### GIST Indexes for Location Queries
```sql
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);
CREATE INDEX idx_trees_location ON trees USING GIST(location);
```

These indexes enable efficient geospatial queries:
- Find initiatives/trees within a radius
- Find nearest initiatives/trees
- Find initiatives/trees in a bounding box
- Calculate distances between points

### Example Geospatial Queries
```sql
-- Find initiatives within 10km of a point
SELECT * FROM initiatives
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  10000 -- 10km in meters
);

-- Find nearest 5 trees to a location
SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance
FROM trees
ORDER BY location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
LIMIT 5;
```

## Partial Indexes

Partial indexes are used to optimize specific query patterns:

```sql
-- Only index unread notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Only index primary wallets
CREATE INDEX idx_web3_wallets_primary ON web3_wallets(user_id, is_primary) WHERE is_primary = TRUE;

-- Only index active badge criteria
CREATE INDEX idx_badge_criteria_active ON badge_criteria(active) WHERE active = TRUE;

-- Only index active achievements
CREATE INDEX idx_achievements_active ON achievements(active) WHERE active = TRUE;
```

Benefits:
- Smaller index size
- Faster queries for filtered data
- Reduced maintenance overhead

## Composite Indexes

Composite indexes optimize queries with multiple WHERE conditions:

```sql
-- Badge type and tier lookup
CREATE INDEX idx_nft_badges_type ON nft_badges(badge_type, tier);

-- Badge criteria lookup
CREATE INDEX idx_badge_criteria_type_tier ON badge_criteria(badge_type, tier);

-- Quest date range queries
CREATE INDEX idx_challenge_quests_dates ON challenge_quests(start_date, end_date);
```

## Index Maintenance

### Monitor Index Usage
```sql
-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Find Unused Indexes
```sql
-- Find indexes that are never used
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Check Index Bloat
```sql
-- Estimate index bloat
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Rebuild Indexes (if needed)
```sql
-- Rebuild a specific index
REINDEX INDEX idx_name;

-- Rebuild all indexes on a table
REINDEX TABLE table_name;

-- Rebuild all indexes in the database (use with caution)
REINDEX DATABASE database_name;
```

## Performance Tips

1. **Use EXPLAIN ANALYZE**: Always analyze query plans to verify index usage
   ```sql
   EXPLAIN ANALYZE SELECT * FROM initiatives WHERE forest = 'kakamega';
   ```

2. **Monitor Slow Queries**: Enable slow query logging in Supabase dashboard

3. **Regular VACUUM**: PostgreSQL automatically vacuums, but manual VACUUM ANALYZE can help
   ```sql
   VACUUM ANALYZE table_name;
   ```

4. **Index Selectivity**: Indexes work best on columns with high selectivity (many unique values)

5. **Avoid Over-Indexing**: Too many indexes slow down INSERT/UPDATE operations

6. **Use Covering Indexes**: Include frequently queried columns in the index when possible

## Query Optimization Examples

### Before (No Index)
```sql
-- Slow: Full table scan
SELECT * FROM trees WHERE species = 'Acacia';
```

### After (With Index)
```sql
-- Fast: Index scan using idx_trees_species
SELECT * FROM trees WHERE species = 'Acacia';
```

### Composite Index Usage
```sql
-- Uses idx_nft_badges_type (badge_type, tier)
SELECT * FROM nft_badges 
WHERE badge_type = 'tree_planter' AND tier = 'gold';
```

### Geospatial Query
```sql
-- Uses idx_initiatives_location (GIST index)
SELECT * FROM initiatives
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-0.0917, 36.8219), 4326)::geography,
  5000
);
```

## Troubleshooting

### Query Not Using Index
1. Check if index exists: `\d table_name` in psql
2. Run ANALYZE: `ANALYZE table_name;`
3. Check query plan: `EXPLAIN SELECT ...`
4. Verify data types match
5. Consider index selectivity

### Slow Queries Despite Indexes
1. Check for index bloat
2. Verify statistics are up to date (ANALYZE)
3. Consider adding covering indexes
4. Check for missing indexes on JOIN columns
5. Review query complexity

### High Index Maintenance Cost
1. Remove unused indexes
2. Consider partial indexes for filtered queries
3. Batch INSERT/UPDATE operations
4. Use COPY for bulk data loads
