import { Link, useSearchParams } from 'react-router';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import type { SectionSettings } from './registry';
import { useTranslation } from '~/contexts/LanguageContext';
import { withAISchema } from '~/utils/ai-editable';

interface HeroSectionProps {
  settings: SectionSettings;
  theme: any;
  categories?: string[];
}

export const HERO_AI_SCHEMA = {
  component: 'HeroSection',
  version: '1.0.0',
  type: 'hero',
  properties: {
    heading: {
      type: 'string',
      maxLength: 100,
      description: 'The main headline of the hero section',
      aiAction: 'enhance',
    },
    subheading: {
      type: 'string',
      maxLength: 200,
      description: 'A supporting subtitle or description',
      aiAction: 'enhance',
    },
    image: {
      type: 'image',
      description: 'Hero background image URL',
      aiAction: 'generate-image',
    },
    primaryAction: {
      type: 'object',
      properties: {
        label: { type: 'string', maxLength: 30, description: 'Button text' },
        url: { type: 'string', description: 'Button link URL' },
      },
    },
    alignment: {
      type: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment',
    },
  },
};

function HeroSectionBase({ settings, theme, categories = [] }: HeroSectionProps) {
  const alignment = settings.alignment || 'center';
  const layout = settings.layout || 'standard';

  // Alignment classes
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {settings.image ? (
          <img src={settings.image} alt="Hero background" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${theme?.accent || '#b45309'} 0%, ${theme?.primary || '#3d2f2f'} 100%)`,
            }}
          />
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: settings.image
              ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)'
              : 'rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex flex-col justify-center ${alignmentClasses[alignment]} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16`}
      >
        {/* Heading */}
        {settings.heading && (
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl"
            style={{ fontFamily: theme?.fonts?.heading || "'Newsreader', serif" }}
          >
            {settings.heading}
          </h1>
        )}

        {/* Subheading */}
        {settings.subheading && (
          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
            {settings.subheading}
          </p>
        )}

        {/* Action Buttons */}
        <div
          className={`mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}
        >
          {settings.primaryAction?.label && (
            <Link
              to={settings.primaryAction.url || '#'}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: theme?.accent || '#b45309',
                boxShadow: `0 4px 20px ${theme?.accent || '#b45309'}40`,
              }}
            >
              {settings.primaryAction.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
          {settings.secondaryAction?.label && (
            <Link
              to={settings.secondaryAction.url || '#'}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 transition-all duration-200"
            >
              {settings.secondaryAction.label}
            </Link>
          )}
        </div>

        {/* Category Pills (optional for marketplace layout) */}
        {layout === 'marketplace' && categories.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={`/?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const HeroSection = withAISchema(HeroSectionBase, HERO_AI_SCHEMA as any); // Type assertion to bypass strict generic constraint if needed for now
export default HeroSection;
