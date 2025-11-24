import { supabase } from './supabase';
import { githubService } from './github.service';
import {
  ContributionAnalyzerError,
  ContributionAnalyzerErrorCode,
} from '../types/contributionAnalyzer.types';
import type {
  ContributionScore,
  ContributionWeights,
  DistributionCycle,
  RawContributionData,
  ContributionAnalysis,
  SuspiciousActivityResult,
  SuspiciousActivityPattern,
  ContributorRanking,
  CycleStatistics,
  ContributionAnalyzerResponse,
  AnalyzerConfig,
} from '../types/contributionAnalyzer.types';

/**
 * Contribution Analyzer Service
 * Calculates contribution scores and determines token allocation
 */
class ContributionAnalyzerService {
  private config: AnalyzerConfig;

  constructor() {
    this.config = {
      suspicious_activity: {
        z_score_threshold: 3.0, // 3 standard deviations
        min_commits_for_analysis: 5,
        whitespace_only_threshold: 0.8, // 80% whitespace-only commits
        commit_spam_threshold: 10, // More than 10 commits per hour
        pr_splitting_threshold: 10, // Less than 10 lines per PR
      },
      scoring: {
        min_lines_for_significant_commit: 1,
        max_score_per_activity_type: 1000,
        documentation_bonus_multiplier: 1.5,
      },
      performance: {
        batch_size: 10,
        max_concurrent_analyses: 5,
        cache_ttl_minutes: 60,
      },
    };
  }

