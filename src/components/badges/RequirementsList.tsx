import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import type { RequirementProgress } from '../../types/badgeProgression.types';

interface RequirementsListProps {
  requirements: RequirementProgress[];
  className?: string;
}

/**
 * Displays a list of badge requirements with progress
 */
export const RequirementsList: React.FC<RequirementsListProps> = ({
  requirements,
  className = '',
}) => {
  if (requirements.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
      
      {requirements.map((req, index) => (
        <div key={index} className="space-y-2">
          {/* Requirement Header */}
          <div className="flex items-start gap-2">
            {req.isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${req.isComplete ? 'text-green-700' : 'text-gray-700'}`}>
                {req.requirement.description}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {req.current.toLocaleString()} / {req.target.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            current={req.current}
            total={req.target}
            showPercentage={false}
            color={req.isComplete ? 'green' : 'blue'}
            size="sm"
          />
        </div>
      ))}
    </div>
  );
};
