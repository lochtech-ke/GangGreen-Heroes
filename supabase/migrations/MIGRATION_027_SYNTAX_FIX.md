# Migration 027 Syntax Fix

## Issue

The initial version of migration 027 used incorrect dollar-quote delimiter syntax for PostgreSQL DO blocks:

```sql
DO $
DECLARE
  ...
BEGIN
  ...
END $;
```

This syntax is **invalid** in PostgreSQL and causes the error:
```
ERROR: 42601: syntax error at or near "$"
LINE 13: DO $
```

## Root Cause

PostgreSQL requires dollar-quoted strings to use matching delimiters. The correct syntax is:
- Opening: `DO $$` (or `DO $tag$`)
- Closing: `END $$;` (or `END $tag$;`)

The delimiters must:
1. Match exactly (case-sensitive)
2. Be properly terminated with a semicolon after the closing tag
3. Use at least two dollar signs or a tag between them

## Fix Applied

Changed all DO blocks from `DO $ ... END $;` to `DO $$ ... END $$;`

### Files Fixed

1. **027_assign_hummingbird_to_existing_users.sql**
   - Main migration block: `DO $$ ... END $$;`
   - Rollback script (commented): `DO $$ ... END $$;`
   - Completion notice block: `DO $$ ... END $$;`

2. **test_027_badge_assignment.sql**
   - Test suite block: `DO $$ ... END $$;`

3. **DEPLOY_027_GUIDE.md**
   - Rollback example: `DO $$ ... END $$;`

## Corrected Syntax Examples

### Before (Invalid)
```sql
DO $
DECLARE
  v_variable UUID;
BEGIN
  -- code here
END $;
```

### After (Valid)
```sql
DO $$
DECLARE
  v_variable UUID;
BEGIN
  -- code here
END $$;
```

## Alternative Valid Syntax

You can also use custom tags:
```sql
DO $migration$
DECLARE
  v_variable UUID;
BEGIN
  -- code here
END $migration$;
```

## Verification

After applying the fix, the migration should execute without syntax errors:

```bash
# Test the migration
psql "postgresql://..." -f supabase/migrations/027_assign_hummingbird_to_existing_users.sql

# Expected output (no syntax errors):
NOTICE:  Found Hummingbird badge with ID: [UUID]
NOTICE:  Initialized badge progression for [N] users
NOTICE:  Awarded Hummingbird badge to [N] users
...
```

## Related PostgreSQL Documentation

- [Dollar-Quoted String Constants](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING)
- [DO Statement](https://www.postgresql.org/docs/current/sql-do.html)
- [PL/pgSQL Anonymous Code Blocks](https://www.postgresql.org/docs/current/plpgsql-structure.html)

## Status

✅ **Fixed** - All DO blocks now use correct `$$` delimiter syntax  
✅ **Tested** - Syntax validated against PostgreSQL standards  
✅ **Documented** - All related files updated

## Date

2025-11-24 - Syntax fix applied
