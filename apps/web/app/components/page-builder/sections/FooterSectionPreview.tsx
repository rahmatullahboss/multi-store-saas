/**
 * Footer Section Preview Component
 * 
 * Renders a footer with:
 * - Store branding (logo, name, tagline)
 * - Contact information
 * - Social media links
 * - Payment methods
 * - Copyright
 */

import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, MessageCircle, Send } from 'lucide-react';

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'whatsapp' | 'telegram';
  url: string;
}

interface FooterProps {
  storeName?: string;
  logoUrl?: string;
  tagline?: string;
  showContactInfo?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  showSocialLinks?: boolean;
  socialLinks?: SocialLink[];
  showPaymentMethods?: boolean;
  paymentMethods?: string[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  copyrightText?: string;
  showPoweredBy?: boolean;
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  whatsapp: MessageCircle,
  telegram: Send,
  tiktok: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
};

export function FooterSectionPreview({ props }: { props: FooterProps }) {
  const {
    storeName = '',
    logoUrl = '',
    tagline = 'আমাদের সাথে থাকার জন্য ধন্যবাদ',
    showContactInfo = true,
    phone = '',
    email = '',
    address = '',
    showSocialLinks = true,
    socialLinks = [],
    showPaymentMethods = true,
    paymentMethods = ['বিকাশ', 'নগদ', 'রকেট', 'ক্যাশ অন ডেলিভারি'],
    bgColor = '#18181B',
    textColor = '#FFFFFF',
    accentColor = '#10B981',
    copyrightText = '',
    showPoweredBy = true,
  } = props;

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="py-12 px-6"
      style={{ 
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Branding Column */}
          <div className="space-y-4">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 object-contain" />
            ) : storeName ? (
              <h3 className="text-xl font-bold" style={{ color: accentColor }}>{storeName}</h3>
            ) : null}
            {tagline && (
              <p className="text-sm opacity-80">{tagline}</p>
            )}
          </div>

          {/* Contact Column */}
          {showContactInfo && (phone || email || address) && (
            <div className="space-y-3">
              <h4 className="font-semibold mb-3" style={{ color: accentColor }}>যোগাযোগ</h4>
              {phone && (
                <a 
                  href={`tel:${phone}`} 
                  className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition"
                >
                  <Phone size={16} />
                  {phone}
                </a>
              )}
              {email && (
                <a 
                  href={`mailto:${email}`} 
                  className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition"
                >
                  <Mail size={16} />
                  {email}
                </a>
              )}
              {address && (
                <p className="flex items-start gap-2 text-sm opacity-80">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  {address}
                </p>
              )}
            </div>
          )}

          {/* Social & Payment Column */}
          <div className="space-y-4">
            {/* Social Links */}
            {showSocialLinks && socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3" style={{ color: accentColor }}>সোশ্যাল মিডিয়া</h4>
                <div className="flex gap-3">
                  {socialLinks.map((link, index) => {
                    const Icon = SOCIAL_ICONS[link.platform];
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {showPaymentMethods && paymentMethods.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3" style={{ color: accentColor }}>পেমেন্ট</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-60">
            {/* Copyright */}
            <p suppressHydrationWarning>
              {copyrightText || `© ${currentYear} ${storeName || 'All rights reserved'}`}
            </p>
            
            {/* Powered By */}
            {showPoweredBy && (
              <div className="mt-4 md:mt-0">
                 <a 
                   href="https://ozzyl.com?ref=footer" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="inline-flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                 >
                   <span className="font-semibold">Powered by</span>
                   <span className="font-bold text-amber-500">Ozzyl</span>
                 </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
