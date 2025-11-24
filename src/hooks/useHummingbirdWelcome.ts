import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

/**
 * Hook to manage Hummingbird welcome modal display
 * Shows the welcome modal once for:
 * 1. New users who just earned their Hummingbird badge (within 5 minutes)
 * 2. Existing users who received the badge retroactively (on first login after migration)
 */
export function useHummingbirdWelcome(userId: string | undefined) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetroactive, setIsRetroactive] = useState(false);

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
        const earnedAt = new Date(hummingbirdBadge.earned_at);
        const now = new Date();
        const minutesSinceEarned = (now.getTime() - earnedAt.getTime()) / (1000 * 60);

        // Get user registration date to detect retroactive assignment
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('[useHummingbirdWelcome] Error fetching user data:', userError);
        }

        // Determine if this is a retroactive badge assignment
        // Retroactive if: badge earned_at matches user created_at (set by migration)
        // AND user was created more than 5 minutes ago
        const isRetroactiveBadge = userData && 
          Math.abs(new Date(userData.created_at).getTime() - earnedAt.getTime()) < 1000 && // Within 1 second
          minutesSinceEarned > 5; // User created more than 5 minutes ago

        if (isRetroactiveBadge) {
          // Show welcome for existing users who received badge retroactively
          setIsRetroactive(true);
          setShowWelcome(true);
        } else if (minutesSinceEarned < 5) {
          // Show welcome for new users who just earned the badge
          setIsRetroactive(false);
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
      // Mark welcome as shown in localStorage
      const welcomeShownKey = `hummingbird_welcome_shown_${userId}`;
      localStorage.setItem(welcomeShownKey, 'true');
    }
    setShowWelcome(false);
  };

  return {
    showWelcome,
    isLoading,
    isRetroactive,
    handleComplete,
  };
}
