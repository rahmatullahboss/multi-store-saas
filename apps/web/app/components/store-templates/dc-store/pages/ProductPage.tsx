/**
 * DC Store Product Detail Page
 * 
 * Based on the original DC Store design with golden gradient theme.
 * Features large images, detailed info, and add to cart functionality.
 */

import { useState } from 'react';
import { ShoppingCart, Heart, Share2, Truck, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { resolveDCStoreTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { buildProxyImageUrl } from '~/utils/imageOptimization';

interface DCProductPageProps {
  product: SerializedProduct;
  storeId: number;
  isPreview?: boolean;
  config?: any;
}

export function DCProductPage({ product, storeId, isPreview = false, config }: DCProductPageProps) {
  const theme = resolveDCStoreTheme(config);
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;

  const imageUrl = product.imageUrl || '/placeholder-product.svg';
  
  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const productImages = [imageUrl]; // Expand this if multi-image support is added

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.background }}>
       {/* Background decorations */}
       <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Mobile Back Button */}
        <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10">
          <PreviewSafeLink 
            to="/" 
            isPreview={isPreview} 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </PreviewSafeLink>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Column - Image Gallery */}
            <div className="space-y-4">
              <div 
                className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-white/50 bg-white"
              >
                <img
                  src={buildProxyImageUrl(productImages[selectedImage], { width: 1000, height: 1000, quality: 85 })}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                {discount > 0 && (
                  <div className="absolute top-6 left-6 z-10">
                    <span 
                      className="px-4 py-2 text-sm font-bold rounded-full text-white shadow-xl" 
                      style={{ backgroundImage: theme.brandGradient }}
                    >
                      -{discount}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  Top Quality
                </div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: theme.text }}>
                  {product.title}
                </h1>
                
                <div className="flex items-baseline gap-4">
                  <span 
                    className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text"
                    style={{ backgroundImage: theme.brandGradient }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-xl md:text-2xl line-through text-gray-400">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors text-xl font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors text-xl font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-bold text-green-600">In Stock</span>
                </div>
              </div>

              {/* CTA Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <AddToCartButton
                  productId={product.id}
                  storeId={storeId}
                  productName={product.title}
                  productPrice={product.price}
                  quantity={quantity}
                  currency="BDT"
                  isPreview={isPreview}
                  className="flex-1 py-5 rounded-2xl text-lg font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-2xl flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                  style={{ 
                    backgroundColor: theme.primary,
                  }}
                >
                  <ShoppingCart className="w-6 h-6" />
                  Buy Now
                </AddToCartButton>
                <button
                  className="px-6 py-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-gray-400 hover:text-rose-500 transition-colors" />
                </button>
                <button
                  className="px-6 py-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <Share2 className="w-6 h-6 text-gray-400 hover:text-amber-500 transition-colors" />
                </button>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white shadow-sm">
                  <Truck className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-tighter">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white shadow-sm">
                  <RotateCcw className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-tighter">7-Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
