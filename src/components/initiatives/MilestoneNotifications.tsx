import { useEffect, useState } from 'react';
import type { Initiative, InitiativeProgress } from '../../types/initiative.types';

interface Milestone {
  percentage: number;
  reached: boolean;
  message: string;
  icon: string;
}

interface MilestoneNotificationsProps {
  initiative: Initiative;
  progress: InitiativeProgress;
  onMilestoneReached?: (milestone: Milestone) => void;
}

export function MilestoneNotifications({
  initiative,
  progress,
  onMilestoneReached,
}: MilestoneNotificationsProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recentMilestone, setRecentMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    calculateMilestones();
  }, [progress.progress_percentage]);

  const calculateMilestones = () => {
    const milestonePercentages = [25, 50, 75, 90, 100];
    const currentProgress = progress.progress_percentage;

    const calculatedMilestones: Milestone[] = milestonePercentages.map(
      (percentage) => {
        const reached = currentProgress >= percentage;
        return {
          percentage,
          reached,
          message: getMilestoneMessage(percentage, initiative.target_trees),
          icon: getMilestoneIcon(percentage),
        };
      }
    );

    setMilestones(calculatedMilestones);

    // Check if we just reached a new milestone
    const justReached = calculatedMilestones.find(
      (m) => m.reached && m.percentage === Math.floor(currentProgress / 25) * 25
    );

    if (justReached && justReached.percentage === currentProgress) {
      setRecentMilestone(justReached);
      onMilestoneReached?.(justReached);

      // Clear recent milestone after 5 seconds
      setTimeout(() => setRecentMilestone(null), 5000);
    }
  };

  const getMilestoneMessage = (percentage: number, targetTrees: number): string => {
    const treesAtMilestone = Math.round((targetTrees * percentage) / 100);

    switch (percentage) {
      case 25:
        return `Quarter way there! ${treesAtMilestone.toLocaleString()} trees planted 🌱`;
      case 50:
        return `Halfway to the goal! ${treesAtMilestone.toLocaleString()} trees planted 🌳`;
      case 75:
        return `Three quarters complete! ${treesAtMilestone.toLocaleString()} trees planted 🌲`;
      case 90:
        return `Almost there! ${treesAtMilestone.toLocaleString()} trees planted 🎯`;
      case 100:
        return `Goal achieved! ${treesAtMilestone.toLocaleString()} trees planted! 🎉`;
      default:
        return `${percentage}% complete`;
    }
  };

  const getMilestoneIcon = (percentage: number): string => {
    switch (percentage) {
      case 25:
        return '🌱';
      case 50:
        return '🌳';
      case 75:
        return '🌲';
      case 90:
        return '🎯';
      case 100:
        return '🎉';
      default:
        return '✓';
    }
  };

  const getMilestoneColor = (percentage: number): string => {
    if (percentage <= 25) return 'from-green-400 to-green-600';
    if (percentage <= 50) return 'from-blue-400 to-blue-600';
    if (percentage <= 75) return 'from-purple-400 to-purple-600';
    if (percentage <= 90) return 'from-orange-400 to-orange-600';
    return 'from-yellow-400 to-yellow-600';
  };

  return (
    <div className="space-y-4">
      {/* Recent Milestone Alert */}
      {recentMilestone && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{recentMilestone.icon}</span>
            <div>
              <p className="font-bold text-green-900">
                Milestone Reached: {recentMilestone.percentage}%
              </p>
              <p className="text-sm text-green-700">{recentMilestone.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>

        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.percentage}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                milestone.reached
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  milestone.reached
                    ? `bg-gradient-to-br ${getMilestoneColor(milestone.percentage)}`
                    : 'bg-gray-200'
                }`}
              >
                {milestone.reached ? (
                  <span>{milestone.icon}</span>
                ) : (
                  <span className="text-gray-400">○</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-semibold ${
                      milestone.reached ? 'text-green-900' : 'text-gray-600'
                    }`}
                  >
                    {milestone.percentage}% Milestone
                  </span>
                  {milestone.reached && (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      Completed ✓
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    milestone.reached ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {milestone.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      {progress.progress_percentage < 100 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Next milestone:</span>{' '}
            {milestones.find((m) => !m.reached)?.percentage || 100}% -{' '}
            {progress.trees_remaining.toLocaleString()} more trees to go!
          </p>
        </div>
      )}
    </div>
  );
}
