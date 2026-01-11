
import { useState, useEffect, useRef } from 'react';
import { useFetcher, useLocation } from '@remix-run/react';
import { Send, Sparkles, Loader2, Bot, User, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';
import ChatInsightCard, { InsightData } from './ChatInsightCard';

interface DashboardChatWidgetProps {
  userName?: string;
  storeName?: string;
  isLocked?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function DashboardChatWidget({ userName, storeName, isLocked = false }: DashboardChatWidgetProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<{ success: boolean; response?: string; error?: string }>();
  const historyFetcher = useFetcher<{ messages: Message[] }>();
  const location = useLocation();

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: t('dashboardChat_welcome', { userName: userName || t('common_there') })
        }
      ]);
    }
  }, [userName, t]);

  // Load History on Open
  useEffect(() => {
    if (isOpen && historyFetcher.state === 'idle' && !historyFetcher.data) {
      historyFetcher.load('/api/ai/chat');
    }
  }, [isOpen]);

  // Update Messages from History
  useEffect(() => {
    if (historyFetcher.data?.messages && historyFetcher.data.messages.length > 0) {
      // Cast role type safely
      const validMessages = historyFetcher.data.messages.map(m => ({
          ...m,
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant'
      }));
      setMessages(validMessages);
    }
  }, [historyFetcher.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, historyFetcher.state]);

  // Handle AI Response
  useEffect(() => {
    const data = fetcher.data;
    if (fetcher.state === 'idle' && data) {
      if (data.success && data.response) {
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: data.response! 
          }
        ]);
        // Re-validate history to keep consistent? No need to re-fetch immediately.
      } else if (data.error) {
        setMessages(prev => [
            ...prev, 
            { 
              id: Date.now().toString(), 
              role: 'assistant', 
              content: `Oops! ${data.error}` 
            }
          ]);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Helper to render content (JSON or Text)
  const renderMessageContent = (content: string) => {
    try {
      // Try to find JSON block if it's wrapped in markdown code fence
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      // Attempt parse
      if (jsonString.trim().startsWith('{')) {
          const parsed = JSON.parse(jsonString);
          if (parsed.type === 'insight_card' && parsed.data) {
              return <ChatInsightCard data={parsed.data} />;
          }
      }
    } catch (e) {
      // Not JSON, render as text
    }
    return content;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || fetcher.state !== 'idle') return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    // Send to API
    fetcher.submit(
      { 
        message: currentInput,
        context: {
          pageContext: location.pathname
        }
      },
      { method: 'post', action: '/api/ai/chat', encType: 'application/json' }
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 z-[100] group border border-gray-800"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img src="/ozzyl-logo-small.png" alt="Ozzyl AI" className="relative z-10 w-6 h-6" />
        
        {isLocked && (
             <div className="absolute -top-1 -right-1 bg-gray-900 border border-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-20">
                PRO
            </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-600 opacity-20" />
                <img src="/ozzyl-logo-small.png" alt="Ozzyl" className="relative z-10 w-4 h-4" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900">{t('dashboardChat_title')}</h3>
                    {isLocked && <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1"><Sparkles size={8} /> PRO</span>}
                </div>
                <p className="text-[10px] text-gray-500 font-medium">{t('dashboardChat_online')} • {storeName || 'MultiStore'}</p>
            </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {isLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <img src="/ozzyl-logo-small.png" alt="Ozzyl" className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{t('dashboardChat_unlockTitle')}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {t('dashboardChat_unlockDesc')}
            </p>
            
            <div className="space-y-3 w-full">
                <a 
                    href="/app/upgrade" 
                    className="flex w-full items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-900 transition shadow-lg shadow-gray-200"
                >
                    {t('dashboardChat_upgradePro')} <Sparkles size={16} />
                </a>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 py-2"
                >
                    {t('dashboardChat_maybeLater')}
                </button>
            </div>
        </div>
      ) : (
        <>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                msg.role === 'user' ? 'bg-gray-200' : 'bg-emerald-100 text-emerald-600'
                }`}>
                {msg.role === 'user' ? <User size={12} className="text-gray-500" /> : <img src="/ozzyl-logo-small.png" alt="" className="w-3.5 h-3.5" />}
                </div>
                
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
            </div>
            ))}
            
            {fetcher.state !== 'idle' && (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                    <img src="/ozzyl-logo-small.png" alt="" className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-emerald-500" />
                <span className="text-xs text-gray-500 font-medium">{t('dashboardChat_thinking')}</span>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('dashboardChat_askAnything')}
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition border border-transparent focus:border-emerald-200"
                disabled={fetcher.state !== 'idle'}
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || fetcher.state !== 'idle'}
                    className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-md"
                >
                    <Send size={14} />
                </button>
            </div>
        </form>
        </>
      )}
    </div>
  );
}
