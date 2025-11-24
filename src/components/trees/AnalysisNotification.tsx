import { useState, useEffect } from 'react';
import type { AntugrowAnalysisResult } from '../../services/antugrow.service';

interface AnalysisNotificationProps {
  analysis: AntugrowAnalysisResult;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export function AnalysisNotification({
  analysis,
  onDismiss,
  autoDismiss = false,
  dismissDelay = 10000,
}: AnalysisNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for fade out animation
  };

  if (!isVisible) {
    return null;
  }

  const getNotificationStyle = () => {
    if (analysis.disease_detected) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        icon: '⚠️',
        title: 'Disease Detected!',
        titleColor: 'text-red-900',
      };
    } else if (analysis.health_score >= 80) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        icon: '✅',
        title: 'Excellent Health!',
        titleColor: 'text-green-900',
      };
    } else if (analysis.health_score >= 60) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        icon: '📊',
        title: 'Analysis Complete',
        titleColor: 'text-blue-900',
      };
    } else {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        icon: '⚠️',
        title: 'Attention Needed',
        titleColor: 'text-yellow-900',
      };
    }
  };

  const style = getNotificationStyle();

  return (
    <div
      className={`${style.bg} border-2 ${style.border} rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl">{style.icon}</span>
          <div className="flex-1">
            <h4 className={`font-bold ${style.titleColor} mb-2`}>{style.title}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  Health Score: <span className="font-bold">{analysis.health_score}/100</span>
                </span>
                <span className="text-gray-700">
                  Growth Rate: <span className="font-bold">{analysis.growth_rate}%</span>
                </span>
              </div>

              {analysis.recommendations.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-1">Top Recommendation:</p>
                  <p className="text-gray-700">{analysis.recommendations[0]}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {autoDismiss && (
        <div className="mt-3">
          <div className="w-full bg-gray-300 rounded-full h-1">
            <div
              className="bg-gray-600 h-1 rounded-full transition-all"
              style={{
                animation: `shrink ${dismissDelay}ms linear`,
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
