/**
 * StoreFooter Component
 * 
 * Template-aware footer component that provides consistent branding
 * across all store pages.
 */

import { Link } from '@remix-run/react';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import type { SocialLinks } from '@db/types';

interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  theme: StoreTemplateTheme;
  templateId: string;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
}

export function StoreFooter({ 
  storeName, 
  logo,
  theme, 
  templateId,
  socialLinks,
  businessInfo
}: StoreFooterProps) {
  const isDarkTheme = templateId === 'modern-premium' || templateId === 'tech-modern';
  
  const footerBg = isDarkTheme ? 'bg-gray-900' : 'bg-gray-50';
  const borderColor = isDarkTheme ? 'border-gray-800' : 'border-gray-200';
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900';
  const mutedColor = isDarkTheme ? 'text-gray-400' : 'text-gray-500';
  const hoverColor = isDarkTheme ? 'hover:text-white' : 'hover:text-gray-900';

  return (
    <footer className={`relative z-10 border-t ${borderColor} ${footerBg}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 text-center md:text-left">
            <Link to="/" className={`text-xl font-bold inline-flex items-center gap-2 ${textColor}`}>
              {logo && <img src={logo} alt={storeName} className="h-8 w-8 object-contain" />}
              {storeName}
            </Link>
            <p className={`text-sm ${mutedColor}`}>
              Quality products with excellent customer service.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={`${mutedColor} hover:text-blue-500 transition`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={`${mutedColor} hover:text-pink-500 transition`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {socialLinks?.whatsapp && (
                <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={`${mutedColor} hover:text-green-500 transition`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="text-center md:text-left">
            <h3 className={`font-semibold mb-4 ${textColor}`}>Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>All Products</Link></li>
              <li><Link to="/products?sort=newest" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>New Arrivals</Link></li>
              <li><Link to="/products?sort=popular" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>Best Sellers</Link></li>
              <li><Link to="/products?sale=true" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>Sale</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="text-center md:text-left">
            <h3 className={`font-semibold mb-4 ${textColor}`}>Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>Contact Us</Link></li>
              <li><Link to="/faq" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>FAQs</Link></li>
              <li><Link to="/returns" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>Returns</Link></li>
              <li><Link to="/track-order" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>Track Order</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className={`font-semibold mb-4 ${textColor}`}>Contact</h3>
            <ul className="space-y-3">
              {businessInfo?.email && (
                <li className={`flex items-center justify-center md:justify-start gap-2 text-sm ${mutedColor}`}>
                  📧 {businessInfo.email}
                </li>
              )}
              {businessInfo?.phone && (
                <li className={`flex items-center justify-center md:justify-start gap-2 text-sm ${mutedColor}`}>
                  📞 {businessInfo.phone}
                </li>
              )}
              {businessInfo?.address && (
                <li className={`flex items-start justify-center md:justify-start gap-2 text-sm ${mutedColor}`}>
                  📍 {businessInfo.address}
                </li>
              )}
              {!businessInfo?.email && !businessInfo?.phone && !businessInfo?.address && (
                <>
                  <li className={`flex items-center justify-center md:justify-start gap-2 text-sm ${mutedColor}`}>📧 support@store.com</li>
                  <li className={`flex items-center justify-center md:justify-start gap-2 text-sm ${mutedColor}`}>📞 +880 1XXX-XXXXXX</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-12 pt-8 border-t ${borderColor}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-sm ${mutedColor}`}>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>
                About Us
              </Link>
              <Link to="/privacy" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>
                Privacy Policy
              </Link>
              <Link to="/terms" className={`text-sm ${mutedColor} ${hoverColor} transition-colors`}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
