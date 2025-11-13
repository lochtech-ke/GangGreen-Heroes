import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthContext } from '../contexts/AuthContext';
import type { LoginCredentials, RegisterData, UserRole } from '../types/user.types';

interface UseAuthReturn {
  user: ReturnType<typeof useAuthContext>['user'];
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isOrganization: () => boolean;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, loading: contextLoading, isAuthenticated, refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { user: loggedInUser, error } = await authService.login(credentials);
      
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (loggedInUser) {
        await refreshUser();
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const { user: registeredUser, error } = await authService.register(data);
      
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (registeredUser) {
        await refreshUser();
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      await refreshUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await authService.requestPasswordReset(email);
      
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    try {
      const { error } = await authService.updatePassword(newPassword);
      
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return authService.hasRole(user, role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authService.hasAnyRole(user, roles);
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin(user);
  };

  const isOrganization = (): boolean => {
    return authService.isOrganization(user);
  };

  return {
    user,
    loading: loading || contextLoading,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    hasRole,
    hasAnyRole,
    isAdmin,
    isOrganization,
    refreshUser,
  };
}
