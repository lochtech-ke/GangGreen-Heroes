/**
 * GitHub API Integration Types
 * Types for GitHub API responses and contributor data
 */

// GitHub API Response Types
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  default_branch: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: GitHubUser | null;
  committer: GitHubUser | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed';
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  review_comments: number;
  comments: number;
}

export interface GitHubReview {
  id: number;
  user: GitHubUser;
  body: string | null;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
  submitted_at: string;
  pull_request_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  comments: number;
  reactions: {
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
    total_count: number;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// Contributor Data Types
export interface GitHubContributor {
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

export interface ProcessedCommit {
  sha: string;
  author: string;
  author_email: string;
  message: string;
  date: string;
  additions: number;
  deletions: number;
  files_changed: number;
  is_merge_commit: boolean;
  is_documentation: boolean;
}

export interface ProcessedPullRequest {
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  merged_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  reviews_count: number;
  is_documentation: boolean;
}

export interface ProcessedReview {
  id: number;
  reviewer: string;
  pull_request_number: number;
  state: 'approved' | 'changes_requested' | 'commented';
  submitted_at: string;
}

export interface ProcessedIssue {
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

// GitHub Account Linking Types
export interface GitHubAccountLink {
  id: string;
  user_id: string;
  github_username: string;
  github_id: number;
  github_email: string | null;
  avatar_url: string;
  profile_url: string;
  access_token_encrypted: string;
  linked_at: string;
  last_synced_at: string | null;
}

export interface GitHubOAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string[];
}

export interface GitHubOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

// API Configuration Types
export interface GitHubAPIConfig {
  baseUrl: string;
  apiVersion: string;
  userAgent: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  cache: {
    ttl: number; // Time to live in milliseconds
    maxSize: number;
  };
}

// Service Response Types
export interface GitHubServiceResponse<T = any> {
  data: T | null;
  error: Error | null;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export interface ContributionSyncResult {
  commits_processed: number;
  prs_processed: number;
  reviews_processed: number;
  issues_processed: number;
  contributors_updated: number;
  errors: string[];
  sync_duration_ms: number;
}

// Error Types
export enum GitHubErrorCode {
  API_ERROR = 'GITHUB_API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_TOKEN = 'INVALID_TOKEN',
  ACCOUNT_NOT_LINKED = 'ACCOUNT_NOT_LINKED',
  ACCOUNT_ALREADY_LINKED = 'ACCOUNT_ALREADY_LINKED',
  OAUTH_ERROR = 'OAUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
}

export class GitHubError extends Error {
  constructor(
    public code: GitHubErrorCode,
    message: string,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface GitHubCache {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  size(): number;
}

// Pagination Types
export interface GitHubPaginationParams {
  page?: number;
  per_page?: number;
}

export interface GitHubPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total_count?: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Repository Configuration
export interface RepositoryConfig {
  owner: string;
  repo: string;
  default_branch: string;
  include_forks: boolean;
  exclude_bots: boolean;
  min_commit_size: number; // Minimum lines changed to count as significant
  documentation_patterns: string[]; // File patterns that count as documentation
}