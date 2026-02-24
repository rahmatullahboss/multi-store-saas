'use client';

/**
 * Problem-Solution Section - UI/UX Pro Max
 * 
 * Concept: "The Struggle is Real" → "But Not Anymore"
 * 
 * DESIGN SYSTEM: Liquid Glass
 * - Left panel: Problem (Red/orange undertones, liquid noise)
 * - Right panel: Solution (Green/teal undertones, liquid noise)
 */

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Check, Sparkles, Facebook, Code, FileSpreadsheet, DollarSign, HelpCircle, Palette, Rocket, PartyPopper, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ClientOnly } from '@/components/LazySection';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  problem: {
    bg: 'rgba(239, 68, 68, 0.05)',
    orb: '#EF4444',
    border: 'rgba(239, 68, 68, 0.2)',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  },
  solution: {
    bg: 'rgba(16, 185, 129, 0.05)',
    orb: '#10B981',
    border: 'rgba(16, 185, 129, 0.2)',
    text: 'rgba(255, 255, 255, 0.95)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
  },
};

// ============================================================================
// LIQUID BACKGROUND ORBS
// ============================================================================
const LiquidBackground = ({ type }: { type: 'problem' | 'solution' }) => {
  const color = type === 'problem' ? COLORS.problem.orb : COLORS.solution.orb;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] opacity-[0.1]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`,
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: type === 'problem' ? [0, 20, 0] : [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
};

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================
const Confetti = ({ isActive }: { isActive: boolean }) => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    if (isActive && pieces.length === 0) {
      setPieces(Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        color: ['#10B981', '#34D399', '#F9A825', '#006A4E'][Math.floor(Math.random() * 4)],
        size: Math.random() * 6 + 4,
      })));
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: '20%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 400, opacity: 0, rotate: 360 }}
          transition={{ duration: 2, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// GLASS CARD
// ============================================================================
const GlassCard = ({ children, className = '', type = 'mid' }: { children: React.ReactNode, className?: string, type?: 'high' | 'mid' }) => (
  <div 
    className={`relative backdrop-blur-xl ${className}`}
    style={{
      backgroundColor: type === 'high' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    }}
  >
    {children}
  </div>
);

// ============================================================================
// PAIN POINT CARD
// ============================================================================
const PainPointCard = ({ icon: Icon, text, delay = 0 }: { icon: any, text: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="group"
  >
    <div className="relative p-3 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-colors backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <X className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/30" />
          <span className="text-sm text-white/70 font-medium font-bengali">{text}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// ============================================================================
// SOLUTION STEP
// ============================================================================
const SolutionStep = ({ number, text, isComplete, delay = 0 }: { number: string, text: string, isComplete: boolean, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="flex items-center gap-4 relative"
  >
    {/* Connecting Line */}
    <div className="absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-white/5 last:hidden" />

    <motion.div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border relative z-10"
      style={{
        backgroundColor: isComplete ? COLORS.solution.orb : 'transparent',
        borderColor: isComplete ? COLORS.solution.orb : 'rgba(255,255,255,0.2)',
        color: isComplete ? '#000' : 'rgba(255,255,255,0.4)',
      }}
      animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      {isComplete ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{number}</span>}
    </motion.div>
    
    <div className="flex-1 py-1">
      <p className={`text-sm font-medium transition-colors duration-300 font-bengali ${isComplete ? 'text-white' : 'text-white/40'}`}>
        {text}
      </p>
      {isComplete && (
        <motion.div 
          layoutId="highlight"
          className="h-[2px] bg-emerald-500/50 mt-1 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8 }}
        />
      )}
    </div>
  </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isInView) {
      [0, 1, 2].forEach((i) => setTimeout(() => setCompletedSteps(prev => [...prev, i]), 800 + i * 800));
      setTimeout(() => setShowConfetti(true), 3500);
    }
  }, [isInView]);

  const painPoints = [
    { icon: Facebook, text: t('problemPain1') },
    { icon: Code, text: t('problemPain2') },
    { icon: FileSpreadsheet, text: t('problemPain3') },
    { icon: DollarSign, text: t('problemPain4') },
    { icon: HelpCircle, text: t('problemPain5') },
  ];

  const steps = [
    { number: '1', text: t('problemStep1') },
    { number: '2', text: t('problemStep2') },
    { number: '3', text: t('problemStep3') },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 px-4 overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[#0A0A12]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-bengali leading-tight">
            {t('problemHeaderTitle1')} <span className="text-red-400">{t('problemHeaderTitle2')}</span> {t('problemHeaderTitle3')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              {t('problemHeaderTitle4')}
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* PROBLEM PANEL (Red) */}
          <motion.div
            className="relative rounded-3xl overflow-hidden border border-white/5 bg-white/5" // Standard glass base
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20 }}
          >
            <LiquidBackground type="problem" />
            <div className="relative p-6 md:p-10 z-10 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
                  😫
                </div>
                <h3 className="text-2xl font-bold text-white font-bengali">
                  {t('problemLeftTitle1')} <span className="text-red-400">{t('problemLeftTitle2')}</span> {t('problemLeftTitle3')}
                </h3>
              </div>

              <div className="space-y-4 flex-1">
                {painPoints.map((point, i) => (
                  <PainPointCard key={i} {...point} delay={i * 0.1} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ARROW */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block">
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring" }}
            >
              <ArrowRight className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* SOLUTION PANEL (Green) */}
          <motion.div
            className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20, delay: 0.2 }}
          >
            <LiquidBackground type="solution" />
            <ClientOnly><Confetti isActive={showConfetti} /></ClientOnly>
            
            <div className="relative p-6 md:p-10 z-10 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  ✨
                </div>
                <h3 className="text-2xl font-bold text-white font-bengali">
                  {t('problemRightTitle1')} <span className="text-emerald-400">{t('problemRightTitle2')}</span>
                </h3>
              </div>

              <div className="space-y-2 mb-8 flex-1">
                {steps.map((step, i) => (
                  <SolutionStep key={i} {...step} isComplete={completedSteps.includes(i)} delay={i * 0.2} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: completedSteps.length === 3 ? 1 : 0, y: completedSteps.length === 3 ? 0 : 10 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2"
              >
                <PartyPopper className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-emerald-100 font-bengali">{t('problemSuccess')} 🎉</span>
              </motion.div>

              <div className="flex flex-wrap gap-2 mt-6">
                {['No Coding', 'Drag & Drop', 'Instant Launch'].map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;
