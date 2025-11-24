/**
 * Paystack Type Definitions
 * Types for Paystack payment gateway integration
 */

// Paystack SDK global object
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackConfig) => PaystackHandler;
    };
  }
}

// Paystack configuration for payment initialization
export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // Amount in kobo (smallest currency unit)
  currency: 'KES';
  ref: string;
  metadata?: PaystackMetadata;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

// Metadata sent with payment
export interface PaystackMetadata {
  credit_id: string;
  quantity_tons: number;
  buyer_id: string;
  transaction_id?: string;
  custom_fields?: Array<{
    display_name: string;
    variable_name: string;
    value: string;
  }>;
}

// Response from Paystack after payment attempt
export interface PaystackResponse {
  reference: string;
  status: 'success' | 'failed' | 'abandoned';
  message: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
}

// Paystack payment handler
export interface PaystackHandler {
  openIframe: () => void;
}

// Payment verification request
export interface PaymentVerificationRequest {
  reference: string;
}

// Payment verification response from Paystack API
export interface PaymentVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: PaystackMetadata;
    fees: number;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

// Webhook event from Paystack
export interface PaystackWebhookEvent {
  event: 'charge.success' | 'charge.failed' | string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: PaystackMetadata;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

// Payment initialization parameters
export interface PaymentInitParams {
  email: string;
  amount: number; // Amount in main currency unit (KES)
  currency: 'USD' | 'KES';
  creditId: string;
  quantityTons: number;
  buyerId: string;
  transactionId?: string;
}

// Paystack service configuration
export interface PaystackServiceConfig {
  publicKey: string;
  secretKey: string;
  callbackUrl: string;
  mode: 'test' | 'live';
  usdToKesRate: number;
}

// Payment error types
export type PaystackErrorType =
  | 'SDK_LOAD_FAILED'
  | 'INIT_FAILED'
  | 'PAYMENT_FAILED'
  | 'VERIFICATION_FAILED'
  | 'NETWORK_ERROR'
  | 'INVALID_CONFIG';

// Payment error
export interface PaystackError {
  type: PaystackErrorType;
  message: string;
  details?: unknown;
}

// Currency conversion result
export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: 'USD' | 'KES';
  convertedAmount: number;
  convertedCurrency: 'KES';
  exchangeRate: number;
}

export {};
