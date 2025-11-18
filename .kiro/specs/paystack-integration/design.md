# Paystack Integration Design

## Overview

This design document outlines the architecture and implementation approach for integrating Paystack payment gateway into the #GangGreen platform's carbon credit marketplace. The integration will replace the placeholder payment flow with a production-ready payment system supporting multiple payment methods popular in Kenya.

## Architecture

### High-Level Architecture

```
User Interface (PurchaseFlow)
         ↓
Paystack Service (Frontend)
         ↓
Paystack SDK (Inline Modal)
         ↓
Paystack API (External)
         ↓
Webhook Handler (Backend)
         ↓
Supabase Database
```

### Payment Flow Sequence

1. User selects credits and enters quantity
2. System initializes Paystack payment
3. Paystack modal opens for payment details
4. Paystack processes payment
5. System receives payment reference
6. System verifies payment with Paystack API
7. Database transaction status updated
8. Confirmation shown to user

## Components and Interfaces

### 1. Paystack Service

**Location:** `src/services/paystack.service.ts`

This service handles all Paystack-related operations on the frontend.

**Key Methods:**

```typescript
interface PaystackService {
  initialize(): void;
  initializePayment(params: PaymentParams): Promise<PaymentResponse>;
  verifyPayment(reference: string): Promise<VerificationResponse>;
  convertToKES(amountUSD: number): number;
  generateReference(): string;
}
```

**Payment Parameters:**

```typescript
interface PaymentParams {
  email: string;
  amount: number; // in KES kobo (smallest unit)
  currency: 'KES';
  reference: string;
  metadata: {
    credit_id: string;
    quantity_tons: number;
    buyer_id: string;
  };
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}
```

### 2. Payment Hook

**Location:** `src/hooks/usePaystack.ts`

A React hook to simplify Paystack integration in components.

```typescript
interface UsePaystackReturn {
  initializePayment: (params: PaymentInitParams) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}
```

### 3. Updated Purchase Flow Component

The existing `PurchaseFlow.tsx` will be modified to integrate Paystack:

- Replace placeholder payment processing
- Add Paystack modal trigger
- Implement payment verification
- Handle success/failure states
- Display real-time status updates

### 4. Webhook Handler

**Location:** `supabase/functions/paystack-webhook/index.ts`

A Supabase Edge Function to handle Paystack webhooks.

**Responsibilities:**
- Verify webhook signatures
- Process charge.success events
- Process charge.failed events
- Update transaction statuses
- Restore credit quantities on failure

### 5. Payment Verification Function

**Location:** `supabase/functions/verify-paystack-payment/index.ts`

A Supabase Edge Function to verify payments server-side.

**Responsibilities:**
- Call Paystack Transactions API with secret key
- Verify payment status and amount
- Return verification result to frontend

## Data Models

### Updated Transaction Type

```typescript
interface Transaction {
  // Existing fields
  id: string;
  buyer_id: string;
  credit_id: string;
  quantity_tons: number;
  total_amount: number;
  currency: 'USD' | 'KES';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_date: string;
  receipt_url?: string;
  
  // New Paystack fields
  paystack_reference?: string;
  paystack_transaction_id?: string;
  paystack_paid_at?: string;
  exchange_rate_used?: number;
  amount_in_kes?: number;
  
  created_at: string;
  updated_at: string;
}
```

### Database Migration

```sql
ALTER TABLE transactions
ADD COLUMN paystack_reference TEXT,
ADD COLUMN paystack_transaction_id TEXT,
ADD COLUMN paystack_paid_at TIMESTAMPTZ,
ADD COLUMN exchange_rate_used DECIMAL(10, 2),
ADD COLUMN amount_in_kes DECIMAL(10, 2);

CREATE INDEX idx_transactions_paystack_reference 
ON transactions(paystack_reference);
```

## Implementation Details

### 1. SDK Loading

Load Paystack inline SDK dynamically:

```typescript
// src/utils/loadPaystack.ts
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack SDK'));
    document.head.appendChild(script);
  });
}
```

### 2. Payment Initialization

