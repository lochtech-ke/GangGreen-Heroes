# NFT Badge Purchase System

## Overview

This specification implements a complete NFT badge purchase system with GG Coin rewards and social sharing for the #GangGreen platform.

## Key Features

✅ **Fixed Pricing:** All badges cost KES 200  
✅ **GG Coin Rewards:** Earn 1 GG Coin per badge purchase  
✅ **Paystack Integration:** Secure payment processing  
✅ **Social Sharing:** Share achievements on Twitter, Facebook, WhatsApp, LinkedIn  
✅ **Real-time Updates:** Live balance updates via Supabase subscriptions  
✅ **Transaction History:** Complete audit trail of all GG Coin transactions  

## Implementation Status

### ✅ Completed (70%)

1. **Database Schema** - Migration file created with all tables and functions
2. **GG Coin Service** - Full service layer with credit/debit operations
3. **GG Coin Balance Component** - Real-time display with animations
4. **Badge Purchase Service** - Complete purchase flow with Paystack
5. **Badge Purchase Modal** - UI for initiating purchases
6. **Social Sharing Component** - Multi-platform sharing with hashtags
7. **Purchase Confirmation** - Success screen with social sharing
8. **Badge Marketplace** - Browse and purchase badges

### 🚧 Remaining (30%)

1. **Paystack Webhook** - Credit GG Coins on successful payment (Task 5.1)
2. **Profile Integration** - Add GG Coins to user profile (Task 6.1)
3. **Notifications** - Purchase success notifications (Task 9.1)
4. **Admin Analytics** - Dashboard for purchase metrics (Task 7)
5. **Testing** - Unit, integration, and manual tests (Task 11)

## Quick Links

- **[Tasks List](./tasks.md)** - Detailed implementation checklist
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - What's been built
- **[Integration Guide](./INTEGRATION_GUIDE.md)** - How to use the components
- **[Requirements](./requirements.md)** - Original specification

## Files Created

### Database
- `supabase/migrations/014_add_badge_purchases_and_gg_coins.sql`

### Services
- `src/services/ggCoin.service.ts`
- `src/services/badgePurchase.service.ts`

### Components
- `src/components/gamification/GGCoinBalance.tsx`
- `src/components/nft/BadgePurchaseModal.tsx`
- `src/components/nft/BadgeSocialShare.tsx`
- `src/components/nft/BadgePurchaseConfirmation.tsx`
- `src/components/nft/BadgeMarketplace.tsx`

### Types
- `src/types/ggCoin.types.ts`
- `src/types/badgePurchase.types.ts`

### Exports
- `src/components/nft/index.ts`
- `src/components/gamification/index.ts`
- Updated `src/types/index.ts`
- Updated `src/services/index.ts`

## Next Steps

1. **Apply Database Migration**
   - Run the SQL migration in Supabase dashboard
   - Or use `npx supabase db push` if configured

2. **Update Paystack Webhook**
   - Implement GG Coin crediting in webhook
   - See [Integration Guide](./INTEGRATION_GUIDE.md) for code

3. **Integrate Components**
   - Add BadgeMarketplace to routing
   - Add GGCoinBalance to navigation
   - Update user profile with GG Coins section

4. **Test Payment Flow**
   - Use Paystack test cards
   - Verify GG Coin crediting
   - Test social sharing

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
├─────────────────────────────────────────────────────────┤
│  BadgeMarketplace → BadgePurchaseModal                  │
│                  ↓                                       │
│  BadgePurchaseConfirmation → BadgeSocialShare           │
│                                                          │
│  GGCoinBalance (Navigation/Profile)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
├─────────────────────────────────────────────────────────┤
│  badgePurchaseService                                   │
│    - initiatePurchase()                                 │
│    - completePurchase()                                 │
│    - verifyAndReward()                                  │
│                                                          │
│  ggCoinService                                          │
│    - creditCoins()                                      │
│    - debitCoins()                                       │
│    - getBalance()                                       │
│    - getTransactionHistory()                            │
│    - subscribeToBalance()                               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                External Services                         │
├─────────────────────────────────────────────────────────┤
│  Paystack API                                           │
│    - Payment initialization                             │
│    - Payment verification                               │
│    - Webhook callbacks                                  │
│                                                          │
│  Supabase                                               │
│    - PostgreSQL database                                │
│    - Real-time subscriptions                            │
│    - Edge Functions (webhooks)                          │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables
- `badge_purchases` - Purchase records with Paystack references
- `gg_coin_transactions` - Audit trail of all coin movements
- `user_gamification` - User balances (added `gg_coins` column)
- `nft_badges` - Badge definitions (added price columns)

### Functions
- `credit_gg_coins()` - Atomic credit operation with logging
- `debit_gg_coins()` - Atomic debit operation with balance check

## Constants

```typescript
BADGE_PRICE_KES = 200
BADGE_PURCHASE_GG_COIN_REWARD = 1
```

## Security

- RLS policies on all tables
- Service role access for webhooks
- Payment verification before crediting
- Atomic database transactions
- Comprehensive audit logging

## Performance

- Balance caching (30s TTL)
- Real-time subscriptions for live updates
- Retry logic for failed operations
- Indexed database queries
- Optimized component rendering

## Support

For questions or issues:
1. Check the [Integration Guide](./INTEGRATION_GUIDE.md)
2. Review the [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
3. Consult the [Tasks List](./tasks.md) for detailed requirements

---

**Last Updated:** November 18, 2025  
**Status:** 70% Complete - Core functionality implemented  
**Next Milestone:** Webhook integration and profile updates
