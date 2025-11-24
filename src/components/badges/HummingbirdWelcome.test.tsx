
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HummingbirdWelcome } from './HummingbirdWelcome';
import { useAuthContext } from '../../contexts/AuthContext';
import * as hummingbirdService from '../../services/hummingbirdBadge.service';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

// Mock the hummingbird badge service
vi.mock('../../services/hummingbirdBadge.service', () => ({
  generateSocialMediaBadge: vi.fn(),
  getSocialMediaText: vi.fn(),
  generateWelcomeBadge: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('HummingbirdWelcome', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    profile: {
      full_name: 'Test User',
    },
  };

  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthContext as any).mockReturnValue({ user: mockUser });
    (hummingbirdService.getSocialMediaText as any).mockReturnValue(
      'Just joined the #GangGreen community and earned my Hummingbird Welcome Badge! 🌱✨ Join us in making Africa carbon-negative! #GangGreen #CommunityEngagement #Sustainability #WangariMaathai'
    );
    (hummingbirdService.generateWelcomeBadge as any).mockResolvedValue({
      success: true,
      svg: '<svg><circle cx="50" cy="50" r="40" fill="green" /></svg>',
    });
    (hummingbirdService.generateSocialMediaBadge as any).mockResolvedValue(
      new Blob(['mock-image'], { type: 'image/png' })
    );
  });

  it('renders welcome modal when open', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Welcome to #GangGreen!')).toBeInTheDocument();
    expect(screen.getByText(/You've earned your first badge: The Hummingbird/)).toBeInTheDocument();
    expect(screen.getByText(/Join thousands making Africa carbon-negative/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<HummingbirdWelcome isOpen={false} onComplete={mockOnComplete} />);
    
    expect(screen.queryByText('Welcome to #GangGreen!')).not.toBeInTheDocument();
  });

  it('displays the hummingbird story', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    expect(screen.getByText('The Hummingbird Story')).toBeInTheDocument();
    expect(screen.getByText(/One day a terrible fire broke out in a forest/)).toBeInTheDocument();
    expect(screen.getByText(/I'm doing the best I can/)).toBeInTheDocument();
  });

  it('shows platform introduction with statistics', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Welcome to Africa\'s Carbon-Negative Movement')).toBeInTheDocument();
    expect(screen.getByText('50K+')).toBeInTheDocument();
    expect(screen.getByText('Trees Planted')).toBeInTheDocument();
    expect(screen.getByText('1.2K+')).toBeInTheDocument();
    expect(screen.getByText('Active Members')).toBeInTheDocument();
  });

  it('displays next steps for user journey', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Your Journey Starts Here:')).toBeInTheDocument();
    expect(screen.getByText(/Complete micro-challenges and earn GG Coins/)).toBeInTheDocument();
    expect(screen.getByText(/Join forest conservation initiatives/)).toBeInTheDocument();
    expect(screen.getByText(/Connect with local environmental champions/)).toBeInTheDocument();
  });

  it('calls onComplete when Begin My Journey is clicked', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    const beginButton = screen.getByText('Begin My Journey');
    fireEvent.click(beginButton);
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('shows sharing options when Share My Badge is clicked', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    const shareButton = screen.getByText('Share My Badge');
    fireEvent.click(shareButton);
    
    expect(screen.getByText('Share your Hummingbird Badge')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('handles social media sharing with #GangGreen hashtag', async () => {
    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    // Click share button to show sharing options
    const shareButton = screen.getByText('Share My Badge');
    fireEvent.click(shareButton);
    
    // Click Twitter share
    const twitterButton = screen.getByText('Twitter');
    fireEvent.click(twitterButton);
    
    await waitFor(() => {
      expect(hummingbirdService.generateSocialMediaBadge).toHaveBeenCalledWith(
        mockUser.id,
        'twitter',
        {
          format: 'png',
          tier: 'bronze',
          forest: 'kakamega'
        }
      );
    });

    await waitFor(() => {
      expect(hummingbirdService.getSocialMediaText).toHaveBeenCalledWith('twitter', mockUser.profile.full_name);
    });

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400'
      );
    });
  });

  it('copies share text to clipboard', async () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    // Click share button to show sharing options
    const shareButton = screen.getByText('Share My Badge');
    fireEvent.click(shareButton);
    
    // Click copy text button
    const copyButton = screen.getByText('Copy Share Text');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('#GangGreen')
      );
    });

    // Should show "Copied!" feedback
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('handles Instagram sharing with clipboard copy', async () => {
    // Mock alert
    const mockAlert = vi.fn();
    Object.defineProperty(window, 'alert', { value: mockAlert });

    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    // Click share button to show sharing options
    const shareButton = screen.getByText('Share My Badge');
    fireEvent.click(shareButton);
    
    // Click Instagram share
    const instagramButton = screen.getByText('Instagram');
    fireEvent.click(instagramButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        'Text copied to clipboard! Open Instagram and paste to share your badge.'
      );
    });
  });

  it('closes modal when close button is clicked', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('closes modal when backdrop is clicked', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    // Click on the backdrop (the first div with the backdrop class)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    }
  });

  it('generates and displays hummingbird badge preview', async () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      expect(hummingbirdService.generateWelcomeBadge).toHaveBeenCalledWith(
        mockUser.id,
        {
          tier: 'bronze',
          forest: 'kakamega',
          optimized: true
        }
      );
    });
  });

  it('shows loading state while generating badge preview', () => {
    (hummingbirdService.generateWelcomeBadge as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('falls back to icon when badge generation fails', async () => {
    (hummingbirdService.generateWelcomeBadge as any).mockRejectedValue(
      new Error('Badge generation failed')
    );

    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      // Should show fallback Award icon
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('includes pre-populated social media text with #GangGreen branding', () => {
    render(<HummingbirdWelcome isOpen={true} onComplete={mockOnComplete} />);
    
    // Click share button to show sharing options
    const shareButton = screen.getByText('Share My Badge');
    fireEvent.click(shareButton);
    
    // Click copy text to trigger getSocialMediaText
    const copyButton = screen.getByText('Copy Share Text');
    fireEvent.click(copyButton);
    
    expect(hummingbirdService.getSocialMediaText).toHaveBeenCalledWith('twitter', mockUser.profile.full_name);
  });
});