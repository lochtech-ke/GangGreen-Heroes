import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubService } from './github.service';
import { GitHubErrorCode, GitHubError } from '../types/github.types';

// Mock fetch globally
global.fetch = vi.fn();

describe('GitHubService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    githubService.clearCache();
  });

  describe('getRepositoryContributors', () => {
    it('should fetch and transform contributors successfully', async () => {
      const mockContributors = [
        {
          id: 123,
          login: 'testuser',
          avatar_url: 'https://github.com/avatar.jpg',
          html_url: 'https://github.com/testuser',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([
          ['x-ratelimit-remaining', '4999'],
          ['x-ratelimit-reset', '1234567890'],
        ]),
        json: () => Promise.resolve(mockContributors),
      });

      const result = await githubService.getRepositoryContributors();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data!.data).toHaveLength(1);
      expect(result.data!.data[0].github_username).toBe('testuser');
      expect(result.data!.data[0].github_id).toBe(123);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Repository not found'),
      });

      const result = await githubService.getRepositoryContributors();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('GitHub API error: 404');
    });

    it('should handle rate limiting', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Map([
          ['x-ratelimit-remaining', '0'],
          ['x-ratelimit-reset', '1234567890'],
        ]),
        text: () => Promise.resolve('Rate limit exceeded'),
      });

      const result = await githubService.getRepositoryContributors();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(GitHubError);
      expect((result.error as GitHubError).code).toBe(GitHubErrorCode.RATE_LIMIT_EXCEEDED);
    });
  });

  describe('getCommitsBetweenDates', () => {
    it('should fetch and process commits successfully', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2024-01-01T00:00:00Z',
            },
            message: 'Add new feature',
          },
          author: {
            login: 'testuser',
          },
          stats: {
            additions: 10,
            deletions: 5,
            total: 15,
          },
          files: [
            {
              filename: 'src/feature.ts',
              status: 'added',
              additions: 10,
              deletions: 0,
              changes: 10,
            },
          ],
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([
          ['x-ratelimit-remaining', '4999'],
        ]),
        json: () => Promise.resolve(mockCommits),
      });

      const result = await githubService.getCommitsBetweenDates(
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data!.data).toHaveLength(1);
      expect(result.data!.data[0].sha).toBe('abc123');
      expect(result.data!.data[0].author).toBe('testuser');
      expect(result.data!.data[0].additions).toBe(10);
      expect(result.data!.data[0].deletions).toBe(5);
    });

    it('should filter out merge commits', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2024-01-01T00:00:00Z',
            },
            message: 'Merge pull request #123',
          },
          author: {
            login: 'testuser',
          },
          stats: {
            additions: 10,
            deletions: 5,
            total: 15,
          },
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockCommits),
      });

      const result = await githubService.getCommitsBetweenDates(
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );

      expect(result.error).toBeNull();
      expect(result.data!.data[0].is_merge_commit).toBe(true);
    });
  });

  describe('cache functionality', () => {
    it('should cache successful GET requests', async () => {
      const mockData = [{ id: 1, login: 'testuser' }];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockData),
      });

      // First request
      await githubService.getRepositoryContributors();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second request should use cache
      await githubService.getRepositoryContributors();
      expect(fetch).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should provide cache statistics', () => {
      const stats = githubService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await githubService.getRepositoryContributors();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(GitHubError);
      expect((result.error as GitHubError).code).toBe(GitHubErrorCode.NETWORK_ERROR);
    });

    it('should handle timeout errors', async () => {
      (fetch as any).mockRejectedValueOnce(new DOMException('Timeout', 'TimeoutError'));

      const result = await githubService.getRepositoryContributors();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(GitHubError);
      expect((result.error as GitHubError).code).toBe(GitHubErrorCode.NETWORK_ERROR);
    });
  });
});