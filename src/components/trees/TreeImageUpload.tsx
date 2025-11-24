import { useState, useRef, FormEvent } from 'react';
import { supabase } from '../../services/supabase';
import { treeService } from '../../services';

interface TreeImageUploadProps {
  treeId: string;
  onSuccess?: (imageUrl: string) => void;
  onCancel?: () => void;
}

export function TreeImageUpload({ treeId, onSuccess, onCancel }: TreeImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [capturedAt, setCapturedAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, and WebP images are allowed';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${treeId}-${Date.now()}.${fileExt}`;
      const filePath = `tree-images/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('tree-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        setError(uploadError.message || 'Failed to upload image');
        setUploading(false);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('tree-images').getPublicUrl(filePath);

      setUploadProgress(95);

      // Add image record to database
      const { error: dbError } = await treeService.addTreeImage(
        treeId,
        publicUrl,
        capturedAt
      );

      if (dbError) {
        setError(dbError.message || 'Failed to save image record');
        setUploading(false);
        return;
      }

      setUploadProgress(100);
      setUploading(false);
      onSuccess?.(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview('');
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Tree Image</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: JPEG, PNG, WebP (max 10MB)
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
              {!uploading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Capture Date */}
        <div>
          <label
            htmlFor="capturedAt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Capture Date
          </label>
          <input
            id="capturedAt"
            type="date"
            value={capturedAt}
            onChange={(e) => setCapturedAt(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            When was this photo taken?
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-semibold text-green-600">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={uploading}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
