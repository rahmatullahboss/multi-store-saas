import React from "react";
import { useRef, useState, useEffect } from 'react';
import { MessageCircle, Bell, Zap, ShoppingCart, Truck, Gift, Check } from 'lucide-react';
import { ASSETS } from '@/config/assets';

// Simple IntersectionObserver-based useInView (replaces framer-motion)
function useInViewSimple(ref: React.RefObject<Element | null>, options?: { once?: boolean; margin?: string }) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); if (options?.once !== false) observer.disconnect(); }
    }, { rootMargin: options?.margin || '0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return inView;
}

export function WhatsAppSMSAutomationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);
  const [activeMessage, setActiveMessage] = useState(0);

  const messages = [
    {
      type: 'order_placed',
      title: 'Order Placed',
      icon: ShoppingCart,
      time: 'Just now',
      content: (
        <>
          <p className="font-bold">🟢 Your Store Name</p>
          <p>আসসালামু আলাইকুম রহিম ভাই!</p>
          <p>আপনার Order #12345 সফলভাবে গৃহীত হয়েছে! ✅</p>
          <div className="my-2 border-l-2 border-gray-200 pl-2">
            <p>📦 Product: Red T-Shirt</p>
            <p>💰 Total: ৳1,299</p>
          </div>
          <p>আমরা শীঘ্রই Delivery করব। ধন্যবাদ! 🙏</p>
        </>
      )
    },
    {
      type: 'shipped',
      title: 'Order Shipped',
      icon: Truck,
      time: 'Tomorrow, 10:00 AM',
      content: (
        <>
          <p className="font-bold">🟢 Your Store Name</p>
          <p>🚚 আপনার Order Ship হয়েছে!</p>
          <div className="my-2 border-l-2 border-gray-200 pl-2">
            <p>Tracking: STD-BD-789456</p>
            <p>📍 Track করুন: ozzyl.com/t/789</p>
          </div>
          <p>আনুমানিক Delivery: আগামীকাল</p>
        </>
      )
    },
    {
      type: 'abandon_cart',
      title: 'Cart Recovery',
      icon: Bell,
      time: '2 hours later',
      content: (
        <>
          <p className="font-bold">🟢 Your Store Name</p>
          <p>হ্যালো! 👋</p>
          <p>আপনার Cart এ কিছু Item রয়ে গেছে!</p>
          <div className="my-2 border-l-2 border-gray-200 pl-2">
            <p>🛒 Red T-Shirt - ৳999</p>
          </div>
          <p>এখনই Order করলে 10% OFF! 🎉</p>
          <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 w-fit">Code: COMEBACK10</p>
          <button className="mt-2 text-blue-500 font-medium text-sm">🛒 Order Complete করুন</button>
        </>
      )
    }
  ];

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isInView, messages.length]);

  return (
    <div className="py-24 bg-[#0F1115] overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Automated Engagement</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Customer এর কাছে পৌঁছান <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Automatically!</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Order কনফার্মেশন থেকে শুরু করে ডেলিভারি আপডেট — সব মেসেজ যাবে অটোমেটিক। আপনাকে আর ম্যানুয়ালি কল করতে হবে না।
            </p>

            {/* Integration Partners */}
            <div className="mb-10">
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">Powering Your Messages</p>
              <div className="flex items-center gap-6">
                 {/* Mock Logos */}
                 <div className="flex items-center gap-2 text-gray-300 font-semibold bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                   <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>
                   WhatsApp Cloud API
                 </div>
                 <div className="flex items-center gap-2 text-gray-300 font-semibold bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                   <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
                   SSL Wireless
                 </div>
              </div>
            </div>

            {/* Trigger Types List */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Order Confirmation', icon: Check },
                { label: 'Shipping Updates', icon: Truck },
                { label: 'Cart Recovery (HUGE!)', icon: Zap },
                { label: 'Birthday Wishes', icon: Gift },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <item.icon className="w-3 h-3 text-green-400" />
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual - Phone Simulator */}
          <div className="relative mx-auto"
          >
             {/* Abstract Glow */}
             <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />

             {/* Phone Frame */}
             <div className="relative w-[320px] mx-auto h-[640px] bg-gray-900 border-[8px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-800 rounded-b-2xl z-20" />
               
               {/* Status Bar Mock */}
               <div className="h-8 bg-gray-900 w-full z-10 relative flex justify-between items-center px-6 pt-2">
                 <span className="text-[10px] text-white">9:41</span>
                 <div className="flex gap-1">
                   <div className="w-3 h-3 rounded-full bg-white/20" />
                   <div className="w-3 h-3 rounded-full bg-white/20" />
                 </div>
               </div>

               {/* Chat App Header */}
               <div className="bg-[#075E54] p-4 pt-4 text-white flex items-center gap-3 shadow-md z-10 relative">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                   <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                      <img src={ASSETS.brand.icon} alt="Store" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40')} />
                   </div>
                 </div>
                 <div>
                   <h3 className="font-semibold text-sm">Your Store Name</h3>
                   <p className="text-[10px] opacity-80">Official Business Account</p>
                 </div>
               </div>

               {/* Chat Area */}
               <div className="p-4 space-y-4 bg-[#ece5dd] h-full" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', opacity: 0.9 }}>
                 {/* Date divider */}
                 <div className="flex justify-center my-2">
                    <span className="bg-[#dcf8c6] text-gray-600 text-[10px] px-2 py-1 rounded shadow-sm">Today</span>
                 </div>
                 
                 {messages.map((msg, idx) => (
                   <div
                     key={idx} className="flex flex-col gap-1 items-start max-w-[85%]"
                   >
                     <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm text-xs text-gray-800 relative group">
                        {msg.content}
                        <span className="absolute bottom-1 right-2 text-[9px] text-gray-400">{msg.time}</span>
                     </div>
                   </div>
                 ))}
                 
                 {/* Typing Indicator */}
                 {activeMessage < messages.length - 1 && (
                    <div className="bg-white px-3 py-2 rounded-full w-fit shadow-sm"
                    >
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full -bounce" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full -bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full -bounce delay-200" />
                      </div>
                    </div>
                 )}
               </div>
             </div>

             {/* ROI Stats Card */}
             <div className="absolute top-1/2 -right-12 translate-y-1/2 bg-white text-gray-900 p-4 rounded-xl shadow-2xl border border-gray-100 hidden md:block w-48"
             >
               <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Impact</h4>
               <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1">
                     <span>Open Rate</span>
                     <span className="text-green-600">98%</span>
                   </div>
                   <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-[98%]" />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs font-medium mb-1">
                     <span>Cart Recovery</span>
                     <span className="text-blue-600">+25%</span>
                   </div>
                   <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[25%]" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        
        </div>
      </div>
    </div>
  );
}
