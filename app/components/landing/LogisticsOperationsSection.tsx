
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

          {/* Graphic Visualization */}
          <div className="relative">
            {/* Map/Network Illustration */}
            <div className="relative h-[500px] bg-[#111] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bangladesh_location_map.svg/1704px-Bangladesh_location_map.svg.png')] bg-cover bg-center opacity-10 grayscale invert" />
               
               {/* Central Hub (DHAKA) */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                 <div className="relative">
                   <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] z-20 relative">
                     <Package className="w-8 h-8 text-white" />
                   </div>
                   <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50" />
                 </div>
                 <div className="mt-2 text-center">
                   <span className="bg-black/80 px-2 py-1 rounded text-xs font-bold text-white border border-white/20">CENTRAL HUB</span>
                 </div>
               </div>

               {/* Moving Delivery Agents */}
               {[0, 1, 2, 3, 4].map((i) => (
                 <motion.div
                   key={i}
                   className="absolute top-1/2 left-1/2 z-10"
                   animate={{
                     x: [0, (Math.random() - 0.5) * 300],
                     y: [0, (Math.random() - 0.5) * 300],
                     opacity: [0, 1, 0]
                   }}
                   transition={{
                     duration: 3 + Math.random() * 2,
                     repeat: Infinity,
                     delay: i * 0.8,
                     ease: "linear"
                   }}
                 >
                   <div className="flex items-center gap-2 -translate-x-1/2 -translate-y-1/2">
                     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                        <span className="text-[10px] font-bold text-black font-mono">
                          {COURIERS[activeCourierIndex].logo}
                        </span>
                     </div>
                     {/* Dashed Line Trail - Simulated with CSS or SVG in real app */}
                   </div>
                 </motion.div>
               ))}

               {/* Courier Logos Carousel at Bottom */}
               <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                 <div className="flex justify-between items-center opacity-70">
                   {COURIERS.map((courier, idx) => (
                      <motion.div 
                        key={idx}
                        className={`font-bold transition-colors ${idx === activeCourierIndex ? 'text-white scale-110' : 'text-gray-500 grayscale'}`}
                        animate={{ scale: idx === activeCourierIndex ? 1.1 : 0.9, opacity: idx === activeCourierIndex ? 1 : 0.5 }}
                      >
                        {courier.name}
                      </motion.div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
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
    <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
  );
}
