
import React from 'react';
import { AURORA_THEME } from '../index';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  limit: 1,
  settings: [
    {
      type: 'image_picker',
      id: 'banner_image',
      label: 'Banner Image',
      info: 'Recommended: 1920x1080px',
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Pure Aesthetics',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Elevate your lifestyle with our curated collection.',
    },
    {
      type: 'text',
      id: 'button_text',
      label: 'Button Text',
      default: 'Shop Now',
    },
    {
      type: 'url',
      id: 'button_link',
      label: 'Button Link',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AuroraHeroBanner({ context, settings }: SectionComponentProps) {
  const { getLink } = context;
  const theme = AURORA_THEME.config;
  
  const THEME_COLORS = {
    primary: theme.colors?.primary || '#2C2C2C',
    fontHeading: theme.typography?.fontFamilyHeading || "'Outfit', sans-serif",
    auroraGradient: 'linear-gradient(135deg, #E8C4C4 0%, #D4C8D4 50%, #B5C4B1 100%)',
  };

  const bannerUrl = settings.banner_image as string;
  const heading = settings.heading as string;
  const subheading = settings.subheading as string;
  const buttonText = settings.button_text as string;
  const buttonLink = settings.button_link as string;

  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden rounded-b-[3rem]">
      <div className="absolute inset-0 bg-gray-100">
        {bannerUrl && (
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>
      <div className="relative z-10 text-center max-w-4xl px-6">
        <h1
          className="text-5xl md:text-8xl font-bold mb-6 tracking-tight text-gray-900"
          style={{ fontFamily: THEME_COLORS.fontHeading }}
        >
          {heading}
        </h1>
        <p className="text-xl md:text-2xl mb-10 font-medium text-gray-700">
          {subheading}
        </p>
        <button
          onClick={() => {
             // In new system, we should use Link, but button is fine too if handled
             if (buttonLink) {
                 window.location.href = getLink(buttonLink);
             } else {
                 // Default to all products
                 window.location.href = getLink('/collections/all');
             }
          }}
          className="px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
          style={{ background: THEME_COLORS.auroraGradient, color: THEME_COLORS.primary }}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
