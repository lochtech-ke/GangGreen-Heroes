# Implementation Plan

## Overview

This implementation plan breaks down the Paystack payment gateway integration into discrete, actionable coding tasks. Each task builds incrementally on previous work to create a complete, production-ready payment system for the carbon credit marketplace.

---

- [x] 1. Environment and Configuration Setup



  - Add Paystack environment variables to `.env` and `.env.example` files
  - Create TypeScript type definitions for Paystack responses and configuration
  - Add Paystack public key, secret key, and callback URL configuration
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 2. Database Schema Updates

- [x] 2.1 Create database migration for Paystack fields


  - Write SQL migration to add paystack_reference, paystack_transaction_id, paystack_paid_at, exchange_rate_used, and amount_in_kes columns to transactions table
  - Add index on paystack_reference column for quick lookups
  - Execute migration in Supabase
  - _Requirements: 4.5, 5.1_


- [x] 2.2 Update TypeScript transaction types

  - Add new Paystack-related fields to Transaction interface in `src/types/carbonCredit.types.ts`
  - Update CreateTransactionData interface to include optional Paystack fields
  - _Requirements: 4.5_

- [x] 3. Paystack SDK Integration


- [x] 3.1 Create Paystack SDK loader utility


  - Implement `loadPaystackScript()` function in `src/utils/loadPaystack.ts`
  - Add TypeScript declarations for PaystackPop global object
  - Handle SDK loading errors and retries
  - _Requirements: 1.1, 7.1_

- [x] 3.2 Create Paystack service layer


  - Implement PaystackService class in `src/services/paystack.service.ts`
  - Add `generateReference()` method to create unique payment references
  - Implement `convertToKES()` method for USD to KES conversion
  - Add `initializePayment()` method to set up Paystack payment
  - Export singleton instance
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 9.2, 9.3_


- [x] 3.3 Create usePaystack React hook

  - Implement custom hook in `src/hooks/usePaystack.ts`
  - Add state management for payment processing, errors, and loading
  - Create `initializePayment()` function that wraps Paystack service
  - Implement error handling and clearing
  - _Requirements: 2.1, 2.6, 7.1, 7.5_

- [x] 4. Update Carbon Credit Service


- [x] 4.1 Modify createTransaction method


  - Update `carbonCreditService.createTransaction()` to accept Paystack fields
  - Add paystack_reference, amount_in_kes, and exchange_rate_used to transaction creation
  - Set initial payment_status to 'processing' instead of 'pending'
  - _Requirements: 2.1, 2.2, 5.1, 9.4_

- [x] 4.2 Add Paystack-specific transaction methods


  - Create `updateTransactionWithPaystack()` method to update transaction with Paystack data
  - Add method to retrieve transaction by Paystack reference
  - _Requirements: 4.5, 5.1, 5.2_

- [x] 5. Update Purchase Flow Component


- [x] 5.1 Integrate Paystack into payment step


  - Modify `PurchaseFlow.tsx` to use usePaystack hook
  - Replace placeholder payment processing with Paystack initialization
  - Load Paystack SDK when payment step is reached
  - Add user email input or retrieve from auth context
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5.2 Implement payment callback handler


  - Create `handlePaymentCallback()` function to process Paystack response
  - Trigger payment verification when callback receives success status
  - Update transaction status based on verification result
  - Handle payment failure and abandoned scenarios
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [x] 5.3 Implement payment close handler


  - Create `handlePaymentClose()` function for when user closes modal
  - Update UI to show payment was cancelled
  - Keep transaction in 'processing' state for potential webhook update
  - _Requirements: 2.6, 5.5_

- [x] 5.4 Update confirmation step


  - Display Paystack transaction details in confirmation view
  - Show payment reference and Paystack transaction ID
  - Add link to view transaction in Paystack dashboard (for admins)
  - _Requirements: 5.4, 5.5_

- [x] 6. Payment Verification Edge Function

- [x] 6.1 Create Supabase Edge Function for verification


  - Create `supabase/functions/verify-paystack-payment/index.ts`
  - Implement POST endpoint that accepts payment reference
  - Call Paystack Transactions API with secret key to verify payment
  - Return verification result with payment status and details
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.2, 8.4_



- [x] 6.2 Add error handling to verification function
  - Handle network errors with retry logic
  - Validate Paystack API responses
  - Return appropriate error messages
  - Log verification attempts for debugging
  - _Requirements: 7.2, 7.4_

- [x] 7. Webhook Handler Edge Function


- [x] 7.1 Create webhook Edge Function


  - Create `supabase/functions/paystack-webhook/index.ts`
  - Implement POST endpoint to receive Paystack webhooks
  - Parse webhook event data
  - _Requirements: 6.1, 6.2_


- [x] 7.2 Implement webhook signature verification

  - Extract x-paystack-signature header from request
  - Compute HMAC SHA-512 hash using secret key
  - Compare computed hash with provided signature
  - Reject requests with invalid signatures
  - _Requirements: 6.2, 6.3, 8.3_


