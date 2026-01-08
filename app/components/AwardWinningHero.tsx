/**
 * Award-Winning Hero Section - Bangladesh Edition
 * 
 * Design: Bangladesh's First Bangla-Native E-commerce Builder
 * Theme: Dark mode with Bangladesh-inspired accent colors
 *        Deep Green (#006A4E) + Golden (#F9A825)
 * 
 * Features:
 * - Split screen layout (messaging + builder demo)
 * - Gradient mesh background (green to deep blue)
 * - Floating Bengali typography elements
 * - Staggered headline animation (word by word)
 * - Magnetic hover effects on CTAs
 * - Live signup counter
 * - Builder interface mockup with animations
 */

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { Play, Check, ArrowRight, Sparkles, MousePointer2, Type, Palette, Globe } from 'lucide-react';

// ============================================================================
// DESIGN TOKENS - Bangladesh Theme
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  primaryDark: '#004D38',
  accent: '#F9A825',       // Golden Yellow
  accentLight: '#FFB74D',
  background: '#0A0F0D',   // Deep dark with green tint
  backgroundAlt: '#0D1512',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
};

// ============================================================================
// GRAIN TEXTURE OVERLAY
// ============================================================================
const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

// ============================================================================
// FLOATING BENGALI TYPOGRAPHY ELEMENTS
// ============================================================================
const FloatingBengaliText = () => {
  const bengaliChars = ['অ', 'আ', 'ই', 'ক', 'খ', 'গ', 'ব', 'ম', 'স', 'হ', 'ড', 'ন'];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bengaliChars.map((char, i) => (
        <motion.span
          key={i}
          className="absolute text-6xl md:text-8xl font-bold select-none"
          style={{
            left: `${10 + (i % 4) * 25}%`,
            top: `${15 + Math.floor(i / 4) * 30}%`,
            color: 'rgba(0, 106, 78, 0.07)',
            fontFamily: "'Noto Sans Bengali', sans-serif",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.03, 0.08, 0.03],
            y: [0, -10, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 8 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
};

// ============================================================================
// GRADIENT MESH BACKGROUND
// ============================================================================
const GradientMeshBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Primary green gradient orb */}
    <motion.div
      className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
      style={{
        background: `radial-gradient(circle, ${COLORS.primary}40 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.15, 1],
        x: [0, 60, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Deep blue gradient orb */}
    <motion.div
      className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.35) 0%, transparent 70%)',
      }}
      animate={{
        scale: [1.1, 1, 1.1],
        x: [0, -40, 0],
        y: [0, -60, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Golden accent orb */}
    <motion.div
      className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full"
      style={{
        background: `radial-gradient(circle, ${COLORS.accent}20 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Gradient overlay */}
    <div 
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.backgroundAlt} 50%, rgba(10, 30, 50, 0.95) 100%)`,
      }}
    />
  </div>
);

// ============================================================================
// MAGNETIC BUTTON COMPONENT
// ============================================================================
interface MagneticProps {
  children: ReactNode;
  className?: string;
}

const Magnetic = ({ children, className = '' }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.35);
    y.set((e.clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// STAGGERED TEXT REVEAL
// ============================================================================
const StaggeredText = ({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 30, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.12,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

// ============================================================================
// LIVE SIGNUP COUNTER
// ============================================================================
const LiveSignupCounter = () => {
  const [count, setCount] = useState(2847);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Simulate live signups
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount(prev => prev + 1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="flex items-center gap-2 text-sm"
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-green-400"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-white/50">
        এখন পর্যন্ত{' '}
        <motion.span
          className="text-white font-semibold"
          animate={isAnimating ? { scale: [1, 1.15, 1], color: [COLORS.text, COLORS.accent, COLORS.text] } : {}}
          transition={{ duration: 0.5 }}
        >
          {count.toLocaleString()}
        </motion.span>
        {' '}জন Signup করেছেন...
      </span>
    </motion.div>
  );
};

// ============================================================================
// BUILDER MOCKUP - ANIMATED DEMO
// ============================================================================
const BuilderMockup = () => {
  const [step, setStep] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  
  // Cycle through builder demo steps
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 4) {
        setStep(step + 1);
      } else {
        setIsPublished(true);
        setTimeout(() => {
          setStep(0);
          setIsPublished(false);
        }, 3000);
      }
    }, step === 0 ? 1500 : 2000);
    
    return () => clearTimeout(timer);
  }, [step]);

  const templates = [
    { name: 'মডার্ন স্টোর', color: '#006A4E', active: step >= 1 },
    { name: 'প্রোডাক্ট শোকেস', color: '#3B82F6', active: false },
    { name: 'ফ্ল্যাশ সেল', color: '#EF4444', active: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.6 }}
      className="relative"
      style={{ perspective: '1000px' }}
    >
      {/* Browser chrome */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Browser header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-black/30 rounded-lg text-xs text-white/40 min-w-[200px]">
            <Globe className="w-3 h-3" />
            <span>your-store.bikrimart.com</span>
          </div>
          <div className="w-16" />
        </div>
        
        {/* Builder interface */}
        <div className="p-4 min-h-[380px]">
          {/* Template selection step */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="templates"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#F9A825]" />
                  <span className="text-white/70 text-sm">টেমপ্লেট বাছুন</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {templates.map((tmpl, i) => (
                    <motion.div
                      key={i}
                      className={`relative p-4 rounded-xl border ${i === 0 ? 'border-[#006A4E] bg-[#006A4E]/10' : 'border-white/10 bg-white/[0.02]'} cursor-pointer`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div 
                        className="w-full h-28 rounded-lg mb-3"
                        style={{ background: `linear-gradient(135deg, ${tmpl.color}40, ${tmpl.color}20)` }}
                      />
                      <p className="text-sm text-white/70 font-medium">{tmpl.name}</p>
                      {i === 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-[#006A4E] rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                {/* Animated cursor */}
                <motion.div
                  className="absolute"
                  initial={{ x: 200, y: 200, opacity: 0 }}
                  animate={{ x: 60, y: 130, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                >
                  <MousePointer2 className="w-5 h-5 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
                </motion.div>
              </motion.div>
            )}
            
            {step >= 1 && step < 4 && (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Store preview */}
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  {/* Store header */}
                  <div 
                    className="p-4 transition-all duration-500"
                    style={{ 
                      background: step >= 2 
                        ? `linear-gradient(135deg, ${COLORS.primary}80, ${COLORS.primary}40)` 
                        : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' 
                    }}
                  >
                    <motion.h3 
                      className="text-lg font-bold text-white"
                      key={step}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {step >= 3 ? 'ফ্যাশন হাউস বিডি' : 'আপনার স্টোরের নাম'}
                    </motion.h3>
                    <p className="text-sm text-white/60">
                      {step >= 3 ? 'সেরা মানের ফ্যাশন প্রোডাক্ট' : 'স্লোগান এখানে'}
                    </p>
                  </div>
                  
                  {/* Products grid */}
                  <div className="p-3 bg-black/20 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((_, i) => (
                      <motion.div
                        key={i}
                        className="aspect-square rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/5"
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: step >= 3 ? 1 : 0.5 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                          📦
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Editor tools */}
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${step === 2 ? 'bg-[#006A4E]/20 border border-[#006A4E]/50 text-[#006A4E]' : 'bg-white/5 text-white/50'}`}
                    animate={step === 2 ? { scale: [1, 1.05, 1] } : {}}
                  >
                    <Palette className="w-3 h-3" />
                    <span>থিম</span>
                  </motion.div>
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${step === 3 ? 'bg-[#F9A825]/20 border border-[#F9A825]/50 text-[#F9A825]' : 'bg-white/5 text-white/50'}`}
                    animate={step === 3 ? { scale: [1, 1.05, 1] } : {}}
                  >
                    <Type className="w-3 h-3" />
                    <span>কন্টেন্ট</span>
                  </motion.div>
                </div>
                
                {/* Live editing cursor */}
                {step >= 2 && step < 4 && (
                  <motion.div
                    className="absolute"
                    initial={{ x: step === 2 ? 60 : 130, y: 250, opacity: 1 }}
                    animate={{ 
                      x: step === 3 ? 130 : 60,
                      y: step === 3 ? 250 : 250,
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    <MousePointer2 className="w-5 h-5 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {step === 4 && !isPublished && (
              <motion.div
                key="publishing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[300px] gap-4"
              >
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-[#006A4E]/30 border-t-[#006A4E]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-white/60">পাবলিশ হচ্ছে...</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Published success overlay */}
          <AnimatePresence>
            {isPublished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#006A4E] to-[#00875F] flex items-center justify-center mb-4"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  ✓ Published!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60"
                >
                  আপনার স্টোর এখন লাইভ 🎉
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.8 }}
        className="absolute -right-4 top-20"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-xl p-3 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F9A825] to-[#FFB74D] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white text-xs font-medium">৫ মিনিটে রেডি!</p>
              <p className="text-white/50 text-[10px]">কোনো কোডিং লাগবে না</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
      >
        {[0, 1, 2, 3, 4].map((s) => (
          <motion.div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= step ? 'bg-[#006A4E]' : 'bg-white/20'
            }`}
            style={{ width: s === step ? 24 : 8 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN HERO COMPONENT
// ============================================================================
export function AwardWinningHero() {
  return (
    <section 
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background layers */}
      <GrainOverlay />
      <GradientMeshBackground />
      <FloatingBengaliText />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Bold Messaging */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-8"
              style={{ 
                backgroundColor: `${COLORS.primary}10`,
                borderColor: `${COLORS.primary}30`,
              }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🇧🇩
              </motion.span>
              <span style={{ color: COLORS.textMuted }} className="text-sm">
                বাংলাদেশের প্রথম বাংলা-ভিত্তিক বিল্ডার
              </span>
            </motion.div>
            
            {/* Main Headline */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
            >
              <StaggeredText 
                text="বাংলায় বিজনেস," 
                className="block text-white"
              />
              <StaggeredText 
                text="বাংলাতেই বানান।" 
                className="block bg-clip-text text-transparent"
                delay={0.4}
              />
            </h1>
            
            {/* Gradient text effect via style */}
            <style>{`
              h1 .block:nth-child(2) {
                background-image: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%);
                background-size: 200% 100%;
                animation: gradientShift 4s ease infinite;
              }
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}</style>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed"
              style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              কোনো কোডিং নেই, কোনো ঝামেলা নেই।
              <br />
              টেমপ্লেট বাছুন, কন্টেন্ট দিন — <span className="text-white font-semibold">৫ মিনিটে Online।</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-4 mb-6"
            >
              {/* Primary CTA - Glowing */}
              <Magnetic>
                <Link
                  to="/auth/register"
                  className="group relative px-8 py-4 rounded-xl font-semibold text-black overflow-hidden flex items-center gap-2 transition-transform hover:scale-[1.02]"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                    boxShadow: `0 0 30px ${COLORS.primary}60, 0 0 60px ${COLORS.primary}30`,
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  {/* Glow pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.accent} 100%)` }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10">ফ্রিতে শুরু করুন</span>
                  <motion.span
                    className="relative z-10"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </Magnetic>
              
              {/* Ghost CTA */}
              <Magnetic>
                <Link
                  to="#demo"
                  className="group px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  ডেমো দেখুন
                  <Play className="w-4 h-4 fill-current" />
                </Link>
              </Magnetic>
            </motion.div>
            
            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center gap-4 text-sm mb-8"
              style={{ color: COLORS.textSubtle }}
            >
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" style={{ color: COLORS.primary }} />
                ক্রেডিট কার্ড লাগবে না
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" style={{ color: COLORS.primary }} />
                ১ মিনিটে সাইনআপ
              </span>
            </motion.div>
            
            {/* Live signup counter */}
            <LiveSignupCounter />
            
            {/* Beta notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
              style={{ 
                backgroundColor: `${COLORS.accent}10`,
                borderColor: `${COLORS.accent}30`,
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
              <span className="text-sm" style={{ color: COLORS.accent }}>
                Beta User হিসেবে Join করুন — Early Adopter Benefits পাবেন
              </span>
            </motion.div>
          </div>
          
          {/* RIGHT: Builder Demo Mockup */}
          <div className="hidden lg:block">
            <BuilderMockup />
          </div>
        </div>
        
        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center mt-20"
        >
          <p className="text-sm" style={{ color: COLORS.textSubtle }}>
            বাংলাদেশ থেকে, বাংলাদেশের জন্য 🇧🇩
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default AwardWinningHero;
