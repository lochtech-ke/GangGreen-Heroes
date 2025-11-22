import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TreePine, Users, Target, TrendingUp } from 'lucide-react';
import { getInitiatives, getInitiativeStats } from '../services/initiative.service';
import type { Initiative, InitiativeFilters, InitiativeStats } from '../types/initiative.types';
import StatsCard from '../components/common/StatsCard';
import { GlassCard } from '../components/common/GlassCard';
import InitiativeList from '../components/initiatives/InitiativeList';

const InitiativesPage: React.FC = () => {
  const navigate = useNavigate();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [stats, setStats] = useState<InitiativeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InitiativeFilters>({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [initiativesData, statsData] = await Promise.all([
        getInitiatives(filters),
        getInitiativeStats(),
      ]);

      setInitiatives(initiativesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading initiatives:', err);
      setError(err instanceof Error ? err.message : 'Failed to load initiatives');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof InitiativeFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Conservation Initiatives
          </h1>
          <p className="text-gray-600">
            Join active tree planting initiatives across Kenya's pilot forests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Initiatives"
              value={stats.totalInitiatives}
              icon={Target}
              color="green"
            />
            <StatsCard
              title="Active Initiatives"
              value={stats.activeInitiatives}
              icon={TrendingUp}
              color="blue"
            />
            <StatsCard
              title="Trees Planted"
              value={stats.totalTrees.toLocaleString()}
              icon={TreePine}
              color="green"
            />
            <StatsCard
              title="Total Participants"
              value={stats.totalParticipants}
              icon={Users}
              color="purple"
            />
          </div>
        )}

        {/* Filters and Create Button */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <input
                type="text"
                placeholder="Search initiatives..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />

              {/* Forest Filter */}
              <select
                value={filters.forest || ''}
                onChange={(e) => handleFilterChange('forest', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Forests</option>
                <option value="kakamega">Kakamega Forest</option>
                <option value="karura">Karura Forest</option>
                <option value="mau">Mau Forest</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Create Initiative Button */}
            <button
              onClick={() => navigate('/initiatives/create')}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus size={20} />
              <span>Create Initiative</span>
            </button>
          </div>
        </GlassCard>

        {/* Initiatives List */}
        <InitiativeList
          initiatives={initiatives}
          loading={loading}
          error={error}
          onRetry={loadData}
        />
      </div>
    </div>
  );
};

export default InitiativesPage;
