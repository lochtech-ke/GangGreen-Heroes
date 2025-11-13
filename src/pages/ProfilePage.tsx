import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../components/profile/UserProfile';
import { ProfileEditForm } from '../components/profile/ProfileEditForm';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSuccess = async () => {
    await refreshUser();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {isEditing ? (
          <ProfileEditForm
            user={user}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <UserProfile user={user} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  );
}
