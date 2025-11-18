# Implementation Plan: Individual User Journey

## Overview
This implementation plan breaks down the Individual User Journey feature into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring a cohesive implementation that integrates with existing platform features.

- [x] 1. Set up journey data models and database schema


- [x] 1.1 Create journey progress tracking tables


  - Create `user_journey_progress` table with stage tracking, milestones, and metrics
  - Add indexes for user_id and current_stage lookups
  - Create migration file with proper constraints and defaults
  - _Requirements: 1.1, 2.1, 3.1_


- [x] 1.2 Create micro-challenges tables

  - Create `micro_challenges` table with difficulty levels, points, and requirements
  - Create `user_challenge_progress` table for tracking user participation
  - Add indexes for efficient challenge queries
  - _Requirements: 6.1, 6.2, 6.3_



- [x] 1.3 Create climate nuggets tables

  - Create `climate_nuggets` table with content, categories, and related causes
  - Create `user_climate_nuggets` table for read/saved status tracking
  - Add indexes for category and user lookups

  - _Requirements: 5.1, 5.2, 5.4_



- [ ] 1.4 Create referrals and petitions tables
  - Create `user_referrals` table with referral codes and status tracking
  - Create `petitions` and `petition_signatures` tables
  - Add unique constraints and indexes


  - _Requirements: 12.1, 12.2, 13.1, 13.3_


- [ ] 1.5 Create certificates table
  - Create `user_certificates` table with type, metadata, and URLs
  - Add indexes for user and type lookups
  - _Requirements: 14.1, 14.2, 14.5_


- [x] 2. Implement journey service and core logic


- [x] 2.1 Create journey service with stage management


  - Implement `journey.service.ts` with stage transition logic
  - Add methods for tracking user progress and milestones
  - Implement journey initialization for new users
  - Add validation for stage prerequisites
  - _Requirements: 1.1, 2.3, 3.5_


- [x] 2.2 Implement journey progress tracking

  - Add methods to update stage progress percentages
  - Implement milestone completion tracking
  - Add cause joining and tracking functionality
  - Create methods to calculate next recommended actions
  - _Requirements: 3.4, 10.1, 10.6_

- [x] 2.3 Create journey context provider


  - Implement `JourneyProvider` React context
  - Add hooks for accessing journey state (`useJourney`)
  - Implement real-time journey updates using Supabase subscriptions
  - _Requirements: 2.3, 10.3_

- [ ]* 2.4 Write unit tests for journey service
  - Test stage transition logic and validation
  - Test milestone tracking and completion
  - Test progress calculation methods
  - _Requirements: 2.1, 3.5, 10.6_

- [ ] 3. Build awareness and landing components
- [ ] 3.1 Create enhanced landing page
  - Build hero section with local environmental stories
  - Add impact metrics display (users, trees, carbon)
  - Implement referral source tracking in URL parameters
  - Add responsive design for mobile devices
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3.2 Implement story carousel component
  - Create `StoryCarousel` component with rotating stories
  - Add image/video support for story content
  - Implement social sharing buttons
  - Add "Get Involved" CTAs linking to registration
  - _Requirements: 1.1, 1.4_

- [ ] 3.3 Add social media integration
  - Implement Open Graph meta tags for sharing
  - Add Twitter Card support
  - Create shareable story graphics
  - _Requirements: 1.2_


- [ ] 4. Implement onboarding and activation flow
- [ ] 4.1 Create onboarding flow component
  - Build `OnboardingFlow` component with multi-step wizard
  - Implement step navigation and progress tracking
  - Add welcome screen with platform introduction
  - Integrate with journey service to track completion
  - _Requirements: 2.1, 2.3, 3.1_

- [ ] 4.2 Build cause selection wizard
  - Create `CauseSelectionWizard` component
  - Integrate with AI chatbot for guided selection
  - Display cause categories with descriptions and icons
  - Implement multi-select functionality
  - Show relevant initiatives for each cause
  - _Requirements: 3.2, 3.3, 3.4, 3.6_

- [ ] 4.3 Implement profile customization step
  - Add profile photo upload
  - Collect user preferences (location, interests)
  - Set notification preferences
  - _Requirements: 2.3_

- [ ] 4.4 Create community selection interface
  - Display available Green Hero communities
  - Show community details (members, activities, impact)
  - Implement join community functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4.5 Integrate first climate nugget delivery
  - Fetch and display first climate nugget based on selected causes
  - Implement read tracking
  - Add save for later functionality
  - _Requirements: 5.1, 5.4, 5.5_


