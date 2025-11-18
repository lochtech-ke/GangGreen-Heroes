import React, { useState } from 'react';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  learnMoreUrl: string;
}

interface FeatureHighlightsProps {
  features?: Feature[];
}

const FeatureCard: React.FC<{
  feature: Feature;
}> = ({ feature }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-2xl ${
        isHovered ? 'transform -translate-y-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div
        className={`text-6xl mb-4 transition-all duration-300 ${
          isHovered ? 'scale-110 text-green-600' : 'text-green-500'
        }`}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-green-700 mb-3">{feature.title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feature.description}</p>

      {/* Learn More Link */}
      <a
        href={feature.learnMoreUrl}
        className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-sm transition-colors"
      >
        Learn More
        <svg
          className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    </div>
  );
};

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({ features }) => {
  const defaultFeatures: Feature[] = [
    {
      id: 'tree-planting',
      icon: '🌱',
      title: 'Tree Planting',
      description:
        'Participate in geo-tagged tree planting initiatives with AI-powered verification. Track your trees from seedling to maturity.',
      learnMoreUrl: '/trees',
    },
    {
      id: 'carbon-credits',
      icon: '💰',
      title: 'Carbon Credits',
      description:
        'Trade verified carbon credits in our transparent marketplace. Support sustainable development and offset your carbon footprint.',
      learnMoreUrl: '/marketplace',
    },
    {
      id: 'nft-badges',
      icon: '🏆',
      title: 'NFT Badges',
      description:
        'Earn collectible digital badges as you achieve conservation milestones. Purchase with GG Coins or cash to showcase your impact.',
      learnMoreUrl: '/marketplace',
    },
    {
      id: 'gamification',
      icon: '🎮',
      title: 'Gamification',
      description:
        'Compete on leaderboards, unlock achievements, level up, and earn rewards. Make conservation fun and engaging for everyone.',
      learnMoreUrl: '/gamification',
    },
    {
      id: 'ai-guidance',
      icon: '🤖',
      title: 'AI Guidance',
      description:
        'Get personalized recommendations from our AI chatbot. Receive support for onboarding, cause selection, and conservation activities.',
      learnMoreUrl: '/dashboard',
    },
    {
      id: 'web3-integration',
      icon: '🔗',
      title: 'Web3 Integration',
      description:
        'Connect your crypto wallet to donate ETH, MATIC, or USDC. Enjoy blockchain-verified conservation with transparent tracking.',
      learnMoreUrl: '/initiatives',
    },
  ];

  const displayFeatures = features && features.length > 0 ? features : defaultFeatures;

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to make a real impact on climate change. From tree planting to
            blockchain verification, we've got you covered.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
