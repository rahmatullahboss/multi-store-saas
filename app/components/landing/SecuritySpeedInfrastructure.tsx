import { motion } from 'framer-motion';
import { 
  ShieldCheck, Globe, Lock, 
  Server, Cloud, Activity,
  Database, RefreshCcw, ShieldAlert
} from 'lucide-react';

export function SecuritySpeedInfrastructure() {

  const securityFeatures = [
    { title: 'Global CDN', desc: 'ক্লডফ্লেয়ার এজের মাধ্যমে বাংলাদেশের প্রতিটি কোণায় সুপারফাস্ট স্পিড', icon: Globe },
    { title: 'Data Isolation', desc: 'মাল্টি-ট্যানেন্ট আর্কিটেকচার প্রতিটি ইউজারের ডাটা রাখে সম্পূর্ণ নিরাপদ', icon: Database },
    { title: 'DDoS Protection', desc: 'অটোমেটিক অ্যাটাক ফিল্টারিং এবং আনলিমিটেড ব্যান্ডউইথ', icon: ShieldAlert },
    { title: 'SSL Included', desc: 'প্রতিটি স্টোরে ফ্রী SSL এবং সিকিউরড চেকআউট', icon: Lock },
  ];

  return (
    <section className="relative py-24 bg-[#0D0D12] overflow-hidden">
      {/* Background World Map Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
         <Globe className="w-[1000px] h-[1000px] text-blue-500" />
      </div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-400">Enterprise Infrastructure</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            দুর্ভেদ্য নিরাপত্তা, <span className="text-blue-500">Unmatched</span> গতি<br />
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            আপনার বিজনেস বড় হোক বা ছোট, Ozzyl-এর ক্লাউডফ্লেয়ার চালিত ইনফ্রাস্ট্রাকচার নিশ্চিত করে ৯৯.৯% আপটাইম এবং মিলি-সেকেন্ডে পেজ লোডিং।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Interactive Infrastructure Visual */}
          <div className="relative p-8 lg:p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden group">
             {/* Animated Connections Line */}
             <div className="absolute inset-0 z-0">
                 <svg className="w-full h-full opacity-20">
                    <motion.path
                      d="M 50 150 Q 250 50 450 150 T 850 150"
                      fill="none"
                      stroke="url(#gradient-line)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <defs>
                       <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                       </linearGradient>
                    </defs>
                 </svg>
             </div>

             <div className="relative z-10 space-y-12">
                {/* Node 1: Global Edge */}
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-6"
                >
                   <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all">
                      <Cloud className="w-8 h-8 text-blue-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-white mb-1">Global Edge Network</h4>
                      <p className="text-sm text-gray-500">৩০০+ শহরে ডিস্ট্রিবিউটেড ডাটা সেন্টার</p>
                   </div>
                </motion.div>

                {/* Node 2: Multi-tenant Logic */}
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.2 }}
                   className="flex items-center gap-6 ml-12"
                >
                   <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                      <Server className="w-8 h-8 text-emerald-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-white mb-1">Multi-Tenant Isolation</h4>
                      <p className="text-sm text-gray-500">প্রতিটি স্টোরের জন্য আইসোলেটেড সিকিউর এনভায়রনমেন্ট</p>
                   </div>
                </motion.div>

                {/* Node 3: Your Store */}
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 }}
                   className="flex items-center gap-6"
                >
                   <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                      <Activity className="w-8 h-8 text-purple-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-white mb-1">99.9% Uptime SLA</h4>
                      <p className="text-sm text-gray-500">আপনার স্টোর থাকবে সবসময় অনলাইনে</p>
                   </div>
                </motion.div>
             </div>

             {/* Performance Meter */}
             <div className="absolute right-8 bottom-8 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                 <div className="flex items-center gap-2 mb-2">
                    <RefreshCcw className="w-3 h-3 text-emerald-500 animate-spin-slow" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Real-time Load Speed</span>
                 </div>
                 <div className="text-2xl font-bold text-white">0.24<span className="text-sm font-normal text-gray-600 ml-1">sec</span></div>
             </div>
          </div>

          {/* Right: Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             {securityFeatures.map((feature, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="space-y-4 group"
               >
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all border border-white/5 group-hover:border-blue-500/30">
                     <feature.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{feature.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
               </motion.div>
             ))}
             
             {/* Cloudflare Badge Accent */}
             <div className="col-span-1 sm:col-span-2 mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#F38020]/10 to-transparent border border-[#F38020]/20 flex items-center gap-6">
                 <div className="w-16 h-16 bg-white rounded-xl p-3 flex items-center justify-center shrink-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png" alt="Cloudflare" className="grayscale contrast-125 brightness-0" loading="lazy" decoding="async" />
                 </div>
                 <p className="text-sm text-gray-500 leading-relaxed">
                    <span className="font-bold text-white">Cloudflare Partner:</span> আমরা সরাসরি ক্লাউডফ্লেয়ারের ইনফ্রাস্ট্রাকচার ব্যবহার করি যা আপনার স্টোরকে দেয় গ্লোবাল স্ট্যান্ডার্ড সিকিউরিটি এবং অবিশ্বাস্য স্পিড।
                 </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
