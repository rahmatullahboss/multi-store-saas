/**
 * Ozzyl AI Chat Widget
 * Enterprise-grade visitor chatbot for the marketing landing page
 * 
 * Features:
 * - Floating button with pulse animation
 * - Glassmorphism chat panel
 * - Typing indicator
 * - Quick suggestion chips
 * - Mobile responsive (full-screen on mobile)
 * - Bengali-first design
 */

import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_SUGGESTIONS = [
  { text: "Ozzyl কি?", emoji: "💡" },
  { text: "Pricing জানতে চাই", emoji: "💰" },
  { text: "বিকাশ পেমেন্ট নেওয়া যায়?", emoji: "📱" },
  { text: "কিভাবে শুরু করব?", emoji: "🚀" },
];

export function OzzylAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'আসসালামু আলাইকুম! 👋 আমি Ozzyl AI - Ozzyl এর official assistant। আপনার অনলাইন বিজনেস নিয়ে কিভাবে সাহায্য করতে পারি?'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success: boolean; response?: string; error?: string }>();
  
  const isLoading = fetcher.state !== 'idle';

  // Show greeting popup once on page load, then auto-hide
  useEffect(() => {
    if (!hasShownGreeting && !isOpen) {
      const showTimer = setTimeout(() => {
        setShowGreeting(true);
        setHasShownGreeting(true);
      }, 1500); // Show after 1.5s

      return () => clearTimeout(showTimer);
    }
  }, [hasShownGreeting, isOpen]);

  // Auto-hide greeting after 5 seconds
  useEffect(() => {
    if (showGreeting) {
      const hideTimer = setTimeout(() => {
        setShowGreeting(false);
      }, 5000);

      return () => clearTimeout(hideTimer);
    }
  }, [showGreeting]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false); // Hide greeting when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle AI response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data;
      if (data.success && data.response) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response!
          }
        ]);
      } else if (data.error) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.error || 'দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          }
        ]);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Build history (last 6 messages excluding current)
    const history = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    fetcher.submit(
      { message: text.trim(), history },
      { method: 'post', action: '/api/visitor-chat', encType: 'application/json' }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Floating Chat Button with Brand Logo */}
      <AnimatePresence>
        {!isOpen && (
          <>
            {/* Greeting Popup */}
            <AnimatePresence>
              {showGreeting && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="fixed bottom-24 right-6 z-50 max-w-[280px] bg-white rounded-2xl shadow-2xl p-4 cursor-pointer"
                  onClick={() => setIsOpen(true)}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src="/ozzyl-logo-small.png" 
                      alt="Ozzyl" 
                      className="w-8 h-8 rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ozzyl AI</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        👋 আসসালামু আলাইকুম! কিভাবে সাহায্য করতে পারি?
                      </p>
                    </div>
                  </div>
                  {/* Arrow pointing to button */}
                  <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: hasShownGreeting ? 0 : [0, -8, 0] // Single bounce only on first show
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                y: { delay: 1.5, duration: 0.4, ease: "easeOut" }
              }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform border-2 border-[#006A4E]/20 overflow-hidden"
            >
              <img 
                src="/ozzyl-logo-small.png" 
                alt="Ozzyl AI" 
                className="w-14 h-14"
              />
              {/* Online indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-[#0A0F0D]/95 backdrop-blur-xl border border-[#006A4E]/30 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#006A4E]/20 to-transparent border-b border-[#006A4E]/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/ozzyl-logo-small.png" 
                    alt="Ozzyl" 
                    className="w-10 h-10 rounded-xl shadow-lg shadow-[#006A4E]/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0A0F0D]" />
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    Ozzyl AI
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#006A4E]/30 text-[#00875F] rounded">BETA</span>
                  </h3>
                  <p className="text-xs text-white/50">Ozzyl Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-white/10' 
                      : ''
                  }`}>
                    {msg.role === 'user' 
                      ? <User className="w-4 h-4 text-white/70" />
                      : <img src="/ozzyl-logo-small.png" alt="Ozzyl" className="w-7 h-7" />
                    }
                  </div>
                  
                  {/* Message bubble */}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#006A4E] text-white rounded-tr-sm'
                      : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden">
                    <img src="/ozzyl-logo-small.png" alt="Ozzyl" className="w-7 h-7" />
                  </div>
                  <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5">
                    <span className="w-2 h-2 bg-[#006A4E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#006A4E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#006A4E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s.text)}
                    disabled={isLoading}
                    className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-[#006A4E]/20 border border-white/10 hover:border-[#006A4E]/40 rounded-full text-xs text-white/70 hover:text-white transition whitespace-nowrap disabled:opacity-50"
                  >
                    <span className="mr-1.5">{s.emoji}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  disabled={isLoading}
                  className="flex-1 bg-white/5 border border-white/10 focus:border-[#006A4E]/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-[#006A4E]/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>

            {/* Footer CTA */}
            <div className="px-4 py-2 bg-[#006A4E]/10 border-t border-[#006A4E]/20">
              <a
                href="/auth/register"
                className="flex items-center justify-center gap-2 text-xs font-medium text-[#00875F] hover:text-white transition"
              >
                <span>ফ্রি স্টোর তৈরি করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
