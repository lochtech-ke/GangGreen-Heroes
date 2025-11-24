# Design Document

## Overview

This feature integrates the Hummingbird Badge system into the platform's main user-facing pages (landing page, dashboard, badges page, and journey dashboard) and ensures all existing users receive the Hummingbird badge retroactively. The integration provides a cohesive user experience that connects badge progression with the user journey system, while the retroactive badge assignment ensures existing users can participate in the gamification system.

The design leverages existing components (`BadgeProgressionView`, `HummingbirdWelcome`, `useBadgeProgression`, `useHummingbirdWelcome`) and services (`hummingbirdBadgeService`, `badgeProgressionService`, `journeyService`) to create a seamless experience across all pages.

## Architecture

### Component Architecture

```
Pages Layer
├── HomePage (Public)
│   ├── NFTBadgeShowcase (includes Hummingbird)
│   ├── UserJourneyVisualization (shows badge milestones)
│   └── FeatureHighlights (mentions badge system)
├── DashboardPage (Authenticated)
│   ├── StatCards (includes badge tier)
│   ├── BadgeProgressWidget (new)
│   └── QuickActions (link to badges page)
├── BadgesPage (Authenticated)
│   ├── BadgeProgressionView (existing)
│   ├── HummingbirdWelcome (existing, with info button)
│   └── BadgeTimeline (existing)
└── JourneyDashboardPage (Authenticated)
    ├── JourneyStageProgress
    ├── BadgeTierIndicator (new)
    └── MilestonesList (includes badge milestones)

Services Layer
├── hummingbirdBadgeService (existing)
├── badgeProgressionService (existing)
├── journeyService (existing)
└── badgeAssignmentService (new)

Database Layer
├── user_gamification (existing)
├── user_earned_badges (existing)
├── badge_tiers (existing)
└── user_journey_progress (existing)
```

### Data Flow

1. **Badge Assignment Flow**:
   - Migration identifies users without badge_tier
   - Assigns Hummingbird badge (tier 1)
   - Sets earned_at to user registration date
   - Initializes badge_progress_data

2. **Welcome Experience Flow**:
   - User logs in after badge assignment
   - `useHummingbirdWelcome` checks if welcome was shown
   - Displays `HummingbirdWelcome` modal if not seen
   - Marks welcome as shown in localStorage

3. **Badge Display Flow**:
   - Pages fetch badge data via `useBadgeProgression`
   - Components render current badge tier
   - Progress bars show advancement to next tier
   - Timeline shows all tiers (earned and locked)

## Components and Interfaces

### New Components

#### BadgeProgressWidget
```typescript
interface BadgeProgressWidgetProps {
  userId: string;
  compact?: boolean;
  showProgress?: boolean;
}

// Displays current badge tier and progress to next tier
// Used in dashboard for quick badge status overview
```

#### BadgeTierIndicator
```typescript
interface BadgeTierIndicatorProps {
  currentTier: string;
  journeyStage: JourneyStage;
  size?: 'sm' | 'md' | 'lg';
}

// Shows badge tier alongside journey stage
// Used in journey dashboard to correlate badges with stages
```

### Modified Components

#### HomePage
- Add Hummingbird badge to NFTBadgeShowcase
- Update UserJourneyVisualization to include badge milestones
- Enhance FeatureHighlights to mention badge progression

#### DashboardPage
- Add BadgeProgressWidget to stats section
- Update StatCards to include badge tier
- Add "View Badges" to quick actions

#### BadgesPage
- Add info button to replay Hummingbird welcome
- Ensure BadgeProgressionView shows all tiers
- Highlight Hummingbird as earned

#### JourneyDashboardPage
- Add BadgeTierIndicator next to journey stage
- Include badge tier advancement in milestones
- Correlate badge requirements with journey actions

## Data Models

### Badge Assignment Data
```typescript
interface BadgeAssignment {
  userId: string;
  badgeTier: 'hummingbird';
  earnedAt: string; // User registration date
  assignedAt: string; // Migration execution date
  badgeProgressData: {
    treesPlanted: number;
    challengesCompleted: number;
    referralCount: number;
    communityEngagement: number;
  };
}
```

