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

import { useState, useEffect } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Store, Zap, BarChart3, Globe, Check, ArrowRight, Star, Users, ShoppingBag, TrendingUp, Sparkles, Rocket, MessageCircle, ChevronRight, Play, Package, Truck, Smartphone, ChevronDown, Moon, Sun, Menu, X } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { AnimatedCounter, ScrollReveal, StaggerContainer, StaggerItem, FloatingOrbs, TiltCard, MagneticButton, ShimmerText } from '~/components/animations';
import { AwardWinningHero } from '~/components/AwardWinningHero';
import { AIHeroSection } from '~/components/AIHeroSection';
import { AIShowcaseSection } from '~/components/landing/AIShowcaseSection';
import { DragDropBuilderShowcase } from '~/components/landing/DragDropBuilderShowcase';
import { EditorModeComparison } from '~/components/landing/EditorModeComparison';
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
import { PricingSection } from '~/components/PricingSection'; // Keep for reference, not rendered
import { FinalCTA } from '~/components/FinalCTA';
import { FAQSection } from '~/components/FAQSection';
import { LightFloatingOrbs, LightHeroGradient, LightShimmerText } from '~/components/LightThemeEffects';
import { OzzylAIChatWidget } from '~/components/landing/OzzylAIChatWidget';
import type { MarketingStats } from '~/routes/api.marketing-stats';


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

