import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { ShoppingCart } from 'lucide-react';
import { STARTER_STORE_THEME } from '../theme';
import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { useTranslation } from 'react-i18next';


export function StarterProductCard({ 
  product, 
  currency = 'BDT',
  storeId = 0,
  theme = STARTER_STORE_THEME,
  isPreview = false
}: { 
  product: SerializedProduct; 
  currency?: string;
  storeId?: number;
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}) {
  const { t } = useTranslation();
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;
    
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
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3" style={{ backgroundColor: theme.cardBg }}>
          <img 
            src={product.imageUrl || '/placeholder-product.svg'} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            loading="lazy" 
          />
          {discount > 0 && (
            <span 
              className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full text-white" 
              style={{ backgroundColor: theme.accent }}
            >
              -{discount}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium line-clamp-2 group-hover:underline" style={{ color: theme.text }}>
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: theme.primary }}>
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm line-through" style={{ color: theme.muted }}>
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
          style={{ backgroundColor: theme.primary }}
        >
          <ShoppingCart className="w-4 h-4" />
          {t('store.addToCart', 'Add to Cart')}
        </AddToCartButton>
      </div>
    </div>
  );
}
