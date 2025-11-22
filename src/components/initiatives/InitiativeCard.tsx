import React from 'react';
import { TreePine, Users, Target } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { Initiative } from '../../types/initiative.types';

export interface InitiativeCardProps {
  initiative: Initiative;
  onClick: () => void;
}

const InitiativeCard: React.FC<InitiativeCardProps> = ({ initiative, onClick }) => {
  const forestNames = {
    kakamega: 'Kakamega Forest',
    karura: 'Karura Forest',
    mau: 'Mau Forest',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <GlassCard
      className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1 pr-2">
          {initiative.title}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[initiative.status]}`}
        >
          {initiative.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {initiative.description || 'No description available'}
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <TreePine size={16} className="text-green-600 flex-shrink-0" />
          <span>{forestNames[initiative.forest]}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Users size={16} className="text-blue-600 flex-shrink-0" />
          <span>{initiative.participant_count || 0} participants</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Target size={16} className="text-purple-600 flex-shrink-0" />
          <span>
            {initiative.trees_planted.toLocaleString()} / {initiative.target_trees.toLocaleString()} trees
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{initiative.progress_percentage?.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(initiative.progress_percentage || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default InitiativeCard;
