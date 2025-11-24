import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Message } from './Message';
import type { Message as MessageType } from '../../types/chatbot.types';

describe('Message', () => {
  const mockTimestamp = new Date('2025-11-15T10:30:00');

  it('renders user message with correct styling', () => {
    const message: MessageType = {
      id: 'msg_1',
      text: 'Hello, chatbot!',
      sender: 'user',
      timestamp: mockTimestamp,
    };

    const { container } = render(
      <Message message={message} isUser={true} timestamp={mockTimestamp} />
    );

    expect(screen.getByText('Hello, chatbot!')).toBeInTheDocument();
    expect(container.querySelector('.bg-green-600')).toBeInTheDocument();
    expect(screen.getByText('10:30 AM')).toBeInTheDocument();
  });

  it('renders bot message with correct styling', () => {
    const message: MessageType = {
      id: 'msg_2',
      text: 'Hello! How can I help you?',
      sender: 'bot',
      timestamp: mockTimestamp,
    };

    const { container } = render(
      <Message message={message} isUser={false} timestamp={mockTimestamp} />
    );

    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    expect(container.querySelector('.bg-gray-100')).toBeInTheDocument();
  });

  it('renders markdown in bot messages', () => {
    const message: MessageType = {
      id: 'msg_3',
      text: '**Bold text** and *italic text*',
      sender: 'bot',
      timestamp: mockTimestamp,
    };

    render(
      <Message message={message} isUser={false} timestamp={mockTimestamp} />
    );

    // ReactMarkdown will convert markdown to HTML elements
    expect(screen.getByText(/Bold text/)).toBeInTheDocument();
  });

  it('displays low confidence disclaimer when confidence is below 70%', () => {
    const message: MessageType = {
      id: 'msg_4',
      text: 'I think this might be the answer...',
      sender: 'bot',
      timestamp: mockTimestamp,
      metadata: {
        confidence: 0.65,
      },
    };

    render(
      <Message message={message} isUser={false} timestamp={mockTimestamp} />
    );

    expect(screen.getByText(/I'm not entirely sure about this answer/)).toBeInTheDocument();
  });

  it('does not display disclaimer when confidence is above 70%', () => {
    const message: MessageType = {
      id: 'msg_5',
      text: 'Here is the answer.',
      sender: 'bot',
      timestamp: mockTimestamp,
      metadata: {
        confidence: 0.85,
      },
    };

    render(
      <Message message={message} isUser={false} timestamp={mockTimestamp} />
    );

    expect(screen.queryByText(/I'm not entirely sure/)).not.toBeInTheDocument();
  });

  it('preserves whitespace in user messages', () => {
    const message: MessageType = {
      id: 'msg_6',
      text: 'Line 1\nLine 2\nLine 3',
      sender: 'user',
      timestamp: mockTimestamp,
    };

    const { container } = render(
      <Message message={message} isUser={true} timestamp={mockTimestamp} />
    );

    const textElement = container.querySelector('.whitespace-pre-wrap');
    expect(textElement).toBeInTheDocument();
  });
});
