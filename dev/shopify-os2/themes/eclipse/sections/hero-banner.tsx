import { Link } from '@remix-run/react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ECLIPSE_THEME_CONFIG } from '../index';

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
      default: 'Future Ready',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Experience the next generation of shopping.',
    },
    {
      type: 'text',
      id: 'button_text',
      label: 'Button Text',
      default: 'Explore Now',
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

export default function EclipseHero({ context, settings }: SectionComponentProps) {
  const { getLink } = context;

  const bannerUrl = settings.banner_image as string;
  const heading = settings.heading as string;
  const subheading = settings.subheading as string;
  const buttonText = settings.button_text as string;
  const buttonLink = settings.button_link as string;

  // Use Link if button_link is provided, otherwise simple button
  const ButtonWrapper = ({ children }: { children: React.ReactNode }) => {
     if (buttonLink) {
         return <Link to={getLink(buttonLink)}>{children}</Link>
     }
     return <Link to={getLink('/collections/all')}>{children}</Link>
  }

  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </div>
      <div className="relative z-10 text-center max-w-4xl px-6">
        <h1 
          className="text-5xl md:text-8xl font-bold mb-6 tracking-tight text-white"
          style={{ fontFamily: ECLIPSE_THEME_CONFIG.typography?.fontFamilyHeading }}
        >
          {heading}
        </h1>
        <p className="text-xl md:text-2xl mb-10 font-medium text-white/80">
          {subheading}
        </p>
        <ButtonWrapper>
            <button
            className="px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform bg-white text-black"
            >
            {buttonText}
            </button>
        </ButtonWrapper>
      </div>
    </section>
  );
}
