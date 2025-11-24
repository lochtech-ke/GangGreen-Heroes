# GangGreen Hero Badge Design

## Overview

The GangGreen Hero Badge is a premium purchasable NFT badge that serves as both a status symbol and a functional reward system within the #GangGreen platform. This feature extends the existing badge purchase system to include a special "Hero" tier badge that provides ongoing GG coin earnings, exclusive platform benefits, and enhanced user privileges. The system integrates with the existing Paystack payment infrastructure, GG coin reward system, and badge generation services to create a comprehensive premium user experience.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    GangGreen Hero Badge System                   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Badge Purchase  │  │ Reward Engine   │  │ Hero Benefits   │
    │    System       │  │                 │  │    System       │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
                │                   │                   │
                ▼                   ▼                   ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Paystack        │  │ GG Coin Service │  │ User Privileges │
    │ Integration     │  │                 │  │   Manager       │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
                │                   │                   │
                ▼                   ▼                   ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Badge SVG       │  │ Transaction     │  │ Analytics &     │
    │ Generator       │  │   Logger        │  │ Monitoring      │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Data Flow

1. **Purchase Initiation**: User selects GangGreen Hero badge → System displays badge details, benefits, and pricing
2. **Payment Processing**: User completes payment via Paystack → System verifies payment and mints badge
3. **Hero Status Grant**: Successful purchase → System grants Hero status and generates badge SVG
4. **Daily Rewards**: Automated scheduler → System credits daily GG coins to Hero badge holders
5. **Benefit Access**: Hero user interacts with platform → System applies enhanced privileges and multipliers
6. **Analytics Tracking**: All interactions → System logs usage data for optimization

## Components and Interfaces

### 1. GangGreen Hero Badge Service

**File**: `src/services/gangGreenHeroBadge.service.ts`

```typescript
interface HeroBadgeConfig {
  badgeType: 'ganggreen_hero';
  tier: 'hero';
  priceKes: number;
  dailyGGCoinReward: number;
  benefitMultipliers: {
    initiativeRewards: number;
    marketplaceDiscount: number;
    contentPriority: number;
  };
}

interface HeroBadgePurchaseParams {
  userId: string;
  email: string;
  metadata?: {
    referralCode?: string;
    campaignSource?: string;
  };
}

interface HeroBadgeHolder {
  userId: string;
  badgeId: string;
  purchaseDate: string;
  lastRewardDate: string;
  totalRewardsEarned: number;
  status: 'active' | 'suspended';
}

class GangGreenHeroBadgeService {
  async purchaseHeroBadge(params: HeroBadgePurchaseParams): Promise<InitiatePurchaseResult>
  async getHeroBadgeConfig(): Promise<HeroBadgeConfig>
  async isHeroUser(userId: string): Promise<boolean>
  async getHeroHolders(): Promise<HeroBadgeHolder[]>
  async suspendHeroStatus(userId: string, reason: string): Promise<void>
  async reinstateHeroStatus(userId: string): Promise<void>
}
```

### 2. Hero Reward Distribution Engine

**File**: `src/services/heroRewardEngine.service.ts`

```typescript
interface DailyRewardConfig {
  baseAmount: number;
  bonusMultipliers: {
    consecutiveDays: number[];
    activityLevel: number;
  };
  maxDailyReward: number;
}

interface RewardDistributionResult {
  totalHolders: number;
  successfulDistributions: number;
  failedDistributions: number;
  totalAmountDistributed: number;
  errors: string[];
}

class HeroRewardEngineService {
  async distributeDaily Rewards(): Promise<RewardDistributionResult>
  async calculateUserReward(userId: string): Promise<number>
  async getRewardHistory(userId: string): Promise<GGCoinTransaction[]>
  async updateRewardRates(config: DailyRewardConfig): Promise<void>
  async retryFailedDistributions(): Promise<void>
}
```

### 3. Hero Benefits Manager

**File**: `src/services/heroBenefits.service.ts`

