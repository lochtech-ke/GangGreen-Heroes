import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { githubService } from './github.service';
import { supabase } from './supabase';
// import { GitHubErrorCode } from '../types/github.types';

/**
 * Property-Based Tests for GitHub Service
 * 
 * **Feature: contributor-token-distribution, Property 3: GitHub Account Uniqueness**
 * **Validates: Requirements 9.2, 9.3**
 */

// Mock supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('GitHub Service Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    githubService.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 3: GitHub Account Uniqueness', () => {
    /**
     * **Feature: contributor-token-distribution, Property 3: GitHub Account Uniqueness**
     * **Validates: Requirements 9.2, 9.3**
     * 
     * For any two platform users, they cannot be linked to the same GitHub account simultaneously.
     */
    it('should enforce GitHub account uniqueness across all users', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate two different user IDs
          fc.tuple(
            fc.uuid(),
            fc.uuid()
          ).filter(([userId1, userId2]) => userId1 !== userId2),
          // Generate GitHub user data
          fc.record({
            id: fc.integer({ min: 1, max: 999999999 }),
            login: fc.string({ minLength: 1, maxLength: 39 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
            avatar_url: fc.webUrl(),
            html_url: fc.webUrl(),
            name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
            email: fc.option(fc.emailAddress(), { nil: null }),
          }),
          // Generate access token
          fc.string({ minLength: 40, maxLength: 40 }),
          async ([userId1, userId2], githubUser, accessToken) => {
            // Mock GitHub API response for user info
            (fetch as any).mockResolvedValue({
              ok: true,
              status: 200,
              headers: new Map(),
              json: () => Promise.resolve(githubUser),
            });

            // First user links successfully
            const mockSupabaseChain1 = {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                })),
              })),
            };
            
            const mockSupabaseChain2 = {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      id: 'link-1',
                      user_id: userId1,
                      github_id: githubUser.id,
                      github_username: githubUser.login,
                    }, 
                    error: null 
                  }),
                })),
              })),
            };

            (supabase.from as any)
              .mockReturnValueOnce(mockSupabaseChain1) // Check existing link
              .mockReturnValueOnce(mockSupabaseChain1) // Check user's existing link
              .mockReturnValueOnce(mockSupabaseChain2); // Insert new link

            const result1 = await githubService.linkGitHubAccount(userId1, accessToken);
            expect(result1.error).toBeNull();
            expect(result1.data).toBeDefined();

            // Second user tries to link the same GitHub account
            const mockSupabaseChain3 = {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ 
                    data: { user_id: userId1 }, // GitHub account already linked to userId1
                    error: null 
                  }),
                })),
              })),
            };

            (supabase.from as any).mockReturnValueOnce(mockSupabaseChain3);

            const result2 = await githubService.linkGitHubAccount(userId2, accessToken);
            
            // Second linking should fail with account already linked error
            expect(result2.data).toBeNull();
            expect(result2.error).toBeDefined();
            expect(result2.error!.message).toContain('already linked to another user');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow the same user to update their GitHub account link', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // Single user ID
          fc.record({
            id: fc.integer({ min: 1, max: 999999999 }),
            login: fc.string({ minLength: 1, maxLength: 39 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
            avatar_url: fc.webUrl(),
            html_url: fc.webUrl(),
            name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
            email: fc.option(fc.emailAddress(), { nil: null }),
          }),
          fc.string({ minLength: 40, maxLength: 40 }),
          async (userId, githubUser, accessToken) => {
            // Mock GitHub API response
            (fetch as any).mockResolvedValue({
              ok: true,
              status: 200,
              headers: new Map(),
              json: () => Promise.resolve(githubUser),
            });

            // Mock existing link for the same user
            const mockSupabaseChain1 = {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ 
                    data: { user_id: userId }, // Same user already has this GitHub account
                    error: null 
                  }),
                })),
              })),
            };

            const mockSupabaseChain2 = {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ 
                    data: { id: 'existing-link', user_id: userId },
                    error: null 
                  }),
                })),
              })),
            };

            const mockSupabaseChain3 = {
              update: vi.fn(() => ({
                eq: vi.fn(() => ({
                  select: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ 
                      data: {
                        id: 'existing-link',
                        user_id: userId,
                        github_id: githubUser.id,
                        github_username: githubUser.login,
                      }, 
                      error: null 
                    }),
                  })),
                })),
              })),
            };

            (supabase.from as any)
              .mockReturnValueOnce(mockSupabaseChain1) // Check existing link by GitHub ID
              .mockReturnValueOnce(mockSupabaseChain2) // Check user's existing link
              .mockReturnValueOnce(mockSupabaseChain3); // Update existing link

            const result = await githubService.linkGitHubAccount(userId, accessToken);
            
            // Should succeed when same user updates their link
            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data!.user_id).toBe(userId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle GitHub API errors consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.string({ minLength: 40, maxLength: 40 }),
          fc.integer({ min: 400, max: 599 }), // HTTP error codes
          async (userId, accessToken, errorCode) => {
            // Clear cache to avoid interference
            githubService.clearCache();
            
            // Mock GitHub API error response with proper headers
            (fetch as any).mockResolvedValue({
              ok: false,
              status: errorCode,
              statusText: 'Error',
              headers: {
                get: vi.fn().mockReturnValue('0'), // Mock headers.get method
              },
              text: () => Promise.resolve('API Error'),
            });

            const result = await githubService.linkGitHubAccount(userId, accessToken);
            
            // Should always return error for failed GitHub API calls
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            
            // Error should contain meaningful information
            expect(result.error!.message).toContain('GitHub API error');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Repository Data Consistency Properties', () => {
    it('should maintain consistent contributor data structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 999999999 }),
              login: fc.string({ minLength: 1, maxLength: 39 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
              avatar_url: fc.webUrl(),
              html_url: fc.webUrl(),
            }),
            { minLength: 0, maxLength: 100 }
          ),
          fc.string({ minLength: 1, maxLength: 20 }), // Add unique repo name to avoid cache conflicts
          async (mockContributors, repoSuffix) => {
            // Clear cache to avoid interference
            githubService.clearCache();
            
            // Mock GitHub API response
            (fetch as any).mockResolvedValue({
              ok: true,
              status: 200,
              headers: new Map(),
              json: () => Promise.resolve(mockContributors),
            });

            const result = await githubService.getRepositoryContributors(`test/repo-${repoSuffix}`);
            
            if (result.error) {
              // If there's an error, data should be null
              expect(result.data).toBeNull();
            } else {
              // If successful, data should have correct structure
              expect(result.data).toBeDefined();
              expect(result.data!.data).toHaveLength(mockContributors.length);
              
              // Each contributor should have required fields
              result.data!.data.forEach((contributor, index) => {
                expect(contributor.github_username).toBe(mockContributors[index].login);
                expect(contributor.github_id).toBe(mockContributors[index].id);
                expect(contributor.avatar_url).toBe(mockContributors[index].avatar_url);
                expect(contributor.profile_url).toBe(mockContributors[index].html_url);
                expect(typeof contributor.total_commits).toBe('number');
                expect(typeof contributor.total_prs).toBe('number');
                expect(typeof contributor.total_reviews).toBe('number');
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle pagination parameters correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            page: fc.integer({ min: 1, max: 100 }),
            per_page: fc.integer({ min: 1, max: 100 }),
          }),
          async (pagination) => {
            const mockData = Array.from({ length: pagination.per_page }, (_, i) => ({
              id: i + 1,
              login: `user${i}`,
              avatar_url: `https://github.com/avatar${i}.jpg`,
              html_url: `https://github.com/user${i}`,
            }));

            (fetch as any).mockResolvedValue({
              ok: true,
              status: 200,
              headers: new Map(),
              json: () => Promise.resolve(mockData),
            });

            const result = await githubService.getRepositoryContributors(undefined, pagination);
            
            if (result.data) {
              // Pagination info should match request
              expect(result.data.pagination.page).toBe(pagination.page);
              expect(result.data.pagination.per_page).toBe(pagination.per_page);
              
              // Should have correct number of items (up to per_page)
              expect(result.data.data.length).toBeLessThanOrEqual(pagination.per_page);
              
              // Pagination flags should be consistent
              expect(result.data.pagination.has_prev).toBe(pagination.page > 1);
              expect(result.data.pagination.has_next).toBe(result.data.data.length === pagination.per_page);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Cache Behavior Properties', () => {
    it('should maintain cache consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          async (cacheKeys) => {
            const initialSize = githubService.getCacheStats().size;
            
            // Make multiple requests that should be cached
            for (const key of cacheKeys) {
              const mockData = [{ id: 1, login: key, avatar_url: '', html_url: '' }];
              
              (fetch as any).mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map(),
                json: () => Promise.resolve(mockData),
              });

              await githubService.getRepositoryContributors(`test/${key}`);
            }
            
            const finalSize = githubService.getCacheStats().size;
            const stats = githubService.getCacheStats();
            
            // Cache size should have increased (unless we hit max size)
            expect(finalSize).toBeGreaterThanOrEqual(initialSize);
            expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});