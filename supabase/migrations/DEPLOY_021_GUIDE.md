# Migration 021: Contributor Token Distribution System

## Overview

This migration adds the complete contributor token distribution system that:
- Links GitHub accounts to platform users
- Tracks contribution scores and distributes governance tokens
- Manages feature suggestions and community voting
- Awards contributor badges for achievements

## Prerequisites

- Migration 020 must be successfully applied
- Governance token system (migration 016) must be active
- User system (migration 001) must be in place

## Tables Created

### Core Tables
- `github_accounts` - Links platform users to GitHub accounts
- `distribution_cycles` - Defines token distribution periods
- `contribution_scores` - Tracks contributor activity and scores
- `token_distributions` - Records actual token awards
- `distribution_config` - System configuration and weights
- `manual_token_awards` - Manual bonus token awards

### Feature Suggestion System
- `feature_suggestions` - Community feature requests
- `feature_suggestion_upvotes` - User votes on suggestions
- `feature_suggestion_comments` - Discussion threads

### Badge System
- `contributor_badges` - Available achievement badges
- `user_badges` - Badges earned by users

## Seed Data Included

### Default Configuration
- Monthly distribution cycles
- 10,000 token pool per cycle
- Contribution weights: PRs (3x), Reviews (2x), Docs (1.5x), Commits (1x)
- Minimum threshold: 10 contributions

### Contributor Badges
- **Committed Developer** (100 commits) - Common
- **Code Contributor** (10 PRs) - Common  
- **Code Reviewer** (25 reviews) - Rare
- **Token Holder** (500 tokens) - Rare
- **Elite Contributor** (2000 tokens) - Epic
- **Legend** (5000 tokens) - Legendary

### Feature Suggestions
- 17 initial feature suggestions across all priority levels
- Categories: UI/UX, Backend, Blockchain, Gamification, Performance
- Ready for community upvoting and governance voting

## Deployment Steps

### Option 1: Supabase Dashboard (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content of `021_add_contributor_token_distribution.sql`
3. Execute the migration
4. Verify successful execution (should see "Success" message)

### Option 2: Supabase CLI

```bash
# Ensure you're linked to the correct project
supabase link --project-ref wobpryllvdjaapzjbsxx

# Apply the migration
supabase db push
```

## Verification Steps

After deployment, run these queries to verify:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%github%' 
OR table_name LIKE '%distribution%' 
OR table_name LIKE '%contribution%' 
OR table_name LIKE '%feature_suggestion%' 
OR table_name LIKE '%contributor_badge%'
ORDER BY table_name;

-- Verify seed data
SELECT COUNT(*) as badge_count FROM contributor_badges;
SELECT COUNT(*) as suggestion_count FROM feature_suggestions;
SELECT COUNT(*) as config_count FROM distribution_config;

-- Check indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (tablename LIKE '%github%' 
     OR tablename LIKE '%distribution%' 
     OR tablename LIKE '%contribution%' 
     OR tablename LIKE '%feature_suggestion%' 
     OR tablename LIKE '%contributor_badge%')
ORDER BY tablename, indexname;
```

Expected results:
- 11 new tables created
- 6 contributor badges seeded
- 17 feature suggestions seeded
- 1 distribution config record
- Multiple indexes created for performance

## Post-Deployment Configuration

### 1. GitHub OAuth Setup
Configure GitHub OAuth in your application:
```env
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret
VITE_GITHUB_REDIRECT_URI=your_app_url/auth/github/callback
```

### 2. Repository Configuration
Update the GitHub repository settings in your application config:
```typescript
const GITHUB_CONFIG = {
  owner: 'your-org',
  repo: 'ganggreen-platform',
  branch: 'main'
};
```

### 3. Admin Permissions
Grant admin permissions to users who should manage:
- Distribution configuration
- Manual token awards
- Feature suggestion curation

## Rollback Instructions

If you need to rollback this migration:

```sql
-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS contributor_badges CASCADE;
DROP TABLE IF EXISTS feature_suggestion_comments CASCADE;
DROP TABLE IF EXISTS feature_suggestion_upvotes CASCADE;
DROP TABLE IF EXISTS feature_suggestions CASCADE;
DROP TABLE IF EXISTS manual_token_awards CASCADE;
DROP TABLE IF EXISTS token_distributions CASCADE;
DROP TABLE IF EXISTS contribution_scores CASCADE;
DROP TABLE IF EXISTS distribution_cycles CASCADE;
DROP TABLE IF EXISTS distribution_config CASCADE;
DROP TABLE IF EXISTS github_accounts CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_feature_suggestion_upvotes_count();
DROP FUNCTION IF EXISTS update_feature_suggestion_comments_count();
```

## Next Steps

After successful deployment:

1. **Implement Services**: Create the TypeScript services (Task 2-8)
2. **Build UI Components**: Create the dashboard and management interfaces (Task 11-18)
3. **Set up Scheduled Jobs**: Configure the Supabase Edge Functions (Task 10)
4. **Test Integration**: Verify GitHub OAuth and token distribution flows

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify all prerequisite migrations are applied
3. Ensure your database user has sufficient permissions
4. Contact the development team with specific error messages

## Migration Status

- [x] Migration file created
- [ ] Migration deployed to database
- [ ] Verification completed
- [ ] Services implemented
- [ ] UI components built
- [ ] Integration tested

Update this checklist as you progress through the implementation.