```typescript
interface HeroBenefits {
  enhancedRewards: {
    initiativeMultiplier: number;
    achievementBonus: number;
  };
  platformPrivileges: {
    reducedFees: number;
    prioritySupport: boolean;
    exclusiveFeatures: string[];
  };
  socialBenefits: {
    contentPriority: number;
    specialBadge: boolean;
    heroFlair: boolean;
  };
}

interface BenefitUsageAnalytics {
  userId: string;
  benefitType: string;
  usageCount: number;
  lastUsed: string;
  valueGenerated: number;
}

class HeroBenefitsService {
  async getHeroBenefits(): Promise<HeroBenefits>
  async applyRewardMultiplier(userId: string, baseReward: number): Promise<number>
  async calculateFeeDiscount(userId: string, baseFee: number): Promise<number>
  async trackBenefitUsage(userId: string, benefitType: string, value: number): Promise<void>
  async getBenefitAnalytics(userId: string): Promise<BenefitUsageAnalytics[]>
}
```

### 4. Hero Badge UI Components

**File**: `src/components/badges/HeroBadgeMarketplace.tsx`

```typescript
interface HeroBadgeMarketplaceProps {
  onPurchase: (result: InitiatePurchaseResult) => void;
  showComparison?: boolean;
}

const HeroBadgeMarketplace: React.FC<HeroBadgeMarketplaceProps>
```

**File**: `src/components/badges/HeroBenefitsDisplay.tsx`

```typescript
interface HeroBenefitsDisplayProps {
  userId: string;
  showAnalytics?: boolean;
  compact?: boolean;
}

const HeroBenefitsDisplay: React.FC<HeroBenefitsDisplayProps>
```

**File**: `src/components/admin/HeroBadgeAnalytics.tsx`

```typescript
interface HeroBadgeAnalyticsProps {
  dateRange: { start: string; end: string };
  showDetails?: boolean;
}

const HeroBadgeAnalytics: React.FC<HeroBadgeAnalyticsProps>
```

## Data Models

### Database Schema Updates

#### 1. Create `hero_badge_config` table

```sql
CREATE TABLE IF NOT EXISTS hero_badge_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type VARCHAR(50) NOT NULL DEFAULT 'ganggreen_hero',
  tier VARCHAR(20) NOT NULL DEFAULT 'hero',
  price_kes INTEGER NOT NULL DEFAULT 500,
  daily_gg_coin_reward DECIMAL(10,3) NOT NULL DEFAULT 0.100,
  initiative_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.50,
  marketplace_discount DECIMAL(5,2) NOT NULL DEFAULT 0.10,
  content_priority_boost INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO hero_badge_config (
  badge_type, tier, price_kes, daily_gg_coin_reward,
  initiative_multiplier, marketplace_discount, content_priority_boost
) VALUES (
  'ganggreen_hero', 'hero', 500, 0.100,
  1.50, 0.10, 2
);
```

#### 2. Create `hero_badge_holders` table

```sql
CREATE TABLE IF NOT EXISTS hero_badge_holders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  badge_purchase_id UUID NOT NULL REFERENCES badge_purchases(id),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_reward_date TIMESTAMP WITH TIME ZONE,
  total_rewards_earned DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  consecutive_reward_days INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  suspension_reason TEXT,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended'))
);

CREATE INDEX idx_hero_badge_holders_user ON hero_badge_holders(user_id);
CREATE INDEX idx_hero_badge_holders_status ON hero_badge_holders(status);
CREATE INDEX idx_hero_badge_holders_last_reward ON hero_badge_holders(last_reward_date);
```

#### 3. Create `hero_daily_rewards` table

```sql
CREATE TABLE IF NOT EXISTS hero_daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reward_date DATE NOT NULL,
  base_amount DECIMAL(10,3) NOT NULL,
  bonus_amount DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  total_amount DECIMAL(10,3) NOT NULL,
  consecutive_days INTEGER NOT NULL DEFAULT 1,
  activity_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  gg_coin_transaction_id UUID REFERENCES gg_coin_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, reward_date)
);

CREATE INDEX idx_hero_daily_rewards_user ON hero_daily_rewards(user_id);
CREATE INDEX idx_hero_daily_rewards_date ON hero_daily_rewards(reward_date);
```

#### 4. Create `hero_benefit_usage` table

```sql
CREATE TABLE IF NOT EXISTS hero_benefit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  benefit_type VARCHAR(50) NOT NULL,
  usage_context VARCHAR(100),
  value_applied DECIMAL(10,3),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hero_benefit_usage_user ON hero_benefit_usage(user_id);
CREATE INDEX idx_hero_benefit_usage_type ON hero_benefit_usage(benefit_type);
CREATE INDEX idx_hero_benefit_usage_date ON hero_benefit_usage(created_at);
```

#### 5. Update `badge_purchases` table

