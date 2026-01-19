/**
 * GhorerBazar Footer Component
 * 
 * Features:
 * - Dark elegant footer
 * - Multiple link columns
 * - Contact information
 * - Social media links
 * - Payment methods display
 * - Newsletter signup
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import { 
  Phone, Mail, MapPin, Facebook, Instagram, 
  Youtube, MessageCircle, Send, Clock, CreditCard,
  Truck, Shield, RotateCcw, Award
} from 'lucide-react';
import { GHORER_BAZAR_THEME, GHORER_BAZAR_FONTS } from '../theme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface GhorerBazarFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
}

export function GhorerBazarFooter({ 
  storeName, 
  logo, 
  socialLinks, 
  footerConfig, 
  businessInfo, 
  categories, 
  planType = 'free' 
}: GhorerBazarFooterProps) {
  const [email, setEmail] = useState('');
  const theme = GHORER_BAZAR_THEME;
  const validCategories = categories.filter(Boolean) as string[];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail('');
    alert('ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।');
  };

  return (
    <footer style={{ fontFamily: GHORER_BAZAR_FONTS.body }}>
      {/* Trust Badges Section */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Truck className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">দ্রুত ডেলিভারি</h4>
                <p className="text-sm text-gray-500">সারাদেশে ডেলিভারি</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Shield className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">১০০% অরিজিনাল</h4>
                <p className="text-sm text-gray-500">গ্যারান্টিড কোয়ালিটি</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <RotateCcw className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">ইজি রিটার্ন</h4>
                <p className="text-sm text-gray-500">৭ দিনে রিটার্ন</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <CreditCard className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">সিকিউর পেমেন্ট</h4>
                <p className="text-sm text-gray-500">নিরাপদ লেনদেন</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={{ backgroundColor: theme.primary }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">নিউজলেটারে সাবস্ক্রাইব করুন</h3>
              <p className="text-white/80 text-sm">সেরা অফার এবং নতুন পণ্যের খবর পেতে সাবস্ক্রাইব করুন</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল"
                  required
                  className="flex-1 md:w-72 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">সাবস্ক্রাইব</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ backgroundColor: theme.footerBg }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <Link to="/" className="inline-block mb-4">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-10 w-auto brightness-0 invert" />
                ) : (
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: theme.primary }}
                  >
                    {storeName}
                  </span>
                )}
              </Link>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                {footerConfig?.description || 'আমরা সেরা মানের পণ্য সেরা দামে সরবরাহ করি। আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার।'}
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:opacity-80"
                    style={{ backgroundColor: '#1877f2' }}
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:opacity-80"
                    style={{ backgroundColor: '#e4405f' }}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.youtube && (
                  <a 
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:opacity-80"
                    style={{ backgroundColor: '#ff0000' }}
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.whatsapp && (
                  <a 
                    href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:opacity-80"
                    style={{ backgroundColor: '#25d366' }}
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                দ্রুত লিংক
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white text-sm transition">
                    হোম
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white text-sm transition">
                    আমাদের সম্পর্কে
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition">
                    যোগাযোগ
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition">
                    সাধারণ জিজ্ঞাসা
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                কাস্টমার সার্ভিস
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/track-order" className="text-gray-400 hover:text-white text-sm transition">
                    অর্ডার ট্র্যাক
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-400 hover:text-white text-sm transition">
                    শিপিং পলিসি
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-gray-400 hover:text-white text-sm transition">
                    রিটার্ন পলিসি
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition">
                    প্রাইভেসি পলিসি
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                যোগাযোগ
              </h4>
              <ul className="space-y-4">
                {businessInfo?.phone && (
                  <li>
                    <a 
                      href={`tel:${businessInfo.phone}`}
                      className="flex items-start gap-3 text-gray-400 hover:text-white transition group"
                    >
                      <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                      <span className="text-sm">{businessInfo.phone}</span>
                    </a>
                  </li>
                )}
                {businessInfo?.email && (
                  <li>
                    <a 
                      href={`mailto:${businessInfo.email}`}
                      className="flex items-start gap-3 text-gray-400 hover:text-white transition"
                    >
                      <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                      <span className="text-sm">{businessInfo.email}</span>
                    </a>
                  </li>
                )}
                {businessInfo?.address && (
                  <li className="flex items-start gap-3 text-gray-400">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                    <span className="text-sm">{businessInfo.address}</span>
                  </li>
                )}
                <li className="flex items-start gap-3 text-gray-400">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                  <span className="text-sm">সকাল ১০টা - রাত ১০টা</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-10 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">পেমেন্ট মেথড:</span>
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded px-2 py-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Bkash_logo.png" alt="bKash" className="h-6 w-auto" />
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad" className="h-6 w-auto" />
                  </div>
                  <div className="px-3 py-1.5 bg-yellow-400 rounded text-xs font-bold text-gray-900">
                    COD
                  </div>
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                SSL Secured Payment
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-gray-500 text-sm" suppressHydrationWarning>
                © {new Date().getFullYear()} {storeName}। সর্বস্বত্ব সংরক্ষিত।
              </p>
              
              {/* Viral Loop / Branding */}
              {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
                <a 
                  href="https://ozzyl.com?utm_source=ghorer-bazar-footer&utm_medium=referral" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1.5 text-xs"
                >
                  <span>Powered by</span>
                  <span className="font-bold text-gray-400">Ozzyl</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
