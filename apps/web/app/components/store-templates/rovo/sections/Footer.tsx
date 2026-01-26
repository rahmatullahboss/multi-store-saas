import { Link } from '@remix-run/react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { StoreFooterProps } from '~/templates/store-registry';

export function RovoFooter({
  storeName,
  logo,
  businessInfo,
  socialLinks,
  categories,
}: StoreFooterProps) {
  return (
    <footer className="bg-gray-100 text-gray-800 pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & About */}
          <div>
            <Link to="/" className="inline-block mb-6">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 object-contain" />
              ) : (
                <span className="text-2xl font-bold tracking-tighter uppercase font-heading">
                  {storeName}
                </span>
              )}
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Premium quality products designed for your lifestyle. We believe in style, comfort,
              and innovation.
            </p>
            <div className="flex space-x-4">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-6 text-sm">Shop</h3>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    to={`/collections/${category}`}
                    className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                  >
                    {category}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-6 text-sm">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/track-order"
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-6 text-sm">Contact Us</h3>
            <ul className="space-y-4">
              {businessInfo?.address && (
                <li className="flex items-start space-x-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>{businessInfo.address}</span>
                </li>
              )}
              {businessInfo?.phone && (
                <li className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone className="w-5 h-5 shrink-0" />
                  <span>{businessInfo.phone}</span>
                </li>
              )}
              {businessInfo?.email && (
                <li className="flex items-center space-x-3 text-sm text-gray-600">
                  <Mail className="w-5 h-5 shrink-0" />
                  <span>{businessInfo.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 grayscale opacity-70">
            {/* Payment Icons Placeholder */}
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
