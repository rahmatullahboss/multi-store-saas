/**
 * UI/UX Pro Max - Pricing Section
 * 
 * Implements "Value-Based Pricing" model with Liquid Glass aesthetics.
 * Visualizes the massive value provided vs the low cost.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Check, Sparkles, Zap, Shield, Rocket, 
  CreditCard, Globe, BarChart3, MessageSquare, 
  ArrowRight, Layout
} from 'lucide-react';
import { useLanguage, useFormatPrice } from '~/contexts/LanguageContext';

// ============================================================================
// MARKET VALUE STACK
// ============================================================================
const ValueItem = ({ 
  icon: Icon, 
  title, 
  value, 
  color,
  delay 
}: { 
  icon: React.ElementType, 
  title: string, 
  value: string, 
  color: string,
  delay: number 
}) => {
  const { lang } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center justify-between p-4 rounded-xl mb-3 border backdrop-blur-md relative overflow-hidden group"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Hover Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}10, transparent)` }} 
      />

      <div className="flex items-center gap-4 relative z-10">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/5"
          style={{ color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-white/90 text-sm md:text-base">{title}</h4>
          <div className="text-xs text-white/40">
            {lang === 'bn' ? 'মার্কেট স্ট্যান্ডার্ড' : 'Market Standard'}
          </div>
        </div>
      </div>
      
      <div className="text-right relative z-10">
        <div className="font-bold text-white/90 font-mono">{value}</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">
          {lang === 'bn' ? 'প্রতি মাস' : 'Per Month'}
        </div>
      </div>
    </motion.div>
  );
};

interface PlanPrice {
  monthly: number;
  annual: number;
}

interface Plan {
  name: string;
  description: string;
  price: PlanPrice;
  features: string[];
  cta: string;
  popular: boolean;
}

// ============================================================================
// PRICING CARD
// ============================================================================
const PricingCard = ({ 
  plan, 
  isAnnual 
}: { 
  plan: Plan, 
  isAnnual: boolean 
}) => {
  const { lang } = useLanguage();
  const formatPrice = useFormatPrice();
  const isPopular = plan.popular;
  const price = isAnnual ? plan.price.annual : plan.price.monthly;
  
  // Format price display
  const displayPrice = price === 0 
    ? (lang === 'bn' ? 'ফ্রি' : 'Free')
    : formatPrice(price).replace('.00', '');

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`relative p-8 rounded-[32px] border h-full flex flex-col ${
        isPopular 
          ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-emerald-500/50 shadow-2xl shadow-emerald-900/20' 
          : 'bg-[#0A0A12]/80 border-white/10'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20">
          <Sparkles className="w-3 h-3 text-black" />
          {lang === 'bn' ? 'জনপ্রিয়' : 'Best Value'}
        </div>
      )}

      {/* Glow Effect for Popular Plan */}
      {isPopular && (
        <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 mix-blend-overlay" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h3 className={`text-xl font-bold mb-2 ${isPopular ? 'text-emerald-400' : 'text-white'}`}>
          {plan.name}
        </h3>
        <p className="text-sm text-white/50 min-h-[40px]">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-8 relative z-10">
        <div className="flex items-end gap-1">
          <span className={`text-4xl md:text-5xl font-bold text-white ${lang === 'bn' ? 'font-bengali' : ''}`}>
            {displayPrice}
          </span>
          <span className="text-white/40 mb-1">/{lang === 'bn' ? 'মাস' : 'month'}</span>
        </div>
        {isAnnual && (
          <div className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {lang === 'bn' ? 'বার্ষিক প্ল্যানে ২০% ছাড়' : 'Save 20% with annual billing'}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8 flex-1 relative z-10">
        {plan.features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3 text-sm text-white/80">
            <div className={`mt-1 p-0.5 rounded-full ${isPopular ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
              <Check className={`w-3 h-3 ${isPopular ? 'text-emerald-400' : 'text-white/70'}`} />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button 
        className={`w-full py-4 rounded-2xl font-bold text-sm transition-all relative z-10 group overflow-hidden ${
          isPopular 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg hover:shadow-emerald-500/25' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {plan.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        {isPopular && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </button>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function PricingSection() {
  const { lang } = useLanguage();
  const formatPrice = useFormatPrice();
  const [isAnnual, setIsAnnual] = useState(false);

  const TEXT = {
    en: {
      marketCost: 'Market Cost',
      marketSub: 'If you bought these tools separately...',
      monthlyCost: 'Monthly Cost',
      brandSub: 'All-in-One Platform',
      startPrice: 'Free',
      startSub: 'To Start',
      save97: '97% Cheaper than market',
      noSkill: 'No technical skills needed',
      monthly: 'Monthly',
      annual: 'Annual',
      save20: '-20%',
      guarantee: '14-Day Money Back Guarantee — No questions asked',
      headerTag: 'Unbeatable Value',
      headerTitle: 'Simple Pricing,',
      headerHighlight: 'Massive ROI',
      headerDesc: "We've bundled everything you need to succeed. No hidden fees.",
      marketTotal: '62,000+'
    },
    bn: {
      marketCost: 'মার্কেট কস্ট',
      marketSub: 'যদি আপনি এই টুলগুলো আলাদা আলাদা কিনতেন...',
      monthlyCost: 'মাসিক খরচ',
      brandSub: 'অল-ইন-ওয়ান প্ল্যাটফর্ম',
      startPrice: 'ফ্রি',
      startSub: 'দিয়ে শুরু করুন',
      save97: 'মার্কেট থেকে ৯৭% সাশ্রয়ী',
      noSkill: 'কোনো টেকনিক্যাল নলেজ লাগবে না',
      monthly: 'মাসিক',
      annual: 'বাৎসরিক',
      save20: '-২০%',
      guarantee: '১৪ দিনের মানিব্যাক গ্যারান্টি — কোনো প্রশ্ন করা হবে না',
      headerTag: 'অবিশ্বাস্য ভ্যালু',
      headerTitle: 'সহজ প্রাইসিং,',
      headerHighlight: 'সেরা রিটার্ন',
      headerDesc: 'সাফল্যের জন্য প্রয়োজনীয় সবকিছু পাচ্ছেন এক প্যাকেজে। কোনো গোপন চার্জ নেই।',
      marketTotal: '৬২,০০০+'
    }
  }[lang === 'bn' ? 'bn' : 'en'];

  const marketValues = lang === 'bn' ? [
    { title: 'প্রিমিয়াম ই-কমার্স ওয়েবসাইট', value: '৳৫০,০০০+', icon: Globe, color: '#3B82F6' },
    { title: 'ল্যান্ডিং পেজ বিল্ডার', value: '৳৫,০০০', icon: Layout, color: '#A855F7' },
    { title: 'হোস্টিং এবং সার্ভার', value: '৳২,০০০', icon: CreditCard, color: '#F97316' },
    { title: 'ইনভেন্টরি ম্যানেজমেন্ট', value: '৳৩,০০০', icon: BarChart3, color: '#10B981' },
    { title: 'মার্কেটিং টুলস (SMS/Email)', value: '৳২,০০০', icon: MessageSquare, color: '#EF4444' }
  ] : [
    { title: 'Premium E-commerce Website', value: '৳50,000+', icon: Globe, color: '#3B82F6' },
    { title: 'Landing Page Builder', value: '৳5,000', icon: Layout, color: '#A855F7' },
    { title: 'Hosting & Server', value: '৳2,000', icon: CreditCard, color: '#F97316' },
    { title: 'Inventory Management', value: '৳3,000', icon: BarChart3, color: '#10B981' },
    { title: 'Marketing Tools (SMS/Email)', value: '৳2,000', icon: MessageSquare, color: '#EF4444' }
  ];

  const plans = [
    {
      name: lang === 'bn' ? 'ফ্রি স্টার্টার' : 'Free Starter',
      description: lang === 'bn' ? 'ব্যবসা শুরু করার জন্য পারফেক্ট।' : 'Perfect for testing the waters.',
      price: { monthly: 0, annual: 0 },
      features: lang === 'bn' ? [
        '৫টি প্রোডাক্ট লিমিট',
        '৫০টি অর্ডার লিমিট',
        'বেসিক স্টোর থিম',
        'স্ট্যান্ডার্ড সাপোর্ট'
      ] : [
        '5 Products Limit',
        '50 Orders Limit',
        'Basic Store Theme',
        'Standard Support'
      ],
      cta: lang === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Start for Free',
      popular: false
    },
    {
      name: lang === 'bn' ? 'স্টার্টার' : 'Starter',
      description: lang === 'bn' ? 'লঞ্চ করার জন্য যা যা প্রয়োজন।' : 'Everything you need to launch.',
      price: { monthly: 999, annual: 799 },
      features: lang === 'bn' ? [
        '৫০টি প্রোডাক্ট',
        'আনলিমিটেড অর্ডার',
        '৩টি প্রিমিয়াম থিম',
        'কাস্টম ডোমেইন',
        'স্ট্যান্ডার্ড অ্যানালিটিক্স'
      ] : [
        '50 Products',
        'Unlimited Orders',
        '3 Premium Themes',
        'Custom Domain',
        'Standard Analytics'
      ],
      cta: lang === 'bn' ? 'স্টার্টার প্ল্যান নিন' : 'Get Starter',
      popular: false
    },
    {
      name: lang === 'bn' ? 'প্রিমিয়াম' : 'Premium',
      description: lang === 'bn' ? 'গ্রোইং ব্যবসার জন্য সেরা পছন্দ।' : 'Best for growing businesses.',
      price: { monthly: 1500, annual: 1200 },
      features: lang === 'bn' ? [
        'আনলিমিটেড প্রোডাক্ট',
        'আনলিমিটেড অর্ডার',
        'সব প্রিমিয়াম থিম',
        'মার্কেটিং অটোমেশন',
        'প্রায়োরিটি সাপোর্ট'
      ] : [
        'Unlimited Products',
        'Unlimited Orders',
        'All Premium Themes',
        'Marketing Automation',
        'Priority Support'
      ],
      cta: lang === 'bn' ? 'প্রিমিয়াম প্ল্যান নিন' : 'Get Premium',
      popular: true
    },
    {
      name: lang === 'bn' ? 'বিজনেস' : 'Business',
      description: lang === 'bn' ? 'বড় টিম এবং ভলিউম সেলারদের জন্য।' : 'For high-volume sellers & teams.',
      price: { monthly: 3000, annual: 2400 },
      features: lang === 'bn' ? [
        'সব প্রিমিয়াম ফিচার',
        'টিম মেম্বার একাউন্ট',
        'অ্যাডভান্সড অ্যানালিটিক্স',
        'ডেডিকেটেড ম্যানেজার',
        'API এক্সেস'
      ] : [
        'Everything in Premium',
        'Team Member Accounts',
        'Advanced Analytics',
        'Dedicated Manager',
        'API Access'
      ],
      cta: lang === 'bn' ? 'বিজনেস প্ল্যান নিন' : 'Get Business',
      popular: false
    }
  ];

  return (
    <section className="py-24 px-4 bg-[#0A0A12] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#0A0A12]">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">{TEXT.headerTag}</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-3xl md:text-5xl font-bold text-white mb-6 ${lang === 'bn' ? 'font-bengali' : ''}`}
          >
            {TEXT.headerTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{TEXT.headerHighlight}</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-lg"
          >
            {TEXT.headerDesc}
          </motion.p>
        </div>

        {/* Value Comparison / Value Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24 items-center">
          
          {/* Left: The PROBLEM (High Cost Elsewhere) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-red-500/20 rounded-full hidden md:block" />
            
            <div className="mb-8 pl-0 md:pl-6">
              <h3 className="text-2xl font-bold text-white mb-2">{TEXT.marketCost}</h3>
              <p className="text-white/50 text-sm">{TEXT.marketSub}</p>
            </div>

            <div className="space-y-4 relative">
              {marketValues.map((item, idx) => (
                <ValueItem key={idx} {...item} delay={idx * 0.1} />
              ))}
              
              {/* Total Line */}
              <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-end pl-4 pr-4">
                <div className="text-white/50 font-medium">{TEXT.monthlyCost}</div>
                <div className="text-3xl font-bold text-red-400 line-through decoration-red-400/50">৳{TEXT.marketTotal}</div>
              </div>
            </div>
          </motion.div>

          {/* Right: The SOLUTION (Our Offer) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-[40px] border border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 backdrop-blur-md overflow-hidden"
          >
            {/* Background Beams */}
            <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 blur-[100px]" />

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-8 transform rotate-3">
                 <Rocket className="w-10 h-10 text-black" />
              </div>

              <img src="/ozzyl-logo.png" alt="Ozil" className="h-10 mx-auto mb-4" />
              <p className="text-emerald-300 font-medium mb-8">{TEXT.brandSub}</p>

              <div className={`text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 mb-4 tracking-tight ${lang === 'bn' ? 'font-bengali' : ''}`}>
                {TEXT.startPrice}
              </div>
              <p className="text-white/50 uppercase tracking-widest text-xs font-bold mb-10">{TEXT.startSub}</p>

              <div className="inline-flex flex-col gap-2 w-full max-w-sm">
                <div className="flex items-center gap-3 text-white/80 bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium">{TEXT.save97}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80 bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium">{TEXT.noSkill}</span>
                </div>
              </div>
            </div>
          </motion.div>
        
        </div>

        {/* Toggle (Monthly / Annual) */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/5 p-1 rounded-xl flex items-center relative border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 ${!isAnnual ? 'text-black bg-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              {TEXT.monthly}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 flex items-center gap-2 ${isAnnual ? 'text-black bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'text-white/60 hover:text-white'}`}
            >
              {TEXT.annual}
              <span className={`text-[10px] items-center px-1.5 py-0.5 rounded-full font-bold ${isAnnual ? 'bg-black/20 text-black' : 'bg-emerald-500 text-black'}`}>
                {TEXT.save20}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-4">
          {plans.map((plan, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 * idx }}
               className="h-full"
             >
               <PricingCard plan={plan} isAnnual={isAnnual} />
             </motion.div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="mt-20 max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-100">
              {TEXT.guarantee}
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default PricingSection;
