# Governance Token System Design

## Overview

The governance token system provides a democratic decision-making framework for the #GangGreen platform, enabling stakeholders to vote on feature prioritization and platform development. The system operates independently from GG Coins, with governance tokens representing voting power rather than transactional currency. The design follows a Wikipedia-inspired model with simple polling mechanisms and hierarchical tie-breaking.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Governance System                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Token      │  │   Proposal   │  │    Voting    │              │
│  │  Management  │  │  Management  │  │    Engine    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                           │                                          │
│         ┌─────────────────┼─────────────────┐                       │
│         │                 │                 │                       │
│  ┌──────▼────────┐ ┌─────▼─────────┐ ┌────▼────────┐              │
│  │  Tie-Breaking │ │   Petition    │ │  Blockchain │              │
│  │    System     │ │  Management   │ │  Integration│              │
│  └───────────────┘ └───────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────────┐
        │                  │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
   │Supabase │      │ React UI  │     │ Real-time │     │  Polygon  │
   │Database │      │Components │     │Subscriptions│    │Smart Contracts│
   └─────────┘      └───────────┘     └───────────┘     └───────────┘
```

### Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **Blockchain**: Polygon (Mumbai testnet for development, Mainnet for production)
- **Smart Contracts**: Solidity (Petition signature management)
- **Web3 Libraries**: ethers.js for wallet integration and contract interaction
- **State Management**: React Context API
- **Real-time Updates**: Supabase real-time subscriptions
- **Notifications**: Supabase notifications table

## Components and Interfaces

### 1. Token Management Component

**Purpose**: Manages governance token distribution, balances, and earning mechanisms.

**Key Interfaces**:

```typescript
interface GovernanceToken {
  id: string;
  user_id: string;
  balance: number;
  earned_total: number;
  delegated_to: string | null;
  delegated_amount: number;
  created_at: string;
  updated_at: string;
}

interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'delegated' | 'revoked';
  source: string; // e.g., 'tree_planting', 'initiative_creation'
  metadata: Record<string, any>;
  created_at: string;
}

interface TokenEarningRule {
  id: string;
  action_type: string;
  tokens_awarded: number;
  minimum_threshold: number | null;
  is_active: boolean;
}
```

**Service Methods**:

```typescript
class GovernanceTokenService {
  async getBalance(userId: string): Promise<number>
  async awardTokens(userId: string, amount: number, source: string): Promise<void>
  async delegateTokens(fromUserId: string, toUserId: string, amount: number): Promise<void>
  async revokeDelegation(userId: string): Promise<void>
  async getVotingPower(userId: string, proposalId: string): Promise<number>
  async getTransactionHistory(userId: string): Promise<TokenTransaction[]>
}
```

### 2. Proposal Management Component

**Purpose**: Handles proposal creation, lifecycle management, and metadata.

**Key Interfaces**:

```typescript
interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'policy' | 'other';
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'tie' | 'invalid';
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

interface ProposalCategory {
  id: string;
  name: string;
  voting_period_days: number;
  minimum_tokens_to_create: number;
  quorum_percentage: number;
}
```

**Service Methods**:

```typescript
class ProposalService {
  async createProposal(proposal: CreateProposalInput): Promise<Proposal>
  async getActiveProposals(): Promise<Proposal[]>
  async getProposalById(id: string): Promise<Proposal>
  async updateProposalStatus(id: string, status: string): Promise<void>
  async finalizeProposal(id: string): Promise<void>
  async getProposalsByCategory(category: string): Promise<Proposal[]>
  async getProposalHistory(filters: ProposalFilters): Promise<Proposal[]>
}
```

### 3. Voting Engine Component

**Purpose**: Manages vote casting, tallying, and validation.

**Key Interfaces**:

```typescript
interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: 'for' | 'against' | 'abstain';
  voting_power: number;
  is_tie_breaker: boolean;
  created_at: string;
  updated_at: string;
}

interface VotingSnapshot {
  proposal_id: string;
  user_id: string;
  voting_power_at_start: number;
  delegated_power: number;
  total_power: number;
  snapshot_at: string;
}
```

**Service Methods**:

```typescript
class VotingService {
  async castVote(proposalId: string, userId: string, voteType: string): Promise<Vote>
  async updateVote(voteId: string, voteType: string): Promise<Vote>
  async getVotesByProposal(proposalId: string): Promise<Vote[]>
  async getUserVote(proposalId: string, userId: string): Promise<Vote | null>
  async calculateVoteTally(proposalId: string): Promise<VoteTally>
  async createVotingSnapshot(proposalId: string): Promise<void>
  async checkQuorum(proposalId: string): Promise<boolean>
}
```

### 4. Tie-Breaking System Component

**Purpose**: Resolves voting deadlocks through hierarchical authority.

**Key Interfaces**:

```typescript
interface SeniorUser {
  user_id: string;
  seniority_level: number;
  role: string;
  can_break_ties: boolean;
  tie_breaks_count: number;
}

