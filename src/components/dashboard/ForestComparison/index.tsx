import { ForestCard } from './ForestCard';
import { ForestStats } from '../../../services/dashboard.service';
import { LoadingSpinner } from '../../marketplace/common/LoadingSpinner';

interface ForestComparisonProps {
  forestStats: ForestStats[];
  loading: boolean;
}

export function ForestComparison({ forestStats, loading }: ForestComparisonProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (forestStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Forest Comparison</h2>
        <div className="text-center py-12 text-gray-500">
          No forest data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Forest Comparison</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {forestStats.map(forest => (
          <ForestCard key={forest.forest_code} forest={forest} />
        ))}
      </div>
    </div>
  );
}