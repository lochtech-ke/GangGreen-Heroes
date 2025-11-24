# Requirements Document

## Introduction

This feature refines the #GangGreen platform specifically for Track 3 (Community Engagement and Sustainability) of the Wangari Maathai Hackathon. The refinement focuses on removing tree planting and carbon credit marketplace features while restructuring the badge progression system to emphasize community engagement, micro-actions, and social impact. The new badge system establishes a clear progression path from the entry-level Hummingbird badge (earned upon signup) to the prestigious Green Hero badge and its specialized variants.

## Glossary

- **Track 3 Focus**: Community Engagement and Sustainability track of the Wangari Maathai Hackathon, emphasizing social mobilization and sustainable behavior change
- **Hummingbird Badge**: The foundational entry-level badge awarded automatically upon user registration, symbolizing the beginning of the climate action journey
- **Green Hero Badge**: The pinnacle achievement badge representing significant community impact and sustained engagement
- **Badge Progression System**: The hierarchical pathway users follow from Hummingbird through intermediate badges to Green Hero and specialized variants
- **Micro-Actions**: Small, achievable climate-positive tasks that users complete to earn rewards and progress through the badge system
- **Community Engagement Metrics**: Measurements of user participation including social posts, initiative involvement, referrals, and collaborative actions
- **Feature Deprecation**: The process of removing or hiding tree planting and carbon credit features from the Track 3 submission
- **Content Alignment**: Ensuring all documentation, UI text, and marketing materials reflect Track 3 priorities

## Requirements

### Requirement 1

**User Story:** As a new platform user, I want to receive a Hummingbird badge immediately upon signup, so that I feel welcomed and understand this is the starting point of my journey.

#### Acceptance Criteria

1. WHEN a user completes registration, THE Badge Progression System SHALL automatically award the Hummingbird badge
2. THE Hummingbird Badge SHALL display a welcome message explaining the hummingbird story and its connection to climate action
3. WHEN the Hummingbird badge is awarded, THE Badge Progression System SHALL trigger a notification showing the next badge milestone
4. THE Hummingbird Badge SHALL be visible in the user's profile immediately after signup
5. WHEN a user views their Hummingbird badge, THE Badge Progression System SHALL display progress toward the next badge tier

### Requirement 2

**User Story:** As a platform user, I want a clear badge progression path from Hummingbird to Green Hero, so that I understand how to advance and what achievements are required.

#### Acceptance Criteria

1. THE Badge Progression System SHALL define the following badge hierarchy: Hummingbird (entry), Community Contributor (25 actions), Climate Advocate (100 actions), Environmental Champion (250 actions), Green Hero (500 actions)
2. WHEN a user views the badge progression, THE Badge Progression System SHALL display all badge tiers with locked and unlocked states
3. THE Badge Progression System SHALL show specific requirements for each badge including action counts, social engagement, and initiative participation
4. WHEN a user completes requirements for a new badge, THE Badge Progression System SHALL award the badge and send a celebration notification
5. THE Badge Progression System SHALL allow users to view detailed criteria for each badge tier before earning it

### Requirement 3

**User Story:** As an advanced platform user, I want to earn specialized Green Hero variants, so that I can showcase my specific areas of environmental expertise.

#### Acceptance Criteria

1. WHERE a user has earned the Green Hero badge, THE Badge Progression System SHALL unlock specialized variant paths: Green Hero - Social Mobilizer, Green Hero - Initiative Leader, Green Hero - Knowledge Sharer
2. WHEN a user earns 100 referrals, THE Badge Progression System SHALL award the Green Hero - Social Mobilizer variant
3. WHEN a user creates and completes 10 initiatives, THE Badge Progression System SHALL award the Green Hero - Initiative Leader variant
4. WHEN a user creates 50 educational posts with high engagement, THE Badge Progression System SHALL award the Green Hero - Knowledge Sharer variant
5. THE Badge Progression System SHALL allow users to earn multiple Green Hero variants simultaneously

### Requirement 4

