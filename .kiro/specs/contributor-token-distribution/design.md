# Contributor Token Distribution System Design

## Overview

The Contributor Token Distribution System automates the allocation of governance tokens to GitHub repository contributors based on their code contributions, and provides a feature suggestion system that converts community-requested improvements into governance proposals. This system extends the existing governance token framework to recognize developer contributions and democratize platform development decisions.

The system operates on two main pillars:
1. **Automated Token Distribution**: Analyzes GitHub activity and awards governance tokens proportional to contribution impact
2. **Feature Suggestion Pipeline**: Converts GitHub issues and community suggestions into votable governance proposals

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Contributor Token Distribution System                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │   GitHub API     │  │   Contribution   │  │     Token        │     │
│  │   Integration    │  │   Analyzer       │  │  Distribution    │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│           │                     │                      │                 │
│           └─────────────────────┴──────────────────────┘                 │
│                                 │                                        │
│           ┌─────────────────────┼─────────────────────┐                 │
│           │                     │                     │                 │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐        │
│  │    Feature      │  │   Distribution  │  │   Recognition   │        │
│  │   Suggestion    │  │    Analytics    │  │     Badges      │        │
│  │     System      │  │                 │  │                 │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   ┌────▼────┐          ┌───────▼────────┐      ┌───────▼────────┐
   │ GitHub  │          │   Supabase     │      │   Governance   │
   │   API   │          │   Database     │      │  Token System  │
   └─────────┘          └────────────────┘      └────────────────┘
```

### Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **External APIs**: GitHub REST API v3, GitHub GraphQL API v4
- **Authentication**: GitHub OAuth for account linking
- **State Management**: React Context API
- **Real-time Updates**: Supabase real-time subscriptions
- **Cron Jobs**: Supabase Edge Functions with scheduled triggers
- **Analytics**: Custom analytics dashboard with Chart.js

## Components and Interfaces

### 1. GitHub API Integration Component

**Purpose**: Interfaces with GitHub API to fetch repository activity and contributor data.

**Key Interfaces**:

```typescript
interface GitHubContributor {
  github_username: string;
  github_id: number;
  avatar_url: string;
  profile_url: string;
  total_commits: number;
  total_prs: number;
  total_reviews: number;
  lines_added: number;
  lines_deleted: number;
  first_contribution_date: string;
  last_contribution_date: string;
}

interface GitHubCommit {
  sha: string;
  author: string;
  message: string;
  date: string;
  additions: number;
  deletions: number;
  files_changed: number;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  merged_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  reviews_count: number;
}

interface GitHubReview {
  id: number;
  reviewer: string;
  pull_request_number: number;
  state: 'approved' | 'changes_requested' | 'commented';
  submitted_at: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  author: string;
  labels: string[];
  state: 'open' | 'closed';
  comments_count: number;
  reactions_count: number;
  created_at: string;
  updated_at: string;
}
```

**Service Methods**:

```typescript
class GitHubService {
  async getRepositoryContributors(repo: string): Promise<GitHubContributor[]>
  async getCommitsBetweenDates(repo: string, since: string, until: string): Promise<GitHubCommit[]>
  async getPullRequestsBetweenDates(repo: string, since: string, until: string): Promise<GitHubPullRequest[]>
  async getReviewsByUser(repo: string, username: string, since: string): Promise<GitHubReview[]>
  async getIssuesByLabel(repo: string, labels: string[]): Promise<GitHubIssue[]>
  async linkGitHubAccount(userId: string, githubToken: string): Promise<void>
  async unlinkGitHubAccount(userId: string): Promise<void>
}
```

### 2. Contribution Analyzer Component

**Purpose**: Calculates contribution scores and determines token allocation.

**Key Interfaces**:

```typescript
interface ContributionScore {
  user_id: string;
  github_username: string;
  cycle_id: string;
  commits_count: number;
  prs_merged_count: number;
  reviews_count: number;
  lines_added: number;
  lines_deleted: number;
  documentation_changes: number;
  raw_score: number;
  weighted_score: number;
  token_allocation: number;
  rank: number;
  calculated_at: string;
}

