import { antugrowService } from './antugrow.service';
import { treeService } from './tree.service';
import { supabase } from './supabase';

/**
 * Antugrow Sync Service
 * Handles synchronization of tree data between local database and Antugrow API
 * Manages background jobs and webhook processing
 */

interface SyncStatus {
  last_sync: string | null;
  trees_synced: number;
  errors: number;
  in_progress: boolean;
}

interface SyncResult {
  success: boolean;
  trees_synced: number;
  errors: string[];
}

class AntugrowSyncService {
  private syncInProgress: boolean = false;
  private syncInterval: number | null = null;

  /**
   * Start automatic background sync
   * @param intervalMinutes - How often to sync (default: 60 minutes)
   */
  startAutoSync(intervalMinutes: number = 60): void {
    if (this.syncInterval) {
      console.warn('Auto-sync already running');
      return;
    }

    // Run initial sync
    this.syncAllTrees();

    // Set up interval
    this.syncInterval = window.setInterval(() => {
      this.syncAllTrees();
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-sync started: every ${intervalMinutes} minutes`);
  }

  /**
   * Stop automatic background sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Sync all trees with Antugrow IDs
   */
  async syncAllTrees(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        trees_synced: 0,
        errors: ['Sync already in progress'],
      };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let treesSynced = 0;

    try {
      // Get all trees with Antugrow IDs
      const { data: trees, error } = await supabase
        .from('trees')
        .select('*')
        .not('antugrow_id', 'is', null);

      if (error) {
        errors.push(`Failed to fetch trees: ${error.message}`);
        return { success: false, trees_synced: 0, errors };
      }

      if (!trees || trees.length === 0) {
        return { success: true, trees_synced: 0, errors: [] };
      }

      // Sync each tree
      for (const tree of trees) {
        try {
          await this.syncTree(tree.id, tree.antugrow_id);
          treesSynced++;
        } catch (err) {
          errors.push(
            `Failed to sync tree ${tree.id}: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      }

      // Update sync status
      await this.updateSyncStatus({
        last_sync: new Date().toISOString(),
        trees_synced: treesSynced,
        errors: errors.length,
        in_progress: false,
      });

      return {
        success: errors.length === 0,
        trees_synced: treesSynced,
        errors,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single tree with Antugrow
   */
  async syncTree(treeId: string, antugrowId: string): Promise<void> {
    try {
      // Get growth data from Antugrow
      const { data: growthData, error } = await antugrowService.getGrowthData(antugrowId);

      if (error || !growthData) {
        throw new Error(error?.message || 'Failed to fetch growth data');
      }

      // Update local tree record
      await treeService.updateTree(treeId, {
        current_height_cm: growthData.measurements.height_cm,
        current_diameter_cm: growthData.measurements.diameter_cm,
        health_status: growthData.health_status,
      });
    } catch (error) {
      console.error(`Error syncing tree ${treeId}:`, error);
      throw error;
    }
  }

  /**
   * Process webhook from Antugrow
   * Called when Antugrow sends updates about tree analysis
   */
  async processWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      const { event, data } = payload;

      switch (event) {
        case 'analysis.completed':
          return await this.handleAnalysisCompleted(data);

        case 'tree.updated':
          return await this.handleTreeUpdated(data);

        case 'health.alert':
          return await this.handleHealthAlert(data);

        default:
          return {
            success: false,
            message: `Unknown event type: ${event}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    }
  }

  /**
   * Handle analysis completed webhook
   */
  private async handleAnalysisCompleted(data: any): Promise<{ success: boolean; message: string }> {
    try {
      const { antugrow_id, analysis } = data;

      // Find tree by antugrow_id
      const { data: trees, error } = await supabase
        .from('trees')
        .select('id')
        .eq('antugrow_id', antugrow_id)
        .single();

      if (error || !trees) {
        return {
          success: false,
          message: `Tree not found for antugrow_id: ${antugrow_id}`,
        };
      }

      // Update tree with analysis results
      await treeService.updateTree(trees.id, {
        health_status: this.mapHealthStatus(analysis.health_score),
      });

      return {
        success: true,
        message: `Analysis processed for tree ${trees.id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process analysis',
      };
    }
  }

  /**
   * Handle tree updated webhook
   */
  private async handleTreeUpdated(data: any): Promise<{ success: boolean; message: string }> {
    try {
      const { antugrow_id, measurements, health_status } = data;

      // Find tree by antugrow_id
      const { data: trees, error } = await supabase
        .from('trees')
        .select('id')
        .eq('antugrow_id', antugrow_id)
        .single();

      if (error || !trees) {
        return {
          success: false,
          message: `Tree not found for antugrow_id: ${antugrow_id}`,
        };
      }

      // Update tree measurements
      await treeService.updateTree(trees.id, {
        current_height_cm: measurements?.height_cm,
        current_diameter_cm: measurements?.diameter_cm,
        health_status: health_status,
      });

      return {
        success: true,
        message: `Tree ${trees.id} updated successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update tree',
      };
    }
  }

  /**
   * Handle health alert webhook
   */
  private async handleHealthAlert(data: any): Promise<{ success: boolean; message: string }> {
    try {
      const { antugrow_id, alert_type, message } = data;

      // Find tree by antugrow_id
      const { data: trees, error } = await supabase
        .from('trees')
        .select('id, planted_by')
        .eq('antugrow_id', antugrow_id)
        .single();

      if (error || !trees) {
        return {
          success: false,
          message: `Tree not found for antugrow_id: ${antugrow_id}`,
        };
      }

      // Create notification for tree owner
      await supabase.from('notifications').insert({
        user_id: trees.planted_by,
        title: `Tree Health Alert: ${alert_type}`,
        message: message,
        type: 'system',
      });

      return {
        success: true,
        message: `Health alert notification created for tree ${trees.id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process health alert',
      };
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      // In a real implementation, this would be stored in the database
      // For now, return a basic status
      return {
        last_sync: null,
        trees_synced: 0,
        errors: 0,
        in_progress: this.syncInProgress,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        last_sync: null,
        trees_synced: 0,
        errors: 0,
        in_progress: false,
      };
    }
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(status: SyncStatus): Promise<void> {
    // In a real implementation, this would update a database record
    // For now, just log it
    console.log('Sync status updated:', status);
  }

  /**
   * Map health score to health status
   */
  private mapHealthStatus(healthScore: number): 'healthy' | 'stressed' | 'diseased' | 'dead' {
    if (healthScore >= 80) return 'healthy';
    if (healthScore >= 60) return 'stressed';
    if (healthScore >= 40) return 'diseased';
    return 'dead';
  }

  /**
   * Check if sync is currently running
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instance
export const antugrowSyncService = new AntugrowSyncService();

// Export types
export type { SyncStatus, SyncResult };
