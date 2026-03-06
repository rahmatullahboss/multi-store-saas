import type { StoreTemplateTheme } from '~/templates/store-registry';
import type { HeroBannerSettings } from '~/services/storefront-settings.schema';
import { HeroMarketplace } from './HeroMarketplace';

interface HeroSectionProps {
  storeName?: string;
  theme: StoreTemplateTheme;
  props: HeroBannerSettings;
  variant?: 'default' | 'minimal' | 'bold' | 'marketplace' | 'luxury';
}

export function HeroSection({
  storeName,
  theme,
  props,
  variant = 'default',
}: HeroSectionProps) {
  if (variant === 'marketplace') {
    return (
      <HeroMarketplace
        storeName={storeName}
        theme={theme}
        props={props}
      />
    );
  }

  // Fallback default hero (simplified)
  const firstSlide = props.slides?.[0];
  if (!firstSlide) return null;

  return (
    <div className="relative w-full h-[400px] mb-8 bg-gray-200">
      {firstSlide.imageUrl && (
        <img 
          src={firstSlide.imageUrl} 
          alt={firstSlide.heading || 'Hero'} 
          className="w-full h-full object-cover" 
        />
      )}
      <div 
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{ backgroundColor: `rgba(0,0,0,${(props.overlayOpacity || 40) / 100})` }}
      >
        <div className="text-white p-4">
          <h1 className="text-4xl font-bold mb-4">{firstSlide.heading}</h1>
          <p className="text-xl mb-6">{firstSlide.subheading}</p>
          {firstSlide.ctaText && (
            <button 
              className="px-6 py-2 rounded font-bold" 
              style={{ backgroundColor: theme.primary }}
            >
              {firstSlide.ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
