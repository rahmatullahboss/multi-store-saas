/**
 * Problem-Solution Section
 * 
 * Concept: "The Struggle is Real" → "But Not Anymore"
 * 
 * LAYOUT: Side by side comparison for direct visual contrast
 * - Left panel: Problem (Red/orange undertones)
 * - Right panel: Solution (Green/teal undertones)
 * - Centro arrow connecting both
 */

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Check, Sparkles, Facebook, Code, FileSpreadsheet, DollarSign, HelpCircle, Palette, Rocket, PartyPopper, ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  problem: {
    bg: 'rgba(239, 68, 68, 0.05)',
    accent: '#EF4444',
    accentMuted: '#DC2626',
    card: 'rgba(239, 68, 68, 0.08)',
    cardBorder: 'rgba(239, 68, 68, 0.25)',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  },
  solution: {
    bg: 'rgba(16, 185, 129, 0.05)',
    accent: '#10B981',
    accentLight: '#34D399',
    card: 'rgba(16, 185, 129, 0.08)',
    cardBorder: 'rgba(16, 185, 129, 0.25)',
    text: 'rgba(255, 255, 255, 0.95)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
  },
};

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================
const Confetti = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    color: ['#10B981', '#34D399', '#F9A825', '#FBBF24', '#006A4E'][Math.floor(Math.random() * 5)],
    size: Math.random() * 6 + 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '30%',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            y: [0, -100, 200],
            opacity: [0, 1, 0],
            rotate: [0, piece.rotation, piece.rotation * 2],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// PAIN POINT CARD (Compact for side-by-side)
