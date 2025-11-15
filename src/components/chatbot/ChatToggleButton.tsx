import { useState, useEffect } from 'react';

interface ChatToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
  position?: 'bottom-right' | 'bottom-left';
  hasUnreadMessages?: boolean;
  showPulse?: boolean;
}

export function ChatToggleButton({
  onClick,
  isOpen,
  position = 'bottom-right',
  hasUnreadMessages = false,
  showPulse = false,
}: ChatToggleButtonProps) {
  const [shouldPulse, setShouldPulse] = useState(showPulse);

  useEffect(() => {
    // Stop pulsing after first interaction
    if (isOpen) {
      setShouldPulse(false);
      localStorage.setItem('ganggreen_chatbot_interacted', 'true');
    }
  }, [isOpen]);

  useEffect(() => {
    // Check if user has interacted before
    const hasInteracted = localStorage.getItem('ganggreen_chatbot_interacted');
    if (hasInteracted) {
      setShouldPulse(false);
    }
  }, []);

  if (isOpen) {
    return null;
  }

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses} w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-50 ${
        shouldPulse ? 'animate-pulse' : ''
      }`}
      aria-label="Open chat"
    >
      {/* Message Icon */}
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Notification Badge */}
      {hasUnreadMessages && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
