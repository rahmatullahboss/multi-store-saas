/**
 * Award-Winning Hero Section - OPTIMIZED VERSION
 *
 * Performance optimizations based on Vercel React Best Practices:
 * - Reduced framer-motion complexity
 * - CSS animations for simple effects
 * - Removed heavy motion values
 * - Better mobile performance
 * - Reduced re-renders
 */

'use client';

import { motion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles, Rocket } from 'lucide-react';
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
  primary: '#006A4E',
  primaryLight: '#00875F',
  primaryDark: '#004D38',
  accent: '#F9A825',
  background: '#0A0F0D',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  cardBg: 'rgba(255, 255, 255, 0.03)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const LIGHT_COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  primaryDark: '#005740',
  accent: '#D97706',
  background: '#FAFBFC',
  text: '#0F172A',
  textMuted: '#475569',
  cardBg: '#FFFFFF',
  cardBorder: '#EBEDF0',
};

const getColors = (theme: 'dark' | 'light') => (theme === 'light' ? LIGHT_COLORS : DARK_COLORS);
const COLORS = DARK_COLORS;

// ============================================================================
// GRAIN TEXTURE OVERLAY - Static, no animation needed
// ============================================================================
const GrainOverlay = ({ isLight = false }: { isLight?: boolean }) => (
  <div
    className={`pointer-events-none fixed inset-0 z-50 ${isLight ? 'opacity-[0.015]' : 'opacity-[0.02]'}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

// ============================================================================
// GRADIENT BACKGROUND - Simplified with CSS-only animations
// ============================================================================
const GradientBackground = ({ isLight = false }: { isLight?: boolean }) => (
  <div className="absolute inset-0 overflow-hidden">
    {!isLight && (
      <>
        {/* Primary orb - CSS animation only */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] rounded-full mix-blend-screen opacity-40 blur-[100px]"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)`,
            animation: 'float 25s ease-in-out infinite',
          }}
        />
        {/* Blue orb - CSS animation only */}
        <div
          className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full mix-blend-screen opacity-30 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite reverse',
          }}
        />
        {/* Accent orb - CSS animation only */}
        <div
          className="absolute bottom-0 left-[20%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full mix-blend-screen opacity-20 blur-[90px]"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)`,
            animation: 'pulse 20s ease-in-out infinite',
          }}
        />
      </>
    )}

    {/* Gradient overlay */}
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at center, transparent 0%, ${isLight ? LIGHT_COLORS.background : '#0A0F0D'} 90%)`,
      }}
    />

    <style>{`
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(50px, 50px) scale(1.1); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.2; transform: scale(0.9); }
        50% { opacity: 0.4; transform: scale(1.1); }
      }
    `}</style>
  </div>
);

// ============================================================================
// LIVE SIGNUP COUNTER - Simplified, minimal animation
// ============================================================================
const LiveSignupCounter = ({ count = 0 }: { count?: number }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </span>
      <span className="text-white/50">
        {t('heroSignupPrefix')}{' '}
        <span className="text-white font-semibold">{count.toLocaleString()}</span>{' '}
        {t('heroSignupSuffix')}
      </span>
    </div>
  );
};

