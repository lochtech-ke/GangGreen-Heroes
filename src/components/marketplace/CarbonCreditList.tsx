import { useState, useEffect } from 'react';
import { carbonCreditService } from '../../services';
import type { CarbonCredit, CreditFilters } from '../../types/carbonCredit.types';
import { CreditCard } from './CreditCard';

interface CarbonCreditListProps {
  filters?: CreditFilters;
  onCreditClick?: (credit: CarbonCredit) => void;
  showFilters?: boolean;
}

export function CarbonCreditList({
  filters: externalFilters,
  onCreditClick,
  showFilters = true,
}: CarbonCreditListProps) {
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CreditFilters>({
    verification_status: 'verified',
    available_only: true,
    ...externalFilters,
  });

  useEffect(() => {
    loadCredits();
  }, [filters]);

  const loadCredits = async () => {
    try {
      setLoading(true);
      setError(null);

      const { credits: fetchedCredits, error: fetchError } =
        await carbonCreditService.getCredits(filters);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCredits(fetchedCredits);
      }
    } catch (err) {
      setError('Failed to load carbon credits');
      console.error('Error loading credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CreditFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      verification_status: 'verified',
      available_only: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadCredits}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Verification Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <select
                value={filters.verification_status || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'verification_status',
                    e.target.value || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={filters.currency || ''}
                onChange={(e) =>
                  handleFilterChange('currency', e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="USD">USD</option>
                <option value="KES">KES</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.min_price || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'min_price',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.max_price || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'max_price',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="1000.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Available Only Toggle */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available_only || false}
                onChange={(e) =>
                  handleFilterChange('available_only', e.target.checked)
                }
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Show only available credits
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {credits.length} {credits.length === 1 ? 'credit' : 'credits'} found
        </p>
      </div>

      {/* Credits Grid */}
      {credits.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-2">No carbon credits found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credits.map((credit) => (
            <CreditCard
              key={credit.id}
              credit={credit}
              onClick={() => onCreditClick?.(credit)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
