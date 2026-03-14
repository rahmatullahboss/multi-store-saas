import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, ShoppingBag, ArrowRight, Star, Menu, X, ChevronDown } from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useProductPrice } from '~/hooks/useProductPrice';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';

import { OZZYL_PREMIUM_THEME } from './theme';
import { OzzylPremiumHeader } from './sections/Header';
import { OzzylPremiumFooter } from './sections/Footer';

const THEME = OZZYL_PREMIUM_THEME;

function formatPrice(price: number | undefined, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price || 0);
}

interface OzzylPremiumProductCardProps {
  product: any;
  storeId: number;
}

function OzzylPremiumProductCard({ product, storeId }: OzzylPremiumProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const { price, compareAtPrice, isOnSale, discountPercentage } = useProductPrice(product);

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
        className="relative aspect-[4/5] rounded-2xl overflow-hidden"
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
              decoding="async"
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
            className={`transition-all duration-300 ${isLiked ? 'scale-110' : ''}`}
          />
        </button>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <AddToCartButton
            productId={product.id}
            storeId={storeId as number}
            quantity={1}
            variantId={product.variants?.[0]?.id}
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
          <h3
            className="font-semibold text-lg truncate transition-colors duration-300"
            style={{ color: THEME.text }}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          >
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

export { OzzylPremiumProductCard };

export function LiveOzzylPremiumHomepage(props: StoreTemplateProps) {
  const {
    storeName = 'My Store',
    logo,
    products = [],
    categories = [],
    storeId,
    config,
    socialLinks,
    businessInfo,
    isPreview = false,
  } = props;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const featuredProducts = products.slice(0, 8);
  const allProducts = products.slice(0, 12);

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: THEME.background,
        color: THEME.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Manrope', sans-serif;
        }
        
        .glass {
          background: rgba(20, 20, 24, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .gold-gradient {
          background: linear-gradient(135deg, #C8A961 0%, #E5D4A1 50%, #C8A961 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gold-bg-gradient {
          background: linear-gradient(135deg, #C8A961 0%, #E5D4A1 50%, #C8A961 100%);
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-shine {
          background: linear-gradient(
            110deg,
            transparent 30%,
            rgba(200, 169, 97, 0.3) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: shine 3s infinite;
        }
        
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${THEME.surface};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${THEME.border};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${THEME.primary};
        }
      `}</style>

      {/* Announcement Bar */}
      <div
        className="py-2 text-center text-sm font-medium"
        style={{
          background: `linear-gradient(90deg, ${THEME.primary}15 0%, ${THEME.primary}25 50%, ${THEME.primary}15 100%)`,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <span className="gold-gradient">✨</span>
        <span className="mx-2" style={{ color: THEME.textMuted }}>
          Free Shipping on Orders Above ৳1500 • Premium Quality • Award Winning Design
        </span>
        <span className="gold-gradient">✨</span>
      </div>

      {/* Header */}
      <OzzylPremiumHeader
        storeName={storeName}
        logo={logo}
        categories={categories}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isScrolled={isScrolled}
        setIsScrolled={setIsScrolled}
        config={config}
        socialLinks={socialLinks}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, ${THEME.primary}30 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 60%, ${THEME.primary}15 0%, transparent 40%),
              linear-gradient(180deg, ${THEME.background} 0%, ${THEME.surface} 100%)
            `,
          }}
        />

        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-20 animate-float"
            style={{
              background: `radial-gradient(circle, ${THEME.primary}40 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-15 animate-float"
            style={{
              background: `radial-gradient(circle, ${THEME.accent}40 0%, transparent 70%)`,
              filter: 'blur(60px)',
              animationDelay: '-3s',
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-shine"
              style={{
                backgroundColor: `${THEME.primary}15`,
                border: `1px solid ${THEME.primary}30`,
                color: THEME.primary,
              }}
            >
              <Star size={14} fill={THEME.primary} />
              <span>Bangladesh's Premium Marketplace</span>
            </div>

            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
              style={{ color: THEME.text }}
            >
              Discover
              <br />
              <span className="gold-gradient">Extraordinary</span>
              <br />
              Products
            </h1>

            <p className="text-xl md:text-2xl mb-8 max-w-xl" style={{ color: THEME.textMuted }}>
              Curated collection of premium products for the discerning buyer. Experience
              world-class shopping from Bangladesh.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="#products"
                className="group px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                  color: '#0A0A0C',
                }}
              >
                <span>Shop Now</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="#categories"
                className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  border: `2px solid ${THEME.border}`,
                  color: THEME.text,
                }}
              >
                <span>Explore Categories</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Product Cards */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block space-y-6">
          {featuredProducts.slice(0, 3).map((product, index) => (
            <div
              key={product.id}
              className="glass rounded-2xl p-3 shadow-2xl animate-float"
              style={{
                animationDelay: `${index * 0.5}s`,
                border: `1px solid ${THEME.border}`,
              }}
            >
              <img
                src={buildProxyImageUrl(product.imageUrl, { width: 120, quality: 80 })}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ backgroundColor: THEME.surface }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '10K+', label: 'Premium Products' },
              { value: '4.9', label: 'Average Rating' },
              { value: '24/7', label: 'Customer Support' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center"
                style={{ borderRight: index < 3 ? `1px solid ${THEME.border}` : 'none' }}
              >
                <div className="text-4xl md:text-5xl font-bold gold-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium" style={{ color: THEME.textMuted }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24" style={{ backgroundColor: THEME.background }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: THEME.text }}>
              Shop by <span className="gold-gradient">Category</span>
            </h2>
            <p className="text-lg" style={{ color: THEME.textMuted }}>
              Explore our carefully curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {(categories.length > 0
              ? categories
              : ['Fashion', 'Electronics', 'Home', 'Beauty', 'Sports', 'Books']
            )
              .slice(0, 6)
              .map((category: any, index) => (
                <Link
                  key={index}
                  to={`/collections/${typeof category === 'object' ? category.slug : category.toLowerCase()}`}
                  className="group relative rounded-2xl overflow-hidden aspect-square"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.primary}30 0%, transparent 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${THEME.primary}20 0%, ${THEME.primary}10 100%)`,
                        border: `1px solid ${THEME.primary}30`,
                      }}
                    >
                      <span className="text-2xl">
                        {['👗', '📱', '🏠', '💄', '⚽', '📚'][index]}
                      </span>
                    </div>
                    <span className="font-semibold text-center" style={{ color: THEME.text }}>
                      {typeof category === 'object' ? category.title : category}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-24" style={{ backgroundColor: THEME.surface }}>
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: THEME.text }}>
                Featured <span className="gold-gradient">Products</span>
              </h2>
              <p className="text-lg" style={{ color: THEME.textMuted }}>
                Handpicked favorites from our collection
              </p>
            </div>
            <Link
              to="/collections/all"
              className="hidden md:flex items-center gap-2 font-semibold transition-colors duration-300"
              style={{ color: THEME.primary }}
            >
              <span>View All</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {allProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <OzzylPremiumProductCard
                  key={product.id}
                  product={product}
                  storeId={Number(storeId)}
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
              <h3 className="text-2xl font-bold mb-2" style={{ color: THEME.text }}>
                No Products Yet
              </h3>
              <p style={{ color: THEME.textMuted }}>Add products to your store to see them here</p>
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: THEME.primary }}
            >
              <span>View All Products</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24" style={{ backgroundColor: THEME.background }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: THEME.text }}>
              Why Choose <span className="gold-gradient">Ozzyl</span>
            </h2>
            <p className="text-lg" style={{ color: THEME.textMuted }}>
              Experience premium shopping with these benefits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Fast Delivery',
                description:
                  'Quick and reliable shipping across Bangladesh with real-time tracking.',
              },
              {
                icon: '🛡️',
                title: 'Secure Payments',
                description: 'Multiple secure payment options including bKash, Nagad, and Cards.',
              },
              {
                icon: '⭐',
                title: 'Premium Quality',
                description: 'Curated selection of authentic products with quality guarantee.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2"
                style={{
                  backgroundColor: THEME.cardBg,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.primary}10 0%, transparent 100%)`,
                  }}
                />
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.primary}20 0%, ${THEME.primary}10 100%)`,
                      border: `1px solid ${THEME.primary}30`,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: THEME.text }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: THEME.textMuted }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 100%, ${THEME.primary}20 0%, transparent 50%),
            ${THEME.surface}
          `,
        }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: THEME.text }}>
              Stay <span className="gold-gradient">Updated</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: THEME.textMuted }}>
              Subscribe to get exclusive offers and new product announcements
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl outline-none transition-all duration-300"
                style={{
                  backgroundColor: THEME.background,
                  border: `1px solid ${THEME.border}`,
                  color: THEME.text,
                }}
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                  color: '#0A0A0C',
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <OzzylPremiumFooter
        storeName={storeName}
        logo={logo}
        config={config}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      />

      {/* Floating Contact Buttons */}
      {!isPreview && (
        <FloatingContactButtons
          whatsappEnabled={config?.floatingWhatsappEnabled}
          whatsappNumber={
            config?.floatingWhatsappNumber ||
            socialLinks?.whatsapp ||
            businessInfo?.phone ||
            undefined
          }
          whatsappMessage={config?.floatingWhatsappMessage || undefined}
          callEnabled={config?.floatingCallEnabled}
          callNumber={config?.floatingCallNumber || businessInfo?.phone || undefined}
          storeName={storeName}
        />
      )}
    </div>
  );
}
