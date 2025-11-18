import { useState } from 'react';
import { BadgePurchaseModal } from './BadgePurchaseModal';
import { BadgePurchaseConfirmation } from './BadgePurchaseConfirmation';
import { BADGE_PRICE_KES } from '../../types/badgePurchase.types';

interface Badge {
  id: string;
  name: string;
  type: string;
  tier: string;
  description: string;
  image_url: string;
  rarity_score: number;
}

interface BadgeMarketplaceProps {
  userId: string;
  userEmail: string;
  userProfileUrl?: string;
}

// Mock badge data - replace with actual data from your backend
const AVAILABLE_BADGES: Badge[] = [
  {
    id: '1',
    name: 'Tree Planter Bronze',
    type: 'tree_planter',
    tier: 'bronze',
    description: 'Awarded for planting your first trees',
    image_url: '/badges/tree-planter-bronze.png',
    rarity_score: 10,
  },
  {
    id: '2',
    name: 'Tree Planter Silver',
    type: 'tree_planter',
    tier: 'silver',
    description: 'Awarded for planting 10+ trees',
    image_url: '/badges/tree-planter-silver.png',
    rarity_score: 25,
  },
  {
    id: '3',
    name: 'Donor Bronze',
    type: 'donor',
    tier: 'bronze',
    description: 'Awarded for your first donation',
    image_url: '/badges/donor-bronze.png',
    rarity_score: 15,
  },
  {
    id: '4',
    name: 'Monitor Gold',
    type: 'monitor',
    tier: 'gold',
    description: 'Awarded for monitoring 50+ trees',
    image_url: '/badges/monitor-gold.png',
    rarity_score: 50,
  },
];

export const BadgeMarketplace: React.FC<BadgeMarketplaceProps> = ({
  userId,
  userEmail,
  userProfileUrl,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [purchasedBadge, setPurchasedBadge] = useState<Badge | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const handlePurchaseClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    setPurchasedBadge(selectedBadge);
    setTransactionRef(`GG-${Date.now()}`);
    setShowConfirmation(true);
  };

  // Filter badges
  const filteredBadges = AVAILABLE_BADGES.filter((badge) => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || badge.tier === filterTier;
    const matchesType = filterType === 'all' || badge.type === filterType;
    return matchesSearch && matchesTier && matchesType;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'diamond': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Badge Marketplace</h1>
        <p className="text-gray-600">
          Purchase exclusive NFT badges and earn GG Coins with every purchase!
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Tier Filter */}
        <div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="tree_planter">Tree Planter</option>
            <option value="donor">Donor</option>
            <option value="monitor">Monitor</option>
            <option value="ambassador">Ambassador</option>
            <option value="legend">Legend</option>
          </select>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
          >
            {/* Badge Image */}
            <div className="relative aspect-square bg-gradient-to-br from-green-50 to-blue-50 p-6">
              <img
                src={badge.image_url}
                alt={badge.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200?text=Badge';
                }}
              />
              {/* GG Coin Badge */}
              <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">GG</span>
                </div>
                <span>+1</span>
              </div>
            </div>

            {/* Badge Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">{badge.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getTierColor(badge.tier)}`}>
                  {badge.tier}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{badge.description}</p>

              {/* Price and Purchase */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-xl font-bold text-green-600">KES {BADGE_PRICE_KES}</p>
                </div>
                <button
                  onClick={() => handlePurchaseClick(badge)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Modals */}
      {selectedBadge && (
        <>
          <BadgePurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            badgeType={selectedBadge.type}
            tier={selectedBadge.tier}
            badgeName={selectedBadge.name}
            badgeImage={selectedBadge.image_url}
            userId={userId}
            userEmail={userEmail}
            onSuccess={handlePurchaseSuccess}
          />

          {purchasedBadge && (
            <BadgePurchaseConfirmation
              isOpen={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              badgeName={purchasedBadge.name}
              badgeType={purchasedBadge.type}
              tier={purchasedBadge.tier}
              badgeImage={purchasedBadge.image_url}
              transactionReference={transactionRef}
              userProfileUrl={userProfileUrl}
            />
          )}
        </>
      )}
    </div>
  );
};
