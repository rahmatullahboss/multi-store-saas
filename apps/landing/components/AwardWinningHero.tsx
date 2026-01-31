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

'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  Sparkles,
  MousePointer2,
  Type,
  Palette,
  Globe,
  Rocket,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ClientOnly } from '@/components/LazySection';

// ============================================================================
// TYPES
// ============================================================================
interface HeroProps {
  theme?: 'dark' | 'light';
  totalUsers?: number;
}

// ============================================================================
// DESIGN TOKENS - Theme-Aware Bangladesh Theme
// ============================================================================
const DARK_COLORS = {
  primary: '#006A4E', // Bangladesh Green
  primaryLight: '#00875F',
  primaryDark: '#004D38',
  accent: '#F9A825', // Golden Yellow
  accentLight: '#FFB74D',
  background: '#0A0F0D', // Deep dark with green tint
  backgroundAlt: '#0D1512',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  cardShadow: 'none',
};

const LIGHT_COLORS = {
  primary: '#006A4E', // Bangladesh Green (same)
  primaryLight: '#00875F',
  primaryDark: '#005740',
  accent: '#D97706', // Deeper amber for light bg
  accentLight: '#F59E0B',
  background: '#FAFBFC', // Warm off-white
  backgroundAlt: '#F4F5F7',
  text: '#0F172A', // Deep blue-black
  textMuted: '#475569', // Gray-blue
  textSubtle: '#94A3B8', // Light gray
  cardBg: '#FFFFFF',
  cardBorder: '#EBEDF0',
  cardShadow: '0 4px 6px rgba(0,0,0,0.04), 0 10px 25px rgba(0,0,0,0.06)',
};

const getColors = (theme: 'dark' | 'light') => (theme === 'light' ? LIGHT_COLORS : DARK_COLORS);

// Keep COLORS for backward compatibility in child components
const COLORS = DARK_COLORS;

// ============================================================================
// GRAIN TEXTURE OVERLAY
// ============================================================================
const GrainOverlay = ({ isLight = false }: { isLight?: boolean }) => (
  <div
    className={`pointer-events-none fixed inset-0 z-50 ${isLight ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

// ============================================================================
// FLOATING BENGALI TYPOGRAPHY ELEMENTS
// ============================================================================
const FloatingBengaliText = ({ isMobile = false }: { isMobile?: boolean }) => {
  const bengaliChars = ['অ', 'আ', 'ই', 'ক', 'খ', 'গ', 'ব', 'ম', 'স', 'হ', 'ড', 'ন'];

  if (isMobile) return null; // Disable floating text on mobile for performance

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
// GRADIENT MESH BACKGROUND (Dark Theme - Liquid Glass)
// ============================================================================
const GradientMeshBackground = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Liquid Primary Orb */}
    <motion.div
      className="absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] rounded-full mix-blend-screen opacity-40 blur-[100px]"
      style={{
        background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)`,
      }}
      animate={
        isMobile
          ? {}
          : {
              scale: [1, 1.2, 0.9, 1],
              x: [0, 100, -50, 0],
              y: [0, 50, 100, 0],
            }
      }
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
    />

    {/* Liquid Blue Orb */}
    <motion.div
      className="absolute top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full mix-blend-screen opacity-30 blur-[120px]"
      style={{
        background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
      }}
      animate={
        isMobile
          ? {}
          : {
              scale: [1.1, 0.9, 1.2, 1.1],
              x: [0, -70, 30, 0],
              y: [0, -100, 50, 0],
            }
      }
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    />

    {/* Golden Accent Orb */}
    <motion.div
      className="absolute bottom-0 left-[20%] w-[600px] h-[600px] rounded-full mix-blend-screen opacity-20 blur-[90px]"
      style={{
        background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)`,
      }}
      animate={
        isMobile
          ? {}
          : {
              scale: [0.9, 1.1, 0.9],
              opacity: [0.2, 0.4, 0.2],
            }
      }
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Noise Texture */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

    {/* Gradient Overlay for Depth */}
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at center, transparent 0%, #0A0F0D 90%)`,
      }}
    />
  </div>
);

