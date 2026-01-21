import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquareQuote, CheckCircle2, ThumbsUp, RotateCcw, Wallet, ArrowRightLeft } from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';

const REVIEWS = [
  { 
    id: 1, 
    user: 'Shanta Islam', 
    role: 'Verified Buyer', 
    rating: 5, 
    comment: 'প্রোডাক্ট কোয়ালিটি খুবই ভালো। ডেলিভারিও সুপার ফাস্ট ছিল। আবারো অর্ডার করবো!',
    product: 'Premium Silk Saree',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&fm=webp&q=80',
    likes: 12
  },
  { 
    id: 2, 
    user: 'Rahim Ahmed', 
    role: 'Verified Buyer', 
    rating: 5, 
    comment: 'Highly recommended! সার্ভিস এবং সাপোর্ট দুটোই চমৎকার।',
    product: 'Wireless Earbuds',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&fm=webp&q=80',
    likes: 8
  },
  { 
    id: 3, 
    user: 'Farhana Akter', 
    role: 'Verified Buyer', 
    rating: 4, 
    comment: 'প্যাকেজিং টা আরো ভালো হতে পারতো, তবে প্রোডাক্ট ১০০% অথেনটিক।',
    product: 'Skin Care Set',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&fm=webp&q=80',
    likes: 5
  },
];

