import { useState, useEffect } from 'react';
import { Zap, Check, Bot, Send, Sparkles } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';

export function VisitorAIShowcase() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', text: string, id: number}>>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Suggested questions for the demo
  const suggestions = [
    { text: t('landingOzzylChat_suggestWhatIs'), action: 1 },
    { text: t('landingOzzylChat_suggestPricing'), action: 2 },
    { text: t('landingOzzylChat_suggestHowToStart'), action: 3 }
  ];

  // Override AI responses for better demo flow if needed, but using existing keys is better for consistency
  const getAIResponse = (action: number) => {
    switch(action) {
      case 1: return t('landingOzzylChat_initialMsg');
      case 2: return t('landingOzzylChat_suggestPricing');
      case 3: return t('landingVisitorAi_feature4Desc');
      default: return "";
    }
  };

  const handlSuggestionClick = async (action: number) => {
    if (isTyping) return;
    
    // Add User Message
    const userText = action === 1 ? t('landingOzzylChat_suggestWhatIs') : action === 2 ? t('landingOzzylChat_suggestPricing') : t('landingOzzylChat_suggestHowToStart');
    setMessages(prev => [...prev, { role: 'user', text: userText, id: Date.now() }]);
    
    // AI Thinking Delay
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add AI Response
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: getAIResponse(action), id: Date.now() + 1 }]);
  };

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{
        role: 'ai',
        text: t('landingOzzylChat_greetingMsg'),
        id: 1
      }]);
    }, 500);
    return () => clearTimeout(timer);
  }, [t]);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/5 via-transparent to-[#006A4E]/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">{t('landingVisitorAi_newFeature')}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-relaxed py-2">
            {t('landingVisitorAi_askAiTitle')}
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t('landingVisitorAi_askAiSubtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          
          {/* LEFT: Feature List */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center space-y-8">
            {[
              { title: t('landingVisitorAi_feature1Title'), desc: t('landingVisitorAi_feature1Desc') },
              { title: t('landingVisitorAi_feature2Title'), desc: t('landingVisitorAi_feature2Desc') },
              { title: t('landingVisitorAi_feature3Title'), desc: t('landingVisitorAi_feature3Desc') },
              { title: t('landingVisitorAi_feature4Title'), desc: t('landingVisitorAi_feature4Desc') },
            ].map((item, i) => (
              <div 
                key={i}
                className="flex gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
            
            <div
               className="pt-8"
            >
              <div className="inline-block p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-white/10">
                <p className="text-sm text-emerald-200 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t('landingVisitorAi_saveSalesCostDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Chat Demo */}
          <div className="w-full lg:w-7/12 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-30" />
            
            <div 
              className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-[#151515]">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{t('landingVisitorAi_aiAssistantName')}</h3>
                  <p className="text-xs text-white/50">{t('landingVisitorAi_alwaysActive')}</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
                
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'ai' 
                            ? 'bg-white/10 text-white rounded-tl-none border border-white/5' 
                            : 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20'
                        }`}
                      >
                         {msg.text}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div 
                      className="flex justify-start"
                    >
                       <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                         <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                         <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                         <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                       </div>
                    </div>
                  )}
                
                <div className="h-4" /> 
              </div>

              {/* Suggestions Chips */}
              <div className="p-4 pt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handlSuggestionClick(i + 1)}
                    disabled={isTyping}
                    className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-full text-sm text-emerald-400 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {s.text}
                  </button>
                ))}
              </div>

              {/* Fake Input Area */}
              <div className="p-4 border-t border-white/5 bg-[#151515]">
                <div className="h-12 bg-black/30 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                  <span className="text-white/30 text-sm">{t('landingOzzylChat_typeMessage')}</span>
                  <div className="p-2 bg-emerald-600/20 rounded-lg">
                    <Send className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
