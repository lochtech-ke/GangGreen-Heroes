# Integration Guide - NFT Badge Purchase System

## Quick Start

### 1. Apply Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/014_add_badge_purchases_and_gg_coins.sql`
4. Paste and run the SQL

**Option B: CLI (if configured)**
```bash
npx supabase db push
```

### 2. Add Badge Marketplace to Your App

```tsx
// In your routes file (e.g., App.tsx or routes.tsx)
import { BadgeMarketplace } from './components/nft';

// Add route
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

### 3. Add GG Coin Balance to Navigation

```tsx
// In your Header/Navigation component
import { GGCoinBalance } from './components/gamification';

// Inside your navigation
{currentUser && (
  <GGCoinBalance 
    userId={currentUser.id}
    className="ml-4"
    showTooltip={true}
  />
)}
```

### 4. Update User Profile Page

```tsx
// In your Profile component
import { GGCoinBalance } from './components/gamification';
import { ggCoinService } from './services';

function UserProfile({ userId }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const history = await ggCoinService.getTransactionHistory(userId);
      setTransactions(history);
    };
    loadTransactions();
  }, [userId]);

  return (
    <div>
      {/* Existing profile content */}
      
      {/* Add GG Coins Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">GG Coins</h2>
        <GGCoinBalance userId={userId} className="mb-4" />
        
        {/* Transaction History */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet. Purchase a badge to earn your first GG Coins!</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>{tx.description}</span>
                  <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Component Usage Examples

### Badge Purchase Modal (Standalone)

```tsx
import { BadgePurchaseModal } from './components/nft';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Purchase Badge
      </button>

      <BadgePurchaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        badgeType="tree_planter"
        tier="bronze"
        badgeName="Tree Planter Bronze"
        badgeImage="/badges/tree-planter-bronze.png"
        userId={currentUser.id}
        userEmail={currentUser.email}
        onSuccess={(ggCoinsEarned) => {
          console.log(`Earned ${ggCoinsEarned} GG Coins!`);
          // Show success message or confirmation modal
        }}
      />
    </>
  );
}
```

### Social Share Component (Standalone)

```tsx
import { BadgeSocialShare } from './components/nft';

function BadgeDetailsPage({ badge }) {
  return (
    <div>
      {/* Badge details */}
      
      <BadgeSocialShare
        badgeName={badge.name}
        badgeType={badge.type}
        tier={badge.tier}
        userProfileUrl={`/profile/${currentUser.id}`}
        badgeImageUrl={badge.image_url}
        className="mt-6"
      />
    </div>
  );
}
```

### Purchase Confirmation Modal

```tsx
import { BadgePurchaseConfirmation } from './components/nft';

function MyComponent() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);

  return (
    <BadgePurchaseConfirmation
      isOpen={showConfirmation}
      onClose={() => setShowConfirmation(false)}
      badgeName={purchaseData?.badgeName}
      badgeType={purchaseData?.badgeType}
      tier={purchaseData?.tier}
      badgeImage={purchaseData?.badgeImage}
      transactionReference={purchaseData?.reference}
      ggCoinsEarned={1}
      userProfileUrl={`/profile/${currentUser.id}`}
    />
  );
}
```

## Service Usage Examples

### Credit GG Coins

```tsx
import { ggCoinService } from './services';

// Credit coins to a user
const result = await ggCoinService.creditCoins({
  userId: 'user-uuid',
  amount: 1,
  transactionType: 'purchase_reward',
  referenceType: 'badge_purchase',
  referenceId: 'purchase-uuid',
  description: 'Earned 1 GG Coin for purchasing Tree Planter Bronze badge',
  metadata: {
    badge_type: 'tree_planter',
    tier: 'bronze',
  },
});

if (result.success) {
  console.log('Coins credited:', result.balance_after);
} else {
  console.error('Failed to credit coins:', result.error);
}
```

### Get User Balance

```tsx
import { ggCoinService } from './services';

const balance = await ggCoinService.getBalance(userId);
console.log(`User has ${balance} GG Coins`);
```

### Subscribe to Balance Changes

```tsx
import { ggCoinService } from './services';

useEffect(() => {
  const unsubscribe = ggCoinService.subscribeToBalance(userId, (newBalance) => {
    console.log('Balance updated:', newBalance);
    setBalance(newBalance);
  });

  return () => unsubscribe();
}, [userId]);
```

### Initiate Badge Purchase

```tsx
import { badgePurchaseService } from './services';

const result = await badgePurchaseService.initiatePurchase({
  userId: currentUser.id,
  badgeType: 'tree_planter',
  tier: 'bronze',
  email: currentUser.email,
  metadata: {
    badge_name: 'Tree Planter Bronze',
  },
});

if (result.success) {
  // Open Paystack payment URL
  window.open(result.paystack_authorization_url, '_blank');
} else {
  console.error('Purchase failed:', result.error);
}
```

## Webhook Integration (Task 5.1)

Create or update `supabase/functions/paystack-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    
    // Verify webhook signature (important for security)
    // ... signature verification code ...

    if (payload.event === 'charge.success') {
      const reference = payload.data.reference;
      
      // Get purchase record
      const { data: purchase } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (purchase && !purchase.gg_coins_credited) {
        // Credit GG Coins using database function
        const { data: result } = await supabase.rpc('credit_gg_coins', {
          p_user_id: purchase.user_id,
          p_amount: purchase.gg_coins_awarded,
          p_transaction_type: 'purchase_reward',
          p_reference_type: 'badge_purchase',
          p_reference_id: purchase.id,
          p_description: `Earned ${purchase.gg_coins_awarded} GG Coin for badge purchase`,
          p_metadata: {
            badge_type: purchase.badge_type,
            tier: purchase.tier,
            paystack_reference: reference,
          },
        });

        if (result.success) {
          // Mark as credited
          await supabase
            .from('badge_purchases')
            .update({ 
              gg_coins_credited: true,
              payment_status: 'success',
              completed_at: new Date().toISOString(),
            })
            .eq('id', purchase.id);

          // Create notification
          await supabase.from('notifications').insert({
            user_id: purchase.user_id,
            type: 'badge_purchase',
            title: 'Badge Purchase Successful!',
            message: `You earned ${purchase.gg_coins_awarded} GG Coin for purchasing a badge.`,
            metadata: {
              purchase_id: purchase.id,
              badge_type: purchase.badge_type,
              tier: purchase.tier,
            },
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

## Testing

### Test with Paystack Test Cards

```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Test Flow
1. Navigate to `/badges`
2. Click "Purchase" on any badge
3. Complete payment with test card
4. Verify:
   - Payment success message
   - GG Coin balance increased by 1
   - Transaction appears in history
   - Social share buttons work
   - Badge appears in profile

## Environment Variables

Ensure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
VITE_PAYSTACK_MODE=test
```

## Troubleshooting

### GG Coins not credited after purchase
1. Check webhook is configured in Paystack dashboard
2. Verify webhook URL is correct
3. Check Supabase Edge Function logs
4. Ensure database functions are created (run migration)

### Payment modal not opening
1. Verify Paystack SDK is loaded
2. Check browser console for errors
3. Ensure VITE_PAYSTACK_PUBLIC_KEY is set

### Balance not updating in real-time
1. Check Supabase real-time is enabled for `user_gamification` table
2. Verify subscription is properly set up
3. Check browser console for WebSocket errors

## Support

For issues or questions:
1. Check implementation summary: `.kiro/specs/nft-badge-purchase/IMPLEMENTATION_SUMMARY.md`
2. Review task list: `.kiro/specs/nft-badge-purchase/tasks.md`
3. Check component source code for inline documentation
