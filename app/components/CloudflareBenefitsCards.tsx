/**
 * Cloudflare Benefits Cards - Enterprise-Grade Features
 * 
 * Horizontal scrolling cards explaining Cloudflare advantages
 * in simple, non-technical Bengali with hover interactions:
 * - Card lift with shadow
 * - Icon pulse/bounce animation
 * - Background gradient shift
 * - Tooltip with more details
 */

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Zap, Shield, Globe, Clock, Database, Lock } from 'lucide-react';

// ============================================================================
// DESIGN TOKENS - Matching Infrastructure Section theme
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  primaryDark: '#004D38',
  accent: '#F9A825',       // Golden Yellow
  accentLight: '#FFB74D',
  cyan: '#22D3EE',         // Data flow color
  purple: '#A855F7',       // Secondary accent
  blue: '#3B82F6',         // Blue accent
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
};

// ============================================================================
// BENEFITS DATA
// ============================================================================
interface BenefitCard {
  id: string;
  icon: React.ElementType;
  title: string;
  titleEn: string;
  bengaliQuote: string;
  specs: string[];
  color: string;
  gradient: string;
  tooltip: string;
}

const BENEFITS: BenefitCard[] = [
  {
    id: 'speed',
    icon: Zap,
    title: 'SPEED',
    titleEn: 'বিদ্যুৎ গতি',
    bengaliQuote: '"বিশ্বের সবচেয়ে দ্রুত CDN"',
    specs: ['<100ms worldwide', 'Edge Caching'],
    color: COLORS.accent,
    gradient: `linear-gradient(135deg, ${COLORS.accent}20 0%, ${COLORS.accent}05 100%)`,
    tooltip: 'আপনার স্টোর বাংলাদেশ থেকে আমেরিকা - সব জায়গায় একই দ্রুত।',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'SECURITY',
    titleEn: 'সুরক্ষা',
    bengaliQuote: '"হ্যাকার থেকে সুরক্ষিত"',
    specs: ['DDoS Attack Protection', 'Auto SSL Certificate'],
    color: COLORS.primary,
    gradient: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.primary}05 100%)`,
    tooltip: 'প্রতিদিন মিলিয়ন হ্যাকার অ্যাটাক ব্লক করে।',
  },
  {
    id: 'global',
    icon: Globe,
    title: 'GLOBAL',
    titleEn: 'বিশ্বব্যাপী',
    bengaliQuote: '"পৃথিবীর যেকোনো প্রান্তে Fast"',
    specs: ['310+ Edge Locations', '6 Continents'],
    color: COLORS.cyan,
    gradient: `linear-gradient(135deg, ${COLORS.cyan}20 0%, ${COLORS.cyan}05 100%)`,
    tooltip: 'বিশ্বের ১০০+ দেশে সার্ভার।',
  },
  {
    id: 'uptime',
    icon: Clock,
    title: 'UPTIME',
    titleEn: 'নিরবচ্ছিন্ন',
    bengaliQuote: '"কখনো Down হয় না"',
    specs: ['99.99% Guaranteed', 'Zero Downtime Deploys'],
    color: COLORS.purple,
    gradient: `linear-gradient(135deg, ${COLORS.purple}20 0%, ${COLORS.purple}05 100%)`,
    tooltip: 'বছরে মাত্র ৫২ মিনিট ডাউনটাইম।',
  },
  {
    id: 'cache',
    icon: Database,
    title: 'CACHE',
    titleEn: 'স্মার্ট ক্যাশ',
    bengaliQuote: '"Smart Caching = দ্রুত"',
    specs: ['Edge Cache Everywhere', 'Instant Purge'],
    color: COLORS.blue,
    gradient: `linear-gradient(135deg, ${COLORS.blue}20 0%, ${COLORS.blue}05 100%)`,
    tooltip: 'ছবি, ভিডিও সব কাছের সার্ভারে রাখে।',
  },
  {
    id: 'ssl',
    icon: Lock,
    title: 'SSL',
    titleEn: 'ফ্রি HTTPS',
    bengaliQuote: '"Free HTTPS সবার জন্য"',
    specs: ['Auto SSL Certificate', 'Always Encrypted'],
    color: COLORS.primaryLight,
    gradient: `linear-gradient(135deg, ${COLORS.primaryLight}20 0%, ${COLORS.primaryLight}05 100%)`,
    tooltip: 'কোনো খরচ ছাড়াই SSL সার্টিফিকেট।',
  },
];

// ============================================================================
// BENEFIT CARD COMPONENT
// ============================================================================
interface BenefitCardComponentProps {
  benefit: BenefitCard;
  index: number;
}

const BenefitCardComponent = ({ benefit, index }: BenefitCardComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = benefit.icon;
  
  return (
    <motion.div
      className="relative group flex-shrink-0 w-[280px] sm:w-[300px]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative h-full p-6 rounded-2xl backdrop-blur-xl border transition-all duration-500 cursor-pointer overflow-hidden"
        style={{
          background: benefit.gradient,
          borderColor: isHovered ? `${benefit.color}50` : 'rgba(255,255,255,0.1)',
        }}
        animate={{
          y: isHovered ? -8 : 0,
          boxShadow: isHovered 
            ? `0 20px 40px ${benefit.color}30, 0 8px 16px rgba(0,0,0,0.3)` 
            : '0 4px 12px rgba(0,0,0,0.2)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Background gradient shift on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{
            background: `radial-gradient(circle at ${isHovered ? '30% 30%' : '50% 50%'}, ${benefit.color}25 0%, transparent 70%)`,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-2xl opacity-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${benefit.color}30 0%, transparent 50%)`,
          }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon with animation */}
          <motion.div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: `linear-gradient(135deg, ${benefit.color}30 0%, ${benefit.color}10 100%)`,
              border: `1px solid ${benefit.color}40`,
            }}
            animate={{
              scale: isHovered ? [1, 1.1, 1] : 1,
              rotate: isHovered ? [0, -5, 5, 0] : 0,
            }}
            transition={{ 
              duration: 0.6,
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 0.5,
            }}
          >
            <motion.div
              animate={{
                scale: isHovered ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              <Icon 
                className="w-7 h-7" 
                style={{ color: benefit.color }}
              />
            </motion.div>
          </motion.div>
          
          {/* Title */}
          <div className="mb-3">
            <p 
              className="text-xs font-bold tracking-widest mb-1"
              style={{ color: benefit.color }}
            >
              {benefit.title}
            </p>
            <h3 
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {benefit.titleEn}
            </h3>
          </div>
          
          {/* Bengali Quote */}
          <p 
            className="text-base mb-4 leading-relaxed"
            style={{ 
              color: COLORS.text,
              fontFamily: "'Noto Sans Bengali', sans-serif",
            }}
          >
            {benefit.bengaliQuote}
          </p>
          
          {/* Specs */}
          <div className="space-y-2">
            {benefit.specs.map((spec, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + i * 0.1 + 0.3 }}
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: benefit.color }}
                />
                <span style={{ color: COLORS.textMuted }}>{spec}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Tooltip on hover */}
        <motion.div
          className="absolute left-0 right-0 -bottom-2 mx-4 px-4 py-3 rounded-xl backdrop-blur-md border z-20"
          style={{
            background: 'rgba(0,0,0,0.85)',
            borderColor: `${benefit.color}40`,
          }}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.95,
          }}
          transition={{ duration: 0.2, delay: isHovered ? 0.3 : 0 }}
        >
          <p 
            className="text-sm"
            style={{ 
              color: COLORS.text,
              fontFamily: "'Noto Sans Bengali', sans-serif",
            }}
          >
            💡 {benefit.tooltip}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN SECTION COMPONENT
