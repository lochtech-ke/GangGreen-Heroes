import React from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import type { BadgeProgress } from '../../types/badgeProgression.types';

interface BadgeProgressCardProps {
  progress: BadgeProgress | null;
  loading?: boolean;
  className?: string;
}

/**
 * Badge progress card for dashboard
 * Shows current badge and progress to next tier
 */
export const BadgeProgressCard: React.FC<BadgeProgressCardProps> = ({
  progress,
  loading = false,
  className = '',
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`glass rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const { currentBadge, nextBadge, progressPercentage } = progress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`glass rounded-2xl p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Badge Progress</h3>
        <button
          onClick={() => navigate('/badges')}
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Current Badge */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <Award className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">Current Badge</p>
          <p className="text-xl font-bold text-gray-900">{currentBadge.name}</p>
        </div>
      </div>

      {/* Next Badge Preview */}
      {nextBadge ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">Next: {nextBadge.name}</p>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            current={progressPercentage}
            total={100}
            showPercentage={true}
            color="green"
            size="md"
          />

          {/* Requirements Summary */}
          {progress.requirementProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              {progress.requirementProgress.slice(0, 2).map((req, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{req.requirement.description}</span>
                  <span className={`font-medium ${req.isComplete ? 'text-green-600' : 'text-gray-900'}`}>
                    {req.current}/{req.target}
                  </span>
                </div>
              ))}
              {progress.requirementProgress.length > 2 && (
                <button
                  onClick={() => navigate('/badges')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  +{progress.requirementProgress.length - 2} more requirements
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="glass-green rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            🎉 Maximum Badge Tier Reached!
          </p>
          <p className="text-xs text-gray-600">
            Unlock Green Hero variants by continuing your engagement
          </p>
        </div>
      )}
    </motion.div>
  );
};
