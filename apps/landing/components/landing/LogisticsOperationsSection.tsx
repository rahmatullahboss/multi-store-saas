import { Truck, Package, CheckCircle, Printer, ArrowRight, Coins, Smartphone, Search } from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';

const COURIERS = [
  { name: 'Steadfast', color: '#EF4444', logo: 'S', rate: 60, time: '24h' },
  { name: 'Pathao', color: '#EF4444', logo: 'P', rate: 70, time: '24h' },
  { name: 'RedX', color: '#EF4444', logo: 'R', rate: 65, time: '48h' },
  { name: 'Paperfly', color: '#3B82F6', logo: 'PF', rate: 65, time: '48h' },
  { name: 'eCourier', color: '#10B981', logo: 'E', rate: 80, time: '24h' },
];

export function LogisticsOperationsSection() {
  const [activeTab, setActiveTab] = useState<'booking' | 'map'>('booking');

  return (
    <section className="relative py-24 bg-[#0A0F0D] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start lg:items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-400">Smart Logistics</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              ডেলিভারি হ্যাসেল?<br />
              <span className="text-blue-500">ভুলে যান আজই!</span>
            </h2>
            
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Steadfast, Pathao, RedX সহ দেশের সেরা কুরিয়ারগুলোর সাথে ফুল API ইন্টিগ্রেশন। এক ক্লিকে বেস্ট রেট সিলেক্ট করুন এবং বুকিং কনফার্ম করুন।
            </p>

            <div className="space-y-6">
              <FeatureRow 
                icon={Search} 
                title="Smart Rate Comparison" 
                desc="অর্ডার প্লেস করার আগেই দেখে নিন কোন কুরিয়ারে চার্জ সবথেকে কম।"
              />
              <FeatureRow 
                icon={Smartphone} 
                title="Paperless Delivery" 
                desc="প্রিন্টার নেই? সমস্যা নেই! পেপারলেস ডেলিভারি কোড সিস্টেম।"
              />
              <FeatureRow 
                icon={Coins} 
                title="Auto COD Calculation" 
                desc="ক্যাশ অন ডেলিভারি চার্জ এবং পেমেন্ট ট্র্যাকিং সম্পূর্ণ অটোমেটেড।"
              />
            </div>
          </div>

          {/* Visualization Column */}
          <div className="relative order-1 lg:order-2">
            
            {/* Tab Switcher */}
            <div className="flex justify-center mb-6">
              <div className="p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm inline-flex">
                <button 
                  onClick={() => setActiveTab('booking')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'booking' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  Live Booking Demo
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  Coverage Map
                </button>
              </div>
            </div>

            <div className="bg-[#0F1419] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl min-h-[500px] relative">
               
                 {activeTab === 'booking' ? (
                   <BookingSimulation key="booking" />
                 ) : (
                   <CoverageMap key="map" />
                 )}
               
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function BookingSimulation() {
  const [step, setStep] = useState(1);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);

  // Auto-advance logic for demo feel
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3) {
      timer = setTimeout(() => setStep(1), 5000); // Reset after success
    }
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div 
      className="p-6 md:p-8 h-full flex flex-col justify-center"
    >
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
        {[1, 2, 3].map((s) => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${s <= step ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-[#1E2329] text-white/30 border border-white/10'}`}>
            {s === 3 && step === 3 ? <CheckCircle className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      
        {step === 1 && (
          <div 
            key="step1"
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">New Order #1024</h3>
              <p className="text-white/50 text-sm">Customer: Rahat Ahmed • Dhaka</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
               <div className="h-10 bg-white/5 rounded-lg w-full flex items-center px-4 text-white/40 text-sm">Weight: 1.5 KG</div>
               <div className="h-10 bg-white/5 rounded-lg w-full flex items-center px-4 text-white/40 text-sm">Value: 1,250 BDT</div>
               <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                 <div className="flex items-center gap-2">
                   <Coins className="w-4 h-4 text-blue-400" />
                   <span className="text-sm text-blue-300 font-medium">Cash on Delivery</span>
                 </div>
                 <div className="w-8 h-5 bg-blue-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                 </div>
               </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 group"
            >
              Check Rates <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div 
            key="step2"
          >
            <h3 className="text-center text-lg font-bold text-white mb-6">Select Courier</h3>
            <div className="space-y-3 mb-6">
              {COURIERS.slice(0, 3).map((c, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedCourier(c.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${selectedCourier === c.name ? 'bg-blue-500/20 border-blue-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-900">{c.logo}</div>
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-xs text-white/50">{c.time} • Instant Payment</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{c.rate} TK</div>
                    {i === 0 && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Best Value</span>}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setStep(3)}
              disabled={!selectedCourier}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${selectedCourier ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
            >
              Confirm Booking
            </button>
          </div>
        )}

        {step === 3 && (
          <div 
            key="step3"
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
            <p className="text-white/60 mb-8">Tracking ID: <span className="text-blue-400 font-mono">TRK-88592</span></p>
            
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white border border-white/10 flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> Print Label
              </button>
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm border border-blue-500/30 transition-colors"
              >
                New Booking
              </button>
            </div>
          </div>
        )}
      
    </div>
  );
}

function CoverageMap() {
  const [activeCourierIndex, setActiveCourierIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCourierIndex(prev => (prev + 1) % COURIERS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="h-full relative"
    >
        {/* Map Background with Gradient Overlay */}
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bangladesh_location_map.svg/1704px-Bangladesh_location_map.svg.png')] bg-cover bg-center opacity-40 grayscale invert mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1419]/60 via-transparent to-[#0F1419]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1419]/60 via-transparent to-[#0F1419]/60" />
        
        {/* Central Hub (DHAKA) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] z-20 relative transition-transform duration-500 group-hover:scale-110">
              <Package className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-10 animation-delay-500" />
          </div>
        </div>

        {/* Courier Logos Carousel */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex justify-between items-center px-2">
            {COURIERS.map((courier, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                  idx === activeCourierIndex 
                    ? `bg-[${courier.color}]/20 text-white border-[${courier.color}]/50 shadow-[0_0_15px_${courier.color}40]` 
                    : 'bg-white/10 text-white/70 border-white/5 group-hover:bg-white/20'
                }`}>
                    {courier.logo}
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                  idx === activeCourierIndex ? 'text-white' : 'text-white/60'
                }`}>
                  {courier.name}
                </span>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

interface FeatureRowProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

function FeatureRow({ icon: Icon, title, desc }: FeatureRowProps) {
  return (
    <div 
      className="flex gap-5 p-5 rounded-2xl border border-transparent hover:border-white/10 transition-all duration-300 group cursor-pointer"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-shadow duration-300">
        <Icon className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{title}</h4>
        <p className="text-white/60 leading-relaxed text-sm group-hover:text-white/80 transition-colors">{desc}</p>
      </div>
    </div>
  );
}