interface TieBreakRequest {
  id: string;
  proposal_id: string;
  senior_user_id: string;
  status: 'pending' | 'resolved';
  created_at: string;
  resolved_at: string | null;
}
```

**Service Methods**:

```typescript
class TieBreakerService {
  async detectTie(proposalId: string): Promise<boolean>
  async getSeniorUser(): Promise<SeniorUser>
  async createTieBreakRequest(proposalId: string): Promise<TieBreakRequest>
  async castTieBreakerVote(proposalId: string, userId: string, voteType: string): Promise<void>
  async notifyTieBreaker(proposalId: string, seniorUserId: string): Promise<void>
}
```

### 5. Petition Management Component

**Purpose**: Manages petition creation, signature collection, and blockchain integration.

**Key Interfaces**:

```typescript
interface Petition {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'policy' | 'urgent' | 'other';
  status: 'active' | 'successful' | 'failed' | 'converted';
  created_by: string;
  created_at: string;
  deadline: string;
  signature_threshold: number;
  current_signatures: number;
  contract_address: string;
  blockchain_tx_hash: string;
  converted_proposal_id: string | null;
}

interface PetitionSignature {
  id: string;
  petition_id: string;
  user_id: string;
  wallet_address: string;
  signature: string;
  blockchain_tx_hash: string;
  signed_at: string;
}

interface PetitionConfig {
  id: string;
  category: string;
  minimum_tokens_to_create: number;
  default_signature_threshold: number;
  maximum_duration_days: number;
  is_active: boolean;
}
```

**Service Methods**:

```typescript
class PetitionService {
  async createPetition(petition: CreatePetitionInput): Promise<Petition>
  async deployPetitionContract(petitionId: string): Promise<string>
  async getActivePetitions(): Promise<Petition[]>
  async getPetitionById(id: string): Promise<Petition>
  async signPetition(petitionId: string, userId: string, walletAddress: string): Promise<PetitionSignature>
  async verifySignature(petitionId: string, signature: string): Promise<boolean>
  async checkThreshold(petitionId: string): Promise<boolean>
  async convertToProposal(petitionId: string): Promise<string>
  async getPetitionSignatures(petitionId: string): Promise<PetitionSignature[]>
}
```

### 6. Blockchain Integration Component

**Purpose**: Handles Web3 wallet connections and smart contract interactions.

**Key Interfaces**:

```typescript
interface Web3Connection {
  provider: ethers.providers.Web3Provider;
  signer: ethers.Signer;
  address: string;
  chainId: number;
}

interface ContractInteraction {
  contract: ethers.Contract;
  method: string;
  params: any[];
  gasEstimate: ethers.BigNumber;
}
```

**Service Methods**:

```typescript
class Web3Service {
  async connectWallet(): Promise<Web3Connection>
  async signMessage(message: string): Promise<string>
  async deployPetitionContract(petitionData: any): Promise<string>
  async signPetitionOnChain(contractAddress: string, petitionId: string): Promise<string>
  async verifySignatureOnChain(contractAddress: string, signature: string): Promise<boolean>
  async getPetitionSigners(contractAddress: string): Promise<string[]>
  async listenToSignatureEvents(contractAddress: string, callback: Function): Promise<void>
}
```

## Data Models

### Database Schema

```sql
-- Governance tokens table
CREATE TABLE governance_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  earned_total INTEGER NOT NULL DEFAULT 0,
  delegated_to UUID REFERENCES users(id) ON DELETE SET NULL,
  delegated_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Token transactions table
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'delegated', 'revoked')),
  source VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'policy', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'tie', 'invalid')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_starts_at TIMESTAMP WITH TIME ZONE,
  voting_ends_at TIMESTAMP WITH TIME ZONE,
  quorum_required INTEGER NOT NULL,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  votes_abstain INTEGER NOT NULL DEFAULT 0,
  total_voting_power INTEGER NOT NULL DEFAULT 0,
  tie_breaker_vote VARCHAR(10) CHECK (tie_breaker_vote IN ('for', 'against')),
  tie_breaker_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  implementation_timeline TEXT
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
  voting_power INTEGER NOT NULL,
  is_tie_breaker BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Voting snapshots table
CREATE TABLE voting_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  voting_power_at_start INTEGER NOT NULL,
  delegated_power INTEGER NOT NULL DEFAULT 0,
  total_power INTEGER NOT NULL,
  snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Senior users table
