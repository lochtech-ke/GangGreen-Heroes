import { BarChart3 } from 'lucide-react';
import { TrendBar } from './TrendBar';
import { TrendTimeline } from './TrendTimeline';
import { TrendData } from '../../../services/dashboard.service';
import { LoadingSpinner } from '../../marketplace/common/LoadingSpinner';

interface TrendChartProps {
  trendData: TrendData[];
  loading: boolean;
}

export function TrendChart({ trendData, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Growth Trends</h2>
        <div className="text-center py-12 text-gray-500">
          No trend data available for selected period
        </div>
      </div>
    );
  }

  const latestData = trendData[trendData.length - 1];
  const maxTrees = Math.max(...trendData.map(d => d.trees_planted), 1);
  const maxCarbon = Math.max(...trendData.map(d => d.carbon_sequestered), 1);
  const maxParticipants = Math.max(...trendData.map(d => d.participants), 1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Growth Trends</h2>
        <BarChart3 className="w-6 h-6 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <TrendBar
          label="Trees Planted"
          value={latestData.trees_planted}
          percentage={(latestData.trees_planted / maxTrees) * 100}
          color="text-green-600"
        />
        
        <TrendBar
          label="Carbon Sequestered (tons)"
          value={latestData.carbon_sequestered.toFixed(1)}
          percentage={(latestData.carbon_sequestered / maxCarbon) * 100}
          color="text-blue-600"
        />
        
        <TrendBar
          label="Participants"
          value={latestData.participants}
          percentage={(latestData.participants / maxParticipants) * 100}
          color="text-purple-600"
        />
      </div>

      <TrendTimeline trendData={trendData} />
    </div>
  );
}