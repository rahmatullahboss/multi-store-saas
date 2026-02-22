/**
 * Starter Store Footer Component (Redesigned)
 *
 * A modern, mobile-first responsive footer for the Starter Store template.
 * Features:
 * - Mobile: Stacked single column layout
 * - Desktop: 4-column grid layout
 * - Dark footer variant (bg-gray-900)
 * - Social icons, payment method icons
 * - Copyright + Powered by Ozzyl
 */

import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { resolveStarterStoreTheme } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig, ThemeConfig } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';
import { useTranslation } from '~/contexts/LanguageContext';

interface StarterStoreFooterProps {
  storeName: string;
  logo?: string | null;
  primaryColor?: string;
  accentColor?: string;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | StoreCategory | null)[];
  planType?: string;
  isPreview?: boolean;
  themeColors?: StoreTemplateTheme;
  config?: ThemeConfig | null;
}

// bKash logo SVG component
function BkashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5h-2v-9h2v9zm5 0h-2v-5h-1v-2h1v-2h2v2h1v2h-1v5z" />
    </svg>
  );
}

export function StarterStoreFooter({
  storeName,
  logo,
  primaryColor = '#4F46E5',
  accentColor = '#F59E0B',
  socialLinks,
  footerConfig: _footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
  themeColors,
  config,
}: StarterStoreFooterProps) {
  const theme = resolveStarterStoreTheme(config, themeColors);
  const { t } = useTranslation();
  const validCategories = categories.filter(Boolean).slice(0, 6) as string[];

  // Free plan: always show branding. Paid plans: merchant can toggle.
  const showPoweredBy = planType === 'free' ? true : (_footerConfig?.showPoweredBy ?? true);

  // Resolve colors
  const resolvedPrimary = primaryColor || theme.primary || '#4F46E5';

  // Default business info for preview only
  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'info@store.com',
    address: 'ঢাকা, বাংলাদেশ',
  };

  const displayBusinessInfo = isPreview ? defaultBusinessInfo : (businessInfo ?? {});

  // Quick links
  const quickLinks = [
    { label: t('home'), to: '/' },
    { label: t('allProducts'), to: '/products' },
    { label: t('collections') || 'Collections', to: '/collections' },
    { label: t('aboutUs'), to: '/pages/about' },
  ];

  // Customer service links
  const customerServiceLinks = [
    { label: t('trackOrder') || 'Track Order', to: '/account/orders' },
    { label: t('returns') || 'Returns', to: '/policies/refund' },
    { label: t('faq') || 'FAQ', to: '/pages/faq' },
    { label: t('contact'), to: '/pages/contact' },
  ];

  return (
    <footer className="bg-gray-900">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand + Description + Social Icons */}
          <div className="space-y-5">
            {/* Logo / Store Name */}
            <PreviewSafeLink to="/" isPreview={isPreview} className="inline-block">
              {logo ? (
                <img
                  src={logo}
                  alt={storeName}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <h3 className="text-xl font-bold text-white">{storeName}</h3>
              )}
            </PreviewSafeLink>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              {t('logoTagline') ||
                t('starterTagline') ||
                'Your one-stop shop for quality products. We deliver happiness to your doorstep.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              {(socialLinks?.facebook || isPreview) && (
                <a
                  href={socialLinks?.facebook || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {(socialLinks?.instagram || isPreview) && (
                <a
                  href={socialLinks?.instagram || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {(socialLinks?.twitter || isPreview) && (
                <a
                  href={socialLinks?.twitter || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {(socialLinks?.youtube || isPreview) && (
                <a
                  href={socialLinks?.youtube || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <PreviewSafeLink
                    to={link.to}
                    isPreview={isPreview}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </PreviewSafeLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t('customerService') || 'Customer Service'}
            </h4>
            <ul className="space-y-3">
              {customerServiceLinks.map((link) => (
                <li key={link.to}>
                  <PreviewSafeLink
                    to={link.to}
                    isPreview={isPreview}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </PreviewSafeLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info + Payment Methods */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                {t('contact')}
              </h4>
              <ul className="space-y-3">
                {displayBusinessInfo.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">{displayBusinessInfo.address}</span>
                  </li>
                )}
                {displayBusinessInfo.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <a
                      href={isPreview ? '#' : `tel:${displayBusinessInfo.phone}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={isPreview ? (e) => e.preventDefault() : undefined}
                    >
                      {displayBusinessInfo.phone}
                    </a>
                  </li>
                )}
                {displayBusinessInfo.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <a
                      href={isPreview ? '#' : `mailto:${displayBusinessInfo.email}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={isPreview ? (e) => e.preventDefault() : undefined}
                    >
                      {displayBusinessInfo.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t('paymentMethods') || 'We Accept'}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {/* bKash */}
                <div className="h-8 px-3 rounded-lg bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-pink-500">bKash</span>
                </div>
                {/* Visa */}
                <div className="h-8 px-3 rounded-lg bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">VISA</span>
                </div>
                {/* Mastercard */}
                <div className="h-8 px-3 rounded-lg bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-400">MC</span>
                </div>
                {/* COD */}
                <div className="h-8 px-3 rounded-lg bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <PreviewSafeLink
              to="/policies/privacy"
              isPreview={isPreview}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {t('privacyPolicy')}
            </PreviewSafeLink>
            <PreviewSafeLink
              to="/policies/refund"
              isPreview={isPreview}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {t('refundPolicy')}
            </PreviewSafeLink>
            <PreviewSafeLink
              to="/policies/shipping"
              isPreview={isPreview}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {t('shippingPolicy')}
            </PreviewSafeLink>
            <PreviewSafeLink
              to="/policies/terms"
              isPreview={isPreview}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {t('termsOfService')}
            </PreviewSafeLink>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-gray-500" suppressHydrationWarning>
              © {new Date().getFullYear()} {storeName}. {t('allRightsReserved')}
            </p>
            <div className="text-gray-400">
              <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} variant="minimal" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
