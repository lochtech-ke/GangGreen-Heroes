import type { AntugrowAnalysisResult } from '../../services/antugrow.service';

interface AntugrowAnalysisDisplayProps {
  analysis: AntugrowAnalysisResult;
  showRecommendations?: boolean;
}

export function AntugrowAnalysisDisplay({
  analysis,
  showRecommendations = true,
}: AntugrowAnalysisDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900">AI Analysis Results</h3>
          <p className="text-sm text-blue-700">Powered by Antugrow</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Health Score */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Health Score</p>
          <p className="text-3xl font-bold text-blue-900">{analysis.health_score}</p>
          <p className="text-xs text-gray-500">out of 100</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
          <p className="text-3xl font-bold text-green-700">{analysis.growth_rate}%</p>
          <p className="text-xs text-gray-500">annual</p>
        </div>
      </div>

      {/* Disease Detection */}
      {analysis.disease_detected && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-red-900 mb-1">Disease Detected</h4>
              <p className="text-sm text-red-800">
                The AI has detected signs of disease or stress. Please review the
                recommendations below and take appropriate action.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {analysis.confidence_score !== undefined && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Analysis Confidence</span>
            <span className="text-sm font-bold text-blue-900">
              {analysis.confidence_score}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysis.confidence_score}%` }}
            />
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && analysis.recommendations.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span> AI Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs text-blue-700">
          <span>Analysis ID: {analysis.antugrow_id}</span>
          <span>{formatDate(analysis.analyzed_at)}</span>
        </div>
      </div>
    </div>
  );
}
