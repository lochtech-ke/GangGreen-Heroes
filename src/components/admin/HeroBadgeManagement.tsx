import { useState, useEffect } from 'react';
import { gangGreenHeroBadgeService } from '../../services/gangGreenHeroBadge.service';
import { heroRewardEngineService } from '../../services/heroRewardEngine.service';
import type { HeroBadgeConfig, HeroBadgeHolder } from '../../types/heroBadge.types';

export const HeroBadgeManagement: React.FC = () => {
  const [config, setConfig] = useState<HeroBadgeConfig | null>(null);
  const [holders, setHolders] = useState<HeroBadgeHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedHolder, setSelectedHolder] = useState<HeroBadgeHolder | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReinstateModal, setShowReinstateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Config form state
  const [configForm, setConfigForm] = useState({
    priceKes: 500,
    dailyGGCoinReward: 0.1,
    initiativeMultiplier: 1.5,
    marketplaceDiscount: 0.1,
    contentPriorityBoost: 2,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Hero badge configuration
      const configData = await gangGreenHeroBadgeService.getHeroBadgeConfig();
      if (configData) {
        setConfig(configData);
        setConfigForm({
          priceKes: configData.priceKes,
          dailyGGCoinReward: configData.dailyGGCoinReward,
          initiativeMultiplier: configData.benefitMultipliers.initiativeRewards,
          marketplaceDiscount: configData.benefitMultipliers.marketplaceDiscount,
          contentPriorityBoost: configData.benefitMultipliers.contentPriority,
          isActive: configData.isActive,
        });
      }

      // Load Hero badge holders
      const holdersResult = await gangGreenHeroBadgeService.getHeroHolders(
        1000,
        0,
        statusFilter === 'all' ? undefined : statusFilter
      );
      if (holdersResult.success && holdersResult.holders) {
        setHolders(holdersResult.holders);
      }
    } catch (error) {
      console.error('Error loading Hero badge management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedHolder || !suspensionReason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }

    setSaving(true);
    try {
      const result = await gangGreenHeroBadgeService.suspendHeroStatus({
        userId: selectedHolder.userId,
        reason: suspensionReason,
        suspendedBy: 'admin', // TODO: Get actual admin user ID
      });

      if (result.success) {
        alert('Hero status suspended successfully');
        setShowSuspendModal(false);
        setSuspensionReason('');
        setSelectedHolder(null);
        await loadData();
      } else {
        alert(`Failed to suspend Hero status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error suspending Hero status:', error);
      alert('Failed to suspend Hero status');
    } finally {
      setSaving(false);
    }
  };

  const handleReinstateUser = async () => {
    if (!selectedHolder) return;

    setSaving(true);
    try {
      const result = await gangGreenHeroBadgeService.reinstateHeroStatus({
        userId: selectedHolder.userId,
      });

      if (result.success) {
        alert('Hero status reinstated successfully');
        setShowReinstateModal(false);
        setSelectedHolder(null);
        await loadData();
      } else {
        alert(`Failed to reinstate Hero status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error reinstating Hero status:', error);
      alert('Failed to reinstate Hero status');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfig = async () => {
    setSaving(true);
    try {
      const result = await gangGreenHeroBadgeService.updateHeroBadgeConfig({
        price_kes: configForm.priceKes,
        daily_gg_coin_reward: configForm.dailyGGCoinReward,
        initiative_multiplier: configForm.initiativeMultiplier,
        marketplace_discount: configForm.marketplaceDiscount,
        content_priority_boost: configForm.contentPriorityBoost,
        is_active: configForm.isActive,
      });

      if (result.success) {
        alert('Hero badge configuration updated successfully');
        setShowConfigModal(false);
        await loadData();
      } else {
        alert(`Failed to update configuration: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDistributeRewards = async () => {
    if (!confirm('Are you sure you want to manually trigger reward distribution? This should normally run automatically.')) {
      return;
    }

    setSaving(true);
    try {
      const result = await heroRewardEngineService.distributeDailyRewards();
      
      if (result.success) {
        alert(`Rewards distributed successfully!\n\nSuccessful: ${result.successfulDistributions}\nFailed: ${result.failedDistributions}\nTotal Amount: ${result.totalAmountDistributed.toFixed(3)} GG Coins`);
      } else {
        alert(`Reward distribution failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error distributing rewards:', error);
      alert('Failed to distribute rewards');
    } finally {
      setSaving(false);
    }
  };

  const filteredHolders = holders.filter(holder => {
    if (searchQuery) {
      return holder.userId.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hero Badge Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage Hero badge configuration, holder status, and reward distribution
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hero Badge Configuration</h2>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Badge Price</p>
            <p className="text-2xl font-bold text-gray-900">KES {config?.priceKes || 0}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Daily GG Coin Reward</p>
            <p className="text-2xl font-bold text-yellow-600">{config?.dailyGGCoinReward || 0} GG</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Initiative Multiplier</p>
            <p className="text-2xl font-bold text-green-600">{config?.benefitMultipliers.initiativeRewards || 0}x</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Marketplace Discount</p>
            <p className="text-2xl font-bold text-blue-600">{((config?.benefitMultipliers.marketplaceDiscount || 0) * 100).toFixed(0)}%</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Content Priority Boost</p>
            <p className="text-2xl font-bold text-purple-600">+{config?.benefitMultipliers.contentPriority || 0}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              config?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {config?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrative Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleDistributeRewards}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Distribute Rewards Now</span>
          </button>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Holders Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hero Badge Holders</h2>
          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Rewards</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consecutive Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHolders.map((holder) => (
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
                    {holder.suspensionReason && (
                      <p className="text-xs text-gray-500 mt-1">Reason: {holder.suspensionReason}</p>
                    )}
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
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {holder.status === 'active' ? (
                        <button
                          onClick={() => {
                            setSelectedHolder(holder);
                            setShowSuspendModal(true);
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedHolder(holder);
                            setShowReinstateModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                        >
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHolders.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No Hero badge holders found</p>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && selectedHolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend Hero Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are about to suspend Hero status for user: <span className="font-mono">{selectedHolder.userId.substring(0, 16)}...</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspension Reason *
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter reason for suspension..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSuspendUser}
                disabled={saving || !suspensionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Suspending...' : 'Suspend'}
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspensionReason('');
                  setSelectedHolder(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reinstate Modal */}
      {showReinstateModal && selectedHolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reinstate Hero Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are about to reinstate Hero status for user: <span className="font-mono">{selectedHolder.userId.substring(0, 16)}...</span>
            </p>
            {selectedHolder.suspensionReason && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500 mb-1">Previous suspension reason:</p>
                <p className="text-sm text-gray-900">{selectedHolder.suspensionReason}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReinstateUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Reinstating...' : 'Reinstate'}
              </button>
              <button
                onClick={() => {
                  setShowReinstateModal(false);
                  setSelectedHolder(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Hero Badge Configuration</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Price (KES)
                </label>
                <input
                  type="number"
                  value={configForm.priceKes}
                  onChange={(e) => setConfigForm({ ...configForm, priceKes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily GG Coin Reward
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={configForm.dailyGGCoinReward}
                  onChange={(e) => setConfigForm({ ...configForm, dailyGGCoinReward: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initiative Reward Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={configForm.initiativeMultiplier}
                  onChange={(e) => setConfigForm({ ...configForm, initiativeMultiplier: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketplace Discount (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={configForm.marketplaceDiscount}
                  onChange={(e) => setConfigForm({ ...configForm, marketplaceDiscount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Priority Boost
                </label>
                <input
                  type="number"
                  value={configForm.contentPriorityBoost}
                  onChange={(e) => setConfigForm({ ...configForm, contentPriorityBoost: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={configForm.isActive}
                  onChange={(e) => setConfigForm({ ...configForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Badge Sales Active
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateConfig}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
