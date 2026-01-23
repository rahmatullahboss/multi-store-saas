import { Link } from '@remix-run/react';
import { ShoppingBag, Phone, Mail, MapPin, Facebook, Twitter, Sparkles } from 'lucide-react';
import { BDSHOP_THEME } from '../theme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface BDShopFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
}

export function BDShopFooter({ storeName, logo, socialLinks, footerConfig, businessInfo, categories, planType = 'free' }: BDShopFooterProps) {
  return (
    <footer style={{ backgroundColor: BDSHOP_THEME.footerBg }} className="text-white pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
               <div className="h-8 w-8 rounded flex items-center justify-center bg-white/10">
                 <ShoppingBag className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-xl">{storeName}</span>
             </div>
             <p className="text-sm text-white/70 max-w-xs mb-6">
               {footerConfig?.description || 'Your one-stop destination for quality products.'}
             </p>
             <div className="flex flex-col gap-2 text-sm text-white/70">
               {businessInfo?.phone && <span className="flex items-center gap-2"><Phone size={14} /> {businessInfo.phone}</span>}
               {businessInfo?.email && <span className="flex items-center gap-2"><Mail size={14} /> {businessInfo.email}</span>}
             </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/contact" className="hover:text-white transition">Help Center</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Socials</h3>
            <div className="flex gap-4">
               {socialLinks?.facebook && <a href={socialLinks.facebook} className="text-white/70 hover:text-white"><Facebook size={20}/></a>}
               {socialLinks?.twitter && <a href={socialLinks.twitter} className="text-white/70 hover:text-white"><Twitter size={20}/></a>}
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50" suppressHydrationWarning>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          
          {/* Viral Loop / Branding */}
          {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
            <div className="flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-white/40 hover:text-orange-500 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-xs text-white/60">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
