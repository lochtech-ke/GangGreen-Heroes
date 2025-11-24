import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { InitiativeForm } from '../components/initiatives/InitiativeForm';
import type { Initiative } from '../types/initiative.types';

export function CreateInitiativePage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
              <h2 className="text-xl font-bold text-yellow-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-yellow-700 mb-4">
                You must be logged in to create an initiative.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TODO: Add organization check - only organization users should create initiatives
  // For now, we'll use the user's ID as the organization ID
  const organizationId = user.id;

  const handleSuccess = (initiative: Initiative) => {
    // Navigate to the newly created initiative's details page
    navigate(`/initiatives/${initiative.id}`);
  };

  const handleCancel = () => {
    // Navigate back to initiatives list
    navigate('/initiatives');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-4"
          >
            <span>←</span> Back to Initiatives
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Initiative
          </h1>
          <p className="text-gray-600 mt-2">
            Start a new conservation initiative to coordinate tree planting efforts
            in one of our pilot forests.
          </p>
        </div>

        {/* Form */}
        <InitiativeForm
          organizationId={organizationId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Initiative Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Choose a clear, descriptive title that reflects your initiative's
                goals
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Set realistic tree planting targets based on available resources
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Select the appropriate pilot forest for your conservation efforts
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Mark the exact location on the map where planting will occur
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Provide detailed descriptions to help participants understand the
                initiative
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
