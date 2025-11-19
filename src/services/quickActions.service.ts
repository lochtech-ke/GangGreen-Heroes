import { supabase } from './supabase';

export interface QuickActionPreference {
  user_id: string;
  action_ids: string[];
  updated_at: string;
}

/**
 * Get user's quick action preferences
 */
export async function getQuickActionPreferences(
  userId: string
): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('quick_actions')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return null
        return null;
      }
      throw error;
    }

    return data?.quick_actions || null;
  } catch (error) {
    console.error('Error fetching quick action preferences:', error);
    return null;
  }
}

/**
 * Save user's quick action preferences
 */
export async function saveQuickActionPreferences(
  userId: string,
  actionIds: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          quick_actions: actionIds,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving quick action preferences:', error);
    return false;
  }
}

/**
 * Reset quick action preferences to default
 */
export async function resetQuickActionPreferences(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .update({
        quick_actions: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting quick action preferences:', error);
    return false;
  }
}
