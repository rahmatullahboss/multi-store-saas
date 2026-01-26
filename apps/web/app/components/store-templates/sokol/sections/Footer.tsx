import { Link } from '@remix-run/react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { StoreFooterProps } from '~/templates/store-registry';

export function SokolFooter({
  storeName,
  logo,
  businessInfo,
  socialLinks,
  categories,
  planType = 'free',
  footerConfig,
}: StoreFooterProps) {
  return (
    <footer className="bg-[#0D0D0D] text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & About */}
          <div>
            <Link to="/" className="inline-block mb-6">
              {logo ? (
                <img
                  src={logo}
                  alt={storeName}
                  className="h-8 object-contain brightness-0 invert"
                />
              ) : (
                <span className="text-2xl font-bold tracking-tight font-heading text-white">
                  {storeName}
                </span>
              )}
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium quality products designed for your lifestyle. We believe in style, comfort,
              and innovation.
            </p>
            <div className="flex space-x-3">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 rounded-full hover:bg-rose-600 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 rounded-full hover:bg-rose-600 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 rounded-full hover:bg-rose-600 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">Shop</h3>
            <ul className="space-y-3">
              {categories?.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    to={`/collections/${category}`}
                    className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                  >
                    {category}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/track-order"
                  className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-rose-400 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {businessInfo?.address && (
                <li className="flex items-start space-x-3 text-sm text-gray-400">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" />
                  <span>{businessInfo.address}</span>
                </li>
              )}
              {businessInfo?.phone && (
                <li className="flex items-center space-x-3 text-sm text-gray-400">
                  <Phone className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{businessInfo.phone}</span>
                </li>
              )}
              {businessInfo?.email && (
                <li className="flex items-center space-x-3 text-sm text-gray-400">
                  <Mail className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{businessInfo.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
        </div>
      </div>
    </footer>
  );
}
