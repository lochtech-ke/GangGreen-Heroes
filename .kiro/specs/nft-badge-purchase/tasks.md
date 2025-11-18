# Implementation Plan

- [x] 1. Set up database schema for badge purchases and GG Coins
  - Create migration file for new tables and columns
  - Add `gg_coins` column to `user_gamification` table
  - Create `badge_purchases` table with Paystack reference tracking
  - Create `gg_coin_transactions` table for audit trail
  - Add price and reward columns to `nft_badges` table
  - _Requirements: 1.4, 2.2, 4.1, 4.2_

- [x] 2. Implement GG Coin service layer
  - [x] 2.1 Create GG Coin service with credit/debit operations
    - Write `ggCoin.service.ts` with TypeScript interfaces
    - Implement `creditCoins()` method with transaction support
    - Implement `getBalance()` method with caching
    - Implement `getTransactionHistory()` method
    - Add retry logic for failed credit operations
    - _Requirements: 2.1, 2.4, 5.2_
  
  - [x] 2.2 Create GG Coin balance display component
    - Write `GGCoinBalance.tsx` React component
    - Add real-time balance updates via Supabase subscription
    - Implement animated balance changes
    - Add tooltip with GG Coin explanation
    - Style component with Tailwind CSS
    - _Requirements: 5.1, 5.3, 5.5_

- [x] 3. Implement badge purchase service
  - [x] 3.1 Create badge purchase service
    - Write `badgePurchase.service.ts` with TypeScript interfaces
    - Implement `initiatePurchase()` with fixed KES 200 price
    - Implement `completePurchase()` with verification
    - Implement `verifyAndReward()` for post-payment processing
    - Add error handling for payment failures
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 3.2 Create badge purchase modal component
    - Write `BadgePurchaseModal.tsx` React component
    - Integrate Paystack payment popup
    - Display KES 200 price prominently
    - Show loading states during payment
    - Handle payment success/failure states
    - Display GG Coin reward on success
    - _Requirements: 1.1, 1.2, 2.3_

- [x] 4. Implement social media sharing
  - [x] 4.1 Create social share component
    - Write `BadgeSocialShare.tsx` React component
    - Add share buttons for Twitter, Facebook, WhatsApp, LinkedIn
    - Generate pre-formatted messages with #GangGreen #GBM hashtags
    - Include badge name and profile link in share text
    - Implement platform-specific share URLs
    - Add share icons with Tailwind styling
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 4.2 Implement platform-specific share handlers
    - Write Twitter share handler with image support
    - Write Facebook share dialog handler
    - Write WhatsApp share handler with formatted message
    - Write LinkedIn share handler
    - Add fallback copy-to-clipboard option
    - Track share events in analytics
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 5. Integrate purchase flow with GG Coin rewards
  - [x] 5.1 Update Paystack webhook to credit GG Coins
    - Modify `paystack-webhook/index.ts` Supabase function
    - Add GG Coin credit call after successful payment
    - Create badge purchase record with reference
    - Handle coin credit failures with retry logic
    - Log all transactions for audit
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  
  - [x] 5.2 Create purchase confirmation flow
    - Write `BadgePurchaseConfirmation.tsx` component
    - Display badge details and transaction reference
    - Show GG Coins earned prominently
    - Display social share buttons
    - Add link to view badge in profile
    - Create in-app notification
    - _Requirements: 2.3, 3.1, 6.1, 6.2, 6.3, 6.4_

- [x] 6. Add GG Coin display to user profile
  - [x] 6.1 Update profile page with GG Coin balance
    - Modify user profile component to show GG Coins
    - Add GG Coin transaction history section
    - Display zero state with call-to-action
    - Add real-time balance updates
    - Style with existing profile design patterns
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement admin analytics for badge purchases
  - [x] 7.1 Create badge purchase analytics queries
    - Write SQL queries for total badges sold
    - Calculate total revenue in KES
    - Aggregate GG Coins distributed
    - Add date range filtering
    - Track social media share counts by platform
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 7.2 Create admin dashboard component for badge analytics
    - Write `BadgePurchaseAnalytics.tsx` component
    - Display key metrics (sales, revenue, coins)
    - Add date range picker
    - Show social share statistics
    - Add export functionality for reports
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 8. Add badge marketplace with pricing
  - [x] 8.1 Create or update badge marketplace component
    - Write `BadgeMarketplace.tsx` component
    - Display all available badges with KES 200 price
    - Add filter and search functionality
    - Show badge details on hover/click
    - Integrate purchase modal trigger
    - Add "Earn 1 GG Coin" badge on each card
    - _Requirements: 1.1_

- [x] 9. Implement notification system for purchases
  - [x] 9.1 Create purchase notification handler
    - Write notification creation logic in badge purchase service
    - Generate notification with badge details and GG Coins
    - Include Paystack transaction reference
    - Add link to badge details page
    - Implement email notification (if enabled)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Add error handling and user feedback
  - [ ] 10.1 Implement comprehensive error handling
    - Add error types for payment failures
    - Create user-friendly error messages
    - Implement retry logic for retryable errors
    - Add error logging for admin review
    - Create pending reward reconciliation system
    - _Requirements: 1.5, 2.4, 2.5_

- [ ] 11. Testing and validation
  - [ ] 11.1 Write unit tests for services
    - Test badge purchase service methods
    - Test GG Coin service credit/debit operations
    - Test social share message generation
    - Mock Paystack responses
    - _Requirements: All_
  
  - [ ] 11.2 Write integration tests
    - Test end-to-end purchase flow
    - Test webhook processing with test mode
    - Test GG Coin balance updates
    - Test social share tracking
    - _Requirements: All_
  
  - [ ] 11.3 Manual testing checklist
    - Test purchase with Paystack test card
    - Verify KES 200 charge amount
    - Confirm 1 GG Coin credited
    - Test social share on all platforms
    - Verify hashtags in shared content
    - Check notifications received
    - Test failure scenarios
    - _Requirements: All_
