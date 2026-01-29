import { useState } from 'react';
import { 
  Check, Shield, RotateCcw, Truck, Star,
  Minus, Plus, ShoppingCart
} from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { StarterProductCard } from '../sections/ProductCard';
import { STARTER_STORE_THEME } from '../theme';
import type { SerializedProduct } from '~/templates/store-registry';
import { useTranslation } from 'react-i18next';

const theme = STARTER_STORE_THEME;

interface StarterProductPageProps {
  product: SerializedProduct;
  // currency prop removed or marked optional if interface is shared, but better to just remove unused
  relatedProducts?: SerializedProduct[];
  storeId: number;
  isPreview?: boolean;
}

export function StarterProductPage({
  product,
  relatedProducts = [],
  storeId,
  isPreview = false
}: StarterProductPageProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: theme.background }}>
      {/* Breadcrumb */}
      <div className="border-b" style={{ borderColor: theme.muted + '20' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm" style={{ color: theme.muted }}>
          <PreviewSafeLink to="/" isPreview={isPreview} className="hover:underline">Home</PreviewSafeLink>
          <span className="mx-2">/</span>
          <PreviewSafeLink to="/products" isPreview={isPreview} className="hover:underline">{t('store.allProducts', 'Products')}</PreviewSafeLink>
          <span className="mx-2">/</span>
          <span style={{ color: theme.text }}>{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white relative">
              <img 
                src={product.imageUrl || '/placeholder-product.svg'} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span 
                  className="absolute top-4 left-4 px-3 py-1.5 text-sm font-bold rounded-full text-white" 
                  style={{ backgroundColor: theme.accent }}
                >
                  -{discount}% OFF
                </span>
              )}
            </div>
            {/* Thumbnails could go here */}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: theme.text }}>
              {product.title}
            </h1>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold" style={{ color: theme.primary }}>
                ৳{product.price.toLocaleString('bn-BD')}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl line-through mb-1" style={{ color: theme.muted }}>
                  ৳{product.compareAtPrice.toLocaleString('bn-BD')}
                </span>
              )}
            </div>

            {/* Rating Placeholder */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm ml-2" style={{ color: theme.muted }}>(24 Reviews)</span>
            </div>

            <div className="border-t border-b py-6 space-y-4" style={{ borderColor: theme.muted + '20' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg" style={{ borderColor: theme.muted + '40' }}>
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <AddToCartButton
                  productId={product.id}
                  storeId={storeId}
                  quantity={quantity}
                  productName={product.title}
                  productPrice={product.price}
                  isPreview={isPreview}
                  className="flex-1 py-3 px-6 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('store.addToCart', 'Add to Cart')}
                </AddToCartButton>
              </div>
              
              <AddToCartButton
                mode="buy_now"
                productId={product.id}
                storeId={storeId}
                quantity={quantity}
                productName={product.title}
                productPrice={product.price}
                isPreview={isPreview}
                className="w-full py-3 px-6 rounded-lg font-bold text-white transition hover:opacity-90 text-center block"
                style={{ backgroundColor: theme.accent }}
              >
                {t('store.buyNow', 'Buy Now')} - ৳{(product.price * quantity).toLocaleString('bn-BD')}
              </AddToCartButton>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="text-sm">{t('store.trustFastDelivery', 'Fast Delivery')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="text-sm">{t('store.trustAuthentic', 'Genuine Product')}</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="text-sm">{t('store.trustEasyReturn', '7 Day Returns')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="text-sm">{t('store.verifiedTech', 'Verified Seller')}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t pt-6" style={{ borderColor: theme.muted + '20' }}>
              <div className="flex border-b" style={{ borderColor: theme.muted + '20' }}>
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'description' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500'
                  }`}
                  style={{ 
                    borderColor: activeTab === 'description' ? theme.primary : 'transparent',
                    color: activeTab === 'description' ? theme.primary : theme.muted
                  }}
                >
                  {t('store.description', 'Description')}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'reviews' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500'
                  }`}
                  style={{ 
                    borderColor: activeTab === 'reviews' ? theme.primary : 'transparent',
                    color: activeTab === 'reviews' ? theme.primary : theme.muted
                  }}
                >
                  {t('store.reviews', 'Reviews')} (0)
                </button>
              </div>
              <div className="py-4 text-sm leading-relaxed" style={{ color: theme.text }}>
                {activeTab === 'description' ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description || t('store.noDescription', 'No description available.') }} />
                ) : (
                  <p className="py-4 text-center text-gray-500">{t('store.noReviews', 'No reviews yet.')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>{t('store.relatedProducts', 'You Might Also Like')}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map(related => (
                <StarterProductCard 
                  key={related.id} 
                  product={related} 
                  storeId={storeId} 
                  isPreview={isPreview} 
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
