import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InitiativeDetails } from '../components/initiatives/InitiativeDetails';
import { InitiativeMap } from '../components/initiatives/InitiativeMap';
import { TreeRegistry } from '../components/trees/TreeRegistry';
import { initiativeService } from '../services';
import { useAuthContext } from '../contexts/AuthContext';
import type { Initiative } from '../types/initiative.types';

export function InitiativeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'map' | 'trees'>('details');

  useEffect(() => {
    if (id) {
      loadInitiative();
    }
  }, [id]);

  const loadInitiative = async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    const { initiative: data, error: err } = await initiativeService.getInitiative(id);

    if (err || !data) {
      setError(err?.message || 'Initiative not found');
      setLoading(false);
      return;
    }

    setInitiative(data);
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/initiatives');
  };

  const handleJoin = () => {
    // Reload initiative data after joining
    loadInitiative();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading initiative details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !initiative || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                Initiative Not Found
              </h2>
              <p className="text-red-600 mb-4">
                {error || 'The initiative you are looking for does not exist.'}
              </p>
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
              >
                Back to Initiatives
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'map'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setActiveTab('trees')}
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === 'trees'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Trees
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'details' && (
          <InitiativeDetails
            initiativeId={id}
            onBack={handleBack}
            onJoin={handleJoin}
            currentUserId={user?.id}
          />
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={handleBack}
              className="mb-4 text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <span>←</span> Back to Initiatives
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Initiative Location
            </h2>
            <InitiativeMap
              initiatives={[initiative]}
              center={[
                initiative.location.coordinates[1],
                initiative.location.coordinates[0],
              ]}
              zoom={13}
              height="600px"
            />
          </div>
        )}

        {activeTab === 'trees' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={handleBack}
              className="mb-4 text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <span>←</span> Back to Initiatives
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trees in {initiative.title}
            </h2>
            <TreeRegistry
              initiativeId={id}
              onTreeClick={(tree) => navigate(`/trees/${tree.id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
