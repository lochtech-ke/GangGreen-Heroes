# #GangGreen Platform - Technical Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Smart Contracts](#smart-contracts)
6. [Component Architecture](#component-architecture)
7. [Service Layer](#service-layer)
8. [Authentication & Authorization](#authentication--authorization)
9. [Web3 Integration](#web3-integration)
10. [Deployment](#deployment)

---

## Architecture Overview

#GangGreen follows a modern full-stack architecture with:

- **Frontend**: React 18+ with TypeScript, built with Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time subscriptions)
- **Blockchain**: Ethereum/Polygon for Web3 features (NFT badges, crypto donations) - *Planned*
- **External APIs**: Antugrow API for AI-powered tree monitoring - *Planned*

### Current Implementation Status

**✅ Completed:**
- React 18.2.0 + TypeScript 5.2.2 setup
- Vite 5.0.8 build configuration
- Tailwind CSS 3.4.0 styling framework
- Supabase client 2.39.0 integration
- React Router 6.21.0 for routing
- ESLint + Prettier code quality tools
- Basic project structure with placeholder directories

**🚧 In Progress:**
- Database schema design and implementation
- Row Level Security policies

**📋 Planned:**
- Authentication system
- UI component library
- Service layer implementation
- Web3 integration
- Smart contracts
- Antugrow API integration

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React + TS)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Dashboard │  │Initiatives│  │Marketplace│   │
│  │ (Planned)│  │(Planned) │  │ (Planned) │  │ (Planned) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│   Supabase     │  │  Antugrow API  │  │  Blockchain │
│  (Configured)  │  │   (Planned)    │  │  (Planned)  │
└────────────────┘  └────────────────┘  └─────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool & dev server |
| Tailwind CSS | 3+ | Styling framework |
| React Router | 6+ | Client-side routing |
| Leaflet.js | 1.9+ | Interactive maps |
| Recharts | 2+ | Data visualization |
| ethers.js | 6+ | Web3 interactions |

### Backend Technologies

| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Primary database |
| PostGIS | Geospatial data extension |
| Supabase Auth | Authentication & authorization |
| Supabase Storage | File storage (images, documents) |
| Supabase Realtime | Live data subscriptions |

### Blockchain Technologies

| Technology | Purpose |
|------------|---------|
| Solidity | Smart contract language |
| Hardhat | Smart contract development |
| Polygon | Layer 2 blockchain network |
| IPFS | Decentralized storage for NFT metadata |

---

## Database Schema

**Status**: ✅ Schema Complete - 9 migrations created with 19 tables

**Completed**: 
1. ✅ SQL migration scripts created (001-009)
2. ✅ All 19 tables defined with proper constraints
3. ✅ Performance indexes configured
4. ✅ Triggers for automatic timestamp updates
5. ✅ PostGIS extension for geospatial data

**Next Steps**: 
1. Execute migrations in Supabase dashboard
2. Configure Row Level Security policies (Task 2.2)
3. Set up storage buckets (Task 2.3)
4. Test database connections

### Core Tables

#### users
**Status**: ✅ Migration created (001_create_users_and_profiles.sql)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'organization', 'community', 'individual')),
  forest_preference TEXT CHECK (forest_preference IN ('kakamega', 'karura', 'mau')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_profiles
**Status**: ✅ Migration created (001_create_users_and_profiles.sql)

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  location TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### initiatives
**Status**: ✅ Migration created (002_create_initiatives.sql)

```sql
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  target_trees INTEGER NOT NULL CHECK (target_trees > 0),
  trees_planted INTEGER DEFAULT 0 CHECK (trees_planted >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  area_hectares DECIMAL(10, 2) CHECK (area_hectares > 0),
  organization_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);
```

#### initiative_participants
**Status**: ✅ Migration created (002_create_initiatives.sql)

```sql
CREATE TABLE initiative_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trees_contributed INTEGER DEFAULT 0 CHECK (trees_contributed >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, user_id)
);
```

#### trees
**Status**: ✅ Migration created (003_create_trees.sql)

```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  planted_date DATE NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  planted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  antugrow_id TEXT UNIQUE,
  current_height_cm DECIMAL(10, 2) CHECK (current_height_cm >= 0),
  current_diameter_cm DECIMAL(10, 2) CHECK (current_diameter_cm >= 0),
  health_status TEXT CHECK (health_status IN ('healthy', 'stressed', 'diseased', 'dead')),
  last_monitored TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### tree_images
**Status**: ✅ Migration created (003_create_trees.sql)

```sql
CREATE TABLE tree_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  antugrow_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### carbon_credits
**Status**: ✅ Migration created (004_create_carbon_credits.sql)

```sql
CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  quantity_tons DECIMAL(10, 2) NOT NULL CHECK (quantity_tons > 0),
  price_per_ton DECIMAL(10, 2) NOT NULL CHECK (price_per_ton > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'KES', 'EUR')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_certificate_url TEXT,
  available_quantity DECIMAL(10, 2) NOT NULL CHECK (available_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_available_quantity CHECK (available_quantity <= quantity_tons)
);
```

#### transactions
**Status**: ✅ Migration created (004_create_carbon_credits.sql)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  credit_id UUID REFERENCES carbon_credits(id) ON DELETE SET NULL,
  quantity_tons DECIMAL(10, 2) NOT NULL CHECK (quantity_tons > 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_url TEXT
);
```

### Web3 Tables

#### web3_wallets
**Status**: ✅ Migration created (006_create_web3_tables.sql)

```sql
CREATE TABLE web3_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  chain_id INTEGER NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('ethereum', 'polygon', 'mumbai', 'sepolia')),
  is_primary BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, wallet_address)
);
```

#### crypto_donations
**Status**: ✅ Migration created (006_create_web3_tables.sql)

```sql
CREATE TABLE crypto_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  initiative_id UUID REFERENCES initiatives(id) ON DELETE SET NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('ETH', 'MATIC', 'USDC', 'USDT')),
  amount_usd DECIMAL(10, 2),
  transaction_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT,
  chain_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);
