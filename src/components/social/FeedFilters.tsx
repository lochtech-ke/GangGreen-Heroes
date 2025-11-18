import { useState, useEffect } from 'react';
import type { FeedFilters as FeedFiltersType, Platform } from '../../types/socialFeed.types';
import { Search, Filter, X } from 'lucide-react';

interface FeedFiltersProps {
  filters: FeedFiltersType;
  onFilterChange: (filters: FeedFiltersType) => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({ filters, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchQuery) {
        onFilterChange({ ...filters, searchQuery: searchInput || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handlePlatformChange = (platform: Platform | 'all') => {
    onFilterChange({ ...filters, platform });
    updateURLParams({ ...filters, platform });
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, location });
    updateURLParams({ ...filters, location });
  };

  const handleSortChange = (sortBy: 'recent' | 'popular') => {
    onFilterChange({ ...filters, sortBy });
    updateURLParams({ ...filters, sortBy });
  };

  const handleDateRangeChange = (preset: string) => {
    let dateRange: { start: Date; end: Date } | undefined;
    const now = new Date();

    switch (preset) {
      case '7days':
        dateRange = {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        };
        break;
      case '30days':
        dateRange = {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
        };
        break;
      case 'all':
      default:
        dateRange = undefined;
        break;
    }

    onFilterChange({ ...filters, dateRange });
    updateURLParams({ ...filters, dateRange });
  };

  const updateURLParams = (newFilters: FeedFiltersType) => {
    const params = new URLSearchParams(window.location.search);

    if (newFilters.platform && newFilters.platform !== 'all') {
      params.set('platform', newFilters.platform);
    } else {
      params.delete('platform');
    }

    if (newFilters.location && newFilters.location !== 'all') {
      params.set('location', newFilters.location);
    } else {
      params.delete('location');
    }

    if (newFilters.sortBy && newFilters.sortBy !== 'recent') {
      params.set('sort', newFilters.sortBy);
    } else {
      params.delete('sort');
    }

    if (newFilters.searchQuery) {
      params.set('q', newFilters.searchQuery);
    } else {
      params.delete('q');
    }

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  };

  const clearFilters = () => {
    setSearchInput('');
    onFilterChange({
      platform: 'all',
      location: 'all',
      sortBy: 'recent',
      searchQuery: undefined,
      dateRange: undefined,
    });
    window.history.replaceState({}, '', window.location.pathname);
  };

  const hasActiveFilters = 
    filters.platform !== 'all' ||
    filters.location !== 'all' ||
    filters.sortBy !== 'recent' ||
    !!filters.searchQuery ||
    !!filters.dateRange;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-700">
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${showMobileFilters ? 'block' : 'hidden md:grid'}`}>
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select
            value={filters.platform || 'all'}
            onChange={(e) => handlePlatformChange(e.target.value as Platform | 'all')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={filters.location || 'all'}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            <option value="Kakamega">Kakamega Forest</option>
            <option value="Karura">Karura Forest</option>
            <option value="Mau">Mau Forest</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={
              !filters.dateRange
                ? 'all'
                : filters.dateRange.start.getTime() > Date.now() - 8 * 24 * 60 * 60 * 1000
                ? '7days'
                : '30days'
            }
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy || 'recent'}
            onChange={(e) => handleSortChange(e.target.value as 'recent' | 'popular')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className={`mt-4 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
