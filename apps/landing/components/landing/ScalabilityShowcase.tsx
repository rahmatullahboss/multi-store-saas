'use client';

/**
 * Scalability Showcase Section
 * 
 * Visualizes the difference between Traditional Hosting (crashing under load)
 * and Ozzyl's Auto-Scaling architecture (Cloudflare Workers + Edge Caching).
 * 
 * Features:
 * - Animated Traffic Spike chart
 * - Interactive "Stress Test" toggle
 * - Comparison stats (Uptime, Response Time, Cost)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Server, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Zap,
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ScrollReveal } from '@/components/animations';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  accent: '#F9A825',
  success: '#10B981',
  danger: '#EF4444',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  cardBg: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.1)',
};

// ============================================================================
// TRAFFIC SIMULATION GRAPH
// ============================================================================
const TrafficGraph = ({ isOzzyl, isStressTest }: { isOzzyl: boolean; isStressTest: boolean }) => {
  const [bars, setBars] = useState<number[]>(Array(20).fill(20));
  
  // Simulate traffic data
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => {
        const newBars = [...prev.slice(1)];
        // Base traffic
        let height = 20 + Math.random() * 15;
        
        // Spike during stress test
        if (isStressTest) {
          height = 60 + Math.random() * 30;
          
          // Traditional hosting crashes (drops to 0) occasionally under stress
          if (!isOzzyl && Math.random() > 0.7) {
            height = 5; 
          }
        }
        
        newBars.push(height);
        return newBars;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [isOzzyl, isStressTest]);

  return (
    <div className="h-40 flex items-end gap-1 px-4 pb-0 opacity-80">
      {bars.map((height, i) => {
        // Determine color based on height/state
        let color = isOzzyl ? COLORS.success : COLORS.accent;
        if (!isOzzyl && isStressTest && height < 10) color = COLORS.danger; // Crashed
        
        return (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm min-w-[4px]"
            initial={{ height: `${height}%` }}
            animate={{ 
              height: `${height}%`,
              backgroundColor: color,
              opacity: (!isOzzyl && isStressTest && height < 10) ? 0.5 : 1
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        );
      })}
    </div>
  );
};

// ============================================================================
// SCALABILITY SHOWCASE COMPONENT
// ============================================================================
export function ScalabilityShowcase() {
  const [isStressTest, setIsStressTest] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Auto-start stress test when in view
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsStressTest(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section ref={containerRef} className="py-24 relative bg-[#050807] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#006A4E]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#006A4E]/30 bg-[#006A4E]/10 backdrop-blur-sm mb-6"
            >
              <Activity className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm font-bold text-[#10B981] uppercase tracking-wider">
                Unbeatable Reliability
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              আনলিমিটেড ট্রাফিক? <span className="text-[#10B981]">নো টেনশন!</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              হঠাৎ করে হাজার হাজার ভিজিটর এলেও আপনার সাইট থাকবে সুপার ফাস্ট। কারণ Ozzyl ব্যবহার করে অটো-স্কেলিং টেকনোলজি।
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive Comparison Wrapper */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* TRADITIONAL HOSTING CARD */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden relative group"
          >
            {/* Status Bar */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-white/40" />
                <span className="font-semibold text-white/80">Traditional VPS/Shared</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isStressTest ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white/50'}`}>
                {isStressTest ? (
                  <>
                    <AlertTriangle className="w-3 h-3" /> CRASH RISK
                  </>
                ) : (
                  'Low Traffic'
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex justify-between mb-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {isStressTest ? 'Error 502' : '200 OK'}
                  </div>
                  <div className="text-sm text-white/40">Status Code</div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold mb-1 ${isStressTest ? 'text-red-500' : 'text-white'}`}>
                    {isStressTest ? 'Wait...' : '0.8s'}
                  </div>
                  <div className="text-sm text-white/40">Response Time</div>
                </div>
              </div>

              {/* Graph */}
              <div className="relative h-48 rounded-xl bg-black/20 border border-white/5 overflow-hidden mb-6 flex items-end">
                <TrafficGraph isOzzyl={false} isStressTest={isStressTest} />
                
                {/* Crash Overlay */}
                {isStressTest && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-[2px]"
                  >
                    <div className="bg-red-500/20 border border-red-500/50 px-4 py-2 rounded text-red-400 font-mono text-xs font-bold">
                      SERVER OVERLOAD
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>ভিজিটর বাড়লে স্লো হয়ে যায় বা ক্র্যাশ করে</span>
                </li>
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>র‍্যাম বা সিপিইউ লিমিটেড থাকে</span>
                </li>
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>স্কেল করতে সার্ভার আপগ্রেড করতে হয় (Time Consuming)</span>
                </li>
              </ul>
            </div>
            
            {/* Red Glow on Stress */}
            {isStressTest && (
              <div className="absolute inset-0 border-2 border-red-500/20 rounded-3xl pointer-events-none animate-pulse" />
            )}
          </motion.div>


          {/* OZZYL SCALABLE CARD */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-[#10B981]/30 bg-gradient-to-b from-[#10B981]/5 to-transparent overflow-hidden relative shadow-[0_0_50px_-20px_rgba(16,185,129,0.2)]"
          >
            {/* Status Bar */}
            <div className="px-6 py-4 border-b border-[#10B981]/20 flex justify-between items-center bg-[#10B981]/5">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#10B981]" />
                <span className="font-semibold text-white">Ozzyl Cloud Platform</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-bold">
                <ShieldCheck className="w-3 h-3" /> AUTO-SCALING ACTIVE
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex justify-between mb-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">200 OK</div>
                  <div className="text-sm text-white/40">Always Online</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#10B981] mb-1">0.05s</div>
                  <div className="text-sm text-white/40">Constant Speed</div>
                </div>
              </div>

              {/* Graph */}
              <div className="relative h-48 rounded-xl bg-black/20 border border-[#10B981]/20 overflow-hidden mb-6 flex items-end">
                <TrafficGraph isOzzyl={true} isStressTest={isStressTest} />
                
                {/* Overlay Metric */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
                   <div className="bg-[#10B981]/20 border border-[#10B981]/30 px-3 py-1.5 rounded text-[#10B981] font-mono text-xs font-bold flex items-center gap-2">
                      <Users className="w-3 h-3" /> 
                      {isStressTest ? 'Infinite Scaling' : 'Ready for Millions'}
                   </div>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/90 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>১০ মিলিয়ন শপ, প্রত্যেকে ১০ মিলিয়ন ভিজিটর? <span className="text-[#10B981]">No Problem!</span></span>
                </li>
                <li className="flex items-start gap-3 text-white/90 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>গ্লোবাল এজ নেটওয়ার্ক - ট্রাফিক বাড়লে ইনফ্রাস্ট্রাকচার বড় হয়</span>
                </li>
                <li className="flex items-start gap-3 text-white/90 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>অটোম্যাটিক স্কেলিং - সার্ভার ক্র্যাশ করার কোনো সুযোগ নেই</span>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>

        {/* CTA Banner */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
        >
             <button
              onClick={() => setIsStressTest(!isStressTest)} 
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
            >
              <span className={`w-3 h-3 rounded-full ${isStressTest ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
              <span className="font-bold text-white tracking-wide">
                {isStressTest ? 'STOP INFINITE LOAD' : 'TEST INFINITE SCALABILITY'}
              </span>
              <TrendingUp className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
            </button>
            <p className="mt-4 text-sm text-white/30">
               Click to simulate unlimited traffic load
            </p>
        </motion.div>

      </div>
    </section>
  );
}

export default ScalabilityShowcase;
