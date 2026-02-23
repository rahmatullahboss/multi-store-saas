import { Link } from '@remix-run/react';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { OZZYL_PREMIUM_THEME } from '../theme';

const THEME = OZZYL_PREMIUM_THEME;

interface OzzylPremiumFooterProps {
  storeName: string;
  logo?: string | null;
  config?: any;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    whatsapp?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  } | null;
  businessInfo?: {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
}

export function OzzylPremiumFooter({
  storeName,
  logo,
  socialLinks,
  businessInfo,
}: OzzylPremiumFooterProps) {
  const currentYear = new Date().getFullYear();

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
  };

  return (
    <footer style={{ backgroundColor: THEME.footerBg, borderTop: `1px solid ${THEME.border}` }}>
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              {logo ? (
                <img src={logo} alt={storeName} className="h-12 w-auto" />
              ) : (
                <span className="text-2xl font-bold gold-gradient">{storeName}</span>
              )}
            </Link>
            <p className="mb-6" style={{ color: THEME.footerText }}>
              Bangladesh's premium marketplace for quality products. Experience world-class shopping
              with fast delivery and secure payments.
            </p>
            <div className="flex gap-3">
              {Object.entries(socialLinks || {}).map(([platform, url]) => {
                if (!url) return null;
                const Icon = socialIcons[platform];
                if (!Icon) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: `${THEME.primary}15`,
                      border: `1px solid ${THEME.primary}30`,
                    }}
                  >
                    <Icon size={18} style={{ color: THEME.primary }} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: THEME.text }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Shop', href: '/collections/all' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition-colors duration-300"
                    style={{ color: THEME.footerText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = THEME.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = THEME.footerText;
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: THEME.text }}>
              Customer Service
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Return Policy', href: '/returns' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Track Order', href: '/track' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition-colors duration-300"
                    style={{ color: THEME.footerText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = THEME.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = THEME.footerText;
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: THEME.text }}>
              Contact Us
            </h4>
            <ul className="space-y-4">
              {businessInfo?.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={18} style={{ color: THEME.primary, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: THEME.footerText }}>{businessInfo.address}</span>
                </li>
              )}
              {businessInfo?.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={18} style={{ color: THEME.primary, flexShrink: 0 }} />
                  <a
                    href={`tel:${businessInfo.phone}`}
                    style={{ color: THEME.footerText }}
                    className="transition-colors duration-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = THEME.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = THEME.footerText;
                    }}
                  >
                    {businessInfo.phone}
                  </a>
                </li>
              )}
              {businessInfo?.email && (
                <li className="flex items-center gap-3">
                  <Mail size={18} style={{ color: THEME.primary, flexShrink: 0 }} />
                  <a
                    href={`mailto:${businessInfo.email}`}
                    style={{ color: THEME.footerText }}
                    className="transition-colors duration-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = THEME.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = THEME.footerText;
                    }}
                  >
                    {businessInfo.email}
                  </a>
                </li>
              )}
              {!businessInfo?.address && !businessInfo?.phone && !businessInfo?.email && (
                <li style={{ color: THEME.footerText }}>Contact information not available</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6" style={{ borderTop: `1px solid ${THEME.border}` }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p style={{ color: THEME.footerText }}>
              © {currentYear} {storeName}. All rights reserved.
            </p>
            <div className="flex items-center gap-2" style={{ color: THEME.footerText }}>
              <span>Powered by</span>
              <a
                href="https://ozzyl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold gold-gradient"
              >
                Ozzyl
              </a>
            </div>
            <div className="flex items-center gap-4">
              {/* Payment Icons Placeholder */}
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: THEME.surface, color: THEME.footerText }}
                >
                  bKash
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: THEME.surface, color: THEME.footerText }}
                >
                  Nagad
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: THEME.surface, color: THEME.footerText }}
                >
                  Visa
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: THEME.surface, color: THEME.footerText }}
                >
                  MC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
