import React from 'react';
import { Link } from '@remix-run/react';
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  Youtube,
  Linkedin,
  Globe,
} from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { OzzylBranding } from '~/components/store-templates/shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';
import type { ThemeConfig } from '~/lib/theme-engine-types';

// ============================================================================
// TYPES
// ============================================================================

interface StandardFooterProps {
  storeName: string;
  logo?: string | null;
  config: ThemeConfig;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  planType?: string;
  isPreview?: boolean;
  showNewsletter?: boolean;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function BkashIcon() {
  return (
    <img
      src="https://cdn.jsdelivr.net/gh/zzseba78/payment-web-font/png/bkash.png"
      alt="bKash"
      className="h-8 w-auto rounded bg-white p-1 object-contain"
      style={{ minWidth: '40px' }}
      onError={(e) => {
        // Fallback if image fails
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }}
    />
  );
}

function NagadIcon() {
  return (
    <img
      src="https://cdn.jsdelivr.net/gh/zzseba78/payment-web-font/png/nagad.png"
      alt="Nagad"
      className="h-8 w-auto rounded bg-white p-1 object-contain"
      style={{ minWidth: '40px' }}
    />
  );
}

function CodIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold border border-white/30 bg-white/10"
      style={{ color: 'white', minWidth: '60px' }}
    >
      <CreditCard className="w-3 h-3 mr-1" />
      COD
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StandardFooter({
  storeName,
  logo,
  config,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
  showNewsletter = true,
}: StandardFooterProps) {
  const { lang, setLang } = useLanguage();

  // Derive colors from theme config or fallback to defaults
  const THEME = {
    primary: config.colors?.primary || '#1C1C1E',
    accent: config.colors?.accent || '#C4A35A',
    footerBg: config.colors?.footerBg || config.colors?.primary || '#1C1C1E',
    footerText: config.colors?.footerText || '#FAFAFA',
    fontHeading: config.typography?.fontFamilyHeading || 'sans-serif',
    accentGradient:
      config.colors?.accentGradient ||
      `linear-gradient(135deg, ${config.colors?.accent || '#C4A35A'} 0%, ${config.colors?.accent || '#C4A35A'} 100%)`,
  };

  const validCategories = categories.filter(Boolean).slice(0, 6) as string[];
  const showPoweredBy = true; // Enforce Ozzyl branding globally
  const showTrustBadges = footerConfig?.showTrustBadges ?? true;

  // Default business info for preview
  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'hello@store.com',
    address: 'House 123, Road 5, Gulshan, Dhaka 1212, Bangladesh',
  };

  const displayBusinessInfo = isPreview ? businessInfo || defaultBusinessInfo : businessInfo;

  return (
    <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
      {/* Trust Badges Bar */}
      {showTrustBadges && (
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent + '20' }}
                >
                  <Truck className="w-5 h-5" style={{ color: THEME.accent }} />
                </div>
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs opacity-60">On orders over ৳1,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent + '20' }}
                >
                  <RotateCcw className="w-5 h-5" style={{ color: THEME.accent }} />
                </div>
                <div>
                  <p className="font-medium text-sm">Easy Returns</p>
                  <p className="text-xs opacity-60">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent + '20' }}
                >
                  <Shield className="w-5 h-5" style={{ color: THEME.accent }} />
                </div>
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-xs opacity-60">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: THEME.accent + '20' }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: THEME.accent }} />
                </div>
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs opacity-60">Available nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="py-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3
              className="text-3xl lg:text-4xl font-semibold mb-4"
              style={{ fontFamily: THEME.fontHeading }}
            >
              Join the {storeName} Family
            </h3>
            <p className="opacity-60 mb-8 max-w-lg mx-auto">
              Subscribe for exclusive offers, early access to new arrivals, and curated content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ background: THEME.accentGradient, color: THEME.primary }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-auto object-contain mb-4" />
            ) : (
              <h4 className="text-2xl font-semibold mb-4" style={{ fontFamily: THEME.fontHeading }}>
                {storeName}
              </h4>
            )}
            <p className="opacity-60 text-sm leading-relaxed mb-6 max-w-sm">
              {footerConfig?.description ||
                'Curating exceptional products for those who appreciate the finer things in life. Experience luxury redefined.'}
            </p>

            {/* Language Selector */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 opacity-70" />
                <span className="opacity-70">Language:</span>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-70'}`}
                >
                  English
                </button>
                <span className="opacity-30">|</span>
                <button
                  onClick={() => setLang('bn')}
                  className={`px-2 py-1 rounded transition-colors ${lang === 'bn' ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-70'}`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {(socialLinks?.instagram || isPreview) && (
                <a
                  href={socialLinks?.instagram || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {(socialLinks?.facebook || isPreview) && (
                <a
                  href={socialLinks?.facebook || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {(socialLinks?.twitter || isPreview) && (
                <a
                  href={socialLinks?.twitter || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Payment Icons */}
            <div>
              <p className="text-xs opacity-50 mb-3">We Accept</p>
              <div className="flex flex-wrap gap-2">
                <BkashIcon />
                <NagadIcon />

                <CodIcon />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5
              className="font-semibold uppercase text-sm tracking-wider mb-6"
              style={{ color: THEME.accent }}
            >
              Quick Links
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/about"
                  className="opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {validCategories.length > 0 && (
            <div>
              <h5
                className="font-semibold uppercase text-sm tracking-wider mb-6"
                style={{ color: THEME.accent }}
              >
                Collections
              </h5>
              <ul className="space-y-3 text-sm">
                {validCategories.map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/?category=${encodeURIComponent(cat)}`}
                      className="opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h5
              className="font-semibold uppercase text-sm tracking-wider mb-6"
              style={{ color: THEME.accent }}
            >
              Get in Touch
            </h5>
            <ul className="space-y-4 text-sm">
              {displayBusinessInfo?.email && (
                <li className="flex items-center gap-3 opacity-70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Mail className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <a
                    href={isPreview ? '#' : `mailto:${displayBusinessInfo.email}`}
                    className="hover:opacity-100 transition-colors"
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo?.email}
                  </a>
                </li>
              )}
              {displayBusinessInfo?.phone && (
                <li className="flex items-center gap-3 opacity-70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Phone className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <a
                    href={isPreview ? '#' : `tel:${displayBusinessInfo.phone}`}
                    className="hover:opacity-100 transition-colors"
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo?.phone}
                  </a>
                </li>
              )}
              {displayBusinessInfo?.address && (
                <li className="flex items-start gap-3 opacity-70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <span className="leading-relaxed">{displayBusinessInfo?.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Policies Links */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <Link to="/policies/privacy" className="opacity-60 hover:opacity-100 transition-colors">
              Privacy Policy
            </Link>
            <span className="opacity-20 hidden md:inline">•</span>
            <Link to="/policies/refund" className="opacity-60 hover:opacity-100 transition-colors">
              Refund Policy
            </Link>
            <span className="opacity-20 hidden md:inline">•</span>
            <Link
              to="/policies/shipping"
              className="opacity-60 hover:opacity-100 transition-colors"
            >
              Shipping Policy
            </Link>
            <span className="opacity-20 hidden md:inline">•</span>
            <Link to="/policies/terms" className="opacity-60 hover:opacity-100 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="opacity-50 text-sm">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}
