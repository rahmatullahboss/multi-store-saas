/**
 * Daraz Hero Carousel Section
 *
 * Shopify OS 2.0 Compatible Section
 * Full-width promotional banner carousel matching Daraz Bangladesh homepage
 *
 * Features:
 * - Auto-playing carousel with navigation arrows
 * - "Download App" sidebar widget
 * - Mobile responsive design
 * - Multiple slide support via blocks
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import type { SectionSchema, SectionComponentProps, BlockInstance } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA (Shopify OS 2.0 Format)
// ============================================================================

export const schema: SectionSchema = {
  name: 'Hero Carousel (Daraz)',
  tag: 'section',
  class: 'daraz-hero-carousel',
  limit: 1,

  enabled_on: {
    templates: ['index'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_carousel',
      label: 'Carousel Settings',
    },
    {
      type: 'range',
      id: 'autoplay_speed',
      min: 2000,
      max: 10000,
      step: 500,
      default: 5000,
      unit: 'ms',
      label: 'Autoplay speed',
    },
    {
      type: 'checkbox',
      id: 'show_arrows',
      label: 'Show navigation arrows',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_dots',
      label: 'Show dot indicators',
      default: true,
    },
    {
      type: 'header',
      id: 'header_app_widget',
      label: 'App Download Widget',
    },
    {
      type: 'checkbox',
      id: 'show_app_widget',
      label: 'Show app download widget',
      default: true,
      info: 'Displays on desktop only',
    },
    {
      type: 'text',
      id: 'app_rating',
      label: 'App rating text',
      default: '4.8 Rated',
    },
    {
      type: 'text',
      id: 'app_store_url',
      label: 'App Store URL',
    },
    {
      type: 'text',
      id: 'google_play_url',
      label: 'Google Play URL',
    },
    {
      type: 'header',
      id: 'header_colors',
      label: 'Colors',
    },
    {
      type: 'color',
      id: 'primary_color',
      label: 'Primary color',
      default: '#F85606',
    },
  ],

  blocks: [
    {
      type: 'slide',
      name: 'Slide',
      limit: 10,
      settings: [
        {
          type: 'image_picker',
          id: 'image',
          label: 'Slide image',
        },
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Amazing Deals!',
        },
        {
          type: 'text',
          id: 'subtitle',
          label: 'Subtitle',
          default: 'Shop the best products at unbeatable prices',
        },
        {
          type: 'text',
          id: 'button_text',
          label: 'Button text',
          default: 'Shop Now',
        },
        {
          type: 'url',
          id: 'button_link',
          label: 'Button link',
        },
        {
          type: 'checkbox',
          id: 'show_overlay',
          label: 'Show dark overlay',
          default: true,
        },
      ],
    },
  ],

  max_blocks: 10,

  presets: [
    {
      name: 'Daraz Hero Carousel',
      category: 'Banners',
      settings: {
        autoplay_speed: 5000,
        show_arrows: true,
        show_dots: true,
        show_app_widget: true,
      },
      blocks: [
        {
          type: 'slide',
          settings: {
            title: 'Never Before Deals!',
            subtitle: 'Limited Stock - Up to 70% OFF',
            button_text: 'Shop Now',
            show_overlay: true,
          },
        },
        {
          type: 'slide',
          settings: {
            title: 'Flash Sale',
            subtitle: 'Amazing discounts on top products',
            button_text: 'View Deals',
            show_overlay: true,
          },
        },
      ],
    },
  ],

  default: {
    blocks: [
      {
        type: 'slide',
        settings: {
          title: 'Welcome to our store!',
          subtitle: 'Discover amazing products',
          button_text: 'Shop Now',
        },
      },
    ],
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface CarouselSettings {
  autoplay_speed: number;
  show_arrows: boolean;
  show_dots: boolean;
  show_app_widget: boolean;
  app_rating: string;
  app_store_url?: string;
  google_play_url?: string;
  primary_color: string;
}

interface SlideSettings {
  image?: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link?: string;
  show_overlay: boolean;
}

// Default images for slides
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazHeroCarousel({
  section,
  context,
  settings,
  blocks = [],
}: SectionComponentProps) {
  const config = settings as unknown as CarouselSettings;

  const {
    autoplay_speed = 5000,
    show_arrows = true,
    show_dots = true,
    show_app_widget = true,
    app_rating = '4.8 Rated',
    app_store_url,
    google_play_url,
    primary_color = '#F85606',
  } = config;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Use blocks for slides, or default slides if no blocks
  const slides: BlockInstance[] =
    blocks.length > 0
      ? blocks
      : [
          {
            id: 'default-1',
            type: 'slide',
            settings: {
              image: DEFAULT_IMAGES[0],
              title: 'Never Before Deals!',
              subtitle: 'Limited Stock - Up to 70% OFF',
              button_text: 'Shop Now',
              button_link: '/?category=sale',
              show_overlay: true,
            },
          },
          {
            id: 'default-2',
            type: 'slide',
            settings: {
              image: DEFAULT_IMAGES[1],
              title: 'Flash Sale',
              subtitle: 'Amazing discounts on top products',
              button_text: 'View Deals',
              button_link: '/?category=flash-sale',
              show_overlay: true,
            },
          },
        ];

  const storeName = context.store?.name || 'Store';

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(nextSlide, autoplay_speed);
    return () => clearInterval(interval);
  }, [nextSlide, autoplay_speed, isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative mb-6"
      data-section-id={section.id}
      data-section-type="daraz-hero-carousel"
    >
      <div
        className="flex gap-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Carousel */}
        <div className="relative flex-1 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Slides */}
          <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden">
            {slides.map((slide, index) => {
              const slideSettings = slide.settings as unknown as SlideSettings;
              const imageUrl = slideSettings.image || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];

              return (
                <Link
                  key={slide.id}
                  to={slideSettings.button_link || '#'}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={slideSettings.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay content */}
                  {(slideSettings.title || slideSettings.subtitle) && (
                    <div
                      className={`absolute inset-0 flex items-center ${
                        slideSettings.show_overlay
                          ? 'bg-gradient-to-r from-black/50 to-transparent'
                          : ''
                      }`}
                    >
                      <div className="p-6 md:p-10 text-white max-w-lg">
                        {slideSettings.title && (
                          <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                            {slideSettings.title}
                          </h2>
                        )}
                        {slideSettings.subtitle && (
                          <p className="text-sm md:text-lg opacity-90 mb-4">
                            {slideSettings.subtitle}
                          </p>
                        )}
                        {slideSettings.button_text && (
                          <span
                            className="inline-block px-6 py-2.5 rounded font-semibold text-sm transition-all hover:opacity-90"
                            style={{ backgroundColor: primary_color }}
                          >
                            {slideSettings.button_text}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          {show_arrows && slides.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  prevSlide();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  nextSlide();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {show_dots && slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    index === currentSlide ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* App Download Widget - Desktop Only */}
        {show_app_widget && (
          <div className="hidden lg:flex flex-col w-[180px] shrink-0 bg-white rounded-lg shadow-sm p-4">
            <div
              className="flex items-center gap-2 text-xs font-medium text-white px-3 py-1.5 rounded mb-3"
              style={{ backgroundColor: primary_color }}
            >
              <span className="text-yellow-300">★</span>
              <span>{app_rating}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5" style={{ color: primary_color }} />
              <span className="text-sm font-medium text-gray-800">Download App</span>
            </div>

            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-green-500 text-lg">✓</span>
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-orange-500 text-lg">⚡</span>
                <span>Limited Time</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <a
                href={app_store_url || '#app-store'}
                className="block w-full py-2 px-3 text-xs font-medium text-center bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
              >
                App Store
              </a>
              <a
                href={google_play_url || '#google-play'}
                className="block w-full py-2 px-3 text-xs font-medium text-center bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
              >
                Google Play
              </a>
            </div>

            <p className="mt-3 text-[10px] text-center text-gray-400">
              Download the {storeName} App Now!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
