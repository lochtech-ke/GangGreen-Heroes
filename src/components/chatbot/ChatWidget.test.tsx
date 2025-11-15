import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from './ChatWidget';
import { chatEngine } from '../../services/chatbot/chatEngine.service';

// Mock the chat engine
vi.mock('../../services/chatbot/chatEngine.service', () => ({
  chatEngine: {
    initialize: vi.fn().mockResolvedValue(undefined),
    initializeConversation: vi.fn().mockReturnValue('conv_123'),
    startOnboarding: vi.fn().mockResolvedValue({
      answer: 'Welcome! Let\'s complete your profile.',
      confidence: 100,
      requiresEscalation: false,
      onboardingProgress: {
        currentStep: 'welcome',
        totalSteps: 7,
        completedSteps: 0,
        percentComplete: 0,
      },
      isOnboardingComplete: false,
    }),
    processQuery: vi.fn().mockResolvedValue({
      answer: 'Here is the answer to your question.',
      confidence: 0.9,
      requiresEscalation: false,
    }),
    processOnboardingResponse: vi.fn().mockResolvedValue({
      answer: 'Great! Next question...',
      confidence: 100,
      requiresEscalation: false,
      onboardingProgress: {
        currentStep: 'full_name',
        totalSteps: 7,
        completedSteps: 1,
        percentComplete: 14,
      },
      isOnboardingComplete: false,
    }),
  },
}));

describe('ChatWidget', () => {
  const mockOnToggle = vi.fn();
  const mockOnOnboardingComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Gang Green Assistant')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ChatWidget
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('initializes onboarding mode when autoStartOnboarding is true', async () => {
    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
        autoStartOnboarding={true}
        userId="user_123"
        userEmail="test@example.com"
        onOnboardingComplete={mockOnOnboardingComplete}
      />
    );

    await waitFor(() => {
      expect(chatEngine.startOnboarding).toHaveBeenCalledWith(
        'user_123',
        'test@example.com',
        'conv_123'
      );
    });

    expect(screen.getByText('Profile Setup')).toBeInTheDocument();
    expect(screen.getByText(/Welcome! Let's complete your profile/)).toBeInTheDocument();
  });

  it('displays onboarding progress bar in onboarding mode', async () => {
    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
        autoStartOnboarding={true}
        userId="user_123"
        userEmail="test@example.com"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Completion')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('sends message when user types and presses Enter', async () => {
    const user = userEvent.setup();
    
    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    await waitFor(() => {
      expect(chatEngine.initialize).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText('Ask me anything...');
    await user.type(input, 'How do I get started?{Enter}');

    await waitFor(() => {
      expect(chatEngine.processQuery).toHaveBeenCalledWith(
        'How do I get started?',
        'conv_123'
      );
    });
  });

  it('disables close button during onboarding', async () => {
    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
        autoStartOnboarding={true}
        userId="user_123"
        userEmail="test@example.com"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Setup')).toBeInTheDocument();
    });

    // Close button should not be present in onboarding mode
    const closeButton = screen.queryByLabelText('Close chat');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('calls onOnboardingComplete when onboarding is finished', async () => {
    const user = userEvent.setup();
    
    vi.mocked(chatEngine.processOnboardingResponse).mockResolvedValueOnce({
      answer: 'Profile complete! Welcome to Gang Green.',
      confidence: 100,
      requiresEscalation: false,
      isOnboardingComplete: true,
      onboardingProgress: {
        currentStep: 'complete',
        totalSteps: 7,
        completedSteps: 7,
        percentComplete: 100,
      },
    });

    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
        autoStartOnboarding={true}
        userId="user_123"
        userEmail="test@example.com"
        onOnboardingComplete={mockOnOnboardingComplete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Setup')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your answer...');
    await user.type(input, 'John Doe{Enter}');

    await waitFor(() => {
      expect(mockOnOnboardingComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('skips onboarding if profile is already completed', async () => {
    render(
      <ChatWidget
        isOpen={true}
        onToggle={mockOnToggle}
        autoStartOnboarding={true}
        userId="user_123"
        userEmail="test@example.com"
        hasCompletedProfile={true}
        onOnboardingComplete={mockOnOnboardingComplete}
      />
    );

    await waitFor(() => {
      expect(chatEngine.startOnboarding).not.toHaveBeenCalled();
      expect(mockOnOnboardingComplete).toHaveBeenCalled();
    });
  });
});
