/**
 * Speed Comparison Component - "দেখুন পার্থক্যটা"
 * 
 * Shows a dramatic side-by-side race animation comparing:
 * - Regular hosting (slow, ~3.2s loading)
 * - Our platform with Cloudflare CDN (fast, ~0.4s loading)
 * 
 * Features:
 * - Animated race with skeleton screens vs instant load
 * - Real-time timers counting up
 * - Replay button for repeated impact
 * - Emotional impact messaging about conversion rates
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, TrendingUp, Clock, ShoppingCart, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

// Simple useInView (replaces framer-motion)
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

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#F9A825',
  cyan: '#22D3EE',
  red: '#EF4444',
  green: '#10B981',
  background: '#0A0F0D',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
};

// ============================================================================
// SKELETON LOADER - Slow side
// ============================================================================
const SkeletonLoader = ({ progress }: { progress: number }) => {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg bg-white/10"
        />
        <div className="flex-1 space-y-2">
          <div 
            className="h-3 rounded bg-white/10"
            style={{ width: `${Math.min(progress * 30, 70)}%` }}
          />
          <div 
            className="h-2 rounded bg-white/10"
            style={{ width: `${Math.min(progress * 20, 50)}%` }}
          />
        </div>
      </div>
      
      {/* Image skeleton */}
      <div 
        className="w-full aspect-square rounded-xl bg-white/10 flex items-center justify-center"
      >
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
      
      {/* Content skeletons */}
      <div className="space-y-2">
        <div 
          className="h-3 rounded bg-white/10"
          style={{ width: `${Math.min(progress * 25, 90)}%` }}
        />
        <div 
          className="h-3 rounded bg-white/10"
          style={{ width: `${Math.min(progress * 20, 70)}%` }}
        />
      </div>
      
      {/* Button skeleton */}
      <div 
        className="h-10 rounded-lg bg-white/10"
        style={{ width: `${Math.min(progress * 30, 100)}%` }}
      />
      
      {/* Loading bar at bottom */}
      <div className="h-1 rounded-full bg-white/10 overflow-hidden mt-4">
        <div
          className="h-full rounded-full"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${COLORS.red}80, ${COLORS.red})`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// LOADED STORE PREVIEW - Fast side
// ============================================================================
const LoadedStore = () => {
  return (
    <div 
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
        >
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p 
            className="text-white font-semibold text-sm"
          >
            ফ্যাশন স্টোর বিডি
          </p>
          <p 
            className="text-white/50 text-xs"
          >
            Premium Fashion
          </p>
        </div>
      </div>
      
      {/* Product Image */}
      <div 
        className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-600/20 border border-white/10 overflow-hidden relative"
      >
        {/* Fake product image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-6xl"
          >
            👕
          </div>
        </div>
        
        {/* Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded"
        >
          -30%
        </div>
      </div>
      
      {/* Product Info */}
      <div 
        className="space-y-1"
      >
        <p className="text-white font-medium text-sm">Premium Cotton T-Shirt</p>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">৳ 699</span>
          <span className="text-white/40 line-through text-xs">৳ 999</span>
        </div>
      </div>
      
      {/* Buy Button */}
      <button
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
        >
        <ShoppingCart className="w-4 h-4" />
        অর্ডার করুন
      </button>
      
      {/* Success indicator */}
      <div
        className="flex items-center justify-center gap-2 text-emerald-400 text-xs"
      >
        <CheckCircle2 className="w-4 h-4" />
        Ready to sell!
      </div>
    </div>
  );
};

// ============================================================================
// TIMER DISPLAY
// ============================================================================
const Timer = ({ time, isComplete, isSlow }: { time: number; isComplete: boolean; isSlow: boolean }) => {
  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isComplete 
          ? isSlow ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
          : 'bg-white/10 text-white'
      }`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono font-bold text-lg">
        {time.toFixed(1)}s
      </span>
      {isComplete && (
        <span
          className="text-xs"
        >
          ⏱️
        </span>
      )}
    </div>
  );
};

