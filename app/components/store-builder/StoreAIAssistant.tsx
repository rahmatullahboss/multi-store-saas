import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Send, Sparkles, X, Loader2, Wand2, Palette, Type, Plus, ArrowUp, ArrowDown, Trash2, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: any; // AI command result for preview
}

interface StoreContext {
  sections: Array<{ id: string; type: string; settings: any }>;
  currentColors: { primary: string; accent: string; background: string; text: string };
  currentFont: string;
  storeName: string;
}

interface StoreAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: any) => void;
  onApplyCommand?: (command: any) => void;
  storeContext?: StoreContext;
}

// Quick action suggestions
const QUICK_ACTIONS = [
  { label: '🎨 রঙ পরিবর্তন', prompt: 'থিম এর রঙ পরিবর্তন করো' },
  { label: '📦 সেকশন যোগ', prompt: 'নতুন একটা ব্যানার সেকশন যোগ করো' },
  { label: '✨ প্রিমিয়াম লুক', prompt: 'স্টোরটাকে প্রিমিয়াম লুক দাও' },
  { label: '🌙 ডার্ক মোড', prompt: 'ডার্ক থিম প্রিসেট অ্যাপ্লাই করো' },
];

export function StoreAIAssistant({ 
  isOpen, 
  onClose, 
  onApplyConfig, 
  onApplyCommand,
  storeContext 
}: StoreAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'আমি আপনার স্টোর ডিজাইনে সাহায্য করতে পারি! 🎨\n\nবাংলা বা English এ বলুন কী পরিবর্তন করতে চান। যেমন:\n• "হিরো সেকশনের রঙ লাল করো"\n• "একটা নিউজলেটার সেকশন যোগ করো"\n• "থিম ডার্ক করো"' 
    }
  ]);
  const [input, setInput] = useState('');
  const [pendingCommand, setPendingCommand] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Separate fetchers for different actions
  const commandFetcher = useFetcher<any>();
  const themeFetcher = useFetcher<any>();
  
  const isLoading = 
    commandFetcher.state === 'submitting' || 
    commandFetcher.state === 'loading' ||
    themeFetcher.state === 'submitting' ||
    themeFetcher.state === 'loading';

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle command response
  useEffect(() => {
    if (commandFetcher.data?.success && commandFetcher.data?.data) {
      const command = commandFetcher.data.data;
      
      // Check confidence
      if (command.confidence < 0.7 || command.requiresConfirmation) {
        // Low confidence - ask for confirmation
        setPendingCommand(command);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: command.message,
          action: command
        }]);
      } else {
        // High confidence - apply directly
        applyCommand(command);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ ${command.message}`,
          action: command
        }]);
      }
      setInput('');
    } else if (commandFetcher.data?.error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ দুঃখিত, একটা সমস্যা হয়েছে: ${commandFetcher.data.error}` 
      }]);
    }
  }, [commandFetcher.data]);

  // Handle theme design response (for full theme generation)
  useEffect(() => {
    if (themeFetcher.data?.success && themeFetcher.data?.data) {
      const config = themeFetcher.data.data;
      onApplyConfig(config);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '✅ নতুন ডিজাইন অ্যাপ্লাই করা হয়েছে! কেমন লাগছে?' 
      }]);
      setInput('');
    } else if (themeFetcher.data?.error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ দুঃখিত: ${themeFetcher.data.error}` 
      }]);
    }
  }, [themeFetcher.data]);

  // Apply command to editor
  const applyCommand = (command: any) => {
    if (onApplyCommand) {
      onApplyCommand(command);
    } else {
      // Fallback: Convert command to config format for legacy support
      const config: any = {};
      
      switch (command.action) {
        case 'update_colors':
          if (command.value.primaryColor) config.primaryColor = command.value.primaryColor;
          if (command.value.accentColor) config.accentColor = command.value.accentColor;
          if (command.value.backgroundColor) config.backgroundColor = command.value.backgroundColor;
          if (command.value.textColor) config.textColor = command.value.textColor;
          break;
        case 'update_font':
          config.fontFamily = command.value;
          break;
        case 'apply_preset':
          // Presets are handled in the value
          if (typeof command.value === 'object') {
            Object.assign(config, command.value);
          }
          break;
        // Other cases handled by onApplyCommand
      }
      
      if (Object.keys(config).length > 0) {
        onApplyConfig(config);
      }
    }
  };

  // Confirm pending command
  const confirmCommand = () => {
    if (pendingCommand) {
      applyCommand(pendingCommand);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ পরিবর্তন প্রয়োগ করা হয়েছে!` 
      }]);
      setPendingCommand(null);
    }
  };

  // Cancel pending command
  const cancelCommand = () => {
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '❌ বাতিল করা হয়েছে। অন্য কিছু করতে চান?' 
    }]);
    setPendingCommand(null);
  };

  // Detect if command is for full theme generation
  const isFullThemeRequest = (text: string): boolean => {
    const patterns = [
      /ডিজাইন কর/i,
      /theme.*generate/i,
      /full.*design/i,
      /store.*build/i,
      /complete.*look/i,
      /সম্পূর্ণ.*ডিজাইন/i,
      /নতুন.*থিম/i,
    ];
    return patterns.some(p => p.test(text));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    const userInput = input.trim();

    // Check if it's a full theme request or granular command
    if (isFullThemeRequest(userInput)) {
      // Use full theme generation
      themeFetcher.submit(
        { 
          action: 'DESIGN_STORE_THEME',
          prompt: userInput 
        },
        { 
          method: 'POST', 
          action: '/api/ai/action', 
          encType: 'application/json' 
        }
      );
    } else {
      // Use granular command system
      commandFetcher.submit(
        JSON.stringify({ 
          action: 'STORE_EDITOR_COMMAND',
          editPrompt: userInput,
          context: storeContext || {
            sections: [],
            currentColors: { primary: '#6366f1', accent: '#f59e0b', background: '#f9fafb', text: '#111827' },
            currentFont: 'inter',
            storeName: 'My Store'
          }
        }),
        { 
          method: 'POST', 
          action: '/api/ai/action', 
          encType: 'application/json' 
        }
      );
    }
  };

  // Handle quick action click
  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
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
                <h2 className="font-semibold text-lg">AI ডিজাইনার</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">দ্রুত অ্যাকশন:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:border-violet-300 hover:bg-violet-50 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-violet-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Pending Command Confirmation */}
              {pendingCommand && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">নিশ্চিত করুন</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Action: {pendingCommand.action}
                        {pendingCommand.target && ` → ${pendingCommand.target}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmCommand}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      হ্যাঁ, প্রয়োগ করো
                    </button>
                    <button
                      onClick={cancelCommand}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      বাতিল
                    </button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                    <span className="text-sm text-gray-500">চিন্তা করছি...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="বাংলায় বা English এ বলুন..."
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
                AI পরামর্শ। প্রকাশের আগে রিভিউ করুন।
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
