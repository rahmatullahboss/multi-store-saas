/**
 * Daraz Flash Sale Section
 *
 * Shopify OS 2.0 Compatible Section
 * Horizontal scrollable flash sale section matching Daraz Bangladesh
 *
 * Features:
 * - "Flash Sale" header with "On Sale Now" indicator
 * - "SHOP ALL PRODUCTS" CTA button
 * - Horizontally scrollable product cards
 * - Discount badges and countdown timers (optional)
 */

import { Link } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Zap, Clock, Star } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA (Shopify OS 2.0 Format)
// ============================================================================

export const schema: SectionSchema = {
  name: 'Flash Sale (Daraz)',
  tag: 'section',
  class: 'daraz-flash-sale',
  limit: 2,

  enabled_on: {
    templates: ['index'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_content',
      label: 'Content',
    },
    {
      type: 'text',
      id: 'title',
      label: 'Section title',
      default: 'Flash Sale',
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'On Sale Now',
    },
    {
      type: 'text',
      id: 'cta_text',
      label: 'CTA button text',
      default: 'SHOP ALL PRODUCTS',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'CTA button link',
    },
    {
      type: 'header',
      id: 'header_products',
      label: 'Products',
    },
    {
      type: 'range',
      id: 'products_count',
      min: 5,
      max: 20,
      step: 1,
      default: 10,
      label: 'Number of products',
    },
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
      info: 'Select a collection for flash sale products',
    },
    {
      type: 'header',
      id: 'header_timer',
      label: 'Countdown Timer',
    },
    {
      type: 'checkbox',
      id: 'show_timer',
      label: 'Show countdown timer',
      default: false,
    },
    {
      type: 'text',
      id: 'timer_end_date',
      label: 'Timer end date/time',
      info: 'Format: YYYY-MM-DD HH:MM',
    },
    {
      type: 'header',
      id: 'header_appearance',
      label: 'Appearance',
    },
    {
      type: 'color',
      id: 'primary_color',
      label: 'Primary color',
      default: '#F85606',
    },
    {
      type: 'color',
      id: 'price_color',
      label: 'Price color',
      default: '#F36D00',
    },
    {
      type: 'checkbox',
      id: 'show_progress_bar',
      label: 'Show sold progress bar',
      default: true,
    },
  ],

  blocks: [],

  presets: [
    {
      name: 'Daraz Flash Sale',
      category: 'Products',
      settings: {
        title: 'Flash Sale',
        subtitle: 'On Sale Now',
        cta_text: 'SHOP ALL PRODUCTS',
        products_count: 10,
        show_timer: false,
        show_progress_bar: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface FlashSaleSettings {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link?: string;
  products_count: number;
  collection?: number;
  show_timer: boolean;
  timer_end_date?: string;
  primary_color: string;
  price_color: string;
  show_progress_bar: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazFlashSale({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as FlashSaleSettings;

  const {
    title = 'Flash Sale',
    subtitle = 'On Sale Now',
    cta_text = 'SHOP ALL PRODUCTS',
    cta_link = '/?category=flash-sale',
    products_count = 10,
    show_timer = false,
    timer_end_date,
    primary_color = '#F85606',
    price_color = '#F36D00',
    show_progress_bar = true,
  } = config;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Get products from context
  const products = (context.products || []).slice(0, products_count);
  const currency = context.store?.currency || 'BDT';

  // Timer logic
  useEffect(() => {
    if (!show_timer || !timer_end_date) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(timer_end_date).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [show_timer, timer_end_date]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    ref?.addEventListener('scroll', checkScroll);
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, [products]);

  if (products.length === 0) return null;

  return (
    <section
      className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden"
      data-section-id={section.id}
      data-section-type="daraz-flash-sale"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: primary_color }} />
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>

          {/* Timer or Subtitle */}
          {show_timer && timer_end_date ? (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-mono font-medium" style={{ color: primary_color }}>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium" style={{ color: primary_color }}>
              {subtitle}
            </span>
          )}
        </div>

        <Link
          to={cta_link || '/?category=flash-sale'}
          className="px-4 py-1.5 text-sm font-semibold border-2 rounded transition-colors cursor-pointer hover:bg-gray-50"
          style={{ borderColor: primary_color, color: primary_color }}
        >
          {cta_text}
        </Link>
      </div>

      {/* Product Scroll */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Products */}
        <div
          ref={scrollRef}
          className="flex gap-3 p-4 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product, index) => {
            const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
            const discountPercent = hasDiscount
              ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
              : 0;

            // Generate consistent "sold" percentage based on product id
            const soldPercent = Math.min(85, 35 + ((product.id * 7) % 50));

            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex-shrink-0 w-[140px] group cursor-pointer"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={product.imageUrl || '/placeholder-product.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasDiscount && (
                    <span
                      className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
                      style={{ backgroundColor: primary_color }}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-xs line-clamp-2 text-gray-800 group-hover:text-orange-500 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold" style={{ color: price_color }}>
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] line-through text-gray-400">
                        {formatPrice(product.compareAtPrice!)}
                      </span>
                    )}
                  </div>

                  {/* Sold indicator */}
                  {show_progress_bar && (
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${soldPercent}%`,
                          backgroundColor: primary_color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
