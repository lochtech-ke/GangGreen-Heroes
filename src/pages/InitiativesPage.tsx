import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { initiativeService } from '../services';
import type { Initiative, InitiativeFilters } from '../types/initiative.types';
import { 
  InitiativeCard, 
  InitiativeDetails,
  InitiativeMap,
  ForestBoundaryMap 
} from '../components/initiatives';
import { Search, MapPin, Filter, Plus, Map } from 'lucide-react';
import type { ForestPreference } from '../types/user.types';

type ViewMode = 'grid' | 'map' | 'details';

export function InitiativesPage() {
  const { user } = useAuthContext();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<InitiativeFilters>({
    search: '',
    forest: undefined,
    status: undefined,
  });

  useEffect(() => {
    loadInitiatives();
  }, [filters]);

  const loadInitiatives = async () => {
    setLoading(true);
    setError('');

    const { initiatives: data, error: err } = await initiativeService.getInitiatives(filters);

    if (err) {
      setError(err.message || 'Failed to load initiatives');
    } else {
      setInitiatives(data);
    }

    setLoading(false);
  };

  const handleInitiativeClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setSelectedInitiative(null);
    setViewMode('grid');
  };

  const handleFilterChange = (key: keyof InitiativeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      forest: undefined,
      status: undefined,
    });
  };

  const activeFiltersCount = [filters.forest, filters.status, filters.search].filter(Boolean).length;

  // Stats calculation
  const stats = {
    total: initiatives.length,
    active: initiatives.filter(i => i.status === 'active').length,
    totalTrees: initiatives.reduce((sum, i) => sum + i.trees_planted, 0),
    totalTarget: initiatives.reduce((sum, i) => sum + i.target_trees, 0),
  };

  // If showing details view
  if (viewMode === 'details' && selectedInitiative) {
    return (
      <div className="space-y-6">
        <InitiativeDetails
          initiativeId={selectedInitiative.id}
          onBack={handleBackToList}
          currentUserId={user?.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Initiatives</h1>
          <p className="text-gray-600 mt-1">
            Browse and participate in conservation initiatives across Kenya's forests
          </p>
        </div>
        
        {user?.role === 'organization' && (
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg">
            <Plus className="w-5 h-5" />
            Create Initiative
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Initiatives</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🌳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trees Planted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrees.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTarget > 0 ? Math.round((stats.totalTrees / stats.totalTarget) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search initiatives..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggles */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-green-700 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-green-700 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Forest Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forest
                </label>
                <select
                  value={filters.forest || ''}
                  onChange={(e) => handleFilterChange('forest', e.target.value as ForestPreference)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Forests</option>
                  <option value="kakamega">Kakamega Forest</option>
                  <option value="karura">Karura Forest</option>
                  <option value="mau">Mau Forest</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <InitiativeMap
                  initiatives={initiatives}
                  onMarkerClick={handleInitiativeClick}
                  selectedInitiativeId={selectedInitiative?.id}
                  height="600px"
                />
              </div>
              
              {/* Selected Initiative Preview */}
              {selectedInitiative && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Initiative
                  </h3>
                  <InitiativeCard
                    initiative={selectedInitiative}
                    onClick={() => setViewMode('details')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              {initiatives.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No initiatives found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or check back later for new initiatives
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initiatives.map((initiative) => (
                      <InitiativeCard
                        key={initiative.id}
                        initiative={initiative}
                        onClick={() => handleInitiativeClick(initiative)}
                      />
                    ))}
                  </div>

                  {/* Results Count */}
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">
                      Showing {initiatives.length} initiative{initiatives.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Forest Overview Section */}
      {viewMode === 'grid' && !loading && initiatives.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Kenya's Pilot Forests
          </h2>
          <p className="text-gray-600 mb-6">
            Explore our conservation areas across Kenya
          </p>
          <ForestBoundaryMap showAllForests={true} height="400px" />
        </div>
      )}
    </div>
  );
}