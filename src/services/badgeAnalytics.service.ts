import { supabase } from './supabase';

export interface BadgeAnalytics {
  totalBadgesSold: number;
  totalRevenue: number;
  totalGGCoinsDistributed: number;
  salesByBadgeType: Array<{
    badge_type: string;
    count: number;
    revenue: number;
  }>;
  salesByTier: Array<{
    tier: string;
    count: number;
    revenue: number;
  }>;
  recentPurchases: Array<{
    id: string;
    user_id: string;
    badge_type: string;
    tier: string;
    amount_kes: number;
    gg_coins_awarded: number;
    created_at: string;
  }>;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Badge Analytics Service
 * Provides analytics and reporting for badge purchases
 */
class BadgeAnalyticsService {
  /**
   * Get comprehensive badge purchase analytics
   */
  async getAnalytics(dateRange?: DateRange): Promise<BadgeAnalytics> {
    try {
      // Build date filter
      let query = supabase
        .from('badge_purchases')
        .select('*')
        .eq('payment_status', 'success');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);
      }

      const { data: purchases, error } = await query;

      if (error) {
        console.error('[BadgeAnalyticsService] Error fetching purchases:', error);
        throw error;
      }

      // Calculate totals
      const totalBadgesSold = purchases?.length || 0;
      const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount_kes, 0) || 0;
      const totalGGCoinsDistributed = purchases?.reduce((sum, p) => sum + p.gg_coins_awarded, 0) || 0;

      // Group by badge type
      const salesByBadgeType = this.groupByBadgeType(purchases || []);

      // Group by tier
      const salesByTier = this.groupByTier(purchases || []);

      // Get recent purchases
      const recentPurchases = (purchases || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          user_id: p.user_id,
          badge_type: p.badge_type,
          tier: p.tier,
          amount_kes: p.amount_kes,
          gg_coins_awarded: p.gg_coins_awarded,
          created_at: p.created_at,
        }));

      return {
        totalBadgesSold,
        totalRevenue,
        totalGGCoinsDistributed,
        salesByBadgeType,
        salesByTier,
        recentPurchases,
      };
    } catch (error) {
      console.error('[BadgeAnalyticsService] Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Get total badges sold
   */
  async getTotalBadgesSold(dateRange?: DateRange): Promise<number> {
    try {
      let query = supabase
        .from('badge_purchases')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'success');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);
      }

      const { count, error } = await query;

      if (error) {
        console.error('[BadgeAnalyticsService] Error getting total badges:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[BadgeAnalyticsService] Error getting total badges:', error);
      return 0;
    }
  }

  /**
   * Get total revenue in KES
   */
  async getTotalRevenue(dateRange?: DateRange): Promise<number> {
    try {
      let query = supabase
        .from('badge_purchases')
        .select('amount_kes')
        .eq('payment_status', 'success');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[BadgeAnalyticsService] Error getting revenue:', error);
        return 0;
      }

      return data?.reduce((sum, p) => sum + p.amount_kes, 0) || 0;
    } catch (error) {
      console.error('[BadgeAnalyticsService] Error getting revenue:', error);
      return 0;
    }
  }

  /**
   * Get total GG Coins distributed
   */
  async getTotalGGCoinsDistributed(dateRange?: DateRange): Promise<number> {
    try {
      let query = supabase
        .from('badge_purchases')
        .select('gg_coins_awarded')
        .eq('payment_status', 'success')
        .eq('gg_coins_credited', true);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[BadgeAnalyticsService] Error getting GG Coins:', error);
        return 0;
      }

      return data?.reduce((sum, p) => sum + p.gg_coins_awarded, 0) || 0;
    } catch (error) {
      console.error('[BadgeAnalyticsService] Error getting GG Coins:', error);
      return 0;
    }
  }

  /**
   * Export analytics data as CSV
   */
  async exportToCSV(dateRange?: DateRange): Promise<string> {
    try {
      let query = supabase
        .from('badge_purchases')
        .select('*')
        .eq('payment_status', 'success')
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Create CSV header
      const headers = [
        'Purchase ID',
        'User ID',
        'Badge Type',
        'Tier',
        'Amount (KES)',
        'GG Coins Awarded',
        'GG Coins Credited',
        'Paystack Reference',
        'Purchase Date',
      ];

      // Create CSV rows
      const rows = (data || []).map(p => [
        p.id,
        p.user_id,
        p.badge_type,
        p.tier,
        p.amount_kes,
        p.gg_coins_awarded,
        p.gg_coins_credited ? 'Yes' : 'No',
        p.paystack_reference,
        new Date(p.created_at).toISOString(),
      ]);

      // Combine headers and rows
      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('[BadgeAnalyticsService] Error exporting CSV:', error);
      throw error;
    }
  }

  /**
   * Helper method to group purchases by badge type
   */
  private groupByBadgeType(
    purchases: any[]
  ): Array<{ badge_type: string; count: number; revenue: number }> {
    const grouped = purchases.reduce((acc, p) => {
      const key = p.badge_type;
      if (!acc[key]) {
        acc[key] = { count: 0, revenue: 0 };
      }
      acc[key].count += 1;
      acc[key].revenue += p.amount_kes;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return Object.entries(grouped).map(([key, value]) => ({
      badge_type: key,
      count: (value as { count: number; revenue: number }).count,
      revenue: (value as { count: number; revenue: number }).revenue,
    }));
  }

  /**
   * Helper method to group purchases by tier
   */
  private groupByTier(
    purchases: any[]
  ): Array<{ tier: string; count: number; revenue: number }> {
    const grouped = purchases.reduce((acc, p) => {
      const key = p.tier;
      if (!acc[key]) {
        acc[key] = { count: 0, revenue: 0 };
      }
      acc[key].count += 1;
      acc[key].revenue += p.amount_kes;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return Object.entries(grouped).map(([key, value]) => ({
      tier: key,
      count: (value as { count: number; revenue: number }).count,
      revenue: (value as { count: number; revenue: number }).revenue,
    }));
  }
}

// Export singleton instance
export const badgeAnalyticsService = new BadgeAnalyticsService();
