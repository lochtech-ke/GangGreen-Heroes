import { useState, useEffect } from 'react';
import { antugrowSyncService } from '../../services/antugrow-sync.service';
import type { SyncStatus } from '../../services/antugrow-sync.service';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onSyncClick?: () => void;
}

export function SyncStatusIndicator({
  showDetails = false,
  onSyncClick,
}: SyncStatusIndicatorProps) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    const syncStatus = await antugrowSyncService.getSyncStatus();
    setStatus(syncStatus);
    setLoading(false);
  };

  const handleSync = () => {
    if (onSyncClick) {
      onSyncClick();
    } else {
      antugrowSyncService.syncAllTrees();
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Loading sync status...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getSyncStatusColor = () => {
    if (status.in_progress) return 'text-blue-600';
    if (status.errors > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSyncStatusIcon = () => {
    if (status.in_progress) return '🔄';
    if (status.errors > 0) return '⚠️';
    return '✅';
  };

  if (!showDetails) {
    // Compact view
    return (
      <button
        onClick={handleSync}
        disabled={status.in_progress}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Last sync: ${formatLastSync(status.last_sync)}`}
      >
        <span className={status.in_progress ? 'animate-spin' : ''}>
          {getSyncStatusIcon()}
        </span>
        <span className={getSyncStatusColor()}>
          {status.in_progress ? 'Syncing...' : 'Sync'}
        </span>
      </button>
    );
  }

  // Detailed view
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Antugrow Sync Status</h3>
        <button
          onClick={handleSync}
          disabled={status.in_progress}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {status.in_progress ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className={status.in_progress ? 'animate-spin' : ''}>
            {getSyncStatusIcon()}
          </span>
          <span className={`text-sm font-medium ${getSyncStatusColor()}`}>
            {status.in_progress
              ? 'Sync in progress...'
              : status.errors > 0
              ? 'Sync completed with errors'
              : 'All synced'}
          </span>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last sync:</span>
          <span className="font-medium text-gray-900">
            {formatLastSync(status.last_sync)}
          </span>
        </div>

        {/* Trees Synced */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Trees synced:</span>
          <span className="font-medium text-gray-900">{status.trees_synced}</span>
        </div>

        {/* Errors */}
        {status.errors > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Errors:</span>
            <span className="font-medium text-red-600">{status.errors}</span>
          </div>
        )}

        {/* Progress Bar */}
        {status.in_progress && (
          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
