import { supabase } from './supabase';
import { proposalService } from './proposal.service';
import type {
  SeniorUser,
  TieBreakRequest,
  VoteType,
  GovernanceErrorCode,
  ServiceResponse,
} from '../types/governance.types';

/**
 * Tie-Breaker Service
 * 
 * Handles tie detection and resolution through senior user voting.
 */
class TieBreakerService {
  /**
   * Detect if a proposal has a tie
   */
  async detectTie(proposalId: string): Promise<boolean> {
    try {
      const proposal = await proposalService.getProposalById(proposalId);
      if (!proposal) return false;

      // Check if votes are exactly equal
      return proposal.votes_for === proposal.votes_against && proposal.votes_for > 0;
    } catch (error) {
      console.error('Error detecting tie:', error);
      return false;
    }
  }

  /**
   * Get the senior user with highest seniority level
   */
  async getSeniorUser(): Promise<SeniorUser | null> {
    try {
      const { data, error } = await supabase
        .from('senior_users')
        .select('*')
        .eq('can_break_ties', true)
        .order('seniority_level', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching senior user:', error);
      return null;
    }
  }

  /**
   * Get all senior users
   */
  async getAllSeniorUsers(): Promise<SeniorUser[]> {
    try {
      const { data, error } = await supabase
        .from('senior_users')
        .select('*')
        .eq('can_break_ties', true)
        .order('seniority_level', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching senior users:', error);
      return [];
    }
  }

  /**
   * Create a tie-break request
   */
  async createTieBreakRequest(proposalId: string): Promise<ServiceResponse<TieBreakRequest>> {
    try {
      // Check if tie exists
      const hasTie = await this.detectTie(proposalId);
      if (!hasTie) {
        return {
          success: false,
          error: {
            code: 'INVALID_PROPOSAL' as GovernanceErrorCode,
            message: 'No tie detected for this proposal',
          },
        };
      }

      // Check if request already exists
      const existingRequest = await this.getTieBreakRequest(proposalId);
      if (existingRequest) {
        return {
          success: true,
          data: existingRequest,
        };
      }

      // Get senior user
      const seniorUser = await this.getSeniorUser();
      if (!seniorUser) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHORIZED_TIE_BREAKER' as GovernanceErrorCode,
            message: 'No senior user available for tie-breaking',
          },
        };
      }

      // Create request
      const { data, error } = await supabase
        .from('tie_break_requests')
        .insert({
          proposal_id: proposalId,
          senior_user_id: seniorUser.user_id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Update proposal status to 'tie'
      await proposalService.updateProposalStatus(proposalId, 'tie');

      // Notify senior user
      await this.notifyTieBreaker(proposalId, seniorUser.user_id);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error creating tie-break request:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to create tie-break request',
          details: error,
        },
      };
    }
  }

  /**
   * Get tie-break request for a proposal
   */
  async getTieBreakRequest(proposalId: string): Promise<TieBreakRequest | null> {
    try {
      const { data, error } = await supabase
        .from('tie_break_requests')
        .select('*')
        .eq('proposal_id', proposalId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching tie-break request:', error);
      return null;
    }
  }

  /**
   * Get all pending tie-break requests for a senior user
   */
  async getPendingTieBreakRequests(seniorUserId: string): Promise<TieBreakRequest[]> {
    try {
      const { data, error} = await supabase
        .from('tie_break_requests')
        .select('*')
        .eq('senior_user_id', seniorUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching pending tie-break requests:', error);
      return [];
    }
  }

  /**
   * Cast tie-breaker vote
   */
  async castTieBreakerVote(
    proposalId: string,
    userId: string,
    voteType: VoteType
  ): Promise<ServiceResponse<void>> {
    try {
      // Verify user is a senior user
      const { data: seniorUser, error: seniorError } = await supabase
        .from('senior_users')
        .select('*')
        .eq('user_id', userId)
        .eq('can_break_ties', true)
        .single();

      if (seniorError || !seniorUser) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHORIZED_TIE_BREAKER' as GovernanceErrorCode,
            message: 'User is not authorized to break ties',
          },
        };
      }

      // Check if tie-break request exists
      const request = await this.getTieBreakRequest(proposalId);
      if (!request || request.senior_user_id !== userId) {
        return {
          success: false,
          error: {
            code: 'TIE_BREAKER_REQUIRED' as GovernanceErrorCode,
            message: 'No tie-break request found for this user',
          },
        };
      }

      if (request.status === 'resolved') {
        return {
          success: false,
          error: {
            code: 'TIE_BREAKER_ALREADY_VOTED' as GovernanceErrorCode,
            message: 'Tie-breaker vote has already been cast',
          },
        };
      }

      // Cast the tie-breaker vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          vote_type: voteType,
          voting_power: 1, // Tie-breaker vote has weight of 1
          is_tie_breaker: true,
        })
        .select()
        .single();

      if (voteError) throw voteError;

      // Update proposal with tie-breaker vote
      await supabase
        .from('proposals')
        .update({
          tie_breaker_vote: voteType,
          tie_breaker_user_id: userId,
        })
        .eq('id', proposalId);

      // Mark request as resolved
      await supabase
        .from('tie_break_requests')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      // Update senior user tie-break count
      await supabase
        .from('senior_users')
        .update({
          tie_breaks_count: seniorUser.tie_breaks_count + 1,
        })
        .eq('user_id', userId);

      // Finalize proposal based on tie-breaker vote
      const newStatus = voteType === 'for' ? 'passed' : 'rejected';
      await proposalService.updateProposalStatus(proposalId, newStatus);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error casting tie-breaker vote:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to cast tie-breaker vote',
          details: error,
        },
      };
    }
  }

  /**
   * Notify senior user of tie-breaker request
   */
  async notifyTieBreaker(proposalId: string, seniorUserId: string): Promise<void> {
    try {
      const proposal = await proposalService.getProposalById(proposalId);
      if (!proposal) return;

      await supabase.from('notifications').insert({
        user_id: seniorUserId,
        type: 'tie_breaker_request',
        title: 'Tie-Breaker Vote Required',
        message: `Your tie-breaking vote is needed for proposal: ${proposal.title}`,
        related_id: proposalId,
        is_read: false,
      });
    } catch (error) {
      console.error('Error notifying tie-breaker:', error);
    }
  }

  /**
   * Check if user is a senior user
   */
  async isSeniorUser(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('senior_users')
        .select('user_id')
        .eq('user_id', userId)
        .eq('can_break_ties', true)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get senior user details
   */
  async getSeniorUserDetails(userId: string): Promise<SeniorUser | null> {
    try {
      const { data, error } = await supabase
        .from('senior_users')
        .select('*')
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
      console.error('Error fetching senior user details:', error);
      return null;
    }
  }

  /**
   * Check and create tie-break requests for proposals that ended in a tie
   */
  async checkAndCreateTieBreakRequests(): Promise<void> {
    try {
      // Get all proposals with tie status that don't have a tie-break request
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select('id')
        .eq('status', 'tie')
        .is('tie_breaker_vote', null);

      if (error) throw error;

      for (const proposal of proposals || []) {
        const hasTie = await this.detectTie(proposal.id);
        if (hasTie) {
          await this.createTieBreakRequest(proposal.id);
        }
      }
    } catch (error) {
      console.error('Error checking for tie-break requests:', error);
    }
  }
}

export const tieBreakerService = new TieBreakerService();
export default tieBreakerService;