```sql
ALTER TABLE badge_purchases 
ADD COLUMN IF NOT EXISTS is_hero_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_benefits_activated BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_badge_purchases_hero ON badge_purchases(is_hero_badge);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework, I've identified several areas for consolidation:

- Properties 1.1 and 5.1-5.5 can be combined into comprehensive UI display properties
- Properties 2.1-2.3 can be consolidated into a single reward distribution property
- Properties 3.1-3.5 can be combined into a comprehensive Hero benefits property
- Properties 4.1-4.5 can be consolidated into admin functionality properties

### Core Properties

**Property 1: Hero Badge Purchase Flow Integrity**
*For any* valid user and payment, completing a GangGreen Hero badge purchase should result in badge minting, Hero status grant, blockchain transaction recording, and proper error handling for failures
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

**Property 2: Daily Reward Distribution Consistency**
*For any* Hero badge holder, the system should automatically credit the correct daily GG coin amount, maintain accurate transaction records, and update calculations when status changes
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

**Property 3: Hero Benefits Application**
*For any* Hero status user, the system should consistently apply enhanced multipliers, reduced fees, priority visibility, and track all benefit usage
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

**Property 4: Administrative Control Integrity**
*For any* authorized administrator, the system should provide comprehensive analytics, allow rate modifications, provide audit trails, generate performance reports, and handle fraud detection
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

**Property 5: Marketplace Information Display**
*For any* user visiting the badge marketplace, the system should display complete Hero badge specifications, current earning rates, benefit documentation, comparison tools, and support resources
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

## Error Handling

### Payment Processing Errors

```typescript
enum HeroBadgePaymentError {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  PAYMENT_GATEWAY_ERROR = 'payment_gateway_error',
  DUPLICATE_PURCHASE = 'duplicate_purchase',
  USER_ALREADY_HERO = 'user_already_hero',
  BADGE_UNAVAILABLE = 'badge_unavailable'
}

interface PaymentErrorHandler {
  handleError(error: HeroBadgePaymentError, context: any): Promise<void>;
  retryPayment(reference: string): Promise<boolean>;
  refundPayment(reference: string, reason: string): Promise<void>;
}
```

### Reward Distribution Errors

```typescript
interface RewardDistributionError {
  userId: string;
  errorType: 'insufficient_balance' | 'user_suspended' | 'system_error';
  attemptCount: number;
  lastAttempt: string;
  nextRetry: string;
}

class RewardErrorHandler {
  async retryFailedRewards(): Promise<void>;
  async escalateToAdmin(errors: RewardDistributionError[]): Promise<void>;
  async suspendProblematicUsers(userIds: string[]): Promise<void>;
}
```

### Hero Status Management Errors

```typescript
interface HeroStatusError {
  userId: string;
  operation: 'grant' | 'suspend' | 'reinstate';
  error: string;
  timestamp: string;
}

