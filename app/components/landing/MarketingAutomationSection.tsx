
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MessageSquare, Zap } from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';

export function MarketingAutomationSection() {
  const [activeChannel, setActiveChannel] = useState<'email' | 'whatsapp' | 'messenger'>('email');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChannel(prev => {
        if (prev === 'email') return 'whatsapp';
        if (prev === 'whatsapp') return 'messenger';
        return 'email';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-400">Smart Automation</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            কাস্টমার এনগেজমেন্ট,<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
              হবে এবার অটোমেটেড
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            ম্যানুয়ালি মেসেজ পাঠানোর দিন শেষ। অর্ডার কনফার্মেশন থেকে শুরু করে ফলো-আপ, সবকিছুই হবে অটোমেটিক—আপনার ব্র্যান্ডের নামে।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Active Channel Display - Premium Glass Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden p-8 flex flex-col shadow-2xl"
            >
              {/* Internal Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Top Bar */}
              <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                    activeChannel === 'email' ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-emerald-500/10' :
                    activeChannel === 'whatsapp' ? 'bg-gradient-to-br from-[#25D366]/20 to-green-500/20 text-[#25D366] shadow-[#25D366]/10' :
                    'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 shadow-blue-500/10'
                  }`}>
                    {activeChannel === 'email' && <Mail className="w-6 h-6" />}
                    {activeChannel === 'whatsapp' && <MessageCircle className="w-6 h-6" />}
                    {activeChannel === 'messenger' && <MessageSquare className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg tracking-tight">
                      {activeChannel === 'email' ? 'Email Campaign' :
                       activeChannel === 'whatsapp' ? 'WhatsApp Business' :
                       'Facebook Messenger'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Active Automation</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 p-2 rounded-full bg-white/5 border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-sm shadow-red-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-sm shadow-yellow-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-sm shadow-green-500/20" />
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10 pl-4 pr-2">
                 
                 {/* Trigger Node */}
                 <motion.div
                  key={`${activeChannel}-trigger`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="self-start max-w-[85%]"
                 >
                   <div className="flex items-center gap-2 mb-2 ml-1">
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Trigger</span>
                   </div>
                   <div className="bg-[#1A1F25]/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-white/80 shadow-lg">
                     {activeChannel === 'email' ? '🛒 Customer abandoned cart (Premium Watch)' :
                      activeChannel === 'whatsapp' ? '📦 Order #2034 placed successfully' :
                      '💬 Customer asked "Price please?"'}
                   </div>
                 </motion.div>

                 {/* Flow Connector */}
                 <motion.div 
                   className="pl-8 -my-2 opacity-30"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 0.3, height: 'auto' }}
                   transition={{ delay: 0.2 }}
                 >
                   <div className="w-0.5 h-8 bg-gradient-to-b from-white/50 to-emerald-500/50 ml-0.5" />
                 </motion.div>

                 {/* Logic Node */}
                 <motion.div
                   key={`${activeChannel}-logic`}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.4, delay: 0.3 }}
                   className="self-center"
                 >
                   <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                     <Zap className="w-3 h-3" />
                     <span>Running Automation Workflow...</span>
                   </div>
                 </motion.div>

                 {/* Flow Connector */}
                 <motion.div 
                   className="pl-8 -my-2 opacity-30"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 0.3, height: 'auto' }}
                   transition={{ delay: 0.4 }}
                 >
                   <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-500/50 to-white/50 ml-0.5" />
                 </motion.div>

                 {/* Response Node */}
                 <motion.div
                  key={`${activeChannel}-response`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                  className="self-end max-w-[85%]"
                 >
                    <div className="flex items-center justify-end gap-2 mb-2 mr-1">
                     <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">Sent</span>
                   </div>
                   <div 
                    className="backdrop-blur-xl border rounded-2xl rounded-tr-sm p-4 text-sm shadow-xl"
                    style={{
                      background: activeChannel === 'email' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.2))' : 
                                  activeChannel === 'whatsapp' ? 'linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(20, 83, 45, 0.2))' : 
                                  'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 58, 138, 0.2))',
                      borderColor: activeChannel === 'email' ? 'rgba(16, 185, 129, 0.2)' : 
                                   activeChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.2)' : 
                                   'rgba(59, 130, 246, 0.2)',
                    }}
                   >
                     <p className="text-white font-medium leading-relaxed">
                       {activeChannel === 'email' ? 'Hey! You left something special behind. Complete your order now for 5% OFF!' :
                        activeChannel === 'whatsapp' ? 'Thanks! Your order is confirmed. Track it here: ozzyl.com/t/2034 🚚' :
                        'The Premium Watch is ৳2,500. Order now for free delivery! 🛍️'}
                     </p>
                   </div>
                 </motion.div>
              </div>
            </motion.div>

          {/* Features Grid Side */}
          <div className="space-y-6">
            <FeatureCard 
              icon={Mail} 
              title="Email Marketing Automation" 
              desc="Abandoned cart recovery, welcome series, এবং post-purchase emails সেট করুন সহজেই।"
              isActive={activeChannel === 'email'}
              onClick={() => setActiveChannel('email')}
              color="emerald"
            />
            
            <FeatureCard 
              icon={MessageCircle} 
              title="WhatsApp/SMS Automation" 
              desc="SSL Wireless এবং Meta Cloud API ইন্টিগ্রেশন। অর্ডার কনফার্মেশন ও ওটিপি যাবে নিমেষে।"
              isActive={activeChannel === 'whatsapp'}
              onClick={() => setActiveChannel('whatsapp')}
              color="green"
            />

            <FeatureCard 
              icon={MessageSquare} 
              title="Assistant & Messenger Bot" 
              desc="ফেসবুক পেজের কমেন্ট ও মেসেজ অটো-রিপ্লাই। কাস্টমার সাপোর্ট দিন ২৪/৭, কোনো মানুষ ছাড়াই।"
              isActive={activeChannel === 'messenger'}
              onClick={() => setActiveChannel('messenger')}
              color="blue"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  isActive: boolean;
  onClick: () => void;
  color: 'emerald' | 'green' | 'blue';
}

function FeatureCard({ icon: Icon, title, desc, isActive, onClick, color }: FeatureCardProps) {
  const activeColors = {
    emerald: 'border-emerald-500 bg-emerald-500/5',
    green: 'border-[#25D366] bg-[#25D366]/5',
    blue: 'border-[#0084FF] bg-[#0084FF]/5',
  };

  const iconColors = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    green: 'text-[#25D366] bg-[#25D366]/10',
    blue: 'text-[#0084FF] bg-[#0084FF]/10',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
        isActive 
          ? activeColors[color] 
          : 'border-white/5 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          iconColors[color]
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-200'}`}>
            {title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
