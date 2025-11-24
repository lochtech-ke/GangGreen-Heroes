# Requirements Document

## Introduction

The badge marketplace was incorrectly removed during the Track 3 refactoring when carbon credits marketplace was deprecated. The badge marketplace is a core feature for Track 3 (Community Engagement) as it allows users to purchase NFT badges and earn GG Coins, which drives engagement and gamification.

## Glossary

- **Badge Marketplace**: A page where users can browse and purchase NFT badges using Paystack payment
- **GG Coins**: Platform currency earned through badge purchases (1 GG Coin per 200 KES spent)
- **Carbon Credits Marketplace**: The deprecated feature for trading carbon credits (NOT the badge marketplace)
- **Paystack**: Payment gateway integration for badge purchases
- **Track 3**: Community Engagement and Sustainability focus for the hackathon

## Requirements

### Requirement 1

**User Story:** As a user, I want to access the badge marketplace, so that I can purchase badges and earn GG Coins

#### Acceptance Criteria

1. WHEN a user navigates to `/marketplace`, THE system SHALL display the badge marketplace page
2. WHEN a user is authenticated, THE system SHALL show the full badge catalog with purchase options
3. WHEN a user is not authenticated, THE system SHALL show the badge catalog in browse-only mode with a login prompt
4. WHEN a user completes a badge purchase, THE system SHALL credit 1 GG Coin per 200 KES spent
5. THE system SHALL NOT redirect users away from the badge marketplace route

### Requirement 2

**User Story:** As a user, I want to see the marketplace link in navigation, so that I can easily find and access badge purchases

#### Acceptance Criteria

1. WHEN viewing the navigation menu, THE system SHALL display a "Badge Marketplace" navigation item
2. WHEN a user clicks the marketplace navigation item, THE system SHALL navigate to `/marketplace`
3. THE navigation item SHALL be visible to all authenticated users
4. THE navigation item SHALL include an icon and description indicating it's for badge purchases
5. THE system SHALL NOT show carbon credits marketplace links (those remain deprecated)

### Requirement 3

**User Story:** As a developer, I want clear separation between badge marketplace and carbon credits marketplace, so that future refactoring doesn't accidentally remove the wrong features

#### Acceptance Criteria

1. THE deprecation service SHALL distinguish between `BADGE_MARKETPLACE` and `CARBON_CREDITS_MARKETPLACE`
2. THE route configuration SHALL use `/marketplace` for badges and keep `/carbon-credits` deprecated
3. THE navigation configuration SHALL clearly label the marketplace as "Badge Marketplace"
4. THE codebase SHALL use distinct terminology for badge purchases vs carbon credit trading
5. THE feature flags SHALL allow independent control of badge marketplace and carbon credits

### Requirement 4

**User Story:** As a user, I want the badge marketplace to integrate with the existing badge purchase flow, so that I can complete purchases and earn rewards

#### Acceptance Criteria

1. WHEN a user purchases a badge, THE system SHALL use the existing `badgePurchaseService`
2. WHEN payment is completed, THE system SHALL use the existing `ggCoinService` to credit rewards
3. THE marketplace SHALL display the correct price (200 KES per badge)
4. THE marketplace SHALL show the GG Coin reward (+1 GG Coin per purchase)
5. THE system SHALL maintain all existing Paystack integration and webhook handling
