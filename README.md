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

### Testing
- Vitest v4.0.8 (unit test framework)
- Testing Library v16.3.0 (React component testing)
- jest-dom v6.9.1 (custom matchers)
- user-event v14.6.1 (user interaction simulation)
- jsdom v27.2.0 (browser environment)

### Blockchain & Web3
- Ethereum/Polygon networks
- Solidity smart contracts (ERC-721 NFT badges)
- ethers.js
- MetaMask & WalletConnect support
- Hardhat (development)

### External Integrations
- Antugrow API (AI-powered tree monitoring)

## 🚧 Development Status

**Current Phase**: Sprint 2 - Authentication & Core Setup (Week 3)  
**Progress**: 18% Complete (5.5 of 30 major tasks)  
**Status**: ✅ On Track

### What's Complete

**Sprint 1: Foundation** ✅ 100% Complete
- ✅ Project setup and configuration
- ✅ React + TypeScript + Vite initialized
- ✅ Tailwind CSS integrated
- ✅ Supabase client configured
- ✅ Development environment ready
- ✅ TypeScript type definitions (user types, auth interfaces)
- ✅ Database schema (20 tables with indexes and triggers)
- ✅ Row Level Security policies configured
- ✅ Storage buckets setup (tree-images, documents, avatars, nft-badges)

**Authentication System** ✅ 90% Complete (3.6 of 4 tasks)
- ✅ Authentication service with role-based access control
- ✅ Authentication UI components (login, register, password reset)
- ✅ Protected routes with role validation
- ✅ AuthContext provider for global state management
- ✅ useAuth hook with 13 methods
- ✅ Session persistence and real-time updates
- 🚧 Authentication tests (60% complete - 25+ tests written)

**Testing Infrastructure** 🚧 60% Complete
- ✅ Vitest configuration with React support
- ✅ Testing Library integration (React, jest-dom, user-event)
- ✅ jsdom environment setup
- ✅ Test setup with global mocks
- ✅ Auth service unit tests (15+ tests, ~90% coverage)
- ✅ LoginForm component tests (7 tests, ~85% coverage)
- ✅ RegisterForm component tests (8 tests, ~85% coverage)
- ✅ Comprehensive testing documentation (300+ lines)
- 🚧 Additional component tests in progress
- 🚧 Context and hook tests in progress
- 🚧 Integration tests in progress

### In Progress

- 🚧 Task 3.4: Write authentication tests (60% complete)
  - ✅ Test infrastructure setup
  - ✅ Auth service tests
  - ✅ Component tests (LoginForm, RegisterForm)
  - 🚧 ProtectedRoute tests
  - 🚧 Password reset component tests
  - 🚧 AuthContext tests
  - 🚧 useAuth hook tests
  - 🚧 Integration tests

### Coming Soon

- 📋 Database deployment (Task 2.2 - RLS policies)
- 📋 Storage bucket configuration (Task 2.3)
- 📋 Complete authentication testing (Task 3.4)
- 📋 User profile management (Task 4)
- 📋 Tree initiatives (Weeks 4-5)
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
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Current Test Coverage**: ~60% (target: 80%)
- Auth service: ~90% coverage (15+ tests)
- LoginForm: ~85% coverage (7 tests)
- RegisterForm: ~85% coverage (8 tests)
- Total: 25+ tests, 100% pass rate

See [Testing Guide](src/test/README.md) for detailed testing documentation.

### Smart Contracts
```bash
npx hardhat compile  # Compile smart contracts (coming soon)
npx hardhat test     # Test smart contracts (coming soon)
npx hardhat deploy   # Deploy contracts (coming soon)
```

## 📁 Project Structure

