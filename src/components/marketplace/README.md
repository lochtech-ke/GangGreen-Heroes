# Marketplace Components

This directory contains components for the carbon credit marketplace feature.

## Components

### CreditCard

A card component that displays carbon credit information including price, availability, verification status, and total value.

**Props:**
- `credit: CarbonCredit` - The carbon credit data to display
- `onClick?: () => void` - Optional click handler
- `showInitiative?: boolean` - Whether to show initiative information (default: true)

**Features:**
- Visual verification status indicator with color coding
- Availability progress bar
- Price display with currency formatting
- Verification certificate link (for verified credits)
- Sold out indicator
- Responsive design

**Usage:**
```tsx
import { CreditCard } from '@/components/marketplace';

<CreditCard
  credit={carbonCredit}
  onClick={() => handleCreditClick(carbonCredit)}
/>
```

### CarbonCreditList

A list component that displays multiple carbon credits with filtering capabilities.

**Props:**
- `filters?: CreditFilters` - External filters to apply
- `onCreditClick?: (credit: CarbonCredit) => void` - Handler for credit card clicks
- `showFilters?: boolean` - Whether to show filter UI (default: true)

**Features:**
- Advanced filtering (verification status, currency, price range)
- Available-only toggle
- Loading and error states
- Responsive grid layout
- Results count display
- Clear filters functionality

**Usage:**
```tsx
import { CarbonCreditList } from '@/components/marketplace';

// Basic usage
<CarbonCreditList
  onCreditClick={(credit) => navigate(`/marketplace/${credit.id}`)}
/>

// With external filters
<CarbonCreditList
  filters={{ verification_status: 'verified', currency: 'USD' }}
  showFilters={false}
  onCreditClick={handleCreditClick}
/>
```

## Styling

All components use Tailwind CSS for styling and follow the platform's design system:
- Green color scheme for primary actions
- Consistent card shadows and hover effects
- Responsive breakpoints (md, lg)
- Accessible color contrasts

## Integration

These components integrate with:
- `carbonCreditService` for data fetching
- `CarbonCredit` and `CreditFilters` types from `types/carbonCredit.types.ts`

### PurchaseFlow

A multi-step purchase flow component that guides users through buying carbon credits.

**Props:**
- `credit: CarbonCredit` - The carbon credit being purchased
- `userId: string` - The ID of the user making the purchase
- `onComplete?: (transaction: Transaction) => void` - Handler called when purchase completes
- `onCancel?: () => void` - Handler called when user cancels

**Features:**
- Three-step flow: Quantity → Payment → Confirmation
- Quantity validation with max limits
- Multiple payment method options
- Real-time total calculation
- Progress indicator
- Transaction creation and status updates
- Success confirmation with transaction details

**Usage:**
```tsx
import { PurchaseFlow } from '@/components/marketplace';

<PurchaseFlow
  credit={selectedCredit}
  userId={currentUser.id}
  onComplete={(transaction) => {
    console.log('Purchase completed:', transaction);
    navigate('/marketplace/confirmation');
  }}
  onCancel={() => setShowPurchase(false)}
/>
```

### PurchaseModal

A modal wrapper for the PurchaseFlow component with backdrop and close functionality.

**Props:**
- `credit: CarbonCredit | null` - The carbon credit to purchase
- `userId: string` - The ID of the user making the purchase
- `isOpen: boolean` - Whether the modal is open
- `onClose: () => void` - Handler to close the modal
- `onComplete?: (transaction: Transaction) => void` - Handler called when purchase completes

**Features:**
- Full-screen modal overlay
- Escape key to close
- Click outside to close
- Body scroll prevention when open
- Close button
- Responsive sizing

**Usage:**
```tsx
import { PurchaseModal } from '@/components/marketplace';

const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);

<PurchaseModal
  credit={selectedCredit}
  userId={currentUser.id}
  isOpen={!!selectedCredit}
  onClose={() => setSelectedCredit(null)}
  onComplete={(transaction) => {
    console.log('Purchase completed:', transaction);
  }}
/>
```

### PurchaseConfirmation

A confirmation page component that displays transaction details and environmental impact.

**Props:**
- `transaction: Transaction` - The completed transaction
- `onViewHistory?: () => void` - Handler to navigate to purchase history
- `onDownloadReceipt?: () => void` - Handler to download receipt

**Features:**
- Success message with visual feedback
- Complete transaction details
- Environmental impact calculations (trees, miles, kWh)
- Next steps information
- Receipt download option
- Social sharing buttons
- Responsive layout

**Usage:**
```tsx
import { PurchaseConfirmation } from '@/components/marketplace';

<PurchaseConfirmation
  transaction={completedTransaction}
  onViewHistory={() => navigate('/marketplace/history')}
  onDownloadReceipt={() => downloadReceipt(transaction.receipt_url)}
/>
```

## Purchase Flow Integration

Complete example of integrating the purchase flow:

```tsx
import { useState } from 'react';
import { CarbonCreditList, PurchaseModal } from '@/components/marketplace';
import { useAuth } from '@/hooks/useAuth';

function MarketplacePage() {
  const { user } = useAuth();
  const [selectedCredit, setSelectedCredit] = useState(null);

  return (
    <div>
      <CarbonCreditList
        onCreditClick={(credit) => setSelectedCredit(credit)}
      />
      
      <PurchaseModal
        credit={selectedCredit}
        userId={user?.id || ''}
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
        onComplete={(transaction) => {
          console.log('Purchase completed:', transaction);
          // Navigate to confirmation page or show success message
        }}
      />
    </div>
  );
}
```

## Future Enhancements

- Initiative information display in CreditCard
- Sorting options in CarbonCreditList
- Pagination for large result sets
- Export/share functionality
- Favorite/bookmark credits
- Real payment gateway integration
- Receipt PDF generation
- Email notifications
- Transaction history filtering
