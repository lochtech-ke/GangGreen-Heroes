# Quick Reference - NFT Badge Purchase System

## 🚀 Quick Start (3 Steps)

### 1. Add Badge Marketplace Route
```tsx
import { BadgeMarketplace } from './components/nft';

<Route 
  path="/badges" 
  element={
    <BadgeMarketplace 
      userId={currentUser.id}
      userEmail={currentUser.email}
      userProfileUrl={`/profile/${currentUser.id}`}
    />
  } 
/>
```

### 2. Add GG Coin Balance to Navigation
```tsx
import { GGCoinBalance } from './components/gamification';

<GGCoinBalance userId={currentUser.id} />
```

### 3. Done! 
Profile already includes GG Coins section automatically.

---

## 📦 Components

### BadgeMarketplace
Browse and purchase badges
```tsx
<BadgeMarketplace 
  userId={string}
  userEmail={string}
  userProfileUrl={string}
/>
```

### GGCoinBalance
Display user's GG Coin balance
```tsx
<GGCoinBalance 
  userId={string}
  className={string}
  showTooltip={boolean}
/>
```

### BadgePurchaseModal
Initiate badge purchase (used internally by marketplace)
```tsx
<BadgePurchaseModal
  isOpen={boolean}
  onClose={() => void}
  badgeType={string}
  tier={string}
  badgeName={string}
  badgeImage={string}
  userId={string}
  userEmail={string}
  onSuccess={(ggCoinsEarned: number) => void}
/>
```

### BadgePurchaseConfirmation
Show purchase success (used internally)
```tsx
<BadgePurchaseConfirmation
  isOpen={boolean}
  onClose={() => void}
  badgeName={string}
  badgeType={string}
  tier={string}
  badgeImage={string}
  transactionReference={string}
  ggCoinsEarned={number}
  userProfileUrl={string}
/>
```

### BadgeSocialShare
Social media sharing buttons
```tsx
<BadgeSocialShare
  badgeName={string}
  badgeType={string}
  tier={string}
  userProfileUrl={string}
  badgeImageUrl={string}
/>
```

### BadgePurchaseAnalytics (Admin)
Analytics dashboard
```tsx
<BadgePurchaseAnalytics />
```

---

## 🔧 Services

### ggCoinService

```tsx
import { ggCoinService } from './services';

// Get balance
const balance = await ggCoinService.getBalance(userId);

// Credit coins
const result = await ggCoinService.creditCoins({
  userId: 'user-uuid',
  amount: 1,
  transactionType: 'purchase_reward',
  referenceType: 'badge_purchase',
  referenceId: 'purchase-uuid',
  description: 'Earned 1 GG Coin',
});

// Get transaction history
const transactions = await ggCoinService.getTransactionHistory(userId, 10);

// Subscribe to balance changes
const unsubscribe = ggCoinService.subscribeToBalance(userId, (newBalance) => {
  console.log('New balance:', newBalance);
});
```

### badgePurchaseService

```tsx
import { badgePurchaseService } from './services';

// Initiate purchase
const result = await badgePurchaseService.initiatePurchase({
  userId: currentUser.id,
  badgeType: 'tree_planter',
  tier: 'bronze',
  email: currentUser.email,
});

// Complete purchase (after payment)
const completion = await badgePurchaseService.completePurchase({
  reference: 'GG-123456',
  userId: currentUser.id,
});

// Get user's purchases
const purchases = await badgePurchaseService.getUserPurchases(userId);
```

### badgeAnalyticsService (Admin)

```tsx
import { badgeAnalyticsService } from './services';

// Get analytics
const analytics = await badgeAnalyticsService.getAnalytics({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});

// Export CSV
const csv = await badgeAnalyticsService.exportToCSV(dateRange);
```

---

## 💾 Database

### Tables
- `badge_purchases` - Purchase records
- `gg_coin_transactions` - Transaction audit trail
- `user_gamification` - User balances (gg_coins column)

### Functions
```sql
-- Credit GG Coins
SELECT credit_gg_coins(
  p_user_id := 'user-uuid',
  p_amount := 1,
  p_transaction_type := 'purchase_reward',
  p_reference_type := 'badge_purchase',
  p_reference_id := 'purchase-uuid',
  p_description := 'Earned 1 GG Coin'
);

-- Debit GG Coins
SELECT debit_gg_coins(
  p_user_id := 'user-uuid',
  p_amount := 1,
  p_transaction_type := 'debit',
  p_description := 'Spent 1 GG Coin'
);
```

---

## 🎯 Constants

```tsx
import { BADGE_PRICE_KES, BADGE_PURCHASE_GG_COIN_REWARD } from './types';

BADGE_PRICE_KES = 200 // All badges cost KES 200
BADGE_PURCHASE_GG_COIN_REWARD = 1 // Earn 1 GG Coin per purchase
```

---

## 🧪 Testing

### Paystack Test Card
```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Test Flow
1. Go to `/badges`
2. Click "Purchase" on any badge
3. Use test card above
4. Verify:
   - Payment success
   - GG Coin balance +1
   - Transaction in history
   - Notification received

---

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
VITE_PAYSTACK_MODE=test
```

---

## 🐛 Troubleshooting

### GG Coins not credited
1. Check webhook is configured in Paystack
2. Verify webhook URL is correct
3. Check Supabase Edge Function logs
4. Ensure database migration is applied

### Payment modal not opening
1. Verify Paystack SDK is loaded
2. Check VITE_PAYSTACK_PUBLIC_KEY is set
3. Check browser console for errors

### Balance not updating
1. Check Supabase real-time is enabled
2. Verify subscription is set up
3. Check WebSocket connection

---

## 📞 Support

- **Integration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Full Documentation:** [README.md](./README.md)
- **Task List:** [tasks.md](./tasks.md)

---

**Last Updated:** November 18, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