// ============================================================================
// MAIN SPEED COMPARISON COMPONENT
// ============================================================================
export function SpeedComparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInViewSimple(sectionRef);
  
  const [isRacing, setIsRacing] = useState(false);
  const [slowTime, setSlowTime] = useState(0);
  const [fastTime, setFastTime] = useState(0);
  const [slowComplete, setSlowComplete] = useState(false);
  const [fastComplete, setFastComplete] = useState(false);
  const [slowProgress, setSlowProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const isMobile = useIsMobile();
  
  const SLOW_LOAD_TIME = 3.2;
  const FAST_LOAD_TIME = 0.4;
  
  const startRace = useCallback(() => {
    setIsRacing(true);
    setHasStarted(true);
    setSlowTime(0);
    setFastTime(0);
    setSlowComplete(false);
    setFastComplete(false);
    setSlowProgress(0);
  }, []);
  
  // Auto-start when in view
  useEffect(() => {
    if (isInView && !hasStarted) {
      if (isMobile) {
        // Instant finish on mobile
        setSlowTime(SLOW_LOAD_TIME);
        setFastTime(FAST_LOAD_TIME);
        setSlowProgress(100);
        setSlowComplete(true);
        setFastComplete(true);
        setHasStarted(true);
      } else {
        const timer = setTimeout(() => {
          startRace();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isInView, hasStarted, startRace, isMobile]);
  
  // Race animation logic
  useEffect(() => {
    if (!isRacing) return;
    
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Update slow side
      if (elapsed < SLOW_LOAD_TIME) {
        setSlowTime(elapsed);
        setSlowProgress((elapsed / SLOW_LOAD_TIME) * 100);
      } else if (!slowComplete) {
        setSlowTime(SLOW_LOAD_TIME);
        setSlowProgress(100);
        setSlowComplete(true);
      }
      
      // Update fast side
      if (elapsed < FAST_LOAD_TIME) {
        setFastTime(elapsed);
      } else if (!fastComplete) {
        setFastTime(FAST_LOAD_TIME);
        setFastComplete(true);
      }
      
      // Stop when both complete
      if (elapsed >= SLOW_LOAD_TIME) {
        clearInterval(interval);
        setIsRacing(false);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isRacing, slowComplete, fastComplete]);
  
  const handleReplay = () => {
    setHasStarted(false);
    setTimeout(() => startRace(), 100);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.primary}10 0%, transparent 70%)`,
          }}
        />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6"
            style={{ 
              backgroundColor: `${COLORS.accent}10`,
              borderColor: `${COLORS.accent}30`,
            }}
          >
            <Zap className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span style={{ color: COLORS.accent }} className="text-sm font-medium">
              SPEED COMPARISON
            </span>
          </div>
          
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
          >
            দেখুন{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.green} 100%)`,
              }}
            >
              পার্থক্যটা
            </span>
          </h2>
          
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            সাধারণ Hosting বনাম আমাদের Cloudflare-powered Platform
          </p>
        </div>
        
        {/* Race Container */}
        <div
          className="relative rounded-3xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* VS Badge */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex"
          >
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.cyan} 100%)`,
                boxShadow: `0 0 30px ${COLORS.primary}50`,
              }}
            >
              VS
            </div>
          </div>
          
          {/* Side by side comparison */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Slow Side */}
            <div className="text-center">
              <div
                className="flex items-center justify-center gap-2 mb-4"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white/80" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                  সাধারণ Hosting
                </h3>
              </div>
              
              <div 
                className="rounded-2xl p-6 min-h-[320px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                
                  {!slowComplete ? (
                    <SkeletonLoader key="skeleton" progress={slowProgress} />
                  ) : (
                    <div
                      key="loaded"
                      >
                      <LoadedStore />
                    </div>
                  )}
                
              </div>
              
              <div className="mt-4 flex justify-center">
                <Timer time={slowTime} isComplete={slowComplete} isSlow={true} />
              </div>
              
              {slowComplete && (
                <p
                  className="mt-3 text-red-400/80 text-sm"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  😩 গ্রাহক অপেক্ষা করতে করতে চলে গেছে...
                </p>
              )}
            </div>
            
            {/* Fast Side */}
            <div className="text-center">
              <div
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white/80" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                  আমাদের Platform
                </h3>
              </div>
              
              <div 
                className="rounded-2xl p-6 min-h-[320px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                
                  {!fastComplete ? (
                    <div
                      key="loading"
                      className="h-full flex items-center justify-center"
                      >
                      <div
                        className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500"
                      />
                    </div>
                  ) : (
                    <LoadedStore key="loaded" />
                  )}
                
              </div>
              
              <div className="mt-4 flex justify-center">
                <Timer time={fastTime} isComplete={fastComplete} isSlow={false} />
              </div>
              
              {fastComplete && (
                <p
                  className="mt-3 text-emerald-400/80 text-sm"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  🎉 তাৎক্ষণিক! গ্রাহক কেনাকাটা করছে!
                </p>
              )}
            </div>
          </div>
          
          {/* Replay Button */}
          <div
            className="flex justify-center mt-8"
          >
            <button
              onClick={handleReplay}
              disabled={isRacing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: COLORS.text,
              }}
              >
              <RefreshCw className={`w-5 h-5 ${isRacing ? 'animate-spin' : ''}`} />
              <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                🔄 আবার দেখুন
              </span>
            </button>
          </div>
        </div>
        
        {/* Impact Stats */}
        <div
          className="mt-12 text-center"
        >
          <div 
            className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <div className="text-left">
              <p className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                <span className="text-emerald-400">8x</span> দ্রুত Loading = <span className="text-cyan-400">40%</span> বেশি Sales
              </p>
              <p className="text-sm text-white/50" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                গবেষণায় প্রমাণিত: প্রতি ১ সেকেন্ড দেরিতে 7% conversion কমে যায়
              </p>
            </div>
          </div>
        </div>
        
        {/* Additional context */}
        <div
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm"
          style={{ color: COLORS.textSubtle }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cloudflare Edge Network</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>310+ Global Servers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span>Smart Caching</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SpeedComparison;
