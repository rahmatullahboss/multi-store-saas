/**
 * Pricing Section - "সবার জন্য সাশ্রয়ী"
 * 
 * Premium pricing section for Bangladeshi small business owners
 * 
 * Features:
 * - Three pricing tiers (Free, Starter, Ultimate)
 * - Animated gradient border on popular card
 * - Savings calculator with animated comparison
 * - Ultimate plan special callout
 * - Micro-interactions: hover lift, checkmark animations, ripple effects
 */

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from '@remix-run/react';
import { Check, Star, Gift, Zap, Phone, ArrowRight, Sparkles, Crown, Users2, Headphones } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '~/components/animations';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  accent: '#F9A825',       // Golden Yellow
  accentLight: '#FFB74D',
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
  violet: '#8B5CF6',
  blue: '#3B82F6',
};

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================
const AnimatedPrice = ({ value, prefix = '৳', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const duration = 1500;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString('bn-BD')}{suffix}
    </span>
  );
};

// ============================================================================
// ANIMATED CHECKMARK
// ============================================================================
const AnimatedCheck = ({ delay = 0, isHighlighted = false }: { delay?: number; isHighlighted?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{ delay, duration: 0.4, type: 'spring', stiffness: 200 }}
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          isHighlighted 
            ? 'bg-white/20' 
            : 'bg-[#006A4E]/20'
        }`}
      >
        <Check className={`w-3 h-3 ${isHighlighted ? 'text-white' : 'text-[#006A4E]'}`} />
      </motion.div>
    </div>
  );
};

// ============================================================================
// SAVINGS CALCULATOR
// ============================================================================
const SavingsCalculator = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [animatedSavings, setAnimatedSavings] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const duration = 2000;
    const targetSavings = 4501;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedSavings(Math.floor(targetSavings * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      className="mt-16 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9A825]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#F9A825]/20 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              দেখুন কত Save করছেন
            </h3>
          </div>

          {/* Comparison bars */}
          <div className="space-y-4">
            {/* Shopify bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Shopify Basic</span>
                <span className="text-white/40">৳৫,০০০+/মাস</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-400/60 to-red-500/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '100%' } : { width: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Our bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white font-medium">আমাদের Starter</span>
                <span className="text-[#006A4E] font-bold">৳৪৯৯/মাস</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#006A4E] to-[#00875F] rounded-full"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '10%' } : { width: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Savings highlight */}
          <motion.div
            className="mt-6 p-4 bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-2xl flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div>
              <span className="text-white/60 text-sm block">আপনার Savings:</span>
              <span className="text-2xl font-black text-white">
                ৳{animatedSavings.toLocaleString('bn-BD')}+/মাস
              </span>
            </div>
            <motion.div
              className="px-4 py-2 bg-[#F9A825] rounded-xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-black font-bold text-lg">৯০% কম!</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ULTIMATE PLAN CALLOUT
// ============================================================================
const UltimateCallout = () => {
  return (
    <motion.div
      className="mt-16 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/10 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-3xl p-8 overflow-hidden">
        {/* Animated gradient border */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite linear',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              ⚡ Ultimate Plan এ পাচ্ছেন:
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { icon: Crown, text: 'Custom Store Design (আমরা করে দেব)', highlight: true },
              { icon: Headphones, text: 'Priority Support' },
              { icon: Phone, text: '1-on-1 Setup Call' },
              { icon: Users2, text: 'Features Roadmap এ আপনার Input' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  item.highlight ? 'bg-white/10 border border-white/20' : 'bg-white/5'
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <item.icon className={`w-5 h-5 ${item.highlight ? 'text-[#F9A825]' : 'text-[#8B5CF6]'}`} />
                <span className="text-white/80 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50"
          >
            <span>Ultimate নিয়ে কথা বলুন — Free Consultation</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// PRICING CARD
// ============================================================================
interface PricingPlan {
  name: string;
  nameBn: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  isUltimate?: boolean;
  bonus?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    nameBn: 'শুরু করুন',
    price: 0,
    priceDisplay: '৳০',
    description: 'ট্রায়ালের জন্য পারফেক্ট',
    features: [
      '৫টি Product',
      'Store + Landing Page',
      '৫০ Sales/মাস',
      'Live Editor',
      'Bangla Support',
    ],
    cta: 'শুরু করুন',
    isPopular: false,
  },
  {
    name: 'Starter',
    nameBn: 'সবচেয়ে জনপ্রিয়',
    price: 499,
    priceDisplay: '৳৪৯৯',
    description: 'বাড়তে থাকা ব্যবসার জন্য',
    features: [
      '৫০টি Product',
      'Multiple Landing Pages',
      '৫০০ Sales/মাস',
      'Full E-com Store',
      'সব Free Features',
    ],
    cta: 'Upgrade করুন',
    isPopular: true,
  },
  {
    name: 'Ultimate',
    nameBn: 'সীমাহীন',
    price: 1999,
    priceDisplay: '৳১,৯৯৯',
    description: 'এন্টারপ্রাইজ লেভেল',
    features: [
      'Unlimited Products*',
      'Unlimited Landing Pages*',
      'Unlimited Sales*',
      'সবকিছু +',
    ],
    cta: 'যোগাযোগ',
    isUltimate: true,
    bonus: '🎁 BONUS: আমরা আপনার Store Edit করে দেবো*',
  },
];

const PricingCard = ({ plan, index }: { plan: PricingPlan; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative h-full ${plan.isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Animated gradient border for popular plan */}
      {plan.isPopular && (
        <div 
          className="absolute -inset-[2px] rounded-[28px] opacity-80"
          style={{
            background: 'linear-gradient(90deg, #F9A825, #006A4E, #00875F, #F9A825)',
            backgroundSize: '300% 100%',
            animation: 'gradientBorder 3s linear infinite',
          }}
        />
      )}
      
      <motion.div
        className={`relative h-full rounded-3xl p-6 md:p-8 ${
          plan.isPopular 
            ? 'bg-gradient-to-br from-[#006A4E] to-[#00875F] text-white shadow-2xl shadow-[#006A4E]/40' 
            : plan.isUltimate
              ? 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/10 border border-[#8B5CF6]/30 backdrop-blur-xl'
              : 'bg-white/[0.03] backdrop-blur-xl border border-white/10'
        }`}
        whileHover={{ 
          y: -8, 
          boxShadow: plan.isPopular 
            ? '0 25px 50px -12px rgba(0, 106, 78, 0.5)' 
            : '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Popular Badge */}
        {plan.isPopular && (
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-[#F9A825] text-black font-bold text-sm rounded-full shadow-lg"
            animate={{ 
              boxShadow: [
                '0 4px 15px rgba(249, 168, 37, 0.4)',
                '0 4px 25px rgba(249, 168, 37, 0.7)',
                '0 4px 15px rgba(249, 168, 37, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-4 h-4 fill-current" />
            সবচেয়ে জনপ্রিয়
          </motion.div>
        )}

        {/* Plan Name */}
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold mb-1 ${plan.isPopular ? 'text-white' : 'text-white'}`}>
            {plan.name}
          </h3>
          <p className={`text-sm ${plan.isPopular ? 'text-white/80' : 'text-white/50'}`}>
            {plan.nameBn}
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-5xl font-black ${plan.isPopular ? 'text-white' : 'text-white'}`}>
              {plan.priceDisplay}
            </span>
            <span className={`text-lg ${plan.isPopular ? 'text-white/70' : 'text-white/40'}`}>/মাস</span>
          </div>
          <p className={`text-sm mt-2 ${plan.isPopular ? 'text-white/70' : 'text-white/40'}`}>
            {plan.description}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, i) => (
            <motion.li
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <AnimatedCheck delay={0.3 + i * 0.1} isHighlighted={plan.isPopular} />
              <span className={`text-sm ${plan.isPopular ? 'text-white/90' : 'text-white/60'}`}>
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* Bonus for Ultimate */}
        {plan.bonus && (
          <motion.div
            className="mb-6 p-3 bg-[#F9A825]/10 border border-[#F9A825]/30 rounded-xl"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-sm text-[#F9A825] font-medium text-center">
              {plan.bonus}
            </p>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={plan.isUltimate ? '/contact' : '/auth/register'}
            className={`block w-full py-4 text-center font-bold rounded-xl transition-all relative overflow-hidden ${
              plan.isPopular
                ? 'bg-white text-[#006A4E] hover:bg-[#F9A825] hover:text-black shadow-lg'
                : plan.isUltimate
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:from-[#7C3AED] hover:to-[#2563EB] shadow-lg shadow-[#8B5CF6]/25'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            style={{
              // Ripple effect on click is handled by CSS
            }}
          >
            {plan.cta}
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN PRICING SECTION
// ============================================================================
export function PricingSection() {
  return (
    <section 
      id="pricing" 
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes gradientBorder {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.violet}10 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
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
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{ 
                backgroundColor: `${COLORS.primary}10`,
                borderColor: `${COLORS.primary}30`,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
              <span className="text-sm" style={{ color: COLORS.accent }}>
                সাশ্রয়ী মূল্য
              </span>
            </motion.div>
            
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              সবার জন্য{' '}
              <span 
                className="bg-clip-text text-transparent inline-block py-2"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                }}
              >
                সাশ্রয়ী
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Shopify তে যা মাসে ৫০০০+ টাকা, এখানে শুরু ফ্রি থেকে
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* Terms note */}
        <motion.p
          className="text-center text-white/30 text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          * শর্ত প্রযোজ্য — <Link to="#" className="underline hover:text-white/50 transition">Details এ ক্লিক করুন</Link>
        </motion.p>

        {/* Savings Calculator */}
        <SavingsCalculator />

        {/* Ultimate Plan Callout */}
        <UltimateCallout />
      </div>
    </section>
  );
}

export default PricingSection;