```

#### nft_badges
**Status**: ✅ Migration created (007_create_nft_badges.sql)

```sql
CREATE TABLE nft_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('tree_planter', 'donor', 'monitor', 'ambassador', 'legend')),
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  rarity_score INTEGER DEFAULT 0 CHECK (rarity_score >= 0),
  transaction_hash TEXT NOT NULL,
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attributes JSONB,
  UNIQUE(contract_address, token_id)
);
```

#### badge_criteria
**Status**: ✅ Migration created (007_create_nft_badges.sql)

```sql
CREATE TABLE badge_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_type TEXT NOT NULL,
  tier TEXT NOT NULL,
  required_points INTEGER NOT NULL CHECK (required_points >= 0),
  required_trees_planted INTEGER DEFAULT 0 CHECK (required_trees_planted >= 0),
  required_donations_made INTEGER DEFAULT 0 CHECK (required_donations_made >= 0),
  required_trees_monitored INTEGER DEFAULT 0 CHECK (required_trees_monitored >= 0),
  required_referrals INTEGER DEFAULT 0 CHECK (required_referrals >= 0),
  max_supply INTEGER CHECK (max_supply > 0),
  current_supply INTEGER DEFAULT 0 CHECK (current_supply >= 0),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_type, tier),
  CONSTRAINT valid_supply CHECK (max_supply IS NULL OR current_supply <= max_supply)
);
```

### Gamification Tables

#### user_gamification
**Status**: ✅ Migration created (008_create_gamification.sql)

```sql
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  experience_to_next_level INTEGER DEFAULT 100 CHECK (experience_to_next_level >= 0),
  rank_global INTEGER,
  rank_forest INTEGER,
  badges_earned INTEGER DEFAULT 0 CHECK (badges_earned >= 0),
  achievements_unlocked INTEGER DEFAULT 0 CHECK (achievements_unlocked >= 0),
  referrals_count INTEGER DEFAULT 0 CHECK (referrals_count >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### gamified_actions
**Status**: ✅ Migration created (008_create_gamification.sql)

```sql
CREATE TABLE gamified_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('tree_plant', 'donation', 'monitor', 'referral', 'share', 'verify')),
  points_awarded INTEGER NOT NULL CHECK (points_awarded >= 0),
  multiplier DECIMAL(3, 2) DEFAULT 1.0 CHECK (multiplier > 0),
  description TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### achievements
**Status**: ✅ Migration created (008_create_gamification.sql)

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  points_reward INTEGER NOT NULL CHECK (points_reward >= 0),
  action_type TEXT NOT NULL,
  required_count INTEGER NOT NULL CHECK (required_count > 0),
  timeframe TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_achievements
**Status**: ✅ Migration created (008_create_gamification.sql)

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### challenge_quests
**Status**: ✅ Migration created (009_create_quests_and_referrals.sql)

```sql
CREATE TABLE challenge_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forest TEXT CHECK (forest IN ('kakamega', 'karura', 'mau')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  objectives JSONB NOT NULL,
  rewards JSONB NOT NULL,
  participants_count INTEGER DEFAULT 0 CHECK (participants_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_quest_dates CHECK (end_date > start_date)
);
```

#### quest_participants
**Status**: ✅ Migration created (009_create_quests_and_referrals.sql)

```sql
CREATE TABLE quest_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES challenge_quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress JSONB,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);
```

#### referrals
**Status**: ✅ Migration created (009_create_quests_and_referrals.sql)

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referee_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referee_id)
);
```

### Supporting Tables

#### notifications
**Status**: ✅ Migration created (005_create_notifications.sql)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('initiative', 'milestone', 'transaction', 'system', 'achievement', 'quest')),
  read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

