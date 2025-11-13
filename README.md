# #GangGreen Platform

A comprehensive digital platform designed to catalyze a carbon-negative Africa by connecting stakeholders in environmental conservation, carbon credit markets, and sustainable development.

Built for **Track 3 (Community Engagement and Sustainability)** of the Wangari Maathai Hackathon.

## 🌳 Mission

The #GangGreen platform facilitates tree planting initiatives, carbon credit trading, community engagement, and transparent monitoring of environmental impact across African regions, with a focus on Technology for Forest Conservation.

## 🌲 Pilot Forests

The platform pilots conservation efforts in three key Kenyan forests:

1. **Kakamega Forest** - Primary pilot site
2. **Karura Forest** - Urban conservation area
3. **Mau Forest** - Critical water tower ecosystem

## ✨ Core Features

- **Tree Planting Initiatives** - Organizations create and manage conservation efforts with geospatial tracking
- **Carbon Credit Marketplace** - Verified carbon credits trading with transparent verification
- **Impact Dashboard** - Real-time metrics on trees planted, carbon sequestered, and area covered
- **AI-Powered Tree Monitoring** - Integration with Antugrow API for growth tracking and health analysis
- **Web3 Integration** - Cryptocurrency donations (ETH, MATIC, USDC) and NFT badge rewards
- **Gamification** - Points, levels, achievements, leaderboards, and challenge quests to drive engagement
- **Community Engagement** - Notifications, forums, and forest-specific participation

## 🛠️ Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Leaflet.js/Mapbox (maps)

### Backend
- Supabase (BaaS - PostgreSQL, Auth, Storage, Real-time)
- PostgreSQL with PostGIS (geospatial data)

### Blockchain & Web3
- Ethereum/Polygon networks
- Solidity smart contracts (ERC-721 NFT badges)
- ethers.js
- MetaMask & WalletConnect support
- Hardhat (development)

### External Integrations
- Antugrow API (AI-powered tree monitoring)

## 🚧 Development Status

**Current Phase**: Foundation (Sprint 1 - Week 1)  
**Progress**: 3% Complete (1 of 30 major tasks)  
**Status**: ✅ On Track

### What's Complete

- ✅ Project setup and configuration
- ✅ React + TypeScript + Vite initialized
- ✅ Tailwind CSS integrated
- ✅ Supabase client configured
- ✅ Development environment ready
- ✅ TypeScript type definitions (user types, auth interfaces)
- ✅ Database schema (20 tables with indexes and triggers)
- ✅ Row Level Security policies configured
- ✅ Storage buckets setup (tree-images, documents, avatars, nft-badges)

### In Progress

- 🚧 Authentication service implementation
- 🚧 User profile management

### Coming Soon

- 📋 Authentication system (Week 2)
- 📋 User profiles (Week 2)
- 📋 Tree initiatives (Weeks 3-5)
- 📋 Carbon marketplace (Weeks 6-7)
- 📋 Web3 features (Weeks 8-10)

See [Project Status Report](docs/PROJECT_STATUS.md) for detailed progress.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ganggreen-platform.git
cd ganggreen-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and API credentials

