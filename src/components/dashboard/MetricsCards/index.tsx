import { Leaf, TrendingUp, Target, Users } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ImpactMetrics } from '../../../services/dashboard.service';

interface MetricsCardsProps {
  metrics: ImpactMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        icon={<Leaf className="w-10 h-10" />}
        value={metrics.total_trees_planted.toLocaleString()}
        label="Trees Planted"
        gradient="from-green-500 to-green-600"
        sublabel={`Target forest: ${metrics.forest === 'all' ? 'All forests' : metrics.forest}`}
      />
      
      <MetricCard
        icon={<TrendingUp className="w-10 h-10" />}
        value={metrics.total_carbon_sequestered_tons.toLocaleString()}
        label="Tons CO₂ Sequestered"
        gradient="from-blue-500 to-blue-600"
        sublabel="Estimated carbon offset"
      />
      
      <MetricCard
        icon={<Target className="w-10 h-10" />}
        value={metrics.active_initiatives}
        label="Active Initiatives"
        gradient="from-purple-500 to-purple-600"
        sublabel="Ongoing conservation projects"
      />
      
      <MetricCard
        icon={<Users className="w-10 h-10" />}
        value={metrics.total_participants.toLocaleString()}
        label="Participants"
        gradient="from-orange-500 to-orange-600"
        sublabel="Community members involved"
      />
    </div>
  );
}