# Journey Migration Testing Guide

This guide helps you test the journey database migration (025) to ensure everything works correctly.

## Prerequisites

- Migration 025 has been deployed to your Supabase instance
- You have access to the Supabase dashboard
- You have a test user account in the system

## Testing Steps

### Step 1: Deploy the Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx
2. Go to **SQL Editor**
3. Copy contents of `supabase/migrations/025_fix_journey_progress_table_reference.sql`
4. Paste and run in SQL Editor
5. Verify "Success" message

### Step 2: Verify Database Structure

1. In SQL Editor, run the verification script:
   - Copy contents of `supabase/migrations/verify_025_migration.sql`
   - Run the **SUMMARY QUERY** at the bottom
   - All checks should show ✓ PASS

2. Key things to verify:
   - Table exists: `user_journey_progress`
   - Foreign key references `users(id)` (NOT `auth.users(id)`)
   - RLS is enabled
   - 4+ indexes exist
   - 2+ triggers exist
   - 4+ RLS policies exist

### Step 3: Test RLS Policies and Constraints

1. In SQL Editor, run the RLS test script:
   - Copy contents of `supabase/migrations/test_025_rls_policies.sql`
   - Run the entire script
   - Check the notices/messages for PASSED/FAILED

2. Tests include:
   - Auto-initialization trigger
   - Unique constraint (one journey per user)
   - Check constraint (valid stages only)
   - Default values
   - Update trigger (updated_at timestamp)
   - Cascade delete
   - JSONB operations
   - Array operations

### Step 4: Test Journey Service Integration

#### Option A: Run Automated Tests

```bash
# Install dependencies if needed
npm install

# Run the journey service tests
npm test -- journey.service.test.ts
```

#### Option B: Manual Testing in Application

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Login** to the application with a test account

3. **Navigate to Journey Dashboard**:
   - Go to `/journey` or click "My Journey" in navigation
   - Click "Start my journey" button

4. **Verify No Errors**:
   - Check browser console (F12) for errors
   - Should NOT see "Failed to fetch journey progress"
   - Should NOT see 404 errors
   - Journey progress should load successfully

5. **Test Journey Actions**:
   - Join a cause → Check if `joined_causes` updates
   - Complete a challenge → Check if `challenges_completed` increments
   - Plant a tree → Check if `trees_planted` increments
   - Check if stage progress updates

6. **Verify in Database**:
   ```sql
   -- Check your journey record
   SELECT * FROM user_journey_progress 
   WHERE user_id = '<your-user-id>';
   ```

### Step 5: Test Edge Cases

1. **Test Duplicate Prevention**:
   - Try to create journey twice for same user
   - Should return existing journey, not create duplicate

2. **Test Invalid Stage**:
   - Try to set an invalid stage (should fail)
   ```sql
   UPDATE user_journey_progress 
   SET current_stage = 'invalid' 
   WHERE user_id = '<test-user-id>';
   ```
   - Should get constraint violation error

3. **Test Cascade Delete**:
   - Create a test user
   - Verify journey is auto-created
   - Delete the user
   - Verify journey is also deleted

### Step 6: Performance Check

1. **Check Query Performance**:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM user_journey_progress 
   WHERE user_id = '<test-user-id>';
   ```
   - Should use index scan (not seq scan)
   - Execution time should be < 5ms

2. **Check Index Usage**:
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE tablename = 'user_journey_progress';
   ```

## Expected Results

### ✅ Success Indicators

- All verification queries show ✓ PASS
- All RLS tests show PASSED
- No 404 errors when accessing journey features
- Journey data loads correctly in UI
- Actions update the database correctly
- Timestamps update automatically
- Foreign key references `users(id)` correctly

### ❌ Failure Indicators

- Verification queries show ✗ FAIL
- RLS tests show FAILED
- 404 errors in browser console
- "Failed to fetch journey progress" errors
- Journey data doesn't load
- Foreign key still references `auth.users(id)`

## Troubleshooting

### Issue: Table doesn't exist

**Solution**: Re-run the migration script in SQL Editor

### Issue: Foreign key references auth.users

**Solution**: 
1. Drop the table: `DROP TABLE user_journey_progress CASCADE;`
2. Re-run migration 025

### Issue: RLS policies not working

**Solution**:
1. Check if RLS is enabled: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_journey_progress';`
2. If false, enable it: `ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;`
3. Re-run the policy creation part of migration 025

### Issue: Triggers not firing

**Solution**:
1. Check if triggers exist: `SELECT * FROM pg_trigger WHERE tgname LIKE '%journey%';`
2. If missing, re-run the trigger creation part of migration 025

### Issue: Journey not auto-created for new users

**Solution**:
1. Check if trigger on `users` table exists
2. Verify trigger function exists: `SELECT * FROM pg_proc WHERE proname = 'initialize_user_journey';`
3. Re-run the auto-initialization trigger part of migration 025

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS journey_updated_at_trigger ON user_journey_progress;
DROP TRIGGER IF EXISTS trigger_initialize_user_journey ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_journey_updated_at();
DROP FUNCTION IF EXISTS initialize_user_journey();

-- Drop table
DROP TABLE IF EXISTS user_journey_progress CASCADE;
```

**Warning**: This will delete all journey progress data!

## Next Steps

After successful testing:

1. ✅ Mark migration 025 as deployed
2. ✅ Update documentation
3. ✅ Monitor production logs for any issues
4. ✅ Test with real users
5. ✅ Mark task 1.1 in individual-user-journey spec as complete

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `DEPLOY_025_GUIDE.md` for detailed information
3. Check Supabase logs in the dashboard
4. Contact the development team with error details
