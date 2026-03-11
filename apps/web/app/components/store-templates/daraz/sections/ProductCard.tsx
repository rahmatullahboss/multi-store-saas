/**
 * Daraz Product Card
 * 
 * Product card matching Daraz Bangladesh styling:
 * - Square image with discount badge
 * - Truncated title (2 lines)
 * - Price with ৳ symbol
 * - Crossed out original price
 * - Star rating with review count
 * - Hover elevation effect
 */

import { Link, useFetcher } from '@remix-run/react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { DARAZ_THEME } from '../theme';
import type { SerializedProduct } from '~/templates/store-registry';
import { formatPrice } from '~/utils/formatPrice';
import { useWishlist } from '~/hooks/useWishlist';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useEffect, useState } from 'react';

type Product = SerializedProduct;

interface ProductCardProps {
  product: Product;
  currency?: string;
  showRating?: boolean;
  showAddToCart?: boolean;
}

// Generate random rating for demo purposes (replace with actual rating when available)
function getProductRating(productId: number): { rating: number; count: number } {
  // Use product ID as seed for consistent "random" values
  const seed = productId % 100;
  return {
    rating: 3.5 + (seed % 20) / 10, // 3.5 - 5.0
    count: 10 + (seed * 7) % 500     // 10 - 500 reviews
  };
}

export function DarazProductCard({ 
  product, 
  currency = 'BDT',
  showRating = true,
  showAddToCart = false
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isContextLiked = isInWishlist(product.id);
  const [isLiked, setIsLiked] = useState(isContextLiked);
  const fetcher = useFetcher();

  useEffect(() => {
    setIsLiked(isContextLiked);
  }, [isContextLiked]);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();

    // Optimistic UI update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    toggleWishlist(product.id);

    // Call the wishlist API endpoint as requested
    fetcher.submit(
      { productId: String(product.id), action: newLikedState ? 'add' : 'remove' },
      { method: 'post', action: '/api/wishlist/add' }
    );
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;
  
  const { rating, count: reviewCount } = getProductRating(product.id);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
      style={{ border: `1px solid ${DARAZ_THEME.borderLight}` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span
            className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
            style={{ backgroundColor: DARAZ_THEME.primary }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist Button (on hover) */}
        <button
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white cursor-pointer ${
            isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${fetcher.state !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
            style={{ color: isLiked ? '#ef4444' : DARAZ_THEME.textSecondary }}
          />
        </button>

        {/* Quick Add to Cart (on hover) */}
        {showAddToCart && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
            <AddToCartButton
              productId={product.id}
              productName={product.title}
              productPrice={product.price}
              currency={currency}
              className="w-full py-2 rounded bg-white/90 backdrop-blur-sm flex items-center justify-center gap-2 hover:bg-white cursor-pointer text-sm font-medium"
              style={{ color: DARAZ_THEME.primary }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </AddToCartButton>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Title */}
        <h3 
          className="text-xs md:text-sm line-clamp-2 mb-2 min-h-[2.5em] transition-colors group-hover:text-orange-500"
          style={{ color: DARAZ_THEME.text }}
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1.5">
          <span 
            className="text-sm md:text-base font-bold"
            style={{ color: DARAZ_THEME.priceOrange }}
          >
            ৳{formatPrice(product.price, { currency: currency as 'BDT' | 'USD', showSymbol: false })}
          </span>
          {hasDiscount && (
            <span 
              className="text-[10px] md:text-xs line-through"
              style={{ color: DARAZ_THEME.muted }}
            >
              ৳{formatPrice(product.compareAtPrice!, { currency: currency as 'BDT' | 'USD', showSymbol: false })}
            </span>
          )}
        </div>

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < fullStars
                      ? 'fill-yellow-400 text-yellow-400'
                      : i === fullStars && hasHalfStar
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span 
              className="text-[10px]"
              style={{ color: DARAZ_THEME.muted }}
            >
              ({reviewCount})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Daraz Product Grid
 * 
 * 6-column responsive grid for "Just For You" section
 */
interface ProductGridProps {
  products: Product[];
  currency?: string;
  title?: string;
  columns?: 4 | 5 | 6;
}

export function DarazProductGrid({
  products = [],
  currency = 'BDT',
  title = 'Just For You',
  columns = 6
}: ProductGridProps) {
  if (products.length === 0) return null;

  const gridCols = {
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  };

  return (
    <section className="bg-white rounded-lg shadow-sm mb-6 p-4">
      {title && (
        <h2 
          className="text-lg font-bold mb-4"
          style={{ color: DARAZ_THEME.text }}
        >
          {title}
        </h2>
      )}

      <div className={`grid ${gridCols[columns]} gap-3 md:gap-4`}>
        {products.map((product) => (
          <DarazProductCard 
            key={product.id} 
            product={product} 
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}
