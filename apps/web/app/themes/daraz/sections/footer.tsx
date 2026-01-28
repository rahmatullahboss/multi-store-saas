/**
 * Daraz Footer Section
 *
 * Shopify OS 2.0 Compatible Section
 * Multi-column footer matching Daraz Bangladesh website
 *
 * Features:
 * - Customer Care, About, Categories sections
 * - Payment method badges
 * - App download links
 * - Social media links
 */

import { Link } from '@remix-run/react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import type { SectionSchema, SectionComponentProps, BlockInstance } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA (Shopify OS 2.0 Format)
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer (Daraz)',
  tag: 'footer',
  class: 'daraz-footer',
  limit: 1,

  enabled_on: {
    templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],
    groups: ['footer'],
  },

  settings: [
    // Contact Info
    {
      type: 'header',
      id: 'header_contact',
      label: 'Contact Information',
    },
    {
      type: 'text',
      id: 'phone',
      label: 'Phone number',
    },
    {
      type: 'text',
      id: 'email',
      label: 'Email',
    },
    {
      type: 'textarea',
      id: 'address',
      label: 'Address',
    },
    // Social Links
    {
      type: 'header',
      id: 'header_social',
      label: 'Social Media',
    },
    {
      type: 'url',
      id: 'facebook',
      label: 'Facebook URL',
    },
    {
      type: 'url',
      id: 'instagram',
      label: 'Instagram URL',
    },
    {
      type: 'url',
      id: 'twitter',
      label: 'Twitter/X URL',
    },
    {
      type: 'url',
      id: 'youtube',
      label: 'YouTube URL',
    },
    {
      type: 'text',
      id: 'whatsapp',
      label: 'WhatsApp number',
      info: 'e.g., +8801XXXXXXXXX',
    },
    // App Download
    {
      type: 'header',
      id: 'header_app',
      label: 'App Download',
    },
    {
      type: 'checkbox',
      id: 'show_app_download',
      label: 'Show app download section',
      default: true,
    },
    {
      type: 'url',
      id: 'app_store_url',
      label: 'App Store URL',
    },
    {
      type: 'url',
      id: 'google_play_url',
      label: 'Google Play URL',
    },
    // Payment Methods
    {
      type: 'header',
      id: 'header_payment',
      label: 'Payment Methods',
    },
    {
      type: 'text',
      id: 'payment_methods',
      label: 'Payment methods',
      default: 'bKash, Nagad, Visa, Mastercard, COD',
      info: 'Comma-separated list',
    },
    // Branding
    {
      type: 'header',
      id: 'header_branding',
      label: 'Branding',
    },
    {
      type: 'checkbox',
      id: 'show_powered_by',
      label: 'Show "Powered by Ozzyl"',
      default: true,
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
          default: 'Links',
        },
      ],
    },
    {
      type: 'link',
      name: 'Link',
      limit: 20,
      settings: [
        {
          type: 'text',
          id: 'label',
          label: 'Link text',
          default: 'Link',
        },
        {
          type: 'url',
          id: 'url',
          label: 'URL',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Daraz Footer',
      category: 'Footer',
      settings: {
        show_app_download: true,
        show_powered_by: true,
        payment_methods: 'bKash, Nagad, Visa, Mastercard, COD',
      },
      blocks: [
        {
          type: 'link_column',
          settings: { title: 'Customer Care' },
        },
        {
          type: 'link',
          settings: { label: 'Help Center', url: '/help' },
        },
        {
          type: 'link',
          settings: { label: 'How to Buy', url: '/how-to-buy' },
        },
        {
          type: 'link',
          settings: { label: 'Returns & Refunds', url: '/returns' },
        },
        {
          type: 'link',
          settings: { label: 'Shipping Info', url: '/shipping' },
        },
        {
          type: 'link',
          settings: { label: 'Contact Us', url: '/contact' },
        },
      ],
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface FooterSettings {
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
  show_app_download: boolean;
  app_store_url?: string;
  google_play_url?: string;
  payment_methods: string;
  show_powered_by: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazFooter({
  section,
  context,
  settings,
  blocks = [],
}: SectionComponentProps) {
  const config = settings as unknown as FooterSettings;

  const {
    phone,
    email,
    address,
    facebook,
    instagram,
    twitter,
    youtube,
    whatsapp,
    show_app_download = true,
    app_store_url,
    google_play_url,
    payment_methods = 'bKash, Nagad, Visa, Mastercard, COD',
    show_powered_by = true,
  } = config;

  const storeName = context.store?.name || 'Store';
  const paymentList = payment_methods.split(',').map((m) => m.trim());

  // Get categories from context
  const categories = (context.collections || []).slice(0, 6).map((c) => c.title);

  // Parse blocks into columns
  type LinkColumn = { title: string; links: Array<{ label: string; url: string }> };
  const linkColumns: LinkColumn[] = [];
  let currentColumn: LinkColumn | null = null;

  blocks.forEach((block) => {
    if (block.type === 'link_column') {
      if (currentColumn) {
        linkColumns.push(currentColumn);
      }
      currentColumn = {
        title: ((block.settings as Record<string, unknown>).title as string) || 'Links',
        links: [],
      };
    } else if (block.type === 'link' && currentColumn !== null) {
      const blockSettings = block.settings as Record<string, unknown>;
      currentColumn.links.push({
        label: (blockSettings.label as string) || 'Link',
        url: (blockSettings.url as string) || '#',
      });
    }
  });

  if (currentColumn !== null) {
    linkColumns.push(currentColumn);
  }

  const hasSocialLinks = facebook || instagram || twitter || youtube || whatsapp;

  return (
    <footer
      className="bg-white border-t mt-8"
      data-section-id={section.id}
      data-section-type="daraz-footer"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Dynamic Link Columns from Blocks */}
          {linkColumns.map((column, idx) => (
            <div key={idx}>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-800">
                {column.title}
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.url}
                      className="hover:text-orange-500 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Default Customer Care (if no blocks) */}
          {linkColumns.length === 0 && (
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-800">
                Customer Care
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li>
                  <Link to="/help" className="hover:text-orange-500 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/how-to-buy" className="hover:text-orange-500 transition-colors">
                    How to Buy
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="hover:text-orange-500 transition-colors">
                    Returns &amp; Refunds
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="hover:text-orange-500 transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-orange-500 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* About Store */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-800">
              {storeName}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link to="/about" className="hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-500 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-800">
                Categories
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/?category=${encodeURIComponent(cat)}`}
                      className="hover:text-orange-500 transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {(phone || email || address) && (
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-800">
                Contact
              </h3>
              <ul className="space-y-3 text-sm text-gray-500">
                {phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0 text-orange-500" />
                    <a href={`tel:${phone}`} className="hover:text-orange-500 transition-colors">
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0 text-orange-500" />
                    <a href={`mailto:${email}`} className="hover:text-orange-500 transition-colors">
                      {email}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Payment & App Download */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-800">
              Payment Methods
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {paymentList.map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1.5 text-[10px] md:text-xs font-medium rounded bg-gray-100 text-gray-600"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* App Download */}
            {show_app_download && (
              <>
                <h4 className="font-bold mb-3 text-sm text-gray-800">Download App</h4>
                <div className="flex gap-2">
                  <a
                    href={app_store_url || '#app-store'}
                    className="block px-3 py-2 bg-black text-white text-[10px] font-medium rounded hover:bg-gray-800 transition-colors"
                  >
                    App Store
                  </a>
                  <a
                    href={google_play_url || '#google-play'}
                    className="block px-3 py-2 bg-black text-white text-[10px] font-medium rounded hover:bg-gray-800 transition-colors"
                  >
                    Google Play
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Social Links */}
        {hasSocialLinks && (
          <div className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h4 className="font-medium text-sm text-gray-800">Follow Us</h4>
            <div className="flex gap-3">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-400">
          <p suppressHydrationWarning>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-orange-500 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy
            </Link>
          </div>
        </div>

        {/* Powered By */}
        {show_powered_by && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center items-center">
            <a
              href="https://ozzyl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
            >
              Powered by Ozzyl
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
