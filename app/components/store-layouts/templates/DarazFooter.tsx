import { Link } from '@remix-run/react';
import { DARAZ_THEME } from '~/components/store-templates/DarazTheme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface DarazFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
  footerConfig?: FooterConfig | null;
}

export function DarazFooter({ storeName, logo, socialLinks, footerConfig, businessInfo, categories, planType = 'free' }: DarazFooterProps) {
  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Customer Care</h3>
            <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
              <li><Link to="/help" className="hover:text-orange-500 transition">Help Center</Link></li>
              <li><Link to="/returns" className="hover:text-orange-500 transition">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>{storeName}</h3>
            <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
              <li><Link to="/about" className="hover:text-orange-500 transition">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Categories</h3>
            <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
              {featuredCategories.slice(0, 5).map(cat => (
                <li key={cat}>
                  <Link to={`/?category=${encodeURIComponent(cat!)}`} className="hover:text-orange-500 transition">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Contact</h3>
            <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
              {businessInfo?.phone && <li>📞 {businessInfo.phone}</li>}
              {businessInfo?.email && <li>📧 {businessInfo.email}</li>}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Payment</h3>
            <div className="flex flex-wrap gap-2 text-[10px] font-medium opacity-70">
              <span className="px-2 py-1 bg-gray-100 rounded">bKash</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Nagad</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Visa</span>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-10 pt-6 flex justify-between text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {storeName}.</p>
          <div className="flex gap-4">
             {socialLinks?.facebook && <a href={socialLinks.facebook} className="hover:text-orange-500">Facebook</a>}
             {socialLinks?.twitter && <a href={socialLinks.twitter} className="hover:text-orange-500">X</a>}
          </div>
        </div>

        {/* Viral Loop / Branding */}
        {(planType === 'free' || footerConfig?.showPoweredBy !== false) && (
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-center items-center">
            <a 
              href="https://ozzy.com?utm_source=footer-branding&utm_medium=referral" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
            >
              <span>Powered by</span>
              <span className="font-bold tracking-tight text-xs text-gray-500">Ozzyl</span>
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
