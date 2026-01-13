import { Link } from '@remix-run/react';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { GHORER_BAZAR_THEME } from '~/components/store-templates/GhorerBazarTheme';
import type { SocialLinks, FooterConfig } from '@db/types';

interface GhorerBazarFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
}

export function GhorerBazarFooter({ storeName, logo, socialLinks, footerConfig, businessInfo, categories }: GhorerBazarFooterProps) {
  const { primary, footerBg } = GHORER_BAZAR_THEME;

  return (
    <footer className="border-t border-gray-200" style={{ backgroundColor: footerBg }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold" style={{ color: primary }}>{storeName}</span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {footerConfig?.description || 'আমরা সেরা মানের পণ্য সেরা দামে সরবরাহ করি।'}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4" style={{ color: primary }}>COMPANY</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4" style={{ color: primary }}>HELP</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/returns">Return Policy</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4" style={{ color: primary }}>CONTACT</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {businessInfo?.phone && <p>📞 {businessInfo.phone}</p>}
              {businessInfo?.email && <p>📧 {businessInfo.email}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="text-white py-4" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between text-sm">
          <p>© {new Date().getFullYear()} {storeName}.</p>
          <div className="flex gap-4">
             {socialLinks?.facebook && <a href={socialLinks.facebook}><Facebook size={18}/></a>}
          </div>
        </div>
      </div>
    </footer>
  );
}
