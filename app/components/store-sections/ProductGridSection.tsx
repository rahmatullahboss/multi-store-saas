
import { Link } from '@remix-run/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import type { SectionSettings } from './registry';
import { useTranslation, useFormatPrice } from '~/contexts/LanguageContext';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useProductPrice } from '~/hooks/useProductPrice';
import { useWishlist } from '~/hooks/useWishlist';

import { withAISchema } from '~/utils/ai-editable';

interface ProductGridSectionProps {
  settings: SectionSettings;
  theme: any;
  products?: any[]; 
  currency?: string;
  storeId?: number;
  ProductCardComponent?: React.ComponentType<any>;
}

function ProductGridSectionComponent({ settings, theme, products: passedProducts, currency = 'BDT', storeId, ProductCardComponent }: ProductGridSectionProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  
  // Use passed products if available (dynamic collection), otherwise use demo/fallback
  const displayProducts = passedProducts || settings.products || [
    {
      id: 1,
      title: 'Premium Wireless Headphones',
      price: 15000,
      compareAtPrice: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      category: 'Electronics'
    },
    {
      id: 2,
      title: 'Ergonomic Office Chair',
      price: 25000,
      compareAtPrice: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
      category: 'Furniture'
    },
    {
      id: 3,
      title: 'Smart Fitness Watch',
      price: 8500,
      compareAtPrice: 12000,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      category: 'Electronics'
    },
    {
      id: 4,
      title: 'Minimalist Desk Lamp',
      price: 3500,
      compareAtPrice: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1507473888900-52e1ad147f72?w=800&q=80',
      category: 'Decor'
    }
  ];

  // If passedProducts are used, we might want to respect the limit from settings
  // But usually collection pages show paginated results. For now, let's just slice if explicitly set.
  // Ideally, pagination should be handled by the loader/parent.
  const limit = typeof settings.productCount === 'number' ? settings.productCount : 12;
  const productsToShow = passedProducts ? displayProducts : displayProducts.slice(0, limit);

  const paddingTop = settings.paddingTop === 'large' ? 'py-20' : settings.paddingTop === 'medium' ? 'py-12' : settings.paddingTop === 'small' ? 'py-8' : 'pt-0';
  const paddingBottom = settings.paddingBottom === 'large' ? 'pb-20' : settings.paddingBottom === 'medium' ? 'pb-12' : settings.paddingBottom === 'small' ? 'pb-8' : 'pb-0';

  return (
    <section className={`${paddingTop} ${paddingBottom} px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: settings.backgroundColor || 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        {(settings.heading || settings.subheading) && (
          <div className={`mb-12 ${settings.alignment === 'left' ? 'text-left' : settings.alignment === 'right' ? 'text-right' : 'text-center'}`}>
            {settings.heading && (
              <h2 
                className="text-3xl lg:text-4xl font-semibold mb-3"
                style={{ fontFamily: "'Playfair Display', serif", color: settings.textColor || theme.primary }}
              >
                {settings.heading}
              </h2>
            )}
            {settings.heading && <div className={`w-16 h-0.5 ${settings.alignment === 'center' ? 'mx-auto' : ''}`} style={{ backgroundColor: theme.accent }} />}
            {settings.subheading && (
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{settings.subheading}</p>
            )}
          </div>
        )}

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
            {displayProducts.map((product) => (
              ProductCardComponent ? (
                <ProductCardComponent 
                  key={product.id} 
                  product={product} 
                  storeId={storeId}
                  currency={currency}
                  formatPrice={formatPrice}
                  theme={theme}
                />
              ) : (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  storeId={storeId}
                  currency={currency}
                  formatPrice={formatPrice}
                  theme={theme}
                  addToCartText={settings.addToCartText}
                  showWishlist={settings.showWishlist}
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: theme.muted }}>
              No products found.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, storeId, currency, formatPrice, theme, addToCartText, showWishlist }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const { price, compareAtPrice: displayCompareAt, isFlashSale, isOnSale, discountPercentage } = useProductPrice(product);

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Discount Badge */}
        {isOnSale && (
          <div 
            className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded shadow-sm"
            style={{ 
              backgroundColor: isFlashSale ? '#EF4444' : theme.accent, 
              color: isFlashSale ? 'white' : theme.primary 
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Add Button - Always visible on mobile, hover on desktop */}
        <div 
          className="absolute inset-x-0 bottom-0 p-3 transition-all duration-300 md:opacity-0 md:translate-y-full md:group-hover:opacity-100 md:group-hover:translate-y-0"
        >
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productPrice={price}
            productName={product.title}
            className="w-full py-3 text-sm font-medium uppercase tracking-wider transition-colors shadow-lg"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            {addToCartText || 'Add to Bag'}
          </AddToCartButton>
        </div>
      </Link>

      {/* Wishlist Button - Always visible on mobile, hover on desktop */}
      {showWishlist !== false && (
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md transition-all hover:bg-white active:scale-95 ${
          isLiked ? 'bg-red-50 text-red-500 opacity-100' : 'bg-white/90 md:opacity-0 md:group-hover:opacity-100'
        }`}
        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} style={{ color: isLiked ? '#ef4444' : theme.text }} />
      </button>
      )}

      {/* Product Info */}
      <div className="mt-4 text-center">
        <Link to={`/product/${product.id}`}>
          <h3 
            className="text-sm font-medium mb-1 hover:underline"
            style={{ color: theme.text }}
          >
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium" style={{ color: theme.primary }}>
            {formatPrice(price)}
          </span>
          {isOnSale && displayCompareAt && (
            <span className="text-sm line-through" style={{ color: theme.muted }}>
              {formatPrice(displayCompareAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const PRODUCT_GRID_AI_SCHEMA = {
  component: 'product-grid',
  version: '1.0',
  properties: {
    heading: { 
      type: 'text', 
      aiEditable: true, 
      maxLength: 60,
      aiPrompt: "A catchy phrase for a product collection, e.g., 'New Arrivals' or 'Top Picks'" 
    },
    productCount: {
      type: 'number',
      aiEditable: true,
      constraints: { min: 4, max: 24, step: 4 }
    },
    addToCartText: {
      type: 'text',
      aiEditable: true,
      aiEnum: ['Add to Cart', 'Add to Bag', 'Get Yours', 'Buy Now']
    },
    showWishlist: {
      type: 'boolean',
      aiEditable: true
    },
    backgroundColor: {
      type: 'color',
      aiEditable: true
    }
  },
  actions: ['update', 'remove', 'reorder']
};

export const ProductGridSection = withAISchema(ProductGridSectionComponent, PRODUCT_GRID_AI_SCHEMA);
