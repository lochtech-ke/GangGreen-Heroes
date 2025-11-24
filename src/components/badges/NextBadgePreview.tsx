import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, ArrowRight } from 'lucide-react';
import type { Badge } from '../../types/badgeProgression.types';

interface NextBadgePreviewProps {
  badge: Badge;
  progressPercentage: number;
  className?: string;
}

/**
 * Displays a preview of the next badge to earn
 */
export const NextBadgePreview: React.FC<NextBadgePreviewProps> = ({
  badge,
  progressPercentage,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`glass rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="w-5 h-5 text-green-600" />
        <h4 className="text-lg font-semibold text-gray-900">Next Badge</h4>
      </div>

      {/* Badge Preview */}
      <div className="flex items-center gap-4">
        {/* Badge Icon (Locked) */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
            <Award className="w-12 h-12 text-white opacity-50" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Badge Info */}
        <div className="flex-1">
          <h5 className="text-lg font-bold text-gray-900 mb-1">{badge.name}</h5>
          <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
