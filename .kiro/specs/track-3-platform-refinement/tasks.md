# Implementation Plan

- [x] 1. Set up database schema for Track 3 badge system



  - Create badge_tiers table with Track 3 badge hierarchy
  - Create green_hero_variants table for specialized badges
  - Create user_badge_progress table for tracking user progress
  - Create user_earned_badges and user_earned_variants tables
  - Add indexes for performance optimization
  - _Requirements: 1.1, 2.1, 3.1_

- [ ]* 1.1 Write property test for badge tier hierarchy
  - **Property 11: Badge progression monotonicity**
  - **Validates: Requirements 2.1**

- [x] 2. Set up engagement tracking tables

  - Create engagement_actions table for all user actions
  - Create materialized view for user_engagement_summary
  - Create feature_flags table for deprecation management
  - Add refresh function for materialized view
  - Add indexes for query optimization
  - _Requirements: 5.1, 6.1, 7.1, 8.1_

- [ ]* 2.1 Write property test for engagement score calculation
  - **Property 10: Engagement score calculation consistency**
  - **Validates: Requirements 5.1**

- [x] 3. Implement BadgeProgressionService



  - Create service interface and implementation
  - Implement getCurrentBadge method
  - Implement getNextBadge method
  - Implement checkBadgeEligibility method
  - Implement awardBadge method with notification trigger
  - Implement getProgressToNextBadge method
  - Implement calculateEngagementScore method
  - Implement Green Hero variant eligibility checks
  - _Requirements: 1.1, 1.3, 2.2, 3.1_

- [ ]* 3.1 Write property test for automatic Hummingbird badge award
  - **Property 1: Hummingbird badge automatic award**
  - **Validates: Requirements 1.1**

- [ ]* 3.2 Write property test for badge award notifications
  - **Property 2: Badge award notification**
  - **Validates: Requirements 1.3**

- [ ]* 3.3 Write property test for badge progression
  - **Property 3: Badge progression on requirement completion**
  - **Validates: Requirements 2.2**

- [ ]* 3.4 Write property test for Green Hero variant unlock
  - **Property 4: Green Hero variant unlock**
  - **Validates: Requirements 3.1**


- [x] 4. Implement CommunityEngagementService

  - Create service interface and implementation
  - Implement calculateEngagementScore method
  - Implement getEngagementBreakdown method
  - Implement trackAction method
  - Implement getSocialMetrics method
  - Implement getInitiativeMetrics method
  - Implement getReferralMetrics method
  - Ensure deprecated metrics are excluded from calculations
  - _Requirements: 5.1, 5.2, 6.1, 7.1, 8.1_

- [ ]* 4.1 Write property test for social action tracking
  - **Property 7: Social action tracking**
  - **Validates: Requirements 6.1**

- [ ]* 4.2 Write property test for initiative points award
  - **Property 8: Initiative join points award**
  - **Validates: Requirements 7.1**

- [ ]* 4.3 Write property test for referral points award
  - **Property 9: Referral points award**
  - **Validates: Requirements 8.1**

- [ ]* 4.4 Write property test for deprecated metrics exclusion
  - **Property 6: Badge calculation excludes deprecated metrics**
  - **Validates: Requirements 5.2**

- [ ]* 4.5 Write property test for point award idempotency
  - **Property 12: Point award idempotency**
  - **Validates: Requirements 7.1, 8.1**

- [x] 5. Implement FeatureDeprecationService



  - Create service interface and implementation
  - Implement isFeatureEnabled method
  - Implement getFeatureStatus method
  - Implement shouldShowNavItem method
  - Implement getRedirectForDeprecatedRoute method
  - Implement shouldRenderComponent method
  - Create Track3FeatureDeprecation implementation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 5.1 Write property test for deprecated features hidden
  - **Property 5: Deprecated features hidden from UI**
  - **Validates: Requirements 4.1**

