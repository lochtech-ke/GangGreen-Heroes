-- Create carbon_credits table
CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  quantity_tons DECIMAL(10, 2) NOT NULL CHECK (quantity_tons > 0),
  price_per_ton DECIMAL(10, 2) NOT NULL CHECK (price_per_ton > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'KES', 'EUR')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_certificate_url TEXT,
  available_quantity DECIMAL(10, 2) NOT NULL CHECK (available_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_available_quantity CHECK (available_quantity <= quantity_tons)
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  credit_id UUID REFERENCES carbon_credits(id) ON DELETE SET NULL,
  quantity_tons DECIMAL(10, 2) NOT NULL CHECK (quantity_tons > 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_url TEXT
);

-- Create indexes
CREATE INDEX idx_carbon_credits_initiative ON carbon_credits(initiative_id);
CREATE INDEX idx_carbon_credits_verification_status ON carbon_credits(verification_status);
CREATE INDEX idx_carbon_credits_currency ON carbon_credits(currency);

CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_credit ON transactions(credit_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_carbon_credits_updated_at
  BEFORE UPDATE ON carbon_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
