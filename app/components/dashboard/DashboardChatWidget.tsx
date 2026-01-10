
import { useState, useEffect, useRef } from 'react';
import { useFetcher, useLocation } from '@remix-run/react';
import { Send, Sparkles, Loader2, Bot, User, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardChatWidgetProps {
  userName?: string;
  storeName?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function DashboardChatWidget({ userName, storeName }: DashboardChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${userName || 'there'}! I'm your store assistant. Ask me about your sales, orders, or how to configure settings.`
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<{ success: boolean; response?: string; error?: string }>();
  const location = useLocation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Handle AI Response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success && fetcher.data.response) {
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: fetcher.data.response! 
          }
        ]);
      } else if (fetcher.data?.error) {
        setMessages(prev => [
            ...prev, 
            { 
              id: Date.now().toString(), 
              role: 'assistant', 
              content: `Oops! ${fetcher.data.error}` 
            }
          ]);
      }
    }
  }, [fetcher.state, fetcher.data]);

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
        <Bot className="relative z-10 w-6 h-6" />
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
                <Bot size={16} className="relative z-10" />
            </div>
            <div>
                <h3 className="font-bold text-sm text-gray-900">Store Assistant</h3>
                <p className="text-[10px] text-gray-500 font-medium">Online • {storeName || 'MultiStore'}</p>
            </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronDown size={18} />
        </button>
      </div>

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
              {msg.role === 'user' ? <User size={12} className="text-gray-500" /> : <Bot size={14} />}
              </div>
              
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
              msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
              }`}>
              {msg.content}
              </div>
          </div>
          ))}
          
          {fetcher.state !== 'idle' && (
          <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-emerald-400" />
              </div>
              <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-emerald-500" />
              <span className="text-xs text-gray-500 font-medium">Thinking...</span>
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
              placeholder="Ask anything..."
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
    </div>
  );
}