**Status**: ✅ All indexes created in migration files

```sql
-- Geospatial indexes (PostGIS)
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);
CREATE INDEX idx_trees_location ON trees USING GIST(location);

-- Forest filtering
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_challenge_quests_forest ON challenge_quests(forest);

-- Status queries
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_trees_health_status ON trees(health_status);
CREATE INDEX idx_carbon_credits_verification_status ON carbon_credits(verification_status);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_crypto_donations_status ON crypto_donations(status);

-- User relationships
CREATE INDEX idx_initiatives_organization ON initiatives(organization_id);
CREATE INDEX idx_trees_planted_by ON trees(planted_by);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_web3_wallets_user ON web3_wallets(user_id);

-- Gamification indexes
CREATE INDEX idx_user_gamification_points ON user_gamification(total_points DESC);
CREATE INDEX idx_user_gamification_level ON user_gamification(level DESC);
CREATE INDEX idx_gamified_actions_user ON gamified_actions(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Web3 indexes
CREATE INDEX idx_crypto_donations_tx_hash ON crypto_donations(transaction_hash);
CREATE INDEX idx_nft_badges_owner ON nft_badges(owner_address);
CREATE INDEX idx_nft_badges_user ON nft_badges(user_id);

-- Date-based indexes
CREATE INDEX idx_trees_planted_date ON trees(planted_date);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_web3_wallets_primary ON web3_wallets(user_id, is_primary) WHERE is_primary = TRUE;
```

---

## Type Definitions

**Status**: ✅ User types implemented (Task 3.1 Complete)

### User Types (`src/types/user.types.ts`)

```typescript
// User roles in the system
export type UserRole = 'admin' | 'organization' | 'community' | 'individual';

// Forest preferences for users
export type ForestPreference = 'kakamega' | 'karura' | 'mau';

// User profile information
export interface UserProfile {
  full_name: string;
  phone?: string;
  organization?: string;
  location?: string;
  avatar_url?: string;
}

// Complete user object
export interface User {
  id: string;
  email: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  created_at: string;
  profile?: UserProfile;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  phone?: string;
  organization?: string;
  location?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Authentication response
export interface AuthResponse {
  user: User | null;
  error: Error | null;
}
```

**Type Exports** (`src/types/index.ts`):
```typescript
export type {
  User,
  UserProfile,
  UserRole,
  ForestPreference,
  RegisterData,
  LoginCredentials,
  AuthResponse,
} from './user.types';
```

---

## API Documentation

**Status**: 🚧 In Progress - Authentication service implemented, other services planned

### Supabase Service Layer

#### Authentication Service (`src/services/auth.service.ts`)

**Status**: ✅ Implemented (Task 3.1 Complete)

**Implementation**:

```typescript
import { supabase } from './supabase';
import type {
  User,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  UserRole,
} from '../types/user.types';

class AuthService {
  // Register new user with profile creation
  async register(data: RegisterData): Promise<AuthResponse>
  
  // Login with email/password
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  
  // Logout current user
  async logout(): Promise<{ error: Error | null }>
  
  // Get current authenticated user with profile
  async getCurrentUser(): Promise<User | null>
  
  // Get current session
  async getSession(): Promise<Session | null>
  
  // Request password reset email
  async requestPasswordReset(email: string): Promise<{ error: Error | null }>
  
  // Update password
  async updatePassword(newPassword: string): Promise<{ error: Error | null }>
  
  // Role-based access control
  hasRole(user: User | null, role: UserRole): boolean
  hasAnyRole(user: User | null, roles: UserRole[]): boolean
  isAdmin(user: User | null): boolean
  isOrganization(user: User | null): boolean
  
  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void)
}

export const authService = new AuthService();
```

