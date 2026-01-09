/**
 * BDShop Template
 * 
 * A BDShop Bangladesh-inspired e-commerce template with:
 * - Navy blue theme header with orange accents
 * - Mobile-first responsive design with bottom navigation
 * - Category sidebar navigation (desktop) / drawer (mobile)
 * - Top Deals carousel with discount badges
 * - "Specially for You" product grid
 * - FAQ accordion section
 * - Trust bar with guarantees
 * - Dark footer with newsletter
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, useRef, useEffect } from 'react';
import { 
  Menu, X, Search, ShoppingCart, ChevronRight, ChevronLeft, 
  Heart, User, Truck, Headphones, Shield, RotateCcw,
  Smartphone, Shirt, Watch, Laptop, Home as HomeIcon, Car, 
  Baby, Dumbbell, Sparkles, ShoppingBag, Zap, ChevronDown, ChevronUp,
  MapPin, Mail, Phone, Facebook, MessageCircle, Package,
  Grid3X3, UserCircle
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';

// BDShop brand colors
const BDSHOP_NAVY = '#1E3A8A';
const BDSHOP_NAVY_DARK = '#1E3A5F';
const BDSHOP_ORANGE = '#F97316';
const BDSHOP_PURPLE = '#7C3AED';
const BDSHOP_GREEN = '#059669';
const BDSHOP_BG = '#F9FAFB';
const BDSHOP_TEXT = '#424242';
const BDSHOP_TEXT_LIGHT = '#6B7280';
const BDSHOP_CARD_BG = '#FFFFFF';
const BDSHOP_FOOTER_BG = '#0F172A';

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

// FAQ data
const FAQ_DATA = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bKash, Nagad, Visa, Mastercard, and Cash on Delivery (COD) for all orders within Bangladesh.'
  },
  {
    question: 'What are your delivery times and charges?',
    answer: 'Delivery within Dhaka takes 1-2 business days. Outside Dhaka takes 3-5 business days. Free delivery on orders over ৳500.'
  },
  {
    question: 'Do you offer warranty on products?',
    answer: 'Yes, all electronics come with manufacturer warranty. Duration varies by product and is mentioned on the product page.'
  },
  {
    question: 'What is your return and refund policy?',
    answer: 'We offer 7-day easy returns for most products. Items must be unused and in original packaging. Refunds are processed within 5-7 business days.'
  },
];

// Helper component for category icons with color
function CategoryIcon({ icon: IconComponent, className, color }: { icon: React.ComponentType<{ className?: string }>, className?: string, color?: string }) {
  return (
    <span style={{ color }}>
      <IconComponent className={className} />
    </span>
  );
}

export function BDShopTemplate({
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
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const topDealsRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // Close drawers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDrawerOpen) {
        const drawer = document.getElementById('category-drawer');
        if (drawer && !drawer.contains(e.target as Node)) {
          setCategoryDrawerOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDrawerOpen]);

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

  const scrollTopDeals = (direction: 'left' | 'right') => {
    if (topDealsRef.current) {
      const scrollAmount = 280;
      topDealsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Get products for different sections
  const topDealsProducts = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 12);
  const allProducts = currentCategory 
    ? products.filter(p => p.category === currentCategory) 
    : products;
  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: BDSHOP_BG, fontFamily: "'Inter', 'NotoSans', Arial, sans-serif" }}>
      {/* Top Bar - Desktop Only */}
      <div style={{ backgroundColor: BDSHOP_NAVY_DARK }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-4">
            <span className="opacity-80">আসসালামু আলাইকুম</span>
            <span className="text-yellow-400 text-[10px] bg-yellow-400/20 px-2 py-0.5 rounded">Beta Version</span>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks?.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            {socialLinks?.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Sparkles className="w-3.5 h-3.5" />
              </a>
            )}
            <span className="opacity-50">|</span>
            {!isPreview && (
              <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Account
              </Link>
            )}
            <Link to="/cart" className="hover:text-white transition flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              My Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: BDSHOP_CARD_BG }} className="sticky top-0 z-50 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-3 md:px-4 flex items-center h-14 md:h-16 gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" style={{ color: BDSHOP_TEXT }} /> : <Menu className="h-6 w-6" style={{ color: BDSHOP_TEXT }} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded flex items-center justify-center" style={{ backgroundColor: BDSHOP_NAVY }}>
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="font-bold text-lg md:text-xl hidden sm:block" style={{ color: BDSHOP_NAVY }}>{storeName}</span>
              </div>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-10 pl-4 pr-12 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                style={{ backgroundColor: '#F3F4F6' }}
              />
              <button 
                className="absolute right-0 top-0 h-full px-3 md:px-4 rounded-r-lg text-white transition hover:opacity-90"
                style={{ backgroundColor: BDSHOP_NAVY }}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg text-white text-xs font-medium transition hover:opacity-90" style={{ backgroundColor: '#3B82F6' }}>
              Group Buy
            </button>
            <button className="px-3 py-2 rounded-lg text-white text-xs font-medium transition hover:opacity-90" style={{ backgroundColor: BDSHOP_PURPLE }}>
              Dropshop
            </button>
            <button className="px-3 py-2 rounded-lg text-white text-xs font-medium transition hover:opacity-90" style={{ backgroundColor: BDSHOP_GREEN }}>
              Be Partner
            </button>
          </div>

          {/* Cart - Desktop */}
          <Link
            to="/cart"
            className="hidden md:flex relative p-2 hover:bg-gray-100 rounded-lg transition items-center gap-1"
          >
            <ShoppingCart className="h-6 w-6" style={{ color: BDSHOP_TEXT }} />
            <span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: BDSHOP_ORANGE }}
              id="cart-count"
            >
              0
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t" style={{ backgroundColor: BDSHOP_CARD_BG }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center h-10 gap-6 text-sm">
            <Link to="/" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>Home</Link>
            <button 
              onClick={() => setCategoryDrawerOpen(!categoryDrawerOpen)}
              className="font-medium hover:text-blue-600 transition flex items-center gap-1"
              style={{ color: BDSHOP_TEXT }}
            >
              Categories
              <ChevronDown className="w-4 h-4" />
            </button>
            <Link to="/?sale=true" className="font-medium transition" style={{ color: '#EF4444' }}>Sale</Link>
            <Link to="/about" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>About</Link>
            <Link to="/contact" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>Contact</Link>
            <Link to="/track" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_TEXT }}>Track Order</Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-40 max-h-[70vh] overflow-y-auto border-t">
            <div className="p-3 space-y-1">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_TEXT }}
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </Link>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCategoryDrawerOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_TEXT }}
              >
                <Grid3X3 className="w-5 h-5" />
                Categories
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              <Link 
                to="/?sale=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: '#EF4444' }}
              >
                <Zap className="w-5 h-5" />
                Sale
              </Link>
              <Link 
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_TEXT }}
              >
                <Package className="w-5 h-5" />
                Track Order
              </Link>
              {!isPreview && (
                <Link 
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                  style={{ color: BDSHOP_TEXT }}
                >
                  <User className="w-5 h-5" />
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Category Drawer - Mobile */}
      {categoryDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setCategoryDrawerOpen(false)} />
          <div 
            id="category-drawer"
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl overflow-y-auto animate-slide-in"
          >
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg" style={{ color: BDSHOP_TEXT }}>Shop by Category</h2>
              <button onClick={() => setCategoryDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2">
              <Link
                to="/"
                onClick={() => setCategoryDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                style={{ 
                  backgroundColor: !currentCategory ? `${BDSHOP_NAVY}10` : 'transparent',
                  color: !currentCategory ? BDSHOP_NAVY : BDSHOP_TEXT 
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">All Products</span>
              </Link>
              {featuredCategories.map((category) => {
                const Icon = getCategoryIcon(category);
                const isActive = currentCategory === category;
                return (
                  <Link
                    key={category}
                    to={`?category=${encodeURIComponent(category!)}`}
                    onClick={() => setCategoryDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                    style={{ 
                      backgroundColor: isActive ? `${BDSHOP_NAVY}10` : 'transparent',
                      color: isActive ? BDSHOP_NAVY : BDSHOP_TEXT 
                    }}
                  >
                    <CategoryIcon icon={Icon} className="w-5 h-5" color={isActive ? BDSHOP_NAVY : BDSHOP_TEXT_LIGHT} />
                    <span className="font-medium">{category}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
        {/* Hero Section with Category Sidebar */}
        <div className="flex gap-4 mb-4 md:mb-6">
          {/* Category Sidebar - Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-32">
              <div className="p-3 font-bold border-b flex items-center gap-2" style={{ color: BDSHOP_TEXT }}>
                <Grid3X3 className="w-4 h-4" />
                Shop by Category
              </div>
              <div className="py-1 max-h-[400px] overflow-y-auto">
                {featuredCategories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const isActive = currentCategory === category;
                  return (
                    <Link
                      key={category}
                      to={`?category=${encodeURIComponent(category!)}`}
                      className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-gray-50"
                      style={{ 
                        backgroundColor: isActive ? `${BDSHOP_NAVY}08` : 'transparent',
                        color: isActive ? BDSHOP_NAVY : BDSHOP_TEXT 
                      }}
                    >
                      <CategoryIcon icon={Icon} className="w-4 h-4" color={isActive ? BDSHOP_NAVY : BDSHOP_TEXT_LIGHT} />
                      <span className="text-sm">{category}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Hero Banner */}
          <div className="flex-1">
            <div 
              className="relative rounded-lg md:rounded-xl overflow-hidden h-40 sm:h-52 md:h-64 lg:h-80"
              style={{ 
                background: config?.bannerUrl 
                  ? `url(${config.bannerUrl}) center/cover no-repeat` 
                  : `linear-gradient(135deg, ${BDSHOP_NAVY} 0%, #3B82F6 50%, ${BDSHOP_ORANGE} 100%)`
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="max-w-lg text-white">
                  <div 
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold mb-2 md:mb-4"
                    style={{ backgroundColor: BDSHOP_ORANGE }}
                  >
                    <Zap className="w-3 h-3" />
                    {config?.announcement?.text || 'Super Sale'}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 leading-tight">
                    {config?.bannerText || 'Amazing Deals Await!'}
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base mb-3 md:mb-6 hidden sm:block">
                    Shop the best products at unbeatable prices
                  </p>
                  <Link
                    to="/?category=all"
                    className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-xs md:text-sm text-white transition hover:opacity-90"
                    style={{ backgroundColor: BDSHOP_ORANGE }}
                  >
                    SHOP NOW
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-6 md:w-8 h-1 rounded-full bg-white" />
                <div className="w-6 md:w-8 h-1 rounded-full bg-white/40" />
                <div className="w-6 md:w-8 h-1 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Shop by Category - Horizontal Scroll */}
        <section className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="font-bold text-base md:text-lg" style={{ color: BDSHOP_TEXT }}>Shop by Category</h2>
            <span className="text-xs text-gray-400">Swipe to see more →</span>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {featuredCategories.slice(0, 10).map((category, index) => {
              const Icon = getCategoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category!)}`}
                  className="flex flex-col items-center gap-2 min-w-[70px] md:min-w-[80px] p-2 md:p-3 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: `${BDSHOP_NAVY}10` }}
                  >
                    <CategoryIcon icon={Icon} className="w-6 h-6 md:w-7 md:h-7" color={BDSHOP_NAVY} />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium line-clamp-2" style={{ color: BDSHOP_TEXT }}>
                    {category}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Deals Section */}
        {topDealsProducts.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm mb-4 md:mb-6 overflow-hidden">
            {/* Header */}
            <div 
              className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3"
              style={{ backgroundColor: BDSHOP_NAVY }}
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-bold text-sm md:text-lg">Top Deals</span>
                </div>
                {/* Stock indicator */}
                <div className="hidden sm:flex items-center gap-1.5 text-white/80 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>In Stock</span>
                </div>
              </div>
              <Link 
                to="/?sale=true"
                className="text-white text-xs md:text-sm font-medium flex items-center gap-1 hover:underline"
              >
                Show All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Products Scroll */}
            <div className="relative">
              <button
                onClick={() => scrollTopDeals('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-white/95 shadow-lg items-center justify-center hover:bg-white transition rounded-r-lg"
              >
                <ChevronLeft className="w-6 h-6" style={{ color: BDSHOP_TEXT }} />
              </button>
              
              <div 
                ref={topDealsRef}
                className="flex gap-2 md:gap-3 p-3 md:p-4 overflow-x-auto scrollbar-hide"
              >
                {topDealsProducts.map((product) => {
                  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="min-w-[140px] max-w-[140px] md:min-w-[160px] md:max-w-[160px] bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition group"
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
                            className="absolute top-2 left-2 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#EF4444' }}
                          >
                            {discount}% OFF
                          </span>
                        )}
                        {/* Stock badge */}
                        <span className="absolute bottom-2 left-2 text-white text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: BDSHOP_GREEN }}>
                          In Stock
                        </span>
                      </div>
                      <div className="p-2 md:p-3">
                        <p className="text-xs md:text-sm line-clamp-2 mb-1.5" style={{ color: BDSHOP_TEXT }}>
                          {product.title}
                        </p>
                        <p className="font-bold text-sm md:text-base" style={{ color: BDSHOP_NAVY }}>
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.compareAtPrice && (
                            <p className="text-[10px] md:text-xs line-through" style={{ color: BDSHOP_TEXT_LIGHT }}>
                              {formatPrice(product.compareAtPrice)}
                            </p>
                          )}
                          {discount > 0 && (
                            <span className="text-[10px] font-medium px-1 py-0.5 rounded" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
                              Save ৳{product.compareAtPrice! - product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={() => scrollTopDeals('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-white/95 shadow-lg items-center justify-center hover:bg-white transition rounded-l-lg"
              >
                <ChevronRight className="w-6 h-6" style={{ color: BDSHOP_TEXT }} />
              </button>
            </div>
          </section>
        )}

        {/* Specially for You - Product Grid */}
        <section className="mb-4 md:mb-6">
          <div className="bg-white rounded-t-lg shadow-sm">
            <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: BDSHOP_NAVY }} />
                <h2 className="font-bold text-base md:text-lg" style={{ color: BDSHOP_TEXT }}>
                  {currentCategory || 'Specially for You'}
                </h2>
              </div>
              {currentCategory && (
                <Link 
                  to="/"
                  className="text-xs md:text-sm hover:underline"
                  style={{ color: BDSHOP_NAVY }}
                >
                  View All
                </Link>
              )}
            </div>
            {/* Info bar */}
            <div className="flex items-center justify-center gap-4 py-2 text-[10px] md:text-xs border-b" style={{ backgroundColor: '#F9FAFB' }}>
              <span className="flex items-center gap-1">
                <span className="text-green-500">●</span> RealMainStock
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span> In Stock
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3" /> Fast Delivery
              </span>
            </div>
          </div>
          
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
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
                        
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <span 
                            className="absolute top-2 left-2 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#EF4444' }}
                          >
                            {discount}% OFF
                          </span>
                        )}
                        
                        {/* Stock Badge */}
                        <span 
                          className="absolute bottom-2 left-2 text-white text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{ backgroundColor: BDSHOP_GREEN }}
                        >
                          In Stock
                        </span>
                      </div>

                      <div className="p-2 md:p-3">
                        <h3 className="text-xs md:text-sm line-clamp-2 mb-1.5 min-h-[2rem] md:min-h-[2.5rem]" style={{ color: BDSHOP_TEXT }}>
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-bold text-sm md:text-base" style={{ color: BDSHOP_NAVY }}>
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-[10px] md:text-xs line-through" style={{ color: BDSHOP_TEXT_LIGHT }}>
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        {/* Save amount */}
                        {discount > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded inline-block" style={{ backgroundColor: '#DCFCE7', color: BDSHOP_GREEN }}>
                            Save ৳{product.compareAtPrice! - product.price}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Add to Cart */}
                    <div className="px-2 md:px-3 pb-2 md:pb-3">
                      <AddToCartButton
                        productId={product.id}
                        className="w-full py-2 rounded-lg text-xs md:text-sm font-medium text-white transition hover:opacity-90 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: BDSHOP_NAVY }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Order
                      </AddToCartButton>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-b-lg shadow-sm text-center py-12 md:py-16">
              <div 
                className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${BDSHOP_NAVY}10` }}
              >
                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10" style={{ color: BDSHOP_NAVY }} />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: BDSHOP_TEXT }}>No Products Found</h3>
              <p className="text-sm" style={{ color: BDSHOP_TEXT_LIGHT }}>Check back later for new arrivals</p>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-center mb-2" style={{ color: BDSHOP_TEXT }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xs md:text-sm text-center mb-4 md:mb-6" style={{ color: BDSHOP_TEXT_LIGHT }}>
            Everything you need to know about shopping at {storeName}
          </p>
          <div className="max-w-3xl mx-auto space-y-2 md:space-y-3">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-sm md:text-base pr-4" style={{ color: BDSHOP_TEXT }}>{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: BDSHOP_TEXT_LIGHT }} />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: BDSHOP_TEXT_LIGHT }} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4">
                    <p className="text-xs md:text-sm leading-relaxed" style={{ color: BDSHOP_TEXT_LIGHT }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_GREEN}15` }}
              >
                <Shield className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_GREEN }} />
              </div>
              <div>
                <p className="font-semibold text-xs md:text-sm" style={{ color: BDSHOP_TEXT }}>100% Genuine</p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_TEXT_LIGHT }}>Authentic products</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_NAVY}10` }}
              >
                <Truck className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_NAVY }} />
              </div>
              <div>
                <p className="font-semibold text-xs md:text-sm" style={{ color: BDSHOP_TEXT }}>Fast Delivery</p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_TEXT_LIGHT }}>Nationwide shipping</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_GREEN}15` }}
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_GREEN }} />
              </div>
              <div>
                <p className="font-semibold text-xs md:text-sm" style={{ color: BDSHOP_TEXT }}>Green Energy</p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_TEXT_LIGHT }}>Eco-friendly options</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BDSHOP_NAVY}10` }}
              >
                <Headphones className="w-5 h-5 md:w-6 md:h-6" style={{ color: BDSHOP_NAVY }} />
              </div>
              <div>
                <p className="font-semibold text-xs md:text-sm" style={{ color: BDSHOP_TEXT }}>Official Warranty</p>
                <p className="text-[10px] md:text-xs" style={{ color: BDSHOP_TEXT_LIGHT }}>Manufacturer support</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: BDSHOP_FOOTER_BG }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-12">
          {/* Logo and Description */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 mb-8 pb-8 border-b border-white/10">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-3">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-10 object-contain" />
                ) : (
                  <div className="h-10 w-10 rounded bg-white flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" style={{ color: BDSHOP_NAVY }} />
                  </div>
                )}
                <span className="text-white font-bold text-xl">{storeName}</span>
              </div>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                Your premier destination for quality electronics and gadgets. We deliver excellence in every product.
              </p>
              {businessInfo?.phone && (
                <div className="flex items-center gap-2 mt-3 text-white/80 text-sm">
                  <Phone className="w-4 h-4" />
                  {businessInfo.phone}
                </div>
              )}
              {businessInfo?.email && (
                <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                  <Mail className="w-4 h-4" />
                  {businessInfo.email}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 flex-1">
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold mb-3 text-sm">Quick Links</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li><Link to="/" className="text-white/70 hover:text-white transition">Home</Link></li>
                  <li><Link to="/shop" className="text-white/70 hover:text-white transition">Shop</Link></li>
                  <li><Link to="/offers" className="text-white/70 hover:text-white transition">Special Offers</Link></li>
                  <li><Link to="/about" className="text-white/70 hover:text-white transition">About Us</Link></li>
                  <li><Link to="/contact" className="text-white/70 hover:text-white transition">Contact</Link></li>
                  <li><Link to="/track" className="text-white/70 hover:text-white transition">Track Order</Link></li>
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-white font-bold mb-3 text-sm">Categories</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  {featuredCategories.slice(0, 6).map(cat => (
                    <li key={cat}>
                      <Link to={`?category=${encodeURIComponent(cat!)}`} className="text-white/70 hover:text-white transition">
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer Service */}
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-white font-bold mb-3 text-sm">Customer Service</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li><Link to="/faq" className="text-white/70 hover:text-white transition">FAQ</Link></li>
                  <li><Link to="/shipping" className="text-white/70 hover:text-white transition">Shipping Info</Link></li>
                  <li><Link to="/returns" className="text-white/70 hover:text-white transition">Returns & Refunds</Link></li>
                  <li><Link to="/privacy" className="text-white/70 hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-white/70 hover:text-white transition">Terms & Conditions</Link></li>
                  <li><Link to="/support" className="text-white/70 hover:text-white transition">Support Center</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Newsletter</h3>
              <p className="text-white/60 text-xs">Subscribe for exclusive deals & updates</p>
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
              <button 
                className="px-4 py-2 rounded-lg font-medium text-sm text-white transition hover:opacity-90"
                style={{ backgroundColor: BDSHOP_NAVY }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Social & Payment */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Follow Us</span>
              <div className="flex gap-2">
                {socialLinks?.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                     className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition">
                    <span className="text-xs font-bold">X</span>
                  </a>
                )}
                {socialLinks?.whatsapp && (
                  <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Secure Payment:</span>
              <div className="flex gap-1.5">
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">VISA</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">Mastercard</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">AMEX</span>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/80">PayPal</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-xs">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <HomeIcon className="w-5 h-5" style={{ color: !currentCategory ? BDSHOP_NAVY : BDSHOP_TEXT_LIGHT }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? BDSHOP_NAVY : BDSHOP_TEXT_LIGHT }}>Home</span>
          </Link>
          <button 
            onClick={() => setCategoryDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Categories</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: BDSHOP_ORANGE }}
            >
              0
            </span>
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Cart</span>
          </Link>
          <Link to={isPreview ? "#" : "/auth/login"} className="flex flex-col items-center gap-0.5 py-1 px-3">
            <UserCircle className="w-5 h-5" style={{ color: BDSHOP_TEXT_LIGHT }} />
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_TEXT_LIGHT }}>Account</span>
          </Link>
        </div>
      </nav>

      {/* Floating Contact Buttons */}
      {!isPreview && (
        <>
          {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
            <a
              href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `হ্যালো ${storeName}, আমি জানতে চাই...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
              title="WhatsApp এ মেসেজ করুন"
            >
              <MessageCircle className="w-7 h-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
              title="কল করুন"
            >
              <Phone className="w-7 h-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            </a>
          )}
        </>
      )}

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