- [x] 7.3 Implement charge.success event handler

  - Create function to handle successful payment webhooks
  - Update transaction status to 'completed'
  - Store Paystack transaction ID and paid_at timestamp
  - _Requirements: 6.4, 5.1, 5.2_


- [x] 7.4 Implement charge.failed event handler

  - Create function to handle failed payment webhooks
  - Update transaction status to 'failed'
  - Restore carbon credit quantity to available pool
  - _Requirements: 6.5, 5.3_


- [x] 7.5 Add webhook logging and idempotency

  - Log all webhook events to database or logging service
  - Implement idempotency check to prevent duplicate processing
  - Return appropriate HTTP status codes
  - _Requirements: 6.6, 7.4_

- [x] 8. Error Handling and User Feedback
- [x] 8.1 Create error message constants


  - Define user-friendly error messages in constants file
  - Map Paystack error codes to readable messages
  - _Requirements: 7.1, 7.2, 7.3, 7.4_



- [x] 8.2 Implement error display in UI
  - Update PurchaseFlow to display specific error messages
  - Add retry button for recoverable errors
  - Show loading states during payment processing
  - _Requirements: 7.1, 7.5_



- [x] 8.3 Add error logging
  - Log payment errors with context (user ID, amount, error details)
  - Implement error tracking for monitoring
  - _Requirements: 7.4_

- [x] 9. Currency Conversion and Display
- [x] 9.1 Implement dynamic currency display
  - Show prices in both USD and KES in marketplace
  - Display exchange rate being used
  - Update PurchaseFlow to show converted amounts
  - _Requirements: 9.1, 9.2, 9.3_


- [x] 9.2 Add exchange rate configuration

  - Create utility to fetch current USD to KES rate
  - Store exchange rate in environment variable as fallback
  - Update rate periodically (manual or automated)
  - _Requirements: 9.4, 9.5_

- [ ] 10. Testing and Validation
- [x] 10.1 Configure test mode
  - Add VITE_PAYSTACK_MODE environment variable
  - Implement test/live mode switching in Paystack service
  - Add visual indicator when in test mode
  - _Requirements: 10.1, 10.5_

- [ ] 10.2 Write unit tests for Paystack service
  - Test reference generation uniqueness
  - Test currency conversion accuracy
  - Test payment initialization parameters
  - Test error handling scenarios
  - _Requirements: 10.2, 10.3_

- [ ] 10.3 Write integration tests for payment flow
  - Test complete purchase flow with mocked Paystack
  - Test payment verification
  - Test transaction status updates
  - Test credit quantity restoration on failure
  - _Requirements: 10.2, 10.3_

- [ ] 10.4 Write webhook handler tests
  - Test webhook signature verification
  - Test charge.success event processing
  - Test charge.failed event processing
  - Test idempotency handling
  - _Requirements: 10.2, 10.3_

- [ ] 11. Deployment and Configuration
- [ ] 11.1 Deploy Edge Functions to Supabase
  - Deploy verify-paystack-payment function
  - Deploy paystack-webhook function
  - Test function endpoints
  - _Requirements: All_
  - **Note:** Manual deployment required - see supabase/functions/README.md

- [ ] 11.2 Configure Paystack webhook in dashboard
  - Log into Paystack dashboard
  - Add webhook URL: https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/paystack-webhook
  - Select events: charge.success, charge.failed
  - Test webhook delivery
  - _Requirements: 6.1, 6.2_
  - **Note:** Manual configuration required in Paystack dashboard

- [ ] 11.3 Update environment variables in production
  - Add all Paystack environment variables to Vercel/hosting platform
  - Verify callback URL is correct
  - Switch from test to live mode
  - _Requirements: 1.3, 1.4, 1.5_
  - **Note:** Manual configuration required in hosting platform

- [ ] 11.4 Test end-to-end payment flow
  - Test with Paystack test cards
  - Verify webhook delivery
  - Test all payment methods (card, bank transfer, M-Pesa)
  - Verify transaction records in database
  - Test with small live transaction
  - _Requirements: All_
  - **Note:** Manual testing required

- [x] 12. Documentation and Monitoring
- [x] 12.1 Document payment integration
  - Add Paystack setup instructions to technical documentation
  - Document environment variables
  - Create troubleshooting guide
  - _Requirements: All_

- [ ] 12.2 Set up payment monitoring
  - Configure alerts for payment failures
  - Set up dashboard to monitor transaction success rates
  - Add logging for payment analytics
  - _Requirements: 7.4, 8.5_
  - **Note:** Manual configuration required in monitoring platform

---

## Notes

- All tasks should be completed in order as they build on each other
- Test mode should be used extensively before switching to live mode
- Monitor first live transactions closely for any issues
- Comprehensive testing ensures production readiness
