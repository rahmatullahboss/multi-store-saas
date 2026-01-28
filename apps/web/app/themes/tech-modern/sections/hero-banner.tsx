/**
 * Tech Modern - Hero Banner Section
 *
 * Bold hero section with:
 * - Dark gradient background
 * - Large bold typography
 * - Modern CTA buttons
 * - Tech-focused imagery
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { ArrowRight } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Hero Banner',
  tag: 'section',
  class: 'tech-hero',
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
      default: 'Next-Gen Tech',
    },
    {
      type: 'text',
      id: 'heading_bn',
      label: 'Heading (Bangla)',
      default: 'আধুনিক প্রযুক্তি',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover the latest innovations. Premium quality, unbeatable prices.',
    },
    {
      type: 'textarea',
      id: 'subheading_bn',
      label: 'Subheading (Bangla)',
      default: 'সর্বশেষ প্রযুক্তি আবিষ্কার করুন। প্রিমিয়াম মান, অপরাজেয় দাম।',
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
  ],

  presets: [
    {
      name: 'Tech Hero',
      category: 'Hero',
      settings: {
        heading: 'Next-Gen Tech',
        subheading: 'Discover the latest innovations. Premium quality, unbeatable prices.',
        button_text: 'Shop Now',
        button_link: '/collections/all',
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
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  background: '#f8fafc',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechHeroBanner({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as HeroSettings;
  const { getLink, store } = context;

  const defaultImage =
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80';

  return (
    <section
      data-section-id={section.id}
      className="relative overflow-hidden text-white py-20 lg:py-32"
      style={{ background: THEME.gradient }}
    >
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url('${config.image || defaultImage}')` }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left lg:flex items-center gap-12">
        <div className="max-w-2xl">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {config.heading || `Next-Gen Tech from ${store.name}`}
          </h1>

          {/* Subheading */}
          {config.subheading && (
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
              {config.subheading}
            </p>
          )}

          {/* CTA Button */}
          {config.button_text && (
            <a
              href={getLink?.(config.button_link) || config.button_link}
              className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: THEME.accent,
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
              }}
            >
              {config.button_text}
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
