/**
 * ZenithRise Template (2025 World-Class)
 *
 * A high-conversion, dark-mode SaaS/Digital product template.
 *
 * DUAL MODE ARCHITECTURE (NovaLux Pattern):
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import type { ThemeConfig } from '@db/types';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { ZENITH_RISE_THEME } from './theme';
import { ZenithRiseHeader } from './sections/Header';
import { ZenithRiseFooter } from './sections/Footer';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
  type DemoProduct,
} from '~/utils/store-preview-data';
import { ShoppingBag, Minus, Plus, Check, Star, ArrowLeft, Sparkles } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';

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

// --- Preview Header ---
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
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: ZENITH_RISE_THEME.glassBackground,
        backdropFilter: ZENITH_RISE_THEME.glassBackdrop,
        borderBottom: `1px solid ${ZENITH_RISE_THEME.glassBorder}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 object-contain" />
            ) : (
              <span
                className="text-xl lg:text-2xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: ZENITH_RISE_THEME.primaryGradient,
                  fontFamily: ZENITH_RISE_THEME.fontHeading,
                }}
              >
                {storeName}
              </span>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: ZENITH_RISE_THEME.muted }}
            >
              All Products
            </button>
            {validCategories.slice(0, 4).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: ZENITH_RISE_THEME.muted }}
              >
                {category}
              </button>
            ))}
          </nav>

          <button
            onClick={() => onNavigate({ type: 'cart' })}
            className="relative p-2.5 rounded-full transition-all hover:bg-white/10"
          >
            <ShoppingBag className="w-5 h-5" style={{ color: ZENITH_RISE_THEME.text }} />
            {cart.itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ background: ZENITH_RISE_THEME.primaryGradient }}
              >
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// --- Preview Product Card ---
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
      className="group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer"
      style={{
        backgroundColor: ZENITH_RISE_THEME.surface,
        boxShadow: isHovered ? ZENITH_RISE_THEME.cardShadowHover : ZENITH_RISE_THEME.cardShadow,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: ZENITH_RISE_THEME.backgroundAlt }}
          >
            <Sparkles className="w-12 h-12" style={{ color: ZENITH_RISE_THEME.accent }} />
          </div>
        )}

        {isSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: ZENITH_RISE_THEME.accentGradient, color: 'white' }}
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
            className="w-full px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-white"
            style={{ background: ZENITH_RISE_THEME.primaryGradient }}
          >
            Quick Add
          </button>
        </div>
      </div>

      <div className="p-5">
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: ZENITH_RISE_THEME.accent }}
          >
            {product.category}
          </span>
        )}
        <h3
          className="font-medium mt-2 mb-3 line-clamp-2"
          style={{ color: ZENITH_RISE_THEME.text }}
        >
          {product.title}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={{
                color: ZENITH_RISE_THEME.accent,
                fill: i < 4 ? ZENITH_RISE_THEME.accent : 'none',
              }}
            />
          ))}
        </div>
        <div className="text-lg font-bold" style={{ color: ZENITH_RISE_THEME.text }}>
          {formatPrice(product.price, currency)}
          {isSale && (
            <span className="text-xs line-through ml-2" style={{ color: ZENITH_RISE_THEME.muted }}>
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Preview Product Detail Page ---
function PreviewProductDetailPage({
  productId,
  currency,
  onNavigate,
}: {
  productId: number;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const product = getDemoProductById(productId);
  const [quantity, setQuantity] = useState(1);

  if (!product) return <div className="pt-32 text-center">Product not found</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <button
        onClick={() => onNavigate({ type: 'home' })}
        className="flex items-center gap-2 mb-8 transition-colors hover:text-white"
        style={{ color: ZENITH_RISE_THEME.muted }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div
          className="aspect-[4/5] rounded-2xl overflow-hidden"
          style={{ backgroundColor: ZENITH_RISE_THEME.surface }}
        >
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
            {product.category && (
              <span
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: ZENITH_RISE_THEME.accent }}
              >
                {product.category}
              </span>
            )}
            <h1
              className="text-4xl font-bold mt-2 mb-4"
              style={{ color: ZENITH_RISE_THEME.text, fontFamily: ZENITH_RISE_THEME.fontHeading }}
            >
              {product.title}
            </h1>
            <div className="text-3xl font-bold" style={{ color: ZENITH_RISE_THEME.primary }}>
              {formatPrice(product.price, currency)}
            </div>
          </div>

          <p style={{ color: ZENITH_RISE_THEME.muted }} className="leading-relaxed">
            {product.description || 'Experience premium quality with this exceptional product.'}
          </p>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{ border: `1px solid ${ZENITH_RISE_THEME.border}` }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => cart.addItem(product, quantity)}
              className="flex-1 py-4 rounded-full font-semibold text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: ZENITH_RISE_THEME.primaryGradient }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Preview Cart Page ---
function PreviewCartPage({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-20">
        <ShoppingBag className="w-16 h-16 mb-4" style={{ color: ZENITH_RISE_THEME.muted }} />
        <h2 className="text-2xl font-bold mb-4" style={{ color: ZENITH_RISE_THEME.text }}>
          Your Cart is Empty
        </h2>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-8 py-3 rounded-full font-semibold text-white"
          style={{ background: ZENITH_RISE_THEME.primaryGradient }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <h1
        className="text-3xl font-bold mb-12 text-center"
        style={{ color: ZENITH_RISE_THEME.text, fontFamily: ZENITH_RISE_THEME.fontHeading }}
      >
        Shopping Cart
      </h1>

      <div className="space-y-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-6 p-4 rounded-xl"
            style={{ backgroundColor: ZENITH_RISE_THEME.surface }}
          >
            <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1" style={{ color: ZENITH_RISE_THEME.text }}>
                {item.title}
              </h3>
              <div className="mb-4" style={{ color: ZENITH_RISE_THEME.muted }}>
                {formatPrice(item.price, currency)}
              </div>
              <div className="flex justify-between items-center">
                <div
                  className="flex items-center rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${ZENITH_RISE_THEME.border}` }}
                >
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-2 hover:bg-white/5"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-2 hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => cart.removeItem(item.id)}
                  className="text-sm underline"
                  style={{ color: ZENITH_RISE_THEME.muted }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: ZENITH_RISE_THEME.surface }}>
        <div className="flex justify-between text-xl font-bold mb-8">
          <span>Total</span>
          <span>{formatPrice(cart.total, currency)}</span>
        </div>
        <button
          onClick={() => onNavigate({ type: 'checkout' })}
          className="w-full py-4 text-white font-semibold rounded-full"
          style={{ background: ZENITH_RISE_THEME.primaryGradient }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

// --- Preview Checkout Page ---
function PreviewCheckoutPage({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();

  return (
    <div className="pt-32 pb-20 px-4 max-w-2xl mx-auto">
      <h1
        className="text-2xl font-bold mb-8 text-center"
        style={{ color: ZENITH_RISE_THEME.text, fontFamily: ZENITH_RISE_THEME.fontHeading }}
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
          className="w-full p-4 rounded-xl outline-none focus:ring-2"
          style={{
            backgroundColor: ZENITH_RISE_THEME.surface,
            color: ZENITH_RISE_THEME.text,
            border: `1px solid ${ZENITH_RISE_THEME.border}`,
          }}
        />
        <input
          type="tel"
          placeholder="Phone"
          required
          className="w-full p-4 rounded-xl outline-none focus:ring-2"
          style={{
            backgroundColor: ZENITH_RISE_THEME.surface,
            color: ZENITH_RISE_THEME.text,
            border: `1px solid ${ZENITH_RISE_THEME.border}`,
          }}
        />
        <textarea
          placeholder="Address"
          required
          rows={3}
          className="w-full p-4 rounded-xl outline-none focus:ring-2"
          style={{
            backgroundColor: ZENITH_RISE_THEME.surface,
            color: ZENITH_RISE_THEME.text,
            border: `1px solid ${ZENITH_RISE_THEME.border}`,
          }}
        />
        <div
          className="p-4 rounded-xl flex justify-between font-medium"
          style={{ backgroundColor: ZENITH_RISE_THEME.surface }}
        >
          <span>Total</span>
          <span>{formatPrice(cart.total, currency)}</span>
        </div>
        <button
          type="submit"
          className="w-full py-4 text-white font-semibold rounded-full"
          style={{ background: ZENITH_RISE_THEME.primaryGradient }}
        >
          Place Order
        </button>
      </form>
    </div>
  );
}

// --- Preview Home Page ---
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
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: ZENITH_RISE_THEME.heroGradient }} />
        {config?.bannerUrl && (
          <img
            src={config.bannerUrl}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage: ZENITH_RISE_THEME.accentGradient,
              fontFamily: ZENITH_RISE_THEME.fontHeading,
            }}
          >
            {config?.bannerText || 'Build the Future'}
          </h1>
          <p className="text-xl mb-8" style={{ color: ZENITH_RISE_THEME.muted }}>
            Experience the next generation of digital commerce.
          </p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:scale-105"
            style={{ background: ZENITH_RISE_THEME.primaryGradient }}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ color: ZENITH_RISE_THEME.text, fontFamily: ZENITH_RISE_THEME.fontHeading }}
        >
          Trending Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
function PreviewZenithRiseStore(props: StoreTemplateProps) {
  const { storeName, logo, config, currency, businessInfo, socialLinks, footerConfig, planType } =
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
        return <PreviewCartPage currency={currency} onNavigate={navigate} />;
      case 'checkout':
        return <PreviewCheckoutPage currency={currency} onNavigate={navigate} />;
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <h1
              className="text-4xl font-bold mb-12 text-center"
              style={{ color: ZENITH_RISE_THEME.text, fontFamily: ZENITH_RISE_THEME.fontHeading }}
            >
              {currentPage.category}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: `${ZENITH_RISE_THEME.success}20` }}
            >
              <Check className="w-10 h-10" style={{ color: ZENITH_RISE_THEME.success }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: ZENITH_RISE_THEME.text }}>
              Order Confirmed!
            </h2>
            <p className="mb-6" style={{ color: ZENITH_RISE_THEME.muted }}>
              Thank you for your purchase.
            </p>
            <button
              onClick={() => navigate({ type: 'home' })}
              className="px-8 py-3 rounded-full font-semibold text-white"
              style={{ background: ZENITH_RISE_THEME.primaryGradient }}
            >
              Continue Shopping
            </button>
          </div>
        );
      case 'search':
        return (
          <div className="pt-32 text-center" style={{ color: ZENITH_RISE_THEME.muted }}>
            Search results for: {currentPage.query}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <CartProvider>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: ZENITH_RISE_THEME.background,
          color: ZENITH_RISE_THEME.text,
          fontFamily: ZENITH_RISE_THEME.fontBody,
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div
          className="text-center py-2 text-xs font-bold tracking-widest uppercase"
          style={{ background: ZENITH_RISE_THEME.primaryGradient, color: 'white' }}
        >
          Preview Mode - Demo Store
        </div>
        <PreviewHeader
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />
        <main>{renderPage()}</main>
        <ZenithRiseFooter
          storeName={storeName}
          logo={logo}
          socialLinks={socialLinks}
          footerConfig={footerConfig}
          businessInfo={businessInfo}
          planType={planType}
          categories={validCategories}
        />
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Preserved Original)
// ============================================================================
interface SectionConfig {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

function LiveZenithRiseHomepage({
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
  planType,
}: StoreTemplateProps) {
  // Default Sections if none configured
  const defaultSections: SectionConfig[] = [
    {
      id: 'z-hero',
      type: 'zenith-hero',
      settings: {
        heading: config?.bannerText || 'Build the Future',
        titleHighlight: 'Future',
        subheading:
          'Experience the next generation of digital commerce. Fast, secure, and beautiful.',
        primaryAction: { label: 'Get Started', url: '/?category=all' },
        secondaryAction: { label: 'Browse Products', url: '/#products' },
        image: config?.bannerUrl,
      },
    },
    {
      id: 'z-text',
      type: 'rich-text',
      settings: {
        heading: 'Trusted by Industry Leaders',
        text: 'Join thousands of companies scaling their business with us.',
        alignment: 'center',
        backgroundColor: 'transparent',
        textColor: '#94A3B8',
      },
    },
    {
      id: 'z-features',
      type: 'zenith-features',
      settings: {
        heading: 'Everything You Need',
        subheading: 'Powerful features to help you grow.',
      },
    },
    {
      id: 'z-products',
      type: 'product-grid',
      settings: {
        heading: 'Trending Products',
        productCount: 8,
        paddingTop: 'large',
        paddingBottom: 'large',
        cardStyle: 'minimal',
      },
    },
    {
      id: 'z-banner',
      type: 'banner',
      settings: {
        heading: 'Early Access Drops',
        subheading: 'Exclusive product launches for subscribers.',
        primaryAction: { label: 'Join Now', url: '/#newsletter' },
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      },
    },
    {
      id: 'z-faq',
      type: 'faq',
      settings: {
        heading: "Questions? We've got answers.",
        backgroundColor: 'transparent',
        faqs: [
          {
            question: 'What makes this store different?',
            answer: 'We focus on premium, curated product collections.',
          },
          { question: 'Do you offer support?', answer: 'Yes, our team is available 24/7.' },
          { question: 'Can I return products?', answer: 'We offer a 7-day return policy.' },
        ],
      },
    },
    {
      id: 'z-newsletter',
      type: 'newsletter',
      settings: {
        heading: 'Stay Updated',
        subheading: 'Get the latest news and updates directly to your inbox.',
        alignment: 'center',
      },
    },
  ];

  const sectionsToRender =
    config?.sections && config.sections.length > 0 ? config.sections : defaultSections;

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly
          fallback={
            <div className="min-h-screen bg-slate-950">
              <SkeletonLoader />
            </div>
          }
        >
          {() => (
            <div
              className="min-h-screen flex flex-col"
              style={{
                backgroundColor: ZENITH_RISE_THEME.background,
                color: ZENITH_RISE_THEME.text,
                fontFamily: ZENITH_RISE_THEME.fontBody,
              }}
            >
              <ZenithRiseHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                isPreview={isPreview}
                config={config}
                socialLinks={socialLinks}
              />

              <main className="flex-1">
                {sectionsToRender.map((section: SectionConfig) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) {
                    console.warn(`Unknown section type: ${section.type}`);
                    return null;
                  }

                  return (
                    <SectionComponent
                      key={section.id}
                      settings={section.settings}
                      theme={ZENITH_RISE_THEME}
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
                    />
                  );
                })}
              </main>

              <ZenithRiseFooter
                storeName={storeName}
                logo={logo}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                categories={categories}
                planType={planType}
              />

              <style>{`
                ::selection {
                  background: ${ZENITH_RISE_THEME.accent};
                  color: white;
                }
              `}</style>
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function ZenithRiseTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewZenithRiseStore {...props} />;
  }
  return <LiveZenithRiseHomepage {...props} />;
}

export default ZenithRiseTemplate;
