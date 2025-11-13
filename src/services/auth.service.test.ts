import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'individual' as const,
      };

      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Mock signUp
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: mockAuthData,
        error: null,
      } as any);

      // Mock database inserts
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      // Mock getCurrentUser
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockAuthData.user },
        error: null,
      } as any);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        role: 'individual',
      });

      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'individual',
            forest_preference: undefined,
          },
        },
      });
    });

    it('should return error when registration fails', async () => {
      const mockError = new Error('Registration failed');

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        role: 'individual',
      });

      expect(result.error).toBe(mockError);
      expect(result.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'individual' as const,
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: {} as any,
        },
        error: null,
      } as any);

      // Mock database queries
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error when login fails', async () => {
      const mockError = new Error('Invalid credentials');

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBe(mockError);
      expect(result.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await authService.logout();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      } as any);

      const result = await authService.requestPasswordReset('test@example.com');

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );
    });
  });

  describe('role checking', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'admin' as const,
      created_at: new Date().toISOString(),
    };

    it('should correctly check if user has specific role', () => {
      expect(authService.hasRole(mockUser, 'admin')).toBe(true);
      expect(authService.hasRole(mockUser, 'organization')).toBe(false);
    });

    it('should correctly check if user has any of specified roles', () => {
      expect(authService.hasAnyRole(mockUser, ['admin', 'organization'])).toBe(true);
      expect(authService.hasAnyRole(mockUser, ['community', 'individual'])).toBe(false);
    });

    it('should correctly identify admin users', () => {
      expect(authService.isAdmin(mockUser)).toBe(true);
      expect(authService.isAdmin({ ...mockUser, role: 'individual' })).toBe(false);
    });

    it('should correctly identify organization users', () => {
      const orgUser = { ...mockUser, role: 'organization' as const };
      expect(authService.isOrganization(orgUser)).toBe(true);
      expect(authService.isOrganization(mockUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(authService.hasRole(null, 'admin')).toBe(false);
      expect(authService.hasAnyRole(null, ['admin'])).toBe(false);
      expect(authService.isAdmin(null)).toBe(false);
      expect(authService.isOrganization(null)).toBe(false);
    });
  });
});
