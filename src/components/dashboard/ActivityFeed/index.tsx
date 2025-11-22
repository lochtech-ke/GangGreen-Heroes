import { ActivityItem } from './ActivityItem';
import { ActivityFeedItem } from '../../../services/dashboard.service';
import { LoadingSpinner } from '../../marketplace/common/LoadingSpinner';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  loading: boolean;
}

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
      
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No recent activities
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}