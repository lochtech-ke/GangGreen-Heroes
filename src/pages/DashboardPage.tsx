/**
 * GangGreen Dashboard - Clean Implementation (No Sidebar)
 * Uses Layout component for navigation
 */

import { useState, useEffect } from 'react';
import { 
  Leaf, TrendingUp, Users, Trophy, 
  MapPin, Camera, Award
} from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [forestStats, setForestStats] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, forestData] = await Promise.all([
        dashboardService.getImpactMetrics('all'),
        dashboardService.getForestStats(),
      ]);
      
      setMetrics(metricsData);
      setForestStats(forestData);
      
      // Mock leaderboard data - replace with actual leaderboard service
      setLeaderboard([
        { rank: 1, name: 'EcoWarrior99', points: 12450 },
        { rank: 2, name: 'GreenHero', points: 11200 },
        { rank: 3, name: 'TreePlanter', points: 9800 },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user level based on trees planted (mock calculation)
  const userLevel = metrics ? Math.floor(metrics.total_trees_planted / 100) || 12 : 12;
  const levelProgress = metrics ? (metrics.total_trees_planted % 100) : 76;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.profile?.full_name?.split(' ')[0] || 'Mbugua'}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Leaf className="w-6 h-6" />}
          title="Trees Planted"
          value={metrics?.total_trees_planted?.toLocaleString() || '1,247'}
          subtitle={`+23 this week`}
          loading={loading}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="CO₂ Offset"
          value={`${metrics?.total_carbon_sequestered_tons || '18.4'} tons`}
          subtitle={`+2.1 this month`}
          loading={loading}
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          title="Level Progress"
          value={`Level ${userLevel}`}
          subtitle={`${levelProgress}% to Level ${userLevel + 1}`}
          loading={loading}
        />
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          title="Achievements"
          value="24 Badges"
          subtitle="3 NFTs minted"
          loading={loading}
        />
      </div>

      {/* Register Tree Hero Card */}
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&q=80"
          alt="Register tree"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/50">
          <div className="h-full flex flex-col justify-center px-6 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Register Your Tree!
            </h2>
            <p className="text-green-50 text-base md:text-lg mb-6">
              Tag your photo and start earning today
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <button className="px-8 py-3 bg-white text-green-900 rounded-xl font-semibold hover:bg-green-50 transition-colors">
                Plant your tree
              </button>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white">
                <button className="flex items-center gap-2 hover:text-green-200 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Upload Photo</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-200 transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">Geo-tag Location</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-200 transition-colors">
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Earn Points</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For You Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          For You: Based on Your Interests
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Initiative Card */}
          <InitiativeCard forestStats={forestStats[0]} loading={loading} />

          {/* Fun Segment Card */}
          <FunSegmentCard />

          {/* Leaderboard Card */}
          <LeaderboardCard leaderboard={leaderboard} userRank={247} />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, loading }: any) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 mb-4">
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-green-600">{subtitle}</div>
    </div>
  );
}

// Initiative Card Component
function InitiativeCard({ forestStats }: any) {
  const forest = forestStats || {
    forest_name: 'Amazon Rainforest',
    trees_planted: 2400,
    community_members: 2400,
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80"
          alt={forest.forest_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <MapPin className="w-4 h-4 text-green-700" />
          <span className="text-sm font-medium text-gray-900">{forest.forest_name}</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Initiative</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Join active reforestation projects and track real-time impact.
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{forest.community_members?.toLocaleString() || '2.4k'} participants</span>
          </div>
        </div>
        <button className="w-full py-2 text-green-700 font-medium hover:bg-green-50 rounded-xl transition-colors flex items-center justify-center gap-2">
          Explore
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

// Fun Segment Card Component
function FunSegmentCard() {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border-2 border-yellow-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">💡</span>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Fun Segment</div>
          <div className="text-xs text-gray-600">Daily Nugget</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 mb-4 border border-yellow-200">
        <p className="text-lg text-gray-800 leading-relaxed">
          "A single mature tree can absorb up to 48 pounds of CO<sub>2</sub> per year."
        </p>
      </div>

      <button className="w-full py-3 bg-yellow-100 text-yellow-900 font-medium hover:bg-yellow-200 rounded-xl transition-colors">
        Learn More
      </button>
    </div>
  );
}

// Leaderboard Card Component
function LeaderboardCard({ leaderboard, userRank }: any) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">Leader board</div>
          <div className="text-xs text-gray-600">Your Rank: #{userRank}</div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {leaderboard.map((entry: any) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                entry.rank === 2 ? 'bg-gray-200 text-gray-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {entry.rank}
              </div>
              <div>
                <div className="font-medium text-gray-900">{entry.name}</div>
                <div className="text-xs text-gray-600">{entry.points.toLocaleString()} pts</div>
              </div>
            </div>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        ))}
      </div>

      <button className="w-full py-3 border-2 border-purple-200 text-purple-700 font-medium hover:bg-purple-50 rounded-xl transition-colors">
        View Full Rankings
      </button>
    </div>
  );
}