/**
 * Starter Store Footer Component
 *
 * A clean, modern footer for the Starter Store template.
 * Displays store info, quick links, contact info, and social links.
 * Works in both preview and live modes.
 */


import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { STARTER_STORE_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';
import { useTranslation } from '~/contexts/LanguageContext';

const theme = STARTER_STORE_THEME;

interface StarterStoreFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  planType?: string;
  isPreview?: boolean;
}

export function StarterStoreFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
}: StarterStoreFooterProps) {
  const { t } = useTranslation();
  const validCategories = categories.filter(Boolean).slice(0, 6) as string[];
  const showPoweredBy = footerConfig?.showPoweredBy ?? planType === 'free';

  // Default business info for preview
  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'info@store.com',
    address: 'ঢাকা, বাংলাদেশ',
  };

  const displayBusinessInfo = isPreview ? defaultBusinessInfo : businessInfo || defaultBusinessInfo;

  return (
    <footer style={{ backgroundColor: theme.footerBg }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
            ) : (
              <h3 className="text-xl font-bold" style={{ color: theme.footerText }}>
                {storeName}
              </h3>
            )}
            <p className="text-sm leading-relaxed" style={{ color: theme.footerText + 'CC' }}>
              {t('logoTagline') || t('starterTagline')}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {(socialLinks?.facebook || isPreview) && (
                <a
                  href={socialLinks?.facebook || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {(socialLinks?.instagram || isPreview) && (
                <a
                  href={socialLinks?.instagram || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {(socialLinks?.twitter || isPreview) && (
                <a
                  href={socialLinks?.twitter || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <PreviewSafeLink
                  to="/"
                  isPreview={isPreview}
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('home')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/products"
                  isPreview={isPreview}
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('allProducts')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/pages/about"
                  isPreview={isPreview}
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('aboutUs')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink
                  to="/contact"
                  isPreview={isPreview}
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('contact')}
                </PreviewSafeLink>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>
              {t('categories')}
            </h4>
            <ul className="space-y-2">
              {(validCategories.length > 0
                ? validCategories
                : ['Electronics', 'Fashion', 'Home & Living', 'Beauty']
              ).map((cat) => (
                <li key={cat}>
                  <PreviewSafeLink
                    to={`/?category=${encodeURIComponent(cat)}`}
                    isPreview={isPreview}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: theme.footerText + 'CC' }}
                  >
                    {cat}
                  </PreviewSafeLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>
              {t('contact')}
            </h4>
            <ul className="space-y-3">
              {displayBusinessInfo.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: theme.primary }} />
                  <a
                    href={isPreview ? '#' : `tel:${displayBusinessInfo.phone}`}
                    className="text-sm hover:underline"
                    style={{ color: theme.footerText + 'CC' }}
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo.phone}
                  </a>
                </li>
              )}
              {displayBusinessInfo.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: theme.primary }} />
                  <a
                    href={isPreview ? '#' : `mailto:${displayBusinessInfo.email}`}
                    className="text-sm hover:underline"
                    style={{ color: theme.footerText + 'CC' }}
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo.email}
                  </a>
                </li>
              )}
              {displayBusinessInfo.address && (
                <li className="flex items-start gap-3">
                  <MapPin
                    className="h-4 w-4 flex-shrink-0 mt-0.5"
                    style={{ color: theme.primary }}
                  />
                  <span className="text-sm" style={{ color: theme.footerText + 'CC' }}>
                    {displayBusinessInfo.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Policies Links */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: theme.footerText + '20' }}>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <PreviewSafeLink
              to="/policies/privacy"
              isPreview={isPreview}
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('privacyPolicy')}
            </PreviewSafeLink>
            <span style={{ color: theme.footerText + '40' }}>•</span>
            <PreviewSafeLink
              to="/policies/refund"
              isPreview={isPreview}
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('refundPolicy')}
            </PreviewSafeLink>
            <span style={{ color: theme.footerText + '40' }}>•</span>
            <PreviewSafeLink
              to="/policies/shipping"
              isPreview={isPreview}
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('shippingPolicy')}
            </PreviewSafeLink>
            <span style={{ color: theme.footerText + '40' }}>•</span>
            <PreviewSafeLink
              to="/policies/terms"
              isPreview={isPreview}
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('termsOfService')}
            </PreviewSafeLink>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="py-4 border-t"
        style={{
          backgroundColor: theme.footerBg,
          borderColor: theme.footerText + '15',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p style={{ color: theme.footerText + 'AA' }}>
            © {new Date().getFullYear()} {storeName}. {t('allRightsReserved')}
          </p>
          <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} variant="minimal" />
        </div>
      </div>
    </footer>
  );
}
