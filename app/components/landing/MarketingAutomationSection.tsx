
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MessageSquare, Zap, Send, MousePointerClick } from 'lucide-react';
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
          {/* Interactive Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden p-8 flex flex-col"
          >
            {/* Top Bar simulating a device/app */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                  activeChannel === 'email' ? 'bg-emerald-500/20 text-emerald-500' :
                  activeChannel === 'whatsapp' ? 'bg-[#25D366]/20 text-[#25D366]' :
                  'bg-[#0084FF]/20 text-[#0084FF]'
                }`}>
                  {activeChannel === 'email' && <Mail className="w-5 h-5" />}
                  {activeChannel === 'whatsapp' && <MessageCircle className="w-5 h-5" />}
                  {activeChannel === 'messenger' && <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-white font-bold">
                    {activeChannel === 'email' ? 'Email Campaign' :
                     activeChannel === 'whatsapp' ? 'WhatsApp Business' :
                     'Facebook Messenger'}
                  </h4>
                  <p className="text-xs text-white/50">Automated System</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
            </div>

            {/* Simulated Chat/Content Area */}
            <div className={`flex-1 flex flex-col justify-center space-y-4 transition-all duration-500 relative`}>
               {/* Background Elements */}
               <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />
               
               {/* Message Bubble 1 (Trigger) */}
               <motion.div
                key={`${activeChannel}-trigger`}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 rounded-2xl p-4 max-w-[80%] self-start border border-white/5 ml-2"
               >
                 <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
                   <MousePointerClick className="w-3 h-3" /> Trigger Event
                 </div>
                 <p className="text-sm text-white/90">
                   {activeChannel === 'email' ? 'Customer abandoned cart containing "Premium Watch"' :
                    activeChannel === 'whatsapp' ? 'Order #2034 placed successfully' :
                    'Customer asked "What is the price?"'}
                 </p>
               </motion.div>

               {/* Connection Line */}
               <motion.div
                 initial={{ height: 0 }}
                 animate={{ height: 40 }}
                 className="w-px bg-white/20 self-center border-l border-dashed border-white/30"
               />

               {/* Action Node */}
               <motion.div
                 key={`${activeChannel}-action`}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.4, delay: 0.3 }}
                 className="self-center bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-mono border border-emerald-500/30 flex items-center gap-2"
               >
                 <Zap className="w-3 h-3" /> Sending Automated Reply...
               </motion.div>

               {/* Connection Line */}
               <motion.div
                 initial={{ height: 0 }}
                 animate={{ height: 40 }}
                 className="w-px bg-white/20 self-center border-l border-dashed border-white/30"
               />

               {/* Message Bubble 2 (Response) */}
               <motion.div
                key={`${activeChannel}-response`}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="rounded-2xl p-4 max-w-[80%] self-end border ml-auto mr-2 shadow-lg"
                style={{
                  backgroundColor: activeChannel === 'email' ? 'rgba(16, 185, 129, 0.1)' : 
                                  activeChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.1)' : 
                                  'rgba(0, 132, 255, 0.1)',
                  borderColor: activeChannel === 'email' ? 'rgba(16, 185, 129, 0.3)' : 
                               activeChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.3)' : 
                               'rgba(0, 132, 255, 0.3)',
                }}
               >
                 <div className="flex items-center gap-2 mb-2 text-xs opacity-60">
                   <Send className="w-3 h-3" /> Sent Successfully
                 </div>
                 <p className="text-sm text-white/90 font-medium">
                   {activeChannel === 'email' ? 'Forgot something? Complete your purchase now and get 5% OFF!' :
                    activeChannel === 'whatsapp' ? 'Thanks for your order! Track your delivery here: ozzyl.com/t/2034' :
                    'The price for Premium Watch is 2500 BDT. Would you like to order now?'}
                 </p>
                 {activeChannel === 'email' && (
                    <div className="mt-2 text-xs bg-emerald-500 text-black px-3 py-1 rounded inline-block font-bold">Shop Now</div>
                 )}
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
