# Smart Contract Deployment Guide

## Overview

This guide covers deploying the PetitionContract to Polygon Mumbai testnet and mainnet.

## Prerequisites

### 1. Install Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers dotenv
```

### 2. Get Mumbai Testnet MATIC

1. Visit [Mumbai Faucet](https://faucet.polygon.technology/)
2. Enter your wallet address
3. Request test MATIC tokens

### 3. Get Polygonscan API Key

1. Visit [Polygonscan](https://polygonscan.com/)
2. Create an account
3. Generate an API key from your profile

### 4. Configure Environment Variables

Create or update `.env` file:

```env
# Wallet Private Key (NEVER commit this!)
PRIVATE_KEY=your_wallet_private_key_here

# Polygon Mumbai Testnet RPC
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Polygon Mainnet RPC (for production)
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# Polygonscan API Key for verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

## Deployment Steps

### Step 1: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 2: Run Tests

```bash
npx hardhat test
```

Ensure all tests pass before deploying.

### Step 3: Deploy to Mumbai Testnet

```bash
npx hardhat run src/contracts/scripts/deploy-petition.js --network mumbai
```

Expected output:
```
Deploying contracts with account: 0x...
Account balance: 1000000000000000000
Deploying PetitionContract...
PetitionContract deployed to: 0x...
Transaction hash: 0x...
Verifying contract on Polygonscan...
Contract verified successfully!
```

### Step 4: Save Deployment Information

After deployment, save the following information:
- Contract address
- Transaction hash
- Network (mumbai/polygon)
- Deployment timestamp

Store this in your database (petitions table).

## Verification

### Automatic Verification

The deployment script automatically verifies contracts on Polygonscan after deployment.

### Manual Verification

If automatic verification fails:

```bash
npx hardhat verify --network mumbai CONTRACT_ADDRESS "petitionId" "title" signatureThreshold deadline
```

Example:
```bash
npx hardhat verify --network mumbai 0x123... "petition-001" "Feature Request" 100 1735689600
```

## Testing Deployed Contract

### Using Hardhat Console

```bash
npx hardhat console --network mumbai
```

```javascript
const PetitionContract = await ethers.getContractFactory("PetitionContract");
const petition = await PetitionContract.attach("CONTRACT_ADDRESS");

// Check petition details
const details = await petition.getPetitionDetails();
console.log(details);

// Sign petition
await petition.signPetition();

// Check status
const status = await petition.getPetitionStatus();
console.log(status);
```

### Using Polygonscan

1. Visit [Mumbai Polygonscan](https://mumbai.polygonscan.com/)
2. Enter your contract address
3. Go to "Contract" tab
4. Click "Read Contract" to view state
5. Click "Write Contract" to interact

## Production Deployment (Polygon Mainnet)

### Important Checks Before Mainnet

- [ ] All tests passing
- [ ] Thoroughly tested on Mumbai testnet
- [ ] Security audit completed (if applicable)
- [ ] Sufficient MATIC for gas fees
- [ ] Backup of private key secured

### Deploy to Mainnet

```bash
npx hardhat run src/contracts/scripts/deploy-petition.js --network polygon
```

## Troubleshooting

### Error: Insufficient funds

**Solution**: Ensure your wallet has enough MATIC for gas fees.

### Error: Nonce too high

**Solution**: Reset your account in MetaMask or wait for pending transactions to complete.

### Error: Contract verification failed

**Solution**: 
1. Wait a few minutes and try again
2. Ensure constructor arguments match exactly
3. Check Polygonscan API key is valid

### Error: Network connection timeout

**Solution**: Try alternative RPC endpoints:
- Mumbai: `https://matic-mumbai.chainstacklabs.com`
- Mainnet: `https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY`

## Gas Optimization

Current contract is optimized with:
- Optimizer enabled (200 runs)
- Efficient storage patterns
- Minimal external calls

Estimated gas costs:
- Deployment: ~500,000 gas
- Sign petition: ~50,000 gas

## Security Considerations

1. **Private Key Security**
   - Never commit private keys to git
   - Use hardware wallets for mainnet
   - Consider using multi-sig for contract ownership

2. **Contract Immutability**
   - Contracts cannot be upgraded once deployed
   - Test thoroughly before mainnet deployment
   - Consider proxy patterns for upgradeable contracts

3. **Access Control**
   - Only petition creator stored on-chain
   - No admin functions to prevent centralization
   - All signatures are permanent and verifiable

## Monitoring

After deployment, monitor:
- Transaction activity on Polygonscan
- Gas usage patterns
- Signature events
- Threshold reached events

## Support

For issues or questions:
1. Check Hardhat documentation: https://hardhat.org/
2. Polygon documentation: https://docs.polygon.technology/
3. Review contract tests for usage examples
