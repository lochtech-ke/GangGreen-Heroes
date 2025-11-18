import React, { useState } from 'react';

interface FeaturedBadge {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  priceGGCoins: number;
  priceKES: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockRequirement?: string;
}

interface BadgeShowcaseProps {
  featuredBadges: FeaturedBadge[];
  onBadgeClick: (badgeId: string) => void;
  onViewAll: () => void;
}

const rarityColors = {
  common: 'border-gray-400',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};

const rarityBgColors = {
  common: 'bg-gray-100',
  rare: 'bg-blue-50',
  epic: 'bg-purple-50',
  legendary: 'bg-yellow-50',
};

const FeaturedBadgeCard: React.FC<{
  badge: FeaturedBadge;
  onClick: () => void;
}> = ({ badge, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 ${
        rarityColors[badge.rarity]
      } ${isHovered ? 'scale-105' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Rarity Badge */}
      <div
        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
          rarityBgColors[badge.rarity]
        } ${rarityColors[badge.rarity].replace('border-', 'text-')}`}
      >
        {badge.rarity}
      </div>

      {/* Badge Image */}
      <div className="p-6 flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="w-48 h-48 flex items-center justify-center">
          {badge.imageUrl ? (
            <img
              src={badge.imageUrl}
              alt={badge.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-green-200 rounded-full flex items-center justify-center text-6xl">
              🏆
            </div>
          )}
        </div>
      </div>

      {/* Badge Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{badge.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{badge.description}</p>

        {/* Unlock Requirement */}
        {badge.unlockRequirement && isHovered && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Unlock Requirement:</p>
            <p className="text-xs text-blue-700">{badge.unlockRequirement}</p>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <div>
              <p className="text-lg font-bold text-green-600">{badge.priceGGCoins} GG Coins</p>
              <p className="text-xs text-gray-500">or KES {badge.priceKES}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NFTBadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  featuredBadges,
  onBadgeClick,
  onViewAll,
}) => {
  // Mock data for demonstration if no badges provided
  const mockBadges: FeaturedBadge[] = [
    {
      id: '1',
      name: 'Tree Planter',
      imageUrl: '',
      description: 'Plant your first tree and start your conservation journey',
      priceGGCoins: 50,
      priceKES: 200,
      rarity: 'common',
      unlockRequirement: 'Plant 1 tree',
    },
    {
      id: '2',
      name: 'Forest Guardian',
      imageUrl: '',
      description: 'Protect and nurture 10 trees in your local forest',
      priceGGCoins: 150,
      priceKES: 200,
      rarity: 'rare',
      unlockRequirement: 'Plant 10 trees',
    },
    {
      id: '3',
      name: 'Carbon Warrior',
      imageUrl: '',
      description: 'Offset 1 ton of CO₂ through verified conservation activities',
      priceGGCoins: 300,
      priceKES: 200,
      rarity: 'epic',
      unlockRequirement: 'Sequester 1 ton CO₂',
    },
    {
      id: '4',
      name: 'Eco Champion',
      imageUrl: '',
      description: 'Lead a conservation initiative and inspire your community',
      priceGGCoins: 500,
      priceKES: 200,
      rarity: 'legendary',
      unlockRequirement: 'Create an initiative',
    },
    {
      id: '5',
      name: 'Green Investor',
      imageUrl: '',
      description: 'Trade carbon credits and support sustainable development',
      priceGGCoins: 200,
      priceKES: 200,
      rarity: 'rare',
      unlockRequirement: 'Trade 5 carbon credits',
    },
    {
      id: '6',
      name: 'Community Hero',
      imageUrl: '',
      description: 'Engage 50 community members in conservation activities',
      priceGGCoins: 400,
      priceKES: 200,
      rarity: 'epic',
      unlockRequirement: 'Recruit 50 members',
    },
  ];

  const displayBadges = featuredBadges.length > 0 ? featuredBadges : mockBadges;

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Earn NFT Badges
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Collect unique digital badges as you make an impact. Each badge represents your
            contribution to Africa's forests and can be purchased with GG Coins or cash.
          </p>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayBadges.slice(0, 6).map((badge) => (
            <FeaturedBadgeCard
              key={badge.id}
              badge={badge}
              onClick={() => onBadgeClick(badge.id)}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <button
            onClick={onViewAll}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View All Badges →
          </button>
        </div>
      </div>
    </section>
  );
};
