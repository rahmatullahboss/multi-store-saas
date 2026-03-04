import React from "react";
import { useRef } from 'react';
import { Layers, Zap } from 'lucide-react';

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

export function UnifiedCommunicationHub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(containerRef);

  const channels = [
    { name: 'WhatsApp', icon: '📱', color: 'bg-green-500' },
    { name: 'Email', icon: '📧', color: 'bg-blue-500' },
    { name: 'SMS', icon: '💬', color: 'bg-indigo-500' },
    { name: 'Messenger', icon: '⚡', color: 'bg-sky-500' },
  ];

  return (
    <div className="py-24 bg-[#0A0A0F] relative overflow-hidden" ref={containerRef}>
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0A0A0F] to-[#0A0A0F] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Layers className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">All-in-One Hub</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            সব Channel — <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">এক Dashboard এ!</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
             আলাদা আলাদা পেজ বা অ্যাপে লগইন করার দরকার নেই। সব কাস্টমার কমিউনিকেশন এক জায়গা থেকে ম্যানেজ করুন।
          </p>
        </div>

        <div className="relative h-[500px] flex items-center justify-center">
            
            {/* Center Hub */}
            <div className="z-20 bg-gray-900 border border-gray-700 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] relative"
            >
               <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg">
                  <Zap className="w-8 h-8 fill-white" />
               </div>
               <h3 className="text-white font-bold text-lg">Unified Hub</h3>
               <p className="text-xs text-gray-500">Central Control</p>

               {/* Radiating Circles Animation */}
               <div className="absolute inset-0 border border-blue-500/30 rounded-full -ping opacity-20" style={{ animationDuration: '3s' }} />
               <div className="absolute -inset-4 border border-purple-500/20 rounded-full -pulse" />
            </div>

            {/* Orbiting Channels */}
            {channels.map((channel, idx) => {
              // Calculate position in circle
              const angle = (idx * (360 / channels.length)) * (Math.PI / 180);
              const radius = 160; // Distance from center
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={idx} className="absolute z-10 hidden md:flex flex-col items-center"
                >
                   {/* Connecting Line */}
                   <div className="absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-b from-gray-700 to-transparent -z-10 origin-top"
                     style={{ 
                       transform: `rotate(${idx * 90 + 90}deg) translateY(24px)`,
                       height: '100px' // Visual line (simplified, actual drawing lines in CSS/SVG is better but this works for simple viz)
                     }}
                   />
                   
                   <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-xl flex flex-col items-center w-32 backdrop-blur-sm">
                      <div className={`w-10 h-10 ${channel.color} rounded-full flex items-center justify-center text-lg mb-2 shadow-lg`}>
                        {channel.icon}
                      </div>
                      <span className="text-white font-semibold text-sm">{channel.name}</span>
                   </div>
                </div>
              );
            })}
            
            {/* Mobile View List (Fallback) */}
            <div className="md:hidden grid grid-cols-2 gap-4 w-full">
               {channels.map((channel, idx) => (
                 <div key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
                    <div className={`w-10 h-10 ${channel.color} rounded-full flex items-center justify-center text-lg mb-2`}>
                      {channel.icon}
                    </div>
                    <span className="text-white font-medium">{channel.name}</span>
                 </div>
               ))}
            </div>

        </div>

        {/* Cost Comparison */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 max-w-4xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                 <h4 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2">Total Monthly Cost (Competitors)</h4>
                 <div className="space-y-1 text-gray-500 text-sm">
                   <p>Mailchimp: ৳2,000</p>
                   <p>WA Business API: ৳5,000</p>
                   <p>SMS Gateway: ৳1,500</p>
                 </div>
                 <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xl font-bold text-red-400">Total: ৳8,500 / month</p>
                 </div>
              </div>

              <div className="hidden md:block h-24 w-px bg-gray-700" />

              <div className="text-center md:text-right">
                 <h4 className="text-blue-400 text-sm uppercase tracking-wider font-semibold mb-2">With Ozzyl</h4>
                 <p className="text-4xl font-bold text-white mb-2">৳499 <span className="text-sm text-gray-400 font-normal">/ month</span></p>
                 <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">ALL INCLUDED</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
