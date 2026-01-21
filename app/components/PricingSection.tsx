/**
 * Pricing Section - "Value Based Pricing"
 * 
 * Highlights the massive value provided vs the low cost.
 */

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Link } from '@remix-run/react';
import { Check, Star, Sparkles, Crown } from 'lucide-react';
import { ScrollReveal } from '~/components/animations';


// ============================================================================
// VALUE STACK COMPONENT (The Core of Value-Based Pricing)
// ============================================================================
const ValueStack = ({ items, totalValue }: { items: { name: string; value: number }[], totalValue: number }) => {
  return (
    <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
      <div className="absolute top-0 right-0 px-3 py-1 bg-white/10 rounded-bl-xl text-[10px] text-white/50 font-mono">
        MARKET VALUE
      </div>
      
      <div className="space-y-2 mb-4 mt-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-white/20" /> {item.name}
            </span>
            <span className="font-mono text-white/40 decoration-white/20">৳{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/10 flex justify-between items-end">
        <div className="text-xs text-red-400 font-medium">Total Market Value</div>
        <div className="text-lg font-bold text-white/50 line-through decoration-red-500/50 decoration-2">
          ৳{totalValue.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PRICING DATA
// ============================================================================
interface PricingPlan {
  name: string;
  nameBn: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  marketValueItems: { name: string; value: number }[];
  marketTotal: number;
  cta: string;
  isPopular?: boolean;
  isUltimate?: boolean;
  bonus?: string;
  savings?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    nameBn: 'শুরু করুন',
    price: 0,
    priceDisplay: '৳০',
    description: 'ব্যবসা শেখার জন্য',
    marketValueItems: [
      { name: 'Store Platform', value: 5000 },
      { name: 'Community Support', value: 2000 },
    ],
    marketTotal: 7000,
    features: [
      '৫টি Product',
      '৫০টি Orders/মাস',
      'ফ্রি সাব-ডোমেইন',
      'Limited Features',
    ],
    cta: 'ফ্রি-তে শুরু করুন',
    isPopular: false,
    savings: '১০০%',
  },
  {
    name: 'Starter',
    nameBn: 'নতুনদের জন্য সেরা',
    price: 499,
    priceDisplay: '৳৪৯৯',
    description: 'ছোট ব্যবসার জন্য পারফেক্ট',
    marketValueItems: [
      { name: 'E-commerce Website', value: 25000 },
      { name: 'Hosting & Domain', value: 5000 },
      { name: 'Inventory System', value: 8000 },
    ],
    marketTotal: 38000,
    features: [
      '৫০টি Product',
      'নিজস্ব ডোমেইন কানেকশন',
      '৫০০ Sales/মাস',
      'বেসিক রিপোর্ট',
    ],
    cta: 'শুরু করুন',
    isPopular: false,
    savings: '৯৮%',
  },
  {
    name: 'Growth',
    nameBn: 'সবচেয়ে জনপ্রিয়',
    price: 999,
    priceDisplay: '৳৯৯৯',
    description: 'সিরিয়াস ব্যবসার জন্য',
    marketValueItems: [
      { name: 'Professional Store', value: 35000 },
      { name: 'Marketing Suite', value: 15000 },
      { name: 'Advanced Analytics', value: 10000 },
      { name: 'Priority Support', value: 5000 },
    ],
    marketTotal: 65000,
    features: [
      '৫০০টি Product',
      'Unlimited Landing Pages',
      '২০০০ Sales/মাস',
      'Facebook Pixel & API',
      'SMS & WhatsApp মডিউল',
    ],
    cta: 'Upgrade করুন',
    isPopular: true,
    savings: '৯৯%',
  },
  {
    name: 'Ultimate',
    nameBn: 'সীমাহীন',
    price: 1999,
    priceDisplay: '৳১,৯৯৯',
    description: 'বড় ব্র্যান্ডের জন্য',
    marketValueItems: [
      { name: 'Enterprise Store', value: 50000 },
      { name: 'Dedicated Manager', value: 20000 },
      { name: 'Custom Features', value: 30000 },
      { name: 'Full Automation', value: 15000 },
    ],
    marketTotal: 115000,
    features: [
      'Unlimited Products*',
      'Unlimited Sales*',
      'Staff Accounts (5)',
      'Couriers API Integration',
      'Advanced Reporting',
    ],
    cta: 'যোগাযোগ',
    isUltimate: true,
    bonus: '🎁 BONUS: আমরা আপনার ফুল স্টোর সেটআপ করে দেবো (Value: ৳৫০০০)',
    savings: '৯৯%',
  },
];

const PricingCard = ({ plan, index }: { plan: PricingPlan; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative h-full ${plan.isPopular ? 'md:-mt-8 md:mb-8 z-10' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Popular Glow */}
      {plan.isPopular && (
        <div 
          className="absolute -inset-[2px] rounded-[32px] opacity-80"
          style={{
            background: 'linear-gradient(90deg, #F9A825, #006A4E, #F9A825)',
            backgroundSize: '200% 100%',
            animation: 'gradientBorder 3s linear infinite',
          }}
        />
      )}
      
      <motion.div
        className={`relative h-full rounded-3xl p-6 md:p-8 flex flex-col ${
          plan.isPopular 
            ? 'bg-[#00281F] text-white shadow-2xl' 
            : plan.isUltimate
              ? 'bg-[#0F1419] border border-white/10'
              : 'bg-[#0F1419] border border-white/10'
        }`}
      >
        {/* Popular Badge */}
        {plan.isPopular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#F9A825] text-black font-extrabold text-sm px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" /> BEST VALUE
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
          <p className="text-white/50 text-sm">{plan.nameBn}</p>
        </div>

        {/* --- VALUE STACK --- */}
        <ValueStack items={plan.marketValueItems} totalValue={plan.marketTotal} />

        {/* ACTUAL PRICE */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-8 -rotate-12 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm hidden md:block">
            SAVE {plan.savings}
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm text-white/40 mb-auto mt-2">মাত্র</span>
            <span className={`text-6xl font-black tracking-tight ${plan.isPopular ? 'text-[#00DDA2]' : 'text-white'}`}>
              {plan.priceDisplay}
            </span>
          </div>
          <span className="text-white/40 text-sm">প্রতি মাসে</span>
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-8 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
              <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.isPopular ? 'bg-[#00DDA2] text-black' : 'bg-white/10 text-white'}`}>
                <Check className="w-2.5 h-2.5" />
              </div>
              {feature}
            </li>
          ))}
        </ul>

        {/* Bonus */}
        {plan.bonus && (
          <div className="mb-6 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
            {plan.bonus}
          </div>
        )}

        {/* CTA */}
        <Link
          to={plan.isUltimate ? '/contact' : '/auth/register'}
          className={`block w-full py-4 text-center font-bold rounded-xl transition-all ${
            plan.isPopular
              ? 'bg-[#00DDA2] text-black hover:bg-[#00BF8D] hover:shadow-lg hover:shadow-[#00DDA2]/20'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {plan.cta}
        </Link>

      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN SECTION
// ============================================================================
export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#050807]">
      <style>{`
        @keyframes gradientBorder {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#006A4E]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#006A4E]/10 border border-[#006A4E]/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#00DDA2]" />
              <span className="text-sm font-medium text-[#00DDA2]">UNBEATABLE VALUE</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              লাখো টাকার ফিচার,<br />
              <span className="text-[#00DDA2]">নামমাত্র মূল্যে</span>
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto">
              আমরা আপনাকে দিচ্ছি এন্টারপ্রাইজ লেভেলের সব টুলস, যা আলাদাভাবে কিনতে গেলে খরচ হতো মাসে ৫০,০০০ টাকার বেশি।
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {pricingPlans.map((plan, i) => (
            <PricingCard key={i} plan={plan} index={i} />
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
               <Crown className="w-5 h-5 text-yellow-500" />
             </div>
             <div className="text-left">
               <div className="text-white font-bold text-sm">১৪ দিনের মানি-ব্যাক গ্যারান্টি</div>
               <div className="text-white/40 text-xs">পছন্দ না হলে কোনো প্রশ্ন ছাড়াই টাকা ফেরত</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
