
import React from 'react';
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
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Redefining Luxury',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover our exclusive collection.',
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
      default: 'products/all',
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function NovaLuxHeroBanner({ context, settings }: SectionComponentProps) {
  const { getLink } = context;

  const bannerImage = settings.banner_image as string;
  const heading = settings.heading as string;
  const subheading = settings.subheading as string;
  const buttonText = settings.button_text as string;
  const buttonLink = settings.button_link as string;

  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-10" />
      {bannerImage && (
        <img
          src={bannerImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="relative z-20 text-center max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-serif mb-6">
          {heading}
        </h1>
        <p className="text-xl mb-8 opacity-90">{subheading}</p>
        <a
          href={getLink(buttonLink)}
          className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}
