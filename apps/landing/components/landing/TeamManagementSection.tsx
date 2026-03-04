import React from "react";
import { useRef } from 'react';
import { Users, Shield, Lock, CheckCircle2, UserPlus } from 'lucide-react';

// Simple IntersectionObserver-based useInView (replaces framer-motion)
function useInViewSimple(ref: React.RefObject<Element | null>, options?: { once?: boolean; margin?: string }) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); if (options?.once !== false) observer.disconnect(); }
    }, { rootMargin: options?.margin || '0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return inView;
}

export function TeamManagementSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  const roles = [
    { name: 'Owner', icon: '👑', access: 'Full Access (All Control)' },
    { name: 'Manager', icon: '👔', access: 'No Billing Access' },
    { name: 'Order Staff', icon: '📦', access: 'Order View & Update' },
    { name: 'Product Mgr', icon: '🛍️', access: 'Product Add/Edit Only' },
  ];

  const permissions = [
    { feature: 'View Orders', owner: true, manager: true, staff: true, product: false },
    { feature: 'Edit Products', owner: true, manager: true, staff: false, product: true },
    { feature: 'View Revenue', owner: true, manager: true, staff: false, product: false },
    { feature: 'Manage Settings', owner: true, manager: false, staff: false, product: false },
  ];

  return (
    <div className="py-24 bg-[#0F1115] relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">Enterprise Feature</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Team নিয়ে কাজ করুন — <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">নিরাপদে</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            আপনার পাসওয়ার্ড শেয়ার করার দরকার নেই। স্টাফদের আলাদা এক্সেস দিন এবং নিরাপত্তা নিশ্চিত করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Dashboard Visual */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 lg:p-10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-white">Team Members</h3>
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                 <UserPlus className="w-4 h-4" /> Add Member
               </button>
            </div>

            <div className="space-y-4">
              {/* Owner */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl">👑</div>
                  <div>
                    <h4 className="text-white font-medium">আপনি (Owner)</h4>
                    <p className="text-xs text-gray-400">admin@store.com</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">Active</span>
              </div>

              {/* Order Manager */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">👤</div>
                   <div>
                     <h4 className="text-white font-medium">রাসেল (Order Staff)</h4>
                     <p className="text-xs text-gray-400">rasel@store.com</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Orders Only</span>
                </div>
              </div>

              {/* Limited User */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 opacity-75">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-xl">👤</div>
                   <div>
                     <h4 className="text-white font-medium">সুমি (Product Mgr)</h4>
                     <p className="text-xs text-gray-400">sumi@store.com</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded">Products Only</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800">
               <div className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                 <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                 <p className="text-sm text-yellow-200/80">
                   Note: Staff members cannot see your Total Revenue or change Payment Settings. Your business data is safe.
                 </p>
               </div>
            </div>
          </div>

          {/* Features List & Matrix */}
          <div className="space-y-10">
            {/* Roles Grid */}
            <div className="grid grid-cols-2 gap-4">
               {roles.map((role, idx) => (
                 <div
                   key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-indigo-500/30 transition-colors"
                 >
                   <div className="text-2xl mb-2">{role.icon}</div>
                   <h4 className="text-white font-bold text-sm mb-1">{role.name}</h4>
                   <p className="text-xs text-gray-400">{role.access}</p>
                 </div>
               ))}
            </div>

            {/* Permission Matrix */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
                 <h4 className="text-white font-semibold flex items-center gap-2">
                   <Shield className="w-4 h-4 text-green-400" /> Permission Matrix
                 </h4>
               </div>
               <div className="p-4">
                 <table className="w-full text-sm text-left">
                   <thead>
                     <tr className="text-gray-500 border-b border-gray-800">
                       <th className="pb-3 font-medium">Feature</th>
                       <th className="pb-3 text-center font-medium">Owner</th>
                       <th className="pb-3 text-center font-medium">Staff</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                     {permissions.map((perm, idx) => (
                       <tr key={idx}>
                         <td className="py-3 text-gray-300">{perm.feature}</td>
                         <td className="py-3 text-center text-green-400"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
                         <td className="py-3 text-center">
                           {perm.staff ? <CheckCircle2 className="w-4 h-4 mx-auto text-green-400" /> : <span className="text-red-500/50">✗</span>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
            
            <p className="text-lg text-gray-300 italic">
               "Employee কে Login দিন — কিন্তু শুধু যেটুকু দরকার!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
