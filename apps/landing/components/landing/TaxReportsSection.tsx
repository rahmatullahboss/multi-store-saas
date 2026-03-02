import { useRef } from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';

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

export function TaxReportsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  const stats = [
    { label: 'Total Revenue', value: '৳12,45,000', change: '+12%', color: 'text-white' },
    { label: 'VAT Collected', value: '৳1,87,500', change: '+8%', color: 'text-orange-400' },
    { label: 'Net Profit', value: '৳4,50,000', change: '+15%', color: 'text-green-400' },
  ];

  const tableData = [
    { month: 'July 2024', revenue: '৳1,20,000', vat: '৳18,000', status: 'Calculated' },
    { month: 'Aug 2024', revenue: '৳1,35,000', vat: '৳20,250', status: 'Calculated' },
    { month: 'Sep 2024', revenue: '৳98,000', vat: '৳14,700', status: 'Pending' },
  ];

  return (
    <div className="py-24 bg-[#0A0A0F] relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
               <FileText className="w-4 h-4 text-emerald-400" />
               <span className="text-sm font-semibold text-emerald-400">Automated Accounting</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Tax Season এ — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">No Tension!</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              দিনশেষে হিসাব মেলানো নিয়ে আর চিন্তা নেই। সেলস, ভ্যাট এবং প্রফিট রিপোর্ট অটোমেটিক তৈরি হবে। এক ক্লিকে ডাউনলোড করে CA কে পাঠিয়ে দিন।
            </p>

            <div className="space-y-4">
              {[
                { title: 'Monthly VAT Reports', desc: 'প্রতি মাসের ভ্যাট রিপোর্ট অটোমেটিক জেনারেট হয়' },
                { title: 'Profit & Loss Statement', desc: 'খরচ বাদ দিয়ে কত লাভ হলো তা জানুন' },
                { title: 'Excel Export', desc: 'যেকোনো রিপোর্ট এক্সেলে ডাউনলোড করার সুবিধা' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-800/30 transition-colors border border-transparent hover:border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Visual */}
          <div
            
            className="bg-[#0F1115] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-2xl"
          >
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-white font-bold text-lg">Financial Overview</h3>
               <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">FY 2024-25</span>
             </div>

             {/* Stats Grid */}
             <div className="grid grid-cols-3 gap-4 mb-8">
               {stats.map((stat, idx) => (
                 <div key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                   <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                   <p className={`font-bold text-lg mb-1 ${stat.color}`}>{stat.value}</p>
                   {/* <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">{stat.change}</span> */}
                 </div>
               ))}
             </div>

             {/* Mock Table */}
             <div className="overflow-hidden rounded-xl border border-gray-800">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-800/50 text-gray-400">
                   <tr>
                     <th className="px-4 py-3 font-medium">Period</th>
                     <th className="px-4 py-3 font-medium">Revenue</th>
                     <th className="px-4 py-3 font-medium">VAT</th>
                     <th className="px-4 py-3 font-medium text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800 bg-gray-900/30">
                   {tableData.map((row, idx) => (
                     <tr key={idx}>
                       <td className="px-4 py-3 text-gray-300">{row.month}</td>
                       <td className="px-4 py-3 text-white font-medium">{row.revenue}</td>
                       <td className="px-4 py-3 text-gray-400">{row.vat}</td>
                       <td className="px-4 py-3 text-right">
                         <span className={`text-xs px-2 py-1 rounded-full ${
                           row.status === 'Calculated' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'
                         }`}>
                           {row.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Download className="w-4 h-4" /> Download Report
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
