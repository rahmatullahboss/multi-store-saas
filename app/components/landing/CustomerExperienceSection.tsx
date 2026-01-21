
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, CheckCircle2, ThumbsUp } from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';

const REVIEWS = [
  { 
    id: 1, 
    user: 'Shanta Islam', 
    role: 'Verified Buyer', 
    rating: 5, 
    comment: 'প্রোডাক্ট কোয়ালিটি খুবই ভালো। ডেলিভারিও সুপার ফাস্ট ছিল। আবারো অর্ডার করবো!',
    product: 'Premium Silk Saree',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    likes: 12
  },
  { 
    id: 2, 
    user: 'Rahim Ahmed', 
    role: 'Verified Buyer', 
    rating: 5, 
    comment: 'Highly recommended! সার্ভিস এবং সাপোর্ট দুটোই চমৎকার।',
    product: 'Wireless Earbuds',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    likes: 8
  },
  { 
    id: 3, 
    user: 'Farhana Akter', 
    role: 'Verified Buyer', 
    rating: 4, 
    comment: 'প্যাকেজিং টা আরো ভালো হতে পারতো, তবে প্রোডাক্ট ১০০% অথেনটিক।',
    product: 'Skin Care Set',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    likes: 5
  },
];

export function CustomerExperienceSection() {
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
          
          {/* Visual Side: Review Cards Stack - Premium 3D Effect */}
          <div className="relative h-[500px] flex items-center justify-center perspective-[1000px]">
             {/* Background Glow */}
             <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-[80px] animate-pulse" />

             {REVIEWS.map((review, i) => {
               const isActive = i === activeReview;
               const offset = (i - activeReview + REVIEWS.length) % REVIEWS.length;
               
               return (
                 <motion.div
                   key={review.id}
                   className={`absolute w-full max-w-md p-6 rounded-[24px] shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-700 ${
                     isActive ? 'bg-white/[0.05] border-yellow-500/30' : 'bg-white/[0.02]'
                   }`}
                   animate={{
                     y: offset * 30 - (isActive ? 30 : 0),
                     scale: isActive ? 1.05 : 0.9 - offset * 0.05,
                     zIndex: REVIEWS.length - offset,
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
                                review.product.includes('Saree') ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&h=100&fit=crop" :
                                review.product.includes('Earbuds') ? "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop" :
                                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop" // Skincare
                            } 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
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
          </div>

          {/* Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-yellow-400 uppercase tracking-wide">Social Proof</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              কাস্টমারদের<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">বিশ্বাস অর্জনের সেরা উপায়</span>
            </h2>
            
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              পণ্য কিনলে রিভিউ দেওয়ার অপশন, লাইক-কমেন্ট সিস্টেম, এবং Verified Buyer ব্যাজ। আপনার স্টোরের বিশ্বাসযোগ্যতা বাড়াবে বহুগুণ।
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <FeatureBox 
                icon={MessageSquareQuote} 
                title="Photo Reviews" 
                desc="কাস্টমাররা প্রোডাক্টের ছবি সহ রিভিউ দিতে পারবে।" 
              />
              <FeatureBox 
                icon={CheckCircle2} 
                title="Verified Badge" 
                desc="শুধুমাত্র আসল ক্রেতারাই ভেরিফাইড রিভিউ দিতে পারবে।" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureBoxProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

function FeatureBox({ icon: Icon, title, desc }: FeatureBoxProps) {
  return (
    <motion.div 
      whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all duration-300 group hover:border-yellow-500/20 hover:shadow-[0_10px_30px_-10px_rgba(234,179,8,0.1)]"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-yellow-500" />
      </div>
      <h4 className="text-white font-bold mb-2 group-hover:text-yellow-400 transition-colors">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">{desc}</p>
    </motion.div>
  );
}
