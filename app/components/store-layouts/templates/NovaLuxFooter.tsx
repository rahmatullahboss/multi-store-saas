import { Link } from '@remix-run/react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { NOVALUX_THEME } from '~/components/store-templates/NovaLuxTheme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface NovaLuxFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
}

export function NovaLuxFooter({ storeName, logo, socialLinks, footerConfig, businessInfo, categories = [] }: NovaLuxFooterProps) {
  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    footerBg: NOVALUX_THEME.footerBg,
    footerText: NOVALUX_THEME.footerText,
  };

  return (
    <footer style={{ backgroundColor: THEME.footerBg, color: THEME.footerText }}>
      {/* Newsletter Section */}
      <div className="py-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 
            className="text-3xl lg:text-4xl font-semibold mb-4"
            style={{ fontFamily: NOVALUX_THEME.fontHeading }}
          >
            Join the {storeName} Family
          </h3>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Subscribe for exclusive offers, early access to new arrivals, and curated content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none transition-colors"
            />
            <button
              className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              style={{ background: NOVALUX_THEME.accentGradient, color: THEME.primary }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h4 
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: NOVALUX_THEME.fontHeading }}
            >
              {storeName}
            </h4>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {footerConfig?.description || 'Curating exceptional products for those who appreciate the finer things in life.'}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks?.instagram && <a href={socialLinks.instagram} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Instagram className="w-5 h-5" /></a>}
              {socialLinks?.facebook && <a href={socialLinks.facebook} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Facebook className="w-5 h-5" /></a>}
              {socialLinks?.twitter && <a href={socialLinks.twitter} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Twitter className="w-5 h-5" /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold uppercase text-sm tracking-wider mb-6" style={{ color: THEME.accent }}>Quick Links</h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Home</Link></li>
              <li><Link to="/products" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Shop All</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" /> About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold uppercase text-sm tracking-wider mb-6" style={{ color: THEME.accent }}>Get in Touch</h5>
            <ul className="space-y-4 text-sm">
              {businessInfo?.email && <li className="flex items-center gap-3 text-white/70"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10"><Mail className="w-4 h-4" style={{ color: THEME.accent }} /></div>{businessInfo.email}</li>}
              {businessInfo?.phone && <li className="flex items-center gap-3 text-white/70"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10"><Phone className="w-4 h-4" style={{ color: THEME.accent }} /></div>{businessInfo.phone}</li>}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