// Premium Light Theme Dotted Grid Background - Using Bangladesh Green
const LightDottedGridBg = () => (
  <div 
    className="absolute inset-0 opacity-30 pointer-events-none"
    style={{
      backgroundImage: `radial-gradient(circle, rgba(0, 106, 78, 0.12) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}
  />
);

export function MarketingLanding() {
  const { lang, toggleLang } = useLanguage();
  const content = marketingContent[lang];
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to award-winning dark mode
  
  // Fetch real marketing stats from API
  const statsFetcher = useFetcher<MarketingStats>();
  
  useEffect(() => {
    if (statsFetcher.state === 'idle' && !statsFetcher.data) {
      statsFetcher.load('/api/marketing-stats');
    }
  }, [statsFetcher]);
  
  const marketingStats = statsFetcher.data;

  // If dark mode, render the award-winning hero with rest of content in dark theme
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isDarkMode) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
        {/* Dark Mode Floating Header */}
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
                  to="/pricing" 
                  className="hidden md:block text-white/60 hover:text-[#00875F] font-medium text-sm px-3 py-2 transition"
                >
                  প্রাইসিং
                </Link>
                <Link 
                  to="/tutorials" 
                  className="hidden md:block text-white/60 hover:text-[#00875F] font-medium text-sm px-3 py-2 transition"
                >
                  টিউটোরিয়াল
                </Link>
                {/* Language toggle hidden for MVP - system preserved for future
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 rounded-xl text-sm font-medium transition text-white/80 border border-[#006A4E]/30"
                >
                  <Globe className="w-4 h-4" />
                  {lang === 'en' ? 'বাংলা' : 'EN'}
                </button>
                */}
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
                    ফ্রি স্টোর তৈরি করুন
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
                    to="/pricing" 
                    className="text-white/70 hover:text-[#00875F] font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    প্রাইসিং
                  </Link>
                  <Link 
                    to="/tutorials" 
                    className="text-white/70 hover:text-[#00875F] font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    টিউটোরিয়াল
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-white/70 hover:text-[#00875F] font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    আমাদের সম্পর্কে
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-white/70 hover:text-[#00875F] font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    যোগাযোগ
                  </Link>
                  <div className="border-t border-white/10 my-2" />
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
                    ফ্রি স্টোর তৈরি করুন
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        {/* Award-Winning Bangladesh Hero - Bangla Native */}
        <AwardWinningHero totalUsers={marketingStats?.totalUsers} />

        {/* AI Hero Section - New Transformation */}
        <AIHeroSection theme="dark" totalUsers={marketingStats?.totalUsers} />

        {/* Problem-Solution Section */}
        <ProblemSolutionSection />

        {/* AI Showcase Section */}
        <AIShowcaseSection />

        {/* Drag & Drop Builder Section */}
        <DragDropBuilderShowcase />
        <EditorModeComparison />

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
        <TrustSection stats={marketingStats} />

        {/* Comparison Section - Why We're the Best Choice */}
        <ComparisonSection />

        {/* Interactive Store Demo - Try It Now */}
        <InteractiveStoreDemo />

        {/* Pricing moved to dedicated /pricing page */}

        {/* FAQ Section - Bengali Design */}
        <FAQSection />

        {/* Final CTA - Compelling Bengali Design */}
        <FinalCTA stats={marketingStats} />

        {/* Footer - Bangladesh Green Theme */}
        <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
          <div className="max-w-6xl mx-auto">
            {/* Mobile: Single column, Desktop: 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Section */}
              <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl text-white">Multi-Store</span>
                </div>
                <p className="text-sm text-white/50">বাংলাদেশি মার্চেন্টদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। তৈরি করুন, বিক্রি করুন, বড় হন।</p>
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
              <p className="text-sm text-white/40">© ২০২৬ মাল্টি-স্টোর। বাংলাদেশে ❤️ দিয়ে তৈরি।</p>
              <div className="flex items-center gap-3">
                {[
                  { icon: '💬', label: 'WhatsApp' },
                  { icon: '📘', label: 'Facebook' },
                  { icon: '📸', label: 'Instagram' },
                ].map((social, i) => (
                  <Link 
                    key={i} 
                    to="#" 
                    className="w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition"
                    title={social.label}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky Mobile CTA Button - FAB Style */}
        <div className="sm:hidden fixed bottom-4 left-4 z-40">
          <Link 
            to="/auth/register" 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm shadow-xl shadow-[#006A4E]/40 active:scale-[0.95] transition-transform"
          >
            <Rocket className="w-4 h-4" />
            ফ্রি শুরু
          </Link>
        </div>

        {/* Ozzyl AI Chat Widget */}
        <OzzylAIChatWidget />
      </div>
    );
  }

  // Light mode version - PREMIUM LIGHT THEME
  // Components still use dark styling internally but wrapper provides light theme feel
  // Header and footer are light-themed for visual distinction
  return (
    <div className="min-h-screen bg-[#FAFBFC] overflow-hidden">
      {/* Premium Light Theme Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/80 backdrop-blur-xl border border-[#EBEDF0] rounded-2xl px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#059669] rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(0,106,78,0.25)]">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-[#0F172A] hidden sm:block">
                Multi-Store
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/pricing" 
                className="hidden md:block text-[#475569] hover:text-[#006A4E] font-medium text-sm px-3 py-2 transition"
              >
                প্রাইসিং
              </Link>
              <Link 
                to="/tutorials" 
                className="hidden md:block text-[#475569] hover:text-[#006A4E] font-medium text-sm px-3 py-2 transition"
              >
                টিউটোরিয়াল
              </Link>
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] hover:bg-[#EBEDF0] rounded-xl text-sm font-medium transition text-[#475569] border border-[#EBEDF0]"
                title="Switch to Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              {/* Language toggle hidden for MVP - system preserved for future
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(0,106,78,0.06)] hover:bg-[rgba(0,106,78,0.1)] rounded-xl text-sm font-medium transition text-[#006A4E] border border-[rgba(0,106,78,0.12)]"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'বাংলা' : 'EN'}
              </button>
              */}
              <Link 
                to="/auth/login" 
                className="hidden sm:block text-[#475569] hover:text-[#0F172A] font-medium text-sm px-4 py-2 transition"
              >
                লগইন
              </Link>
              <MagneticButton>
                <Link 
                  to="/auth/register" 
                  className="hidden sm:inline-block px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#059669] hover:from-[#005740] hover:to-[#047857] text-white font-semibold rounded-xl text-sm transition shadow-[0_4px_14px_rgba(0,106,78,0.25)] hover:shadow-[0_6px_20px_rgba(0,106,78,0.35)]"
                >
                  ফ্রি স্টোর তৈরি করুন
                </Link>
              </MagneticButton>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden flex items-center justify-center w-10 h-10 bg-[#F4F5F7] hover:bg-[#EBEDF0] border border-[#EBEDF0] rounded-xl transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-[#475569]" /> : <Menu className="w-5 h-5 text-[#475569]" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden mt-4 pt-4 border-t border-[#EBEDF0]"
            >
              <div className="flex flex-col gap-2">
                <Link 
                  to="/pricing" 
                  className="text-[#475569] hover:text-[#006A4E] font-medium text-sm px-3 py-2 rounded-lg hover:bg-[#F4F5F7] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  প্রাইসিং
                </Link>
                <Link 
                  to="/tutorials" 
                  className="text-[#475569] hover:text-[#006A4E] font-medium text-sm px-3 py-2 rounded-lg hover:bg-[#F4F5F7] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  টিউটোরিয়াল
                </Link>
                <Link 
                  to="/about" 
                  className="text-[#475569] hover:text-[#006A4E] font-medium text-sm px-3 py-2 rounded-lg hover:bg-[#F4F5F7] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  আমাদের সম্পর্কে
                </Link>
                <Link 
                  to="/contact" 
                  className="text-[#475569] hover:text-[#006A4E] font-medium text-sm px-3 py-2 rounded-lg hover:bg-[#F4F5F7] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  যোগাযোগ
                </Link>
                <div className="border-t border-[#EBEDF0] my-2" />
                <Link 
                  to="/auth/login" 
                  className="text-[#475569] hover:text-[#0F172A] font-medium text-sm px-3 py-2 rounded-lg hover:bg-[#F4F5F7] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  লগইন
                </Link>
                <Link 
                  to="/auth/register" 
                  className="px-4 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#059669] text-white font-semibold rounded-xl text-sm text-center shadow-[0_4px_14px_rgba(0,106,78,0.25)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ফ্রি স্টোর তৈরি করুন
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Light Theme Hero - Premium Light Styling */}
      <AwardWinningHero theme="light" totalUsers={marketingStats?.totalUsers} />
      <AIHeroSection theme="light" totalUsers={marketingStats?.totalUsers} />
      <ProblemSolutionSection />
      <AIShowcaseSection />
      <DragDropBuilderShowcase />
      <BentoFeaturesSection />
      <InfrastructureSection />
      <SpeedComparison />
      <CDNExplainer />
      <SpeedImpact />
      <CloudflareBenefitsCards />
      <TechnicalSpecs />
      <LiveDashboard />
      <InfrastructureCTA />
      <TrustSection />
      <ComparisonSection />
      <InteractiveStoreDemo />
      {/* Pricing moved to dedicated /pricing page */}
      <FAQSection />
      <FinalCTA />

      {/* Footer - Bangladesh Green Theme */}
      <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Single column, Desktop: 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Multi-Store</span>
              </div>
              <p className="text-sm text-white/50">বাংলাদেশি মার্চেন্টদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। তৈরি করুন, বিক্রি করুন, বড় হন।</p>
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
            <p className="text-sm text-white/40">© ২০২৬ মাল্টি-স্টোর। বাংলাদেশে ❤️ দিয়ে তৈরি।</p>
            <div className="flex items-center gap-3">
              {[
                { icon: '💬', label: 'WhatsApp' },
                { icon: '📘', label: 'Facebook' },
                { icon: '📸', label: 'Instagram' },
              ].map((social, i) => (
                <Link 
                  key={i} 
                  to="#" 
                  className="w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition"
                  title={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

        {/* Sticky Mobile CTA Button - FAB Style */}
        <div className="sm:hidden fixed bottom-4 left-4 z-40">
          <Link 
            to="/auth/register" 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm shadow-xl shadow-[#006A4E]/40 active:scale-[0.95] transition-transform"
          >
            <Rocket className="w-4 h-4" />
            ফ্রি শুরু
          </Link>
        </div>

        {/* Ozzyl AI Chat Widget */}
        <OzzylAIChatWidget />
    </div>
  );
}
