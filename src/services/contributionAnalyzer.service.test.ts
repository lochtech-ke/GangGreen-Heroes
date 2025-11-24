import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contributionAnalyzerService } from './contributionAnalyzer.service';
import { supabase } from './supabase';
import { githubService } from './github.service';
// import { ContributionAnalyzerErrorCode } from '../types/contributionAnalyzer.types';

// Mock dependencies
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(() => ({
          eq: vi.fn(() => ({})),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    rpc: vi.fn(),
  },
}));

vi.mock('./github.service', () => ({
  githubService: {
    getCommitsBetweenDates: vi.fn(),
    getPullRequestsBetweenDates: vi.fn(),
    getReviewsByUser: vi.fn(),
  },
}));

describe('ContributionAnalyzerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateContributionScore', () => {
    it('should calculate contribution score successfully', async () => {
      const userId = 'user-123';
      const cycleId = 'cycle-456';

      // Mock cycle data
      const mockCycle = {
        id: cycleId,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
        status: 'calculating',
      };

      // Mock GitHub account
      const mockGitHubAccount = {
        user_id: userId,
        github_username: 'testuser',
        github_id: 123,
      };

      // Mock GitHub data
      const mockCommits = {
        data: {
          data: [
            {
              sha: 'abc123',
              author: 'testuser',
              message: 'Add feature',
              additions: 10,
              deletions: 5,
              is_documentation: false,
              is_merge_commit: false,
              date: '2024-01-15T10:00:00Z',
            },
          ],
        },
        error: null,
      };

      const mockPRs = {
        data: {
          data: [
            {
              number: 1,
              author: 'testuser',
              title: 'Feature PR',
              state: 'merged' as const,
              additions: 20,
              deletions: 10,
              is_documentation: false,
              merged_at: '2024-01-16T10:00:00Z',
            },
          ],
        },
        error: null,
      };

      const mockReviews = {
        data: [
          {
            id: 1,
            reviewer: 'testuser',
            pull_request_number: 2,
            state: 'approved' as const,
            submitted_at: '2024-01-17T10:00:00Z',
          },
        ],
        error: null,
      };

      // Mock distribution config
      const mockConfig = {
        commit_weight: 1.0,
        pr_merged_weight: 3.0,
        review_weight: 2.0,
        documentation_weight: 1.5,
        lines_of_code_multiplier: 0.001,
        is_active: true,
      };

      // Setup mocks
      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockCycle, error: null }),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockGitHubAccount, error: null }),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockConfig, error: null }),
            })),
          })),
        })
        .mockReturnValueOnce({
          upsert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'score-789',
                  user_id: userId,
                  github_username: 'testuser',
                  cycle_id: cycleId,
                  weighted_score: 10.5,
                  is_flagged: false,
                },
                error: null,
              }),
            })),
          })),
        });

      (githubService.getCommitsBetweenDates as any).mockResolvedValue(mockCommits);
      (githubService.getPullRequestsBetweenDates as any).mockResolvedValue(mockPRs);
      (githubService.getReviewsByUser as any).mockResolvedValue(mockReviews);

      const result = await contributionAnalyzerService.calculateContributionScore(userId, cycleId);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data!.user_id).toBe(userId);
      expect(result.data!.github_username).toBe('testuser');
      expect(result.data!.cycle_id).toBe(cycleId);
      expect(result.data!.weighted_score).toBeGreaterThan(0);
    });

    it('should return error when cycle not found', async () => {
      const userId = 'user-123';
      const cycleId = 'nonexistent-cycle';

      (supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      });

      const result = await contributionAnalyzerService.calculateContributionScore(userId, cycleId);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('not found');
    });

    it('should return error when GitHub account not linked', async () => {
      const userId = 'user-123';
      const cycleId = 'cycle-456';

      const mockCycle = {
        id: cycleId,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
        status: 'calculating',
      };

      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockCycle, error: null }),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        });

      const result = await contributionAnalyzerService.calculateContributionScore(userId, cycleId);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('No GitHub account linked');
    });
  });

  describe('analyzeAllContributors', () => {
    it('should analyze all contributors successfully', async () => {
      const cycleId = 'cycle-456';

      const mockAccounts = [
        { user_id: 'user-1', github_username: 'user1' },
        { user_id: 'user-2', github_username: 'user2' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockAccounts, error: null }),
      });

      // Mock successful score calculations
      vi.spyOn(contributionAnalyzerService, 'calculateContributionScore')
        .mockResolvedValueOnce({
          data: {
            id: 'score-1',
            user_id: 'user-1',
            github_username: 'user1',
            cycle_id: cycleId,
            weighted_score: 10,
            is_flagged: false,
          } as any,
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            id: 'score-2',
            user_id: 'user-2',
            github_username: 'user2',
            cycle_id: cycleId,
            weighted_score: 15,
            is_flagged: true,
          } as any,
          error: null,
        });

      // Mock ranking calculation
      vi.spyOn(contributionAnalyzerService as any, 'calculateRankings')
        .mockResolvedValue(undefined);

      const result = await contributionAnalyzerService.analyzeAllContributors(cycleId);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.metadata?.contributors_processed).toBe(2);
      expect(result.metadata?.flags_raised).toBe(1);
    });

    it('should handle empty contributor list', async () => {
      const cycleId = 'cycle-456';

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await contributionAnalyzerService.analyzeAllContributors(cycleId);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(0);
      expect(result.metadata?.contributors_processed).toBe(0);
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('should detect statistical outliers', async () => {
      const userId = 'user-123';
      const cycleId = 'cycle-456';

      const mockAnalysis = {
        user_id: userId,
        github_username: 'testuser',
        cycle_id: cycleId,
        metrics: {
          total_commits: 100, // Very high number
          total_prs: 5,
          total_reviews: 2,
          net_lines: 1000,
        },
      } as any;

      // Mock cycle statistics that would make this an outlier
      vi.spyOn(contributionAnalyzerService as any, 'getCycleStatistics')
        .mockResolvedValue({
          average_score: 10,
          std_deviation: 5,
        });

      const result = await contributionAnalyzerService.detectSuspiciousActivity(
        userId,
        cycleId,
        mockAnalysis
      );

      expect(result.is_flagged).toBe(true);
      expect(result.patterns_detected).toHaveLength(2); // Statistical outlier + commit spam
      expect(result.recommendation).toBe('review');
    });

    it('should not flag normal activity', async () => {
      const userId = 'user-123';
      const cycleId = 'cycle-456';

      const mockAnalysis = {
        user_id: userId,
        github_username: 'testuser',
        cycle_id: cycleId,
        metrics: {
          total_commits: 10, // Normal number
          total_prs: 3,
          total_reviews: 5,
          net_lines: 200,
          lines_added: 300,
        },
      } as any;

      vi.spyOn(contributionAnalyzerService as any, 'getCycleStatistics')
        .mockResolvedValue({
          average_score: 10,
          std_deviation: 5,
        });

      const result = await contributionAnalyzerService.detectSuspiciousActivity(
        userId,
        cycleId,
        mockAnalysis
      );

      expect(result.is_flagged).toBe(false);
      expect(result.patterns_detected).toHaveLength(0);
      expect(result.recommendation).toBe('approve');
    });
  });

  describe('getRankings', () => {
    it('should return contributor rankings', async () => {
      const cycleId = 'cycle-456';

      const mockScores = [
        {
          user_id: 'user-1',
          github_username: 'user1',
          weighted_score: 20,
          token_allocation: 100,
          github_accounts: { avatar_url: 'https://github.com/user1.jpg' },
        },
        {
          user_id: 'user-2',
          github_username: 'user2',
          weighted_score: 15,
          token_allocation: 75,
          github_accounts: { avatar_url: 'https://github.com/user2.jpg' },
        },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockScores, error: null }),
          })),
        })),
      });

      const result = await contributionAnalyzerService.getRankings(cycleId);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data![0].rank).toBe(1);
      expect(result.data![0].github_username).toBe('user1');
      expect(result.data![0].percentile).toBe(100);
      expect(result.data![1].rank).toBe(2);
      expect(result.data![1].percentile).toBe(50);
    });
  });

  describe('applyContributionWeights', () => {
    it('should apply weights correctly', async () => {
      const rawScore = 10;
      const weights = {
        commit_weight: 1.0,
        pr_merged_weight: 3.0,
        review_weight: 2.0,
        documentation_weight: 1.5,
        lines_of_code_multiplier: 0.001,
      };

      const result = await contributionAnalyzerService.applyContributionWeights(rawScore, weights);

      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });
  });
});