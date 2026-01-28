import { Link } from '@remix-run/react';
import { Instagram, Facebook, Twitter, Globe, Monitor } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ECLIPSE_THEME_CONFIG } from '../index';
import { OzzylBranding } from '~/components/store-templates/shared/OzzylBranding';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  limit: 1,
  settings: [
    {
      type: 'textarea',
      id: 'description',
      label: 'Footer Description',
      default: 'Defining the future of commerce.',
    },
    {
      type: 'checkbox',
      id: 'show_powered_by',
      label: 'Show Powered By Ozzyl',
      default: true,
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function EclipseFooter({ context, settings }: SectionComponentProps) {
  const { store, getLink } = context;
  const config = ECLIPSE_THEME_CONFIG.colors!;
  
  // Cast store to any for social links until typed properly
  const storeAny = store as any;
  const socialLinks = {
    instagram: storeAny.instagram,
    facebook: storeAny.facebook,
    twitter: storeAny.twitter,
  };
  
  const description = settings.description as string;
  const showPoweredBy = settings.show_powered_by as boolean;

  return (
    <footer
      className="relative overflow-hidden pt-20 pb-10 px-4 font-sans"
      style={{ backgroundColor: config.footerBg }}
    >
      {/* Background Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: config.spotlightGradient as string,
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <h2
              className="text-4xl font-bold leading-tight text-white"
              style={{ fontFamily: ECLIPSE_THEME_CONFIG.typography?.fontFamilyHeading }}
            >
              {store.name}
            </h2>
            <p className="text-white/50 max-w-xs">
              {description}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Explore</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li>
                <Link to={getLink('/')} className="hover:text-white transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link to={getLink('/products')} className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Support</h4>
            <ul className="space-y-4 text-white/50 text-sm">
               <li>
                <Link to={getLink('/contact')} className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to={getLink('/policies/shipping')} className="hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to={getLink('/policies/terms')} className="hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"
                >
                  <Instagram size={18} />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"
                >
                  <Twitter size={18} />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white"
                >
                  <Facebook size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/30">
          <p>
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>

          <OzzylBranding planType={store.planType} showPoweredBy={showPoweredBy} />

          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-2">
              <Globe size={14} /> Global Delivery
            </span>
            <span className="flex items-center gap-2">
              <Monitor size={14} /> Secure Payment
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
