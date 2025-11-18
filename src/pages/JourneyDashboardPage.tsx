import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useJourney } from '../contexts/JourneyContext';
import { JourneyStage } from '../types/journey.types';

export function JourneyDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { progress, loading, error, currentStage, nextMilestone, recommendations } = useJourney();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading journey: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No journey data available</p>
        </div>
      </div>
    );
  }

  const getStageColor = (stage: JourneyStage) => {
    const colors = {
      [JourneyStage.AWARENESS]: 'bg-blue-500',
      [JourneyStage.ACTIVATION]: 'bg-purple-500',
      [JourneyStage.ACTION]: 'bg-green-500',
      [JourneyStage.VERIFICATION]: 'bg-yellow-500',
      [JourneyStage.LEGACY]: 'bg-red-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  const getStageName = (stage: JourneyStage) => {
    const names = {
      [JourneyStage.AWARENESS]: 'Awareness',
      [JourneyStage.ACTIVATION]: 'Activation',
      [JourneyStage.ACTION]: 'Action',
      [JourneyStage.VERIFICATION]: 'Verification',
      [JourneyStage.LEGACY]: 'Legacy',
    };
    return names[stage] || stage;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Journey</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your environmental impact and progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Stage</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentStage ? getStageName(currentStage) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stage Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Journey Progress</h2>
          <div className="flex items-center justify-between mb-4">
            {Object.values(JourneyStage).map((stage, index) => (
              <div key={stage} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStage === stage
                        ? getStageColor(stage)
                        : progress.stageProgress[stage] === 100
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    } text-white font-semibold`}
                  >
                    {index + 1}
                  </div>
                  <p className="mt-2 text-xs text-gray-600 text-center">{getStageName(stage)}</p>
                  <p className="text-xs text-gray-500">{progress.stageProgress[stage]}%</p>
                </div>
                {index < Object.values(JourneyStage).length - 1 && (
                  <div className="w-16 h-1 bg-gray-300 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Impact Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{progress.totalPoints}</p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{progress.treesPlanted}</p>
                  <p className="text-sm text-gray-600">Trees Planted</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {progress.challengesCompleted}
                  </p>
                  <p className="text-sm text-gray-600">Challenges</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{progress.referralCount}</p>
                  <p className="text-sm text-gray-600">Referrals</p>
                </div>
              </div>
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Milestone</h2>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{nextMilestone.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{nextMilestone.description}</p>
                  <div className="mt-3 space-y-2">
                    {nextMilestone.requiredActions.map((action, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="text-gray-600">• {action.description}</span>
                      </div>
                    ))}
                  </div>
                  {nextMilestone.reward && (
                    <div className="mt-3 text-sm text-green-600">
                      Reward: {nextMilestone.reward.points} points
                      {nextMilestone.reward.badge && ` + ${nextMilestone.reward.badge} badge`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recommended Actions
                </h2>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer"
                      onClick={() => navigate(rec.actionUrl)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        </div>
                        <span className="ml-4 text-green-600 font-semibold">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Causes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Causes</h2>
              {progress.joinedCauses.length > 0 ? (
                <div className="space-y-2">
                  {progress.joinedCauses.map((cause) => (
                    <div key={cause} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-gray-700">{cause}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">No causes joined yet</p>
                  <button
                    onClick={() => navigate('/causes')}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Join a Cause →
                  </button>
                </div>
              )}
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
              <div className="space-y-2">
                {progress.completedMilestones.length > 0 ? (
                  progress.completedMilestones.map((milestone) => (
                    <div key={milestone} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{milestone}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No milestones completed yet
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/challenges')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  View Challenges
                </button>
                <button
                  onClick={() => navigate('/trees/plant')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  Plant a Tree
                </button>
                <button
                  onClick={() => navigate('/petitions')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  View Petitions
                </button>
                <button
                  onClick={() => navigate('/referrals')}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  Invite Friends
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
