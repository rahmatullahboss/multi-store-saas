/**
 * Product Info Section
 * 
 * Displays product title, price, variants, and add to cart functionality.
 */

import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { ShoppingCart, Heart, Minus, Plus, Check, Truck, Shield } from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface ProductInfoSectionProps {
  sectionId: string;
  props: {
    showVariants?: boolean;
    showQuantity?: boolean;
    showAddToCart?: boolean;
    showBuyNow?: boolean;
    showTrustBadges?: boolean;
    addToCartText?: string;
    buyNowText?: string;
    paddingTop?: 'none' | 'small' | 'medium' | 'large';
    paddingBottom?: 'none' | 'small' | 'medium' | 'large';
  };
  context: ProductContext;
}

const PADDING_MAP = {
  none: '',
  small: 'py-2',
  medium: 'py-4',
  large: 'py-8',
};

export default function ProductInfoSection({ sectionId, props, context }: ProductInfoSectionProps) {
  const {
    showVariants = true,
    showQuantity = true,
    showAddToCart = true,
    showBuyNow = true,
    showTrustBadges = true,
    addToCartText = 'Add to Cart',
    buyNowText = 'Buy Now',
    paddingTop = 'large',
    paddingBottom = 'large',
  } = props;

  const product = context.product as any;
  const currency = context.currency || 'BDT';
  const currencySymbol = currency === 'BDT' ? '৳' : '$';
  
  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<any>(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const fetcher = useFetcher();

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const comparePrice = selectedVariant?.compareAtPrice || product?.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    fetcher.submit(
      {
        productId: product?.id || '',
        variantId: selectedVariant?.id || '',
        quantity: String(quantity),
      },
      { method: 'POST', action: '/api/cart' }
    );
    
    // Show success feedback
    setTimeout(() => {
      setIsAdding(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Redirect to checkout after adding
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 600);
  };

  return (
    <section 
      id={sectionId}
      className={`${PADDING_MAP[paddingTop]} ${PADDING_MAP[paddingBottom]}`}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {product?.title || 'Product'}
        </h1>

        {/* Reviews summary */}
        {product?.reviews && product.reviews.count > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.reviews.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviews.count} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-gray-900">
            {currencySymbol}{currentPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-gray-500 line-through">
                {currencySymbol}{comparePrice.toLocaleString()}
              </span>
              <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Variants */}
        {showVariants && variants.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Option
            </label>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    selectedVariant === variant
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {variant.name || variant.value || `Option ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        {showQuantity && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center w-32 border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartText}
                </>
              )}
            </button>
          )}
          {showBuyNow && (
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 px-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
            >
              {buyNowText}
            </button>
          )}
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Trust badges */}
        {showTrustBadges && (
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="w-5 h-5 text-green-500" />
              <span>Free shipping on orders over {currencySymbol}1000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Secure checkout with SSL encryption</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
