/**
 * Message Bubble Component
 * 
 * Renders individual chat messages with proper styling
 * and optional revert button for AI messages.
 */

import { Bot, User, RotateCcw } from 'lucide-react';
import type { ChatMessage } from '~/lib/grapesjs/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onRevert?: () => void;
  showRevert?: boolean;
}

export default function MessageBubble({ message, onRevert, showRevert = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isPending = message.status === 'pending';

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('bn-BD', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm
        ${isUser ? 'bg-gray-200' : 'bg-indigo-100 text-indigo-600'}
      `}>
        {isUser ? (
          <User size={12} className="text-gray-500" />
        ) : (
          <Bot size={14} />
        )}
      </div>
      
      {/* Message Content */}
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className={`
          rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
          ${isUser 
            ? 'bg-gray-900 text-white rounded-tr-sm' 
            : isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
              : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
          }
          ${isPending ? 'opacity-70' : ''}
        `}>
          {message.content}
        </div>
        
        {/* Footer: Revert button & timestamp */}
        <div className="flex items-center gap-2">
          {showRevert && onRevert && message.role === 'assistant' && !isError && (
            <button
              onClick={onRevert}
              className="
                flex items-center gap-1 text-[10px] text-gray-400 
                hover:text-red-500 transition-colors 
                px-2 py-1 rounded hover:bg-red-50
              "
              title="এই পর্যন্ত ফিরে যান"
            >
              <RotateCcw size={10} />
              <span>Revert</span>
            </button>
          )}
          <span className="text-[9px] text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
