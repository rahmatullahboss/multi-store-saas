/**
 * AuroraMinimal Premium Store Template (2025 Edition)
 *
 * Ultra-premium minimalist ecommerce template featuring:
 * - Warm Rose + Cool Sage split-tone gradients
 * - Glassmorphism header with scroll effects
 * - Elegant product cards with hover animations
 * - Mobile-first responsive design
 * - Full AI compatibility (per TEMPLATE_BUILDING_GUIDE.md)
 *
 * DUAL MODE ARCHITECTURE:
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import { useState, useCallback, createContext, useContext, useMemo, useEffect } from 'react';
import { Link } from '@remix-run/react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Heart,
  ChevronRight,
  Home as HomeIcon,
  User,
  ShoppingCart,
  Grid3X3,
  MessageCircle,
  Phone,
  Eye,
  Check,
} from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

import { AURORA_THEME } from './theme';
import { AuroraMinimalHeader } from './sections/Header';
import { AuroraMinimalFooter } from './sections/Footer';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t: _t } = useTranslation();
  const theme = AURORA_THEME;
  const THEME_COLORS = {
    primary: theme.primary,
    text: theme.text,
    muted: theme.textMuted,
    cardBg: theme.cardBg,
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: isScrolled ? theme.headerBg : 'rgba(253, 251, 249, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isScrolled ? theme.headerShadow : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            className="lg:hidden p-2 -ml-2 rounded-xl transition-all"
            style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'transparent' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: THEME_COLORS.primary }} />
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
              style={{ color: THEME_COLORS.primary }}
            >
              All Products
            </button>
            {validCategories.slice(0, 3).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
                style={{ color: THEME_COLORS.primary }}
              >
                {category}
              </button>
            ))}
          </nav>

          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center justify-center group"
          >
            {logo ? (
              <img
                src={logo}
                alt={storeName}
                className="h-10 lg:h-12 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <span
                className="text-2xl lg:text-3xl font-bold tracking-tight"
                style={{ fontFamily: theme.fontHeading, color: THEME_COLORS.primary }}
              >
                {storeName}
              </span>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {validCategories.slice(3, 6).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-300 rounded-full hover:opacity-70"
                style={{ color: THEME_COLORS.primary }}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              className="p-2.5 rounded-full transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'rgba(0,0,0,0.03)' }}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
            </button>
            <button
              onClick={() => onNavigate({ type: 'cart' })}
              className="p-2.5 rounded-full transition-all duration-300 hover:scale-110 relative"
              style={{ backgroundColor: isScrolled ? theme.backgroundAlt : 'rgba(0,0,0,0.03)' }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: THEME_COLORS.text }} />
              {cart.itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: theme.auroraGradient, color: THEME_COLORS.primary }}
                >
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div
          className="absolute inset-x-0 top-full py-6 px-4"
          style={{ backgroundColor: THEME_COLORS.cardBg, boxShadow: theme.headerShadow }}
        >
          <div className="max-w-2xl mx-auto relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: THEME_COLORS.muted }}
            />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 focus:outline-none transition-all"
              style={{
                borderColor: theme.border,
                fontFamily: theme.fontBody,
                backgroundColor: theme.backgroundAlt,
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate({ type: 'search', query: e.currentTarget.value });
                  setSearchOpen(false);
                }
              }}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => setSearchOpen(false)}
            >
              <X className="w-5 h-5" style={{ color: THEME_COLORS.muted }} />
            </button>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[64px] z-40 overflow-y-auto"
          style={{ backgroundColor: THEME_COLORS.cardBg }}
        >
          <nav className="py-6 px-4 space-y-2">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all"
              style={{ color: THEME_COLORS.primary }}
            >
              <span className="uppercase tracking-wider text-sm">All Products</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            {validCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onNavigate({ type: 'category', category });
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all"
                style={{ color: THEME_COLORS.primary }}
              >
                <span className="uppercase tracking-wider text-sm">{category}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ))}
          </nav>
        </div>
      )}

      <div
        className="h-[3px] w-full transition-opacity duration-500"
        style={{ background: theme.auroraGradient, opacity: isScrolled ? 0 : 1 }}
      />
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
  const theme = AURORA_THEME;
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer"
      style={{
        boxShadow: isHovered ? theme.cardShadowHover : theme.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="block relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: theme.backgroundAlt }}
          >
            <span>✨</span>
          </div>
        )}

        {isSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{ background: theme.auroraGradient, color: theme.primary }}
          >
            -{discount}%
          </div>
        )}

        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              cart.addItem(product);
            }}
            className="w-full py-3 rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 text-sm font-semibold transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: theme.primary }}
          >
            Quick Add
          </button>
        </div>
      </div>

      <div className="p-5">
        {product.category && (
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.accent }}
          >
            {product.category}
          </span>
        )}
        <h3
          className="text-lg font-semibold mt-1 mb-2 line-clamp-2 transition-colors hover:opacity-70"
          style={{ fontFamily: theme.fontHeading, color: theme.primary }}
        >
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold" style={{ color: theme.primary }}>
            {currency}
            {product.price.toLocaleString()}
          </span>
          {isSale && (
            <span className="text-sm line-through" style={{ color: theme.textMuted }}>
              {currency}
              {product.compareAtPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Product Detail Page ---
function PreviewProductDetailPage({
  productId,
  currency,
  onNavigate: _onNavigate,
}: {
  productId: number;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const product = getDemoProductById(productId);
  const [quantity, setQuantity] = useState(1);
  const theme = AURORA_THEME;

  if (!product) return <div>Product not found</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-sm">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="space-y-8">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: theme.fontHeading, color: theme.primary }}
            >
              {product.title}
            </h1>
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>
              {currency}
              {product.price.toLocaleString()}
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description || 'Designed for the modern minimalist.'}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-full px-4 py-3 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              onClick={() => cart.addItem(product, quantity)}
              className="flex-1 py-4 rounded-full font-bold text-white transition-transform active:scale-95 shadow-lg"
              style={{ background: theme.auroraGradient, color: theme.primary }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Cart Page ---
function PreviewCartPageComponent({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const theme = AURORA_THEME;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-20 text-center px-4">
        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: theme.fontHeading }}>
          Your Bag is Empty
        </h2>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="border-b-2 border-current pb-1 font-bold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <h1
        className="text-4xl font-bold mb-12 text-center"
        style={{ fontFamily: theme.fontHeading }}
      >
        Shopping Bag
      </h1>
      <div className="space-y-8">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-6 border-b pb-8 border-gray-100">
            <div className="w-24 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <div className="text-gray-500">
                  {currency}
                  {item.price.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-gray-50 rounded-full px-2">
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                    className="p-2"
                  >
                    -
                  </button>
                  <span className="px-2 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                    className="p-2"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => cart.removeItem(item.id)}
                  className="text-sm font-medium text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 bg-gray-50 p-8 rounded-3xl">
        <div className="flex justify-between text-xl font-bold mb-8">
          <span>Total</span>
          <span>
            {currency}
            {cart.total.toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => onNavigate({ type: 'checkout' })}
          className="w-full py-4 text-white font-bold rounded-full shadow-xl transition-transform hover:scale-[1.02]"
          style={{ background: theme.auroraGradient, color: theme.primary }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
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
  const theme = AURORA_THEME;

  return (
    <div className="pt-32 pb-20 px-4 max-w-2xl mx-auto">
      <h1
        className="text-3xl font-bold mb-12 text-center"
        style={{ fontFamily: theme.fontHeading }}
      >
        Checkout
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          cart.clearCart();
          onNavigate({ type: 'order-success' });
        }}
        className="space-y-6"
      >
        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none"
        />
        <input
          type="tel"
          placeholder="Phone"
          required
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none"
        />
        <textarea
          placeholder="Address"
          required
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors outline-none"
          rows={3}
        ></textarea>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>
            {currency}
            {cart.total.toLocaleString()}
          </span>
        </div>
        <button
          type="submit"
          className="w-full py-4 text-white font-bold rounded-full shadow-lg"
          style={{ background: theme.auroraGradient, color: theme.primary }}
        >
          Place Order
        </button>
      </form>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  onNavigate: (page: PageType) => void;
}) {
  const theme = AURORA_THEME;

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden rounded-b-[3rem]">
        <div className="absolute inset-0 bg-gray-100">
          {config?.bannerUrl && (
            <img src={config.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1
            className="text-5xl md:text-8xl font-bold mb-6 tracking-tight text-gray-900"
            style={{ fontFamily: theme.fontHeading }}
          >
            {config?.bannerText || 'Pure Aesthetics'}
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-medium text-gray-700">
            Elevate your lifestyle with our curated collection.
          </p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
            style={{ background: theme.auroraGradient, color: theme.primary }}
          >
            Shop Now
          </button>
        </div>
      </section>

      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2
          className="text-4xl font-bold text-center mb-16"
          style={{ fontFamily: theme.fontHeading }}
        >
          New Arrivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map((p) => (
            <PreviewProductCard
              key={p.id}
              product={p}
              currency={currency}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW STORE CONTAINER
// ============================================================================
function PreviewAuroraStore(props: StoreTemplateProps) {
  const { storeName, logo, categories: _storeCategories, config, currency, socialLinks, businessInfo, footerConfig, planType } = props;
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
            storeName={storeName}
            products={products}
            categories={validCategories}
            currency={currency}
            config={config}
            onNavigate={navigate}
          />
        );
      case 'product':
        return (
          <PreviewProductDetailPage
            productId={currentPage.productId}
            currency={currency}
            onNavigate={navigate}
          />
        );
      case 'cart':
        return <PreviewCartPageComponent currency={currency} onNavigate={navigate} />;
      case 'checkout':
        return <PreviewCheckoutPage currency={currency} onNavigate={navigate} />;
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <h1
              className="text-4xl font-bold mb-12 text-center"
              style={{ fontFamily: AURORA_THEME.fontHeading }}
            >
              {currentPage.category}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <Check size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Order Placed!</h2>
            <button
              onClick={() => navigate({ type: 'home' })}
              className="border-b-2 border-black pb-1 font-bold"
            >
              Back to Home
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
        style={{
          backgroundColor: AURORA_THEME.background,
          fontFamily: AURORA_THEME.fontBody,
          color: AURORA_THEME.text,
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div className="bg-rose-500 text-white text-center py-2 text-xs font-bold tracking-widest uppercase">
          Preview Mode
        </div>
        <PreviewHeader
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />
        <main>{renderPage()}</main>
        <AuroraMinimalFooter 
          storeName={storeName}
          logo={logo}
          footerConfig={footerConfig}
          businessInfo={businessInfo}
          socialLinks={socialLinks}
          planType={planType}
          categories={validCategories}
        />
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Preserved)
// ============================================================================
function LiveAuroraMinimalHomepage({
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
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const _formatPrice = useFormatPrice();
  const { t: _liveT } = useTranslation();
  const count = useCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validCategories = categories.filter((c): c is string => Boolean(c));
  const announcement = config?.announcement;

  const THEME = {
    primary: AURORA_THEME.primary,
    accent: AURORA_THEME.accent,
    accentSecondary: AURORA_THEME.accentSecondary,
    background: AURORA_THEME.background,
    text: AURORA_THEME.text,
    muted: AURORA_THEME.textMuted,
    cardBg: AURORA_THEME.cardBg,
    headerBg: AURORA_THEME.headerBgSolid,
    footerBg: AURORA_THEME.footerBg,
    footerText: AURORA_THEME.footerText,
  };

  return (
    <StoreConfigProvider config={config}>
      <ClientOnly fallback={<SkeletonLoader />}>
        {() => (
          <WishlistProvider>
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: THEME.background,
                fontFamily: AURORA_THEME.fontBody,
                color: THEME.text,
              }}
            >
              <link
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                rel="stylesheet"
              />

              <AuroraMinimalHeader
                storeName={storeName}
                logo={logo}
                categories={validCategories}
                currentCategory={currentCategory}
                count={count}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
                isScrolled={isScrolled}
                announcement={announcement}
                socialLinks={socialLinks}
              />

              <div
                className={`${announcement?.text ? 'h-[107px] lg:h-[123px]' : 'h-[67px] lg:h-[83px]'}`}
              />

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
                const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                if (!SectionComponent) return null;

                return (
                  <SectionComponent
                    key={section.id}
                    settings={section.settings}
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
                    ProductCardComponent={AuroraProductCard}
                  />
                );
              })}

              {validCategories.length > 0 && (
                <div
                  className="lg:hidden overflow-x-auto py-4 px-4 border-b scrollbar-hide"
                  style={{ borderColor: AURORA_THEME.border }}
                >
                  <div className="flex gap-2">
                    <Link
                      to="/"
                      className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300"
                      style={{
                        background: !currentCategory ? AURORA_THEME.auroraGradient : 'transparent',
                        color: !currentCategory ? THEME.primary : THEME.text,
                        border: !currentCategory ? 'none' : `1px solid ${AURORA_THEME.border}`,
                      }}
                    >
                      All
                    </Link>
                    {validCategories.map((category) => (
                      <Link
                        key={category}
                        to={`/?category=${encodeURIComponent(category)}`}
                        className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300"
                        style={{
                          background:
                            currentCategory === category
                              ? AURORA_THEME.auroraGradient
                              : 'transparent',
                          color: currentCategory === category ? THEME.primary : THEME.text,
                          border:
                            currentCategory === category
                              ? 'none'
                              : `1px solid ${AURORA_THEME.border}`,
                        }}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <section
                className="relative py-20 overflow-hidden"
                style={{ background: AURORA_THEME.auroraGradient }}
              >
                <div
                  className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: AURORA_THEME.accent }}
                />
                <div
                  className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: AURORA_THEME.accentSecondary }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h3
                    className="text-3xl lg:text-5xl font-bold mb-4"
                    style={{ fontFamily: AURORA_THEME.fontHeading, color: THEME.primary }}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(config as any)?.newsletter?.heading || 'Join Our Journey'}
                  </h3>
                  <p
                    className="text-lg mb-8 max-w-lg mx-auto opacity-80"
                    style={{ color: THEME.primary }}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(config as any)?.newsletter?.subheading ||
                      'Be the first to discover new arrivals and exclusive offers.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-4 rounded-full bg-white/80 backdrop-blur-sm border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                      style={{
                        boxShadow: AURORA_THEME.cardShadow,
                      }}
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: THEME.primary,
                        color: THEME.footerText,
                        boxShadow: '0 8px 30px rgba(44, 44, 44, 0.3)',
                      }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </section>

              <AuroraMinimalFooter
                storeName={storeName}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                socialLinks={socialLinks}
                planType={planType}
                themeColors={THEME}
                categories={validCategories}
              />

              <nav
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
                style={{
                  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
                  borderColor: AURORA_THEME.border,
                }}
              >
                <div className="flex items-center justify-around h-16">
                  <Link to="/" className="flex flex-col items-center gap-1 py-2 px-4">
                    <div
                      className="p-1.5 rounded-xl transition-all"
                      style={{
                        background: !currentCategory ? AURORA_THEME.auroraGradient : 'transparent',
                      }}
                    >
                      <HomeIcon
                        className="w-5 h-5 transition-colors"
                        style={{ color: !currentCategory ? THEME.primary : THEME.muted }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: !currentCategory ? THEME.primary : THEME.muted }}
                    >
                      Home
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-1 py-2 px-4"
                  >
                    <div className="p-1.5 rounded-xl">
                      <Grid3X3 className="w-5 h-5" style={{ color: THEME.muted }} />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: THEME.muted }}>
                      Browse
                    </span>
                  </button>
                  <Link to="/cart" className="flex flex-col items-center gap-1 py-2 px-4 relative">
                    <div className="p-1.5 rounded-xl">
                      <ShoppingCart className="w-5 h-5" style={{ color: THEME.muted }} />
                    </div>
                    {count > 0 && (
                      <span
                        className="absolute top-0 right-2 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: AURORA_THEME.auroraGradient, color: THEME.primary }}
                      >
                        {count}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold" style={{ color: THEME.muted }}>
                      Cart
                    </span>
                  </Link>
                  {!isPreview && (
                    <Link to="/auth/login" className="flex flex-col items-center gap-1 py-2 px-4">
                      <div className="p-1.5 rounded-xl">
                        <User className="w-5 h-5" style={{ color: THEME.muted }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: THEME.muted }}>
                        Account
                      </span>
                    </Link>
                  )}
                </div>
              </nav>

              {!isPreview && (
                <>
                  {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
                    <a
                      href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle className="h-7 w-7 text-white" />
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
                    </a>
                  )}
                  {config?.floatingCallEnabled && config?.floatingCallNumber && (
                    <a
                      href={`tel:${config.floatingCallNumber}`}
                      className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110`}
                      style={{ background: AURORA_THEME.auroraGradient }}
                      title="Call us"
                    >
                      <Phone className="h-7 w-7" style={{ color: THEME.primary }} />
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-25"
                        style={{ background: AURORA_THEME.auroraGradient }}
                      />
                    </a>
                  )}
                </>
              )}

              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(-100%); }
                  to { opacity: 1; transform: translateX(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                .animate-slideIn { animation: slideIn 0.3s ease forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </div>
          </WishlistProvider>
        )}
      </ClientOnly>
    </StoreConfigProvider>
  );
}

// ============================================================================
// AURORA PRODUCT CARD COMPONENT (Live)
// ============================================================================
interface AuroraProductCardProps {
  product: StoreTemplateProps['products'][0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
  addToCartText?: string;
  showWishlist?: boolean;
}

function AuroraProductCard({
  product,
  storeId,
  formatPrice,
  isPreview,
  addToCartText,
  showWishlist,
}: AuroraProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const {
    price,
    compareAtPrice: displayCompareAt,
    isFlashSale,
    isOnSale,
    discountPercentage,
  } = useProductPrice(product);
  const isLiked = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);

  const THEME = {
    primary: AURORA_THEME.primary,
    accent: AURORA_THEME.accent,
    muted: AURORA_THEME.textMuted,
  };

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500"
      style={{
        boxShadow: isHovered ? AURORA_THEME.cardShadowHover : AURORA_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: AURORA_THEME.backgroundAlt }}
          >
            <span className="text-6xl">✨</span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)' }}
        />

        {isOnSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: isFlashSale ? '#EF4444' : AURORA_THEME.auroraGradient,
              color: isFlashSale ? 'white' : THEME.primary,
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}-{discountPercentage}%
          </div>
        )}

        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <button
            className="w-full py-3 rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 text-sm font-semibold transition-all"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: THEME.primary,
            }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>
      </Link>

      {showWishlist !== false && (
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10"
          style={{
            backgroundColor: isLiked ? AURORA_THEME.accent : 'rgba(255,255,255,0.9)',
            boxShadow: AURORA_THEME.cardShadow,
          }}
        >
          <Heart
            className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`}
            style={{ color: isLiked ? THEME.primary : THEME.muted }}
          />
        </button>
      )}

      <div className="p-5">
        {product.category && (
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: AURORA_THEME.accent }}
          >
            {product.category}
          </span>
        )}

        <Link to={`/product/${product.id}`}>
          <h3
            className="text-lg font-semibold mt-1 mb-2 line-clamp-2 transition-colors hover:opacity-70"
            style={{ fontFamily: AURORA_THEME.fontHeading, color: THEME.primary }}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold" style={{ color: THEME.primary }}>
            {formatPrice(price)}
          </span>
          {isOnSale && displayCompareAt && (
            <span className="text-sm line-through" style={{ color: THEME.muted }}>
              {formatPrice(displayCompareAt)}
            </span>
          )}
        </div>

        {!isPreview ? (
          <AddToCartButton
            productId={product.id}
            storeId={storeId}
            productName={product.title}
            productPrice={price}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: AURORA_THEME.auroraGradient,
              color: THEME.primary,
              boxShadow: AURORA_THEME.buttonShadow,
            }}
          >
            {addToCartText || 'Add to Cart'}
          </AddToCartButton>
        ) : (
          <button
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300"
            style={{
              background: AURORA_THEME.auroraGradient,
              color: THEME.primary,
              boxShadow: AURORA_THEME.buttonShadow,
            }}
            disabled
          >
            {addToCartText || 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function AuroraMinimalTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewAuroraStore {...props} />;
  }
  return <LiveAuroraMinimalHomepage {...props} />;
}

export default AuroraMinimalTemplate;
