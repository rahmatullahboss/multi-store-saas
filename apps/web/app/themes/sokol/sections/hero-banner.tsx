import { Link } from '@remix-run/react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { SOKOL_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Premium Collection',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover handpicked products for modern living',
    },
    {
      type: 'text',
      id: 'cta_label',
      label: 'Button Label',
      default: 'Shop Now',
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
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    },
  ],
};

export default function SokolHero({ context, settings }: SectionComponentProps) {
  const { getLink } = context;
  const config = SOKOL_THEME_CONFIG.colors!;

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={settings.background_image as string} 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-sm font-heading">
          {settings.heading as string}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-light">
          {settings.subheading as string}
        </p>
        <Link
          to={getLink(settings.cta_link as string || '/products')}
          className="inline-block px-8 py-3.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {settings.cta_label as string}
        </Link>
      </div>
    </section>
  );
}