- [ ] 5. Build micro-challenge system
- [x] 5.1 Create micro-challenge service



  - Implement `microChallenge.service.ts` with CRUD operations
  - Add methods to fetch challenges by difficulty and category
  - Implement challenge participation tracking
  - Add completion validation logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5.2 Build micro-challenge hub component
  - Create `MicroChallengeHub` component displaying available challenges
  - Implement filters for difficulty, category, and time
  - Add challenge cards with details and participation stats
  - Show active challenges section
  - _Requirements: 6.1, 6.2, 6.6_

- [ ] 5.3 Implement challenge detail and participation
  - Create `ChallengeDetail` component with full requirements
  - Add join challenge functionality
  - Implement progress tracking UI
  - Build submission flow for challenge completion
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 5.4 Integrate challenge rewards with gamification
  - Award points upon challenge completion
  - Trigger badge checks for challenge milestones
  - Update user journey progress
  - Send completion notifications
  - _Requirements: 6.5, 8.1, 8.4_


- [ ] 6. Enhance tree planting flow for journey integration
- [ ] 6.1 Update tree planting component with journey tracking
  - Modify existing `TreePlantingFlow` to update journey progress
  - Add automatic GPS capture with fallback to manual selection
  - Ensure photo metadata validation
  - Integrate with verification service
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 6.2 Implement tree monitoring dashboard
  - Create `TreeMonitoringDashboard` component showing user's trees
  - Display growth metrics and carbon sequestration estimates
  - Add progress photo upload functionality
  - Show verification status for each tree
  - _Requirements: 10.1, 10.2, 10.5, 10.6_

- [ ] 6.3 Build survival reminder system
  - Create scheduled job for survival reminders (30, 60, 90 days)
  - Implement reminder notification delivery
  - Add photo upload prompts in reminders
  - Track reminder responses
  - _Requirements: 10.4_

- [ ] 6.4 Integrate AI and satellite verification
  - Connect tree submissions to AI verification service
  - Implement photo analysis and validation
  - Add satellite data cross-reference where available
  - Update tree records with verification results
  - Send verification status notifications
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_


- [ ] 7. Build gamification and rewards integration
- [ ] 7.1 Enhance points system for journey actions
  - Update gamification service to award points for journey milestones
  - Add point calculations for different action types
  - Implement real-time point updates
  - Display point totals on user dashboard
  - _Requirements: 8.1, 8.2_

- [ ] 7.2 Implement badge system for journey achievements
  - Create badge definitions for journey milestones
  - Add badge award logic triggered by journey progress
  - Implement badge notification system
  - Build badge display on user profiles
  - Create badge gallery component
  - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [ ] 7.3 Build stage indicator component
  - Create `StageIndicator` component showing journey stages
  - Add progress visualization for current stage
  - Implement milestone markers
  - Add celebration animations for stage completion
  - _Requirements: 2.3, 10.1_


- [ ] 8. Implement leaderboard and social features
- [ ] 8.1 Create leaderboard service
  - Implement `leaderboard.service.ts` with ranking calculations
  - Add methods for different leaderboard types (points, trees, carbon)
  - Implement time period filtering (weekly, monthly, all-time)
  - Add caching for leaderboard data (5-minute TTL)
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 8.2 Build leaderboard view component
  - Create `LeaderboardView` component with tabbed interface
  - Display top 100 users with rankings
  - Show user's current position
  - Add nearby competitors view
  - Implement real-time updates
  - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

- [ ] 8.3 Create impact dashboard
  - Build `ImpactDashboard` component with metrics cards
  - Display total trees, carbon sequestered, area restored
  - Add growth charts showing impact over time
  - Show comparison to community averages
  - Add environmental equivalents display
  - _Requirements: 10.6_

- [ ] 8.4 Implement community feed
  - Create `CommunityFeed` component with activity stream
  - Display recent activities from joined communities
  - Add member highlights and achievements
  - Implement follow/unfollow functionality
  - _Requirements: 4.5_


- [ ] 9. Build referral system
- [x] 9.1 Create referral service


  - Implement `referral.service.ts` with referral code generation
  - Add methods to track referral registrations
  - Implement referral activation logic
  - Add bonus point award system
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 9.2 Build referral center component
  - Create `ReferralCenter` component displaying referral link
  - Add social sharing buttons for multiple platforms
  - Display referral statistics (total, active, points earned)
  - Show referral milestones and rewards
  - _Requirements: 12.1, 12.4, 12.5_

- [ ] 9.3 Implement referral tracking in registration
  - Update registration flow to capture referral codes
  - Link new users to referrers
  - Track referral source in user profiles
  - _Requirements: 12.2_

