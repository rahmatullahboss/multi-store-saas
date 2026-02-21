import React from 'react';
import { Link } from '@remix-run/react';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { DEFAULT_THEME_CONFIG } from '../index';
import { OzzylBranding } from '~/components/store-templates/shared/OzzylBranding';
import { useTranslation } from '~/contexts/LanguageContext';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer',
  type: 'footer',
  limit: 1,

  settings: [
    {
      type: 'textarea',
      id: 'about_text',
      label: 'About text',
      default: 'The best starter store for your business.',
    },
    {
      type: 'checkbox',
      id: 'show_newsletter',
      label: 'Show newsletter signup',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_trust_badges',
      label: 'Show trust badges',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_powered_by',
      label: 'Show Powered By Ozzyl',
      default: true,
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function StarterFooter({ context, settings }: SectionComponentProps) {
  const { store } = context;
  // Use theme config from context
  const activeTheme = context.theme || DEFAULT_THEME_CONFIG;
  const { t } = useTranslation();

  // Construct theme object compatible with the preview component's structure
  // or simply use the values directly.
  const theme = {
    primary: activeTheme.colors?.primary || '#6366f1',
    accent: activeTheme.colors?.accent || '#f59e0b',
    footerBg: activeTheme.colors?.footerBg || '#111827', // Default to dark footer for starter store based on preview
    footerText: activeTheme.colors?.footerText || '#ffffff',
    text: activeTheme.colors?.text || '#111827',
  };

  // Read business info from store.businessInfo (passed via ThemeStoreRenderer)
  const businessInfo = {
    address: store.businessInfo?.address || store.address || undefined,
    email: store.businessInfo?.email || store.email || undefined,
    phone: store.businessInfo?.phone || store.phone || undefined,
  };

  // Read social links from store.socialLinks (passed via ThemeStoreRenderer)
  const socialLinks = {
    instagram: store.socialLinks?.instagram || store.instagram,
    facebook: store.socialLinks?.facebook || store.facebook,
    twitter: store.socialLinks?.twitter || store.twitter,
  };

  const categories = context.collections?.map((c) => c.title) || [];
  const validCategories = categories.filter(Boolean).slice(0, 6) as string[];

  const description = settings.about_text as string;
  const showPoweredBy = settings.show_powered_by !== false;

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <h3 className="text-xl font-bold" style={{ color: theme.footerText }}>
                {store.name}
              </h3>
            )}
            <p className="text-sm leading-relaxed" style={{ color: theme.footerText + 'CC' }}>
              {t('logoTagline') || description || t('starterTagline')}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
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
                <Link
                  to="/"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/about"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: theme.footerText + 'CC' }}
                >
                  {t('contact')}
                </Link>
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
                  <Link
                    to={`/?category=${encodeURIComponent(cat)}`}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: theme.footerText + 'CC' }}
                  >
                    {cat}
                  </Link>
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
              {businessInfo.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: theme.primary }} />
                  <a
                    href={`tel:${businessInfo.phone}`}
                    className="text-sm hover:underline"
                    style={{ color: theme.footerText + 'CC' }}
                  >
                    {businessInfo.phone}
                  </a>
                </li>
              )}
              {businessInfo.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: theme.primary }} />
                  <a
                    href={`mailto:${businessInfo.email}`}
                    className="text-sm hover:underline"
                    style={{ color: theme.footerText + 'CC' }}
                  >
                    {businessInfo.email}
                  </a>
                </li>
              )}
              {businessInfo.address && (
                <li className="flex items-start gap-3">
                  <MapPin
                    className="h-4 w-4 flex-shrink-0 mt-0.5"
                    style={{ color: theme.primary }}
                  />
                  <span className="text-sm" style={{ color: theme.footerText + 'CC' }}>
                    {businessInfo.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Policies Links */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: theme.footerText + '20' }}>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/policies/privacy"
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('privacyPolicy')}
            </Link>
            <span style={{ color: theme.footerText + '40' }}>•</span>
            <Link
              to="/policies/refund"
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('refundPolicy')}
            </Link>
            <span style={{ color: theme.footerText + '40' }}>•</span>
            <Link
              to="/policies/shipping"
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('shippingPolicy')}
            </Link>
            <span style={{ color: theme.footerText + '40' }}>•</span>
            <Link
              to="/policies/terms"
              className="hover:underline transition-colors"
              style={{ color: theme.footerText + 'AA' }}
            >
              {t('termsOfService')}
            </Link>
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
            © {new Date().getFullYear()} {store.name}. {t('allRightsReserved')}
          </p>
          <div style={{ color: theme.footerText }}>
            <OzzylBranding
              planType={store.planType || 'free'}
              showPoweredBy={showPoweredBy}
              variant="minimal"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
