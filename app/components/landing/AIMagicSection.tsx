import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Palette, ShoppingBag, Moon, Sun, MessageSquare, Bell, ArrowRight, Smartphone, CreditCard } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useIsMobile } from '~/hooks/useIsMobile';

export function AIMagicSection() {
  const { t } = useTranslation();
  const [isNight, setIsNight] = useState(true);
  const [step, setStep] = useState(0); // 0: Idle, 1: Chat, 2: Order, 3: Day/Notification
  const isMobile = useIsMobile();

  useEffect(() => {
    const cycle = async () => {
      if (isMobile) {
        setStep(2); // Show full chat on mobile without looping
        return;
      }

      while (true) {
        // Reset to Night
        setIsNight(true);
        setStep(0);
        await new Promise(r => setTimeout(r, 1000));

        // Step 1: Customer Ask
        setStep(1);
        await new Promise(r => setTimeout(r, 2000));

        // Step 2: AI Reply & Order
        setStep(2);
        await new Promise(r => setTimeout(r, 2000));

        // Transition to Morning
        setIsNight(false);
        setStep(3); // Notification
        await new Promise(r => setTimeout(r, 3000)); // Show notification
      }
    };
    cycle();
  }, [isMobile]);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      {/* Background Ambience */}
      <motion.div 
        animate={{ opacity: isNight ? 0.2 : 0 }}
        className="absolute inset-0 bg-blue-900/20 pointer-events-none transition-opacity duration-1000"
      />
      <motion.div 
        animate={{ opacity: isNight ? 0 : 0.2 }}
        className="absolute inset-0 bg-orange-500/10 pointer-events-none transition-opacity duration-1000"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 font-mono text-sm">
            <Bot className="w-4 h-4 text-emerald-400" /> + <Palette className="w-4 h-4 text-purple-400" /> = ✨
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            🤖 AI + 🎨 Builder = <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Magic ✨</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t('landingMagic_title')}
          </p>
        </div>

        {/* Workflow Steps - Simplified visual at top */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-20 max-w-4xl mx-auto opacity-70">
           {/* Card 1 */}
           <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-2 bg-purple-500/20 rounded-lg"><Palette className="w-5 h-5 text-purple-400" /></div>
              <div className="text-left">
                <div className="text-xs text-white/40 font-bold uppercase">{t('landingMagic_step1')}</div>
                <div className="font-bold text-white">{t('landingMagic_build')}</div>
              </div>
           </div>
           
           <ArrowRight className="w-5 h-5 text-white/20 hidden md:block" />
           
           {/* Card 2 */}
           <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="p-2 bg-emerald-500/20 rounded-lg"><Bot className="w-5 h-5 text-emerald-400" /></div>
              <div className="text-left">
                <div className="text-xs text-emerald-400/60 font-bold uppercase">{t('landingMagic_step2')}</div>
                <div className="font-bold text-white">{t('landingMagic_automate')}</div>
              </div>
           </div>

           <ArrowRight className="w-5 h-5 text-white/20 hidden md:block" />

           {/* Card 3 */}
           <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-2 bg-blue-500/20 rounded-lg"><ShoppingBag className="w-5 h-5 text-blue-400" /></div>
              <div className="text-left">
                <div className="text-xs text-white/40 font-bold uppercase">{t('landingMagic_step3')}</div>
                <div className="font-bold text-white">{t('landingMagic_sell')}</div>
              </div>
           </div>
        </div>

        {/* Scenario Showcase Container */}
        <div className="relative max-w-5xl mx-auto min-h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl">
           
           {/* Top Info Bar (Time & Status) */}
           <div className="absolute top-0 inset-x-0 h-16 bg-black/40 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-6 z-20">
              <div className="flex items-center gap-3">
                 <motion.div 
                   animate={{ rotate: isNight ? 0 : 180, scale: isNight ? 1 : 0 }}
                   className="absolute"
                 >
                    <Moon className="w-6 h-6 text-blue-300 fill-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]" />
                 </motion.div>
                 <motion.div 
                   animate={{ rotate: isNight ? -180 : 0, scale: isNight ? 0 : 1 }}
                   className=""
                 >
                    <Sun className="w-6 h-6 text-orange-400 fill-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]" />
                 </motion.div>
                 
                 <div className="ml-8 border-l border-white/10 pl-4 flex flex-col justify-center">
                    <motion.div 
                       key={isNight ? 'night' : 'day'}
                       initial={{ y: 10, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="font-mono text-xl text-white font-bold"
                    >
                       {isNight ? t('landingMagic_nightTime') : t('landingMagic_morningTime')}
                    </motion.div>
                    <div className="text-xs text-white/50 font-medium">
                       {isNight ? t('landingMagic_sleeping') : t('landingMagic_morning')}
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <div className="text-xs text-white/40 uppercase">{t('landingMagic_totalSales')}</div>
                    <motion.div 
                       key={step >= 2 ? 'sales-up' : 'sales-flat'}
                       animate={{ scale: step >= 2 ? [1, 1.2, 1] : 1, color: step >= 2 ? '#34D399' : '#ffffff' }}
                       className="text-lg font-bold font-mono"
                    >
                       {step >= 2 ? t('landingMagic_salesValueUp') : t('landingMagic_salesValueFlat')}
                    </motion.div>
                 </div>
              </div>
           </div>

           {/* Scene Area */}
           <div className="pt-24 pb-12 px-4 md:px-12 grid md:grid-cols-2 gap-12 h-full items-center">
              
              {/* Left: Store Chat (Simulated Phone) */}
              <div className="relative">
                 <div className="absolute -inset-4 bg-gradient-to-b from-purple-500/20 to-transparent blur-xl rounded-full opacity-50" />
                 <div className="relative bg-[#0d100f] border border-white/10 rounded-[2rem] p-4 max-w-sm mx-auto shadow-2xl h-[400px] flex flex-col">
                    <div className="w-20 h-5 bg-black rounded-full mx-auto mb-4 absolute top-4 left-1/2 -translate-x-1/2 z-10" />
                    
                    {/* Chat Screen */}
                    <div className="flex-1 bg-[#1a1f1d] rounded-2xl overflow-hidden relative flex flex-col p-4 space-y-4 pt-10">
                       <div className="absolute top-0 inset-x-0 h-10 bg-[#151917] border-b border-white/5 flex items-center px-4 gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black border border-white/10">AI</div>
                          <span className="text-[10px] text-emerald-400">{t('landingMagic_chatOnline')}</span>
                       </div>

                       <AnimatePresence>
                          {/* Customer Msg */}
                          {step >= 1 && (
                            <motion.div
                              key="customer-msg"
                              initial={{ opacity: 0, x: -20, scale: 0.9 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              className="self-start bg-white/10 text-white text-xs p-3 rounded-2xl rounded-tl-none max-w-[85%]"
                            >
                              {t('landingMagic_chatUserMsg')}
                            </motion.div>
                          )}

                          {/* AI Reply */}
                          {step >= 2 && (
                            <motion.div
                              key="ai-reply"
                              initial={{ opacity: 0, x: 20, scale: 0.9 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{ delay: 0.5 }}
                              className="self-end bg-emerald-600/20 border border-emerald-500/20 text-white text-xs p-3 rounded-2xl rounded-tr-none max-w-[90%]"
                            >
                              {t('landingMagic_chatAiMsg')}
                            </motion.div>
                          )}
                          
                          {/* Product Card */}
                          {step >= 2 && (
                            <motion.div
                              key="product-card"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1 }}
                              className="self-end w-48 bg-[#0A0F0D] border border-white/10 rounded-xl overflow-hidden"
                            >
                              <div className="h-20 bg-emerald-900/20 flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-emerald-500/50" />
                              </div>
                              <div className="p-2 border-t border-white/5">
                                <div className="text-[10px] text-white/70 font-bold">{t('landingMagic_productName')}</div>
                                <div className="text-[10px] text-white/40">{t('landingMagic_productDetails')}</div>
                                <div className="mt-2 text-center bg-emerald-500 text-black text-[10px] font-bold py-1 rounded">{t('landingMagic_productConfirmed')}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                 </div>
              </div>

              {/* Right: Owner Notification (Simulated Phone Lock Screen) */}
              <div className="relative hidden md:block">
                  <div className={`absolute inset-0 bg-orange-500/20 blur-[80px] rounded-full transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-50'}`} />
                  
                  <div className="relative bg-[#000000] border-4 border-[#222] rounded-[2.5rem] p-3 max-w-sm mx-auto shadow-2xl h-[450px] flex flex-col">
                     {/* Lock Screen UI */}
                     <div className="flex-1 rounded-[2rem] overflow-hidden relative bg-[url('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
                        <div className="absolute inset-0 bg-black/40" />
                        
                        <div className="absolute top-12 left-0 right-0 text-center text-white z-10">
                           <div className="text-6xl font-thin tracking-tighter">08:00</div>
                           <div className="text-sm font-medium opacity-80 mt-1">Thursday, January 10</div>
                        </div>

                        {/* Notification Stack */}
                        <div className="absolute top-48 inset-x-4 space-y-2 z-10">
                           <AnimatePresence>
                              {step >= 3 && (
                                <motion.div key="notification"
                                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                   animate={{ opacity: 1, y: 0, scale: 1 }}
                                   className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg text-black"
                                >
                                   <div className="flex items-center gap-2 mb-2">
                                      <div className="w-5 h-5 bg-[#006A4E] rounded-md flex items-center justify-center">
                                         <Bell className="w-3 h-3 text-white" />
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-wide opacity-70">{t('landingMagic_notificationTitle')}</span>
                                   </div>
                                   <div className="font-bold text-sm">{t('landingMagic_notificationBody')}</div>
                                   <p className="text-xs text-gray-600 mt-1">
                                      {t('landingMagic_notificationDesc')}
                                   </p>
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                        
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                           <div className="w-32 h-1 bg-white/50 rounded-full" />
                        </div>
                     </div>
                  </div>
              </div>
           </div>

           {/* Caption */}
           <div className="absolute bottom-6 inset-x-0 text-center z-20">
              <motion.div 
                 key={isNight ? 'night-cap' : 'day-cap'}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="inline-block px-6 py-2 bg-black/60 backdrop-blur border border-white/10 rounded-full text-white/80 text-sm font-medium"
              >
                 {isNight ? t('landingMagic_captionSleepAi') : t('landingMagic_captionMorningReport')}
              </motion.div>
           </div>

        </div>

      </div>
    </section>
  );
}
