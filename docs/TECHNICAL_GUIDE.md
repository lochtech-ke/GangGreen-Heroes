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

**Status**: 🚧 In Progress - Schema designed, awaiting implementation in Supabase

**Next Steps**: 
1. Execute SQL migrations in Supabase dashboard
2. Configure Row Level Security policies
3. Set up storage buckets
4. Create performance indexes

### Core Tables

#### users (Supabase Auth)
Managed by Supabase Auth - stores authentication data.

**Status**: ⏳ Awaiting configuration

#### user_profiles
**Status**: ⏳ Awaiting creation

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('individual', 'community_member', 'organization', 'admin')),
  forest_preference TEXT CHECK (forest_preference IN ('kakamega', 'karura', 'mau')),
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### initiatives
```sql
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  forest TEXT NOT NULL CHECK (forest IN ('kakamega', 'karura', 'mau')),
  organization_id UUID REFERENCES user_profiles(id),
  target_trees INTEGER NOT NULL,
  trees_planted INTEGER DEFAULT 0,
  target_area_hectares DECIMAL,
  location GEOGRAPHY(POINT, 4326),
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'paused')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### trees
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id),
  species TEXT NOT NULL,
  planted_by UUID REFERENCES user_profiles(id),
  planted_date DATE NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  forest TEXT CHECK (forest IN ('kakamega', 'karura', 'mau')),
  health_status TEXT CHECK (health_status IN ('healthy', 'needs_attention', 'critical', 'deceased')),
  height_cm DECIMAL,
  diameter_cm DECIMAL,
  antugrow_id TEXT UNIQUE,
  last_monitored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### carbon_credits
```sql
CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID REFERENCES initiatives(id),
  amount_tonnes DECIMAL NOT NULL,
  price_per_tonne DECIMAL NOT NULL,
  available_amount DECIMAL NOT NULL,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_date DATE,
  vintage_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES user_profiles(id),
  credit_id UUID REFERENCES carbon_credits(id),
  amount_tonnes DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Web3 Tables

#### web3_wallets
```sql
CREATE TABLE web3_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_type TEXT CHECK (wallet_type IN ('metamask', 'walletconnect', 'coinbase')),
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### crypto_donations
```sql
CREATE TABLE crypto_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES user_profiles(id),
  initiative_id UUID REFERENCES initiatives(id),
  amount DECIMAL NOT NULL,
  currency TEXT CHECK (currency IN ('ETH', 'MATIC', 'USDC')),
  usd_equivalent DECIMAL,
  transaction_hash TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### nft_badges
```sql
CREATE TABLE nft_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  badge_type TEXT NOT NULL,
  badge_tier TEXT CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  token_id BIGINT UNIQUE,
  contract_address TEXT,
  metadata_uri TEXT,
  minted_at TIMESTAMPTZ,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Gamification Tables

#### user_gamification
```sql
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  points_reward INTEGER DEFAULT 0,
  criteria_type TEXT,
  criteria_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### challenge_quests
```sql
CREATE TABLE challenge_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT,
  objective_count INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  nft_badge_reward UUID REFERENCES nft_badges(id),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Geospatial indexes
CREATE INDEX idx_initiatives_location ON initiatives USING GIST(location);
CREATE INDEX idx_trees_location ON trees USING GIST(location);

-- Forest filtering
CREATE INDEX idx_initiatives_forest ON initiatives(forest);
CREATE INDEX idx_trees_forest ON trees(forest);

-- Status queries
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_trees_health ON trees(health_status);

-- User relationships
CREATE INDEX idx_initiatives_org ON initiatives(organization_id);
CREATE INDEX idx_trees_planted_by ON trees(planted_by);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
```

---

## API Documentation

**Status**: 📋 Planned - Service layer will be implemented after database setup

### Supabase Service Layer

#### Authentication Service (`src/services/auth.service.ts`)

**Status**: 📋 Not yet implemented

**Planned API**:

```typescript
// Register new user
async function register(email: string, password: string, userData: UserProfile): Promise<User>

// Login user
async function login(email: string, password: string): Promise<Session>

// Logout user
async function logout(): Promise<void>

// Reset password
async function resetPassword(email: string): Promise<void>

// Update password
async function updatePassword(newPassword: string): Promise<void>

// Get current user
async function getCurrentUser(): Promise<User | null>
```

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

```typescript
// src/contexts/AuthContext.tsx
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

### Web3 Service

```typescript
// src/services/web3.service.ts
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

```env
# Supabase
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Antugrow API
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=your_api_key

# Maps
VITE_MAPBOX_TOKEN=your_mapbox_token

# Web3
VITE_BADGE_CONTRACT_ADDRESS=0x...
VITE_DONATION_CONTRACT_ADDRESS=0x...
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
```

### Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

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
