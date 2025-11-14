import { useState } from 'react';
import { initiativeService } from '../../services';

interface JoinInitiativeButtonProps {
  initiativeId: string;
  userId: string;
  isParticipant: boolean;
  initiativeStatus: 'active' | 'completed' | 'paused';
  onJoin?: () => void;
  onLeave?: () => void;
  className?: string;
}

export function JoinInitiativeButton({
  initiativeId,
  userId,
  isParticipant,
  initiativeStatus,
  onJoin,
  onLeave,
  className = '',
}: JoinInitiativeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const handleJoin = async () => {
    setError('');
    setLoading(true);

    const { error: joinError } = await initiativeService.joinInitiative(
      initiativeId,
      userId
    );

    if (joinError) {
      setError(joinError.message || 'Failed to join initiative');
      setLoading(false);
      return;
    }

    setLoading(false);
    onJoin?.();
  };

  const handleLeave = async () => {
    setError('');
    setLoading(true);

    const { error: leaveError } = await initiativeService.leaveInitiative(
      initiativeId,
      userId
    );

    if (leaveError) {
      setError(leaveError.message || 'Failed to leave initiative');
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowConfirmLeave(false);
    onLeave?.();
  };

  // Don't show button if initiative is not active
  if (initiativeStatus !== 'active') {
    return null;
  }

  if (showConfirmLeave) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800 mb-3">
            Are you sure you want to leave this initiative? Your contribution record
            will be removed.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleLeave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Leaving...' : 'Yes, Leave'}
            </button>
            <button
              onClick={() => setShowConfirmLeave(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isParticipant) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-blue-700 font-semibold">✓ Participating</span>
        </div>
        <button
          onClick={() => setShowConfirmLeave(true)}
          className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          Leave Initiative
        </button>
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Joining...' : 'Join Initiative'}
      </button>
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
