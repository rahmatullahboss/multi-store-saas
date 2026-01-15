import { Link } from '@remix-run/react';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { ARTISAN_MARKET_THEME } from '../theme';

interface ArtisanMarketFooterProps {
  storeName: string;
  footerConfig?: any;
  businessInfo?: any;
  socialLinks?: any;
  planType?: string;
}

export function ArtisanMarketFooter({
  storeName,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
}: ArtisanMarketFooterProps) {
  const theme = ARTISAN_MARKET_THEME;

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "'Newsreader', serif" }}
            >
              {storeName}
            </h3>
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              {footerConfig?.description || 'Connecting artisans with appreciators of handcrafted beauty. Every purchase supports traditional craftsmanship.'}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks?.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: theme.accent }}>
              Explore
            </h5>
            <ul className="space-y-3 text-white/70">
              <li><Link to="/" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: theme.accent }}>
              Get in Touch
            </h5>
            <ul className="space-y-3 text-white/70">
              {businessInfo?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{businessInfo.email}</span>
                </li>
              )}
              {businessInfo?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{businessInfo.phone}</span>
                </li>
              )}
              {businessInfo?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{businessInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Branding */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-white/50 flex items-center justify-center gap-2">
            Made with <span className="text-red-400">❤️</span> by passionate artisans
          </p>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          
          {/* Viral Loop / Branding */}
          {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
            <div className="pt-2">
              <a 
                href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-white/30 hover:text-amber-400 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
                style={{ color: theme.accent }}
              >
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>Powered by</span>
                <span className="font-bold tracking-tight text-sm">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
