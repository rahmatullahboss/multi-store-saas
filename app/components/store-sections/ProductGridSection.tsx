
import { Link } from '@remix-run/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import type { SectionSettings } from './registry';
import { useTranslation, useFormatPrice } from '~/contexts/LanguageContext';
import { AddToCartButton } from '~/components/AddToCartButton';

interface ProductGridSectionProps {
  settings: SectionSettings;
  theme: any;
  products?: any[]; // Allow generic products to be passed (e.g. from Collection loader)
  currency?: string;
  storeId?: number; // storeId is now optional as it might not always be passed
}

export function ProductGridSection({ settings, theme, products: passedProducts, currency = 'BDT', storeId }: ProductGridSectionProps) {
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
              <ProductCard 
                key={product.id} 
                product={product} 
                storeId={storeId}
                currency={currency}
                formatPrice={formatPrice}
                theme={theme}
              />
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

function ProductCard({ product, storeId, currency, formatPrice, theme }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

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
        {hasDiscount && (
          <div 
            className="absolute top-3 left-3 px-2 py-1 text-xs font-medium"
            style={{ backgroundColor: theme.accent, color: theme.primary }}
          >
            -{discountPercent}%
          </div>
        )}

        {/* Quick Add Button - Shows on Hover */}
        <div 
          className="absolute inset-x-0 bottom-0 p-3 transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            className="w-full py-3 text-sm font-medium uppercase tracking-wider transition-colors"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            Add to Bag
          </AddToCartButton>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button 
        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
      >
        <Heart className="w-4 h-4" style={{ color: theme.text }} />
      </button>

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
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: theme.muted }}>
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
