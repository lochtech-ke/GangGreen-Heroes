# Migration 022 Trigger Conflict Fix

## Issue
Migration 022 was failing with error:
```
ERROR: 42710: trigger 'update_badge_purchases_updated_at' for relation 'badge_purchases' already exists
```

## Root Cause
The migration attempted to create triggers without checking if they already existed. This happened because:
1. The `badge_purchases` table may have been created by a previous migration (014)
2. The trigger was already created on that table
3. Migration 022 tried to create the same trigger again without dropping it first

## Solution Applied
Made all trigger creation statements idempotent by adding `DROP TRIGGER IF EXISTS` before each `CREATE TRIGGER`:

```sql
-- Before (non-idempotent)
CREATE TRIGGER update_badge_purchases_updated_at 
  BEFORE UPDATE ON badge_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- After (idempotent)
DROP TRIGGER IF EXISTS update_badge_purchases_updated_at ON badge_purchases;
CREATE TRIGGER update_badge_purchases_updated_at 
  BEFORE UPDATE ON badge_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Triggers Fixed
The following triggers are now idempotent:
1. `update_hero_badge_config_updated_at` on `hero_badge_config`
2. `update_badge_purchases_updated_at` on `badge_purchases`
3. `update_hero_badge_holders_updated_at` on `hero_badge_holders`
4. `update_gg_coin_balances_updated_at` on `gg_coin_balances`

## Migration Safety
This fix makes the migration:
- **Idempotent**: Can be run multiple times without errors
- **Safe**: Won't fail if triggers already exist
- **Backward Compatible**: Works whether tables/triggers exist or not

## How to Apply
Simply run the updated migration:
```bash
# Using Supabase CLI
supabase db push

# Or using PowerShell script
.\supabase\deploy-022.ps1

# Or manually in Supabase SQL Editor
\i supabase/migrations/022_add_hero_badge_system.sql
```

## Verification
After applying, verify triggers exist:
```sql
SELECT tgname, n.nspname AS schema_name, c.relname AS table_name 
FROM pg_trigger t 
JOIN pg_class c ON t.tgrelid = c.oid 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE NOT t.tgisinternal 
AND c.relname IN ('hero_badge_config', 'badge_purchases', 'hero_badge_holders', 'gg_coin_balances')
ORDER BY c.relname, tgname;
```

## Related Files Updated
- `supabase/migrations/022_add_hero_badge_system.sql` - Fixed trigger creation
- `supabase/migrations/DEPLOY_022_GUIDE.md` - Added troubleshooting note

## Date Fixed
November 24, 2025
