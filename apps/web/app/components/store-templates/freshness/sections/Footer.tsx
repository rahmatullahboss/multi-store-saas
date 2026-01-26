import { Link } from '@remix-run/react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { FRESHNESS_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';

interface FreshnessFooterProps {
  storeName: string;
  logo?: string | null;
  footerConfig?: any | null;
  businessInfo?: any;
  socialLinks?: any;
  planType?: string;
  categories: (string | null)[];
}

export function FreshnessFooter({
  storeName,
  logo,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
}: FreshnessFooterProps) {
  const theme = FRESHNESS_THEME;
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      {/* Features Bar */}
      <div className="border-y" style={{ borderColor: theme.border }}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Truck className="w-10 h-10" style={{ color: theme.secondary }} />
              <h5 className="font-bold">Fast & Free Delivery</h5>
              <p className="text-sm opacity-60">On orders over $50</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="w-10 h-10" style={{ color: theme.secondary }} />
              <h5 className="font-bold">100% Safe Payments</h5>
              <p className="text-sm opacity-60">Secure payment gateway</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <RotateCcw className="w-10 h-10" style={{ color: theme.secondary }} />
              <h5 className="font-bold">Easy Returns</h5>
              <p className="text-sm opacity-60">30 days return policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link
              to="/"
              className="text-3xl font-bold italic"
              style={{ fontFamily: theme.fontHeading, color: theme.primary }}
            >
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 object-contain" />
              ) : (
                storeName
              )}
            </Link>
            <p className="text-gray-600 leading-relaxed">
              {footerConfig?.description ||
                'Your one-stop shop for fresh, organic, and healthy groceries delivered to your doorstep.'}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-green-600 hover:text-white transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-green-600 hover:text-white transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-green-600 hover:text-white transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-bold mb-6">Explore</h4>
            <ul className="space-y-4">
              {validCategories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    to={`/?category=${encodeURIComponent(category)}`}
                    className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-xl font-bold mb-6">Information</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                >
                  About Freshness
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                >
                  Shipping Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-green-600 font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xl font-bold mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 text-gray-600">
                <MapPin className="w-6 h-6 text-green-600 shrink-0" />
                <span className="text-sm font-medium">
                  {businessInfo?.address || 'Freshness Market, 101 Green Valley, Eco City'}
                </span>
              </li>
              <li className="flex items-center gap-4 text-gray-600">
                <Phone className="w-6 h-6 text-green-600 shrink-0" />
                <span className="text-sm font-medium">
                  {businessInfo?.phone || '+880 1234567890'}
                </span>
              </li>
              <li className="flex items-center gap-4 text-gray-600">
                <Mail className="w-6 h-6 text-green-600 shrink-0" />
                <span className="text-sm font-medium">
                  {businessInfo?.email || `hello@${storeName.toLowerCase().replace(/\s/g, '')}.com`}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ borderColor: theme.border }}
        >
          <p className="text-sm text-gray-500 font-medium" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. Naturally fresh, amazingly local.
          </p>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 grayscale opacity-50">
              <span className="text-xs font-bold tracking-tight uppercase">Quality Choice</span>
            </div>

            <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}
