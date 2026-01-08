/**
 * Problem-Solution Section
 * 
 * Concept: "The Struggle is Real" → "But Not Anymore"
 * 
 * Features:
 * - Two contrasting panels with dramatic scroll transition
 * - Problem side: Red/orange undertones, frustrated shake animation
 * - Solution side: Green/teal undertones, progress animation
 * - Card flip animations on scroll trigger
 * - Confetti burst on completion
 * - Smooth color transition
 */

import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { X, Check, Sparkles, ArrowDown, Facebook, Code, FileSpreadsheet, DollarSign, HelpCircle, Palette, FileText, Rocket, PartyPopper } from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  problem: {
    bg: '#1A0F0F',
    accent: '#EF4444',
    accentMuted: '#DC2626',
    card: 'rgba(239, 68, 68, 0.08)',
    cardBorder: 'rgba(239, 68, 68, 0.2)',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  },
  solution: {
    bg: '#0A1A14',
    accent: '#10B981',
    accentLight: '#34D399',
    card: 'rgba(16, 185, 129, 0.08)',
    cardBorder: 'rgba(16, 185, 129, 0.2)',
    text: 'rgba(255, 255, 255, 0.95)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
  },
};

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================
const Confetti = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    color: ['#10B981', '#34D399', '#F9A825', '#FBBF24', '#006A4E'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '50%',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            y: [0, -200, 400],
            opacity: [0, 1, 0],
            rotate: [0, piece.rotation, piece.rotation * 2],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 2.5,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// SHAKE ANIMATION FOR FRUSTRATION
// ============================================================================
const FrustrationCard = ({ 
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <motion.div
        className="relative p-4 md:p-5 rounded-2xl border backdrop-blur-sm"
        style={{
          backgroundColor: COLORS.problem.card,
          borderColor: COLORS.problem.cardBorder,
        }}
        animate={{
          x: [0, -2, 2, -2, 2, 0],
        }}
        transition={{
          duration: 0.5,
          delay: delay + 2,
          repeat: Infinity,
          repeatDelay: 4,
        }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${COLORS.problem.accent}20` }}
          >
            <X className="w-5 h-5" style={{ color: COLORS.problem.accent }} />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Icon className="w-4 h-4 text-white/40" />
            <p className="text-sm md:text-base text-white/80" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              {text}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// PROGRESS STEP COMPONENT
// ============================================================================
const ProgressStep = ({ 
  number, 
  text, 
  isComplete, 
  delay = 0,
  isLast = false,
}: { 
  number: string;
  text: string; 
  isComplete: boolean;
  delay?: number;
  isLast?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-4"
    >
      {/* Step number */}
      <motion.div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
        style={{
          backgroundColor: isComplete ? COLORS.solution.accent : 'rgba(255,255,255,0.1)',
          color: isComplete ? '#000' : 'rgba(255,255,255,0.5)',
        }}
        animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isComplete ? <Check className="w-5 h-5" /> : number}
      </motion.div>
      
      {/* Step text */}
      <p 
        className="text-base md:text-lg font-medium"
        style={{ 
          color: isComplete ? COLORS.solution.text : 'rgba(255,255,255,0.5)',
          fontFamily: "'Noto Sans Bengali', sans-serif",
        }}
      >
        {text}
      </p>
      
      {/* Progress line */}
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: COLORS.solution.accent }}
          initial={{ width: '0%' }}
          animate={{ width: isComplete ? '100%' : '0%' }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
        />
      </div>
      
      {/* Check mark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isComplete ? 1 : 0, 
          opacity: isComplete ? 1 : 0 
        }}
        transition={{ duration: 0.3, delay: delay + 0.8 }}
      >
        <Check className="w-5 h-5" style={{ color: COLORS.solution.accent }} />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [showSolution, setShowSolution] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger solution panel after scrolling into view
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowSolution(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Animate steps sequentially
  useEffect(() => {
    if (showSolution) {
      const delays = [500, 1200, 1900];
      delays.forEach((delay, i) => {
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, i]);
        }, delay);
      });
      
      // Show confetti after all steps
      setTimeout(() => setShowConfetti(true), 2800);
    }
  }, [showSolution]);

  const painPoints = [
    { icon: Facebook, text: 'Facebook এ Post করে করে ক্লান্ত' },
    { icon: Code, text: 'Developer এর পেছনে দৌড়ানো' },
    { icon: FileSpreadsheet, text: 'Excel এ Order Track করা' },
    { icon: DollarSign, text: 'Shopify র মাসে ৫০০০+ টাকা দেওয়া' },
    { icon: HelpCircle, text: 'ইংরেজি Platform এ বুঝে উঠতে না পারা', fullWidth: true },
  ];

  const steps = [
    { number: '১', text: 'Template বাছুন' },
    { number: '২', text: 'Content দিন' },
    { number: '৩', text: 'Publish করুন' },
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden transition-colors duration-1000"
      style={{
        background: showSolution 
          ? `linear-gradient(180deg, ${COLORS.solution.bg} 0%, #0D1512 100%)`
          : `linear-gradient(180deg, ${COLORS.problem.bg} 0%, #150D0D 100%)`,
      }}
    >
      {/* Background transition overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSolution ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.solution.accent}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
        
        {/* === PROBLEM PANEL === */}
        <AnimatePresence mode="wait">
          {!showSolution && (
            <motion.div
              key="problem"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Problem Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <motion.span 
                  className="text-5xl mb-4 block"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  😫
                </motion.span>
                <h2 
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  এখনো এভাবে{' '}
                  <span style={{ color: COLORS.problem.accent }}>কষ্ট</span>{' '}
                  করছেন?
                </h2>
              </motion.div>

              {/* Pain Point Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
                {painPoints.slice(0, 4).map((point, i) => (
                  <FrustrationCard
                    key={i}
                    icon={point.icon}
                    text={point.text}
                    delay={i * 0.15}
                  />
                ))}
              </div>
              
              {/* Full width pain point */}
              <div className="max-w-xl mx-auto">
                <FrustrationCard
                  icon={painPoints[4].icon}
                  text={painPoints[4].text}
                  delay={0.6}
                />
              </div>

              {/* Scroll indicator */}
              <motion.div
                className="mt-12 flex flex-col items-center gap-2"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <p className="text-white/40 text-sm">Scroll করুন</p>
                <ArrowDown className="w-5 h-5 text-white/40" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === SOLUTION PANEL === */}
        <AnimatePresence>
          {showSolution && (
            <motion.div
              key="solution"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              {/* Confetti */}
              <Confetti isActive={showConfetti} />

              {/* Solution Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <motion.span 
                  className="text-5xl mb-4 block"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  ✨
                </motion.span>
                <h2 
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  এখন সব{' '}
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{ 
                      backgroundImage: `linear-gradient(135deg, ${COLORS.solution.accent}, ${COLORS.solution.accentLight})` 
                    }}
                  >
                    সহজ
                  </span>
                </h2>
              </motion.div>

              {/* Solution Card with Steps */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <div 
                  className="relative p-6 md:p-10 rounded-3xl border backdrop-blur-sm"
                  style={{
                    backgroundColor: COLORS.solution.card,
                    borderColor: COLORS.solution.cardBorder,
                  }}
                >
                  {/* Progress Steps */}
                  <div className="space-y-6 mb-8">
                    {steps.map((step, i) => (
                      <ProgressStep
                        key={i}
                        number={step.number}
                        text={step.text}
                        isComplete={completedSteps.includes(i)}
                        delay={i * 0.3}
                        isLast={i === steps.length - 1}
                      />
                    ))}
                  </div>

                  {/* Success Message */}
                  <AnimatePresence>
                    {completedSteps.length === 3 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                        className="pt-6 border-t border-white/10"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: 3 }}
                          >
                            <PartyPopper className="w-8 h-8" style={{ color: COLORS.solution.accent }} />
                          </motion.div>
                          <span 
                            className="text-2xl md:text-3xl font-bold"
                            style={{ 
                              color: COLORS.solution.text,
                              fontFamily: "'Noto Sans Bengali', sans-serif",
                            }}
                          >
                            আপনার Store Ready!
                          </span>
                          <motion.span
                            className="text-3xl"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                          >
                            🎉
                          </motion.span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Bottom tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.2 }}
                className="mt-10"
              >
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Sparkles className="w-4 h-4" style={{ color: COLORS.solution.accent }} />
                    <span style={{ color: COLORS.solution.textMuted }}>সব কিছু বাংলায়</span>
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Palette className="w-4 h-4" style={{ color: COLORS.solution.accent }} />
                    <span style={{ color: COLORS.solution.textMuted }}>Live Preview</span>
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Rocket className="w-4 h-4" style={{ color: COLORS.solution.accent }} />
                    <span style={{ color: COLORS.solution.textMuted }}>ফ্রিতে শুরু</span>
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;
