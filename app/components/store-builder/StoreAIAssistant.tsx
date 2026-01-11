import { useState, useRef, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Send, Sparkles, X, Loader2, Check, AlertCircle, HelpCircle, MessageSquare, Lightbulb, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: any;
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

// ============================================================================
// TUTORIAL & EXAMPLES DATA
// ============================================================================
const EXAMPLE_CATEGORIES = [
  {
    title: '🎨 থিম ও রঙ',
    icon: '🎨',
    examples: [
      { label: 'প্রাইমারি কালার লাল করো', description: 'মূল রঙ পরিবর্তন' },
      { label: 'ডার্ক থিম অ্যাপ্লাই করো', description: 'থিম প্রিসেট' },
      { label: 'ব্যাকগ্রাউন্ড সাদা করো', description: 'পেছনের রঙ' },
      { label: 'ফন্ট Hind Siliguri করো', description: 'বাংলা ফন্ট' },
    ]
  },
  {
    title: '📦 সেকশন ম্যানেজমেন্ট',
    icon: '📦',
    examples: [
      { label: 'নতুন ব্যানার সেকশন যোগ করো', description: 'সেকশন যোগ' },
      { label: 'নিউজলেটার সেকশন ডিলিট করো', description: 'সেকশন মুছে ফেলা' },
      { label: 'হিরো সেকশনের হেডিং পরিবর্তন করো', description: 'টেক্সট এডিট' },
      { label: 'প্রোডাক্ট গ্রিড উপরে নাও', description: 'সেকশন সাজানো' },
    ]
  },
  {
    title: '📞 স্টোর ইনফো',
    icon: '📞',
    examples: [
      { label: 'ফোন নাম্বার ০১৭১২৩৪৫৬৭৮ সেট করো', description: 'ফোন যোগ' },
      { label: 'ইমেইল: info@mystore.com', description: 'ইমেইল সেট' },
      { label: 'ফেসবুক লিংক: fb.com/mystore', description: 'সোশ্যাল মিডিয়া' },
      { label: 'হোয়াটসঅ্যাপ বাটন চালু করো', description: 'ফ্লোটিং বাটন' },
    ]
  },
  {
    title: '📢 এনাউন্সমেন্ট',
    icon: '📢',
    examples: [
      { label: 'এনাউন্সমেন্টে লেখো: ফ্রি ডেলিভারি!', description: 'প্রমো ব্যানার' },
      { label: 'এনাউন্সমেন্ট বন্ধ করো', description: 'ব্যানার লুকানো' },
    ]
  },
  {
    title: '⚙️ অ্যাডভান্সড',
    icon: '⚙️',
    examples: [
      { label: 'চেকআউট ওয়ান-পেজ করো', description: 'চেকআউট স্টাইল' },
      { label: 'হেডিং সাইজ বড় করো', description: 'টাইপোগ্রাফি' },
      { label: 'Custom CSS: .hero { padding: 2rem; }', description: 'কাস্টম কোড' },
      { label: 'স্টোরটাকে প্রিমিয়াম লুক দাও', description: 'সম্পূর্ণ ডিজাইন' },
    ]
  },
];

const TIPS = [
  '💡 বাংলা বা English যেকোনো ভাষায় কমান্ড দিতে পারবেন',
  '💡 নির্দিষ্ট সেকশন বলতে তার নাম বলুন, যেমন "হিরো সেকশন"',
  '💡 রঙের জন্য নাম (লাল, নীল) বা হেক্স কোড (#ff0000) দুটোই চলবে',
  '💡 "প্রিমিয়াম লুক দাও" বললে AI সম্পূর্ণ থিম ডিজাইন করে দেবে',
  '💡 AI বুঝতে না পারলে আবার অন্যভাবে বলুন',
];

// ============================================================================
// COMPONENT
// ============================================================================
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
      content: 'আমি আপনার স্টোর ডিজাইনে সাহায্য করতে পারি! 🎨\n\nবাংলা বা English এ বলুন কী পরিবর্তন করতে চান।\n\n👇 নিচে "সাহায্য" ট্যাবে উদাহরণ ও টিপস দেখুন!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [pendingCommand, setPendingCommand] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'help'>('chat');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const commandFetcher = useFetcher<any>();
  const themeFetcher = useFetcher<any>();
  
  const isLoading = 
    commandFetcher.state === 'submitting' || 
    commandFetcher.state === 'loading' ||
    themeFetcher.state === 'submitting' ||
    themeFetcher.state === 'loading';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (commandFetcher.data?.success && commandFetcher.data?.data) {
      const command = commandFetcher.data.data;
      
      if (command.confidence < 0.7 || command.requiresConfirmation) {
        setPendingCommand(command);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: command.message,
          action: command
        }]);
      } else {
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
        content: `❌ দুঃখিত: ${commandFetcher.data.error}` 
      }]);
    }
  }, [commandFetcher.data]);

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

  const applyCommand = (command: any) => {
    if (onApplyCommand) {
      onApplyCommand(command);
    } else {
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
          if (typeof command.value === 'object') {
            Object.assign(config, command.value);
          }
          break;
      }
      if (Object.keys(config).length > 0) {
        onApplyConfig(config);
      }
    }
  };

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

  const cancelCommand = () => {
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '❌ বাতিল করা হয়েছে। অন্য কিছু করতে চান?' 
    }]);
    setPendingCommand(null);
  };

  const isFullThemeRequest = (text: string): boolean => {
    const patterns = [
      /ডিজাইন কর/i, /theme.*generate/i, /full.*design/i,
      /store.*build/i, /complete.*look/i, /সম্পূর্ণ.*ডিজাইন/i,
      /নতুন.*থিম/i, /প্রিমিয়াম.*লুক/i
    ];
    return patterns.some(p => p.test(text));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setActiveTab('chat');
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    const userInput = input.trim();
    if (isFullThemeRequest(userInput)) {
      themeFetcher.submit(
        JSON.stringify({ action: 'DESIGN_STORE_THEME', prompt: userInput }),
        { method: 'POST', action: '/api/ai/action', encType: 'application/json' }
      );
    } else {
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
        { method: 'POST', action: '/api/ai/action', encType: 'application/json' }
      );
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setActiveTab('chat');
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-semibold text-lg">AI ডিজাইনার</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                চ্যাট
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'help' 
                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                সাহায্য ও উদাহরণ
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'chat' ? (
                <div className="p-4 space-y-4 bg-gray-50 min-h-full">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-violet-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {pendingCommand && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">নিশ্চিত করুন</p>
                          <p className="text-xs text-amber-600 mt-1">
                            Action: {pendingCommand.action}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={confirmCommand} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                          <Check className="w-4 h-4" /> হ্যাঁ
                        </button>
                        <button onClick={cancelCommand} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          <X className="w-4 h-4" /> না
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
              ) : (
                <div className="p-4 space-y-4">
                  {/* Tips */}
                  <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100">
                    <div className="flex items-center gap-2 text-violet-700 font-medium mb-3">
                      <Lightbulb className="w-4 h-4" />
                      টিপস
                    </div>
                    <ul className="space-y-2">
                      {TIPS.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-600">{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Example Categories */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      উদাহরণ কমান্ড (ক্লিক করে ব্যবহার করুন)
                    </h3>
                    
                    {EXAMPLE_CATEGORIES.map((cat) => (
                      <div key={cat.title} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === cat.title ? null : cat.title)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-medium text-gray-800">{cat.title}</span>
                          <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategory === cat.title ? 'rotate-90' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {expandedCategory === cat.title && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1 bg-white">
                                {cat.examples.map((ex, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleExampleClick(ex.label)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-violet-50 group transition-colors"
                                  >
                                    <p className="text-sm text-gray-800 group-hover:text-violet-700">{ex.label}</p>
                                    <p className="text-xs text-gray-500">{ex.description}</p>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