interface ContributionWeights {
  commit_weight: number;
  pr_merged_weight: number;
  review_weight: number;
  documentation_weight: number;
  lines_of_code_multiplier: number;
}

interface DistributionCycle {
  id: string;
  cycle_number: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'calculating' | 'completed' | 'distributed';
  total_token_pool: number;
  tokens_distributed: number;
  contributors_count: number;
  created_at: string;
  completed_at: string | null;
}
```

**Service Methods**:

```typescript
class ContributionAnalyzerService {
  async calculateContributionScore(userId: string, cycleId: string): Promise<ContributionScore>
  async analyzeAllContributors(cycleId: string): Promise<ContributionScore[]>
  async applyContributionWeights(rawScore: number, weights: ContributionWeights): Promise<number>
  async detectSuspiciousActivity(userId: string, cycleId: string): Promise<boolean>
  async getRankings(cycleId: string): Promise<ContributionScore[]>
}
```

### 3. Token Distribution Component

**Purpose**: Manages the actual distribution of governance tokens to contributors.

**Key Interfaces**:

```typescript
interface TokenDistribution {
  id: string;
  cycle_id: string;
  user_id: string;
  github_username: string;
  tokens_awarded: number;
  contribution_score: number;
  distribution_type: 'automated' | 'manual_bonus';
  justification: string | null;
  distributed_by: string | null;
  distributed_at: string;
}

interface DistributionConfig {
  id: string;
  cycle_frequency: 'weekly' | 'monthly' | 'quarterly';
  token_pool_per_cycle: number;
  minimum_contribution_threshold: number;
  max_tokens_per_contributor: number;
  contribution_weights: ContributionWeights;
  is_active: boolean;
  updated_at: string;
}

interface ManualTokenAward {
  id: string;
  user_id: string;
  tokens_awarded: number;
  awarded_by: string;
  justification: string;
  category: 'architecture' | 'mentorship' | 'documentation' | 'community' | 'other';
  awarded_at: string;
}
```

**Service Methods**:

```typescript
class TokenDistributionService {
  async distributeTokensForCycle(cycleId: string): Promise<TokenDistribution[]>
  async awardManualBonus(award: ManualTokenAward): Promise<void>
  async getDistributionHistory(userId: string): Promise<TokenDistribution[]>
  async getDistributionConfig(): Promise<DistributionConfig>
  async updateDistributionConfig(config: Partial<DistributionConfig>): Promise<void>
  async calculateTokenAllocation(scores: ContributionScore[], tokenPool: number): Promise<Map<string, number>>
}
```

### 4. Feature Suggestion System Component

**Purpose**: Manages feature suggestions and converts them to governance proposals.

**Key Interfaces**:

```typescript
interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'ui_ux' | 'backend' | 'blockchain' | 'gamification' | 'performance' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'under_consideration' | 'approved_for_voting' | 'declined' | 'converted';
  created_by: string;
  github_issue_number: number | null;
  github_issue_url: string | null;
  upvotes_count: number;
  comments_count: number;
  priority_score: number;
  estimated_effort: 'small' | 'medium' | 'large' | 'extra_large';
  expected_impact: 'low' | 'medium' | 'high' | 'critical';
  converted_proposal_id: string | null;
  created_at: string;
  updated_at: string;
}

interface FeatureSuggestionUpvote {
  id: string;
  suggestion_id: string;
  user_id: string;
  created_at: string;
}

interface FeatureSuggestionComment {
  id: string;
  suggestion_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}
