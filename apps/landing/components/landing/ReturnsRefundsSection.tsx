import React from "react";
import { useRef } from 'react';
import { RotateCcw, Check, X, MessageSquare } from 'lucide-react';

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

export function ReturnsRefundsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  return (
    <div className="py-24 bg-[#0A0A0F] relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Workflow Visual */}
          <div
            
            className="bg-[#0F1115] border border-gray-800 rounded-3xl p-8 shadow-2xl relative"
          >
             {/* Admin Dashboard Mockup */}
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <RotateCcw className="w-5 h-5 text-purple-400" /> Return Requests
               </h3>
               <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">1 Pending</span>
             </div>

             <div className="space-y-4">
                {/* Request Card 1 */}
                <div 
                   
                   className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                >
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs text-purple-400 font-mono mb-1 block">#RTN-8921</span>
                        <h4 className="text-white font-medium">Red T-Shirt (Size L)</h4>
                        <p className="text-xs text-gray-400">Reason: Size not matching</p>
                      </div>
                      <div className="text-right">
                         <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Pending</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700/50">
                      <button className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                        <Check className="w-3 h-3 inline mr-1" /> Approve
                      </button>
                      <button className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                        <X className="w-3 h-3 inline mr-1" /> Reject
                      </button>
                      <button className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                {/* Request Card 2 (Processed) */}
                <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-800 opacity-60">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 font-mono">#RTN-8920</span>
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Refunded</span>
                   </div>
                   <h4 className="text-gray-400 font-medium">Blue Jeans</h4>
                   <p className="text-xs text-gray-600">Refund: ৳1,299</p>
                </div>
             </div>

             {/* Workflow Steps Indicator */}
             <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8">
               <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white border-4 border-[#0A0A0F] z-10">1</div>
               <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-purple-500 mx-auto -my-4" />
               <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white border-4 border-[#0A0A0F] z-10">2</div>
               <div className="w-0.5 h-16 bg-gradient-to-b from-purple-500 to-green-500 mx-auto -my-4" />
               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white border-4 border-[#0A0A0F] z-10">3</div>
             </div>
          </div>

          {/* Right: Content */}
          <div className="lg:pl-8">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
               <RotateCcw className="w-4 h-4 text-purple-400" />
               <span className="text-sm font-semibold text-purple-400">After-Sales Service</span>
             </div>
             
             <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
               Return & Refund — <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">এখন আরও সহজ</span>
             </h2>
             <p className="text-xl text-gray-400 mb-8">
               কাস্টমার এখন নিজেই রিটার্ন রিকোয়েস্ট করতে পারবে। আপনি জাস্ট Approve করবেন, রিফান্ড অটোমেটিক ক্যালকুলেট হবে।
             </p>

             <div className="space-y-6">
               {[
                 { title: 'Auto Refund Policy Generation', desc: 'শর্তাবলী পেজ অটোমেটিক জেনারেট হবে' },
                 { title: 'Partial Refund Option', desc: 'পুরো টাকা ফেরত না দিয়ে পার্শিয়াল রিফান্ড দিন' },
                 { title: 'Exchange Workflow', desc: 'টাকা রিফান্ড না করে প্রোডাক্ট এক্সচেঞ্জ ম্যানেজ করুন' },
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-4">
                   <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                     <Check className="w-3.5 h-3.5 text-purple-400" />
                   </div>
                   <div>
                     <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                     <p className="text-gray-500">{item.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-10 p-4 bg-gray-800/50 rounded-xl border border-gray-700 inline-block">
               <p className="text-white font-medium flex items-center gap-2">
                 💡 Did you know?
               </p>
               <p className="text-sm text-gray-400 mt-1">
                 "Easy Return Policy থাকলে সেলস বাড়ে প্রায় ২৫%!"
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
