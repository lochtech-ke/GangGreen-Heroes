import { supabase } from './supabase';
import type {
  User,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  UserRole,
} from '../types/user.types';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
class AuthService {
  /**
   * Register a new user with email and password
   * Profile completion will be handled by the onboarding chatbot
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role || 'individual',
            forest_preference: data.forest_preference,
          },
        },
      });

      if (authError) {
        return { user: null, error: authError };
      }

      if (!authData.user) {
        return {
          user: null,
          error: new Error('User registration failed'),
        };
      }

      // Step 2: Create user record in users table with default role
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: data.email,
        role: data.role || 'individual',
        forest_preference: data.forest_preference,
      });

      if (userError) {
        // Rollback: delete auth user if user record creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: userError };
      }

      // Step 3: Skip profile creation - will be handled by onboarding chatbot
      // Profile will be created when user completes the onboarding flow
      // Only create profile if additional data is provided (for backward compatibility)
      if (data.full_name || data.phone || data.organization || data.location) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: authData.user.id,
          full_name: data.full_name,
          phone: data.phone,
          organization: data.organization,
          location: data.location,
        });

        if (profileError) {
          // Don't fail registration if profile creation fails
          // User can complete profile through onboarding chatbot
          console.warn('Profile creation failed, will be handled by onboarding:', profileError);
        }
      }

      // Step 4: Fetch complete user data
      const user = await this.getCurrentUser();
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Registration failed'),
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (!data.user) {
        return { user: null, error: new Error('Login failed') };
      }

      const user = await this.getCurrentUser();
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Login failed'),
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Logout failed'),
      };
    }
  }

  /**
   * Get current authenticated user with profile data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return null;
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        return null;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        forest_preference: userData.forest_preference,
        created_at: userData.created_at,
        profile: profileData || undefined,
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Password reset request failed'),
      };
    }
  }

  /**
   * Update password with reset token
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Password update failed'),
      };
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'admin');
  }

  /**
   * Check if user is organization
   */
  isOrganization(user: User | null): boolean {
    return this.hasRole(user, 'organization');
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
