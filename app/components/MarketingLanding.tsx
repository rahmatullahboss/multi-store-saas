/**
 * SaaS Marketing Landing Page - AWARD-WINNING PREMIUM DESIGN
 * 
 * Features:
 * - DARK MODE Option with Purple/Blue gradients (Stripe/Linear inspired)
 * - EMERALD/TEAL GREEN light mode (supercharged)
 * - Morphing gradient blobs with parallax
 * - Framer Motion scroll animations
 * - 3D card effects and micro-interactions
 * - Animated counters and text reveals
 * - Premium glassmorphism effects
 * - Magnetic buttons and hover states
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Store, Zap, BarChart3, Globe, Check, ArrowRight, Star, Users, ShoppingBag, TrendingUp, Sparkles, Rocket, MessageCircle, ChevronRight, Play, Package, Truck, Smartphone, ChevronDown, Moon, Sun } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { AnimatedCounter, ScrollReveal, StaggerContainer, StaggerItem, FloatingOrbs, TiltCard, MagneticButton, ShimmerText } from '~/components/animations';
import { AwardWinningHero } from '~/components/AwardWinningHero';
import { ProblemSolutionSection } from '~/components/ProblemSolutionSection';
import { BentoFeaturesSection } from '~/components/BentoFeaturesSection';
import { InfrastructureSection } from '~/components/InfrastructureSection';
import { CloudflareBenefitsCards } from '~/components/CloudflareBenefitsCards';
import { SpeedComparison } from '~/components/SpeedComparison';
import { TechnicalSpecs } from '~/components/TechnicalSpecs';
import { CDNExplainer } from '~/components/CDNExplainer';
import { SpeedImpact } from '~/components/SpeedImpact';
import { LiveDashboard } from '~/components/LiveDashboard';
import { InfrastructureCTA } from '~/components/InfrastructureCTA';
import { TrustSection } from '~/components/TrustSection';
import { ComparisonSection } from '~/components/ComparisonSection';
import { InteractiveStoreDemo } from '~/components/InteractiveStoreDemo';


// Marketing page specific translations - Multi-Store SaaS specific content
const marketingContent = {
  en: {
    badge: 'Trusted by 500+ Merchants in Bangladesh',
    heroTitle1: 'Your Complete',
    heroTitle2: 'E-commerce Solution',
    heroSubtitle: 'Create your professional online store in minutes. Accept bKash, Nagad & Cash on Delivery. Manage orders, track inventory, and grow your business - all in one platform.',
    getStarted: 'Create Free Store',
    talkExpert: 'Watch Demo',
    noCreditCard: 'No credit card required • Free forever plan available',
    login: 'Login',
    register: 'Register',
    
    // Stats
    statsStores: 'Active Stores',
    statsOrders: 'Orders Processed',
    statsMerchants: 'Happy Merchants',
    statsUptime: 'Uptime',
    
    // Features Section
    featuresTitle: 'Everything You Need to Sell Online',
    featuresSubtitle: 'Powerful features designed for Bangladeshi e-commerce',
    
    // Pricing
    pricingTitle: 'Simple, Honest Pricing',
    pricingSubtitle: 'Start free, upgrade as you grow',
    perMonth: '/month',
    mostPopular: 'Most Popular',
    getStartedCta: 'Get Started',
    
    // How it works
    howTitle: 'Launch Your Store in 3 Steps',
    howSubtitle: 'From signup to first sale in under 10 minutes',
    step1: 'Create Account',
    step1Desc: 'Sign up with email & choose your subdomain (yourstore.digitalcare.site)',
    step2: 'Add Products',
    step2Desc: 'Upload product photos, set prices in BDT, and write descriptions.',
    step3: 'Start Selling',
    step3Desc: 'Share your store link on Facebook, accept orders via bKash/COD.',
    
    // Testimonials
    testimonialsTitle: 'Merchants Love Us',
    testimonialsSubtitle: 'Real stories from successful store owners',
    
    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know',
    
    // CTA
    ctaTitle: 'Start Selling Today',
    ctaSubtitle: 'Join 500+ merchants already growing their business with Multi-Store',
    ctaButton: 'Create Your Free Store',
    
    features: [
      { title: 'Your Own Store URL', description: 'Get yourstore.digitalcare.site instantly. Premium users can connect their own domain.', icon: 'globe' },
      { title: 'bKash & Nagad Ready', description: 'Accept mobile payments from millions of Bangladeshi customers. Also supports Cash on Delivery.', icon: 'smartphone' },
      { title: 'Order Management', description: 'Track all orders in one dashboard. Update status, print invoices, manage COD collections.', icon: 'package' },
      { title: 'Inventory Tracking', description: 'Never oversell. Automatic stock updates, low stock alerts, and SKU management.', icon: 'chart' },
      { title: 'Landing Page Mode', description: 'Perfect for single product sellers. High-converting sales page with order form built-in.', icon: 'zap' },
      { title: 'Courier Integration', description: 'Connect with Pathao, Steadfast & RedX. Auto-create shipments and track deliveries.', icon: 'truck' },
    ],
    
    plans: [
      { name: 'Free', price: '0', description: 'Perfect for testing', features: ['1 Product', '50 Orders/month', 'Landing Page Mode', 'Cash on Delivery', 'Basic Analytics'], cta: 'Start Free', highlight: false },
      { name: 'Starter', price: '500', description: 'For growing sellers', features: ['50 Products', '500 Orders/month', 'Full Store Mode', 'bKash + Nagad + COD', 'Inventory Tracking', 'Email Notifications'], cta: 'Get Started', highlight: true },
      { name: 'Premium', price: '2,000', description: 'For serious businesses', features: ['Unlimited Products', 'Unlimited Orders', 'Custom Domain', 'Priority Support', 'Team Members (3)', 'Courier Integration'], cta: 'Go Premium', highlight: false },
    ],
    
    testimonials: [
      { name: 'Rahim Ahmed', role: 'Fashion Store, Dhaka', text: 'Started with Free plan, now doing 200+ orders monthly on Starter. Best platform for Bangladeshi sellers!', avatar: 'RA' },
      { name: 'Fatima Khan', role: 'Cosmetics, Chittagong', text: 'bKash integration is seamless. My customers love ordering via mobile. Revenue up 150% in 2 months.', avatar: 'FK' },
      { name: 'Karim Hossain', role: 'Electronics, Sylhet', text: 'The landing page mode is perfect for my gadget business. Easy COD orders, great dashboard!', avatar: 'KH' },
    ],
    
    faqs: [
      { q: 'Is the Free plan really free forever?', a: 'Yes! You can list 1 product and process 50 orders/month at zero cost. No hidden fees, no credit card required.' },
      { q: 'Which payment methods are supported?', a: 'We support bKash, Nagad, bank cards via Stripe, and Cash on Delivery. All built-in, no extra setup.' },
      { q: 'Can I use my own domain?', a: 'Yes! Premium plan users can connect custom domains. Free/Starter get a yourstore.digitalcare.site subdomain.' },
      { q: 'How do I receive my payments?', a: 'bKash/Nagad payments go directly to your account. For COD, you collect from customers. We never hold your money.' },
    ],
    
    // Footer
    footerAbout: 'The complete e-commerce platform for Bangladeshi merchants. Create, sell, and grow.',
    footerProduct: 'Product',
    productLinks: ['Features', 'Pricing', 'Templates', 'Integrations'],
    footerCompany: 'Company',
    companyLinks: ['About', 'Blog', 'Careers', 'Contact'],
    footerLegal: 'Legal',
    legalLinks: ['Privacy', 'Terms', 'Refund Policy'],
    copyright: '© 2026 Multi-Store. Made with ❤️ in Bangladesh.',
  },
  bn: {
    badge: 'বাংলাদেশে ৫০০+ মার্চেন্টের বিশ্বাস',
    heroTitle1: 'আপনার সম্পূর্ণ',
    heroTitle2: 'ই-কমার্স সলিউশন',
    heroSubtitle: 'মিনিটে আপনার প্রফেশনাল অনলাইন স্টোর তৈরি করুন। বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি নিন। অর্ডার ম্যানেজ করুন, ইনভেন্টরি ট্র্যাক করুন - সব এক প্ল্যাটফর্মে।',
    getStarted: 'ফ্রি স্টোর তৈরি করুন',
    talkExpert: 'ডেমো দেখুন',
    noCreditCard: 'কোনো ক্রেডিট কার্ড লাগবে না • চিরকালের জন্য ফ্রি প্ল্যান',
    login: 'লগইন',
    register: 'রেজিস্টার',
    
    statsStores: 'সক্রিয় স্টোর',
    statsOrders: 'প্রসেসড অর্ডার',
    statsMerchants: 'সন্তুষ্ট মার্চেন্ট',
    statsUptime: 'আপটাইম',
    
    featuresTitle: 'অনলাইনে বিক্রি করতে যা দরকার সব',
    featuresSubtitle: 'বাংলাদেশী ই-কমার্সের জন্য ডিজাইন করা শক্তিশালী ফিচার',
    
    pricingTitle: 'সহজ, সৎ মূল্য',
    pricingSubtitle: 'ফ্রি শুরু করুন, বাড়লে আপগ্রেড করুন',
    perMonth: '/মাস',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    getStartedCta: 'শুরু করুন',
    
    howTitle: '৩ ধাপে স্টোর চালু করুন',
    howSubtitle: 'সাইন আপ থেকে প্রথম বিক্রি ১০ মিনিটে',
    step1: 'অ্যাকাউন্ট তৈরি',
    step1Desc: 'ইমেইল দিয়ে সাইন আপ করুন ও সাবডোমেইন বাছুন (yourstore.digitalcare.site)',
    step2: 'প্রোডাক্ট যোগ',
    step2Desc: 'প্রোডাক্টের ছবি আপলোড করুন, BDT-তে দাম সেট করুন, বিবরণ লিখুন।',
    step3: 'বিক্রি শুরু',
    step3Desc: 'ফেসবুকে স্টোর লিংক শেয়ার করুন, বিকাশ/COD-তে অর্ডার নিন।',
    
    testimonialsTitle: 'মার্চেন্টদের ভালোবাসা',
    testimonialsSubtitle: 'সফল স্টোর মালিকদের সত্যিকারের গল্প',
    
    faqTitle: 'সাধারণ জিজ্ঞাসা',
    faqSubtitle: 'যা জানা দরকার সব',
    
    ctaTitle: 'আজই বিক্রি শুরু করুন',
    ctaSubtitle: '৫০০+ মার্চেন্ট ইতিমধ্যে Multi-Store দিয়ে ব্যবসা বাড়াচ্ছে',
    ctaButton: 'ফ্রি স্টোর তৈরি করুন',
    
    features: [
      { title: 'নিজের স্টোর URL', description: 'yourstore.digitalcare.site তাৎক্ষণিক পান। প্রিমিয়াম ইউজাররা নিজের ডোমেইন কানেক্ট করতে পারেন।', icon: 'globe' },
      { title: 'বিকাশ ও নগদ রেডি', description: 'কোটি বাংলাদেশী কাস্টমারের কাছ থেকে মোবাইল পেমেন্ট নিন। ক্যাশ অন ডেলিভারিও সাপোর্ট করে।', icon: 'smartphone' },
      { title: 'অর্ডার ম্যানেজমেন্ট', description: 'সব অর্ডার এক ড্যাশবোর্ডে ট্র্যাক করুন। স্ট্যাটাস আপডেট, ইনভয়েস প্রিন্ট, COD কালেকশন ম্যানেজ করুন।', icon: 'package' },
      { title: 'ইনভেন্টরি ট্র্যাকিং', description: 'কখনো ওভারসেল হবে না। অটো স্টক আপডেট, লো স্টক অ্যালার্ট এবং SKU ম্যানেজমেন্ট।', icon: 'chart' },
      { title: 'ল্যান্ডিং পেজ মোড', description: 'সিঙ্গেল প্রোডাক্ট সেলারদের জন্য পারফেক্ট। বিল্ট-ইন অর্ডার ফর্ম সহ হাই-কনভার্টিং সেলস পেজ।', icon: 'zap' },
      { title: 'কুরিয়ার ইন্টিগ্রেশন', description: 'পাঠাও, স্টেডফাস্ট ও রেডএক্স কানেক্ট করুন। অটো শিপমেন্ট তৈরি ও ডেলিভারি ট্র্যাক করুন।', icon: 'truck' },
    ],
    
    plans: [
      { name: 'ফ্রি', price: '০', description: 'টেস্টের জন্য পারফেক্ট', features: ['১টি প্রোডাক্ট', '৫০ অর্ডার/মাস', 'ল্যান্ডিং পেজ মোড', 'ক্যাশ অন ডেলিভারি', 'বেসিক অ্যানালিটিক্স'], cta: 'ফ্রি শুরু', highlight: false },
      { name: 'স্টার্টার', price: '৫০০', description: 'বাড়তে থাকা সেলারদের জন্য', features: ['৫০টি প্রোডাক্ট', '৫০০ অর্ডার/মাস', 'ফুল স্টোর মোড', 'বিকাশ + নগদ + COD', 'ইনভেন্টরি ট্র্যাকিং', 'ইমেইল নোটিফিকেশন'], cta: 'শুরু করুন', highlight: true },
      { name: 'প্রিমিয়াম', price: '২,০০০', description: 'সিরিয়াস ব্যবসার জন্য', features: ['আনলিমিটেড প্রোডাক্ট', 'আনলিমিটেড অর্ডার', 'কাস্টম ডোমেইন', 'প্রায়োরিটি সাপোর্ট', 'টিম মেম্বার (৩)', 'কুরিয়ার ইন্টিগ্রেশন'], cta: 'প্রিমিয়াম নিন', highlight: false },
    ],
    
    testimonials: [
      { name: 'রহিম আহমেদ', role: 'ফ্যাশন স্টোর, ঢাকা', text: 'ফ্রি প্ল্যান দিয়ে শুরু করেছিলাম, এখন স্টার্টারে মাসে ২০০+ অর্ডার। বাংলাদেশী সেলারদের জন্য সেরা প্ল্যাটফর্ম!', avatar: 'রআ' },
      { name: 'ফাতিমা খান', role: 'কসমেটিক্স, চট্টগ্রাম', text: 'বিকাশ ইন্টিগ্রেশন অসাধারণ। কাস্টমাররা মোবাইলে অর্ডার করতে পছন্দ করে। ২ মাসে রেভিনিউ ১৫০% বেড়েছে।', avatar: 'ফখ' },
      { name: 'করিম হোসেন', role: 'ইলেকট্রনিক্স, সিলেট', text: 'ল্যান্ডিং পেজ মোড আমার গ্যাজেট ব্যবসার জন্য পারফেক্ট। সহজ COD অর্ডার, দারুণ ড্যাশবোর্ড!', avatar: 'কহ' },
    ],
    
    faqs: [
      { q: 'ফ্রি প্ল্যান কি সত্যিই চিরকাল ফ্রি?', a: 'হ্যাঁ! আপনি ১টি প্রোডাক্ট লিস্ট করতে এবং মাসে ৫০টি অর্ডার প্রসেস করতে পারবেন একদম বিনামূল্যে। কোনো হিডেন ফি নেই।' },
      { q: 'কোন পেমেন্ট মেথড সাপোর্ট করে?', a: 'বিকাশ, নগদ, স্ট্রাইপ কার্ড এবং ক্যাশ অন ডেলিভারি সাপোর্ট করি। সব বিল্ট-ইন, আলাদা সেটআপ লাগে না।' },
      { q: 'নিজের ডোমেইন ব্যবহার করতে পারব?', a: 'হ্যাঁ! প্রিমিয়াম ইউজাররা কাস্টম ডোমেইন কানেক্ট করতে পারেন। ফ্রি/স্টার্টার ইউজাররা yourstore.digitalcare.site সাবডোমেইন পান।' },
      { q: 'পেমেন্ট কিভাবে পাব?', a: 'বিকাশ/নগদ পেমেন্ট সরাসরি আপনার অ্যাকাউন্টে যায়। COD-এর জন্য আপনি কাস্টমারের কাছ থেকে নেন। আমরা কখনো আপনার টাকা ধরে রাখি না।' },
    ],
    
    // Footer
    footerAbout: 'বাংলাদেশি মার্চেন্টদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। তৈরি করুন, বিক্রি করুন, বড় হন।',
    footerProduct: 'প্রোডাক্ট',
    productLinks: ['ফিচার', 'প্রাইসিং', 'টেমপ্লেট', 'ইন্টিগ্রেশন'],
    footerCompany: 'কোম্পানি',
    companyLinks: ['সম্পর্কে', 'ব্লগ', 'ক্যারিয়ার', 'যোগাযোগ'],
    footerLegal: 'আইনি',
    legalLinks: ['গোপনীয়তা', 'শর্তাবলী', 'রিফান্ড নীতি'],
    copyright: '© ২০২৬ মাল্টি-স্টোর। বাংলাদেশে ❤️ দিয়ে তৈরি।',
  },
};

// Dotted Grid Background CSS - Using Emerald color
const DottedGridBg = () => (
  <div 
    className="absolute inset-0 opacity-40"
    style={{
      backgroundImage: `radial-gradient(circle, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}
  />
);

export function MarketingLanding() {
  const { lang, toggleLang } = useLanguage();
  const content = marketingContent[lang];
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to award-winning dark mode

  // If dark mode, render the award-winning hero with rest of content in dark theme
  if (isDarkMode) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
        {/* Dark Mode Floating Header */}
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white hidden sm:block">
                  Multi-Store
                </span>
              </Link>
              
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition text-white/70 border border-white/10"
                  title="Switch to Light Mode"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition text-white/70 border border-white/10"
                >
                  <Globe className="w-4 h-4" />
                  {lang === 'en' ? 'বাংলা' : 'EN'}
                </button>
                <Link 
                  to="/auth/login" 
                  className="hidden sm:block text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
                >
                  {content.login}
                </Link>
                <MagneticButton>
                  <Link 
                    to="/auth/register" 
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-violet-500/25"
                  >
                    {content.getStarted}
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </header>

        {/* Award-Winning Bangladesh Hero - Bangla Native */}
        <AwardWinningHero />

        {/* Problem-Solution Section */}
        <ProblemSolutionSection />

        {/* Bento Grid Features Section */}
        <BentoFeaturesSection />

        {/* =================================================================== */}
        {/* INFRASTRUCTURE SHOWCASE - Complete Flow                          */}
        {/* =================================================================== */}

        {/* 1. HOOK + WORLD MAP + METRICS + BRAND LOGOS */}
        <InfrastructureSection />

        {/* 2. SPEED COMPARISON - Interactive Race Demo */}
        <SpeedComparison />

        {/* 3. CDN EXPLAINER - Simple Bengali Visual */}
        <CDNExplainer />

        {/* 4. BUSINESS IMPACT - Speed = Sales ROI */}
        <SpeedImpact />

        {/* 5. FEATURE CARDS - Benefits Carousel */}
        <CloudflareBenefitsCards />

        {/* 6. TECHNICAL SPECS - For Developers (Expandable) */}
        <TechnicalSpecs />

        {/* 7. LIVE DASHBOARD - Real-time Credibility */}
        <LiveDashboard />

        {/* 8. INFRASTRUCTURE CTA - Final Call to Action */}
        <InfrastructureCTA />

        {/* =================================================================== */}
        {/* END INFRASTRUCTURE SHOWCASE                                       */}
        {/* =================================================================== */}

        {/* Trust Section - Transparency & Credibility */}
        <TrustSection />

        {/* Comparison Section - Why We're the Best Choice */}
        <ComparisonSection />

        {/* Interactive Store Demo - Try It Now */}
        <InteractiveStoreDemo />

        {/* Stats Section - Dark */}
        <section className="py-20 bg-gradient-to-b from-[#0A0A0F] to-[#0F0F18] relative overflow-hidden">
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="max-w-6xl mx-auto px-4 relative">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StaggerItem>
                <motion.div className="group" whileHover={{ scale: 1.05 }}>
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  >
                    <Store className="w-8 h-8 text-violet-400" />
                  </motion.div>
                  <AnimatedCounter end={500} suffix="+" className="text-4xl md:text-5xl font-black text-white mb-1 block" />
                  <p className="text-violet-300/60">{content.statsStores}</p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="group" whileHover={{ scale: 1.05 }}>
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  >
                    <ShoppingBag className="w-8 h-8 text-blue-400" />
                  </motion.div>
                  <AnimatedCounter end={50} suffix="K+" className="text-4xl md:text-5xl font-black text-white mb-1 block" />
                  <p className="text-blue-300/60">{content.statsOrders}</p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="group" whileHover={{ scale: 1.05 }}>
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  >
                    <Users className="w-8 h-8 text-cyan-400" />
                  </motion.div>
                  <AnimatedCounter end={1} suffix="K+" className="text-4xl md:text-5xl font-black text-white mb-1 block" />
                  <p className="text-cyan-300/60">{content.statsMerchants}</p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div className="group" whileHover={{ scale: 1.05 }}>
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  >
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <span className="text-4xl md:text-5xl font-black text-white mb-1 block">99.9%</span>
                  <p className="text-green-300/60">{content.statsUptime}</p>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works - Dark */}
        <section className="py-24 px-4 bg-[#0F0F18] relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {content.howTitle}
                </h2>
                <p className="text-xl text-white/50">{content.howSubtitle}</p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: content.step1, desc: content.step1Desc, color: 'violet' },
                { step: '2', title: content.step2, desc: content.step2Desc, color: 'blue' },
                { step: '3', title: content.step3, desc: content.step3Desc, color: 'cyan' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="relative group h-full">
                    {i < 2 && (
                      <motion.div 
                        className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-violet-400/30 to-transparent z-0"
                        initial={{ scaleX: 0, originX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                      />
                    )}
                    
                    <TiltCard className="h-full">
                      <motion.div 
                        className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full"
                        whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
                      >
                        <motion.div 
                          className={`w-16 h-16 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${item.color}-500/30`}
                          style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`, '--tw-gradient-from': i === 0 ? '#8B5CF6' : i === 1 ? '#3B82F6' : '#06B6D4', '--tw-gradient-to': i === 0 ? '#7C3AED' : i === 1 ? '#2563EB' : '#0891B2' } as React.CSSProperties}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <span className="text-2xl font-black text-white">{item.step}</span>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-white/50 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    </TiltCard>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Features - Dark */}
        <section className="py-24 px-4 bg-[#0A0A0F] relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {content.featuresTitle}
                </h2>
                <p className="text-xl text-white/50">{content.featuresSubtitle}</p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.features.map((feature, i) => {
                const icons = { globe: Globe, zap: Zap, smartphone: Smartphone, chart: BarChart3, package: Package, truck: Truck };
                const Icon = icons[feature.icon as keyof typeof icons] || Globe;
                const colors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
                const color = colors[i % colors.length];
                
                return (
                  <StaggerItem key={i}>
                    <TiltCard className="h-full" glowColor={`${color}33`}>
                      <motion.div 
                        className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full"
                        whileHover={{ borderColor: `${color}50` }}
                      >
                        <div className="relative">
                          <motion.div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                            style={{ background: `${color}20` }}
                            whileHover={{ scale: 1.15, rotate: 5 }}
                          >
                            <Icon className="w-7 h-7" style={{ color }} />
                          </motion.div>
                          <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                          <p className="text-white/50 leading-relaxed">{feature.description}</p>
                        </div>
                      </motion.div>
                    </TiltCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing - Dark */}
        <section id="pricing" className="py-24 px-4 bg-[#0F0F18] relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {content.pricingTitle}
                </h2>
                <p className="text-xl text-white/50">{content.pricingSubtitle}</p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.plans.map((plan, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    className={`relative rounded-3xl p-8 h-full ${
                      plan.highlight 
                        ? 'bg-gradient-to-br from-violet-600 to-blue-700 text-white shadow-2xl shadow-violet-500/30 border-2 border-violet-400' 
                        : 'bg-white/5 backdrop-blur-sm border border-white/10'
                    }`}
                    initial={{ scale: plan.highlight ? 1.05 : 1 }}
                    whileHover={{ 
                      scale: plan.highlight ? 1.08 : 1.03,
                      boxShadow: plan.highlight 
                        ? '0 25px 50px -12px rgba(139, 92, 246, 0.5)' 
                        : '0 25px 50px -12px rgba(139, 92, 246, 0.15)',
                    }}
                  >
                    {plan.highlight && (
                      <motion.div 
                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg"
                        animate={{ boxShadow: ['0 4px 15px rgba(251, 191, 36, 0.4)', '0 4px 25px rgba(251, 191, 36, 0.7)', '0 4px 15px rgba(251, 191, 36, 0.4)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {content.mostPopular}
                        </span>
                      </motion.div>
                    )}
                    
                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                    <p className={`mb-6 ${plan.highlight ? 'text-violet-200' : 'text-white/50'}`}>
                      {plan.description}
                    </p>
                    
                    <div className="mb-8">
                      <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-white'}`}>
                        ৳{plan.price}
                      </span>
                      <span className={plan.highlight ? 'text-violet-200' : 'text-white/50'}>
                        {content.perMonth}
                      </span>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, j) => (
                        <motion.li 
                          key={j} 
                          className={`flex items-center gap-3 ${plan.highlight ? 'text-violet-100' : 'text-white/60'}`}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-violet-300' : 'text-violet-400'}`} />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    
                    <MagneticButton className="w-full">
                      <Link
                        to="/auth/register"
                        className={`block w-full py-4 text-center font-bold rounded-xl transition-all ${
                          plan.highlight
                            ? 'bg-white hover:bg-violet-50 text-violet-700 hover:shadow-lg'
                            : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </MagneticButton>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Testimonials - Dark */}
        <section className="py-24 px-4 bg-[#0A0A0F] relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {content.testimonialsTitle}
                </h2>
                <p className="text-xl text-white/50">{content.testimonialsSubtitle}</p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.testimonials.map((t, i) => (
                <StaggerItem key={i}>
                  <TiltCard className="h-full" glowColor="rgba(139, 92, 246, 0.15)">
                    <motion.div 
                      className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full"
                      whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
                    >
                      <div className="flex items-center gap-1 text-amber-400 mb-6">
                        {[...Array(5)].map((_, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: j * 0.1 }}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-white/70 text-lg mb-8 leading-relaxed italic">"{t.text}"</p>
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {t.avatar}
                        </motion.div>
                        <div>
                          <p className="font-bold text-white">{t.name}</p>
                          <p className="text-sm text-white/50">{t.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* FAQ - Dark */}
        <section className="py-24 px-4 bg-[#0F0F18] relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {content.faqTitle}
                </h2>
                <p className="text-xl text-white/50">{content.faqSubtitle}</p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="space-y-4">
              {content.faqs.map((faq, i) => (
                <StaggerItem key={i}>
                  <motion.div 
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)', x: 5 }}
                  >
                    <h4 className="text-lg font-bold text-white flex items-start gap-3">
                      <motion.span 
                        className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        ?
                      </motion.span>
                      {faq.q}
                    </h4>
                    <p className="text-white/50 mt-3 ml-11 leading-relaxed">{faq.a}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA - Dark */}
        <section className="py-24 px-4 bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
            animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          
          <motion.div 
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {content.ctaTitle}
              </h2>
              <p className="text-violet-200 text-xl mb-10 max-w-2xl mx-auto">
                {content.ctaSubtitle}
              </p>
            </ScrollReveal>
            
            <MagneticButton>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-violet-50 text-violet-700 font-bold rounded-2xl text-xl transition-all shadow-2xl"
                >
                  {content.ctaButton}
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight className="w-6 h-6" />
                  </motion.span>
                </Link>
              </motion.div>
            </MagneticButton>
          </div>
        </section>

        {/* Footer - Dark */}
        <footer className="py-16 px-4 bg-[#050508] text-white/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl text-white">Multi-Store</span>
                </div>
                <p className="text-sm">{content.footerAbout}</p>
              </div>
              
              {[
                { title: content.footerProduct, links: content.productLinks },
                { title: content.footerCompany, links: content.companyLinks },
                { title: content.footerLegal, links: content.legalLinks },
              ].map((section, i) => (
                <div key={i}>
                  <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link: string, j: number) => (
                      <li key={j}>
                        <Link to="#" className="hover:text-white transition text-sm">{link}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">{content.copyright}</p>
              <div className="flex items-center gap-4">
                {['💬', '📘', '📸', '🐦'].map((emoji, i) => (
                  <Link key={i} to="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition">
                    {emoji}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Light mode version (original emerald theme)
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white overflow-hidden">
      {/* Glassmorphism Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/80 backdrop-blur-xl border border-emerald-200/50 rounded-2xl px-6 py-3 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Multi-Store
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition text-gray-700"
                title="Switch to Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-sm font-medium transition text-emerald-700"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'বাংলা' : 'EN'}
              </button>
              <Link 
                to="/auth/login" 
                className="hidden sm:block text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2"
              >
                {content.login}
              </Link>
              <Link 
                to="/auth/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-500/25"
              >
                {content.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>


      {/* Hero Section - PREMIUM ANIMATED */}
      <section className="relative pt-32 pb-24 px-4 min-h-[90vh] flex items-center">
        <DottedGridBg />
        
        {/* Animated Morphing Gradient Orbs */}
        <FloatingOrbs />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Animated Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/80 backdrop-blur-sm border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium mb-8 shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            {content.badge}
            <div className="flex -space-x-2 ml-2">
              {['👩‍💼', '👨‍💻', '👩‍🎨'].map((emoji, i) => (
                <motion.span 
                  key={i} 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="w-6 h-6 bg-white rounded-full border-2 border-emerald-100 flex items-center justify-center text-xs"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
          
          {/* Animated Headline with Shimmer Effect */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            {content.heroTitle1}<br />
            <ShimmerText className="text-5xl md:text-7xl font-bold">
              {content.heroTitle2}
            </ShimmerText>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {content.heroSubtitle}
          </motion.p>
          
          {/* Premium Animated CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton>
              <Link
                to="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center gap-2"
              >
                {content.getStarted}
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                to="#"
                className="group px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-2xl text-lg border-2 border-emerald-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {content.talkExpert}
              </Link>
            </MagneticButton>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-gray-500 text-sm"
          >
            {content.noCreditCard}
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-emerald-400"
            >
              <ChevronDown className="w-8 h-8" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Dark with Animated Counters */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 relative overflow-hidden">
        {/* Animated background glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StaggerItem>
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Store className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <AnimatedCounter end={500} suffix="+" className="text-4xl md:text-5xl font-black text-white mb-1 block" />
                <p className="text-emerald-300">{content.statsStores}</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-teal-500/20 rounded-2xl flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShoppingBag className="w-8 h-8 text-teal-400" />
                </motion.div>
                <AnimatedCounter end={50} suffix="K+" className="text-4xl md:text-5xl font-black text-white mb-1 block" />
                <p className="text-teal-300">{content.statsOrders}</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-cyan-500/20 rounded-2xl flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Users className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <AnimatedCounter end={1} suffix="K+" className="text-4xl md:text-5xl font-black text-white mb-1 block" />
                <p className="text-cyan-300">{content.statsMerchants}</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-2xl flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </motion.div>
                <span className="text-4xl md:text-5xl font-black text-white mb-1 block">99.9%</span>
                <p className="text-green-300">{content.statsUptime}</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works - Premium Animated */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'Newsreader, Georgia, serif' }}
              >
                {content.howTitle}
              </h2>
              <p className="text-xl text-gray-600">{content.howSubtitle}</p>
            </div>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: content.step1, desc: content.step1Desc, icon: Users },
              { step: '2', title: content.step2, desc: content.step2Desc, icon: ShoppingBag },
              { step: '3', title: content.step3, desc: content.step3Desc, icon: Rocket },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="relative group h-full">
                  {/* Animated Connector Line */}
                  {i < 2 && (
                    <motion.div 
                      className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-400 to-transparent z-0"
                      initial={{ scaleX: 0, originX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                    />
                  )}
                  
                  <TiltCard className="h-full">
                    <motion.div 
                      className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 h-full"
                      whileHover={{ 
                        borderColor: 'rgb(110, 231, 183)',
                        boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.15)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-2xl font-black text-white">{item.step}</span>
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  </TiltCard>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Bento Features Grid - Premium Animated */}
      <section className="py-24 px-4 bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden">
        <DottedGridBg />
        
        <div className="relative max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'Newsreader, Georgia, serif' }}
              >
                {content.featuresTitle}
              </h2>
              <p className="text-xl text-gray-600">{content.featuresSubtitle}</p>
            </div>
          </ScrollReveal>
          
          {/* Animated Bento Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, i) => {
              const icons = { globe: Globe, zap: Zap, smartphone: Smartphone, chart: BarChart3, package: Package, truck: Truck };
              const Icon = icons[feature.icon as keyof typeof icons] || Globe;
              
              return (
                <StaggerItem key={i}>
                  <TiltCard className="h-full" glowColor="rgba(16, 185, 129, 0.2)">
                    <motion.div 
                      className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 h-full"
                      whileHover={{ 
                        borderColor: 'rgb(110, 231, 183)',
                        boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.2)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Animated gradient overlay */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <div className="relative">
                        <motion.div 
                          className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-7 h-7 text-emerald-600" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing Section - Premium Animated */}
      <section id="pricing" className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'Newsreader, Georgia, serif' }}
              >
                {content.pricingTitle}
              </h2>
              <p className="text-xl text-gray-600">{content.pricingSubtitle}</p>
            </div>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.plans.map((plan, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className={`relative rounded-3xl p-8 h-full ${
                    plan.highlight 
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-500/30 border-2 border-emerald-400' 
                      : 'bg-white border-2 border-gray-100'
                  }`}
                  initial={{ scale: plan.highlight ? 1.05 : 1 }}
                  whileHover={{ 
                    scale: plan.highlight ? 1.08 : 1.03,
                    boxShadow: plan.highlight 
                      ? '0 25px 50px -12px rgba(16, 185, 129, 0.5)' 
                      : '0 25px 50px -12px rgba(16, 185, 129, 0.15)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.highlight && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg"
                      animate={{ 
                        boxShadow: ['0 4px 15px rgba(251, 191, 36, 0.4)', '0 4px 25px rgba(251, 191, 36, 0.7)', '0 4px 15px rgba(251, 191, 36, 0.4)']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {content.mostPopular}
                      </span>
                    </motion.div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-6 ${plan.highlight ? 'text-emerald-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-8">
                    <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      ৳{plan.price}
                    </span>
                    <span className={plan.highlight ? 'text-emerald-200' : 'text-gray-500'}>
                      {content.perMonth}
                    </span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <motion.li 
                        key={j} 
                        className={`flex items-center gap-3 ${plan.highlight ? 'text-emerald-100' : 'text-gray-600'}`}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: j * 0.1 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        </motion.div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                  
                  <MagneticButton className="w-full">
                    <Link
                      to="/auth/register"
                      className={`block w-full py-4 text-center font-bold rounded-xl transition-all ${
                        plan.highlight
                          ? 'bg-white hover:bg-emerald-50 text-emerald-700 hover:shadow-lg'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </MagneticButton>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials - Premium Animated */}
      <section className="py-24 px-4 bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden">
        <DottedGridBg />
        
        <div className="relative max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'Newsreader, Georgia, serif' }}
              >
                {content.testimonialsTitle}
              </h2>
              <p className="text-xl text-gray-600">{content.testimonialsSubtitle}</p>
            </div>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <TiltCard className="h-full" glowColor="rgba(16, 185, 129, 0.15)">
                  <motion.div 
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 h-full"
                    whileHover={{ 
                      borderColor: 'rgb(110, 231, 183)',
                      boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.15)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Animated Stars */}
                    <div className="flex items-center gap-1 text-amber-400 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {t.avatar}
                      </motion.div>
                      <div>
                        <p className="font-bold text-gray-900">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section - Premium Animated */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'Newsreader, Georgia, serif' }}
              >
                {content.faqTitle}
              </h2>
              <p className="text-xl text-gray-600">{content.faqSubtitle}</p>
            </div>
          </ScrollReveal>
          
          <StaggerContainer className="space-y-4">
            {content.faqs.map((faq, i) => (
              <StaggerItem key={i}>
                <motion.div 
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
                  whileHover={{ 
                    borderColor: 'rgb(110, 231, 183)',
                    boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15)',
                    x: 5,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="text-lg font-bold text-gray-900 flex items-start gap-3">
                    <motion.span 
                      className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg shadow-emerald-500/30"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      ?
                    </motion.span>
                    {faq.q}
                  </h4>
                  <p className="text-gray-600 mt-3 ml-11 leading-relaxed">{faq.a}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA Section - Premium Animated */}
      <section className="py-24 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
          animate={{ 
            backgroundPosition: ['0px 0px', '32px 32px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Floating glow orbs */}
        <motion.div 
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {content.ctaTitle}
            </h2>
            <p className="text-emerald-200 text-xl mb-10 max-w-2xl mx-auto">
              {content.ctaSubtitle}
            </p>
          </ScrollReveal>
          
          <MagneticButton>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-2xl text-xl transition-all shadow-2xl hover:shadow-white/30"
              >
                {content.ctaButton}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </Link>
            </motion.div>
          </MagneticButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  Multi-Store SaaS
                </span>
              </div>
              <p className="text-gray-500 mb-6 leading-relaxed">
                The easiest way to start and grow your online business in Bangladesh. 
                Built with ❤️ for Bangladeshi entrepreneurs.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Features</Link></li>
                <li><Link to="#pricing" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Pricing</Link></li>
                <li><Link to="#" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:+8801570260118" className="hover:text-emerald-400 transition flex items-center gap-2">
                    📞 01570260118
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/8801739416661" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition flex items-center gap-2">
                    💬 01739416661 (WhatsApp)
                  </a>
                </li>
                <li>
                  <a href="mailto:rahmatullahzisan@gmail.com" className="hover:text-emerald-400 transition flex items-center gap-2">
                    ✉️ rahmatullahzisan@gmail.com
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-emerald-400 transition flex items-center gap-1">
                    <ChevronRight className="w-4 h-4" />Contact Page
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Multi-Store SaaS. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/auth/login" className="hover:text-emerald-400 transition">{content.login}</Link>
              <Link to="/auth/register" className="hover:text-emerald-400 transition">{content.register}</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Support Chat Bot for Visitors - Temporarily disabled */}
      {/* <ChatWidget
        mode="customer"
        storeId={0}
        welcomeMessage={lang === 'bn' 
          ? 'আসসালামু আলাইকুম! 👋 Multi-Store সম্পর্কে কোন প্রশ্ন আছে?' 
          : 'Hello! 👋 Have any questions about Multi-Store?'
        }
        accentColor="#10B981"
      /> */}
    </div>
  );
}
