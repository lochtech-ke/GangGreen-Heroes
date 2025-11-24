/**
 * useAppReady Hook
 * 
 * Tracks application initialization state to determine when the app
 * is ready to be displayed to the user.
 */

import { useState, useEffect } from 'react';

interface AppReadyState {
  isReady: boolean;
  isSupabaseReady: boolean;
  isRouterReady: boolean;
}

/**
 * Custom hook to track when the application is fully loaded and ready
 * 
 * @returns boolean indicating if the app is ready to display
 */
export function useAppReady(): boolean {
  const [state, setState] = useState<AppReadyState>({
    isReady: false,
    isSupabaseReady: false,
    isRouterReady: false,
  });

  useEffect(() => {
    let mounted = true;

    const checkReadiness = async () => {
      try {
        // Check if Supabase is initialized
        // In a real app, you might check if the Supabase client is connected
        const supabaseReady = true; // Supabase client is synchronously available
        
        // Check if router is ready (DOM is loaded)
        const routerReady = document.readyState === 'complete';

        if (mounted) {
          setState({
            isSupabaseReady: supabaseReady,
            isRouterReady: routerReady,
            isReady: supabaseReady && routerReady,
          });
        }
      } catch (error) {
        console.error('Error checking app readiness:', error);
        if (mounted) {
          setState({
            isSupabaseReady: true,
            isRouterReady: true,
            isReady: true, // Fail open - don't block the app
          });
        }
      }
    };

    // Initial check
    checkReadiness();

    // Listen for DOM ready state changes
    const handleReadyStateChange = () => {
      if (document.readyState === 'complete') {
        checkReadiness();
      }
    };

    document.addEventListener('readystatechange', handleReadyStateChange);

    // Also check after a short delay to ensure everything is loaded
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setState((prev) => ({
          ...prev,
          isReady: true,
        }));
      }
    }, 1000); // Minimum 1 second delay

    return () => {
      mounted = false;
      document.removeEventListener('readystatechange', handleReadyStateChange);
      clearTimeout(timeoutId);
    };
  }, []);

  return state.isReady;
}
