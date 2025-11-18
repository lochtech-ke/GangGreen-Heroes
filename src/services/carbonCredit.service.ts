import { supabase } from './supabase';
import type {
  CreateCreditData,
  UpdateCreditData,
  CreateTransactionData,
  CreditFilters,
  TransactionFilters,
  CreditResponse,
  CreditsResponse,
  TransactionResponse,
  TransactionsResponse,
  PriceConversion,
} from '../types/carbonCredit.types';

/**
 * Carbon Credit Service
 * Handles carbon credit marketplace operations, transactions, and pricing
 */
class CarbonCreditService {
  // Exchange rate for USD to KES (this should ideally come from an API)
  private readonly USD_TO_KES_RATE = 150.0;

  /**
   * Create a new carbon credit listing
   * Only verified organizations can create credits
   */
  async createCredit(data: CreateCreditData): Promise<CreditResponse> {
    try {
      // Validate credit data
      const validationError = this.validateCreditData(data);
      if (validationError) {
        return { credit: null, error: validationError };
      }

      const { data: credit, error } = await supabase
        .from('carbon_credits')
        .insert({
          initiative_id: data.initiative_id,
          quantity_tons: data.quantity_tons,
          price_per_ton: data.price_per_ton,
          currency: data.currency,
          verification_status: 'pending',
          verification_certificate_url: data.verification_certificate_url,
          available_quantity: data.quantity_tons, // Initially all quantity is available
        })
        .select()
        .single();

      if (error) {
        return { credit: null, error };
      }

      return { credit, error: null };
    } catch (error) {
      return {
        credit: null,
        error: error instanceof Error ? error : new Error('Failed to create carbon credit'),
      };
    }
  }

  /**
   * Get carbon credit by ID
   */
  async getCredit(creditId: string): Promise<CreditResponse> {
    try {
      const { data, error } = await supabase
        .from('carbon_credits')
        .select('*')
        .eq('id', creditId)
        .single();

      if (error) {
        return { credit: null, error };
      }

      return { credit: data, error: null };
    } catch (error) {
      return {
        credit: null,
        error: error instanceof Error ? error : new Error('Failed to fetch carbon credit'),
      };
    }
  }

  /**
   * Get all carbon credits with optional filtering
   */
  async getCredits(filters?: CreditFilters): Promise<CreditsResponse> {
    try {
      let query = supabase.from('carbon_credits').select('*');

      // Apply filters
      if (filters?.initiative_id) {
        query = query.eq('initiative_id', filters.initiative_id);
      }

      if (filters?.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }

      if (filters?.currency) {
        query = query.eq('currency', filters.currency);
      }

      if (filters?.min_price !== undefined) {
        query = query.gte('price_per_ton', filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.lte('price_per_ton', filters.max_price);
      }

      if (filters?.available_only) {
        query = query.gt('available_quantity', 0);
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { credits: [], error };
      }

      return { credits: data, error: null };
    } catch (error) {
      return {
        credits: [],
        error: error instanceof Error ? error : new Error('Failed to fetch carbon credits'),
      };
    }
  }

  /**
   * Get verified carbon credits only
   */
  async getVerifiedCredits(): Promise<CreditsResponse> {
    return this.getCredits({ verification_status: 'verified', available_only: true });
  }

  /**
   * Update carbon credit
   */
  async updateCredit(
    creditId: string,
    updates: UpdateCreditData
  ): Promise<CreditResponse> {
    try {
      // Validate updates
      const validationError = this.validateUpdateData(updates);
      if (validationError) {
        return { credit: null, error: validationError };
      }

      const { data, error } = await supabase
        .from('carbon_credits')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creditId)
        .select()
        .single();

      if (error) {
        return { credit: null, error };
      }

      return { credit: data, error: null };
    } catch (error) {
      return {
        credit: null,
        error: error instanceof Error ? error : new Error('Failed to update carbon credit'),
      };
    }
  }

  /**
   * Update verification status
   * Only admins should be able to call this
   */
  async updateVerificationStatus(
    creditId: string,
    status: 'pending' | 'verified' | 'rejected',
    certificateUrl?: string
  ): Promise<CreditResponse> {
    const updates: UpdateCreditData = {
      verification_status: status,
    };

    if (certificateUrl) {
      updates.verification_certificate_url = certificateUrl;
    }

    return this.updateCredit(creditId, updates);
  }

