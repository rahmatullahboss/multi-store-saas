import { Phone, MapPin, Mail, Facebook, Instagram } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function Header({ storeName, config }: { storeName: string; config: any }) {
  return (
    <header className="bg-white py-4 sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#1D3557]">
          {storeName}
        </div>
        
        {config.callNumber && (
           <a href={`tel:${config.callNumber}`} className="flex items-center gap-2 text-[#E63946] font-bold">
              <Phone size={18} fill="currentColor" />
              <span className="hidden md:inline">{config.callNumber}</span>
           </a>
        )}
      </div>
    </header>
  );
}

export function Footer({ storeName, config, planType }: SectionProps) {
  return (
    <footer className="bg-[#1D3557] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">{storeName}</h3>
            <p className="text-white/70 leading-relaxed">
              {config.orderFormText?.footerTagline || "আমরা বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপগুলোর একটি। ১০০% অরিজিনাল প্রোডাক্ট, ক্যাশ অন ডেলিভারি এবং সেরা কাস্টমার সার্ভিস দিয়ে আমরা আপনার সেবায় প্রস্তুত।"}
            </p>
          </div>
          
          <div>
             <h4 className="text-xl font-bold mb-4">দ্রুত লিংক</h4>
             <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-[#E63946] transition-colors">হোম</a></li>
                <li><a href="#" className="hover:text-[#E63946] transition-colors">প্রোডাক্ট</a></li>
                <li><a href="#" className="hover:text-[#E63946] transition-colors">রিভিউ</a></li>
                <li><a href="#" className="hover:text-[#E63946] transition-colors">যোগাযোগ</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-xl font-bold mb-4">যোগাযোগ</h4>
             <ul className="space-y-3 text-white/70">
                {config.callNumber && (
                   <li className="flex items-center gap-3">
                      <Phone className="text-[#E63946]" size={18} />
                      <span>{config.callNumber}</span>
                   </li>
                )}
                <li className="flex items-center gap-3">
                      <Mail className="text-[#E63946]" size={18} />
                      <span>info@example.com</span>
                </li>
                <li className="flex items-center gap-3">
                      <MapPin className="text-[#E63946]" size={18} />
                      <span>ঢাকা, বাংলাদেশ</span>
                </li>
             </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
           <p>{config.orderFormText?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. সর্বস্বত্ব সংরক্ষিত।`}</p>
           
           {planType === 'free' && (
            <div className="mt-4 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=quick-start-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white transition-all"
              >
                <span className="uppercase tracking-wider text-xs">Powered by</span>
                <span className="font-bold text-[#E63946]">Ozzyl</span>
              </a>
            </div>
           )}
        </div>
      </div>
    </footer>
  );
}
