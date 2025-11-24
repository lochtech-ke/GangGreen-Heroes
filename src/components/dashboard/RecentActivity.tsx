import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, MessageSquare, Users, UserPlus, 
  CheckCircle, Clock 
} from 'lucide-react';
// Simple time ago formatter
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
};

interface Activity {
  id: string;
  type: 'action' | 'post' | 'initiative' | 'referral';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
  className?: string;
}

/**
 * Recent activity feed for dashboard
 * Shows user's recent community engagement actions
 */
export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`glass rounded-2xl p-6 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'action':
        return <Target className="w-5 h-5" />;
      case 'post':
        return <MessageSquare className="w-5 h-5" />;
      case 'initiative':
        return <Users className="w-5 h-5" />;
      case 'referral':
        return <UserPlus className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'action':
        return 'bg-blue-100 text-blue-700';
      case 'post':
        return 'bg-purple-100 text-purple-700';
      case 'initiative':
        return 'bg-green-100 text-green-700';
      case 'referral':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={`glass rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No recent activity</p>
          <p className="text-gray-400 text-xs mt-1">
            Start engaging with the community to see your activity here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                  {activity.points && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      +{activity.points} pts
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View All Link */}
      {activities.length > 0 && (
        <button className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-xl transition-colors">
          View All Activity
        </button>
      )}
    </motion.div>
  );
};
