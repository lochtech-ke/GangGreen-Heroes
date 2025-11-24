import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { heroRewardEngineService } from '../../services/heroRewardEngine.service';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'purchase' | 'suspension' | 'reinstatement' | 'reward_distribution' | 'config_update' | 'benefit_usage';
  userId?: string;
  adminId?: string;
  details: string;
  metadata?: any;
}

interface ReportData {
  totalPurchases: number;
  totalRevenue: number;
  totalRewardsDistributed: number;
  totalBenefitValue: number;
  suspensionCount: number;
  reinstatementCount: number;
  averageRewardPerUser: number;
  averageBenefitPerUser: number;
}

export const HeroBadgeAuditTrail: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, [dateRange, eventTypeFilter]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      // Load audit logs from various sources
      const logs: AuditLogEntry[] = [];

      // 1. Badge purchases
      const { data: purchases } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('is_hero_badge', true)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });

      if (purchases) {
        purchases.forEach(purchase => {
          logs.push({
            id: purchase.id,
            timestamp: purchase.created_at,
            eventType: 'purchase',
            userId: purchase.user_id,
            details: `Hero badge purchased for KES ${purchase.amount_kes}`,
            metadata: purchase,
          });
        });
      }

      // 2. Hero badge holder status changes
      const { data: holders } = await supabase
        .from('hero_badge_holders')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false });

      if (holders) {
        holders.forEach(holder => {
          if (holder.status === 'suspended' && holder.suspended_at) {
            logs.push({
              id: `${holder.id}-suspend`,
              timestamp: holder.suspended_at,
              eventType: 'suspension',
              userId: holder.user_id,
              adminId: holder.suspended_by,
              details: `Hero status suspended: ${holder.suspension_reason}`,
              metadata: holder,
            });
          }
        });
      }

      // 3. Daily rewards
      const { data: rewards } = await supabase
        .from('hero_daily_rewards')
        .select('*')
        .gte('reward_date', dateRange.start)
        .lte('reward_date', dateRange.end)
        .order('created_at', { ascending: false })
        .limit(100);

      if (rewards) {
        rewards.forEach(reward => {
          logs.push({
            id: reward.id,
            timestamp: reward.created_at,
            eventType: 'reward_distribution',
            userId: reward.user_id,
            details: `Daily reward distributed: ${reward.total_amount} GG Coins`,
            metadata: reward,
          });
        });
      }

      // 4. Benefit usage
      const { data: benefits } = await supabase
        .from('hero_benefit_usage')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false })
        .limit(100);

      if (benefits) {
        benefits.forEach(benefit => {
          logs.push({
            id: benefit.id,
            timestamp: benefit.created_at,
            eventType: 'benefit_usage',
            userId: benefit.user_id,
            details: `Benefit used: ${benefit.benefit_type} (value: ${benefit.value_applied})`,
            metadata: benefit,
          });
        });
      }

      // Filter by event type if specified
      const filteredLogs = eventTypeFilter === 'all' 
        ? logs 
        : logs.filter(log => log.eventType === eventTypeFilter);

      // Sort by timestamp descending
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setAuditLogs(filteredLogs);
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      // Calculate report metrics
      const { data: purchases } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('is_hero_badge', true)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      const totalPurchases = purchases?.length || 0;
      const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount_kes, 0) || 0;

      // Get reward analytics
      const rewardAnalytics = await heroRewardEngineService.getRewardAnalytics(
        dateRange.start,
        dateRange.end
      );

      const totalRewardsDistributed = rewardAnalytics.totalAmountDistributed;

      // Get benefit usage
      const { data: benefits } = await supabase
        .from('hero_benefit_usage')
        .select('value_applied')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      const totalBenefitValue = benefits?.reduce((sum, b) => sum + (b.value_applied || 0), 0) || 0;

      // Get suspension/reinstatement counts
      const { data: holders } = await supabase
        .from('hero_badge_holders')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      const suspensionCount = holders?.filter(h => h.status === 'suspended').length || 0;
      const reinstatementCount = holders?.filter(h => h.status === 'active' && h.suspended_at).length || 0;

      // Calculate averages
      const uniqueUsers = new Set([
        ...(purchases?.map(p => p.user_id) || []),
        ...(holders?.map(h => h.user_id) || []),
      ]).size;

      const averageRewardPerUser = uniqueUsers > 0 ? totalRewardsDistributed / uniqueUsers : 0;
      const averageBenefitPerUser = uniqueUsers > 0 ? totalBenefitValue / uniqueUsers : 0;

      setReportData({
        totalPurchases,
        totalRevenue,
        totalRewardsDistributed,
        totalBenefitValue,
        suspensionCount,
        reinstatementCount,
        averageRewardPerUser,
        averageBenefitPerUser,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportAuditLog = async () => {
    setExporting(true);
    try {
      // Prepare CSV data
      const csvRows = [
        ['Hero Badge Audit Trail'],
        ['Generated:', new Date().toISOString()],
        ['Date Range:', `${dateRange.start} to ${dateRange.end}`],
        [],
        ['Timestamp', 'Event Type', 'User ID', 'Admin ID', 'Details'],
        ...auditLogs.map(log => [
          log.timestamp,
          log.eventType,
          log.userId || 'N/A',
          log.adminId || 'N/A',
          log.details,
        ]),
      ];

      const csv = csvRows.map(row => row.join(',')).join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hero-badge-audit-trail-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audit log:', error);
      alert('Failed to export audit log');
    } finally {
      setExporting(false);
    }
  };

  const exportReport = async () => {
    if (!reportData) {
      alert('Please generate a report first');
      return;
    }

    setExporting(true);
    try {
      // Prepare CSV data
      const csvRows = [
        ['Hero Badge Performance Report'],
        ['Generated:', new Date().toISOString()],
        ['Date Range:', `${dateRange.start} to ${dateRange.end}`],
        [],
        ['Metric', 'Value'],
        ['Total Purchases', reportData.totalPurchases],
        ['Total Revenue (KES)', reportData.totalRevenue],
        ['Total Rewards Distributed (GG Coins)', reportData.totalRewardsDistributed.toFixed(3)],
        ['Total Benefit Value', reportData.totalBenefitValue.toFixed(3)],
        ['Suspension Count', reportData.suspensionCount],
        ['Reinstatement Count', reportData.reinstatementCount],
        ['Average Reward Per User', reportData.averageRewardPerUser.toFixed(3)],
        ['Average Benefit Per User', reportData.averageBenefitPerUser.toFixed(3)],
      ];

      const csv = csvRows.map(row => row.join(',')).join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hero-badge-report-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'suspension':
        return 'bg-red-100 text-red-800';
      case 'reinstatement':
        return 'bg-blue-100 text-blue-800';
      case 'reward_distribution':
        return 'bg-yellow-100 text-yellow-800';
      case 'config_update':
        return 'bg-purple-100 text-purple-800';
      case 'benefit_usage':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Hero Badge Audit Trail & Reports</h1>
        <p className="text-sm text-gray-600 mt-1">
          Detailed transaction logs and performance reports for Hero badge system
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              <option value="purchase">Purchases</option>
              <option value="suspension">Suspensions</option>
              <option value="reinstatement">Reinstatements</option>
              <option value="reward_distribution">Reward Distributions</option>
              <option value="benefit_usage">Benefit Usage</option>
              <option value="config_update">Config Updates</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={exportAuditLog}
              disabled={exporting || auditLogs.length === 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exporting...' : 'Export Audit Log'}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Report */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Performance Report</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={generateReport}
              disabled={generatingReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
            {reportData && (
              <button
                onClick={exportReport}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? 'Exporting...' : 'Export Report'}
              </button>
            )}
          </div>
        </div>

        {reportData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalPurchases}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">KES {reportData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rewards Distributed</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.totalRewardsDistributed.toFixed(3)} GG</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Benefit Value</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.totalBenefitValue.toFixed(3)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Suspensions</p>
              <p className="text-2xl font-bold text-red-600">{reportData.suspensionCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reinstatements</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.reinstatementCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Reward/User</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.averageRewardPerUser.toFixed(3)} GG</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Benefit/User</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.averageBenefitPerUser.toFixed(3)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Click "Generate Report" to view performance metrics
          </p>
        )}
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Audit Log ({auditLogs.length} entries)
        </h2>
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(log.eventType)}`}>
                      {log.eventType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {log.userId && (
                      <span>User: <span className="font-mono">{log.userId.substring(0, 8)}...</span></span>
                    )}
                    {log.adminId && (
                      <span>Admin: <span className="font-mono">{log.adminId.substring(0, 8)}...</span></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No audit log entries found for the selected date range and filters
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
