/**
 * Storefront AI Chat Widget
 * 
 * AI-powered chat widget for customer storefronts with:
 * - WhatsApp/Call buttons above the main AI button
 * - Credit-based messaging (shows recharge message when credits exhausted)
 * - Store-specific styling based on accent color
 * - Structured AI response rendering (text, product cards, etc.)
 */

import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Send, X, Loader2, Bot, User, Phone, MessageCircle } from 'lucide-react';
import { WhatsAppIcon } from '~/components/icons/WhatsAppIcon';

// Types for structured AI responses
interface InsightCard {
  title: string;
  value: string;
  icon?: string;
  color?: string;
  trend?: number;
  url?: string;
}

interface ActionChip {
  label: string;
  url: string;
}

interface StructuredResponse {
  type: 'text' | 'insight_cards' | 'action_chips' | 'mixed' | 'alert';
  content?: string;
  data?: InsightCard[] | ActionChip[] | Record<string, unknown>;
  items?: Array<{ type: string; data: string | InsightCard[] | ActionChip[] | Record<string, unknown> }>;
}

/**
 * Parse AI response - handles both JSON and plain text
 */
function parseAIResponse(content: string): StructuredResponse {
  // Try to parse as JSON first
  try {
    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();
    
    const parsed = JSON.parse(cleaned);
    
    // Validate it's a structured response
    if (parsed.type) {
      return parsed as StructuredResponse;
    }
    
    // If it has text.content structure (from screenshot issue)
    if (parsed.text?.content) {
      return { type: 'text', content: parsed.text.content };
    }
    
    // Fallback: return as text
    return { type: 'text', content: content };
  } catch {
    // Not JSON, return as plain text
    return { type: 'text', content: content };
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Renders structured AI message content
 */
function MessageContent({ content, isUser, accentColor }: { content: string; isUser: boolean; accentColor: string }) {
  // User messages are always plain text
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap text-white">{content}</p>;
  }

  // Parse AI response
  const parsed = parseAIResponse(content);

  // Render based on type
  switch (parsed.type) {
    case 'text':
      return <p className="text-sm whitespace-pre-wrap text-gray-700">{parsed.content}</p>;

    case 'insight_cards': {
      const cards = Array.isArray(parsed.data) ? parsed.data as InsightCard[] : [];
      return (
        <div className="space-y-2">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{card.title}</span>
                {card.trend !== undefined && (
                  <span className={`text-xs font-medium ${card.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">{card.value}</p>
              {card.url && (
                <a 
                  href={card.url} 
                  className="text-xs mt-2 inline-block hover:underline"
                  style={{ color: accentColor }}
                >
                  বিস্তারিত দেখুন →
                </a>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'action_chips': {
      const chips = Array.isArray(parsed.data) ? parsed.data as ActionChip[] : [];
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {chips.map((chip, idx) => (
            <a
              key={idx}
              href={chip.url}
              className="px-3 py-1.5 text-xs rounded-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {chip.label}
            </a>
          ))}
        </div>
      );
    }

    case 'mixed': {
      const items = parsed.items || [];
      return (
        <div className="space-y-3">
          {items.map((item, idx) => {
            if (item.type === 'text') {
              return <p key={idx} className="text-sm text-gray-700">{typeof item.data === 'string' ? item.data : item.data?.content}</p>;
            }
            if (item.type === 'insight_cards') {
              const cards = Array.isArray(item.data) ? item.data as InsightCard[] : [];
              return (
                <div key={idx} className="space-y-2">
                  {cards.map((card, cardIdx) => (
                    <div 
                      key={cardIdx}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{card.title}</span>
                        {card.trend !== undefined && (
                          <span className={`text-xs font-medium ${card.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{card.value}</p>
                    </div>
                  ))}
                </div>
              );
            }
            if (item.type === 'action_chips') {
              const chips = Array.isArray(item.data) ? item.data as ActionChip[] : [];
              return (
                <div key={idx} className="flex flex-wrap gap-2">
                  {chips.map((chip, chipIdx) => (
                    <a
                      key={chipIdx}
                      href={chip.url}
                      className="px-3 py-1.5 text-xs rounded-full text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      {chip.label}
                    </a>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    case 'alert': {
      const alert = parsed.data as { severity?: string; title?: string; message?: string; actionLabel?: string; actionUrl?: string };
      const bgColor = alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 
                      alert.severity === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
      return (
        <div className={`${bgColor} border rounded-lg p-3`}>
          {alert.title && <p className="text-sm font-semibold">{alert.title}</p>}
          {alert.message && <p className="text-xs text-gray-600 mt-1">{alert.message}</p>}
          {alert.actionLabel && alert.actionUrl && (
            <a href={alert.actionUrl} className="text-xs font-medium mt-2 inline-block" style={{ color: accentColor }}>
              {alert.actionLabel} →
            </a>
          )}
        </div>
      );
    }

    default:
      // Fallback: show as plain text
      return <p className="text-sm whitespace-pre-wrap text-gray-700">{content}</p>;
  }
}

interface StorefrontAIChatWidgetProps {
  storeId: number;
  storeName: string;
  aiCredits: number;
  accentColor?: string;
  // Contact fallback options
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  callEnabled?: boolean;
  callNumber?: string;
  // Customization
  agentName?: string;
  welcomeMessage?: string;
}

export function StorefrontAIChatWidget({
  storeId,
  storeName,
  aiCredits,
  accentColor = '#6366f1',
  whatsappEnabled,
  whatsappNumber,
  whatsappMessage,
  callEnabled,
  callNumber,
  agentName = 'AI Assistant',
  welcomeMessage,
}: StorefrontAIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCredits, setCurrentCredits] = useState(aiCredits);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success: boolean; response?: string; error?: string; creditsRemaining?: number }>();
  
  const isLoading = fetcher.state !== 'idle';
  const hasWhatsApp = Boolean(whatsappNumber) && whatsappEnabled !== false;
  const hasCall = Boolean(callNumber) && callEnabled !== false;

  // Format WhatsApp number
  const formatWhatsAppNumber = (num: string) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('01')) {
      cleaned = '88' + cleaned;
    }
    return cleaned;
  };

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${formatWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(whatsappMessage || `হ্যালো ${storeName}, আমি আপনার প্রোডাক্ট সম্পর্কে জানতে চাই।`)}`
    : '';

  // Show greeting popup after 2 seconds
  useEffect(() => {
    if (!hasShownGreeting && !isOpen) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        setHasShownGreeting(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasShownGreeting, isOpen]);

  // Hide greeting after 5 seconds
  useEffect(() => {
    if (showGreeting) {
      const timer = setTimeout(() => setShowGreeting(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showGreeting]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle API response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const { success, response, error, creditsRemaining } = fetcher.data;
      if (success && response) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response
        }]);
        if (creditsRemaining !== undefined) {
          setCurrentCredits(creditsRemaining);
        }
      } else if (error) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: error
        }]);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;

    // Check credits
    if (currentCredits <= 0) {
      setMessages(prev => [...prev, 
        { id: `user-${Date.now()}`, role: 'user', content: text.trim() },
        { id: `error-${Date.now()}`, role: 'assistant', content: '⚠️ AI ক্রেডিট শেষ। দোকানের মালিককে ক্রেডিট রিচার্জ করতে বলুন।\n\nআপনি WhatsApp বা ফোনে সরাসরি যোগাযোগ করতে পারেন।' }
      ]);
      setInput('');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Build history
    const history = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    fetcher.submit(
      { 
        channel: 'customer', 
        message: text.trim(), 
        storeId,
        history 
      },
      { method: 'post', action: '/api/ai-orchestrator', encType: 'application/json' }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const defaultWelcome = welcomeMessage || `আসসালামু আলাইকুম! 👋 আমি ${storeName} এর AI অ্যাসিস্ট্যান্ট। কীভাবে সাহায্য করতে পারি?`;

  return (
    <>
      {/* Contact Buttons (Above AI Button) */}
      {!isOpen && (hasWhatsApp || hasCall) && (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2">
          {hasWhatsApp && whatsappNumber && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              title="WhatsApp"
            >
              <WhatsAppIcon className="w-6 h-6 text-white" />
            </a>
          )}
          {hasCall && callNumber && (
            <a
              href={`tel:${callNumber}`}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              title="কল করুন"
            >
              <Phone className="w-6 h-6 text-white" />
            </a>
          )}
        </div>
      )}

      {/* Greeting Popup */}
      {showGreeting && !isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 max-w-[260px] p-4 rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform bg-white border border-gray-100"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{agentName}</h4>
              <p className="text-xs text-gray-600 mt-0.5">হাই! কোন প্রশ্ন থাকলে জিজ্ঞাসা করুন 😊</p>
            </div>
          </div>
          <div 
            className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"
          />
        </div>
      )}

      {/* Main AI Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
          style={{ backgroundColor: accentColor }}
        >
          <MessageCircle className="w-7 h-7 text-white" />
          {/* Pulse animation */}
          <span 
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: accentColor }}
          />
          {/* Online indicator */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 z-50 w-[360px] max-w-[calc(100vw-32px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{agentName}</h3>
                <p className="text-xs opacity-80">সাধারণত সেকেন্ডেই উত্তর দেয়</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* WhatsApp in header */}
              {hasWhatsApp && whatsappNumber && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}
              {/* Call in header */}
              {hasCall && callNumber && (
                <a
                  href={`tel:${callNumber}`}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="কল করুন"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Credit Warning */}
          {currentCredits <= 0 && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>AI ক্রেডিট শেষ। WhatsApp বা ফোনে যোগাযোগ করুন।</span>
            </div>
          )}

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
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{defaultWelcome}</p>
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
                  <MessageContent 
                    content={msg.content} 
                    isUser={msg.role === 'user'} 
                    accentColor={accentColor} 
                  />
                </div>
              </div>
            ))}

            {/* Loading indicator */}
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
                    <span className="text-sm text-gray-500">টাইপ করছে...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="আপনার প্রশ্ন লিখুন..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
