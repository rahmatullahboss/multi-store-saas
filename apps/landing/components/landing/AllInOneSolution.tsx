import { motion } from 'framer-motion';
import { Check, X, Layers, ShieldCheck, Laptop, ShoppingCart, BarChart } from 'lucide-react';

export function AllInOneSolution() {

  const otherPainPoints = [
    { text: 'Domain & Hosting (Expensive)', icon: X, color: 'text-red-500' },
    { text: 'Payment SSL Setup (Complex)', icon: X, color: 'text-red-500' },
    { text: 'Landing Page Builder ($30+) ', icon: X, color: 'text-red-500' },
    { text: 'Inventory Management (Extra App)', icon: X, color: 'text-red-500' },
  ];

  const ozzylBenefits = [
    { text: 'Custom Domain + Free CDN', icon: Check, color: 'text-emerald-500' },
    { text: 'In-built SSL & Payments', icon: Check, color: 'text-emerald-500' },
    { text: 'All-in-One Builder (Free)', icon: Check, color: 'text-emerald-500' },
    { text: 'Pro Inventory Dashboard', icon: Check, color: 'text-emerald-500' },
  ];

  return (
    <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-400">All-in-One Platform</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-relaxed py-2">
            ভিন্ন ভিন্ন টুলসের দিন শেষ,<br />
            <span className="text-emerald-500">Ozzyl</span> এই সবকিছু একসাথেই বেশ!
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Shopify, Wix বা WordPress এ যা আলাদাভাবে টাকা দিয়ে কিনতে হতো, Ozzyl এ তা বিল্ট-ইন। বাচবে খরচ, কমবে ঝামেলা।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Comparison Card: The Others */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative group"
          >
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <h3 className="text-2xl font-bold text-white/80 mb-8 flex items-center gap-3">
              <span className="p-2 bg-red-500/10 rounded-lg"><X className="w-6 h-6 text-red-500" /></span>
              অন্যান্য প্ল্যাটফর্ম (Shopify/Wix)
            </h3>
            
            <div className="space-y-6">
              {otherPainPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-4">
                  <point.icon className={`w-5 h-5 ${point.color}`} />
                  <span className="text-gray-400 text-lg">{point.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-black/40 border border-white/5">
              <p className="text-gray-500 text-sm mb-2">আনুমানিক মাসিক খরচ:</p>
              <div className="text-3xl font-bold text-red-400/80">৳৫,০০০ - ৳১০,০০০+</div>
              <p className="text-xs text-gray-600 mt-2">*সাবস্ক্রিপশন + প্লাগিন + কাস্টম ফি সহ</p>
            </div>
          </motion.div>

          {/* Comparison Card: Ozzyl */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-md relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            {/* Animated Shine */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] -translate-x-full skew-x-[-30deg]"
              animate={{ translateX: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />

            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="p-2 bg-emerald-500/20 rounded-lg"><Check className="w-6 h-6 text-emerald-500" /></span>
              Ozzyl - এক নজরে সব টুলস
            </h3>

            <div className="space-y-6 relative z-10">
              {ozzylBenefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <span className="text-white text-lg font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-2xl bg-[#006A4E]/20 border border-emerald-500/30 relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-emerald-400/80 text-sm mb-2 font-bold uppercase tracking-wider">স্পেশাল অফার:</p>
                  <div className="text-4xl font-extrabold text-white">৳০ থেকেই শুরু!</div>
                  <p className="text-emerald-300/60 text-sm mt-2">কোন লুকানো কস্ট নেই, নেই ক্রেডিট কার্ডের ঝামেলা।</p>
               </div>
               
               {/* Visual Accent */}
               <motion.div 
                 className="absolute -right-8 -bottom-8 opacity-10"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
               >
                 <Layers className="w-48 h-48 text-white" />
               </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Laptop, title: 'Landing Page', sub: 'High Conversion' },
            { icon: ShoppingCart, title: 'Full Store', sub: 'Complete E-com' },
            { icon: BarChart, title: 'Analytics', sub: 'Real-time Stats' },
            { icon: ShieldCheck, title: 'Security', sub: 'Cloudflare Powered' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors text-center group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-white font-bold mb-1">{item.title}</h4>
              <p className="text-gray-500 text-xs">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
