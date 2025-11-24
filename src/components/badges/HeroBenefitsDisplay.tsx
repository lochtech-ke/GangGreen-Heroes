import { useState, useEffect } from 'react';
import { Crown, TrendingUp, Award, Star, Shield, Zap, ChevronRight } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { heroBenefitsService } from '../../services/heroBenefits.service';
import { gangGreenHeroBadgeService } from '../../services/gangGreenHeroBadge.service';
import type { HeroBenefits, BenefitUsageAnalytics } from '../../types/heroBenefit.types';
import type { HeroBadgeHolder } from '../../types/heroBadge.types';

interface HeroBenefitsDisplayProps {
  userId: string;
  showAnalytics?: boolean;
  compact?: boolean;
}

export const HeroBenefitsDisplay: React.FC<HeroBenefitsDisplayProps> = ({
  userId,
  showAnalytics = true,
  compact = false,
}) => {
  const [benefits, setBenefits] = useState<HeroBenefits | null>(null);
  const [analytics, setAnalytics] = useState<BenefitUsageAnalytics[]>([]);
  const [holder, setHolder] = useState<HeroBadgeHolder | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHeroBenefitsData();
  }, [userId]);

  const loadHeroBenefitsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is a Hero
      const isHero = await gangGreenHeroBadgeService.isHeroUser(userId);
      
      if (!isHero) {
        setError('User is not a Hero badge holder');
        setIsLoading(false);
        return;
      }

      // Load Hero benefits
      const heroBenefits = await heroBenefitsService.getHeroBenefits();
      setBenefits(heroBenefits);

      // Load holder information
      const holdersResult = await gangGreenHeroBadgeService.getHeroHolders();
      if (holdersResult.success && holdersResult.holders) {
        const userHolder = holdersResult.holders.find(h => h.userId === userId);
        if (userHolder) {
          setHolder(userHolder);
        }
      }

      // Load analytics if enabled
      if (showAnalytics) {
        const benefitAnalytics = await heroBenefitsService.getBenefitAnalytics(userId);
        setAnalytics(benefitAnalytics);

        const value = await heroBenefitsService.getTotalBenefitValue(userId);
        setTotalValue(value);
      }
    } catch (err) {
      console.error('Error loading Hero benefits data:', err);
      setError('Failed to load Hero benefits');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !benefits) {
    return (
      <GlassCard variant="default">
        <div className="text-center py-8">
          <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'No Hero benefits available'}</p>
          <button
            onClick={loadHeroBenefitsData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </GlassCard>
    );
  }

  // Compact view for dashboard widgets
  if (compact) {
    return (
      <GlassCard variant="green" hover="lift">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">Hero Status</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                ACTIVE
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {benefits.enhancedRewards.initiativeMultiplier}x rewards • {(benefits.platformPrivileges.reducedFees * 100).toFixed(0)}% fee discount
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      </GlassCard>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Hero Status Card */}
      <GlassCard variant="green" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Hero Status</h2>
                <p className="text-gray-600">Premium member since {holder ? new Date(holder.purchaseDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              ACTIVE
            </span>
          </div>

          {holder && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Rewards Earned</p>
                <p className="text-xl font-bold text-green-600">{holder.totalRewardsEarned.toFixed(3)} GG</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Consecutive Days</p>
                <p className="text-xl font-bold text-blue-600">{holder.consecutiveRewardDays}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Last Reward</p>
                <p className="text-xl font-bold text-purple-600">
                  {holder.lastRewardDate ? new Date(holder.lastRewardDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Benefits Value</p>
                <p className="text-xl font-bold text-orange-600">{totalValue.toFixed(2)} GG</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Active Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enhanced Rewards */}
        <GlassCard variant="default" hover="lift">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Enhanced Rewards</h3>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {benefits.enhancedRewards.initiativeMultiplier}x
            </div>
            <p className="text-xs text-gray-600">Initiative multiplier</p>
          </div>
        </GlassCard>

        {/* Fee Discounts */}
        <GlassCard variant="default" hover="lift">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Fee Discounts</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {(benefits.platformPrivileges.reducedFees * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-600">Marketplace savings</p>
          </div>
        </GlassCard>

        {/* Content Priority */}
        <GlassCard variant="default" hover="lift">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Content Priority</h3>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              Level {benefits.socialBenefits.contentPriority}
            </div>
            <p className="text-xs text-gray-600">Feed visibility</p>
          </div>
        </GlassCard>

        {/* Exclusive Access */}
        <GlassCard variant="default" hover="lift">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Exclusive Access</h3>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {benefits.platformPrivileges.exclusiveFeatures.length}
            </div>
            <p className="text-xs text-gray-600">Premium features</p>
          </div>
        </GlassCard>
      </div>

      {/* Benefit Usage Analytics */}
      {showAnalytics && analytics.length > 0 && (
        <GlassCard variant="default">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Benefit Usage</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>

          <div className="space-y-4">
            {analytics.map((analytic, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 capitalize mb-1">
                    {analytic.benefitType.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Used {analytic.usageCount} times • Last used {analytic.lastUsed ? new Date(analytic.lastUsed).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {analytic.valueGenerated.toFixed(2)} GG
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {analytic.averageValue.toFixed(2)} GG
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Total Value Generated</span>
              <span className="text-2xl font-bold text-green-600">{totalValue.toFixed(2)} GG</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Exclusive Features List */}
      <GlassCard variant="default">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Exclusive Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefits.platformPrivileges.exclusiveFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-900 font-medium capitalize">
                {feature.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
          {benefits.platformPrivileges.prioritySupport && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium">Priority Support</span>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
