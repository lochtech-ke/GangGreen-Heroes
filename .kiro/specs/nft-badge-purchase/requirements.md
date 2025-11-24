# Requirements Document

## Introduction

This feature enables users to purchase NFT badges using Kenyan Shillings (KES) through Paystack integration, earn GangGreen Coins (GG Coins) as rewards, and share their badge purchases on social media platforms. The feature integrates with the existing gamification system, NFT badge infrastructure, and Paystack payment gateway to create a seamless purchasing and reward experience.

## Glossary

- **NFT Badge System**: The existing blockchain-based digital badge system that rewards users for environmental conservation activities
- **GG Coin**: GangGreen Coin, the platform's internal reward currency used for gamification and incentives
- **Paystack Gateway**: The payment processing service that handles KES transactions
- **Badge Purchase Flow**: The end-to-end process from badge selection to payment completion and reward distribution
- **Social Share Module**: The component that enables users to share their badge purchases on social media platforms
- **User Gamification Record**: The database record tracking a user's points, coins, level, and achievements

## Requirements

### Requirement 1

**User Story:** As a platform user, I want to purchase NFT badges for KES 200, so that I can support conservation efforts and earn rewards.

#### Acceptance Criteria

1. WHEN a user views the NFT badge marketplace, THE NFT Badge System SHALL display all available badges with a price of KES 200
2. WHEN a user selects a badge to purchase, THE Badge Purchase Flow SHALL initiate the Paystack Gateway payment process with the amount of KES 200
3. WHEN the Paystack Gateway confirms successful payment, THE NFT Badge System SHALL mint the badge to the user's account within 5 minutes
4. WHEN the badge minting completes successfully, THE User Gamification Record SHALL be updated to reflect the new badge ownership
5. IF the Paystack Gateway returns a payment failure, THEN THE Badge Purchase Flow SHALL display an error message and allow the user to retry the payment

### Requirement 2

**User Story:** As a platform user, I want to earn 1 GG Coin when I purchase a badge, so that I can accumulate rewards for future use.

#### Acceptance Criteria

1. WHEN a badge purchase transaction completes successfully, THE User Gamification Record SHALL increment the user's GG Coin balance by 1
2. WHEN the GG Coin reward is credited, THE NFT Badge System SHALL create a gamified action record with action_type 'badge_purchase' and points_awarded equal to the GG Coin value
3. WHEN the GG Coin balance updates, THE Badge Purchase Flow SHALL display a confirmation message showing the new GG Coin balance
4. IF the GG Coin crediting fails, THEN THE NFT Badge System SHALL log the error and retry the credit operation up to 3 times
5. WHEN all retry attempts fail, THE NFT Badge System SHALL create a pending reward record for manual reconciliation

### Requirement 3

**User Story:** As a platform user, I want to share my badge purchase on social media with #GangGreen and #GBM hashtags, so that I can showcase my contribution and inspire others.

#### Acceptance Criteria

1. WHEN a badge purchase completes successfully, THE Badge Purchase Flow SHALL display social media share buttons for Twitter, Facebook, WhatsApp, and LinkedIn
2. WHEN a user clicks a social share button, THE Social Share Module SHALL generate a pre-formatted message containing the badge name, purchase confirmation, and hashtags "#GangGreen #GBM"
3. WHEN the share message is generated, THE Social Share Module SHALL include a link to the user's badge profile page on the platform
4. WHEN the user shares on Twitter, THE Social Share Module SHALL open Twitter's share interface with the pre-formatted message and badge image
5. WHEN the user shares on Facebook, THE Social Share Module SHALL open Facebook's share dialog with the badge details and hashtags
6. WHEN the user shares on WhatsApp, THE Social Share Module SHALL open WhatsApp with the formatted message ready to send
7. WHEN the user shares on LinkedIn, THE Social Share Module SHALL open LinkedIn's share interface with the professional message format
8. WHEN a share action completes, THE NFT Badge System SHALL track the share event in the chatbot_analytics table with event_type 'badge_share'

### Requirement 4

**User Story:** As a platform administrator, I want to track badge purchases and GG Coin distributions, so that I can monitor the feature's performance and user engagement.

#### Acceptance Criteria

1. WHEN a badge purchase transaction occurs, THE NFT Badge System SHALL record the transaction in the transactions table with payment_method 'paystack' and currency 'KES'
2. WHEN a GG Coin reward is distributed, THE NFT Badge System SHALL create a record in the gamified_actions table with the user_id, action_type, and points_awarded
3. WHEN an administrator views the badge purchase analytics, THE NFT Badge System SHALL display total badges sold, total revenue in KES, and total GG Coins distributed
4. WHEN an administrator filters purchase data by date range, THE NFT Badge System SHALL return transactions within the specified period with accuracy of 1 day
5. WHEN social media shares are tracked, THE NFT Badge System SHALL aggregate share counts by platform and display them in the analytics dashboard

### Requirement 5

**User Story:** As a platform user, I want to see my GG Coin balance on my profile, so that I can track my accumulated rewards.

#### Acceptance Criteria

1. WHEN a user views their profile page, THE User Gamification Record SHALL display the current GG Coin balance prominently
2. WHEN a user views their gamification history, THE NFT Badge System SHALL display all GG Coin earning transactions with timestamps and sources
3. WHEN the GG Coin balance changes, THE Badge Purchase Flow SHALL update the displayed balance in real-time without requiring a page refresh
4. WHEN a user has zero GG Coins, THE User Gamification Record SHALL display "0 GG Coins" with a call-to-action to purchase badges
5. WHEN a user hovers over their GG Coin balance, THE NFT Badge System SHALL display a tooltip explaining how GG Coins are earned and used

### Requirement 6

**User Story:** As a platform user, I want to receive a confirmation notification after purchasing a badge, so that I have proof of my purchase and reward.

#### Acceptance Criteria

1. WHEN a badge purchase completes successfully, THE NFT Badge System SHALL create a notification record with type 'badge_purchase_success'
2. WHEN the notification is created, THE Badge Purchase Flow SHALL display an in-app notification showing the badge name, GG Coin reward, and transaction reference
3. WHEN the user views the notification, THE NFT Badge System SHALL include a link to view the purchased badge details
4. WHEN the notification is sent, THE Badge Purchase Flow SHALL include the Paystack transaction reference for user records
5. IF the user has email notifications enabled, THEN THE NFT Badge System SHALL send a confirmation email with the badge details and receipt
