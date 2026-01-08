/**
 * Dedicated Pricing Page
 * 
 * Premium dark-themed pricing page with 3-tier Good-Better-Best model
 * Includes FAQ, comparison table, and call to action
 */

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { 
  Check, Star, Zap, Crown, Shield, Headphones, Globe, 
  BarChart3, Users, Package, ShoppingCart, MessageSquare,
  ArrowRight, Sparkles, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { ScrollReveal, MagneticButton } from '~/components/animations';
import { Store, Menu, X } from 'lucide-react';

// ============================================================================
// META
// ============================================================================
export const meta: MetaFunction = () => {
  return [
    { title: 'প্রাইসিং - Multi-Store SaaS | সাশ্রয়ী মূল্যে E-commerce Platform' },
    { name: 'description', content: 'বাংলাদেশের সবচেয়ে সাশ্রয়ী E-commerce Platform। Free থেকে শুরু, Premium মাত্র ৳১,৯৯৯/মাস। Shopify এর ৯০% কম খরচে পুরো Store চালান।' },
    { property: 'og:title', content: 'প্রাইসিং - Multi-Store SaaS' },
    { property: 'og:description', content: 'Free থেকে শুরু, Premium মাত্র ৳১,৯৯৯/মাস' },
  ];
};

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#F9A825',
  background: '#0A0F0D',
  violet: '#8B5CF6',
  blue: '#3B82F6',
};

// ============================================================================
// ANIMATED PRICE COUNTER
// ============================================================================
const AnimatedPrice = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    const timer = setTimeout(() => {
      let startTime: number;
      const duration = 1000;
      
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
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  if (value === 0) return <span ref={ref}>০</span>;
  
  return (
    <span ref={ref}>
      {displayValue.toLocaleString('bn-BD')}
    </span>
  );
};

// ============================================================================
// PLAN DATA
// ============================================================================
interface PricingPlan {
  id: 'free' | 'starter' | 'premium';
  name: string;
  nameBn: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: { text: string; highlighted?: boolean }[];
  limits: {
    products: string;
    orders: string;
    visitors: string;
    storage: string;
    staff: string;
  };
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameBn: 'ফ্রি',
    price: 0,
    priceDisplay: '৳০',
    description: 'ট্রায়ালের জন্য পারফেক্ট',
    features: [
      { text: '১০টি Product' },
      { text: '৫০ Orders/মাস' },
      { text: '৫,০০০ Visitors/মাস' },
      { text: 'Single Landing Page' },
      { text: 'Live Visual Editor' },
      { text: 'Bangla Support' },
    ],
    limits: {
      products: '১০',
      orders: '৫০/মাস',
      visitors: '৫,০০০/মাস',
      storage: '১০০ MB',
      staff: '১ জন',
    },
    ctaText: 'ফ্রি শুরু করুন',
    ctaLink: '/auth/register',
  },
  {
    id: 'starter',
    name: 'Starter',
    nameBn: 'স্টার্টার',
    price: 499,
    priceDisplay: '৳৪৯৯',
    description: 'বাড়তে থাকা ব্যবসার জন্য',
    features: [
      { text: '৫০টি Product' },
      { text: '৫০০ Orders/মাস' },
      { text: '২৫,০০০ Visitors/মাস' },
      { text: 'Full E-commerce Store', highlighted: true },
      { text: 'Custom Domain', highlighted: true },
      { text: 'Facebook Pixel' },
      { text: '২ জন Team Member' },
      { text: 'সব Free Features' },
    ],
    limits: {
      products: '৫০',
      orders: '৫০০/মাস',
      visitors: '২৫,০০০/মাস',
      storage: '৫০০ MB',
      staff: '২ জন',
    },
    isPopular: true,
    ctaText: 'Starter নিন',
    ctaLink: '/auth/register?plan=starter',
  },
  {
    id: 'premium',
    name: 'Premium',
    nameBn: 'প্রিমিয়াম',
    price: 1999,
    priceDisplay: '৳১,৯৯৯',
    description: 'সিরিয়াস ব্যবসার জন্য',
    features: [
      { text: '২০০টি Product' },
      { text: '৩,০০০ Orders/মাস' },
      { text: '৩ লাখ Visitors/মাস' },
      { text: 'Facebook CAPI', highlighted: true },
      { text: 'Priority Support', highlighted: true },
      { text: '২ GB Storage' },
      { text: '৫ জন Team Member' },
      { text: '১% Platform Fee (কম)' },
      { text: 'সব Starter Features' },
    ],
    limits: {
      products: '২০০',
      orders: '৩,০০০/মাস',
      visitors: '৩,০০,০০০/মাস',
      storage: '২ GB',
      staff: '৫ জন',
    },
    ctaText: 'Premium নিন',
    ctaLink: '/auth/register?plan=premium',
  },
];

