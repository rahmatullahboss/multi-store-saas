/**
 * About Page
 * 
 * Company about page with founder story and mission
 * Premium dark theme matching landing page.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, Heart, Rocket, Users, Globe, Target, Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { motion } from 'framer-motion';

export const meta: MetaFunction = () => [
  { title: 'আমাদের সম্পর্কে - Multi-Store | বাংলাদেশী ই-কমার্স প্ল্যাটফর্ম' },
  { name: 'description', content: 'Multi-Store - বাংলাদেশী উদ্যোক্তাদের জন্য তৈরি সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। আমাদের মিশন ও ভিশন জানুন।' },
];

const content = {
  en: {
    title: 'About Us',
    subtitle: 'Empowering Bangladeshi e-commerce entrepreneurs',
    backToHome: 'Back to Home',
    getStarted: 'Get Started Free',
    
    missionTitle: 'Our Mission',
    missionText: 'To make e-commerce accessible to every Bangladeshi entrepreneur, from the street vendor in Old Dhaka to the aspiring brand owner in Sylhet.',
    
    visionTitle: 'Our Vision',
    visionText: 'A Bangladesh where anyone with a dream can start selling online in minutes, not months. Where technology empowers, not intimidates.',
    
    storyTitle: 'Our Story',
    storyText1: 'Multi-Store was born from a simple frustration: why is it so hard for Bangladeshi sellers to go online?',
    storyText2: 'Most platforms are built for Western markets. They don\'t understand bKash, Nagad, or Cash on Delivery. They charge in dollars, not taka. And their interfaces are in English only.',
    storyText3: 'We built Multi-Store to change that. A platform that speaks Bangla, accepts our payment methods, and understands the unique challenges of selling in Bangladesh.',
    
    valuesTitle: 'What We Believe',
    values: [
      { icon: Heart, title: 'Customer First', description: 'Every decision starts with: "Will this help our merchants succeed?"' },
      { icon: Zap, title: 'Simple Over Complex', description: 'If your grandmother can\'t use it, we haven\'t made it simple enough.' },
      { icon: Users, title: 'Local Expertise', description: 'Built in Bangladesh, for Bangladesh. We know the market.' },
      { icon: Target, title: 'Fair Pricing', description: 'No hidden fees. No dollar pricing. Honest taka amounts.' },
    ],
    
    statsTitle: 'Our Impact',
    stats: [
      { value: '500+', label: 'Active Merchants' },
      { value: '৳10M+', label: 'GMV Processed' },
      { value: '50K+', label: 'Orders Delivered' },
      { value: '99.9%', label: 'Uptime' },
    ],
  },
  bn: {
    title: 'আমাদের সম্পর্কে',
    subtitle: 'বাংলাদেশী ই-কমার্স উদ্যোক্তাদের শক্তিশালী করছি',
    backToHome: 'হোমে ফিরে যান',
    getStarted: 'ফ্রি শুরু করুন',
    
    missionTitle: 'আমাদের মিশন',
    missionText: 'পুরান ঢাকার রাস্তার বিক্রেতা থেকে সিলেটের উচ্চাকাঙ্ক্ষী ব্র্যান্ড মালিক — প্রতিটি বাংলাদেশী উদ্যোক্তার কাছে ই-কমার্স পৌঁছে দেওয়া।',
    
    visionTitle: 'আমাদের ভিশন',
    visionText: 'এমন একটি বাংলাদেশ যেখানে যে কেউ স্বপ্ন নিয়ে মাস নয়, মিনিটে অনলাইনে বিক্রি শুরু করতে পারে। যেখানে প্রযুক্তি ভয় দেখায় না, শক্তি দেয়।',
    
    storyTitle: 'আমাদের গল্প',
    storyText1: 'Multi-Store জন্ম নিয়েছিল একটি সহজ হতাশা থেকে: বাংলাদেশী বিক্রেতাদের জন্য অনলাইনে আসা এত কঠিন কেন?',
    storyText2: 'বেশিরভাগ প্ল্যাটফর্ম পশ্চিমা বাজারের জন্য তৈরি। তারা বিকাশ, নগদ বা ক্যাশ অন ডেলিভারি বোঝে না। তারা ডলারে চার্জ করে, টাকায় নয়। এবং তাদের ইন্টারফেস শুধু ইংরেজিতে।',
    storyText3: 'আমরা Multi-Store তৈরি করেছি এটা বদলাতে। একটি প্ল্যাটফর্ম যা বাংলায় কথা বলে, আমাদের পেমেন্ট মেথড গ্রহণ করে, এবং বাংলাদেশে বিক্রির অনন্য চ্যালেঞ্জগুলো বোঝে।',
    
    valuesTitle: 'আমরা যা বিশ্বাস করি',
    values: [
      { icon: Heart, title: 'কাস্টমার প্রথম', description: 'প্রতিটি সিদ্ধান্ত শুরু হয়: "এটা কি আমাদের মার্চেন্টদের সফল হতে সাহায্য করবে?"' },
      { icon: Zap, title: 'সহজ > জটিল', description: 'আপনার দাদী যদি ব্যবহার করতে না পারেন, তাহলে আমরা যথেষ্ট সহজ করিনি।' },
      { icon: Users, title: 'লোকাল এক্সপার্টিজ', description: 'বাংলাদেশে তৈরি, বাংলাদেশের জন্য। আমরা বাজার চিনি।' },
      { icon: Target, title: 'সৎ মূল্য', description: 'কোনো লুকানো ফি নেই। ডলার প্রাইসিং নেই। সৎ টাকার অঙ্ক।' },
    ],
    
    statsTitle: 'আমাদের প্রভাব',
    stats: [
      { value: '৫০০+', label: 'সক্রিয় মার্চেন্ট' },
      { value: '৳১ কোটি+', label: 'প্রসেসড GMV' },
      { value: '৫০ হাজার+', label: 'ডেলিভারি সম্পন্ন' },
      { value: '৯৯.৯%', label: 'আপটাইম' },
    ],
  },
};

export default function AboutPage() {
  const { lang, toggleLang } = useLanguage();
  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
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
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 rounded-xl text-sm font-medium transition text-white/80 border border-[#006A4E]/30"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'বাংলা' : 'EN'}
              </button>
              <Link 
                to="/" 
                className="hidden sm:block text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
              >
                {t.backToHome}
              </Link>
              <Link 
                to="/auth/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
              >
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            {t.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-white/60 max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-[#006A4E]/20 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-[#00875F]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t.missionTitle}</h2>
              <p className="text-white/60 leading-relaxed">{t.missionText}</p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-[#006A4E]/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#00875F]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t.visionTitle}</h2>
              <p className="text-white/60 leading-relaxed">{t.visionText}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t.storyTitle}</h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>{t.storyText1}</p>
              <p>{t.storyText2}</p>
              <p>{t.storyText3}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            {t.valuesTitle}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#006A4E]/50 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-white/50">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            {t.statsTitle}
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {t.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-[#00875F] mb-2">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {lang === 'bn' ? 'আমাদের সাথে যোগ দিন' : 'Join Us'}
            </h2>
            <p className="text-white/60 mb-8">
              {lang === 'bn' 
                ? 'আজই আপনার অনলাইন ব্যবসা শুরু করুন।'
                : 'Start your online business journey today.'
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

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#0A0F0D] border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Multi-Store SaaS. {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
