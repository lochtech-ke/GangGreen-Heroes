import { useState, FormEvent } from 'react';
import { initiativeService } from '../../services';

interface ContributionTrackerProps {
  initiativeId: string;
  userId: string;
  currentContribution: number;
  onUpdate?: (newContribution: number) => void;
}

export function ContributionTracker({
  initiativeId,
  userId,
  currentContribution,
  onUpdate,
}: ContributionTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newContribution, setNewContribution] = useState(currentContribution);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (newContribution < 0) {
      setError('Contribution cannot be negative');
      setLoading(false);
      return;
    }

    const { participant, error: updateError } =
      await initiativeService.updateParticipantContribution(
        initiativeId,
        userId,
        newContribution
      );

    if (updateError) {
      setError(updateError.message || 'Failed to update contribution');
      setLoading(false);
      return;
    }

    if (participant) {
      setSuccessMessage('Contribution updated successfully!');
      setIsEditing(false);
      onUpdate?.(participant.trees_contributed);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setNewContribution(currentContribution);
    setIsEditing(false);
    setError('');
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Contribution
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Update
          </button>
        </div>

        <div className="text-center py-6">
          <p className="text-5xl font-bold text-green-700 mb-2">
            {currentContribution}
          </p>
          <p className="text-gray-600">trees planted</p>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Update Your Contribution
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="contribution"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Number of Trees Planted
          </label>
          <input
            id="contribution"
            type="number"
            min="0"
            value={newContribution}
            onChange={(e) => setNewContribution(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter the total number of trees you've planted for this initiative
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Save Contribution'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
