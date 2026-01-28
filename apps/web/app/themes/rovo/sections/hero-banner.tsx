import { Link } from '@remix-run/react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { ROVO_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'NEW COLLECTION',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover the latest trends in fashion and lifestyle.',
    },
    {
      type: 'text',
      id: 'cta_label',
      label: 'Button Label',
      default: 'SHOP NOW',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'Button Link',
      default: '/products',
    },
     {
      type: 'image_picker',
      id: 'background_image',
      label: 'Background Image',
    },
  ],
};

export default function RovoHero({ context, settings }: SectionComponentProps) {
  const { getLink } = context;
  const config = ROVO_THEME_CONFIG.colors!;

  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-gray-100 overflow-hidden">
      {settings.background_image ? (
        <div className="absolute inset-0">
          <img 
            src={settings.background_image as string} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ) : null}

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6 text-white drop-shadow-md">
          {settings.heading as string}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-sm">
          {settings.subheading as string}
        </p>
        <Link
          to={getLink(settings.cta_link as string || '/products')}
          className="inline-block px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-colors duration-300"
        >
          {settings.cta_label as string}
        </Link>
      </div>
    </section>
  );
}
