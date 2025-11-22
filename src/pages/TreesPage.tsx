import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, Heart, Leaf, Sprout } from 'lucide-react';
import { TreeRegistry } from '../components/trees/TreeRegistry';
import StatsCard from '../components/common/StatsCard';
import { treeService } from '../services';
import { useAuthContext } from '../contexts/AuthContext';
import type { Tree } from '../types/tree.types';

export function TreesPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalTrees: 0,
    healthyTrees: 0,
    speciesCount: 0,
    recentlyPlanted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    try {
      // Get all trees to calculate stats
      const { trees } = await treeService.getTrees({});

      if (trees) {
        const totalTrees = trees.length;
        const healthyTrees = trees.filter((t) => t.health_status === 'healthy').length;
        const uniqueSpecies = new Set(trees.map((t) => t.species)).size;
        
        // Trees planted in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentlyPlanted = trees.filter(
          (t) => new Date(t.planted_date) >= thirtyDaysAgo
        ).length;

        setStats({
          totalTrees,
          healthyTrees,
          speciesCount: uniqueSpecies,
          recentlyPlanted,
        });
      }
    } catch (error) {
      console.error('Failed to load tree stats:', error);
    }

    setLoading(false);
  };

  const handleTreeClick = (tree: Tree) => {
    navigate(`/trees/${tree.id}`);
  };

  const handleRegisterTree = () => {
    navigate('/trees/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tree Registry
              </h1>
              <p className="text-gray-600">
                Track and monitor trees planted across conservation initiatives with
                AI-powered analysis
              </p>
            </div>
            {user && (
              <button
                onClick={handleRegisterTree}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2"
              >
                <span>+</span> Register Tree
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Trees"
              value={stats.totalTrees.toLocaleString()}
              icon={TreePine}
              color="green"
            />
            <StatsCard
              title="Healthy Trees"
              value={stats.healthyTrees.toLocaleString()}
              subtitle={`${Math.round((stats.healthyTrees / stats.totalTrees) * 100)}% of total`}
              icon={Heart}
              color="blue"
            />
            <StatsCard
              title="Species"
              value={stats.speciesCount.toString()}
              subtitle="Unique species"
              icon={Leaf}
              color="purple"
            />
            <StatsCard
              title="Recently Planted"
              value={stats.recentlyPlanted.toLocaleString()}
              subtitle="Last 30 days"
              icon={Sprout}
              color="orange"
            />
          </div>
        )}

        {/* Tree Registry */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <TreeRegistry onTreeClick={handleTreeClick} />
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            About the Tree Registry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">AI-Powered Monitoring</h4>
              <p>
                Each tree is monitored using Antugrow's AI technology to track
                growth, health, and environmental conditions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Real-Time Updates</h4>
              <p>
                Tree data is updated regularly with new images and measurements to
                track progress over time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Species Diversity</h4>
              <p>
                We track multiple native species to ensure biodiversity and
                ecosystem resilience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Community Contribution</h4>
              <p>
                Participants can register trees they've planted and contribute to
                the collective conservation effort.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
