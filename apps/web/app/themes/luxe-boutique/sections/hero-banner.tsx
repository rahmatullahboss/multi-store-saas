/**
 * Luxe Boutique - Hero Banner Section
 *
 * Elegant full-width hero with:
 * - Large serif typography
 * - Optional gold border accent
 * - Centered or left-aligned content
 * - Subtle overlay for text readability
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Hero Banner',
  tag: 'section',
  class: 'luxe-hero',
  limit: 1,

  enabled_on: {
    templates: ['index'],
  },

  settings: [
    {
      type: 'header',
      id: 'content_header',
      label: 'Content',
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Timeless Elegance',
    },
    {
      type: 'text',
      id: 'heading_bn',
      label: 'Heading (Bangla)',
      default: 'চিরন্তন সৌন্দর্য',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover our curated collection of luxury pieces',
    },
    {
      type: 'textarea',
      id: 'subheading_bn',
      label: 'Subheading (Bangla)',
      default: 'আমাদের সংগ্রহ থেকে বেছে নিন বিলাসবহুল পণ্য',
    },
    {
      type: 'header',
      id: 'button_header',
      label: 'Button',
    },
    {
      type: 'text',
      id: 'button_text',
      label: 'Button text',
      default: 'Shop Now',
    },
    {
      type: 'text',
      id: 'button_text_bn',
      label: 'Button text (Bangla)',
      default: 'এখনই কিনুন',
    },
    {
      type: 'url',
      id: 'button_link',
      label: 'Button link',
      default: '/collections/all',
    },
    {
      type: 'header',
      id: 'image_header',
      label: 'Image',
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Background image',
    },
    {
      type: 'range',
      id: 'overlay_opacity',
      label: 'Overlay opacity',
      min: 0,
      max: 80,
      step: 10,
      default: 40,
      unit: '%',
    },
    {
      type: 'header',
      id: 'style_header',
      label: 'Style',
    },
    {
      type: 'select',
      id: 'text_alignment',
      label: 'Text alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center',
    },
    {
      type: 'select',
      id: 'height',
      label: 'Height',
      options: [
        { value: 'small', label: 'Small (400px)' },
        { value: 'medium', label: 'Medium (500px)' },
        { value: 'large', label: 'Large (600px)' },
        { value: 'full', label: 'Full screen' },
      ],
      default: 'large',
    },
    {
      type: 'checkbox',
      id: 'show_gold_border',
      label: 'Show gold border frame',
      default: true,
    },
  ],

  presets: [
    {
      name: 'Luxe Hero',
      category: 'Hero',
      settings: {
        heading: 'Timeless Elegance',
        subheading: 'Discover our curated collection of luxury pieces',
        button_text: 'Shop Now',
        button_link: '/collections/all',
        overlay_opacity: 40,
        text_alignment: 'center',
        height: 'large',
        show_gold_border: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface HeroSettings {
  heading: string;
  heading_bn?: string;
  subheading: string;
  subheading_bn?: string;
  button_text: string;
  button_text_bn?: string;
  button_link: string;
  image?: string;
  overlay_opacity: number;
  text_alignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large' | 'full';
  show_gold_border: boolean;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  background: '#faf9f7',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LuxeHeroBanner({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as HeroSettings;
  const { getLink } = context;

  const heightMap = {
    small: '400px',
    medium: '500px',
    large: '600px',
    full: '100vh',
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const defaultImage = 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80';

  return (
    <section
      data-section-id={section.id}
      className="relative overflow-hidden"
      style={{ minHeight: heightMap[config.height] }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={config.image || defaultImage} alt="" className="w-full h-full object-cover" />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${config.overlay_opacity / 100})`,
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col justify-center h-full px-6 sm:px-12 lg:px-24 py-16 ${alignmentClasses[config.text_alignment]}`}
        style={{ minHeight: heightMap[config.height] }}
      >
        {/* Gold Border Frame */}
        {config.show_gold_border && (
          <div
            className="absolute inset-8 sm:inset-12 lg:inset-16 pointer-events-none"
            style={{
              border: `1px solid ${THEME.accent}`,
            }}
          />
        )}

        <div className="max-w-2xl">
          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '0.02em',
            }}
          >
            {config.heading}
          </h1>

          {/* Subheading */}
          {config.subheading && (
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">{config.subheading}</p>
          )}

          {/* Button */}
          {config.button_text && (
            <a
              href={getLink?.(config.button_link) || config.button_link}
              className="inline-block px-8 py-3 text-sm font-medium tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: THEME.accent,
                color: THEME.primary,
              }}
            >
              {config.button_text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
