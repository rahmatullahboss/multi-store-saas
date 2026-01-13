
import { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { Send, Sparkles, Loader2, Bot, User, ChevronDown, MessageSquare, HelpCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AiChatWidgetProps {
  editor: any; 
  onExecuteCommand: (command: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  featuredProductId?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ============================================================================
// TUTORIAL & EXAMPLES DATA FOR LANDING PAGE EDITOR - WORLD-CLASS
// ============================================================================
const EXAMPLE_CATEGORIES = [
  {
    title: '📦 Smart Sections (NEW!)',
    icon: '📦',
    examples: [
      { label: 'Hero section যোগ করো', description: 'Hero + CTA' },
      { label: 'Pricing table যোগ করো', description: '3-tier pricing' },
      { label: 'Testimonials যোগ করো', description: 'Customer reviews' },
      { label: 'FAQ section যোগ করো', description: 'Questions & Answers' },
      { label: 'Contact form যোগ করো', description: 'Email form' },
      { label: 'Footer যোগ করো', description: '4-column footer' },
      { label: 'Stats section যোগ করো', description: '10K+ customers' },
      { label: 'Team section যোগ করো', description: 'Team members' },
    ]
  },
  {
    title: '🎨 Design Effects',
    icon: '🎨',
    examples: [
      { label: 'Glassmorphism effect দাও', description: 'Glass blur' },
      { label: 'Gradient background দাও', description: 'Color blend' },
      { label: 'Shadow lg দাও', description: 'Drop shadow' },
      { label: 'Animation fadeIn দাও', description: 'Fade effect' },
      { label: 'Ocean gradient দাও', description: 'Blue → Teal' },
    ]
  },
  {
    title: '📝 AI Copywriting',
    icon: '📝',
    examples: [
      { label: 'একটা catchy headline লেখো', description: 'AI headline' },
      { label: 'CTA button text generate করো', description: 'AI CTA' },
      { label: 'এই text টা persuasive করো', description: 'Improve copy' },
      { label: 'Product description লেখো', description: 'AI description' },
    ]
  },
  {
    title: '🎨 স্টাইল পরিবর্তন',
    icon: '🎨',
    examples: [
      { label: 'ব্যাকগ্রাউন্ড লাল করো', description: 'Background color' },
      { label: 'টেক্সট সাদা করো', description: 'Text color' },
      { label: 'Font size বড় করো', description: 'Typography' },
      { label: 'Border radius গোল করো', description: 'Rounded' },
    ]
  },
  {
    title: '⚙️ Advanced',
    icon: '⚙️',
    examples: [
      { label: 'এই element ডিলিট করো', description: 'Remove' },
      { label: 'Section duplicate করো', description: 'Clone' },
      { label: 'Section উপরে নাও', description: 'Reorder' },
      { label: 'Custom CSS যোগ করো', description: 'Raw CSS' },
      { label: 'এটাকে flexbox দিয়ে সাজাও', description: 'Layout' },
    ]
  },
];

const TIPS = [
  '💡 প্রথমে যে element এডিট করতে চান, তাতে ক্লিক করুন',
  '💡 বাংলা বা English যেকোনো ভাষায় কমান্ড দিতে পারবেন',
  '💡 Element সিলেক্ট না থাকলে পুরো page এ apply হবে',
  '💡 রঙের জন্য নাম (red, blue) বা হেক্স (#ff0000) দিন',
  '💡 CSS property নাম জানলে সরাসরি বলতে পারেন',
];

export default function AiChatWidget({ editor, onExecuteCommand, isOpen, onToggle, isLocked = false, featuredProductId }: AiChatWidgetProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'help'>('chat');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{ success: boolean; data?: any; error?: string }>();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: t('chatWelcome')
        }
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success) {
        const command = fetcher.data.data;
        
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: command.message || '✅ Done!' 
          }
        ]);

        if (command && command.action !== 'general_advice') {
          onExecuteCommand(command);
        }
      } else if (fetcher.data?.error) {
        const errorMessage = fetcher.data?.error || 'Unknown error';
        setMessages(prev => [
            ...prev, 
            { 
              id: Date.now().toString(), 
              role: 'assistant', 
              content: `❌ ${errorMessage}` 
            }
          ]);
      }
    }
  }, [fetcher.state, fetcher.data, onExecuteCommand]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || fetcher.state !== 'idle') return;

    setActiveTab('chat');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    
    const userInput = input;
    setInput('');

    // Capture Context from selected element - ENHANCED for better AI understanding
    const selected = editor.getSelected();
    const context = {
      selectedTagName: selected?.get('tagName'),
      selectedHtml: selected ? selected.toHTML() : null, // Full HTML of selected element
      selectedContent: selected?.get('content') || selected?.components().map((c: any) => c.get('content')).join(' '),
      selectedClasses: selected?.getClasses(),
      selectedAttributes: selected?.getAttributes(),
      selectedStyles: selected?.getStyle(),
      hasSelection: !!selected && selected !== editor.getWrapper(), // Explicit flag for selection
      featuredProductId: featuredProductId,
    };

    fetcher.submit(
      JSON.stringify({ 
        action: 'CHAT_COMMAND', 
        editPrompt: userInput,
        context: context
      }),
      { method: 'post', action: '/api/ai/action', encType: 'application/json' }
    );
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setActiveTab('chat');
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 z-[100] group border border-gray-800"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Sparkles className="relative z-10 w-6 h-6 animate-pulse" />
        
        {isLocked && (
             <div className="absolute -top-1 -right-1 bg-gray-900 border border-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-20">
                PRO
            </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] max-h-[600px] h-[550px] bg-white rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-30" />
                <Sparkles size={16} className="relative z-10" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{t('pageBuilderAi')}</h3>
                    {isLocked && <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1"><Sparkles size={8} /> PRO</span>}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Natural Language → Design</p>
            </div>
        </div>
        <button onClick={onToggle} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition">
          <ChevronDown size={18} />
        </button>
      </div>

      {isLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Sparkles size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{t('builderChat_unlockTitle')}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {t('builderChat_unlockDesc')}
            </p>
            
            <div className="space-y-3 w-full">
                <a 
                    href="/app/upgrade" 
                    className="flex w-full items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-900 transition shadow-lg shadow-gray-200"
                >
                    {t('dashboardChat_upgradePro')} <Sparkles size={16} />
                </a>
                <button 
                    onClick={onToggle}
                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 py-2"
                >
                    {t('dashboardChat_maybeLater')}
                </button>
            </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'chat' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {t('chatLabel')}
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'help' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {t('helpLabel')}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chat' ? (
              <div className="p-4 space-y-4 bg-gray-50/50 min-h-full">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                      msg.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100 text-indigo-600'
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
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={14} className="text-indigo-400" />
                    </div>
                    <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-indigo-500" />
                      <span className="text-xs text-gray-500 font-medium">{t('thinking')}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Tips */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-700 font-medium mb-3">
                    <Lightbulb className="w-4 h-4" />
                    {t('tipsTitle')}
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
                    {t('exampleCommands')}
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
                                  className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 group transition-colors"
                                >
                                  <p className="text-sm text-gray-800 group-hover:text-indigo-700">{ex.label}</p>
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
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="বাংলায় বা English এ বলুন..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition border border-transparent focus:border-indigo-200"
                disabled={fetcher.state !== 'idle'}
              />
              <button 
                  type="submit"
                  disabled={!input.trim() || fetcher.state !== 'idle'}
                  className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-md shadow-indigo-200"
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
