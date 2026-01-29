import { Link } from '@remix-run/react';
import { Mail, Instagram, Facebook } from 'lucide-react';
import { LUXE_BOUTIQUE_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';
import { useTranslation } from '~/contexts/LanguageContext';

interface LuxeBoutiqueFooterProps {
  storeName: string;
  footerConfig?: any | null;
  businessInfo?: any;
  socialLinks?: any;
  planType?: string;
  categories: (string | null)[];
}

export function LuxeBoutiqueFooter({
  storeName,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
}: LuxeBoutiqueFooterProps) {
  const { t } = useTranslation();
  const theme = LUXE_BOUTIQUE_THEME;
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h4
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {storeName}
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {footerConfig?.description || t('luxeDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5
              className="font-medium uppercase text-sm tracking-wider mb-4"
              style={{ color: theme.accent }}
            >
              {t('quickLinks')}
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=all"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t('shopAll')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5
              className="font-medium uppercase text-sm tracking-wider mb-4"
              style={{ color: theme.accent }}
            >
              {t('contactUs')}
            </h5>
            <ul className="space-y-2 text-sm text-white/70">
              {businessInfo?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {businessInfo.email}
                </li>
              )}
              {businessInfo?.phone && <li>{businessInfo.phone}</li>}
              {businessInfo?.address && <li>{businessInfo.address}</li>}
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Branding */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-2">
          <p className="text-sm text-white/50" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. {t('allRightsReserved')}
          </p>

          {/* Viral Loop / Branding */}
          <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
        </div>
      </div>
    </footer>
  );
}
