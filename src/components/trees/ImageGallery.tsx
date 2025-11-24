import { useState } from 'react';
import type { TreeImage } from '../../types/tree.types';

interface ImageGalleryProps {
  images: TreeImage[];
  onDelete?: (imageId: string) => void;
  allowDelete?: boolean;
}

export function ImageGallery({
  images,
  onDelete,
  allowDelete = false,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<TreeImage | null>(
    images.length > 0 ? images[0] : null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    onDelete?.(imageId);
    setShowDeleteConfirm(false);
    setDeletingId(null);

    // If deleted image was selected, select another
    if (selectedImage?.id === imageId) {
      const remainingImages = images.filter((img) => img.id !== imageId);
      setSelectedImage(remainingImages.length > 0 ? remainingImages[0] : null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">📷</div>
        <p className="text-gray-600 mb-2">No images yet</p>
        <p className="text-sm text-gray-500">
          Upload images to track tree growth and health
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      {selectedImage && (
        <div className="relative">
          <img
            src={selectedImage.image_url}
            alt={`Tree image from ${formatDate(selectedImage.captured_at)}`}
            className="w-full h-96 object-cover rounded-lg border border-gray-300"
          />

          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
            <p className="text-white text-sm">
              Captured: {formatDate(selectedImage.captured_at)}
            </p>
          </div>

          {/* Delete Button */}
          {allowDelete && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deletingId === selectedImage.id}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:bg-gray-400"
              title="Delete image"
            >
              {deletingId === selectedImage.id ? '⏳' : '🗑️'}
            </button>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && selectedImage && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Image?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This action cannot be undone. The image will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(selectedImage.id)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Antugrow Analysis */}
          {selectedImage.antugrow_analysis && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>🤖</span> AI Analysis Results
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
                    {selectedImage.antugrow_analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-blue-800">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            All Images ({images.length})
          </h4>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.id === image.id
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-green-300'
                }`}
                title={`Captured: ${formatDate(image.captured_at)}`}
              >
                <img
                  src={image.image_url}
                  alt={`Thumbnail ${formatDate(image.captured_at)}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Count and Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
        <span>{images.length} image{images.length !== 1 ? 's' : ''} total</span>
        {selectedImage && (
          <span>
            Image {images.findIndex((img) => img.id === selectedImage.id) + 1} of{' '}
            {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