export function CustomerExperienceSection() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'returns'>('reviews');
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview(prev => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Side: Review Cards Stack Or Returns Portal */}
          <div className="relative h-[500px] flex items-center justify-center perspective-[1000px]">
             <AnimatePresence mode='wait'>
                {activeTab === 'reviews' ? (
                   <ReviewsVisual key="reviews" reviews={REVIEWS} activeReview={activeReview} />
                ) : (
                   <ReturnsVisual key="returns" />
                )}
             </AnimatePresence>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex gap-4 mb-8">
               <button 
                 onClick={() => setActiveTab('reviews')}
                 className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                   activeTab === 'reviews' 
                   ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' 
                   : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                 }`}
               >
                 Reviews
               </button>
               <button 
                 onClick={() => setActiveTab('returns')}
                 className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                   activeTab === 'returns' 
                   ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                   : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                 }`}
               >
                 Returns
               </button>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
               {activeTab === 'reviews' ? (
                 <>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                      কাস্টমারদের<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">বিশ্বাস অর্জনের সেরা উপায়</span>
                    </h2>
                    <p className="text-white/60 text-lg mb-8 leading-relaxed">
                       পণ্য কিনলে রিভিউ দেওয়ার অপশন, লাইক-কমেন্ট সিস্টেম, এবং Verified Buyer ব্যাজ। আপনার স্টোরের বিশ্বাসযোগ্যতা বাড়াবে বহুগুণ।
                    </p>
                 </>
               ) : (
                 <>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                      রিটার্ন ম্যানেজমেন্ট,<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">এখন আরও সহজ</span>
                    </h2>
                    <p className="text-white/60 text-lg mb-8 leading-relaxed">
                       রিটার্ন নিয়ে আর কোনো ঝামেলা নয়। কাস্টমার নিজেই রিটার্ন রিকোয়েস্ট করতে পারবে এবং রিফান্ড স্ট্যাটাস ট্র্যাক করতে পারবে।
                    </p>
                 </>
               )}
            </motion.div>


            <div className="grid sm:grid-cols-2 gap-4">
              {activeTab === 'reviews' ? (
                <>
                  <FeatureBox 
                    icon={MessageSquareQuote} 
                    title="Photo Reviews" 
                    desc="কাস্টমাররা প্রোডাক্টের ছবি সহ রিভিউ দিতে পারবে।" 
                    color="yellow"
                  />
                  <FeatureBox 
                    icon={CheckCircle2} 
                    title="Verified Badge" 
                    desc="শুধুমাত্র আসল ক্রেতারাই ভেরিফাইড রিভিউ দিতে পারবে।" 
                    color="yellow"
                  />
                </>
              ) : (
                <>
                  <FeatureBox 
                    icon={ArrowRightLeft} 
                    title="Self-Serve Portal" 
                    desc="কাস্টমার পোর্টাল থেকে সহজেই এক্সচেঞ্জ বা রিটার্ন রিকোয়েস্ট।" 
                    color="red"
                  />
                  <FeatureBox 
                    icon={Wallet} 
                    title="Auto Refund" 
                    desc="bkash/Nagad রিফান্ড প্রসেস ট্র্যাকিং এবং অটোমেশন।" 
                    color="red"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Visual Components ---


interface Review {
  id: number;
  user: string;
  role: string;
  rating: number;
  comment: string;
  product: string;
  image: string;
  likes: number;
}

function ReviewsVisual({ reviews, activeReview }: { reviews: Review[], activeReview: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full flex items-center justify-center">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-[80px] animate-pulse" />

        {reviews.map((review, i) => {
          const isActive = i === activeReview;
          const offset = (i - activeReview + reviews.length) % reviews.length;
          
          return (
            <motion.div
              key={review.id}
              className={`absolute w-full max-w-md p-6 rounded-[24px] shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-700 ${
                isActive ? 'bg-white/[0.05] border-yellow-500/30' : 'bg-white/[0.02]'
              }`}
              animate={{
                y: offset * 30 - (isActive ? 30 : 0),
                scale: isActive ? 1.05 : 0.9 - offset * 0.05,
                zIndex: reviews.length - offset,
                opacity: isActive ? 1 : 0.4 - offset * 0.1,
                rotateX: isActive ? 0 : 5,
              }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: isActive ? '0 25px 50px -12px rgba(234, 179, 8, 0.15)' : 'none'
              }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-500 rounded-full blur opacity-20" />
                    <img src={review.image} alt={review.user} className="relative w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                    <div className="absolute -bottom-1 -right-1 bg-[#0A0A0F] rounded-full p-0.5 border border-white/10">
                      <div className="bg-emerald-500/20 p-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base tracking-wide">{review.user}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified Buyer</span>
                  </div>
                </div>
                <div className="flex gap-1 bg-black/20 p-1.5 rounded-full border border-white/5">
                  {[...Array(5)].map((_, starI) => (
                    <Star 
                      key={starI} 
                      className={`w-3.5 h-3.5 ${starI < review.rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-700'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Quote Decoration */}
              <div className="absolute top-6 right-6 opacity-10">
                <MessageSquareQuote className="w-16 h-16 text-white" />
              </div>

              <p className="text-white/90 text-sm leading-relaxed mb-6 font-medium relative z-10 pl-4 border-l-2 border-yellow-500/50">
                "{review.comment}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-yellow-500/30 transition-colors overflow-hidden">
                    <img 
                      src={
                          review.product.includes('Saree') ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&h=100&fit=crop&fm=webp&q=80" :
                          review.product.includes('Earbuds') ? "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop&fm=webp&q=80" :
                          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop&fm=webp&q=80"
                      } 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      loading="lazy" 
                      alt={review.product} 
                    />
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-yellow-400 transition-colors font-medium">{review.product}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40 text-xs bg-white/5 px-2 py-1 rounded-full border border-white/5">
                  <ThumbsUp className="w-3 h-3" /> <span className="font-mono">{review.likes}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
    </motion.div>
  )
}

function ReturnsVisual() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative w-full max-w-sm">
        {/* Phone Mockup or Portal Card */}
        <div className="bg-[#0F1419] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
            <div className="h-10 bg-[#151a21] border-b border-white/5 flex items-center justify-center text-xs text-white/40 font-mono">
               returns.ozzyl.com
            </div>
            
            <div className="p-6 space-y-5">
               <div className="font-bold text-white text-lg mb-4 text-center">Return / Exchange</div>
               
               {/* Order Input */}
               <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                 <label className="text-xs text-white/40 block mb-1">Order Number</label>
                 <div className="text-white font-mono">#ORD-99382</div>
               </div>

               {/* Item Selection */}
               <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                  <div>
                    <div className="text-white text-sm">Premium Denim Jacket</div>
                    <div className="text-xs text-red-400">Reason: Size issue</div>
                  </div>
               </div>

               {/* Status Steps */}
               <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex gap-3">
                   <div className="flex flex-col items-center">
                     <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-black" /></div>
                     <div className="w-0.5 h-6 bg-white/10" />
                   </div>
                   <div className="text-xs text-white/60 pt-0.5">Request Approved</div>
                 </div>
                 <div className="flex gap-3">
                   <div className="flex flex-col items-center">
                     <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"><RotateCcw className="w-3 h-3 text-black" /></div>
                     <div className="w-0.5 h-6 bg-white/10" />
                   </div>
                   <div className="text-xs text-emerald-400 pt-0.5">Pickup Scheduled</div>
                 </div>
                 <div className="flex gap-3">
                   <div className="flex flex-col items-center">
                     <div className="w-4 h-4 border-2 border-white/20 rounded-full" />
                   </div>
                   <div className="text-xs text-white/30 pt-0.5">Refund Processed</div>
                 </div>
               </div>

               <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors">
                 Track Status
               </button>
            </div>
        </div>
    </motion.div>
  )
}

interface FeatureBoxProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: 'yellow' | 'red';
}

function FeatureBox({ icon: Icon, title, desc, color }: FeatureBoxProps) {
  const colors = {
    yellow: 'group-hover:text-yellow-400 from-yellow-500/10 to-orange-500/10 border-yellow-500/20 text-yellow-500',
    red: 'group-hover:text-red-400 from-red-500/10 to-pink-500/10 border-red-500/20 text-red-500',
  }
  
  return (
    <motion.div 
      whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all duration-300 group hover:border-white/10 hover:shadow-lg"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${colors[color].replace('group-hover:text-yellow-400', '').replace('group-hover:text-red-400', '')}`}>
        <Icon className={`w-6 h-6 ${color === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`} />
      </div>
      <h4 className={`text-white font-bold mb-2 transition-colors ${color === 'yellow' ? 'group-hover:text-yellow-400' : 'group-hover:text-red-400'}`}>{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">{desc}</p>
    </motion.div>
  );
}
