import { Mail, MessageCircle, MessageSquare, Zap, MousePointer2, Image as ImageIcon, Type } from 'lucide-react';
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
    }, 6000); // Increased duration to allow users to absorb the visuals
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-400">Smart Automation</span>
          </div>
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
            {/* Visual Playground - Premium Glass Card */}
            <div className="relative h-[500px] rounded-[32px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col"
            >
               {/* Header / Top Bar of the Mock Interface */}
               <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                 </div>
                 <div className="text-xs font-mono text-white/30 uppercase tracking-widest">
                   {activeChannel === 'email' ? 'Email_Builder.exe' : activeChannel === 'whatsapp' ? 'WA_Cloud_API.exe' : 'Messenger_Bot.exe'}
                 </div>
               </div>

               {/* Dynamic Content Area */}
               <div className="flex-1 relative overflow-hidden p-6">
                  
                    {activeChannel === 'email' && <EmailBuilderVisual key="email" />}
                    {activeChannel === 'whatsapp' && <WhatsAppVisual key="whatsapp" />}
                    {activeChannel === 'messenger' && <MessengerVisual key="messenger" />}
                  
               </div>

               {/* Active Status Indicator */}
               <div className="h-10 border-t border-white/10 flex items-center px-6 gap-3 bg-white/[0.02]">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full -pulse" />
                  <span className="text-xs text-emerald-400 font-medium font-mono">System Active • Processing Events...</span>
               </div>
            </div>

          {/* Features Grid Side */}
          <div className="space-y-6">
            <FeatureCard 
              icon={Mail} 
              title="Email Marketing Automation" 
              desc="Drag & Drop বিল্ডার দিয়ে প্রফেশনাল ইমেইল ক্যাম্পেইন তৈরি করুন। Abandoned Cart রিকভারি হবে অটোমেটিক।"
              isActive={activeChannel === 'email'}
              onClick={() => setActiveChannel('email')}
              color="emerald"
            />
            
            <FeatureCard 
              icon={MessageCircle} 
              title="WhatsApp/SMS Automation" 
              desc="অফিসিয়াল Meta Cloud API ইন্টিগ্রেশন। অর্ডার কনফার্মেশন ও ট্র্যাকিং আপডেট যাবে কাস্টমারের হোয়াটসঅ্যাপে।"
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

// --- Visual Components ---

function EmailBuilderVisual() {
  return (
    <div className="h-full flex gap-4"
    >
      {/* Sidebar Toolbelt */}
      <div className="w-16 flex flex-col gap-3 py-2">
         {[ImageIcon, Type, MousePointer2].map((Icon, i) => (
           <div key={i} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
             <Icon className="w-5 h-5 text-white/50" />
           </div>
         ))}
         <div className="absolute top-8 left-8 pointer-events-none z-20"
         >
            <MousePointer2 className="w-6 h-6 text-white drop-shadow-lg fill-black/50" />
         </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white rounded-lg p-6 shadow-xl relative overflow-hidden">
        <div className="space-y-4">
           {/* Header Img */}
           <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
             <ImageIcon className="text-gray-400 w-8 h-8" />
           </div>
           {/* Text Lines */}
           <div className="space-y-2">
             <div className="h-4 bg-gray-200 rounded w-3/4" />
             <div className="h-4 bg-gray-200 rounded w-full" />
             <div className="h-4 bg-gray-200 rounded w-5/6" />
           </div>
           {/* Button - Being Dropped */}
           <div className="mt-6"
           >
             <div className="h-10 bg-emerald-500 rounded-md w-1/2 mx-auto flex items-center justify-center text-white font-bold text-sm shadow-lg">
               Shop Now →
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function WhatsAppVisual() {
  return (
    <div className="h-full flex flex-col relative"
    >
       {/* Chat Container */}
       <div className="flex-1 space-y-4 p-4">
          <div className="flex justify-center">
            <span className="text-[10px] bg-white/10 text-white/50 px-2 py-1 rounded">Today</span>
          </div>

          <div className="max-w-[80%] bg-[#1F2C34] p-3 rounded-2xl rounded-tl-none border border-white/5"
          >
             <p className="text-white text-sm">Hi! Is the Premium Watch available?</p>
             <span className="text-[10px] text-white/30 block text-right mt-1">10:23 AM</span>
          </div>

          <div className="max-w-[80%] ml-auto bg-[#005C4B] p-3 rounded-2xl rounded-tr-none shadow-lg"
          >
             <p className="text-white text-sm">Yes! It's in stock. Order now for <span className="font-bold">free delivery</span>! 🚚</p>
             <span className="text-[10px] text-white/50 block text-right mt-1 flex items-center justify-end gap-1">
               10:23 AM <span className="text-blue-300">✓✓</span>
             </span>
          </div>
          
          <div className="max-w-[80%] ml-auto bg-[#005C4B] p-2 rounded-xl rounded-tr-none shadow-lg mt-1"
          >
            <div className="bg-black/20 rounded-lg h-32 w-full mb-2 flex items-center justify-center">
               <ImageIcon className="text-white/20 w-8 h-8"/>
            </div>
          </div>
       </div>
    </div>
  )
}

function MessengerVisual() {
    return (
      <div className="h-full flex flex-col"
      >
         <div className="flex-1 space-y-4 p-4">
            <div className="flex items-end gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none text-white text-sm">
                 How can we help?
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2"
            >
              {['Track Order', 'Return Policy', 'Chat with Human'].map((txt, i) => (
                <div key={i} className="whitespace-nowrap px-3 py-1.5 rounded-full border border-blue-500/30 text-blue-400 text-xs bg-blue-500/5 cursor-pointer hover:bg-blue-500/10">
                   {txt}
                </div>
              ))}
            </div>
         </div>
      </div>
    )
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
    <div onClick={onClick}
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
    </div>
  );
}
