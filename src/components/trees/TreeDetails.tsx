import { useState, useEffect } from 'react';
import { treeService } from '../../services';
import type { TreeWithImages, TreeImage } from '../../types/tree.types';

interface TreeDetailsProps {
  treeId: string;
  onBack?: () => void;
}

export function TreeDetails({ treeId, onBack }: TreeDetailsProps) {
  const [tree, setTree] = useState<TreeWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<TreeImage | null>(null);

  useEffect(() => {
    loadTreeDetails();
  }, [treeId]);

  const loadTreeDetails = async () => {
    setLoading(true);
    setError('');

    const { tree: data, error: err } = await treeService.getTreeWithImages(treeId);

    if (err || !data) {
      setError(err?.message || 'Failed to load tree details');
      setLoading(false);
      return;
    }

    setTree(data);
    if (data.images.length > 0) {
      setSelectedImage(data.images[0]);
    }
    setLoading(false);
  };

  const getHealthStatusColor = (status?: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-700',
      stressed: 'bg-yellow-100 text-yellow-700',
      diseased: 'bg-orange-100 text-orange-700',
      dead: 'bg-red-100 text-red-700',
    };
    return status ? colors[status as keyof typeof colors] : 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTreeAge = (plantedDate: string) => {
    const planted = new Date(plantedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${
        remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''
      }`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">{error || 'Tree not found'}</p>
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
            <span>←</span> Back to Registry
          </button>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tree.species}</h1>
            <p className="text-lg text-gray-600 mb-3">
              Age: {getTreeAge(tree.planted_date)}
            </p>
            {tree.health_status && (
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getHealthStatusColor(
                  tree.health_status
                )}`}
              >
                {tree.health_status.charAt(0).toUpperCase() + tree.health_status.slice(1)}
              </span>
            )}
          </div>
          <div className="text-6xl">🌳</div>
        </div>
      </div>

      {/* Images Gallery */}
      {tree.images.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Images ({tree.images.length})
          </h2>

          {/* Main Image */}
          {selectedImage && (
            <div className="mb-4">
              <img
                src={selectedImage.image_url}
                alt={`${tree.species} - ${formatDate(selectedImage.captured_at)}`}
                className="w-full h-96 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                Captured: {formatDate(selectedImage.captured_at)}
              </p>

              {/* Antugrow Analysis */}
              {selectedImage.antugrow_analysis && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    🤖 AI Analysis Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-blue-700">Health Score</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedImage.antugrow_analysis.health_score}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Growth Rate</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedImage.antugrow_analysis.growth_rate}%
                      </p>
                    </div>
                  </div>
                  {selectedImage.antugrow_analysis.disease_detected && (
                    <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Disease Detected
                      </p>
                    </div>
                  )}
                  {selectedImage.antugrow_analysis.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Recommendations:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedImage.antugrow_analysis.recommendations.map(
                          (rec, idx) => (
                            <li key={idx} className="text-sm text-blue-800">
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Thumbnail Gallery */}
          {tree.images.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {tree.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.id === image.id
                      ? 'border-green-500 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`Thumbnail ${formatDate(image.captured_at)}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Measurements */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Measurements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tree.current_height_cm && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Height</p>
              <p className="text-2xl font-bold text-green-700">
                {tree.current_height_cm}
              </p>
              <p className="text-xs text-gray-600">centimeters</p>
            </div>
          )}
          {tree.current_diameter_cm && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Diameter</p>
              <p className="text-2xl font-bold text-blue-700">
                {tree.current_diameter_cm}
              </p>
              <p className="text-xs text-gray-600">centimeters</p>
            </div>
          )}
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Age</p>
            <p className="text-2xl font-bold text-purple-700">
              {getTreeAge(tree.planted_date)}
            </p>
            <p className="text-xs text-gray-600">old</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Images</p>
            <p className="text-2xl font-bold text-yellow-700">{tree.images.length}</p>
            <p className="text-xs text-gray-600">captured</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Planting Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Planted:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(tree.planted_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Species:</span>
                <span className="font-medium text-gray-900">{tree.species}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-medium text-gray-900">
                  {tree.location.coordinates[1].toFixed(6)}°N
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-medium text-gray-900">
                  {tree.location.coordinates[0].toFixed(6)}°E
                </span>
              </div>
            </div>
          </div>

          {tree.last_monitored && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Monitoring</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Monitored:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(tree.last_monitored)}
                  </span>
                </div>
                {tree.antugrow_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Antugrow ID:</span>
                    <span className="font-medium text-gray-900 font-mono text-xs">
                      {tree.antugrow_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
