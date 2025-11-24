import { supabase } from './supabase';
import { governanceTokenService } from './governanceToken.service';
import { proposalService } from './proposal.service';
import type {
  Vote,
  VoteType,
  VoteTally,
  VotingSnapshot,
  GovernanceErrorCode,
  ServiceResponse,
} from '../types/governance.types';

/**
 * Voting Engine Service
 * 
 * Handles vote casting, tallying, and validation.
 */
class VotingService {
  /**
   * Cast a vote on a proposal
   */
  async castVote(
    proposalId: string,
    userId: string,
    voteType: VoteType
  ): Promise<ServiceResponse<Vote>> {
    try {
      // Check if voting is active
      const isActive = await proposalService.isVotingActive(proposalId);
      if (!isActive) {
        return {
          success: false,
          error: {
            code: 'VOTING_CLOSED' as GovernanceErrorCode,
            message: 'Voting period is not active for this proposal',
          },
        };
      }

      // Get user's voting power
      const votingPower = await governanceTokenService.getVotingPower(userId, proposalId);
      if (votingPower === 0) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_VOTING_POWER' as GovernanceErrorCode,
            message: 'You have no voting power for this proposal',
          },
        };
      }

      // Check if user has already voted
      const existingVote = await this.getUserVote(proposalId, userId);
      if (existingVote) {
        // Update existing vote
        return await this.updateVote(existingVote.id, voteType);
      }

      // Create voting snapshot if not exists
      await this.ensureVotingSnapshot(proposalId, userId, votingPower);

      // Cast new vote
      const { data, error } = await supabase
        .from('votes')
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          vote_type: voteType,
          voting_power: votingPower,
          is_tie_breaker: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update proposal vote counts
      await this.updateProposalVoteCounts(proposalId);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error casting vote:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to cast vote',
          details: error,
        },
      };
    }
  }

  /**
   * Update an existing vote
   */
  async updateVote(voteId: string, voteType: VoteType): Promise<ServiceResponse<Vote>> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .update({
          vote_type: voteType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', voteId)
        .select()
        .single();

      if (error) throw error;

      // Update proposal vote counts
      if (data) {
        await this.updateProposalVoteCounts(data.proposal_id);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error updating vote:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to update vote',
          details: error,
        },
      };
    }
  }

  /**
   * Get user's vote on a proposal
   */
  async getUserVote(proposalId: string, userId: string): Promise<Vote | null> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      return null;
    }
  }

  /**
   * Get all votes for a proposal
   */
  async getVotesByProposal(proposalId: string): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching votes:', error);
      return [];
    }
  }

  /**
   * Calculate vote tally for a proposal
   */
  async calculateVoteTally(proposalId: string): Promise<VoteTally> {
    try {
      const votes = await this.getVotesByProposal(proposalId);
      const proposal = await proposalService.getProposalById(proposalId);

      const votesFor = votes
        .filter((v) => v.vote_type === 'for')
        .reduce((sum, v) => sum + v.voting_power, 0);

      const votesAgainst = votes
        .filter((v) => v.vote_type === 'against')
        .reduce((sum, v) => sum + v.voting_power, 0);

      const votesAbstain = votes
        .filter((v) => v.vote_type === 'abstain')
        .reduce((sum, v) => sum + v.voting_power, 0);

      const totalVotingPower = votesFor + votesAgainst + votesAbstain;

      // Calculate participation rate
      const totalTokens = await this.getTotalGovernanceTokens();
      const participationRate = totalTokens > 0 ? (totalVotingPower / totalTokens) * 100 : 0;

      // Check quorum
      const quorumRequired = proposal?.quorum_required || 20;
      const quorumMet = participationRate >= quorumRequired;

      return {
        proposal_id: proposalId,
        votes_for: votesFor,
        votes_against: votesAgainst,
        votes_abstain: votesAbstain,
        total_voting_power: totalVotingPower,
        participation_rate: participationRate,
        quorum_met: quorumMet,
      };
    } catch (error) {
      console.error('Error calculating vote tally:', error);
      return {
        proposal_id: proposalId,
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        total_voting_power: 0,
        participation_rate: 0,
        quorum_met: false,
      };
    }
  }

  /**
   * Update proposal vote counts
   */
  private async updateProposalVoteCounts(proposalId: string): Promise<void> {
    try {
      const tally = await this.calculateVoteTally(proposalId);

      await supabase
        .from('proposals')
        .update({
          votes_for: tally.votes_for,
          votes_against: tally.votes_against,
          votes_abstain: tally.votes_abstain,
          total_voting_power: tally.total_voting_power,
        })
        .eq('id', proposalId);
    } catch (error) {
      console.error('Error updating proposal vote counts:', error);
    }
  }

  /**
   * Create voting snapshot for user
   */
  private async ensureVotingSnapshot(
    proposalId: string,
    userId: string,
    votingPower: number
  ): Promise<void> {
    try {
      // Check if snapshot already exists
      const { data: existing } = await supabase
        .from('voting_snapshots')
        .select('id')
        .eq('proposal_id', proposalId)
        .eq('user_id', userId)
        .single();

      if (existing) return;

      // Create snapshot
      const tokenRecord = await governanceTokenService.getTokenRecord(userId);
      const delegatedPower = votingPower - (tokenRecord?.balance || 0);

      await supabase.from('voting_snapshots').insert({
        proposal_id: proposalId,
        user_id: userId,
        voting_power_at_start: tokenRecord?.balance || 0,
        delegated_power: delegatedPower,
        total_power: votingPower,
      });
    } catch (error) {
      console.error('Error creating voting snapshot:', error);
    }
  }

  /**
   * Get voting snapshot for user
   */
  async getVotingSnapshot(proposalId: string, userId: string): Promise<VotingSnapshot | null> {
    try {
      const { data, error } = await supabase
        .from('voting_snapshots')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching voting snapshot:', error);
      return null;
    }
  }

  /**
   * Check if quorum is met for a proposal
   */
  async checkQuorum(proposalId: string): Promise<boolean> {
    const tally = await this.calculateVoteTally(proposalId);
    return tally.quorum_met;
  }

  /**
   * Get total governance tokens in circulation
   */
  private async getTotalGovernanceTokens(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('governance_tokens')
        .select('balance');

      if (error) throw error;

      return data?.reduce((sum, record) => sum + record.balance, 0) || 0;
    } catch (error) {
      console.error('Error calculating total tokens:', error);
      return 0;
    }
  }

  /**
   * Get vote distribution percentages
   */
  async getVoteDistribution(proposalId: string): Promise<{
    for_percentage: number;
    against_percentage: number;
    abstain_percentage: number;
  }> {
    const tally = await this.calculateVoteTally(proposalId);
    const total = tally.total_voting_power;

    if (total === 0) {
      return {
        for_percentage: 0,
        against_percentage: 0,
        abstain_percentage: 0,
      };
    }

    return {
      for_percentage: (tally.votes_for / total) * 100,
      against_percentage: (tally.votes_against / total) * 100,
      abstain_percentage: (tally.votes_abstain / total) * 100,
    };
  }
}

export const votingService = new VotingService();
export default votingService;
