import React from "react";
/**
 * Comparison Section - "কেন আমরাই Best Choice?"
 *
 * Showcase why our platform wins for Bangladeshi entrepreneurs
 *
 * Features:
 * - Comparison table (Shopify vs Wix vs Our Brand)
 * - Animated checkmarks on scroll
 * - Strikethrough price animations
 * - Gradient highlighted brand column
 * - Mobile: Swipeable comparison cards
 * - Premium glassmorphism effects
 */

import { useRef, useState } from 'react';
import { Check, X, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations';
import { ASSETS } from '@/config/assets';

// Simple useInView (replaces framer-motion)
function useInViewSimple(ref: React.RefObject<Element | null>, options?: { once?: boolean; margin?: string }) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); if (options?.once !== false) observer.disconnect(); }
    }, { rootMargin: options?.margin || '0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return inView;
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E', // Bangladesh Green
  primaryLight: '#00875F',
  accent: '#F9A825', // Golden Yellow
  accentLight: '#FFB74D',
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
};

// ============================================================================
// COMPARISON DATA
// ============================================================================
interface ComparisonFeature {
  nameBn: string;
  nameEn: string;
  shopify: string | boolean;
  wix: string | boolean;
  ours: string | boolean;
  highlight?: boolean;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    nameBn: 'বাংলা Interface',
    nameEn: 'Bangla Interface',
    shopify: false,
    wix: false,
    ours: true,
    highlight: true,
  },
  {
    nameBn: 'Monthly Cost',
    nameEn: 'Monthly Cost',
    shopify: '৳৫,০০০+',
    wix: '৳২,০০০+',
    ours: '৳৪৯৯',
    highlight: true,
  },
  {
    nameBn: 'Landing Page + E-commerce',
    nameEn: 'Landing Page + E-commerce',
    shopify: 'Needs Extra $',
    wix: 'Needs Extra $',
    ours: true,
    highlight: false,
  },
  {
    nameBn: 'Setup Time',
    nameEn: 'Setup Time',
    shopify: 'Hours',
    wix: 'Hours',
    ours: '৫ মিনিট',
    highlight: true,
  },
  {
    nameBn: 'Local Support',
    nameEn: 'Local Support',
    shopify: false,
    wix: false,
    ours: true,
    highlight: false,
  },
  {
    nameBn: 'Free Plan',
    nameEn: 'Free Plan',
    shopify: false,
    wix: 'Limited',
    ours: true,
    highlight: false,
  },
  {
    nameBn: 'Custom Design Service',
    nameEn: 'Custom Design Service',
    shopify: '৳৫০,০০০+',
    wix: '৳৩০,০০০+',
    ours: 'Ultimate এ Included',
    highlight: true,
  },
];

