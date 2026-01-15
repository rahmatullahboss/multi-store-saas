import { Link } from '@remix-run/react';
import { Zap, Twitter, Linkedin, Youtube, Smartphone } from 'lucide-react';
import { TECH_MODERN_THEME } from '../theme';

interface TechModernFooterProps {
  storeName: string;
  logo?: string | null;
  footerConfig?: any | null;
  businessInfo?: any;
  socialLinks?: any;
  planType?: string;
  categories: (string | null)[];
}

export function TechModernFooter({
  storeName,
  logo,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
}: TechModernFooterProps) {
  const theme = TECH_MODERN_THEME;
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 object-contain" />
              ) : (
                <div className="flex items-center gap-2 font-bold text-xl">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  {storeName}
                </div>
              )}
            </Link>
            <p className="text-sm opacity-70 leading-relaxed max-w-xs">
              {footerConfig?.description || 'Cutting-edge technology and premium electronics for the modern world.'}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-4">
              {validCategories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link to={`/?category=${encodeURIComponent(category)}`} className="text-sm opacity-70 hover:opacity-100 hover:text-blue-400 transition-colors">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-sm opacity-70 hover:opacity-100 transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="text-sm opacity-70 hover:opacity-100 transition-colors">About TechStore</Link></li>
              <li><Link to="/shipping" className="text-sm opacity-70 hover:opacity-100 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-sm opacity-70 hover:opacity-100 transition-colors">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Newsletter</h4>
            <p className="text-sm opacity-70">Subscribe to get special offers and first look at new products.</p>
            <div className="relative group">
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                className="mt-3 w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                style={{ backgroundColor: theme.accent }}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs opacity-50">
            © {new Date().getFullYear()} {storeName}. Built for enthusiasts.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 grayscale opacity-50">
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tighter uppercase">TechPay Verified</span>
            </div>
            
            {/* Powered by Ozzyl branding */}
            {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
              <a 
                href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-blue-400">Ozzyl</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
