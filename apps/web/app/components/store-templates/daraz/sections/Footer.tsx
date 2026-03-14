/**
 * Daraz Footer Component
 *
 * Multi-column footer matching Daraz Bangladesh website with:
 * - Customer Care, About, Categories sections
 * - Payment method badges
 * - App download links
 * - Social media links
 */

import { Link } from 'react-router';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { DARAZ_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';
import type { StoreCategory } from '~/templates/store-registry';

interface DarazFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | StoreCategory | null)[];
  planType?: string;
  footerConfig?: FooterConfig | null;
}

export function DarazFooter({
  storeName,
  logo: _logo,
  socialLinks,
  footerConfig: _footerConfig,
  businessInfo,
  categories,
  planType = 'free',
}: DarazFooterProps) {
  const featuredCategories = categories
    .map((category) => (typeof category === 'string' ? category : category?.title || null))
    .filter(Boolean)
    .slice(0, 8);

  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Customer Care */}
          <div>
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: DARAZ_THEME.text }}
            >
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: DARAZ_THEME.textSecondary }}>
              <li>
                <Link to="/help" className="hover:text-orange-500 transition-colors cursor-pointer">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/how-to-buy"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  How to Buy
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* About Store */}
          <div>
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: DARAZ_THEME.text }}
            >
              {storeName}
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: DARAZ_THEME.textSecondary }}>
              <li>
                <Link
                  to="/about"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {featuredCategories.length > 0 && (
            <div>
              <h3
                className="font-bold mb-4 text-sm uppercase tracking-wide"
                style={{ color: DARAZ_THEME.text }}
              >
                Categories
              </h3>
              <ul className="space-y-2.5 text-sm" style={{ color: DARAZ_THEME.textSecondary }}>
                {featuredCategories.slice(0, 6).map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/?category=${encodeURIComponent(cat!)}`}
                      className="hover:text-orange-500 transition-colors cursor-pointer"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: DARAZ_THEME.text }}
            >
              Contact
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: DARAZ_THEME.textSecondary }}>
              {businessInfo?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: DARAZ_THEME.primary }} />
                  <a
                    href={`tel:${businessInfo.phone}`}
                    className="hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    {businessInfo.phone}
                  </a>
                </li>
              )}
              {businessInfo?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: DARAZ_THEME.primary }} />
                  <a
                    href={`mailto:${businessInfo.email}`}
                    className="hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    {businessInfo.email}
                  </a>
                </li>
              )}
              {businessInfo?.address && (
                <li className="flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: DARAZ_THEME.primary }}
                  />
                  <span>{businessInfo.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Payment & App Download */}
          <div className="col-span-2 md:col-span-1">
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: DARAZ_THEME.text }}
            >
              Payment Methods
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {['bKash', 'Nagad', 'COD'].map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1.5 text-[10px] md:text-xs font-medium rounded"
                  style={{
                    backgroundColor: DARAZ_THEME.background,
                    color: DARAZ_THEME.textSecondary,
                  }}
                >
                  {method}
                </span>
              ))}
            </div>

            {/* App Download */}
            <h4 className="font-bold mb-3 text-sm" style={{ color: DARAZ_THEME.text }}>
              Download App
            </h4>
            <div className="flex gap-2">
              <a
                href="#app-store"
                className="block px-3 py-2 bg-black text-white text-[10px] font-medium rounded hover:bg-gray-800 transition-colors cursor-pointer"
              >
                App Store
              </a>
              <a
                href="#google-play"
                className="block px-3 py-2 bg-black text-white text-[10px] font-medium rounded hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Google Play
              </a>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(socialLinks?.facebook || socialLinks?.twitter || socialLinks?.instagram) && (
          <div className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h4 className="font-medium text-sm" style={{ color: DARAZ_THEME.text }}>
              Follow Us
            </h4>
            <div className="flex gap-3">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
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
        <div
          className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm"
          style={{ color: DARAZ_THEME.muted }}
        >
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-orange-500 transition-colors cursor-pointer">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-orange-500 transition-colors cursor-pointer">
              Privacy
            </Link>
          </div>
        </div>

        {/* Viral Loop / Branding */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center items-center">
          <OzzylBranding planType={planType} showPoweredBy={true} />
        </div>
      </div>
    </footer>
  );
}
