import { Link } from '@remix-run/react';
import { ChevronRight } from 'lucide-react';
import type { SectionSettings } from './registry';

interface ModernHeroSectionProps {
  settings: SectionSettings;
  theme: any;
  products?: any[];
}

export default function ModernHeroSection({ settings, theme, products = [] }: ModernHeroSectionProps) {
  const primaryColor = theme.primary;
  // Get featured product for floating card if available
  const featuredProduct = products && products.length > 0 ? products[0] : null;

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-10 py-6 lg:py-8">
      <div className="relative overflow-hidden rounded-2xl min-h-[450px] sm:min-h-[550px] lg:min-h-[600px] flex items-center">
        {/* Hero Background */}
        {settings.image ? (
          <img
            src={settings.image}
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div 
            className="absolute inset-0 w-full h-full bg-gradient-to-br"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(105deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full lg:w-2/3 px-6 lg:pl-16 flex flex-col items-start gap-4 sm:gap-6">
          {/* Badge */}
          {settings.badge && (
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase"
              style={{ 
                backgroundColor: `${primaryColor}30`, 
                borderColor: `${primaryColor}50`,
                color: primaryColor 
              }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: primaryColor }}
              />
              {settings.badge}
            </div>
          )}

          {/* Title */}
          <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tighter">
            {settings.heading}
          </h1>

          {/* Description */}
          {settings.subheading && (
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-md leading-relaxed">
              {settings.subheading}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-4">
            {settings.primaryAction?.label && (
              <Link
                to={settings.primaryAction.url}
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-full font-bold flex items-center gap-2 transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: 'white',
                  boxShadow: `0 0 20px ${primaryColor}66`
                }}
              >
                {settings.primaryAction.label}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
            {settings.secondaryAction?.label && (
              <Link
                to={settings.secondaryAction.url}
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-full font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center"
              >
                {settings.secondaryAction.label}
              </Link>
            )}
          </div>
        </div>

        {/* Floating Product Card (Desktop) */}
        {featuredProduct && (
          <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 hidden lg:flex gap-4">
            <div className="w-64 p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-4">
              {featuredProduct.imageUrl && (
                <div 
                  className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${featuredProduct.imageUrl})` }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{featuredProduct.title}</p>
                <p className="text-xs font-bold" style={{ color: primaryColor }}>Best Seller</p>
              </div>
              <Link
                to={`/products/${featuredProduct.id}`}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition"
                style={{ backgroundColor: primaryColor }}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
