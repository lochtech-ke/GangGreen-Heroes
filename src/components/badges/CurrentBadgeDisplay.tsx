import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import { hummingbirdBadgeService } from '../../services/hummingbirdBadge.service';
import type { Badge } from '../../types/badgeProgression.types';

interface CurrentBadgeDisplayProps {
  badge: Badge;
  className?: string;
}

/**
 * Displays the user's current badge with animation
 * Supports both regular badges and hummingbird welcome badges
 */
export const CurrentBadgeDisplay: React.FC<CurrentBadgeDisplayProps> = ({
  badge,
  className = '',
}) => {
  const [badgeSvg, setBadgeSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if this is a hummingbird badge and generate SVG
  useEffect(() => {
    const generateHummingbirdBadge = async () => {
      if (badge.tier !== 'hummingbird') {
        return; // Not a hummingbird badge, use default display
      }

      setIsLoading(true);
      setHasError(false);

      try {
        // Create hummingbird badge configuration
        const config = hummingbirdBadgeService.createDefaultHummingbirdConfig(
          'display-user', // Placeholder user ID for display
          'bronze',
          'kakamega'
        );

        // Generate the badge SVG
        const result = await hummingbirdBadgeService.generateHummingbirdBadge(config);
        
        if (result.success && result.svg) {
          setBadgeSvg(result.svg);
        } else {
          console.error('[CurrentBadgeDisplay] Failed to generate hummingbird badge:', result.error);
          setHasError(true);
        }
      } catch (error) {
        console.error('[CurrentBadgeDisplay] Error generating hummingbird badge:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    generateHummingbirdBadge();
  }, [badge.tier]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center ${className}`}
    >
      {/* Badge Icon */}
      <div className="relative mb-4">
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: badge.tier === 'hummingbird' ? 1.5 : 2,
            repeat: Infinity,
            repeatDelay: badge.tier === 'hummingbird' ? 2 : 3,
          }}
          className="relative"
        >
          {/* Hummingbird Badge SVG Display */}
          {badge.tier === 'hummingbird' && badgeSvg && !hasError && !isLoading ? (
            <div 
              className="w-32 h-32 rounded-full overflow-hidden shadow-lg"
              dangerouslySetInnerHTML={{ __html: badgeSvg }}
            />
          ) : badge.tier === 'hummingbird' && isLoading ? (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-green-600 flex items-center justify-center shadow-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          ) : (
            /* Default Badge Display */
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Award className="w-20 h-20 text-white" strokeWidth={1.5} />
            </div>
          )}
          
          {/* Enhanced Sparkle Effect for Hummingbird Badge */}
          <motion.div
            animate={{
              scale: badge.tier === 'hummingbird' ? [1, 1.3, 1] : [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
              rotate: badge.tier === 'hummingbird' ? [0, 360] : [0, 0],
            }}
            transition={{
              duration: badge.tier === 'hummingbird' ? 3 : 2,
              repeat: Infinity,
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className={`${badge.tier === 'hummingbird' ? 'w-10 h-10 text-teal-400' : 'w-8 h-8 text-yellow-400'}`} />
          </motion.div>

          {/* Special Welcome Badge Indicator */}
          {badge.tier === 'hummingbird' && (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
              className="absolute -bottom-2 -left-2"
            >
              <div className="bg-gradient-to-r from-teal-500 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Welcome!
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{badge.name}</h3>
        <p className="text-sm text-gray-600 max-w-xs">{badge.description}</p>
        
        {/* Special message for hummingbird badge */}
        {badge.tier === 'hummingbird' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-teal-600 mt-2 font-medium"
          >
            🐦 Your journey begins here!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