**User Story:** As a platform administrator, I want tree planting and carbon credit features removed from the Track 3 submission, so that the platform focuses exclusively on community engagement and sustainability.

#### Acceptance Criteria

1. THE Feature Deprecation SHALL hide or remove all UI components related to tree planting transactions
2. THE Feature Deprecation SHALL hide or remove all UI components related to carbon credit marketplace
3. WHEN a user navigates the platform, THE Feature Deprecation SHALL ensure no navigation links point to tree planting or carbon credit pages
4. THE Feature Deprecation SHALL maintain database tables for tree planting and carbon credits but exclude them from Track 3 user flows
5. THE Feature Deprecation SHALL update all API endpoints to return appropriate responses when tree/carbon features are accessed

### Requirement 5

**User Story:** As a platform user, I want badges to reflect community engagement achievements rather than tree planting, so that rewards align with Track 3 priorities.

#### Acceptance Criteria

1. THE Badge Progression System SHALL award badges based on micro-actions completed, social posts created, initiatives joined, and referrals made
2. WHEN calculating badge progress, THE Badge Progression System SHALL exclude tree planting counts and carbon credit purchases
3. THE Badge Progression System SHALL include new achievement types: Social Mobilizer, Community Builder, Knowledge Advocate, Initiative Participant
4. WHEN a badge is displayed, THE Badge Progression System SHALL show achievement counts relevant to community engagement only
5. THE Badge Progression System SHALL update existing badge metadata to remove references to tree planting and carbon credits

### Requirement 6

**User Story:** As a platform user, I want to earn badges through social engagement, so that sharing my climate actions is recognized and rewarded.

#### Acceptance Criteria

1. WHEN a user creates a social post, THE Community Engagement Metrics SHALL increment their social action count
2. WHEN a user's post receives 10 likes, THE Badge Progression System SHALL award bonus progress toward the next badge
3. WHEN a user comments on 20 posts, THE Community Engagement Metrics SHALL count this toward badge progression
4. WHEN a user shares platform content externally, THE Badge Progression System SHALL track and reward the sharing action
5. THE Community Engagement Metrics SHALL weight social actions appropriately in badge calculations (posts: 5 points, likes received: 1 point, comments: 2 points)

### Requirement 7

**User Story:** As a platform user, I want to earn badges through initiative participation, so that collaborative conservation efforts are recognized.

#### Acceptance Criteria

1. WHEN a user joins an initiative, THE Badge Progression System SHALL award 10 progress points
2. WHEN a user completes tasks within an initiative, THE Community Engagement Metrics SHALL track completion and award points
3. WHEN a user creates a new initiative, THE Badge Progression System SHALL award 50 progress points
4. WHEN an initiative reaches its goal, THE Badge Progression System SHALL award bonus badges to all active participants
5. THE Community Engagement Metrics SHALL track initiative participation separately from other actions for specialized badge variants

### Requirement 8

**User Story:** As a platform user, I want to earn badges through referrals, so that growing the community is recognized and rewarded.

#### Acceptance Criteria

1. WHEN a user's referral link is used for signup, THE Badge Progression System SHALL award 15 progress points to the referrer
2. WHEN a referred user completes their first 5 actions, THE Badge Progression System SHALL award bonus points to the referrer
3. WHEN a user reaches 10 successful referrals, THE Badge Progression System SHALL award a special Referral Champion badge
4. THE Badge Progression System SHALL display referral count and progress in the user's profile
5. WHEN calculating Green Hero - Social Mobilizer variant, THE Badge Progression System SHALL prioritize referral metrics

### Requirement 9

**User Story:** As a platform administrator, I want all documentation updated to reflect Track 3 focus, so that submission materials accurately represent the platform's community engagement mission.

#### Acceptance Criteria

1. THE Content Alignment SHALL update README.md to remove tree planting and carbon credit feature descriptions
2. THE Content Alignment SHALL update TRACK_3_SUBMISSION.md to emphasize community engagement and badge progression
3. THE Content Alignment SHALL update wiki/01-platform-overview.md to focus on social mobilization and micro-actions
4. THE Content Alignment SHALL update all feature documentation to remove references to deprecated features
5. THE Content Alignment SHALL ensure all code comments and inline documentation reflect Track 3 priorities

