/**
 * Customer Benefits Section - UI/UX Pro Max
 * 
 * Highlights customer-facing features with Google Sign-in as primary focus
 * 
 * DESIGN SYSTEM: Liquid Glass (matching BentoFeaturesSection & ProblemSolutionSection)
 * - Dark background: #0A0A12
 * - Primary color: Emerald (#10B981)
 * - Accent: Blue (#3B82F6) for Google branding
 * - Glass morphism cards with backdrop-blur
 */

import { useRef, useState, useEffect } from 'react';
import { 
  Chrome, Shield, Zap, Heart, Star, User, 
  CheckCircle2, ShoppingBag, CreditCard, Lock,
  Sparkles, ArrowRight, Gift, Mail, Bell
} from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';

// Simple IntersectionObserver-based useInView (replaces framer-motion)
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
  primary: '#10B981',
  primaryLight: '#34D399',
  accent: '#3B82F6',
  accentLight: '#60A5FA',
  bg: '#0A0A12',
  card: 'rgba(255, 255, 255, 0.03)',
  cardHover: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(59, 130, 246, 0.3)',
};

// ============================================================================
// GOOGLE SIGN-IN HERO CARD (Large Feature)
// ============================================================================
const GoogleSignInHeroCard = () => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="group relative h-full p-8 md:p-10 rounded-[32px] overflow-hidden border border-white/10"
      style={{ backgroundColor: COLORS.card }}
      
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 blur-[120px] group-hover:bg-blue-500/30 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/20 blur-[120px] group-hover:bg-emerald-500/30 transition-all duration-700" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 self-start backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-blue-300 font-bengali">
            {t('customerBenefits_mainFeature') || 'প্রধান সুবিধা'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight font-bengali">
          {t('customerBenefits_googleSignIn_title') || 'এক ক্লিকে Google দিয়ে সাইন ইন'}
        </h3>
        <p className="text-white/60 text-base mb-8 font-bengali max-w-md">
          {t('customerBenefits_googleSignIn_desc') || 'আপনার কাস্টমাররা কোনো ঝামেলা ছাড়াই তাদের Google অ্যাকাউন্ট দিয়ে সরাসরি লগইন করতে পারবে। নিরাপদ, দ্রুত এবং সহজ!'}
        </p>

        {/* Animated Google Sign-in Demo */}
        <div className="flex-1 flex items-center justify-center min-h-[280px]">
          <div className="relative w-full max-w-sm">
            {/* Mock Browser Window */}
            <div className="relative rounded-2xl border border-white/10 bg-[#1A1A24] overflow-hidden shadow-2xl">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0F0F16] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md ml-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-white/40 font-mono">yourstore.ozzyl.com</span>
                </div>
              </div>

              {/* Login Content */}
              <div className="p-6 space-y-4">
                {/* Traditional Login (Faded) */}
                <div className="space-y-3 opacity-30">
                  <div className="h-10 bg-white/5 rounded-lg border border-white/5" />
                  <div className="h-10 bg-white/5 rounded-lg border border-white/5" />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30 font-medium">অথবা</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google Sign-in Button (Highlighted) */}
                <button
                  className="w-full relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 px-6 py-3.5 bg-white rounded-xl hover:bg-white/95 transition-colors border border-white/20 shadow-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700 font-semibold text-sm">
                      Google দিয়ে সাইন ইন করুন
                    </span>
                  </div>
                  
                  {/* Pulse effect when animating */}
                  {isAnimating && (
                    <div
                      className="absolute inset-0 border-2 border-blue-400 rounded-xl"
                      
                    />
                  )}
                </button>

                {/* Success Checkmarks */}
                <div
                  className="flex items-center gap-2 text-emerald-400 text-xs"
                  
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bengali">নিরাপদ ও দ্রুত লগইন</span>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div
              className="absolute -right-4 top-1/4 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-3 shadow-xl"
              
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-white font-bold text-sm">2 সেকেন্ড</div>
                  <div className="text-white/50 text-xs font-bengali">লগইন সময়</div>
                </div>
              </div>
            </div>

            <div
              className="absolute -left-4 bottom-1/4 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-3 shadow-xl"
              
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-white font-bold text-sm">100%</div>
                  <div className="text-white/50 text-xs font-bengali">নিরাপদ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {[
            { icon: Shield, text: 'Google-এর নিরাপত্তা' },
            { icon: Zap, text: 'দ্রুত লগইন' },
            { icon: User, text: 'কোনো পাসওয়ার্ড মনে রাখার দরকার নেই' },
            { icon: Heart, text: 'বিশ্বস্ত ও সহজ' },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"
              
              
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-white/70 font-bengali font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BENEFIT CARD (Small)
// ============================================================================
const BenefitCard = ({ 
  icon: Icon, 
  title, 
  description, 
  accentColor = COLORS.primary,
  delay = 0 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  accentColor?: string;
  delay?: number;
}) => (
  <div
    className="group relative p-6 rounded-[24px] border border-white/10 overflow-hidden"
    style={{ backgroundColor: COLORS.card }}
    
    
  >
    {/* Hover gradient */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ 
        background: `radial-gradient(circle at 50% 0%, ${accentColor}15, transparent 70%)` 
      }}
    />

    {/* Glow orb */}
    <div 
      className="absolute -top-12 -right-12 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700"
      style={{ backgroundColor: accentColor }}
    />

    <div className="relative z-10">
      {/* Icon */}
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
        style={{ 
          backgroundColor: `${accentColor}15`,
          borderColor: `${accentColor}30`
        }}
      >
        <Icon className="w-7 h-7" style={{ color: accentColor }} />
      </div>

      {/* Content */}
      <h4 className="text-lg font-bold text-white mb-2 font-bengali">{title}</h4>
      <p className="text-white/60 text-sm leading-relaxed font-bengali">{description}</p>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CustomerBenefitsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInViewSimple(sectionRef);

  const benefits = [
    {
      icon: ShoppingBag,
      title: t('customerBenefits_wishlist_title') || 'উইশলিস্ট ও সেভ করুন',
      description: t('customerBenefits_wishlist_desc') || 'পছন্দের প্রোডাক্ট সেভ করে রাখুন এবং পরে কিনুন',
      accentColor: '#EC4899',
    },
    {
      icon: Star,
      title: t('customerBenefits_reviews_title') || 'রিভিউ দিন ও রেটিং দেখুন',
      description: t('customerBenefits_reviews_desc') || 'প্রোডাক্ট রিভিউ লিখুন এবং অন্যদের মতামত দেখুন',
      accentColor: '#F59E0B',
    },
    {
      icon: CreditCard,
      title: t('customerBenefits_payment_title') || 'সহজ পেমেন্ট অপশন',
      description: t('customerBenefits_payment_desc') || 'bKash, Nagad, SSL Commerce সহ সব পেমেন্ট মেথড',
      accentColor: '#10B981',
    },
    {
      icon: Bell,
      title: t('customerBenefits_notifications_title') || 'অর্ডার আপডেট পান',
      description: t('customerBenefits_notifications_desc') || 'SMS ও Email এ অর্ডার স্ট্যাটাস নোটিফিকেশন',
      accentColor: '#8B5CF6',
    },
    {
      icon: Gift,
      title: t('customerBenefits_offers_title') || 'এক্সক্লুসিভ অফার',
      description: t('customerBenefits_offers_desc') || 'বিশেষ ডিসকাউন্ট এবং অফার শুধুমাত্র রেজিস্টার্ড কাস্টমারদের জন্য',
      accentColor: '#EF4444',
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden bg-[#0A0A12]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div
          className="text-center mb-16"
          
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300 font-bengali">
              {t('customerBenefits_badge') || 'কাস্টমারদের জন্য'}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white font-bengali leading-tight mb-4">
            {t('customerBenefits_title_part1') || 'আপনার কাস্টমাররা পাবে'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400">
              {t('customerBenefits_title_part2') || 'বিশ্বমানের অভিজ্ঞতা'}
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-bengali">
            {t('customerBenefits_subtitle') || 'Google Sign-in সহ আধুনিক ফিচার যা আপনার কাস্টমারদের শপিং অভিজ্ঞতা করবে সহজ ও আনন্দদায়ক'}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Google Sign-in Hero (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 min-h-[600px]">
            <GoogleSignInHeroCard />
          </div>

          {/* Right: Stacked Benefit Cards */}
          <div className="flex flex-col gap-6">
            {benefits.slice(0, 2).map((benefit, i) => (
              <BenefitCard key={i} {...benefit} delay={0.1 * i} />
            ))}
          </div>
        </div>

        {/* Bottom Row: Additional Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {benefits.slice(2).map((benefit, i) => (
            <BenefitCard key={i + 2} {...benefit} delay={0.2 + 0.1 * i} />
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center mt-16"
          
          
        >
          <a
            href="https://app.ozzyl.com/auth/register"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1 group"
          >
            <span className="font-bengali">{t('customerBenefits_cta') || 'আজই শুরু করুন'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-white/40 text-sm mt-4 font-bengali">
            {t('customerBenefits_cta_subtitle') || 'কোনো ক্রেডিট কার্ড লাগবে না • ৭ দিনের ফ্রি ট্রায়াল'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default CustomerBenefitsSection;