- [ ] 9.4 Create referral reward system
  - Award bonus points when referred users complete first action
  - Implement milestone badges (10, 50, 100 referrals)
  - Send notifications for successful referrals
  - _Requirements: 12.3, 12.6_


- [-] 10. Implement petition system

- [x] 10.1 Create petition service


  - Implement `petition.service.ts` with CRUD operations
  - Add methods for petition creation and validation
  - Implement signature tracking and duplicate prevention
  - Add petition status management
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 10.2 Build petition hub component
  - Create `PetitionHub` component displaying active petitions
  - Add filters by category and status
  - Show petition cards with progress bars
  - Implement petition creation form
  - _Requirements: 13.1, 13.2_

- [ ] 10.3 Create petition detail view
  - Build `PetitionDetail` component with full description
  - Display signature count and progress
  - Add signature submission functionality
  - Show petition updates timeline
  - Implement social sharing
  - _Requirements: 13.2, 13.3, 13.6_

- [ ] 10.4 Implement petition notifications
  - Send milestone notifications to petition creators
  - Notify signers of petition updates
  - Add petition success notifications
  - _Requirements: 13.5_


- [ ] 11. Build certification and hero badge system
- [ ] 11.1 Create certificate service
  - Implement `certificate.service.ts` with certificate generation
  - Add methods to check milestone achievements
  - Implement PDF certificate generation
  - Create shareable certificate URLs
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 11.2 Build certification gallery component
  - Create `CertificationGallery` component with grid view
  - Display all earned certificates
  - Add certificate detail modal
  - Implement download functionality
  - Add social sharing buttons
  - _Requirements: 14.4, 14.5, 14.6_

- [ ] 11.3 Implement hero badge awards
  - Define hero badge criteria (100 trees, 10,000 points, etc.)
  - Add automatic badge award logic
  - Generate certificates for hero badges
  - Send award notifications
  - _Requirements: 14.1, 14.2_

- [ ] 11.4 Create certificate templates
  - Design PDF certificate templates
  - Add dynamic data fields (name, achievement, date)
  - Implement certificate branding
  - _Requirements: 14.2, 14.3_


- [ ] 12. Implement climate education system
- [ ] 12.1 Create climate nugget service
  - Implement `climateNugget.service.ts` with content management
  - Add methods to fetch nuggets by cause and category
  - Implement read tracking and save functionality
  - Add nugget delivery scheduling
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 12.2 Build climate nugget components
  - Create `ClimateNuggetCard` component for display
  - Build `ClimateNuggetList` with filtering
  - Add `ClimateNuggetDetail` view
  - Implement save for later functionality
  - _Requirements: 5.1, 5.4_

- [ ] 12.3 Implement nugget delivery system
  - Schedule first nugget delivery after cause selection
  - Implement 2-3 per week delivery frequency
  - Add personalized nugget recommendations
  - Track nugget engagement metrics
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 12.4 Add social sharing for nuggets
  - Implement share buttons for social media
  - Create shareable nugget graphics
  - Track sharing metrics
  - _Requirements: 5.6_


- [ ] 13. Build comprehensive notification system
- [ ] 13.1 Create notification service
  - Implement `notification.service.ts` with delivery logic
  - Add methods for different notification types
  - Implement notification preferences management
  - Add both in-app and email notification support
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 13.2 Build notification center component
  - Create `NotificationCenter` component with notification list
  - Add filters by type and read status
  - Implement mark as read/unread functionality
  - Add bulk actions (mark all read, clear all)
  - Show real-time notification updates
  - _Requirements: 15.6_

- [ ] 13.3 Implement notification preferences
  - Create `NotificationPreferences` component
  - Add toggles for notification types
  - Implement frequency settings
  - Add email notification opt-in/out
  - _Requirements: 15.4_

- [ ] 13.4 Integrate notifications across journey
  - Add achievement notifications (badges, points)
  - Implement survival reminders
  - Add community update notifications
  - Send micro-challenge notifications
  - _Requirements: 15.1, 15.2, 15.3_


- [x] 14. Create journey dashboard and navigation


- [x] 14.1 Build journey dashboard page



  - Create `JourneyDashboard` page component
  - Display current stage and progress
  - Show next recommended actions
  - Add quick access to active challenges and trees
  - Display recent achievements
  - _Requirements: 2.3, 10.1_

- [x] 14.2 Integrate journey into main navigation


  - Add journey menu items to navigation
  - Update dashboard to show journey overview
  - Add journey stage indicator to header
  - _Requirements: 2.3_


