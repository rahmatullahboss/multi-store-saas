import { Link } from '@remix-run/react';
import { Leaf } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { FRESHNESS_THEME_CONFIG } from '../index';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Fresh, organic, and delivered to your door.',
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
  ],
};

export default function FreshnessHero({ context, settings }: SectionComponentProps) {
  const { store, getLink } = context;
  const config = FRESHNESS_THEME_CONFIG.colors!;
  const typography = FRESHNESS_THEME_CONFIG.typography;

  return (
    <section
      className="relative py-16 px-4 text-center"
      style={{ backgroundColor: '#F8FAFC' }} // Background Alt
    >
      <div className="max-w-4xl mx-auto">
        <Leaf className="w-16 h-16 mx-auto mb-6" style={{ color: config.secondary }} />
        <h1
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ fontFamily: typography.fontFamilyHeading, color: config.secondary }}
        >
          {store.name}
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          {settings.heading as string}
        </p>
        <Link
          to={getLink(settings.cta_link as string || '/products')}
          className="inline-block px-8 py-4 rounded-full font-bold text-white text-lg transition-all hover:opacity-90"
          style={{ backgroundColor: config.secondary }}
        >
          {settings.cta_label as string}
        </Link>
      </div>
    </section>
  );
}
