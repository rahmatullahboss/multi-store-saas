/**
 * Featured Products Section for Store Homepage
 * 
 * Displays a grid of featured products from the store's catalog.
 * Products come from the render context (loaded in route loader).
 */

import { Link } from '@remix-run/react';
import { ShoppingBag, Eye } from 'lucide-react';
import type { HomeContext } from '~/lib/template-resolver.server';

interface FeaturedProductsSectionProps {
  sectionId: string;
  props: {
    title?: string;
    subtitle?: string;
    productCount?: number;
    columns?: number;
    showPrice?: boolean;
    showAddToCart?: boolean;
    viewAllLink?: string;
  };
  context: HomeContext;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
  category?: string;
}

export default function FeaturedProductsSection({ sectionId, props, context }: FeaturedProductsSectionProps) {
  const {
    title = 'Featured Products',
    subtitle,
    productCount = 8,
    columns = 4,
    showPrice = true,
    showAddToCart = true,
    viewAllLink = '/products',
  } = props;

  const products = (context.featuredProducts as Product[] || []).slice(0, productCount);
  const themeColors = context.theme;
  const currency = context.currency || 'BDT';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  if (products.length === 0) {
    return (
      <section id={sectionId} className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: themeColors.textColor }}
          >
            {title}
          </h2>
          <p className="text-gray-500">No products available yet</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 
              className="text-2xl md:text-3xl font-bold"
              style={{ 
                color: themeColors.textColor,
                fontFamily: themeColors.headingFont,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <Link
            to={viewAllLink}
            className="text-sm font-medium hover:underline"
            style={{ color: themeColors.accentColor }}
          >
            View All
          </Link>
        </div>

        {/* Product Grid */}
        <div className={`grid ${columnClasses[columns as keyof typeof columnClasses] || columnClasses[4]} gap-4 md:gap-6`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showPrice={showPrice}
              showAddToCart={showAddToCart}
              themeColors={themeColors}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Product Card Sub-component
// ============================================================================

function ProductCard({
  product,
  showPrice,
  showAddToCart,
  themeColors,
  formatPrice,
}: {
  product: Product;
  showPrice: boolean;
  showAddToCart: boolean;
  themeColors: any;
  formatPrice: (price: number) => string;
}) {
  const productUrl = `/products/${product.slug || product.id}`;
  const image = product.images?.[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <Link to={productUrl} className="block aspect-square bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </Link>

      {/* Discount Badge */}
      {hasDiscount && (
        <div 
          className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
          style={{ backgroundColor: '#ef4444' }}
        >
          {Math.round((1 - product.price / product.compareAtPrice!) * 100)}% OFF
        </div>
      )}

      {/* Quick View Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={productUrl}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:scale-110 transition"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </Link>
      </div>

      {/* Info */}
      <div className="p-3 md:p-4">
        <Link to={productUrl}>
          <h3 
            className="font-medium text-sm md:text-base line-clamp-2 hover:underline"
            style={{ color: themeColors.textColor }}
          >
            {product.name}
          </h3>
        </Link>

        {showPrice && (
          <div className="mt-2 flex items-center gap-2">
            <span 
              className="font-bold text-lg"
              style={{ color: themeColors.accentColor }}
            >
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        )}

        {showAddToCart && (
          <button
            className="mt-3 w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: themeColors.accentColor,
              color: '#ffffff',
            }}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
