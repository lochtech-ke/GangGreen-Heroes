import { supabase } from './supabase';
import { governanceTokenService } from './governanceToken.service';
import type {
  Proposal,
  CreateProposalInput,
  ProposalFilters,
  ProposalCategory,
  ProposalStatus,
  GovernanceErrorCode,
  ServiceResponse,
  PaginatedResponse,
  PaginationParams,
} from '../types/governance.types';

/**
 * Proposal Management Service
 * 
 * Handles proposal creation, lifecycle management, and filtering.
 */
class ProposalService {
  /**
   * Create a new proposal
   */
  async createProposal(
    userId: string,
    input: CreateProposalInput
  ): Promise<ServiceResponse<Proposal>> {
    try {
      // Validate user has minimum tokens
      const balance = await governanceTokenService.getBalance(userId);
      const minTokens = await this.getMinimumTokensForCategory(input.category);

      if (balance < minTokens) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_TOKENS' as GovernanceErrorCode,
            message: `Minimum ${minTokens} governance tokens required to create a proposal`,
          },
        };
      }

      // Get category configuration
      const categoryConfig = await this.getCategoryConfig(input.category);
      if (!categoryConfig) {
        return {
          success: false,
          error: {
            code: 'INVALID_PROPOSAL' as GovernanceErrorCode,
            message: 'Invalid proposal category',
          },
        };
      }

      // Calculate voting period
      const votingStartsAt = new Date();
      const votingEndsAt = new Date();
      votingEndsAt.setDate(votingEndsAt.getDate() + categoryConfig.voting_period_days);

      // Create proposal
      const { data, error } = await supabase
        .from('proposals')
        .insert({
          title: input.title,
          description: input.description,
          category: input.category,
          status: 'active',
          created_by: userId,
          voting_starts_at: votingStartsAt.toISOString(),
          voting_ends_at: votingEndsAt.toISOString(),
          quorum_required: categoryConfig.quorum_percentage,
          implementation_timeline: input.implementation_timeline,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error creating proposal:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to create proposal',
          details: error,
        },
      };
    }
  }

  /**
   * Get proposal by ID
   */
  async getProposalById(proposalId: string): Promise<Proposal | null> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  /**
   * Get active proposals
   */
  async getActiveProposals(): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching active proposals:', error);
      return [];
    }
  }

  /**
   * Get proposals with filters and pagination
   */
  async getProposals(
    filters?: ProposalFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Proposal>> {
    try {
      let query = supabase.from('proposals').select('*', { count: 'exact' });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply sorting
      const sortBy = pagination?.sort_by || 'created_at';
      const sortOrder = pagination?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      };
    }
  }

  /**
   * Get proposals by category
   */
  async getProposalsByCategory(category: ProposalCategory): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching proposals by category:', error);
      return [];
    }
  }

  /**
   * Update proposal status
   */
  async updateProposalStatus(
    proposalId: string,
    status: ProposalStatus
  ): Promise<ServiceResponse<Proposal>> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error updating proposal status:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to update proposal status',
          details: error,
        },
      };
    }
  }

  /**
   * Finalize proposal based on voting results
   */
  async finalizeProposal(proposalId: string): Promise<ServiceResponse<Proposal>> {
    try {
      const proposal = await this.getProposalById(proposalId);
      if (!proposal) {
        return {
          success: false,
          error: {
            code: 'PROPOSAL_NOT_FOUND' as GovernanceErrorCode,
            message: 'Proposal not found',
          },
        };
      }

      // Check if voting period has ended
      const now = new Date();
      const votingEnds = new Date(proposal.voting_ends_at);
      if (now < votingEnds) {
        return {
          success: false,
          error: {
            code: 'VOTING_CLOSED' as GovernanceErrorCode,
            message: 'Voting period has not ended yet',
          },
        };
      }

      // Check quorum
      const totalTokens = await this.getTotalGovernanceTokens();
      const participationRate = (proposal.total_voting_power / totalTokens) * 100;
      const quorumMet = participationRate >= proposal.quorum_required;

      let newStatus: ProposalStatus;

      if (!quorumMet) {
        newStatus = 'invalid';
      } else if (proposal.votes_for === proposal.votes_against) {
        newStatus = 'tie';
      } else if (proposal.votes_for > proposal.votes_against) {
        newStatus = 'passed';
      } else {
        newStatus = 'rejected';
      }

      return await this.updateProposalStatus(proposalId, newStatus);
    } catch (error) {
      console.error('Error finalizing proposal:', error);
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR' as GovernanceErrorCode,
          message: 'Failed to finalize proposal',
          details: error,
        },
      };
    }
  }

  /**
   * Get category configuration
   */
  private async getCategoryConfig(category: ProposalCategory) {
    try {
      const { data, error } = await supabase
        .from('proposal_categories')
        .select('*')
        .eq('name', category)
        .eq('is_active', true)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error fetching category config:', error);
      return null;
    }
  }

  /**
   * Get minimum tokens required for category
   */
  private async getMinimumTokensForCategory(category: ProposalCategory): Promise<number> {
    const config = await this.getCategoryConfig(category);
    return config?.minimum_tokens_to_create || 100;
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
   * Check if voting period is active
   */
  async isVotingActive(proposalId: string): Promise<boolean> {
    const proposal = await this.getProposalById(proposalId);
    if (!proposal) return false;

    const now = new Date();
    const votingStarts = new Date(proposal.voting_starts_at);
    const votingEnds = new Date(proposal.voting_ends_at);

    return now >= votingStarts && now <= votingEnds && proposal.status === 'active';
  }
}

export const proposalService = new ProposalService();
export default proposalService;
