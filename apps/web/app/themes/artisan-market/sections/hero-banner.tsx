import { Link } from '@remix-run/react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ARTISAN_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Artisan Goods',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Each piece tells a story. Discover unique handmade products crafted by skilled artisans.',
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Background Image',
    },
    {
      type: 'text',
      id: 'cta_label',
      label: 'Button Label',
      default: 'Browse Products',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'Button Link',
      default: '/products',
    },
  ],
};

export default function ArtisanHero({ context, settings }: SectionComponentProps) {
  const { getLink } = context;
  const config = ARTISAN_THEME_CONFIG.colors!;
  const typography = ARTISAN_THEME_CONFIG.typography;

  const imageUrl = settings.image as string;
  const heading = settings.heading as string;
  const subheading = settings.subheading as string;
  const ctaLabel = settings.cta_label as string;
  const ctaLink = settings.cta_link as string;

  return (
    <div className="relative overflow-hidden w-full">
      <div 
        className="relative bg-cover bg-center min-h-[500px] lg:min-h-[600px] flex items-center"
        style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundColor: config.accentLight 
        }}
      >
        {/* Overlay if image exists */}
        {imageUrl && (
            <div className="absolute inset-0 bg-black/30" />
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl p-8 md:p-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl"
                 style={{ border: `1px solid ${config.border}` }}
            >
                <h1 
                    className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                    style={{ fontFamily: typography.fontFamilyHeading, color: config.primary }}
                >
                    {heading}
                </h1>
                <p 
                    className="text-lg md:text-xl mb-8 leading-relaxed"
                    style={{ color: config.textMuted }}
                >
                    {subheading}
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        to={getLink(ctaLink)}
                        className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium transition-transform hover:scale-105"
                        style={{ 
                            backgroundColor: config.accent, 
                            color: 'white',
                            borderRadius: '1rem' // Matching generic organic shape
                        }}
                    >
                        {ctaLabel}
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
