interface GrowthDataPoint {
  date: string;
  height_cm?: number;
  diameter_cm?: number;
  health_score?: number;
}

interface TreeGrowthChartProps {
  data: GrowthDataPoint[];
  metric: 'height' | 'diameter' | 'health';
}

export function TreeGrowthChart({ data, metric }: TreeGrowthChartProps) {
  const getMetricValue = (point: GrowthDataPoint): number | undefined => {
    switch (metric) {
      case 'height':
        return point.height_cm;
      case 'diameter':
        return point.diameter_cm;
      case 'health':
        return point.health_score;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'height':
        return 'Height (cm)';
      case 'diameter':
        return 'Diameter (cm)';
      case 'health':
        return 'Health Score';
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'height':
        return 'bg-green-600';
      case 'diameter':
        return 'bg-blue-600';
      case 'health':
        return 'bg-purple-600';
    }
  };

  // Filter out data points without the metric
  const validData = data.filter((point) => getMetricValue(point) !== undefined);

  if (validData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No {metric} data available</p>
      </div>
    );
  }

  // Calculate min and max for scaling
  const values = validData.map((point) => getMetricValue(point)!);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{getMetricLabel()} Over Time</h3>

      {/* Simple Bar Chart */}
      <div className="space-y-3">
        {validData.map((point, index) => {
          const value = getMetricValue(point)!;
          const percentage = ((value - minValue) / range) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{formatDate(point.date)}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getMetricColor()}`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-600 mb-1">Minimum</p>
          <p className="text-lg font-bold text-gray-900">{minValue}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Maximum</p>
          <p className="text-lg font-bold text-gray-900">{maxValue}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Growth</p>
          <p className="text-lg font-bold text-green-700">
            +{(maxValue - minValue).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
