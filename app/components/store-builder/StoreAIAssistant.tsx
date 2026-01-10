import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Send, Sparkles, X, Loader2, Wand2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StoreAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: any) => void;
}

export function StoreAIAssistant({ isOpen, onClose, onApplyConfig }: StoreAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you design your store. Tell me what kind of store you want to build (e.g., "A minimalist coffee shop with dark theme").' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<any>();
  const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle AI response and apply config
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.data) {
      const config = fetcher.data.data;
      
      // Update chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've created a design for you! I've updated your colors, fonts, and sections to match the "${input}" vibe. How does it look?` 
      }]);

      // Apply to editor parent
      onApplyConfig(config);
    } else if (fetcher.data?.error) {
       setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I ran into an error: ${fetcher.data.error}` 
      }]);
    }
  }, [fetcher.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Call API
    fetcher.submit(
      { 
        action: 'DESIGN_STORE_THEME',
        prompt: input 
      },
      { 
        method: 'POST', 
        action: '/api/ai/action', 
        encType: 'application/json' 
      }
    );
    
    // Clear input but keep it in a temp variable if needed
    // setInput(''); // Don't clear yet, we use it for the success message
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile only */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-semibold text-lg">AI Designer</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-violet-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                    <span className="text-sm text-gray-500">Generating design...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your dream store..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">
                AI can make mistakes. Review the design before publishing.
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
