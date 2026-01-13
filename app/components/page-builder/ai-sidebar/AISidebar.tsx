/**
 * AI Sidebar Component
 * 
 * Lovable-style AI sidebar for the GrapeJS page builder.
 * Shows selected element context, chat interface, and quick actions.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, ChevronLeft, Send, Trash2, Loader2 } from 'lucide-react';
import { ContextDisplay } from './ContextDisplay';
import { SuggestionChips } from './SuggestionChips';
import { MessageBubble } from './MessageBubble';
import { ActionPreview } from './ActionPreview';
import { useSelection } from '../hooks/useSelection';
import { useAIChat } from '../hooks/useAIChat';

interface AISidebarProps {
  editor: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({ editor, isOpen, onClose }: AISidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { selectedComponent, hasSelection } = useSelection(editor);
  const {
    messages,
    isLoading,
    pendingResponse,
    sendMessage,
    applyAction,
    rejectAction,
    clearChat,
  } = useAIChat(editor, selectedComponent);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !hasSelection || isLoading) return;
    
    sendMessage(inputValue);
    setInputValue('');
  }, [inputValue, hasSelection, isLoading, sendMessage]);

  // Handle suggestion click
  const handleSuggestion = useCallback((command: string) => {
    if (!hasSelection || isLoading) return;
    sendMessage(command);
  }, [hasSelection, isLoading, sendMessage]);

  if (!isOpen) return null;

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-violet-500 to-emerald-500">
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Ozzyl AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Display */}
      <div className="px-3 py-2 border-b bg-gray-50">
        <ContextDisplay selectedComponent={selectedComponent} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI ভাবছে...</span>
          </div>
        )}

        {/* Action Preview */}
        {pendingResponse && (
          <ActionPreview
            response={pendingResponse}
            onApply={applyAction}
            onReject={rejectAction}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="px-3 py-2 border-t bg-gray-50">
        <div className="text-xs text-gray-500 mb-1.5">💡 Quick Actions:</div>
        <SuggestionChips
          componentType={selectedComponent?.type || null}
          onSelect={handleSuggestion}
          disabled={!hasSelection || isLoading}
        />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              !hasSelection 
                ? "প্রথমে element সিলেক্ট করুন..."
                : "কি পরিবর্তন করবো?"
            }
            disabled={!hasSelection || isLoading}
            className={`
              flex-1 px-3 py-2 text-sm rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-violet-500/50
              ${!hasSelection 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-200'
              }
            `}
          />
          <button
            type="submit"
            disabled={!hasSelection || !inputValue.trim() || isLoading}
            className={`
              px-3 py-2 rounded-lg transition-colors
              ${!hasSelection || !inputValue.trim() || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-violet-500 text-white hover:bg-violet-600 active:scale-95'
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default AISidebar;
