import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from './types';

export function HeroSection({
  config,
  product,
  storeName,
  isEditMode,
  onUpdate,
  formatPrice,
  theme,
}: SectionProps & { formatPrice: (price: number) => string }) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const customPrimaryColor = config.primaryColor;
  const ctaButtonStyle = customPrimaryColor 
    ? { backgroundColor: customPrimaryColor } 
    : undefined;

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero & Headlines"
      data={{ 
        headline: config.headline, 
        subheadline: config.subheadline, 
        ctaText: config.ctaText, 
        ctaSubtext: config.ctaSubtext 
      }}
      onUpdate={(newData) => onUpdate?.('hero', newData)}
      isEditable={isEditMode}
    >
      <section className={`${theme.isDark ? '' : 'bg-gradient-to-b from-gray-50 to-white'} py-12 lg:py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Store Badge */}
          <div className="text-center mb-8">
            <span className={`inline-flex items-center gap-2 px-4 py-2 ${theme.isDark ? 'bg-white/10 text-white' : 'bg-orange-100 text-orange-700'} rounded-full text-sm font-semibold`}>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {storeName}
            </span>
          </div>

          {/* Headline */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-center ${theme.textPrimary} mb-6 leading-tight tracking-tight`}>
            {config.headline}
          </h1>
          
          {config.subheadline && (
            <p className={`text-xl md:text-2xl ${theme.textSecondary} text-center mb-12 max-w-3xl mx-auto`}>
              {config.subheadline}
            </p>
          )}

          {/* Product Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
            {/* Product Image */}
            <div className="relative">
              {discount > 0 && (
                <div 
                  className={`absolute top-4 left-4 z-10 ${ctaButtonStyle ? '' : theme.ctaBg} text-white px-5 py-2 rounded-full font-bold text-lg shadow-lg`}
                  style={ctaButtonStyle}
                >
                  {discount}% ছাড়!
                </div>
              )}
              
              <div className={`aspect-square rounded-3xl overflow-hidden ${theme.isDark ? 'bg-gray-800' : 'bg-gray-100'} shadow-2xl border-4 ${theme.isDark ? 'border-gray-700' : 'border-white'}`}>
                {product.imageUrl ? (
                  <OptimizedImage
                    src={product.imageUrl}
                    alt={product.title}
                    width={700}
                    height={700}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <span className="text-9xl">📦</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <h2 className={`text-3xl md:text-4xl font-bold ${theme.textPrimary}`}>{product.title}</h2>
              
              {product.description && (
                <p className={`${theme.textSecondary} text-lg leading-relaxed`}>
                  {product.description}
                </p>
              )}

              {/* Price Display */}
              <div className={`${theme.isDark ? 'bg-white/10' : 'bg-gradient-to-r from-emerald-50 to-green-50'} rounded-2xl p-6 border ${theme.isDark ? 'border-white/20' : 'border-emerald-200'}`}>
                <div className="flex items-end gap-4 flex-wrap">
                  <span className={`text-5xl md:text-6xl font-black ${theme.isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className={`text-2xl ${theme.isDark ? 'text-gray-400' : 'text-gray-400'} line-through mb-2`}>
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className={`${theme.isDark ? 'text-emerald-400' : 'text-emerald-700'} font-semibold mt-2`}>
                    আপনি সেভ করছেন: {formatPrice(product.compareAtPrice! - product.price)}
                  </p>
                )}
              </div>

              {/* Social Proof */}
              {config.socialProof && (
                <div className={`flex items-center gap-4 ${theme.isDark ? 'bg-white/10 border-white/20' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4`}>
                  <div className="text-yellow-500 text-2xl">{'★'.repeat(5)}</div>
                  <p className={theme.textSecondary}>
                    <strong className={`${theme.textPrimary} text-xl`}>{config.socialProof.count}+</strong> {config.socialProof.text}
                  </p>
                </div>
              )}

              {/* Desktop Order Button - Scroll to Form */}
              <div className="hidden lg:block">
                <a
                  href="#order-form"
                  className={`block w-full py-5 px-8 ${ctaButtonStyle ? '' : theme.ctaBg} ${theme.ctaText} text-2xl font-bold rounded-2xl shadow-xl transition transform hover:scale-[1.02] text-center`}
                  style={ctaButtonStyle}
                >
                  🛒 {config.ctaText || 'এখনই অর্ডার করুন'} - {formatPrice(product.price)}
                </a>
                {config.ctaSubtext && (
                  <p className={`text-center ${theme.textSecondary} text-sm mt-3`}>
                    ✓ {config.ctaSubtext}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
