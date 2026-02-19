import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Loader2 } from 'lucide-react';
import { LUXE_BOUTIQUE_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
// Types inlined below to avoid unused import warnings
import { useTranslation } from '~/contexts/LanguageContext';

interface LuxeBoutiqueFooterProps {
  storeName: string;
  storeId?: number;
  footerConfig?: { description?: string; showPoweredBy?: boolean } | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    twitter?: string;
  } | null;
  planType?: string;
  categories: (string | null)[];
}

export function LuxeBoutiqueFooter({
  storeName,
  storeId,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories: _categories = [],
}: LuxeBoutiqueFooterProps) {
  const { t } = useTranslation();
  const theme = LUXE_BOUTIQUE_THEME;

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
                <Link to="/products" className="text-white/70 hover:text-white transition-colors">
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
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {businessInfo.email}
                </li>
              )}
              {businessInfo?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {businessInfo.phone}
                </li>
              )}
              {businessInfo?.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {businessInfo.address}
                </li>
              )}
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

      {/* Newsletter Section */}
      <div className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h4
            className="text-2xl font-semibold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: theme.accent }}
          >
            {t('newsletterTitle') || 'Subscribe to Our Newsletter'}
          </h4>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">
            {t('newsletterSubtitle') || 'Get exclusive offers and updates straight to your inbox'}
          </p>
          <NewsletterForm storeId={storeId} />
        </div>
      </div>

      {/* Copyright & Branding - Side by Side */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright - Left/Bottom */}
          <p className="text-sm text-white/50" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. {t('allRightsReserved')}
          </p>

          {/* Viral Loop / Branding - Right */}
          <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm({ storeId }: { storeId?: number }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const theme = LUXE_BOUTIQUE_THEME;
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, storeId }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (data.success) {
        setStatus('success');
        setMessage(t('newsletterSuccess') || 'Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('newsletterPlaceholder') || 'Enter your email'}
        required
        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        style={{ borderRadius: 0 }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 font-medium uppercase text-sm tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: theme.accent, color: theme.primary, borderRadius: 0 }}
      >
        {status === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          t('newsletterButton') || 'Subscribe'
        )}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm w-full ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
