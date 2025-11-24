# Web3 Authentication Setup

## Current Status

The Web3 authentication UI is now implemented with:
- Authentication options page (Email or Web3 wallet)
- MetaMask connection interface
- WalletConnect placeholder (coming soon)

## Next Steps

### 1. Install ethers.js

Run this command to add Web3 support:
```bash
npm install ethers
```

### 2. Create Web3 Service

The Web3Login component currently uses basic MetaMask connection. To fully integrate:

- Create `src/services/web3.service.ts` for wallet interactions
- Implement signature-based authentication with Supabase
- Add wallet address to user profiles
- Handle network switching (Polygon Mumbai/Mainnet)

### 3. Backend Integration

Update Supabase to support Web3 authentication:
- Add `wallet_address` column to `users` table
- Implement signature verification
- Link wallet addresses to user accounts

### 4. Enhanced Features

- Sign messages for authentication
- Support multiple wallet providers
- Network detection and switching
- Transaction signing for donations

## Testing

To test MetaMask connection:
1. Install MetaMask browser extension
2. Create/import a wallet
3. Switch to Polygon Mumbai testnet
4. Click "Connect Wallet" on the login page

## Notes

- Web3 login is currently a placeholder that connects to MetaMask
- Full authentication flow requires backend signature verification
- Users can still use traditional email/password authentication
