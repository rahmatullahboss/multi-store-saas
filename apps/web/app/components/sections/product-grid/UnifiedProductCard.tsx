import { Link } from 'react-router';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '~/lib/formatting';
import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useWishlist } from '~/hooks/useWishlist';
import { useState } from 'react';

export interface UnifiedProductCardProps {
  product: SerializedProduct;
  currency?: string;
  showRating?: boolean;
  showAddToCart?: boolean;
  theme: StoreTemplateTheme;
  variant?: 'marketplace' | 'luxury' | 'minimal' | 'bold' | 'default';
  layout?: 'standard' | 'minimal' | 'bordered';
  storeId?: number;
}

export function UnifiedProductCard({
  product,
  currency = 'BDT',
  showRating = true,
  showAddToCart = false,
  theme,
  variant = 'default',
  layout = 'standard',
  storeId = 0,
}: UnifiedProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // ============================================================================
  // STYLES DEDUCTION
  // ============================================================================
  const isLuxury = variant === 'luxury';
  
  const cardBorder = layout === 'bordered' || variant === 'marketplace' 
    ? `1px solid ${theme.cardBorder || '#E5E7EB'}` 
    : 'none';
    
  const cardShadow = isLuxury 
    ? (isHovered ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)')
    : (isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)');
    
  const titleFont = isLuxury ? 'Cormorant Garamond, serif' : 'inherit';
  const titleSize = isLuxury ? '1.125rem' : '0.875rem';

  return (
    <div
      className={`group block bg-white overflow-hidden transition-all duration-300 flex flex-col h-full relative ${isLuxury ? 'rounded-2xl' : 'rounded-lg'}`}
      style={{ 
        border: cardBorder,
        boxShadow: cardShadow,
        transform: isHovered && isLuxury ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className={`relative overflow-hidden block ${isLuxury ? 'aspect-[4/5]' : 'aspect-square bg-gray-50'}`}>
        <img
          src={product.imageUrl || '/placeholder-product.svg'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${isLuxury ? 'duration-700' : 'duration-300'}`}
          loading="lazy"
        />

        {/* Luxury gradient overlay */}
        {isLuxury && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)' }}
          />
        )}

        {hasDiscount && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold tracking-wider ${isLuxury ? 'rounded-full top-4 left-4 py-1.5' : 'rounded text-white'}`}
            style={isLuxury 
              ? { background: theme.accentGradient || theme.accent, color: theme.primary }
              : { backgroundColor: theme.primary }
            }
          >
            {isLuxury && <span className="mr-1">⚡</span>}
            {discountPercent}% OFF
          </span>
        )}
      </Link>

      <button
        className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer z-10 ${isLuxury ? 'top-4 right-4 p-2.5 hover:scale-110' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label="Add to wishlist"
      >
        <Heart className="w-4 h-4 transition-colors" style={{ color: isInWishlist(product.id) ? '#ef4444' : theme.muted, fill: isInWishlist(product.id) ? '#ef4444' : 'none' }} />
      </button>

      {/* Luxury Add to Cart overlay */}
      {isLuxury && showAddToCart && (
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <AddToCartButton
              productId={product.id}
              storeId={storeId}
              productPrice={product.price}
              productName={product.name}
              className="w-full px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: theme.primary,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              Add to Cart
            </AddToCartButton>
          </div>
        </div>
      )}

      <div className={`p-3 flex flex-col flex-grow ${isLuxury ? 'p-5' : ''}`}>
        <Link to={`/products/${product.id}`} className="block flex-grow">
          {product.category && isLuxury && (
            <span
              className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: theme.accent }}
            >
              {product.category}
            </span>
          )}
          
          <h3
            className={`line-clamp-2 transition-colors ${isLuxury ? 'font-medium mt-2 mb-3 hover:opacity-70' : 'text-xs md:text-sm mb-2 min-h-[2.5em]'}`}
            style={{ color: theme.text, fontFamily: titleFont, fontSize: titleSize }}
            onMouseEnter={!isLuxury ? (e) => (e.currentTarget.style.color = theme.primary) : undefined}
            onMouseLeave={!isLuxury ? (e) => (e.currentTarget.style.color = theme.text) : undefined}
          >
            {product.name}
          </h3>

          {!isLuxury && (
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-sm md:text-base font-bold" style={{ color: theme.primary }}>
                ৳{formatPrice(product.price, currency)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] md:text-xs line-through" style={{ color: theme.muted }}>
                  ৳{formatPrice(product.compareAtPrice!, currency)}
                </span>
              )}
            </div>
          )}

          {showRating && (
            <div className={`flex items-center ${isLuxury ? 'gap-1 mb-3' : 'gap-1.5 mb-2'}`}>
              {reviewCount > 0 ? (
                <>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={isLuxury ? "w-3.5 h-3.5" : "w-3 h-3"}
                        style={isLuxury ? {
                          color: theme.accent,
                          fill: i < Math.round(rating) ? theme.accent : 'none',
                        } : {
                          color: i < fullStars ? '#facc15' : i === fullStars && hasHalfStar ? '#facc15' : '#e5e7eb',
                          fill: i < fullStars ? '#facc15' : i === fullStars && hasHalfStar ? 'rgba(250, 204, 21, 0.5)' : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <span className={isLuxury ? "text-xs ml-1" : "text-[10px]"} style={{ color: theme.muted }}>
                    ({reviewCount})
                  </span>
                </>
              ) : (
                isLuxury && <span className="text-xs" style={{ color: theme.muted }}>No reviews yet</span>
              )}
            </div>
          )}

          {isLuxury && (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold" style={{ color: theme.primary }}>
                  ৳{formatPrice(product.price, currency)}
                </span>
                {hasDiscount && (
                  <span className="block text-xs line-through mt-0.5" style={{ color: theme.muted }}>
                    ৳{formatPrice(product.compareAtPrice!, currency)}
                  </span>
                )}
              </div>
            </div>
          )}
        </Link>

        {!isLuxury && showAddToCart && (
          <div className="mt-auto pt-2">
            <AddToCartButton
              productId={product.id}
              storeId={storeId}
              productPrice={product.price}
              productName={product.name}
              className="w-full py-2 rounded flex items-center justify-center gap-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primary, color: '#fff' }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </AddToCartButton>
          </div>
        )}
      </div>
    </div>
  );
}
