# Manual Migration Application Guide

Since the CLI is having network issues, you can apply the migration manually through the Supabase Dashboard.

## Steps to Apply Migration

### 1. Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx

### 2. Navigate to SQL Editor

- Click on "SQL Editor" in the left sidebar
- Click "New Query"

### 3. Copy and Paste Migration

Open the file: `supabase/migrations/016_add_governance_token_system.sql`

Copy the entire contents and paste into the SQL Editor.

### 4. Run the Migration

- Click "Run" button (or press Ctrl+Enter)
- Wait for execution to complete
- Check for any errors in the output

### 5. Verify Tables Created

After running, verify the tables were created:

```sql
-- Check governance tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'governance_tokens',
  'token_transactions',
  'token_earning_rules',
  'proposal_categories',
  'proposals',
  'votes',
  'voting_snapshots',
  'senior_users',
  'petition_config',
  'petitions',
  'petition_signatures'
);
```

You should see all 11 tables listed.

### 6. Verify Seed Data

Check that default data was inserted:

```sql
-- Check proposal categories
SELECT * FROM proposal_categories;

-- Check token earning rules
SELECT * FROM token_earning_rules;

-- Check petition config
SELECT * FROM petition_config;
```

## Alternative: Use Supabase CLI with Direct Connection

If you prefer CLI, try:

```bash
# Get your database password from Supabase Dashboard > Settings > Database
npx supabase db push --password YOUR_DATABASE_PASSWORD
```

## Troubleshooting

### Error: Table already exists
If you see this error, the migration was already applied. You can skip it.

### Error: Permission denied
Make sure you're logged in as the project owner in Supabase Dashboard.

### Error: Syntax error
Double-check that you copied the entire migration file without any truncation.

## Next Steps

Once the migration is successfully applied:

1. ✅ Database schema is ready
2. ✅ Smart contracts are written
3. 🔄 Next: Implement services and UI components (tasks 2-16)
4. 🔄 Deploy smart contracts to Mumbai testnet

The governance token system foundation is now in place!