// ============================================================================
// BUILDER MOCKUP - Simplified, no 3D effects
// ============================================================================
const BuilderMockup = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  // Simplified timer - no complex state
  useEffect(() => {
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

  const templates = [{ name: 'মডার্ন স্টোর', color: '#006A4E', active: step >= 1 }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'circOut' }}
      className="relative"
    >
      <div className="relative backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden">
        {/* Browser header - simplified */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full text-[10px] text-white/40 border border-white/5 font-mono">
            <span>store.bikrimart.com</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Builder interface - simplified */}
        <div className="p-4 md:p-6 min-h-[300px] md:min-h-[420px] bg-gradient-to-b from-transparent to-black/40 relative">
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
                    className={`relative p-3 rounded-2xl border transition-all ${
                      i === 0
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-full h-32 rounded-xl mb-3 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                      <div
                        style={{ background: tmpl.color }}
                        className="w-full h-full opacity-30"
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
            </motion.div>
          )}

          {step >= 1 && step < 4 && (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-[#050505]">
                <div
                  className="p-4 md:p-6 transition-all duration-700"
                  style={{
                    background:
                      step >= 2
                        ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
                        : '#111',
                  }}
                >
                  <motion.h3
                    className="text-lg md:text-xl font-bold text-white mb-1"
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

                <div className="p-4 bg-[#0A0A0A] grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((_, i) => (
                    <motion.div
                      key={i}
                      className="aspect-[4/5] rounded-lg bg-white/[0.03] border border-white/5 relative overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: step >= 3 ? 1 : 0.3, y: step >= 3 ? 0 : 10 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 w-12 h-1.5 bg-white/20 rounded-full" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && !isPublished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[300px] md:h-[340px] gap-6"
            >
              <div className="relative">
                <motion.div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 animate-pulse" />
                </div>
              </div>
              <p className="text-white/60 text-xs md:text-sm font-mono tracking-widest uppercase">
                {t('heroDemoPublishing')}...
              </p>
            </motion.div>
          )}

          {isPublished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 rounded-[24px]"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
              >
                <Check className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold text-white mb-2"
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
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN HERO COMPONENT - OPTIMIZED
// ============================================================================
export function AwardWinningHero({ theme = 'dark', totalUsers = 0 }: HeroProps) {
  const { t } = useTranslation();
  const colors = useMemo(() => getColors(theme), [theme]);
  const isLight = theme === 'light';

  return (
    <section
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ backgroundColor: colors.background }}
    >
      <GrainOverlay isLight={isLight} />
      <GradientBackground isLight={isLight} />

      {/* Subtle grid pattern - CSS only */}
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 md:px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT: Bold Messaging */}
          <div>
            {/* Badge - simplified animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 md:mb-8"
              style={{
                backgroundColor: isLight ? 'rgba(0,106,78,0.08)' : `${colors.primary}10`,
                borderColor: isLight ? 'rgba(0,106,78,0.15)' : `${colors.primary}30`,
              }}
            >
              <span>🇧🇩</span>
              <span style={{ color: colors.textMuted }} className="text-sm">
                {t('heroBadge')}
              </span>
            </motion.div>

            {/* Main Headline - simplified animation */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold leading-[1.4] tracking-tight mb-4 md:mb-6"
              style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
            >
              <motion.span
                className={`block ${isLight ? 'text-[#0F172A]' : 'text-white'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {t('heroTitle1')}
              </motion.span>
              <motion.span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${isLight ? '#8B5CF6' : colors.accent} 100%)`,
                  backgroundSize: '200% 100%',
                  animation: 'gradientShift 4s ease infinite',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('heroTitle2')}
              </motion.span>
            </h1>
            <style>{`
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}</style>

            {/* Subheadline - simplified */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl mb-6 md:mb-10 max-w-xl leading-relaxed"
              style={{ color: colors.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {t('heroSubtitle1')}
              <br />
              {t('heroSubtitle2')}{' '}
              <span style={{ color: colors.text, fontWeight: 600 }}>{t('heroSubtitle3')}</span>
            </motion.p>

            {/* CTA Buttons - simplified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-4 md:mb-6"
            >
              <Link
                href="https://app.ozzyl.com/auth/register"
                className="group relative px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-white overflow-hidden flex items-center gap-2 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                }}
              >
                <span className="relative z-10">{t('heroCtaPrimary')}</span>
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-sm mb-6 md:mb-8"
              style={{ color: colors.textMuted }}
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
              transition={{ delay: 0.8 }}
              className="mt-6 md:mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: isLight ? 'rgba(217,119,6,0.08)' : `${colors.accent}10`,
                borderColor: isLight ? 'rgba(217,119,6,0.2)' : `${colors.accent}30`,
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
              <span className="text-sm" style={{ color: colors.accent }}>
                {t('heroBetaNotice')}
              </span>
            </motion.div>
          </div>

          {/* RIGHT: Builder Demo Mockup - Only on desktop */}
          <div className="hidden lg:block">
            <ClientOnly
              fallback={
                <div className="h-[500px] md:h-[600px] w-full bg-white/5 animate-pulse rounded-2xl" />
              }
            >
              <BuilderMockup />
            </ClientOnly>
          </div>
        </div>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 md:mt-20"
        >
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {t('heroFooter')} 🇧🇩
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default AwardWinningHero;
