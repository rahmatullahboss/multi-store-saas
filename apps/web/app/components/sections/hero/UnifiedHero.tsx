import { useState, useEffect, useCallback } from 'react';
import { Link } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { generateSrcset, optimizeUnsplashUrl } from '~/utils/imageOptimization';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import type { HeroBannerSettings } from '~/services/storefront-settings.schema';

export interface UnifiedHeroProps {
  storeName?: string;
  theme: StoreTemplateTheme;
  props: HeroBannerSettings;
  variant?: 'marketplace' | 'luxury' | 'minimal' | 'bold' | 'default';
  // Advanced overrides driven by JSON
  layout?: 'full-width' | 'contained' | 'with-sidebar';
}

export function UnifiedHero({
  storeName = 'Store',
  theme,
  props,
  variant = 'default',
  layout: providedLayout,
}: UnifiedHeroProps) {
  const banners = props.slides || [];
  const autoPlayInterval = props.autoPlayInterval || 5000;
  
  // Resolve layout
  const layout = providedLayout || (variant === 'marketplace' ? 'with-sidebar' : 'full-width');
  const showAppWidget = props.showAppWidget ?? (layout === 'with-sidebar');

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
    if (isPaused || banners.length <= 1 || props.mode !== 'carousel') return;
    
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval, isPaused, banners.length, props.mode]);

  if (banners.length === 0) return null;

  // ============================================================================
  // STYLES DEDUCTION
  // ============================================================================
  const isLuxury = variant === 'luxury';
  const headingFont = isLuxury ? 'Cormorant Garamond, serif' : 'inherit';
  
  const containerClass = layout === 'full-width' 
    ? 'relative w-full' 
    : 'relative mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4';
    
  const carouselClass = layout === 'full-width'
    ? 'relative w-full h-[60vh] md:h-[80vh] overflow-hidden'
    : 'relative flex-1 rounded-lg overflow-hidden shadow-sm aspect-[21/9] md:aspect-[3/1]';

  const dotActiveColor = isLuxury ? '#C4A35A' : theme.primary;

  return (
    <div className={containerClass}>
      <div 
        className={`flex ${layout === 'with-sidebar' ? 'gap-4' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Carousel */}
        <div className={carouselClass}>
          {banners.map((banner, index) => {
            const isUnsplash = banner.imageUrl?.includes('unsplash.com');
            const bannerSrc = isUnsplash
              ? optimizeUnsplashUrl(banner.imageUrl!, {
                  width: 1600,
                  height: layout === 'full-width' ? 900 : 600,
                  quality: 80,
                  format: 'webp',
                })
              : banner.imageUrl;
            const bannerSrcSet = isUnsplash
              ? generateSrcset(banner.imageUrl!, [640, 960, 1280, 1600])
              : undefined;
            const isPriority = index === 0;

            return (
              <Link
                key={index}
                to={banner.ctaLink || '#'}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{ cursor: banner.ctaLink ? 'pointer' : 'default' }}
                onClick={(e) => { if (!banner.ctaLink) e.preventDefault(); }}
              >
                {bannerSrc ? (
                  <img
                    src={bannerSrc}
                    alt={banner.heading || `Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    srcSet={bannerSrcSet}
                    sizes="100vw"
                    loading={isPriority ? 'eager' : 'lazy'}
                    fetchPriority={isPriority ? 'high' : 'auto'}
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                
                {/* Overlay content */}
                {(banner.heading || banner.subheading) && (
                  <div 
                    className={`absolute inset-0 flex flex-col justify-center ${
                      isLuxury ? 'items-center text-center' : 'items-start'
                    }`}
                    style={{ 
                      background: isLuxury 
                        ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,${(props.overlayOpacity || 40) / 100}) 100%)`
                        : `linear-gradient(to right, rgba(0,0,0,${(props.overlayOpacity || 40) / 100}), transparent)` 
                    }}
                  >
                    <div className={`p-6 md:p-10 text-white ${isLuxury ? 'max-w-2xl mt-auto pb-20' : 'max-w-lg'}`}>
                      {banner.heading && (
                        <h2 
                          className={`${isLuxury ? 'text-4xl md:text-6xl mb-4 font-normal' : 'text-2xl md:text-4xl font-bold mb-2'} drop-shadow-lg`}
                          style={{ fontFamily: headingFont }}
                        >
                          {banner.heading}
                        </h2>
                      )}
                      {banner.subheading && (
                        <p className={`${isLuxury ? 'text-lg md:text-xl font-light tracking-wide' : 'text-sm md:text-lg opacity-90'} mb-6`}>
                          {banner.subheading}
                        </p>
                      )}
                      {banner.ctaText && (
                        <span
                          className={`inline-block transition-all ${
                            isLuxury 
                              ? 'px-8 py-3 border border-white hover:bg-white hover:text-black tracking-widest uppercase text-sm'
                              : 'px-6 py-2.5 rounded font-semibold text-sm hover:opacity-90'
                          }`}
                          style={isLuxury ? {} : { backgroundColor: theme.primary }}
                        >
                          {banner.ctaText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {/* Navigation Arrows */}
          {banners.length > 1 && props.mode === 'carousel' && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition cursor-pointer ${
                  isLuxury ? 'text-white hover:bg-white/10 rounded-full' : 'rounded-full bg-white/90 shadow-lg hover:bg-white text-gray-700'
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition cursor-pointer ${
                  isLuxury ? 'text-white hover:bg-white/10 rounded-full' : 'rounded-full bg-white/90 shadow-lg hover:bg-white text-gray-700'
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && props.mode === 'carousel' && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    isLuxury ? 'h-2' : 'h-2.5'
                  }`}
                  style={{
                    width: index === currentSlide ? (isLuxury ? '24px' : '24px') : (isLuxury ? '8px' : '10px'),
                    backgroundColor: index === currentSlide ? dotActiveColor : 'rgba(255,255,255,0.5)',
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* App Download Widget - Sidebar Layout Only */}
        {layout === 'with-sidebar' && showAppWidget && (
          <div className="hidden lg:flex flex-col w-[180px] shrink-0 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5" style={{ color: theme.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.text }}>
                Download App
              </span>
            </div>

            <div className="space-y-2 text-xs" style={{ color: theme.muted }}>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-green-500 text-lg">✓</span>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-orange-500 text-lg">⚡</span>
                <span>Exclusive Offers</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <a href="#app-store" className="block w-full py-2 px-3 text-xs font-medium text-center bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer">
                App Store
              </a>
              <a href="#google-play" className="block w-full py-2 px-3 text-xs font-medium text-center bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer">
                Google Play
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}