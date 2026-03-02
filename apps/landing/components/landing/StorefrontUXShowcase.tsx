import { 
  Smartphone, Zap, ShoppingCart, Star, 
  Search, Heart, ArrowRight,
  Sparkles, Layout
} from 'lucide-react';

export function StorefrontUXShowcase() {

  const uxFeatures = [
    { title: 'Ultra-Fast Loading', desc: '১ সেকেন্ডেরও কম সময়ে পেজ লোড হয়', icon: Zap },
    { title: 'Mobile Optimized', desc: 'মোবাইল ইউজারদের জন্য পারফেক্ট শপিং এক্সপেরিয়েন্স', icon: Smartphone },
    { title: 'One-Click Add', desc: 'সহজেই কার্টে এড এবং কুইক চেকআউট', icon: ShoppingCart },
    { title: 'Smart Search', desc: 'প্রোডাক্ট খুঁজে পাওয়া এখন আরও সহজ', icon: Search },
  ];

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-400">Customer Experience</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            কাস্টমারের শপিং হোক বিরামহীন,<br />
            <span className="text-purple-500">Premium UX</span> এ বিজনেস হোক রঙিন!
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            সুন্দর ডিজাইন আর সহজ নেভিগেশন আপনার স্টোরকে দেবে প্রফেশনাল লুক, যা কাস্টমারকে বার বার ফিরিয়ে আনবে।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Mobile UX Mockup */}
          <div className="relative">
            {/* Phone Mockup 1: Product Listing */}
            <div className="relative z-10 w-[260px] h-[520px] bg-[#121212] rounded-[2.5rem] border-8 border-white/10 shadow-2xl overflow-hidden hidden md:block"
            >
               <div className="h-full flex flex-col pt-8">
                  <div className="px-5 mb-6">
                     <div className="w-full h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                        <Search className="w-4 h-4 text-gray-600" />
                        <div className="h-2 w-20 bg-white/5 rounded" />
                     </div>
                  </div>
                  <div className="px-5 grid grid-cols-2 gap-4">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="space-y-2">
                           <div className="aspect-square bg-white/5 rounded-xl" />
                           <div className="h-2 w-full bg-white/5 rounded" />
                           <div className="h-2 w-1/2 bg-white/5 rounded" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Phone Mockup 2: Product Detail (Center) */}
            <div className="relative z-20 mx-auto lg:mx-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:left-32 w-[280px] h-[580px] bg-white rounded-[2.5rem] border-8 border-gray-100 shadow-2xl overflow-hidden"
            >
               <div className="h-full flex flex-col">
                  <div className="h-64 bg-gray-100 flex items-center justify-center relative">
                     <div className="w-40 h-40 bg-gray-200 rounded-2xl rotate-12" />
                     <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
                     >
                        <Heart className="w-5 h-5 text-red-500" />
                     </div>
                  </div>
                  <div className="p-6">
                     <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        <span className="text-[10px] text-gray-400 ml-1">(১২ রিভিউ)</span>
                     </div>
                     <h4 className="text-lg font-bold text-gray-900 mb-1">Premium Smart Watch</h4>
                     <p className="text-purple-600 font-bold text-xl mb-4">৳৩,৫০০</p>
                     
                     <div className="space-y-3 mb-6">
                        <div className="flex gap-2">
                           {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-lg border-2 ${i===1 ? 'border-purple-500':'border-gray-100'}`} />)}
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded" />
                        <div className="h-2 w-2/3 bg-gray-100 rounded" />
                     </div>

                     <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 shadow-xl">
                        কার্টে যোগ করুন <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Floating UI Elements */}
            <div className="absolute -right-4 top-1/4 z-30 p-4 rounded-2xl bg-white shadow-2xl border border-gray-100 hidden lg:block"
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-600" /></div>
                  <div>
                     <p className="text-gray-900 text-xs font-bold">Fast Checkout</p>
                     <p className="text-gray-400 text-[10px]">Optimized for mobile</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Feature Content */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {uxFeatures.map((feature, i) => (
                 <div
                   key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all group"
                 >
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <feature.icon className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="text-white font-bold mb-2">{feature.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-2xl">
                     <Layout className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold text-white mb-2">Clean & Minimal Aesthetic</h4>
                     <p className="text-gray-400 text-base leading-relaxed">
                         অপ্রয়োজনীয় এলিমেন্ট ছাড়াই আপনার প্রোডাক্টকে হাইলাইট করার জন্য তৈরি করা হয়েছে আমাদের প্রতিটি টেমপ্লেট। কাস্টমার যেন বিভ্রান্ত না হয়ে সরাসরি কেনাকাটার দিকে মনোযোগ দেয়।
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 text-gray-500"
            >
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gray-800" />)}
               </div>
               <p className="text-sm font-medium">৫০০+ স্টোর মালিকদের পছন্দের প্ল্যাটফর্ম</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
