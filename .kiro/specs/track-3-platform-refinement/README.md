# Track 3 Platform Refinement Spec

## Overview

This spec refines the #GangGreen platform for Track 3 (Community Engagement and Sustainability) of the Wangari Maathai Hackathon. It focuses on removing tree planting and carbon credit features while restructuring the badge system to emphasize community engagement.

## Key Changes

### Badge System Rework
- **New Progression Path**: Hummingbird → Community Contributor → Climate Advocate → Environmental Champion → Green Hero
- **Hummingbird Badge**: Automatically awarded upon signup
- **Green Hero Variants**: Social Mobilizer, Initiative Leader, Knowledge Sharer
- **Community-Focused**: Badges earned through social engagement, initiatives, and referrals

### Feature Deprecation
- Tree planting transactions removed from Track 3 submission
- Carbon credit marketplace removed from Track 3 submission
- Navigation updated to remove deprecated features
- Routes redirect to alternative features

### Content Alignment
- All documentation updated to reflect Track 3 focus
- Home page redesigned for community engagement
- Dashboard shows community metrics instead of tree/carbon stats
- Micro-challenges focused on social and collaborative actions

## Files

- **requirements.md**: 15 requirements with detailed acceptance criteria
- **design.md**: Complete technical design with architecture, components, data models, and correctness properties
- **tasks.md**: 18 implementation tasks with optional property-based tests

## Badge Progression

```
Hummingbird (Entry)
    ↓
Community Contributor (25 actions)
    ↓
Climate Advocate (100 actions)
    ↓
Environmental Champion (250 actions)
    ↓
Green Hero (500 actions)
    ↓
├── Social Mobilizer (100 referrals)
├── Initiative Leader (10 initiatives)
└── Knowledge Sharer (50 educational posts)
```

## Implementation Approach

1. **Database Setup**: Create new badge and engagement tracking tables
2. **Services**: Implement BadgeProgressionService, CommunityEngagementService, FeatureDeprecationService
3. **UI Components**: Build badge progression views, update dashboard, create Track 3 home page
4. **Navigation**: Update menus to remove deprecated features
5. **Content**: Update all documentation and UI text
6. **Testing**: Property-based tests for core correctness properties (optional)

## Getting Started

To begin implementation:

1. Review the requirements document
2. Study the design document architecture
3. Start with task 1 (database schema setup)
4. Work through tasks sequentially
5. Run tests at checkpoints (tasks 6 and 18)

## Track 3 Priorities

✅ **Community Engagement**: Social posts, likes, comments, shares
✅ **Micro-Actions**: Daily challenges focused on collaboration
✅ **Initiatives**: Join and create community projects
✅ **Referrals**: Grow the movement through invitations
✅ **Governance**: Petitions and proposals
✅ **Gamification**: Badge progression and leaderboards

❌ **Tree Planting Transactions**: Removed for Track 3
❌ **Carbon Credit Marketplace**: Removed for Track 3

## Success Criteria

- [ ] Hummingbird badge automatically awarded on signup
- [ ] Badge progression works through all 5 tiers
- [ ] Green Hero variants can be earned
- [ ] Tree planting and carbon credit features hidden
- [ ] Navigation updated for Track 3
- [ ] Dashboard shows community engagement metrics
- [ ] Documentation aligned with Track 3 focus
- [ ] All property tests passing (if implemented)

## Next Steps

Open `tasks.md` and click "Start task" next to task 1 to begin implementation.

