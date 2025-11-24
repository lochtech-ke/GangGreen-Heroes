import { useState, useEffect } from 'react';
import { gangGreenHeroBadgeService } from '../../services/gangGreenHeroBadge.service';
import { heroRewardEngineService } from '../../services/heroRewardEngine.service';
import type { HeroBadgeHolder } from '../../types/heroBadge.types';

interface HeroBadgeAnalyticsProps {
  dateRange?: { start: string; end: string };
  showDetails?: boolean;
}

interface HolderStatistics {
  totalHolders: number;
  activeHolders: number;
  suspendedHolders: number;
  totalRevenue: number;
  averagePurchaseValue: number;
}

interface RewardStatistics {
  totalRewardsDistributed: number;
  totalAmountDistributed: number;
  averageRewardAmount: number;
  uniqueRecipients: number;
  distributionDays: number;
}

export const HeroBadgeAnalytics: React.FC<HeroBadgeAnalyticsProps> = ({
  dateRange,
  showDetails = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<HeroBadgeHolder[]>([]);
  const [holderStats, setHolderStats] = useState<HolderStatistics | null>(null);
  const [rewardStats, setRewardStats] = useState<RewardStatistics | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: dateRange?.end || new Date().toISOString().split('T')[0],
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedDateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load Hero badge holders
      const holdersResult = await gangGreenHeroBadgeService.getHeroHolders(1000, 0);
      if (holdersResult.success && holdersResult.holders) {
        setHolders(holdersResult.holders);
        
        // Calculate holder statistics
        const activeHolders = holdersResult.holders.filter(h => h.status === 'active').length;
        const suspendedHolders = holdersResult.holders.filter(h => h.status === 'suspended').length;
        
        // Get Hero badge config for pricing
        const config = await gangGreenHeroBadgeService.getHeroBadgeConfig();
        const priceKes = config?.priceKes || 500;
        
        setHolderStats({
          totalHolders: holdersResult.holders.length,
          activeHolders,
          suspendedHolders,
          totalRevenue: holdersResult.holders.length * priceKes,
          averagePurchaseValue: priceKes,
        });
      }

      // Load reward analytics
      const rewardAnalytics = await heroRewardEngineService.getRewardAnalytics(
        selectedDateRange.start,
        selectedDateRange.end
      );
      
      setRewardStats({
        totalRewardsDistributed: rewardAnalytics.totalRewardsDistributed,
        totalAmountDistributed: rewardAnalytics.totalAmountDistributed,
        averageRewardAmount: rewardAnalytics.averageRewardAmount,
        uniqueRecipients: rewardAnalytics.uniqueRecipients,
        distributionDays: rewardAnalytics.distributionDays,
      });
    } catch (error) {
      console.error('Error loading Hero badge analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Prepare CSV data
      const csvRows = [
        ['Hero Badge Analytics Report'],
        ['Generated:', new Date().toISOString()],
        ['Date Range:', `${selectedDateRange.start} to ${selectedDateRange.end}`],
        [],
        ['Holder Statistics'],
        ['Total Holders', holderStats?.totalHolders || 0],
        ['Active Holders', holderStats?.activeHolders || 0],
        ['Suspended Holders', holderStats?.suspendedHolders || 0],
        ['Total Revenue (KES)', holderStats?.totalRevenue || 0],
        [],
        ['Reward Statistics'],
        ['Total Rewards Distributed', rewardStats?.totalRewardsDistributed || 0],
        ['Total Amount Distributed (GG Coins)', rewardStats?.totalAmountDistributed || 0],
        ['Average Reward Amount', rewardStats?.averageRewardAmount.toFixed(3) || 0],
        ['Unique Recipients', rewardStats?.uniqueRecipients || 0],
        ['Distribution Days', rewardStats?.distributionDays || 0],
        [],
        ['Holder Details'],
        ['User ID', 'Status', 'Purchase Date', 'Total Rewards Earned', 'Consecutive Days', 'Last Reward Date'],
        ...holders.map(h => [
          h.userId,
          h.status,
          h.purchaseDate,
          h.totalRewardsEarned,
          h.consecutiveRewardDays,
          h.lastRewardDate || 'N/A',
        ]),
      ];

      const csv = csvRows.map(row => row.join(',')).join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hero-badge-analytics-${selectedDateRange.start}-to-${selectedDateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Badge Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor GangGreen Hero badge sales, holder statistics, and reward distribution
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Holder Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Holder Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Holders</p>
                <p className="text-3xl font-bold text-gray-900">{holderStats?.totalHolders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{holderStats?.activeHolders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Suspended</p>
                <p className="text-3xl font-bold text-red-600">{holderStats?.suspendedHolders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">KES {holderStats?.totalRevenue.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Purchase</p>
                <p className="text-2xl font-bold text-gray-900">KES {holderStats?.averagePurchaseValue || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward Distribution Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reward Distribution ({selectedDateRange.start} to {selectedDateRange.end})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rewards</p>
                <p className="text-3xl font-bold text-gray-900">{rewardStats?.totalRewardsDistributed || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">GG</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-yellow-600">{rewardStats?.totalAmountDistributed.toFixed(3) || 0}</p>
                <p className="text-xs text-gray-500">GG Coins</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Reward</p>
                <p className="text-2xl font-bold text-gray-900">{rewardStats?.averageRewardAmount.toFixed(3) || 0}</p>
                <p className="text-xs text-gray-500">GG Coins</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recipients</p>
                <p className="text-3xl font-bold text-gray-900">{rewardStats?.uniqueRecipients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Distribution Days</p>
                <p className="text-3xl font-bold text-gray-900">{rewardStats?.distributionDays || 0}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holder Details Table */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Badge Holders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Rewards</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consecutive Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {holders.map((holder) => (
                  <tr key={holder.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">
                      {holder.userId.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        holder.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {holder.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(holder.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-yellow-600">
                      {holder.totalRewardsEarned.toFixed(3)} GG
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {holder.consecutiveRewardDays} days
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {holder.lastRewardDate 
                        ? new Date(holder.lastRewardDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {holders.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No Hero badge holders yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