### Badge Display Data
```typescript
interface BadgeDisplayInfo {
  currentBadge: Badge;
  nextBadge: Badge | null;
  progressPercentage: number;
  requirementProgress: RequirementProgress[];
  allBadges: Badge[];
}
```

### Journey-Badge Correlation
```typescript
interface JourneyBadgeCorrelation {
  journeyStage: JourneyStage;
  recommendedBadgeTier: string;
  badgeMilestones: string[];
  contributingActions: string[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hummingbird Badge Visibility on Landing Page
*For any* visitor viewing the landing page, the Hummingbird badge should be visible in the NFT Badge Showcase section with appropriate visual prominence.
**Validates: Requirements 1.1, 1.2**

### Property 2: Badge Status Display on Dashboard
*For any* authenticated user with a badge tier, the dashboard should display their current badge tier in the stats cards section.
**Validates: Requirements 2.1, 2.2**

### Property 3: Badge Progression View Completeness
*For any* user viewing the badges page, the BadgeProgressionView should render all six tiers (Hummingbird, Bronze, Silver, Gold, Platinum, Diamond) with earned badges highlighted and locked badges shown with reduced opacity.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Journey-Badge Integration
*For any* user viewing the journey dashboard, their current badge tier should be displayed alongside their journey stage with visual correlation.
**Validates: Requirements 4.1, 4.2**

### Property 5: Existing User Badge Assignment
*For any* existing user without a badge_tier, the migration should assign them the Hummingbird badge with earned_at set to their registration date.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Welcome Experience for Existing Users
*For any* existing user who receives the Hummingbird badge retroactively, the HummingbirdWelcome modal should be displayed on their next login if they haven't seen it before.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 7: Badge Progression Visualization Accuracy
*For any* badge tier displayed in the progression view, the system should show the correct tier name, icon, requirements, and lock status based on the user's current progress.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 8: Navigation Consistency
*For any* authenticated user, navigation links between dashboard, badges page, and journey dashboard should be present and functional, maintaining authentication state.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

## Error Handling

### Badge Assignment Errors
- **Missing User Data**: Skip users with invalid or missing registration dates
- **Duplicate Assignment**: Check for existing badge_tier before assignment
- **Transaction Failures**: Rollback partial assignments and log errors
- **RLS Policy Violations**: Use service role for migration operations

### UI Rendering Errors
- **Badge Data Loading Failures**: Show fallback UI with retry option
- **SVG Generation Errors**: Use placeholder badge icon
- **Component Mount Errors**: Gracefully degrade to basic display
- **Network Timeouts**: Cache badge data and show stale data with indicator

### Welcome Modal Errors
- **localStorage Unavailable**: Fall back to session-based tracking
- **Badge Generation Failures**: Show welcome without badge preview
- **Social Sharing Errors**: Provide manual copy option
- **Modal Dismissal Issues**: Ensure escape key and backdrop click work

## Testing Strategy

### Unit Tests
- Test BadgeProgressWidget rendering with different badge tiers
- Test BadgeTierIndicator display with various journey stages
- Test badge assignment logic with mock user data
- Test welcome modal display conditions
- Test navigation link generation

### Property-Based Tests
- **Property 1 Test**: Generate random visitor sessions, verify Hummingbird badge appears in NFT showcase
- **Property 2 Test**: Generate random authenticated users with badge tiers, verify dashboard displays correct tier
- **Property 3 Test**: Generate random user badge states, verify all six tiers render correctly
- **Property 4 Test**: Generate random journey stages and badge tiers, verify correlation display
- **Property 5 Test**: Generate random existing users without badges, verify Hummingbird assignment
- **Property 6 Test**: Generate random existing users with new badges, verify welcome modal display
- **Property 7 Test**: Generate random badge progression states, verify visualization accuracy
- **Property 8 Test**: Generate random navigation paths, verify links maintain auth state

### Integration Tests
- Test complete badge assignment migration flow
- Test welcome modal display after badge assignment
- Test badge progression view with real badge data
- Test journey dashboard with badge integration
- Test navigation between all pages with badge context

### End-to-End Tests
- Test new user registration → Hummingbird badge → welcome modal flow
- Test existing user login → badge assignment → welcome modal flow
- Test badge progression from Hummingbird to Bronze
- Test journey stage advancement with badge tier correlation
- Test social media sharing from welcome modal

### Testing Framework
- **Unit Tests**: Vitest with React Testing Library
- **Property-Based Tests**: fast-check library (100+ iterations per property)
- **Integration Tests**: Vitest with Supabase test client
- **E2E Tests**: Playwright

## Implementation Notes

### Badge Assignment Migration

The migration should:
1. Identify users without badge_tier in user_gamification
2. Assign badge_tier = 'hummingbird' (tier 1)
3. Set earned_at to user's created_at from auth.users
4. Initialize badge_progress_data with zeros
5. Create entry in user_earned_badges table
6. Log assignment for audit trail

```sql
-- Migration pseudo-code
INSERT INTO user_earned_badges (user_id, badge_id, earned_at)
SELECT 
  ug.user_id,
  (SELECT id FROM badge_tiers WHERE name = 'Hummingbird'),
  au.created_at
