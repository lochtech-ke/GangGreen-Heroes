import type { Tree } from '../../types/tree.types';

interface TreeCardProps {
  tree: Tree;
  onClick?: () => void;
  showLocation?: boolean;
}

export function TreeCard({ tree, onClick, showLocation = true }: TreeCardProps) {
  const getHealthStatusColor = (status?: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-700 border-green-200',
      stressed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      diseased: 'bg-orange-100 text-orange-700 border-orange-200',
      dead: 'bg-red-100 text-red-700 border-red-200',
    };
    return status
      ? colors[status as keyof typeof colors]
      : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getHealthStatusIcon = (status?: string) => {
    const icons = {
      healthy: '🌳',
      stressed: '⚠️',
      diseased: '🦠',
      dead: '💀',
    };
    return status ? icons[status as keyof typeof icons] : '🌱';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTreeAge = (plantedDate: string) => {
    const planted = new Date(plantedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} old`;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-5 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{tree.species}</h3>
          <p className="text-sm text-gray-600">{getTreeAge(tree.planted_date)}</p>
        </div>
        <div className="text-3xl">{getHealthStatusIcon(tree.health_status)}</div>
      </div>

      {/* Health Status */}
      {tree.health_status && (
        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getHealthStatusColor(
              tree.health_status
            )}`}
          >
            {tree.health_status.charAt(0).toUpperCase() + tree.health_status.slice(1)}
          </span>
        </div>
      )}

      {/* Measurements */}
      {(tree.current_height_cm || tree.current_diameter_cm) && (
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 rounded-md">
          {tree.current_height_cm && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Height</p>
              <p className="text-sm font-semibold text-gray-900">
                {tree.current_height_cm} cm
              </p>
            </div>
          )}
          {tree.current_diameter_cm && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Diameter</p>
              <p className="text-sm font-semibold text-gray-900">
                {tree.current_diameter_cm} cm
              </p>
            </div>
          )}
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Planted:</span>
          <span className="font-medium text-gray-900">
            {formatDate(tree.planted_date)}
          </span>
        </div>

        {showLocation && (
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium text-gray-900">
              {tree.location.coordinates[1].toFixed(4)}°N,{' '}
              {tree.location.coordinates[0].toFixed(4)}°E
            </span>
          </div>
        )}

        {tree.last_monitored && (
          <div className="flex justify-between">
            <span className="text-gray-600">Last Monitored:</span>
            <span className="font-medium text-gray-900">
              {formatDate(tree.last_monitored)}
            </span>
          </div>
        )}

        {tree.antugrow_id && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
              <span>🤖</span> AI Monitored
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
