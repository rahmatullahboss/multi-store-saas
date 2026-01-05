/**
 * SaaS Marketing Landing Page
 * 
 * Shown on main domain (multi-store-saas.pages.dev)
 * Features: Hero, Features, Pricing, CTA
 */

import { Link } from '@remix-run/react';
import { Store, Zap, Shield, BarChart3, Globe, Headphones, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';

// Translations
const translations = {
  en: {
    tagline: '#1 E-commerce Platform in Bangladesh',
    heroTitle1: 'Launch Your Online Store',
    heroTitle2: 'in 5 Minutes',
    heroSubtitle: 'No coding required. Get a professional e-commerce store with custom domain, payment integration, and powerful dashboard.',
    startFree: 'Start Free Today',
    viewPricing: 'View Pricing',
    noCreditCard: 'No credit card required • Free forever plan available',
    login: 'Login',
    featuresTitle: 'Everything You Need to Sell Online',
    featuresSubtitle: 'Powerful features to grow your business',
    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Start free, upgrade when you\'re ready',
    ctaTitle: 'Ready to Start Your Online Business?',
    ctaSubtitle: 'Join thousands of merchants who trust Multi-Store for their e-commerce needs.',
    ctaButton: 'Create Your Free Store',
    perMonth: '/month',
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
    featuresTitle: 'অনলাইনে বিক্রি করতে যা যা দরকার',
    featuresSubtitle: 'আপনার ব্যবসা বাড়াতে শক্তিশালী ফিচার',
    pricingTitle: 'সহজ, স্বচ্ছ মূল্য',
    pricingSubtitle: 'ফ্রি শুরু করুন, প্রস্তুত হলে আপগ্রেড করুন',
    ctaTitle: 'আপনার অনলাইন ব্যবসা শুরু করতে প্রস্তুত?',
    ctaSubtitle: 'হাজার হাজার মার্চেন্ট যারা তাদের ই-কমার্স প্রয়োজনে Multi-Store-কে বিশ্বাস করে তাদের সাথে যোগ দিন।',
    ctaButton: 'আপনার ফ্রি স্টোর তৈরি করুন',
    perMonth: '/মাস',
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
  },
};

const FEATURE_ICONS = [Store, Zap, Shield, BarChart3, Globe, Headphones];

export function MarketingLanding() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Multi-Store</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'বাংলা' : 'EN'}
              </button>
              <Link to="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                {t.login}
              </Link>
              <Link to="/auth/register" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition">
                {t.startFree}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            {t.tagline}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            {t.heroTitle1} <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-lg shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl flex items-center gap-2"
            >
              {t.startFree} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="#pricing"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-lg border border-gray-200 transition"
            >
              {t.viewPricing}
            </Link>
          </div>
          <p className="mt-4 text-gray-500 text-sm">{t.noCreditCard}</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.featuresTitle}</h2>
            <p className="text-gray-600 text-lg">{t.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={i} className="p-6 rounded-2xl bg-gray-50 hover:bg-emerald-50 transition-colors">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.pricingTitle}</h2>
            <p className="text-gray-600 text-lg">{t.pricingSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.plans.map((plan, i) => {
              const isPopular = i === 1;
              return (
                <div
                  key={i}
                  className={`relative p-8 rounded-2xl bg-white shadow-sm ${
                    isPopular ? 'ring-2 ring-emerald-500 shadow-lg' : 'border border-gray-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                      {lang === 'en' ? 'Most Popular' : 'সবচেয়ে জনপ্রিয়'}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">৳{plan.price}</span>
                    <span className="text-gray-500">{t.perMonth}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-600">
                        <Check className="w-5 h-5 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/auth/register"
                    className={`block w-full py-3 text-center font-semibold rounded-xl transition ${
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            {t.ctaSubtitle}
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-emerald-600 font-semibold rounded-xl text-lg transition"
          >
            {t.ctaButton} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Multi-Store SaaS</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Multi-Store SaaS. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/auth/login" className="hover:text-white">{t.login}</Link>
              <Link to="/auth/register" className="hover:text-white">{lang === 'en' ? 'Register' : 'রেজিস্টার'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

