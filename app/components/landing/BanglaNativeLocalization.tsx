import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Languages, MessageSquare, Headphones, 
  MapPin, CheckCircle2, Globe, Heart,
  MousePointer2
} from 'lucide-react';

export function BanglaNativeLocalization() {
  const [isBangla, setIsBangla] = useState(true);

  // Auto-toggle language for demo animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBangla((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Flag Inspired Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#006A4E]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ED0A24]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Language Toggle Animation & Dashboard Mockup */}
          <div className="relative">
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="bg-[#121217] border border-white/10 rounded-[2.5rem] shadow-2xl p-6 md:p-10 relative overflow-hidden"
             >
                {/* Language Toggle UI */}
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
                         <Languages className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Dashboard Language</h3>
                   </div>
                   
                   <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 relative">
                      {/* Slider Background */}
                      <motion.div 
                        className="absolute inset-y-1.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20"
                        animate={{ x: isBangla ? 0 : 70 }}
                        initial={false}
                        style={{ width: 66 }}
                      />
                      <button 
                        onClick={() => setIsBangla(true)}
                        className={`relative z-10 px-4 py-1.5 text-xs font-bold transition-colors ${isBangla ? 'text-white' : 'text-gray-500'}`}
                        style={{ width: 66 }}
                      >
                         বাংলা
                      </button>
                      <button 
                        onClick={() => setIsBangla(false)}
                        className={`relative z-10 px-4 py-1.5 text-xs font-bold transition-colors ${!isBangla ? 'text-white' : 'text-gray-500'}`}
                        style={{ width: 66 }}
                      >
                         EN
                      </button>
                   </div>
                </div>

                {/* Dashboard Stats Mockup (Animated Translation) */}
                <div className="space-y-6 relative">
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={isBangla ? 'bn' : 'en'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-4"
                      >
                         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">
                               {isBangla ? 'আজকের বিক্রয়' : "Today's Sales"}
                            </p>
                            <h4 className="text-xl font-bold text-white">৳১২,৪০০</h4>
                         </div>
                         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">
                               {isBangla ? 'নতুন অর্ডার' : "New Orders"}
                            </p>
                            <h4 className="text-xl font-bold text-white">৫টি</h4>
                         </div>
                      </motion.div>
                   </AnimatePresence>

                   {/* Sidebar Nav Mockup */}
                   <div className="space-y-3">
                      {[
                        { bn: 'ড্যাশবোর্ড', en: 'Dashboard', icon: Globe },
                        { bn: 'প্রোডাক্ট ম্যানেজমেন্ট', en: 'Product Mgmt', icon: Heart },
                        { bn: 'অর্ডার লিস্ট', en: 'Order List', icon: MessageSquare },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                           <item.icon className="w-5 h-5 text-gray-600" />
                           <AnimatePresence mode="wait">
                              <motion.span
                                key={isBangla ? 'bn' : 'en'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-medium text-gray-400"
                              >
                                 {isBangla ? item.bn : item.en}
                              </motion.span>
                           </AnimatePresence>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Mouse Interaction Overlay */}
                <motion.div 
                   animate={{ x: [150, 280, 150], y: [120, 110, 120] }}
                   transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute pointer-events-none z-30"
                >
                   <MousePointer2 className="w-5 h-5 text-white drop-shadow-xl" />
                </motion.div>
             </motion.div>
          </div>

          {/* Right: Text Content & Local Highlights */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
            >
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-400">Proudly Made for Bangladesh</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-relaxed py-2">
              আপনার ভাষায়,<br /> 
              আপনার <span className="text-emerald-500">বিজনেস</span>
            </h2>

            <p className="text-lg text-gray-400 mb-10">
               ইংরেজি নিয়ে ভয় পাওয়ার দিন শেষ। Ozzyl-এর প্রতিটি কোণ বাংলায় অনুবাদ করা, যেন দেশের যে কোনো উদ্যোক্তা সহজেই তার অনলাইন স্টোর পরিচালনা করতে পারে।
            </p>

            <div className="space-y-6">
               {[
                 { title: 'সম্পূর্ণ বাংলা ড্যাশবোর্ড', desc: 'ম্যানেজমেন্ট থেকে রিপোর্ট — সবই আপনার চেনা ভাষায়।', icon: CheckCircle2 },
                 { title: 'দেশি পেমেন্ট মেথড', desc: 'বিকাশ, নগদ, রকেটের মতো সব লোকাল পেমেন্ট সাপোর্ট।', icon: CheckCircle2 },
                 { title: 'বাংলা কাস্টমার সাপোর্ট', desc: 'সরাসরি হেডফোনে বা চ্যাটে বাংলায় কথা বলুন আমাদের টিমের সাথে।', icon: Headphones },
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-start gap-4"
                 >
                    <div className="mt-1"><item.icon className="w-5 h-5 text-emerald-500" /></div>
                    <div>
                       <h4 className="font-bold text-white mb-1">{item.title}</h4>
                       <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>

            <div className="mt-12 flex items-center gap-4">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gray-800" />)}
               </div>
               <div>
                  <div className="flex items-center gap-1">
                     <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                     <span className="text-sm font-bold text-white">উই আর লোকাল</span>
                  </div>
                  <p className="text-xs text-gray-600">দেশি উদ্যোক্তাদের সাফল্যে আমরা প্রতিশ্রুতিবদ্ধ</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
