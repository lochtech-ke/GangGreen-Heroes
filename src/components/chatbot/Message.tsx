import ReactMarkdown from 'react-markdown';
import type { Message as MessageType } from '../../types/chatbot.types';

interface MessageProps {
  message: MessageType;
  isUser: boolean;
  timestamp: Date;
}

export function Message({ message, isUser, timestamp }: MessageProps) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message at ${timestamp.toLocaleTimeString()}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
        <p className={`text-xs mt-1 ${isUser ? 'text-green-100' : 'text-gray-500'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {message.metadata?.confidence && message.metadata.confidence < 0.7 && (
          <p className="text-xs mt-1 italic opacity-75">
            I'm not entirely sure about this answer
          </p>
        )}
      </div>
    </div>
  );
}