```

**Service Methods**:

```typescript
class FeatureSuggestionService {
  async createSuggestion(suggestion: Partial<FeatureSuggestion>): Promise<FeatureSuggestion>
  async upvoteSuggestion(suggestionId: string, userId: string): Promise<void>
  async removeUpvote(suggestionId: string, userId: string): Promise<void>
  async calculatePriorityScore(suggestionId: string): Promise<number>
  async convertToProposal(suggestionId: string): Promise<string>
  async syncWithGitHubIssues(): Promise<void>
  async createGitHubIssue(suggestionId: string): Promise<number>
  async updateSuggestionStatus(suggestionId: string, status: string, justification?: string): Promise<void>
  async getSuggestionsByPriority(limit: number): Promise<FeatureSuggestion[]>
}
```

### 5. Distribution Analytics Component

**Purpose**: Provides insights and analytics on token distribution patterns.

**Key Interfaces**:

```typescript
interface DistributionAnalytics {
  cycle_id: string;
  total_tokens_distributed: number;
  contributors_count: number;
  average_tokens_per_contributor: number;
  median_tokens: number;
  std_deviation: number;
  top_contributors: Array<{
    user_id: string;
    github_username: string;
    tokens_earned: number;
    rank: number;
  }>;
  distribution_by_activity: {
    commits: number;
    pull_requests: number;
    reviews: number;
    documentation: number;
  };
}

interface ContributorProfile {
  user_id: string;
  github_username: string;
  github_id: number;
  avatar_url: string;
  total_tokens_earned: number;
  cycles_participated: number;
  total_commits: number;
  total_prs_merged: number;
  total_reviews: number;
  badges_earned: string[];
  current_rank: number;
  joined_at: string;
}
```

**Service Methods**:

```typescript
class DistributionAnalyticsService {
  async getAnalyticsForCycle(cycleId: string): Promise<DistributionAnalytics>
  async getTopContributors(cycleId: string, limit: number): Promise<ContributorProfile[]>
  async getContributorProfile(userId: string): Promise<ContributorProfile>
  async exportDistributionData(cycleId: string): Promise<string>
  async getDistributionTrends(cycles: number): Promise<any>
}
```

### 6. Recognition Badges Component

**Purpose**: Awards and manages contributor recognition badges.

**Key Interfaces**:

```typescript
interface ContributorBadge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  criteria_type: 'commits' | 'prs' | 'reviews' | 'tokens' | 'special';
  criteria_threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  is_showcased: boolean;
}
```

**Service Methods**:

```typescript
class BadgeService {
  async checkAndAwardBadges(userId: string): Promise<UserBadge[]>
  async getUserBadges(userId: string): Promise<UserBadge[]>
  async showcaseBadge(userId: string, badgeId: string): Promise<void>
  async getBadgeProgress(userId: string, badgeId: string): Promise<number>
}
```

## Data Models

### Database Schema

```sql
-- GitHub account linking
CREATE TABLE github_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  github_username VARCHAR(100) NOT NULL,
  github_id BIGINT NOT NULL UNIQUE,
  github_email VARCHAR(255),
  avatar_url TEXT,
  profile_url TEXT,
  access_token_encrypted TEXT,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE
);

-- Distribution cycles
CREATE TABLE distribution_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_number INTEGER NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculating', 'completed', 'distributed')),
  total_token_pool INTEGER NOT NULL,
  tokens_distributed INTEGER DEFAULT 0,
  contributors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Contribution scores
CREATE TABLE contribution_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(100) NOT NULL,
  cycle_id UUID REFERENCES distribution_cycles(id) ON DELETE CASCADE,
  commits_count INTEGER DEFAULT 0,
  prs_merged_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  documentation_changes INTEGER DEFAULT 0,
  raw_score DECIMAL(10, 2) DEFAULT 0,
  weighted_score DECIMAL(10, 2) DEFAULT 0,
  token_allocation INTEGER DEFAULT 0,
  rank INTEGER,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cycle_id)
);

-- Token distributions
CREATE TABLE token_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES distribution_cycles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(100) NOT NULL,
  tokens_awarded INTEGER NOT NULL,
  contribution_score DECIMAL(10, 2) NOT NULL,
  distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('automated', 'manual_bonus')),
  justification TEXT,
  distributed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cycle_id, user_id, distribution_type)
);

