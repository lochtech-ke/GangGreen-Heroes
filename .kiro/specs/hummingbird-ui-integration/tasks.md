# Implementation Plan

- [x] 1. Create database migration for existing user badge assignment





  - Create migration file 027_assign_hummingbird_to_existing_users.sql
  - Identify users without badge_tier in user_gamification table
  - Assign Hummingbird badge with earned_at set to registration date
  - Initialize badge_progress_data with default values
  - Create entries in user_earned_badges table
  - Add rollback SQL for safe deployment
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 1.1 Write property test for badge assignment
  - **Property 5: Existing user badge assignment**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 2. Create BadgeProgressWidget component



  - Create src/components/badges/BadgeProgressWidget.tsx
  - Display current badge tier with icon
  - Show progress percentage to next tier
  - Support compact and full display modes
  - Add loading and error states
  - _Requirements: 2.1, 2.2_

- [ ]* 2.1 Write property test for BadgeProgressWidget
  - **Property 2: Badge status display on dashboard**
  - **Validates: Requirements 2.1, 2.2**

- [x] 3. Create BadgeTierIndicator component



  - Create src/components/badges/BadgeTierIndicator.tsx
  - Display badge tier alongside journey stage
  - Support multiple sizes (sm, md, lg)
  - Show visual correlation between badge and stage
  - Add tooltip with badge details
  - _Requirements: 4.1, 4.2_

- [ ]* 3.1 Write property test for BadgeTierIndicator
  - **Property 4: Journey-badge integration**
  - **Validates: Requirements 4.1, 4.2**

- [x] 4. Update HomePage with Hummingbird badge integration



  - Add Hummingbird badge to NFTBadgeShowcase component
  - Update UserJourneyVisualization to include badge milestones
  - Enhance FeatureHighlights to mention badge progression system
  - Ensure visual consistency across sections
  - Test responsive layout on mobile devices
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 4.1 Write property test for landing page badge visibility
  - **Property 1: Hummingbird badge visibility on landing page**
  - **Validates: Requirements 1.1, 1.2**

- [x] 5. Update DashboardPage with badge integration





  - Integrate BadgeProgressWidget into stats section
  - Update StatCards to include badge tier display
  - Add "View Badges" link to quick actions
  - Correlate badge tier with user level display
  - Test layout with different badge tiers
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Enhance BadgesPage with info button and welcome replay



  - Add info button to page header
  - Connect info button to HummingbirdWelcome modal
  - Ensure BadgeProgressionView shows all six tiers
  - Highlight Hummingbird badge as earned
  - Test modal display and dismissal
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 6.1 Write property test for badge progression view
  - **Property 3: Badge progression view completeness**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 7. Update JourneyDashboardPage with badge integration



  - Integrate BadgeTierIndicator next to journey stage display
  - Add badge tier advancement to milestones list
  - Correlate badge requirements with journey actions in recommendations
  - Update impact stats to show badge-related metrics
  - Test journey-badge correlation display
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement welcome experience for existing users





  - Update useHummingbirdWelcome hook to detect retroactive badge assignment
  - Modify HummingbirdWelcome modal to explain badge system to existing users
  - Add localStorage flag to track welcome display
  - Ensure welcome shows only once per user
  - Test welcome flow for existing vs new users
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.1 Write property test for welcome experience
  - **Property 6: Welcome experience for existing users**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 9. Add navigation links between pages





  - Add "View Badges" link from dashboard to badges page
  - Add "View Journey" link from badges page to journey dashboard
  - Add "View Badges" link from journey dashboard to badges page
  - Ensure smooth transitions between pages
  - Maintain authentication state across navigation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 9.1 Write property test for navigation consistency
  - **Property 8: Navigation consistency**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 10. Implement badge progression visualization enhancements






  - Ensure all six tiers display correctly in BadgeTimeline
  - Add tier name, icon, and requirements to each tier display
  - Highlight current tier with visual emphasis
  - Show locked tiers with reduced opacity and lock icons
  - Add hover states to display detailed requirements
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 10.1 Write property test for badge visualization
  - **Property 7: Badge progression visualization accuracy**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [ ] 11. Deploy badge assignment migration
  - Review migration SQL for correctness
  - Test migration on development database
  - Create deployment guide with rollback instructions
  - Execute migration on production database
  - Verify all existing users received Hummingbird badge
  - Monitor for errors and performance issues
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

