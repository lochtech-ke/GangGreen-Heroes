# 🚀 Database Migration Instructions

## Current Status
✅ Logged in to Supabase CLI  
✅ Linked to project: `wobpryllvdjaapzjbsxx`  
⏳ Ready to push migrations

## ⚡ Recommended Approach: Supabase Dashboard

The Supabase CLI is having issues executing the migrations. The **fastest and most reliable** method is using the Supabase Dashboard SQL Editor.

### Step-by-Step Instructions (5 minutes)

#### 1. Open Supabase Dashboard
- Go to: https://app.supabase.com
- Select project: `wobpryllvdjaapzjbsxx`

#### 2. Execute Main Schema Migration
- Click **"SQL Editor"** in the left sidebar
- Click **"New query"**
- Open file: `supabase/migrations/000_all_migrations.sql`
- Copy the **entire content** (Ctrl+A, Ctrl+C)
- Paste into the SQL Editor
- Click **"Run"** (or press Ctrl+Enter)
- Wait ~30 seconds for completion
- You should see: "Success. No rows returned"

#### 3. Execute RLS Policies
- Click **"New query"** again
- Open file: `supabase/migrations/010_rls_policies.sql`
- Copy the entire content
- Paste into the SQL Editor
- Click **"Run"**
- Wait for completion

#### 4. Set Up Storage Buckets

**Create Buckets:**
- Click **"Storage"** in the left sidebar
- Click **"New bucket"**
- Create these 4 buckets:

| Bucket Name | Public | Size Limit | Allowed Types |
|-------------|--------|------------|---------------|
| `tree-images` | ✅ Yes | 10MB | image/jpeg, image/png, image/webp |
| `documents` | ❌ No | 20MB | application/pdf, image/* |
| `avatars` | ✅ Yes | 2MB | image/jpeg, image/png, image/webp |
| `nft-badges` | ✅ Yes | 5MB | image/jpeg, image/png, image/svg+xml |

**Apply Storage Policies:**
- Go back to **SQL Editor**
- Click **"New query"**
- Open file: `supabase/storage/buckets.sql`
- Copy and paste the content
- Click **"Run"**

#### 5. Verify Setup

Run this verification query in SQL Editor:

```sql
-- Check tables (should return 20)
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled (should return 20)
SELECT COUNT(*) as rls_enabled_count
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check extensions
SELECT extname FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'postgis');
```

Expected results:
- ✅ 20 tables created
- ✅ 20 tables with RLS enabled
- ✅ 2 extensions (uuid-ossp, postgis)
- ✅ 4 storage buckets

---

## 🔧 Alternative: Fix CLI and Push

If you want to troubleshoot the CLI approach:

### Option A: Use psql directly

```powershell
# Get your database password from Supabase Dashboard > Settings > Database
$env:PGPASSWORD="your-database-password"

# Execute migrations
psql -h db.wobpryllvdjaapzjbsxx.supabase.co -U postgres -d postgres -f supabase/migrations/000_all_migrations.sql
psql -h db.wobpryllvdjaapzjbsxx.supabase.co -U postgres -d postgres -f supabase/migrations/010_rls_policies.sql
psql -h db.wobpryllvdjaapzjbsxx.supabase.co -U postgres -d postgres -f supabase/storage/buckets.sql
```

### Option B: Debug CLI

```powershell
# Try with debug flag
npx supabase db push --debug

# Or try individual migration files
npx supabase db execute --file supabase/migrations/001_create_users_and_profiles.sql --linked --debug
```

---

## ✅ Success Checklist

After completing the migration:

- [ ] 20 database tables created
- [ ] Row Level Security enabled on all tables
- [ ] RLS policies applied
- [ ] 4 storage buckets created
- [ ] Storage policies configured
- [ ] Extensions enabled (uuid-ossp, postgis)
- [ ] Indexes created (80+)
- [ ] Triggers created (updated_at)

---

## 🎯 Next Steps

Once migration is complete:

1. ✅ Update `.env` file with Supabase credentials
2. ✅ Test database connection from the app
3. ✅ Proceed to **Task 3: Authentication System**

---

## 📞 Need Help?

If you encounter any issues:

1. Check the Supabase Dashboard logs
2. Review error messages in SQL Editor
3. Consult `supabase/SETUP_GUIDE.md` for troubleshooting
4. Check `supabase/QUICK_DEPLOY.md` for alternative methods

---

## 📊 What Gets Created

### Tables (20)
- users, user_profiles
- initiatives, initiative_participants
- trees, tree_images
- carbon_credits, transactions
- notifications
- web3_wallets, crypto_donations
- nft_badges, badge_criteria
- user_gamification, gamified_actions
- achievements, user_achievements
- challenge_quests, quest_participants
- referrals

### Indexes (80+)
- Primary key indexes
- Foreign key indexes
- Query optimization indexes
- Geospatial GIST indexes
- Partial indexes

### Security
- Row Level Security on all tables
- User-specific data access
- Role-based permissions
- Storage bucket policies

---

**Recommendation:** Use the Dashboard approach - it's the fastest and most reliable! ⚡
