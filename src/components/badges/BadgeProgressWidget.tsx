import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Lock, Loader2 } from 'lucide-react';
import { useBadgeProgression } from '../../hooks/useBadgeProgression';

interface BadgeProgressWidgetProps {
  userId: string;
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

/**
 * Badge Progress Widget Component
 * Displays current badge tier and progress to next tier
 * Used in dashboard for quick badge status overview
 * 
 * Requirements: 2.1, 2.2
 */
export const BadgeProgressWidget: React.FC<BadgeProgressWidgetProps> = ({
  userId,
  compact = false,
  showProgress = true,
  className = '',
}) => {
  const { currentBadge, nextBadge, progressPercentage, loading, error } = useBadgeProgression(userId);

  // Loading state
  if (loading) {
    return (
      <div className={`glass rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentBadge) {
    return (
      <div className={`glass rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Award className="w-5 h-5" />
          <span className="text-sm">Badge unavailable</span>
        </div>
      </div>
    );
  }

  // Compact mode - minimal display
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`glass rounded-lg p-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          {/* Badge Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
              <Award className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Badge Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {currentBadge.name}
            </p>
            {nextBadge && showProgress && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {progressPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Full mode - detailed display
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Badge</h3>
        {currentBadge.tier === 'hummingbird' && (
          <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
            Welcome Badge
          </span>
        )}
      </div>

      {/* Current Badge Display */}
      <div className="flex items-center gap-4 mb-4">
        {/* Badge Icon */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex-shrink-0"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Award className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            {currentBadge.tier === 'hummingbird' && (
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
                <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">🐦</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold text-gray-900 mb-1">
            {currentBadge.name}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {currentBadge.description}
          </p>
        </div>
      </div>

      {/* Progress to Next Badge */}
      {nextBadge && showProgress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Progress to {nextBadge.name}</span>
            </div>
            <span className="font-semibold text-green-600">
              {progressPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
            />
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ width: '50%' }}
            />
          </div>

          {/* Next Badge Preview */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative">
              <Award className="w-5 h-5 text-white opacity-50" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-3 h-3 text-gray-700" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                Next: {nextBadge.name}
              </p>
            </div>
          </div>
        </div>
      ) : !nextBadge ? (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Award className="w-4 h-4" />
            <span className="font-medium">Maximum tier reached!</span>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};