**Usage Examples**:

```typescript
// Register a new user
const { user, error } = await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123',
  full_name: 'John Doe',
  role: 'individual',
  forest_preference: 'kakamega',
});

// Login
const { user, error } = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123',
});

// Get current user
const user = await authService.getCurrentUser();

// Check roles
if (authService.isAdmin(user)) {
  // Admin-only functionality
}

// Subscribe to auth changes
const { data } = authService.onAuthStateChange((user) => {
  console.log('Auth state changed:', user);
});
```

**Features**:
- ✅ User registration with automatic profile creation
- ✅ Three-step registration (auth user → users table → user_profiles table)
- ✅ Rollback on failure to maintain data integrity
- ✅ Login with email/password
- ✅ Session management
- ✅ Password reset flow
- ✅ Role-based access control helpers
- ✅ Auth state change subscriptions
- ✅ Comprehensive error handling

#### Initiative Service (`src/services/initiative.service.ts`)

```typescript
// Create new initiative
async function createInitiative(data: InitiativeInput): Promise<Initiative>

// Get initiatives with filters
async function getInitiatives(filters: {
  forest?: string;
  status?: string;
  organizationId?: string;
}): Promise<Initiative[]>

// Get single initiative
async function getInitiativeById(id: string): Promise<Initiative>

// Update initiative
async function updateInitiative(id: string, data: Partial<Initiative>): Promise<Initiative>

// Delete initiative
async function deleteInitiative(id: string): Promise<void>

// Join initiative
async function joinInitiative(initiativeId: string, userId: string): Promise<void>

// Get initiative participants
async function getParticipants(initiativeId: string): Promise<UserProfile[]>
```

#### Tree Service (`src/services/tree.service.ts`)

```typescript
// Register new tree
async function registerTree(data: TreeInput): Promise<Tree>

// Get trees with filters
async function getTrees(filters: {
  forest?: string;
  initiativeId?: string;
  healthStatus?: string;
}): Promise<Tree[]>

// Get tree by ID
async function getTreeById(id: string): Promise<Tree>

// Update tree data
async function updateTree(id: string, data: Partial<Tree>): Promise<Tree>

// Upload tree image
async function uploadTreeImage(treeId: string, file: File): Promise<string>

// Get tree images
async function getTreeImages(treeId: string): Promise<TreeImage[]>
```

#### Carbon Credit Service (`src/services/carbon-credit.service.ts`)

```typescript
// Create carbon credits
async function createCarbonCredit(data: CarbonCreditInput): Promise<CarbonCredit>

// Get available credits
async function getAvailableCredits(filters: {
  forest?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<CarbonCredit[]>

// Purchase credits
async function purchaseCredits(
  creditId: string,
  amount: number,
  paymentMethod: string
): Promise<Transaction>

// Get user transactions
async function getUserTransactions(userId: string): Promise<Transaction[]>
```

### Antugrow API Integration (`src/services/antugrow.ts`)

```typescript
// Register tree with Antugrow
async function registerTreeWithAntugrow(treeData: {
  species: string;
  location: { lat: number; lng: number };
  plantedDate: string;
}): Promise<{ antugrowId: string }>

// Submit tree image for analysis
async function submitTreeImage(
  antugrowId: string,
  imageUrl: string
): Promise<{ analysisId: string }>

// Get tree health analysis
async function getTreeAnalysis(antugrowId: string): Promise<TreeAnalysis>

// Get growth data
async function getGrowthData(antugrowId: string): Promise<GrowthData[]>
```

---

## Smart Contracts

**Status**: 📋 Planned - Will be implemented in Milestone 4 (Weeks 8-10)

### GangGreenBadge.sol (ERC-721 NFT)

**Status**: 📋 Not yet implemented

