/**
 * GhorerBazar Footer Component
 *
 * Features:
 * - Brand description in Bangla
 * - Company links
 * - Quick Help links
 * - Contact info
 * - Clean, minimal, trust-focused layout
 * - Payment methods
 */

import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { GHORER_BAZAR_THEME, GHORER_BAZAR_FONTS } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import { useTranslation } from '~/contexts/LanguageContext';
import type { SocialLinks, FooterConfig } from '@db/types';

interface GhorerBazarFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
  isPreview?: boolean;
}

export function GhorerBazarFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories: _categories,
  planType = 'free',
  isPreview,
}: GhorerBazarFooterProps) {
  const { t } = useTranslation();
  const theme = GHORER_BAZAR_THEME;
  const phoneNumber = businessInfo?.phone || '০১৭XX-XXXXXX';
  const whatsappNumber = socialLinks?.whatsapp || phoneNumber;

  return (
    <footer style={{ fontFamily: GHORER_BAZAR_FONTS.body }}>
      {/* Trust Badges - Clean horizontal strip */}
      <div className="bg-white border-t" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Truck className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: theme.text }}>
                  {t('trustFastDelivery')}
                </h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {t('trustFastDeliveryDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Shield className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: theme.text }}>
                  {t('trustAuthentic')}
                </h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {t('trustAuthenticDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <RotateCcw className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: theme.text }}>
                  {t('trustEasyReturn')}
                </h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {t('trustEasyReturnDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <CreditCard className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: theme.text }}>
                  {t('trustCOD')}
                </h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {t('trustCODDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer - Dark */}
      <div style={{ backgroundColor: theme.footerBg }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <PreviewSafeLink to="/" className="inline-flex items-center gap-2 mb-4" isPreview={isPreview}>
                {logo ? (
                  <img src={logo} alt={storeName} className="h-10 w-auto brightness-0 invert" />
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <span className="text-xl">🏪</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: theme.primary }}>
                      {storeName}
                    </span>
                  </>
                )}
              </PreviewSafeLink>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#999' }}>
                {footerConfig?.description || t('ghorerBazarDesc')}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {socialLinks?.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                    style={{ backgroundColor: '#1877f2' }}
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-white" />
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                    style={{ backgroundColor: '#e4405f' }}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-white" />
                  </a>
                )}
                {socialLinks?.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                    style={{ backgroundColor: '#ff0000' }}
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4 text-white" />
                  </a>
                )}
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                  style={{ backgroundColor: '#25d366' }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: theme.footerText }}>
                {t('company')}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <PreviewSafeLink
                    to="/pages/about"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('aboutUs')}
                  </PreviewSafeLink>
                </li>
                <li>
                  <PreviewSafeLink
                    to="/contact"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('contact')}
                  </PreviewSafeLink>
                </li>
                <li>
                  <PreviewSafeLink
                    to="/policies/terms"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('termsOfService')}
                  </PreviewSafeLink>
                </li>
                <li>
                  <PreviewSafeLink
                    to="/policies/privacy"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('privacyPolicy')}
                  </PreviewSafeLink>
                </li>
              </ul>
            </div>

            {/* Quick Help */}
            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: theme.footerText }}>
                {t('help')}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <PreviewSafeLink
                    to="/pages/faq"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('faq')}
                  </PreviewSafeLink>
                </li>
                <li>
                  <PreviewSafeLink
                    to="/policies/shipping"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('shippingPolicy')}
                  </PreviewSafeLink>
                </li>
                <li>
                  <PreviewSafeLink
                    to="/policies/returns"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('refundPolicy')}
                  </PreviewSafeLink>
                </li>
                <li>
                  <PreviewSafeLink
                    to="/track-order"
                    className="text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                    isPreview={isPreview}
                  >
                    {t('trackOrder')}
                  </PreviewSafeLink>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: theme.footerText }}>
                {t('contact')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex items-start gap-2 text-sm hover:text-orange-400 transition"
                    style={{ color: '#999' }}
                  >
                    <Phone
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: theme.primary }}
                    />
                    <span>{phoneNumber}</span>
                  </a>
                </li>
                {businessInfo?.email && (
                  <li>
                    <a
                      href={`mailto:${businessInfo.email}`}
                      className="flex items-start gap-2 text-sm hover:text-orange-400 transition"
                      style={{ color: '#999' }}
                    >
                      <Mail
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: theme.primary }}
                      />
                      <span>{businessInfo.email}</span>
                    </a>
                  </li>
                )}
                {businessInfo?.address && (
                  <li className="flex items-start gap-2 text-sm" style={{ color: '#999' }}>
                    <MapPin
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: theme.primary }}
                    />
                    <span>{businessInfo.address}</span>
                  </li>
                )}

                {/* WhatsApp CTA */}
                <li className="pt-2">
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=হ্যালো, আমি অর্ডার করতে চাই`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
                    style={{ backgroundColor: '#25d366' }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('whatsappOrder')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: '#666' }}>
                  {t('paymentMethods')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-xs font-bold text-pink-600">bKash</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-xs font-bold text-orange-600">Nagad</span>
                  </div>
                  <div
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: theme.primary, color: 'white' }}
                  >
                    COD
                  </div>
                </div>
              </div>
              <div className="text-xs" style={{ color: '#666' }}>
                {t('securePayment')}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
              <p className="text-xs" style={{ color: '#666' }} suppressHydrationWarning>
                © {new Date().getFullYear()} {storeName}। {t('allRightsReserved')}
              </p>

              <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
