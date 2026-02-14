/**
 * Nova Lux Footer Component - Shopify Standard
 *
 * A world-class luxury footer with all essential e-commerce features.
 * Matches Shopify Dawn theme standards with elegant Nova Lux styling.
 *
 * Features:
 * - Newsletter subscription
 * - Quick Links
 * - Categories section
 * - Contact information with address
 * - Social links
 * - Payment icons (bKash, Nagad, VISA, MasterCard, COD)
 * - Policy links (Privacy, Refund, Shipping, Terms)
 * - Trust/Security badges
 * - Ozzyl branding
 */

import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { NOVALUX_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';

import type { StoreCategory } from '~/templates/store-registry';

interface NovaLuxFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | StoreCategory | null)[];
  planType?: string;
  isPreview?: boolean;
  showNewsletter?: boolean;
}

// Payment Icon Components
function BkashIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: '#e2136e', color: 'white' }}
    >
      bKash
    </div>
  );
}

function NagadIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: '#f26922', color: 'white' }}
    >
      Nagad
    </div>
  );
}

function CodIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold border border-white/30"
      style={{ color: 'white' }}
    >
      <CreditCard className="w-3 h-3 mr-1" />
      COD
    </div>
  );
}

export function NovaLuxFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
  showNewsletter = false,
}: NovaLuxFooterProps) {
  const { t } = useTranslation();
  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    footerBg: NOVALUX_THEME.footerBg,
    footerText: NOVALUX_THEME.footerText,
  };

  const validCategories = categories.filter(Boolean).slice(0, 6);
  const showPoweredBy = true; // Enforce Ozzyl branding globally

  // Default business info for preview
  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'hello@store.com',
    address: 'House 123, Road 5, Gulshan, Dhaka 1212, Bangladesh',
  };

  const displayBusinessInfo = isPreview ? defaultBusinessInfo : businessInfo || defaultBusinessInfo;

  return (
    <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
      {/* Trust Badges Bar - Removed from footer for NovaLux */}
      {/* Users can add Why Choose Us section from theme editor settings */}

      {/* Newsletter Section - Hidden by default for NovaLux */}
      {showNewsletter && (
        <div className="py-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3
              className="text-3xl lg:text-4xl font-semibold mb-4"
              style={{ fontFamily: NOVALUX_THEME.fontHeading }}
            >
              {t('joinFamily', { name: storeName })}
            </h3>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">{t('subscribeText')}</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email..."
                className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ background: NOVALUX_THEME.accentGradient, color: THEME.primary }}
              >
                {t('subscribe')}
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
            {logo && <img src={logo} alt={storeName} className="h-10 w-auto object-contain mb-2" />}
            <h4
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: NOVALUX_THEME.fontHeading }}
            >
              {storeName}
            </h4>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              {footerConfig?.description || t('luxeDescription')}
            </p>

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
              <p className="text-xs text-white/50 mb-3">{t('weAccept')}</p>
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
              {t('quickLinks')}
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <PreviewSafeLink
                  to="/"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  isPreview={isPreview}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  {t('home')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/products"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  isPreview={isPreview}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  {t('shopAll')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/pages/about"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  isPreview={isPreview}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  {t('aboutUs')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/contact"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  isPreview={isPreview}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  {t('contact')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/track-order"
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  isPreview={isPreview}
                >
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  {t('trackOrder')}
                </PreviewSafeLink>
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
                {t('collections')}
              </h5>
              <ul className="space-y-3 text-sm">
                {validCategories.map((cat) => {
                  const title =
                    typeof cat === 'object' && cat !== null
                      ? (cat as StoreCategory).title
                      : (cat as string);
                  return (
                    <li key={title}>
                      <PreviewSafeLink
                        to={`/category/${encodeURIComponent(title.trim().toLowerCase().replace(/\\s+/g, ' ')).replace(/%20/g, '-')}`}
                        className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                        isPreview={isPreview}
                      >
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {title}
                      </PreviewSafeLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h5
              className="font-semibold uppercase text-sm tracking-wider mb-6"
              style={{ color: THEME.accent }}
            >
              {t('getInTouch')}
            </h5>
            <ul className="space-y-4 text-sm">
              {displayBusinessInfo.email && (
                <li className="flex items-center gap-3 text-white/70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Mail className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <a
                    href={isPreview ? '#' : `mailto:${displayBusinessInfo.email}`}
                    className="hover:text-white transition-colors"
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo.email}
                  </a>
                </li>
              )}
              {displayBusinessInfo.phone && (
                <li className="flex items-center gap-3 text-white/70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Phone className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <a
                    href={isPreview ? '#' : `tel:${displayBusinessInfo.phone}`}
                    className="hover:text-white transition-colors"
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo.phone}
                  </a>
                </li>
              )}
              {displayBusinessInfo.address && (
                <li className="flex items-start gap-3 text-white/70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <span className="leading-relaxed">{displayBusinessInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Policies Links */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <PreviewSafeLink
              to="/policies/privacy"
              className="text-white/60 hover:text-white transition-colors"
              isPreview={isPreview}
            >
              {t('privacyPolicy')}
            </PreviewSafeLink>
            <span className="text-white/20 hidden md:inline">•</span>
            <PreviewSafeLink
              to="/policies/refund"
              className="text-white/60 hover:text-white transition-colors"
              isPreview={isPreview}
            >
              {t('refundPolicy')}
            </PreviewSafeLink>
            <span className="text-white/20 hidden md:inline">•</span>
            <PreviewSafeLink
              to="/policies/shipping"
              className="text-white/60 hover:text-white transition-colors"
              isPreview={isPreview}
            >
              {t('shippingPolicy')}
            </PreviewSafeLink>
            <span className="text-white/20 hidden md:inline">•</span>
            <PreviewSafeLink
              to="/policies/terms"
              className="text-white/60 hover:text-white transition-colors"
              isPreview={isPreview}
            >
              {t('termsOfService')}
            </PreviewSafeLink>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm" suppressHydrationWarning>
              © {new Date().getFullYear()} {storeName}. {t('allRightsReserved')}
            </p>
            <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}
