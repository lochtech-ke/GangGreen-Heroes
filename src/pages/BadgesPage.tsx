import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Info, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BadgeProgressionView } from '../components/badges';
import { HummingbirdWelcome } from '../components/badges/HummingbirdWelcome';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * Badges Page
 * Displays user's badge progression and achievements
 */
const BadgesPage: React.FC = () => {
  const { user } = useAuthContext();
  const [showWelcome, setShowWelcome] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your badges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Badges</h1>
                <p className="text-sm text-gray-600">Track your community engagement journey</p>
              </div>
            </div>

            {/* Info Button */}
            <button
              onClick={() => setShowWelcome(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Show hummingbird story"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Link to Journey Dashboard */}
        <div className="mb-6">
          <Link
            to="/journey"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            View Journey Dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BadgeProgressionView userId={user.id} />
        </motion.div>
      </div>

      {/* Hummingbird Welcome Modal */}
      <HummingbirdWelcome
        isOpen={showWelcome}
        onComplete={() => setShowWelcome(false)}
      />
    </div>
  );
};

export default BadgesPage;
