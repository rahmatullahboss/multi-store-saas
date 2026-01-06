/**
 * AI Chat Widget
 * 
 * Floating chat bubble for both:
 * - Merchant Co-pilot (Dashboard)
 * - Customer Sales Agent (Storefront)
 * 
 * Features:
 * - sessionStorage persistence (survives page reload)
 * - i18n support (Bengali/English)
 * - Thinking indicator
 * - Customizable accent color
 */

import { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from '~/contexts/LanguageContext';
import { MessageCircle, X, Send, Loader2, User, Bot } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatWidgetProps {
  mode: 'merchant' | 'customer';
  storeId?: number;
  welcomeMessage?: string;
  accentColor?: string;
}

// ============================================================================
// STORAGE KEY
// ============================================================================
const getStorageKey = (mode: string, storeId?: number) => 
  `ai_chat_${mode}_${storeId || 'default'}`;

// ============================================================================
// COMPONENT
// ============================================================================
export function ChatWidget({
  mode,
  storeId,
  welcomeMessage,
  accentColor = '#6366f1', // Indigo default
}: ChatWidgetProps) {
  const { t, lang } = useTranslation();
  const fetcher = useFetcher<{ success?: boolean; response?: string; error?: string }>();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = fetcher.state === 'submitting';
  
  // Use lang for language checks
  const language = lang;

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const storageKey = getStorageKey(mode, storeId);
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, [mode, storeId]);

  // Save messages to sessionStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = getStorageKey(mode, storeId);
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, mode, storeId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle AI response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.response) {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fetcher.data.response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  }, [fetcher.data]);

  // Send message
  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Send to API
    fetcher.submit(
      { message: input.trim(), storeId: storeId || '' },
      { method: 'POST', action: '/api/chat', encType: 'application/json' }
    );
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const handleClear = () => {
    setMessages([]);
    const storageKey = getStorageKey(mode, storeId);
    sessionStorage.removeItem(storageKey);
  };

  // Default welcome messages
  const defaultWelcome = mode === 'merchant'
    ? language === 'bn' 
      ? 'আসসালামু আলাইকুম! 👋 আমি আপনার AI সহকারী। কিভাবে সাহায্য করতে পারি?'
      : 'Hello! 👋 I\'m your AI assistant. How can I help you today?'
    : language === 'bn'
      ? 'আসসালামু আলাইকুম! 👋 কিভাবে সাহায্য করতে পারি?'
      : 'Hello! 👋 How can I help you today?';

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110"
          style={{ backgroundColor: accentColor }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          
          {/* Pulse animation */}
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {mode === 'merchant' 
                    ? (language === 'bn' ? 'AI সহকারী' : 'AI Assistant')
                    : (language === 'bn' ? 'সেলস সহায়তা' : 'Sales Support')
                  }
                </h3>
                <p className="text-xs opacity-80">
                  {language === 'bn' ? 'সাধারণত কয়েক সেকেন্ডে উত্তর দেয়' : 'Usually replies in seconds'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                  <p className="text-sm text-gray-700">{welcomeMessage || defaultWelcome}</p>
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-600' : ''
                  }`}
                  style={msg.role === 'assistant' ? { backgroundColor: accentColor } : {}}
                >
                  {msg.role === 'user' 
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-white" />
                  }
                </div>
                <div 
                  className={`rounded-2xl px-4 py-3 shadow-sm max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-gray-600 text-white rounded-tr-none'
                      : 'bg-white rounded-tl-none'
                  }`}
                >
                  <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {language === 'bn' ? 'চিন্তা করছি...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {fetcher.data?.error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {fetcher.data.error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Type your message...'}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: accentColor }}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Clear chat button */}
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {language === 'bn' ? 'চ্যাট মুছে ফেলুন' : 'Clear chat'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
