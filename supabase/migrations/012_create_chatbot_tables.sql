-- Migration: Create Chatbot Support Tables
-- Description: Creates tables for chatbot support tickets and analytics
-- Created: 2025-11-18

-- ============================================================================
-- Support Tickets Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for support_tickets
CREATE INDEX idx_support_tickets_ticket_id ON support_tickets(ticket_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- ============================================================================
-- Chatbot Analytics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for chatbot_analytics
CREATE INDEX idx_chatbot_analytics_event_type ON chatbot_analytics(event_type);
CREATE INDEX idx_chatbot_analytics_conversation_id ON chatbot_analytics(conversation_id);
CREATE INDEX idx_chatbot_analytics_user_id ON chatbot_analytics(user_id);
CREATE INDEX idx_chatbot_analytics_timestamp ON chatbot_analytics(timestamp DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;

-- Support Tickets Policies
-- Users can view their own tickets
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create support tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all support tickets"
  ON support_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update all tickets
CREATE POLICY "Admins can update support tickets"
  ON support_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Chatbot Analytics Policies
-- Service role can insert analytics
CREATE POLICY "Service can insert chatbot analytics"
  ON chatbot_analytics
  FOR INSERT
  WITH CHECK (true);

-- Admins can view analytics
CREATE POLICY "Admins can view chatbot analytics"
  ON chatbot_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_support_ticket_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();

-- Function to set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION set_support_ticket_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set resolved_at
CREATE TRIGGER trigger_set_support_ticket_resolved_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_support_ticket_resolved_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE support_tickets IS 'Stores support tickets created from chatbot escalations';
COMMENT ON TABLE chatbot_analytics IS 'Stores analytics events from chatbot interactions';

COMMENT ON COLUMN support_tickets.ticket_id IS 'Unique human-readable ticket identifier';
COMMENT ON COLUMN support_tickets.conversation_id IS 'ID of the chatbot conversation';
COMMENT ON COLUMN support_tickets.message_history IS 'JSON array of conversation messages';
COMMENT ON COLUMN support_tickets.priority IS 'Ticket priority: low, medium, or high';
COMMENT ON COLUMN support_tickets.category IS 'Support category (e.g., Onboarding, Projects, Technical Support)';
COMMENT ON COLUMN support_tickets.status IS 'Current ticket status';
COMMENT ON COLUMN support_tickets.assigned_to IS 'Support team member assigned to ticket';

COMMENT ON COLUMN chatbot_analytics.event_type IS 'Type of analytics event (e.g., chatbot_opened, query_sent)';
COMMENT ON COLUMN chatbot_analytics.metadata IS 'Additional event data (query, confidence, intent, etc.)';
