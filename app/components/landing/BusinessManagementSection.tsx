
import { motion } from 'framer-motion';
import { Shield, Users, FileBarChart, Terminal, Lock, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

const LOGS = [
  { user: 'Admin', action: 'Updated Product "Nike Air Max"', time: '2m ago', color: 'text-blue-400' },
  { user: 'Manager', action: 'Processed Order #1023', time: '5m ago', color: 'text-emerald-400' },
  { user: 'Editor', action: 'Changed Banner Image', time: '12m ago', color: 'text-amber-400' },
  { user: 'System', action: 'Auto-generated Monthly Tax Report', time: '1h ago', color: 'text-purple-400' },
];

export function BusinessManagementSection() {
  const [activeLog, setActiveLog] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLog(prev => (prev + 1) % LOGS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
          >
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-400">Enterprise Control</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            আপনার ফুল টিম,<br />
            <span className="text-purple-500">এক ড্যাশবোর্ডে</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            কাকে কি পারমিশন দেবেন, কে কখন কি কাজ করছে - সবকিছুর ফুল কন্ট্রোল আপনার হাতে। সাথে আছে অটোমেটিক ট্যাক্স রিপোর্ট জেনারেশন।
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Card 1: Team & Roles - Premium Glass */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden h-full shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 text-purple-400 group-hover:scale-110 transition-transform duration-500 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative z-10">
              <Users className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide relative z-10">Team Roles & Permissions</h3>
            
            <div className="space-y-4 relative z-10">
              <RoleItem role="Super Admin" access="Full Access" color="purple" />
              <RoleItem role="Store Manager" access="Orders & Products" color="blue" />
              <RoleItem role="Support Agent" access="Chat Only" color="emerald" />
            </div>
          </motion.div>

          {/* Card 2: Activity Logs (Centerpiece) - Terminal Glass */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0F0D] border border-white/10 rounded-[32px] p-1 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] lg:-mt-6 lg:mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
            
            <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[28px] p-6 h-full relative overflow-hidden">
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[size:100%_4px] bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.5)_50%)]" />

                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                   <div className="flex items-center gap-3 text-white/90">
                     <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                        <Terminal className="w-4 h-4" />
                     </div>
                     <span className="font-mono text-sm font-bold tracking-tight">System_Logs</span>
                   </div>
                   <div className="flex gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                   </div>
                </div>

                <div className="space-y-4 font-mono text-xs md:text-sm h-[240px] relative">
                   {/* Fade masks */}
                   <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
                   <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />

                   <div className="relative z-0 pt-4">
                       {LOGS.map((log, i) => (
                         <motion.div
                           key={i}
                           initial={{ opacity: 0.3 }}
                           animate={{ 
                             opacity: i === activeLog ? 1 : 0.2,
                             y: i === activeLog ? 0 : 0,
                             x: i === activeLog ? 0 : 0,
                             scale: i === activeLog ? 1.02 : 1
                           }}
                           className={`flex gap-3 p-3 rounded-xl transition-all duration-500 items-start ${
                               i === activeLog 
                               ? 'bg-white/[0.08] border border-white/10 shadow-lg backdrop-blur-sm' 
                               : 'hover:bg-white/[0.02]'
                           }`}
                         >
                           <span className="text-gray-500 min-w-[50px] text-[10px] uppercase tracking-wider pt-1">{log.time}</span>
                           <div className="flex flex-col gap-0.5">
                               <span className={`${log.color} font-bold text-xs`}>
                                   <span className="opacity-50 mr-1">$</span>{log.user}
                               </span>
                               <span className="text-gray-300 leading-tight">{log.action}</span>
                           </div>
                         </motion.div>
                       ))}
                   </div>
                   
                   {/* Blinking Cursor */}
                   <div className="flex items-center gap-2 p-3 mt-2 border border-dashed border-white/10 rounded-xl">
                     <span className="text-purple-500 font-bold">➜</span>
                     <motion.span 
                       animate={{ opacity: [0, 1, 0] }}
                       transition={{ duration: 0.8, repeat: Infinity }}
                       className="w-2 h-4 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                     />
                   </div>
                </div>
            </div>
          </motion.div>

          {/* Card 3: Tax Reports - Premium Glass */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 hover:border-purple-500/30 transition-all duration-500 group h-full shadow-2xl relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-8 text-purple-400 group-hover:scale-110 transition-transform duration-500 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative z-10">
              <FileBarChart className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">Auto Tax Reports</h3>
            
            <div className="bg-black/40 rounded-2xl p-5 border border-white/10 mb-6 relative z-10 group-hover:border-white/20 transition-colors backdrop-blur-md">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Tax Year 2024-25</span>
                 <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> READY
                 </span>
               </div>
               <div className="text-3xl font-bold text-white mb-1 tracking-tight">৳ ১,৫০,০০০<span className="text-white/30 text-lg">.০০</span></div>
               <div className="text-xs text-gray-500 font-medium">Total Tax Collected</div>
            </div>

            <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-purple-900/40 relative z-10 group/btn overflow-hidden">
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
               <Download className="w-4 h-4" /> Download Report PDF
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

interface RoleItemProps {
  role: string;
  access: string;
  color: 'purple' | 'blue' | 'emerald';
}

function RoleItem({ role, access, color }: RoleItemProps) {
  const bgColors = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-default group/item">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
          bgColors[color]
        }`}>
          <Lock className="w-4 h-4" />
        </div>
        <span className="text-white/90 font-bold text-sm group-hover/item:text-white transition-colors">{role}</span>
      </div>
      <span className="text-xs text-gray-500 font-medium bg-black/20 px-2 py-1 rounded border border-white/5">{access}</span>
    </div>
  );
}
