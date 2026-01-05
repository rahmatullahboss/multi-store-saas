/**
 * SaaS Marketing Landing Page
 * 
 * Shown on main domain (multi-store-saas.pages.dev)
 * Features: Hero, Features, Pricing, CTA
 * Uses global language context for EN/BN toggle
 * Rich design with multiple sections
 * NO header navigation menu
 */

import { Link } from '@remix-run/react';
import { Store, Zap, Shield, BarChart3, Globe, Headphones, Check, ArrowRight, Star, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';

// Marketing page specific translations
const marketingContent = {
  en: {
    tagline: '#1 E-commerce Platform in Bangladesh',
    heroTitle1: 'Launch Your Online Store',
    heroTitle2: 'in Just 5 Minutes',
    heroSubtitle: 'No coding required. Get a professional e-commerce store with custom domain, payment integration, and powerful dashboard.',
    startFree: 'Start Free Today',
    viewPricing: 'View Pricing',
    noCreditCard: 'No credit card required • Free forever plan available',
    login: 'Login',
    register: 'Register',
    featuresTitle: 'Everything You Need to Sell Online',
    featuresSubtitle: 'Powerful features to grow your business',
    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Start free, upgrade when you\'re ready',
    ctaTitle: 'Ready to Start Your Online Business?',
    ctaSubtitle: 'Join thousands of merchants who trust Multi-Store for their e-commerce needs.',
    ctaButton: 'Create Your Free Store',
    perMonth: '/month',
    mostPopular: 'Most Popular',
    statsTitle: 'Trusted by Growing Businesses',
    statsStores: 'Active Stores',
    statsOrders: 'Orders Processed',
    statsMerchants: 'Happy Merchants',
    statsRevenue: 'Revenue Generated',
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Get started in 3 simple steps',
    step1Title: 'Create Your Account',
    step1Desc: 'Sign up in seconds with just your email and password.',
    step2Title: 'Set Up Your Store',
    step2Desc: 'Add your products, customize your theme, and configure settings.',
    step3Title: 'Start Selling',
    step3Desc: 'Share your store link and start accepting orders immediately.',
    testimonialsTitle: 'What Our Merchants Say',
    testimonialsSubtitle: 'Hear from successful store owners',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Got questions? We\'ve got answers',
    features: [
      { title: 'Your Own Store', description: 'Get a professional online store with your custom subdomain in minutes.' },
      { title: 'Lightning Fast', description: 'Built on edge computing for instant page loads worldwide.' },
      { title: 'Secure Payments', description: 'Accept bKash, Nagad, Stripe and Cash on Delivery seamlessly.' },
      { title: 'Analytics Dashboard', description: 'Track sales, orders, and customer insights in real-time.' },
      { title: 'Bangla + English', description: 'Full bilingual support for your Bangladeshi customers.' },
      { title: '24/7 Support', description: 'We are here to help you succeed, anytime.' },
    ],
    plans: [
      { name: 'Free', price: '0', description: 'Perfect to get started', features: ['1 Product', '50 Orders/month', 'Landing Page Mode', 'Cash on Delivery'], cta: 'Start Free' },
      { name: 'Starter', price: '500', description: 'For growing businesses', features: ['50 Products', '500 Orders/month', 'Full Store Mode', 'All Payment Methods', 'Analytics Dashboard'], cta: 'Get Started' },
      { name: 'Premium', price: '1,500', description: 'For established stores', features: ['500 Products', '5000 Orders/month', 'Full Store Mode', 'Priority Support', 'Custom Domain', 'Team Members'], cta: 'Go Premium' },
    ],
    testimonials: [
      { name: 'Rahim Ahmed', role: 'Fashion Store Owner', text: 'Multi-Store transformed my business. I went from zero to 500 orders in just 3 months!' },
      { name: 'Fatima Khan', role: 'Cosmetics Seller', text: 'The easiest platform I\'ve ever used. My customers love the smooth checkout experience.' },
      { name: 'Karim Hossain', role: 'Electronics Shop', text: 'The analytics dashboard helps me understand my customers better. Revenue increased 200%!' },
    ],
    faqs: [
      { q: 'Is it really free to start?', a: 'Yes! Our Free plan lets you list 1 product and process up to 50 orders per month at no cost.' },
      { q: 'Can I use my own domain?', a: 'Yes, Premium plan users can connect their custom domain. We handle all the technical setup.' },
      { q: 'What payment methods are supported?', a: 'We support bKash, Nagad, Cards, and Cash on Delivery. More payment options coming soon.' },
      { q: 'How do I get paid?', a: 'We process weekly payouts to your bank account. You can track all earnings in your dashboard.' },
    ],
  },
  bn: {
    tagline: 'বাংলাদেশের #১ ই-কমার্স প্ল্যাটফর্ম',
    heroTitle1: 'আপনার অনলাইন স্টোর চালু করুন',
    heroTitle2: 'মাত্র ৫ মিনিটে',
    heroSubtitle: 'কোনো কোডিং প্রয়োজন নেই। কাস্টম ডোমেইন, পেমেন্ট ইন্টিগ্রেশন এবং শক্তিশালী ড্যাশবোর্ড সহ একটি পেশাদার ই-কমার্স স্টোর পান।',
    startFree: 'ফ্রি শুরু করুন',
    viewPricing: 'মূল্য দেখুন',
    noCreditCard: 'কোনো ক্রেডিট কার্ড প্রয়োজন নেই • চিরকালের জন্য ফ্রি প্ল্যান',
    login: 'লগইন',
    register: 'রেজিস্টার',
    featuresTitle: 'অনলাইনে বিক্রি করতে যা যা দরকার',
    featuresSubtitle: 'আপনার ব্যবসা বাড়াতে শক্তিশালী ফিচার',
    pricingTitle: 'সহজ, স্বচ্ছ মূল্য',
    pricingSubtitle: 'ফ্রি শুরু করুন, প্রস্তুত হলে আপগ্রেড করুন',
    ctaTitle: 'আপনার অনলাইন ব্যবসা শুরু করতে প্রস্তুত?',
    ctaSubtitle: 'হাজার হাজার মার্চেন্ট যারা তাদের ই-কমার্স প্রয়োজনে Multi-Store-কে বিশ্বাস করে তাদের সাথে যোগ দিন।',
    ctaButton: 'আপনার ফ্রি স্টোর তৈরি করুন',
    perMonth: '/মাস',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    statsTitle: 'বাড়তে থাকা ব্যবসাগুলোর বিশ্বস্ত প্ল্যাটফর্ম',
    statsStores: 'সক্রিয় স্টোর',
    statsOrders: 'প্রসেস করা অর্ডার',
    statsMerchants: 'সন্তুষ্ট মার্চেন্ট',
    statsRevenue: 'জেনারেট করা রেভিনিউ',
    howItWorksTitle: 'কিভাবে কাজ করে',
    howItWorksSubtitle: '৩টি সহজ ধাপে শুরু করুন',
    step1Title: 'অ্যাকাউন্ট তৈরি করুন',
    step1Desc: 'শুধু ইমেইল এবং পাসওয়ার্ড দিয়ে সেকেন্ডে সাইন আপ করুন।',
    step2Title: 'স্টোর সেটআপ করুন',
    step2Desc: 'প্রোডাক্ট যোগ করুন, থিম কাস্টমাইজ করুন, সেটিংস কনফিগার করুন।',
    step3Title: 'বিক্রি শুরু করুন',
    step3Desc: 'স্টোরের লিংক শেয়ার করুন এবং অর্ডার নেওয়া শুরু করুন।',
    testimonialsTitle: 'আমাদের মার্চেন্টরা কি বলছে',
    testimonialsSubtitle: 'সফল স্টোর মালিকদের কথা শুনুন',
    faqTitle: 'সাধারণ জিজ্ঞাসা',
    faqSubtitle: 'প্রশ্ন আছে? আমাদের কাছে উত্তর আছে',
    features: [
      { title: 'আপনার নিজের স্টোর', description: 'মিনিটের মধ্যে আপনার কাস্টম সাবডোমেইন সহ একটি পেশাদার অনলাইন স্টোর পান।' },
      { title: 'অতি দ্রুত', description: 'বিশ্বব্যাপী তাৎক্ষণিক পেজ লোডের জন্য এজ কম্পিউটিং-এ নির্মিত।' },
      { title: 'নিরাপদ পেমেন্ট', description: 'বিকাশ, নগদ, স্ট্রাইপ এবং ক্যাশ অন ডেলিভারি সহজেই গ্রহণ করুন।' },
      { title: 'অ্যানালিটিক্স ড্যাশবোর্ড', description: 'রিয়েল-টাইমে সেলস, অর্ডার এবং কাস্টমার ইনসাইট ট্র্যাক করুন।' },
      { title: 'বাংলা + ইংরেজি', description: 'আপনার বাংলাদেশী গ্রাহকদের জন্য সম্পূর্ণ দ্বিভাষিক সমর্থন।' },
      { title: '২৪/৭ সাপোর্ট', description: 'আমরা যেকোনো সময় আপনাকে সফল হতে সাহায্য করতে এখানে আছি।' },
    ],
    plans: [
      { name: 'ফ্রি', price: '০', description: 'শুরু করার জন্য পারফেক্ট', features: ['১টি প্রোডাক্ট', '৫০ অর্ডার/মাস', 'ল্যান্ডিং পেজ মোড', 'ক্যাশ অন ডেলিভারি'], cta: 'ফ্রি শুরু' },
      { name: 'স্টার্টার', price: '৫০০', description: 'বাড়তে থাকা ব্যবসার জন্য', features: ['৫০টি প্রোডাক্ট', '৫০০ অর্ডার/মাস', 'ফুল স্টোর মোড', 'সব পেমেন্ট মেথড', 'অ্যানালিটিক্স'], cta: 'শুরু করুন' },
      { name: 'প্রিমিয়াম', price: '১,৫০০', description: 'প্রতিষ্ঠিত স্টোরের জন্য', features: ['৫০০টি প্রোডাক্ট', '৫০০০ অর্ডার/মাস', 'ফুল স্টোর মোড', 'প্রায়োরিটি সাপোর্ট', 'কাস্টম ডোমেইন'], cta: 'প্রিমিয়াম নিন' },
    ],
    testimonials: [
      { name: 'রহিম আহমেদ', role: 'ফ্যাশন স্টোর মালিক', text: 'Multi-Store আমার ব্যবসা বদলে দিয়েছে। মাত্র ৩ মাসে শূন্য থেকে ৫০০ অর্ডার!' },
      { name: 'ফাতিমা খান', role: 'কসমেটিক্স সেলার', text: 'সবচেয়ে সহজ প্ল্যাটফর্ম যা আমি ব্যবহার করেছি। আমার কাস্টমাররা চেকআউট এক্সপেরিয়েন্স পছন্দ করে।' },
      { name: 'করিম হোসেন', role: 'ইলেকট্রনিক্স শপ', text: 'অ্যানালিটিক্স ড্যাশবোর্ড আমাকে কাস্টমারদের ভালো বুঝতে সাহায্য করে। রেভিনিউ ২০০% বেড়েছে!' },
    ],
    faqs: [
      { q: 'এটা কি সত্যিই ফ্রি?', a: 'হ্যাঁ! আমাদের ফ্রি প্ল্যানে আপনি ১টি প্রোডাক্ট লিস্ট করতে পারবেন এবং প্রতি মাসে ৫০টি অর্ডার প্রসেস করতে পারবেন বিনামূল্যে।' },
      { q: 'নিজের ডোমেইন ব্যবহার করতে পারব?', a: 'হ্যাঁ, প্রিমিয়াম প্ল্যান ইউজাররা কাস্টম ডোমেইন কানেক্ট করতে পারবেন। আমরা সব টেকনিক্যাল সেটআপ সামলাই।' },
      { q: 'কোন পেমেন্ট মেথড সাপোর্ট করে?', a: 'আমরা বিকাশ, নগদ, কার্ড এবং ক্যাশ অন ডেলিভারি সাপোর্ট করি। আরো পেমেন্ট অপশন শীঘ্রই আসছে।' },
      { q: 'পেমেন্ট কিভাবে পাব?', a: 'আমরা সাপ্তাহিক পেআউট আপনার ব্যাংক অ্যাকাউন্টে প্রসেস করি। ড্যাশবোর্ডে সব আয় ট্র্যাক করতে পারবেন।' },
    ],
  },
};

const FEATURE_ICONS = [Store, Zap, Shield, BarChart3, Globe, Headphones];

export function MarketingLanding() {
  // Use global language context
  const { lang, toggleLang } = useLanguage();
  // Get marketing-specific content based on language
  const content = marketingContent[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Header - Minimal */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">Multi-Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition"
            >
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <Link to="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              {content.login}
            </Link>
            <Link to="/auth/register" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full text-sm transition">
              {content.startFree}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-b from-emerald-50 via-white to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            {content.tagline}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.1]">
            {content.heroTitle1} <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {content.heroTitle2}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-500/30 transition-all hover:shadow-2xl flex items-center gap-2"
            >
              {content.startFree} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="#pricing"
              className="px-10 py-5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl text-lg border-2 border-gray-200 transition"
            >
              {content.viewPricing}
            </Link>
          </div>
          <p className="mt-6 text-gray-500">{content.noCreditCard}</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{content.statsTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mx-auto mb-4">
                <Store className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-emerald-400">500+</p>
              <p className="text-gray-400 mt-2">{content.statsStores}</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-blue-400">50K+</p>
              <p className="text-gray-400 mt-2">{content.statsOrders}</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-2xl mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-purple-400">1K+</p>
              <p className="text-gray-400 mt-2">{content.statsMerchants}</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-2xl mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-yellow-400">৳50M+</p>
              <p className="text-gray-400 mt-2">{content.statsRevenue}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{content.howItWorksTitle}</h2>
            <p className="text-gray-600 text-xl">{content.howItWorksSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-center p-8 bg-white rounded-3xl shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{content.step1Title}</h3>
              <p className="text-gray-600">{content.step1Desc}</p>
            </div>
            <div className="relative text-center p-8 bg-white rounded-3xl shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{content.step2Title}</h3>
              <p className="text-gray-600">{content.step2Desc}</p>
            </div>
            <div className="relative text-center p-8 bg-white rounded-3xl shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{content.step3Title}</h3>
              <p className="text-gray-600">{content.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{content.featuresTitle}</h2>
            <p className="text-gray-600 text-xl">{content.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={i} className="p-8 rounded-3xl bg-gray-50 hover:bg-emerald-50 transition-all border border-gray-100 hover:border-emerald-200">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{content.testimonialsTitle}</h2>
            <p className="text-gray-600 text-xl">{content.testimonialsSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{content.pricingTitle}</h2>
            <p className="text-gray-600 text-xl">{content.pricingSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.plans.map((plan, i) => {
              const isPopular = i === 1;
              return (
                <div
                  key={i}
                  className={`relative p-8 rounded-3xl bg-white shadow-lg border-2 ${
                    isPopular ? 'border-emerald-500 scale-105' : 'border-gray-100'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-full">
                      {content.mostPopular}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <span className="text-5xl font-black text-gray-900">৳{plan.price}</span>
                    <span className="text-gray-500">{content.perMonth}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-600">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/auth/register"
                    className={`block w-full py-4 text-center font-bold rounded-xl transition ${
                      isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{content.faqTitle}</h2>
            <p className="text-gray-600 text-xl">{content.faqSubtitle}</p>
          </div>
          <div className="space-y-4">
            {content.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">?</span>
                  {faq.q}
                </h4>
                <p className="text-gray-600 mt-3 ml-11">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {content.ctaTitle}
          </h2>
          <p className="text-emerald-100 text-xl mb-10 max-w-2xl mx-auto">
            {content.ctaSubtitle}
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-gray-100 text-emerald-600 font-bold rounded-2xl text-xl transition shadow-xl"
          >
            {content.ctaButton} <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Multi-Store SaaS</span>
              </div>
              <p className="text-gray-500 mb-6">The easiest way to start and grow your online business in Bangladesh.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-white transition">Features</Link></li>
                <li><Link to="#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="#" className="hover:text-white transition">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Multi-Store SaaS. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/auth/login" className="hover:text-white">{content.login}</Link>
              <Link to="/auth/register" className="hover:text-white">{content.register}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
