/**
 * FooterSection — Footer with store name, social links, payment methods, copyright
 */

import { FooterPropsSchema, type FooterProps } from '~/lib/page-builder/schemas';

interface FooterSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const SOCIAL_ICONS: Record<string, string> = {
  facebook: '𝑓',
  instagram: '📸',
  youtube: '▶',
  tiktok: '♪',
  whatsapp: '💬',
  telegram: '✈',
};

const SOCIAL_COLORS: Record<string, string> = {
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400',
  youtube: 'bg-red-600',
  tiktok: 'bg-black',
  whatsapp: 'bg-green-500',
  telegram: 'bg-sky-500',
};

export function FooterSection({ props, isPreview = false }: FooterSectionProps) {
  const p: FooterProps = FooterPropsSchema.parse(props);

  const bgColor = p.bgColor || '#18181B';
  const textColor = p.textColor || '#FFFFFF';
  const accentColor = p.accentColor || '#10B981';

  return (
    <footer
      data-section-type="footer"
      className="w-full"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div>
            {p.logoUrl ? (
              <img src={p.logoUrl} alt={p.storeName || 'Logo'} className="mb-4 h-10 w-auto object-contain" />
            ) : (
              <div
                className="mb-4 inline-block rounded-xl px-4 py-2 text-xl font-extrabold"
                style={{ backgroundColor: accentColor, color: '#fff' }}
              >
                {p.storeName || 'আমার শপ'}
              </div>
            )}
            {p.tagline && (
              <p className="text-sm leading-relaxed opacity-70">{p.tagline}</p>
            )}

            {/* Social links */}
            {p.showSocialLinks && p.socialLinks.length > 0 && (
              <div className="mt-5 flex gap-2">
                {p.socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition hover:opacity-80 ${
                      SOCIAL_COLORS[link.platform] || 'bg-gray-600'
                    }`}
                    title={link.platform}
                  >
                    {SOCIAL_ICONS[link.platform] || '🔗'}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Contact column */}
          {p.showContactInfo && (p.phone || p.email || p.address) && (
            <div>
              <h3
                className="mb-4 text-sm font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                যোগাযোগ
              </h3>
              <ul className="space-y-3 text-sm opacity-80">
                {p.phone && (
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-base">📞</span>
                    <a href={`tel:${p.phone}`} className="hover:opacity-100">
                      {p.phone}
                    </a>
                  </li>
                )}
                {p.email && (
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-base">✉️</span>
                    <a href={`mailto:${p.email}`} className="hover:opacity-100">
                      {p.email}
                    </a>
                  </li>
                )}
                {p.address && (
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-base">📍</span>
                    <span>{p.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Payment methods column */}
          {p.showPaymentMethods && p.paymentMethods.length > 0 && (
            <div>
              <h3
                className="mb-4 text-sm font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                পেমেন্ট পদ্ধতি
              </h3>
              <div className="flex flex-wrap gap-2">
                {p.paymentMethods.map((pm) => (
                  <span
                    key={pm}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"
                  >
                    {pm}
                  </span>
                ))}
              </div>

              {/* Quick links */}
              <div className="mt-6">
                <h3
                  className="mb-3 text-sm font-bold uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  দ্রুত লিংক
                </h3>
                <ul className="space-y-1.5 text-sm opacity-75">
                  {['#order', '#reviews', '#faq'].map((href, i) => (
                    <li key={i}>
                      <a href={href} className="hover:opacity-100">
                        {['অর্ডার করুন', 'রিভিউ', 'প্রশ্নোত্তর'][i]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/10" />

        {/* Copyright bar */}
        <div className="flex flex-col items-center justify-between gap-3 text-center text-xs opacity-60 sm:flex-row">
          <p>
            {p.copyrightText ||
              `© ${new Date().getFullYear()} ${p.storeName || 'আমার শপ'}। সর্বস্বত্ব সংরক্ষিত।`}
          </p>
          {p.showPoweredBy && (
            <p>
              Powered by{' '}
              <span className="font-semibold" style={{ color: accentColor }}>
                Ozzyl
              </span>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
