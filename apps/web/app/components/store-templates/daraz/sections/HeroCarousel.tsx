/**
 * Daraz Hero Carousel
 * 
 * Full-width promotional banner carousel matching Daraz Bangladesh homepage
 * Features:
 * - Auto-playing carousel with navigation arrows
 * - "Download App" sidebar widget
 * - Mobile responsive design
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { DARAZ_THEME } from '../theme';
import { generateSrcset, optimizeUnsplashUrl } from '~/utils/imageOptimization';

interface Banner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
}

interface HeroCarouselProps {
  banners?: Banner[];
  storeName?: string;
  showAppWidget?: boolean;
  autoPlayInterval?: number;
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    title: 'Never Before Deals!',
    subtitle: 'Limited Stock - Up to 70% OFF',
    link: '/?category=sale',
    buttonText: 'Shop Now'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
    title: 'Flash Sale',
    subtitle: 'Amazing discounts on top products',
    link: '/?category=flash-sale',
    buttonText: 'View Deals'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
    title: 'New Arrivals',
    subtitle: 'Fresh styles just landed',
    link: '/?category=new',
    buttonText: 'Explore'
  }
];

export function DarazHeroCarousel({
  banners = DEFAULT_BANNERS,
  storeName = 'Store',
  showAppWidget = true,
  autoPlayInterval = 5000
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-play
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval, isPaused, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative mb-6">
      <div 
        className="flex gap-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Carousel */}
        <div className="relative flex-1 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Slides */}
          <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden">
            {banners.map((banner, index) => (
              <Link
                key={banner.id}
                to={banner.link || '#'}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {(() => {
                  const isUnsplash = banner.image.includes('unsplash.com');
                  const bannerSrc = isUnsplash
                    ? optimizeUnsplashUrl(banner.image, {
                        width: 1600,
                        height: 600,
                        quality: 80,
                        format: 'webp',
                      })
                    : banner.image;
                  const bannerSrcSet = isUnsplash
                    ? generateSrcset(banner.image, [640, 960, 1280, 1600])
                    : undefined;
                  const isPriority = index === 0;

                  return (
                    <img
                      src={bannerSrc}
                      alt={banner.title || `Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                      srcSet={bannerSrcSet}
                      sizes="100vw"
                      loading={isPriority ? 'eager' : 'lazy'}
                      fetchPriority={isPriority ? 'high' : 'auto'}
                      decoding="async"
                    />
                  );
                })()}
                
                {/* Overlay content */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                    <div className="p-6 md:p-10 text-white max-w-lg">
                      {banner.title && (
                        <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                          {banner.title}
                        </h2>
                      )}
                      {banner.subtitle && (
                        <p className="text-sm md:text-lg opacity-90 mb-4">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.buttonText && (
                        <span
                          className="inline-block px-6 py-2.5 rounded font-semibold text-sm transition-all hover:opacity-90"
                          style={{ backgroundColor: DARAZ_THEME.primary }}
                        >
                          {banner.buttonText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    index === currentSlide
                      ? 'w-6 bg-white'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* App Download Widget - Desktop Only */}
        {showAppWidget && (
          <div className="hidden lg:flex flex-col w-[180px] shrink-0 bg-white rounded-lg shadow-sm p-4">
            <div 
              className="flex items-center gap-2 text-xs font-medium text-white px-3 py-1.5 rounded mb-3"
              style={{ backgroundColor: DARAZ_THEME.primary }}
            >
              <span className="text-yellow-300">★ 4.8</span>
              <span>Rated</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5" style={{ color: DARAZ_THEME.primary }} />
              <span className="text-sm font-medium" style={{ color: DARAZ_THEME.text }}>
                Download App
              </span>
            </div>

            <div className="space-y-2 text-xs" style={{ color: DARAZ_THEME.textSecondary }}>
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
                href="#app-store"
                className="block w-full py-2 px-3 text-xs font-medium text-center bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
              >
                App Store
              </a>
              <a
                href="#google-play"
                className="block w-full py-2 px-3 text-xs font-medium text-center bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
              >
                Google Play
              </a>
            </div>

            <p className="mt-3 text-[10px] text-center" style={{ color: DARAZ_THEME.muted }}>
              Download the {storeName} App Now!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
