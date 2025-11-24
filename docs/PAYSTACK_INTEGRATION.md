# Paystack Integration Documentation

## Overview

The #GangGreen platform integrates with Paystack payment gateway to process carbon credit purchases. This integration supports multiple payment methods including credit cards, debit cards, bank transfers, and mobile money (M-Pesa).

## Features

- ✅ Secure payment processing through Paystack
- ✅ Multiple payment methods (cards, bank transfer, M-Pesa)
- ✅ Real-time payment verification
- ✅ Webhook support for payment status updates
- ✅ Currency conversion (USD to KES)
- ✅ Test mode for development
- ✅ Transaction tracking and receipts

## Architecture

### Components

1. **Frontend Integration**
   - `PurchaseFlow.tsx` - Main purchase flow component
   - `paystackService` - Paystack service layer
   - `loadPaystack.ts` - SDK loader utility

2. **Backend (Edge Functions)**
   - `verify-paystack-payment` - Server-side payment verification
   - `paystack-webhook` - Webhook event handler

3. **Database**
   - `transactions` table with Paystack fields
   - `carbon_credits` table for inventory management

### Payment Flow

```
1. User selects carbon credits and quantity
2. System creates transaction record
3. Paystack SDK loads and opens payment modal
4. User completes payment with Paystack
5. Frontend receives payment callback
6. System verifies payment with Paystack API
7. Transaction status updated to 'completed'
8. Webhook confirms payment (backup verification)
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Paystack Public Key (exposed to client)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_916e900767097bdee3bd604568c16670a329249b

# Paystack Secret Key (server-side only, never expose to client)
PAYSTACK_SECRET_KEY=sk_live_f3770759b7201fda31685899667d1788392114e9

# Callback URL
VITE_PAYSTACK_CALLBACK_URL=https://gg.lochtech.africa

# Exchange Rate (USD to KES)
VITE_USD_TO_KES_RATE=150.0

# Mode (test or live)
VITE_PAYSTACK_MODE=test
```

### Test Mode

When `VITE_PAYSTACK_MODE=test`, the system:
- Uses test API keys
- Displays a test mode banner
- Accepts test card numbers
- Does not process real transactions

**Test Card Numbers:**
- Success: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`

### Live Mode

When `VITE_PAYSTACK_MODE=live`:
- Uses live API keys
- Processes real transactions
- Charges actual payment methods
- No test mode banner displayed

## Usage

### Making a Payment

```typescript
import { paystackService } from './services/paystack.service';

// Generate payment reference
const reference = paystackService.generateReference();

// Convert amount to KES if needed
const conversion = paystackService.convertCurrency(amount, 'USD');

// Initialize payment
const handler = window.PaystackPop.setup({
  key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  email: userEmail,
  amount: paystackService.toKobo(conversion.convertedAmount),
  currency: 'KES',
  ref: reference,
  metadata: {
    credit_id: creditId,
    quantity_tons: quantity,
    buyer_id: userId,
  },
  callback: (response) => {
    // Handle payment success
    console.log('Payment successful:', response);
  },
  onClose: () => {
    // Handle modal close
    console.log('Payment modal closed');
  },
});

handler.openIframe();
```

### Verifying a Payment

```typescript
import { paystackService } from './services/paystack.service';

// Verify payment
const verification = await paystackService.verifyPayment(reference);

if (verification.status && verification.data?.status === 'success') {
  // Payment verified successfully
  console.log('Payment verified:', verification.data);
} else {
  // Verification failed
  console.error('Verification failed');
}
```

## Database Schema

### Transactions Table

The `transactions` table includes these Paystack-specific fields:

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

## API Reference

### Paystack Service Methods

#### `generateReference(): string`
Generates a unique payment reference in format `GG-{timestamp}-{random}`.

#### `convertToKES(amountUSD: number): number`
Converts USD amount to KES using configured exchange rate.

#### `convertCurrency(amount: number, currency: 'USD' | 'KES'): CurrencyConversion`
Converts amount with full conversion details.

#### `initializePayment(config: PaystackConfig): Promise<void>`
Initializes Paystack payment modal.

#### `verifyPayment(reference: string): Promise<PaymentVerificationResponse>`
Verifies payment with Paystack API (calls Edge Function).

#### `toKobo(amount: number): number`
Converts KES amount to kobo (smallest unit).

#### `fromKobo(kobo: number): number`
Converts kobo to KES amount.

#### `isTestMode(): boolean`
Checks if running in test mode.

#### `getExchangeRate(): number`
Gets current USD to KES exchange rate.

## Webhook Configuration

### Setup

1. Log into Paystack Dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/paystack-webhook`
4. Select events:
   - `charge.success`
   - `charge.failed`
