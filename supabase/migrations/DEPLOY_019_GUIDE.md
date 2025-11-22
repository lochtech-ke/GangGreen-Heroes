# Migration 019: Antugrow Integration Tables - Deployment Guide

## Overview

This migration adds database tables and extensions required for the Antugrow API integration, including:
- Sync logging for tracking synchronization operations
- Webhook event logging for real-time updates
- SMS alerts for critical tree health notifications
- User profile extensions for phone numbers and SMS preferences

## Prerequisites

- Supabase project with existing migrations applied (001-018)
- Admin access to Supabase dashboard
- Backup of production database (recommended)

## Tables Created

### 1. `antugrow_sync_log`
Tracks synchronization operations between the platform and Antugrow API.

**Columns:**
- `id` - UUID primary key
- `sync_started_at` - When sync began
- `sync_completed_at` - When sync finished
- `trees_processed` - Total trees in sync batch
- `trees_succeeded` - Successfully synced trees
- `trees_failed` - Failed tree syncs
- `errors` - JSONB array of error details
- `status` - Current status (in_progress, completed, failed)
- `created_at` - Record creation timestamp

### 2. `antugrow_webhooks`
Logs all webhook events received from Antugrow API.

**Columns:**
- `id` - UUID primary key
- `event_type` - Type of webhook event
- `payload` - JSONB webhook data
- `processed` - Whether event has been processed
- `processed_at` - When event was processed
- `error` - Error message if processing failed
- `created_at` - Record creation timestamp

### 3. `sms_alerts`
Tracks SMS notifications sent for critical tree health issues.

**Columns:**
- `id` - UUID primary key
- `tree_id` - Reference to trees table
- `user_id` - Reference to auth.users
- `phone_number` - Recipient phone number
- `message` - SMS message content
- `alert_type` - Type of alert (critical_health, disease_detected, urgent_attention)
- `delivery_status` - Status (sent, failed, pending)
- `message_id` - External SMS provider message ID
- `retry_count` - Number of delivery attempts
- `error` - Error message if delivery failed
- `sent_at` - When SMS was sent
- `created_at` - Record creation timestamp

### 4. User Profile Extensions
Adds phone number and SMS alert preferences to existing `user_profiles` table.

**New Columns:**
- `phone_number` - User's phone number (E.164 format)
- `sms_alerts_enabled` - Whether user wants SMS alerts (default: true)

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd /path/to/ganggreen-platform

# Push the new migration
supabase db push

# Verify migration applied
supabase db diff
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `019_add_antugrow_integration_tables.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Verify success in the **Table Editor**

### Option 3: Using PowerShell Script

```powershell
# Run the deployment script
.\supabase\push-migrations.ps1
```

## Verification

After deployment, verify the migration was successful:

### 1. Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('antugrow_sync_log', 'antugrow_webhooks', 'sms_alerts');
```

Expected result: 3 rows

### 2. Check User Profile Columns

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('phone_number', 'sms_alerts_enabled');
```

Expected result: 2 rows

### 3. Check Indexes

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('antugrow_sync_log', 'antugrow_webhooks', 'sms_alerts')
ORDER BY indexname;
```

Expected result: 10+ indexes

### 4. Check RLS Policies

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('antugrow_sync_log', 'antugrow_webhooks', 'sms_alerts');
```

Expected result: 4 policies

## Row Level Security (RLS)

The migration enables RLS on all new tables:

- **antugrow_sync_log**: Admin-only access
- **antugrow_webhooks**: Admin-only access
- **sms_alerts**: Users can view their own alerts, admins can view all

## Rollback

If you need to rollback this migration:

```sql
-- Drop tables
DROP TABLE IF EXISTS sms_alerts CASCADE;
DROP TABLE IF EXISTS antugrow_webhooks CASCADE;
DROP TABLE IF EXISTS antugrow_sync_log CASCADE;

-- Remove user profile columns
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS sms_alerts_enabled;
```

## Post-Deployment

After successful deployment:

1. **Update Environment Variables**
   ```bash
   VITE_ANTUGROW_API_URL=https://api.antugrow.com
   VITE_ANTUGROW_API_KEY=your_api_key_here
   VITE_SMS_API_URL=https://api.africastalking.com/version1
   VITE_SMS_API_KEY=your_sms_api_key_here
   VITE_SMS_USERNAME=your_sms_username
   VITE_SMS_SENDER_ID=GangGreen
   ```

2. **Test Sync Service**
   - Verify sync service can write to `antugrow_sync_log`
   - Check that sync operations are logged correctly

3. **Test Webhook Handler**
   - Send test webhook to verify logging works
   - Check `antugrow_webhooks` table for entries

4. **Test SMS Alerts**
   - Update a user profile with phone number
   - Trigger a test SMS alert
   - Verify entry in `sms_alerts` table

## Troubleshooting

### Migration Fails with "relation already exists"

This is safe to ignore if tables already exist. The migration uses `IF NOT EXISTS` clauses.

### RLS Policies Not Working

Ensure the `user_profiles` table has a `role` column and users have the 'admin' role set correctly.

### Indexes Not Created

Check for naming conflicts with existing indexes. Drop conflicting indexes before re-running migration.

## Support

For issues or questions:
- Check Supabase logs in the dashboard
- Review migration file for syntax errors
- Consult the main README.md for project setup

## Related Files

- Migration: `supabase/migrations/019_add_antugrow_integration_tables.sql`
- Service: `src/services/antugrow-sync.service.ts`
- Service: `src/services/antugrow.service.ts`
- Types: Will be added in subsequent tasks
