import type { User } from '../../types/user.types';
import { profileService } from '../../services/profile.service';

interface UserProfileProps {
  user: User;
  onEdit?: () => void;
}

export function UserProfile({ user, onEdit }: UserProfileProps) {
  const profile = user.profile;
  const completeness = profile
    ? profileService.getProfileCompleteness(profile)
    : 0;

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      organization: 'Organization',
      community: 'Community Member',
      individual: 'Individual',
    };
    return roleMap[role] || role;
  };

  const getForestDisplay = (forest?: string) => {
    const forestMap: Record<string, string> = {
      kakamega: 'Kakamega Forest',
      karura: 'Karura Forest',
      mau: 'Mau Forest',
    };
    return forest ? forestMap[forest] || forest : 'Not selected';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">Profile</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Completeness */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Profile Completeness
          </span>
          <span className="text-sm font-semibold text-green-600">
            {completeness}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-gray-400">
              {profile?.full_name?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {profile?.full_name || 'No name set'}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {getRoleDisplay(user.role)}
          </span>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Contact Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.phone || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Location:</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.location || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {user.role === 'organization' && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Organization Details
            </h4>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Organization:</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.organization || 'Not provided'}
              </span>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Conservation Preferences
          </h4>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Preferred Forest:</span>
            <span className="text-sm font-medium text-gray-900">
              {getForestDisplay(user.forest_preference)}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Account Information
          </h4>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Member since:</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
