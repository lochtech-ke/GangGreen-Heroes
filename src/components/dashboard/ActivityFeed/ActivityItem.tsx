import { ActivityIcon } from './ActivityIcon';
import { ActivityFeedItem } from '../../../services/dashboard.service';

interface ActivityItemProps {
  activity: ActivityFeedItem;
  formatDate: (date: string) => string;
}

export function ActivityItem({ activity, formatDate }: ActivityItemProps) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <ActivityIcon type={activity.type} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 text-sm">
          {activity.title}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {activity.description}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatDate(activity.timestamp)}
          </span>
          {activity.forest && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded capitalize">
              {activity.forest}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}