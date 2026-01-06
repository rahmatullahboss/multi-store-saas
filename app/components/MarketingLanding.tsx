/**
 * SaaS Marketing Landing Page - Procloudify Inspired Design
 * 
 * Features:
 * - EMERALD/TEAL GREEN color scheme (original theme)
 * - Dotted grid background pattern
 * - Glassmorphism header and cards
 * - Serif font for headings (premium feel)
 * - Bento-box style feature layouts
 * - Modern animations and hover effects
 * - Multi-Store SaaS specific content
 */

import { Link } from '@remix-run/react';
import { Store, Zap, Shield, BarChart3, Globe, Headphones, Check, ArrowRight, Star, Users, ShoppingBag, TrendingUp, Sparkles, Rocket, CreditCard, MessageCircle, ChevronRight, Play, Package, Truck, Smartphone } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { ChatWidget } from '~/components/ai/ChatWidget';

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
      { name: 'Premium', price: '1,500', description: 'For serious businesses', features: ['Unlimited Products', 'Unlimited Orders', 'Custom Domain', 'Priority Support', 'Team Members (3)', 'Courier Integration'], cta: 'Go Premium', highlight: false },
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
      { name: 'প্রিমিয়াম', price: '১,৫০০', description: 'সিরিয়াস ব্যবসার জন্য', features: ['আনলিমিটেড প্রোডাক্ট', 'আনলিমিটেড অর্ডার', 'কাস্টম ডোমেইন', 'প্রায়োরিটি সাপোর্ট', 'টিম মেম্বার (৩)', 'কুরিয়ার ইন্টিগ্রেশন'], cta: 'প্রিমিয়াম নিন', highlight: false },
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        <DottedGridBg />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/80 backdrop-blur-sm border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            {content.badge}
            <div className="flex -space-x-2 ml-2">
              {['👩‍💼', '👨‍💻', '👩‍🎨'].map((emoji, i) => (
                <span key={i} className="w-6 h-6 bg-white rounded-full border-2 border-emerald-100 flex items-center justify-center text-xs">
                  {emoji}
                </span>
              ))}
            </div>
          </div>
          
          {/* Headline - Using Serif Font */}
          <h1 
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            {content.heroTitle1}<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {content.heroTitle2}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/40 flex items-center gap-2"
            >
              {content.getStarted}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="#"
              className="px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-2xl text-lg border-2 border-emerald-200 transition flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {content.talkExpert}
            </Link>
          </div>
          
          <p className="mt-6 text-gray-500 text-sm">{content.noCreditCard}</p>
        </div>
      </section>

      {/* Stats Section - Dark */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">500+</p>
              <p className="text-emerald-300">{content.statsStores}</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-teal-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-teal-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">50K+</p>
              <p className="text-teal-300">{content.statsOrders}</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">1K+</p>
              <p className="text-cyan-300">{content.statsMerchants}</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">99.9%</p>
              <p className="text-green-300">{content.statsUptime}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {content.howTitle}
            </h2>
            <p className="text-xl text-gray-600">{content.howSubtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: content.step1, desc: content.step1Desc, icon: Users },
              { step: '2', title: content.step2, desc: content.step2Desc, icon: ShoppingBag },
              { step: '3', title: content.step3, desc: content.step3Desc, icon: Rocket },
            ].map((item, i) => (
              <div key={i} className="relative group">
                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent z-0" />
                )}
                
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-500/10 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                    <span className="text-2xl font-black text-white">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="py-24 px-4 bg-gradient-to-b from-emerald-50 to-white relative">
        <DottedGridBg />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {content.featuresTitle}
            </h2>
            <p className="text-xl text-gray-600">{content.featuresSubtitle}</p>
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, i) => {
              const icons = { globe: Globe, zap: Zap, smartphone: Smartphone, chart: BarChart3, package: Package, truck: Truck };
              const Icon = icons[feature.icon as keyof typeof icons] || Globe;
              
              return (
                <div 
                  key={i} 
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {content.pricingTitle}
            </h2>
            <p className="text-xl text-gray-600">{content.pricingSubtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 transition-all ${
                  plan.highlight 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-500/30 scale-105 border-2 border-emerald-400' 
                    : 'bg-white border-2 border-gray-100 hover:border-emerald-200 hover:shadow-xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    {content.mostPopular}
                  </div>
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
                    <li key={j} className={`flex items-center gap-3 ${plan.highlight ? 'text-emerald-100' : 'text-gray-600'}`}>
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-emerald-300' : 'text-emerald-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/auth/register"
                  className={`block w-full py-4 text-center font-bold rounded-xl transition ${
                    plan.highlight
                      ? 'bg-white hover:bg-emerald-50 text-emerald-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-b from-emerald-50 to-white relative">
        <DottedGridBg />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {content.testimonialsTitle}
            </h2>
            <p className="text-xl text-gray-600">{content.testimonialsSubtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials.map((t, i) => (
              <div 
                key={i} 
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-xl"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {content.faqTitle}
            </h2>
            <p className="text-xl text-gray-600">{content.faqSubtitle}</p>
          </div>
          
          <div className="space-y-4">
            {content.faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 hover:border-emerald-300 transition-all"
              >
                <h4 className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg shadow-emerald-500/30">
                    ?
                  </span>
                  {faq.q}
                </h4>
                <p className="text-gray-600 mt-3 ml-11 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            {content.ctaTitle}
          </h2>
          <p className="text-emerald-200 text-xl mb-10 max-w-2xl mx-auto">
            {content.ctaSubtitle}
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-2xl text-xl transition shadow-2xl hover:shadow-white/20"
          >
            {content.ctaButton}
            <ArrowRight className="w-6 h-6" />
          </Link>
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
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Help Center</Link></li>
                <li><Link to="#" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Contact</Link></li>
                <li><Link to="#" className="hover:text-emerald-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Status</Link></li>
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

      {/* AI Support Chat Bot for Visitors */}
      <ChatWidget
        mode="customer"
        storeId={0}
        welcomeMessage={lang === 'bn' 
          ? 'আসসালামু আলাইকুম! 👋 Multi-Store সম্পর্কে কোন প্রশ্ন আছে?' 
          : 'Hello! 👋 Have any questions about Multi-Store?'
        }
        accentColor="#10B981"
      />
    </div>
  );
}
