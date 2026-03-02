/**
 * Infrastructure CTA Section
 *
 * Final call-to-action for the infrastructure showcase.
 * "এই Enterprise Technology ব্যবহার করুন — FREE!"
 */

import { useRef } from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Globe, Clock, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { useInView } from '@/hooks/useInView';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#F9A825',
  cyan: '#22D3EE',
  green: '#10B981',
  background: '#0A0F0D',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
};

// ============================================================================
// BENEFIT PILL
// ============================================================================
const BenefitPill = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div
    className="flex items-center gap-2 px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.03]"
    style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}
  >
    <Icon className="w-4 h-4 text-green-400" />
    <span className="text-sm text-white/80">{text}</span>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InfrastructureCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, rootMargin: '-100px' });
  const { t } = useTranslation();

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.background} 50%, ${COLORS.cyan}10 100%)`,
      }}
    >
      {/* Animated background elements */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -float-x"
        style={{ background: `${COLORS.primary}20` }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl -float-reverse"
        style={{ background: `${COLORS.cyan}20` }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Sparkle badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 -fade-in-up ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent}20 0%, ${COLORS.accent}10 100%)`,
            border: `1px solid ${COLORS.accent}40`,
          }}
        >
          <div className="animate-wiggle">
            <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: COLORS.accent, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            🔥 {t('infraCtaBadge')}
          </span>
        </div>

        {/* Main headline */}
        <h2
          className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 -fade-in-up ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
        >
          {t('infraCtaTitlePart1')}{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${COLORS.cyan} 0%, ${COLORS.green} 100%)`,
            }}
          >
            {t('infraCtaTitlePart2')}
          </span>{' '}
          —
          <br />
          {t('infraCtaTitlePart3')}{' '}
          <span className="inline-block -glow-text" style={{ color: COLORS.accent }}>
            FREE!
          </span>
        </h2>

        {/* Subheadline */}
        <p
          className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto -fade-in-up ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          {t('infraCtaSubtitle')}
        </p>

        {/* Benefit pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-10 -fade-in-up ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <BenefitPill icon={Zap} text={t('infraLatency')} />
          <BenefitPill icon={Shield} text={t('infraSecurity')} />
          <BenefitPill icon={Globe} text={t('infraGlobalServers')} />
          <BenefitPill icon={Clock} text={t('infraUptime')} />
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 -fade-in-up ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Primary CTA */}
          <div className="transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]">
            <a href="https://app.ozzyl.com/auth/register"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                boxShadow: `0 0 40px ${COLORS.primary}60`,
              }}
            >
              {/* Glow animation */}
              <div
                className="absolute inset-0 -glow"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.accent} 100%)`,
                }}
              />

              <span
                className="relative text-white"
                style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
              >
                {t('infraCtaPrimary')}
              </span>
              <span className="relative -nudge-x">
                <ArrowRight className="w-5 h-5 text-white" />
              </span>
            </a>
          </div>

          {/* Secondary CTA */}
          <div className="transition-transform duration-200 hover:scale-[1.02]">
            <a href="#demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white/80 hover:text-white transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                {t('infraCtaSecondary')}
              </span>
            </a>
          </div>
        </div>

        {/* Trust line */}
        <p
          className={`text-sm mt-8 -fade-in ${isInView ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: COLORS.textMuted }}
        >
          ✓ {t('heroTrust1')} &nbsp;•&nbsp; ✓ {t('heroDemoReady')} &nbsp;•&nbsp; ✓{' '}
          {t('planFreeDesc')}
        </p>
      </div>
    </section>
  );
}

export default InfrastructureCTA;