FROM user_gamification ug
JOIN auth.users au ON ug.user_id = au.id
WHERE ug.badge_tier IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_earned_badges ueb
    WHERE ueb.user_id = ug.user_id
  );

UPDATE user_gamification
SET 
  badge_tier = 'hummingbird',
  badge_progress_data = jsonb_build_object(
    'treesPlanted', 0,
    'challengesCompleted', 0,
    'referralCount', 0,
    'communityEngagement', 0
  ),
  updated_at = NOW()
WHERE badge_tier IS NULL;
```

### Welcome Modal Display Logic

```typescript
// Check if user should see welcome modal
const shouldShowWelcome = (userId: string): boolean => {
  // Check localStorage for welcome shown flag
  const welcomeShownKey = `hummingbird_welcome_shown_${userId}`;
  const hasSeenWelcome = localStorage.getItem(welcomeShownKey);
  
  if (hasSeenWelcome) return false;
  
  // Check if user has Hummingbird badge earned recently
  const badge = getUserBadge(userId, 'Hummingbird');
  if (!badge) return false;
  
  const earnedAt = new Date(badge.earned_at);
  const now = new Date();
  const minutesSinceEarned = (now.getTime() - earnedAt.getTime()) / (1000 * 60);
  
  // Show welcome if badge earned within last 5 minutes
  return minutesSinceEarned < 5;
};
```

### Badge-Journey Correlation

```typescript
// Map journey stages to recommended badge tiers
const journeyBadgeMap: Record<JourneyStage, string> = {
  [JourneyStage.AWARENESS]: 'hummingbird',
  [JourneyStage.ACTIVATION]: 'bronze',
  [JourneyStage.ACTION]: 'silver',
  [JourneyStage.VERIFICATION]: 'gold',
  [JourneyStage.LEGACY]: 'platinum',
};

// Get recommended badge tier for journey stage
const getRecommendedBadgeTier = (stage: JourneyStage): string => {
  return journeyBadgeMap[stage] || 'hummingbird';
};
```

### Performance Considerations

- Cache badge SVGs in localStorage to avoid regeneration
- Lazy load BadgeProgressionView component
- Prefetch badge data on dashboard load
- Use React.memo for badge display components
- Debounce badge progress calculations

### Accessibility

- Ensure badge images have alt text
- Provide keyboard navigation for badge timeline
- Use ARIA labels for badge status indicators
- Ensure color contrast meets WCAG AA standards
- Support screen readers for badge descriptions

### Mobile Responsiveness

- Stack badge progression vertically on mobile
- Use touch-friendly badge timeline
- Optimize badge SVG size for mobile bandwidth
- Ensure welcome modal is mobile-friendly
- Test badge display on various screen sizes