```typescript
const handlePaymentSubmit = async () => {
  // 1. Load Paystack SDK
  await loadPaystackScript();
  
  // 2. Generate payment reference
  const reference = paystackService.generateReference();
  
  // 3. Convert amount to KES if needed
  const amountInKES = currency === 'USD' 
    ? paystackService.convertToKES(totalAmount)
    : totalAmount;
  
  // 4. Create transaction record
  const transaction = await carbonCreditService.createTransaction({
    buyer_id: userId,
    credit_id: credit.id,
    quantity_tons: quantity,
    payment_method: paymentMethod,
    paystack_reference: reference,
    amount_in_kes: amountInKES,
    exchange_rate_used: USD_TO_KES_RATE,
  });
  
  // 5. Initialize Paystack payment
  const handler = PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: userEmail,
    amount: Math.round(amountInKES * 100), // Convert to kobo
    currency: 'KES',
    ref: reference,
    metadata: {
      credit_id: credit.id,
      quantity_tons: quantity,
      buyer_id: userId,
      transaction_id: transaction.id,
    },
    callback: (response) => handlePaymentCallback(response, transaction.id),
    onClose: () => handlePaymentClose(),
  });
  
  // 6. Open payment modal
  handler.openIframe();
};
```

### 3. Payment Verification

After receiving payment callback, verify with Paystack:

```typescript
async function handlePaymentCallback(response: PaystackResponse, transactionId: string) {
  if (response.status === 'success') {
    // Verify payment server-side
    const verification = await paystackService.verifyPayment(response.reference);
    
    if (verification.data.status === 'success') {
      // Update transaction to completed
      await carbonCreditService.updateTransactionStatus(
        transactionId,
        'completed',
        verification.data.reference
      );
      
      setCurrentStep('confirmation');
    } else {
      // Payment verification failed
      await carbonCreditService.updateTransactionStatus(
        transactionId,
        'failed'
      );
      
      setError('Payment verification failed');
    }
  } else {
    // Payment failed or abandoned
    await carbonCreditService.updateTransactionStatus(
      transactionId,
      'failed'
    );
    
    setError('Payment was not successful');
  }
}
```

### 4. Webhook Handler

```typescript
// supabase/functions/paystack-webhook/index.ts
serve(async (req) => {
  // 1. Verify webhook signature
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();
  
  const isValid = await verifySignature(body, signature);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // 2. Parse event
  const event = JSON.parse(body);
  
  // 3. Handle event
  if (event.event === 'charge.success') {
    await handleSuccessfulPayment(event.data);
  } else if (event.event === 'charge.failed') {
    await handleFailedPayment(event.data);
  }
  
  return new Response('OK', { status: 200 });
});
```

## Error Handling

### Error Types

1. **SDK Loading Errors** - Retry once, show error message
2. **Payment Initialization Errors** - Log and show user-friendly message
3. **Payment Processing Errors** - Map Paystack errors to messages
4. **Verification Errors** - Retry up to 3 times
5. **Webhook Errors** - Log and return appropriate status codes

### Error Messages

```typescript
const ERROR_MESSAGES = {
  SDK_LOAD_FAILED: 'Unable to load payment system. Please refresh and try again.',
  INIT_FAILED: 'Unable to initialize payment. Please try again.',
  PAYMENT_FAILED: 'Payment was not successful. Please try again.',
  VERIFICATION_FAILED: 'Unable to verify payment. Our team will review your transaction.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};
```

## Testing Strategy

### Unit Tests
- Paystack service methods
- Currency conversion
- Reference generation
- Error handling

### Integration Tests
- Complete payment flow
- Payment cancellation
- Payment verification
- Transaction status updates

### Manual Testing
- Test with Paystack test keys
- Test all payment methods
- Test webhook delivery
- Test error scenarios
- Test with live keys

## Security Considerations

1. **API Key Management** - Store secret key in environment variables only
2. **Webhook Security** - Always verify signatures
3. **Payment Data** - Never store card details
4. **Transaction Integrity** - Verify amounts match
5. **HTTPS Only** - All communications over HTTPS

## Environment Configuration

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_916e900767097bdee3bd604568c16670a329249b
PAYSTACK_SECRET_KEY=sk_live_f3770759b7201fda31685899667d1788392114e9
VITE_PAYSTACK_CALLBACK_URL=https://gg.lochtech.africa
VITE_USD_TO_KES_RATE=150.0
VITE_PAYSTACK_MODE=live
```

## Deployment Checklist

- [ ] Add environment variables
- [ ] Deploy Edge Functions
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Run database migration
- [ ] Test with test mode
- [ ] Switch to live keys
- [ ] Monitor first transactions
- [ ] Set up error alerting
