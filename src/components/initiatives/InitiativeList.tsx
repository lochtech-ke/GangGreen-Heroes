import { useState, useEffect } from 'react';
import { initiativeService } from '../../services';
import type { Initiative, InitiativeFilters } from '../../types/initiative.types';
import { InitiativeCard } from './InitiativeCard';
import type { ForestPreference } from '../../types/user.types';

interface InitiativeListProps {
  filters?: InitiativeFilters;
  onInitiativeClick?: (initiative: Initiative) => void;
}

export function InitiativeList({ filters, onInitiativeClick }: InitiativeListProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [localFilters, setLocalFilters] = useState<InitiativeFilters>(filters || {});

  useEffect(() => {
    loadInitiatives();
  }, [localFilters]);

  const loadInitiatives = async () => {
    setLoading(true);
    setError('');

    const { initiatives: data, error: err } = await initiativeService.getInitiatives(
      localFilters
    );

    if (err) {
      setError(err.message || 'Failed to load initiatives');
    } else {
      setInitiatives(data);
    }

    setLoading(false);
  };

  const handleFilterChange = (key: keyof InitiativeFilters, value: any) => {
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
          {/* Forest Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forest
            </label>
            <select
              value={localFilters.forest || ''}
              onChange={(e) =>
                handleFilterChange('forest', e.target.value as ForestPreference)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Forests</option>
              <option value="kakamega">Kakamega Forest</option>
              <option value="karura">Karura Forest</option>
              <option value="mau">Mau Forest</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
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
              placeholder="Search initiatives..."
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

      {/* Initiatives Grid */}
      {initiatives.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">No initiatives found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initiatives.map((initiative) => (
            <InitiativeCard
              key={initiative.id}
              initiative={initiative}
              onClick={() => onInitiativeClick?.(initiative)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
