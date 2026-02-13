/**
 * NovaLux Premium Store Template
 *
 * World-class luxury ecommerce template inspired by Shopify Prestige,
 * Squarespace Fulton, and 2024 design trends.
 *
 * DUAL MODE ARCHITECTURE:
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import { useState, useCallback, createContext, useContext, useMemo, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { ShoppingBag, Search, Menu, X, Star, Check, Heart } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps, SerializedProduct, StoreCategory } from '~/templates/store-registry';
import type { ThemeConfig } from '@db/types';
import type { SectionInstance } from '~/lib/theme-engine/types';
import { AddToCartButton } from '~/components/AddToCartButton';
import { SECTION_REGISTRY, DEFAULT_SECTIONS, type StoreSection } from '~/components/store-sections/registry';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { formatPrice } from '~/lib/theme-engine';
import { getHeroBehavior } from '~/lib/hero-slides';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import {
  buildProxyImageUrl,
  generateProxySrcset,
  generateSrcset,
  optimizeUnsplashUrl,
} from '~/utils/imageOptimization';

import { NOVALUX_THEME } from './theme';
import { NovaLuxHeader } from './sections/Header';
import { NovaLuxFooter } from './sections/Footer';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
  getRelatedProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';

// Import shared Shopify-standard components
import SharedProductPage from '../shared/ProductPage';
import SharedCartPage from '../shared/CartPage';
import SharedCheckoutPage from '../shared/CheckoutPage';
import type { StoreTemplateTheme } from '~/templates/store-registry';

// Theme adapter for shared components
const NOVALUX_THEME_FOR_SHARED: StoreTemplateTheme = {
  primary: NOVALUX_THEME.primary,
  accent: NOVALUX_THEME.accent,
  background: NOVALUX_THEME.background,
  text: NOVALUX_THEME.text,
  muted: NOVALUX_THEME.muted,
  cardBg: NOVALUX_THEME.cardBg,
  headerBg: NOVALUX_THEME.headerBgSolid,
  footerBg: NOVALUX_THEME.footerBg,
  footerText: NOVALUX_THEME.footerText,
};

// Custom Default Sections for Nova Lux (Removed Banner, Rich Text, Newsletter)
const NOVA_LUX_DEFAULT_SECTIONS = DEFAULT_SECTIONS.filter(
  (section) => !['banner', 'rich-text', 'newsletter'].includes(section.type)
);

const DEDUPE_SECTION_TYPES = new Set(['hero', 'features']);

function dedupeSectionsByType(sections: SectionInstance[]) {
  const seen = new Set<string>();
  const deduped: SectionInstance[] = [];

  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const section = sections[index];
    if (DEDUPE_SECTION_TYPES.has(section.type)) {
      if (seen.has(section.type)) {
        continue;
      }
      seen.add(section.type);
    }
    deduped.push(section);
  }

  return deduped.reverse();
}

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
// --- Header ---
function PreviewHeader({
  storeName,
  logo,
  categories,
  onNavigate,
}: {
  storeName: string;
  logo?: string | null;
  categories: (string | StoreCategory | null)[];
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    text: NOVALUX_THEME.text,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ type: 'search', query: searchQuery.trim() });
      setMobileMenuOpen(false);
    }
  };

  const validCategories = categories.filter(Boolean);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? NOVALUX_THEME.headerBgSolid : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        boxShadow: isScrolled ? NOVALUX_THEME.headerShadow : 'none',
        borderBottom: isScrolled ? `1px solid ${NOVALUX_THEME.border}` : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: theme.primary }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: theme.primary }} />
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
              style={{ color: theme.text }}
            >
              {t('allProducts')}
            </button>
            {validCategories.slice(0, 3).map((cat) => {
              const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
              return (
                <button
                  key={title}
                  onClick={() => onNavigate({ type: 'category', category: title })}
                  className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                  style={{ color: theme.text }}
                >
                  {title}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center justify-center gap-3"
          >
            {logo && (
              <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
            )}
            <span
              className="text-2xl lg:text-3xl font-semibold tracking-wider"
              style={{ fontFamily: NOVALUX_THEME.fontHeading, color: theme.primary }}
            >
              {storeName}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-3 pr-8 py-1 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-rose-300"
                />
                <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
            </div>
            <button
              onClick={() => onNavigate({ type: 'cart' })}
              className="p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100 relative"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: theme.text }} />
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: NOVALUX_THEME.accentGradient, color: theme.primary }}
              >
                {cart.itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b shadow-lg p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </form>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium"
            >
              All Products
            </button>
            {validCategories.map((cat) => {
              const title = typeof cat === 'object' && cat !== null ? (cat as StoreCategory).title : (cat as string);
              return (
                <button
                  key={title}
                  onClick={() => {
                    onNavigate({ type: 'category', category: title });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2"
                >
                  {title}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
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
  const [isHovered, setIsHovered] = useState(false);
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer"
      style={{
        boxShadow: isHovered ? NOVALUX_THEME.cardShadowHover : NOVALUX_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span>✨</span>
          </div>
        )}

        {isSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{ background: NOVALUX_THEME.accentGradient, color: NOVALUX_THEME.primary }}
          >
            -{discount}% OFF
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              cart.addItem(product);
            }}
            className="w-full px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.95)', color: NOVALUX_THEME.primary }}
          >
            Quick Add
          </button>
        </div>
      </div>

      <div className="p-5">
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: NOVALUX_THEME.accent }}
          >
            {product.category}
          </span>
        )}
        <h3
          className="font-medium mt-2 mb-3 line-clamp-2"
          style={{ fontFamily: NOVALUX_THEME.fontHeading, fontSize: '1.125rem' }}
        >
          {product.title}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={{ color: NOVALUX_THEME.accent, fill: i < 4 ? NOVALUX_THEME.accent : 'none' }}
            />
          ))}
        </div>
        <div className="text-lg font-bold" style={{ color: NOVALUX_THEME.primary }}>
          {formatPrice(product.price, currency)}
          {isSale && (
            <span className="text-xs line-through ml-2 text-gray-400">
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Home Page ---
function PreviewHomePage({
  storeName: _storeName,
  products,
  categories: _categories,
  currency,
  config,
  onNavigate,
}: {
  storeName: string;
  products: DemoProduct[];
  categories: (string | null)[];
  currency: string;
  config: ThemeConfig | null;
  onNavigate: (page: PageType) => void;
}) {
  const heroBehavior = getHeroBehavior(config);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlide = heroBehavior.slides[heroIndex];
  const heroImage = heroSlide?.imageUrl || config?.bannerUrl || '';
  const heroHeading = heroSlide?.heading || config?.bannerText || 'Redefining Luxury';
  const heroSubheading = heroSlide?.subheading || 'Discover our exclusive collection.';
  const heroCta = heroSlide?.ctaText || 'Shop Now';
  const isUnsplashHero = heroImage.includes('unsplash.com');
  const heroSrc = isUnsplashHero
    ? optimizeUnsplashUrl(heroImage, { width: 1800, height: 1000, quality: 80, format: 'webp' })
    : buildProxyImageUrl(heroImage, { width: 1800, height: 1000, quality: 78 });
  const heroSrcSet =
    heroImage && isUnsplashHero
      ? generateSrcset(heroImage, [640, 960, 1280, 1600, 1800])
      : generateProxySrcset(heroImage, [640, 960, 1280, 1600, 1800], 78);

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBehavior.slides.length);
    }, heroBehavior.delayMs);
    return () => clearInterval(timer);
  }, [
    heroBehavior.autoplay,
    heroBehavior.delayMs,
    heroBehavior.isCarousel,
    heroBehavior.slides.length,
  ]);

  useEffect(() => {
    if (heroIndex >= heroBehavior.slides.length) {
      setHeroIndex(0);
    }
  }, [heroBehavior.slides.length, heroIndex]);

  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    background: NOVALUX_THEME.background,
    text: NOVALUX_THEME.text,
    muted: NOVALUX_THEME.muted,
    cardBg: NOVALUX_THEME.cardBg,
  };

  return (
    <div className="min-h-screen">
      {/* Render sections from NOVA_LUX_DEFAULT_SECTIONS */}
      {NOVA_LUX_DEFAULT_SECTIONS.map((section: StoreSection) => {
        const SectionComponent = SECTION_REGISTRY[section.type]?.component;
        if (!SectionComponent) return null;

        return (
          <SectionComponent
            key={section.id}
            settings={section.settings}
            theme={THEME}
            products={products}
            categories={_categories}
            storeId={0}
            currency={currency}
            store={{
              name: _storeName,
              currency: currency,
            }}
            ProductCardComponent={PreviewProductCard}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW STORE CONTAINER
// ============================================================================
function PreviewNovaLuxStore(props: StoreTemplateProps) {
  const { storeName, storeId, logo, config, currency } = props;
  const [currentPage, setCurrentPage] = useState<PageType>({ type: 'home' });

  const navigate = useCallback((page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Path-based navigation for shared components
  const navigateByPath = useCallback(
    (path: string) => {
      if (path === '/' || path === '') {
        navigate({ type: 'home' });
      } else if (path.startsWith('/products/')) {
        const productId = parseInt(path.replace('/products/', ''), 10);
        if (!isNaN(productId)) {
          navigate({ type: 'product', productId });
        }
      } else if (path === '/cart') {
        navigate({ type: 'cart' });
      } else if (path === '/checkout') {
        navigate({ type: 'checkout' });
      } else if (path.startsWith('/category/') || path.startsWith('/collections/')) {
        const category = path.replace(/^\/(category|collections)\//, '');
        navigate({ type: 'category', category });
      } else {
        // Default to home for unknown paths
        navigate({ type: 'home' });
      }
    },
    [navigate]
  );

  const products = DEMO_PRODUCTS;
  const validCategories = DEMO_CATEGORIES;

  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <PreviewHomePage
            storeName={storeName}
            products={products}
            categories={validCategories}
            currency={currency}
            config={config}
            onNavigate={navigate}
          />
        );
      case 'product': {
        const product = getDemoProductById(currentPage.productId);
        const relatedProducts = getRelatedProducts(currentPage.productId, 4);
        if (!product) return <div className="pt-32 text-center">Product not found</div>;
        return (
          <div className="pt-20">
            <SharedProductPage
              product={{
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                imageUrl: product.imageUrl,
                category: product.category,
                stock: 99, // Demo always in stock
              }}
              currency={currency}
              relatedProducts={relatedProducts.map((p) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                compareAtPrice: p.compareAtPrice,
                imageUrl: p.imageUrl,
                category: p.category,
              }))}
              theme={NOVALUX_THEME_FOR_SHARED}
              isPreview={true}
              templateId="nova-lux"
              onNavigate={navigateByPath}
            />
          </div>
        );
      }
      case 'cart':
        return (
          <div className="pt-20">
            <SharedCartPage
              theme={NOVALUX_THEME_FOR_SHARED}
              isPreview={true}
              templateId="nova-lux"
              onNavigate={navigateByPath}
              recommendedProducts={DEMO_PRODUCTS.slice(0, 4).map((p) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                imageUrl: p.imageUrl,
              }))}
            />
          </div>
        );
      case 'checkout':
        return (
          <div className="pt-20">
            <SharedCheckoutPage
              theme={NOVALUX_THEME_FOR_SHARED}
              isPreview={true}
              templateId="nova-lux"
              onNavigate={navigateByPath}
              storeId={storeId}
            />
          </div>
        );
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <h1 className="text-4xl font-serif mb-12 text-center">{currentPage.category}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {filtered.map((p) => (
                <PreviewProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  onNavigate={navigate}
                />
              ))}
            </div>
          </div>
        );
      }
      case 'order-success':
        return (
          <div className="min-h-[60vh] flex items-center justify-center pt-20 flex-col">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Check />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed</h2>
            <button
              onClick={() => navigate({ type: 'home' })}
              className="mt-4 border-b border-black"
            >
              Continue Shopping
            </button>
          </div>
        );
      case 'search':
        return <div className="pt-32 text-center">Search results for: {currentPage.query}</div>;
      default:
        return null;
    }
  };

  return (
    <CartProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: NOVALUX_THEME.background, fontFamily: NOVALUX_THEME.fontBody }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <PreviewHeader
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />
        <main>{renderPage()}</main>
        <NovaLuxFooter
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          isPreview={true}
        />
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Preserved)
// ============================================================================
function LiveNovaLuxHomepage({
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
  isPreview,
  aiCredits,
  isCustomerAiEnabled,
  customer,
}: StoreTemplateProps) {
  useEffect(() => {
    // Scroll listener removed as isScrolled was unused
  }, []);

  const validCategories = categories.filter(Boolean);
  const announcement = config?.announcement;

  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    accentHover: NOVALUX_THEME.accentHover,
    accentLight: NOVALUX_THEME.accentLight,
    background: NOVALUX_THEME.background,
    text: NOVALUX_THEME.text,
    muted: NOVALUX_THEME.muted,
    cardBg: NOVALUX_THEME.cardBg,
    headerBg: NOVALUX_THEME.headerBgSolid,
    footerBg: NOVALUX_THEME.footerBg,
    footerText: NOVALUX_THEME.footerText,
  };

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: THEME.background,
                fontFamily: NOVALUX_THEME.fontBody,
              }}
            >
              <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
                rel="stylesheet"
              />

              <NovaLuxHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                config={config}
                customer={customer}
              />

              {/* Only show spacer if first section is NOT a hero */}
              {!(
                config?.sections?.[0]?.type &&
                ['hero', 'modern-hero', 'zenith-hero', 'turbo-hero', 'video', 'banner'].includes(
                  config.sections[0].type
                )
              ) && (
                <div
                  className={`${announcement?.text ? 'h-[104px] lg:h-[120px]' : 'h-[66px] lg:h-[82px]'}`}
                />
              )}

              {(config?.sections?.length
                ? dedupeSectionsByType(config.sections)
                : NOVA_LUX_DEFAULT_SECTIONS
              ).map((section: SectionInstance) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) return null;

                  const resolvedSettings =
                    section.type === 'category-list' || section.type === 'shop-by-category'
                      ? {
                          ...section.settings,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          categoryImageMap: ((config as any)?.categoryImageMap || {}) as Record<
                            string,
                            string
                          >,
                        }
                      : section.settings;

                  return (
                    <SectionComponent
                      key={section.id}
                      settings={resolvedSettings}
                      theme={THEME}
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
                      ProductCardComponent={NovaLuxProductCard}
                    />
                  );
                }
              )}

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
                  storeId={storeId}
                  accentColor={config?.primaryColor || NOVALUX_THEME.accent}
                />
              )}

              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>

              <NovaLuxFooter
                storeName={storeName}
                logo={logo}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                categories={validCategories}
              />
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// NOVALUX PRODUCT CARD COMPONENT (Live)
// ============================================================================
interface NovaLuxProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

