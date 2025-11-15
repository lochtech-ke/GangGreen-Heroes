import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Welcome to #GangGreen
        </h1>
        <p className="text-gray-600">
          Catalyzing a Carbon-Negative Africa
        </p>
      </div>

          {user && (
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Your Profile
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-800">
                    {user.profile?.full_name || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium text-gray-800 capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Forest Preference</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {user.forest_preference || 'Not set'}
                  </p>
                </div>
                {user.profile?.organization && (
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium text-gray-800">
                      {user.profile.organization}
                    </p>
                  </div>
                )}
                {user.profile?.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">
                      {user.profile.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Kakamega Forest
              </h3>
              <p className="text-sm text-gray-600">Primary pilot site</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Karura Forest
              </h3>
              <p className="text-sm text-gray-600">Urban conservation area</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Mau Forest
              </h3>
              <p className="text-sm text-gray-600">Critical water tower ecosystem</p>
            </div>
          </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Navigation System Active!</strong> Use the navigation menu above to explore different features.
        </p>
      </div>
    </div>
  );
}
