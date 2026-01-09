/**
 * Daraz Template
 * 
 * A Daraz Bangladesh-inspired e-commerce template with:
 * - Orange theme header (#F85606)
 * - Category sidebar navigation
 * - Flash sale section with countdown
 * - Product grid layout
 * - Multi-column footer
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, useRef, useEffect } from 'react';
import { 
  Menu, X, Search, ShoppingCart, ChevronRight, ChevronLeft, 
  Heart, User, Truck, Headphones, Shield, RotateCcw,
  Smartphone, Shirt, Watch, Laptop, Home as HomeIcon, Car, 
  Baby, Dumbbell, Sparkles, ShoppingBag, Zap, Gift
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';

// Daraz brand colors
const DARAZ_ORANGE = '#F85606';
const DARAZ_ORANGE_HOVER = '#E04E05';
const DARAZ_BG = '#F5F5F5';
const DARAZ_TEXT = '#424242';
const DARAZ_TEXT_LIGHT = '#999999';
const DARAZ_CARD_BG = '#FFFFFF';
const DARAZ_TOP_BAR_BG = '#2E2E2E';

// Category icon mapping
const CATEGORY_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Electronics': Smartphone,
  'Fashion': Shirt,
  'Watches': Watch,
  'Computers': Laptop,
  'Home': HomeIcon,
  'Automotive': Car,
  'Babies': Baby,
  'Sports': Dumbbell,
  'Beauty': Sparkles,
  'Groceries': ShoppingBag,
  'default': ShoppingBag,
};

// Helper component for category icons with color
function CategoryIcon({ icon: IconComponent, className, color }: { icon: React.ComponentType<{ className?: string }>, className?: string, color?: string }) {
  return (
    <span style={{ color }}>
      <IconComponent className={className} />
    </span>
  );
}

export function DarazTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  businessInfo,
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashSaleTime, setFlashSaleTime] = useState({ hours: 5, minutes: 32, seconds: 48 });
  const flashSaleRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // Flash sale countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: currency || 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = (price: number, compareAtPrice: number | null) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  const getCategoryIcon = (category: string | null) => {
    if (!category) return CATEGORY_ICONS['default'];
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    return CATEGORY_ICONS[normalizedCategory] || CATEGORY_ICONS['default'];
  };

  const scrollFlashSale = (direction: 'left' | 'right') => {
    if (flashSaleRef.current) {
      const scrollAmount = 300;
      flashSaleRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Get products for different sections
  const flashSaleProducts = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 10);
  const allProducts = currentCategory 
    ? products.filter(p => p.category === currentCategory) 
    : products;
  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARAZ_BG, fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: DARAZ_TOP_BAR_BG }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition">Save More on App</span>
            <span className="hover:text-white cursor-pointer transition">Become a Seller</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" />
              Help & Support
            </span>
            {!isPreview && (
              <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: DARAZ_ORANGE }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-10 object-contain bg-white rounded" />
            ) : (
              <div className="h-10 w-10 bg-white rounded flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" style={{ color: DARAZ_ORANGE }} />
              </div>
            )}
            <span className="text-white font-bold text-xl hidden sm:block">{storeName}</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={`Search in ${storeName}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 rounded-l text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ backgroundColor: DARAZ_CARD_BG }}
              />
              <button 
                className="h-10 px-6 rounded-r font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: DARAZ_ORANGE_HOVER }}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 text-white hover:bg-white/10 rounded transition flex items-center gap-1"
            >
              <ShoppingCart className="h-6 w-6" />
              <span 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#FFD700', color: DARAZ_TEXT }}
                id="cart-count"
              >
                0
              </span>
            </Link>
            <button className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition">
              <Heart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-16 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-2">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                style={{ backgroundColor: currentCategory ? 'transparent' : `${DARAZ_ORANGE}15`, color: currentCategory ? DARAZ_TEXT : DARAZ_ORANGE }}
              >
                <ShoppingBag className="w-5 h-5" />
                All Categories
              </Link>
              {featuredCategories.map((category) => {
                const Icon = getCategoryIcon(category);
                const isActive = currentCategory === category;
                return (
                  <Link
                    key={category}
                    to={`?category=${encodeURIComponent(category!)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition"
                    style={{ 
                      backgroundColor: isActive ? `${DARAZ_ORANGE}15` : 'transparent', 
                      color: isActive ? DARAZ_ORANGE : DARAZ_TEXT 
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {category}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Hero Section with Category Sidebar */}
        <div className="flex gap-4 mb-6">
          {/* Category Sidebar (Desktop) */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <div className="p-3 font-semibold border-b" style={{ color: DARAZ_TEXT }}>
                Categories
              </div>
              <div className="py-1">
                {featuredCategories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const isActive = currentCategory === category;
                  return (
                    <Link
                      key={category}
                      to={`?category=${encodeURIComponent(category!)}`}
                      className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-gray-50"
                      style={{ 
                        backgroundColor: isActive ? `${DARAZ_ORANGE}10` : 'transparent',
                        color: isActive ? DARAZ_ORANGE : DARAZ_TEXT 
                      }}
                    >
                      <CategoryIcon icon={Icon} className="w-4 h-4" color={isActive ? DARAZ_ORANGE : DARAZ_TEXT_LIGHT} />
                      <span className="text-sm">{category}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Hero Banner */}
          <div className="flex-1">
            <div 
              className="relative rounded-lg overflow-hidden h-64 md:h-80 lg:h-96"
              style={{ 
                background: config?.bannerUrl 
                  ? `url(${config.bannerUrl}) center/cover no-repeat` 
                  : `linear-gradient(135deg, ${DARAZ_ORANGE} 0%, #FF7F50 100%)`
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center p-8 md:p-12">
                <div className="max-w-lg text-white">
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {config?.announcement?.text || 'Special Offer'}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {config?.bannerText || 'Amazing Deals Await!'}
                  </h1>
                  <p className="text-white/80 text-sm md:text-base mb-6">
                    Shop the best products at unbeatable prices
                  </p>
                  <Link
                    to="/?category=all"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm transition hover:opacity-90"
                    style={{ backgroundColor: DARAZ_ORANGE }}
                  >
                    SHOP NOW
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-8 h-1 rounded-full bg-white" />
                <div className="w-8 h-1 rounded-full bg-white/40" />
                <div className="w-8 h-1 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Section */}
        {flashSaleProducts.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            {/* Header */}
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-bold text-lg">Flash Sale</span>
                </div>
                {/* Countdown */}
                <div className="flex items-center gap-1 text-white">
                  <span className="text-xs opacity-80">Closing in:</span>
                  <div className="flex gap-1">
                    <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
                      {String(flashSaleTime.hours).padStart(2, '0')}
                    </span>
                    <span className="py-1">:</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
                      {String(flashSaleTime.minutes).padStart(2, '0')}
                    </span>
                    <span className="py-1">:</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
                      {String(flashSaleTime.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                to="/?sale=true"
                className="text-white text-sm font-medium flex items-center gap-1 hover:underline"
              >
                SHOP MORE
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Products Scroll */}
            <div className="relative">
              <button
                onClick={() => scrollFlashSale('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition"
              >
                <ChevronLeft className="w-6 h-6" style={{ color: DARAZ_TEXT }} />
              </button>
              
              <div 
                ref={flashSaleRef}
                className="flex gap-2 p-4 overflow-x-auto scrollbar-hide"
              >
                {flashSaleProducts.map((product) => {
                  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="min-w-[150px] max-w-[150px] bg-white border border-gray-100 rounded overflow-hidden hover:shadow-md transition group"
                    >
                      <div className="relative aspect-square">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        {discount > 0 && (
                          <span 
                            className="absolute top-2 right-2 text-white text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: DARAZ_ORANGE }}
                          >
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-sm" style={{ color: DARAZ_ORANGE }}>
                          {formatPrice(product.price)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-xs line-through" style={{ color: DARAZ_TEXT_LIGHT }}>
                            {formatPrice(product.compareAtPrice)}
                          </p>
                        )}
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: DARAZ_TEXT }}>
                          {product.title}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={() => scrollFlashSale('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition"
              >
                <ChevronRight className="w-6 h-6" style={{ color: DARAZ_TEXT }} />
              </button>
            </div>
          </section>
        )}

        {/* Category Icons Grid */}
        <section className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="font-bold text-lg mb-4" style={{ color: DARAZ_TEXT }}>Categories</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {featuredCategories.slice(0, 8).map((category, index) => {
              const Icon = getCategoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category!)}`}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${DARAZ_ORANGE}10` }}
                  >
                    <CategoryIcon icon={Icon} className="w-7 h-7" color={DARAZ_ORANGE} />
                  </div>
                  <span className="text-xs text-center font-medium" style={{ color: DARAZ_TEXT }}>
                    {category}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Just For You - Product Grid */}
        <section className="mb-6">
          <div className="bg-white rounded-t-lg shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-bold text-lg" style={{ color: DARAZ_TEXT }}>
                {currentCategory || 'Just For You'}
              </h2>
              {currentCategory && (
                <Link 
                  to="/"
                  className="text-sm hover:underline"
                  style={{ color: DARAZ_ORANGE }}
                >
                  View All
                </Link>
              )}
            </div>
          </div>
          
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {allProducts.map((product) => {
                const discount = getDiscountPercentage(product.price, product.compareAtPrice);
                return (
                  <article
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition group"
                  >
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="relative aspect-square overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        {discount > 0 && (
                          <span 
                            className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded"
                            style={{ backgroundColor: DARAZ_ORANGE }}
                          >
                            -{discount}%
                          </span>
                        )}
                        
                        {/* Free Shipping Badge */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                            Free Shipping
                          </span>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm line-clamp-2 mb-2 min-h-[2.5rem]" style={{ color: DARAZ_TEXT }}>
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base" style={{ color: DARAZ_ORANGE }}>
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs line-through" style={{ color: DARAZ_TEXT_LIGHT }}>
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        {/* Rating placeholder */}
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-yellow-400 text-xs">★</span>
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: DARAZ_TEXT_LIGHT }}>(100+)</span>
                        </div>
                      </div>
                    </Link>

                    {/* Add to Cart */}
                    <div className="px-3 pb-3">
                      <AddToCartButton
                        productId={product.id}
                        className="w-full py-2 rounded text-sm font-medium text-white transition hover:opacity-90"
                        style={{ backgroundColor: DARAZ_ORANGE }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-b-lg shadow-sm text-center py-16">
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${DARAZ_ORANGE}10` }}
              >
                <ShoppingBag className="w-10 h-10" style={{ color: DARAZ_ORANGE }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: DARAZ_TEXT }}>No Products Found</h3>
              <p style={{ color: DARAZ_TEXT_LIGHT }}>Check back later for new arrivals</p>
            </div>
          )}
        </section>

        {/* Features Bar */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DARAZ_ORANGE}10` }}
              >
                <Truck className="w-6 h-6" style={{ color: DARAZ_ORANGE }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: DARAZ_TEXT }}>Free Delivery</p>
                <p className="text-xs" style={{ color: DARAZ_TEXT_LIGHT }}>On orders over ৳500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DARAZ_ORANGE}10` }}
              >
                <RotateCcw className="w-6 h-6" style={{ color: DARAZ_ORANGE }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: DARAZ_TEXT }}>Easy Returns</p>
                <p className="text-xs" style={{ color: DARAZ_TEXT_LIGHT }}>7 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DARAZ_ORANGE}10` }}
              >
                <Shield className="w-6 h-6" style={{ color: DARAZ_ORANGE }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: DARAZ_TEXT }}>Secure Payment</p>
                <p className="text-xs" style={{ color: DARAZ_TEXT_LIGHT }}>100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DARAZ_ORANGE}10` }}
              >
                <Headphones className="w-6 h-6" style={{ color: DARAZ_ORANGE }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: DARAZ_TEXT }}>24/7 Support</p>
                <p className="text-xs" style={{ color: DARAZ_TEXT_LIGHT }}>Dedicated support</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Customer Care */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Customer Care</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                <li><Link to="/help" className="hover:text-orange-500 transition">Help Center</Link></li>
                <li><Link to="/returns" className="hover:text-orange-500 transition">Returns & Refunds</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
                <li><Link to="/track" className="hover:text-orange-500 transition">Track Order</Link></li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_TEXT }}>{storeName}</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                <li><Link to="/about" className="hover:text-orange-500 transition">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-orange-500 transition">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Popular Categories</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                {featuredCategories.slice(0, 5).map(cat => (
                  <li key={cat}>
                    <Link to={`?category=${encodeURIComponent(cat!)}`} className="hover:text-orange-500 transition">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Contact</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
                {businessInfo?.phone && <li className="flex items-center gap-2">📞 {businessInfo.phone}</li>}
                {businessInfo?.email && <li className="flex items-center gap-2">📧 {businessInfo.email}</li>}
                {businessInfo?.address && <li className="flex items-start gap-2">📍 {businessInfo.address}</li>}
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_TEXT }}>Payment Methods</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">bKash</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Nagad</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Visa</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Mastercard</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">COD</span>
              </div>
              
              {/* Social Links */}
              {(socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp) && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-sm" style={{ color: DARAZ_TEXT }}>Follow Us</h4>
                  <div className="flex gap-3">
                    {socialLinks?.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                         className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:opacity-80 transition">
                        <span className="text-sm font-bold">f</span>
                      </a>
                    )}
                    {socialLinks?.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                         className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white hover:opacity-80 transition">
                        <span className="text-sm font-bold">IG</span>
                      </a>
                    )}
                    {socialLinks?.whatsapp && (
                      <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                         className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:opacity-80 transition">
                        <span className="text-sm font-bold">W</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm" style={{ color: DARAZ_TEXT_LIGHT }}>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scrollbar Hide CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
