import React from 'react';
import { motion } from 'framer-motion';
import { Award, Info } from 'lucide-react';
import { JourneyStage } from '../../types/journey.types';

interface BadgeTierIndicatorProps {
  currentTier: string;
  journeyStage: JourneyStage;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

/**
 * Badge Tier Indicator Component
 * Displays badge tier alongside journey stage with visual correlation
 * Used in journey dashboard to show badge-journey relationship
 * 
 * Requirements: 4.1, 4.2
 */
export const BadgeTierIndicator: React.FC<BadgeTierIndicatorProps> = ({
  currentTier,
  journeyStage,
  size = 'md',
  showTooltip = true,
  className = '',
}) => {
  const [showInfo, setShowInfo] = React.useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'gap-2',
      badge: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs',
      title: 'text-sm',
    },
    md: {
      container: 'gap-3',
      badge: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-sm',
      title: 'text-base',
    },
    lg: {
      container: 'gap-4',
      badge: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-base',
      title: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  // Get badge tier display name
  const getTierDisplayName = (tier: string): string => {
    return tier
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get journey stage display name
  const getStageDisplayName = (stage: JourneyStage): string => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  // Get correlation color based on alignment
  const getCorrelationColor = (): string => {
    const tierStageMap: Record<string, JourneyStage> = {
      hummingbird: JourneyStage.AWARENESS,
      community_contributor: JourneyStage.ACTIVATION,
      climate_advocate: JourneyStage.ACTION,
      environmental_champion: JourneyStage.VERIFICATION,
      green_hero: JourneyStage.LEGACY,
    };

    const expectedStage = tierStageMap[currentTier.toLowerCase()];
    const isAligned = expectedStage === journeyStage;

    return isAligned ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600';
  };

  // Get tooltip content
  const getTooltipContent = (): string => {
    const tierStageMap: Record<string, JourneyStage> = {
      hummingbird: JourneyStage.AWARENESS,
      community_contributor: JourneyStage.ACTIVATION,
      climate_advocate: JourneyStage.ACTION,
      environmental_champion: JourneyStage.VERIFICATION,
      green_hero: JourneyStage.LEGACY,
    };

    const expectedStage = tierStageMap[currentTier.toLowerCase()];
    const isAligned = expectedStage === journeyStage;

    if (isAligned) {
      return `Your ${getTierDisplayName(currentTier)} badge aligns with your ${getStageDisplayName(journeyStage)} stage!`;
    } else {
      return `Your badge tier and journey stage are progressing independently. Keep engaging to advance both!`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center ${config.container}`}
      >
        {/* Badge Tier Display */}
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className={`${config.badge} rounded-full bg-gradient-to-br ${getCorrelationColor()} flex items-center justify-center shadow-md`}>
              <Award className={`${config.icon} text-white`} strokeWidth={2} />
            </div>
            {currentTier.toLowerCase() === 'hummingbird' && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute -top-1 -right-1"
              >
                <div className="w-4 h-4 bg-teal-400 rounded-full flex items-center justify-center text-xs">
                  🐦
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="flex flex-col">
            <span className={`${config.title} font-bold text-gray-900`}>
              {getTierDisplayName(currentTier)}
            </span>
            <span className={`${config.text} text-gray-600`}>
              Badge Tier
            </span>
          </div>
        </div>

        {/* Correlation Indicator */}
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 mx-1"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-gray-400 to-gray-300"></div>
        </div>

        {/* Journey Stage Display */}
        <div className="flex items-center gap-2">
          <div className={`${config.badge} rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md`}>
            <span className={`${config.icon} text-white font-bold`}>
              {getStageDisplayName(journeyStage).charAt(0)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className={`${config.title} font-bold text-gray-900`}>
              {getStageDisplayName(journeyStage)}
            </span>
            <span className={`${config.text} text-gray-600`}>
              Journey Stage
            </span>
          </div>
        </div>

        {/* Info Icon */}
        {showTooltip && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfo(!showInfo)}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Show badge-journey correlation info"
          >
            <Info className="w-4 h-4 text-gray-500" />
          </motion.button>
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 z-10"
        >
          <div className="glass rounded-lg p-3 shadow-lg">
            <p className="text-sm text-gray-700">
              {getTooltipContent()}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
