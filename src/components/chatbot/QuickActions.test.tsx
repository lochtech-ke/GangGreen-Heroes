import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickActions } from './QuickActions';
import type { QuickAction } from '../../types/chatbot.types';

describe('QuickActions', () => {
  const mockActions: QuickAction[] = [
    {
      id: 'action_1',
      label: 'Getting Started',
      query: 'How do I get started?',
      category: 'getting-started',
    },
    {
      id: 'action_2',
      label: 'Find Projects',
      query: 'How can I find projects?',
      category: 'projects',
    },
    {
      id: 'action_3',
      label: 'Contact Support',
      query: 'I need help from support',
      category: 'support',
    },
  ];

  it('renders all quick action buttons', () => {
    const mockOnClick = vi.fn();

    render(<QuickActions actions={mockActions} onActionClick={mockOnClick} />);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Find Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('calls onActionClick when button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(<QuickActions actions={mockActions} onActionClick={mockOnClick} />);

    const button = screen.getByText('Getting Started');
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledWith(mockActions[0]);
  });

  it('renders nothing when actions array is empty', () => {
    const mockOnClick = vi.fn();
    const { container } = render(<QuickActions actions={[]} onActionClick={mockOnClick} />);

    expect(container.firstChild).toBeNull();
  });

  it('displays suggested actions label', () => {
    const mockOnClick = vi.fn();

    render(<QuickActions actions={mockActions} onActionClick={mockOnClick} />);

    expect(screen.getByText('Suggested actions:')).toBeInTheDocument();
  });

  it('applies correct styling to buttons', () => {
    const mockOnClick = vi.fn();
    const { container } = render(<QuickActions actions={mockActions} onActionClick={mockOnClick} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    
    buttons.forEach(button => {
      expect(button.className).toContain('border-green-500');
      expect(button.className).toContain('text-green-700');
    });
  });

  it('renders buttons in a grid layout', () => {
    const mockOnClick = vi.fn();
    const { container } = render(<QuickActions actions={mockActions} onActionClick={mockOnClick} />);

    const grid = container.querySelector('.grid-cols-2');
    expect(grid).toBeInTheDocument();
  });
});
