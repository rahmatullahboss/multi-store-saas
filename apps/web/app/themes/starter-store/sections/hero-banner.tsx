/**
 * Hero Banner Section
 *
 * Shopify OS 2.0 Compatible Section
 * Full-width hero banner with image, text, and CTA buttons.
 */

import { Link } from '@remix-run/react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { generateSrcset, optimizeUnsplashUrl } from '~/utils/imageOptimization';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Hero Banner',
  tag: 'section',
  class: 'hero-banner',
  limit: 3,

  enabled_on: {
    templates: ['index'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_image',
      label: 'Image',
    },
    {
      type: 'image_picker',
      id: 'image',
      label: 'Background image',
    },
    {
      type: 'select',
      id: 'image_height',
      options: [
        { value: 'small', label: 'Small (40vh)' },
        { value: 'medium', label: 'Medium (60vh)' },
        { value: 'large', label: 'Large (80vh)' },
        { value: 'full', label: 'Full screen' },
      ],
      default: 'medium',
      label: 'Image height',
    },
    {
      type: 'range',
      id: 'overlay_opacity',
      min: 0,
      max: 100,
      step: 5,
      default: 40,
      unit: '%',
      label: 'Overlay opacity',
    },
    {
      type: 'header',
      id: 'header_content',
      label: 'Content',
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'আমাদের নতুন কালেকশন',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'সেরা মানের পণ্য, সেরা দামে',
    },
    {
      type: 'select',
      id: 'text_alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center',
      label: 'Text alignment',
    },
    {
      type: 'header',
      id: 'header_buttons',
      label: 'Buttons',
    },
    {
      type: 'text',
      id: 'button_label',
      label: 'Button label',
      default: 'শপিং করুন',
    },
    {
      type: 'url',
      id: 'button_link',
      label: 'Button link',
    },
    {
      type: 'text',
      id: 'button_label_2',
      label: 'Second button label',
    },
    {
      type: 'url',
      id: 'button_link_2',
      label: 'Second button link',
    },
  ],

  blocks: [
    {
      type: 'heading',
      name: 'Heading',
      limit: 1,
      settings: [
        {
          type: 'text',
          id: 'text',
          label: 'Heading text',
          default: 'Welcome',
        },
        {
          type: 'select',
          id: 'size',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ],
          default: 'large',
          label: 'Size',
        },
      ],
    },
    {
      type: 'button',
      name: 'Button',
      limit: 2,
      settings: [
        {
          type: 'text',
          id: 'label',
          label: 'Label',
          default: 'Shop now',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Link',
        },
        {
          type: 'select',
          id: 'style',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'outline', label: 'Outline' },
          ],
          default: 'primary',
          label: 'Style',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Hero Banner',
      category: 'Banners',
      settings: {
        heading: 'আমাদের নতুন কালেকশন',
        subheading: 'সেরা মানের পণ্য, সেরা দামে',
        button_label: 'শপিং করুন',
        button_link: '/products',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface HeroBannerSettings {
  image?: string;
  image_height: 'small' | 'medium' | 'large' | 'full';
  overlay_opacity: number;
  heading: string;
  subheading: string;
  text_alignment: 'left' | 'center' | 'right';
  button_label: string;
  button_link?: string;
  button_label_2?: string;
  button_link_2?: string;
}

const heightMap = {
  small: '40vh',
  medium: '60vh',
  large: '80vh',
  full: '100vh',
};

export default function HeroBanner({ section, context, settings }: SectionComponentProps) {
  const {
    image,
    image_height = 'medium',
    overlay_opacity = 40,
    heading = 'আমাদের নতুন কালেকশন',
    subheading = 'সেরা মানের পণ্য, সেরা দামে',
    text_alignment = 'center',
    button_label = 'শপিং করুন',
    button_link = '/products',
    button_label_2,
    button_link_2,
  } = settings as unknown as HeroBannerSettings;

  // Use config banner if no image specified
  const bannerUrl =
    image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop';
  const isUnsplashBanner = bannerUrl.includes('unsplash.com');
  const bannerSrc = isUnsplashBanner
    ? optimizeUnsplashUrl(bannerUrl, { width: 1600, height: 900, quality: 80, format: 'webp' })
    : bannerUrl;
  const bannerSrcSet = isUnsplashBanner ? generateSrcset(bannerUrl, [640, 960, 1280, 1600]) : undefined;

  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[text_alignment];

  return (
    <section
      className="relative"
      style={{ height: heightMap[image_height] }}
      data-section-id={section.id}
      data-section-type="hero-banner"
    >
      {/* Background Image */}
      <img
        src={bannerSrc}
        alt="Hero"
        className="w-full h-full object-cover"
        srcSet={bannerSrcSet}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 flex justify-center"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlay_opacity / 100})` }}
      >
        {/* Content */}
        <div className={`flex flex-col justify-center px-4 max-w-4xl ${alignmentClass}`}>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">{heading}</h1>
          {subheading && <p className="text-lg mb-6 opacity-90 text-white">{subheading}</p>}

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {button_label && (
              <Link
                to={button_link || '/products'}
                className="px-8 py-3 rounded-lg font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: context.theme?.colors?.accent || '#f59e0b',
                  color: '#ffffff',
                }}
              >
                {button_label}
              </Link>
            )}
            {button_label_2 && (
              <Link
                to={button_link_2 || '/'}
                className="px-8 py-3 rounded-lg font-medium transition hover:opacity-90 border-2 border-white text-white"
              >
                {button_label_2}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
