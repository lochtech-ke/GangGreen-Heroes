/**
 * Paystack Service
 * Handles Paystack payment gateway integration
 */

import {
  PaystackConfig,
  PaymentVerificationResponse,
  PaystackServiceConfig,
  CurrencyConversion,
} from '../types/paystack.types';
import { loadPaystackScriptWithRetry, validatePaystackConfig } from '../utils/loadPaystack';

class PaystackService {
  private config: PaystackServiceConfig;

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      secretKey: import.meta.env.PAYSTACK_SECRET_KEY || '',
      callbackUrl: import.meta.env.VITE_PAYSTACK_CALLBACK_URL || '',
      mode: (import.meta.env.VITE_PAYSTACK_MODE as 'test' | 'live') || 'test',
      usdToKesRate: parseFloat(import.meta.env.VITE_USD_TO_KES_RATE || '150'),
    };
  }

  /**
   * Initialize Paystack service and validate configuration
   */
  initialize(): void {
    validatePaystackConfig();
  }

  /**
   * Generate a unique payment reference
   * Format: GG-{timestamp}-{random}
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `GG-${timestamp}-${random}`;
  }

  /**
   * Convert USD amount to KES
   * @param amountUSD Amount in US Dollars
   * @returns Amount in Kenyan Shillings
   */
  convertToKES(amountUSD: number): number {
    return Math.round(amountUSD * this.config.usdToKesRate * 100) / 100;
  }

  /**
   * Convert amount to KES with full conversion details
   * @param amount Amount to convert
   * @param currency Source currency
   * @returns Conversion details
   */
  convertCurrency(
    amount: number,
    currency: 'USD' | 'KES'
  ): CurrencyConversion {
    if (currency === 'KES') {
      return {
        originalAmount: amount,
        originalCurrency: 'KES',
        convertedAmount: amount,
        convertedCurrency: 'KES',
        exchangeRate: 1,
      };
    }

    const convertedAmount = this.convertToKES(amount);
    return {
      originalAmount: amount,
      originalCurrency: 'USD',
      convertedAmount,
      convertedCurrency: 'KES',
      exchangeRate: this.config.usdToKesRate,
    };
  }

  /**
   * Initialize a Paystack payment
   * @param config Payment configuration
   * @returns Promise that resolves when payment modal is opened
   */
  async initializePayment(config: PaystackConfig): Promise<void> {
    // Load Paystack SDK
    await loadPaystackScriptWithRetry();

    // Validate SDK is loaded
    if (!window.PaystackPop) {
      throw new Error('Paystack SDK not loaded');
    }

    // Setup payment handler
    const handler = window.PaystackPop.setup({
      ...config,
      key: this.config.publicKey,
    });

    // Open payment modal
    handler.openIframe();
  }

  /**
   * Verify a payment with Paystack API
   * Note: This should be called from a backend/edge function for security
   * @param reference Payment reference to verify
   * @returns Payment verification response
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    // In production, this should call a backend endpoint that verifies with Paystack
    // For now, we'll call the Supabase Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-paystack-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reference }),
      }
    );

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current exchange rate
   */
  getExchangeRate(): number {
    return this.config.usdToKesRate;
  }

  /**
   * Check if running in test mode
   */
  isTestMode(): boolean {
    return this.config.mode === 'test';
  }

  /**
   * Get callback URL
   */
  getCallbackUrl(): string {
    return this.config.callbackUrl;
  }

  /**
   * Format amount to kobo (smallest currency unit)
   * Paystack expects amounts in kobo (1 KES = 100 kobo)
   * @param amount Amount in KES
   * @returns Amount in kobo
   */
  toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format amount from kobo to KES
   * @param kobo Amount in kobo
   * @returns Amount in KES
   */
  fromKobo(kobo: number): number {
    return kobo / 100;
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
export default paystackService;
