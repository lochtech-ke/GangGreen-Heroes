import type { Initiative } from '../../types/initiative.types';

interface InitiativeCardProps {
  initiative: Initiative;
  onClick?: () => void;
}

export function InitiativeCard({
  initiative,
  onClick,
}: InitiativeCardProps) {
  const progressPercentage = Math.min(
    Math.round((initiative.trees_planted / initiative.target_trees) * 100),
    100
  );

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getForestDisplay = (forest: string) => {
    const forestMap: Record<string, string> = {
      kakamega: 'Kakamega Forest',
      karura: 'Karura Forest',
      mau: 'Mau Forest',
    };
    return forestMap[forest] || forest;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {initiative.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                initiative.status
              )}`}
            >
              {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              {getForestDisplay(initiative.forest)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {initiative.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-green-600">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600">
            {initiative.trees_planted.toLocaleString()} planted
          </span>
          <span className="text-xs text-gray-600">
            {initiative.target_trees.toLocaleString()} target
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-600 mb-1">Area</p>
          <p className="text-sm font-semibold text-gray-900">
            {initiative.area_hectares} hectares
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Timeline</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(initiative.start_date)}
            {initiative.end_date && ` - ${formatDate(initiative.end_date)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
