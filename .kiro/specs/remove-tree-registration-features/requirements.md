# Requirements Document

## Introduction

This specification documents the removal of two tree registration features from the GangGreen platform that are not aligned with the current product vision. The platform should focus on community-driven initiatives and verified organizational tree planting rather than individual tree registration.

## Glossary

- **Dashboard**: The main user dashboard page displaying impact metrics, initiatives, and user progress
- **Journey Dashboard**: The individual user journey tracking page showing progress through engagement stages
- **Quick Actions**: A sidebar widget on the Journey Dashboard providing shortcuts to common platform features
- **Register Tree Hero Card**: A large promotional card on the Dashboard encouraging users to register individual trees
- **Tree Registration**: The process of individual users uploading photos and geo-tagging trees they have planted

## Requirements

### Requirement 1

**User Story:** As a platform administrator, I want to remove the "Register Your Tree" hero card from the Dashboard, so that users focus on joining verified organizational initiatives rather than individual tree registration.

#### Acceptance Criteria

1. WHEN a user views the Dashboard THEN the system SHALL NOT display the "Register Your Tree" hero card
2. WHEN the hero card is removed THEN the system SHALL maintain all other Dashboard components in their current positions
3. WHEN the hero card is removed THEN the system SHALL NOT leave empty space or layout gaps on the Dashboard
4. WHEN a user views the Dashboard THEN the system SHALL display the "For You" section immediately after the stats cards and badge progress widget

### Requirement 2

**User Story:** As a platform administrator, I want to remove the "Plant a Tree" quick action from the Journey Dashboard, so that users are directed to participate in verified initiatives rather than individual tree planting.

#### Acceptance Criteria

1. WHEN a user views the Journey Dashboard THEN the system SHALL NOT display the "Plant a Tree" button in the Quick Actions sidebar
2. WHEN the quick action is removed THEN the system SHALL maintain all other quick action buttons in the Quick Actions widget
3. WHEN the quick action is removed THEN the system SHALL preserve the visual layout and spacing of the Quick Actions widget
4. WHEN a user views the Quick Actions widget THEN the system SHALL display the remaining actions: "View Badges", "View Challenges", "View Petitions", and "Invite Friends"

### Requirement 3

**User Story:** As a developer, I want to ensure no broken navigation links remain after feature removal, so that the application maintains functional integrity.

#### Acceptance Criteria

1. WHEN tree registration features are removed THEN the system SHALL NOT contain any navigation links to tree registration pages
2. WHEN tree registration features are removed THEN the system SHALL NOT contain any service methods that reference individual tree registration
3. WHEN a user attempts to navigate to a removed feature URL THEN the system SHALL handle the route gracefully without errors
4. WHEN the codebase is reviewed THEN the system SHALL contain no orphaned code related to individual tree registration
