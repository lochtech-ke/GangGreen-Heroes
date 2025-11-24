# GangGreen Platform - Supabase Database

Complete database schema and configuration for the GangGreen conservation platform.

## 📁 Directory Structure

```
supabase/
├── migrations/              # SQL migration scripts
│   ├── 000_all_migrations.sql          # Complete schema (all-in-one)
│   ├── 001_create_users_and_profiles.sql
│   ├── 002_create_initiatives.sql
│   ├── 003_create_trees.sql
│   ├── 004_create_carbon_credits.sql
│   ├── 005_create_notifications.sql
│   ├── 006_create_web3_tables.sql
│   ├── 007_create_nft_badges.sql
│   ├── 008_create_gamification.sql
│   ├── 009_create_quests_and_referrals.sql
│   ├── 010_rls_policies.sql            # Row Level Security
│   └── README.md
├── storage/                 # Storage bucket configuration
│   ├── buckets.sql
│   └── README.md
├── indexes/                 # Index documentation
│   └── README.md
├── SETUP_GUIDE.md          # Complete setup instructions
└── README.md               # This file
```

## 🚀 Quick Start

### Option 1: All-in-One Setup (Fastest)

1. Open Supabase SQL Editor
2. Execute `migrations/000_all_migrations.sql`
3. Execute `migrations/010_rls_policies.sql`
4. Create storage buckets using `storage/buckets.sql`
5. Done! ✅

### Option 2: Step-by-Step Setup

Follow the detailed guide in `SETUP_GUIDE.md`

## 📊 Database Schema Overview

### Core Tables (20 total)

#### User Management
- `users` - User accounts with roles
- `user_profiles` - Extended profile information

#### Conservation
- `initiatives` - Tree planting initiatives
- `initiative_participants` - User participation tracking
- `trees` - Individual tree records with geospatial data
- `tree_images` - Tree monitoring photos

#### Marketplace
- `carbon_credits` - Carbon credit listings
- `transactions` - Purchase transactions

#### Web3 & Blockchain
- `web3_wallets` - Connected cryptocurrency wallets
- `crypto_donations` - Blockchain donation records
- `nft_badges` - NFT badge ownership
- `badge_criteria` - Badge earning requirements

#### Gamification
- `user_gamification` - Points, levels, rankings
- `gamified_actions` - Tracked user actions
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements
- `challenge_quests` - Time-limited challenges
- `quest_participants` - Quest participation
- `referrals` - User referral system

#### System
- `notifications` - User notifications

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ User-specific data access
- ✅ Role-based permissions
- ✅ Public/private data separation

### Storage Security
- ✅ Bucket-level access control
- ✅ File type validation
- ✅ Size limits enforced
- ✅ User-specific folders

## 🗺️ Geospatial Features

### PostGIS Integration
- Geographic point storage for initiatives and trees
- GIST indexes for efficient spatial queries
- Distance calculations
- Radius searches
- Nearest neighbor queries

### Example Queries
```sql
-- Find initiatives within 10km
SELECT * FROM initiatives
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  10000
);

-- Find nearest trees
SELECT * FROM trees
ORDER BY location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
LIMIT 5;
```

## 📈 Performance Optimization

### Indexes Created
- ✅ Primary key indexes (UUID)
- ✅ Foreign key indexes
- ✅ Query-specific indexes
- ✅ Geospatial GIST indexes
- ✅ Partial indexes for filtered queries
- ✅ Composite indexes for multi-column queries

### Total Indexes: 80+

See `indexes/README.md` for complete documentation.

## 💾 Storage Buckets

| Bucket | Public | Size Limit | Purpose |
|--------|--------|------------|---------|
| `tree-images` | ✅ Yes | 10MB | Tree monitoring photos |
| `documents` | ❌ No | 20MB | Certificates, reports |
| `avatars` | ✅ Yes | 2MB | User profile pictures |
| `nft-badges` | ✅ Yes | 5MB | NFT badge artwork |

## 🔄 Realtime Features

Enable realtime subscriptions for:
- Notifications
- Initiative updates
- Leaderboard changes
- Quest progress

```typescript
// Example: Subscribe to notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload);
  })
  .subscribe();
```

## 📝 Data Validation

### Check Constraints
- Positive values for quantities and amounts
- Valid date ranges
- Enum validation for status fields
- Foreign key integrity
- No self-referrals

### Triggers
- Automatic `updated_at` timestamp updates
- Data consistency enforcement

## 🧪 Testing

### Verification Queries

```sql
-- Count all tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 20

-- Count all indexes
SELECT COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public';
-- Expected: 80+

-- Check RLS enabled
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 20

-- Check extensions
SELECT * FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'postgis');
-- Expected: 2 rows
```

## 📚 Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **migrations/README.md** - Migration details
- **storage/README.md** - Storage configuration
- **indexes/README.md** - Index strategy and optimization

## 🛠️ Maintenance

### Regular Tasks
- Monitor slow queries
- Check index usage
- Review storage usage
- Update statistics (ANALYZE)
- Backup database

### Monitoring Queries

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 🔗 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📋 Requirements Covered

This database schema implements requirements:
- ✅ 1.1-1.5: User Authentication and Authorization
- ✅ 2.1-2.5: Tree Planting Initiative Management
- ✅ 3.1-3.5: Carbon Credit Marketplace
- ✅ 4.1-4.5: Impact Dashboard and Reporting
- ✅ 5.1-5.5: Community Engagement and Notifications
- ✅ 6.1-6.5: Data Security and Privacy
- ✅ 9.1-9.5: Geospatial Data Integration
- ✅ 10.1-10.5: Antugrow API Integration (data storage)
- ✅ 11.1-11.5: Forest-Specific Conservation Tracking
- ✅ 12.1-12.5: Web3 Cryptocurrency Donations
- ✅ 13.1-13.5: NFT Badge Reward System
- ✅ 14.1-14.5: Gamification and Achievement System
- ✅ 15.1-15.5: Analytics and Performance Monitoring

## 🎯 Next Steps

After database setup:
1. ✅ Test database connections
2. ✅ Implement authentication service (Task 3)
3. ✅ Create service layer for data access
4. ✅ Build UI components

## 📞 Support

For issues or questions:
- Check `SETUP_GUIDE.md` troubleshooting section
- Review Supabase dashboard logs
- Consult PostGIS documentation for geospatial queries

---

**Database Version**: 1.0.0  
**Last Updated**: 2025  
**Supabase Project**: wobpryllvdjaapzjbsxx
