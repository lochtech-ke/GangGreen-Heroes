/**
 * Badge Gallery Component
 * Displays user's earned NFT badges in a grid layout
 */

import React, { useState, useEffect } from 'react';
import { badgePurchaseService } from '../../services/badgePurchase.service';
import { BadgePurchase } from '../../types/badgePurchase.types';
import { GlassCard } from '../common/GlassCard';
import { Loader2, Award, Download, Share2 } from 'lucide-react';

interface BadgeGalleryProps {
  userId: string;
  limit?: number;
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ userId, limit = 50 }) => {
  const [badges, setBadges] = useState<BadgePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<BadgePurchase | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const purchases = await badgePurchaseService.getUserPurchases(userId, limit);
      
      // Filter only successful purchases with badge SVG
      const completedBadges = purchases.filter(
        (p) => p.payment_status === 'success' && p.badge_svg
      );
      
      setBadges(completedBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = filterTier === 'all' 
    ? badges 
    : badges.filter((b) => b.tier === filterTier);

  const handleDownload = async (badge: BadgePurchase) => {
    if (!badge.badge_svg) return;

    const blob = new Blob([badge.badge_svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${badge.badge_type}-${badge.tier}-badge.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (badge: BadgePurchase) => {
    setSelectedBadge(badge);
    // Open share modal (to be implemented)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-3 text-gray-600">Loading badges...</span>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <GlassCard variant="default" className="p-8 text-center">
        <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Badges Yet</h3>
        <p className="text-gray-600">
          Purchase your first NFT badge to start your collection!
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Filter by tier:</span>
        <div className="flex gap-2">
          {['all', 'bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterTier === tier
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              }`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => (
          <GlassCard
            key={badge.id}
            variant="default"
            className="p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
            onClick={() => setSelectedBadge(badge)}
          >
            {/* Badge SVG Display */}
            <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {badge.badge_svg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: badge.badge_svg }}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 truncate">
                {badge.badge_type}
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full font-medium ${getTierColor(badge.tier)}`}>
                  {badge.tier}
                </span>
                <span className="text-gray-600">
                  {new Date(badge.completed_at || badge.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(badge);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(badge);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

/**
 * Badge Detail Modal Component
 */
interface BadgeDetailModalProps {
  badge: BadgePurchase;
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard variant="default" className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{badge.badge_type}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Large Badge Display */}
        <div className="aspect-square mb-6 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {badge.badge_svg && (
            <div
              dangerouslySetInnerHTML={{ __html: badge.badge_svg }}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Badge Metadata */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Tier</span>
              <p className="font-semibold text-gray-800 capitalize">{badge.tier}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Earned Date</span>
              <p className="font-semibold text-gray-800">
                {new Date(badge.completed_at || badge.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">GG Coins Earned</span>
              <p className="font-semibold text-gray-800">{badge.gg_coins_awarded}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Purchase ID</span>
              <p className="font-mono text-xs text-gray-600 truncate">{badge.id}</p>
            </div>
          </div>

          {badge.badge_metadata && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600 block mb-2">Badge Metadata</span>
              <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(badge.badge_metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

/**
 * Get tier color classes
 */
function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    bronze: 'bg-orange-100 text-orange-800',
    silver: 'bg-gray-100 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800',
    diamond: 'bg-blue-100 text-blue-800',
  };
  return colors[tier] || 'bg-gray-100 text-gray-800';
}
