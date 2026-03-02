import { useRef } from 'react';
import { MessageCircle, User } from 'lucide-react';

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

export function MessengerIntegrationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  return (
    <div className="py-24 bg-[#0F1115] overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Bangladesh's #1 Channel</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Messenger এ Chat — <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Dashboard এ দেখুন</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
             কাস্টমার যেখানে সবচেয়ে বেশি একটিভ, সেখানেই তাদের সাথে কানেক্ট করুন। সব মেসেজ এক জায়গায়!
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
           {/* Connection Visual */}
          <div className="flex justify-between items-center mb-12 relative z-10">
             {/* Store */}
             <div 
               
               className="bg-gray-800 p-6 rounded-2xl border border-gray-700 text-center w-48 shadow-lg"
             >
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🏪</span>
                </div>
                <h3 className="text-white font-bold">Your Store</h3>
             </div>

             {/* Connection Line */}
             <div className="flex-1 h-0.5 bg-gray-700 relative mx-4">
                <div 
                  
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent bg-[length:200%_100%] animate-shimmer"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F1115] px-3 text-xs text-blue-400 font-mono">
                  SYNCED
                </div>
             </div>

             {/* Messenger */}
             <div 
               
               className="bg-blue-600 p-6 rounded-2xl border border-blue-500 text-center w-48 shadow-lg shadow-blue-500/20"
             >
                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-600 fill-blue-600" />
                </div>
                <h3 className="text-white font-bold">Messenger</h3>
             </div>
          </div>

          {/* Aggregated Dashboard Mockup */}
          <div
             
             className="bg-[#111318] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
          >
             <div className="flex border-b border-gray-800">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-gray-800 bg-gray-900/50">
                   <div className="p-4 border-b border-gray-800">
                      <input type="text" placeholder="Search chats..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                   </div>
                   <div className="overflow-y-auto h-[400px]">
                      {[
                        { name: 'Rakib Hasan', msg: 'Price koto bhai?', time: '2m', active: true },
                        { name: 'Sumaiya', msg: 'Delivery kobe pabo?', time: '15m', active: false },
                        { name: 'Tanvir', msg: 'Thanks for the product!', time: '1h', active: false },
                      ].map((chat, idx) => (
                        <div key={idx} className={`p-4 flex gap-3 hover:bg-gray-800 cursor-pointer ${chat.active ? 'bg-blue-500/10 border-r-2 border-blue-500' : ''}`}>
                           <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-gray-400" />
                           </div>
                           <div className="overflow-hidden">
                              <div className="flex justify-between mb-1">
                                 <h4 className="font-bold text-white text-sm truncate">{chat.name}</h4>
                                 <span className="text-xs text-gray-500">{chat.time}</span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{chat.msg}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col h-[480px] bg-[#0F1115]">
                   <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                         </div>
                         <div>
                            <h4 className="font-bold text-white text-sm">Rakib Hasan</h4>
                            <p className="text-xs text-blue-400">Customer • 2 Orders</p>
                         </div>
                      </div>
                      <button className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700">View Profile</button>
                   </div>
                   
                   <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      <div className="flex justify-start">
                         <div className="bg-gray-800 text-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm">
                            Ei tshirt tar price koto bhai?
                         </div>
                      </div>
                      <div className="flex justify-end">
                         <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm">
                            ধন্যবাদ ভাইয়া নক দেওয়ার জন্য। এটার দাম ৯৯৯ টাকা। সাথে ডেলিভারি চার্জ ৬০ টাকা।
                         </div>
                      </div>
                      <div className="flex justify-start">
                         <div className="bg-gray-800 text-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm">
                            Ok, ami nite chai. Kivabe order korbo?
                         </div>
                      </div>
                   </div>

                   <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                      <div className="flex gap-2">
                         <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                         <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition">
                            <MessageCircle className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
             <div className="p-4">
                <h4 className="text-3xl font-bold text-white mb-2">95%+</h4>
                <p className="text-sm text-gray-400">Internet Users Messenger ব্যবহার করে</p>
             </div>
             <div className="p-4">
                <h4 className="text-3xl font-bold text-white mb-2">10x</h4>
                <p className="text-sm text-gray-400">Average Response Time এ Better Conversion</p>
             </div>
             <div className="p-4">
                <h4 className="text-3xl font-bold text-white mb-2">Context</h4>
                <p className="text-sm text-gray-400">যার সাথে চ্যাট করছেন তার অর্ডার হিস্ট্রি দেখুন</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
