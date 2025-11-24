# #GangGreen Platform - Quick Reference Card

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/ganggreen-platform.git
cd ganggreen-platform
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development
npm run dev
```

## 📋 Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Smart Contracts
npx hardhat compile      # Compile contracts
npx hardhat test         # Test contracts
npx hardhat deploy       # Deploy contracts
```

## 🗄️ Database Quick Reference

### Key Tables

```sql
-- Users & Profiles
user_profiles (id, email, full_name, role, forest_preference)

-- Initiatives
initiatives (id, title, forest, target_trees, trees_planted, status)

-- Trees
trees (id, species, planted_date, location, health_status, antugrow_id)

-- Carbon Credits
carbon_credits (id, initiative_id, amount_tonnes, price_per_tonne)

-- Web3
web3_wallets (id, user_id, wallet_address, is_primary)
crypto_donations (id, amount, currency, transaction_hash)
nft_badges (id, user_id, badge_type, badge_tier, token_id)

-- Gamification
user_gamification (id, user_id, total_points, level, current_streak_days)
```

### Common Queries

```typescript
// Get user initiatives
const { data } = await supabase
  .from('initiatives')
  .select('*')
  .eq('organization_id', userId);

// Get trees by forest
const { data } = await supabase
  .from('trees')
  .select('*')
  .eq('forest', 'kakamega');

// Get available carbon credits
const { data } = await supabase
  .from('carbon_credits')
  .select('*')
  .eq('verification_status', 'verified')
  .gt('available_amount', 0);
```

## 🔐 Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## 🌐 Web3 Integration

```typescript
// Connect wallet
const address = await web3Service.connectWallet();

// Switch to Polygon
await web3Service.switchNetwork(137); // Polygon Mainnet

// Donate crypto
const txHash = await web3Service.donateNative('0.1', 'initiative-id');

// Mint NFT badge
const txHash = await web3Service.mintBadge(
  userAddress,
  'tree-planter',
  'gold',
  'ipfs://...'
);
```

## 🎮 Gamification Points

| Action | Points |
|--------|--------|
| Register account | 100 |
| Complete profile | 50 |
| Plant a tree | 10 |
| Upload tree photo | 5 |
| Join initiative | 20 |
| Donate ($1) | 1 |
| Refer friend | 50 |
| Daily login | 5 |
| Complete quest | 50-500 |

## 🏆 NFT Badge Tiers

- 🥉 **Bronze**: 10 trees / $100 donated / 5 referrals
- 🥈 **Silver**: 50 trees / $500 donated / 20 referrals
- 🥇 **Gold**: 100 trees / $1000 donated / 50 referrals
- 💎 **Platinum**: 500 trees / $5000 donated / 100 referrals

## 🌳 Pilot Forests

1. **Kakamega Forest** (Primary)
   - Location: Western Kenya
   - Area: 238 km²
   - Type: Tropical rainforest

2. **Karura Forest** (Urban)
   - Location: Nairobi
   - Area: 10.5 km²
   - Type: Urban forest

3. **Mau Forest** (Water Tower)
   - Location: Rift Valley
   - Area: 4,000 km²
   - Type: Montane forest

## 🔧 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Antugrow API
VITE_ANTUGROW_API_URL=https://api.antugrow.com
VITE_ANTUGROW_API_KEY=your_api_key

# Maps
VITE_MAPBOX_TOKEN=your_mapbox_token

# Web3 (Polygon)
VITE_BADGE_CONTRACT_ADDRESS=0x...
VITE_DONATION_CONTRACT_ADDRESS=0x...
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
```

## 📱 API Endpoints (Supabase)

```
GET    /rest/v1/initiatives          # List initiatives
POST   /rest/v1/initiatives          # Create initiative
GET    /rest/v1/initiatives/:id      # Get initiative
PATCH  /rest/v1/initiatives/:id      # Update initiative

GET    /rest/v1/trees                # List trees
POST   /rest/v1/trees                # Register tree
GET    /rest/v1/trees/:id            # Get tree details

GET    /rest/v1/carbon_credits       # List credits
POST   /rest/v1/transactions         # Purchase credits

GET    /rest/v1/user_gamification    # Get user stats
POST   /rest/v1/gamified_actions     # Record action
```

## 🎨 UI Component Library

```typescript
// Button
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Modal
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>

// Card
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

## 🧪 Testing

```typescript
// Unit test example
import { render, screen } from '@testing-library/react';
import { InitiativeCard } from './InitiativeCard';

test('renders initiative card', () => {
  render(<InitiativeCard initiative={mockInitiative} />);
  expect(screen.getByText('Test Initiative')).toBeInTheDocument();
});

// E2E test example
test('user can register tree', async ({ page }) => {
  await page.goto('/trees/register');
  await page.fill('[name="species"]', 'Oak');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/trees');
});
```

## 🚨 Common Issues

### Issue: Supabase connection fails
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify Supabase project is active
# Check API settings in Supabase dashboard
```

### Issue: Wallet won't connect
```typescript
// Ensure MetaMask is installed
if (!window.ethereum) {
  alert('Please install MetaMask');
}

// Switch to correct network
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x89' }], // Polygon
});
```

### Issue: Image upload fails
```typescript
// Check file size (max 10MB)
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}

// Check file type
const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
if (!validTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

## 📊 Performance Targets

- Initial load: < 3 seconds
- API response: < 500ms
- Real-time updates: < 2 minutes
- Test coverage: > 80%
- Lighthouse score: > 90

## 🔒 Security Checklist

- [ ] Environment variables not committed
- [ ] RLS policies enabled on all tables
- [ ] Input validation on all forms
- [ ] File upload restrictions enforced
- [ ] CORS configured properly
- [ ] Smart contracts audited
- [ ] API rate limiting enabled
- [ ] HTTPS enforced in production

## 📞 Support Resources

- **Technical Guide**: `docs/TECHNICAL_GUIDE.md`
- **User Guide**: `docs/USER_GUIDE.md`
- **Project Board**: `docs/GITHUB_PROJECT_UPDATES.md`
- **Email**: support@ganggreen.org
- **GitHub Issues**: [Repository Issues]

## 🎯 Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Run tests: `npm run test`
4. Push branch: `git push origin feature/my-feature`
5. Create Pull Request
6. Wait for review and approval
7. Merge to main
8. Auto-deploy to production

## 📈 Monitoring

```bash
# Check application logs
vercel logs

# Monitor Supabase
# Visit: https://app.supabase.com/project/wobpryllvdjaapzjbsxx

# Check blockchain transactions
# Visit: https://polygonscan.com
```

## 🎉 Quick Wins

**For new developers**:
1. Set up local environment (30 min)
2. Create test account (5 min)
3. Register a test tree (10 min)
4. Run test suite (5 min)
5. Make first contribution (varies)

**For users**:
1. Sign up (2 min)
2. Complete profile (3 min)
3. Join initiative (1 min)
4. Register tree (5 min)
5. Earn first badge (varies)

---

**Keep this card handy for quick reference during development!**

*Last Updated: November 2025*