- [x] 6. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create badge progression UI components



  - Implement BadgeProgressionView component
  - Implement CurrentBadgeDisplay component
  - Implement ProgressBar component for badge progress
  - Implement RequirementsList component
  - Implement NextBadgePreview component
  - Implement BadgeTimeline component
  - Implement HummingbirdWelcome modal component
  - Add animations for badge unlocks
  - _Requirements: 1.2, 1.4, 1.5, 2.3, 2.4_

- [x] 8. Update dashboard for Track 3 community metrics



  - Create CommunityDashboard component
  - Implement WelcomeSection with current badge display
  - Create MetricsGrid with Track 3 metrics (actions, posts, initiatives, referrals)
  - Implement BadgeProgressCard
  - Implement RecentActivity component
  - Create QuickActions component with Track 3 actions
  - Remove tree planting and carbon credit metrics
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 9. Implement deprecated route handling



  - Create DeprecatedRouteHandler component
  - Add route redirects for /trees → /initiatives
  - Add route redirects for /marketplace → /badges
  - Add route redirects for /carbon-credits → /initiatives
  - Update App.tsx routing configuration
  - Add informational messages for redirects
  - _Requirements: 4.3, 4.5_

- [x] 10. Update navigation for Track 3



  - Create TRACK_3_NAVIGATION configuration
  - Remove "Trees" and "Marketplace" nav items
  - Add/emphasize "Challenges", "My Badges", "Leaderboard" items
  - Update mobile navigation to match desktop
  - Update quick actions menu for Track 3 priorities
  - Update user menu items
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 11. Create Track 3 home page


  - Implement Track3HomePage component
  - Create HeroSection with hummingbird animation
  - Implement BadgeProgressionShowcase
  - Create CommunityImpactMetrics section
  - Update FeatureHighlights for Track 3 features
  - Implement HummingbirdStorySection
  - Remove tree planting and carbon credit sections
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. Update badge SVG designs for community themes



  - Update badge icon set to remove tree-specific imagery
  - Add community and collaboration icons (people, hands, hearts, networks)
  - Create Hummingbird badge SVG with prominent hummingbird icon
  - Update Community Contributor badge design
  - Update Climate Advocate badge design
  - Update Environmental Champion badge design
  - Update Green Hero badge design
  - Create Green Hero variant badge designs
  - Maintain forest themes as background elements
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 13. Implement micro-challenges for community engagement
  - Update challenge types to focus on social and collaborative activities
  - Remove tree planting and carbon credit challenges
  - Add "Share your climate story" challenge
  - Add "Comment on 5 posts" challenge
  - Add "Invite 3 friends" challenge
  - Add "Join an initiative" challenge
  - Update challenge reward calculations
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14. Implement automatic Hummingbird badge award on signup



  - Add database trigger or service hook for new user registration
  - Award Hummingbird badge automatically
  - Create welcome notification
  - Show HummingbirdWelcome modal on first login
  - Initialize user_badge_progress record
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 15. Implement Green Hero variant earning system
  - Create variant eligibility checking logic
  - Implement Social Mobilizer variant award (100 referrals)
  - Implement Initiative Leader variant award (10 initiatives created/completed)
  - Implement Knowledge Sharer variant award (50 educational posts)
  - Add variant unlock notifications
  - Create variant badge display in profile
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 16. Update documentation for Track 3
  - Update README.md to remove tree planting and carbon credit descriptions
  - Update TRACK_3_SUBMISSION.md to emphasize community engagement
  - Update wiki/01-platform-overview.md for Track 3 focus
  - Update feature documentation to remove deprecated features
  - Update code comments to reflect Track 3 priorities
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 17. Implement analytics for community engagement
  - Track daily active users and engagement rates
  - Measure social post creation, likes, comments, shares
  - Track initiative participation and completion rates
  - Monitor referral conversion rates
  - Generate badge distribution reports
  - Create engagement progression analytics
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