```
ganggreen-platform/
├── src/
│   ├── components/      # React components
│   │   └── auth/              # Authentication components
│   │       ├── LoginForm.tsx           # Login form with validation
│   │       ├── RegisterForm.tsx        # Registration form
│   │       ├── ProtectedRoute.tsx      # Route guard component
│   │       ├── PasswordResetRequest.tsx
│   │       ├── PasswordResetConfirm.tsx
│   │       ├── LoginForm.test.tsx      # Component tests
│   │       ├── RegisterForm.test.tsx
│   │       └── README.md               # Component documentation
│   ├── services/        # Business logic and API clients
│   │   ├── supabase.ts           # Supabase client configuration
│   │   ├── auth.service.ts       # Authentication service
│   │   ├── auth.service.test.ts  # Service unit tests
│   │   └── README.md             # Service documentation
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.tsx       # Global auth state provider
│   │   └── README.md             # Context documentation
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook (13 methods)
│   │   └── README.md             # Hook documentation
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── DashboardPage.tsx
│   ├── test/            # Test configuration
│   │   ├── setup.ts              # Global test setup
│   │   └── README.md             # Testing guide (300+ lines)
│   ├── types/           # TypeScript type definitions
│   │   └── user.types.ts         # User, auth, and profile types
│   ├── utils/           # Utility functions
│   │   ├── constants.ts          # Application constants
│   │   └── helpers.ts            # Helper functions
│   └── contracts/       # Smart contracts (Solidity) - coming soon
├── public/              # Static assets
├── supabase/            # Database migrations and configuration
│   ├── migrations/      # SQL migration files
│   │   ├── 000_all_migrations.sql    # Complete schema (20 tables)
│   │   └── 010_rls_policies.sql      # Row Level Security policies
│   └── storage/         # Storage bucket configuration
│       └── buckets.sql        # Storage buckets and policies
├── docs/                # Comprehensive documentation
│   ├── TECHNICAL_GUIDE.md          # Developer documentation
│   ├── USER_GUIDE.md               # End user manual
│   ├── GITHUB_PROJECT_UPDATES.md   # Project management guide
│   ├── PROJECT_STATUS.md           # Current progress report
│   └── DOCUMENTATION_SUMMARY.md    # Documentation overview
├── vitest.config.ts     # Vitest test configuration
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

### Authentication Service

The `authService` provides comprehensive authentication functionality:

```typescript
// Registration
const { user, error } = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  full_name: 'John Doe',
  role: 'individual',
  forest_preference: 'kakamega'
});

// Login
const { user, error } = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await authService.logout();

// Password reset
await authService.requestPasswordReset('user@example.com');
await authService.updatePassword('newPassword123');

// Role checking
const isAdmin = authService.isAdmin(user);
const hasRole = authService.hasRole(user, 'organization');
const hasAnyRole = authService.hasAnyRole(user, ['admin', 'organization']);
```

### useAuth Hook

The `useAuth` hook provides easy access to authentication state and methods:

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const {
    user,              // Current user object
    loading,           // Loading state
    isAuthenticated,   // Boolean auth status
    login,             // Login method
    register,          // Register method
    logout,            // Logout method
    hasRole,           // Role checking
    isAdmin,           // Admin check
    refreshUser        // Manual refresh
  } = useAuth();

  // Use auth state and methods
}
```

### AuthContext

Global authentication state management:

```typescript
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

All type definitions are located in `src/types/` and imported throughout the application for consistent typing.

## 🧪 Testing

The platform uses **Vitest** for fast, modern testing with comprehensive coverage.

### Test Framework

- **Vitest** v4.0.8 - Fast unit test framework
- **Testing Library** v16.3.0 - React component testing
- **jest-dom** v6.9.1 - Custom matchers
- **user-event** v14.6.1 - User interaction simulation
- **jsdom** v27.2.0 - Browser environment simulation

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

**Current Coverage**: ~60% (Target: 80%)

| Module | Coverage | Tests | Status |
|--------|----------|-------|--------|
| Auth Service | ~90% | 15+ tests | ✅ Complete |
| LoginForm | ~85% | 7 tests | ✅ Complete |
| RegisterForm | ~85% | 8 tests | ✅ Complete |
| ProtectedRoute | 0% | 0 tests | 🚧 In Progress |
| AuthContext | 0% | 0 tests | 🚧 In Progress |
| useAuth Hook | 0% | 0 tests | 🚧 In Progress |

**Total**: 25+ tests, 100% pass rate, < 5 seconds execution time

### Test Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup and mocks
│   └── README.md             # Testing guide (300+ lines)
├── services/
│   └── auth.service.test.ts  # Auth service unit tests
└── components/
    └── auth/
        ├── LoginForm.test.tsx      # Login form tests
        └── RegisterForm.test.tsx   # Register form tests
```

### Writing Tests

Example component test:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render login form with all fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
```

See [Testing Guide](src/test/README.md) for comprehensive testing documentation, best practices, and examples.

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
