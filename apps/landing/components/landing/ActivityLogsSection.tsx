import React from "react";
import { useRef } from 'react';
import { ClipboardList, ShieldAlert, History, User } from 'lucide-react';

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

export function ActivityLogsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  const logs = [
    { time: '3:45 PM', user: 'রাসেল', action: 'updated Order #12345', details: 'Status: Processing → Shipped', ip: '103.123.xxx.xxx', type: 'info' },
    { time: '3:30 PM', user: 'সুমি', action: 'added new Product', details: '"Blue Denim Jacket" - ৳2,499', ip: '103.456.xxx.xxx', type: 'success' },
    { time: '2:15 PM', user: 'আপনি', action: 'changed Store Settings', details: 'Shipping Zone updated', ip: '103.789.xxx.xxx', type: 'warning' },
    { time: '1:00 PM', user: 'Unknown', action: 'Failed Login Attempt', details: 'Blocked by Firewall', ip: '45.123.xxx.xxx', type: 'danger' },
  ];

  return (
    <div className="py-24 bg-[#0A0A0F] relative" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
               <History className="w-4 h-4 text-cyan-400" />
               <span className="text-sm font-semibold text-cyan-400">Audit Trail</span>
             </div>
             <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
               কে কি করেছে — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">সব Record আছে</span>
             </h2>
             <p className="text-xl text-gray-400 mb-8">
               স্টাফদের কাজের স্বচ্ছতা নিশ্চিত করুন। ভুল হলে কে করেছে তা সহজেই বের করতে পারবেন।
             </p>

             <div className="grid grid-cols-2 gap-6">
               {[
                 { title: 'Login Activity', desc: 'কে কখন লগইন করলো' },
                 { title: 'Order Changes', desc: 'কে স্ট্যাটাস চেঞ্জ করলো' },
                 { title: 'Product Updates', desc: 'কে প্রাইস চেঞ্জ করলো' },
                 { title: 'Settings Audit', desc: 'সেন্সিটিভ চেঞ্জ লগ' },
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-3">
                   <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-cyan-400">
                     <ClipboardList className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-white font-semibold">{item.title}</h4>
                     <p className="text-sm text-gray-500">{item.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Right: Live Feed Mockup */}
          <div className="order-1 lg:order-2 bg-[#0F1115] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative"
          >
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full -pulse" /> Live Activity Feed
               </h3>
               <button className="text-xs text-gray-500 hover:text-white transition">Export Logs</button>
             </div>

             <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-800" />

                {logs.map((log, idx) => (
                  <div
                    key={idx} className="relative flex gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition cursor-default z-10"
                  >
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-[#0F1115] ${
                      log.type === 'danger' ? 'bg-red-500 text-white' : 
                      log.type === 'success' ? 'bg-green-500 text-white' : 
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {log.type === 'danger' ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-white">
                          <span className="font-bold text-cyan-300">{log.user}</span> {log.action}
                        </p>
                        <span className="text-xs text-gray-500">{log.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                      <p className="text-[10px] text-gray-600 mt-1 font-mono">IP: {log.ip}</p>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-6 text-center">
               <button className="text-sm text-gray-500 hover:text-white transition">Load More Activity...</button>
             </div>
          </div>
        
        </div>
      </div>
    </div>
  );
}
