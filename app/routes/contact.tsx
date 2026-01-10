/**
 * Contact Page
 * 
 * Premium dark theme contact page matching landing page design.
 * Phone, email, WhatsApp info with glassmorphism cards.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, Phone, Mail, MessageCircle, MapPin, Clock, ArrowRight, Globe, Send } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MarketingFooter } from '~/components/MarketingFooter';
import { OzzylAIChatWidget } from '~/components/landing/OzzylAIChatWidget';

export const meta: MetaFunction = () => [
  { title: 'যোগাযোগ করুন - Multi-Store | সাপোর্ট ও হেল্প' },
  { name: 'description', content: 'Multi-Store টিমের সাথে যোগাযোগ করুন। ফোন, হোয়াটসঅ্যাপ এবং ইমেইল সাপোর্ট উপলব্ধ।' },
];

// Contact information
const CONTACT_INFO = {
  phone: '01570260118',
  whatsapp: '01739416661',
  email: 'rahmatullahzisan@gmail.com',
  address: 'Dhaka, Bangladesh',
  hours: '10:00 AM - 10:00 PM (Everyday)',
};

const content = {
  en: {
    title: 'Contact Us',
    subtitle: 'We\'d love to hear from you. Get in touch with our team.',
    backToHome: 'Back to Home',
    getStarted: 'Get Started Free',
    phoneLabel: 'Phone',
    phoneDesc: 'Call us for immediate support',
    whatsappLabel: 'WhatsApp',
    whatsappDesc: 'Quick chat support - Fastest response',
    emailLabel: 'Email',
    emailDesc: 'For business inquiries',
    addressLabel: 'Office',
    hoursLabel: 'Business Hours',
    openNow: 'Open Now',
    followUs: 'Follow Us',
    startStore: 'Start Your Store',
    ctaTitle: 'Ready to Start Selling?',
    ctaSubtitle: 'Create your free store in minutes. No credit card required.',
  },
  bn: {
    title: 'যোগাযোগ করুন',
    subtitle: 'আমাদের টিমের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।',
    backToHome: 'হোমে ফিরে যান',
    getStarted: 'ফ্রি শুরু করুন',
    phoneLabel: 'ফোন',
    phoneDesc: 'তাৎক্ষণিক সাপোর্টের জন্য কল করুন',
    whatsappLabel: 'হোয়াটসঅ্যাপ',
    whatsappDesc: 'দ্রুত চ্যাট সাপোর্ট - সবচেয়ে দ্রুত রেসপন্স',
    emailLabel: 'ইমেইল',
    emailDesc: 'ব্যবসায়িক জিজ্ঞাসার জন্য',
    addressLabel: 'অফিস',
    hoursLabel: 'ব্যবসার সময়',
    openNow: 'এখন খোলা',
    followUs: 'আমাদের ফলো করুন',
    startStore: 'স্টোর তৈরি করুন',
    ctaTitle: 'বিক্রি শুরু করতে প্রস্তুত?',
    ctaSubtitle: 'মিনিটে আপনার ফ্রি স্টোর তৈরি করুন। ক্রেডিট কার্ড লাগবে না।',
  },
};

export default function ContactPage() {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-full mb-6"
          >
            <Send className="w-4 h-4 text-[#00875F]" />
            <span className="text-sm font-medium text-[#00875F]">
              {lang === 'bn' ? 'আমরা সাহায্য করতে প্রস্তুত' : 'We\'re here to help'}
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

      {/* Contact Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone */}
            <motion.a 
              href={`tel:+88${CONTACT_INFO.phone}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-[#006A4E]/50 hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t.phoneLabel}</h3>
              <p className="text-white/50 text-sm mb-4">{t.phoneDesc}</p>
              <p className="text-2xl font-bold text-blue-400">{CONTACT_INFO.phone}</p>
            </motion.a>

            {/* WhatsApp */}
            <motion.a 
              href={`https://wa.me/88${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-green-500/50 hover:bg-white/[0.08] transition-all duration-300 relative"
            >
              {/* Recommended badge */}
              <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                {lang === 'bn' ? 'প্রস্তাবিত' : 'Recommended'}
              </div>
              
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t.whatsappLabel}</h3>
              <p className="text-white/50 text-sm mb-4">{t.whatsappDesc}</p>
              <p className="text-2xl font-bold text-green-400">{CONTACT_INFO.whatsapp}</p>
            </motion.a>

            {/* Email */}
            <motion.a 
              href={`mailto:${CONTACT_INFO.email}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t.emailLabel}</h3>
              <p className="text-white/50 text-sm mb-4">{t.emailDesc}</p>
              <p className="text-lg font-medium text-purple-400 break-all">{CONTACT_INFO.email}</p>
            </motion.a>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#006A4E]/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#00875F]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{t.addressLabel}</h3>
                  <p className="text-white/60">{CONTACT_INFO.address}</p>
                </div>
              </div>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{t.hoursLabel}</h3>
                  <p className="text-white/60">{CONTACT_INFO.hours}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    {t.openNow}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
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
              {t.ctaTitle}
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              {t.ctaSubtitle}
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-bold rounded-2xl text-lg shadow-xl shadow-[#006A4E]/30 transition-all"
            >
              {t.startStore}
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
