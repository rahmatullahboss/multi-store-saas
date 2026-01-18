/**
 * Message Bubble Component
 * 
 * Renders a single chat message in the AI sidebar.
 */

import { memo } from 'react';
import { User, Bot, Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import type { ChatMessage } from '~/lib/grapesjs/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubbleComponent({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Status indicator
  const getStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />;
      case 'success':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'preview':
        return <Eye className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-emerald-100' : 'bg-violet-100'}
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-emerald-600" />
        ) : (
          <Bot className="w-4 h-4 text-violet-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`
        max-w-[85%] rounded-lg px-3 py-2 text-sm
        ${isUser 
          ? 'bg-emerald-500 text-white' 
          : message.status === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : message.status === 'preview'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-800'
        }
      `}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {/* Context badge */}
        {message.context && isUser && (
          <div className="mt-1 pt-1 border-t border-white/20 text-xs opacity-75">
            🎯 {message.context.selectedElementType}
          </div>
        )}

        {/* Status */}
        {isAssistant && (
          <div className="flex items-center gap-1 mt-1 text-xs opacity-60">
            {getStatusIcon()}
            <span>
              {message.status === 'preview' && 'Preview'}
              {message.status === 'pending' && 'Thinking...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
