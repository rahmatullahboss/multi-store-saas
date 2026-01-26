import { Link } from '@remix-run/react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { TURBO_SALE_THEME } from '../styles/tokens';
import { OzzylBranding } from '../../shared/OzzylBranding';
import type { SocialLinks, FooterConfig } from '@db/types';

interface TurboSaleFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
}

export function TurboSaleFooter({
  storeName,
  logo,
  socialLinks,
  footerConfig,
  businessInfo,
  categories,
  planType = 'free',
}: TurboSaleFooterProps) {
  const { primary, footerBg, accent, secondary, text } = TURBO_SALE_THEME;
  const footerText = '#FFFFFF'; // Footer has dark bg, so white text

  return (
    <footer className="border-t-4" style={{ backgroundColor: footerBg, borderColor: primary }}>
      {/* Trust Badges Bar */}
      <div className="border-b" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5" style={{ color: accent }} />
              <span className="text-xs font-medium" style={{ color: footerText }}>
                ফ্রি ডেলিভারি
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-5 w-5" style={{ color: accent }} />
              <span className="text-xs font-medium" style={{ color: footerText }}>
                ১০০% অরিজিনাল
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="h-5 w-5" style={{ color: accent }} />
              <span className="text-xs font-medium" style={{ color: footerText }}>
                ৭ দিন রিটার্ন
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 w-auto" />
              ) : (
                <span
                  className="text-xl font-black italic tracking-tighter"
                  style={{ color: primary }}
                >
                  {storeName}
                </span>
              )}
            </div>
            <p className="text-sm mb-4" style={{ color: footerText }}>
              {footerConfig?.description || 'সেরা মানের পণ্য, সেরা দামে! সীমিত সময়ের অফার।'}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  className="p-2 rounded-full hover:opacity-80 transition"
                  style={{ backgroundColor: `${primary}20`, color: primary }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  className="p-2 rounded-full hover:opacity-80 transition"
                  style={{ backgroundColor: `${primary}20`, color: primary }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${socialLinks.whatsapp}`}
                  className="p-2 rounded-full hover:opacity-80 transition"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: primary }}
            >
              দ্রুত লিংক
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:underline" style={{ color: footerText }}>
                  হোম
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:underline" style={{ color: footerText }}>
                  সব পণ্য
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline" style={{ color: footerText }}>
                  যোগাযোগ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: primary }}
            >
              গ্রাহক সেবা
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/policies/terms"
                  className="hover:underline"
                  style={{ color: footerText }}
                >
                  ব্যবহারের শর্ত
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/privacy"
                  className="hover:underline"
                  style={{ color: footerText }}
                >
                  গোপনীয়তা নীতি
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/refund"
                  className="hover:underline"
                  style={{ color: footerText }}
                >
                  রিটার্ন নীতি
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3
              className="font-bold mb-4 text-sm uppercase tracking-wide"
              style={{ color: primary }}
            >
              যোগাযোগ
            </h3>
            <div className="space-y-3 text-sm">
              {businessInfo?.phone && (
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="flex items-center gap-2 hover:opacity-80"
                  style={{ color: footerText }}
                >
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />
                  <span>{businessInfo.phone}</span>
                </a>
              )}
              {businessInfo?.email && (
                <a
                  href={`mailto:${businessInfo.email}`}
                  className="flex items-center gap-2 hover:opacity-80"
                  style={{ color: footerText }}
                >
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />
                  <span className="break-all">{businessInfo.email}</span>
                </a>
              )}
              {businessInfo?.address && (
                <div className="flex items-start gap-2" style={{ color: footerText }}>
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span>{businessInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t" style={{ borderColor: `${primary}20` }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: footerText }} suppressHydrationWarning>
              © {new Date().getFullYear()} {storeName}. সর্বস্বত্ব সংরক্ষিত।
            </p>

            <OzzylBranding planType={planType} showPoweredBy={footerConfig?.showPoweredBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default TurboSaleFooter;