CREATE TABLE senior_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  seniority_level INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL,
  can_break_ties BOOLEAN DEFAULT TRUE,
  tie_breaks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposal categories configuration
CREATE TABLE proposal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  voting_period_days INTEGER NOT NULL DEFAULT 7,
  minimum_tokens_to_create INTEGER NOT NULL DEFAULT 100,
  quorum_percentage INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE
);

-- Token earning rules
CREATE TABLE token_earning_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(100) UNIQUE NOT NULL,
  tokens_awarded INTEGER NOT NULL,
  minimum_threshold INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Petitions table
CREATE TABLE petitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'policy', 'urgent', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'successful', 'failed', 'converted')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  signature_threshold INTEGER NOT NULL,
  current_signatures INTEGER NOT NULL DEFAULT 0,
  contract_address VARCHAR(42),
  blockchain_tx_hash VARCHAR(66),
  converted_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL
);

-- Petition signatures table
CREATE TABLE petition_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petition_id UUID REFERENCES petitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  signature TEXT NOT NULL,
  blockchain_tx_hash VARCHAR(66) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(petition_id, user_id),
  UNIQUE(petition_id, wallet_address)
);

-- Petition configuration table
CREATE TABLE petition_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) UNIQUE NOT NULL,
  minimum_tokens_to_create INTEGER NOT NULL DEFAULT 50,
  default_signature_threshold INTEGER NOT NULL DEFAULT 100,
  maximum_duration_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE
);
```

### Indexes

```sql
CREATE INDEX idx_governance_tokens_user ON governance_tokens(user_id);
CREATE INDEX idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_proposals_voting_ends ON proposals(voting_ends_at);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_voting_snapshots_proposal ON voting_snapshots(proposal_id);
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_petitions_deadline ON petitions(deadline);
CREATE INDEX idx_petition_signatures_petition ON petition_signatures(petition_id);
CREATE INDEX idx_petition_signatures_user ON petition_signatures(user_id);
CREATE INDEX idx_petition_signatures_wallet ON petition_signatures(wallet_address);
```

### Smart Contract Schema

**PetitionContract.sol**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PetitionContract {
    struct Petition {
        string petitionId;
        string title;
        uint256 signatureThreshold;
        uint256 deadline;
        uint256 signatureCount;
        bool isActive;
    }
    
    Petition public petition;
    mapping(address => bool) public hasSigned;
    address[] public signers;
    
    event PetitionSigned(address indexed signer, uint256 timestamp);
    event PetitionThresholdReached(uint256 signatureCount, uint256 timestamp);
    
    constructor(
        string memory _petitionId,
        string memory _title,
        uint256 _signatureThreshold,
        uint256 _deadline
    ) {
        petition = Petition({
            petitionId: _petitionId,
            title: _title,
            signatureThreshold: _signatureThreshold,
            deadline: _deadline,
            signatureCount: 0,
            isActive: true
        });
    }
    
    function signPetition() external {
        require(petition.isActive, "Petition is not active");
        require(block.timestamp <= petition.deadline, "Petition deadline has passed");
        require(!hasSigned[msg.sender], "Already signed this petition");
        
        hasSigned[msg.sender] = true;
        signers.push(msg.sender);
        petition.signatureCount++;
        
        emit PetitionSigned(msg.sender, block.timestamp);
        
        if (petition.signatureCount >= petition.signatureThreshold) {
            emit PetitionThresholdReached(petition.signatureCount, block.timestamp);
        }
    }
    
    function getSigners() external view returns (address[] memory) {
        return signers;
    }
    
    function hasUserSigned(address user) external view returns (bool) {
        return hasSigned[user];
    }
    
    function getPetitionStatus() external view returns (
        uint256 signatureCount,
        uint256 signatureThreshold,
        uint256 deadline,
        bool isActive
    ) {
        return (
            petition.signatureCount,
            petition.signatureThreshold,
            petition.deadline,
            petition.isActive
        );
    }
}
```

## Error Handling

### Error Types

