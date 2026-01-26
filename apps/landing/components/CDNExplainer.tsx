'use client';

/**
 * CDN Explainer Component - "সহজ বাংলায় বুঝুন"
 * 
 * A simple, visual explainer for non-technical users
 * who don't understand what CDN means.
 * 
 * Features:
 * - Animated data packet traveling long distance (slow) vs short (fast)
 * - Side by side comparison
 * - Bengali language explanations
 * - Speed counters showing the difference
 */

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { HelpCircle, RefreshCw, Globe, Server, User, Zap, Clock, MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  cardBg: 'rgba(255, 255, 255, 0.02)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.08)',
};

// ============================================================================
// DATA PACKET ANIMATION
// ============================================================================
interface DataPacketProps {
  isAnimating: boolean;
  duration: number;
  color: string;
  delay?: number;
}

const DataPacket = ({ isAnimating, duration, color, delay = 0 }: DataPacketProps) => {
  return (
    <motion.div
      className="absolute w-4 h-4 rounded-full"
      style={{
        background: `radial-gradient(circle, ${color} 0%, ${color}80 50%, transparent 100%)`,
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50`,
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
      }}
      initial={{ x: 0, opacity: 0 }}
      animate={isAnimating ? {
        x: ['0%', '100%'],
        opacity: [0, 1, 1, 0],
      } : { x: 0, opacity: 0 }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        times: [0, 0.1, 0.9, 1],
      }}
    />
  );
};

// ============================================================================
// CONNECTION LINE
// ============================================================================
interface ConnectionLineProps {
  progress: number;
  color: string;
  isDashed?: boolean;
}

const ConnectionLine = ({ progress, color, isDashed }: ConnectionLineProps) => {
  return (
    <div className="relative w-full h-1 overflow-hidden">
      {/* Background line */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: 'rgba(255,255,255,0.1)',
          borderStyle: isDashed ? 'dashed' : 'solid',
        }}
      />
      
      {/* Progress line */}
      <motion.div
        className="absolute h-full rounded-full"
        style={{ 
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 10px ${color}50`,
        }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

// ============================================================================
// LOCATION NODE
// ============================================================================
interface LocationNodeProps {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  color: string;
  isActive?: boolean;
  emoji?: string;
}

const LocationNode = ({ icon: Icon, label, sublabel, color, isActive, emoji }: LocationNodeProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center gap-2"
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
        style={{
          background: `${color}20`,
          border: `2px solid ${color}40`,
          boxShadow: isActive ? `0 0 30px ${color}40` : 'none',
        }}
        animate={isActive ? { 
          borderColor: [color + '40', color, color + '40'],
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : (
          <Icon className="w-7 h-7" style={{ color }} />
        )}
        
        {/* Pulse ring when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `2px solid ${color}` }}
            animate={{ 
              scale: [1, 1.3, 1.3],
              opacity: [0.5, 0, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      <div className="text-center">
        <p className="text-white text-sm font-medium">{label}</p>
        {sublabel && (
          <p className="text-xs" style={{ color: COLORS.textSubtle }}>{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// SCENARIO CARD
// ============================================================================
interface ScenarioCardProps {
  title: string;
  titleBn: string;
  isGood: boolean;
  customerLocation: string;
  serverLocation: string;
  serverEmoji: string;
  distance: string;
  time: string;
  currentTime: number;
  isAnimating: boolean;
  progress: number;
  isComplete: boolean;
}

const ScenarioCard = ({
  title,
  titleBn,
  isGood,
  customerLocation,
  serverLocation,
  serverEmoji,
  distance,
  time,
  currentTime,
  isAnimating,
  progress,
  isComplete,
}: ScenarioCardProps) => {
  const color = isGood ? COLORS.green : COLORS.red;
  
  return (
    <motion.div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}05 0%, ${color}02 100%)`,
        border: `1px solid ${color}20`,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-sm" style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}>
            {titleBn}
          </p>
        </div>
        <motion.div
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isGood ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
          animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
        >
          {isGood ? '⚡ FAST' : '🐢 SLOW'}
        </motion.div>
      </div>
      
      {/* Visual Journey */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <LocationNode
          emoji="👤"
          icon={User}
          label="Customer"
          sublabel={customerLocation}
          color={COLORS.cyan}
          isActive={isAnimating && !isComplete}
        />
        
        {/* Connection with packet animation */}
        <div className="flex-1 relative py-4">
          <ConnectionLine 
            progress={progress} 
            color={color}
            isDashed={!isGood}
          />
          
          {/* Distance label */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-white/40">
            {distance}
          </div>
          
          {/* Animated packet */}
          {isAnimating && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
              <DataPacket
                isAnimating={isAnimating}
                duration={isGood ? 0.5 : 3}
                color={color}
              />
            </div>
          )}
        </div>
        
        <LocationNode
          emoji={serverEmoji}
          icon={Server}
          label="Server"
          sublabel={serverLocation}
          color={isGood ? COLORS.green : COLORS.accent}
          isActive={isComplete}
        />
      </div>
      
      {/* Timer and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: COLORS.textMuted }} />
          <span className="font-mono text-lg" style={{ color }}>
            {currentTime.toFixed(1)}s
          </span>
          {isComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm"
            >
              ⏱️
            </motion.span>
          )}
        </div>
        
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">{isGood ? '😊' : '😫'}</span>
            <span 
              className="text-sm font-medium"
              style={{ color, fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {isGood ? 'Super Fast!' : 'অনেক Slow!'}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CDNExplainer() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [slowTime, setSlowTime] = useState(0);
  const [fastTime, setFastTime] = useState(0);
  const [slowProgress, setSlowProgress] = useState(0);
  const [fastProgress, setFastProgress] = useState(0);
  const [slowComplete, setSlowComplete] = useState(false);
  const [fastComplete, setFastComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const isMobile = useIsMobile();
  
  const SLOW_TIME = 0.8; // Competitors from Singapore
  const FAST_TIME = 0.05; // Our platform from Dhaka edge
  
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setHasStarted(true);
    setSlowTime(0);
    setFastTime(0);
    setSlowProgress(0);
    setFastProgress(0);
    setSlowComplete(false);
    setFastComplete(false);
  }, []);
  
  // Auto-start when in view
  useEffect(() => {
    if (isInView && !hasStarted) {
      if (isMobile) {
        // Instant finish on mobile
        setSlowTime(SLOW_TIME);
        setFastTime(FAST_TIME);
        setSlowProgress(100);
        setFastProgress(100);
        setSlowComplete(true);
        setFastComplete(true);
        setHasStarted(true);
      } else {
        const timer = setTimeout(() => startAnimation(), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isInView, hasStarted, startAnimation, isMobile]);
  
  // Animation logic
  useEffect(() => {
    if (!isAnimating) return;
    
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Update slow side
      if (elapsed < SLOW_TIME) {
        setSlowTime(elapsed);
        setSlowProgress((elapsed / SLOW_TIME) * 100);
      } else if (!slowComplete) {
        setSlowTime(SLOW_TIME);
        setSlowProgress(100);
        setSlowComplete(true);
      }
      
      // Update fast side
      if (elapsed < FAST_TIME) {
        setFastTime(elapsed);
        setFastProgress((elapsed / FAST_TIME) * 100);
      } else if (!fastComplete) {
        setFastTime(FAST_TIME);
        setFastProgress(100);
        setFastComplete(true);
      }
      
      // Stop when both complete
      if (elapsed >= SLOW_TIME) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isAnimating, slowComplete, fastComplete]);
  
  const handleReplay = () => {
    setHasStarted(false);
    setTimeout(() => startAnimation(), 100);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.cyan}08 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6"
            style={{ 
              backgroundColor: `${COLORS.accent}10`,
              borderColor: `${COLORS.accent}30`,
            }}
          >
            <HelpCircle className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span style={{ color: COLORS.accent, fontFamily: "'Noto Sans Bengali', sans-serif" }} className="text-sm font-medium">
              সহজ বাংলায় বুঝুন
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
          >
            🤔 CDN কি জিনিস?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            CDN মানে Content Delivery Network। এটা আপনার Website কে 
            <span className="text-white font-semibold"> পৃথিবীর কাছের Server থেকে</span>{' '}
            দ্রুত সার্ভ করে।
          </motion.p>
        </div>
        
        {/* Comparison Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Without CDN - Competitors use Singapore */}
          <ScenarioCard
            title="COMPETITORS"
            titleBn="অন্যান্য Platform"
            isGood={false}
            customerLocation="Dhaka, BD"
            serverLocation="Singapore 🇸🇬"
            serverEmoji="🖥️"
            distance="3,000+ km"
            time="0.8s"
            currentTime={slowTime}
            isAnimating={isAnimating}
            progress={slowProgress}
            isComplete={slowComplete}
          />
          
          {/* With CDN - We use Bangladesh edge server */}
          <ScenarioCard
            title="আমাদের PLATFORM"
            titleBn="Cloudflare Bangladesh Edge"
            isGood={true}
            customerLocation="Dhaka, BD"
            serverLocation="Dhaka Edge 🇧🇩"
            serverEmoji="⚡"
            distance="Same City!"
            time="0.05s"
            currentTime={fastTime}
            isAnimating={isAnimating}
            progress={fastProgress}
            isComplete={fastComplete}
          />
        </motion.div>
        
        {/* Replay Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-10"
        >
          <motion.button
            onClick={handleReplay}
            disabled={isAnimating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: COLORS.text,
              fontFamily: "'Noto Sans Bengali', sans-serif",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            🔄 আবার দেখুন
          </motion.button>
        </motion.div>
        
        {/* Key Insight Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(34, 211, 238, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              সহজ কথায়:
            </h3>
          </div>
          
          <p 
            className="text-lg text-white/80 mb-2 leading-relaxed"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            🌍 <span className="text-cyan-400 font-semibold">ঢাকা থেকে দুবাই</span> — সব জায়গায় <span className="text-green-400 font-semibold">1 সেকেন্ডে Load!</span>
          </p>
          
          <p 
            className="text-base text-white/60 mb-4 leading-relaxed"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            আপনার Customer এর কাছের Server থেকেই Content Serve হয় — তাই Lightning Fast! ⚡
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span style={{ color: COLORS.textMuted }}>
                ঢাকায় Edge Server: <span className="text-white">~5ms</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <Globe className="w-4 h-4 text-green-400" />
              <span style={{ color: COLORS.textMuted }}>
                Competitors (Singapore): <span className="text-white">~80ms</span>
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Visual Difference Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { value: '8x', label: 'দ্রুত', color: COLORS.green },
            { value: '40%', label: 'বেশি Sales', color: COLORS.cyan },
            { value: '99.9%', label: 'Uptime', color: COLORS.accent },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p 
                className="text-sm"
                style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CDNExplainer;
