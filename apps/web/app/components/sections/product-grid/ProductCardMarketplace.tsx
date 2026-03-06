import { Link } from '@remix-run/react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '~/lib/formatting';
import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useWishlist } from '~/hooks/useWishlist';

interface ProductCardMarketplaceProps {
  product: SerializedProduct;
  currency?: string;
  showRating?: boolean;
  showAddToCart?: boolean;
  theme: StoreTemplateTheme;
}

export function ProductCardMarketplace({
  product,
  currency = 'BDT',
  showRating = true,
  showAddToCart = false,
  theme,
}: ProductCardMarketplaceProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  // Real rating logic (if available in your product schema), otherwise fallback to 0
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div
      className="group block bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col h-full relative"
      style={{ border: `1px solid ${theme.cardBorder || '#E5E7EB'}` }}
    >
      <Link to={`/products/${product.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
        <img
          src={product.imageUrl || '/placeholder-product.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {hasDiscount && (
          <span
            className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
            style={{ backgroundColor: theme.primary }}
          >
            -{discountPercent}%
          </span>
        )}
      </Link>

      <button
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label="Add to wishlist"
      >
        <Heart className="w-4 h-4" style={{ color: theme.text, fill: isInWishlist(product.id) ? theme.primary : 'none' }} />
      </button>

      <div className="p-3 flex flex-col flex-grow">
        <Link to={`/products/${product.id}`} className="block flex-grow">
          <h3
            className="text-xs md:text-sm line-clamp-2 mb-2 min-h-[2.5em] transition-colors"
            style={{ color: theme.text }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.text)}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span
              className="text-sm md:text-base font-bold"
              style={{ color: theme.primary }}
            >
              ৳{formatPrice(product.price, currency)}
            </span>
            {hasDiscount && (
              <span
                className="text-[10px] md:text-xs line-through"
                style={{ color: theme.muted }}
              >
                ৳{formatPrice(product.compareAtPrice!, currency)}
              </span>
            )}
          </div>

          {showRating && reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
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
              <span className="text-[10px]" style={{ color: theme.muted }}>
                ({reviewCount})
              </span>
            </div>
          )}
        </Link>

        {showAddToCart && (
          <div className="mt-auto pt-2">
            <AddToCartButton
              productId={product.id}
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
