# Requirements Document

## Introduction

The Hummingbird Badge system has been implemented with database tables, services, and components, but the platform's main pages (landing page, dashboard, badges page, journey dashboard) need to be updated to integrate the Hummingbird welcome experience and badge progression visualization. Additionally, all existing users need to be assigned the Hummingbird badge so they can continue their journey through the platform's gamification system.

## Glossary

- **Hummingbird Badge**: A special welcome badge awarded to users upon registration, representing the beginning of their environmental journey
- **Badge Progression View**: A UI component that displays a user's badge tier progression from Hummingbird through Bronze, Silver, Gold, Platinum, and Diamond
- **Hummingbird Welcome**: An onboarding modal that introduces new users to the badge system and their first badge
- **Journey Dashboard**: A page that tracks user progress through the five journey stages (Awareness, Activation, Action, Verification, Legacy)
- **Landing Page**: The public-facing homepage that introduces the platform to visitors
- **Dashboard Page**: The authenticated user's main dashboard showing their impact metrics and activities
- **Gang Green Platform**: The digital platform for environmental conservation and community engagement

## Requirements

### Requirement 1: Landing Page Integration

**User Story:** As a visitor, I want to see the Hummingbird badge featured on the landing page, so that I understand the platform's gamification system before registering.

#### Acceptance Criteria

1. WHEN the landing page loads THEN the system SHALL display the Hummingbird badge in the NFT Badge Showcase section
2. WHEN the badge showcase is rendered THEN the system SHALL show the Hummingbird badge as the entry-level badge with visual prominence
3. WHEN a visitor views the User Journey Visualization THEN the system SHALL include the Hummingbird badge as the first milestone
4. WHEN the landing page describes gamification THEN the system SHALL mention the Hummingbird welcome badge in the feature highlights
5. WHEN visitors scroll through the page THEN the system SHALL maintain visual consistency between the Hummingbird badge and other platform badges

### Requirement 2: Dashboard Page Integration

**User Story:** As an authenticated user, I want to see my Hummingbird badge status on my dashboard, so that I can track my progress toward the next badge tier.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display the user's current badge tier in the stats cards section
2. WHEN the user has a Hummingbird badge THEN the system SHALL show progress toward the Bronze badge
3. WHEN the dashboard renders achievements THEN the system SHALL include the Hummingbird badge in the badges count
4. WHEN the user views their level progress THEN the system SHALL correlate badge tier with user level
5. WHEN the dashboard displays quick actions THEN the system SHALL include a link to view all badges

### Requirement 3: Badges Page Enhancement

**User Story:** As a user, I want to view my complete badge progression on the badges page, so that I can understand my journey from Hummingbird to Diamond tier.

#### Acceptance Criteria

1. WHEN the badges page loads THEN the system SHALL render the BadgeProgressionView component showing all tiers
2. WHEN the user has a Hummingbird badge THEN the system SHALL highlight it as earned with visual distinction
3. WHEN the badges page displays progression THEN the system SHALL show locked future tiers (Bronze, Silver, Gold, Platinum, Diamond)
4. WHEN the user views badge details THEN the system SHALL display requirements for advancing to the next tier
5. WHEN the badges page is accessed THEN the system SHALL provide an info button to replay the Hummingbird welcome story

### Requirement 4: Journey Dashboard Integration

**User Story:** As a user, I want to see my Hummingbird badge integrated into my journey dashboard, so that I understand how badges relate to journey stages.

#### Acceptance Criteria

1. WHEN the journey dashboard loads THEN the system SHALL display the user's current badge tier alongside journey stage
2. WHEN the user is in the Awareness stage THEN the system SHALL show the Hummingbird badge as the appropriate tier
3. WHEN the journey dashboard shows milestones THEN the system SHALL include badge tier advancement as a milestone type
4. WHEN the user views recommendations THEN the system SHALL suggest actions that contribute to badge progression
5. WHEN the journey dashboard displays impact stats THEN the system SHALL correlate trees planted and challenges completed with badge requirements

### Requirement 5: Existing User Badge Assignment

**User Story:** As an existing user, I want to receive the Hummingbird badge retroactively, so that I can participate in the badge progression system.

#### Acceptance Criteria

1. WHEN the badge assignment migration runs THEN the system SHALL identify all users without a badge_tier in user_gamification
2. WHEN existing users are identified THEN the system SHALL assign them the Hummingbird badge tier
3. WHEN the Hummingbird badge is assigned THEN the system SHALL set the earned_at timestamp to the user's registration date
4. WHEN the badge assignment completes THEN the system SHALL initialize badge_progress_data with default values
5. WHEN users log in after the migration THEN the system SHALL display their newly assigned Hummingbird badge

### Requirement 6: Welcome Experience for Existing Users

**User Story:** As an existing user who just received the Hummingbird badge, I want to see a welcome message explaining the new badge system, so that I understand what changed.

#### Acceptance Criteria

1. WHEN an existing user logs in after badge assignment THEN the system SHALL detect if they have not seen the Hummingbird welcome
2. WHEN the welcome has not been shown THEN the system SHALL display the HummingbirdWelcome modal automatically
3. WHEN the welcome modal is displayed THEN the system SHALL explain the badge progression system
4. WHEN the user completes the welcome flow THEN the system SHALL mark the welcome as seen in their profile
5. WHEN the user dismisses the welcome THEN the system SHALL not show it again on subsequent logins

### Requirement 7: Badge Progression Visualization

**User Story:** As a user, I want to see a clear visual representation of my badge progression, so that I understand what I need to do to advance to the next tier.

#### Acceptance Criteria

1. WHEN the badge progression is rendered THEN the system SHALL display all six tiers in a horizontal or vertical layout
2. WHEN each tier is displayed THEN the system SHALL show the tier name, icon, and requirements
3. WHEN the user's current tier is shown THEN the system SHALL highlight it with visual emphasis
4. WHEN locked tiers are displayed THEN the system SHALL show them with reduced opacity and lock icons
5. WHEN the user hovers over a tier THEN the system SHALL display detailed requirements and rewards

### Requirement 8: Navigation and Routing

**User Story:** As a user, I want to easily navigate between the dashboard, badges page, and journey dashboard, so that I can track my progress across different views.

#### Acceptance Criteria

1. WHEN the user is on the dashboard THEN the system SHALL provide a navigation link to the badges page
2. WHEN the user is on the badges page THEN the system SHALL provide a navigation link to the journey dashboard
3. WHEN the user is on the journey dashboard THEN the system SHALL provide a navigation link to the badges page
4. WHEN navigation links are clicked THEN the system SHALL transition smoothly between pages
5. WHEN the user navigates THEN the system SHALL maintain authentication state and user context

