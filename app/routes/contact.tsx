/**
 * Contact Page
 * 
 * Public contact page with phone, email, WhatsApp info
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, Phone, Mail, MessageCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [
  { title: 'Contact Us - Multi-Store SaaS' },
  { name: 'description', content: 'Get in touch with Multi-Store SaaS team. Phone, WhatsApp, and email support available.' },
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
    phoneLabel: 'Phone',
    phoneDesc: 'Call us for immediate support',
    whatsappLabel: 'WhatsApp',
    whatsappDesc: 'Quick chat support',
    emailLabel: 'Email',
    emailDesc: 'For business inquiries',
    addressLabel: 'Office',
    hoursLabel: 'Business Hours',
    openNow: 'Open Now',
    followUs: 'Follow Us',
    backToHome: 'Back to Home',
    startStore: 'Start Your Store',
  },
  bn: {
    title: 'যোগাযোগ করুন',
    subtitle: 'আমাদের টিমের সাথে যোগাযোগ করুন।',
    phoneLabel: 'ফোন',
    phoneDesc: 'তাৎক্ষণিক সাপোর্টের জন্য কল করুন',
    whatsappLabel: 'হোয়াটসঅ্যাপ',
    whatsappDesc: 'দ্রুত চ্যাট সাপোর্ট',
    emailLabel: 'ইমেইল',
    emailDesc: 'ব্যবসায়িক জিজ্ঞাসার জন্য',
    addressLabel: 'অফিস',
    hoursLabel: 'ব্যবসার সময়',
    openNow: 'এখন খোলা',
    followUs: 'আমাদের ফলো করুন',
    backToHome: 'হোমে ফিরে যান',
    startStore: 'স্টোর তৈরি করুন',
  },
};

export default function ContactPage() {
  const { lang, toggleLang } = useLanguage();
  const t = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* Header */}
      <header className="py-6 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Multi-Store</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-sm font-medium transition text-emerald-700"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <Link to="/" className="text-gray-600 hover:text-emerald-600 text-sm">
              {t.backToHome}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Phone */}
            <a 
              href={`tel:+88${CONTACT_INFO.phone}`}
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.phoneLabel}</h3>
              <p className="text-gray-500 text-sm mb-4">{t.phoneDesc}</p>
              <p className="text-2xl font-bold text-emerald-600">{CONTACT_INFO.phone}</p>
            </a>

            {/* WhatsApp */}
            <a 
              href={`https://wa.me/88${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.whatsappLabel}</h3>
              <p className="text-gray-500 text-sm mb-4">{t.whatsappDesc}</p>
              <p className="text-2xl font-bold text-green-600">{CONTACT_INFO.whatsapp}</p>
            </a>

            {/* Email */}
            <a 
              href={`mailto:${CONTACT_INFO.email}`}
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.emailLabel}</h3>
              <p className="text-gray-500 text-sm mb-4">{t.emailDesc}</p>
              <p className="text-lg font-medium text-blue-600 break-all">{CONTACT_INFO.email}</p>
            </a>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{t.addressLabel}</h3>
                  <p className="text-gray-600">{CONTACT_INFO.address}</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{t.hoursLabel}</h3>
                  <p className="text-gray-600">{CONTACT_INFO.hours}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {t.openNow}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-500/30 transition-all"
            >
              {t.startStore}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© {new Date().getFullYear()} Multi-Store SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
