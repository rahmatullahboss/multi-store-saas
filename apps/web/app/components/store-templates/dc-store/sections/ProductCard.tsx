/**
 * DC Store Product Card Component
 * 
 * Based on the original DC Store product card design with golden gradient theme.
 * Features rounded corners, soft shadows, and smooth hover effects.
 */

import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { ShoppingCart, Star } from 'lucide-react';
import { resolveDCStoreTheme } from '../theme';
import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { useTranslation } from 'react-i18next';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';

export function DCProductCard({ 
  product, 
  currency = 'BDT',
  storeId = 0,
  theme,
  isPreview = false
}: { 
  product: SerializedProduct; 
  currency?: string;
  storeId?: number;
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}) {
  const resolvedTheme = resolveDCStoreTheme(undefined, theme);
  const { t } = useTranslation();
  
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;
  
  const imageUrl = product.imageUrl || '/placeholder-product.svg';
  const isRemoteImage = Boolean(product.imageUrl);
    
  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:border-amber-200/60"
      style={{ boxShadow: resolvedTheme.shadowCard }}
    >
      <PreviewSafeLink 
        to={`/products/${product.id}`} 
        isPreview={isPreview}
        className="block"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-3xl">
          <img 
            src={isRemoteImage ? buildProxyImageUrl(imageUrl, { width: 640, quality: 75 }) : imageUrl}
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            loading="lazy" 
            srcSet={isRemoteImage ? generateProxySrcset(imageUrl, [320, 480, 640], 75) : undefined}
            sizes="(max-width: 768px) 50vw, 25vw"
            decoding="async"
          />
          
          {/* Discount Badge - Top Left */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <span 
                className="px-2 py-1 text-[10px] sm:text-xs font-bold rounded-full text-white shadow-md flex items-center justify-center" 
                style={{ backgroundImage: resolvedTheme.brandGradient }}
              >
                -{discount}% OFF
              </span>
            </div>
          )}

          {/* Featured Badge - Bottom Left */}
          {product.id % 5 === 0 && ( // Just for demo/visual parity
             <div className="absolute bottom-3 left-3 z-10">
               <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1">
                 <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                 Featured
               </span>
             </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-1">
          {/* Product Title */}
          <h3 
            className="text-sm sm:text-base font-semibold line-clamp-2 transition-colors group-hover:text-amber-600" 
            style={{ color: resolvedTheme.text }}
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span 
              className="text-base sm:text-lg font-bold text-transparent bg-clip-text"
              style={{ backgroundImage: resolvedTheme.brandGradient }}
            >
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs sm:text-sm line-through text-gray-400">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </PreviewSafeLink>
      
      {/* Add to Cart Button Footer */}
      <div className="px-4 pb-4">
        <AddToCartButton
          productId={product.id}
          storeId={storeId}
          productName={product.title}
          productPrice={product.price}
          currency={currency}
          isPreview={isPreview}
          className="w-full py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 shadow-md"
          style={{ 
            backgroundColor: resolvedTheme.primary,
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          {t('store.addToCart', 'Order Now')}
        </AddToCartButton>
      </div>
    </div>
  );
}
