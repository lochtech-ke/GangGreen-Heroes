import type { TreeHealthStatus as HealthStatus } from '../../types/tree.types';
import type { AntugrowAnalysisResult } from '../../services/antugrow.service';

interface TreeHealthStatusProps {
  healthStatus?: HealthStatus;
  analysis?: AntugrowAnalysisResult;
  showDetails?: boolean;
}

export function TreeHealthStatus({
  healthStatus,
  analysis,
  showDetails = true,
}: TreeHealthStatusProps) {
  const getHealthColor = (status?: HealthStatus) => {
    const colors = {
      healthy: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: '🌳',
      },
      stressed: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: '⚠️',
      },
      diseased: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: '🦠',
      },
      dead: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: '💀',
      },
    };
    return status ? colors[status] : colors.healthy;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    if (score >= 40) return 'text-orange-700';
    return 'text-red-700';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const colors = getHealthColor(healthStatus);

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{colors.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tree Health Status</h3>
            {healthStatus && (
              <p className={`text-sm font-medium ${colors.text}`}>
                {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              </p>
            )}
          </div>
        </div>
      </div>

      {analysis && showDetails && (
        <div className="space-y-4">
          {/* Health Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">AI Health Score</span>
              <span className={`text-2xl font-bold ${getHealthScoreColor(analysis.health_score)}`}>
                {analysis.health_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  analysis.health_score >= 80
                    ? 'bg-green-600'
                    : analysis.health_score >= 60
                    ? 'bg-yellow-600'
                    : analysis.health_score >= 40
                    ? 'bg-orange-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${analysis.health_score}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getHealthScoreLabel(analysis.health_score)} condition
            </p>
          </div>

          {/* Growth Rate */}
          <div className="flex items-center justify-between p-3 bg-white rounded-md">
            <span className="text-sm font-medium text-gray-700">Growth Rate</span>
            <span className="text-lg font-bold text-blue-700">
              {analysis.growth_rate}%
            </span>
          </div>

          {/* Disease Detection */}
          {analysis.disease_detected && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-red-700 font-semibold">⚠️ Disease Detected</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Immediate attention required. Check recommendations below.
              </p>
            </div>
          )}

          {/* Confidence Score */}
          {analysis.confidence_score !== undefined && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Analysis Confidence</span>
              <span className="font-medium">{analysis.confidence_score}%</span>
            </div>
          )}

          {/* Last Analysis */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Last analyzed:{' '}
              {new Date(analysis.analyzed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      )}

      {!analysis && showDetails && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            No AI analysis available yet. Upload an image to get started.
          </p>
        </div>
      )}
    </div>
  );
}
