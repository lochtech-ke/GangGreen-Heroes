import { supabase } from './supabase';
import type { UserProfile, ForestPreference } from '../types/user.types';

/**
 * User Profile Service
 * Handles user profile management, updates, and avatar uploads
 */

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  organization?: string;
  location?: string;
  avatar_url?: string;
}

export interface ProfileResponse {
  profile: UserProfile | null;
  error: Error | null;
}

export interface AvatarUploadResponse {
  url: string | null;
  error: Error | null;
}

class ProfileService {
  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error };
      }

      return { profile: data, error: null };
    } catch (error) {
      return {
        profile: null,
        error: error instanceof Error ? error : new Error('Failed to fetch profile'),
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: UpdateProfileData
  ): Promise<ProfileResponse> {
    try {
      // Validate updates
      const validationError = this.validateProfileData(updates);
      if (validationError) {
        return { profile: null, error: validationError };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { profile: null, error };
      }

      return { profile: data, error: null };
    } catch (error) {
      return {
        profile: null,
        error: error instanceof Error ? error : new Error('Failed to update profile'),
      };
    }
  }

  /**
   * Update user forest preference
   */
  async updateForestPreference(
    userId: string,
    forestPreference: ForestPreference
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          forest_preference: forestPreference,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return { error };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error('Failed to update forest preference'),
      };
    }
  }

  /**
   * Upload avatar image to Supabase Storage
   */
  async uploadAvatar(userId: string, file: File): Promise<AvatarUploadResponse> {
    try {
      // Validate file
      const validationError = this.validateAvatarFile(file);
      if (validationError) {
        return { url: null, error: validationError };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { url: null, error: uploadError };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await this.updateProfile(userId, {
        avatar_url: publicUrl,
      });

      if (updateError) {
        return { url: null, error: updateError };
      }

      return { url: publicUrl, error: null };
    } catch (error) {
      return {
        url: null,
        error: error instanceof Error ? error : new Error('Failed to upload avatar'),
      };
    }
  }

  /**
   * Delete avatar image
   */
  async deleteAvatar(userId: string, avatarUrl: string): Promise<{ error: Error | null }> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        return { error: deleteError };
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await this.updateProfile(userId, {
        avatar_url: undefined,
      });

      return { error: updateError };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Failed to delete avatar'),
      };
    }
  }

  /**
   * Validate profile data
   */
  private validateProfileData(data: UpdateProfileData): Error | null {
    if (data.full_name !== undefined) {
      if (!data.full_name || data.full_name.trim().length === 0) {
        return new Error('Full name cannot be empty');
      }
      if (data.full_name.length > 100) {
        return new Error('Full name must be less than 100 characters');
      }
    }

    if (data.phone !== undefined && data.phone) {
      // Basic phone validation (can be enhanced)
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(data.phone)) {
        return new Error('Invalid phone number format');
      }
    }

    if (data.organization !== undefined && data.organization) {
      if (data.organization.length > 200) {
        return new Error('Organization name must be less than 200 characters');
      }
    }

    if (data.location !== undefined && data.location) {
      if (data.location.length > 200) {
        return new Error('Location must be less than 200 characters');
      }
    }

    return null;
  }

  /**
   * Validate avatar file
   */
  private validateAvatarFile(file: File): Error | null {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return new Error('File size must be less than 5MB');
    }

    return null;
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompleteness(profile: UserProfile): number {
    const fields = ['full_name', 'phone', 'organization', 'location', 'avatar_url'];
    const filledFields = fields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((filledFields.length / fields.length) * 100);
  }
}

// Export singleton instance
export const profileService = new ProfileService();
