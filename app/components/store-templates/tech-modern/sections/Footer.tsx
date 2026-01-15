import { Link } from '@remix-run/react';
import { Zap, Twitter, Linkedin, Youtube, Smartphone } from 'lucide-react';
import { TECH_MODERN_THEME } from '../theme';

interface TechModernFooterProps {
  storeName: string;
  footerConfig?: any;
  businessInfo?: any;
  socialLinks?: any;
  planType?: string;
}

export function TechModernFooter({
  storeName,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
}: TechModernFooterProps) {
  const theme = TECH_MODERN_THEME;

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.accent }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{storeName}</span>
            </div>
            <p className="text-white/60 max-w-md mb-6">
              {footerConfig?.description || 'Your trusted destination for cutting-edge technology and electronics.'}
            </p>

            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-semibold transition-colors"
                style={{ backgroundColor: theme.accent, color: 'white' }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-3 text-white/60">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h5 className="font-semibold mb-4">Connect</h5>
            <ul className="space-y-3 text-white/60 text-sm">
              {businessInfo?.email && <li>{businessInfo.email}</li>}
              {businessInfo?.phone && <li>{businessInfo.phone}</li>}
            </ul>

            <div className="flex gap-3 mt-6">
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              <a className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          
          {/* Viral Loop / Branding */}
          {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
            <div className="flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-white/30 hover:text-blue-400 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-white/60">Ozzyl</span>
              </a>
            </div>
          )}

          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