NFT badge contract for rewarding user achievements.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract GangGreenBadge is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    struct Badge {
        string badgeType;
        string tier; // bronze, silver, gold, platinum
        uint256 mintedAt;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(string => uint256) public maxSupply;
    mapping(string => uint256) public currentSupply;
    
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("GangGreen Badge", "GGB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mintBadge(
        address to,
        string memory badgeType,
        string memory tier,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(currentSupply[badgeType] < maxSupply[badgeType], "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        
        badges[tokenId] = Badge({
            badgeType: badgeType,
            tier: tier,
            mintedAt: block.timestamp
        });
        
        currentSupply[badgeType]++;
        
        return tokenId;
    }
    
    function setMaxSupply(string memory badgeType, uint256 supply) 
        public onlyRole(DEFAULT_ADMIN_ROLE) {
        maxSupply[badgeType] = supply;
    }
}
```

### DonationManager.sol

Smart contract for managing cryptocurrency donations.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DonationManager is Pausable, Ownable {
    struct Donation {
        address donor;
        uint256 amount;
        address token; // address(0) for native currency
        uint256 timestamp;
        string initiativeId;
    }
    
    Donation[] public donations;
    mapping(address => uint256) public totalDonations;
    
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        address token,
        string initiativeId
    );
    
    event Withdrawal(address indexed recipient, uint256 amount, address token);
    
    constructor() {}
    
    // Donate native currency (ETH/MATIC)
    function donateNative(string memory initiativeId) 
        public payable whenNotPaused {
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            token: address(0),
            timestamp: block.timestamp,
            initiativeId: initiativeId
        }));
        
        totalDonations[msg.sender] += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, address(0), initiativeId);
    }
    
    // Donate ERC20 tokens (USDC, etc.)
    function donateToken(
        address token,
        uint256 amount,
        string memory initiativeId
    ) public whenNotPaused {
        require(amount > 0, "Donation must be greater than 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        donations.push(Donation({
            donor: msg.sender,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            initiativeId: initiativeId
        }));
        
        totalDonations[msg.sender] += amount;
        
        emit DonationReceived(msg.sender, amount, token, initiativeId);
    }
    
    // Withdraw funds (organization use)
    function withdraw(address token, uint256 amount) 
        public onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
        
        emit Withdrawal(owner(), amount, token);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
}
```

### Contract Deployment

Deployed on Polygon Mumbai (Testnet):
- GangGreenBadge: `0x...` (to be deployed)
- DonationManager: `0x...` (to be deployed)

Polygon Mainnet (Production):
- GangGreenBadge: `0x...` (to be deployed)
- DonationManager: `0x...` (to be deployed)

---

## Component Architecture

**Status**: 🏗️ Structure created, components to be implemented

### Current Directory Structure

```
src/
├── components/          # ✅ Directory created (placeholder files)
│   └── .gitkeep
├── services/           # ✅ Directory created
│   └── supabase.ts    # ✅ Basic Supabase client configured
├── hooks/             # ✅ Directory created (placeholder files)
│   └── .gitkeep
├── contexts/          # ✅ Directory created (placeholder files)
│   └── .gitkeep
├── types/             # ✅ Directory created (placeholder files)
│   └── .gitkeep
├── utils/             # ✅ Directory created (placeholder files)
│   └── .gitkeep
├── contracts/         # ✅ Directory created (placeholder files)
│   └── .gitkeep
├── App.tsx            # ✅ Basic demo component
├── main.tsx           # ✅ React entry point
└── index.css          # ✅ Tailwind CSS imports
```

### Planned Component Structure

```
src/components/
├── auth/              # 📋 Planned
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ProtectedRoute.tsx
│   └── PasswordReset.tsx
├── dashboard/
│   ├── ImpactMetrics.tsx
│   ├── MetricCard.tsx
│   ├── ActivityFeed.tsx
│   └── TrendChart.tsx
├── initiatives/
│   ├── InitiativeCard.tsx
│   ├── InitiativeForm.tsx
│   ├── InitiativeDetails.tsx
│   ├── InitiativeList.tsx
│   └── InitiativeMap.tsx
├── trees/
│   ├── TreeRegistry.tsx
│   ├── TreeCard.tsx
│   ├── TreeDetails.tsx
│   ├── TreeUpload.tsx
│   └── TreeHealthStatus.tsx
├── marketplace/
│   ├── CarbonCreditList.tsx
│   ├── CreditCard.tsx
│   ├── PurchaseFlow.tsx
│   └── TransactionHistory.tsx
├── web3/
│   ├── WalletConnect.tsx
│   ├── CryptoDonation.tsx
│   └── DonationHistory.tsx
├── nft/
│   ├── BadgeGallery.tsx
│   ├── BadgeCard.tsx
│   └── MintBadge.tsx
├── gamification/
│   ├── PointsDisplay.tsx
│   ├── Leaderboard.tsx
│   ├── AchievementList.tsx
│   └── ChallengeQuests.tsx
└── common/
    ├── Header.tsx
    ├── Footer.tsx
    ├── Button.tsx
    ├── Modal.tsx
    └── LoadingSpinner.tsx
```

### Current Implementation

#### App.tsx - Demo Component

**Status**: ✅ Implemented as placeholder

```typescript
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            #GangGreen
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Catalyzing a Carbon-Negative Africa
          </p>
          <p className="text-sm text-gray-500">
            Wangari Maathai Hackathon - Track 3: Community Engagement and Sustainability
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Kakamega Forest
            </h3>
            <p className="text-sm text-gray-600">Primary pilot site</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Karura Forest
            </h3>
            <p className="text-sm text-gray-600">Urban conservation area</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Mau Forest
            </h3>
            <p className="text-sm text-gray-600">Critical water tower ecosystem</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Trees Planted: {count}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Platform setup complete. Ready for development!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Planned Component Patterns

#### Example: InitiativeCard Component (To Be Implemented)

```typescript
import React from 'react';
import { Initiative } from '@/types/initiative.types';
import { MapPin, Users, TreePine } from 'lucide-react';

interface InitiativeCardProps {
  initiative: Initiative;
  onJoin?: (id: string) => void;
}

export const InitiativeCard: React.FC<InitiativeCardProps> = ({ 
  initiative, 
  onJoin 
}) => {
  const progress = (initiative.trees_planted / initiative.target_trees) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{initiative.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm ${
          initiative.status === 'active' ? 'bg-green-100 text-green-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {initiative.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{initiative.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-2" />
          {initiative.forest}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <TreePine className="w-4 h-4 mr-2" />
          {initiative.trees_planted} / {initiative.target_trees} trees
        </div>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">{progress.toFixed(1)}% complete</p>
      </div>
      
      {onJoin && (
        <button
          onClick={() => onJoin(initiative.id)}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Join Initiative
        </button>
      )}
    </div>
  );
};
```

---

## Service Layer

### Supabase Client Configuration

**Current Implementation** (`src/services/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Status**: ✅ Basic configuration complete. Advanced options (auth persistence, realtime) will be added as needed.

**Environment Variables** (configured in `.env`):
```env
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A5qSpuvL1M7QhqkB2bkqUQ_QmE9dpra
```

### Service Pattern Example

```typescript
// src/services/initiative.service.ts
import { supabase } from './supabase';
import { Initiative, InitiativeInput } from '@/types/initiative.types';

export const initiativeService = {
  async create(data: InitiativeInput): Promise<Initiative> {
    const { data: initiative, error } = await supabase
      .from('initiatives')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return initiative;
  },
  
  async getAll(filters?: {
    forest?: string;
    status?: string;
  }): Promise<Initiative[]> {
    let query = supabase.from('initiatives').select('*');
    
    if (filters?.forest) {
      query = query.eq('forest', filters.forest);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getById(id: string): Promise<Initiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async update(id: string, updates: Partial<Initiative>): Promise<Initiative> {
    const { data, error } = await supabase
      .from('initiatives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
```

---

## Authentication & Authorization

**Status**: 📋 Planned - Will be implemented in Sprint 1 after database setup

### Row Level Security (RLS) Policies

**Status**: ⏳ Awaiting implementation

#### User Profiles (Planned)
```sql
-- Users can read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON user_profiles FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);
```

#### Initiatives
```sql
-- Anyone can view active initiatives
CREATE POLICY "Active initiatives are public"
ON initiatives FOR SELECT
USING (status = 'active' OR status = 'completed');

-- Organizations can create initiatives
CREATE POLICY "Organizations can create initiatives"
ON initiatives FOR INSERT
WITH CHECK (
  auth.uid() = organization_id AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'organization'
  )
);

-- Organizations can update their own initiatives
CREATE POLICY "Organizations can update own initiatives"
ON initiatives FOR UPDATE
USING (auth.uid() = organization_id);
```

#### Trees
```sql
-- Anyone can view trees
CREATE POLICY "Trees are publicly viewable"
ON trees FOR SELECT
USING (true);

-- Authenticated users can register trees
CREATE POLICY "Authenticated users can register trees"
ON trees FOR INSERT
WITH CHECK (auth.uid() = planted_by);
```

### Authentication Context

**Status**: 📋 Planned - To be implemented in Task 3.3

**Planned Implementation**:

```typescript
// src/contexts/AuthContext.tsx (NOT YET CREATED)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## Web3 Integration

**Status**: 📋 Planned - Milestone 4 (Weeks 8-10)

### Web3 Service

**Status**: 📋 Not yet implemented

**Planned Implementation**:

```typescript
// src/services/web3.service.ts (NOT YET CREATED)
import { ethers } from 'ethers';
import GangGreenBadgeABI from '@/contracts/abis/GangGreenBadge.json';
import DonationManagerABI from '@/contracts/abis/DonationManager.json';

const BADGE_CONTRACT_ADDRESS = import.meta.env.VITE_BADGE_CONTRACT_ADDRESS;
const DONATION_CONTRACT_ADDRESS = import.meta.env.VITE_DONATION_CONTRACT_ADDRESS;

export const web3Service = {
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  },
  
  async switchNetwork(chainId: number): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  },
  
  async mintBadge(
    to: string,
    badgeType: string,
    tier: string,
    tokenURI: string
  ): Promise<string> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      BADGE_CONTRACT_ADDRESS,
      GangGreenBadgeABI,
      signer
    );
    
    const tx = await contract.mintBadge(to, badgeType, tier, tokenURI);
    const receipt = await tx.wait();
    return receipt.hash;
  },
  
  async donateNative(
    amount: string,
    initiativeId: string
  ): Promise<string> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      DONATION_CONTRACT_ADDRESS,
      DonationManagerABI,
      signer
    );
    
    const tx = await contract.donateNative(initiativeId, {
      value: ethers.parseEther(amount),
    });
    const receipt = await tx.wait();
    return receipt.hash;
  },
};
```

---

## Deployment

### Environment Variables

**Current Configuration** (`.env`):

```env
# Supabase (✅ Configured)
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A5qSpuvL1M7QhqkB2bkqUQ_QmE9dpra