// ============================================================================
export function CloudflareBenefitsCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.primary}10 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.cyan}10 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6"
            style={{ 
              backgroundColor: `${COLORS.primary}10`,
              borderColor: `${COLORS.primary}30`,
            }}
          >
            <Shield className="w-4 h-4" style={{ color: COLORS.primary }} />
            <span style={{ color: COLORS.primary }} className="text-sm font-medium">
              ENTERPRISE-GRADE FEATURES
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
          >
            Enterprise-Grade Features,{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
              }}
            >
              আপনার জন্য FREE
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            বড় কোম্পানিগুলোর মতো Technology এখন আপনার ছোট ব্যবসার জন্য, কোনো খরচ ছাড়াই।
          </motion.p>
        </div>

        {/* Cards Container */}
        <div className="relative">
          {/* Scroll indicators/buttons */}
          <motion.button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hidden md:flex"
            style={{
              background: 'rgba(0,0,0,0.6)',
              borderColor: 'rgba(255,255,255,0.2)',
              opacity: canScrollLeft ? 1 : 0.3,
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
            }}
            whileHover={canScrollLeft ? { scale: 1.1 } : {}}
            whileTap={canScrollLeft ? { scale: 0.95 } : {}}
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hidden md:flex"
            style={{
              background: 'rgba(0,0,0,0.6)',
              borderColor: 'rgba(255,255,255,0.2)',
              opacity: canScrollRight ? 1 : 0.3,
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
            }}
            whileHover={canScrollRight ? { scale: 1.1 } : {}}
            whileTap={canScrollRight ? { scale: 0.95 } : {}}
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0A0F0D] to-transparent z-10 pointer-events-none hidden md:block" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0A0F0D] to-transparent z-10 pointer-events-none hidden md:block" />

          {/* Scrollable cards container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 md:px-8 scrollbar-hide"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {BENEFITS.map((benefit, index) => (
              <div key={benefit.id} style={{ scrollSnapAlign: 'start' }}>
                <BenefitCardComponent benefit={benefit} index={index} />
              </div>
            ))}
          </div>

          {/* Scroll hint on mobile */}
          <motion.div
            className="flex justify-center gap-2 mt-4 md:hidden"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            <span className="text-xs" style={{ color: COLORS.textSubtle }}>
              ← Swipe to see more →
            </span>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.cyan}15 100%)`,
              borderColor: `${COLORS.primary}40`,
            }}
          >
            <span className="text-2xl">🇧🇩</span>
            <span style={{ color: COLORS.text, fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              <span className="font-semibold">বাংলাদেশি উদ্যোক্তাদের জন্য</span>{' '}
              <span style={{ color: COLORS.accent }}>বিশ্বমানের Technology</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Custom scrollbar hide styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default CloudflareBenefitsCards;
