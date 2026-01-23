import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Tag, UserCheck, BellRing, Rocket
} from 'lucide-react';

export function CRMMarketingGrowth() {
  return (
    <section className="relative py-24 bg-[#0D0D12] overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(139,92,246,0.05)_0%,_transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Content */}
          <div className="w-full lg:w-5/12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
            >
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-400">Marketing & Growth</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-relaxed py-2">
              কাস্টমার রিলেশনশিপ হোক <br /> আরও <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">গভীর</span>
            </h2>

            <p className="text-lg text-gray-400 mb-10">
              শুধু সেল নয়, লয়াল কাস্টমার বেস তৈরি করুন। আমাদের অ্যাডভান্সড CRM এবং মার্কেটিং টুলস ব্যবহার করে আপনার বিজনেসকে স্কেল করুন সহজে।
            </p>

            <div className="space-y-8">
               {[
                 { title: 'Smart Segmentation', desc: 'কয়বার অর্ডার করেছে বা কত টাকার প্রোডাক্ট কিনেছে সেই ভিত্তিতে কাস্টমারদের ট্যাগ দিন।', icon: UserCheck },
                 { title: 'Marketing Automation', desc: 'অপারিত কার্ট রিকভারি এবং অটোমেটিক ডিসকাউন্ট অফার।', icon: BellRing },
                 { title: 'Custom Campaigns', desc: 'টার্গেটেড অডিয়েন্সের কাছে পৌঁছান কার্যকরভাবে।', icon: Rocket },
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex gap-4"
                 >
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                       <item.icon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Right: Visual Showcase */}
          <div className="w-full lg:w-7/12 relative">
             {/* Main Dashboard Panel Mockup */}
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="bg-[#121217] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8"
             >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" /> Customer Insights
                   </h3>
                   <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-bold uppercase">Live</div>
                   </div>
                </div>

                {/* Customer List Mockup */}
                <div className="space-y-4">
                    {[
                      { name: 'আরিফুল ইসলাম', tags: ['VIP', 'Repeat'], amount: '৳৫২,০০০', orders: 8 },
                      { name: 'তানজিলা হক', tags: ['New'], amount: '৳২,৫০০', orders: 1 },
                      { name: 'মেহেদী হাসান', tags: ['Loyal'], amount: '৳১৮,৪০০', orders: 3 },
                    ].map((customer, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold">
                              {customer.name[0]}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white mb-1">{customer.name}</p>
                              <div className="flex gap-1">
                                 {customer.tags.map(tag => (
                                   <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] text-gray-500 uppercase tracking-wider">{tag}</span>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-white">{customer.amount}</p>
                           <p className="text-[10px] text-gray-600">{customer.orders} Orders</p>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {/* Segmentation Interface Mockup */}
                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                       <p className="text-indigo-400 text-[10px] font-bold uppercase mb-2">Automated Actions</p>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-gray-400">Abandoned Cart Recovery</span>
                             <div className="w-8 h-4 bg-indigo-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-gray-400">Birthday Discount SMS</span>
                             <div className="w-8 h-4 bg-gray-700 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white/50 rounded-full" /></div>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                       <p className="text-purple-400 text-[10px] font-bold uppercase mb-2">Marketing Stats</p>
                       <div className="flex items-end gap-2">
                          <div className="h-12 w-full bg-purple-500/20 rounded-t-lg" />
                          <div className="h-16 w-full bg-purple-500/40 rounded-t-lg" />
                          <div className="h-10 w-full bg-purple-500/20 rounded-t-lg" />
                          <div className="h-20 w-full bg-purple-600/60 rounded-t-lg" />
                       </div>
                    </div>
                </div>
             </motion.div>

             {/* Floating UI Badges */}
             <motion.div
               animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute -top-6 -right-6 p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl z-20"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-pink-500/20 rounded-xl"><Tag className="w-4 h-4 text-pink-500" /></div>
                   <p className="text-white text-xs font-bold">New Coupon Created!</p>
                </div>
             </motion.div>

             <motion.div
               animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
               className="absolute -bottom-4 -left-12 p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl z-20"
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/20 rounded-xl"><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
                   <div>
                       <p className="text-white text-xs font-bold">+১৫.৪% ROI</p>
                       <p className="text-gray-500 text-[10px]">Email Campaign Impact</p>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
