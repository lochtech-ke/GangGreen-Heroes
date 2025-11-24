/**
 * Contribution Analyzer Types
 * Types for analyzing GitHub contributions and calculating scores
 */

// Contribution Score Types
export interface ContributionScore {
  id: string;
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
  is_flagged: boolean;
  flag_reason: string | null;
  calculated_at: string;
}

export interface ContributionScoreRow {
  id: string;
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
  rank: number | null;
  is_flagged: boolean;
  flag_reason: string | null;
  calculated_at: string;
}

// Contribution Weights Configuration
export interface ContributionWeights {
  commit_weight: number;
  pr_merged_weight: number;
  review_weight: number;
  documentation_weight: number;
  lines_of_code_multiplier: number;
}

// Distribution Cycle Types
export interface DistributionCycle {
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

export interface DistributionCycleRow {
  id: string;
  cycle_number: number;
  start_date: string;
  end_date: string;
  status: string;
  total_token_pool: number;
  tokens_distributed: number;
  contributors_count: number;
  created_at: string;
  completed_at: string | null;
}

// Raw Contribution Data
export interface RawContributionData {
  user_id: string;
  github_username: string;
  commits: Array<{
    sha: string;
    message: string;
    additions: number;
    deletions: number;
    is_documentation: boolean;
    is_merge_commit: boolean;
    date: string;
  }>;
  pull_requests: Array<{
    number: number;
    title: string;
    state: 'merged' | 'closed' | 'open';
    additions: number;
    deletions: number;
    is_documentation: boolean;
    merged_at: string | null;
  }>;
  reviews: Array<{
    id: number;
    pull_request_number: number;
    state: 'approved' | 'changes_requested' | 'commented';
    submitted_at: string;
  }>;
}

// Analysis Results
export interface ContributionAnalysis {
  user_id: string;
  github_username: string;
  cycle_id: string;
  metrics: {
    total_commits: number;
    significant_commits: number; // Excluding merge commits and minimal changes
    total_prs: number;
    merged_prs: number;
    total_reviews: number;
    approved_reviews: number;
    lines_added: number;
    lines_deleted: number;
    net_lines: number;
    documentation_commits: number;
    documentation_prs: number;
  };
  scores: {
    commit_score: number;
    pr_score: number;
    review_score: number;
    documentation_score: number;
    lines_of_code_score: number;
    raw_total: number;
    weighted_total: number;
  };
  flags: {
    is_suspicious: boolean;
    reasons: string[];
    deviation_from_mean: number;
  };
}

// Suspicious Activity Detection
export interface SuspiciousActivityPattern {
  pattern_type: 'commit_spam' | 'artificial_pr_splitting' | 'whitespace_only' | 'statistical_outlier';
  description: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
}

export interface SuspiciousActivityResult {
  user_id: string;
  github_username: string;
  is_flagged: boolean;
  patterns_detected: SuspiciousActivityPattern[];
  statistical_analysis: {
    commits_z_score: number;
    prs_z_score: number;
    reviews_z_score: number;
    lines_z_score: number;
    overall_z_score: number;
  };
  recommendation: 'approve' | 'review' | 'reject';
}

// Ranking and Leaderboard
export interface ContributorRanking {
  rank: number;
  user_id: string;
  github_username: string;
  avatar_url: string | null;
  weighted_score: number;
  token_allocation: number;
  percentile: number;
  badges_earned: string[];
}

export interface CycleStatistics {
  cycle_id: string;
  total_contributors: number;
  total_commits: number;
  total_prs: number;
  total_reviews: number;
  total_lines_changed: number;
  average_score: number;
  median_score: number;
  std_deviation: number;
  top_contributor: {
    user_id: string;
    github_username: string;
    score: number;
  };
}

// Service Response Types
export interface ContributionAnalyzerResponse<T = any> {
  data: T | null;
  error: Error | null;
  metadata?: {
    cycle_id?: string;
    contributors_processed?: number;
    processing_time_ms?: number;
    flags_raised?: number;
  };
}

// Configuration Types
export interface AnalyzerConfig {
  suspicious_activity: {
    z_score_threshold: number; // Standard deviations from mean
    min_commits_for_analysis: number;
    whitespace_only_threshold: number; // Percentage of commits that are whitespace-only
    commit_spam_threshold: number; // Commits per hour threshold
    pr_splitting_threshold: number; // Minimum lines per PR
  };
  scoring: {
    min_lines_for_significant_commit: number;
    max_score_per_activity_type: number;
    documentation_bonus_multiplier: number;
  };
  performance: {
    batch_size: number;
    max_concurrent_analyses: number;
    cache_ttl_minutes: number;
  };
}

// Error Types
export enum ContributionAnalyzerErrorCode {
  CYCLE_NOT_FOUND = 'CYCLE_NOT_FOUND',
  INVALID_CYCLE_STATUS = 'INVALID_CYCLE_STATUS',
  GITHUB_DATA_UNAVAILABLE = 'GITHUB_DATA_UNAVAILABLE',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export class ContributionAnalyzerError extends Error {
  constructor(
    public code: ContributionAnalyzerErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ContributionAnalyzerError';
  }
}

// Batch Processing Types
export interface BatchAnalysisJob {
  id: string;
  cycle_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_contributors: number;
  processed_contributors: number;
  failed_contributors: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface BatchAnalysisProgress {
  job_id: string;
  progress_percentage: number;
  current_contributor: string | null;
  estimated_completion: string | null;
  errors: string[];
}