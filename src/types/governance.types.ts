/**
 * Governance Token System Types
 * 
 * Type definitions for the governance token system including tokens,
 * proposals, voting, petitions, and Web3 integration.
 */

// ============================================================================
// Governance Token Types
// ============================================================================

export interface GovernanceToken {
  id: string;
  user_id: string;
  balance: number;
  earned_total: number;
  delegated_to: string | null;
  delegated_amount: number;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'delegated' | 'revoked';
  source: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TokenEarningRule {
  id: string;
  action_type: string;
  tokens_awarded: number;
  minimum_threshold: number | null;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// Proposal Types
// ============================================================================

export type ProposalCategory = 'feature' | 'improvement' | 'policy' | 'other';
export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'tie' | 'invalid';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  status: ProposalStatus;
  created_by: string;
  created_at: string;
  voting_starts_at: string;
  voting_ends_at: string;
  quorum_required: number;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_voting_power: number;
  tie_breaker_vote: 'for' | 'against' | null;
  tie_breaker_user_id: string | null;
  implementation_timeline: string | null;
}

export interface ProposalCategoryConfig {
  id: string;
  name: string;
  voting_period_days: number;
  minimum_tokens_to_create: number;
  quorum_percentage: number;
  is_active: boolean;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  category: ProposalCategory;
  implementation_timeline?: string;
}

export interface ProposalFilters {
  category?: ProposalCategory;
  status?: ProposalStatus;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Voting Types
// ============================================================================

export type VoteType = 'for' | 'against' | 'abstain';

export interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: VoteType;
  voting_power: number;
  is_tie_breaker: boolean;
  created_at: string;
  updated_at: string;
}

export interface VotingSnapshot {
  id: string;
  proposal_id: string;
  user_id: string;
  voting_power_at_start: number;
  delegated_power: number;
  total_power: number;
  snapshot_at: string;
}

export interface VoteTally {
  proposal_id: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_voting_power: number;
  participation_rate: number;
  quorum_met: boolean;
}

// ============================================================================
// Tie-Breaker Types
// ============================================================================

export interface SeniorUser {
  user_id: string;
  seniority_level: number;
  role: string;
  can_break_ties: boolean;
  tie_breaks_count: number;
  created_at: string;
}

export interface TieBreakRequest {
  id: string;
  proposal_id: string;
  senior_user_id: string;
  status: 'pending' | 'resolved';
  created_at: string;
  resolved_at: string | null;
}

// ============================================================================
// Petition Types
// ============================================================================

export type PetitionCategory = 'feature' | 'improvement' | 'policy' | 'urgent' | 'other';
export type PetitionStatus = 'active' | 'successful' | 'failed' | 'converted';

export interface Petition {
  id: string;
  title: string;
  description: string;
  category: PetitionCategory;
  status: PetitionStatus;
  created_by: string;
  created_at: string;
  deadline: string;
  signature_threshold: number;
  current_signatures: number;
  contract_address: string;
  blockchain_tx_hash: string;
  converted_proposal_id: string | null;
}

export interface PetitionSignature {
  id: string;
  petition_id: string;
  user_id: string;
  wallet_address: string;
  signature: string;
  blockchain_tx_hash: string;
  signed_at: string;
}

export interface PetitionConfig {
  id: string;
  category: string;
  minimum_tokens_to_create: number;
  default_signature_threshold: number;
  maximum_duration_days: number;
  is_active: boolean;
}

export interface CreatePetitionInput {
  title: string;
  description: string;
  category: PetitionCategory;
  signature_threshold: number;
  deadline: string;
}

export interface PetitionFilters {
  category?: PetitionCategory;
  status?: PetitionStatus;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Web3 Integration Types
// ============================================================================

export interface Web3Connection {
  provider: any; // ethers.providers.Web3Provider
  signer: any; // ethers.Signer
  address: string;
  chainId: number;
  isConnected: boolean;
}

export interface ContractInteraction {
  contract: any; // ethers.Contract
  method: string;
  params: any[];
  gasEstimate: string;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  blockNumber: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// ============================================================================
// Error Types
// ============================================================================

export enum GovernanceErrorCode {
  // Token Errors
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  INVALID_TOKEN_AMOUNT = 'INVALID_TOKEN_AMOUNT',
  TOKEN_TRANSFER_FAILED = 'TOKEN_TRANSFER_FAILED',
  
  // Proposal Errors
  INVALID_PROPOSAL = 'INVALID_PROPOSAL',
  PROPOSAL_NOT_FOUND = 'PROPOSAL_NOT_FOUND',
  PROPOSAL_ALREADY_EXISTS = 'PROPOSAL_ALREADY_EXISTS',
  PROPOSAL_EXPIRED = 'PROPOSAL_EXPIRED',
  
  // Voting Errors
  VOTING_CLOSED = 'VOTING_CLOSED',
  VOTING_NOT_STARTED = 'VOTING_NOT_STARTED',
  ALREADY_VOTED = 'ALREADY_VOTED',
  INVALID_VOTE_TYPE = 'INVALID_VOTE_TYPE',
  INSUFFICIENT_VOTING_POWER = 'INSUFFICIENT_VOTING_POWER',
  
  // Quorum Errors
  QUORUM_NOT_MET = 'QUORUM_NOT_MET',
  INVALID_QUORUM = 'INVALID_QUORUM',
  
  // Delegation Errors
  INVALID_DELEGATION = 'INVALID_DELEGATION',
  CIRCULAR_DELEGATION = 'CIRCULAR_DELEGATION',
  DELEGATION_NOT_FOUND = 'DELEGATION_NOT_FOUND',
  CANNOT_DELEGATE_TO_SELF = 'CANNOT_DELEGATE_TO_SELF',
  
  // Tie-Breaker Errors
  TIE_BREAKER_REQUIRED = 'TIE_BREAKER_REQUIRED',
  NOT_AUTHORIZED_TIE_BREAKER = 'NOT_AUTHORIZED_TIE_BREAKER',
  TIE_BREAKER_ALREADY_VOTED = 'TIE_BREAKER_ALREADY_VOTED',
  
  // Petition Errors
  PETITION_NOT_FOUND = 'PETITION_NOT_FOUND',
  PETITION_EXPIRED = 'PETITION_EXPIRED',
  PETITION_ALREADY_SIGNED = 'PETITION_ALREADY_SIGNED',
  PETITION_THRESHOLD_NOT_MET = 'PETITION_THRESHOLD_NOT_MET',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  
  // Web3 Errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_INTERACTION_FAILED = 'CONTRACT_INTERACTION_FAILED',
  
  // Authorization Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class GovernanceError extends Error {
  constructor(
    public code: GovernanceErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GovernanceError';
  }
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: GovernanceErrorCode;
    message: string;
    details?: any;
  };
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'new_proposal'
  | 'voting_reminder'
  | 'proposal_outcome'
  | 'tie_breaker_request'
  | 'new_petition'
  | 'petition_milestone'
  | 'petition_threshold_reached'
  | 'petition_converted';

export interface GovernanceNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id: string; // proposal_id or petition_id
  is_read: boolean;
  created_at: string;
}
