
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
          
          {/* Visual Side: Review Cards Stack */}
          <div className="relative h-[500px] flex items-center justify-center">
             {/* Background Glow */}
             <div className="absolute inset-0 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

             {REVIEWS.map((review, i) => {
               const isActive = i === activeReview;
               const offset = (i - activeReview + REVIEWS.length) % REVIEWS.length;
               
               return (
                 <motion.div
                   key={review.id}
                   className="absolute w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl"
                   animate={{
                     y: offset * 20,
                     scale: isActive ? 1 : 0.9 - offset * 0.05,
                     zIndex: REVIEWS.length - offset,
                     opacity: isActive ? 1 : 0.5 - offset * 0.2
                   }}
                   transition={{ duration: 0.5 }}
                 >
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                       <img src={review.image} alt={review.user} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                       <div>
                         <h4 className="text-white font-bold text-sm">{review.user}</h4>
                         <div className="flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                           <span className="text-[10px] text-emerald-500 font-medium">{review.role}</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex gap-0.5">
                       {[...Array(5)].map((_, starI) => (
                         <Star 
                           key={starI} 
                           className={`w-4 h-4 ${starI < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} 
                         />
                       ))}
                     </div>
                   </div>

                   <p className="text-gray-300 text-sm italic mb-4">"{review.comment}"</p>

                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center">
                         <img src="/placeholder-product.jpg" className="w-4 h-4 opacity-50" alt="" />
                       </div>
                       <span className="text-xs text-gray-500">{review.product}</span>
                     </div>
                     <div className="flex items-center gap-1 text-gray-500 text-xs">
                       <ThumbsUp className="w-3 h-3" /> {review.likes}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-400">Social Proof</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              কাস্টমারদের<br />
              <span className="text-yellow-500">বিশ্বাস অর্জনের সেরা উপায়</span>
            </h2>
            
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              পণ্য কিনলে রিভিউ দেওয়ার অপশন, লাইক-কমেন্ট সিস্টেম, এবং Verified Buyer ব্যাজ। আপনার স্টোরের বিশ্বাসযোগ্যতা বাড়াবে বহুগুণ।
            </p>

            <div className="grid grid-cols-2 gap-4">
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
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
      <Icon className="w-8 h-8 text-yellow-500 mb-3" />
      <h4 className="text-white font-bold mb-2">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
