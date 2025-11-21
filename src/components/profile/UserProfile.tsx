import { useState, useEffect } from 'react';
import type { User } from '../../types/user.types';
import type { GGCoinTransaction } from '../../types/ggCoin.types';
import { profileService } from '../../services/profile.service';
import { ggCoinService } from '../../services/ggCoin.service';
import { GGCoinBalance } from '../gamification/GGCoinBalance';
import { BadgeGallery } from './BadgeGallery';

interface UserProfileProps {
  user: User;
  onEdit?: () => void;
}

export function UserProfile({ user, onEdit }: UserProfileProps) {
  const profile = user.profile;
  const completeness = profile
    ? profileService.getProfileCompleteness(profile)
    : 0;

  const [transactions, setTransactions] = useState<GGCoinTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const history = await ggCoinService.getTransactionHistory(user.id, 10);
        setTransactions(history);
      } catch (error) {
        console.error('Error loading GG Coin transactions:', error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [user.id]);

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      organization: 'Organization',
      community: 'Community Member',
      individual: 'Individual',
    };
    return roleMap[role] || role;
  };

  const getForestDisplay = (forest?: string) => {
    const forestMap: Record<string, string> = {
      kakamega: 'Kakamega Forest',
      karura: 'Karura Forest',
      mau: 'Mau Forest',
    };
    return forest ? forestMap[forest] || forest : 'Not selected';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">Profile</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Completeness */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Profile Completeness
          </span>
          <span className="text-sm font-semibold text-green-600">
            {completeness}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-gray-400">
              {profile?.full_name?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {profile?.full_name || 'No name set'}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {getRoleDisplay(user.role)}
          </span>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Contact Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.phone || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Location:</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.location || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {user.role === 'organization' && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Organization Details
            </h4>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Organization:</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.organization || 'Not provided'}
              </span>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Conservation Preferences
          </h4>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Preferred Forest:</span>
            <span className="text-sm font-medium text-gray-900">
              {getForestDisplay(user.forest_preference)}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Account Information
          </h4>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Member since:</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* GG Coins Section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            GG Coins
          </h4>
          
          {/* Balance Display */}
          <div className="mb-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <GGCoinBalance 
              userId={user.id} 
              showTooltip={false}
              className="justify-center"
            />
            <p className="text-xs text-gray-600 text-center mt-2">
              Earn GG Coins by purchasing badges and participating in #GangGreen activities
            </p>
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-gray-700">Recent Transactions</h5>
              {transactions.length > 5 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  {showAllTransactions ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>

            {loadingTransactions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex justify-between p-2 bg-gray-50 rounded">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mb-2">No transactions yet</p>
                <a 
                  href="/badges" 
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Purchase a badge to earn your first GG Coins →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {(showAllTransactions ? transactions : transactions.slice(0, 5)).map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-xs text-gray-900 font-medium">
                        {tx.description || tx.transaction_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span 
                        className={`text-sm font-bold ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                      <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">GG</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NFT Badge Gallery Section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            NFT Badge Collection
          </h4>
          <BadgeGallery userId={user.id} limit={12} />
        </div>
      </div>
    </div>
  );
}
