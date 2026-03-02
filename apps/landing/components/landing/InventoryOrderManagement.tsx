import { 
  Package, AlertCircle, BarChart3, 
  CheckCircle2, Clock, FileText, Search, 
  Filter, ArrowUpRight, TrendingUp, Inbox
} from 'lucide-react';

export function InventoryOrderManagement() {

  const orderStats = [
    { label: 'পেন্ডিং অর্ডার', count: '১২', color: 'bg-yellow-500', icon: Clock },
    { label: 'আজকের সেলস', count: '৳২৫,০০০', color: 'bg-emerald-500', icon: TrendingUp },
    { label: 'কম ইনভেন্টরি', count: '৩টি', color: 'bg-red-500', icon: AlertCircle },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'রাকিব আহমেদ', amount: '৳২,৪৫০', status: 'Processing', date: '২ মিনিট আগে' },
    { id: '#1235', customer: 'সাবিনা আক্তার', amount: '৳১,২০০', status: 'Shipped', date: '১০ মিনিট আগে' },
    { id: '#1236', customer: 'করিম সাহেব', amount: '৳৪,৯৯৯', status: 'Delivered', date: '১ ঘণ্টা আগে' },
  ];

  return (
    <section className="relative py-24 bg-[#0D0D12] overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Right: Dashboard Mockup (Visual First for this section) */}
          <div 
            className="w-full lg:w-7/12 order-2 lg:order-1"
          >
            <div className="bg-[#18181F] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden glass-morphism">
              {/* Top Meta Bar */}
              <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-500 flex items-center gap-2">
                   <Search className="w-3 h-3" /> admin.ozzyl.com/dashboard
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="p-6 md:p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {orderStats.map((stat, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                         <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10 text-white`}>
                            <stat.icon className="w-4 h-4" style={{ color: stat.color.replace('bg-', '') }} />
                         </div>
                         <ArrowUpRight className="w-4 h-4 text-gray-700" />
                      </div>
                      <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                      <h4 className="text-xl font-bold text-white">{stat.count}</h4>
                    </div>
                  ))}
                </div>

                {/* Table Mockup */}
                <div className="rounded-2xl border border-white/5 bg-black/20 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-white">সাম্প্রতিক অর্ডারগুলো</h5>
                    <div className="flex gap-2">
                       <div className="p-1.5 rounded-md bg-white/5 border border-white/5 text-gray-500 cursor-pointer hover:text-white transition-colors"><Filter className="w-3 h-3" /></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead>
                         <tr className="border-b border-white/5 text-gray-500">
                           <th className="px-6 py-3 font-medium">Order ID</th>
                           <th className="px-6 py-3 font-medium">Customer</th>
                           <th className="px-6 py-3 font-medium text-right">Status</th>
                         </tr>
                       </thead>
                       <tbody className="text-gray-400">
                         {recentOrders.map((order, i) => (
                           <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                              <td className="px-6 py-4">
                                <div>{order.customer}</div>
                                <div className="text-[10px] text-gray-600">{order.date}</div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 
                                  order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>
                </div>

                {/* Automation Badge */}
                <div 
                  className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3"
                >
                  <Inbox className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-blue-300">অটোমেটিক ইনভয়েস জেনারেট হয়ে কাস্টমারকে এসএমএস পাঠানো হয়েছে।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left: Text Content */}
          <div className="w-full lg:w-5/12 order-1 lg:order-2">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
            >
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-400">Advanced Management</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              অর্ডার থেকে ইনভেন্টরি,<br /> 
              সবই এখন <span className="text-blue-500">Авто-Pilot</span> এ
            </h2>

            <p className="text-lg text-gray-400 mb-10">
               আপনার আর কাগজ-কলম নিয়ে বসে থাকতে হবে না। প্রতিটি সেল হওয়ার সাথে সাথে ইনভেন্টরি অটো আপডেট হয়, আর আপনাকে দেয় রিয়েল-টাইম বিজনেস গ্রোথ রিপোর্ট।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[
                 { title: 'স্মার্ট ইনভেন্টরি', desc: 'কম স্টকে অটোমেটিক অ্যালার্ট পাবেন', icon: AlertCircle },
                 { title: 'ইনভয়েস অটোমেশন', desc: 'অর্ডার শেষে কাস্টমার পাবে PDF ইনভয়েস', icon: FileText },
                 { title: 'অর্ডার ট্র্যাকিং', desc: 'পেন্ডিং থেকে ডেলিভারি প্রতিটি ধাপ ট্র্যাক করুন', icon: CheckCircle2 },
                 { title: 'বিজনেস ইনসাইটস', desc: 'সেরা সেল হওয়া প্রোডাক্ট দেখুন এক ক্লিকে', icon: BarChart3 },
               ].map((feature, i) => (
                 <div 
                   key={i}
                   className="space-y-2"
                 >
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold text-white">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
