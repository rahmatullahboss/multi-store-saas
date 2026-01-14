import { Link } from '@remix-run/react';
import { Instagram, Facebook, Twitter, Globe, Monitor } from 'lucide-react';
import { ECLIPSE_THEME } from '~/components/store-templates/EclipseTheme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface EclipseFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: (string | null)[];
  planType?: string;
}

export function EclipseFooter({ storeName, logo, socialLinks, footerConfig, businessInfo, categories, planType = 'free' }: EclipseFooterProps) {
  return (
    <footer 
      className="relative overflow-hidden pt-20 pb-10 px-4"
      style={{ backgroundColor: ECLIPSE_THEME.footerBg }}
    >
      {/* Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ 
          background: ECLIPSE_THEME.spotlightGradient,
          filter: 'blur(80px)' 
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <h2 
              className="text-4xl font-bold leading-tight text-white"
              style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
            >
              {storeName}
            </h2>
            <p className="text-white/50 max-w-xs">{footerConfig?.description || 'Defining the future of commerce.'}</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white">Explore</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Store</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Journal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Support</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Connect</h4>
            <div className="flex gap-4">
              {socialLinks?.instagram && <a href={socialLinks.instagram} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"><Instagram size={18} /></a>}
              {socialLinks?.twitter && <a href={socialLinks.twitter} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"><Twitter size={18} /></a>}
              {socialLinks?.facebook && <a href={socialLinks.facebook} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"><Facebook size={18} /></a>}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/30">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>

          {/* Viral Loop / Branding */}
          {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
            <div className="flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-white/40 hover:text-purple-400 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-xs text-white/60">Ozzyl</span>
              </a>
            </div>
          )}

          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-2"><Globe size={14} /> Global Delivery</span>
            <span className="flex items-center gap-2"><Monitor size={14} /> Secure Payment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