  /**
   * Delete carbon credit
   */
  async deleteCredit(creditId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('carbon_credits')
        .delete()
        .eq('id', creditId);

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Failed to delete carbon credit'),
      };
    }
  }

  /**
   * Calculate credit availability
   * Returns the available quantity for purchase
   */
  async calculateAvailability(creditId: string): Promise<number> {
    try {
      const { credit, error } = await this.getCredit(creditId);

      if (error || !credit) {
        return 0;
      }

      return credit.available_quantity;
    } catch (error) {
      console.error('Error calculating availability:', error);
      return 0;
    }
  }

  /**
   * Create a transaction (purchase carbon credits)
   */
  async createTransaction(data: CreateTransactionData): Promise<TransactionResponse> {
    try {
      // Validate transaction data
      const validationError = await this.validateTransactionData(data);
      if (validationError) {
        return { transaction: null, error: validationError };
      }

      // Get credit details
      const { credit, error: creditError } = await this.getCredit(data.credit_id);

      if (creditError || !credit) {
        return {
          transaction: null,
          error: new Error('Carbon credit not found'),
        };
      }

      // Check if enough quantity is available
      if (credit.available_quantity < data.quantity_tons) {
        return {
          transaction: null,
          error: new Error('Insufficient carbon credits available'),
        };
      }

      // Calculate total amount
      const totalAmount = data.quantity_tons * credit.price_per_ton;

      // Prepare transaction data
      const transactionData: any = {
        buyer_id: data.buyer_id,
        credit_id: data.credit_id,
        quantity_tons: data.quantity_tons,
        total_amount: totalAmount,
        currency: credit.currency,
        payment_status: data.paystack_reference ? 'processing' : 'pending',
        payment_method: data.payment_method,
        transaction_date: new Date().toISOString(),
      };

      // Add Paystack fields if provided
      if (data.paystack_reference) {
        transactionData.paystack_reference = data.paystack_reference;
      }

      if (data.amount_in_kes) {
        transactionData.amount_in_kes = data.amount_in_kes;
      }

      if (data.exchange_rate_used) {
        transactionData.exchange_rate_used = data.exchange_rate_used;
      }

      // Create transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        return { transaction: null, error };
      }

      // Update available quantity
      const newAvailableQuantity = credit.available_quantity - data.quantity_tons;
      await this.updateCredit(data.credit_id, {
        available_quantity: newAvailableQuantity,
      });

      return { transaction, error: null };
    } catch (error) {
      return {
        transaction: null,
        error: error instanceof Error ? error : new Error('Failed to create transaction'),
      };
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        return { transaction: null, error };
      }

      return { transaction: data, error: null };
    } catch (error) {
      return {
        transaction: null,
        error: error instanceof Error ? error : new Error('Failed to fetch transaction'),
      };
    }
  }

  /**
   * Get all transactions with optional filtering
   */
  async getTransactions(filters?: TransactionFilters): Promise<TransactionsResponse> {
    try {
      let query = supabase.from('transactions').select('*');

      // Apply filters
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id);
      }

      if (filters?.credit_id) {
        query = query.eq('credit_id', filters.credit_id);
      }

      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.start_date) {
        query = query.gte('transaction_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('transaction_date', filters.end_date);
      }

      // Order by transaction date (newest first)
      query = query.order('transaction_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { transactions: [], error };
      }

      return { transactions: data, error: null };
    } catch (error) {
      return {
        transactions: [],
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
      };
    }
  }

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId: string): Promise<TransactionsResponse> {
    return this.getTransactions({ buyer_id: userId });
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
    receiptUrl?: string
  ): Promise<TransactionResponse> {
    try {
      const updates: any = {
        payment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (receiptUrl) {
        updates.receipt_url = receiptUrl;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        return { transaction: null, error };
      }

      // If transaction failed or refunded, restore the credit quantity
      if (status === 'failed' || status === 'refunded') {
        await this.restoreCreditQuantity(data.credit_id, data.quantity_tons);
      }

      return { transaction: data, error: null };
    } catch (error) {
      return {
        transaction: null,
        error: error instanceof Error ? error : new Error('Failed to update transaction'),
      };
    }
  }

  /**
   * Restore credit quantity (for failed/refunded transactions)
   */
  private async restoreCreditQuantity(
    creditId: string,
    quantity: number
  ): Promise<void> {
    try {
      const { credit } = await this.getCredit(creditId);

      if (credit) {
        await this.updateCredit(creditId, {
          available_quantity: credit.available_quantity + quantity,
        });
      }
    } catch (error) {
      console.error('Error restoring credit quantity:', error);
    }
  }

  /**
   * Update transaction with Paystack payment data
   */
  async updateTransactionWithPaystack(
    transactionId: string,
    paystackData: {
      paystack_transaction_id?: string;
      paystack_paid_at?: string;
      payment_status?: 'processing' | 'completed' | 'failed';
      receipt_url?: string;
    }
  ): Promise<TransactionResponse> {
    try {
      const updates: any = {
        ...paystackData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        return { transaction: null, error };
      }

      // If transaction failed, restore the credit quantity
      if (paystackData.payment_status === 'failed') {
        await this.restoreCreditQuantity(data.credit_id, data.quantity_tons);
      }

      return { transaction: data, error: null };
    } catch (error) {
      return {
        transaction: null,
        error: error instanceof Error
          ? error
          : new Error('Failed to update transaction with Paystack data'),
      };
    }
  }

  /**
   * Get transaction by Paystack reference
   */
  async getTransactionByPaystackReference(
    reference: string
  ): Promise<TransactionResponse> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (error) {
        return { transaction: null, error };
      }

      return { transaction: data, error: null };
    } catch (error) {
      return {
        transaction: null,
        error: error instanceof Error
          ? error
          : new Error('Failed to fetch transaction by Paystack reference'),
      };
    }
  }

  /**
   * Convert price between currencies
   */
  convertPrice(
    amount: number,
    fromCurrency: 'USD' | 'KES',
    toCurrency: 'USD' | 'KES'
  ): PriceConversion {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        converted_amount: amount,
        exchange_rate: 1.0,
      };
    }

    let convertedAmount: number;
    let exchangeRate: number;

    if (fromCurrency === 'USD' && toCurrency === 'KES') {
      exchangeRate = this.USD_TO_KES_RATE;
      convertedAmount = amount * exchangeRate;
    } else {
      // KES to USD
      exchangeRate = 1 / this.USD_TO_KES_RATE;
      convertedAmount = amount * exchangeRate;
    }

    return {
      amount,
      from_currency: fromCurrency,
      to_currency: toCurrency,
      converted_amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimals
      exchange_rate: Math.round(exchangeRate * 100) / 100,
    };
  }

  /**
   * Validate credit creation data
   */
  private validateCreditData(data: CreateCreditData): Error | null {
    if (!data.initiative_id) {
      return new Error('Initiative ID is required');
    }

    if (data.quantity_tons <= 0) {
      return new Error('Quantity must be greater than 0');
    }

    if (data.price_per_ton <= 0) {
      return new Error('Price per ton must be greater than 0');
    }

    if (!['USD', 'KES'].includes(data.currency)) {
      return new Error('Currency must be USD or KES');
    }

    return null;
  }

  /**
   * Validate credit update data
   */
  private validateUpdateData(data: UpdateCreditData): Error | null {
    if (data.quantity_tons !== undefined && data.quantity_tons < 0) {
      return new Error('Quantity cannot be negative');
    }

    if (data.price_per_ton !== undefined && data.price_per_ton <= 0) {
      return new Error('Price per ton must be greater than 0');
    }

    if (data.available_quantity !== undefined && data.available_quantity < 0) {
      return new Error('Available quantity cannot be negative');
    }

    if (
      data.currency !== undefined &&
      !['USD', 'KES'].includes(data.currency)
    ) {
      return new Error('Currency must be USD or KES');
    }

    return null;
  }

  /**
   * Validate transaction data
   */
  private async validateTransactionData(
    data: CreateTransactionData
  ): Promise<Error | null> {
    if (!data.buyer_id) {
      return new Error('Buyer ID is required');
    }

    if (!data.credit_id) {
      return new Error('Credit ID is required');
    }

    if (data.quantity_tons <= 0) {
      return new Error('Quantity must be greater than 0');
    }

    if (!data.payment_method || data.payment_method.trim().length === 0) {
      return new Error('Payment method is required');
    }

    // Check if credit exists and is verified
    const { credit, error } = await this.getCredit(data.credit_id);

    if (error || !credit) {
      return new Error('Carbon credit not found');
    }

    if (credit.verification_status !== 'verified') {
      return new Error('Carbon credit is not verified');
    }

    return null;
  }
}

// Export singleton instance
export const carbonCreditService = new CarbonCreditService();
