# Migration 025 Syntax Fix

## Issue Discovered

When manually applying migration 025, a syntax error was encountered:

```
ERROR: 42601: syntax error at or near "$"
LINE 59: RETURNS TRIGGER AS $ ^
```

## Root Cause

The PL/pgSQL function definitions used incorrect dollar-quoting syntax:

**Incorrect** (single `$`):
```sql
RETURNS TRIGGER AS $
BEGIN
  ...
END;
$ LANGUAGE plpgsql;
```

**Correct** (double `$$`):
```sql
RETURNS TRIGGER AS $$
BEGIN
  ...
END;
$$ LANGUAGE plpgsql;
```

## Functions Affected

Two functions in the migration had this issue:

1. `update_journey_updated_at()` - Line 59
2. `initialize_user_journey()` - Line 111

## Fix Applied

Both functions have been corrected to use proper `$$` dollar-quoting delimiters.

### Before:
```sql
CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;
```

### After:
```sql
CREATE OR REPLACE FUNCTION update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Verification

The corrected migration file now uses proper PostgreSQL dollar-quoting syntax and should execute without syntax errors.

## Status

✅ **FIXED** - Migration 025 is now ready for deployment with correct syntax.

## Next Steps

1. Re-apply the corrected migration in Supabase SQL Editor
2. Verify successful execution
3. Run verification queries from `verify_025_migration.sql`
4. Test the journey feature in the application

## Date Fixed

2025-11-24

## Notes

- PostgreSQL requires matching dollar-quote tags: `$$` or `$tag$`
- Single `$` is not valid syntax for function body delimiters
- This is a common mistake when copying SQL from other sources
- All other migrations in the project use correct `$$` syntax