// ============================================================================
// COMPARISON DATA
// ============================================================================
const comparisonFeatures = [
  { name: 'Max Products', free: '১০', starter: '৫০', premium: '২০০', business: 'Unlimited' },
  { name: 'Monthly Orders', free: '৫০', starter: '৫০০', premium: '৩,০০০', business: '২৫,০০০+' },
  { name: 'Monthly Visitors', free: '৫K', starter: '২৫K', premium: '৩০০K', business: '১.৫M+' },
  { name: 'Storage', free: '১০০ MB', starter: '৫০০ MB', premium: '২ GB', business: '১০ GB' },
  { name: 'Team Members', free: '১', starter: '২', premium: '৫', business: '১৫' },
  { name: 'Custom Domain', free: '❌', starter: '✅', premium: '✅', business: '✅' },
  { name: 'Full Store Mode', free: '❌', starter: '✅', premium: '✅', business: '✅' },
  { name: 'Facebook CAPI', free: '❌', starter: '❌', premium: '✅', business: '✅' },
  { name: 'Priority Support', free: '❌', starter: '❌', premium: '✅', business: '✅' },
  { name: 'Platform Fee', free: '২%', starter: '১.৫%', premium: '১%', business: '০.৫%' },
];

// ============================================================================
// FAQ DATA
// ============================================================================
const faqItems = [
  {
    question: 'কোন Plan আমার জন্য ঠিক?',
    answer: 'আপনি যদি এখনও শুরু না করে থাকেন, Free দিয়ে শুরু করুন। মাসে ৫০+ অর্ডার হলে Starter নিন। সিরিয়াস ব্যবসা হলে Premium নিন - CAPI আর Priority Support পাবেন।',
  },
  {
    question: 'Plan পরে Upgrade করা যায়?',
    answer: 'হ্যাঁ! যেকোনো সময় Upgrade করতে পারবেন। আপনার সব Data, Products, Orders সব ঠিক থাকবে। Upgrade এর পর নতুন Features সাথে সাথে Available হয়ে যাবে।',
  },
  {
    question: 'Limit শেষ হলে কী হবে?',
    answer: 'Limit এর কাছে গেলে আপনাকে Warning দেব। Limit শেষ হলে নতুন Orders/Visitors Accept হবে না। Upgrade করলে সাথে সাথে আবার চালু হবে।',
  },
  {
    question: 'Payment কিভাবে করব?',
    answer: 'bKash, Nagad, বা Bank Transfer দিয়ে Payment করতে পারবেন। Payment করার পর আমাদের Team ২৪ ঘণ্টার মধ্যে Verify করে Plan Activate করে দেবে।',
  },
  {
    question: 'Refund Policy কী?',
    answer: 'যদি কোনো কারণে সন্তুষ্ট না হন, ৭ দিনের মধ্যে জানালে Full Refund দেব। তবে এই সুবিধা প্রথমবার নেওয়া Plan এর জন্য প্রযোজ্য।',
  },
  {
    question: 'Business Plan কিভাবে নিব?',
    answer: 'Business Plan এ আমাদের সাথে যোগাযোগ করুন। আপনার প্রয়োজন অনুযায়ী Custom Pricing আর Features দেব। Priority Onboarding Support ও পাবেন।',
  },
];