-- Distribution configuration
CREATE TABLE distribution_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_frequency VARCHAR(20) NOT NULL CHECK (cycle_frequency IN ('weekly', 'monthly', 'quarterly')),
  token_pool_per_cycle INTEGER NOT NULL,
  minimum_contribution_threshold INTEGER NOT NULL DEFAULT 10,
  max_tokens_per_contributor INTEGER NOT NULL DEFAULT 1000,
  commit_weight DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  pr_merged_weight DECIMAL(5, 2) NOT NULL DEFAULT 3.0,
  review_weight DECIMAL(5, 2) NOT NULL DEFAULT 2.0,
  documentation_weight DECIMAL(5, 2) NOT NULL DEFAULT 1.5,
  lines_of_code_multiplier DECIMAL(5, 4) NOT NULL DEFAULT 0.001,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Manual token awards
CREATE TABLE manual_token_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tokens_awarded INTEGER NOT NULL,
  awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  justification TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('architecture', 'mentorship', 'documentation', 'community', 'other')),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature suggestions
CREATE TABLE feature_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ui_ux', 'backend', 'blockchain', 'gamification', 'performance', 'other')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_consideration', 'approved_for_voting', 'declined', 'converted')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  github_issue_number INTEGER,
  github_issue_url TEXT,
  upvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  priority_score DECIMAL(10, 2) DEFAULT 0,
  estimated_effort VARCHAR(20) CHECK (estimated_effort IN ('small', 'medium', 'large', 'extra_large')),
  expected_impact VARCHAR(20) CHECK (expected_impact IN ('low', 'medium', 'high', 'critical')),
  converted_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  decline_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature suggestion upvotes
CREATE TABLE feature_suggestion_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID REFERENCES feature_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- Feature suggestion comments
CREATE TABLE feature_suggestion_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID REFERENCES feature_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contributor badges
CREATE TABLE contributor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('commits', 'prs', 'reviews', 'tokens', 'special')),
  criteria_threshold INTEGER NOT NULL,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES contributor_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_showcased BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);
