/**
 * Marketing Footer Component
 * 
 * Shared footer component for all marketing pages.
 * Premium dark theme with responsive layout.
 */

import { Link } from '@remix-run/react';
import { Store, Rocket } from 'lucide-react';

interface MarketingFooterProps {
  showStickyCTA?: boolean;
}

export function MarketingFooter({ showStickyCTA = true }: MarketingFooterProps) {
  return (
    <>
      {/* Footer - Bangladesh Green Theme */}
      <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Single column, Desktop: 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Multi-Store</span>
              </div>
              <p className="text-sm text-white/50">
                বাংলাদেশী উদ্যোক্তাদের জন্য তৈরি ই-কমার্স প্ল্যাটফর্ম
              </p>
            </div>
            
            {/* Product Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">প্রোডাক্ট</h4>
              <ul className="space-y-2">
                <li><Link to="/#features" className="text-white/50 hover:text-[#00875F] transition text-sm">ফিচার</Link></li>
                <li><Link to="/#pricing" className="text-white/50 hover:text-[#00875F] transition text-sm">প্রাইসিং</Link></li>
                <li><Link to="/tutorials" className="text-white/50 hover:text-[#00875F] transition text-sm">টিউটোরিয়াল</Link></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">কোম্পানি</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-white/50 hover:text-[#00875F] transition text-sm">সম্পর্কে</Link></li>
                <li><Link to="/contact" className="text-white/50 hover:text-[#00875F] transition text-sm">যোগাযোগ</Link></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">আইনি</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-white/50 hover:text-[#00875F] transition text-sm">গোপনীয়তা</Link></li>
                <li><Link to="/terms" className="text-white/50 hover:text-[#00875F] transition text-sm">শর্তাবলী</Link></li>
                <li><Link to="/refund" className="text-white/50 hover:text-[#00875F] transition text-sm">রিফান্ড নীতি</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#006A4E]/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">© {new Date().getFullYear()} Multi-Store SaaS. সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex items-center gap-3">
              {[
                { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/8801739416661' },
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '📸', label: 'Instagram', href: '#' },
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA Button */}
      {showStickyCTA && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0F0D] via-[#0A0F0D]/95 to-transparent z-40">
          <Link 
            to="/auth/register" 
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-2xl text-lg shadow-xl shadow-[#006A4E]/40 active:scale-[0.98] transition-transform"
          >
            <Rocket className="w-5 h-5" />
            ফ্রি তে শুরু করুন
          </Link>
        </div>
      )}
    </>
  );
}