function NovaLuxProductCard({ product, storeId, formatPrice, isPreview }: NovaLuxProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const {
    price,
    compareAtPrice: displayCompareAt,
    isFlashSale,
    isOnSale,
    discountPercentage,
  } = useProductPrice(product);

  const THEME = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    text: NOVALUX_THEME.text,
    muted: NOVALUX_THEME.muted,
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        boxShadow: isHovered ? NOVALUX_THEME.cardShadowHover : NOVALUX_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: NOVALUX_THEME.backgroundAlt }}
          >
            <span className="text-6xl">✨</span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)' }}
        />

        {isOnSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: isFlashSale ? '#EF4444' : NOVALUX_THEME.accentGradient,
              color: isFlashSale ? 'white' : THEME.primary,
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}
            {discountPercentage}% OFF
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Heart
            className="w-5 h-5 transition-all duration-300"
            style={{
              color: isLiked ? '#ef4444' : THEME.muted,
              fill: isLiked ? '#ef4444' : 'none',
            }}
          />
        </button>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productPrice={price}
            productName={product.title}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: THEME.primary,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            isPreview={isPreview}
          >
            Quick Add
          </AddToCartButton>
        </div>
      </Link>

      <div className="p-5">
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: THEME.accent }}
          >
            {product.category}
          </span>
        )}

        <Link to={`/product/${product.id}`}>
          <h3
            className="font-medium mt-2 mb-3 line-clamp-2 transition-colors duration-300 hover:opacity-70"
            style={{
              fontFamily: NOVALUX_THEME.fontHeading,
              color: THEME.text,
              fontSize: '1.125rem',
              lineHeight: '1.4',
            }}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={{
                color: THEME.accent,
                fill: i < 4 ? THEME.accent : 'none',
              }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: THEME.muted }}>
            (24)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold" style={{ color: THEME.primary }}>
              {formatPrice(price)}
            </span>
            {isOnSale && displayCompareAt && (
              <span className="block text-xs line-through mt-0.5" style={{ color: THEME.muted }}>
                {formatPrice(displayCompareAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function NovaLuxTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewNovaLuxStore {...props} />;
  }
  return <LiveNovaLuxHomepage {...props} />;
}

export default NovaLuxTemplate;
