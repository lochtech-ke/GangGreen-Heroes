# Pre-Deployment Checklist for Migration 025

## Migration Review ✅

### SQL Syntax Review
- ✅ All SQL statements are syntactically correct
- ✅ No syntax errors detected
- ✅ All statements end with semicolons
- ✅ Comments are properly formatted

### Migration Number
- ✅ Migration number is 025 (sequential after 024)
- ✅ Filename follows naming convention: `025_fix_journey_progress_table_reference.sql`

### Table Structure
- ✅ Table name: `user_journey_progress`
- ✅ Primary key: `id` (UUID)
- ✅ Foreign key: `user_id` references `users(id)` (NOT `auth.users(id)`) ✅ CRITICAL FIX
- ✅ Unique constraint: `unique_user_journey` on `user_id`
- ✅ Check constraint: `valid_stage` for stage values
- ✅ All required columns present (12 columns)
- ✅ Default values set correctly

### Indexes
- ✅ `idx_journey_user_id` - Primary lookup
- ✅ `idx_journey_current_stage` - Analytics
- ✅ `idx_journey_user_stage` - Composite
- ✅ `idx_journey_updated_at` - Cache invalidation

### Triggers
- ✅ `journey_updated_at_trigger` - Auto-update timestamp
- ✅ `trigger_initialize_user_journey` - Auto-create journey for new users

### Functions
- ✅ `update_journey_updated_at()` - Timestamp update function
- ✅ `initialize_user_journey()` - Auto-initialization function

### Row Level Security
- ✅ RLS enabled on table
- ✅ 4 policies created:
  - Users can view own journey progress (SELECT)
  - Users can update own journey progress (UPDATE)
  - Users can insert own journey progress (INSERT)
  - Service role has full access (ALL)

### Rollback Script
- ✅ Rollback instructions included in migration file
- ✅ All DROP statements present
- ✅ CASCADE handling included

## Pre-Deployment Checks

### Database State
- [ ] Backup created (if needed)
- [ ] Current database state documented
- [ ] Existing journey data documented (if any)

### Access & Permissions
- [ ] Supabase dashboard access confirmed
- [ ] SQL Editor access confirmed
- [ ] Admin permissions verified

### Documentation Ready
- ✅ `DEPLOY_025_GUIDE.md` - Comprehensive guide
- ✅ `DEPLOY_025_INSTRUCTIONS.md` - Quick instructions
- ✅ `verify_025_migration.sql` - Verification queries
- ✅ `test_025_rls_policies.sql` - Test scripts
- ✅ `JOURNEY_MIGRATION_TEST_GUIDE.md` - Testing guide

### Team Communication
- [ ] Team notified of deployment
- [ ] Deployment window scheduled (if needed)
- [ ] Rollback plan communicated

## Deployment Readiness

### Critical Checks
- ✅ Migration fixes the correct issue (auth.users → users reference)
- ✅ Migration is idempotent (uses DROP IF EXISTS)
- ✅ Migration handles existing data (drops table)
- ✅ Migration includes all necessary components
- ✅ No breaking changes to existing code

### Risk Assessment
- **Risk Level**: LOW
- **Data Impact**: Existing journey data will be lost (if any)
- **Downtime**: None (migration runs quickly)
- **Rollback Complexity**: Simple (single DROP TABLE)

### Expected Outcomes
- ✅ Table created with correct foreign key reference
- ✅ Journey service can create records
- ✅ Journey service can read records
- ✅ Journey service can update records
- ✅ No 404 errors in application
- ✅ "Start my journey" button works

## Deployment Steps

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx
   - Navigate to SQL Editor

2. **Copy Migration SQL**
   - Open: `supabase/migrations/025_fix_journey_progress_table_reference.sql`
   - Copy entire contents

3. **Execute Migration**
   - Paste into SQL Editor
   - Review one final time
   - Click "Run" (or Ctrl+Enter)

4. **Verify Success**
   - Check for "Success" message
   - No error messages should appear

5. **Run Verification**
   - Copy: `supabase/migrations/verify_025_migration.sql`
   - Run the SUMMARY QUERY
   - All checks should show ✓ PASS

6. **Test Application**
   - Login to application
   - Navigate to journey page
   - Click "Start my journey"
   - Verify no errors

## Post-Deployment Verification

### Immediate Checks
- [ ] Migration executed without errors
- [ ] Table exists in database
- [ ] Foreign key references `users(id)` correctly
- [ ] All indexes created
- [ ] All triggers active
- [ ] RLS enabled and policies active

### Application Testing
- [ ] Journey page loads without errors
- [ ] "Start my journey" button works
- [ ] Journey progress displays
- [ ] Actions update database correctly
- [ ] No 404 errors in console

### Database Verification
- [ ] Run all verification queries
- [ ] All checks show ✓ PASS
- [ ] Test RLS policies
- [ ] Test triggers
- [ ] Test constraints

## Rollback Plan (If Needed)

If issues occur, execute rollback:

```sql
DROP TRIGGER IF EXISTS journey_updated_at_trigger ON user_journey_progress;
DROP TRIGGER IF EXISTS trigger_initialize_user_journey ON users;
DROP FUNCTION IF EXISTS update_journey_updated_at();
DROP FUNCTION IF EXISTS initialize_user_journey();
DROP TABLE IF EXISTS user_journey_progress CASCADE;
```

## Sign-Off

- [ ] Migration reviewed and approved
- [ ] Pre-deployment checks completed
- [ ] Deployment window confirmed
- [ ] Team notified
- [ ] Ready to deploy

---

**Reviewer**: _________________  
**Date**: _________________  
**Deployment Time**: _________________  

## Notes

- This migration fixes a critical bug where the foreign key referenced the wrong table
- The fix enables the journey feature to function correctly
- Existing journey data (if any) will be lost during migration
- New journey records will be auto-created for existing users on first access
- The journey service already handles missing records gracefully

## References

- Requirements: `.kiro/specs/journey-database-fix/requirements.md`
- Design: `.kiro/specs/journey-database-fix/design.md`
- Tasks: `.kiro/specs/journey-database-fix/tasks.md`
- Deployment Guide: `supabase/migrations/DEPLOY_025_GUIDE.md`
- Test Guide: `docs/JOURNEY_MIGRATION_TEST_GUIDE.md`
