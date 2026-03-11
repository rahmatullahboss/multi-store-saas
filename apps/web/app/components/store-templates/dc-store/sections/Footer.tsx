/**
 * DC Store Footer Component
 * 
 * Based on the original DC Store footer design with golden gradient theme.
 * Features warm colors, clean layout, and smooth animations.
 */

import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { resolveDCStoreTheme } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig, ThemeConfig } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';
import { useTranslation } from '~/contexts/LanguageContext';

interface DCStoreFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | StoreCategory | null)[];
  planType?: string;
  isPreview?: boolean;
  themeColors?: StoreTemplateTheme;
  config?: ThemeConfig | null;
}

export function DCStoreFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig: _footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
  themeColors,
  config,
}: DCStoreFooterProps) {
  const theme = resolveDCStoreTheme(config, themeColors);
  const { t } = useTranslation();
  const validCategories = categories.filter(Boolean).slice(0, 6) as string[];
  // Free plan: always show branding. Paid plans: merchant can toggle (MVP).
  const showPoweredBy = planType === 'free' ? true : (_footerConfig?.showPoweredBy ?? true);

  // Default business info for preview only
  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'info@store.com',
    address: 'ঢাকা, বাংলাদেশ',
  };

  const displayBusinessInfo: { phone?: string; email?: string; address?: string } = isPreview
    ? defaultBusinessInfo
    : (businessInfo ?? {});

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
                  style={{ backgroundColor: theme.footerText + '20', color: theme.footerText }}
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
                  style={{ backgroundColor: theme.footerText + '20', color: theme.footerText }}
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
                  style={{ backgroundColor: theme.footerText + '20', color: theme.footerText }}
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
                  to="/pages/contact"
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
          {validCategories.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>
                {t('categories')}
              </h4>
              <ul className="space-y-2">
                {validCategories.map((cat) => {
                  const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
                  
                  if (!title) return null;
                  
                  return (
                    <li key={title}>
                      <PreviewSafeLink
                        to={`/products/${encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`}
                        isPreview={isPreview}
                        className="text-sm hover:underline transition-colors"
                        style={{ color: theme.footerText + 'CC' }}
                      >
                        {title}
                      </PreviewSafeLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>
              {t('contact')}
            </h4>
            <div className="space-y-3">
              {displayBusinessInfo.phone && (
                <a
                  href={`tel:${displayBusinessInfo.phone}`}
                  className="flex items-center gap-3 text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  <Phone className="h-4 w-4" />
                  {displayBusinessInfo.phone}
                </a>
              )}
              {displayBusinessInfo.email && (
                <a
                  href={`mailto:${displayBusinessInfo.email}`}
                  className="flex items-center gap-3 text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  <Mail className="h-4 w-4" />
                  {displayBusinessInfo.email}
                </a>
              )}
              {displayBusinessInfo.address && (
                <div className="flex items-start gap-3 text-sm" style={{ color: theme.footerText + 'CC' }}>
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{displayBusinessInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: theme.footerText + '99' }}>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <PreviewSafeLink
                to="/pages/privacy"
                isPreview={isPreview}
                className="text-sm hover:underline transition-colors"
                style={{ color: theme.footerText + '99' }}
              >
                Privacy Policy
              </PreviewSafeLink>
              <PreviewSafeLink
                to="/pages/terms"
                isPreview={isPreview}
                className="text-sm hover:underline transition-colors"
                style={{ color: theme.footerText + '99' }}
              >
                Terms of Service
              </PreviewSafeLink>
            </div>

            {/* Powered by Ozzyl */}
            {showPoweredBy && (
              <div className="flex-shrink-0">
                <OzzylBranding variant="compact" />
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
