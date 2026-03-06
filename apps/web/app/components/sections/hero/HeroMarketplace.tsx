import { useState, useEffect, useCallback } from 'react';
import { Link } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { generateSrcset, optimizeUnsplashUrl } from '~/utils/imageOptimization';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import type { HeroBannerSettings } from '~/services/storefront-settings.schema';

interface HeroMarketplaceProps {
  storeName?: string;
  theme: StoreTemplateTheme;
  props: HeroBannerSettings;
}

export function HeroMarketplace({
  storeName = 'Store',
  theme,
  props
}: HeroMarketplaceProps) {
  const banners = props.slides || [];
  const autoPlayInterval = props.autoPlayInterval || 5000;
  const showAppWidget = props.showAppWidget ?? true;

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
                key={index}
                to={banner.ctaLink || '#'}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {(() => {
                  if (!banner.imageUrl) return <div className="w-full h-full bg-gray-200" />;
                  
                  const isUnsplash = banner.imageUrl.includes('unsplash.com');
                  const bannerSrc = isUnsplash
                    ? optimizeUnsplashUrl(banner.imageUrl, {
                        width: 1600,
                        height: 600,
                        quality: 80,
                        format: 'webp',
                      })
                    : banner.imageUrl;
                  const bannerSrcSet = isUnsplash
                    ? generateSrcset(banner.imageUrl, [640, 960, 1280, 1600])
                    : undefined;
                  const isPriority = index === 0;

                  return (
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
                  );
                })()}
                
                {/* Overlay content */}
                {(banner.heading || banner.subheading) && (
                  <div 
                    className="absolute inset-0 flex items-center"
                    style={{ background: `linear-gradient(to right, rgba(0,0,0,${(props.overlayOpacity || 40) / 100}), transparent)` }}
                  >
                    <div className="p-6 md:p-10 text-white max-w-lg">
                      {banner.heading && (
                        <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                          {banner.heading}
                        </h2>
                      )}
                      {banner.subheading && (
                        <p className="text-sm md:text-lg opacity-90 mb-4">
                          {banner.subheading}
                        </p>
                      )}
                      {banner.ctaText && (
                        <span
                          className="inline-block px-6 py-2.5 rounded font-semibold text-sm transition-all hover:opacity-90"
                          style={{ backgroundColor: theme.primary }}
                        >
                          {banner.ctaText}
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

            <p className="mt-3 text-[10px] text-center" style={{ color: theme.muted }}>
              Download the {storeName} App Now!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
