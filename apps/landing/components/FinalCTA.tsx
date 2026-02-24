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
import { ArrowRight, Check, Phone, Mail, Bell, Sparkles, Diamond, Users } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';

// ============================================================================
// USE IN VIEW HOOK
// ============================================================================
const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
};

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
// DEFAULT RECENT SIGNUPS (Fallback if no API data)
// ============================================================================
const defaultRecentSignups = [
  { name: 'র***ক', city: 'ঢাকা', timeAgo: '২ মিনিট আগে' },
  { name: 'স***া', city: 'চট্টগ্রাম', timeAgo: '৫ মিনিট আগে' },
  { name: 'ক***ম', city: 'সিলেট', timeAgo: '৮ মিনিট আগে' },
  { name: 'ফ***া', city: 'রাজশাহী', timeAgo: '১২ মিনিট আগে' },
  { name: 'আ***ন', city: 'খুলনা', timeAgo: '১৫ মিনিট আগে' },
];

// Stats prop interface
interface FinalCTAProps {
  stats?: {
    totalUsers?: number;
    totalStores?: number;
    recentSignups?: Array<{
      name: string;
      city: string;
      timeAgo: string;
    }>;
  };
}

// ============================================================================
// LIVE NOTIFICATION COMPONENT
// ============================================================================
const LiveNotification = ({ recentSignups }: { recentSignups: typeof defaultRecentSignups }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (recentSignups.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [recentSignups.length]);

  if (recentSignups.length === 0) return null;
  const current = recentSignups[currentIndex];

  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl">
      <div className="w-10 h-10 rounded-full bg-[#006A4E]/20 flex items-center justify-center">
        <Bell className="w-5 h-5 text-[#006A4E]" />
      </div>

      <div
        key={currentIndex}
        className={`text-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="text-white/60">{t('finalCtaLive')}: </span>
        <span className="text-white font-medium">{current.name}</span>
        <span className="text-white/60"> {t('finalCtaFrom')} </span>
        <span className="text-[#F9A825]">{current.city}</span>
        <span className="text-white/40"> {t('finalCtaJustSignedUp')}</span>
      </div>

      {/* Live indicator */}
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
    </div>
  );
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
        className="absolute -inset-1 rounded-2xl blur-xl opacity-60 animate-pulse"
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
        <ArrowRight className="w-6 h-6" />
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
        <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
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
        <Diamond
          key={i}
          className={`w-3 h-3 ${
            i % 4 === 0
              ? 'text-[#006A4E]'
              : i % 4 === 1
                ? 'text-[#F9A825]'
                : i % 4 === 2
                  ? 'text-[#8B5CF6]'
                  : 'text-white/20'
          }`}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

// ============================================================================
// MAIN FINAL CTA COMPONENT
// ============================================================================
export function FinalCTA({ stats }: FinalCTAProps) {
  const { t } = useTranslation();
  // Only use real data - don't show fake signups
  const recentSignups = stats?.recentSignups ?? [];
  const totalUsers = stats?.totalUsers || 0;

  const { ref: headlineRef, inView: headlineInView } = useInView(0.1);
  const { ref: missionRef, inView: missionInView } = useInView(0.1);
  const { ref: ctaRef, inView: ctaInView } = useInView(0.1);
  const { ref: secondaryCtaRef, inView: secondaryCtaInView } = useInView(0.1);
  const { ref: notifRef, inView: notifInView } = useInView(0.1);

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orb - top left */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          }}
        />

        {/* Gradient orb - bottom right */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
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
        <div
          ref={headlineRef}
          className={`transition-all duration-700 ${headlineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
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
        </div>

        {/* Mission Statement Card */}
        <div
          ref={missionRef}
          className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 transition-all duration-700 ${missionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
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
          ref={ctaRef}
          className={`mb-4 transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '200ms' }}
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
          ref={secondaryCtaRef}
          className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-700 ${secondaryCtaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '400ms' }}
        >
          <Link
            href="tel:+8801570260118"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Phone className="w-4 h-4" />
            <span>📞 {t('finalCtaSecondaryCall')}</span>
          </Link>

          <Link
            href="/contact"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            <span>📧 {t('finalCtaSecondaryMail')}</span>
          </Link>
        </div>

        {/* Live Notification - Only show when real signups exist */}
        {recentSignups.length > 0 && (
          <div
            ref={notifRef}
            className={`transition-all duration-700 ${notifInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            style={{ transitionDelay: '600ms' }}
          >
            <LiveNotification recentSignups={recentSignups} />
          </div>
        )}
      </div>
    </section>
  );
}

export default FinalCTA;
