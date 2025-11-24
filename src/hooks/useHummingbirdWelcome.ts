import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

/**
 * Hook to manage Hummingbird welcome modal display
 * Shows the welcome modal once for new users who just earned their Hummingbird badge
 */
export function useHummingbirdWelcome(userId: string | undefined) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    checkAndShowWelcome();
  }, [userId]);

  const checkAndShowWelcome = async () => {
    try {
      // Check if user has seen the welcome modal
      const welcomeShownKey = `hummingbird_welcome_shown_${userId}`;
      const hasSeenWelcome = localStorage.getItem(welcomeShownKey);

      if (hasSeenWelcome) {
        setIsLoading(false);
        return;
      }

      // Check if user has the Hummingbird badge
      const { data: earnedBadges, error } = await supabase
        .from('user_earned_badges')
        .select(`
          badge_id,
          earned_at,
          badge_tiers!user_earned_badges_badge_id_fkey (
            name
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('[useHummingbirdWelcome] Error checking badges:', error);
        setIsLoading(false);
        return;
      }

      // Find Hummingbird badge
      const hummingbirdBadge = earnedBadges?.find(
        (badge: any) => badge.badge_tiers?.name === 'Hummingbird'
      );

      if (hummingbirdBadge) {
        // Check if badge was earned recently (within last 5 minutes)
        const earnedAt = new Date(hummingbirdBadge.earned_at);
        const now = new Date();
        const minutesSinceEarned = (now.getTime() - earnedAt.getTime()) / (1000 * 60);

        // Show welcome if badge was earned recently and user hasn't seen it
        if (minutesSinceEarned < 5) {
          setShowWelcome(true);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[useHummingbirdWelcome] Exception:', error);
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    if (userId) {
      // Mark welcome as shown
      const welcomeShownKey = `hummingbird_welcome_shown_${userId}`;
      localStorage.setItem(welcomeShownKey, 'true');
    }
    setShowWelcome(false);
  };

  return {
    showWelcome,
    isLoading,
    handleComplete,
  };
}
