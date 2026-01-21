
import { motion } from 'framer-motion';
import { Truck, RotateCcw, MapPin, Package } from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';

const COURIERS = [
  { name: 'Steadfast', color: '#EF4444', logo: 'S' },
  { name: 'Pathao', color: '#EF4444', logo: 'P' },
  { name: 'RedX', color: '#EF4444', logo: 'R' },
  { name: 'Paperfly', color: '#3B82F6', logo: 'PF' }, // Added for variety
  { name: 'eCourier', color: '#10B981', logo: 'E' }, // Added for variety
];

export function LogisticsOperationsSection() {
  const [activeCourierIndex, setActiveCourierIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCourierIndex(prev => (prev + 1) % COURIERS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-[#0A0F0D] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-400">Smart Logistics</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              ডেলিভারি হ্যাসেল?<br />
              <span className="text-blue-500">ভুলে যান আজই!</span>
            </h2>
            
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Steadfast, Pathao, RedX সহ দেশের সেরা কুরিয়ারগুলোর সাথে ফুল API ইন্টিগ্রেশন। অর্ডার প্লেস করার সাথে সাথেই ট্র্যাকিং আইডি জেনারেট হবে অটোমেটিক্যালি।
            </p>

            <div className="space-y-6">
              <FeatureRow 
                icon={Truck} 
                title="1-Click Courier Booking" 
                desc="ম্যানুয়ালি ডাটা এন্ট্রি করার দরকার নেই। এক ক্লিকেই পার্সেল বুকিং।"
              />
              <FeatureRow 
                icon={RotateCcw} 
                title="Smarter Returns Management" 
                desc="রিটার্ন রিকোয়েস্ট ম্যানেজ করুন ড্যাশবোর্ড থেকেই। রিফান্ড পলিসি পেজ জেনারেট হবে অটোমেটিক।"
              />
              <FeatureRow 
                icon={MapPin} 
                title="Real-time Order Tracking" 
                desc="কাস্টমাররা তাদের অর্ডারের লাইভ আপডেট পাবে SMS এর মাধ্যমে।"
              />
            </div>
          </div>

          {/* Graphic Visualization - Premium Map */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Map/Network Illustration */}
            <div className="relative h-[500px] bg-[#0F1419] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
               {/* Map Background with Gradient Overlay */}
               <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bangladesh_location_map.svg/1704px-Bangladesh_location_map.svg.png')] bg-cover bg-center opacity-40 grayscale invert mix-blend-overlay" />
               <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F0D]/60 via-transparent to-[#0A0F0D]/60" />
               <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F0D]/60 via-transparent to-[#0A0F0D]/60" />
               
               {/* Central Hub (DHAKA) */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                 <div className="relative group cursor-pointer">
                   <div className="w-20 h-20 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] z-20 relative transition-transform duration-500 group-hover:scale-110">
                     <Package className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                   </div>
                   {/* Multiple Ripples */}
                   <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                   <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-10 animation-delay-500" />
                   
                   {/* Label */}
                   <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-500/30 whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                     CENTRAL HUB (DHAKA)
                   </div>
                 </div>
               </div>

               {/* Hub-and-Spoke Network Visualization */}
               
               {/* City Nodes */}
               {[
                 { id: 'ctg', x: 80, y: 75, name: 'Chittagong' },
                 { id: 'syl', x: 85, y: 35, name: 'Sylhet' },
                 { id: 'khl', x: 25, y: 70, name: 'Khulna' },
                 { id: 'raj', x: 20, y: 30, name: 'Rajshahi' },
                 { id: 'ran', x: 30, y: 15, name: 'Rangpur' },
               ].map((city) => (
                 <div key={city.id} className="absolute" style={{ left: `${city.x}%`, top: `${city.y}%` }}>
                   {/* Connection Line to Hub */}
                   <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none overflow-visible" 
                        style={{ 
                          left: `${50 - city.x}%`, 
                          top: `${50 - city.y}%` 
                        }}>
                     <motion.path
                       d={`M ${50 + (city.x - 50) * 2.5} ${50 + (city.y - 50) * 2.5} L 250 250`} // Drawing from city relative pos to center (250,250)
                       stroke="url(#lineGradient)"
                       strokeWidth="2"
                       strokeDasharray="4 4"
                       fill="none"
                       initial={{ pathLength: 0, opacity: 0 }}
                       whileInView={{ pathLength: 1, opacity: 0.3 }}
                       transition={{ duration: 1.5 }}
                     />
                     {/* Moving Packet */}
                     <circle r="4" fill="#00DDA2">
                       <animateMotion 
                         dur={`${3 + Math.random() * 2}s`} 
                         repeatCount="indefinite"
                         path={`M ${50 + (city.x - 50) * 2.5} ${50 + (city.y - 50) * 2.5} L 250 250`}
                         keyPoints="0;1"
                         keyTimes="0;1"
                       />
                     </circle>
                   </svg>
                   
                   {/* City Dot */}
                   <div className="relative group">
                     <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] z-10 relative" />
                     <div className="absolute -inset-2 rounded-full border border-white/20 animate-ping opacity-20" />
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[10px] font-bold text-white/70 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                       {city.name}
                     </div>
                   </div>
                 </div>
               ))}

               {/* Definitions for Gradients */}
               <svg className="absolute opacity-0">
                 <defs>
                   <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                     <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
                     <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                   </linearGradient>
                 </defs>
               </svg>

               {/* Courier Logos Carousel - Glass Card */}
               <div className="absolute bottom-6 left-6 right-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
                 <div className="flex justify-between items-center px-2">
                   {COURIERS.map((courier, idx) => (
                      <motion.div 
                        key={idx}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        animate={{ 
                          scale: idx === activeCourierIndex ? 1.1 : 0.9, 
                          opacity: idx === activeCourierIndex ? 1 : 0.7 // Increased inactive opacity
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                          idx === activeCourierIndex 
                            ? `bg-${courier.color}20 text-white border-${courier.color}50 shadow-[0_0_15px_${courier.color}40]` 
                            : 'bg-white/10 text-white/70 border-white/5 group-hover:bg-white/20' // Brighter inactive state
                        }`}
                        style={{
                          backgroundColor: idx === activeCourierIndex ? `${courier.color}33` : undefined,
                          borderColor: idx === activeCourierIndex ? `${courier.color}80` : undefined,
                          boxShadow: idx === activeCourierIndex ? `0 0 15px ${courier.color}40` : undefined
                        }}>
                            {courier.logo}
                        </div>
                        <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                          idx === activeCourierIndex ? 'text-white' : 'text-white/60'
                        }`}>
                          {courier.name}
                        </span>
                      </motion.div>
                   ))}
                 </div>
                 {/* Progress Indicator */}
                 <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-all duration-500"
                      style={{ 
                        width: '20%', 
                        left: `${activeCourierIndex * 20}%` 
                      }} 
                 />
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface FeatureRowProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

function FeatureRow({ icon: Icon, title, desc }: FeatureRowProps) {
  return (
    <motion.div 
      whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
      className="flex gap-5 p-5 rounded-2xl border border-transparent hover:border-white/10 transition-all duration-300 group cursor-pointer"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-shadow duration-300">
        <Icon className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{title}</h4>
        <p className="text-white/60 leading-relaxed text-sm group-hover:text-white/80 transition-colors">{desc}</p>
      </div>
    </motion.div>
  );
}