```typescript
enum GovernanceErrorCode {
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  INVALID_PROPOSAL = 'INVALID_PROPOSAL',
  VOTING_CLOSED = 'VOTING_CLOSED',
  ALREADY_VOTED = 'ALREADY_VOTED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  QUORUM_NOT_MET = 'QUORUM_NOT_MET',
  INVALID_DELEGATION = 'INVALID_DELEGATION',
  CIRCULAR_DELEGATION = 'CIRCULAR_DELEGATION',
  TIE_BREAKER_REQUIRED = 'TIE_BREAKER_REQUIRED'
}

class GovernanceError extends Error {
  constructor(
    public code: GovernanceErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

### Error Handling Strategy

1. **Token Insufficient**: Display clear message with current balance and required amount
2. **Voting Closed**: Show proposal status and final results
3. **Quorum Not Met**: Explain quorum requirements and current participation
4. **Delegation Errors**: Validate delegation chains and prevent circular references
5. **Tie-Breaking**: Automatically notify senior user and display pending status

## Testing Strategy

### Unit Tests

- Token earning calculations
- Voting power calculations with delegation
- Quorum validation logic
- Tie detection algorithm
- Proposal status transitions

### Integration Tests

- End-to-end proposal creation and voting flow
- Token delegation and revocation
- Tie-breaker notification and resolution
- Real-time vote tally updates
- Proposal finalization and status updates

### Test Scenarios

1. **Basic Voting Flow**
   - Create proposal
   - Cast votes from multiple users
   - Verify vote tallies
   - Finalize proposal

2. **Delegation Flow**
   - Delegate voting power
   - Verify delegated votes count correctly
   - Revoke delegation
   - Verify voting power returns

3. **Tie-Breaking Flow**
   - Create evenly split vote
   - Trigger tie-breaker notification
   - Senior user casts deciding vote
   - Verify proposal finalization

4. **Quorum Validation**
   - Create proposal with low participation
   - Verify quorum not met
   - Mark proposal as invalid

5. **Token Earning**
   - Complete qualifying action
   - Verify tokens awarded
   - Check transaction history

## UI Components

### 1. Governance Dashboard

- Display user's governance token balance
- Show active proposals requiring votes
- Display voting history
- Show delegation status

### 2. Proposal List View

- Filter by category, status, date
- Sort by votes, recency, ending soon
- Display vote tallies and participation rate
- Show time remaining for active proposals

### 3. Proposal Detail View

- Full proposal description
- Vote distribution chart
- Cast/update vote interface
- Comments and discussion thread
- Implementation timeline (if passed)

### 4. Create Proposal Form

- Title and description fields
- Category selection
- Impact estimation
- Token balance validation
- Preview before submission

### 5. Token Management Panel

- Current balance display
- Earning history
- Delegation interface
- Transaction log

### 6. Tie-Breaker Interface (Senior Users Only)

- List of proposals requiring tie-breaking
- Proposal details and vote distribution
- Cast tie-breaker vote
- View tie-breaking history

### 7. Petition List View

- Display active petitions with progress bars
- Filter by category, status, deadline
- Show signature count and threshold
- Display time remaining for active petitions

### 8. Petition Detail View

- Full petition description
- Signature progress visualization
- List of signers with wallet addresses
- Sign petition button with Web3 wallet integration
- Blockchain verification link

### 9. Create Petition Form

- Title and description fields
- Category selection
- Signature threshold input
- Deadline picker
- Token balance validation
- Preview before blockchain deployment

## Real-time Features

### Supabase Real-time Subscriptions

```typescript
// Subscribe to vote updates
supabase
  .channel('proposal-votes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'votes',
    filter: `proposal_id=eq.${proposalId}`
  }, handleVoteUpdate)
  .subscribe();

// Subscribe to proposal status changes
supabase
  .channel('proposal-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'proposals'
  }, handleProposalUpdate)
  .subscribe();
```

## Security Considerations

1. **Vote Integrity**: Votes are immutable once cast (only updateable, not deletable)
2. **Token Security**: Governance tokens cannot be transferred between users (only delegated)
3. **Proposal Validation**: Minimum token threshold prevents spam proposals
4. **Tie-Breaker Authority**: Role-based access control for senior users
5. **Delegation Validation**: Prevent circular delegation chains
6. **Audit Trail**: All actions logged with timestamps and user IDs

## Performance Optimization

1. **Caching**: Cache active proposals and vote tallies
2. **Indexing**: Database indexes on frequently queried fields
3. **Pagination**: Paginate proposal lists and voting history
4. **Aggregation**: Pre-calculate vote tallies on vote cast
5. **Real-time Throttling**: Debounce real-time updates to prevent UI thrashing

## Integration with Existing Systems

### GG Coins Integration

- Separate token balances displayed side-by-side
- Clear labeling: "GG Coins (Rewards)" vs "Governance Tokens (Voting)"
- No conversion between token types
- Shared user profile display

### Gamification Integration

- Governance participation counts toward engagement metrics
- Achievements for proposal creation and voting
- Leaderboard for most active governance participants

### Notification Integration

- New proposal notifications
- Voting reminder notifications
- Tie-breaker request notifications
- Proposal outcome notifications
- New petition notifications
- Petition signature milestone notifications
- Petition threshold reached notifications
- Petition-to-proposal conversion notifications

### Blockchain Integration

- Web3 wallet connection for petition signing
- Smart contract deployment for each petition
- On-chain signature verification
- Event listening for real-time signature updates
- Gas estimation and transaction management
