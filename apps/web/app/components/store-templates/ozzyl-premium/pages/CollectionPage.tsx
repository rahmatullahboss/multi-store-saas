import { useState } from 'react';
import { Link, useParams, useSearchParams } from '@remix-run/react';
import {
  Heart,
  ShoppingBag,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useProductPrice } from '~/hooks/useProductPrice';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';
import { OZZYL_PREMIUM_THEME } from '../theme';
import { OzzylPremiumHeader } from '../sections/Header';
import { OzzylPremiumFooter } from '../sections/Footer';

const THEME = OZZYL_PREMIUM_THEME;

function formatPrice(price: number | undefined, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price || 0);
}

interface OzzylPremiumCollectionCardProps {
  product: any;
  storeId: number;
  viewMode: 'grid' | 'list';
}

function OzzylPremiumCollectionCard({
  product,
  storeId,
  viewMode,
}: OzzylPremiumCollectionCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const { price, compareAtPrice, isOnSale, discountPercentage } = useProductPrice(product);

  if (viewMode === 'list') {
    return (
      <div
        className="group flex gap-6 p-4 rounded-2xl transition-all duration-300"
        style={{
          backgroundColor: THEME.cardBg,
          border: `1px solid ${THEME.border}`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} className="flex-shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden">
            {product.imageUrl ? (
              <img
                src={buildProxyImageUrl(product.imageUrl, { width: 400, quality: 80 })}
                alt={product.name || product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: THEME.surface }}
              >
                <span className="text-4xl">✨</span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-xl font-bold mb-2" style={{ color: THEME.text }}>
              {product.name || product.title}
            </h3>
          </Link>
          <p className="mb-4" style={{ color: THEME.textMuted }}>
            {product.description?.slice(0, 150) ||
              'Premium quality product with exceptional craftsmanship.'}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold" style={{ color: THEME.primary }}>
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <>
                <span className="text-lg line-through" style={{ color: THEME.textMuted }}>
                  {formatPrice(compareAtPrice)}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: `${THEME.primary}20`, color: THEME.primary }}
                >
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              storeId={Number(storeId)}
              quantity={1}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                color: '#0A0A0C',
              }}
            />
            <button
              onClick={() => toggleWishlist(product.id)}
              className="p-3 rounded-xl"
              style={{
                border: `2px solid ${isLiked ? THEME.primary : THEME.border}`,
                backgroundColor: isLiked ? `${THEME.primary}20` : 'transparent',
              }}
            >
              <Heart
                size={20}
                fill={isLiked ? THEME.primary : 'none'}
                stroke={isLiked ? THEME.primary : 'currentColor'}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="relative aspect-square rounded-2xl overflow-hidden"
        style={{
          backgroundColor: THEME.cardBg,
          boxShadow: isHovered
            ? `0 20px 40px -12px rgba(200, 169, 97, 0.15)`
            : `0 4px 20px -4px rgba(0, 0, 0, 0.3)`,
        }}
      >
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {product.imageUrl ? (
            <img
              src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 80 })}
              alt={product.name || product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 80)}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: THEME.surface }}
            >
              <span className="text-6xl">✨</span>
            </div>
          )}
        </Link>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {isOnSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
              color: '#0A0A0C',
            }}
          >
            {discountPercentage}% OFF
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${THEME.border}`,
          }}
        >
          <Heart
            size={18}
            fill={isLiked ? THEME.primary : 'none'}
            stroke={isLiked ? THEME.primary : '#fff'}
          />
        </button>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <AddToCartButton
            productId={product.id}
            storeId={Number(storeId)}
            quantity={1}
            className="w-full justify-center py-3 rounded-xl font-semibold"
            style={{
              background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
              color: '#0A0A0C',
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg truncate" style={{ color: THEME.text }}>
            {product.name || product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: THEME.primary }}>
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm line-through" style={{ color: THEME.muted }}>
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function OzzylPremiumCollectionPage(props: StoreTemplateProps) {
  const {
    storeName,
    logo,
    products = [],
    categories = [],
    storeId,
    config,
    socialLinks,
    businessInfo,
  } = props;
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const currentPage = Number(searchParams.get('page') || 1);
  const perPage = 12;

  const filteredProducts = products.filter((p) => {
    const price = p.price || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / perPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const categoryName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'All Products';

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background, color: THEME.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Manrope', sans-serif; }
        .gold-gradient {
          background: linear-gradient(135deg, #C8A961 0%, #E5D4A1 50%, #C8A961 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <OzzylPremiumHeader
        storeName={storeName || 'Store'}
        logo={logo}
        categories={categories}
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
        isScrolled={true}
        setIsScrolled={() => {}}
        config={config}
        socialLinks={socialLinks}
      />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm"
              style={{ color: THEME.textMuted }}
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
          </nav>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{categoryName}</h1>
            <p style={{ color: THEME.textMuted }}>{sortedProducts.length} products found</p>
          </div>

          {/* Toolbar */}
          <div
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6"
            style={{ borderBottom: `1px solid ${THEME.border}` }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
                style={{
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <Filter size={18} />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: viewMode === 'grid' ? `${THEME.primary}20` : 'transparent',
                    border: `1px solid ${viewMode === 'grid' ? THEME.primary : THEME.border}`,
                  }}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: viewMode === 'list' ? `${THEME.primary}20` : 'transparent',
                    border: `1px solid ${viewMode === 'list' ? THEME.primary : THEME.border}`,
                  }}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm" style={{ color: THEME.textMuted }}>
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                  color: THEME.text,
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Products Grid/List */}
          {paginatedProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {paginatedProducts.map((product) => (
                <OzzylPremiumCollectionCard
                  key={product.id}
                  product={product}
                  storeId={Number(storeId)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary}20 0%, ${THEME.primary}10 100%)`,
                  border: `1px solid ${THEME.primary}30`,
                }}
              >
                <ShoppingBag size={40} style={{ color: THEME.primary }} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
              <p style={{ color: THEME.textMuted }}>Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setSearchParams({ page: String(currentPage - 1) })}
                disabled={currentPage === 1}
                className="p-3 rounded-xl disabled:opacity-50"
                style={{
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <ArrowLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setSearchParams({ page: String(page) })}
                  className="w-10 h-10 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: currentPage === page ? THEME.primary : THEME.cardBg,
                    color: currentPage === page ? '#0A0A0C' : THEME.text,
                    border: `1px solid ${currentPage === page ? THEME.primary : THEME.border}`,
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setSearchParams({ page: String(currentPage + 1) })}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl disabled:opacity-50"
                style={{
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>

      <OzzylPremiumFooter
        storeName={storeName || 'Store'}
        logo={logo}
        config={config}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      />

      <FloatingContactButtons
        whatsappEnabled={config?.floatingWhatsappEnabled}
        whatsappNumber={
          config?.floatingWhatsappNumber || socialLinks?.whatsapp || businessInfo?.phone
        }
        whatsappMessage={config?.floatingWhatsappMessage}
        callEnabled={config?.floatingCallEnabled}
        callNumber={config?.floatingCallNumber || businessInfo?.phone}
        storeName={storeName || 'Store'}
      />
    </div>
  );
}

export default OzzylPremiumCollectionPage;
