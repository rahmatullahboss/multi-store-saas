import { Link } from '@remix-run/react';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import { ZENITH_RISE_THEME } from '~/components/store-templates/zenith-rise/styles/tokens';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';

interface ZenithRiseFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  planType?: string;
}

export function ZenithRiseFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories = [],
  planType = 'free',
}: ZenithRiseFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-slate-950 border-t border-slate-900 pt-20 pb-10"
      style={{ fontFamily: ZENITH_RISE_THEME.fontFamily }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Top Section: Brand + Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              {logo ? <img src={logo} alt={storeName} className="h-8" /> : storeName}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              {footerConfig?.description ||
                'Elevating your lifestyle with premium products designed for the modern world.'}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  className="p-2 rounded-full bg-slate-900 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Facebook size={20} />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  className="p-2 rounded-full bg-slate-900 text-slate-400 hover:bg-sky-500 hover:text-white transition-all"
                >
                  <Twitter size={20} />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  className="p-2 rounded-full bg-slate-900 text-slate-400 hover:bg-pink-600 hover:text-white transition-all"
                >
                  <Instagram size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <h3 className="text-white font-semibold mb-4">Stay available</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
              />
              <button className="bg-white text-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-t border-slate-900 pt-16">
          <div>
            <h4 className="text-white font-bold mb-6">Shop</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/?category=all"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=new"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=featured"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/legal"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400">
              {businessInfo?.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-indigo-500 shrink-0 mt-1" />
                  <span>{businessInfo.address}</span>
                </li>
              )}
              {businessInfo?.email && (
                <li className="flex items-center gap-3">
                  <Mail size={20} className="text-indigo-500 shrink-0" />
                  <a
                    href={`mailto:${businessInfo.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {businessInfo.email}
                  </a>
                </li>
              )}
              {businessInfo?.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={20} className="text-indigo-500 shrink-0" />
                  <a
                    href={`tel:${businessInfo.phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {businessInfo.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-900 gap-4">
          <p className="text-slate-600 text-sm" suppressHydrationWarning>
            © {currentYear} {storeName}. All rights reserved.
          </p>

          <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
        </div>
      </div>
    </footer>
  );
}
