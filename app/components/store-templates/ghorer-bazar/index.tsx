/**
 * GhorerBazar Store Template
 * 
 * A premium Bangladeshi e-commerce template inspired by ghorerbazar.com
 * 
 * Features:
 * - Hero banner with sliding images
 * - Category grid showcase
 * - Product cards with Quick Add, Sale badges
 * - Flash sale countdown section
 * - Trust badges
 * - Mobile-optimized design
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { 
  ShoppingCart, Eye, Heart, Star, ChevronRight, 
  Zap, Clock, TrendingUp, Award, Flame
} from 'lucide-react';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { GhorerBazarHeader } from './sections/Header';
import { GhorerBazarFooter } from './sections/Footer';
import { GHORER_BAZAR_THEME, GHORER_BAZAR_FONTS } from './theme';

// Export components for registry
export { GhorerBazarHeader } from './sections/Header';
export { GhorerBazarFooter } from './sections/Footer';

// ============================================================================
// PRODUCT CARD COMPONENT - GhorerBazar Style
// ============================================================================
interface ProductCardProps {
  product: SerializedProduct;
  isPreview?: boolean;
}

function GhorerBazarProductCard({ product, isPreview }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const theme = GHORER_BAZAR_THEME;
  
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('bn-BD')}`;
  };

  const productUrl = isPreview ? '#' : `/products/${product.id}`;

  return (
    <div 
      className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300"
      style={{ 
        boxShadow: isHovered ? theme.shadowLg : theme.shadowCard,
        fontFamily: GHORER_BAZAR_FONTS.body,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={productUrl}>
          <img 
            src={product.imageUrl || 'https://placehold.co/400x400/f5f5f5/999999?text=No+Image'} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span 
              className="px-2.5 py-1 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: theme.badgeSale }}
            >
              -{discount}%
            </span>
          )}
          {product.id % 5 === 0 && (
            <span 
              className="px-2.5 py-1 text-xs font-bold text-white rounded-full flex items-center gap-1"
              style={{ backgroundColor: theme.badgeHot }}
            >
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
          {product.id % 7 === 0 && (
            <span 
              className="px-2.5 py-1 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: theme.badgeNew }}
            >
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ 
            opacity: isHovered || isWishlisted ? 1 : 0,
          }}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>

        {/* Quick Actions - Appear on Hover */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300"
          style={{ 
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <div className="flex gap-2">
            <Link
              to={productUrl}
              className="flex-1 py-2.5 bg-white text-gray-900 rounded-lg font-medium text-sm text-center hover:bg-gray-100 transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              বিস্তারিত
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
              }}
              className="flex-1 py-2.5 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition"
              style={{ backgroundColor: theme.primary }}
            >
              <ShoppingCart className="w-4 h-4" />
              কার্ট
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span 
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: theme.primary }}
          >
            {product.category}
          </span>
        )}

        {/* Title */}
        <Link to={productUrl}>
          <h3 
            className="mt-1 font-medium text-gray-900 line-clamp-2 hover:text-orange-600 transition min-h-[48px]"
            style={{ fontSize: '15px' }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating - Static for demo */}
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-3.5 h-3.5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(১২৩)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span 
            className="text-lg font-bold"
            style={{ color: theme.priceSale }}
          >
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span 
              className="text-sm line-through"
              style={{ color: theme.priceOld }}
            >
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Mobile Quick Add Button */}
        <button
          className="w-full mt-3 py-2.5 rounded-lg font-medium text-sm text-white transition hover:opacity-90 md:hidden flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.primary }}
        >
          <ShoppingCart className="w-4 h-4" />
          কার্টে যোগ করুন
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ storeName, config }: { storeName: string; config: any }) {
  const theme = GHORER_BAZAR_THEME;
  
  return (
    <section className="relative">
      <div 
        className="relative h-[300px] md:h-[450px] bg-cover bg-center"
        style={{ 
          backgroundImage: config?.bannerUrl 
            ? `url(${config.bannerUrl})` 
            : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-xl">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              🎉 বিশেষ অফার চলছে
            </span>
            <h1 
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: GHORER_BAZAR_FONTS.heading }}
            >
              {config?.bannerText || `${storeName}-এ স্বাগতম`}
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white/90">
              সেরা মানের পণ্য, সেরা দামে। ১০০০৳+ অর্ডারে ফ্রি ডেলিভারি!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/?category=featured"
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
              >
                শপিং করুন
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/?sale=true"
                className="px-6 py-3 rounded-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition"
              >
                সেল দেখুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORY SECTION
// ============================================================================
function CategorySection({ categories }: { categories: string[] }) {
  const theme = GHORER_BAZAR_THEME;
  
  const categoryImages: Record<string, string> = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop',
    'Home': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=300&fit=crop',
    'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
    'Food': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=300&h=300&fit=crop',
  };

  return (
    <section className="py-10 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: GHORER_BAZAR_FONTS.heading }}
          >
            ক্যাটাগরি
          </h2>
          <Link 
            to="/"
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ color: theme.primary }}
          >
            সব দেখুন <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category}
              to={`?category=${encodeURIComponent(category)}`}
              className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all"
            >
              <div className="aspect-square">
                <img 
                  src={categoryImages[category] || `https://placehold.co/300x300/${theme.primary.slice(1)}/ffffff?text=${category}`}
                  alt={category}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <span className="text-white font-semibold text-sm md:text-base">
                    {category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FLASH SALE SECTION
// ============================================================================
function FlashSaleSection({ products, isPreview }: { products: SerializedProduct[]; isPreview?: boolean }) {
  const theme = GHORER_BAZAR_THEME;
  const saleProducts = products.filter(p => p.compareAtPrice).slice(0, 4);
  
  if (saleProducts.length === 0) return null;

  return (
    <section className="py-10 px-4 bg-gradient-to-r from-red-600 to-orange-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                ফ্ল্যাশ সেল
              </h2>
              <p className="text-white/80 text-sm">সীমিত সময়ের অফার!</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg">23:59:59</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {saleProducts.map((product) => (
            <GhorerBazarProductCard 
              key={product.id} 
              product={product} 
              isPreview={isPreview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCTS SECTION
// ============================================================================
function ProductsSection({ 
  title, 
  products, 
  isPreview,
  icon: Icon,
  viewAllLink = '/'
}: { 
  title: string; 
  products: SerializedProduct[]; 
  isPreview?: boolean;
  icon?: any;
  viewAllLink?: string;
}) {
  const theme = GHORER_BAZAR_THEME;
  
  if (products.length === 0) return null;

  return (
    <section className="py-10 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Icon className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
            )}
            <h2 
              className="text-xl md:text-2xl font-bold text-gray-900"
              style={{ fontFamily: GHORER_BAZAR_FONTS.heading }}
            >
              {title}
            </h2>
          </div>
          <Link 
            to={viewAllLink}
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ color: theme.primary }}
          >
            সব দেখুন <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 10).map((product) => (
            <GhorerBazarProductCard 
              key={product.id} 
              product={product} 
              isPreview={isPreview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================
export function GhorerBazarTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  planType,
  isPreview,
}: StoreTemplateProps) {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || currentCategory;
  const theme = GHORER_BAZAR_THEME;

  // Filter products by category
  const filteredProducts = categoryFilter
    ? products.filter(p => p.category === categoryFilter)
    : products;

  const validCategories = categories.filter(Boolean) as string[];

  // Group products for different sections
  const featuredProducts = products.slice(0, 10);
  const newArrivals = products.slice(10, 20);
  const bestSellers = products.filter(p => p.compareAtPrice).slice(0, 10);

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.background,
        fontFamily: GHORER_BAZAR_FONTS.body,
      }}
    >
      {/* Header */}
      <GhorerBazarHeader
        storeName={storeName}
        logo={logo}
        isPreview={isPreview}
        config={config}
        categories={validCategories}
        currentCategory={categoryFilter}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      />

      {/* Main Content */}
      <main>
        {/* Show Hero only when not filtering */}
        {!categoryFilter && (
          <>
            <HeroSection storeName={storeName} config={config} />
            <CategorySection categories={validCategories} />
            <FlashSaleSection products={products} isPreview={isPreview} />
          </>
        )}

        {/* Category Header when filtering */}
        {categoryFilter && (
          <div 
            className="py-8 px-4"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <div className="max-w-7xl mx-auto">
              <h1 
                className="text-2xl md:text-3xl font-bold text-gray-900"
                style={{ fontFamily: GHORER_BAZAR_FONTS.heading }}
              >
                {categoryFilter}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length}টি পণ্য পাওয়া গেছে
              </p>
            </div>
          </div>
        )}

        {/* Products */}
        {categoryFilter ? (
          <ProductsSection 
            title={categoryFilter}
            products={filteredProducts}
            isPreview={isPreview}
          />
        ) : (
          <>
            <ProductsSection 
              title="ফিচার্ড প্রোডাক্ট"
              products={featuredProducts}
              isPreview={isPreview}
              icon={Award}
            />
            
            {newArrivals.length > 0 && (
              <ProductsSection 
                title="নতুন এসেছে"
                products={newArrivals}
                isPreview={isPreview}
                icon={TrendingUp}
              />
            )}
          </>
        )}

        {/* All Products Section */}
        {!categoryFilter && products.length > 20 && (
          <ProductsSection 
            title="সব প্রোডাক্ট"
            products={products.slice(20)}
            isPreview={isPreview}
          />
        )}
      </main>

      {/* Footer */}
      <GhorerBazarFooter
        storeName={storeName}
        logo={logo}
        socialLinks={socialLinks}
        footerConfig={footerConfig}
        businessInfo={businessInfo}
        categories={validCategories}
        planType={planType}
      />
    </div>
  );
}

// Default export
export default GhorerBazarTemplate;
