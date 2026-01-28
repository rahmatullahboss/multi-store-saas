
import React from 'react';
import { Link } from '@remix-run/react';
import { Mail, MapPin, Instagram, Twitter, Globe, Sparkles } from 'lucide-react';
import { AURORA_THEME } from '../index';
import { OzzylBranding } from '~/components/store-templates/shared/OzzylBranding';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

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
      default: 'Harmonizing minimalist design with soulful aesthetics for a conscious lifestyle.',
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

export default function AuroraFooter({ context, settings }: SectionComponentProps) {
  const { store, getLink } = context;
  const theme = AURORA_THEME.config;
  
  const THEME_COLORS = {
     primary: theme.colors?.primary || '#2C2C2C',
     text: theme.colors?.text || '#2C2C2C',
     footerBg: theme.colors?.footerBg || '#2C2C2C',
     footerText: theme.colors?.footerText || '#FDFBF9',
     fontHeading: theme.typography?.fontFamilyHeading || "'Outfit', sans-serif",
     auroraGradient: 'linear-gradient(135deg, #E8C4C4 0%, #D4C8D4 50%, #B5C4B1 100%)',
  };
  
  // Cast store to any to access potential extra fields not in the strict type definition yet
  const storeAny = store as any;
  const address = storeAny.address || '44 Minimalist Ave, Aurora Highlands';
  const email = storeAny.email || `studio@${store.name.toLowerCase().replace(/\s/g, '-')}.com`;
  
  const socialLinks = {
      instagram: '',
      facebook: '',
  };

  const categories = context.collections?.map(c => c.title) || [];
  const validCategories = categories.filter((c): c is string => Boolean(c));

  const showPoweredBy = settings.show_powered_by !== false;
  const description = settings.description as string;
  const planType = 'free';

  return (
    <footer
      className="relative overflow-hidden pt-24 pb-12"
      style={{ backgroundColor: THEME_COLORS.footerBg, color: THEME_COLORS.footerText }}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aurora-500 to-transparent opacity-30" />
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] opacity-10"
        style={{ background: THEME_COLORS.auroraGradient }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
          {/* Brand Identity */}
          <div className="space-y-8">
            <Link to={getLink('/')} className="inline-block group">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-10 lg:h-12 object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span
                  className="text-3xl font-bold tracking-tighter"
                  style={{ fontFamily: THEME_COLORS.fontHeading, color: THEME_COLORS.footerText }}
                >
                  {store.name}
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed opacity-60 max-w-xs font-medium">
              {description}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110"
                  style={{ borderColor: `rgba(255,255,255,0.2)` }}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
               <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110"
                style={{ borderColor: `rgba(255,255,255,0.2)` }}
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Curated Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 opacity-40">
              Collections
            </h4>
            <ul className="space-y-4">
              {validCategories.slice(0, 5).map((category) => (
                 <li key={category}>
                  <Link
                    to={getLink(`/collections/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="text-sm font-semibold hover:opacity-100 opacity-60 transition-opacity flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-current transition-all duration-300" />
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Essential Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 opacity-40">
              Experience
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to={getLink('/pages/about')}
                  className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  to={getLink('/pages/contact')}
                  className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
                >
                  Connect
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 opacity-40">
                The Studio
              </h4>
              <ul className="space-y-4 text-sm font-medium opacity-60">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>
                    {email}
                  </span>
                </li>
              </ul>
            </div>

            <div
              className="p-6 rounded-2xl border relative group overflow-hidden"
              style={{ borderColor: `rgba(255,255,255,0.1)`, backgroundColor: `rgba(255,255,255,0.05)` }}
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ background: THEME_COLORS.auroraGradient }}
              />
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Join the Circle
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-transparent border-b border-current/20 w-full py-2 text-sm focus:outline-none focus:border-current/100 transition-all font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-current/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <p
              className="text-[10px] font-bold uppercase tracking-widest opacity-30"
              suppressHydrationWarning
            >
              © {new Date().getFullYear()} {store.name} / All Rights Reserved
            </p>
            <div className="hidden sm:flex items-center gap-4 opacity-20">
              <span className="text-[10px] font-bold">ETHICAL</span>
              <span className="text-[10px] font-bold">SUSTAINABLE</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 opacity-30">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Shop</span>
            </div>

            <OzzylBranding planType={planType} showPoweredBy={showPoweredBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}
