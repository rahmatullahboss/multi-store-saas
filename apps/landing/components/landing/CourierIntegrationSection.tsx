import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Truck, Package, MapPin, Printer, CheckCircle2, Wallet } from 'lucide-react';

export function CourierIntegrationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const couriers = [
    { name: 'Steadfast', color: '#00D1FF', time: '১-২ দিন', cost: 'মার্চেন্ট সেট' },
    { name: 'Pathao', color: '#EF4444', time: '১ দিন', cost: 'মার্চেন্ট সেট' },
    { name: 'RedX', color: '#F87171', time: '১-২ দিন', cost: 'মার্চেন্ট সেট' }
  ];

  return (
    <div className="relative py-24 lg:py-32 overflow-hidden bg-[#0A0A0F]">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Massive Selling Point</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Delivery এখন <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">এক ক্লিকে</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            বাংলাদেশের সব বড় Courier — এক Dashboard এ! আর ম্যানুয়ালি অর্ডার এন্ট্রি দিতে হবে না।
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Features & Flow */}
          <div className="space-y-12">
            {/* Courier Logos Grid */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Integrated Partners
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {couriers.map((courier) => (
                  <motion.div
                    key={courier.name}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3`} style={{ backgroundColor: `${courier.color}20` }}>
                      <span className="font-bold" style={{ color: courier.color }}>{courier.name[0]}</span>
                    </div>
                    <span className="text-gray-300 font-medium">{courier.name}</span>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Workflow Steps */}
            <div className="space-y-6">
              {[
                { 
                  icon: Package, 
                  title: "1. Order আসলো", 
                  desc: "Customer অর্ডার প্লেস করল বা আপনি ম্যানুয়ালি অ্যাড করলেন",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10"
                },
                { 
                  icon: Truck, 
                  title: "2. Courier Book করুন", 
                  desc: "১ ক্লিকে পছন্দের কুরিয়ার সিলেক্ট করে বুকিং কনফার্ম করুন",
                  color: "text-purple-400",
                  bg: "bg-purple-400/10"
                },
                { 
                  icon: Printer, 
                  title: "3. Auto Label Print", 
                  desc: "অটোমেটিক ইনভয়েস এবং লেবেল প্রিন্ট করে প্যাকেটে লাগান",
                  color: "text-green-400",
                  bg: "bg-green-400/10"
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-800/30 transition-colors"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Interactive Demo Card */}
          <motion.div
            style={{ y }}
            className="relative"
          >
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20" />
             
            <div className="relative bg-[#0F1115] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
              {/* Fake Window Header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                <span className="ml-4 text-xs font-mono text-gray-500">Order #123456</span>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Customer Info */}
                <div className="flex justify-between items-start pb-6 border-b border-gray-800">
                  <div>
                    <h4 className="text-white font-medium">রহিম উদ্দিন</h4>
                    <p className="text-sm text-gray-400">Mirpur-10, Dhaka</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                      <Wallet className="w-3 h-3" /> COD: ৳1,299
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Order Date</span>
                    <p className="text-sm text-white">Today, 2:30 PM</p>
                  </div>
                </div>

                {/* Courier Selection Demo */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-300">Select Courier Partner</h5>
                  <div className="space-y-3">
                    {couriers.map((courier, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          idx === 1 
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                            : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            idx === 1 ? 'border-blue-500' : 'border-gray-500'
                          }`}>
                            {idx === 1 && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                          <span className="text-white font-medium">{courier.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-white">{courier.cost}</span>
                          <span className="block text-xs text-gray-400">{courier.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]">
                    <Truck className="w-4 h-4" />
                    Book Pickup Request
                  </button>
                </div>

                {/* Success Message Animation (Visual Trick) */}
                <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none group">
                  <div className="bg-[#0F1115] p-6 rounded-2xl border border-green-500/20 shadow-2xl transform scale-95 group-hover:scale-100 transition-transform text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-white font-bold mb-1">Pickup Booked!</h4>
                    <p className="text-sm text-gray-400">Tracking: STD-87392</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Floating Cards */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-20 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Printer className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Auto Label</p>
                  <p className="text-sm font-bold text-white">Generated!</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-8 bottom-20 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tracking</p>
                  <p className="text-sm font-bold text-white">Live Update</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Comparison */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <span className="text-2xl">😫</span>
               <h4 className="text-lg font-bold text-red-200">আগে (Manual Process)</h4>
             </div>
             <ul className="space-y-3 text-gray-400">
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> Courier Panel এ আলাদা Login</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> Order Details Copy-Paste করা</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> Tracking Number লিখে রাখা</li>
               <li className="flex items-center gap-2 border-t border-red-500/10 pt-2 font-semibold text-red-300">⏱️ প্রতি অর্ডারে ৫-১০ মিনিট লস!</li>
             </ul>
          </div>
          
          <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 bg-green-500/10 rounded-bl-2xl border-b border-l border-green-500/10">
               <span className="text-xs font-bold text-green-400">RECOMMENDED</span>
             </div>
             <div className="flex items-center gap-3 mb-4">
               <span className="text-2xl">😎</span>
               <h4 className="text-lg font-bold text-green-200">এখন (Ozzyl Automation)</h4>
             </div>
             <ul className="space-y-3 text-gray-400">
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500/50" /> Dashboard এ ১ ক্লিক</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500/50" /> Auto Booking & Status Update</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500/50" /> Customer পায় Auto SMS</li>
               <li className="flex items-center gap-2 border-t border-green-500/10 pt-2 font-semibold text-green-300">⏱️ প্রতি অর্ডারে ১০ সেকেন্ড! ⚡</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
