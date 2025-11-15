import { useState, useEffect, useRef } from 'react';
import { chatEngine } from '../../services/chatbot/chatEngine.service';
import type { Message as MessageType, ChatResponse, OnboardingProgress, QuickAction } from '../../types/chatbot.types';
import { Message } from './Message';
import { QuickActions } from './QuickActions';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  autoStartOnboarding?: boolean;
  userId?: string;
  userEmail?: string;
  onOnboardingComplete?: () => void;
  position?: 'bottom-right' | 'bottom-left';
  hasCompletedProfile?: boolean;
}

export function ChatWidget({
  isOpen,
  onToggle,
  autoStartOnboarding = false,
  userId,
  userEmail,
  onOnboardingComplete,
  position = 'bottom-right',
  hasCompletedProfile = false,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat engine and start onboarding if needed
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await chatEngine.initialize();
        setIsInitialized(true);

        // Initialize conversation
        const convId = chatEngine.initializeConversation(
          autoStartOnboarding ? 'onboarding' : 'general',
          userId
        );
        setConversationId(convId);

        // Start onboarding if requested and profile not completed
        if (autoStartOnboarding && userId && userEmail && !hasCompletedProfile) {
          setIsOnboardingMode(true);
          const response = await chatEngine.startOnboarding(userId, userEmail, convId);
          
          const botMessage: MessageType = {
            id: `msg_${Date.now()}`,
            text: response.answer,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages([botMessage]);
          setOnboardingProgress(response.onboardingProgress || null);
          
          // Set quick actions if provided
          if (response.suggestedActions) {
            setQuickActions(response.suggestedActions);
          }
        } else if (autoStartOnboarding && hasCompletedProfile) {
          // Profile already completed, skip onboarding
          console.log('Profile already completed, skipping onboarding');
          onOnboardingComplete?.();
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    if (isOpen && !isInitialized) {
      initializeChat();
    }
  }, [isOpen, autoStartOnboarding, userId, userEmail, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isTyping) {
      return;
    }

    const userMessage: MessageType = {
      id: `msg_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      let response: ChatResponse;

      if (isOnboardingMode) {
        response = await chatEngine.processOnboardingResponse(inputValue, conversationId);
        
        // Update onboarding progress
        if (response.onboardingProgress) {
          setOnboardingProgress(response.onboardingProgress);
        }

        // Check if onboarding is complete
        if (response.isOnboardingComplete) {
          setIsOnboardingMode(false);
          setOnboardingProgress(null);
          
          // Call completion callback after a short delay to show final message
          setTimeout(() => {
            onOnboardingComplete?.();
          }, 2000);
        }
      } else {
        response = await chatEngine.processQuery(inputValue, conversationId);
      }

      const botMessage: MessageType = {
        id: `msg_${Date.now() + 1}`,
        text: response.answer,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          confidence: response.confidence,
          matchedQuestion: response.matchedQuestion,
          escalated: response.requiresEscalation,
        },
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Update quick actions if provided
      if (response.suggestedActions) {
        setQuickActions(response.suggestedActions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: MessageType = {
        id: `msg_${Date.now() + 1}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickActionClick = (action: QuickAction) => {
    setInputValue(action.query);
    // Optionally auto-send the query
    // handleSendMessage();
  };

  if (!isOpen) {
    return null;
  }

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-20 right-4' 
    : 'bottom-20 left-4';

  return (
    <div
      className={`fixed ${positionClasses} w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200`}
    >
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">
              {isOnboardingMode ? 'Profile Setup' : 'Gang Green Assistant'}
            </h3>
            <p className="text-xs text-green-100">
              {isOnboardingMode ? 'Let\'s complete your profile' : 'Here to help'}
            </p>
          </div>
        </div>
        {!isOnboardingMode && (
          <button
            onClick={onToggle}
            className="text-white hover:text-green-100 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Onboarding Progress Bar */}
      {isOnboardingMode && onboardingProgress && (
        <div className="bg-green-50 p-3 border-b border-green-100">
          <div className="flex items-center justify-between text-xs text-green-700 mb-1">
            <span>Profile Completion</span>
            <span>{onboardingProgress.percentComplete}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${onboardingProgress.percentComplete}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isOnboardingMode && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">👋 Hi! How can I help you today?</p>
          </div>
        )}

        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isUser={message.sender === 'user'}
            timestamp={message.timestamp}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isOnboardingMode && quickActions.length > 0 && (
          <div className="mt-4">
            <QuickActions actions={quickActions} onActionClick={handleQuickActionClick} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isOnboardingMode ? 'Type your answer...' : 'Ask me anything...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {isOnboardingMode && (
          <p className="text-xs text-gray-500 mt-2">
            Type "skip" to skip optional fields
          </p>
        )}
      </div>
    </div>
  );
}
