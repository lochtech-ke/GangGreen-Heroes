/**
 * Supabase health check utility
 * Requirements: 4.5
 */

import { supabase } from '../services/supabase';

interface HealthCheckResult {
  isHealthy: boolean;
  timestamp: number;
  error?: string;
}

// Cache health check results to avoid repeated checks
let lastHealthCheck: HealthCheckResult | null = null;
const HEALTH_CHECK_CACHE_TTL = 30000; // 30 seconds

/**
 * Checks if the Supabase connection is healthy
 * Uses a quick connection test with timeout and caches results
 * @param forceCheck - Force a new health check, bypassing cache
 * @returns true if Supabase is healthy, false otherwise
 */
export async function checkSupabaseHealth(
  forceCheck: boolean = false
): Promise<boolean> {
  const now = Date.now();

  // Return cached result if available and not expired
  if (
    !forceCheck &&
    lastHealthCheck &&
    now - lastHealthCheck.timestamp < HEALTH_CHECK_CACHE_TTL
  ) {
    console.log('[Health] Using cached health check result:', {
      isHealthy: lastHealthCheck.isHealthy,
      age: `${((now - lastHealthCheck.timestamp) / 1000).toFixed(1)}s`,
    });
    return lastHealthCheck.isHealthy;
  }

  console.log('[Health] Performing Supabase health check...');

  try {
    // Quick connection test with timeout
    const healthCheckPromise = supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), 3000)
    );

    const { error } = await Promise.race([
      healthCheckPromise,
      timeoutPromise,
    ]);

    const isHealthy = !error;

    // Cache the result
    lastHealthCheck = {
      isHealthy,
      timestamp: now,
      error: error?.message,
    };

    if (isHealthy) {
      console.log('[Health] Supabase is healthy');
    } else {
      console.warn('[Health] Supabase health check failed:', error?.message);
    }

    return isHealthy;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error('[Health] Health check failed:', errorMessage);

    // Cache the failure
    lastHealthCheck = {
      isHealthy: false,
      timestamp: now,
      error: errorMessage,
    };

    return false;
  }
}

/**
 * Clears the health check cache
 * Useful for testing or when you want to force a fresh check
 */
export function clearHealthCheckCache(): void {
  lastHealthCheck = null;
  console.log('[Health] Health check cache cleared');
}

/**
 * Gets the last health check result without performing a new check
 * @returns The last health check result or null if no check has been performed
 */
export function getLastHealthCheck(): HealthCheckResult | null {
  return lastHealthCheck;
}