// ============================================================================
// LIGHT GRADIENT BACKGROUND (Light Theme)
// ============================================================================
const LightGradientBackground = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div
    className="absolute inset-0 overflow-hidden"
    style={{ backgroundColor: LIGHT_COLORS.background }}
  >
    {/* Subtle green gradient at top */}
    <motion.div
      className="absolute -top-1/4 left-1/4 w-[900px] h-[900px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,106,78,0.06) 0%, transparent 60%)',
      }}
      animate={
        isMobile
          ? {}
          : {
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
            }
      }
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Soft purple accent - subtle */}
    <motion.div
      className="absolute top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)',
      }}
      animate={
        isMobile
          ? {}
          : {
              scale: [1.05, 1, 1.05],
              opacity: [0.4, 0.6, 0.4],
            }
      }
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Warm amber accent bottom */}
    <motion.div
      className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 60%)',
      }}
      animate={
        isMobile
          ? {}
          : {
              scale: [1, 1.15, 1],
              y: [0, -20, 0],
            }
      }
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Subtle dot grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(0,106,78,0.4) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />

    {/* Soft glow behind mockup area */}
    <div
      className="absolute top-1/4 right-1/4 w-[500px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
    />
  </div>
);

// ============================================================================
// MAGNETIC BUTTON COMPONENT
// ============================================================================
interface MagneticProps {
  children: React.ReactNode;
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
const StaggeredText = ({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
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
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

// ============================================================================
// LIVE SIGNUP COUNTER
// ============================================================================
const LiveSignupCounter = ({ count = 0 }: { count?: number }) => {
  const { t } = useTranslation();
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
        {t('heroSignupPrefix')}{' '}
        <span className="text-white font-semibold">{count.toLocaleString()}</span>{' '}
        {t('heroSignupSuffix')}
      </span>
    </motion.div>
  );
};

// ============================================================================
// BUILDER MOCKUP - PREMIUM GLASS & 3D
// ============================================================================
const BuilderMockup = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Cycle through builder demo steps
  useEffect(() => {
    // ... (existing timer logic)
    const timer = setTimeout(
      () => {
        if (step < 4) {
          setStep(step + 1);
        } else {
          setIsPublished(true);
          setTimeout(() => {
            setStep(0);
            setIsPublished(false);
          }, 3000);
        }
      },
      step === 0 ? 1500 : 2000
    );
    return () => clearTimeout(timer);
  }, [step]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x * 10); // Rotate max 5 deg
    mouseY.set(y * 10);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useSpring(mouseY, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(mouseX, { stiffness: 100, damping: 20 });

  const templates = [
    { name: 'মডার্ন স্টোর', color: '#006A4E', active: step >= 1 },
    { name: 'প্রোডাক্ট শোকেস', color: '#3B82F6', active: false },
    { name: 'ফ্ল্যাশ সেল', color: '#EF4444', active: false },
  ];

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: 'circOut' }}
      className="relative perspective-[2000px] group"
    >
      {/* 3D Container */}
      <motion.div
        style={{ rotateX: rotateX, rotateY: rotateY, transformStyle: 'preserve-3d' }}
        className="relative transition-shadow duration-500"
      >
        {/* Glass Card */}
        <div className="relative backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden ring-1 ring-white/5 group-hover:ring-white/10 transition-all duration-500">
          {/* Glossy Reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

          {/* Browser header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full text-[10px] text-white/40 border border-white/5 shadow-inner min-w-[200px] justify-center font-mono">
              <Globe className="w-3 h-3 opacity-50" />
              <span>store.bikrimart.com</span>
            </div>
            <div className="w-16" />
          </div>

          {/* Builder interface */}
          <div className="p-6 min-h-[420px] bg-gradient-to-b from-transparent to-black/40 relative">
            {/* Template selection step */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-white/80 font-medium">{t('heroDemoTemplate')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {templates.map((tmpl, i) => (
                      <motion.div
                        key={i}
                        className={`relative p-3 rounded-2xl border transition-all duration-300 ${i === 0 ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'} cursor-pointer group/card`}
                        whileHover={{ y: -5 }}
                      >
                        <div className="w-full h-32 rounded-xl mb-3 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 z-10" />
                          <div
                            style={{ background: tmpl.color }}
                            className="w-full h-full opacity-30 group-hover/card:opacity-50 transition-opacity"
                          />
                        </div>
                        <p className="text-xs text-white/70 font-medium text-center">{tmpl.name}</p>
                        {i === 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0A0F0D] shadow-lg"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated cursor */}
                  <motion.div
                    className="absolute z-50 pointer-events-none"
                    initial={{ left: '80%', top: '80%', opacity: 0 }}
                    animate={{ left: '20%', top: '40%', opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: 'circOut' }}
                  >
                    <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] fill-black/20" />
                  </motion.div>
                </motion.div>
              )}

              {step >= 1 && step < 4 && (
                <motion.div key="editing" className="space-y-4">
                  {/* Store preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-[#050505]"
                  >
                    {/* Store header */}
                    <div
                      className="p-6 transition-all duration-700"
                      style={{
                        background:
                          step >= 2
                            ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
                            : '#111',
                      }}
                    >
                      <motion.h3
                        className="text-xl font-bold text-white mb-1"
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {step >= 3 ? t('heroDemoStoreName') : t('heroDemoStorePlaceholder')}
                      </motion.h3>
                      <p className="text-xs text-white/60">
                        {step >= 3 ? t('heroDemoStoreSlogan') : t('heroDemoSloganPlaceholder')}
                      </p>
                    </div>

                    {/* Products grid */}
                    <div className="p-4 bg-[#0A0A0A] grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((_, i) => (
                        <motion.div
                          key={i}
                          className="aspect-[4/5] rounded-lg bg-white/[0.03] border border-white/5 relative overflow-hidden group/product"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: step >= 3 ? 1 : 0.3, y: step >= 3 ? 0 : 10 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/product:opacity-100 transition-opacity" />
                          <div className="absolute bottom-2 left-2 w-12 h-1.5 bg-white/20 rounded-full" />
                          <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Editor tools - Floating Palette */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    {['Themes', 'Content', 'Layout'].map((tool, idx) => (
                      <motion.div
                        key={tool}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className={`p-2 rounded-lg backdrop-blur-md border border-white/10 shadow-lg ${
                          (step === 2 && idx === 0) || (step === 3 && idx === 1)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-black/40 text-white/40'
                        }`}
                      >
                        {idx === 0 && <Palette className="w-4 h-4" />}
                        {idx === 1 && <Type className="w-4 h-4" />}
                        {idx === 2 && <Globe className="w-4 h-4" />}
                      </motion.div>
                    ))}
                  </div>

                  {/* Live editing cursor */}
                  {step >= 2 && step < 4 && (
                    <motion.div
                      className="absolute z-50 pointer-events-none"
                      initial={{ left: '90%', top: '40%' }}
                      animate={{
                        left: step === 3 ? '90%' : '90%',
                        top: step === 3 ? '55%' : '45%',
                      }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    >
                      <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] fill-black/20" />
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
                  className="flex flex-col items-center justify-center h-[340px] gap-6"
                >
                  <div className="relative">
                    <motion.div
                      className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Rocket className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-white/60 text-sm font-mono tracking-widest uppercase">
                    {t('heroDemoPublishing')}...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Published success overlay */}
            <AnimatePresence>
              {isPublished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 rounded-[24px]"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                  >
                    <Check className="w-12 h-12 text-white" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    {t('heroDemoPublished')}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/60"
                  >
                    {t('heroDemoLive')} 🚀
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, type: 'spring' }}
        className="absolute -right-8 top-16 z-30 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="backdrop-blur-xl bg-white/[0.05] border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">{t('heroDemoReady')}</p>
            <p className="text-white/50 text-xs">{t('heroDemoNoCoding')}</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN HERO COMPONENT - THEME AWARE
// ============================================================================

export function AwardWinningHero({ theme = 'dark', totalUsers = 0 }: HeroProps) {
  const { t } = useTranslation();
  const colors = getColors(theme);
  const isLight = theme === 'light';
  const isMobile = useIsMobile();

  return (
    <section
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: colors.background }}
    >
      {/* Background layers - conditional on theme */}
      <GrainOverlay isLight={isLight} />
      {isLight ? (
        <LightGradientBackground isMobile={isMobile} />
      ) : (
        <GradientMeshBackground isMobile={isMobile} />
      )}
      {!isLight && <FloatingBengaliText isMobile={isMobile} />}

      {/* Subtle grid pattern */}
      <div
        className={`absolute inset-0 ${isLight ? 'opacity-[0.015]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: isLight
            ? `linear-gradient(${colors.text}10 1px, transparent 1px),
               linear-gradient(90deg, ${colors.text}10 1px, transparent 1px)`
            : `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 md:px-4 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT: Bold Messaging */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{
                backgroundColor: isLight ? 'rgba(0,106,78,0.08)' : `${colors.primary}10`,
                borderColor: isLight ? 'rgba(0,106,78,0.15)' : `${colors.primary}30`,
                boxShadow: isLight ? '0 2px 8px rgba(0,106,78,0.1)' : 'none',
              }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🇧🇩
              </motion.span>
              <span style={{ color: colors.textMuted }} className="text-sm">
                {t('heroBadge')}
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.4] tracking-tight mb-6"
              style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
            >
              <StaggeredText
                text={t('heroTitle1')}
                className={`block ${isLight ? 'text-[#0F172A]' : 'text-white'}`}
              />
              <StaggeredText
                text={t('heroTitle2')}
                className="block bg-clip-text text-transparent"
                delay={0.4}
              />
            </h1>

            {/* Gradient text effect via style - works for both themes */}
            <style>{`
              h1 .block:nth-child(2) {
                background-image: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${isLight ? '#8B5CF6' : colors.accent} 100%);
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
              style={{ color: colors.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {t('heroSubtitle1')}
              <br />
              {t('heroSubtitle2')}{' '}
              <span style={{ color: colors.text, fontWeight: 600 }}>{t('heroSubtitle3')}</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-4 mb-6"
            >
              {/* Primary CTA */}
              <Magnetic>
                <Link
                  href="https://app.ozzyl.com/auth/register"
                  className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden flex items-center gap-2 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                    boxShadow: isLight
                      ? '0 4px 14px rgba(0,106,78,0.3), 0 1px 3px rgba(0,0,0,0.1)'
                      : `0 0 30px ${colors.primary}60, 0 0 60px ${colors.primary}30`,
                    fontFamily: "'Noto Sans Bengali', sans-serif",
                  }}
                >
                  {/* Glow pulse effect - only on dark theme */}
                  {!isLight && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accent} 100%)`,
                      }}
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">{t('heroCtaPrimary')}</span>
                  <motion.span
                    className="relative z-10"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </Magnetic>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center gap-4 text-sm mb-8"
              style={{ color: colors.textSubtle }}
            >
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" style={{ color: colors.primary }} />
                {t('heroTrust1')}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" style={{ color: colors.primary }} />
                {t('heroTrust2')}
              </span>
            </motion.div>

            {/* Live signup counter */}
            <LiveSignupCounter count={totalUsers} />

            {/* Beta notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: isLight ? 'rgba(217,119,6,0.08)' : `${colors.accent}10`,
                borderColor: isLight ? 'rgba(217,119,6,0.2)' : `${colors.accent}30`,
                boxShadow: isLight ? '0 2px 8px rgba(217,119,6,0.1)' : 'none',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
              <span className="text-sm" style={{ color: colors.accent }}>
                {t('heroBetaNotice')}
              </span>
            </motion.div>
          </div>

          {/* RIGHT: Builder Demo Mockup - Client Only for 3D/Glass effects */}
          <div className="hidden lg:block">
            {/* Light theme: white card with shadow wrapping the mockup */}
            {isLight ? (
              <div
                className="rounded-2xl p-1 bg-white"
                style={{
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                }}
              >
                <ClientOnly
                  fallback={
                    <div className="h-[600px] w-full bg-white/5 animate-pulse rounded-2xl" />
                  }
                >
                  <BuilderMockup />
                </ClientOnly>
              </div>
            ) : (
              <ClientOnly
                fallback={<div className="h-[600px] w-full bg-white/5 animate-pulse rounded-2xl" />}
              >
                <BuilderMockup />
              </ClientOnly>
            )}
          </div>
        </div>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center mt-20"
        >
          <p className="text-sm" style={{ color: colors.textSubtle }}>
            {t('heroFooter')} 🇧🇩
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default AwardWinningHero;
