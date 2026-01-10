import { motion } from 'framer-motion';
import { Zap, Palette, ArrowRight, CheckCircle2, LayoutTemplate, MousePointer2 } from 'lucide-react';
import { Link } from '@remix-run/react';

export function EditorModeComparison() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="text-sm font-medium text-white/70">Flexible Workflow</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            আপনার পছন্দ, <span className="text-emerald-400">আপনার স্টাইল</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            দুটো Mode, একটাই Goal — আপনার সুবিধা। আপনি যেভাবে চান, সেভাবেই কাজ করুন।
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          
          {/* Card 1: Simple Mode */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
            
            <div className="relative h-full bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col group-hover:border-blue-500/50 transition-colors duration-300">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                   <Zap className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white">SIMPLE MODE</h3>
                   <p className="text-blue-400 text-sm font-medium">দ্রুত ও সহজ</p>
                 </div>
               </div>

               {/* Flow Diagram */}
               <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 text-center space-y-3">
                 <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium">
                   <LayoutTemplate className="w-4 h-4 text-blue-400" /> Template Select
                 </div>
                 <div className="text-white/20">↓</div>
                 <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium">
                   <Zap className="w-4 h-4 text-blue-400" /> Fill Content
                 </div>
                 <div className="text-white/20">↓</div>
                 <div className="inline-flex items-center gap-2 text-white font-bold text-sm bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                   🚀 Publish!
                 </div>
               </div>

               <div className="space-y-3 mb-8 flex-1">
                 {[
                   { text: '৫ মিনিটে Ready', sub: 'কোনো কোডিং লাগবে না' },
                   { text: 'কোনো Learning নেই', sub: 'সবকিছু প্রি-মেড' },
                   { text: 'Template Change সহজ', sub: 'এক ক্লিকে ডিজাইন চেঞ্জ' },
                   { text: 'Beginners দের জন্য', sub: 'সবচেয়ে সহজ উপায়' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-3">
                     <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                     <div>
                       <div className="text-white font-medium text-sm">{item.text}</div>
                       <div className="text-white/40 text-xs">{item.sub}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-auto">
                 <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">BEST FOR:</p>
                 <div className="p-3 bg-blue-900/10 border border-blue-500/10 rounded-xl mb-6">
                   <p className="text-blue-200 italic text-sm text-center">"আমি দ্রুত Launch করতে চাই"</p>
                 </div>
                 
                 <Link to="/auth/register?mode=simple" className="w-full flex items-center justify-center gap-2 btn-secondary py-3 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors font-bold">
                   Simple দিয়ে শুরু
                   <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>
          </motion.div>

          {/* Card 2: Pro Mode */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
            
            <div className="relative h-full bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col group-hover:border-purple-500/50 transition-colors duration-300">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                   <Palette className="w-6 h-6 text-purple-400" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white">PRO MODE</h3>
                   <p className="text-purple-400 text-sm font-medium">Full Control</p>
                 </div>
               </div>

               {/* Flow Diagram */}
               <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 text-center space-y-3">
                 <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium">
                   <MousePointer2 className="w-4 h-4 text-purple-400" /> Drag & Drop
                 </div>
                 <div className="text-white/20">↓</div>
                 <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium">
                   <Palette className="w-4 h-4 text-purple-400" /> Customization
                 </div>
                 <div className="text-white/20">↓</div>
                 <div className="inline-flex items-center gap-2 text-white font-bold text-sm bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                   🚀 Publish!
                 </div>
               </div>

               <div className="space-y-3 mb-8 flex-1">
                 {[
                   { text: 'Pixel Perfect Design', sub: 'প্রতিটি পিক্সেল কন্ট্রোল করুন' },
                   { text: 'Unlimited Widgets', sub: '৫০+ উইজেট কালেকশন' },
                   { text: 'Complete Freedom', sub: 'যেভাবে খুশি সেভাবে সাজান' },
                   { text: 'Advanced Users', sub: 'প্রফেশনাল ফিনিশিং' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                     <div>
                       <div className="text-white font-medium text-sm">{item.text}</div>
                       <div className="text-white/40 text-xs">{item.sub}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-auto">
                 <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">BEST FOR:</p>
                 <div className="p-3 bg-purple-900/10 border border-purple-500/10 rounded-xl mb-6">
                   <p className="text-purple-200 italic text-sm text-center">"আমি নিজের মতো করে সব সাজাতে চাই"</p>
                 </div>
                 
                 <Link to="/auth/register?mode=pro" className="w-full flex items-center justify-center gap-2 btn-secondary py-3 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors font-bold">
                   Pro Mode Try করুন
                   <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>
          </motion.div>

        </div>

        {/* Global Flexibility Message */}
        <div className="max-w-3xl mx-auto rounded-full bg-white/5 border border-white/10 p-2 backdrop-blur-sm">
           <div className="flex items-center justify-between px-6 py-2">
             <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Zap className="w-4 h-4" /> Simple
             </div>
             
             <div className="flex-1 mx-6 relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 block"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="bg-[#0A0F0D] px-2 text-[10px] text-white/50 uppercase tracking-wider">You can be anywhere</span>
                </div>
             </div>

             <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                Pro <Palette className="w-4 h-4" />
             </div>
           </div>
           <div className="text-center pb-2">
              <p className="text-white/40 text-xs">💡 যেকোনো সময় Mode Switch করতে পারবেন!</p>
           </div>
        </div>

      </div>
    </section>
  );
}
