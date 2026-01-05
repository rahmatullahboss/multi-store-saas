/**
 * SaaS Marketing Landing Page - Procloudify Inspired Design
 * 
 * Features:
 * - Lavender purple color scheme with soft gradients
 * - Dotted grid background pattern
 * - Glassmorphism header and cards
 * - Serif font for headings (premium feel)
 * - Bento-box style feature layouts
 * - Modern animations and hover effects
 */

import { Link } from '@remix-run/react';
import { Store, Zap, Shield, BarChart3, Globe, Headphones, Check, ArrowRight, Star, Users, ShoppingBag, TrendingUp, Sparkles, Rocket, CreditCard, MessageCircle, ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';

// Marketing page specific translations
const marketingContent = {
  en: {
    badge: 'Recommended by Web Experts',
    heroTitle1: 'Build Your Online Store',
    heroTitle2: 'in Minutes, Not Days',
    heroSubtitle: 'The complete e-commerce platform for Bangladeshi entrepreneurs. No coding required, beautiful templates, and powerful features to grow your business.',
    getStarted: 'Get Started Free',
    talkExpert: 'Talk with Expert',
    noCreditCard: 'No credit card required • 14-day free trial',
    login: 'Login',
    register: 'Register',
    
    // Stats
    statsStores: 'Active Stores',
    statsOrders: 'Orders Processed',
    statsMerchants: 'Happy Merchants',
    statsUptime: 'Uptime',
    
    // Features Section
    featuresTitle: 'Everything in One Place',
    featuresSubtitle: 'All the tools you need to succeed online',
    
    // Pricing
    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Choose the plan that fits your business',
    perMonth: '/month',
    mostPopular: 'Most Popular',
    getStartedCta: 'Get Started',
    
    // How it works
    howTitle: 'Launch in 3 Simple Steps',
    howSubtitle: 'From sign up to your first sale in minutes',
    step1: 'Create Account',
    step1Desc: 'Sign up with email. Takes 30 seconds.',
    step2: 'Add Products',
    step2Desc: 'Upload your products and set prices.',
    step3: 'Start Selling',
    step3Desc: 'Share your store and accept orders.',
    
    // Testimonials
    testimonialsTitle: 'Loved by Thousands',
    testimonialsSubtitle: 'See what our merchants are saying',
    
    // FAQ
    faqTitle: 'Common Questions',
    faqSubtitle: 'Everything you need to know',
    
    // CTA
    ctaTitle: 'Ready to Grow Your Business?',
    ctaSubtitle: 'Join thousands of successful merchants today',
    ctaButton: 'Start Your Free Store',
    
    features: [
      { title: 'Your Own Subdomain', description: 'Get yourstore.digitalcare.site instantly - or connect your own domain.', icon: 'globe' },
      { title: 'Lightning Fast', description: 'Built on edge computing. Your store loads instantly worldwide.', icon: 'zap' },
      { title: 'bKash & Nagad Ready', description: 'Accept mobile payments, cards, and Cash on Delivery seamlessly.', icon: 'credit' },
      { title: 'Real-time Analytics', description: 'Track sales, customers, and inventory in a beautiful dashboard.', icon: 'chart' },
      { title: 'Bangla + English', description: 'Full bilingual support for your Bangladeshi customers.', icon: 'globe' },
      { title: '24/7 Support', description: 'We are here to help you succeed, anytime, anywhere.', icon: 'headphones' },
    ],
    
    plans: [
      { name: 'Free', price: '0', description: 'Perfect to get started', features: ['1 Product', '50 Orders/month', 'Landing Page Mode', 'Cash on Delivery', 'Basic Analytics'], cta: 'Start Free', highlight: false },
      { name: 'Starter', price: '500', description: 'For growing businesses', features: ['50 Products', '500 Orders/month', 'Full Store Mode', 'All Payment Methods', 'Advanced Analytics', 'Email Notifications'], cta: 'Get Started', highlight: true },
      { name: 'Premium', price: '1,500', description: 'For established stores', features: ['Unlimited Products', 'Unlimited Orders', 'Custom Domain', 'Priority Support', 'Team Members', 'API Access'], cta: 'Go Premium', highlight: false },
    ],
    
    testimonials: [
      { name: 'Rahim Ahmed', role: 'Fashion Store Owner', text: 'Multi-Store transformed my business. I went from zero to 500 orders in just 3 months!', avatar: 'RA' },
      { name: 'Fatima Khan', role: 'Cosmetics Seller', text: 'The easiest platform I\'ve ever used. My customers love the smooth checkout experience.', avatar: 'FK' },
      { name: 'Karim Hossain', role: 'Electronics Shop', text: 'The analytics dashboard helps me understand my customers better. Revenue increased 200%!', avatar: 'KH' },
    ],
    
    faqs: [
      { q: 'Is it really free to start?', a: 'Yes! Our Free plan lets you list 1 product and process up to 50 orders per month at no cost. Perfect for testing.' },
      { q: 'Can I use my own domain?', a: 'Absolutely! Premium plan users can connect their custom domain. We handle all the SSL and DNS setup automatically.' },
      { q: 'What payment methods are supported?', a: 'We support bKash, Nagad, Cards via Stripe, and Cash on Delivery. More payment options coming soon.' },
      { q: 'How fast can I set up my store?', a: 'Most merchants have their store live within 10 minutes. Just sign up, add a product, and share your link!' },
    ],
  },
  bn: {
    badge: 'ওয়েব এক্সপার্টদের পছন্দ',
    heroTitle1: 'আপনার অনলাইন স্টোর তৈরি করুন',
    heroTitle2: 'মিনিটে, দিনে নয়',
    heroSubtitle: 'বাংলাদেশী উদ্যোক্তাদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। কোডিং প্রয়োজন নেই, সুন্দর টেমপ্লেট, এবং আপনার ব্যবসা বাড়ানোর শক্তিশালী ফিচার।',
    getStarted: 'ফ্রি শুরু করুন',
    talkExpert: 'এক্সপার্টের সাথে কথা বলুন',
    noCreditCard: 'কোনো ক্রেডিট কার্ড প্রয়োজন নেই • ১৪ দিনের ফ্রি ট্রায়াল',
    login: 'লগইন',
    register: 'রেজিস্টার',
    
    statsStores: 'সক্রিয় স্টোর',
    statsOrders: 'প্রসেসড অর্ডার',
    statsMerchants: 'সন্তুষ্ট মার্চেন্ট',
    statsUptime: 'আপটাইম',
    
    featuresTitle: 'সব কিছু এক জায়গায়',
    featuresSubtitle: 'অনলাইনে সফল হতে যা দরকার সব',
    
    pricingTitle: 'সহজ, স্বচ্ছ মূল্য',
    pricingSubtitle: 'আপনার ব্যবসার জন্য সঠিক প্ল্যান বেছে নিন',
    perMonth: '/মাস',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    getStartedCta: 'শুরু করুন',
    
    howTitle: '৩টি সহজ ধাপে শুরু করুন',
    howSubtitle: 'সাইন আপ থেকে প্রথম বিক্রি মিনিটে',
    step1: 'অ্যাকাউন্ট তৈরি',
    step1Desc: 'ইমেইল দিয়ে সাইন আপ। ৩০ সেকেন্ড লাগে।',
    step2: 'প্রোডাক্ট যোগ',
    step2Desc: 'প্রোডাক্ট আপলোড করুন এবং দাম সেট করুন।',
    step3: 'বিক্রি শুরু',
    step3Desc: 'স্টোর শেয়ার করুন এবং অর্ডার নিন।',
    
    testimonialsTitle: 'হাজারো মানুষের ভালোবাসা',
    testimonialsSubtitle: 'আমাদের মার্চেন্টরা কি বলছে দেখুন',
    
    faqTitle: 'সাধারণ প্রশ্ন',
    faqSubtitle: 'যা জানা দরকার সব',
    
    ctaTitle: 'ব্যবসা বাড়াতে প্রস্তুত?',
    ctaSubtitle: 'আজই হাজারো সফল মার্চেন্টদের সাথে যোগ দিন',
    ctaButton: 'ফ্রি স্টোর শুরু করুন',
    
    features: [
      { title: 'নিজের সাবডোমেইন', description: 'yourstore.digitalcare.site পান তাৎক্ষণিক - অথবা নিজের ডোমেইন কানেক্ট করুন।', icon: 'globe' },
      { title: 'অতি দ্রুত', description: 'এজ কম্পিউটিং-এ তৈরি। স্টোর সারা বিশ্বে তাৎক্ষণিক লোড হয়।', icon: 'zap' },
      { title: 'বিকাশ ও নগদ রেডি', description: 'মোবাইল পেমেন্ট, কার্ড এবং ক্যাশ অন ডেলিভারি সহজে নিন।', icon: 'credit' },
      { title: 'রিয়েল-টাইম অ্যানালিটিক্স', description: 'সুন্দর ড্যাশবোর্ডে সেলস, কাস্টমার এবং ইনভেন্টরি ট্র্যাক করুন।', icon: 'chart' },
      { title: 'বাংলা + ইংরেজি', description: 'আপনার বাংলাদেশী গ্রাহকদের জন্য সম্পূর্ণ দ্বিভাষিক সাপোর্ট।', icon: 'globe' },
      { title: '২৪/৭ সাপোর্ট', description: 'যেকোনো সময়, যেকোনো জায়গা থেকে সাহায্য পান।', icon: 'headphones' },
    ],
    
    plans: [
      { name: 'ফ্রি', price: '০', description: 'শুরু করার জন্য পারফেক্ট', features: ['১টি প্রোডাক্ট', '৫০ অর্ডার/মাস', 'ল্যান্ডিং পেজ মোড', 'ক্যাশ অন ডেলিভারি', 'বেসিক অ্যানালিটিক্স'], cta: 'ফ্রি শুরু', highlight: false },
      { name: 'স্টার্টার', price: '৫০০', description: 'বাড়তে থাকা ব্যবসার জন্য', features: ['৫০টি প্রোডাক্ট', '৫০০ অর্ডার/মাস', 'ফুল স্টোর মোড', 'সব পেমেন্ট মেথড', 'অ্যাডভান্সড অ্যানালিটিক্স', 'ইমেইল নোটিফিকেশন'], cta: 'শুরু করুন', highlight: true },
      { name: 'প্রিমিয়াম', price: '১,৫০০', description: 'প্রতিষ্ঠিত স্টোরের জন্য', features: ['আনলিমিটেড প্রোডাক্ট', 'আনলিমিটেড অর্ডার', 'কাস্টম ডোমেইন', 'প্রায়োরিটি সাপোর্ট', 'টিম মেম্বার', 'API অ্যাক্সেস'], cta: 'প্রিমিয়াম নিন', highlight: false },
    ],
    
    testimonials: [
      { name: 'রহিম আহমেদ', role: 'ফ্যাশন স্টোর মালিক', text: 'Multi-Store আমার ব্যবসা বদলে দিয়েছে। মাত্র ৩ মাসে শূন্য থেকে ৫০০ অর্ডার!', avatar: 'রআ' },
      { name: 'ফাতিমা খান', role: 'কসমেটিক্স সেলার', text: 'সবচেয়ে সহজ প্ল্যাটফর্ম। আমার কাস্টমাররা চেকআউট এক্সপেরিয়েন্স পছন্দ করে।', avatar: 'ফখ' },
      { name: 'করিম হোসেন', role: 'ইলেকট্রনিক্স শপ', text: 'অ্যানালিটিক্স ড্যাশবোর্ড অসাধারণ। রেভিনিউ ২০০% বেড়েছে!', avatar: 'কহ' },
    ],
    
    faqs: [
      { q: 'এটা কি সত্যিই ফ্রি?', a: 'হ্যাঁ! ফ্রি প্ল্যানে ১টি প্রোডাক্ট এবং মাসে ৫০টি অর্ডার বিনামূল্যে। টেস্টের জন্য পারফেক্ট।' },
      { q: 'নিজের ডোমেইন ব্যবহার করতে পারব?', a: 'অবশ্যই! প্রিমিয়াম ইউজাররা কাস্টম ডোমেইন কানেক্ট করতে পারেন। আমরা SSL এবং DNS সেটআপ অটোমেটিক করি।' },
      { q: 'কোন পেমেন্ট মেথড সাপোর্ট করে?', a: 'বিকাশ, নগদ, স্ট্রাইপ কার্ড এবং ক্যাশ অন ডেলিভারি সাপোর্ট করি। আরো অপশন শীঘ্রই আসছে।' },
      { q: 'কত দ্রুত স্টোর সেটআপ হয়?', a: 'বেশিরভাগ মার্চেন্ট ১০ মিনিটে স্টোর লাইভ করেন। সাইন আপ, প্রোডাক্ট যোগ, লিংক শেয়ার!' },
    ],
  },
};

// Dotted Grid Background CSS
const DottedGridBg = () => (
  <div 
    className="absolute inset-0 opacity-40"
    style={{
      backgroundImage: `radial-gradient(circle, rgba(150, 129, 250, 0.3) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}
  />
);

export function MarketingLanding() {
  const { lang, toggleLang } = useLanguage();
  const content = marketingContent[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white overflow-hidden">
      {/* Glassmorphism Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/80 backdrop-blur-xl border border-violet-200/50 rounded-2xl px-6 py-3 shadow-lg shadow-violet-500/5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Multi-Store
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 rounded-xl text-sm font-medium transition text-violet-700"
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
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-violet-500/25"
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/80 backdrop-blur-sm border border-violet-200 text-violet-700 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            {content.badge}
            <div className="flex -space-x-2 ml-2">
              {['👩‍💼', '👨‍💻', '👩‍🎨'].map((emoji, i) => (
                <span key={i} className="w-6 h-6 bg-white rounded-full border-2 border-violet-100 flex items-center justify-center text-xs">
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
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
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
              className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-violet-500/30 transition-all hover:shadow-2xl hover:shadow-violet-500/40 flex items-center gap-2"
            >
              {content.getStarted}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="#"
              className="px-8 py-4 bg-white hover:bg-violet-50 text-violet-700 font-semibold rounded-2xl text-lg border-2 border-violet-200 transition flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {content.talkExpert}
            </Link>
          </div>
          
          <p className="mt-6 text-gray-500 text-sm">{content.noCreditCard}</p>
        </div>
      </section>

      {/* Stats Section - Dark */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-violet-950 to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-violet-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-violet-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">500+</p>
              <p className="text-violet-300">{content.statsStores}</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">50K+</p>
              <p className="text-purple-300">{content.statsOrders}</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-pink-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">1K+</p>
              <p className="text-pink-300">{content.statsMerchants}</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">99.9%</p>
              <p className="text-emerald-300">{content.statsUptime}</p>
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
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-violet-300 to-transparent z-0" />
                )}
                
                <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-xl hover:shadow-violet-500/10 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
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
      <section className="py-24 px-4 bg-gradient-to-b from-violet-50 to-white relative">
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
              const icons = { globe: Globe, zap: Zap, credit: CreditCard, chart: BarChart3, headphones: Headphones };
              const Icon = icons[feature.icon as keyof typeof icons] || Globe;
              const isLarge = i === 0 || i === 3;
              
              return (
                <div 
                  key={i} 
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-2xl hover:shadow-violet-500/10 ${isLarge ? 'md:col-span-1' : ''}`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-violet-600" />
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
                    ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-2xl shadow-violet-500/30 scale-105 border-2 border-violet-400' 
                    : 'bg-white border-2 border-gray-100 hover:border-violet-200 hover:shadow-xl'
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
                <p className={`mb-6 ${plan.highlight ? 'text-violet-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    ৳{plan.price}
                  </span>
                  <span className={plan.highlight ? 'text-violet-200' : 'text-gray-500'}>
                    {content.perMonth}
                  </span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-3 ${plan.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-violet-300' : 'text-violet-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/auth/register"
                  className={`block w-full py-4 text-center font-bold rounded-xl transition ${
                    plan.highlight
                      ? 'bg-white hover:bg-violet-50 text-violet-700'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25'
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
      <section className="py-24 px-4 bg-gradient-to-b from-violet-50 to-white relative">
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
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-xl"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">
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
                className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 hover:border-violet-300 transition-all"
              >
                <h4 className="text-lg font-bold text-gray-900 flex items-start gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg shadow-violet-500/30">
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
      <section className="py-24 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 relative overflow-hidden">
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
          <p className="text-violet-200 text-xl mb-10 max-w-2xl mx-auto">
            {content.ctaSubtitle}
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-violet-50 text-violet-700 font-bold rounded-2xl text-xl transition shadow-2xl hover:shadow-white/20"
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
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-violet-600 rounded-xl flex items-center justify-center transition">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-violet-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Features</Link></li>
                <li><Link to="#pricing" className="hover:text-violet-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Pricing</Link></li>
                <li><Link to="#" className="hover:text-violet-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-violet-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Help Center</Link></li>
                <li><Link to="#" className="hover:text-violet-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Contact</Link></li>
                <li><Link to="#" className="hover:text-violet-400 transition flex items-center gap-1"><ChevronRight className="w-4 h-4" />Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Multi-Store SaaS. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/auth/login" className="hover:text-violet-400 transition">{content.login}</Link>
              <Link to="/auth/register" className="hover:text-violet-400 transition">{content.register}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