class HeroStatusErrorHandler {
  async handleStatusChangeFailure(error: HeroStatusError): Promise<void>;
  async auditStatusChanges(): Promise<HeroStatusError[]>;
  async reconcileStatusInconsistencies(): Promise<void>;
}
```

## Testing Strategy

### Unit Tests

**Badge Purchase Service Tests**:
- Test Hero badge purchase initiation with valid/invalid parameters
- Test payment verification and badge minting process
- Test Hero status granting and database updates
- Test error handling for payment failures
- Mock Paystack responses and database operations

**Reward Engine Tests**:
- Test daily reward calculation logic
- Test reward distribution to multiple users
- Test consecutive day bonus calculations
- Test activity multiplier applications
- Test retry logic for failed distributions

**Benefits Manager Tests**:
- Test reward multiplier calculations
- Test fee discount applications
- Test content priority boost logic
- Test benefit usage tracking
- Test analytics data generation

### Property-Based Tests

**Property 1: Purchase Flow Integrity**
- Generate random user data and payment scenarios
- Verify that successful purchases always result in Hero status
- Test that failed payments never grant Hero status
- Verify blockchain transaction recording consistency

**Property 2: Reward Distribution Consistency**
- Generate random sets of Hero badge holders
- Verify that all active holders receive daily rewards
- Test that reward amounts match configuration
- Verify transaction record accuracy

**Property 3: Benefits Application**
- Generate random Hero users and platform interactions
- Verify that multipliers are consistently applied
- Test that fee discounts are correctly calculated
- Verify benefit usage tracking accuracy

**Property 4: Administrative Functions**
- Generate random admin operations and data sets
- Verify that analytics data is accurate and complete
- Test that rate modifications are properly applied
- Verify audit trail completeness

**Property 5: Information Display**
- Generate random marketplace visits and user states
- Verify that all required information is displayed
- Test that earning rates and benefits are accurate
- Verify comparison functionality correctness

### Integration Tests

**End-to-End Hero Badge Purchase**:
- Complete purchase flow from marketplace to Hero status
- Verify Paystack integration and webhook processing
- Test badge SVG generation and storage
- Verify GG coin crediting and transaction logging

**Daily Reward Distribution**:
- Test automated reward distribution process
- Verify database updates and transaction creation
- Test error handling and retry mechanisms
- Verify notification sending to users

**Hero Benefits Application**:
- Test enhanced rewards in initiative participation
- Verify marketplace fee discounts
- Test content priority in social feeds
- Verify analytics tracking accuracy

## Security Considerations

### Payment Security

1. **Secure Payment Processing**
   - Use Paystack's secure payment infrastructure
   - Implement webhook signature verification
   - Never store sensitive payment information
   - Use HTTPS for all payment-related communications

2. **Duplicate Purchase Prevention**
   - Check existing Hero status before purchase initiation
   - Use unique payment references
   - Implement idempotent payment processing
   - Lock user accounts during purchase processing

### Hero Status Integrity

1. **Status Verification**
   - Verify Hero status on every benefit application
   - Implement server-side status checks
   - Use database constraints to prevent invalid states
   - Audit all status changes with timestamps

2. **Benefit Abuse Prevention**
   - Rate limit benefit usage
   - Monitor for suspicious activity patterns
   - Implement automatic suspension triggers
   - Log all benefit applications for audit

### Reward Distribution Security

1. **Reward Integrity**
   - Use database transactions for atomic operations
   - Implement double-entry accounting for GG coins
   - Verify reward calculations server-side
   - Prevent manual reward manipulation

2. **System Access Control**
   - Restrict admin functions to authorized users
   - Implement role-based access control
   - Log all administrative actions
   - Require multi-factor authentication for sensitive operations

## Performance Considerations

### Daily Reward Distribution

1. **Batch Processing**
   - Process rewards in batches to avoid database overload
   - Use background job queues for large-scale operations
   - Implement exponential backoff for retries
   - Monitor processing times and optimize as needed

2. **Database Optimization**
   - Use appropriate indexes for reward queries
   - Implement connection pooling
   - Cache frequently accessed configuration data
   - Use read replicas for analytics queries

### Real-time Benefit Application

1. **Caching Strategy**
   - Cache Hero status in Redis for fast lookups
   - Cache benefit configurations to reduce database queries
   - Implement cache invalidation on status changes
   - Use CDN for static badge assets

2. **API Performance**
   - Implement request rate limiting
   - Use async processing for non-critical operations
   - Optimize database queries with proper indexing
   - Monitor API response times and set alerts

### Analytics and Reporting

1. **Data Aggregation**
   - Pre-calculate common analytics metrics
   - Use materialized views for complex reports
   - Implement data archiving for historical records
   - Use time-series databases for performance metrics

2. **Report Generation**
   - Generate reports asynchronously
   - Cache report results for repeated requests
   - Implement report scheduling for regular updates
   - Use compression for large data exports

## Deployment Strategy

### Database Migrations

1. **Schema Updates**
   - Create new tables for Hero badge system
   - Add indexes for performance optimization
   - Update existing tables with new columns
   - Implement data migration scripts

2. **Configuration Setup**
   - Insert default Hero badge configuration
   - Set up reward distribution schedules
   - Configure benefit multipliers and discounts
   - Initialize admin user permissions

### Service Deployment

1. **Backend Services**
   - Deploy Hero badge service with proper error handling
   - Set up reward distribution cron jobs
   - Configure benefit application middleware
   - Implement monitoring and alerting

2. **Frontend Components**
   - Deploy Hero badge marketplace UI
   - Update navigation to include Hero features
   - Implement Hero status indicators
   - Add benefit usage tracking

### Monitoring and Alerting

1. **System Health**
   - Monitor reward distribution success rates
   - Track payment processing performance
   - Alert on benefit application failures
   - Monitor database performance metrics

2. **Business Metrics**
   - Track Hero badge sales and revenue
   - Monitor reward distribution costs
   - Analyze benefit usage patterns
   - Generate regular business reports