  /**
   * Calculate contribution score for a specific user in a cycle
   */
  async calculateContributionScore(
    userId: string,
    cycleId: string
  ): Promise<ContributionAnalyzerResponse<ContributionScore>> {
    try {
      console.log(`[ContributionAnalyzer] Calculating score for user ${userId} in cycle ${cycleId}`);

      // Get cycle information
      const cycle = await this.getDistributionCycle(cycleId);
      if (!cycle) {
        return {
          data: null,
          error: new ContributionAnalyzerError(
            ContributionAnalyzerErrorCode.CYCLE_NOT_FOUND,
            `Distribution cycle ${cycleId} not found`
          ),
        };
      }

      // Get user's GitHub account
      const { data: githubAccount } = await supabase
        .from('github_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!githubAccount) {
        return {
          data: null,
          error: new ContributionAnalyzerError(
            ContributionAnalyzerErrorCode.GITHUB_DATA_UNAVAILABLE,
            `No GitHub account linked for user ${userId}`
          ),
        };
      }

      // Collect raw contribution data
      const rawData = await this.collectRawContributionData(
        githubAccount.github_username,
        cycle.start_date,
        cycle.end_date
      );

      if (!rawData) {
        return {
          data: null,
          error: new ContributionAnalyzerError(
            ContributionAnalyzerErrorCode.GITHUB_DATA_UNAVAILABLE,
            `Failed to collect GitHub data for ${githubAccount.github_username}`
          ),
        };
      }

      // Analyze contributions
      const analysis = await this.analyzeContributions(rawData, cycleId);

      // Get contribution weights
      const weights = await this.getContributionWeights();

      // Calculate weighted score
      const weightedScore = this.calculateWeightedScore(analysis.scores, weights);

      // Check for suspicious activity
      const suspiciousActivity = await this.detectSuspiciousActivity(userId, cycleId, analysis);

      // Create contribution score record
      const contributionScore: ContributionScore = {
        id: '', // Will be set by database
        user_id: userId,
        github_username: githubAccount.github_username,
        cycle_id: cycleId,
        commits_count: analysis.metrics.significant_commits,
        prs_merged_count: analysis.metrics.merged_prs,
        reviews_count: analysis.metrics.total_reviews,
        lines_added: analysis.metrics.lines_added,
        lines_deleted: analysis.metrics.lines_deleted,
        documentation_changes: analysis.metrics.documentation_commits + analysis.metrics.documentation_prs,
        raw_score: analysis.scores.raw_total,
        weighted_score: weightedScore,
        token_allocation: 0, // Will be calculated during distribution
        rank: 0, // Will be calculated after all scores are computed
        is_flagged: suspiciousActivity.is_flagged,
        flag_reason: suspiciousActivity.patterns_detected.map(p => p.description).join('; ') || null,
        calculated_at: new Date().toISOString(),
      };

      // Save to database
      const { data: savedScore, error: saveError } = await supabase
        .from('contribution_scores')
        .upsert(contributionScore, { onConflict: 'user_id,cycle_id' })
        .select()
        .single();

      if (saveError) {
        return {
          data: null,
          error: new ContributionAnalyzerError(
            ContributionAnalyzerErrorCode.DATABASE_ERROR,
            `Failed to save contribution score: ${saveError.message}`
          ),
        };
      }

      return {
        data: savedScore,
        error: null,
        metadata: {
          cycle_id: cycleId,
          contributors_processed: 1,
          processing_time_ms: 0,
          flags_raised: suspiciousActivity.is_flagged ? 1 : 0,
        },
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof ContributionAnalyzerError ? error : new ContributionAnalyzerError(
          ContributionAnalyzerErrorCode.CALCULATION_ERROR,
          `Failed to calculate contribution score: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Analyze all contributors for a distribution cycle
   */
  async analyzeAllContributors(cycleId: string): Promise<ContributionAnalyzerResponse<ContributionScore[]>> {
    const startTime = Date.now();

    try {
      console.log(`[ContributionAnalyzer] Starting analysis for cycle ${cycleId}`);

      // Get all linked GitHub accounts
      const { data: githubAccounts, error: accountsError } = await supabase
        .from('github_accounts')
        .select('user_id, github_username');

      if (accountsError) {
        return {
          data: null,
          error: new ContributionAnalyzerError(
            ContributionAnalyzerErrorCode.DATABASE_ERROR,
            `Failed to fetch GitHub accounts: ${accountsError.message}`
          ),
        };
      }

      if (!githubAccounts || githubAccounts.length === 0) {
        return {
          data: [],
          error: null,
          metadata: {
            cycle_id: cycleId,
            contributors_processed: 0,
            processing_time_ms: Date.now() - startTime,
            flags_raised: 0,
          },
        };
      }

      // Process contributors in batches
      const results: ContributionScore[] = [];
      const errors: string[] = [];
      let flagsRaised = 0;

      for (let i = 0; i < githubAccounts.length; i += this.config.performance.batch_size) {
        const batch = githubAccounts.slice(i, i + this.config.performance.batch_size);
        
        const batchPromises = batch.map(async (account) => {
          const result = await this.calculateContributionScore(account.user_id, cycleId);
          if (result.error) {
            errors.push(`${account.github_username}: ${result.error.message}`);
            return null;
          }
          if (result.data?.is_flagged) {
            flagsRaised++;
          }
          return result.data;
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(Boolean) as ContributionScore[]);

        console.log(`[ContributionAnalyzer] Processed batch ${Math.floor(i / this.config.performance.batch_size) + 1}/${Math.ceil(githubAccounts.length / this.config.performance.batch_size)}`);
      }

      // Calculate rankings
      await this.calculateRankings(cycleId);

      const processingTime = Date.now() - startTime;
      console.log(`[ContributionAnalyzer] Analysis completed in ${processingTime}ms`);

      return {
        data: results,
        error: errors.length > 0 ? new Error(`Some contributors failed: ${errors.join(', ')}`) : null,
        metadata: {
          cycle_id: cycleId,
          contributors_processed: results.length,
          processing_time_ms: processingTime,
          flags_raised: flagsRaised,
        },
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof ContributionAnalyzerError ? error : new ContributionAnalyzerError(
          ContributionAnalyzerErrorCode.CALCULATION_ERROR,
          `Failed to analyze contributors: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Apply contribution weights to calculate final score
   */
  async applyContributionWeights(
    rawScore: number,
    weights: ContributionWeights
  ): Promise<number> {
    // This is a simplified implementation
    // In practice, you'd apply weights to individual components
    return rawScore * (weights.commit_weight + weights.pr_merged_weight + weights.review_weight) / 3;
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(
    userId: string,
    cycleId: string,
    analysis?: ContributionAnalysis
  ): Promise<SuspiciousActivityResult> {
    try {
      if (!analysis) {
        // If no analysis provided, get it from database
        const { data: scoreData } = await supabase
          .from('contribution_scores')
          .select('*')
          .eq('user_id', userId)
          .eq('cycle_id', cycleId)
          .single();

        if (!scoreData) {
          return {
            user_id: userId,
            github_username: '',
            is_flagged: false,
            patterns_detected: [],
            statistical_analysis: {
              commits_z_score: 0,
              prs_z_score: 0,
              reviews_z_score: 0,
              lines_z_score: 0,
              overall_z_score: 0,
            },
            recommendation: 'approve',
          };
        }
      }

      // Get cycle statistics for comparison
      const cycleStats = await this.getCycleStatistics(cycleId);
      const patterns: SuspiciousActivityPattern[] = [];

      // Calculate z-scores
      const commits_z_score = cycleStats ? 
        Math.abs((analysis!.metrics.total_commits - cycleStats.average_score) / cycleStats.std_deviation) : 0;
      const prs_z_score = cycleStats ? 
        Math.abs((analysis!.metrics.total_prs - cycleStats.average_score) / cycleStats.std_deviation) : 0;
      const reviews_z_score = cycleStats ? 
        Math.abs((analysis!.metrics.total_reviews - cycleStats.average_score) / cycleStats.std_deviation) : 0;
      const lines_z_score = cycleStats ? 
        Math.abs((analysis!.metrics.net_lines - cycleStats.average_score) / cycleStats.std_deviation) : 0;

      const overall_z_score = Math.max(commits_z_score, prs_z_score, reviews_z_score, lines_z_score);

      // Check for statistical outliers
      if (overall_z_score > this.config.suspicious_activity.z_score_threshold) {
        patterns.push({
          pattern_type: 'statistical_outlier',
          description: `Activity exceeds ${this.config.suspicious_activity.z_score_threshold} standard deviations from mean`,
          threshold: this.config.suspicious_activity.z_score_threshold,
          severity: 'high',
        });
      }

      // Check for commit spam (simplified - would need timestamp analysis in real implementation)
      if (analysis!.metrics.total_commits > 50) { // Arbitrary threshold
        patterns.push({
          pattern_type: 'commit_spam',
          description: 'Unusually high number of commits',
          threshold: 50,
          severity: 'medium',
        });
      }

      // Check for artificial PR splitting
      if (analysis!.metrics.total_prs > 10 && analysis!.metrics.lines_added / analysis!.metrics.total_prs < this.config.suspicious_activity.pr_splitting_threshold) {
        patterns.push({
          pattern_type: 'artificial_pr_splitting',
          description: 'Many small PRs with minimal changes',
          threshold: this.config.suspicious_activity.pr_splitting_threshold,
          severity: 'medium',
        });
      }

      const is_flagged = patterns.length > 0;
      const recommendation = is_flagged ? 
        (patterns.some(p => p.severity === 'high') ? 'reject' : 'review') : 'approve';

      return {
        user_id: userId,
        github_username: analysis!.github_username,
        is_flagged,
        patterns_detected: patterns,
        statistical_analysis: {
          commits_z_score,
          prs_z_score,
          reviews_z_score,
          lines_z_score,
          overall_z_score,
        },
        recommendation,
      };
    } catch (error) {
      console.error('[ContributionAnalyzer] Error detecting suspicious activity:', error);
      return {
        user_id: userId,
        github_username: '',
        is_flagged: false,
        patterns_detected: [],
        statistical_analysis: {
          commits_z_score: 0,
          prs_z_score: 0,
          reviews_z_score: 0,
          lines_z_score: 0,
          overall_z_score: 0,
        },
        recommendation: 'approve',
      };
    }
  }

  /**
   * Get contributor rankings for a cycle
   */
  async getRankings(cycleId: string): Promise<ContributionAnalyzerResponse<ContributorRanking[]>> {
    try {
      const { data: scores, error } = await supabase
        .from('contribution_scores')
        .select(`
          *,
          users!inner(id),
          github_accounts!inner(avatar_url)
        `)
        .eq('cycle_id', cycleId)
        .order('weighted_score', { ascending: false });

      if (error) {
        return {
          data: null,
          error: new ContributionAnalyzerError(
            ContributionAnalyzerErrorCode.DATABASE_ERROR,
            `Failed to fetch rankings: ${error.message}`
          ),
        };
      }

      const rankings: ContributorRanking[] = scores.map((score, index) => ({
        rank: index + 1,
        user_id: score.user_id,
        github_username: score.github_username,
        avatar_url: (score as any).github_accounts?.avatar_url || null,
        weighted_score: score.weighted_score,
        token_allocation: score.token_allocation,
        percentile: Math.round(((scores.length - index) / scores.length) * 100),
        badges_earned: [], // Would be populated from user_badges table
      }));

      return {
        data: rankings,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: new ContributionAnalyzerError(
          ContributionAnalyzerErrorCode.DATABASE_ERROR,
          `Failed to get rankings: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Private helper methods
   */
  private async getDistributionCycle(cycleId: string): Promise<DistributionCycle | null> {
    const { data, error } = await supabase
      .from('distribution_cycles')
      .select('*')
      .eq('id', cycleId)
      .single();

    if (error) {
      console.error('[ContributionAnalyzer] Error fetching cycle:', error);
      return null;
    }

    return data;
  }

  private async collectRawContributionData(
    githubUsername: string,
    startDate: string,
    endDate: string
  ): Promise<RawContributionData | null> {
    try {
      // Get commits
      const commitsResponse = await githubService.getCommitsBetweenDates(startDate, endDate);
      const userCommits = commitsResponse.data?.data.filter(commit => 
        commit.author === githubUsername
      ) || [];

      // Get PRs
      const prsResponse = await githubService.getPullRequestsBetweenDates(startDate, endDate);
      const userPRs = prsResponse.data?.data.filter(pr => 
        pr.author === githubUsername
      ) || [];

      // Get reviews
      const reviewsResponse = await githubService.getReviewsByUser(githubUsername, startDate);
      const userReviews = reviewsResponse.data || [];

      return {
        user_id: '', // Will be set by caller
        github_username: githubUsername,
        commits: userCommits.map(commit => ({
          sha: commit.sha,
          message: commit.message,
          additions: commit.additions,
          deletions: commit.deletions,
          is_documentation: commit.is_documentation,
          is_merge_commit: commit.is_merge_commit,
          date: commit.date,
        })),
        pull_requests: userPRs.map(pr => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          additions: pr.additions,
          deletions: pr.deletions,
          is_documentation: pr.is_documentation,
          merged_at: pr.merged_at,
        })),
        reviews: userReviews.map(review => ({
          id: review.id,
          pull_request_number: review.pull_request_number,
          state: review.state,
          submitted_at: review.submitted_at,
        })),
      };
    } catch (error) {
      console.error('[ContributionAnalyzer] Error collecting raw data:', error);
      return null;
    }
  }

  private async analyzeContributions(
    rawData: RawContributionData,
    cycleId: string
  ): Promise<ContributionAnalysis> {
    const metrics = {
      total_commits: rawData.commits.length,
      significant_commits: rawData.commits.filter(c => 
        !c.is_merge_commit && (c.additions + c.deletions) >= this.config.scoring.min_lines_for_significant_commit
      ).length,
      total_prs: rawData.pull_requests.length,
      merged_prs: rawData.pull_requests.filter(pr => pr.state === 'merged').length,
      total_reviews: rawData.reviews.length,
      approved_reviews: rawData.reviews.filter(r => r.state === 'approved').length,
      lines_added: rawData.commits.reduce((sum, c) => sum + c.additions, 0) + 
                   rawData.pull_requests.reduce((sum, pr) => sum + pr.additions, 0),
      lines_deleted: rawData.commits.reduce((sum, c) => sum + c.deletions, 0) + 
                     rawData.pull_requests.reduce((sum, pr) => sum + pr.deletions, 0),
      net_lines: 0, // Will be calculated below
      documentation_commits: rawData.commits.filter(c => c.is_documentation).length,
      documentation_prs: rawData.pull_requests.filter(pr => pr.is_documentation).length,
    };

    metrics.net_lines = metrics.lines_added - metrics.lines_deleted;

    // Calculate scores
    const commit_score = metrics.significant_commits * 1.0;
    const pr_score = metrics.merged_prs * 3.0;
    const review_score = metrics.total_reviews * 2.0;
    const documentation_score = (metrics.documentation_commits + metrics.documentation_prs) * 1.5;
    const lines_of_code_score = metrics.net_lines * 0.001;

    const raw_total = commit_score + pr_score + review_score + documentation_score + lines_of_code_score;

    return {
      user_id: rawData.user_id,
      github_username: rawData.github_username,
      cycle_id: cycleId,
      metrics,
      scores: {
        commit_score,
        pr_score,
        review_score,
        documentation_score,
        lines_of_code_score,
        raw_total,
        weighted_total: raw_total, // Will be calculated with weights
      },
      flags: {
        is_suspicious: false,
        reasons: [],
        deviation_from_mean: 0,
      },
    };
  }

  private calculateWeightedScore(scores: any, weights: ContributionWeights): number {
    return (
      scores.commit_score * weights.commit_weight +
      scores.pr_score * weights.pr_merged_weight +
      scores.review_score * weights.review_weight +
      scores.documentation_score * weights.documentation_weight +
      scores.lines_of_code_score * weights.lines_of_code_multiplier
    );
  }

  private async getContributionWeights(): Promise<ContributionWeights> {
    const { data } = await supabase
      .from('distribution_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (data) {
      return {
        commit_weight: data.commit_weight,
        pr_merged_weight: data.pr_merged_weight,
        review_weight: data.review_weight,
        documentation_weight: data.documentation_weight,
        lines_of_code_multiplier: data.lines_of_code_multiplier,
      };
    }

    // Default weights
    return {
      commit_weight: 1.0,
      pr_merged_weight: 3.0,
      review_weight: 2.0,
      documentation_weight: 1.5,
      lines_of_code_multiplier: 0.001,
    };
  }

  private async calculateRankings(cycleId: string): Promise<void> {
    // Update ranks based on weighted scores
    const { error } = await supabase.rpc('update_contribution_rankings', {
      p_cycle_id: cycleId,
    });

    if (error) {
      console.error('[ContributionAnalyzer] Error updating rankings:', error);
    }
  }

  private async getCycleStatistics(cycleId: string): Promise<CycleStatistics | null> {
    const { data, error } = await supabase
      .from('contribution_scores')
      .select('weighted_score')
      .eq('cycle_id', cycleId);

    if (error || !data || data.length === 0) {
      return null;
    }

    const scores = data.map(d => d.weighted_score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = sum / scores.length;
    const sortedScores = scores.sort((a, b) => a - b);
    const median = sortedScores[Math.floor(sortedScores.length / 2)];
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    return {
      cycle_id: cycleId,
      total_contributors: scores.length,
      total_commits: 0, // Would need to aggregate from all scores
      total_prs: 0,
      total_reviews: 0,
      total_lines_changed: 0,
      average_score: average,
      median_score: median,
      std_deviation: stdDev,
      top_contributor: {
        user_id: '',
        github_username: '',
        score: Math.max(...scores),
      },
    };
  }
}

// Export singleton instance
export const contributionAnalyzerService = new ContributionAnalyzerService();