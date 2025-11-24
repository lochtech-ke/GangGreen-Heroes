import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { BadgeMarketplace } from '../components/nft/BadgeMarketplace';

export function MarketplacePage() {
  const { user, isAuthenticated } = useAuthContext();

  // Set page title and metadata
  useEffect(() => {
    document.title = 'Badge Marketplace | #GangGreen';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Browse and purchase exclusive NFT badges to showcase your conservation achievements. Earn GG Coins with every purchase!'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {isAuthenticated && user ? (
        <BadgeMarketplace
          userId={user.id}
          userEmail={user.email || ''}
          userProfileUrl={user.profile?.avatar_url}
        />
      ) : (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-green-700 mb-4">NFT Badge Marketplace</h1>
            <p className="text-gray-600 mb-6">
              Browse and purchase exclusive NFT badges to showcase your conservation achievements.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Please log in</strong> to purchase badges. You can browse available badges below.
              </p>
            </div>
            <div className="mt-8">
              <BadgeMarketplace
                userId="guest"
                userEmail="guest@example.com"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
