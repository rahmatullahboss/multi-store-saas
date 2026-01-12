/**
 * Tutorials Page
 * 
 * Video tutorials for new merchants with premium dark theme
 * matching the landing page design.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, Play, BookOpen, Package, ShoppingCart, Truck, CreditCard, Settings, ArrowRight, ChevronRight, Globe } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MarketingFooter } from '~/components/MarketingFooter';
import { MarketingHeader } from '~/components/MarketingHeader';
import { OzzylAIChatWidget } from '~/components/landing/OzzylAIChatWidget';

export const meta: MetaFunction = () => [
  { title: 'টিউটোরিয়াল - Ozzyl | নতুন মার্চেন্টদের জন্য গাইড' },
  { name: 'description', content: 'Ozzyl প্ল্যাটফর্ম ব্যবহার করে সহজে অনলাইন স্টোর তৈরি করুন। ভিডিও টিউটোরিয়াল দিয়ে শিখুন।' },
];

const content = {
  en: {
    title: 'Video Tutorials',
    subtitle: 'Learn everything you need to run a successful online store',
    backToHome: 'Back to Home',
    getStarted: 'Get Started Free',
    watchNow: 'Watch Now',
    comingSoon: 'Coming Soon',
    duration: 'min',
    tutorials: [
      {
        id: 'store-setup',
        title: 'Creating Your Store',
        description: 'Learn how to sign up, choose a subdomain, and set up your store in minutes.',
        icon: Store,
        videoUrl: '',
        duration: 5,
        category: 'Getting Started',
      },
      {
        id: 'add-products',
        title: 'Adding Products',
        description: 'Upload photos, set prices, manage inventory, and create product variations.',
        icon: Package,
        videoUrl: '',
        duration: 8,
        category: 'Getting Started',
      },
      {
        id: 'manage-orders',
        title: 'Managing Orders',
        description: 'Track orders, update status, print invoices, and handle COD collections.',
        icon: ShoppingCart,
        videoUrl: '',
        duration: 6,
        category: 'Operations',
      },
      {
        id: 'courier-setup',
        title: 'Courier Integration',
        description: 'Connect Pathao, Steadfast & RedX. Auto-create shipments and track deliveries.',
        icon: Truck,
        videoUrl: '',
        duration: 7,
        category: 'Operations',
      },
      {
        id: 'payment-setup',
        title: 'Payment Setup',
        description: 'Configure bKash, Nagad, and Cash on Delivery payment methods.',
        icon: CreditCard,
        videoUrl: '',
        duration: 5,
        category: 'Settings',
      },
      {
        id: 'store-design',
        title: 'Store Design & Customization',
        description: 'Customize your store theme, logo, colors, and landing page design.',
        icon: Settings,
        videoUrl: '',
        duration: 10,
        category: 'Settings',
      },
    ],
    categories: {
      'Getting Started': 'Getting Started',
      'Operations': 'Operations',
      'Settings': 'Settings',
    },
  },
  bn: {
    title: 'ভিডিও টিউটোরিয়াল',
    subtitle: 'সফল অনলাইন স্টোর চালাতে যা যা জানা দরকার সব শিখুন',
    backToHome: 'হোমে ফিরে যান',
    getStarted: 'ফ্রি শুরু করুন',
    watchNow: 'এখনই দেখুন',
    comingSoon: 'শীঘ্রই আসছে',
    duration: 'মিনিট',
    tutorials: [
      {
        id: 'store-setup',
        title: 'স্টোর তৈরি করা',
        description: 'সাইন আপ, সাবডোমেইন বাছাই এবং মিনিটে স্টোর সেটআপ করা শিখুন।',
        icon: Store,
        videoUrl: '',
        duration: 5,
        category: 'Getting Started',
      },
      {
        id: 'add-products',
        title: 'প্রোডাক্ট যোগ করা',
        description: 'ছবি আপলোড, দাম নির্ধারণ, ইনভেন্টরি ম্যানেজ এবং প্রোডাক্ট ভ্যারিয়েশন তৈরি।',
        icon: Package,
        videoUrl: '',
        duration: 8,
        category: 'Getting Started',
      },
      {
        id: 'manage-orders',
        title: 'অর্ডার ম্যানেজ করা',
        description: 'অর্ডার ট্র্যাক, স্ট্যাটাস আপডেট, ইনভয়েস প্রিন্ট এবং COD কালেকশন।',
        icon: ShoppingCart,
        videoUrl: '',
        duration: 6,
        category: 'Operations',
      },
      {
        id: 'courier-setup',
        title: 'কুরিয়ার সেটআপ',
        description: 'পাঠাও, স্টেডফাস্ট ও রেডএক্স কানেক্ট। অটো শিপমেন্ট ও ডেলিভারি ট্র্যাকিং।',
        icon: Truck,
        videoUrl: '',
        duration: 7,
        category: 'Operations',
      },
      {
        id: 'payment-setup',
        title: 'পেমেন্ট সেটআপ',
        description: 'বিকাশ, নগদ এবং ক্যাশ অন ডেলিভারি পেমেন্ট মেথড কনফিগার করুন।',
        icon: CreditCard,
        videoUrl: '',
        duration: 5,
        category: 'Settings',
      },
      {
        id: 'store-design',
        title: 'স্টোর ডিজাইন ও কাস্টমাইজেশন',
        description: 'থিম, লোগো, রঙ এবং ল্যান্ডিং পেজ ডিজাইন কাস্টমাইজ করুন।',
        icon: Settings,
        videoUrl: '',
        duration: 10,
        category: 'Settings',
      },
    ],
    categories: {
      'Getting Started': 'শুরু করুন',
      'Operations': 'অপারেশন',
      'Settings': 'সেটিংস',
    },
  },
};

export default function TutorialsPage() {
  const { lang, toggleLang } = useLanguage();
  const t = content[lang];

  // Group tutorials by category
  const groupedTutorials = t.tutorials.reduce((acc, tutorial) => {
    const category = tutorial.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tutorial);
    return acc;
  }, {} as Record<string, typeof t.tutorials>);

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      {/* Header */}
      <MarketingHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-full mb-6"
          >
            <BookOpen className="w-4 h-4 text-[#00875F]" />
            <span className="text-sm font-medium text-[#00875F]">
              {lang === 'bn' ? 'নতুন মার্চেন্টদের জন্য' : 'For New Merchants'}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            {t.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {Object.entries(groupedTutorials).map(([category, tutorials], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="mb-12"
            >
              {/* Category Header */}
              <h2 className="text-lg font-semibold text-[#00875F] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00875F] rounded-full" />
                {t.categories[category as keyof typeof t.categories]}
              </h2>
              
              {/* Tutorial Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial, index) => {
                  const IconComponent = tutorial.icon;
                  const hasVideo = tutorial.videoUrl && tutorial.videoUrl.length > 0;
                  
                  return (
                    <motion.div
                      key={tutorial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (index * 0.05) }}
                      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#006A4E]/50 hover:bg-white/[0.08] transition-all duration-300"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#006A4E]/0 to-[#00875F]/0 group-hover:from-[#006A4E]/5 group-hover:to-[#00875F]/5 transition-all duration-300" />
                      
                      <div className="relative z-10">
                        {/* Icon & Duration */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/20 group-hover:scale-110 transition-transform">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                            {tutorial.duration} {t.duration}
                          </span>
                        </div>
                        
                        {/* Title & Description */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00875F] transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-white/50 mb-4 leading-relaxed">
                          {tutorial.description}
                        </p>
                        
                        {/* Watch Button */}
                        {hasVideo ? (
                          <a
                            href={tutorial.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#00875F] hover:text-white transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            {t.watchNow}
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-white/30">
                            <Play className="w-4 h-4" />
                            {t.comingSoon}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {lang === 'bn' ? 'এখনই শুরু করুন!' : 'Start Now!'}
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              {lang === 'bn' 
                ? 'ভিডিও দেখার পাশাপাশি নিজের স্টোর তৈরি করে ফেলুন। ফ্রি প্ল্যানে কোনো ক্রেডিট কার্ড লাগবে না।'
                : 'Create your store while watching tutorials. No credit card required for the free plan.'
              }
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-bold rounded-2xl text-lg shadow-xl shadow-[#006A4E]/30 transition-all"
            >
              {t.getStarted}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
      <OzzylAIChatWidget />
    </div>
  );
}
