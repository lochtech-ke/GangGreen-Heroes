import { MapPin } from 'lucide-react';
import { ForestStatRow } from './ForestStatRow';
import { ForestStats } from '../../../services/dashboard.service';

interface ForestCardProps {
  forest: ForestStats;
}

export function ForestCard({ forest }: ForestCardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-bold text-gray-800">{forest.forest_name}</h3>
      </div>
      
      <div className="space-y-3">
        <ForestStatRow
          label="Trees Planted:"
          value={forest.trees_planted.toLocaleString()}
          color="text-green-600"
        />
        <ForestStatRow
          label="CO₂ Sequestered:"
          value={`${forest.carbon_sequestered_tons.toFixed(1)} t`}
          color="text-blue-600"
        />
        <ForestStatRow
          label="Active Initiatives:"
          value={forest.active_initiatives}
          color="text-purple-600"
        />
        <ForestStatRow
          label="Community Members:"
          value={forest.community_members}
          color="text-orange-600"
        />
        <ForestStatRow
          label="Area:"
          value={`${forest.total_area_hectares} ha`}
          color="text-gray-800"
        />
      </div>
    </div>
  );
}