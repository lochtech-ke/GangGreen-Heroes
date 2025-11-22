-- Migration: Add Antugrow Integration Tables
-- Description: Creates tables for Antugrow sync logging, webhook events, and SMS alerts
-- Date: 2025-11-22

-- ============================================================================
-- Antugrow Sync Log Table
-- Tracks synchronization operations between platform and Antugrow API
-- ============================================================================

CREATE TABLE IF NOT EXISTS antugrow_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  trees_processed INTEGER DEFAULT 0 CHECK (trees_processed >= 0),
  trees_succeeded INTEGER DEFAULT 0 CHECK (trees_succeeded >= 0),
  trees_failed INTEGER DEFAULT 0 CHECK (trees_failed >= 0),
  errors JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')) DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sync log queries
CREATE INDEX idx_antugrow_sync_log_status ON antugrow_sync_log(status);
CREATE INDEX idx_antugrow_sync_log_started_at ON antugrow_sync_log(sync_started_at DESC);

-- ============================================================================
-- Antugrow Webhooks Table
-- Logs all webhook events received from Antugrow API
-- ============================================================================

CREATE TABLE IF NOT EXISTS antugrow_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for webhook queries
CREATE INDEX idx_antugrow_webhooks_processed ON antugrow_webhooks(processed);
CREATE INDEX idx_antugrow_webhooks_event_type ON antugrow_webhooks(event_type);
CREATE INDEX idx_antugrow_webhooks_created_at ON antugrow_webhooks(created_at DESC);

-- ============================================================================
-- SMS Alerts Table
-- Tracks SMS notifications sent for critical tree health issues
-- ============================================================================

CREATE TABLE IF NOT EXISTS sms_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('critical_health', 'disease_detected', 'urgent_attention')),
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  message_id TEXT,
  retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for SMS alerts queries
CREATE INDEX idx_sms_alerts_tree_id ON sms_alerts(tree_id);
CREATE INDEX idx_sms_alerts_user_id ON sms_alerts(user_id);
CREATE INDEX idx_sms_alerts_delivery_status ON sms_alerts(delivery_status);
CREATE INDEX idx_sms_alerts_created_at ON sms_alerts(created_at DESC);

-- ============================================================================
-- User Profile Extensions
-- Add phone number and SMS alert preferences to user profiles
-- ============================================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS sms_alerts_enabled BOOLEAN DEFAULT TRUE;

-- Index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON user_profiles(phone_number) WHERE phone_number IS NOT NULL;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Antugrow Sync Log: Admin only
ALTER TABLE antugrow_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON antugrow_sync_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Antugrow Webhooks: Admin only
ALTER TABLE antugrow_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhooks"
  ON antugrow_webhooks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- SMS Alerts: Users can view their own alerts
ALTER TABLE sms_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SMS alerts"
  ON sms_alerts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all SMS alerts"
  ON sms_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE antugrow_sync_log IS 'Tracks synchronization operations between GangGreen platform and Antugrow API';
COMMENT ON TABLE antugrow_webhooks IS 'Logs webhook events received from Antugrow API for tree updates and alerts';
COMMENT ON TABLE sms_alerts IS 'Tracks SMS notifications sent to users for critical tree health issues';

COMMENT ON COLUMN antugrow_sync_log.status IS 'Current status of sync operation: in_progress, completed, or failed';
COMMENT ON COLUMN antugrow_webhooks.processed IS 'Whether the webhook event has been processed';
COMMENT ON COLUMN sms_alerts.alert_type IS 'Type of alert: critical_health, disease_detected, or urgent_attention';
COMMENT ON COLUMN sms_alerts.delivery_status IS 'SMS delivery status: sent, failed, or pending';
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number in E.164 format for SMS alerts';
COMMENT ON COLUMN user_profiles.sms_alerts_enabled IS 'Whether user has enabled SMS alerts for tree health issues';
