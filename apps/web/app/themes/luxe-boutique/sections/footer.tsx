/**
 * Luxe Boutique - Footer Section
 *
 * Elegant dark footer with:
 * - Multi-column layout
 * - Social links
 * - Payment icons
 * - Newsletter signup
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer',
  tag: 'footer',
  class: 'luxe-footer',
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
      default:
        'Curating timeless pieces for the discerning individual. Quality, elegance, and exceptional service since 2020.',
    },
    {
      type: 'textarea',
      id: 'about_text_bn',
      label: 'About text (Bangla)',
      default:
        'বিচক্ষণ ব্যক্তির জন্য চিরন্তন পণ্য সংগ্রহ। ২০২০ সাল থেকে মান, কমনীয়তা এবং ব্যতিক্রমী সেবা।',
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
      default: 'All rights reserved',
    },
    {
      type: 'text',
      id: 'copyright_text_bn',
      label: 'Copyright text (Bangla)',
      default: 'সর্বস্বত্ব সংরক্ষিত',
    },
  ],

  blocks: [
    {
      type: 'link_column',
      name: 'Link Column',
      limit: 4,
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Column title',
          default: 'Quick Links',
        },
        {
          type: 'text',
          id: 'title_bn',
          label: 'Column title (Bangla)',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Luxe Footer',
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
  copyright_text_bn?: string;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  footerBg: '#1a1a1a',
  footerText: '#faf9f7',
  muted: '#9a9a9a',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LuxeFooter({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as FooterSettings;
  const { store, getLink } = context;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-section-id={section.id}
      style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}
    >
      {/* Newsletter Section */}
      {config.show_newsletter && (
        <div className="py-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Join Our Exclusive List
            </h3>
            <p className="text-sm mb-6" style={{ color: THEME.muted }}>
              Be the first to know about new arrivals and special offers
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-transparent border text-white placeholder:text-gray-400 focus:outline-none focus:border-gold"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium tracking-wider uppercase transition-colors"
                style={{
                  backgroundColor: THEME.accent,
                  color: THEME.primary,
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* About Column */}
            <div className="lg:col-span-1">
              <h4 className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {store.name}
              </h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: THEME.muted }}>
                {config.about_text}
              </p>

              {/* Social Links */}
              {config.show_social_links && (
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="p-2 border rounded-full transition-colors hover:border-gold hover:text-gold"
                    style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="p-2 border rounded-full transition-colors hover:border-gold hover:text-gold"
                    style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="p-2 border rounded-full transition-colors hover:border-gold hover:text-gold"
                    style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-sm font-medium uppercase tracking-wider mb-4">Shop</h5>
              <ul className="space-y-3">
                <li>
                  <a
                    href={getLink?.('/collections/all') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    All Products
                  </a>
                </li>
                <li>
                  <a
                    href={getLink?.('/collections/new-arrivals') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a
                    href={getLink?.('/collections/best-sellers') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a
                    href={getLink?.('/collections/sale') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    Sale
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h5 className="text-sm font-medium uppercase tracking-wider mb-4">
                Customer Service
              </h5>
              <ul className="space-y-3">
                <li>
                  <a
                    href={getLink?.('/pages/contact') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href={getLink?.('/pages/shipping') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a
                    href={getLink?.('/pages/faq') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href={getLink?.('/pages/size-guide') || '#'}
                    className="text-sm transition-colors hover:text-gold"
                    style={{ color: THEME.muted }}
                  >
                    Size Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-sm font-medium uppercase tracking-wider mb-4">Contact</h5>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm" style={{ color: THEME.muted }}>
                  <Phone className="w-4 h-4" />
                  <span>+880 1XXX-XXXXXX</span>
                </li>
                <li className="flex items-center gap-2 text-sm" style={{ color: THEME.muted }}>
                  <Mail className="w-4 h-4" />
                  <span>info@example.com</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: THEME.muted }}>
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Dhaka, Bangladesh</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm" style={{ color: THEME.muted }}>
              &copy; {currentYear} {store.name}. {config.copyright_text}
            </p>

            {/* Payment Icons */}
            {config.show_payment_icons && (
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-2 py-1 border rounded"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  bKash
                </span>
                <span
                  className="text-xs px-2 py-1 border rounded"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Nagad
                </span>
                <span
                  className="text-xs px-2 py-1 border rounded"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  COD
                </span>
                <span
                  className="text-xs px-2 py-1 border rounded"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Visa
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
