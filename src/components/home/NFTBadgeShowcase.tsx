import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Coins, Sparkles, ExternalLink, Lock } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';
import { AnimatedSection } from '../common/AnimatedSection';

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

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-400/50',
    border: 'border-gray-400/30',
    bg: 'bg-gray-400/10',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-400/50',
    border: 'border-blue-400/30',
    bg: 'bg-blue-400/10',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-400/50',
    border: 'border-purple-400/30',
    bg: 'bg-purple-400/10',
  },
  legendary: {
    gradient: 'from-amber-400 to-amber-600',
    glow: 'shadow-amber-400/50',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/10',
  },
};

const FeaturedBadgeCard: React.FC<{
  badge: FeaturedBadge;
  onClick: () => void;
  index: number;
}> = ({ badge, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = rarityConfig[badge.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative glass rounded-2xl overflow-hidden cursor-pointer
          border-2 ${config.border}
          transition-all duration-300
          ${isHovered ? `${config.glow} shadow-2xl` : 'shadow-lg'}
        `}
        onClick={onClick}
      >
        {/* Animated Gradient Border */}
        <div
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-300
            bg-gradient-to-r ${config.gradient}
            ${isHovered ? 'opacity-20' : ''}
          `}
        />

        {/* Rarity Badge with Sparkles */}
        <div className={`absolute top-3 right-3 glass ${config.bg} px-3 py-1 rounded-full flex items-center gap-1 z-10`}>
          <Sparkles size={12} className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`} />
          <span className={`text-xs font-bold uppercase bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
            {badge.rarity}
          </span>
        </div>

        {/* Badge Image with Rotation on Hover */}
        <div className="p-6 flex justify-center items-center bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm">
          <motion.div
            className="w-48 h-48 flex items-center justify-center"
            animate={{ rotate: isHovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {badge.imageUrl ? (
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            ) : (
              <div className={`w-full h-full rounded-full flex items-center justify-center text-6xl ${config.bg} backdrop-blur-sm`}>
                <Award size={80} className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Badge Info */}
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{badge.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{badge.description}</p>

          {/* Unlock Requirement Tooltip */}
          {badge.unlockRequirement && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="glass-green p-3 rounded-lg border border-green-400/30 flex items-start gap-2">
                <Lock size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-800 mb-1">Unlock Requirement:</p>
                  <p className="text-xs text-green-700">{badge.unlockRequirement}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full glass-green flex items-center justify-center">
                <Coins size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{badge.priceGGCoins} GG</p>
                <p className="text-xs text-gray-500">or KES {badge.priceKES}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        {isHovered && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10 pointer-events-none`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
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
    <section className="relative py-20 overflow-hidden">
      {/* Background with floating geometric shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Icon */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-green mb-6"
            >
              <Award size={40} className="text-green-600" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Earn NFT Badges
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mb-6 rounded-full" />
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Collect unique digital badges as you make an impact. Each badge represents your
              contribution to Africa's forests and can be purchased with GG Coins or cash.
            </p>
          </div>
        </AnimatedSection>

        {/* Badge Grid with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayBadges.slice(0, 6).map((badge, index) => (
            <FeaturedBadgeCard
              key={badge.id}
              badge={badge}
              index={index}
              onClick={() => onBadgeClick(badge.id)}
            />
          ))}
        </div>

        {/* View All CTA with Glass Effect */}
        <AnimatedSection delay={0.6}>
          <div className="text-center">
            <GlassButton
              variant="primary"
              size="lg"
              icon={ExternalLink}
              onClick={onViewAll}
              className="min-w-[240px]"
            >
              View All Badges
            </GlassButton>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
