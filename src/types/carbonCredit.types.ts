/**
 * Carbon Credit Type Definitions
 * Types for carbon credit marketplace, transactions, and verification
 */

export interface CarbonCredit {
  id: string;
  initiative_id: string;
  quantity_tons: number;
  price_per_ton: number;
  currency: 'USD' | 'KES';
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_certificate_url?: string;
  available_quantity: number;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  credit_id: string;
  quantity_tons: number;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_date: string;
  receipt_url?: string;
  
  // Paystack integration fields
  paystack_reference?: string;
  paystack_transaction_id?: string;
  paystack_paid_at?: string;
  exchange_rate_used?: number;
  amount_in_kes?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface CreateCreditData {
  initiative_id: string;
  quantity_tons: number;
  price_per_ton: number;
  currency: 'USD' | 'KES';
  verification_certificate_url?: string;
}

export interface UpdateCreditData {
  quantity_tons?: number;
  price_per_ton?: number;
  currency?: 'USD' | 'KES';
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_certificate_url?: string;
  available_quantity?: number;
}

export interface CreateTransactionData {
  buyer_id: string;
  credit_id: string;
  quantity_tons: number;
  payment_method: string;
  
  // Optional Paystack fields
  paystack_reference?: string;
  amount_in_kes?: number;
  exchange_rate_used?: number;
}

export interface CreditFilters {
  initiative_id?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  currency?: 'USD' | 'KES';
  min_price?: number;
  max_price?: number;
  available_only?: boolean;
}

export interface TransactionFilters {
  buyer_id?: string;
  credit_id?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  start_date?: string;
  end_date?: string;
}

export interface CreditWithInitiative extends CarbonCredit {
  initiative_title?: string;
  initiative_forest?: string;
}

export interface TransactionWithDetails extends Transaction {
  credit?: CarbonCredit;
  buyer_email?: string;
}

// Service response types
export interface CreditResponse {
  credit: CarbonCredit | null;
  error: Error | null;
}

export interface CreditsResponse {
  credits: CarbonCredit[];
  error: Error | null;
}

export interface TransactionResponse {
  transaction: Transaction | null;
  error: Error | null;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  error: Error | null;
}

export interface PriceConversion {
  amount: number;
  from_currency: 'USD' | 'KES';
  to_currency: 'USD' | 'KES';
  converted_amount: number;
  exchange_rate: number;
}
