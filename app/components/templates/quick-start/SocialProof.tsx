import { Star, CheckCircle, ThumbsUp, MessageCircle, Facebook } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function SocialProof({ theme, config }: SectionProps) {
  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-2">
              গ্রাহকরা কি <span className="text-[#E63946]">বলছেন</span>
            </h2>
            <p className="text-[#6C757D]">আমাদের সন্তুষ্ট গ্রাহকদের রিয়েল রিভিউ</p>
          </div>
          
          <div className="flex gap-8 md:gap-12">
            {[
              { num: "১০,০০০+", label: "খুশি গ্রাহক" },
              { num: "৪.৮", label: "গড় রেটিং" },
              { num: "৯৮%", label: "সন্তুষ্টি হার" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#E63946]">{stat.num}</div>
                <div className="text-sm md:text-base text-[#6C757D]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {(config.testimonials?.length ? config.testimonials : [
            { name: "মোহাম্মদ রাকিব", loc: "ঢাকা, গুলশান", text: "অসাধারণ প্রোডাক্ট! ২৪ ঘণ্টার মধ্যে ডেলিভারি পেয়ে গেছি। কোয়ালিটি দেখে অবাক হয়ে গেলাম। অবশ্যই আবার অর্ডার করবো। ধন্যবাদ!" },
            { name: "ফাতেমা আক্তার", loc: "চট্টগ্রাম", text: "অনলাইনে কেনাকাটা করতে ভয় পেতাম। কিন্তু এখানে ক্যাশ অন ডেলিভারি থাকায় নিশ্চিন্তে অর্ডার করেছি। প্রোডাক্ট একদম পারফেক্ট!" },
            { name: "করিম উদ্দিন", loc: "সিলেট", text: "৩ দিনে সিলেটে ডেলিভারি পেয়েছি। প্যাকেজিং খুব সুন্দর ছিল। প্রোডাক্ট ব্যবহার করে খুব ভালো ফলাফল পাচ্ছি। রেকমেন্ড করছি।" }
          ]).map((review: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gray-200 rounded-full border-2 border-[#E63946] overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${review.name}&background=random`} alt={review.name} />
                </div>
                <div>
                  <h5 className="font-bold text-[#1A1A2E]">{review.name}</h5>
                  <p className="text-xs text-[#6C757D]">{review.loc}</p>
                </div>
              </div>
              <div className="flex text-[#FFD700] mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-[#6C757D] italic mb-4 leading-relaxed">"{review.text}"</p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2A9D8F]">
                <CheckCircle size={14} />
                ভেরিফাইড ক্রেতা
              </div>
            </div>
          ))}
        </div>

        {/* Facebook Style Reviews */}
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center text-white">
              <Facebook size={28} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A2E]">ফেসবুক পেজ রিভিউ</h4>
              <p className="text-sm text-[#6C757D]">আমাদের ফেসবুক পেজ থেকে রিয়েল কমেন্ট</p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { name: "সাদিয়া রহমান", time: "২ দিন আগে", text: "ভাইয়া আলহামদুলিল্লাহ প্রোডাক্ট পেয়েছি। অনেক সুন্দর হয়েছে। আমার বোনের জন্যও একটা অর্ডার করতে চাই। ❤️❤️", likes: 23 },
              { name: "আরিফুল ইসলাম", time: "৫ দিন আগে", text: "রংপুরে ৪ দিনে ডেলিভারি পেয়েছি। প্রোডাক্ট একদম ছবির মতো। প্রথমে একটু সন্দেহ ছিল কিন্তু এখন ১০০% সন্তুষ্ট। ধন্যবাদ ভাইয়া 🙏", likes: 45 },
              { name: "নাজমুল হাসান", time: "১ সপ্তাহ আগে", text: "আজকে প্রোডাক্ট হাতে পেলাম। সত্যি বলতে এত কম টাকায় এত ভালো জিনিস আশা করিনি। কোয়ালিটি মাইন্ডব্লোয়িং! 🔥🔥🔥", likes: 67 }
            ].map((fb, i) => (
              <div key={i} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${fb.name}&background=random`} alt={fb.name} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#1A1A2E] text-sm">{fb.name}</span>
                    <span className="text-xs text-[#6C757D]">{fb.time}</span>
                  </div>
                  <p className="text-sm text-[#1A1A2E] leading-relaxed mb-3">{fb.text}</p>
                  <div className="flex gap-4 text-xs text-[#6C757D] font-medium">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-[#1877F2]">
                      <ThumbsUp size={14} /> {fb.likes}
                    </span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-[#1877F2]">
                      <MessageCircle size={14} /> Reply
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
