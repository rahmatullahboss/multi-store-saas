/**
 * Nova Lux Ultra Footer Component
 *
 * Ultra-premium footer with:
 * - Animated trust badges
 * - Premium newsletter section with gold accents
 * - Staggered animation for footer columns
 * - Hover effects on links with gold underline
 * - Animated social icons
 */

import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import {
  Truck,
  RotateCcw,
  Shield,
  CreditCard,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { NOVALUX_ULTRA_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';

interface NovaLuxUltraFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
  isPreview?: boolean;
}

// Animated Trust Badge Component
function TrustBadge({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-4"
    >
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${NOVALUX_ULTRA_THEME.accent}15` }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, transparent 100%)',
              `linear-gradient(90deg, transparent 0%, ${NOVALUX_ULTRA_THEME.accent}20 50%, transparent 100%)`,
              'linear-gradient(90deg, transparent 0%, transparent 100%)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <Icon className="w-6 h-6 relative z-10" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
      </motion.div>
      <div>
        <p className="font-semibold text-sm" style={{ color: NOVALUX_ULTRA_THEME.text }}>
          {title}
        </p>
        <p className="text-xs" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Animated Social Icon
function SocialIcon({
  icon: Icon,
  href,
  delay,
  isPreview,
}: {
  icon: React.ElementType;
  href: string;
  delay: number;
  isPreview?: boolean;
}) {
  return (
    <motion.a
      href={isPreview ? '#' : href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
      whileHover={{
        scale: 1.2,
        backgroundColor: NOVALUX_ULTRA_THEME.accent,
        color: '#fff',
      }}
      whileTap={{ scale: 0.9 }}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: NOVALUX_ULTRA_THEME.footerText,
      }}
      onClick={isPreview ? (e) => e.preventDefault() : undefined}
    >
      <Icon className="w-5 h-5" />
    </motion.a>
  );
}

// Payment Icon Component
function PaymentIcon({ label, bg, text = 'white' }: { label: string; bg: string; text?: string }) {
  return (
    <motion.div
      className="h-9 px-4 rounded-lg flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: bg, color: text }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {label}
    </motion.div>
  );
}

export function NovaLuxUltraFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
  isPreview = false,
}: NovaLuxUltraFooterProps) {
  const { t } = useTranslation();
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: '-100px' });

  const validCategories = categories.filter(Boolean).slice(0, 10) as string[];
  const showPoweredBy = true;

  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'hello@store.com',
    address: 'House 123, Road 5, Gulshan, Dhaka 1212, Bangladesh',
  };

  // Only use default info if in preview mode. Otherwise use provided info or empty fallback.
  const displayBusinessInfo = isPreview 
    ? defaultBusinessInfo 
    : businessInfo || { phone: null, email: null, address: null };

  return (
    <footer
      ref={footerRef}
      className="overflow-hidden"
      style={{
        backgroundColor: NOVALUX_ULTRA_THEME.footerBg,
        color: NOVALUX_ULTRA_THEME.footerText,
      }}
    >
      {/* Trust Badges Bar */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TrustBadge
              icon={Truck}
              title={t('freeShipping')}
              description={t('freeShippingDesc', { amount: '৳1,000' })}
              delay={0}
            />
            <TrustBadge
              icon={RotateCcw}
              title={t('easyReturns')}
              description={t('easyReturnsDesc')}
              delay={0.1}
            />
            <TrustBadge
              icon={Shield}
              title={t('securePaymentTitle')}
              description={t('securePaymentDesc')}
              delay={0.2}
            />
            <TrustBadge
              icon={CreditCard}
              title={t('codTitle')}
              description={t('codDesc')}
              delay={0.3}
            />
          </div>
        </div>
      </div>

      {/* Premium Newsletter Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="relative py-20 overflow-hidden"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Background glow effect */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${NOVALUX_ULTRA_THEME.accent}10 0%, transparent 70%)`,
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
            </motion.div>
            <h3
              className="text-4xl lg:text-5xl font-semibold"
              style={{
                fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                background: NOVALUX_ULTRA_THEME.accentGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('joinFamily', { name: storeName })}
            </h3>
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg mb-10"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {t('subscribeText')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border text-white placeholder-white/40 focus:outline-none transition-all duration-300"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  fontFamily: NOVALUX_ULTRA_THEME.fontBody,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = NOVALUX_ULTRA_THEME.accent;
                  e.target.style.boxShadow = `0 0 30px ${NOVALUX_ULTRA_THEME.accent}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            </div>
            <motion.button
              className="px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                background: NOVALUX_ULTRA_THEME.accentGradient,
                color: NOVALUX_ULTRA_THEME.primary,
                boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: NOVALUX_ULTRA_THEME.buttonShadowHover,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {t('subscribe')}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div
                    className="p-2 rounded-full"
                    style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
                  >
                    <Crown className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.primary }} />
                  </div>
                  <h4
                    className="text-2xl font-semibold"
                    style={{ fontFamily: NOVALUX_ULTRA_THEME.fontHeading }}
                  >
                    {storeName}
                  </h4>
                </>
              )}
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              {footerConfig?.description || t('luxeDescription')}
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mb-8">
              {(socialLinks?.instagram || isPreview) && (
                <SocialIcon
                  icon={Instagram}
                  href={socialLinks?.instagram || '#'}
                  delay={0.1}
                  isPreview={isPreview}
                />
              )}
              {(socialLinks?.facebook || isPreview) && (
                <SocialIcon
                  icon={Facebook}
                  href={socialLinks?.facebook || '#'}
                  delay={0.2}
                  isPreview={isPreview}
                />
              )}
              {(socialLinks?.twitter || isPreview) && (
                <SocialIcon
                  icon={Twitter}
                  href={socialLinks?.twitter || '#'}
                  delay={0.3}
                  isPreview={isPreview}
                />
              )}
              {socialLinks?.youtube && (
                <SocialIcon icon={Youtube} href={socialLinks.youtube} delay={0.4} />
              )}
              {socialLinks?.linkedin && (
                <SocialIcon icon={Linkedin} href={socialLinks.linkedin} delay={0.5} />
              )}
            </div>

            {/* Payment Icons */}
            <div>
              <p className="text-xs text-white/50 mb-3">{t('weAccept')}</p>
              <div className="flex flex-wrap gap-2">
                <PaymentIcon label="bKash" bg="#e2136e" />
                <PaymentIcon label="Nagad" bg="#f26922" />
                <PaymentIcon label="COD" bg="transparent" text="rgba(255,255,255,0.8)" />
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h5
              className="font-semibold uppercase text-sm tracking-widest mb-6"
              style={{ color: NOVALUX_ULTRA_THEME.accent }}
            >
              {t('quickLinks')}
            </h5>
            <ul className="space-y-4">
              {[
                { label: t('home'), href: '/' },
                { label: t('shopAll'), href: '/products' },
                { label: t('aboutUs'), href: '/pages/about' },
                { label: t('contact'), href: '/contact' },
                { label: t('trackOrder'), href: '/track-order' },
              ].map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <PreviewSafeLink
                    to={link.href}
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group text-sm"
                    isPreview={isPreview}
                  >
                    <motion.span
                      className="w-0 h-px group-hover:w-4 transition-all duration-300 rounded-full"
                      style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
                    />
                    {link.label}
                  </PreviewSafeLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          {validCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h5
                className="font-semibold uppercase text-sm tracking-widest mb-6"
                style={{ color: NOVALUX_ULTRA_THEME.accent }}
              >
                {t('collections')}
              </h5>
              <ul className="space-y-4">
                {validCategories.map((cat, i) => (
                  <motion.li
                    key={cat}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <PreviewSafeLink
                      to={`/?category=${encodeURIComponent(cat)}`}
                      className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group text-sm"
                      isPreview={isPreview}
                    >
                      <motion.span
                        className="w-0 h-px group-hover:w-4 transition-all duration-300 rounded-full"
                        style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
                      />
                      {cat}
                    </PreviewSafeLink>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h5
              className="font-semibold uppercase text-sm tracking-widest mb-6"
              style={{ color: NOVALUX_ULTRA_THEME.accent }}
            >
              {t('getInTouch')}
            </h5>
            <ul className="space-y-5">
              {displayBusinessInfo.email && (
                <motion.li
                  className="flex items-center gap-4 text-white/70 group"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Mail className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
                  </div>
                  <a
                    href={isPreview ? '#' : `mailto:${displayBusinessInfo.email}`}
                    className="text-sm hover:text-white transition-colors"
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo.email}
                  </a>
                </motion.li>
              )}
              {displayBusinessInfo.phone && (
                <motion.li
                  className="flex items-center gap-4 text-white/70 group"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Phone className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
                  </div>
                  <a
                    href={isPreview ? '#' : `tel:${displayBusinessInfo.phone}`}
                    className="text-sm hover:text-white transition-colors"
                    onClick={isPreview ? (e) => e.preventDefault() : undefined}
                  >
                    {displayBusinessInfo.phone}
                  </a>
                </motion.li>
              )}
              {displayBusinessInfo.address && (
                <motion.li
                  className="flex items-start gap-4 text-white/70 group"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
                  </div>
                  <span className="text-sm leading-relaxed">{displayBusinessInfo.address}</span>
                </motion.li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Policies Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-10 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm">
            {[
              { label: t('privacyPolicy'), href: '/policies/privacy' },
              { label: t('refundPolicy'), href: '/policies/refund' },
              { label: t('shippingPolicy'), href: '/policies/shipping' },
              { label: t('termsOfService'), href: '/policies/terms' },
            ].map((link) => (
              <motion.div key={link.label} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <PreviewSafeLink
                  to={link.href}
                  className="text-white/60 hover:text-white transition-colors"
                  isPreview={isPreview}
                >
                  {link.label}
                </PreviewSafeLink>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} {storeName}. {t('allRightsReserved')}
          </p>
          <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
        </motion.div>
      </div>
    </footer>
  );
}