- [x] 14.3 Create journey onboarding trigger
  - Automatically start onboarding for new users
  - Add option to restart onboarding
  - Track onboarding completion
  - _Requirements: 2.1, 2.3_

- [x] 14.4 Build journey analytics tracking

  - Track stage progression events
  - Monitor milestone completion rates
  - Track action completion by type
  - Add user engagement metrics
  - _Requirements: 10.1, 10.6_


- [ ] 15. Implement real-time updates and subscriptions
- [ ] 15.1 Set up Supabase real-time subscriptions
  - Configure real-time subscriptions for journey progress
  - Add subscriptions for leaderboard updates
  - Implement notification real-time delivery
  - Add challenge completion real-time updates
  - _Requirements: 10.3, 11.2_

- [ ] 15.2 Implement optimistic UI updates
  - Add optimistic updates for point awards
  - Implement optimistic challenge completion
  - Add optimistic tree planting submission
  - _Requirements: 8.1, 6.5, 7.5_

- [ ] 15.3 Build WebSocket connection management
  - Implement connection state management
  - Add reconnection logic
  - Handle connection errors gracefully
  - _Requirements: 10.3_


- [ ] 16. Performance optimization and caching
- [ ] 16.1 Implement caching strategy
  - Add 5-minute cache for leaderboard data
  - Implement 1-minute cache for journey progress
  - Add 1-hour cache for climate nuggets
  - Implement 10-minute cache for challenge lists
  - _Requirements: 11.1, 6.1_

- [ ] 16.2 Optimize database queries
  - Add indexes for frequently queried fields
  - Implement pagination for large lists
  - Use materialized views for leaderboards
  - _Requirements: 11.1, 11.5_

- [ ] 16.3 Implement lazy loading
  - Add lazy loading for images in feeds
  - Implement infinite scroll for leaderboards
  - Add lazy loading for challenge lists
  - _Requirements: 11.2, 6.1_


- [ ] 17. Accessibility and responsive design
- [ ] 17.1 Implement WCAG 2.1 AA compliance
  - Add ARIA labels to all interactive elements
  - Implement keyboard navigation for all components
  - Add screen reader support
  - Ensure color contrast meets standards
  - _Requirements: All_

- [ ] 17.2 Build responsive layouts
  - Create mobile-optimized layouts for all components
  - Implement touch-friendly interactions
  - Add responsive navigation
  - Test on various screen sizes
  - _Requirements: All_

- [ ] 17.3 Add offline capability for tree planting
  - Implement offline data storage for tree records
  - Add sync functionality when connection restored
  - Show offline status indicator
  - _Requirements: 7.1, 7.2_


- [ ] 18. Integration testing and quality assurance
- [ ] 18.1 Create integration tests for journey flow
  - Test complete onboarding flow from registration to first action
  - Test tree planting with verification flow
  - Test challenge completion and reward flow
  - Test referral link sharing and activation
  - _Requirements: 2.1, 7.1, 6.3, 12.2_

- [ ]* 18.2 Write end-to-end tests
  - Test new user journey from awareness to legacy
  - Test multi-stage progression
  - Test leaderboard updates
  - Test certificate generation and download
  - _Requirements: All stages_

- [ ]* 18.3 Perform performance testing
  - Test leaderboard query performance with 100k+ users
  - Test real-time notification delivery
  - Test concurrent challenge submissions
  - Test journey progress updates under load
  - _Requirements: 11.1, 15.1, 6.5_

- [ ]* 18.4 Conduct user acceptance testing
  - Test onboarding flow usability
  - Test chatbot cause selection effectiveness
  - Test challenge discovery and completion
  - Test impact dashboard comprehension
  - Test certificate sharing functionality
  - _Requirements: 4.1, 3.2, 6.1, 10.1, 14.6_


- [ ] 19. Documentation and deployment preparation
- [ ] 19.1 Create component documentation
  - Document all new components with usage examples
  - Add JSDoc comments to service methods
  - Create README for journey feature
  - _Requirements: All_

- [ ] 19.2 Update user guides
  - Add journey feature to user documentation
  - Create onboarding guide for new users
  - Document challenge participation process
  - Add referral system guide
  - _Requirements: All_

- [ ] 19.3 Prepare deployment checklist
  - Verify all database migrations are ready
  - Check environment variables configuration
  - Validate API integrations (AI, satellite)
  - Test notification delivery systems
  - _Requirements: All_

- [ ] 19.4 Create admin tools for content management
  - Build admin interface for creating micro-challenges
  - Add admin tools for climate nugget management
  - Create petition moderation interface
  - Add certificate template management
  - _Requirements: 6.1, 5.1, 13.1, 14.1_
