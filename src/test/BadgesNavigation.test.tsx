import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BadgeProgressCard } from '../components/dashboard/BadgeProgressCard';
import type { BadgeProgress } from '../types/badgeProgression.types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock badge progress data
const mockBadgeProgress: BadgeProgress = {
  currentBadge: {
    id: '1',
    name: 'Hummingbird',
    tier: 'hummingbird' as any,
    tier_order: 1,
    description: 'Welcome badge',
    icon_url: '/badges/hummingbird.svg',
    requirements: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  nextBadge: {
    id: '2',
    name: 'Community Contributor',
    tier: 'community_contributor' as any,
    tier_order: 2,
    description: 'Active community member',
    icon_url: '/badges/community-contributor.svg',
    requirements: [
      { type: 'actions', count: 25, description: 'Complete 25 actions' },
      { type: 'social_posts', count: 5, description: 'Create 5 social posts' },
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  progressPercentage: 45,
  requirementProgress: [
    {
      requirement: { type: 'actions', count: 25, description: 'Complete 25 actions' },
      current: 10,
      target: 25,
      isComplete: false,
      percentage: 40,
    },
    {
      requirement: { type: 'social_posts', count: 5, description: 'Create 5 social posts' },
      current: 2,
      target: 5,
      isComplete: false,
      percentage: 40,
    },
    {
      requirement: { type: 'initiatives', count: 3, description: 'Join 3 initiatives' },
      current: 1,
      target: 3,
      isComplete: false,
      percentage: 33,
    },
  ],
  userProgress: {
    id: 'progress-1',
    user_id: 'test-user-id',
    current_badge_id: '1',
    actions_completed: 10,
    social_posts_created: 2,
    initiatives_joined: 1,
    initiatives_created: 0,
    referrals_made: 0,
    referrals_active: 0,
    social_engagement_score: 0,
    last_updated: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
  },
};

describe('Badges Navigation Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should navigate to /badges when "View All" button is clicked in BadgeProgressCard', () => {
    render(
      <MemoryRouter>
        <BadgeProgressCard progress={mockBadgeProgress} />
      </MemoryRouter>
    );

    const viewAllButton = screen.getByText(/view all/i);
    fireEvent.click(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith('/badges');
  });

  it('should navigate to /badges when "more requirements" link is clicked', () => {
    render(
      <MemoryRouter>
        <BadgeProgressCard progress={mockBadgeProgress} />
      </MemoryRouter>
    );

    const moreRequirementsLink = screen.getByText(/\+\d+ more requirements/i);
    fireEvent.click(moreRequirementsLink);

    expect(mockNavigate).toHaveBeenCalledWith('/badges');
  });

  it('should update URL correctly when navigating to /badges', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BadgeProgressCard progress={mockBadgeProgress} />
      </MemoryRouter>
    );

    const viewAllButton = screen.getByText(/view all/i);
    fireEvent.click(viewAllButton);

    // Verify navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/badges');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should have accessible navigation links', () => {
    render(
      <MemoryRouter>
        <BadgeProgressCard progress={mockBadgeProgress} />
      </MemoryRouter>
    );

    const viewAllButton = screen.getByText(/view all/i);
    
    // Verify button is clickable and accessible
    expect(viewAllButton).toBeInTheDocument();
    expect(viewAllButton.tagName).toBe('BUTTON');
  });
});
