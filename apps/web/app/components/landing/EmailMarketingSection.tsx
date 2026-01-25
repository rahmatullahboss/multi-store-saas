import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Clock, DollarSign, LayoutTemplate, ShoppingCart } from 'lucide-react';

export function EmailMarketingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });

  const templates = [
    { name: 'Welcome Email', color: 'bg-blue-500', icon: '👋' },
    { name: 'Order Confirm', color: 'bg-green-500', icon: '✅' },
    { name: 'Abandon Cart', color: 'bg-orange-500', icon: '🛒' },
    { name: 'Promo Sale', color: 'bg-purple-500', icon: '🎉' },
  ];

  return (
    <div className="py-24 bg-[#0A0A0F] relative overflow-hidden" ref={containerRef}>
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Mail className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">Mailchimp Alternative Built-in</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Email Marketing — <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">যেভাবে বড়রা করে</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            থার্ড পার্টি টুলের জন্য মাসে $20-$50 খরচ করার দরকার নেই। আমাদের বিল্ট-ইন অটোমেশন দিয়েই সব হবে!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature 1: Visual Builder */}
          <div className="lg:col-span-2 bg-[#0F1115] border border-gray-800 rounded-3xl p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 bg-gray-800/50 rounded-bl-2xl border-b border-l border-gray-700">
               <span className="text-xs font-mono text-gray-400">FLOW BUILDER</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">Visual Automation Flow</h3>
            <p className="text-gray-400 mb-8 max-w-md"> ড্র্যাগ-এন্ড-ড্রপ করে সেট করুন কখন কোন ইমেইল যাবে। যেমন: অর্ডার করার ৩ দিন পর রিভিউ রিকোয়েস্ট।</p>
            
            {/* Visual Flow Diagram Mockup */}
            <div className="relative h-64 w-full flex flex-col items-center">
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <svg className="w-full h-full absolute" style={{ strokeDasharray: '5,5' }}>
                    <line x1="50%" y1="20%" x2="50%" y2="50%" stroke="#374151" strokeWidth="2" />
                    <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#374151" strokeWidth="2" />
                  </svg>
               </div>

               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={isInView ? { opacity: 1, y: 0 } : {}}
                 transition={{ delay: 0.2 }}
                 className="z-10 bg-blue-500/10 border border-blue-500/30 px-6 py-3 rounded-xl text-blue-300 font-medium flex items-center gap-2 mb-8"
               >
                 <ShoppingCart className="w-4 h-4" /> New Order Placed
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={isInView ? { opacity: 1, scale: 1 } : {}}
                 transition={{ delay: 0.4 }}
                 className="z-10 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full text-gray-400 text-sm flex items-center gap-2 mb-8"
               >
                 <Clock className="w-3 h-3" /> Wait 3 Days
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={isInView ? { opacity: 1, y: 0 } : {}}
                 transition={{ delay: 0.6 }}
                 className="z-10 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-xl text-green-300 font-medium flex items-center gap-2"
               >
                 <Mail className="w-4 h-4" /> Send Review Request
               </motion.div>
            </div>
          </div>

          {/* Feature 2: Templates & Savings */}
          <div className="space-y-8">
            {/* Templates Card */}
            <div className="bg-[#0F1115] border border-gray-800 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-purple-400" /> Ready Templates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((t, idx) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className={`w-8 h-8 ${t.color}/20 rounded-lg flex items-center justify-center text-lg mb-2`}>
                      {t.icon}
                    </div>
                    <span className="text-sm text-gray-300 font-medium">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" /> Massive Savings
              </h3>
              <div className="space-y-4 py-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-400">Mailchimp</span>
                   <span className="text-red-400 line-through">৳2,000/mo</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-400">Klaviyo</span>
                   <span className="text-red-400 line-through">৳4,500/mo</span>
                 </div>
                 <div className="h-px bg-gray-700/50" />
                 <div className="flex justify-between items-center font-bold text-lg">
                   <span className="text-white">Our Platform</span>
                   <span className="text-green-400">FREE</span>
                 </div>
              </div>
              <div className="mt-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-center text-sm font-semibold">
                Save ৳24,000+/year!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
