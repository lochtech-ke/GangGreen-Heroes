import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { CurrentBadgeDisplay } from './CurrentBadgeDisplay';
import { RequirementsList } from './RequirementsList';
import { NextBadgePreview } from './NextBadgePreview';
import { BadgeTimeline } from './BadgeTimeline';
import { useBadgeProgression } from '../../hooks/useBadgeProgression';
import { badgeProgressionService } from '../../services/badgeProgression.service';
import type { Badge } from '../../types/badgeProgression.types';

interface BadgeProgressionViewProps {
  userId: string;
  className?: string;
}

/**
 * Main badge progression view component
 * Displays current badge, progress, and timeline
 */
export const BadgeProgressionView: React.FC<BadgeProgressionViewProps> = ({
  userId,
  className = '',
}) => {
  const { currentBadge, nextBadge, progressPercentage, requirementProgress, loading, error } =
    useBadgeProgression(userId);
  
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Fetch all badges for timeline
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const badges = await badgeProgressionService.getAllBadges();
        setAllBadges(badges);
      } catch (err) {
        console.error('[BadgeProgressionView] Error fetching badges:', err);
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, []);

  // Loading state
  if (loading || loadingBadges) {
    return (
      <GlassCard className={className}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  // Error state
  if (error || !currentBadge) {
    return (
      <GlassCard className={className}>
        <div className="text-center py-12">
          <p className="text-gray-600">
            {error || 'Unable to load badge progression'}
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Badge Section */}
      <GlassCard>
        <CurrentBadgeDisplay badge={currentBadge} />
      </GlassCard>

      {/* Progress Section */}
      {nextBadge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NextBadgePreview
            badge={nextBadge}
            progressPercentage={progressPercentage}
          />
        </motion.div>
      )}

      {/* Requirements Section */}
      {requirementProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <RequirementsList requirements={requirementProgress} />
          </GlassCard>
        </motion.div>
      )}

      {/* Badge Timeline Section */}
      {allBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <BadgeTimeline allBadges={allBadges} currentBadge={currentBadge} />
          </GlassCard>
        </motion.div>
      )}

      {/* Max Tier Reached */}
      {!nextBadge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="green">
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-gray-700">
                You've reached the highest badge tier: {currentBadge.name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Keep engaging with the community to unlock Green Hero variants!
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};
