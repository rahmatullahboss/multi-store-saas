'use client';

/**
 * Final CTA Section - "আজই শুরু করুন, Future Build করুন"
 *
 * Compelling final call-to-action with exclusivity-based urgency
 *
 * Features:
 * - Mission statement emphasizing being first Bengali e-commerce platform
 * - Large glowing animated CTA button
 * - Trust badges (no credit card, fast setup, early bird pricing)
 * - Secondary CTAs for conversation
 * - Live signup notification (real, not fake)
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Phone, Mail, Bell, Sparkles, Diamond } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { useInView } from '@/hooks/useInView';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E', // Bangladesh Green
  primaryLight: '#00875F',
  accent: '#F9A825', // Golden Yellow
  background: '#0A0A0F',
  violet: '#8B5CF6',
  blue: '#3B82F6',
};



// ============================================================================
// GLOWING CTA BUTTON
// ============================================================================
const GlowingCTAButton = () => {
  const { t } = useTranslation();
  return (
    <div className="relative inline-block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
      {/* Outer glow */}
      <div
        className="absolute -inset-1 rounded-2xl blur-xl opacity-60 animate-glow"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.accent})`,
        }}
      />

      {/* Button */}
      <Link
        href="https://app.ozzyl.com/auth/register"
        className="relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[#006A4E]/50"
        style={{
          boxShadow: `0 0 40px ${COLORS.primary}40`,
        }}
      >
        <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
          {t('finalCtaPrimary')}
        </span>
        <span className="animate-nudge-x">
          <ArrowRight className="w-6 h-6" />
        </span>
      </Link>
    </div>
  );
};

// ============================================================================
// TRUST BADGES
// ============================================================================
const TrustBadges = () => {
  const { t } = useTranslation();
  const badges = [
    { icon: Check, text: t('heroTrust1') },
    { icon: Check, text: t('heroDemoReady') },
    { icon: Sparkles, text: t('finalCtaEarlyBird') },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {badges.map((badge, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-white/60 text-sm animate-fade-in-up"
          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
        >
          <badge.icon className="w-4 h-4 text-[#006A4E]" />
          <span>{badge.text}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// DECORATIVE DIAMONDS
// ============================================================================
const DecorativeDiamonds = () => {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <Diamond
            className={`w-3 h-3 ${i % 4 === 0
                ? 'text-[#006A4E]'
                : i % 4 === 1
                  ? 'text-[#F9A825]'
                  : i % 4 === 2
                    ? 'text-[#8B5CF6]'
                    : 'text-white/20'
              }`}
            fill="currentColor"
          />
        </div>
      ))}
    </div>
  );
};

// Stats prop interface
interface FinalCTAProps {
  stats?: {
    totalUsers?: number;
    totalStores?: number;
  };
}

// ============================================================================
// MAIN FINAL CTA COMPONENT
// ============================================================================
export function FinalCTA({ stats }: FinalCTAProps) {
  const { t } = useTranslation();
  const totalUsers = stats?.totalUsers || 0;

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, rootMargin: '0px 0px -20% 0px' });

  return (
    <section
      ref={sectionRef}
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orb - top left */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full animate-float-x"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          }}
        />

        {/* Gradient orb - bottom right */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full animate-float-reverse"
          style={{
            background: `radial-gradient(circle, ${COLORS.violet}15 0%, transparent 70%)`,
          }}
        />

        {/* Dotted grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Decorative Diamonds */}
        <DecorativeDiamonds />

        {/* Main Headline */}
        <h2
          className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'
            }`}
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          {t('finalCtaTitlePart1')}{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
            }}
          >
            {t('finalCtaTitlePart2')}
          </span>{' '}
          {t('finalCtaTitlePart3')}
        </h2>

        {/* Mission Statement Card */}
        <div
          className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <p
            className="text-xl md:text-2xl text-white/80 leading-relaxed mb-6"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            {t('finalCtaMission')}
          </p>
          <p
            className="text-lg text-white/60"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            {t('finalCtaJourney')}
          </p>
        </div>

        {/* Main CTA Button */}
        <div
          className={`mb-4 animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`}
        >
          <GlowingCTAButton />
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-10">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-white/40 text-sm">{t('finalCtaOr')}</span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Secondary CTAs */}
        <div
          className={`flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <Link
            href="mailto:hello@ozzyl.com"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            <span>📧 {t('finalCtaSecondaryCall')}</span>
          </Link>

          <Link
            href="/contact"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            <span>📧 {t('finalCtaSecondaryMail')}</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default FinalCTA;