// ============================================================================
const PainPointCard = ({ 
  icon: Icon, 
  text, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  text: string; 
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="group"
    >
      <motion.div
        className="relative p-3 rounded-xl border backdrop-blur-sm"
        style={{
          backgroundColor: COLORS.problem.card,
          borderColor: COLORS.problem.cardBorder,
        }}
        animate={{
          x: [0, -1, 1, -1, 1, 0],
        }}
        transition={{
          duration: 0.4,
          delay: delay + 2,
          repeat: Infinity,
          repeatDelay: 5,
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${COLORS.problem.accent}20` }}
          >
            <X className="w-3.5 h-3.5" style={{ color: COLORS.problem.accent }} />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Icon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            <p 
              className="text-xs sm:text-sm text-white/75 truncate" 
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {text}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// SOLUTION STEP (Compact for side-by-side)
// ============================================================================
const SolutionStep = ({ 
  number, 
  text, 
  isComplete, 
  delay = 0,
}: { 
  number: string;
  text: string; 
  isComplete: boolean;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3"
    >
      {/* Step number */}
      <motion.div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{
          backgroundColor: isComplete ? COLORS.solution.accent : 'rgba(255,255,255,0.1)',
          color: isComplete ? '#000' : 'rgba(255,255,255,0.4)',
        }}
        animate={isComplete ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isComplete ? <Check className="w-4 h-4" /> : number}
      </motion.div>
      
      {/* Step text */}
      <p 
        className="text-sm font-medium flex-1"
        style={{ 
          color: isComplete ? COLORS.solution.text : 'rgba(255,255,255,0.4)',
          fontFamily: "'Noto Sans Bengali', sans-serif",
        }}
      >
        {text}
      </p>
      
      {/* Progress bar */}
      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: COLORS.solution.accent }}
          initial={{ width: '0%' }}
          animate={{ width: isComplete ? '100%' : '0%' }}
          transition={{ duration: 0.6, delay: delay + 0.2, ease: 'easeOut' }}
        />
      </div>
      
      {/* Check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isComplete ? 1 : 0 }}
        transition={{ duration: 0.2, delay: delay + 0.6 }}
      >
        <Check className="w-4 h-4" style={{ color: COLORS.solution.accent }} />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT - SIDE BY SIDE LAYOUT
// ============================================================================
export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { t } = useTranslation();

  // Animate steps sequentially when in view
  useEffect(() => {
    if (isInView) {
      const delays = [800, 1500, 2200];
      delays.forEach((delay, i) => {
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, i]);
        }, delay);
      });
      
      // Show confetti after all steps
      setTimeout(() => setShowConfetti(true), 3000);
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
    <section 
      ref={sectionRef}
      className="relative py-12 md:py-16 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A0A12 0%, #0D0D18 100%)',
      }}
    >
      {/* Section Header */}
      <motion.div 
        className="text-center mb-12 md:mb-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 
          className="text-2xl md:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          {t('problemHeaderTitle1')} <span className="text-red-400">{t('problemHeaderTitle2')}</span> {t('problemHeaderTitle3')}{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #10B981, #34D399)' }}>
            {t('problemHeaderTitle4')}
          </span>
        </h2>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* SIDE BY SIDE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* ===== LEFT PANEL - PROBLEM ===== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div 
              className="h-full p-5 md:p-8 rounded-3xl border relative overflow-hidden"
              style={{
                backgroundColor: COLORS.problem.bg,
                borderColor: COLORS.problem.cardBorder,
              }}
            >
              {/* Red gradient glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-30 blur-3xl"
                style={{ backgroundColor: COLORS.problem.accent }}
              />
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.span 
                  className="text-3xl md:text-4xl"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  😫
                </motion.span>
                <h3 
                  className="text-xl md:text-2xl font-bold text-white"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  {t('problemLeftTitle1')}{' '}
                  <span style={{ color: COLORS.problem.accent }}>{t('problemLeftTitle2')}</span>{' '}
                  {t('problemLeftTitle3')}
                </h3>
              </div>

              {/* Pain Points */}
              <div className="space-y-3">
                {painPoints.map((point, i) => (
                  <PainPointCard
                    key={i}
                    icon={point.icon}
                    text={point.text}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== CENTER ARROW (Desktop Only) ===== */}
          <motion.div
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #10B981 100%)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
              }}
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </motion.div>

          {/* Mobile Arrow */}
          <motion.div
            className="flex lg:hidden justify-center -my-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center rotate-90"
              style={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #10B981 100%)',
              }}
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </motion.div>

          {/* ===== RIGHT PANEL - SOLUTION ===== */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div 
              className="h-full p-5 md:p-8 rounded-3xl border relative overflow-hidden"
              style={{
                backgroundColor: COLORS.solution.bg,
                borderColor: COLORS.solution.cardBorder,
              }}
            >
              {/* Confetti */}
              <Confetti isActive={showConfetti} />
              
              {/* Green gradient glow */}
              <div 
                className="absolute top-0 left-0 w-32 h-32 opacity-30 blur-3xl"
                style={{ backgroundColor: COLORS.solution.accent }}
              />
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.span 
                  className="text-3xl md:text-4xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  ✨
                </motion.span>
                <h3 
                  className="text-xl md:text-2xl font-bold text-white"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  {t('problemRightTitle1')}{' '}
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.solution.accent}, ${COLORS.solution.accentLight})` }}
                  >
                    {t('problemRightTitle2')}
                  </span>
                </h3>
              </div>

              {/* Solution Steps */}
              <div className="space-y-4 mb-6">
                {steps.map((step, i) => (
                  <SolutionStep
                    key={i}
                    number={step.number}
                    text={step.text}
                    isComplete={completedSteps.includes(i)}
                    delay={i * 0.2}
                  />
                ))}
              </div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: completedSteps.length === 3 ? 1 : 0, 
                  y: completedSteps.length === 3 ? 0 : 10 
                }}
                transition={{ duration: 0.4 }}
                className="pt-4 border-t border-white/10"
              >
                <div className="flex items-center justify-center gap-2">
                  <PartyPopper className="w-5 h-5" style={{ color: COLORS.solution.accent }} />
                  <span 
                    className="text-lg font-bold"
                    style={{ 
                      color: COLORS.solution.text,
                      fontFamily: "'Noto Sans Bengali', sans-serif",
                    }}
                  >
                    {t('problemSuccess')}
                  </span>
                  <span className="text-xl">🎉</span>
                </div>
              </motion.div>

              {/* Bottom tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                  <Sparkles className="w-3 h-3" style={{ color: COLORS.solution.accent }} />
                  <span className="text-white/60">{t('problemTag1')}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                  <Palette className="w-3 h-3" style={{ color: COLORS.solution.accent }} />
                  <span className="text-white/60">{t('problemTag2')}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                  <Rocket className="w-3 h-3" style={{ color: COLORS.solution.accent }} />
                  <span className="text-white/60">{t('problemTag3')}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;
