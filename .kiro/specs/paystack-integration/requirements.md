# Requirements Document

## Introduction

This specification defines the integration of Paystack payment gateway into the #GangGreen platform's carbon credit marketplace. Paystack will replace the placeholder payment flow, enabling real transactions for carbon credit purchases using credit cards, debit cards, bank transfers, and mobile money (M-Pesa) within the Kenyan market.

## Glossary

- **Paystack**: A payment gateway service provider that enables online payments in Africa
- **Payment System**: The #GangGreen platform's payment processing infrastructure
- **Transaction**: A carbon credit purchase operation involving payment processing
- **Marketplace**: The carbon credit trading interface within the platform
- **Callback URL**: The endpoint where Paystack sends payment verification responses
- **Payment Reference**: A unique identifier for each payment transaction
- **Webhook**: An HTTP callback that Paystack uses to notify the platform of payment events

## Requirements

### Requirement 1: Paystack SDK Integration

**User Story:** As a developer, I want to integrate the Paystack SDK into the platform, so that the system can process real payments securely.

#### Acceptance Criteria

1. WHEN the Payment System initializes, THE Payment System SHALL load the Paystack inline JavaScript SDK from the official CDN
2. THE Payment System SHALL configure the Paystack public key from environment variables (pk_live_916e900767097bdee3bd604568c16670a329249b)
3. THE Payment System SHALL store the Paystack secret key securely in environment variables (sk_live_f3770759b7201fda31685899667d1788392114e9)
4. THE Payment System SHALL configure the callback URL to https://gg.lochtech.africa
5. THE Payment System SHALL validate that all required Paystack credentials are present before allowing payment operations

### Requirement 2: Payment Initialization

**User Story:** As a user, I want to initiate a payment for carbon credits, so that I can complete my purchase securely.

#### Acceptance Criteria

1. WHEN a user confirms a carbon credit purchase, THE Payment System SHALL create a payment reference using the format "GG-{timestamp}-{random}"
2. WHEN initializing payment, THE Payment System SHALL send the transaction amount in Kenyan Shillings (KES) to Paystack
3. WHEN the amount is in USD, THE Payment System SHALL convert it to KES using the current exchange rate before sending to Paystack
4. THE Payment System SHALL include the user's email address in the payment initialization request
5. THE Payment System SHALL include transaction metadata containing credit_id, quantity_tons, and buyer_id
6. WHEN payment initialization succeeds, THE Payment System SHALL open the Paystack payment modal for the user

### Requirement 3: Payment Processing

**User Story:** As a user, I want to complete my payment using my preferred method, so that I can purchase carbon credits.

#### Acceptance Criteria

1. THE Payment System SHALL support credit card payments through the Paystack modal
2. THE Payment System SHALL support debit card payments through the Paystack modal
3. THE Payment System SHALL support bank transfer payments through the Paystack modal
4. THE Payment System SHALL support mobile money (M-Pesa) payments through the Paystack modal
5. WHILE a payment is processing, THE Payment System SHALL display a loading indicator to the user
6. THE Payment System SHALL allow users to cancel the payment before completion

### Requirement 4: Payment Verification

**User Story:** As a system, I want to verify payment completion with Paystack, so that I can confirm legitimate transactions.

#### Acceptance Criteria

1. WHEN Paystack returns a payment reference, THE Payment System SHALL verify the payment status using the Paystack Transactions API
2. THE Payment System SHALL send the verification request with the secret key in the Authorization header
3. WHEN verification succeeds, THE Payment System SHALL extract the payment status, amount, and customer details from the response
4. IF the verified amount does not match the expected amount, THEN THE Payment System SHALL mark the transaction as failed
5. THE Payment System SHALL update the transaction record in the database with the verified payment status

### Requirement 5: Transaction Status Management

**User Story:** As a user, I want to see the status of my payment, so that I know whether my purchase was successful.

#### Acceptance Criteria

1. WHEN payment verification confirms success, THE Payment System SHALL update the transaction status to "completed"
2. WHEN payment verification indicates failure, THE Payment System SHALL update the transaction status to "failed"
3. WHEN a transaction fails, THE Payment System SHALL restore the carbon credit quantity to the available pool
4. WHEN a transaction completes, THE Payment System SHALL generate a receipt URL for the user
5. THE Payment System SHALL display appropriate success or failure messages to the user based on the payment outcome

### Requirement 6: Webhook Integration

**User Story:** As a system, I want to receive real-time payment notifications from Paystack, so that I can update transaction statuses immediately.

#### Acceptance Criteria

1. THE Payment System SHALL expose a webhook endpoint at /api/paystack/webhook
2. WHEN Paystack sends a webhook event, THE Payment System SHALL verify the event signature using the secret key
3. IF the webhook signature is invalid, THEN THE Payment System SHALL reject the request with a 401 status code
4. WHEN a "charge.success" event is received, THE Payment System SHALL update the corresponding transaction to "completed"
5. WHEN a "charge.failed" event is received, THE Payment System SHALL update the corresponding transaction to "failed"
6. THE Payment System SHALL log all webhook events for audit purposes

### Requirement 7: Error Handling

**User Story:** As a user, I want to receive clear error messages when payment fails, so that I can understand what went wrong and try again.

#### Acceptance Criteria

1. WHEN Paystack initialization fails, THE Payment System SHALL display an error message "Unable to initialize payment. Please try again."
2. WHEN payment verification fails, THE Payment System SHALL display an error message "Payment verification failed. Please contact support."
3. WHEN network errors occur, THE Payment System SHALL display an error message "Network error. Please check your connection and try again."
4. THE Payment System SHALL log all payment errors with sufficient detail for debugging
5. WHEN a payment error occurs, THE Payment System SHALL allow the user to retry the payment

### Requirement 8: Security Requirements

**User Story:** As a platform administrator, I want payment processing to be secure, so that user financial data is protected.

#### Acceptance Criteria

1. THE Payment System SHALL never store credit card details on the platform servers
2. THE Payment System SHALL transmit all payment data over HTTPS connections only
3. THE Payment System SHALL validate webhook signatures before processing webhook events
4. THE Payment System SHALL store the Paystack secret key in environment variables, not in source code
5. THE Payment System SHALL implement rate limiting on payment endpoints to prevent abuse

### Requirement 9: Currency Handling

**User Story:** As a user, I want to see prices in my preferred currency, so that I understand the cost clearly.

#### Acceptance Criteria

1. THE Payment System SHALL display prices in both USD and KES to users
2. WHEN processing payments, THE Payment System SHALL always send amounts to Paystack in KES
3. THE Payment System SHALL use a configurable exchange rate for USD to KES conversion
4. THE Payment System SHALL store the exchange rate used for each transaction in the database
5. THE Payment System SHALL update the exchange rate periodically from a reliable source

### Requirement 10: Testing and Validation

**User Story:** As a developer, I want to test payment integration thoroughly, so that I can ensure it works correctly before going live.

#### Acceptance Criteria

1. THE Payment System SHALL support test mode using Paystack test keys for development
2. THE Payment System SHALL provide a way to simulate successful payments in test mode
3. THE Payment System SHALL provide a way to simulate failed payments in test mode
4. THE Payment System SHALL log all payment operations in test mode for debugging
5. THE Payment System SHALL clearly indicate when running in test mode versus live mode