# Antugrow API (📋 Planned)
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=your_antugrow_api_key_here

# Maps (📋 Planned)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Web3 (📋 Planned - Milestone 4)
VITE_CHAIN_ID=80001
VITE_NETWORK_NAME=mumbai
```

### Build & Deploy

**Current Status**: ✅ Development environment ready

```bash
# Install dependencies (✅ Complete)
npm install

# Start development server (✅ Working)
npm run dev

# Build for production (⏳ Not yet tested)
npm run build

# Deploy to Vercel (📋 Planned - Milestone 6)
vercel --prod
```

**Development Server**: Running on `http://localhost:5173` with Vite HMR

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Performance Optimization

### Database Optimization
- Geospatial indexes for location queries
- Composite indexes on frequently filtered columns
- Connection pooling via Supabase

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization with WebP format
- Lazy loading for maps and charts
- Service worker for offline caching

### Caching Strategy
- Browser caching for static assets
- Supabase query caching
- Real-time subscriptions for live data

---

## Security Best Practices

1. **Authentication**: JWT tokens with automatic refresh
2. **Authorization**: Row Level Security policies
3. **Input Validation**: Client and server-side validation
4. **File Upload**: Type and size restrictions, signed URLs
5. **API Keys**: Environment variables, never committed
6. **Smart Contracts**: Audited, pausable, access controlled
7. **CORS**: Configured for specific origins
8. **Rate Limiting**: Implemented at API gateway level

---

## Monitoring & Logging

### Error Tracking
- Supabase error logs
- Client-side error boundaries
- Smart contract event monitoring

### Analytics
- User behavior tracking
- Performance metrics
- Transaction monitoring
- Gas usage optimization

---

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Testing**: `npm run test`
3. **Linting**: `npm run lint`
4. **Build**: `npm run build`
5. **Deploy**: Push to main branch (auto-deploy via CI/CD)

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Polygon Docs**: https://docs.polygon.technology
- **Antugrow API**: Contact for documentation
- **GitHub Repository**: [Link to repo]

---

*Last Updated: November 2025*
