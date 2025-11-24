import { useState, useEffect } from 'react';
import { treeService } from '../../services';
import type { Tree, TreeFilters, TreeHealthStatus } from '../../types/tree.types';
import { TreeCard } from './TreeCard';

interface TreeRegistryProps {
  initiativeId?: string;
  filters?: TreeFilters;
  onTreeClick?: (tree: Tree) => void;
}

export function TreeRegistry({ initiativeId, filters, onTreeClick }: TreeRegistryProps) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [localFilters, setLocalFilters] = useState<TreeFilters>(
    filters || (initiativeId ? { initiative_id: initiativeId } : {})
  );
  const [speciesList, setSpeciesList] = useState<string[]>([]);

  useEffect(() => {
    loadSpecies();
  }, []);

  useEffect(() => {
    loadTrees();
  }, [localFilters]);

  const loadSpecies = async () => {
    const { species } = await treeService.getSpeciesList();
    setSpeciesList(species);
  };

  const loadTrees = async () => {
    setLoading(true);
    setError('');

    const { trees: data, error: err } = await treeService.getTrees(localFilters);

    if (err) {
      setError(err.message || 'Failed to load trees');
    } else {
      setTrees(data);
    }

    setLoading(false);
  };

  const handleFilterChange = (key: keyof TreeFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Species Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Species
            </label>
            <select
              value={localFilters.species || ''}
              onChange={(e) => handleFilterChange('species', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Species</option>
              {speciesList.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </div>

          {/* Health Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Health Status
            </label>
            <select
              value={localFilters.health_status || ''}
              onChange={(e) =>
                handleFilterChange('health_status', e.target.value as TreeHealthStatus)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="healthy">Healthy</option>
              <option value="stressed">Stressed</option>
              <option value="diseased">Diseased</option>
              <option value="dead">Dead</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by species..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tree Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {trees.length} tree{trees.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Trees Grid */}
      {trees.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-gray-600 mb-2">No trees found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or add new trees to the registry
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <TreeCard
              key={tree.id}
              tree={tree}
              onClick={() => onTreeClick?.(tree)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
