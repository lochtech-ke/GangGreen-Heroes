# #GangGreen Platform - Technical Guide (Current)

**Last Updated**: November 19, 2025  
**Version**: 4.0  
**Status**: Sprint 4 - Payment Integration Complete

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Tree Registry & AI Monitoring](#tree-registry--ai-monitoring)
7. [Onboarding Chatbot](#onboarding-chatbot)
8. [Payment Processing (Paystack)](#payment-processing-paystack)
9. [Carbon Credit Marketplace](#carbon-credit-marketplace)
10. [Database Schema](#database-schema)
11. [API Services](#api-services)
12. [Edge Functions](#edge-functions)
13. [Component Architecture](#component-architecture)
14. [State Management](#state-management)
15. [Security](#security)
16. [Testing](#testing)
17. [Deployment](#deployment)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │   Admin      │     │
│  │   (Vite)     │  │  (Responsive)│  │   Dashboard  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth │ Profile │ Initiative │ Tree │ Marketplace   │  │
│  │  Chatbot │ Paystack │ Antugrow │ CarbonCredit      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 20+ tables      │  │  - JWT tokens      │           │
│  │  - PostGIS         │  │  - Session mgmt    │           │
│  │  - RLS policies    │  │                    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Edge Functions    │  │  Storage Buckets   │           │
│  │  - Payment verify  │  │  - Tree images     │           │
│  │  - Webhooks        │  │  - Avatars         │           │
│  └────────────────────┘  └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Integrations                           │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Paystack API      │  │  Antugrow API      │           │
│  │  - Payments        │  │  - Tree monitoring │           │
│  │  - Webhooks        │  │  - AI analysis     │           │
│  └────────────────────┘  └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow

```
User Action
   ↓
React Component (UI)
   ↓
Service Layer (Business Logic)
   ↓
Supabase Client (API) / External API
   ↓
PostgreSQL Database / Edge Function / External Service
   ↓
Response
   ↓
Component State Update
   ↓
UI Re-render
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time, Edge Functions)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)
- **Edge Functions**: Deno runtime for serverless functions

### External Integrations
- **Payment Processing**: Paystack API (cards, bank transfer, M-Pesa)
- **AI Tree Monitoring**: Antugrow API
- **Maps**: OpenStreetMap (via Leaflet.js)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

---


## Payment Processing (Paystack)

### Overview

The platform integrates with Paystack for secure payment processing, enabling users to purchase carbon credits using multiple payment methods including credit/debit cards, bank transfers, and M-Pesa.

**Status**: ✅ Complete (Implementation ready for deployment)

### Architecture

```
User initiates purchase
   ↓
PurchaseModal (quantity selection)
   ↓
PurchaseFlow (payment initialization)
   ↓
Paystack SDK (popup payment)
   ↓
Payment completed
   ↓
verify-paystack-payment Edge Function
   ↓
Database updated (transaction + credit)
   ↓
PurchaseConfirmation (success screen)

Parallel: Paystack Webhook
   ↓
paystack-webhook Edge Function
   ↓
Database updated (real-time status)
```

### Type Definitions

**Location**: `src/types/paystack.types.ts`

```typescript
// Payment initialization data
export interface PaystackPaymentData {
  email: string;
  amount: number; // in kobo (KES * 100)
  reference: string;
  currency: 'KES';
  metadata?: {
    credit_id: string;
    buyer_id: string;
    quantity_tons: number;
    price_per_ton_usd: number;
    total_amount_usd: number;
  };
  callback_url?: string;
}

// Payment verification response
export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    metadata: any;
  };
}

// Webhook event
export interface PaystackWebhookEvent {
  event: 'charge.success' | 'charge.failed' | 'charge.abandoned';
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    metadata: any;
  };
}
```

### Paystack Service

**Location**: `src/services/paystack.service.ts`

**Key Methods**:

```typescript
class PaystackService {
  // Initialize payment with Paystack
  async initializePayment(data: {
    email: string;
    amount_usd: number;
    credit_id: string;
    buyer_id: string;
    quantity_tons: number;
    price_per_ton_usd: number;
  }): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>;

  // Verify payment status
  async verifyPayment(reference: string): Promise<{
    success: boolean;
    status: string;
    amount: number;
    paid_at?: string;
  }>;

  // Convert USD to KES
  convertToKES(amountUSD: number): number;

  // Convert KES to USD
  convertToUSD(amountKES: number): number;

  // Get Paystack configuration
  getConfig(): {
    publicKey: string;
    mode: 'test' | 'live';
    callbackUrl: string;
    exchangeRate: number;
  };
}
```

**Usage Example**:

```typescript
import { paystackService } from '@/services';

// Initialize payment
const { authorization_url, reference } = await paystackService.initializePayment({
  email: user.email,
  amount_usd: 100.00,
  credit_id: 'credit-uuid',
  buyer_id: user.id,
  quantity_tons: 10,
  price_per_ton_usd: 10.00,
});

// Open Paystack popup
window.location.href = authorization_url;

// Verify payment (after callback)
const result = await paystackService.verifyPayment(reference);
if (result.success) {
  console.log('Payment successful!');
}
```

### usePaystack Hook

**Location**: `src/hooks/usePaystack.ts`

**Provides**:
- `initializePayment()` - Start payment flow
- `verifyPayment()` - Check payment status
- `loading` - Loading state
- `error` - Error message
- `isTestMode` - Test mode indicator

**Usage Example**:

```typescript
import { usePaystack } from '@/hooks/usePaystack';

function PurchaseButton() {
  const { initializePayment, loading, error, isTestMode } = usePaystack();

  const handlePurchase = async () => {
    const result = await initializePayment({
      email: user.email,
      amount_usd: 100,
      credit_id: creditId,
      buyer_id: user.id,
      quantity_tons: 10,
      price_per_ton_usd: 10,
    });

    if (result.success) {
      // Redirect to Paystack
      window.location.href = result.authorization_url;
    }
  };

  return (
    <>
      {isTestMode && <TestModeBanner />}
      <button onClick={handlePurchase} disabled={loading}>
        {loading ? 'Processing...' : 'Purchase'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </>
  );
}
```

### Payment Components

#### 1. PurchaseModal

**Location**: `src/components/marketplace/PurchaseModal.tsx`

**Purpose**: Modal dialog for initiating carbon credit purchases

**Props**:
```typescript
interface PurchaseModalProps {
  credit: CarbonCredit;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}
```

**Features**:
- Credit details display
- Quantity input with validation
- Price calculation (USD and KES)
- Total amount display
- Integration with PurchaseFlow

#### 2. PurchaseFlow

**Location**: `src/components/marketplace/PurchaseFlow.tsx`

**Purpose**: Multi-step purchase wizard with Paystack integration

**Props**:
```typescript
interface PurchaseFlowProps {
  credit: CarbonCredit;
  quantity: number;
  onSuccess: (transaction: Transaction) => void;
  onCancel: () => void;
}
```

**Features**:
- Payment initialization
- Paystack popup integration
- Payment verification
- Success/error handling
- Loading states

#### 3. PurchaseConfirmation

**Location**: `src/components/marketplace/PurchaseConfirmation.tsx`

**Purpose**: Success confirmation screen after purchase

**Props**:
```typescript
interface PurchaseConfirmationProps {
  transaction: Transaction;
  credit: CarbonCredit;
  onClose: () => void;
}
```

**Features**:
- Transaction details display
- Certificate download link
- Navigation to transaction history
- Success animation

#### 4. PaystackTestModeBanner

**Location**: `src/components/marketplace/PaystackTestModeBanner.tsx`

**Purpose**: Visual indicator for test mode with test card information

**Features**:
- Prominent warning banner
- Test card numbers display
- Dismissible
- Only shown in test mode

### Currency Conversion

**Exchange Rate**: Configurable via `VITE_USD_TO_KES_RATE` (default: 150)

**Conversion Logic**:
```typescript
// USD to KES
const amountKES = amountUSD * exchangeRate;
const amountKobo = Math.round(amountKES * 100); // Paystack uses kobo

// KES to USD
const amountUSD = amountKES / exchangeRate;
```

**Display Format**:
- USD: $100.00
- KES: KES 15,000.00
- Both currencies shown to user

### Test Mode

**Configuration**:
- Set `VITE_PAYSTACK_MODE=test` for test mode
- Set `VITE_PAYSTACK_MODE=live` for production
- Use test public key in test mode
- Use live public key in production

**Test Cards**:
- Success: 4084084084084081
- Insufficient funds: 5060666666666666666
- Invalid card: 4000000000000002

**Visual Indicators**:
- Test mode banner shown at top of marketplace
- Test card information displayed
- Warning colors (yellow/orange)

### Security Features

1. **Server-Side Verification**
   - All payments verified via Edge Function
   - Never trust client-side verification
   - Paystack API called from server

2. **Webhook Signature Verification**
   - All webhooks verified with secret key
   - Invalid signatures rejected
   - Prevents webhook spoofing

3. **Transaction Idempotency**
   - Duplicate payments prevented
   - Reference checked before processing
   - Database constraints enforce uniqueness

4. **Secure Key Storage**
   - API keys in environment variables
   - Never exposed to client
   - Separate keys for test/live

### Error Handling

**Common Errors**:
- Payment initialization failed
- Payment verification failed
- Insufficient credit availability
- Network errors
- Invalid payment reference

**Error Display**:
- User-friendly error messages
- Retry options
- Support contact information
- Detailed logging for debugging

---

## Edge Functions

### Overview

Supabase Edge Functions provide serverless compute for backend operations that require secure API keys or complex logic.

**Status**: ✅ 2 Edge Functions Deployed

### 1. verify-paystack-payment

**Location**: `supabase/functions/verify-paystack-payment/index.ts`

**Purpose**: Verify payment with Paystack API and update database

**Endpoint**: `POST /functions/v1/verify-paystack-payment`

**Request Body**:
```typescript
{
  reference: string;
  transaction_id: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  status: 'success' | 'failed' | 'abandoned';
  amount?: number;
  paid_at?: string;
  error?: string;
}
```

**Process**:
1. Receive payment reference and transaction ID
2. Call Paystack API to verify payment
3. Check payment status
4. Update transaction record in database
5. Update carbon credit availability
6. Return verification result

**Error Handling**:
- Invalid reference
- Payment not found
- Verification failed
- Database update failed

### 2. paystack-webhook

**Location**: `supabase/functions/paystack-webhook/index.ts`

**Purpose**: Handle Paystack webhook events for real-time updates

**Endpoint**: `POST /functions/v1/paystack-webhook`

**Webhook Events**:
- `charge.success` - Payment successful
- `charge.failed` - Payment failed
- `charge.abandoned` - Payment abandoned

**Process**:
1. Receive webhook event from Paystack
2. Verify webhook signature
3. Extract payment reference and status
4. Update transaction record
5. Update carbon credit availability (if needed)
6. Log event for audit trail
7. Return 200 OK

**Security**:
- Signature verification with secret key
- Invalid signatures rejected (401)
- Comprehensive logging
- Idempotent processing

**Configuration**:
- Webhook URL: `https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/paystack-webhook`
- Set in Paystack dashboard
- Secret key from environment variable

---

## Carbon Credit Marketplace

### Overview

The carbon credit marketplace enables users to browse, purchase, and track verified carbon credits generated from tree planting initiatives.

**Status**: ✅ Backend Complete, UI In Progress

### Type Definitions

**Location**: `src/types/carbonCredit.types.ts`

```typescript
// Carbon credit listing
export interface CarbonCredit {
  id: string;
  initiative_id: string;
  quantity_tons: number;
  available_quantity: number;
  price_per_ton: number;
  currency: 'USD' | 'KES';
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_certificate_url?: string;
  created_at: string;
  updated_at: string;
}

// Transaction record
export interface Transaction {
  id: string;
  buyer_id: string;
  credit_id: string;
  quantity_tons: number;
  price_per_ton: number;
  total_amount: number;
  currency: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'mobile_money';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  paystack_reference?: string;
  paystack_access_code?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Carbon Credit Service

**Location**: `src/services/carbonCredit.service.ts`

**Key Methods**:

```typescript
class CarbonCreditService {
  // Get all credits with filters
  async getCredits(filters?: CreditFilters): Promise<CreditsResponse>;

  // Get verified credits only
  async getVerifiedCredits(): Promise<CreditsResponse>;

  // Get single credit
  async getCredit(creditId: string): Promise<CreditResponse>;

  // Create credit listing (organizations)
  async createCredit(data: CreateCreditData): Promise<CreditResponse>;

  // Update credit
  async updateCredit(creditId: string, updates: UpdateCreditData): Promise<CreditResponse>;

  // Update verification status (admin)
  async updateVerificationStatus(
    creditId: string,
    status: VerificationStatus,
    certificateUrl?: string
  ): Promise<CreditResponse>;

  // Create transaction (purchase)
  async createTransaction(data: CreateTransactionData): Promise<TransactionResponse>;

  // Get transaction
  async getTransaction(transactionId: string): Promise<TransactionResponse>;

  // Get user transactions
  async getUserTransactions(userId: string): Promise<TransactionsResponse>;

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    certificateUrl?: string
  ): Promise<TransactionResponse>;

  // Calculate credit availability
  async calculateAvailability(creditId: string): Promise<number>;

  // Convert price between currencies
  convertPrice(amount: number, from: Currency, to: Currency): PriceConversion;
}
```

### Marketplace Components

#### 1. CreditCard

**Location**: `src/components/marketplace/CreditCard.tsx`

**Purpose**: Display carbon credit summary in card format

**Features**:
- Credit details (quantity, price, initiative)
- Verification badge
- Availability indicator
- Purchase button
- Hover effects

#### 2. CarbonCreditList

**Location**: `src/components/marketplace/CarbonCreditList.tsx`

**Purpose**: Grid display of carbon credits with filtering

**Features**:
- Grid layout (responsive)
- Filter by verification status
- Filter by price range
- Search by initiative
- Sort options
- Empty state

---

