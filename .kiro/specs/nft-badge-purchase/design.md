# NFT Badge Purchase with GG Coins Design

## Overview

This design document outlines the architecture for enabling users to purchase NFT badges for KES 200 using Paystack, earn 1 GG Coin per purchase, and share their achievements on social media with #GangGreen and #GBM hashtags. The feature builds upon the existing Paystack integration, NFT badge system, and gamification infrastructure to create a seamless purchase-to-reward flow with social sharing capabilities.

## Architecture

### System Components

```
┌─────────────────┐
│   Badge UI      │
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│ Badge Purchase  │─────▶│  Paystack Hook   │
│   Service       │      │  (usePaystack)   │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         │                        ▼
         │               ┌──────────────────┐
         │               │ Paystack Gateway │
         │               │   (External)     │
         │               └────────┬─────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│  GG Coin        │      │ Payment Webhook  │
│  Reward Service │◀─────│  (Supabase Fn)   │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Social Share   │      │  Notification    │
│   Component     │      │    Service       │
└─────────────────┘      └──────────────────┘
```

### Data Flow

1. User selects badge → Badge UI displays KES 200 price
2. User clicks purchase → Badge Purchase Service initiates Paystack payment
3. Paystack processes payment → Webhook confirms transaction
4. On success → GG Coin Reward Service credits 1 coin
5. Badge minted → Social Share Component displays with hashtags
6. User shares → Analytics tracks share event

## Components and Interfaces

### 1. Badge Purchase Service

**File**: `src/services/badgePurchase.service.ts`

```typescript
interface BadgePurchaseRequest {
  badgeId: string;
  userId: string;
  amount: number; // Fixed at 20000 (KES 200 in kobo)
}

interface BadgePurchaseResponse {
  transactionId: string;
  badgeId: string;
  ggCoinsEarned: number;
  paystackReference: string;
}

class BadgePurchaseService {
  async initiatePurchase(request: BadgePurchaseRequest): Promise<PaystackInitResponse>
  async completePurchase(reference: string): Promise<BadgePurchaseResponse>
  async verifyAndReward(reference: string): Promise<void>
}
```

### 2. GG Coin Reward Service

**File**: `src/services/ggCoin.service.ts`

```typescript
interface GGCoinReward {
  userId: string;
  amount: number;
  source: 'badge_purchase' | 'achievement' | 'referral';
  referenceId: string;
}

interface GGCoinBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

class GGCoinService {
  async creditCoins(reward: GGCoinReward): Promise<void>
  async getBalance(userId: string): Promise<GGCoinBalance>
  async getTransactionHistory(userId: string): Promise<GGCoinReward[]>
}
```

### 3. Social Share Component

**File**: `src/components/nft/BadgeSocialShare.tsx`

```typescript
interface ShareConfig {
  platform: 'twitter' | 'facebook' | 'whatsapp' | 'linkedin';
  badgeName: string;
  badgeImageUrl: string;
  profileUrl: string;
  hashtags: string[]; // ['GangGreen', 'GBM']
}

interface BadgeSocialShareProps {
  badgeId: string;
  badgeName: string;
  badgeImageUrl: string;
  onShare: (platform: string) => void;
}

const BadgeSocialShare: React.FC<BadgeSocialShareProps>
```

### 4. Badge Purchase Modal

**File**: `src/components/nft/BadgePurchaseModal.tsx`

```typescript
interface BadgePurchaseModalProps {
  badge: NFTBadge;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BadgePurchaseResponse) => void;
}

const BadgePurchaseModal: React.FC<BadgePurchaseModalProps>
```

### 5. GG Coin Display Component

**File**: `src/components/gamification/GGCoinBalance.tsx`

```typescript
interface GGCoinBalanceProps {
  userId: string;
  showHistory?: boolean;
  animated?: boolean;
}

const GGCoinBalance: React.FC<GGCoinBalanceProps>
```

## Data Models

### Database Schema Updates

#### 1. Update `user_gamification` table

```sql
ALTER TABLE user_gamification 
ADD COLUMN IF NOT EXISTS gg_coins INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_gamification_gg_coins 
ON user_gamification(gg_coins);
```

#### 2. Update `gamified_actions` table

```sql
ALTER TABLE gamified_actions 
ADD COLUMN IF NOT EXISTS gg_coins_awarded INTEGER DEFAULT 0;
```

#### 3. Update `nft_badges` table

```sql
ALTER TABLE nft_badges 
ADD COLUMN IF NOT EXISTS price_kes INTEGER DEFAULT 20000,
ADD COLUMN IF NOT EXISTS gg_coin_reward INTEGER DEFAULT 1;
```

#### 4. Create `badge_purchases` table

