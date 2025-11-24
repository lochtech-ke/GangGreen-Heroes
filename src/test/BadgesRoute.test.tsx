import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BadgesPage from '../pages/BadgesPage';
import { Layout } from '../components/layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Mock the auth context
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuthContext: vi.fn(),
  };
});

// Mock the BadgeProgressionView component
vi.mock('../components/badges', () => ({
  BadgeProgressionView: () => <div data-testid="badge-progression-view">Badge Progression</div>,
  HummingbirdWelcome: () => <div data-testid="hummingbird-welcome">Hummingbird Welcome</div>,
}));

// Mock the Layout component
vi.mock('../components/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout-wrapper">
      <nav data-testid="navigation-header">Navigation</nav>
      {children}
    </div>
  ),
}));

// Mock the ProtectedRoute component
vi.mock('../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => {
    const { useAuthContext } = require('../contexts/AuthContext');
    const { user } = useAuthContext();
    
    if (!user) {
      return <div data-testid="redirect-to-login">Redirecting to login...</div>;
    }
    
    return <>{children}</>;
  },
}));

describe('Badges Route Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render BadgesPage component when navigating to /badges', () => {
    const { useAuthContext } = require('../contexts/AuthContext');
    useAuthContext.mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/badges']}>
        <Routes>
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/my badges/i)).toBeInTheDocument();
    expect(screen.getByTestId('badge-progression-view')).toBeInTheDocument();
  });

  it('should wrap BadgesPage in Layout component for consistent navigation', () => {
    const { useAuthContext } = require('../contexts/AuthContext');
    useAuthContext.mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/badges']}>
        <Routes>
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('navigation-header')).toBeInTheDocument();
  });

  it('should redirect unauthenticated users to login page', () => {
    const { useAuthContext } = require('../contexts/AuthContext');
    useAuthContext.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/badges']}>
        <Routes>
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('redirect-to-login')).toBeInTheDocument();
    expect(screen.queryByText(/my badges/i)).not.toBeInTheDocument();
  });

  it('should display badge progression for authenticated users without errors', async () => {
    const { useAuthContext } = require('../contexts/AuthContext');
    useAuthContext.mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/badges']}>
        <Routes>
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('badge-progression-view')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should match /badges route without warnings', () => {
    const { useAuthContext } = require('../contexts/AuthContext');
    useAuthContext.mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/badges']}>
        <Routes>
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/my badges/i)).toBeInTheDocument();
    
    // Check that no "No routes matched location" warning was logged
    const routeWarnings = consoleWarnSpy.mock.calls.filter(
      (call) => call[0]?.includes?.('No routes matched location')
    );
    expect(routeWarnings).toHaveLength(0);
    
    consoleWarnSpy.mockRestore();
  });

  it('should display user badge information when authenticated', () => {
    const { useAuthContext } = require('../contexts/AuthContext');
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      profile: {
        full_name: 'Test User',
      },
    };
    
    useAuthContext.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/badges']}>
        <Routes>
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Layout>
                  <BadgesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/my badges/i)).toBeInTheDocument();
    expect(screen.getByText(/track your community engagement journey/i)).toBeInTheDocument();
    expect(screen.getByTestId('badge-progression-view')).toBeInTheDocument();
  });
});
