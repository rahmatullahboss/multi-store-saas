/**
 * Product Main Section
 * 
 * Main product display with gallery, title, price, variants, and add to cart.
 * This is the core section of any product page.
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Check, 
  Truck, 
  Shield, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface ProductMainSectionProps {
  sectionId: string;
  props: {
    showGallery?: boolean;
    galleryPosition?: 'left' | 'right';
    showVariants?: boolean;
    showQuantity?: boolean;
    showAddToCart?: boolean;
    showBuyNow?: boolean;
    showTrustBadges?: boolean;
    addToCartText?: string;
    buyNowText?: string;
  };
  context: ProductContext;
}

interface Variant {
  id: number;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  options?: Record<string, string>;
}

export default function ProductMainSection({ sectionId, props, context }: ProductMainSectionProps) {
  const {
    showGallery = true,
    galleryPosition = 'left',
    showVariants = true,
    showQuantity = true,
    showAddToCart = true,
    showBuyNow = true,
    showTrustBadges = true,
    addToCartText = 'Add to Cart',
    buyNowText = 'Buy Now',
  } = props;

  const product = context.product as any;
  const variants = (context.variants as Variant[]) || [];
  const themeColors = context.theme;
  const currency = context.currency || 'BDT';

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images: string[] = product?.images || [];
  const currentPrice = selectedVariant?.price || product?.price || 0;
  const comparePrice = selectedVariant?.compareAtPrice || product?.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    // dispatch to cart context/localStorage
    const cartItem = {
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      name: product.name,
      price: currentPrice,
      image: images[0],
    };
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = existingCart.findIndex(
      (item: any) => item.productId === cartItem.productId && item.variantId === cartItem.variantId
    );
    
    if (existingIndex >= 0) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (!product) {
    return (
      <section id={sectionId} className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>Product not found</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={sectionId}
      className="py-8 md:py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-8 lg:gap-12 ${galleryPosition === 'right' ? 'md:grid-flow-col-dense' : ''}`}>
          
          {/* Image Gallery */}
          {showGallery && (
            <div className={galleryPosition === 'right' ? 'md:col-start-2' : ''}>
              <ImageGallery
                images={images}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
                productName={product.name}
              />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <h1 
                className="text-2xl md:text-3xl font-bold"
                style={{ 
                  color: themeColors.textColor,
                  fontFamily: themeColors.headingFont,
                }}
              >
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-center gap-3">
                <span 
                  className="text-3xl font-bold"
                  style={{ color: themeColors.accentColor }}
                >
                  {formatPrice(currentPrice)}
                </span>
                
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(comparePrice)}
                    </span>
                    <span className="px-2 py-1 text-sm font-bold text-white bg-red-500 rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variants */}
            {showVariants && variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.textColor }}>
                  Select Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-current'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: selectedVariant?.id === variant.id ? themeColors.accentColor : undefined,
                        color: selectedVariant?.id === variant.id ? themeColors.accentColor : themeColors.textColor,
                      }}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {showQuantity && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.textColor }}>
                  Quantity
                </label>
                <div className="inline-flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {showAddToCart && (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: themeColors.accentColor,
                    color: '#ffffff',
                  }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartText}
                </button>
              )}
              
              {showBuyNow && (
                <Link
                  to="/checkout"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold border-2 transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: themeColors.accentColor,
                    color: themeColors.accentColor,
                  }}
                >
                  {buyNowText}
                </Link>
              )}
            </div>

            {/* Trust Badges */}
            {showTrustBadges && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <TrustBadge icon={<Truck className="w-5 h-5" />} text="Free Shipping" />
                <TrustBadge icon={<Shield className="w-5 h-5" />} text="Secure Payment" />
                <TrustBadge icon={<RefreshCw className="w-5 h-5" />} text="Easy Returns" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ImageGallery({
  images,
  currentIndex,
  onIndexChange,
  productName,
}: {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  productName: string;
}) {
  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow hover:bg-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow hover:bg-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className="text-green-600">{icon}</div>
      <span className="text-xs text-gray-600">{text}</span>
    </div>
  );
}