```sql
CREATE TABLE IF NOT EXISTS badge_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  badge_id UUID NOT NULL REFERENCES nft_badges(id),
  amount_kes INTEGER NOT NULL,
  gg_coins_earned INTEGER NOT NULL,
  paystack_reference VARCHAR(255) NOT NULL UNIQUE,
  payment_status VARCHAR(50) NOT NULL,
  shared_platforms TEXT[], -- Array of platforms shared to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_badge_purchases_user ON badge_purchases(user_id);
CREATE INDEX idx_badge_purchases_reference ON badge_purchases(paystack_reference);
```

#### 5. Create `gg_coin_transactions` table

```sql
CREATE TABLE IF NOT EXISTS gg_coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'credit' or 'debit'
  source VARCHAR(100) NOT NULL, -- 'badge_purchase', 'achievement', etc.
  reference_id UUID, -- Links to badge_purchases, achievements, etc.
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gg_coin_transactions_user ON gg_coin_transactions(user_id);
CREATE INDEX idx_gg_coin_transactions_created ON gg_coin_transactions(created_at);
```

## Error Handling

### Payment Failures

```typescript
enum PaymentErrorType {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  NETWORK_ERROR = 'network_error',
  INVALID_CARD = 'invalid_card',
  TRANSACTION_DECLINED = 'transaction_declined',
  TIMEOUT = 'timeout'
}

interface PaymentError {
  type: PaymentErrorType;
  message: string;
  retryable: boolean;
  paystackCode?: string;
}
```

**Handling Strategy**:
- Display user-friendly error messages
- Allow retry for retryable errors
- Log all errors for admin review
- Send notification for persistent failures

### GG Coin Credit Failures

```typescript
interface CoinCreditError {
  userId: string;
  amount: number;
  purchaseReference: string;
  attemptCount: number;
  lastError: string;
}
```

**Handling Strategy**:
- Retry up to 3 times with exponential backoff
- Create pending reward record after max retries
- Admin dashboard shows pending rewards
- Manual reconciliation process for failed credits

### Social Share Failures

**Handling Strategy**:
- Share failures don't block purchase completion
- Track share attempts in analytics
- Graceful degradation if share APIs unavailable
- Fallback to copy-to-clipboard option

## Testing Strategy

### Unit Tests

1. **Badge Purchase Service**
   - Test price calculation (KES 200 = 20000 kobo)
   - Test Paystack initialization
   - Test purchase completion flow
   - Mock Paystack responses

2. **GG Coin Service**
   - Test coin crediting logic
   - Test balance retrieval
   - Test transaction history
   - Test concurrent credit operations

3. **Social Share Component**
   - Test message generation with hashtags
   - Test platform-specific formatting
   - Test share URL generation
   - Test analytics tracking

### Integration Tests

1. **End-to-End Purchase Flow**
   - User selects badge → Payment → Coin credit → Share
   - Test with Paystack test mode
   - Verify database updates
   - Verify notifications sent

2. **Webhook Processing**
   - Test successful payment webhook
   - Test failed payment webhook
   - Test duplicate webhook handling
   - Test webhook signature verification

3. **GG Coin Balance Updates**
   - Test real-time balance updates
   - Test transaction history accuracy
   - Test concurrent purchases

### Manual Testing Checklist

- [ ] Purchase badge with test card
- [ ] Verify KES 200 charge
- [ ] Confirm 1 GG Coin credited
- [ ] Test social share on each platform
- [ ] Verify hashtags appear correctly
- [ ] Check notification received
- [ ] Verify badge appears in user profile
- [ ] Test purchase failure scenarios
- [ ] Verify admin analytics accuracy

## Security Considerations

1. **Payment Security**
   - Use Paystack's secure payment popup
   - Never store card details
   - Verify webhook signatures
   - Use HTTPS for all API calls

2. **GG Coin Integrity**
   - Validate coin credits server-side
   - Prevent double-crediting
   - Use database transactions for atomicity
   - Audit trail for all coin operations

3. **Social Share Security**
   - Sanitize user-generated content
   - Validate URLs before sharing
   - Rate limit share actions
   - Track suspicious sharing patterns

## Performance Considerations

1. **Payment Processing**
   - Paystack popup loads asynchronously
   - Webhook processing < 2 seconds
   - Database updates use transactions

2. **GG Coin Updates**
   - Real-time balance updates via Supabase subscriptions
   - Cache balance in React state
   - Optimistic UI updates

3. **Social Sharing**
   - Pre-generate share URLs
   - Lazy load share buttons
   - Track shares asynchronously

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Paystack webhook endpoint configured
- [ ] Environment variables set (VITE_PAYSTACK_PUBLIC_KEY)
- [ ] Social share meta tags configured
- [ ] Analytics tracking verified
- [ ] Test mode badge purchases working
- [ ] Production Paystack keys ready (not deployed yet)
- [ ] Admin dashboard shows purchase analytics
- [ ] Notification templates created
- [ ] Error monitoring configured