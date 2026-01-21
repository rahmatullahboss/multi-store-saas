
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Card 1: Team & Roles */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-purple-500/30 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Team Roles & Permissions</h3>
            
            <div className="space-y-4">
              <RoleItem role="Super Admin" access="Full Access" color="purple" />
              <RoleItem role="Store Manager" access="Orders & Products" color="blue" />
              <RoleItem role="Support Agent" access="Chat Only" color="emerald" />
            </div>
          </motion.div>

          {/* Card 2: Activity Logs (Centerpiece) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-black border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-white/80">
                 <Terminal className="w-5 h-5" />
                 <span className="font-mono text-sm font-bold">Activity Logs</span>
               </div>
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
               </div>
            </div>

            <div className="space-y-3 font-mono text-xs md:text-sm h-[200px] overflow-hidden relative">
               {/* Fade out top */}
               <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

               {LOGS.map((log, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0.3 }}
                   animate={{ 
                     opacity: i === activeLog ? 1 : 0.3,
                     x: i === activeLog ? 0 : 0
                   }}
                   className={`flex gap-3 p-2 rounded ${i === activeLog ? 'bg-white/5 border border-white/5' : ''}`}
                 >
                   <span className="text-gray-500 min-w-[50px]">{log.time}</span>
                   <span className={`${log.color} font-bold`}>{log.user}</span>
                   <span className="text-gray-300 truncate">{log.action}</span>
                 </motion.div>
               ))}
               
               {/* Blinking Cursor */}
               <div className="flex items-center gap-2 p-2 pt-4">
                 <span className="text-emerald-500">➜</span>
                 <motion.span 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ duration: 0.8, repeat: Infinity }}
                   className="w-2 h-4 bg-emerald-500"
                 />
               </div>
            </div>
          </motion.div>

          {/* Card 3: Tax Reports */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-purple-500/30 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Auto Tax Reports</h3>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-400">Tax Year 2024-25</span>
                 <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Ready</span>
               </div>
               <div className="text-2xl font-bold text-white mb-1">৳ ১,৫০,০০০.০০</div>
               <div className="text-xs text-gray-500">Total Tax Collected</div>
            </div>

            <button className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Download Report
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
    purple: 'bg-purple-500/10 text-purple-400',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          bgColors[color]
        }`}>
          <Lock className="w-3.5 h-3.5" />
        </div>
        <span className="text-white/90 font-medium text-sm">{role}</span>
      </div>
      <span className="text-xs text-gray-500">{access}</span>
    </div>
  );
}
