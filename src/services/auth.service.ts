import { supabase } from './supabase';
import { userCache } from './userCache';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import { checkSupabaseHealth } from '../utils/supabaseHealth';
import { categorizeAuthError } from '../types/authError.types';
import type {
  User,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  UserRole,
  UserProfile,
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
   * Enhanced with retry logic, health checks, and error categorization
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const start = performance.now();

    try {
      console.log('[AuthService] Starting registration...', {
        email: data.email,
      });

      // Check service health first
      const isHealthy = await checkSupabaseHealth();
      if (!isHealthy) {
        console.warn('[AuthService] Service health check failed');
        return {
          user: null,
          error: new Error(
            'Service temporarily unavailable. Please try again in a few moments.'
          ),
        };
      }

      // Step 1: Create auth user with retry logic
      // Note: User record in 'users' table is automatically created by database trigger
      const { data: authData, error: authError } = await withRetry(
        () =>
          supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                role: data.role || 'individual',
                forest_preference: data.forest_preference,
              },
            },
          }),
        DEFAULT_RETRY_CONFIG,
        'signUp'
      );

      console.log('[AuthService] SignUp response:', { authData, authError });

      if (authError) {
        const enhancedError = categorizeAuthError(authError);
        console.error('[AuthService] SignUp error:', {
          type: enhancedError.type,
          message: enhancedError.message,
          retryable: enhancedError.retryable,
        });
        return {
          user: null,
          error: new Error(enhancedError.userMessage),
        };
      }

      if (!authData.user) {
        console.error('[AuthService] No user in auth data');
        return {
          user: null,
          error: new Error('User registration failed. Please try again.'),
        };
      }

      console.log('[AuthService] Auth user created:', authData.user.id);

      // Step 2: Skip profile creation - will be handled by onboarding chatbot
      // Profile will be created when user completes the onboarding flow
      // Only create profile if additional data is provided (for backward compatibility)
      if (data.full_name || data.phone || data.organization || data.location) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            full_name: data.full_name,
            phone: data.phone,
            organization: data.organization,
            location: data.location,
          });

        if (profileError) {
          // Don't fail registration if profile creation fails
          // User can complete profile through onboarding chatbot
          console.warn(
            'Profile creation failed, will be handled by onboarding:',
            profileError
          );
        }
      }

      // Step 3: Fetch complete user data
      console.log('[AuthService] Fetching complete user data...');
      const user = await this.getCurrentUser();
      console.log('[AuthService] User data fetched:', user);

      const duration = performance.now() - start;
      console.log(
        `[AuthService] Registration completed in ${duration.toFixed(2)}ms`
      );

      if (duration > 1000) {
        console.warn(
          `[AuthService] Slow registration detected: ${duration.toFixed(2)}ms`
        );
      }

      return { user, error: null };
    } catch (error) {
      const duration = performance.now() - start;
      const enhancedError = categorizeAuthError(error);
      console.error('[AuthService] Registration exception:', {
        type: enhancedError.type,
        message: enhancedError.message,
        duration: `${duration.toFixed(2)}ms`,
      });
      return {
        user: null,
        error: new Error(enhancedError.userMessage),
      };
    }
  }

  /**
   * Login with email and password
   * Enhanced with retry logic, health checks, and error categorization
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const start = performance.now();

    try {
      console.log('[AuthService] Starting login for:', credentials.email);

      // Run health check in background without blocking login
      checkSupabaseHealth().then(isHealthy => {
        if (!isHealthy) {
          console.warn('[AuthService] Health check failed (background check)');
        } else {
          console.log('[AuthService] Health check passed (background check)');
        }
      }).catch(err => {
        console.warn('[AuthService] Health check error (background check):', err);
      });

      // Attempt login with retry logic
      const { data, error } = await withRetry(
        () =>
          supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          }),
        DEFAULT_RETRY_CONFIG,
        'signInWithPassword'
      );

      if (error) {
        const enhancedError = categorizeAuthError(error);
        console.error('[AuthService] Login error:', {
          type: enhancedError.type,
          message: enhancedError.message,
          retryable: enhancedError.retryable,
        });
        return {
          user: null,
          error: new Error(enhancedError.userMessage),
        };
      }

      if (!data.user) {
        console.error('[AuthService] No user in response');
        return {
          user: null,
          error: new Error('Login failed. Please try again.'),
        };
      }

      console.log('[AuthService] Auth successful, fetching user data...');
      const user = await this.getCurrentUser();
      console.log('[AuthService] User data retrieved:', !!user);

      const duration = performance.now() - start;
      console.log(`[AuthService] Login completed in ${duration.toFixed(2)}ms`);

      if (duration > 1000) {
        console.warn(
          `[AuthService] Slow login detected: ${duration.toFixed(2)}ms`
        );
      }

      return { user, error: null };
    } catch (error) {
      const duration = performance.now() - start;
      const enhancedError = categorizeAuthError(error);
      console.error('[AuthService] Login exception:', {
        type: enhancedError.type,
        message: enhancedError.message,
        duration: `${duration.toFixed(2)}ms`,
      });
      return {
        user: null,
        error: new Error(enhancedError.userMessage),
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      // Clear cache on logout
      userCache.clear();
      console.log('[AuthService] User cache cleared on logout');

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Logout failed'),
      };
    }
  }

  /**
   * Get current authenticated user with profile data
   * Optimized with single JOIN query, caching, and retry logic
   */
  async getCurrentUser(): Promise<User | null> {
    const start = performance.now();

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        console.log('[AuthService] No auth user found');
        return null;
      }

      // Check cache first
      const cached = userCache.get(authUser.id);
      if (cached) {
        const duration = performance.now() - start;
        console.log(
          `[AuthService] User served from cache (${duration.toFixed(2)}ms)`
        );
        return cached;
      }

      console.log('[AuthService] Cache miss, fetching from database');

      // Single query with JOIN to fetch user and profile data, with retry logic
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('users')
            .select(`
              *,
              user_profiles (*)
            `)
            .eq('id', authUser.id)
            .maybeSingle();

          // Throw error if query failed to trigger retry
          if (response.error) {
            throw response.error;
          }

          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getCurrentUser'
      );

      const { data, error } = result;

      if (error) {
        console.error('[AuthService] Failed to fetch user data:', error);
        return null;
      }

      if (!data) {
        console.error('[AuthService] No user data found for ID:', authUser.id);
        return null;
      }

      // Transform the response to match User type
      const user = this.transformUserData(data);

      // Cache the result
      userCache.set(authUser.id, user);

      const duration = performance.now() - start;
      console.log(
        `[AuthService] getCurrentUser completed in ${duration.toFixed(2)}ms`
      );

      if (duration > 1000) {
        console.warn(
          `[AuthService] Slow query detected: ${duration.toFixed(2)}ms`
        );
      }

      return user;
    } catch (error) {
      const duration = performance.now() - start;
      console.error('[AuthService] Error fetching current user:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration.toFixed(2)}ms`,
      });
      return null;
    }
  }

  /**
   * Transform database response to User type
   * Handles the joined user_profiles data
   */
  private transformUserData(data: any): User {
    console.log('[AuthService] Transforming user data:', JSON.stringify(data, null, 2));

    // Extract profile data (Supabase returns joined data as array or object)
    let profile: UserProfile | undefined;

    if (data.user_profiles) {
      // Handle both array and object responses
      const profileData = Array.isArray(data.user_profiles)
        ? data.user_profiles[0]
        : data.user_profiles;

      if (profileData) {
        profile = {
          full_name: profileData.full_name,
          phone: profileData.phone,
          organization: profileData.organization,
          location: profileData.location,
          avatar_url: profileData.avatar_url,
        };
      }
    }

    const user: User = {
      id: data.id,
      email: data.email,
      role: data.role,
      forest_preference: data.forest_preference,
      created_at: data.created_at,
      profile,
    };

    console.log('[AuthService] Transformed user:', JSON.stringify(user, null, 2));
    return user;
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
    return supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      // Clear cache on sign out or token refresh
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        userCache.clear();
        console.log(`[AuthService] Cache cleared on ${event}`);
      }

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
