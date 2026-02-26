'use client';

/**
 * Speed Impact Section - "Speed = Sales"
 *
 * Shows the business impact of speed with real statistics
 * from Google/Amazon research.
 *
 * Features:
 * - Animated statistics counters
 * - Side-by-side business comparison
 * - Money counter with "cha-ching" effect
 * - Bengali explanations for local audience
 */

import { useRef, useState, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Zap,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#F9A825',
  cyan: '#22D3EE',
  red: '#EF4444',
  green: '#10B981',
  orange: '#F97316',
  purple: '#A855F7',
  background: '#0A0F0D',
  cardBg: 'rgba(255, 255, 255, 0.02)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.08)',
};

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  className?: string;
  onComplete?: () => void;
}

const AnimatedNumber = ({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  color = COLORS.text,
  className = '',
  onComplete,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const displayValue = useCountUp(value, { duration: duration * 1000, enabled: isInView });

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => onComplete?.(), duration * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, duration, onComplete]);

  return (
    <span
      ref={ref}
      className={`${className} animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`}
      style={{ color }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
interface StatCardProps {
  icon: LucideIcon;
  stat: string;
  description: string;
  descriptionBn: string;
  isNegative?: boolean;
  delay?: number;
}

const StatCard = ({
  icon: Icon,
  stat,
  description,
  descriptionBn,
  isNegative,
  delay = 0,
}: StatCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const color = isNegative ? COLORS.red : COLORS.green;
  const TrendIcon = isNegative ? TrendingDown : TrendingUp;

  return (
    <div
      ref={ref}
      className={`rounded-xl p-5 relative overflow-hidden group animate-fade-in-up ${
        isInView ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
        border: `1px solid ${color}20`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendIcon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Stat */}
      <p className="text-2xl font-bold text-white mb-1">{stat}</p>

      {/* Description */}
      <p className="text-sm text-white/70">{description}</p>
      <p
        className="text-xs mt-1"
        style={{ color: COLORS.textSubtle, fontFamily: "'Noto Sans Bengali', sans-serif" }}
      >
        {descriptionBn}
      </p>
    </div>
  );
};

// ============================================================================
// COMPARISON TABLE
// ============================================================================
interface ComparisonTableProps {
  isInView: boolean;
}

const ComparisonTable = ({ isInView }: ComparisonTableProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  const slowData = {
    visitors: 1000,
    stayed: 470,
    bought: 47,
    sales: 47000,
  };

  const fastData = {
    visitors: 1000,
    stayed: 950,
    bought: 95,
    sales: 95000,
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        animationDelay: '0.2s',
      }}
    >
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b" style={{ borderColor: COLORS.border }}>
        <div className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
          <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>মেট্রিক্স</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Slow Site (3s+)</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Fast Site (&lt;1s)</span>
          </div>
        </div>
      </div>

      {/* Table Rows */}
      {[
        {
          label: 'Visitors আসে',
          icon: Users,
          slow: { value: slowData.visitors, suffix: ' জন' },
          fast: { value: fastData.visitors, suffix: ' জন' },
          delay: 0.1,
        },
        {
          label: 'থেকে যায়',
          icon: CheckCircle,
          slow: { value: slowData.stayed, suffix: ' জন', color: COLORS.red },
          fast: { value: fastData.stayed, suffix: ' জন', color: COLORS.green },
          delay: 0.2,
        },
        {
          label: 'কেনাকাটা করে',
          icon: ShoppingCart,
          slow: { value: slowData.bought, suffix: ' জন', color: COLORS.red },
          fast: { value: fastData.bought, suffix: ' জন', color: COLORS.green },
          delay: 0.3,
        },
        {
          label: 'Daily Sales',
          icon: DollarSign,
          slow: { value: slowData.sales, prefix: '৳', color: COLORS.red },
          fast: { value: fastData.sales, prefix: '৳', color: COLORS.green },
          delay: 0.4,
          isHighlight: true,
        },
      ].map((row, index) => (
        <div
          key={index}
          className={`grid grid-cols-3 gap-4 p-4 ${row.isHighlight ? 'bg-white/[0.02]' : ''} animate-fade-in-left ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ borderBottom: index < 3 ? `1px solid ${COLORS.border}` : 'none', animationDelay: `${row.delay}s` }}
        >
          <div className="flex items-center gap-2">
            <row.icon className="w-4 h-4" style={{ color: COLORS.textMuted }} />
            <span
              className="text-sm"
              style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {row.label}
            </span>
          </div>
          <div className="text-center">
            <AnimatedNumber
              value={row.slow.value}
              prefix={row.slow.prefix}
              suffix={row.slow.suffix}
              color={row.slow.color || COLORS.text}
              className={`font-mono ${row.isHighlight ? 'text-lg font-bold' : 'text-sm'}`}
              duration={1.5}
            />
          </div>
          <div className="text-center">
            <AnimatedNumber
              value={row.fast.value}
              prefix={row.fast.prefix}
              suffix={row.fast.suffix}
              color={row.fast.color || COLORS.text}
              className={`font-mono ${row.isHighlight ? 'text-lg font-bold' : 'text-sm'}`}
              duration={1.5}
              onComplete={row.isHighlight ? () => setAnimationComplete(true) : undefined}
            />
          </div>
        </div>
      ))}

      {/* Difference Highlight */}
      <div
        className={`p-4 text-center animate-fade-in-up ${
          animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          background:
            'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">👆</span>
          <p
            className="text-lg font-bold"
            style={{ color: COLORS.green, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            প্রতিদিন{' '}
            <span className="animate-glow-text">৳48,000</span>{' '}
            বেশি শুধু Speed এর জন্য!
          </p>
          {animationComplete && <span className="text-2xl animate-pop">💰</span>}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function SpeedImpact() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, rootMargin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full animate-pulse-soft"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.accent}08 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6 animate-fade-in-up ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundColor: `${COLORS.accent}10`,
              borderColor: `${COLORS.accent}30`,
            }}
          >
            <DollarSign className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span style={{ color: COLORS.accent }} className="text-sm font-medium">
              SPEED = SALES
            </span>
          </div>

          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
          >
            💰 Speed কেন গুরুত্বপূর্ণ?
          </h2>

          <p
            className={`text-lg max-w-2xl mx-auto animate-fade-in-up ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            ⚡ <span className="text-white font-semibold">Facebook এর মতো Speed</span>, আপনার ছোট
            Business এও — Research বলছে:
          </p>
        </div>

        {/* Research Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <StatCard
            icon={TrendingDown}
            stat="7% Loss"
            description="1 Second Delay = 7% Conversion Loss"
            descriptionBn="১ সেকেন্ড দেরিতে ৭% কাস্টমার হারান"
            isNegative={true}
            delay={0.2}
          />
          <StatCard
            icon={Users}
            stat="53% Leave"
            description="3+ Second Load = 53% Visitors Leave"
            descriptionBn="৩+ সেকেন্ডে ৫৩% ভিজিটর চলে যায়"
            isNegative={true}
            delay={0.3}
          />
          <StatCard
            icon={TrendingUp}
            stat="+8% Sales"
            description="0.1s Improvement = 8% More Conversions"
            descriptionBn="০.১ সেকেন্ড দ্রুত = ৮% বেশি বিক্রি"
            isNegative={false}
            delay={0.4}
          />
        </div>

        {/* Real Example Section */}
        <div
          className={`mb-8 animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`}
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">💡</span>
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              বাস্তব উদাহরণ:
            </h3>
          </div>

          <p
            className="text-center mb-6"
            style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            ধরুন আপনার Store এ প্রতিদিন <span className="text-white font-semibold">1,000 জন</span>{' '}
            আসে...
          </p>

          {/* Comparison Table */}
          <ComparisonTable isInView={isInView} />
        </div>

        {/* Final CTA */}
        <div className={`text-center animate-fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`}>
          <div
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-transform duration-200 hover:scale-[1.02]"
            style={{
              background:
                'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 106, 78, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <Sparkles className="w-6 h-6" style={{ color: COLORS.accent }} />
            <p
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              এই Speed আপনার সব Store এ{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.cyan} 100%)`,
                }}
              >
                FREE!
              </span>{' '}
              ⚡
            </p>
          </div>

          {/* Source attribution */}
          <p
            className={`text-xs mt-4 animate-fade-in ${isInView ? 'opacity-100' : 'opacity-0'}`}
            style={{ color: COLORS.textSubtle }}
          >
            * Source: Google/SOASTA Research, Amazon Internal Studies
          </p>
        </div>
      </div>
    </section>
  );
}

export default SpeedImpact;
