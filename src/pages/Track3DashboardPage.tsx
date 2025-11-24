import React from 'react';
import { CommunityDashboard } from '../components/dashboard';
import { useAuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Track 3 Dashboard Page
 * Community engagement focused dashboard for Track 3 submission
 */
const Track3DashboardPage: React.FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userName = user.profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Friend';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommunityDashboard
          userId={user.id}
          userName={userName}
        />
      </div>
    </div>
  );
};

export default Track3DashboardPage;
