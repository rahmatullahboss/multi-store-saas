/**
 * Tech Modern - Footer Section
 *
 * Dark footer with:
 * - Zap icon branding
 * - Multi-column layout
 * - Newsletter signup
 * - Payment icons
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { Zap, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer',
  tag: 'footer',
  class: 'tech-footer',
  limit: 1,

  enabled_on: {
    templates: ['index', 'product', 'collection', 'cart', 'page', 'search', 'checkout'],
    groups: ['footer'],
  },

  settings: [
    {
      type: 'textarea',
      id: 'about_text',
      label: 'About text',
      default: 'Cutting-edge technology and premium electronics for the modern world.',
    },
    {
      type: 'textarea',
      id: 'about_text_bn',
      label: 'About text (Bangla)',
      default: 'আধুনিক বিশ্বের জন্য সর্বাধুনিক প্রযুক্তি এবং প্রিমিয়াম ইলেকট্রনিক্স।',
    },
    {
      type: 'checkbox',
      id: 'show_newsletter',
      label: 'Show newsletter signup',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_social_links',
      label: 'Show social links',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_payment_icons',
      label: 'Show payment icons',
      default: true,
    },
    {
      type: 'text',
      id: 'copyright_text',
      label: 'Copyright text',
      default: 'Built for enthusiasts.',
    },
  ],

  presets: [
    {
      name: 'Tech Footer',
      category: 'Footer',
      settings: {
        show_newsletter: true,
        show_social_links: true,
        show_payment_icons: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface FooterSettings {
  about_text: string;
  about_text_bn?: string;
  show_newsletter: boolean;
  show_social_links: boolean;
  show_payment_icons: boolean;
  copyright_text: string;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#0f172a',
  accent: '#3b82f6',
  footerBg: '#0f172a',
  footerText: '#f8fafc',
  muted: '#94a3b8',
  border: 'rgba(255,255,255,0.1)',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechFooter({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as FooterSettings;
  const { store, collections = [], getLink } = context;
  const currentYear = new Date().getFullYear();

  const categories = collections
    .map((c: { title?: string }) => c.title)
    .filter((t): t is string => Boolean(t))
    .slice(0, 5);

  return (
    <footer
      data-section-id={section.id}
      style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* About Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: THEME.accent }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              {store.name}
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: THEME.muted }}>
              {config.about_text}
            </p>

            {/* Social Links */}
            {config.show_social_links && (
              <div className="flex gap-3">
                <a
                  href="#"
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: THEME.muted }}
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: THEME.muted }}
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: THEME.muted }}
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            )}
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-4">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href={getLink?.(`/collections/${category}`) || '#'}
                    className="text-sm transition-colors hover:text-blue-400"
                    style={{ color: THEME.muted }}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={getLink?.('/pages/contact') || '#'}
                  className="text-sm transition-colors hover:text-blue-400"
                  style={{ color: THEME.muted }}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href={getLink?.('/pages/shipping') || '#'}
                  className="text-sm transition-colors hover:text-blue-400"
                  style={{ color: THEME.muted }}
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href={getLink?.('/pages/faq') || '#'}
                  className="text-sm transition-colors hover:text-blue-400"
                  style={{ color: THEME.muted }}
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href={getLink?.('/pages/warranty') || '#'}
                  className="text-sm transition-colors hover:text-blue-400"
                  style={{ color: THEME.muted }}
                >
                  Warranty Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            {config.show_newsletter && (
              <>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Stay Updated</h4>
                <p className="text-sm mb-4" style={{ color: THEME.muted }}>
                  Get notified about new arrivals and exclusive deals.
                </p>
                <form className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 rounded-xl font-semibold transition-colors"
                    style={{ backgroundColor: THEME.accent, color: 'white' }}
                  >
                    Subscribe
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ borderColor: THEME.border }}
        >
          <p className="text-sm" style={{ color: THEME.muted }}>
            &copy; {currentYear} {store.name}. {config.copyright_text}
          </p>

          {/* Payment Icons */}
          {config.show_payment_icons && (
            <div className="flex items-center gap-3">
              <span
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                bKash
              </span>
              <span
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                Nagad
              </span>
              <span
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                Visa
              </span>
              <span
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                COD
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