5. Save configuration

### Webhook Events

#### charge.success
Triggered when payment is successful.

**Handler Actions:**
- Updates transaction status to 'completed'
- Stores Paystack transaction ID
- Records payment timestamp
- Generates receipt URL

#### charge.failed
Triggered when payment fails.

**Handler Actions:**
- Updates transaction status to 'failed'
- Restores carbon credit quantity
- Logs failure reason

### Security

Webhooks are secured using HMAC SHA-512 signature verification:

```typescript
const signature = req.headers.get('x-paystack-signature');
const hash = createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(body)
  .digest('hex');

if (hash !== signature) {
  // Reject invalid signature
  return new Response('Invalid signature', { status: 401 });
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| SDK_LOAD_FAILED | Paystack SDK failed to load | Check internet connection, refresh page |
| INIT_FAILED | Payment initialization failed | Verify API keys, check configuration |
| PAYMENT_FAILED | Payment was declined | Try different payment method |
| VERIFICATION_FAILED | Payment verification failed | Contact support with reference |
| NETWORK_ERROR | Network connectivity issue | Check internet connection |

### Error Messages

User-friendly error messages are defined in `src/constants/paystack.constants.ts`:

```typescript
export const PAYSTACK_ERROR_MESSAGES = {
  SDK_LOAD_FAILED: 'Unable to load payment system. Please refresh and try again.',
  PAYMENT_FAILED: 'Payment was not successful. Please try again.',
  VERIFICATION_FAILED: 'Unable to verify payment. Our team will review your transaction.',
  // ... more messages
};
```

## Testing

### Manual Testing Checklist

- [ ] Test mode indicator displays correctly
- [ ] Payment modal opens successfully
- [ ] Test card payment completes
- [ ] Payment verification works
- [ ] Transaction status updates correctly
- [ ] Webhook events are received
- [ ] Failed payment restores credits
- [ ] Currency conversion displays correctly
- [ ] Error messages display properly
- [ ] Receipt generation works

### Test Scenarios

1. **Successful Payment**
   - Use test card: 4084 0840 8408 4081
   - Complete payment flow
   - Verify transaction status is 'completed'

2. **Failed Payment**
   - Use declined test card
   - Verify transaction status is 'failed'
   - Verify credits are restored

3. **Cancelled Payment**
   - Close payment modal
   - Verify transaction remains in 'processing'

4. **Webhook Verification**
   - Complete payment
   - Check webhook logs
   - Verify transaction updated via webhook

## Monitoring

### Key Metrics

- Payment success rate
- Average payment time
- Verification failures
- Webhook delivery rate
- Currency conversion accuracy

### Logging

All payment operations are logged:

```typescript
console.log('Payment initialized:', { reference, amount });
console.log('Payment verified:', { reference, status });
console.error('Payment error:', { error, context });
```

### Alerts

Set up alerts for:
- High payment failure rate (> 10%)
- Verification failures
- Webhook delivery failures
- API errors

## Security Best Practices

1. **Never expose secret key** - Keep `PAYSTACK_SECRET_KEY` server-side only
2. **Verify webhooks** - Always verify webhook signatures
3. **Use HTTPS** - All communications must use HTTPS
4. **Validate amounts** - Verify payment amounts match expected values
5. **Log transactions** - Maintain audit trail of all payments
6. **Rate limiting** - Implement rate limits on payment endpoints
7. **PCI compliance** - Never store card details

## Troubleshooting

### Payment Modal Not Opening

1. Check if Paystack SDK loaded: `console.log(window.PaystackPop)`
2. Verify public key is set correctly
3. Check browser console for errors
4. Ensure user email is provided

### Verification Failing

1. Check Edge Function logs
2. Verify secret key is set in Supabase
3. Ensure reference exists in Paystack
4. Check network connectivity

### Webhook Not Received

1. Verify webhook URL in Paystack dashboard
2. Check Edge Function is deployed
3. Test webhook manually with curl
4. Check webhook signature verification

## Support

For issues or questions:
- Check Paystack documentation: https://paystack.com/docs
- Review Edge Function logs
- Contact Paystack support
- Check #GangGreen platform logs

## Changelog

### Version 1.0.0 (November 2025)
- Initial Paystack integration
- Support for cards, bank transfer, M-Pesa
- Payment verification
- Webhook handling
- Currency conversion
- Test mode support
