import { Link } from '@remix-run/react';
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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OzzylBranding } from '../../store-templates/shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';
import type { StoreCategory, StoreTemplateTheme } from '~/templates/store-registry';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | StoreCategory | null)[];
  planType?: string;
  isPreview?: boolean;
  theme: StoreTemplateTheme;
  paymentGateways?: string[];
  
  // Layout Variants driven by JSON schema
  variant?: 'marketplace' | 'luxury' | 'minimal' | 'bold' | 'default';
  layout?: 'multi-column' | 'centered' | 'minimal';
  showNewsletter?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
  theme,
  paymentGateways = [],
  variant = 'default',
  layout = 'multi-column',
  showNewsletter = false,
}: UnifiedFooterProps) {
  const { t } = useTranslation();

  const validCategories = categories
    .map(c => (typeof c === 'string' ? c : c?.title || null))
    .filter(Boolean)
    .slice(0, 8);

  const showPoweredBy = true;

  // ============================================================================
  // STYLES DEDUCTION
  // ============================================================================
  
  const isLuxury = variant === 'luxury';
  const headingFont = isLuxury ? 'Cormorant Garamond, serif' : 'inherit';
  const headingColor = isLuxury ? (theme.accent || theme.primary) : (theme.footerText || theme.text);
  const linkHoverColor = isLuxury ? 'hover:text-white' : 'hover:opacity-80';
  const linkBaseColor = isLuxury ? 'text-white/70' : '';
  const iconBg = isLuxury ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  // Centered Minimal Layout
  if (layout === 'centered' || layout === 'minimal') {
    return (
      <footer className="py-12 md:py-16 text-center border-t mt-8" style={{ backgroundColor: theme.footerBg, color: theme.footerText, borderColor: theme.cardBorder || '#e5e7eb' }}>
        <div className="max-w-4xl mx-auto px-4">
          {logo && <img src={logo} alt={storeName} className="h-12 w-auto object-contain mx-auto mb-6" />}
          <h4 className="text-2xl font-bold mb-6" style={{ fontFamily: headingFont }}>{storeName}</h4>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <PreviewSafeLink to="/products" className="hover:opacity-80 transition-opacity" isPreview={isPreview}>{t('store.shopAll', 'Shop All')}</PreviewSafeLink>
            <PreviewSafeLink to="/pages/about" className="hover:opacity-80 transition-opacity" isPreview={isPreview}>{t('store.aboutUs', 'About Us')}</PreviewSafeLink>
            <PreviewSafeLink to="/contact" className="hover:opacity-80 transition-opacity" isPreview={isPreview}>{t('store.contact', 'Contact')}</PreviewSafeLink>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {socialLinks?.facebook && <a href={socialLinks.facebook} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconBg}`}><Facebook className="w-5 h-5" /></a>}
            {socialLinks?.instagram && <a href={socialLinks.instagram} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconBg}`}><Instagram className="w-5 h-5" /></a>}
          </div>

          <div className="text-sm opacity-60 mb-6" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. {t('store.allRightsReserved', 'All rights reserved.')}
          </div>

          <div className="flex justify-center">
            <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
          </div>
        </div>
      </footer>
    );
  }

  // Multi-Column Layout (Marketplace & Luxury Default)
  return (
    <footer className="border-t mt-8" style={{ backgroundColor: theme.footerBg || (isLuxury ? '#111827' : '#ffffff'), color: theme.footerText || (isLuxury ? '#ffffff' : theme.text) }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            {logo && <img src={logo} alt={storeName} className="h-10 w-auto object-contain mb-4" />}
            <h4 className="text-2xl font-semibold mb-4" style={{ fontFamily: headingFont }}>
              {storeName}
            </h4>
            <p className={`text-sm leading-relaxed mb-6 max-w-sm ${isLuxury ? 'text-white/60' : 'opacity-80'}`}>
              {footerConfig?.description || (isLuxury ? t('store.luxeDescription', 'Elegance and quality in every product.') : '')}
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {(socialLinks?.instagram || isPreview) && (
                <a href={socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconBg}`} onClick={isPreview ? (e) => e.preventDefault() : undefined}>
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {(socialLinks?.facebook || isPreview) && (
                <a href={socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconBg}`} onClick={isPreview ? (e) => e.preventDefault() : undefined}>
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {(socialLinks?.twitter || isPreview) && (
                <a href={socialLinks?.twitter || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconBg}`} onClick={isPreview ? (e) => e.preventDefault() : undefined}>
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Payment Icons */}
            {paymentGateways.length > 0 && (
              <div>
                <p className={`text-xs mb-3 ${isLuxury ? 'text-white/50' : 'opacity-60'}`}>{t('store.weAccept', 'We Accept')}</p>
                <div className="flex flex-wrap gap-2">
                  {paymentGateways.map((method) => (
                    <div key={method} className={`px-3 py-1.5 rounded-md flex items-center justify-center text-xs font-bold ${isLuxury ? 'border border-white/30' : 'border'}`} style={!isLuxury ? { borderColor: theme.cardBorder || '#e5e7eb', backgroundColor: theme.cardBg } : {}}>
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold uppercase text-sm tracking-wider mb-6" style={{ color: headingColor }}>
              {isLuxury ? t('store.quickLinks', 'Quick Links') : t('store.customerCare', 'Customer Care')}
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <PreviewSafeLink to="/" className={`flex items-center gap-2 group transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>
                  {isLuxury && <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                  {t('store.home', 'Home')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink to="/products" className={`flex items-center gap-2 group transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>
                  {isLuxury && <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                  {t('store.shopAll', 'Shop All')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink to="/pages/about" className={`flex items-center gap-2 group transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>
                  {isLuxury && <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                  {t('store.aboutUs', 'About Us')}
                </PreviewSafeLink>
              </li>
              <li>
                <PreviewSafeLink to="/contact" className={`flex items-center gap-2 group transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>
                  {isLuxury && <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                  {t('store.contact', 'Contact Us')}
                </PreviewSafeLink>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {validCategories.length > 0 && (
            <div>
              <h5 className="font-semibold uppercase text-sm tracking-wider mb-6" style={{ color: headingColor }}>
                {t('store.collections', 'Collections')}
              </h5>
              <ul className="space-y-3 text-sm">
                {validCategories.slice(0, 6).map((cat) => (
                  <li key={cat}>
                    <PreviewSafeLink to={`/products/${encodeURIComponent(cat!.trim().toLowerCase().replace(/\s+/g, ' ')).replace(/%20/g, '-')}`} className={`flex items-center gap-2 group transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>
                      {isLuxury && <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />}
                      {cat}
                    </PreviewSafeLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact / Newsletter */}
          <div>
            <h5 className="font-semibold uppercase text-sm tracking-wider mb-6" style={{ color: headingColor }}>
              {t('store.getInTouch', 'Get In Touch')}
            </h5>
            <ul className="space-y-4 text-sm">
              {businessInfo?.email && (
                <li className={`flex items-center gap-3 ${linkBaseColor}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isLuxury ? '' : 'bg-gray-100'}`} style={isLuxury ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}>
                    <Mail className="w-4 h-4" style={{ color: headingColor }} />
                  </div>
                  <a href={`mailto:${businessInfo.email}`} className={`transition-colors ${linkHoverColor}`}>
                    {businessInfo.email}
                  </a>
                </li>
              )}
              {businessInfo?.phone && (
                <li className={`flex items-center gap-3 ${linkBaseColor}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isLuxury ? '' : 'bg-gray-100'}`} style={isLuxury ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}>
                    <Phone className="w-4 h-4" style={{ color: headingColor }} />
                  </div>
                  <a href={`tel:${businessInfo.phone}`} className={`transition-colors ${linkHoverColor}`}>
                    {businessInfo.phone}
                  </a>
                </li>
              )}
              {businessInfo?.address && (
                <li className={`flex items-start gap-3 ${linkBaseColor}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isLuxury ? '' : 'bg-gray-100'}`} style={isLuxury ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {}}>
                    <MapPin className="w-4 h-4" style={{ color: headingColor }} />
                  </div>
                  <span className="leading-relaxed">{businessInfo.address}</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Policies Links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap justify-center gap-4 md:gap-8 text-sm" style={{ borderColor: isLuxury ? 'rgba(255,255,255,0.1)' : (theme.cardBorder || '#e5e7eb') }}>
          <PreviewSafeLink to="/policies/privacy" className={`transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>{t('store.privacyPolicy', 'Privacy Policy')}</PreviewSafeLink>
          <span className="opacity-20 hidden md:inline">•</span>
          <PreviewSafeLink to="/policies/refund" className={`transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>{t('store.refundPolicy', 'Refund Policy')}</PreviewSafeLink>
          <span className="opacity-20 hidden md:inline">•</span>
          <PreviewSafeLink to="/policies/terms" className={`transition-colors ${linkBaseColor} ${linkHoverColor}`} isPreview={isPreview}>{t('store.termsOfService', 'Terms of Service')}</PreviewSafeLink>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: isLuxury ? 'rgba(255,255,255,0.1)' : (theme.cardBorder || '#e5e7eb') }}>
          <p className={`text-sm ${isLuxury ? 'text-white/50' : 'opacity-60'}`} suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. {t('store.allRightsReserved', 'All rights reserved.')}
          </p>
          <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
        </div>
      </div>
    </footer>
  );
}