### Requirement 10

**User Story:** As a platform user, I want the home page to showcase community engagement features, so that I immediately understand the platform's Track 3 focus.

#### Acceptance Criteria

1. WHEN a user visits the home page, THE Content Alignment SHALL display the badge progression system prominently
2. THE Content Alignment SHALL feature social feed highlights and community statistics on the home page
3. THE Content Alignment SHALL remove or hide tree planting and carbon credit sections from the home page
4. WHEN a user views the home page, THE Content Alignment SHALL display the hummingbird story and its connection to micro-actions
5. THE Content Alignment SHALL showcase leaderboards and top community contributors on the home page

### Requirement 11

**User Story:** As a platform user, I want micro-challenges focused on community engagement, so that available actions align with Track 3 priorities.

#### Acceptance Criteria

1. THE Micro-Actions SHALL include challenges like: "Share your climate story", "Comment on 5 posts", "Invite 3 friends", "Join an initiative"
2. THE Micro-Actions SHALL exclude challenges related to tree planting transactions and carbon credit purchases
3. WHEN a user completes a micro-challenge, THE Badge Progression System SHALL award appropriate points toward badge progression
4. THE Micro-Actions SHALL display daily, weekly, and monthly challenge options
5. WHEN challenges are generated, THE Micro-Actions SHALL prioritize social and collaborative activities

### Requirement 12

**User Story:** As a platform administrator, I want navigation menus updated to reflect Track 3 features, so that users can easily access community engagement tools.

#### Acceptance Criteria

1. THE Content Alignment SHALL remove "Trees" and "Marketplace" navigation items
2. THE Content Alignment SHALL add or emphasize "Community", "Challenges", "Leaderboard", and "My Badges" navigation items
3. WHEN a user clicks navigation items, THE Content Alignment SHALL ensure all links point to active Track 3 features
4. THE Content Alignment SHALL update mobile navigation to match desktop navigation changes
5. THE Content Alignment SHALL ensure quick actions menu reflects Track 3 priorities

### Requirement 13

**User Story:** As a platform user, I want my dashboard to show community engagement metrics, so that I can track my progress toward badges and community impact.

#### Acceptance Criteria

1. WHEN a user views their dashboard, THE Community Engagement Metrics SHALL display: actions completed, social posts created, initiatives joined, referrals made
2. THE Community Engagement Metrics SHALL show progress bars for the next badge tier
3. THE Community Engagement Metrics SHALL display recent achievements and milestones
4. WHEN a user views their dashboard, THE Community Engagement Metrics SHALL exclude tree planting and carbon credit statistics
5. THE Community Engagement Metrics SHALL show the user's position on community leaderboards

### Requirement 14

**User Story:** As a platform user, I want badge designs to reflect community engagement themes, so that visual elements align with Track 3 priorities.

#### Acceptance Criteria

1. THE Badge Progression System SHALL update badge SVG designs to feature community and collaboration imagery
2. THE Badge Progression System SHALL remove tree and carbon-specific iconography from badge designs
3. WHEN a badge is generated, THE Badge Progression System SHALL use icons representing: people, hands, hearts, networks, and collaboration
4. THE Badge Progression System SHALL maintain forest themes (Kakamega, Karura, Mau) as background elements
5. THE Badge Progression System SHALL ensure Hummingbird badge prominently features a hummingbird icon

### Requirement 15

**User Story:** As a platform administrator, I want analytics to track community engagement metrics, so that we can measure Track 3 success criteria.

#### Acceptance Criteria

1. THE Community Engagement Metrics SHALL track daily active users and engagement rates
2. THE Community Engagement Metrics SHALL measure social post creation, likes, comments, and shares
3. THE Community Engagement Metrics SHALL track initiative participation and completion rates
4. THE Community Engagement Metrics SHALL monitor referral conversion rates and network growth
5. THE Community Engagement Metrics SHALL generate reports showing badge distribution and progression rates
