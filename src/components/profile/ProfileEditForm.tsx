import { useState, FormEvent, ChangeEvent } from 'react';
import { profileService } from '../../services/profile.service';
import type { User, ForestPreference } from '../../types/user.types';

interface ProfileEditFormProps {
  user: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ user, onSuccess, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    full_name: user.profile?.full_name || '',
    phone: user.profile?.phone || '',
    organization: user.profile?.organization || '',
    location: user.profile?.location || '',
    forest_preference: user.forest_preference || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.profile?.avatar_url || null
  );
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload avatar if changed
      let avatarUrl = user.profile?.avatar_url;
      if (avatarFile) {
        const { url, error: uploadError } = await profileService.uploadAvatar(
          user.id,
          avatarFile
        );
        if (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
        avatarUrl = url || undefined;
      }

      // Update profile
      const { error: profileError } = await profileService.updateProfile(user.id, {
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        organization: formData.organization || undefined,
        location: formData.location || undefined,
        avatar_url: avatarUrl,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      // Update forest preference if changed
      if (formData.forest_preference !== user.forest_preference) {
        const { error: forestError } = await profileService.updateForestPreference(
          user.id,
          formData.forest_preference as ForestPreference
        );
        if (forestError) {
          setError(forestError.message);
          setLoading(false);
          return;
        }
      }

      onSuccess?.();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">Edit Profile</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {formData.full_name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div>
              <input
                type="file"
                id="avatar"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={loading}
              />
              <label
                htmlFor="avatar"
                className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 inline-block"
              >
                Choose Image
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="John Doe"
            disabled={loading}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="+254712345678"
            disabled={loading}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nairobi, Kenya"
            disabled={loading}
          />
        </div>

        {/* Organization (only for organization role) */}
        {user.role === 'organization' && (
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Green Initiative"
              disabled={loading}
            />
          </div>
        )}

        {/* Forest Preference */}
        <div>
          <label htmlFor="forest_preference" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Forest
          </label>
          <select
            id="forest_preference"
            name="forest_preference"
            value={formData.forest_preference}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a forest</option>
            <option value="kakamega">Kakamega Forest</option>
            <option value="karura">Karura Forest</option>
            <option value="mau">Mau Forest</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose your primary forest of interest for personalized updates
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
