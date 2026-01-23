
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ShoppingBag, Store, Sparkles, Wand2, MessageSquare, ArrowRight, Zap, Target, BrainCircuit } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

// Content moved to translation files

export function AIShowcaseSection() {
  const { t } = useTranslation();
  
  const tabs = [
    {
      id: 'visitor',
      title: t('showcaseVisitorTitle'),
      role: t('showcaseVisitorRole'),
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      description: t('showcaseVisitorDesc'),
      features: [
        t('showcaseVisitorF1'),
        t('showcaseVisitorF2'),
        t('showcaseVisitorF3'),
        t('showcaseVisitorF4')
      ],
      visual: 'chat-demo' 
    },
    {
      id: 'merchant',
      title: t('showcaseMerchantTitle'),
      role: t('showcaseMerchantRole'),
      icon: BrainCircuit,
      color: 'from-emerald-500 to-green-500',
      description: t('showcaseMerchantDesc'),
      features: [
        t('showcaseMerchantF1'),
        t('showcaseMerchantF2'),
        t('showcaseMerchantF3'),
        t('showcaseMerchantF4')
      ],
      visual: 'dashboard-demo'
    },
    {
      id: 'customer',
      title: t('showcaseCustomerTitle'),
      role: t('showcaseCustomerRole'),
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500',
      description: t('showcaseCustomerDesc'),
      features: [
        t('showcaseCustomerF1'),
        t('showcaseCustomerF2'),
        t('showcaseCustomerF3'),
        t('showcaseCustomerF4')
      ],
      visual: 'notification-demo'
    }
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rotationTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotation logic
  useEffect(() => {
    if (!isPaused) {
      rotationTimer.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % tabs.length);
      }, 5000);
    }

    return () => {
      if (rotationTimer.current) clearInterval(rotationTimer.current);
    };
  }, [isPaused, tabs.length]);

  const CurrentIcon = tabs[activeTab].icon;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#0A0F0D]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/10 via-transparent to-[#006A4E]/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[#006A4E]/20 blur-[120px] rounded-full opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-200">AI Powered Platform</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            {t('showcaseSectionTitle')}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60"
          >
            {t('showcaseSectionSubtitle')}
          </motion.p>
        </div>

        {/* Layout */}
        <div 
          className="flex flex-col lg:flex-row gap-8 lg:gap-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Tabs Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {tabs.map((tab, index) => {
              const isActive = activeTab === index;
              const Icon = tab.icon;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`relative p-6 rounded-2xl text-left transition-all duration-300 group ${
                    isActive 
                      ? 'bg-white/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  } border backdrop-blur-sm`}
                >
                  {/* Progress Bar for Active Tab */}
                  {isActive && !isPaused && (
                    <motion.div
                      layoutId="progress"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-b-2xl"
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tab.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 text-white`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                        {tab.title}
                      </h3>
                      <p className="text-sm text-emerald-400 font-medium mb-1">{tab.role}</p>
                      <p className="text-sm text-white/50 line-clamp-2">{tab.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Content Area */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="h-full min-h-[500px] bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group"
              >
                {/* Decorative Gradients */}
                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${tabs[activeTab].color} rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2`} />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tabs[activeTab].color} opacity-80`}>
                      <CurrentIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{tabs[activeTab].title}</h3>
                  </div>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {tabs[activeTab].features.map((feature, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-white/80 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Visual Demo Placeholder - Dynamic based on active tab */}
                  <div className="mt-auto relative rounded-xl overflow-hidden border border-white/10 bg-[#000]/40 h-64 flex items-center justify-center">
                    {/* Visitor AI Visual */}
                    {activeTab === 0 && (
                       <div className="w-full h-full flex flex-col p-6">
                         <div className="flex gap-4 mb-4">
                           <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-blue-400" />
                           </div>
                           <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                             <p className="text-sm text-white/90">{t('showcaseDemoVisitorQ')}</p>
                           </div>
                         </div>
                         <div className="flex gap-4 flex-row-reverse mb-4">
                           <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" />
                           </div>
                           <div className="bg-emerald-600/20 p-3 rounded-2xl rounded-tr-none max-w-[80%] border border-emerald-500/20">
                             <p className="text-sm text-white/90">{t('showcaseDemoVisitorUser')}</p>
                           </div>
                         </div>
                         <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-blue-400" />
                           </div>
                           <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-[80%] animate-pulse">
                             <p className="text-sm text-white/70">{t('showcaseDemoVisitorSearching')}</p>
                           </div>
                         </div>
                       </div>
                    )}

                    {/* Merchant AI Visual */}
                    {activeTab === 1 && (
                      <div className="w-full h-full p-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <p className="text-xs text-white/50 mb-1">{t('showcaseDemoMerchantStock')}</p>
                              <p className="text-xl font-bold text-white mb-2">{t('showcaseDemoMerchantLowStock')}</p>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[80%] bg-red-400 rounded-full" />
                              </div>
                           </div>
                           <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <p className="text-xs text-white/50 mb-1">{t('showcaseDemoMerchantGenerated')}</p>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-white">{t('showcaseDemoMerchantReady')}</span>
                              </div>
                           </div>
                           <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-white/50">{t('showcaseDemoMerchantDaily')}</p>
                                <p className="text-sm text-white font-medium">{t('showcaseDemoMerchantSales')}</p>
                              </div>
                              <Target className="w-8 h-8 text-emerald-500/50" />
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Customer AI Visual */}
                    {activeTab === 2 && (
                       <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className="flex -space-x-4 mb-4">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1f1d] bg-gray-800 flex items-center justify-center">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full rounded-full" />
                              </div>
                            ))}
                          </div>
                          <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-300">{t('showcaseDemoCustomerSent')}</span>
                          </div>
                          <p className="text-white/60 text-sm">{t('showcaseDemoCustomerDesc')}</p>
                       </div>
                    )}
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
