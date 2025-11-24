import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import type { Badge } from '../../types/badgeProgression.types';

interface CurrentBadgeDisplayProps {
  badge: Badge;
  className?: string;
}

/**
 * Displays the user's current badge with animation
 */
export const CurrentBadgeDisplay: React.FC<CurrentBadgeDisplayProps> = ({
  badge,
  className = '',
}) => {
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
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="relative"
        >
          {/* Badge Image/Icon */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <Award className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Sparkle Effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{badge.name}</h3>
        <p className="text-sm text-gray-600 max-w-xs">{badge.description}</p>
      </div>
    </motion.div>
  );
};
