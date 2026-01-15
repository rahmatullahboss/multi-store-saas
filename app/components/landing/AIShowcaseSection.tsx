import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, MessageSquare, BrainCircuit, Bot, Zap, Check, Send, Search, Menu, BarChart3, TrendingUp, Users, Package, Shirt, Footprints, AlertCircle, Phone, HelpCircle } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useIsMobile } from '~/hooks/useIsMobile';

export function AIShowcaseSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rotationTimer = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const tabs = [
    {
      id: 'visitor',
      title: t('landingShowcase_visitorTitle'),
      role: t('landingShowcase_visitorRole'),
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      description: t('landingShowcase_visitorDesc'),
    },
    {
      id: 'merchant',
      title: t('landingShowcase_merchantTitle'),
      role: t('landingShowcase_merchantRole'),
      icon: BrainCircuit,
      color: 'from-emerald-500 to-green-500',
      description: t('landingShowcase_merchantDesc'),
    },
    {
      id: 'customer',
      title: t('landingShowcase_customerTitle'),
      role: t('landingShowcase_customerRole'),
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500',
      description: t('landingShowcase_customerDesc'),
    }
  ];

  // Auto-rotation logic
  useEffect(() => {
    // Disable auto-rotation on mobile
    if (!isPaused && !isMobile) {
      rotationTimer.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % tabs.length);
      }, 8000); // 8 seconds per slide to read content
    }
    return () => {
      if (rotationTimer.current) clearInterval(rotationTimer.current);
    };
  }, [isPaused, isMobile, tabs.length]);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/5 via-transparent to-[#006A4E]/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[#006A4E]/10 blur-[120px] rounded-full opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
           >
             <Sparkles className="w-4 h-4 text-emerald-400" />
             <span className="text-sm font-medium text-emerald-200">{t('landingShowcase_suite')}</span>
           </motion.div>
           
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
             {t('landingShowcase_title')}
           </h2>
           <p className="text-lg text-white/60 max-w-2xl mx-auto">
             {t('landingShowcase_subtitle')}
           </p>
        </div>

        {/* Tabs - Horizontal Layout */}
        <div 
          className="flex flex-col gap-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabs.map((tab, index) => {
              const isActive = activeTab === index;
              const Icon = tab.icon;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`relative p-6 rounded-2xl text-left transition-all duration-300 group overflow-hidden ${
                    isActive 
                      ? 'bg-white/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  } border backdrop-blur-sm`}
                >
                  {/* Active Gradient Border */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-10`} />
                  )}

                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tab.color} bg-opacity-20`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-white' : 'text-white/70'}`}>
                        {tab.title}
                      </h3>
                      <p className="text-sm text-emerald-400 font-medium">{tab.role}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar - Only on desktop */}
                  {isActive && !isPaused && !isMobile && (
                    <motion.div
                      layoutId="progress"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, ease: 'linear' }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Content Area */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111] border border-white/10 rounded-3xl relative overflow-hidden group min-h-[600px] h-auto flex shadow-2xl"
              >
                 {/** 
                  * Tab 1: VISITOR AI 
                  * Split Layout: Features (Left) + Chat Demo (Right)
                  */}
                 {activeTab === 0 && (
                   <div className="w-full h-full flex flex-col lg:flex-row">
                      {/* Left: Features */}
                      <div className="w-full lg:w-5/12 p-6 md:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center relative bg-gradient-to-b from-blue-900/10 to-transparent">
                          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{t('landingShowcase_visitorTitle')}</h3>
                          <p className="text-lg text-blue-300 mb-8">{t('landingShowcase_visitor_askAi')}</p>
                          
                          <div className="space-y-6">
                            {[
                              { title: t('landingShowcase_visitor_feature1'), desc: t('landingShowcase_visitor_feature1_desc') },
                              { title: t('landingShowcase_visitor_feature2'), desc: t('landingShowcase_visitor_feature2_desc') },
                              { title: t('landingShowcase_visitor_feature3'), desc: '' },
                              { title: t('landingShowcase_visitor_feature4'), desc: t('landingShowcase_visitor_feature4_desc') },
                              { title: t('landingShowcase_visitor_feature5'), desc: t('landingShowcase_visitor_feature5_desc') },
                            ].map((item, i) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (i * 0.1) }}
                                key={i}
                                className="flex gap-4"
                              >
                                <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                  <Check className="w-3 h-3 text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                                  {item.desc && <p className="text-white/50 text-sm">{item.desc}</p>}
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-sm text-blue-200">
                              {t('landingShowcase_visitor_tip')}
                            </p>
                          </div>
                      </div>

                      {/* Right: Chat Demo */}
                      <div className="w-full lg:w-7/12 p-4 md:p-8 lg:p-12 bg-[#0d1210] relative flex items-center justify-center">
                          <div className="w-full max-w-md bg-[#151a18] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[400px] md:h-[500px]">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 bg-[#1a1f1d] flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                  <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#1a1f1d] rounded-full" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{t('landingShowcase_visitor_aiName')}</h4>
                                <p className="text-xs text-white/50">{t('landingShowcase_visitor_alwaysActive')}</p>
                              </div>
                            </div>
                            
                            {/* Chat Body */}
                            <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                                  <Bot className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-white/90">
                                  {t('landingShowcase_visitor_initialMsg')}
                                </div>
                              </div>
                              
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="flex gap-3 flex-row-reverse"
                              >
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                </div>
                                <div className="bg-emerald-600/20 p-3 rounded-2xl rounded-tr-none max-w-[85%] text-sm text-white/90 border border-emerald-500/20">
                                  {t('landingShowcase_visitor_userMsg1')}
                                </div>
                              </motion.div>

                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.5 }}
                                className="flex gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                                  <Bot className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-white/90">
                                  {t('landingShowcase_visitor_aiResponse1')}
                                  <ul className="list-disc ml-4 mt-1 space-y-1 text-white/70">
                                    <li>{t('landingShowcase_visitor_aiResponseBullet1')}</li>
                                    <li>{t('landingShowcase_visitor_aiResponseBullet2')}</li>
                                    <li>{t('landingShowcase_visitor_aiResponseBullet3')}</li>
                                  </ul>
                                </div>
                              </motion.div>
                              
                              {/* Typing Indicator */}
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 4 }}
                                className="flex gap-2 ml-11"
                              >
                                 <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                                 <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                                 <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                              </motion.div>
                            </div>

                            {/* Chat Footer */}
                            <div className="p-3 bg-[#1a1f1d] border-t border-white/5">
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                                   {[t('landingAiChat_suggest2'), t('landingAiChat_suggest4')].map((chip, i) => (
                                     <span key={i} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs text-blue-300 border border-white/10 cursor-pointer whitespace-nowrap transition-colors">
                                       {chip}
                                     </span>
                                   ))}
                                </div>
                                <div className="h-10 bg-black/30 rounded-lg border border-white/5 flex items-center px-3 justify-between">
                                  <span className="text-white/20 text-sm">{t('landingShowcase_visitor_typeMessage')}</span>
                                  <Send className="w-4 h-4 text-white/20" />
                                </div>
                            </div>
                          </div>
                      </div>
                   </div>
                 )}

                 {/** 
                  * Tab 2: MERCHANT AI 
                  * Admin Panel Mockup + AI Sidebar
                  */}
                 {activeTab === 1 && (
                   <div className="w-full h-full flex flex-col p-6 lg:p-0 relative bg-[#121212]">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent pointer-events-none" />
                      
                      {/* Top Bar Mockup */}
                      <div className="h-14 border-b border-white/10 bg-[#1a1f1d] flex items-center justify-between px-6 z-10 w-full">
                         <div className="flex items-center gap-8">
                            <div className="w-24 h-6 bg-white/10 rounded" />
                            <div className="hidden md:flex gap-6 text-sm font-medium text-white/50">
                               <span className="text-white">{t('landingShowcase_merchant_dashboard')}</span>
                               <span>{t('landingShowcase_merchant_products')}</span>
                               <span>{t('landingShowcase_merchant_orders')}</span>
                               <span>{t('landingShowcase_merchant_analytics')}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30 animate-pulse">
                               <Sparkles className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10" />
                         </div>
                      </div>
                      
                      {/* Content Area */}
                      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative h-full">
                         {/* Main Dashboard (Left) */}
                         <div className="flex-1 p-4 lg:p-8 overflow-y-auto lg:overflow-hidden opacity-100 transition-opacity">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                               <BarChart3 className="w-6 h-6 text-white/50" /> 
                               {t('landingShowcase_merchant_dashboard')}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                               <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                                  <p className="text-white/50 text-sm mb-1">{t('landingShowcase_merchant_todaysSales')}</p>
                                  <h4 className="text-2xl font-bold text-white">৳45,230</h4>
                                  <p className="text-emerald-400 text-xs flex items-center mt-2">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +23%
                                  </p>
                               </div>
                               <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                                  <p className="text-white/50 text-sm mb-1">{t('landingShowcase_merchant_orders')}</p>
                                  <h4 className="text-2xl font-bold text-white">23</h4>
                                  <p className="text-emerald-400 text-xs flex items-center mt-2">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +12%
                                  </p>
                               </div>
                               <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                                  <p className="text-white/50 text-sm mb-1">{t('landingShowcase_merchant_visitors')}</p>
                                  <h4 className="text-2xl font-bold text-white">1,247</h4>
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 h-40">
                               <div className="bg-white/5 border border-white/10 rounded-xl" />
                               <div className="bg-white/5 border border-white/10 rounded-xl" />
                            </div>
                         </div>

                         {/* AI Sidebar (Right) - Slide In Animation */}
                         <motion.div 
                           initial={{ x: 100, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ type: 'spring', damping: 20, delay: 0.5 }}
                           className="w-full lg:w-96 bg-[#151a18] border-t lg:border-t-0 lg:border-l border-emerald-500/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col relative lg:absolute lg:right-0 lg:inset-y-0 z-20 h-[400px] lg:h-auto"
                         >
                            <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-emerald-900/10">
                               <Sparkles className="w-4 h-4 text-emerald-400" />
                               <span className="font-bold text-white text-sm">{t('landingShowcase_merchant_assistantName')}</span>
                            </div>
                            
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                              <div className="flex flex-col gap-3">
                                <div className="self-end bg-emerald-600/20 border border-emerald-500/20 text-white/90 text-sm p-3 rounded-2xl rounded-tr-none max-w-[90%]">
                                   {t('landingShowcase_merchant_userMsg1')}
                                </div>
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 1.5 }}
                                  className="self-start bg-white/5 border border-white/10 text-white/80 text-sm p-4 rounded-2xl rounded-tl-none w-full"
                                >
                                   <div className="flex items-center gap-2 mb-2">
                                      <Bot className="w-4 h-4 text-emerald-400" />
                                      <span className="font-bold text-white">{t('landingShowcase_merchant_aiSnippet')}</span>
                                   </div>
                                    {t('landingShowcase_merchant_aiResponse1', { total: '৳45,230' })}
                                    <div className="mt-2 text-xs bg-white/5 p-2 rounded border border-white/5">
                                      {t('landingShowcase_merchant_aiResponse2', { percent: 23 })}
                                    </div>
                                </motion.div>
                              </div>
                            </div>

                            <div className="p-4 bg-[#111]">
                               <p className="text-xs text-white/40 mb-2">{t('landingShowcase_merchant_suggested')}</p>
                               <div className="space-y-2">
                                  {/* Animated List of capabilities */}
                                  {[
                                    { icon: Package, text: t('landingShowcase_merchant_suggested1') },
                                    { icon: Users, text: t('landingShowcase_merchant_suggested2') },
                                    { icon: HelpCircle, text: t('landingShowcase_merchant_suggested3') },
                                  ].map((item, idx) => (
                                     <motion.button 
                                       initial={{ opacity: 0, x: 20 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       transition={{ delay: 2 + (idx * 0.2) }}
                                       key={idx}
                                       className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left"
                                     >
                                        <item.icon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs text-white/70">{item.text}</span>
                                     </motion.button>
                                  ))}
                               </div>
                            </div>
                         </motion.div>
                      </div>
                   </div>
                 )}

                 {/** 
                  * Tab 3: CUSTOMER AI 
                  * Store Mockup + Floating Widget
                  */}
                 {activeTab === 2 && (
                   <div className="w-full h-full flex flex-col relative bg-white lg:rounded-3xl overflow-hidden">
                      {/* Store Header Mockup */}
                      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                         <div className="font-bold text-gray-900 tracking-tight">{t('landingShowcase_customer_storeTitle')}</div>
                         <div className="flex gap-4">
                             <Search className="w-5 h-5 text-gray-400" />
                             <div className="relative">
                               <ShoppingBag className="w-5 h-5 text-gray-800" />
                               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3 h-3 flex items-center justify-center rounded-full">3</span>
                             </div>
                         </div>
                      </div>

                      {/* Store Content */}
                      <div className="flex-1 bg-gray-50 p-4 md:p-6 pb-24 md:pb-6">
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {[
                               { name: 'T-Shirt', price: '৳899', color: 'bg-blue-100', icon: Shirt },
                               { name: 'Jeans', price: '৳1,499', color: 'bg-indigo-100', icon: Package }, // using Package as Jeans placeholder
                               { name: 'Shoes', price: '৳2,299', color: 'bg-orange-100', icon: Footprints },
                            ].map((item, i) => (
                               <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                  <div className={`aspect-square ${item.color} rounded-md mb-3 flex items-center justify-center`}>
                                     <item.icon className="w-8 h-8 text-gray-400 mix-blend-multiply" />
                                  </div>
                                  <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                                  <div className="text-gray-500 text-xs">{item.price}</div>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Floating Chat Widget */}
                      <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="absolute bottom-4 right-4 w-[calc(100%-32px)] md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-20"
                      >
                         <div className="bg-indigo-600 p-3 flex items-center gap-2 text-white">
                            <Bot className="w-5 h-5" />
                            <span className="font-bold text-sm">{t('landingShowcase_customer_assistantName')}</span>
                         </div>
                         <div className="h-64 bg-gray-50 p-4 flex flex-col overflow-y-auto space-y-3">
                            <motion.div 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 1 }}
                               className="self-end bg-indigo-100 text-indigo-900 text-xs p-3 rounded-xl rounded-br-none max-w-[85%]"
                            >
                               {t('landingShowcase_customer_userMsg1')}
                            </motion.div>
                            <motion.div 
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 2.5 }}
                               className="self-start bg-white border border-gray-200 text-gray-800 text-xs p-3 rounded-xl rounded-bl-none shadow-sm max-w-[90%]"
                            >
                               <p className="mb-2">{t('landingShowcase_customer_aiResponse1')}</p>
                               <div className="flex items-center gap-2 bg-gray-50 p-2 rounded mb-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                    <Shirt className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <div>
                                     <div className="font-bold">Blue T-Shirt</div>
                                     <div className="text-gray-500">৳899</div>
                                  </div>
                               </div>
                               <p>{t('landingShowcase_customer_addToCartMsg')}</p>
                               <div className="mt-2 flex flex-wrap gap-2">
                                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] whitespace-nowrap">{t('landingShowcase_customer_yes')}</button>
                                  <button className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-[10px] whitespace-nowrap">{t('landingShowcase_customer_otherColor')}</button>
                                </div>
                            </motion.div>
                         </div>
                      </motion.div>

                      {/* Capabilities Overlay (Left Side) */}
                      <div className="absolute bottom-6 left-6 max-w-xs space-y-2 hidden lg:block">
                         <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                           {t('landingShowcase_customer_canAsk')}
                         </div>
                         {[t('landingShowcase_customer_ask1'), t('landingShowcase_customer_ask2'), t('landingShowcase_customer_ask3')].map((q, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 3 + (i * 0.2) }}
                              className="bg-white/90 backdrop-blur border border-white/20 p-2 rounded-lg text-xs font-medium text-gray-800 shadow-lg flex items-center gap-2"
                            >
                               <MessageSquare className="w-3 h-3 text-indigo-500" />
                               {q}
                            </motion.div>
                         ))}
                      </div>
                   </div>
                 )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
