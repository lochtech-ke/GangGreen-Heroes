import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { supabase } from './supabase';
import { hummingbirdBadgeService } from './hummingbirdBadge.service';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock Hummingbird Badge Service
vi.mock('./hummingbirdBadge.service', () => ({
  hummingbirdBadgeService: {
    createDefaultHummingbirdConfig: vi.fn(),
    generateHummingbirdBadge: vi.fn(),
  },
}));

describe('AuthService - Hummingbird Badge Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call hummingbird badge generation during registration', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'individual' as const,
    };

    const mockAuthData = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    // Mock successful auth
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: mockAuthData,
      error: null,
    } as any);

    // Mock database operations
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              ...mockUser,
              user_profiles: null,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockAuthData.user },
      error: null,
    } as any);

    // Mock successful badge generation
    const mockBadgeConfig = {
      id: 'hummingbird-welcome-user-123',
      tier: 'bronze',
      forest: 'kakamega',
      achievement: 'welcome_badge',
      metadata: {
        badgeName: 'Hummingbird Welcome Badge',
        userId: 'user-123',
        forestName: 'Kakamega Forest',
      },
    };

    vi.mocked(hummingbirdBadgeService.createDefaultHummingbirdConfig).mockReturnValue(mockBadgeConfig as any);
    vi.mocked(hummingbirdBadgeService.generateHummingbirdBadge).mockResolvedValue({
      success: true,
      svg: '<svg>mock hummingbird badge</svg>',
      metadata: mockBadgeConfig.metadata,
    });

    // Test registration
    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'individual',
      forest_preference: 'kakamega',
    });

    // Verify registration succeeded
    expect(result.error).toBeNull();

    // Verify badge generation was called
    expect(hummingbirdBadgeService.createDefaultHummingbirdConfig).toHaveBeenCalledWith(
      'user-123',
      'bronze',
      'kakamega'
    );
    expect(hummingbirdBadgeService.generateHummingbirdBadge).toHaveBeenCalledWith(mockBadgeConfig);

    // Verify database operations were called
    expect(mockFrom).toHaveBeenCalledWith('nft_badges');
    expect(mockFrom).toHaveBeenCalledWith('notifications');
  });

  it('should handle badge generation failure gracefully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'individual' as const,
    };

    const mockAuthData = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    // Mock successful auth
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: mockAuthData,
      error: null,
    } as any);

    // Mock database operations
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              ...mockUser,
              user_profiles: null,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom as any);
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockAuthData.user },
      error: null,
    } as any);

    // Mock badge generation failure
    vi.mocked(hummingbirdBadgeService.createDefaultHummingbirdConfig).mockImplementation(() => {
      throw new Error('Badge generation failed');
    });

    // Test registration
    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'individual',
      forest_preference: 'kakamega',
    });

    // Registration should still succeed even if badge generation fails
    expect(result.error).toBeNull();
    expect(result.user).toBeTruthy();

    // Verify fallback notification was attempted
    expect(mockFrom).toHaveBeenCalledWith('notifications');
  });
});