// ============================================================================
// PRICING CARD COMPONENT
// ============================================================================
const PricingCard = ({ plan, index }: { plan: PricingPlan; index: number }) => {
  return (
    <motion.div
      className={`relative h-full ${plan.isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Popular badge glow */}
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
            : 'bg-white/[0.03] backdrop-blur-xl border border-white/10'
        }`}
        whileHover={{ 
          y: -8, 
          boxShadow: plan.isPopular 
            ? '0 25px 50px -12px rgba(0, 106, 78, 0.5)' 
            : '0 25px 50px -12px rgba(255, 255, 255, 0.1)',
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

        {/* Plan Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
          <p className={`text-sm ${plan.isPopular ? 'text-white/80' : 'text-white/50'}`}>
            {plan.nameBn}
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-lg text-white/60">৳</span>
            <span className="text-5xl font-black text-white">
              <AnimatedPrice value={plan.price} delay={index * 100} />
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
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                plan.isPopular 
                  ? 'bg-white/20' 
                  : feature.highlighted
                    ? 'bg-[#006A4E]/30'
                    : 'bg-white/10'
              }`}>
                <Check className={`w-3 h-3 ${
                  plan.isPopular ? 'text-white' : feature.highlighted ? 'text-[#006A4E]' : 'text-white/60'
                }`} />
              </div>
              <span className={`text-sm ${
                plan.isPopular ? 'text-white/90' : feature.highlighted ? 'text-white font-medium' : 'text-white/60'
              }`}>
                {feature.text}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={plan.ctaLink}
            className={`block w-full py-4 text-center font-bold rounded-xl transition-all ${
              plan.isPopular
                ? 'bg-white text-[#006A4E] hover:bg-[#F9A825] hover:text-black shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            {plan.ctaText}
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// BUSINESS PLAN CARD
// ============================================================================
const BusinessPlanCard = () => {
  return (
    <motion.div
      className="mt-12 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/10 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-3xl p-8 overflow-hidden">
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite linear',
          }}
        />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Business Plan</h3>
                  <p className="text-white/60 text-sm">বড় ব্যবসার জন্য Custom Solution</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  'Unlimited Products',
                  '২৫,০০০+ Orders',
                  'Dedicated Support',
                  'Custom Integration',
                ].map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 hover:scale-105"
            >
              <span>যোগাযোগ করুন</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPARISON TABLE
// ============================================================================
const ComparisonTable = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleFeatures = isExpanded ? comparisonFeatures : comparisonFeatures.slice(0, 5);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            সব Features তুলনা করুন
          </h2>
        </ScrollReveal>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-3 text-white/60 font-medium">Feature</th>
                <th className="text-center py-4 px-3 text-white font-medium">Free</th>
                <th className="text-center py-4 px-3 text-white font-medium bg-[#006A4E]/20 rounded-t-xl">
                  Starter ⭐
                </th>
                <th className="text-center py-4 px-3 text-white font-medium">Premium</th>
                <th className="text-center py-4 px-3 text-white font-medium">Business</th>
              </tr>
            </thead>
            <tbody>
              {visibleFeatures.map((feature, i) => (
                <motion.tr 
                  key={feature.name}
                  className="border-b border-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="py-4 px-3 text-white/70">{feature.name}</td>
                  <td className="text-center py-4 px-3 text-white/60">{feature.free}</td>
                  <td className="text-center py-4 px-3 text-white font-medium bg-[#006A4E]/10">
                    {feature.starter}
                  </td>
                  <td className="text-center py-4 px-3 text-white/80">{feature.premium}</td>
                  <td className="text-center py-4 px-3 text-[#8B5CF6]">{feature.business}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {comparisonFeatures.length > 5 && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mx-auto mt-6 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <>কম দেখুন <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>সব দেখুন <ChevronDown className="w-4 h-4" /></>
            )}
          </motion.button>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// FAQ SECTION
// ============================================================================
const FAQItem = ({ item, index }: { item: typeof faqItems[0]; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-white/10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-white font-medium group-hover:text-[#006A4E] transition-colors">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/50" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-white/60 leading-relaxed">
          {item.answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

const FAQSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-full mb-6">
              <HelpCircle className="w-4 h-4 text-[#F9A825]" />
              <span className="text-[#F9A825] text-sm">সাধারণ প্রশ্ন</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              যা জানতে চান
            </h2>
          </div>
        </ScrollReveal>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
          {faqItems.map((item, index) => (
            <FAQItem key={index} item={item} index={index} />
          ))}
        </div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-white/50 mb-4">আরো প্রশ্ন আছে?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-[#006A4E] hover:text-[#00875F] font-medium transition-colors"
          >
            আমাদের সাথে কথা বলুন
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// SAVINGS HIGHLIGHT
// ============================================================================
const SavingsHighlight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const duration = 2000;
    const targetSavings = 3001;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setSavings(Math.floor(targetSavings * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      className="max-w-2xl mx-auto mt-16 mb-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9A825]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl">💰</span>
            <h3 className="text-xl font-bold text-white">
              দেখুন কত Save করছেন
            </h3>
          </div>

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
                <span className="text-white font-medium">আমাদের Premium</span>
                <span className="text-[#006A4E] font-bold">৳১,৯৯৯/মাস</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#006A4E] to-[#00875F] rounded-full"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '40%' } : { width: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </div>

          <motion.div
            className="mt-6 p-4 bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-2xl flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div>
              <span className="text-white/60 text-sm block">আপনার Savings:</span>
              <span className="text-2xl font-black text-white">
                ৳{savings.toLocaleString('bn-BD')}+/মাস
              </span>
            </div>
            <motion.div
              className="px-4 py-2 bg-[#F9A825] rounded-xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-black font-bold text-lg">৬০% কম!</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN PRICING PAGE
// ============================================================================
export default function PricingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Custom CSS */}
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

      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white hidden sm:block">
                Multi-Store
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/tutorials" 
                className="hidden md:block text-white/60 hover:text-[#00875F] font-medium text-sm px-3 py-2 transition"
              >
                টিউটোরিয়াল
              </Link>
              <Link 
                to="/auth/login" 
                className="hidden sm:block text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
              >
                লগইন
              </Link>
              <MagneticButton>
                <Link 
                  to="/auth/register" 
                  className="hidden sm:inline-block px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
                >
                  ফ্রি শুরু করুন
                </Link>
              </MagneticButton>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex flex-col gap-2">
                <Link 
                  to="/tutorials" 
                  className="text-white/70 hover:text-[#00875F] font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  টিউটোরিয়াল
                </Link>
                <Link 
                  to="/auth/login" 
                  className="text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  লগইন
                </Link>
                <Link 
                  to="/auth/register" 
                  className="px-4 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-semibold rounded-xl text-sm text-center shadow-lg shadow-[#006A4E]/25"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ফ্রি শুরু করুন
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-12 px-4 text-center">
          <ScrollReveal>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{ 
                backgroundColor: `${COLORS.primary}10`,
                borderColor: `${COLORS.primary}30`,
              }}
            >
              <Sparkles className="w-4 h-4 text-[#F9A825]" />
              <span className="text-[#F9A825] text-sm">সাশ্রয়ী মূল্য</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              সবার জন্য{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                }}
              >
                সাশ্রয়ী
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Shopify তে যা মাসে ৫০০০+ টাকা, এখানে Premium মাত্র ৳১,৯৯৯ — সব Features সহ
            </p>
          </ScrollReveal>
        </section>

        {/* Pricing Cards */}
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={plan.id} plan={plan} index={index} />
              ))}
            </div>

            {/* Business Plan */}
            <BusinessPlanCard />

            {/* Savings Calculator */}
            <SavingsHighlight />

            {/* Terms note */}
            <motion.p
              className="text-center text-white/30 text-sm mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              * সব Plan এ{' '}
              <Link to="/policies/fair-usage" className="underline hover:text-white/50 transition">
                Fair Usage Policy
              </Link>{' '}
              প্রযোজ্য
            </motion.p>
          </div>
        </section>

        {/* Comparison Table */}
        <ComparisonTable />

        {/* FAQ */}
        <FAQSection />

        {/* Final CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              আজই শুরু করুন — Free!
            </h2>
            <p className="text-white/50 mb-8">
              কোনো Credit Card লাগবে না। যেকোনো সময় Upgrade করতে পারবেন।
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#006A4E]/30 hover:shadow-[#006A4E]/50 transition-all"
              >
                ফ্রি শুরু করুন
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Multi-Store</span>
              </div>
              <p className="text-sm text-white/50">বাংলাদেশি মার্চেন্টদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম।</p>
            </div>
            
            {/* Product Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">প্রোডাক্ট</h4>
              <ul className="space-y-2">
                <li><Link to="/#features" className="text-white/50 hover:text-[#00875F] transition text-sm">ফিচার</Link></li>
                <li><Link to="/pricing" className="text-white/50 hover:text-[#00875F] transition text-sm">প্রাইসিং</Link></li>
                <li><Link to="/tutorials" className="text-white/50 hover:text-[#00875F] transition text-sm">টিউটোরিয়াল</Link></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">কোম্পানি</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-white/50 hover:text-[#00875F] transition text-sm">সম্পর্কে</Link></li>
                <li><Link to="/contact" className="text-white/50 hover:text-[#00875F] transition text-sm">যোগাযোগ</Link></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">আইনি</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-white/50 hover:text-[#00875F] transition text-sm">গোপনীয়তা</Link></li>
                <li><Link to="/terms" className="text-white/50 hover:text-[#00875F] transition text-sm">শর্তাবলী</Link></li>
                <li><Link to="/refund" className="text-white/50 hover:text-[#00875F] transition text-sm">রিফান্ড নীতি</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#006A4E]/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">© ২০২৬ মাল্টি-স্টোর। বাংলাদেশে ❤️ দিয়ে তৈরি।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
