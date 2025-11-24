# Governance System Navigation Guide

## Overview

This document describes the navigation structure and routes for the Governance Token System.

## Navigation Menu

The governance system is accessible through a new "Governance" dropdown in the main navigation menu.

### Menu Structure

```
Governance (dropdown)
├── Overview - /governance
├── Proposals - /governance/proposals
├── Petitions - /governance/petitions
└── Delegate Voting - /governance/delegate
```

## Routes

### Main Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/governance` | `GovernancePage` | Main governance dashboard with tabs | Yes |
| `/governance/proposals` | `GovernancePage` (proposals tab) | List of all proposals | Yes |
| `/governance/proposals/:id` | `ProposalDetailPage` | Individual proposal details and voting | Yes |
| `/governance/petitions` | `GovernancePage` (petitions tab) | List of all petitions | Yes |
| `/governance/petitions/:id` | `PetitionDetailPage` | Individual petition details and signing | Yes |

### Future Routes (Not Yet Implemented)

| Route | Description |
|-------|-------------|
| `/governance/proposals/create` | Create new proposal form |
| `/governance/petitions/create` | Create new petition form |
| `/governance/delegate` | Delegate voting power interface |
| `/governance/earn` | How to earn governance tokens |
| `/governance/history` | User's voting and petition history |

## Page Components

### GovernancePage

The main governance page with three tabs:

1. **Overview Tab**
   - Governance token balance card
   - Quick actions (Create Proposal, Start Petition, Delegate Voting)
   - Active proposals requiring votes

2. **Proposals Tab**
   - Proposal list with filters
   - Category, status, and sort filters
   - Create proposal button

3. **Petitions Tab**
   - Petition list with filters
   - Category, status, and sort filters
   - Start petition button

### ProposalDetailPage

Individual proposal view with:
- Proposal header (title, status, category, creator, dates)
- Voting deadline countdown
- Full description
- Vote distribution chart
- Voting interface (For/Against/Abstain buttons)
- Voting power display
- Voting history

### PetitionDetailPage

Individual petition view with:
- Petition header (title, status, category, creator, dates)
- Deadline countdown
- Full description
- Blockchain verification badge
- Signature progress bar
- Sign with Web3 wallet button
- List of signers with wallet addresses

## Navigation Configuration

The governance menu is added to `src/components/navigation/navigationConfig.ts`:

```typescript
{
  id: 'governance',
  label: 'Governance',
  icon: 'vote',
  items: [
    {
      to: '/governance',
      label: 'Overview',
      icon: 'layout-dashboard',
      description: 'Governance dashboard and token balance',
    },
    {
      to: '/governance/proposals',
      label: 'Proposals',
      icon: 'file-text',
      description: 'Vote on platform features and improvements',
    },
    {
      to: '/governance/petitions',
      label: 'Petitions',
      icon: 'pen-tool',
      description: 'Support community initiatives with signatures',
    },
    {
      to: '/governance/delegate',
      label: 'Delegate Voting',
      icon: 'users',
      description: 'Delegate your voting power',
    },
  ],
}
```

## Icons Used

New governance-related icons added to `iconMap.tsx`:

- `vote` - Main governance icon
- `file-text` - Proposals
- `pen-tool` - Petitions
- `layout-dashboard` - Dashboard/Overview
- `inbox` - Empty states
- `shield-check` - Blockchain verification
- `info` - Information messages
- `file-plus` - Create actions

## Access Control

All governance routes require authentication via `ProtectedRoute` wrapper.

Future enhancements may include:
- Minimum token balance requirements for certain actions
- Role-based access for admin features
- Senior user access for tie-breaking

## User Flow

### Viewing Proposals
1. User clicks "Governance" in main nav
2. Selects "Proposals" from dropdown
3. Views list of proposals with filters
4. Clicks on a proposal to view details
5. Casts vote (For/Against/Abstain)

### Creating Petition
1. User clicks "Governance" in main nav
2. Selects "Petitions" from dropdown
3. Clicks "Start Petition" button
4. Fills out petition form
5. Connects Web3 wallet
6. Deploys petition to blockchain

### Signing Petition
1. User navigates to petition detail page
2. Reviews petition details
3. Clicks "Sign with Web3 Wallet"
4. Confirms transaction in wallet
5. Signature recorded on blockchain

## Next Steps

To complete the navigation implementation:

1. ✅ Add governance routes to App.tsx
2. ✅ Create GovernancePage component with tabs
3. ✅ Create ProposalDetailPage component
4. ✅ Create PetitionDetailPage component
5. ✅ Add governance menu to navigationConfig.ts
6. ✅ Add governance icons to iconMap.tsx
7. ⏳ Connect pages to backend services (when implemented)
8. ⏳ Implement create proposal form
9. ⏳ Implement create petition form
10. ⏳ Implement delegation interface

## Testing

To test the navigation:

1. Start the development server: `npm run dev`
2. Log in to the application
3. Click "Governance" in the main navigation
4. Verify all menu items are visible
5. Navigate to each route and verify pages load
6. Test tab switching on main governance page
7. Verify breadcrumb navigation works

## Notes

- All pages currently show placeholder content
- Backend services need to be implemented to populate real data
- Web3 wallet integration is not yet functional
- Voting and signing actions are UI-only at this stage
