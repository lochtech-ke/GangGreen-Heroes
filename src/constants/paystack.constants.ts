/**
 * Paystack Error Messages and Constants
 * User-friendly error messages for payment-related errors
 */

export const PAYSTACK_ERROR_MESSAGES = {
  // SDK Loading Errors
  SDK_LOAD_FAILED: 'Unable to load payment system. Please refresh and try again.',
  SDK_NOT_LOADED: 'Payment system not loaded. Please refresh and try again.',
  
  // Initialization Errors
  INIT_FAILED: 'Unable to initialize payment. Please try again.',
  INVALID_CONFIG: 'Payment system is not properly configured.',
  MISSING_EMAIL: 'User email not found. Please log in again.',
  MISSING_AMOUNT: 'Payment amount is invalid.',
  
  // Payment Processing Errors
  PAYMENT_FAILED: 'Payment was not successful. Please try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled.',
  PAYMENT_TIMEOUT: 'Payment request timed out. Please try again.',
  
  // Verification Errors
  VERIFICATION_FAILED: 'Unable to verify payment. Our team will review your transaction.',
  VERIFICATION_TIMEOUT: 'Payment verification timed out. Please contact support.',
  AMOUNT_MISMATCH: 'Payment amount does not match. Please contact support.',
  
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Transaction Errors
  TRANSACTION_NOT_FOUND: 'Transaction not found.',
  TRANSACTION_ALREADY_PROCESSED: 'This transaction has already been processed.',
  INSUFFICIENT_CREDITS: 'Insufficient carbon credits available.',
  
  // General Errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Map Paystack error codes to user-friendly messages
 */
export const PAYSTACK_ERROR_CODE_MAP: Record<string, string> = {
  // Card errors
  'card_declined': 'Your card was declined. Please try another payment method.',
  'insufficient_funds': 'Insufficient funds. Please try another card or payment method.',
  'invalid_card': 'Invalid card details. Please check and try again.',
  'expired_card': 'Your card has expired. Please use a different card.',
  
  // Bank errors
  'bank_error': 'Bank error occurred. Please try again or use another payment method.',
  'bank_declined': 'Your bank declined the transaction. Please contact your bank.',
  
  // Processing errors
  'processing_error': 'Payment processing error. Please try again.',
  'timeout': 'Payment request timed out. Please try again.',
  
  // Authentication errors
  'authentication_failed': 'Payment authentication failed. Please try again.',
  '3ds_failed': 'Card verification failed. Please try again.',
};

/**
 * Payment status display messages
 */
export const PAYMENT_STATUS_MESSAGES = {
  pending: 'Payment is pending',
  processing: 'Payment is being processed',
  completed: 'Payment completed successfully',
  failed: 'Payment failed',
  refunded: 'Payment has been refunded',
} as const;

/**
 * Payment method display names
 */
export const PAYMENT_METHOD_NAMES = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money (M-Pesa)',
} as const;

/**
 * Paystack configuration constants
 */
export const PAYSTACK_CONFIG = {
  API_URL: 'https://api.paystack.co',
  SDK_URL: 'https://js.paystack.co/v1/inline.js',
  CURRENCY: 'KES',
  MAX_RETRY_ATTEMPTS: 3,
  VERIFICATION_TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Get user-friendly error message from error code or type
 */
export function getPaystackErrorMessage(
  errorCode?: string,
  errorType?: keyof typeof PAYSTACK_ERROR_MESSAGES
): string {
  // Check if we have a specific error code mapping
  if (errorCode && PAYSTACK_ERROR_CODE_MAP[errorCode]) {
    return PAYSTACK_ERROR_CODE_MAP[errorCode];
  }
  
  // Check if we have an error type
  if (errorType && PAYSTACK_ERROR_MESSAGES[errorType]) {
    return PAYSTACK_ERROR_MESSAGES[errorType];
  }
  
  // Return generic error message
  return PAYSTACK_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get payment status display message
 */
export function getPaymentStatusMessage(
  status: keyof typeof PAYMENT_STATUS_MESSAGES
): string {
  return PAYMENT_STATUS_MESSAGES[status] || status;
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(
  method: keyof typeof PAYMENT_METHOD_NAMES
): string {
  return PAYMENT_METHOD_NAMES[method] || method;
}
