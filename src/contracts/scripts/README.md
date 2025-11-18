# Smart Contract Deployment Scripts

This directory contains deployment scripts for the Governance Token System smart contracts.

## Prerequisites

1. Install Hardhat and dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Set up environment variables in `.env`:
```env
# Polygon Mumbai Testnet
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Polygon Mainnet (for production)
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
```

## Deployment Commands

### Deploy to Mumbai Testnet
```bash
npx hardhat run src/contracts/scripts/deploy-petition.js --network mumbai
```

### Deploy to Polygon Mainnet
```bash
npx hardhat run src/contracts/scripts/deploy-petition.js --network polygon
```

### Deploy to Local Hardhat Network
```bash
npx hardhat node
# In another terminal:
npx hardhat run src/contracts/scripts/deploy-petition.js --network localhost
```

## Verification

Contracts are automatically verified on Polygonscan after deployment. You can also manually verify:

```bash
npx hardhat verify --network mumbai CONTRACT_ADDRESS "petitionId" "title" signatureThreshold deadline
```

## Usage in Application

After deployment, update your application with:
1. Contract address
2. Transaction hash
3. Network details

Store these in your database (petitions table) for reference.

## Security Notes

- Never commit your private key or `.env` file
- Use a dedicated wallet for deployments
- Test thoroughly on Mumbai testnet before mainnet deployment
- Ensure sufficient MATIC balance for gas fees
