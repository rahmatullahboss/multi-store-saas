import { Link } from 'react-router';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import type { SocialLinks } from '@db/types';

interface RovoFooterProps {
  storeName: string;
  socialLinks?: SocialLinks | null;
  logo?: string | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories?: string[];
}

export function RovoFooter({ storeName, socialLinks }: RovoFooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">{storeName}</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Premium quality products with exceptional service. Your satisfaction is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/collections" className="hover:text-white">Shop</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>support@store.com</li>
              <li>+880 1XXX-XXXXXX</li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Facebook size={20} />
                </a>
              )}
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Instagram size={20} />
                </a>
              )}
              {socialLinks?.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Twitter size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
