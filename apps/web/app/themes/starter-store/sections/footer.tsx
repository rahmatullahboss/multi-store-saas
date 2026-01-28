/**
 * Footer Section
 *
 * Shopify OS 2.0 Compatible Section
 * Site footer with links, contact info, and social media.
 */

import { Link } from '@remix-run/react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Footer',
  tag: 'footer',
  class: 'site-footer',
  limit: 1,

  enabled_on: {
    groups: ['footer'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_branding',
      label: 'Branding',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Store description',
      default: 'বাংলাদেশের সেরা অনলাইন শপিং প্লাটফর্ম। সেরা মানের পণ্য, সেরা সার্ভিস।',
    },
    {
      type: 'header',
      id: 'header_contact',
      label: 'Contact Info',
    },
    {
      type: 'text',
      id: 'phone',
      label: 'Phone',
      default: '+880 1234-567890',
    },
    {
      type: 'text',
      id: 'email',
      label: 'Email',
      default: 'info@store.com',
    },
    {
      type: 'textarea',
      id: 'address',
      label: 'Address',
      default: 'ঢাকা, বাংলাদেশ',
    },
    {
      type: 'header',
      id: 'header_social',
      label: 'Social Media',
    },
    {
      type: 'url',
      id: 'facebook_url',
      label: 'Facebook URL',
    },
    {
      type: 'url',
      id: 'instagram_url',
      label: 'Instagram URL',
    },
    {
      type: 'url',
      id: 'youtube_url',
      label: 'YouTube URL',
    },
    {
      type: 'header',
      id: 'header_colors',
      label: 'Colors',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#111827',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text color',
      default: '#ffffff',
    },
    {
      type: 'checkbox',
      id: 'show_powered_by',
      label: 'Show "Powered by" text',
      default: true,
    },
  ],

  blocks: [
    {
      type: 'link_list',
      name: 'Menu',
      settings: [
        {
          type: 'text',
          id: 'heading',
          label: 'Heading',
          default: 'দ্রুত লিংক',
        },
        {
          type: 'link_list',
          id: 'menu',
          label: 'Menu',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Footer',
      category: 'Footer',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface FooterSettings {
  description: string;
  phone: string;
  email: string;
  address: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  background_color: string;
  text_color: string;
  show_powered_by: boolean;
}

export default function Footer({ section, context, settings }: SectionComponentProps) {
  const {
    description = 'বাংলাদেশের সেরা অনলাইন শপিং প্লাটফর্ম। সেরা মানের পণ্য, সেরা সার্ভিস।',
    phone = '+880 1234-567890',
    email = 'info@store.com',
    address = 'ঢাকা, বাংলাদেশ',
    facebook_url,
    instagram_url,
    youtube_url,
    background_color = '#111827',
    text_color = '#ffffff',
    show_powered_by = true,
  } = settings as unknown as FooterSettings;

  const storeName = context.store?.name || 'Store';
  const textMuted = `${text_color}cc`;
  const borderColor = `${text_color}20`;

  // Quick links
  const quickLinks = [
    { label: 'হোম', href: '/' },
    { label: 'নতুন পণ্য', href: '/collections/new-arrivals' },
    { label: 'বেস্ট সেলার', href: '/collections/best-sellers' },
    { label: 'সেল', href: '/collections/sale' },
  ];

  // Help links
  const helpLinks = [
    { label: 'সাধারণ জিজ্ঞাসা', href: '/pages/faq' },
    { label: 'ডেলিভারি পলিসি', href: '/pages/shipping' },
    { label: 'রিটার্ন পলিসি', href: '/pages/returns' },
    { label: 'প্রাইভেসি পলিসি', href: '/pages/privacy' },
  ];

  return (
    <footer
      style={{ backgroundColor: background_color }}
      data-section-id={section.id}
      data-section-type="footer"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: text_color }}>
              {storeName}
            </h3>
            <p className="text-sm mb-4" style={{ color: textMuted }}>
              {description}
            </p>
            <div className="flex gap-3">
              {facebook_url && (
                <a
                  href={facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:opacity-80 transition"
                  style={{ backgroundColor: `${text_color}20` }}
                >
                  <Facebook className="w-4 h-4" style={{ color: text_color }} />
                </a>
              )}
              {instagram_url && (
                <a
                  href={instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:opacity-80 transition"
                  style={{ backgroundColor: `${text_color}20` }}
                >
                  <Instagram className="w-4 h-4" style={{ color: text_color }} />
                </a>
              )}
              {youtube_url && (
                <a
                  href={youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:opacity-80 transition"
                  style={{ backgroundColor: `${text_color}20` }}
                >
                  <Youtube className="w-4 h-4" style={{ color: text_color }} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: text_color }}>
              দ্রুত লিংক
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: textMuted }}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: text_color }}>
              সাহায্য
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: textMuted }}>
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: text_color }}>
              যোগাযোগ
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: textMuted }}>
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {phone}
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {email}
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  {address}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="border-t mt-8 pt-8 text-center text-sm"
          style={{ borderColor, color: `${text_color}99` }}
        >
          © {new Date().getFullYear()} {storeName}। সর্বস্বত্ব সংরক্ষিত।
          {show_powered_by && <span className="block mt-2 opacity-60">Powered by Ozzyl</span>}
        </div>
      </div>
    </footer>
  );
}
