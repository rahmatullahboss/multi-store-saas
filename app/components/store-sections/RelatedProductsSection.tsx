
import { Link } from '@remix-run/react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { SectionSettings } from './registry';
import { AddToCartButton } from '~/components/AddToCartButton';

interface RelatedProductsSectionProps {
  settings: SectionSettings;
  theme: any;
  relatedProducts?: any[];
  currency?: string;
  storeId?: number;
}

export function RelatedProductsSection({ settings, theme, relatedProducts = [], currency = 'BDT', storeId }: RelatedProductsSectionProps) {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  const displayProducts = relatedProducts.slice(0, settings.productCount || 4);
  const paddingTop = settings.paddingTop === 'large' ? 'py-20' : settings.paddingTop === 'medium' ? 'py-12' : settings.paddingTop === 'small' ? 'py-8' : 'pt-0';
  const paddingBottom = settings.paddingBottom === 'large' ? 'pb-20' : settings.paddingBottom === 'medium' ? 'pb-12' : settings.paddingBottom === 'small' ? 'pb-8' : 'pb-0';
  
  const primaryColor = theme?.primary || '#000000';
  const accentColor = theme?.accent || '#f59e0b';
  const textColor = theme?.text || '#1f2937';
  const mutedColor = theme?.muted || '#6b7280';

  // Helper for price formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <section className={`${paddingTop} ${paddingBottom} px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: settings.backgroundColor || 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        {settings.heading && (
          <div className="mb-8 text-left">
            <h2 
              className="text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              {settings.heading}
            </h2>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          {displayProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              storeId={storeId}
              currency={currency}
              formatPrice={formatPrice}
              theme={{ primary: primaryColor, accent: accentColor, text: textColor, muted: mutedColor }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, storeId, currency, formatPrice, theme }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-lg">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
             // Parse JSON images if needed, similar to main product page
             (() => {
                 let imgUrl = null;
                 try {
                     const images = JSON.parse(product.images || '[]');
                     if (images.length > 0) imgUrl = images[0];
                 } catch (e) {}
                 
                 if (imgUrl) {
                      return (
                        <img
                            src={imgUrl}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      );
                 }
                 
                 return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                );
             })()
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div 
            className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            -{discountPercent}%
          </div>
        )}

        {/* Quick Add Button - Shows on Hover */}
        <div 
          className="absolute inset-x-0 bottom-0 p-2 transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {storeId && (
            <AddToCartButton
                productId={product.id}
                storeId={storeId}
                className="w-full py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded shadow-lg"
                style={{ backgroundColor: 'white', color: theme.primary }}
                productName={product.title}
                productPrice={product.price}
                currency={currency}
            >
                Add
            </AddToCartButton>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-3">
        <Link to={`/products/${product.id}`}>
          <h3 
            className="text-sm font-medium mb-1 hover:underline truncate"
            style={{ color: theme.text }}
          >
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: theme.primary }}>
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs line-through" style={{ color: theme.muted }}>
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
