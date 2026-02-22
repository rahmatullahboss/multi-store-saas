import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { ShoppingCart } from 'lucide-react';
import { resolveStarterStoreTheme } from '../theme';
import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { useTranslation } from 'react-i18next';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';


export function StarterProductCard({ 
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
  const resolvedTheme = resolveStarterStoreTheme(undefined, theme);
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
    <div className="group">
      <PreviewSafeLink 
        to={`/products/${product.id}`} 
        isPreview={isPreview}
        className="block"
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3" style={{ backgroundColor: resolvedTheme.cardBg }}>
          <img 
            src={isRemoteImage ? buildProxyImageUrl(imageUrl, { width: 640, quality: 75 }) : imageUrl}
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            loading="lazy" 
            srcSet={isRemoteImage ? generateProxySrcset(imageUrl, [320, 480, 640], 75) : undefined}
            sizes={isRemoteImage ? '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw' : undefined}
            decoding="async"
          />
          {discount > 0 && (
            <span 
              className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full text-white" 
              style={{ backgroundColor: resolvedTheme.accent }}
            >
              -{discount}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium line-clamp-2 group-hover:underline" style={{ color: resolvedTheme.text }}>
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: resolvedTheme.primary }}>
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm line-through" style={{ color: resolvedTheme.muted }}>
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </PreviewSafeLink>
      
      {/* Add to Cart Button */}
      <div className="mt-2">
        <AddToCartButton
          productId={product.id}
          storeId={storeId}
          productName={product.title}
          productPrice={product.price}
          currency={currency}
          isPreview={isPreview}
          className="w-full py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor: resolvedTheme.primary }}
        >
          <ShoppingCart className="w-4 h-4" />
          {t('store.addToCart', 'Add to Cart')}
        </AddToCartButton>
      </div>
    </div>
  );
}
