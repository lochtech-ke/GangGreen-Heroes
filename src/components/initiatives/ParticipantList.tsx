import { useState, useEffect } from 'react';
import { initiativeService } from '../../services';
import type { InitiativeParticipant } from '../../types/initiative.types';

interface ParticipantListProps {
  initiativeId: string;
  showContributions?: boolean;
  maxDisplay?: number;
}

export function ParticipantList({
  initiativeId,
  showContributions = true,
  maxDisplay,
}: ParticipantListProps) {
  const [participants, setParticipants] = useState<InitiativeParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadParticipants();
  }, [initiativeId]);

  const loadParticipants = async () => {
    setLoading(true);
    setError('');

    const { participants: data, error: err } =
      await initiativeService.getParticipants(initiativeId);

    if (err) {
      setError(err.message || 'Failed to load participants');
    } else {
      setParticipants(data);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayedParticipants = maxDisplay
    ? participants.slice(0, maxDisplay)
    : participants;

  const remainingCount = maxDisplay
    ? Math.max(0, participants.length - maxDisplay)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No participants yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Be the first to join this initiative!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedParticipants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {participant.user_id.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div>
              <p className="font-medium text-gray-900">Participant</p>
              <p className="text-sm text-gray-600">
                Joined {formatDate(participant.joined_at)}
              </p>
            </div>
          </div>

          {/* Contribution */}
          {showContributions && (
            <div className="text-right">
              <p className="text-lg font-bold text-green-700">
                {participant.trees_contributed}
              </p>
              <p className="text-xs text-gray-600">trees planted</p>
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="text-center py-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            And {remainingCount} more participant{remainingCount !== 1 ? 's' : ''}...
          </p>
        </div>
      )}
    </div>
  );
}
