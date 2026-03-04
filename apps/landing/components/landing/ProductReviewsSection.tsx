import React from "react";
import { useRef } from 'react';
import { Star, CheckCircle2, Camera } from 'lucide-react';

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

export function ProductReviewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  const reviews = [
    { name: 'আরিফ হোসেন', rating: 5, date: '2 days ago', text: 'দারুণ Quality! Delivery ও অনেক দ্রুত হয়েছে। আবার কিনব।', verified: true, photo: true },
    { name: 'সাবরিনা আক্তার', rating: 4, date: '5 days ago', text: 'Product ভালো, তবে Size একটু বড় হয়ে গেছে।', verified: true, photo: false },
    { name: 'তানভীর আহমেদ', rating: 5, date: '1 week ago', text: 'Best product at this price point. Highly recommended!', verified: true, photo: true },
  ];

  return (
    <div className="py-24 bg-[#0F1115] relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">Trust Builder</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Customer এর কথাই — <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">আসল Proof</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Social Proof সেলস বাড়ায়। আমাদের বিল্ট-ইন রিভিউ সিস্টেম দিয়ে বিশ্বাস অর্জন করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Card */}
          <div className="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-lg"
          >
             <h3 className="text-6xl font-black text-white mb-2">4.8</h3>
             <div className="flex gap-1 mb-4">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
             </div>
             <p className="text-gray-400 mb-8">Based on 482 Reviews</p>
             
             <div className="w-full space-y-3">
               {[5, 4, 3, 2, 1].map((star) => (
                 <div key={star} className="flex items-center gap-3 w-full">
                   <div className="flex items-center gap-1 w-12 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-300">{star}</span>
                      <Star className="w-3 h-3 text-gray-500" />
                   </div>
                   <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" 
                      />
                   </div>
                   <span className="text-xs text-gray-500 w-8 text-right">{star === 5 ? '85%' : star === 4 ? '10%' : '2%'}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Feature Highlight Cards */}
          <div className="md:col-span-2 space-y-6">
            {reviews.map((review, idx) => (
              <div
                key={idx} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-md flex items-center gap-2">
                        {review.name}
                        {review.verified && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      </h4>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-500">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500" />)}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{review.text}</p>
                
                {review.photo && (
                  <div className="flex gap-2 mb-4">
                     <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500">
                        <Camera className="w-5 h-5" />
                     </div>
                  </div>
                )}
                
                {review.verified && (
                   <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                     <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                   </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Impact */}
        <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
           <div>
             <h4 className="text-lg font-bold text-white">Impact on Conversion</h4>
             <p className="text-gray-400 text-sm">Products with reviews convert up to 270% better!</p>
           </div>
           
           <div className="flex gap-8">
              <div className="text-center">
                 <p className="text-3xl font-bold text-white mb-1">93%</p>
                 <p className="text-xs text-gray-500 uppercase">Customers Read Reviews</p>
              </div>
              <div className="text-center">
                 <p className="text-3xl font-bold text-white mb-1">65%</p>
                 <p className="text-xs text-gray-500 uppercase">Trust Photo Reviews</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
