# Contributor Token Distribution - Quick Start Guide

## Overview

This spec implements an automated governance token distribution system for GitHub repository contributors and a feature suggestion system for community-driven platform development.

## What This Adds

### 1. Automated Token Distribution
- Contributors automatically earn governance tokens based on GitHub activity
- Configurable weights: PRs (3x), Reviews (2x), Documentation (1.5x), Commits (1x)
- Monthly/quarterly distribution cycles
- Anti-gaming measures with suspicious activity detection

### 2. Feature Suggestion System
- Community members can suggest platform improvements
- Upvoting system to prioritize suggestions
- Auto-conversion of popular suggestions to governance proposals
- Integration with GitHub issues

### 3. Recognition System
- Contributor badges for milestones (100 commits, 10 PRs, 25 reviews)
- Leaderboard rankings
- Profile showcase

### 4. Admin Tools
- Distribution analytics dashboard
- Manual bonus token awards
- Configuration management
- Flagged activity review

## Initial Feature Suggestions to Vote On

The system will seed 17 feature suggestions across 4 priority levels:

**Critical**: Mobile apps, offline mode, multi-language support
**High**: Advanced analytics, carbon credit API, community forums, volunteer matching
**Medium**: Social media integration, email digests, donation receipts, templates
**Low**: Dark mode, accessibility, custom themes, badge trading

## Getting Started

### Prerequisites
- GitHub OAuth app credentials (for account linking)
- GitHub Personal Access Token (for API access)
- Supabase project with Edge Functions enabled

### Environment Variables
```env
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_API_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your_org_name
GITHUB_REPO_NAME=ganggreen-platform
```

### Execution Order

1. **Start with Task 1**: Database schema and migrations
2. **Then Task 2**: GitHub API integration (critical foundation)
3. **Then Tasks 3-8**: Core backend services
4. **Then Tasks 11-18**: UI components
5. **Finally Tasks 19-26**: Integration and polish

### Key Integration Points

**With Existing Governance System**:
- Uses `governanceTokenService.awardTokens()` for distribution
- Tokens appear in user's governance token balance
- Can be used for voting on proposals

**With Existing Gamification**:
- Contributor badges appear in badge gallery
- Rankings appear on leaderboards
- Activity counts toward engagement metrics

## Configuration

### Default Distribution Config
- **Cycle Frequency**: Monthly
- **Token Pool**: 10,000 tokens per cycle
- **Minimum Threshold**: 10 contribution points
- **Max Per Contributor**: 1,000 tokens
- **Weights**: Commits (1x), PRs (3x), Reviews (2x), Docs (1.5x)

### Contribution Scoring Formula
```
raw_score = (commits × 1.0) + (prs_merged × 3.0) + (reviews × 2.0) + (docs_changes × 1.5)
weighted_score = raw_score + (lines_of_code × 0.001)
token_allocation = (weighted_score / total_weighted_score) × token_pool
```

### Priority Score Formula (Feature Suggestions)
```
priority_score = (upvotes × 2.0) + (comments × 0.5) + impact_multiplier + effort_multiplier
```

## Testing

Property-based tests are optional but recommended for:
- Token conservation (sum never exceeds pool)
- Contribution score monotonicity (adding contributions never decreases score)
- Priority score correlation (more upvotes = higher priority)

## Next Steps

1. Review the requirements.md for detailed acceptance criteria
2. Review the design.md for architecture and data models
3. Open tasks.md and click "Start task" on Task 1 to begin implementation

## Questions?

- Check the design.md for detailed component interfaces
- Review existing governance token system in `.kiro/specs/governance-token-system/`
- Look at GG Coin service implementation for similar patterns

## Success Metrics

- All repository contributors have linked GitHub accounts
- Tokens distributed monthly without manual intervention
- Top 10 feature suggestions converted to governance proposals
- 80%+ contributor participation in governance voting
