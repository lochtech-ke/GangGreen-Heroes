import { useState, useEffect } from 'react';
import { carbonCreditService, authService } from '../../services';
import { paystackService } from '../../services/paystack.service';
import { loadPaystackScript } from '../../utils/loadPaystack';
import { PaystackTestModeBanner } from './PaystackTestModeBanner';
import type { CarbonCredit, Transaction } from '../../types/carbonCredit.types';

interface PurchaseFlowProps {
  credit: CarbonCredit;
  userId: string;
  onComplete?: (transaction: Transaction) => void;
  onCancel?: () => void;
}

type Step = 'quantity' | 'payment' | 'confirmation';

export function PurchaseFlow({ credit, userId, onComplete, onCancel }: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('quantity');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const totalAmount = quantity * credit.price_per_ton;
  const maxQuantity = Math.min(credit.available_quantity, 1000); // Cap at 1000 tons per purchase

  // Load user email on mount
  useEffect(() => {
    const loadUserEmail = async () => {
      const user = await authService.getCurrentUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    loadUserEmail();
  }, []);

  // Load Paystack SDK when payment step is reached
  useEffect(() => {
    if (currentStep === 'payment' && !sdkLoaded) {
      loadPaystackScript()
        .then(() => {
          setSdkLoaded(true);
          console.log('Paystack SDK loaded successfully');
        })
        .catch((err) => {
          console.error('Failed to load Paystack SDK:', err);
          setError('Unable to load payment system. Please refresh and try again.');
        });
    }
  }, [currentStep, sdkLoaded]);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else if (currency === 'KES') {
      return `KES ${amount.toLocaleString()}`;
    }
    return `${amount} ${currency}`;
  };

  const handleQuantitySubmit = () => {
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (quantity > maxQuantity) {
      setError(`Maximum quantity available is ${maxQuantity} tons`);
      return;
    }

    setError(null);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!userEmail) {
      setError('User email not found. Please log in again.');
      return;
    }

    if (!sdkLoaded) {
      setError('Payment system is still loading. Please wait a moment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate payment reference
      const reference = paystackService.generateReference();

      // Convert amount to KES if needed
      const conversion = paystackService.convertCurrency(
        totalAmount,
        credit.currency
      );

      // Create transaction record with Paystack reference
      const { transaction: newTransaction, error: transactionError } =
        await carbonCreditService.createTransaction({
          buyer_id: userId,
          credit_id: credit.id,
          quantity_tons: quantity,
          payment_method: paymentMethod,
          paystack_reference: reference,
          amount_in_kes: conversion.convertedAmount,
          exchange_rate_used: conversion.exchangeRate,
        });

      if (transactionError || !newTransaction) {
        setError(transactionError?.message || 'Failed to create transaction');
        setLoading(false);
        return;
      }

      // Initialize Paystack payment
      if (!window.PaystackPop) {
        setError('Payment system not loaded. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: paystackService.toKobo(conversion.convertedAmount),
        currency: 'KES',
        ref: reference,
        metadata: {
          credit_id: credit.id,
          quantity_tons: quantity,
          buyer_id: userId,
          transaction_id: newTransaction.id,
        },
        callback: (response) => handlePaymentCallback(response, newTransaction.id),
        onClose: () => handlePaymentClose(),
      });

      // Open payment modal
      handler.openIframe();
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Purchase error:', err);
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (response: any, transactionId: string) => {
    setLoading(true);
    setError(null);

    try {
      if (response.status === 'success') {
        // Verify payment with Paystack
        const verification = await paystackService.verifyPayment(response.reference);

        if (verification.status && verification.data?.status === 'success') {
          // Update transaction to completed
          const { transaction: updatedTransaction } =
            await carbonCreditService.updateTransactionWithPaystack(transactionId, {
              payment_status: 'completed',
              paystack_transaction_id: verification.data.id?.toString(),
              paystack_paid_at: verification.data.paid_at,
              receipt_url: `receipt_${transactionId}.pdf`,
            });

          if (updatedTransaction) {
            setTransaction(updatedTransaction);
            setCurrentStep('confirmation');
            onComplete?.(updatedTransaction);
          }
        } else {
          // Payment verification failed
          await carbonCreditService.updateTransactionStatus(transactionId, 'failed');
          setError('Payment verification failed. Please contact support.');
        }
      } else {
        // Payment failed or abandoned
        await carbonCreditService.updateTransactionStatus(transactionId, 'failed');
        setError('Payment was not successful. Please try again.');
      }
    } catch (err) {
      console.error('Payment callback error:', err);
      setError('Unable to verify payment. Our team will review your transaction.');
      await carbonCreditService.updateTransactionStatus(transactionId, 'failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    // User closed the payment modal without completing payment
    setLoading(false);
    // Transaction remains in 'processing' state for potential webhook update
  };

  const renderQuantityStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select Quantity
        </h3>
        <p className="text-sm text-gray-600">
          How many tons of carbon credits would you like to purchase?
        </p>
      </div>

      {/* Credit Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Price per ton</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(credit.price_per_ton, credit.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Available</span>
          <span className="text-sm font-medium text-gray-900">
            {credit.available_quantity} tons
          </span>
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity (tons)
        </label>
        <input
          type="number"
          min="1"
          max={maxQuantity}
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
        />
        <p className="mt-1 text-xs text-gray-500">
          Maximum: {maxQuantity} tons
        </p>
      </div>

      {/* Total Amount */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold text-green-700">
            {formatCurrency(totalAmount, credit.currency)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleQuantitySubmit}
          disabled={quantity <= 0 || quantity > maxQuantity}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Method
        </h3>
        <p className="text-sm text-gray-600">
          Select your preferred payment method
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Quantity</span>
          <span className="text-sm font-medium text-gray-900">{quantity} tons</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Price per ton</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(credit.price_per_ton, credit.currency)}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-200 flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-green-700">
            {formatCurrency(totalAmount, credit.currency)}
          </span>
        </div>
        {credit.currency === 'USD' && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount in KES</span>
              <span className="font-medium text-gray-900">
                KES {paystackService.convertToKES(totalAmount).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Exchange rate: 1 USD = {paystackService.getExchangeRate()} KES
            </p>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Payment Method
        </label>

        {[
          { value: 'credit_card', label: 'Credit Card', icon: '💳' },
          { value: 'debit_card', label: 'Debit Card', icon: '💳' },
          { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
          { value: 'mobile_money', label: 'Mobile Money (M-Pesa)', icon: '📱' },
        ].map((method) => (
          <label
            key={method.value}
            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === method.value
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-2xl">{method.icon}</span>
            <span className="text-sm font-medium text-gray-900">{method.label}</span>
          </label>
        ))}
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Secure Payment:</strong> Your payment will be processed securely through Paystack. 
          All payment methods support KES transactions.
        </p>
      </div>

      {/* Loading SDK indicator */}
      {!sdkLoaded && currentStep === 'payment' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Loading payment system...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep('quantity')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handlePaymentSubmit}
          disabled={loading || !paymentMethod || !sdkLoaded || !userEmail}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Purchase Successful!
        </h3>
        <p className="text-gray-600">
          Your carbon credit purchase has been completed successfully.
        </p>
      </div>

      {/* Transaction Details */}
      {transaction && (
        <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Transaction ID</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {transaction.id.slice(0, 8)}...
            </span>
          </div>
          {transaction.paystack_reference && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Reference</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {transaction.paystack_reference}
              </span>
            </div>
          )}
          {transaction.paystack_transaction_id && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paystack Transaction</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {transaction.paystack_transaction_id}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Quantity</span>
            <span className="text-sm font-medium text-gray-900">
              {transaction.quantity_tons} tons
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(transaction.total_amount, transaction.currency)}
            </span>
          </div>
          {transaction.amount_in_kes && transaction.currency !== 'KES' && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount Paid (KES)</span>
              <span className="text-sm font-medium text-gray-900">
                KES {transaction.amount_in_kes.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Payment Method</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {transaction.payment_method.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
              <span>✓</span> {transaction.payment_status}
            </span>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• A receipt has been sent to your email</li>
          <li>• You can view this transaction in your purchase history</li>
          <li>• Your carbon credits are now in your account</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => {
            // Navigate to transaction history or dashboard
            onCancel?.();
          }}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          View Purchase History
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Test Mode Banner */}
      <PaystackTestModeBanner />

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'quantity', label: 'Quantity' },
            { key: 'payment', label: 'Payment' },
            { key: 'confirmation', label: 'Confirmation' },
          ].map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === step.key
                      ? 'bg-green-600 text-white'
                      : index <
                        ['quantity', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-2 text-gray-600">{step.label}</span>
              </div>
              {index < 2 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index < ['quantity', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      {currentStep === 'quantity' && renderQuantityStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  );
}
