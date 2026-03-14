/**
 * Tech Modern Store Template
 *
 * Clean, bold design for electronics & tech products.
 * Features: Slate + Blue accents, modern typography, gradient backgrounds.
 *
 * DUAL MODE ARCHITECTURE:
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { useCartCount } from '~/hooks/useCartCount';
import { useProductPrice } from '~/hooks/useProductPrice';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';

import { useState, useCallback, createContext, useContext, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Zap,
  ChevronRight,
  ArrowRight,
  User,
  Heart,
  Star,
  Shield,
  Check,
} from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { getHeroBehavior } from '~/lib/hero-slides';
import { formatPrice } from '~/lib/formatting';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl, generateProxySrcset, optimizeUnsplashUrl } from '~/utils/imageOptimization';

import { TECH_MODERN_THEME } from './theme';
import { TechModernHeader } from './sections/Header';
import { TechModernFooter } from './sections/Footer';
import { TechModernProductPage } from './pages/ProductPage';
import { TechCartPage } from './pages/CartPage';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
  getRelatedProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';

// ============================================================================
// TYPES
// ============================================================================
type PageType =
  | { type: 'home' }
  | { type: 'product'; productId: number }
  | { type: 'category'; category: string }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'order-success' }
  | { type: 'search'; query: string };

// ============================================================================
// CART CONTEXT FOR PREVIEW MODE
// ============================================================================
interface CartItem {
  id: number;
  title: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: DemoProduct | SerializedProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

function usePreviewCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('usePreviewCart must be used within CartProvider');
  return context;
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: DemoProduct | SerializedProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title ?? '',
          price: product.price ?? 0,
          compareAtPrice: product.compareAtPrice ?? null,
          imageUrl: product.imageUrl ?? null,
          category: product.category ?? null,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// PREVIEW COMPONENTS
// ============================================================================

// --- Header ---
function PreviewHeader({
  storeName,
  logo,
  categories,
  onNavigate,
}: {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = TECH_MODERN_THEME;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ type: 'search', query: searchQuery.trim() });
      setMobileMenuOpen(false);
    }
  };

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{ backgroundColor: theme.headerBg, borderColor: '#e2e8f0' }}
    >
      <div
        className="text-center py-2 text-sm font-medium hidden md:block"
        style={{ backgroundColor: theme.accent, color: 'white' }}
      >
        <Zap className="inline w-4 h-4 mr-2" />
        Welcome to {storeName} - Premium Tech Gadgets
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center flex-shrink-0"
          >
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 lg:h-10 object-contain" />
            ) : (
              <span
                className="text-xl lg:text-2xl font-bold flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                {storeName}
              </span>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: theme.text }}
            >
              All Products
            </button>
            {validCategories.slice(0, 5).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                style={{ color: theme.text }}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </form>
          </div>

          <button
            onClick={() => onNavigate({ type: 'cart' })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cart.itemCount}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white absolute w-full left-0 shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </form>
          </div>
          <nav className="py-2">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-3 font-medium"
              style={{ color: theme.text }}
            >
              All Products
              <ChevronRight className="w-5 h-5" />
            </button>
            {validCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onNavigate({ type: 'category', category });
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3 font-medium"
                style={{ color: theme.text }}
              >
                {category}
                <ChevronRight className="w-5 h-5" />
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// --- Product Page Wrapper ---
function PreviewProductDetailPage({
  productId,
  currency,
  onNavigate,
}: {
  productId: number;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const product = getDemoProductById(productId);
  const relatedProducts = getRelatedProducts(productId, 4);

  if (!product) return <div>Product not found</div>;

  // Convert DemoProduct to SerializedProduct for the component
  const serializedProduct: SerializedProduct = {
    id: product.id,
    storeId: 0,
    name: product.title,
    title: product.title,
    description: product.description || '',
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    imageUrl: product.imageUrl,
    category: product.category,
  };

  const serializedRelated = relatedProducts.map((p) => ({
    id: p.id,
    storeId: 0,
    name: p.title,
    title: p.title,
    description: p.description || '',
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.imageUrl,
    category: p.category,
  }));

  return (
    <TechModernProductPage
      product={serializedProduct}
      currency={currency}
      relatedProducts={serializedRelated}
      isPreview={true}
      onNavigate={(path) => {
        if (path === '/') onNavigate({ type: 'home' });
        if (path === '/products') onNavigate({ type: 'home' }); // or search/all
      }}
      onNavigateProduct={(id) => onNavigate({ type: 'product', productId: id })}
    />
  );
}

// --- Cart Page Wrapper ---
function PreviewCartPageComponent({
  onNavigate,
}: {
  onNavigate: (page: PageType) => void;
}) {
  return <TechCartPage isPreview={true} onCheckout={() => onNavigate({ type: 'checkout' })} />;
}

// --- Checkout Page ---
function PreviewCheckoutPage({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cart.clearCart();
    onNavigate({ type: 'order-success' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <span className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center text-sm">
            2
          </span>
          Checkout
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6"
        >
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Shipping Details</h3>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Address"
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-xl font-bold mb-6">
              <span>Total Amount</span>
              <span className="text-blue-600">{formatPrice(cart.total, currency)}</span>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors"
            >
              Place Order (Demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Product Card ---
function PreviewProductCard({
  product,
  currency,
  onNavigate,
}: {
  product: DemoProduct;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const theme = TECH_MODERN_THEME;
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <div
      className="group bg-white rounded-2xl border-2 border-transparent overflow-hidden transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
        )}

        {isSale && (
          <span className="absolute top-2 left-2 px-2 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded bg-cyan-500 text-black">
            -{discount}%
          </span>
        )}

        <button className="absolute top-2 right-2 p-2 rounded-full transition-colors bg-black/50 text-white hover:bg-cyan-500 hover:text-black opacity-0 group-hover:opacity-100">
          <Heart size={16} />
        </button>
      </div>

      <div className="p-3 md:p-5">
        {product.category && (
          <span
            className="text-[10px] md:text-xs font-medium uppercase tracking-wider"
            style={{ color: theme.accent }}
          >
            {product.category}
          </span>
        )}

        <h3
          className="font-semibold mt-1 mb-2 line-clamp-2 text-sm md:text-base hover:text-blue-600 transition-colors"
          style={{ color: theme.text }}
        >
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mb-2 md:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-xs md:text-sm ml-1" style={{ color: theme.muted }}>
            (24)
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base md:text-xl font-bold" style={{ color: theme.primary }}>
              {formatPrice(product.price, currency)}
            </span>
            {isSale && (
              <span className="text-xs md:text-sm line-through" style={{ color: theme.muted }}>
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              cart.addItem(product);
            }}
            className="p-2 md:p-3 rounded-xl transition-all hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Home Page ---
function PreviewHomePage({
  storeName,
  products,
  categories,
  currency,
  config,
  onNavigate,
}: {
  storeName: string;
  products: DemoProduct[];
  categories: (string | null)[];
  currency: string;
  config: any;
  onNavigate: (page: PageType) => void;
}) {
  const theme = TECH_MODERN_THEME;
  const heroBehavior = getHeroBehavior(config);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlide = heroBehavior.slides[heroIndex];
  const heroImage =
    heroSlide?.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80';
  const heroBgUrl = heroImage.includes('unsplash.com')
    ? optimizeUnsplashUrl(heroImage, { width: 1600, height: 900, quality: 80, format: 'webp' })
    : buildProxyImageUrl(heroImage, { width: 1600, height: 900, quality: 78 });
  const heroHeading = heroSlide?.heading || config?.bannerText || `Next-Gen Tech from ${storeName}`;
  const heroSubheading =
    heroSlide?.subheading || 'Discover the latest innovations. Premium quality, unbeatable prices.';
  const heroCta = heroSlide?.ctaText || 'Shop Now';

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBehavior.slides.length);
    }, heroBehavior.delayMs);
    return () => clearInterval(timer);
  }, [heroBehavior.autoplay, heroBehavior.delayMs, heroBehavior.isCarousel, heroBehavior.slides.length]);

  useEffect(() => {
    if (heroIndex >= heroBehavior.slides.length) {
      setHeroIndex(0);
    }
  }, [heroBehavior.slides.length, heroIndex]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f172a] text-white py-20 lg:py-32">
        <div
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBgUrl})` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center lg:text-left lg:flex items-center gap-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              {heroHeading}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
              {heroSubheading}
            </p>
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              {heroCta} <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: <Zap />, title: 'Fast Delivery', desc: '24-48 hour delivery nationwide.' },
            {
              icon: <Check />,
              title: 'Verified Gadgets',
              desc: 'Every product is quality checked.',
            },
            {
              icon: <Shield />,
              title: 'Secure Checkout',
              desc: 'Multiple payment options available.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Latest Arrivals
            </h2>
            <p className="text-gray-500 text-lg">
              Explore our newest collection of premium gadgets.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <PreviewProductCard
                key={product.id}
                product={product}
                currency={currency}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW STORE CONTAINER
// ============================================================================
function PreviewTechModernStore(props: StoreTemplateProps) {
  const { storeName, logo, categories, config, currency, businessInfo, socialLinks, footerConfig } =
    props;
  const [currentPage, setCurrentPage] = useState<PageType>({ type: 'home' });

  const navigate = useCallback((page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const products = DEMO_PRODUCTS;
  const validCategories = DEMO_CATEGORIES;

  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <PreviewHomePage
            storeName={storeName ?? ''}
            products={products}
            categories={validCategories}
            currency={currency ?? ''}
            config={config}
            onNavigate={navigate}
          />
        );
      case 'product':
        return (
          <PreviewProductDetailPage
            productId={currentPage.productId}
            currency={currency ?? ''}
            onNavigate={navigate}
          />
        );
      case 'cart':
        return <PreviewCartPageComponent onNavigate={navigate} />;
      case 'checkout':
        return <PreviewCheckoutPage currency={currency ?? ''} onNavigate={navigate} />;
      case 'search':
        return <div className="p-20 text-center">Search results for {currentPage.query}</div>;
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="py-16 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-3xl font-bold mb-8">{currentPage.category}</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {filtered.map((product) => (
                  <PreviewProductCard
                    key={product.id}
                    product={product}
                    currency={currency ?? ''}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'order-success':
        return (
          <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
              <p className="text-gray-500 mb-6">
                Thank you for shopping with {storeName}. This is a demo order.
              </p>
              <button
                onClick={() => navigate({ type: 'home' })}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        );
      default:
        return (
          <PreviewHomePage
            storeName={storeName ?? ''}
            products={products}
            categories={validCategories}
            currency={currency ?? ''}
            config={config}
            onNavigate={navigate}
          />
        );
    }
  };

  return (
    <CartProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: TECH_MODERN_THEME.background, fontFamily: "'Inter', sans-serif" }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <PreviewHeader
          storeName={storeName ?? ''}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />
        <main>{renderPage()}</main>
        <TechModernFooter
          storeName={storeName ?? ''}
          logo={logo}
          categories={validCategories}
          businessInfo={businessInfo ? {
            phone: businessInfo.phone ?? undefined,
            email: businessInfo.email ?? undefined,
            address: businessInfo.address ?? undefined,
          } : undefined}
          socialLinks={socialLinks ? {
            facebook: socialLinks.facebook ?? undefined,
            instagram: socialLinks.instagram ?? undefined,
            whatsapp: socialLinks.whatsapp ?? undefined,
            twitter: socialLinks.twitter ?? undefined,
            youtube: socialLinks.youtube ?? undefined,
            linkedin: socialLinks.linkedin ?? undefined,
          } : undefined}
          footerConfig={footerConfig}
          isPreview={true}
        />
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Preserved Original Logic)
// ============================================================================
function LiveTechModernHomepage({
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
  planType = 'free',
  isPreview,
  aiCredits,
  isCustomerAiEnabled,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  const count = useCartCount();
  const heroBehavior = getHeroBehavior(config);
  const primaryHeroSlide = heroBehavior.slides[0];

  const validCategories = (categories || []).filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: TECH_MODERN_THEME.background,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
              />

              <TechModernHeader
                storeName={storeName ?? ''}
                logo={logo}
                categories={validCategories}
                currentCategory={currentCategory}
                config={config}
                count={count}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {/* Dynamic Sections */}
              {(
                config?.sections?.length
                  ? config.sections
                  : [
                  {
                    id: 'hero',
                    type: 'hero',
                    settings: {
                      heading:
                        primaryHeroSlide?.heading || config?.bannerText || `Next-Gen Tech from ${storeName}`,
                      subheading:
                        primaryHeroSlide?.subheading ||
                        'Discover the latest innovations. Premium quality, unbeatable prices.',
                      primaryAction: { label: t('buyNow'), url: '/#products' },
                      secondaryAction: { label: 'Browse Categories', url: '/#categories' },
                      image: primaryHeroSlide?.imageUrl || config?.bannerUrl,
                      layout: 'standard',
                      alignment: 'left',
                    },
                  },
                  {
                    id: 'features',
                    type: 'modern-features',
                    settings: {
                      heading: 'Why Tech Lovers Choose Us',
                      subheading: 'Fast delivery, verified gadgets, and trusted support.',
                      features: [
                        {
                          icon: '⚡',
                          title: 'Fast Delivery',
                          description: '24-48 hour delivery nationwide.',
                        },
                        {
                          icon: '✅',
                          title: 'Verified Gadgets',
                          description: 'Every product is quality checked.',
                        },
                        {
                          icon: '🔒',
                          title: 'Secure Checkout',
                          description: 'Multiple payment options available.',
                        },
                      ],
                    },
                  },
                  {
                    id: 'categories',
                    type: 'category-list',
                    settings: {
                      layout: 'tabs',
                      limit: 10,
                    },
                  },
                  {
                    id: 'scroll',
                    type: 'product-scroll',
                    settings: {
                      heading: 'Top Deals',
                      limit: 10,
                      mode: 'default',
                    },
                  },
                  {
                    id: 'products',
                    type: 'product-grid',
                    settings: {
                      heading: currentCategory || 'All Products',
                      productCount: 12,
                      paddingTop: 'large',
                      paddingBottom: 'large',
                    },
                  },
                  {
                    id: 'faq',
                    type: 'faq',
                    settings: {
                      heading: 'Tech Store FAQs',
                      faqs: [
                        {
                          question: 'Do you offer warranty?',
                          answer: 'Yes, most products include brand warranty.',
                        },
                        {
                          question: 'Can I pay with mobile wallets?',
                          answer: 'We accept mobile payments and cards.',
                        },
                        {
                          question: 'How fast is delivery?',
                          answer: 'Delivery takes 2-4 business days.',
                        },
                      ],
                    },
                  },
                  {
                    id: 'newsletter',
                    type: 'newsletter',
                    settings: {
                      heading: 'Get Tech Deals First',
                      subheading: 'Subscribe for launches, offers, and tips.',
                      alignment: 'center',
                    },
                  },
                ]
              ).map((section: any) => {
                const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                if (!SectionComponent) return null;

                return (
                  <SectionComponent
                    key={section.id}
                    settings={section.settings}
                    theme={TECH_MODERN_THEME}
                    products={products}
                    categories={categories}
                    storeId={storeId}
                    currency={currency}
                    store={{
                      name: storeName,
                      email: businessInfo?.email,
                      phone: businessInfo?.phone,
                      address: businessInfo?.address,
                      currency: currency,
                    }}
                    ProductCardComponent={
                      section.type === 'product-grid' ? TechProductCard : undefined
                    }
                  />
                );
              })}

              <TechModernFooter
                storeName={storeName ?? ''}
                footerConfig={footerConfig}
                businessInfo={businessInfo ? {
                  phone: businessInfo.phone ?? undefined,
                  email: businessInfo.email ?? undefined,
                  address: businessInfo.address ?? undefined,
                } : undefined}
                socialLinks={socialLinks ? {
                  facebook: socialLinks.facebook ?? undefined,
                  instagram: socialLinks.instagram ?? undefined,
                  whatsapp: socialLinks.whatsapp ?? undefined,
                  twitter: socialLinks.twitter ?? undefined,
                  youtube: socialLinks.youtube ?? undefined,
                  linkedin: socialLinks.linkedin ?? undefined,
                } : undefined}
                planType={planType}
                categories={validCategories}
              />

              {/* Mobile Bottom Navigation */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="flex items-center justify-around h-14">
                  <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
                    <ArrowRight
                      className="w-5 h-5"
                      style={{
                        color: !currentCategory
                          ? TECH_MODERN_THEME.accent
                          : TECH_MODERN_THEME.muted,
                      }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: !currentCategory
                          ? TECH_MODERN_THEME.accent
                          : TECH_MODERN_THEME.muted,
                      }}
                    >
                      Home
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <ArrowRight className="w-5 h-5" style={{ color: TECH_MODERN_THEME.muted }} />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: TECH_MODERN_THEME.muted }}
                    >
                      Categories
                    </span>
                  </button>
                  <Link
                    to="/cart"
                    className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                  >
                    <ShoppingCart className="w-5 h-5" style={{ color: TECH_MODERN_THEME.muted }} />
                    <span
                      className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: TECH_MODERN_THEME.accent }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: TECH_MODERN_THEME.muted }}
                    >
                      Cart
                    </span>
                  </Link>
                  {!isPreview && (
                    <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
                      <User className="w-5 h-5" style={{ color: TECH_MODERN_THEME.muted }} />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: TECH_MODERN_THEME.muted }}
                      >
                        Account
                      </span>
                    </Link>
                  )}
                </div>
              </nav>

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
                  aiEnabled={isCustomerAiEnabled}
                  aiCredits={aiCredits}
                  storeId={storeId ? parseInt(storeId, 10) : undefined}
                  accentColor={config?.primaryColor || TECH_MODERN_THEME.accent}
                />
              )}
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// TECH PRODUCT CARD COMPONENT (For Live Mode)
// ============================================================================
function TechProductCard({
  product,
  storeId,
  formatPrice,
  isPreview,
}: {
  product: any;
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const {
    price,
    compareAtPrice: displayCompareAt,
    isFlashSale,
    isOnSale,
    discountPercentage,
  } = useProductPrice(product);

  return (
    <div className="group bg-white rounded-2xl border-2 border-transparent overflow-hidden transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10">
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-square bg-gray-50 overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
        )}

        {isOnSale && (
          <span
            className={`absolute top-2 left-2 px-2 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded ${isFlashSale ? 'bg-red-500 text-white' : 'bg-cyan-500 text-black'}`}
          >
            {isFlashSale ? 'Flash Sale' : `-${discountPercentage}%`}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isLiked
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'bg-black/50 text-white hover:bg-cyan-500 hover:text-black'
          }`}
        >
          <Heart size={16} className={isLiked ? 'fill-current' : ''} />
        </button>
      </Link>

      <div className="p-3 md:p-5">
        {product.category && (
          <span
            className="text-[10px] md:text-xs font-medium uppercase tracking-wider"
            style={{ color: TECH_MODERN_THEME.accent }}
          >
            {product.category}
          </span>
        )}

        <Link to={`/product/${product.id}`}>
          <h3
            className="font-semibold mt-1 mb-2 line-clamp-2 text-sm md:text-base hover:text-blue-600 transition-colors"
            style={{ color: TECH_MODERN_THEME.text }}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2 md:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-xs md:text-sm ml-1" style={{ color: TECH_MODERN_THEME.muted }}>
            (24)
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span
              className="text-base md:text-xl font-bold"
              style={{ color: TECH_MODERN_THEME.primary }}
            >
              {formatPrice(price)}
            </span>
            {isOnSale && displayCompareAt && (
              <span
                className="text-xs md:text-sm line-through"
                style={{ color: TECH_MODERN_THEME.muted }}
              >
                {formatPrice(displayCompareAt)}
              </span>
            )}
          </div>

          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productPrice={price}
            productName={product.title}
            className="p-2 md:p-3 rounded-xl transition-all hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: TECH_MODERN_THEME.accent, color: 'white' }}
            isPreview={isPreview}
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT - Routes to Preview or Live mode
// ============================================================================
export function TechModernTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewTechModernStore {...props} />;
  }
  return <LiveTechModernHomepage {...props} />;
}

export default TechModernTemplate;
