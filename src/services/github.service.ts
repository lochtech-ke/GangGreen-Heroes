import { supabase } from './supabase';
import {
  GitHubError,
  GitHubErrorCode,
} from '../types/github.types';
import type {
  GitHubUser,
  GitHubCommit,
  GitHubPullRequest,
  GitHubReview,
  GitHubIssue,
  GitHubContributor,
  ProcessedCommit,
  ProcessedPullRequest,
  ProcessedReview,
  ProcessedIssue,
  GitHubAccountLink,
  GitHubServiceResponse,
  ContributionSyncResult,
  GitHubAPIConfig,
  GitHubCache,
  CacheEntry,
  GitHubPaginationParams,
  GitHubPaginatedResponse,
  RepositoryConfig,
} from '../types/github.types';

/**
 * Simple in-memory cache implementation for GitHub API responses
 */
class SimpleGitHubCache implements GitHubCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number = 3600000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * GitHub API Integration Service
 * Handles GitHub API interactions, OAuth authentication, and contribution tracking
 */
class GitHubService {
  private config: GitHubAPIConfig;
  private cache: GitHubCache;
  private repositoryConfig: RepositoryConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://api.github.com',
      apiVersion: '2022-11-28',
      userAgent: 'GangGreen-Platform/1.0',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimit: {
        maxRequests: 5000, // GitHub's rate limit
        windowMs: 3600000, // 1 hour
      },
      cache: {
        ttl: 3600000, // 1 hour
        maxSize: 1000,
      },
    };

    this.cache = new SimpleGitHubCache(this.config.cache.maxSize);

    // Default repository configuration - should be configurable via environment
    this.repositoryConfig = {
      owner: process.env.VITE_GITHUB_REPO_OWNER || 'ganggreen-platform',
      repo: process.env.VITE_GITHUB_REPO_NAME || 'ganggreen-platform',
      default_branch: 'main',
      include_forks: false,
      exclude_bots: true,
      min_commit_size: 1,
      documentation_patterns: [
        '*.md',
        '*.txt',
        'docs/**/*',
        'documentation/**/*',
        'README*',
        'CHANGELOG*',
        'LICENSE*',
      ],
    };
  }

  /**
   * Make authenticated GitHub API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string
  ): Promise<GitHubServiceResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Check cache first for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        console.log(`[GitHubService] Cache hit for ${endpoint}`);
        return { data: cached, error: null };
      }
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': this.config.apiVersion,
        'User-Agent': this.config.userAgent,
        ...((options.headers as Record<string, string>) || {}),
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      // Handle rate limiting
      const rateLimitRemaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0');
      const rateLimitReset = parseInt(response.headers.get('x-ratelimit-reset') || '0');

      if (response.status === 403 && rateLimitRemaining === 0) {
        const resetTime = new Date(rateLimitReset * 1000);
        throw new GitHubError(
          GitHubErrorCode.RATE_LIMIT_EXCEEDED,
          `Rate limit exceeded. Resets at ${resetTime.toISOString()}`,
          { reset: rateLimitReset },
          true
        );
      }

      if (!response.ok) {
        const errorBody = await response.text();
        let errorCode = GitHubErrorCode.API_ERROR;

        switch (response.status) {
          case 401:
            errorCode = GitHubErrorCode.UNAUTHORIZED;
            break;
          case 404:
            errorCode = GitHubErrorCode.NOT_FOUND;
            break;
        }

        throw new GitHubError(
          errorCode,
          `GitHub API error: ${response.status} ${response.statusText}`,
          { status: response.status, body: errorBody },
          response.status >= 500
        );
      }

      const data: T = await response.json();

      // Cache successful GET responses
      if (!options.method || options.method === 'GET') {
        this.cache.set(cacheKey, data, this.config.cache.ttl);
      }

      return {
        data,
        error: null,
        rateLimit: {
          limit: parseInt(response.headers.get('x-ratelimit-limit') || '0'),
          remaining: rateLimitRemaining,
          reset: rateLimitReset,
        },
      };
    } catch (error) {
      if (error instanceof GitHubError) {
        return { data: null, error };
      }

      const gitHubError = new GitHubError(
        GitHubErrorCode.NETWORK_ERROR,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        true
      );

      return { data: null, error: gitHubError };
    }
  }

  /**
   * Get repository contributors with pagination
   */
  async getRepositoryContributors(
    repo?: string,
    pagination?: GitHubPaginationParams
  ): Promise<GitHubServiceResponse<GitHubPaginatedResponse<GitHubContributor>>> {
    const repoPath = repo || `${this.repositoryConfig.owner}/${this.repositoryConfig.repo}`;
    const page = pagination?.page || 1;
    const perPage = pagination?.per_page || 100;

    try {
      const endpoint = `/repos/${repoPath}/contributors?page=${page}&per_page=${perPage}`;
      const response = await this.makeRequest<GitHubUser[]>(endpoint);

      if (response.error) {
        return { data: null, error: response.error };
      }

      // Transform GitHub users to contributors
      const contributors: GitHubContributor[] = response.data!.map(user => ({
        github_username: user.login,
        github_id: user.id,
        avatar_url: user.avatar_url,
        profile_url: user.html_url,
        total_commits: 0, // Will be filled by detailed analysis
        total_prs: 0,
        total_reviews: 0,
        lines_added: 0,
        lines_deleted: 0,
        first_contribution_date: '',
        last_contribution_date: '',
      }));

      return {
        data: {
          data: contributors,
          pagination: {
            page,
            per_page: perPage,
            has_next: response.data!.length === perPage,
            has_prev: page > 1,
          },
        },
        error: null,
        rateLimit: response.rateLimit,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to fetch contributors: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Get commits between dates with pagination
   */
  async getCommitsBetweenDates(
    since: string,
    until: string,
    repo?: string,
    pagination?: GitHubPaginationParams
  ): Promise<GitHubServiceResponse<GitHubPaginatedResponse<ProcessedCommit>>> {
    const repoPath = repo || `${this.repositoryConfig.owner}/${this.repositoryConfig.repo}`;
    const page = pagination?.page || 1;
    const perPage = pagination?.per_page || 100;

    try {
      const endpoint = `/repos/${repoPath}/commits?since=${since}&until=${until}&page=${page}&per_page=${perPage}`;
      const response = await this.makeRequest<GitHubCommit[]>(endpoint);

      if (response.error) {
        return { data: null, error: response.error };
      }

      // Process commits to extract relevant information
      const processedCommits: ProcessedCommit[] = [];

      for (const commit of response.data!) {
        // Get detailed commit info if stats are not included
        let stats = commit.stats;
        if (!stats) {
          const detailResponse = await this.makeRequest<GitHubCommit>(`/repos/${repoPath}/commits/${commit.sha}`);
          if (detailResponse.data?.stats) {
            stats = detailResponse.data.stats;
          }
        }

        const processedCommit: ProcessedCommit = {
          sha: commit.sha,
          author: commit.author?.login || commit.commit.author.name,
          author_email: commit.commit.author.email,
          message: commit.commit.message,
          date: commit.commit.author.date,
          additions: stats?.additions || 0,
          deletions: stats?.deletions || 0,
          files_changed: commit.files?.length || 0,
          is_merge_commit: commit.commit.message.toLowerCase().includes('merge'),
          is_documentation: this.isDocumentationCommit(commit),
        };

        // Filter out bot commits if configured
        if (this.repositoryConfig.exclude_bots && this.isBotCommit(processedCommit)) {
          continue;
        }

        // Filter out commits below minimum size
        if (stats && (stats.additions + stats.deletions) < this.repositoryConfig.min_commit_size) {
          continue;
        }

        processedCommits.push(processedCommit);
      }

      return {
        data: {
          data: processedCommits,
          pagination: {
            page,
            per_page: perPage,
            has_next: response.data!.length === perPage,
            has_prev: page > 1,
          },
        },
        error: null,
        rateLimit: response.rateLimit,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to fetch commits: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Get pull requests between dates with pagination
   */
  async getPullRequestsBetweenDates(
    since: string,
    until: string,
    repo?: string,
    pagination?: GitHubPaginationParams
  ): Promise<GitHubServiceResponse<GitHubPaginatedResponse<ProcessedPullRequest>>> {
    const repoPath = repo || `${this.repositoryConfig.owner}/${this.repositoryConfig.repo}`;
    const page = pagination?.page || 1;
    const perPage = pagination?.per_page || 100;

    try {
      const endpoint = `/repos/${repoPath}/pulls?state=all&sort=updated&direction=desc&page=${page}&per_page=${perPage}`;
      const response = await this.makeRequest<GitHubPullRequest[]>(endpoint);

      if (response.error) {
        return { data: null, error: response.error };
      }

      // Filter PRs by date range and process them
      const processedPRs: ProcessedPullRequest[] = [];

      for (const pr of response.data!) {
        const updatedAt = new Date(pr.updated_at);
        const sinceDate = new Date(since);
        const untilDate = new Date(until);

        // Skip PRs outside date range
        if (updatedAt < sinceDate || updatedAt > untilDate) {
          continue;
        }

        const processedPR: ProcessedPullRequest = {
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          state: pr.merged ? 'merged' : pr.state,
          merged_at: pr.merged_at,
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files: pr.changed_files,
          reviews_count: pr.review_comments,
          is_documentation: this.isDocumentationPR(pr),
        };

        processedPRs.push(processedPR);
      }

      return {
        data: {
          data: processedPRs,
          pagination: {
            page,
            per_page: perPage,
            has_next: response.data!.length === perPage,
            has_prev: page > 1,
          },
        },
        error: null,
        rateLimit: response.rateLimit,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to fetch pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Get reviews by user for a specific time period
   */
  async getReviewsByUser(
    username: string,
    since: string,
    repo?: string
  ): Promise<GitHubServiceResponse<ProcessedReview[]>> {
    const repoPath = repo || `${this.repositoryConfig.owner}/${this.repositoryConfig.repo}`;

    try {
      // First get all PRs in the time period
      const prResponse = await this.getPullRequestsBetweenDates(since, new Date().toISOString(), repo);
      if (prResponse.error || !prResponse.data) {
        return { data: null, error: prResponse.error };
      }

      const reviews: ProcessedReview[] = [];

      // For each PR, get reviews by the specified user
      for (const pr of prResponse.data.data) {
        const reviewsEndpoint = `/repos/${repoPath}/pulls/${pr.number}/reviews`;
        const reviewsResponse = await this.makeRequest<GitHubReview[]>(reviewsEndpoint);

        if (reviewsResponse.data) {
          const userReviews = reviewsResponse.data
            .filter(review => review.user.login === username)
            .filter(review => new Date(review.submitted_at) >= new Date(since))
            .map(review => ({
              id: review.id,
              reviewer: review.user.login,
              pull_request_number: pr.number,
              state: review.state.toLowerCase() as 'approved' | 'changes_requested' | 'commented',
              submitted_at: review.submitted_at,
            }));

          reviews.push(...userReviews);
        }
      }

      return { data: reviews, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Get issues by labels
   */
  async getIssuesByLabel(
    labels: string[],
    repo?: string,
    pagination?: GitHubPaginationParams
  ): Promise<GitHubServiceResponse<GitHubPaginatedResponse<ProcessedIssue>>> {
    const repoPath = repo || `${this.repositoryConfig.owner}/${this.repositoryConfig.repo}`;
    const page = pagination?.page || 1;
    const perPage = pagination?.per_page || 100;
    const labelQuery = labels.join(',');

    try {
      const endpoint = `/repos/${repoPath}/issues?labels=${encodeURIComponent(labelQuery)}&page=${page}&per_page=${perPage}`;
      const response = await this.makeRequest<GitHubIssue[]>(endpoint);

      if (response.error) {
        return { data: null, error: response.error };
      }

      const processedIssues: ProcessedIssue[] = response.data!.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        author: issue.user.login,
        labels: issue.labels.map(label => label.name),
        state: issue.state,
        comments_count: issue.comments,
        reactions_count: issue.reactions.total_count,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      }));

      return {
        data: {
          data: processedIssues,
          pagination: {
            page,
            per_page: perPage,
            has_next: response.data!.length === perPage,
            has_prev: page > 1,
          },
        },
        error: null,
        rateLimit: response.rateLimit,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to fetch issues: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Link GitHub account to platform user
   */
  async linkGitHubAccount(
    userId: string,
    githubToken: string
  ): Promise<GitHubServiceResponse<GitHubAccountLink>> {
    try {
      // First, get user info from GitHub
      const userResponse = await this.makeRequest<GitHubUser>('/user', {}, githubToken);
      if (userResponse.error) {
        return { data: null, error: userResponse.error };
      }

      const githubUser = userResponse.data!;

      // Check if this GitHub account is already linked to another user
      const { data: existingLink } = await supabase
        .from('github_accounts')
        .select('user_id')
        .eq('github_id', githubUser.id)
        .single();

      if (existingLink && existingLink.user_id !== userId) {
        return {
          data: null,
          error: new GitHubError(
            GitHubErrorCode.ACCOUNT_ALREADY_LINKED,
            'This GitHub account is already linked to another user'
          ),
        };
      }

      // Check if user already has a GitHub account linked
      const { data: userLink } = await supabase
        .from('github_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      const linkData = {
        user_id: userId,
        github_username: githubUser.login,
        github_id: githubUser.id,
        github_email: githubUser.email,
        avatar_url: githubUser.avatar_url,
        profile_url: githubUser.html_url,
        access_token_encrypted: this.encryptToken(githubToken), // In production, use proper encryption
        linked_at: new Date().toISOString(),
        last_synced_at: null,
      };

      let result;
      if (userLink) {
        // Update existing link
        result = await supabase
          .from('github_accounts')
          .update(linkData)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new link
        result = await supabase
          .from('github_accounts')
          .insert(linkData)
          .select()
          .single();
      }

      if (result.error) {
        return {
          data: null,
          error: new GitHubError(
            GitHubErrorCode.API_ERROR,
            `Failed to link GitHub account: ${result.error.message}`
          ),
        };
      }

      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to link GitHub account: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Unlink GitHub account from platform user
   */
  async unlinkGitHubAccount(userId: string): Promise<GitHubServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('github_accounts')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return {
          data: null,
          error: new GitHubError(
            GitHubErrorCode.API_ERROR,
            `Failed to unlink GitHub account: ${error.message}`
          ),
        };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Failed to unlink GitHub account: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Sync contributions for all linked GitHub accounts
   */
  async syncAllContributions(
    cycleStartDate: string,
    cycleEndDate: string
  ): Promise<GitHubServiceResponse<ContributionSyncResult>> {
    const startTime = Date.now();
    const result: ContributionSyncResult = {
      commits_processed: 0,
      prs_processed: 0,
      reviews_processed: 0,
      issues_processed: 0,
      contributors_updated: 0,
      errors: [],
      sync_duration_ms: 0,
    };

    try {
      // Get all linked GitHub accounts
      const { data: linkedAccounts, error: accountsError } = await supabase
        .from('github_accounts')
        .select('*');

      if (accountsError) {
        return {
          data: null,
          error: new GitHubError(
            GitHubErrorCode.API_ERROR,
            `Failed to fetch linked accounts: ${accountsError.message}`
          ),
        };
      }

      // Process each linked account
      for (const account of linkedAccounts || []) {
        try {
          
          // Sync commits
          const commitsResponse = await this.getCommitsBetweenDates(
            cycleStartDate,
            cycleEndDate,
            undefined,
            { per_page: 100 }
          );

          if (commitsResponse.data) {
            const userCommits = commitsResponse.data.data.filter(
              commit => commit.author === account.github_username
            );
            result.commits_processed += userCommits.length;
          }

          // Sync PRs
          const prsResponse = await this.getPullRequestsBetweenDates(
            cycleStartDate,
            cycleEndDate,
            undefined,
            { per_page: 100 }
          );

          if (prsResponse.data) {
            const userPRs = prsResponse.data.data.filter(
              pr => pr.author === account.github_username
            );
            result.prs_processed += userPRs.length;
          }

          // Sync reviews
          const reviewsResponse = await this.getReviewsByUser(
            account.github_username,
            cycleStartDate
          );

          if (reviewsResponse.data) {
            result.reviews_processed += reviewsResponse.data.length;
          }

          result.contributors_updated++;

          // Update last synced timestamp
          await supabase
            .from('github_accounts')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', account.id);

        } catch (error) {
          const errorMsg = `Failed to sync ${account.github_username}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          result.errors.push(errorMsg);
          console.error('[GitHubService]', errorMsg);
        }
      }

      result.sync_duration_ms = Date.now() - startTime;
      return { data: result, error: null };

    } catch (error) {
      result.sync_duration_ms = Date.now() - startTime;
      return {
        data: null,
        error: error instanceof GitHubError ? error : new GitHubError(
          GitHubErrorCode.API_ERROR,
          `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Helper methods
   */
  private isDocumentationCommit(commit: GitHubCommit): boolean {
    if (!commit.files) return false;
    
    return commit.files.some(file => 
      this.repositoryConfig.documentation_patterns.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'), 'i');
        return regex.test(file.filename);
      })
    );
  }

  private isDocumentationPR(pr: GitHubPullRequest): boolean {
    const docKeywords = ['doc', 'readme', 'documentation', 'guide', 'tutorial'];
    const title = pr.title.toLowerCase();
    return docKeywords.some(keyword => title.includes(keyword));
  }

  private isBotCommit(commit: ProcessedCommit): boolean {
    const botPatterns = [
      'dependabot',
      'renovate',
      'greenkeeper',
      'snyk-bot',
      'github-actions',
      'bot',
    ];
    
    const author = commit.author.toLowerCase();
    return botPatterns.some(pattern => author.includes(pattern));
  }

  private encryptToken(token: string): string {
    // In production, use proper encryption (AES-256-GCM)
    // For now, just base64 encode (NOT SECURE)
    return Buffer.from(token).toString('base64');
  }



  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: this.config.cache.maxSize,
    };
  }
}

// Export singleton instance
export const githubService = new GitHubService();