# Start development server
npm run dev
```

The development server will start at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=your_antugrow_api_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### Database Setup

The database schema is ready to deploy. Follow the [Migration Instructions](MIGRATION_INSTRUCTIONS.md) or [Quick Deploy Guide](supabase/QUICK_DEPLOY.md) to set up your Supabase database with:

- 20 tables (users, initiatives, trees, carbon credits, web3, gamification, etc.)
- 80+ indexes for optimized queries
- Row Level Security policies for all tables
- 4 storage buckets (tree-images, documents, avatars, nft-badges)
- PostGIS extension for geospatial features

## 📝 Available Scripts

### Development
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Testing
```bash
npm run test         # Run unit tests (coming soon)
npm run test:e2e     # Run end-to-end tests (coming soon)
npm run test:coverage # Generate coverage report (coming soon)
```

### Smart Contracts
```bash
npx hardhat compile  # Compile smart contracts (coming soon)
npx hardhat test     # Test smart contracts (coming soon)
npx hardhat deploy   # Deploy contracts (coming soon)
```

See the [Technical Guide](docs/TECHNICAL_GUIDE.md) for planned testing infrastructure.

## 📁 Project Structure

```
ganggreen-platform/
├── src/
│   ├── components/      # React components (auth, dashboard, initiatives, etc.)
│   ├── services/        # Business logic and API clients
│   │   ├── supabase.ts        # Supabase client configuration
│   │   └── auth.service.ts    # Authentication service (in progress)
│   ├── contracts/       # Smart contracts (Solidity)
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React Context providers
│   ├── types/           # TypeScript type definitions
│   │   └── user.types.ts      # User, auth, and profile types
│   └── utils/           # Utility functions
│       ├── constants.ts       # Application constants
│       └── helpers.ts         # Helper functions
├── public/              # Static assets
├── supabase/            # Database migrations and configuration
│   ├── migrations/      # SQL migration files
│   │   ├── 000_all_migrations.sql    # Complete schema (20 tables)
│   │   └── 010_rls_policies.sql      # Row Level Security policies
│   └── storage/         # Storage bucket configuration
│       └── buckets.sql        # Storage buckets and policies
├── tests/               # Test files
├── docs/                # Comprehensive documentation
│   ├── TECHNICAL_GUIDE.md          # Developer documentation
│   ├── USER_GUIDE.md               # End user manual
│   ├── GITHUB_PROJECT_UPDATES.md   # Project management guide
│   └── DOCUMENTATION_SUMMARY.md    # Documentation overview
└── .kiro/               # Kiro AI configuration
    ├── specs/           # Project specifications
    └── steering/        # AI steering rules
```

## 🔧 TypeScript Types & API

### User Types

The platform uses strongly-typed TypeScript interfaces for type safety:

```typescript
// User roles
type UserRole = 'admin' | 'organization' | 'community' | 'individual';
type ForestPreference = 'kakamega' | 'karura' | 'mau';

// User profile interface
interface UserProfile {
  full_name: string;
  phone?: string;
  organization?: string;
  location?: string;
  avatar_url?: string;
}

// Complete user object
interface User {
  id: string;
  email: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  created_at: string;
  profile?: UserProfile;
}
```

### Authentication

```typescript
// Registration data
interface RegisterData {
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
interface LoginCredentials {
  email: string;
  password: string;
}
```

All type definitions are located in `src/types/` and imported throughout the application for consistent typing.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Project Status Report](docs/PROJECT_STATUS.md)** - 📊 Current progress, metrics, and next steps
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - ⚡ Essential commands, code snippets, and quick tips
- **[Technical Guide](docs/TECHNICAL_GUIDE.md)** - 🔧 Architecture, API docs, database schema (updated with current status)
- **[User Guide](docs/USER_GUIDE.md)** - 📖 Complete user manual (updated with development timeline)
- **[GitHub Project Updates](docs/GITHUB_PROJECT_UPDATES.md)** - 📋 Project board setup and task management (updated with Task 1 completion)
- **[Documentation Summary](docs/DOCUMENTATION_SUMMARY.md)** - 📝 Overview of all documentation

**New to the project?** 
- Developers: Start with [Quick Reference](docs/QUICK_REFERENCE.md) and [Project Status](docs/PROJECT_STATUS.md)
- Stakeholders: Read [Project Status Report](docs/PROJECT_STATUS.md) for current progress
- Users: See [User Guide](docs/USER_GUIDE.md) for feature availability timeline

## 👥 Target Users

- **Organizations** - Create and manage conservation initiatives
- **Community Members** - Participate in local forest conservation activities
- **Individuals** - Support conservation through donations and tree planting
- **Administrators** - Oversee platform operations and verify carbon credits

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Loch Tech Solutions

## 🙏 Acknowledgments

- Built for the Wangari Maathai Hackathon - Track 3 (Community Engagement and Sustainability)
- Powered by Antugrow API for AI-driven tree monitoring
- Supported by Supabase for backend infrastructure

## 📞 Contact

For questions or support, please open an issue in the GitHub repository.

---

**#GangGreen** - Growing a carbon-negative Africa, one tree at a time 🌍🌳
