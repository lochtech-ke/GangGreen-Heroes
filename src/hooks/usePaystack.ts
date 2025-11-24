/**
 * usePaystack Hook
 * React hook for Paystack payment integration
 */

import { useState, useCallback } from 'react';
import { paystackService } from '../services/paystack.service';
import {
  PaymentInitParams,
  PaystackError,
  PaystackErrorType,
} from '../types/paystack.types';

interface UsePaystackReturn {
  initializePayment: (params: PaymentInitParams) => Promise<void>;
  isProcessing: boolean;
  error: PaystackError | null;
  clearError: () => void;
}

const ERROR_MESSAGES: Record<PaystackErrorType, string> = {
  SDK_LOAD_FAILED:
    'Unable to load payment system. Please refresh and try again.',
  INIT_FAILED: 'Unable to initialize payment. Please try again.',
  PAYMENT_FAILED: 'Payment was not successful. Please try again.',
  VERIFICATION_FAILED:
    'Unable to verify payment. Our team will review your transaction.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CONFIG: 'Payment system is not properly configured.',
};

/**
 * Custom hook for Paystack payment integration
 */
export function usePaystack(): UsePaystackReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<PaystackError | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Create a Paystack error object
   */
  const createError = useCallback(
    (type: PaystackErrorType, details?: unknown): PaystackError => {
      return {
        type,
        message: ERROR_MESSAGES[type],
        details,
      };
    },
    []
  );

  /**
   * Initialize a Paystack payment
   */
  const initializePayment = useCallback(
    async (params: PaymentInitParams): Promise<void> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Validate configuration
        paystackService.initialize();

        // Generate payment reference
        const reference = paystackService.generateReference();

        // Convert amount to KES if needed
        const conversion = paystackService.convertCurrency(
          params.amount,
          params.currency
        );

        // Convert to kobo (smallest unit)
        const amountInKobo = paystackService.toKobo(conversion.convertedAmount);

        // Initialize payment with Paystack
        await paystackService.initializePayment({
          key: '', // Will be set by service
          email: params.email,
          amount: amountInKobo,
          currency: 'KES',
          ref: reference,
          metadata: {
            credit_id: params.creditId,
            quantity_tons: params.quantityTons,
            buyer_id: params.buyerId,
            transaction_id: params.transactionId,
          },
          callback: (response) => {
            // Callback will be handled by the component
            console.log('Payment callback:', response);
          },
          onClose: () => {
            // onClose will be handled by the component
            console.log('Payment modal closed');
          },
        });
      } catch (err) {
        console.error('Payment initialization error:', err);

        // Determine error type
        let errorType: PaystackErrorType = 'INIT_FAILED';
        if (err instanceof Error) {
          if (err.message.includes('load')) {
            errorType = 'SDK_LOAD_FAILED';
          } else if (err.message.includes('network')) {
            errorType = 'NETWORK_ERROR';
          } else if (err.message.includes('config')) {
            errorType = 'INVALID_CONFIG';
          }
        }

        setError(createError(errorType, err));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [createError]
  );

  return {
    initializePayment,
    isProcessing,
    error,
    clearError,
  };
}

export default usePaystack;
