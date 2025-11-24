-- Add Paystack integration fields to transactions table
-- This migration adds fields needed for Paystack payment gateway integration

-- Add 'processing' status to payment_status enum
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_payment_status_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_payment_status_check 
CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));

-- Add Paystack-specific columns
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS paystack_paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS exchange_rate_used DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS amount_in_kes DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on paystack_reference for quick lookups during verification and webhooks
CREATE INDEX IF NOT EXISTS idx_transactions_paystack_reference 
ON transactions(paystack_reference) 
WHERE paystack_reference IS NOT NULL;

-- Create index on paystack_transaction_id for webhook processing
CREATE INDEX IF NOT EXISTS idx_transactions_paystack_transaction_id 
ON transactions(paystack_transaction_id) 
WHERE paystack_transaction_id IS NOT NULL;

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN transactions.paystack_reference IS 'Unique payment reference generated for Paystack transaction';
COMMENT ON COLUMN transactions.paystack_transaction_id IS 'Paystack transaction ID returned after successful payment';
COMMENT ON COLUMN transactions.paystack_paid_at IS 'Timestamp when payment was confirmed by Paystack';
COMMENT ON COLUMN transactions.exchange_rate_used IS 'USD to KES exchange rate used for this transaction';
COMMENT ON COLUMN transactions.amount_in_kes IS 'Transaction amount in Kenyan Shillings (KES)';
