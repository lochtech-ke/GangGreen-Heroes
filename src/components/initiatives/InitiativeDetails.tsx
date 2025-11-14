import { useState, useEffect } from 'react';
import { initiativeService } from '../../services';
import type {
  Initiative,
  InitiativeParticipant,
  InitiativeProgress,
} from '../../types/initiative.types';
import { ParticipantList } from './ParticipantList';
import { ContributionTracker } from './ContributionTracker';
import { JoinInitiativeButton } from './JoinInitiativeButton';
import { MilestoneNotifications } from './MilestoneNotifications';

interface InitiativeDetailsProps {
  initiativeId: string;
  onBack?: () => void;
  onJoin?: () => void;
  currentUserId?: string;
}

export function InitiativeDetails({
  initiativeId,
  onBack,
  onJoin,
  currentUserId,
}: InitiativeDetailsProps) {
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [participants, setParticipants] = useState<InitiativeParticipant[]>([]);
  const [progress, setProgress] = useState<InitiativeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isParticipant, setIsParticipant] = useState(false);
  const [currentParticipant, setCurrentParticipant] =
    useState<InitiativeParticipant | null>(null);

  useEffect(() => {
    loadInitiativeDetails();
  }, [initiativeId]);

  const loadInitiativeDetails = async () => {
    setLoading(true);
    setError('');

    try {
      // Load initiative
      const { initiative: data, error: initError } =
        await initiativeService.getInitiative(initiativeId);

      if (initError || !data) {
        setError(initError?.message || 'Failed to load initiative');
        setLoading(false);
        return;
      }

      setInitiative(data);

      // Load participants
      const { participants: participantsData, error: participantsError } =
        await initiativeService.getParticipants(initiativeId);

      if (!participantsError) {
        setParticipants(participantsData);
        if (currentUserId) {
          const userParticipant = participantsData.find(
            (p) => p.user_id === currentUserId
          );
          setIsParticipant(!!userParticipant);
          setCurrentParticipant(userParticipant || null);
        }
      }

      // Load progress
      const progressData = await initiativeService.calculateProgress(initiativeId);
      if (progressData) {
        setProgress(progressData);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleJoinSuccess = () => {
    loadInitiativeDetails();
    onJoin?.();
  };

  const handleLeaveSuccess = () => {
    loadInitiativeDetails();
  };

  const handleContributionUpdate = (newContribution: number) => {
    if (currentParticipant) {
      setCurrentParticipant({
        ...currentParticipant,
        trees_contributed: newContribution,
      });
    }
    loadInitiativeDetails(); // Reload to update overall progress
  };

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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">{error || 'Initiative not found'}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
          >
            Go back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-green-600 hover:text-green-700 flex items-center gap-2"
          >
            <span>←</span> Back to Initiatives
          </button>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {initiative.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  initiative.status
                )}`}
              >
                {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                {getForestDisplay(initiative.forest)}
              </span>
            </div>
          </div>

          {currentUserId && (
            <JoinInitiativeButton
              initiativeId={initiativeId}
              userId={currentUserId}
              isParticipant={isParticipant}
              initiativeStatus={initiative.status}
              onJoin={handleJoinSuccess}
              onLeave={handleLeaveSuccess}
            />
          )}
        </div>

        <p className="text-gray-700 leading-relaxed">{initiative.description}</p>
      </div>

      {/* Progress Section */}
      {progress && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Progress</h2>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Trees Planted
              </span>
              <span className="text-lg font-bold text-green-600">
                {progress.progress_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress_percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Trees Planted</p>
              <p className="text-2xl font-bold text-green-700">
                {initiative.trees_planted.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Target</p>
              <p className="text-2xl font-bold text-blue-700">
                {initiative.target_trees.toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-yellow-700">
                {progress.trees_remaining.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-purple-700">
                {progress.is_on_track ? '✓ On Track' : '⚠ Behind'}
              </p>
            </div>
          </div>

          {progress.days_remaining !== undefined && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{progress.days_remaining}</span> days
                remaining until target date
              </p>
            </div>
          )}
        </div>
      )}

      {/* Details Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h3>
            <p className="text-gray-900">
              <span className="font-medium">Start:</span> {formatDate(initiative.start_date)}
            </p>
            {initiative.end_date && (
              <p className="text-gray-900 mt-1">
                <span className="font-medium">End:</span> {formatDate(initiative.end_date)}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Area</h3>
            <p className="text-gray-900">
              {initiative.area_hectares} hectares
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
            <p className="text-gray-900">
              {initiative.location.coordinates[1].toFixed(4)}°N,{' '}
              {initiative.location.coordinates[0].toFixed(4)}°E
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Participants
            </h3>
            <p className="text-gray-900">{participants.length} members</p>
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      {progress && (
        <MilestoneNotifications initiative={initiative} progress={progress} />
      )}

      {/* Contribution Tracker for Participants */}
      {isParticipant && currentUserId && currentParticipant && (
        <ContributionTracker
          initiativeId={initiativeId}
          userId={currentUserId}
          currentContribution={currentParticipant.trees_contributed}
          onUpdate={handleContributionUpdate}
        />
      )}

      {/* Participants Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Participants ({participants.length})
        </h2>
        <ParticipantList initiativeId={initiativeId} maxDisplay={10} />
      </div>
    </div>
  );
}