```

### Indexes

```sql
CREATE INDEX idx_github_accounts_user ON github_accounts(user_id);
CREATE INDEX idx_github_accounts_username ON github_accounts(github_username);
CREATE INDEX idx_distribution_cycles_status ON distribution_cycles(status);
CREATE INDEX idx_distribution_cycles_dates ON distribution_cycles(start_date, end_date);
CREATE INDEX idx_contribution_scores_cycle ON contribution_scores(cycle_id);
CREATE INDEX idx_contribution_scores_user ON contribution_scores(user_id);
CREATE INDEX idx_contribution_scores_rank ON contribution_scores(rank);
CREATE INDEX idx_token_distributions_cycle ON token_distributions(cycle_id);
CREATE INDEX idx_token_distributions_user ON token_distributions(user_id);
CREATE INDEX idx_feature_suggestions_status ON feature_suggestions(status);
CREATE INDEX idx_feature_suggestions_priority_score ON feature_suggestions(priority_score DESC);
CREATE INDEX idx_feature_suggestion_upvotes_suggestion ON feature_suggestion_upvotes(suggestion_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Token Conservation

*For any* distribution cycle, the sum of all tokens awarded to contributors should never exceed the configured token pool for that cycle.

**Validates: Requirements 1.3, 2.1**

### Property 2: Contribution Score Monotonicity

*For any* contributor, adding more commits, PRs, or reviews should never decrease their contribution score within the same cycle.

**Validates: Requirements 1.2**

### Property 3: GitHub Account Uniqueness

*For any* two platform users, they cannot be linked to the same GitHub account simultaneously.

**Validates: Requirements 9.2, 9.3**

### Property 4: Distribution Cycle Non-Overlap

*For any* two distribution cycles, their date ranges should not overlap.

**Validates: Requirements 2.4**

### Property 5: Priority Score Correlation

*For any* feature suggestion, increasing upvotes or comments should never decrease its priority score.

**Validates: Requirements 5.2, 6.3**

### Property 6: Badge Award Idempotence

*For any* contributor who meets badge criteria, awarding the badge multiple times should result in only one badge record.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 7: Manual Award Justification

*For any* manual token award, there must exist a non-empty justification string.

**Validates: Requirements 4.2**

### Property 8: Suspicious Activity Detection

*For any* contributor whose contribution metrics exceed 3 standard deviations from the mean, the system should flag their activity for review.

**Validates: Requirements 14.3**

### Property 9: Feature Suggestion Conversion

*For any* feature suggestion that is converted to a proposal, the original suggestion should be marked as 'converted' and linked to the proposal ID.

**Validates: Requirements 5.4, 12.4**

### Property 10: Token Distribution Completeness

*For any* completed distribution cycle, every contributor with a contribution score above the minimum threshold should have a corresponding token distribution record.

**Validates: Requirements 1.5, 2.3**

## Error Handling

### Error Types

```typescript
enum ContributorErrorCode {
  // GitHub Integration Errors
  GITHUB_API_ERROR = 'GITHUB_API_ERROR',
  GITHUB_ACCOUNT_NOT_LINKED = 'GITHUB_ACCOUNT_NOT_LINKED',
  GITHUB_ACCOUNT_ALREADY_LINKED = 'GITHUB_ACCOUNT_ALREADY_LINKED',
  INVALID_GITHUB_TOKEN = 'INVALID_GITHUB_TOKEN',
  
  // Distribution Errors
  CYCLE_NOT_FOUND = 'CYCLE_NOT_FOUND',
  CYCLE_ALREADY_COMPLETED = 'CYCLE_ALREADY_COMPLETED',
  INSUFFICIENT_TOKEN_POOL = 'INSUFFICIENT_TOKEN_POOL',
  DISTRIBUTION_IN_PROGRESS = 'DISTRIBUTION_IN_PROGRESS',
  
  // Contribution Errors
  BELOW_MINIMUM_THRESHOLD = 'BELOW_MINIMUM_THRESHOLD',
  SUSPICIOUS_ACTIVITY_DETECTED = 'SUSPICIOUS_ACTIVITY_DETECTED',
  INVALID_CONTRIBUTION_DATA = 'INVALID_CONTRIBUTION_DATA',
  
  // Feature Suggestion Errors
  SUGGESTION_NOT_FOUND = 'SUGGESTION_NOT_FOUND',
  ALREADY_UPVOTED = 'ALREADY_UPVOTED',
  CANNOT_CONVERT_SUGGESTION = 'CANNOT_CONVERT_SUGGESTION',
  GITHUB_ISSUE_CREATION_FAILED = 'GITHUB_ISSUE_CREATION_FAILED',
  
  // Badge Errors
  BADGE_NOT_FOUND = 'BADGE_NOT_FOUND',
  BADGE_ALREADY_EARNED = 'BADGE_ALREADY_EARNED',
  CRITERIA_NOT_MET = 'CRITERIA_NOT_MET',
  
  // Authorization Errors
  UNAUTHORIZED_ADMIN_ACTION = 'UNAUTHORIZED_ADMIN_ACTION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

class ContributorError extends Error {
  constructor(
    public code: ContributorErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ContributorError';
  }
}
```

### Error Handling Strategy

1. **GitHub API Errors**: Implement exponential backoff retry logic with rate limit handling
2. **Distribution Errors**: Validate cycle status before operations, provide clear error messages
3. **Suspicious Activity**: Flag for review rather than blocking, notify administrators
4. **Feature Suggestions**: Gracefully handle GitHub API failures, queue for retry
5. **Badge Awards**: Silently skip if already earned, log for debugging

## Testing Strategy

### Unit Tests

- Token allocation calculations with various contribution scores
- Priority score calculations for feature suggestions
- Contribution weight application logic
- Badge criteria evaluation
- GitHub API response parsing
- Suspicious activity detection algorithm

### Integration Tests

- End-to-end distribution cycle execution
- GitHub OAuth account linking flow
- Feature suggestion to proposal conversion
- Real-time upvote synchronization
- Badge award triggers
- Manual token award workflow

### Property-Based Tests

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based testing.

Each property-based test should run a minimum of 100 iterations.

**Property Test 1: Token Conservation**
- Generate random contribution scores and token pool
- Calculate token allocations
- Verify sum never exceeds pool
- **Validates: Requirements 1.3, 2.1**

**Property Test 2: Contribution Score Monotonicity**
- Generate random initial contribution data
- Add random positive contributions
- Verify score never decreases
- **Validates: Requirements 1.2**

**Property Test 3: Priority Score Correlation**
- Generate random feature suggestions
- Add random upvotes/comments
- Verify priority score increases or stays same
- **Validates: Requirements 5.2, 6.3**

## UI Components

### 1. Contributor Dashboard

**Purpose**: Display contributor's token earnings, contribution history, and rankings.

**Features**:
- Current cycle progress with projected token allocation
- Historical earnings chart across cycles
- Contribution breakdown (commits, PRs, reviews)
- Current rank and percentile
- Badge showcase
- GitHub account linking status

### 2. Distribution Analytics Dashboard (Admin)

**Purpose**: Provide administrators with insights into token distribution.

**Features**:
- Total tokens distributed per cycle
- Top 10 contributors leaderboard
- Distribution metrics (average, median, std deviation)
- Contribution type breakdown chart
- Flagged activity review queue
- Export data to CSV

### 3. Feature Suggestion Board

**Purpose**: Display and manage community feature suggestions.

**Features**:
- Grid/list view of suggestions
- Filter by category, priority, status
- Sort by priority score, upvotes, date
- Upvote button with real-time count
- Comment thread
- "Suggest Feature" button

### 4. Create Feature Suggestion Form

**Purpose**: Allow users to submit new feature suggestions.

**Features**:
- Title and description fields
- Category dropdown
- Expected impact selector
- Estimated effort selector
- Preview before submission
- Auto-create GitHub issue option

### 5. Voting Queue

**Purpose**: Display features ready for governance voting.

**Features**:
- Grouped by category
- Show estimated effort and impact
- Display community support metrics
- Active voting status indicator
- "Vote Now" call-to-action
- Time remaining for active votes

### 6. Manual Token Award Interface (Admin)

**Purpose**: Allow administrators to award bonus tokens.

**Features**:
- User search/select
- Token amount input
- Category dropdown
- Justification text area
- Preview award summary
- Confirmation dialog

### 7. Badge Gallery

**Purpose**: Display available badges and user's earned badges.

**Features**:
- Grid of all badges with rarity indicators
- Progress bars for unearned badges
- Earned badges highlighted
- Showcase toggle for profile display
- Badge details modal

### 8. GitHub Account Linking

**Purpose**: Connect platform account to GitHub.

**Features**:
- OAuth connection button
- Display linked account info
- Unlink option
- Contribution sync status
- Last synced timestamp

## Real-time Features

### Supabase Real-time Subscriptions

```typescript
// Subscribe to contribution score updates
supabase
  .channel('contribution-scores')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'contribution_scores',
    filter: `user_id=eq.${userId}`
  }, handleScoreUpdate)
  .subscribe();

// Subscribe to feature suggestion upvotes
supabase
  .channel('suggestion-upvotes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'feature_suggestion_upvotes',
    filter: `suggestion_id=eq.${suggestionId}`
  }, handleUpvoteUpdate)
  .subscribe();

// Subscribe to distribution cycle status
supabase
  .channel('distribution-cycles')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'distribution_cycles'
  }, handleCycleUpdate)
  .subscribe();
```

## Scheduled Jobs

### Supabase Edge Functions with Cron

```typescript
// Daily GitHub sync (runs at 2 AM UTC)
Deno.cron("sync-github-contributions", "0 2 * * *", async () => {
  await syncGitHubContributions();
});

// Monthly distribution cycle (runs on 1st of month at 3 AM UTC)
Deno.cron("run-distribution-cycle", "0 3 1 * *", async () => {
  await runDistributionCycle();
});

// Hourly feature suggestion sync (runs every hour)
Deno.cron("sync-github-issues", "0 * * * *", async () => {
  await syncGitHubIssues();
});

// Daily badge check (runs at 4 AM UTC)
Deno.cron("check-badge-awards", "0 4 * * *", async () => {
  await checkAndAwardBadges();
});
```

## Security Considerations

1. **GitHub Token Security**: Store access tokens encrypted, never expose in client
2. **Admin Actions**: Require elevated permissions for manual awards and config changes
3. **Rate Limiting**: Implement rate limits on GitHub API calls to avoid quota exhaustion
4. **Audit Trail**: Log all manual token awards and configuration changes
5. **Suspicious Activity**: Flag but don't auto-block to prevent false positives
6. **OAuth Security**: Use state parameter and PKCE for GitHub OAuth flow
7. **Data Privacy**: Don't expose contributor emails without consent

## Performance Optimization

1. **Caching**: Cache GitHub API responses for 1 hour to reduce API calls
2. **Batch Processing**: Process contributions in batches during distribution cycles
3. **Indexing**: Database indexes on frequently queried fields (user_id, cycle_id, status)
4. **Pagination**: Paginate contributor lists and suggestion boards
5. **Lazy Loading**: Load contribution details on demand
6. **Background Jobs**: Run heavy calculations (distribution cycles) as background jobs
7. **Real-time Throttling**: Debounce real-time updates to prevent UI thrashing

## Integration with Existing Systems

### Governance Token System Integration

- Use existing `governanceTokenService.awardTokens()` for token distribution
- Leverage existing token transaction logging
- Display contributor tokens alongside earned tokens in profile
- Separate transaction source: `'github_contribution'`

### Gamification Integration

- Contributor badges displayed in badge gallery
- Contribution activity counts toward engagement metrics
- Leaderboard includes contributor rankings
- Achievements for milestone contributions

### Notification Integration

- Notify contributors when tokens are distributed
- Alert on badge awards
- Notify when feature suggestion is converted to proposal
- Alert administrators of flagged suspicious activity
- Notify suggestion authors of status changes

## Initial Feature Suggestions for Voting

Based on the existing platform and common needs, here are suggested features that should be put to governance voting:

### Critical Priority

1. **Mobile App Development**: Native iOS/Android apps for better mobile experience
2. **Offline Mode**: Allow users to view content and queue actions offline
3. **Multi-language Support**: Internationalization for African languages (Swahili, Amharic, etc.)

### High Priority

4. **Advanced Analytics Dashboard**: Enhanced metrics and visualizations for impact tracking
5. **Carbon Credit Verification API**: Third-party API for automated carbon credit verification
6. **Community Forums**: Dedicated discussion forums for each forest/initiative
7. **Volunteer Matching System**: AI-powered matching of volunteers to initiatives
8. **Impact Report Generator**: Automated PDF reports for organizations

### Medium Priority

9. **Social Media Integration**: Direct sharing to Twitter, Facebook, Instagram
10. **Email Digest System**: Weekly/monthly email summaries of platform activity
11. **Donation Receipts**: Automated tax receipt generation for donations
12. **Initiative Templates**: Pre-built templates for common initiative types
13. **Gamification Enhancements**: New achievement types and challenges

### Low Priority

14. **Dark Mode**: Platform-wide dark theme option
15. **Accessibility Improvements**: Enhanced screen reader support and keyboard navigation
16. **Custom Profile Themes**: Allow users to customize their profile appearance
17. **Badge Trading System**: Allow users to trade or gift badges
18. **Virtual Forest Tours**: 360° virtual tours of pilot forests

These suggestions should be seeded into the feature_suggestions table and made available for community upvoting and eventual governance voting.
