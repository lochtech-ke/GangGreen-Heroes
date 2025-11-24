import React from 'react';
import { motion } from 'framer-motion';
import { Award, Check } from 'lucide-react';
import type { Badge } from '../../types/badgeProgression.types';

interface BadgeTimelineProps {
  allBadges: Badge[];
  currentBadge: Badge;
  className?: string;
}

/**
 * Displays a timeline of all badge tiers showing progression
 */
export const BadgeTimeline: React.FC<BadgeTimelineProps> = ({
  allBadges,
  currentBadge,
  className = '',
}) => {
  const sortedBadges = [...allBadges].sort((a, b) => a.tier_order - b.tier_order);

  return (
    <div className={`${className}`}>
      <h4 className="text-lg font-semibold text-gray-900 mb-6">Badge Journey</h4>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {/* Progress Line */}
        <motion.div
          initial={{ height: 0 }}
          animate={{
            height: `${(currentBadge.tier_order / sortedBadges.length) * 100}%`,
          }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-green-500 to-green-600"
        />

        {/* Badge Items */}
        <div className="space-y-6">
          {sortedBadges.map((badge, index) => {
            const isEarned = badge.tier_order <= currentBadge.tier_order;
            const isCurrent = badge.id === currentBadge.id;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Badge Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
                      isEarned
                        ? 'bg-gradient-to-br from-green-400 to-green-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isEarned ? (
                      <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
                    ) : (
                      <Award
                        className={`w-6 h-6 ${isEarned ? 'text-white' : 'text-gray-400'}`}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  
                  {/* Current Badge Indicator */}
                  {isCurrent && (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 rounded-full border-2 border-green-500"
                    />
                  )}
                </div>

                {/* Badge Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5
                      className={`font-semibold ${
                        isEarned ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {badge.name}
                    </h5>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                    {badge.description}
                  </p>
                  
                  {/* Requirements Summary */}
                  {badge.requirements.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {badge.requirements.map((req, reqIndex) => (
                        <span
                          key={reqIndex}
                          className={`text-xs px-2 py-1 rounded ${
                            isEarned
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {req.count} {req.type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