// ============================================================================
// ANIMATED CHECK ICON
// ============================================================================
const AnimatedCheck = ({
  delay = 0,
  isBrandColumn = false,
}: {
  delay?: number;
  isBrandColumn?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(ref);

  return (
    <div ref={ref} className="flex items-center justify-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center ${
          isBrandColumn
            ? 'bg-gradient-to-br from-[#006A4E] to-[#00875F] shadow-lg shadow-[#006A4E]/40'
            : 'bg-green-500/20'
        }`}
      >
        <Check className={`w-4 h-4 ${isBrandColumn ? 'text-white' : 'text-green-400'}`} />
      </div>
      {isBrandColumn && (
        <span
          className="text-lg"
        >
          🇧🇩
        </span>
      )}
    </div>
  );
};

// ============================================================================
// ANIMATED X ICON
// ============================================================================
const AnimatedX = ({ delay = 0 }: { delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(ref);

  return (
    <div ref={ref}>
      <div
        className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center"
      >
        <X className="w-4 h-4 text-red-400/60" />
      </div>
    </div>
  );
};

// ============================================================================
// STRIKETHROUGH PRICE
// ============================================================================
const StrikethroughPrice = ({ price, delay = 0 }: { price: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(ref);

  return (
    <div ref={ref} className="relative inline-block">
      <span
        className="text-white/40 text-sm font-medium"
      >
        {price}
      </span>
      <div
        className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-400/60"
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};

// ============================================================================
// OUR PRICE HIGHLIGHT
// ============================================================================
const OurPrice = ({
  price,
  label,
  delay = 0,
}: {
  price: string;
  label?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(ref);

  return (
    <div ref={ref} className="text-center">
      <div
        className="inline-block"
      >
        <span className="text-white font-bold text-lg">{price}</span>
        {label && (
          <span
            className="block text-xs text-[#F9A825] font-semibold mt-0.5"
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE CELL RENDERER
// ============================================================================
const FeatureCell = ({
  value,
  delay = 0,
  isBrandColumn = false,
  isHighlight = false,
}: {
  value: string | boolean;
  delay?: number;
  isBrandColumn?: boolean;
  isHighlight?: boolean;
}) => {
  // Boolean true = check
  if (value === true) {
    return <AnimatedCheck delay={delay} isBrandColumn={isBrandColumn} />;
  }

  // Boolean false = X
  if (value === false) {
    return <AnimatedX delay={delay} />;
  }

  // Price (contains ৳ and +)
  if (typeof value === 'string' && value.includes('৳') && value.includes('+')) {
    return <StrikethroughPrice price={value} delay={delay} />;
  }

  // Our highlight price
  if (isBrandColumn && typeof value === 'string' && value.includes('৳')) {
    // Check if it's just price or has label
    if (value === '৳৪৯৯') {
      return <OurPrice price={value} label="(১০x কম!)" delay={delay} />;
    }
    return <OurPrice price={value} delay={delay} />;
  }

  // Brand column - special highlighting
  if (isBrandColumn) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInViewSimple(ref);

    return (
      <div ref={ref}>
        <div
          className="flex items-center justify-center gap-1"
        >
          <Check className="w-4 h-4 text-[#006A4E]" />
          <span className="text-white font-medium text-sm">{value}</span>
        </div>
      </div>
    );
}

  // Other text values - muted
  return <span className="text-white/40 text-sm">{value}</span>;
};

// ============================================================================
// MOBILE COMPARISON CARD
// ============================================================================
const MobileComparisonCard = ({
  platform,
  isOurs = false,
  features,
}: {
  platform: 'shopify' | 'wix' | 'ours';
  isOurs?: boolean;
  features: ComparisonFeature[];
}) => {
  const platformNames = {
    shopify: 'Shopify',
    wix: 'Wix/Others',
    ours: 'আমাদের Platform',
  };

  return (
    <div
      className={`flex-shrink-0 w-[85vw] max-w-[320px] snap-center ${
        isOurs
          ? 'bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border-2 border-[#006A4E]/50'
          : 'bg-white/5 border border-white/10'
      } backdrop-blur-xl rounded-3xl p-6 mx-2`}
      >
      {/* Platform Header */}
      <div className="text-center mb-6 pb-4 border-b border-white/10">
        {isOurs && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9A825]/20 rounded-full text-[#F9A825] text-xs font-semibold mb-2"
          >
            <Sparkles className="w-3 h-3" />
            Best Choice
          </div>
        )}
        <h3
          className={`text-xl font-bold ${isOurs ? 'text-white' : 'text-white/60'} flex flex-col items-center gap-2`}
        >
          {isOurs ? (
            <>
              <div className="w-12 h-12 bg-white/10 rounded-xl p-2 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center">
                <img src={ASSETS.brand.logoSmall} alt="Ozzyl" className="w-8 h-8 object-contain" />
              </div>
              Ozzyl
            </>
          ) : (
            platformNames[platform]
          )}
        </h3>
        {isOurs && <span className="text-2xl mt-1 block">🇧🇩</span>}
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="text-white/60 text-sm flex-1">{feature.nameBn}</span>
            <div className="flex-shrink-0">
              <FeatureCell
                value={feature[platform]}
                delay={i * 0.05}
                isBrandColumn={isOurs}
                isHighlight={feature.highlight}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPARISON SECTION COMPONENT
// ============================================================================
export function ComparisonSection() {
  const [mobileCardIndex, setMobileCardIndex] = useState(2); // Start with "ours"
  const platforms: ('shopify' | 'wix' | 'ours')[] = ['shopify', 'wix', 'ours'];

  const nextCard = () => {
    setMobileCardIndex((prev) => (prev + 1) % platforms.length);
  };

  const prevCard = () => {
    setMobileCardIndex((prev) => (prev - 1 + platforms.length) % platforms.length);
  };

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent}10 0%, transparent 70%)`,
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{
                backgroundColor: `${COLORS.primary}10`,
                borderColor: `${COLORS.primary}30`,
              }}
            >
              <Zap className="w-4 h-4" style={{ color: COLORS.accent }} />
              <span className="text-sm" style={{ color: COLORS.accent }}>
                সৎ তুলনা
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              কেন আমরাই{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                }}
              >
                Best Choice?
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              বাংলাদেশী উদ্যোক্তাদের জন্য আমাদের প্ল্যাটফর্ম কেন সেরা, নিজেই দেখুন
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop Comparison Table */}
        <div className="hidden lg:block">
          <div
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Table Header */}
            <div className="grid grid-cols-4 border-b border-white/10">
              <div className="p-6 text-white/60 font-semibold text-lg">Feature</div>
              <div className="p-6 text-center text-white/60 font-semibold">
                <span className="text-lg">Shopify</span>
              </div>
              <div className="p-6 text-center text-white/60 font-semibold">
                <span className="text-lg">Wix/Others</span>
              </div>
              {/* Highlighted Column Header */}
              <div
                className="p-6 text-center relative"
                style={{
                  background: `linear-gradient(180deg, ${COLORS.primary}30 0%, ${COLORS.primary}10 100%)`,
                }}
              >
                {/* Best Choice Badge */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                    color: '#000',
                    boxShadow: `0 4px 35px ${COLORS.accent}40, 0 4px 25px ${COLORS.accent}70, 0 4px 15px ${COLORS.accent}40`,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Best Choice
                </div>

                <div className="text-xl font-bold text-white flex flex-col items-center justify-center gap-2 mt-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl p-2 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center">
                    <img
                      src={ASSETS.brand.logoSmall}
                      alt="Ozzyl"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="flex items-center gap-2">
                    Ozzyl
                    <span className="text-2xl">🇧🇩</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <StaggerContainer>
              {comparisonFeatures.map((feature, i) => (
                <StaggerItem key={i}>
                  <div
                    className={`grid grid-cols-4 border-b border-white/5 ${
                      feature.highlight ? 'bg-white/[0.02]' : ''
                    }`}
                    >
                    {/* Feature Name */}
                    <div className="p-5 flex items-center">
                      <span className="text-white/80 font-medium">{feature.nameBn}</span>
                    </div>

                    {/* Shopify */}
                    <div className="p-5 flex items-center justify-center">
                      <FeatureCell value={feature.shopify} delay={i * 0.05} />
                    </div>

                    {/* Wix */}
                    <div className="p-5 flex items-center justify-center">
                      <FeatureCell value={feature.wix} delay={i * 0.05 + 0.1} />
                    </div>

                    {/* Our Platform - Highlighted */}
                    <div
                      className="p-5 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(180deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
                        boxShadow: `inset 0 0 30px ${COLORS.primary}10`,
                      }}
                    >
                      <FeatureCell
                        value={feature.ours}
                        delay={i * 0.05 + 0.2}
                        isBrandColumn={true}
                        isHighlight={feature.highlight}
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>

        {/* Mobile Comparison Cards (Swipeable) */}
        <div className="lg:hidden">
          {/* Navigation Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {platforms.map((_, i) => (
              <button
                key={i}
                onClick={() => setMobileCardIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === mobileCardIndex ? 'w-8 bg-[#006A4E]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Cards Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevCard}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextCard}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Cards */}
            <div className="flex justify-center overflow-hidden py-4">
              
                <div
                  key={mobileCardIndex}
                >
                  <MobileComparisonCard
                    platform={platforms[mobileCardIndex]}
                    isOurs={platforms[mobileCardIndex] === 'ours'}
                    features={comparisonFeatures}
                  />
                </div>
              
            </div>
          </div>

          {/* Swipe Hint */}
          <p
            className="text-center text-white/30 text-xs mt-4"
          >
            ← সোয়াইপ করুন →
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <a href="#pricing"
            className="group px-6 py-3 rounded-xl font-semibold text-white/70 border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 flex items-center gap-2"
          >
            দেখুন Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a href="https://app.ozzyl.com/auth/register"
            className="group px-8 py-3 rounded-xl font-bold text-black overflow-hidden flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
              boxShadow: `0 0 30px ${COLORS.primary}40`,
            }}
          >
            <span>ফ্রিতে শুরু করুন</span>
            <span
            >
              <ArrowRight className="w-5 h-5" />
            </span>
          </a>
        </div>

        {/* Trust Line */}
        <p
          className="text-center text-white/30 text-sm mt-8"
        >
          ✓ কোনো ক্রেডিট কার্ড লাগবে না &nbsp;•&nbsp; ✓ ৫ মিনিটে সেটআপ &nbsp;•&nbsp; ✓ চিরকাল ফ্রি
          প্ল্যান
        </p>
      </div>
    </section>
  );
}

export default ComparisonSection;
