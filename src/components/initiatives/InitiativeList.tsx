import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine } from 'lucide-react';
import InitiativeCard from './InitiativeCard';
import { GlassCard } from '../common/GlassCard';
import type { Initiative } from '../../types/initiative.types';

export interface InitiativeListProps {
  initiatives: Initiative[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const InitiativeList: React.FC<InitiativeListProps> = ({
  initiatives,
  loading = false,
  error = null,
  onRetry,
}) => {
  const navigate = useNavigate();

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <GlassCard className="p-6 bg-red-50 border-red-200">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        )}
      </GlassCard>
    );
  }

  // Empty State
  if (initiatives.length === 0) {
    return (
      <div className="col-span-full">
        <GlassCard className="p-12 text-center">
          <TreePine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No initiatives found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your filters or create a new initiative
          </p>
          <button
            onClick={() => navigate('/initiatives/create')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Create Initiative
          </button>
        </GlassCard>
      </div>
    );
  }

  // Initiatives Grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initiatives.map((initiative) => (
        <InitiativeCard
          key={initiative.id}
          initiative={initiative}
          onClick={() => navigate(`/initiatives/${initiative.id}`)}
        />
      ))}
    </div>
  );
};

export default InitiativeList;
