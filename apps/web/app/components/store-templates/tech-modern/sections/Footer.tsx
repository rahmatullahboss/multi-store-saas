import { Link } from '@remix-run/react';
import {
  Zap,
  Twitter,
  Linkedin,
  Youtube,
  Smartphone,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  Instagram,
  ChevronRight,
} from 'lucide-react';
import { TECH_MODERN_THEME } from '../theme';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';


interface TechModernFooterProps {
  storeName: string;
  logo?: string | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  socialLinks?: SocialLinks | null;
  planType?: string;
  categories: (string | null)[];
  isPreview?: boolean;
}

// Payment Icon Components
function BkashIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: '#e2136e', color: 'white' }}
    >
      bKash
    </div>
  );
}

function NagadIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: '#f26922', color: 'white' }}
    >
      Nagad
    </div>
  );
}

function VisaIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
      style={{ backgroundColor: '#1a1f71', color: 'white' }}
    >
      VISA
    </div>
  );
}

function MastercardIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
      style={{
        background: 'linear-gradient(90deg, #eb001b 50%, #f79e1b 50%)',
        color: 'white',
      }}
    >
      MC
    </div>
  );
}

function CodIcon() {
  return (
    <div
      className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold border border-white/30"
      style={{ color: 'white' }}
    >
      <CreditCard className="w-3 h-3 mr-1" />
      COD
    </div>
  );
}

export function TechModernFooter({
  storeName,
  logo,
  footerConfig,
  businessInfo,
  socialLinks,
  planType = 'free',
  categories = [],
  isPreview = false,
}: TechModernFooterProps) {
  const theme = TECH_MODERN_THEME;
  const validCategories = categories.filter(Boolean).slice(0, 6) as string[];
  const showPoweredBy = footerConfig?.showPoweredBy ?? planType === 'free';

  // Default business info for preview
  const defaultBusinessInfo = {
    phone: '+880 1XXX-XXXXXX',
    email: 'hello@techstore.com',
    address: 'Level 4, Tech Plaza, Dhanmondi, Dhaka 1209',
  };

  const displayBusinessInfo = isPreview ? defaultBusinessInfo : businessInfo || defaultBusinessInfo;

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      {/* Trust Badges Bar */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: theme.accent + '20' }}
              >
                <Truck className="w-6 h-6" style={{ color: theme.accent }} />
              </div>
              <div>
                <p className="font-bold text-sm">Turbo Delivery</p>
                <p className="text-xs opacity-60">24h in Dhaka</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: theme.accent + '20' }}
              >
                <RotateCcw className="w-6 h-6" style={{ color: theme.accent }} />
              </div>
              <div>
                <p className="font-bold text-sm">Easy Returns</p>
                <p className="text-xs opacity-60">Hassle-free policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: theme.accent + '20' }}
              >
                <Shield className="w-6 h-6" style={{ color: theme.accent }} />
              </div>
              <div>
                <p className="font-bold text-sm">Verified Tech</p>
                <p className="text-xs opacity-60">100% Authentic</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: theme.accent + '20' }}
              >
                <CreditCard className="w-6 h-6" style={{ color: theme.accent }} />
              </div>
              <div>
                <p className="font-bold text-sm">Secure Payment</p>
                <p className="text-xs opacity-60">COD Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-16 border-b relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 rounded-full blur-3xl pointer-events-none" 
             style={{ background: theme.accent, transform: 'translate(30%, -30%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                <Zap className="w-6 h-6" style={{ color: theme.accent }} />
                Join the Tech Revolution
              </h3>
              <p className="opacity-60 max-w-md">
                Subscribe for exclusive tech drops, early bird offers, and expert reviews.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-5 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <button
                className="px-6 py-3 rounded-lg font-bold transition-all hover:brightness-110 hover:shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
                style={{ backgroundColor: theme.accent, color: 'white' }}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 object-contain" />
              ) : (
                <div className="flex items-center gap-2 font-bold text-2xl">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  {storeName}
                </div>
              )}
            </Link>
            <p className="text-sm opacity-70 leading-relaxed max-w-sm">
              {footerConfig?.description ||
                'Cutting-edge technology and premium electronics for the modern world. We bring you the future, today.'}
            </p>
            
            <div className="flex gap-3">
              {(socialLinks?.instagram || isPreview) && (
                <a
                  href={socialLinks?.instagram || '#'}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-105 hover:text-pink-500"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {(socialLinks?.facebook || isPreview) && (
                <a
                  href={socialLinks?.facebook || '#'}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-105 hover:text-blue-500"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {(socialLinks?.twitter || isPreview) && (
                <a
                  href={socialLinks?.twitter || '#'}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-105 hover:text-sky-400"
                  onClick={isPreview ? (e) => e.preventDefault() : undefined}
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a
                  href={socialLinks.youtube}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-105 hover:text-red-500"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-105 hover:text-blue-600"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Payment Icons */}
            <div className="pt-4">
               <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3">Accepted Payments</p>
               <div className="flex flex-wrap gap-2">
                 <BkashIcon />
                 <NagadIcon />
                 <VisaIcon />
                 <MastercardIcon />
                 <CodIcon />
               </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full" style={{ background: theme.accent }}></span>
              Explore
            </h4>
            <ul className="space-y-3">
              {validCategories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/?category=${encodeURIComponent(category)}`}
                    className="text-sm opacity-70 hover:opacity-100 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full" style={{ background: theme.accent }}></span>
              Support
            </h4>
            <ul className="space-y-3">
               <li>
                 <Link to="/contact" className="text-sm opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group">
                   <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                   Contact Us
                 </Link>
               </li>
               <li>
                 <Link to="/pages/about" className="text-sm opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group">
                   <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                   About Us
                 </Link>
               </li>
               <li>
                 <Link to="/track-order" className="text-sm opacity-70 hover:opacity-100 transition-colors flex items-center gap-2 group">
                   <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                   Track Order
                 </Link>
               </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full" style={{ background: theme.accent }}></span>
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              {displayBusinessInfo.email && (
                <li className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" style={{ color: theme.accent }} />
                  </div>
                  <a href={isPreview ? '#' : `mailto:${displayBusinessInfo.email}`} onClick={isPreview ? (e) => e.preventDefault() : undefined}>
                    {displayBusinessInfo.email}
                  </a>
                </li>
              )}
              {displayBusinessInfo.phone && (
                <li className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" style={{ color: theme.accent }} />
                  </div>
                  <a href={isPreview ? '#' : `tel:${displayBusinessInfo.phone}`} onClick={isPreview ? (e) => e.preventDefault() : undefined}>
                    {displayBusinessInfo.phone}
                  </a>
                </li>
              )}
              {displayBusinessInfo.address && (
                <li className="flex items-start gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                  </div>
                  <span>{displayBusinessInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Policies */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 text-sm">
           <Link to="/policies/privacy" className="opacity-60 hover:opacity-100 transition-opacity">Privacy Policy</Link>
           <Link to="/policies/terms" className="opacity-60 hover:opacity-100 transition-opacity">Terms of Service</Link>
           <Link to="/policies/shipping" className="opacity-60 hover:opacity-100 transition-opacity">Shipping Policy</Link>
           <Link to="/policies/refund" className="opacity-60 hover:opacity-100 transition-opacity">Refund Policy</Link>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs opacity-50" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tighter uppercase">
                TechPay Verified
              </span>
            </div>

            {/* Powered by Ozzyl branding */}
            <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}
