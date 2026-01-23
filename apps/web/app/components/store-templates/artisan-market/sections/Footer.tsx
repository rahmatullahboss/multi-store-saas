import { Link } from '@remix-run/react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { ARTISAN_MARKET_THEME } from '../theme';

interface ArtisanMarketFooterProps {
  storeName: string;
  logo?: string | null;
  footerConfig?: any | null;
  businessInfo?: any;
  socialLinks?: any;
  planType?: string;
  categories: (string | null)[];
}

export function ArtisanMarketFooter({
  storeName,
  logo,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
}: ArtisanMarketFooterProps) {
  const theme = ARTISAN_MARKET_THEME;
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              {logo ? (
                <img src={logo} alt={storeName} className="h-12 object-contain" />
              ) : (
                <span className="text-3xl font-semibold" style={{ fontFamily: "'Newsreader', serif", color: theme.accent }}>
                  {storeName}
                </span>
              )}
            </Link>
            <p className="opacity-70 leading-relaxed italic">
              {footerConfig?.description || 'Curating the finest handmade goods from local artisans around the world.'}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 transition-colors hover:opacity-70" style={{ color: theme.accent }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 transition-colors hover:opacity-70" style={{ color: theme.accent }}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 transition-colors hover:opacity-70" style={{ color: theme.accent }}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ fontFamily: "'Newsreader', serif" }}>Categories</h4>
            <ul className="space-y-4">
              {validCategories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link to={`/?category=${encodeURIComponent(category)}`} className="opacity-70 hover:opacity-100 transition-opacity">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ fontFamily: "'Newsreader', serif" }}>Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 opacity-70">
                <MapPin className="w-4 h-4" />
                <span>{businessInfo?.address || '123 Artisan Way, Handcrafted City'}</span>
              </li>
              <li className="flex items-center gap-3 opacity-70">
                <Phone className="w-4 h-4" />
                <span>{businessInfo?.phone || '+1 (234) 567-890'}</span>
              </li>
              <li className="flex items-center gap-3 opacity-70">
                <Mail className="w-4 h-4" />
                <span>{businessInfo?.email || `hello@${storeName.toLowerCase().replace(/\s/g, '')}.com`}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ fontFamily: "'Newsreader', serif" }}>Newsletter</h4>
            <p className="text-sm opacity-70 mb-4">Join our community for stories behind the products.</p>
            <div className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500 transition-all"
              />
              <button 
                className="py-2.5 rounded-lg font-bold transition-all active:scale-[0.98]"
                style={{ backgroundColor: theme.accent, color: 'white' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm opacity-50" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. Every product has a story.
          </p>

          <div className="flex items-center gap-8">
            <span className="text-xs opacity-50 uppercase tracking-widest">Handcrafted with Love</span>
            
            {/* Powered by Ozzyl branding */}
            {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
              <a 
                href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 grayscale"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm" style={{ color: theme.accent }}>Ozzyl</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
