import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Sprout, Leaf, Award, Zap, Bot, Wallet, ArrowRight, LucideIcon } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { AnimatedSection } from '../common/AnimatedSection';

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  learnMoreUrl: string;
  accentColor: string;
  gradient: string;
}

interface FeatureHighlightsProps {
  features?: Feature[];
}

const FeatureCard: React.FC<{
  feature: Feature;
  index: number;
}> = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const Icon = feature.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="h-full"
    >
      <GlassCard
        hover="lift"
        className={`p-8 h-full relative overflow-hidden group transition-all duration-300 ${
          isHovered ? 'shadow-2xl' : ''
        }`}
      >
        {/* Animated gradient border */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient}`}
          animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon container with glass effect and float animation */}
        <motion.div
          className="relative z-10 mb-6"
          animate={isHovered ? { y: [-2, 2, -2] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className={`w-20 h-20 rounded-full glass flex items-center justify-center ${feature.accentColor} bg-opacity-10 mx-auto`}
          >
            <motion.div
              animate={isHovered ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Icon size={40} className={`${feature.accentColor.replace('bg-', 'text-')}`} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title with gradient text */}
        <h3 className={`text-2xl font-bold mb-4 text-center bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">{feature.description}</p>

        {/* Learn More button - slides in on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <a
            href={feature.learnMoreUrl}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg glass ${feature.accentColor} bg-opacity-10 hover:bg-opacity-20 transition-all font-semibold text-sm`}
          >
            Learn More
            <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Floating particles matching feature theme */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${feature.accentColor} opacity-30`}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 20}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({ features }) => {
  const defaultFeatures: Feature[] = [
    {
      id: 'tree-planting',
      icon: Sprout,
      title: 'Tree Planting',
      description:
        'Participate in geo-tagged tree planting initiatives with AI-powered verification. Track your trees from seedling to maturity.',
      learnMoreUrl: '/trees',
      accentColor: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      id: 'carbon-credits',
      icon: Leaf,
      title: 'Carbon Credits',
      description:
        'Trade verified carbon credits in our transparent marketplace. Support sustainable development and offset your carbon footprint.',
      learnMoreUrl: '/marketplace',
      accentColor: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'nft-badges',
      icon: Award,
      title: 'Badge Progression',
      description:
        'Start with your Hummingbird welcome badge and progress through Bronze, Silver, Gold, Platinum, and Diamond tiers as you achieve conservation milestones.',
      learnMoreUrl: '/badges',
      accentColor: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'gamification',
      icon: Zap,
      title: 'Gamification',
      description:
        'Compete on leaderboards, unlock achievements, level up, and earn rewards. Make conservation fun and engaging for everyone.',
      learnMoreUrl: '/gamification',
      accentColor: 'bg-purple-500',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      id: 'ai-guidance',
      icon: Bot,
      title: 'AI Guidance',
      description:
        'Get personalized recommendations from our AI chatbot. Receive support for onboarding, cause selection, and conservation activities.',
      learnMoreUrl: '/dashboard',
      accentColor: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'web3-integration',
      icon: Wallet,
      title: 'Web3 Integration',
      description:
        'Connect your crypto wallet to donate ETH, MATIC, or USDC. Enjoy blockchain-verified conservation with transparent tracking.',
      learnMoreUrl: '/initiatives',
      accentColor: 'bg-cyan-500',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];

  const displayFeatures = features && features.length > 0 ? features : defaultFeatures;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mb-6 rounded-full" />
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to make a real impact on climate change. From tree planting to
              blockchain verification, we've got you covered.
            </p>
          </div>
        </AnimatedSection>

        {/* Feature Grid with Masonry Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
