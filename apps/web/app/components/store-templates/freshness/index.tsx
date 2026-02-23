/**
 * Freshness Template (2025 Edition)
 *
 * A vibrant, organic-focused e-commerce template.
 * Perfect for grocery, health, and natural product stores.
 *
 * DUAL MODE ARCHITECTURE (NovaLux Pattern):
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
  Star,
  Minus,
  Plus,
  Check,
  Leaf,
  Truck,
  Shield,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { formatPrice } from '~/lib/formatting';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { FRESHNESS_THEME } from './theme';
import { FreshnessHeader } from './sections/Header';
import { FreshnessFooter } from './sections/Footer';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { useWishlist } from '~/hooks/useWishlist';
import { AddToCartButton } from '~/components/AddToCartButton';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 shadow-sm"
      style={{ backgroundColor: FRESHNESS_THEME.headerBg, backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 object-contain" />
            ) : (
              <span
                className="text-2xl lg:text-3xl font-bold italic"
                style={{
                  color: FRESHNESS_THEME.secondary,
                  fontFamily: FRESHNESS_THEME.fontHeading,
                }}
              >
                {storeName}
              </span>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-sm font-medium transition-colors hover:text-green-600"
              style={{ color: FRESHNESS_THEME.text }}
            >
              Home
            </button>
            {validCategories.slice(0, 4).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="text-sm font-medium transition-colors hover:text-green-600"
                style={{ color: FRESHNESS_THEME.text }}
              >
                {category}
              </button>
            ))}
          </nav>

          <button
            onClick={() => onNavigate({ type: 'cart' })}
            className="relative p-2.5 rounded-full transition-all hover:bg-green-50"
          >
            <ShoppingBag className="w-6 h-6" style={{ color: FRESHNESS_THEME.secondary }} />
            {cart.itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: FRESHNESS_THEME.secondary }}
              >
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg p-4"
          >
            <nav className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onNavigate({ type: 'home' });
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 font-medium"
              >
                Home
              </button>
              {validCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onNavigate({ type: 'category', category: cat });
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2"
                >
                  {cat}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
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
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden cursor-pointer"
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      {isSale && (
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
          <span className="text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-pink-500">
            -{discount}%
          </span>
        </div>
      )}

      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            cart.addItem(product);
          }}
          className="w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all"
        >
          <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="relative h-32 md:h-48 w-full overflow-hidden rounded-xl md:rounded-2xl mb-3 md:mb-4 bg-gray-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-12 h-12 text-green-200" />
          </div>
        )}
      </div>

      <div className="px-1 md:px-2">
        <p className="text-[10px] md:text-xs text-gray-400 font-bold mb-0.5 md:mb-1 uppercase tracking-wider">
          {product.category || 'General'}
        </p>
        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 md:mb-2 line-clamp-1">
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3"
              fill={i < 4 ? '#FBBF24' : 'none'}
              style={{ color: '#FBBF24' }}
            />
          ))}
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-lg md:text-xl font-black"
            style={{ color: FRESHNESS_THEME.primary }}
          >
            {formatPrice(product.price, currency)}
          </span>
          {isSale && (
            <span className="text-xs md:text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
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

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <button
        onClick={() => onNavigate({ type: 'home' })}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-green-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="space-y-6">
          {product.category && (
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: FRESHNESS_THEME.secondary }}
            >
              {product.category}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: FRESHNESS_THEME.text }}>
            {product.title}
          </h1>

          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5" fill="#FBBF24" style={{ color: '#FBBF24' }} />
            ))}
            <span className="text-gray-500">(123 reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black" style={{ color: FRESHNESS_THEME.primary }}>
              {formatPrice(product.price, currency)}
            </span>
            {isSale && (
              <>
                <span className="text-xl line-through text-gray-400">
                  {formatPrice(product.compareAtPrice, currency)}
                </span>
                <span className="text-sm font-bold text-pink-500">-{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description ||
              'Fresh, organic, and sourced from the best farms. Experience nature in every bite.'}
          </p>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <Leaf className="w-6 h-6 mx-auto mb-2" style={{ color: FRESHNESS_THEME.secondary }} />
              <span className="text-xs font-medium">100% Organic</span>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <Truck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <span className="text-xs font-medium">Free Delivery</span>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <Shield className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span className="text-xs font-medium">Quality Assured</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => cart.addItem(product, quantity)}
              className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: FRESHNESS_THEME.secondary }}
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
        <ShoppingBag className="w-16 h-16 mb-4" style={{ color: FRESHNESS_THEME.muted }} />
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-8 py-3 rounded-full font-bold text-white"
          style={{ backgroundColor: FRESHNESS_THEME.secondary }}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <div className="font-bold mb-3" style={{ color: FRESHNESS_THEME.primary }}>
                {formatPrice(item.price, currency)}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => cart.removeItem(item.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex justify-between text-xl font-bold mb-6">
          <span>Total</span>
          <span style={{ color: FRESHNESS_THEME.primary }}>
            {formatPrice(cart.total, currency)}
          </span>
        </div>
        <button
          onClick={() => onNavigate({ type: 'checkout' })}
          className="w-full py-4 text-white font-bold rounded-xl"
          style={{ backgroundColor: FRESHNESS_THEME.secondary }}
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
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          cart.clearCart();
          onNavigate({ type: 'order-success' });
        }}
        className="space-y-6"
      >
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold border-b pb-2">Delivery Information</h3>
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-green-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            required
            className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-green-500"
          />
          <textarea
            placeholder="Delivery Address"
            required
            rows={3}
            className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-green-500"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold border-b pb-2 mb-4">Order Summary</h3>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity, currency)}</span>
            </div>
          ))}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span style={{ color: FRESHNESS_THEME.primary }}>
                {formatPrice(cart.total, currency)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 text-white font-bold rounded-xl"
          style={{ backgroundColor: FRESHNESS_THEME.secondary }}
        >
          Place Order
        </button>
      </form>
    </div>
  );
}

// --- Preview Home Page ---
function PreviewHomePage({
  storeName,
  products,
  categories,
  currency,
  config: _config,
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
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section
        className="relative py-16 px-4 text-center"
        style={{ backgroundColor: FRESHNESS_THEME.backgroundAlt }}
      >
        <div className="max-w-4xl mx-auto">
          <Leaf className="w-16 h-16 mx-auto mb-6" style={{ color: FRESHNESS_THEME.secondary }} />
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: FRESHNESS_THEME.fontHeading, color: FRESHNESS_THEME.secondary }}
          >
            {storeName}
          </h1>
          <p className="text-xl mb-8 text-gray-600">Fresh, organic, and delivered to your door.</p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-8 py-4 rounded-full font-bold text-white text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: FRESHNESS_THEME.secondary }}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-4 justify-center flex-wrap">
          {categories
            .filter(Boolean)
            .slice(0, 5)
            .map((cat) => (
              <button
                key={cat}
                onClick={() => onNavigate({ type: 'category', category: cat! })}
                className="px-6 py-3 rounded-full font-medium transition-all hover:bg-green-50 border"
                style={{ borderColor: FRESHNESS_THEME.secondary, color: FRESHNESS_THEME.secondary }}
              >
                {cat}
              </button>
            ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: FRESHNESS_THEME.text }}>
          Featured Products
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
function PreviewFreshnessStore(props: StoreTemplateProps) {
  const {
    storeName,
    logo,
    categories,
    config,
    currency,
    socialLinks,
    businessInfo,
    footerConfig,
    planType,
  } = props;
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
        return <PreviewCartPage currency={currency ?? ''} onNavigate={navigate} />;
      case 'checkout':
        return <PreviewCheckoutPage currency={currency ?? ''} onNavigate={navigate} />;
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">{currentPage.category}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p) => (
                <PreviewProductCard
                  key={p.id}
                  product={p}
                  currency={currency ?? ''}
                  onNavigate={navigate}
                />
              ))}
            </div>
          </div>
        );
      }
      case 'order-success':
        return (
          <div className="min-h-[60vh] flex items-center justify-center flex-col pt-20">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${FRESHNESS_THEME.secondary}20` }}
            >
              <Check className="w-10 h-10" style={{ color: FRESHNESS_THEME.secondary }} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
            <button
              onClick={() => navigate({ type: 'home' })}
              className="px-8 py-3 rounded-full font-bold text-white"
              style={{ backgroundColor: FRESHNESS_THEME.secondary }}
            >
              Continue Shopping
            </button>
          </div>
        );
      case 'search':
        return (
          <div className="pt-32 text-center text-gray-600">
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
          backgroundColor: FRESHNESS_THEME.background,
          fontFamily: FRESHNESS_THEME.fontBody,
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <PreviewHeader
          storeName={storeName ?? ''}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />
        <main>{renderPage()}</main>
        <FreshnessFooter
          storeName={storeName ?? ''}
          logo={logo}
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
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Preserved Original)
// ============================================================================
function LiveFreshnessHomepage({
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
  const [isScrolled, setIsScrolled] = useState(false);

  const count = useCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validCategories = (categories || []).filter((c): c is string => Boolean(c));

  const THEME = {
    ...FRESHNESS_THEME,
    headerBg: FRESHNESS_THEME.headerBg,
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
                fontFamily: THEME.fontBody,
                color: THEME.text,
              }}
            >
              <FreshnessHeader
                storeName={storeName ?? ''}
                logo={logo}
                categories={validCategories}
                count={count}
                setMobileMenuOpen={setMobileMenuOpen}
                isScrolled={isScrolled}
                businessInfo={businessInfo}
                isPreview={isPreview}
              />

              <div className="h-20 lg:h-[145px]"></div>

              {/* Mobile Drawer */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="fixed inset-0 bg-black/50 z-[200] lg:hidden"
                    />
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      className="fixed top-0 left-0 w-80 h-screen bg-white z-[210] shadow-2xl lg:hidden flex flex-col"
                    >
                      <div
                        className="p-5 flex items-center justify-between text-white font-bold shrink-0"
                        style={{ backgroundColor: THEME.primary }}
                      >
                        <span className="text-xl italic" style={{ fontFamily: THEME.fontHeading }}>
                          {storeName}
                        </span>
                        <button onClick={() => setMobileMenuOpen(false)}>
                          <X className="w-8 h-8" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                        <div
                          className="flex border rounded-lg overflow-hidden mb-6 shrink-0"
                          style={{ borderColor: THEME.border }}
                        >
                          <input
                            type="text"
                            placeholder="Search..."
                            className="flex-1 px-3 py-2 outline-none text-sm"
                          />
                          <button className="px-3" style={{ backgroundColor: THEME.accent }}>
                            <Search className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        <ul className="space-y-1 mb-6">
                          <li className="border-b pb-2" style={{ borderColor: THEME.border }}>
                            <Link
                              to="/"
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-3 font-semibold text-gray-800"
                            >
                              Home
                            </Link>
                          </li>
                          {validCategories.map((cat) => (
                            <li
                              key={cat}
                              className="border-b pb-2"
                              style={{ borderColor: THEME.border }}
                            >
                              <Link
                                to={`/?category=${encodeURIComponent(cat)}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3 font-semibold text-gray-800"
                              >
                                {cat}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Dynamic Sections */}
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
                    ProductCardComponent={FreshnessProductCard}
                  />
                );
              })}

              <FreshnessFooter
                storeName={storeName ?? ''}
                footerConfig={footerConfig}
                businessInfo={businessInfo ? {
                  phone: businessInfo.phone ?? undefined,
                  email: businessInfo.email ?? undefined,
                  address: businessInfo.address ?? undefined,
                } : undefined}
                planType={planType}
                categories={validCategories}
              />
            </div>
          </WishlistProvider>
        )}
      </ClientOnly>
    </StoreConfigProvider>
  );
}

// ============================================================================
// FRESHNESS PRODUCT CARD COMPONENT (Live)
// ============================================================================
interface FreshnessProductCardProps {
  product: NonNullable<StoreTemplateProps['products']>[0];
  storeId: number;
  formatPrice: (price: number) => string;
}

function FreshnessProductCard({ product, storeId, formatPrice }: FreshnessProductCardProps) {
  const { price, compareAtPrice, isFlashSale, isOnSale, discountPercentage } =
    useProductPrice(product);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden h-full flex flex-col"
    >
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
        {isFlashSale && (
          <span className="text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase shadow-sm bg-red-500">
            Sale
          </span>
        )}
        {isOnSale && !isFlashSale && (
          <span className="text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase shadow-sm bg-pink-500">
            -{Math.round(discountPercentage)}%
          </span>
        )}
      </div>

      <div className="absolute top-2 right-2 md:top-4 md:right-[-50px] md:group-hover:right-4 transition-all duration-500 z-10 flex flex-col gap-1.5 md:gap-2">
        <button
          onClick={() => toggleWishlist(product.id)}
          className="w-7 h-7 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
        >
          <Heart className="w-4 h-4 md:w-5 md:h-5" fill={isLiked ? 'currentColor' : 'none'} />
        </button>
        <Link
          to={`/products/${product.id}`}
          className="w-7 h-7 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
      </div>

      <div className="relative h-32 md:h-60 w-full overflow-hidden rounded-xl md:rounded-2xl mb-3 md:mb-4 bg-gray-50">
        <img
          src={product.imageUrl || '/placeholder.png'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
      </div>

      <div className="px-1 md:px-2 flex flex-col flex-grow">
        <p className="text-[8px] md:text-xs text-gray-400 font-bold mb-0.5 md:mb-1 uppercase tracking-wider">
          {product.category || 'General'}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-xs md:text-base font-bold text-gray-800 hover:text-green-600 cursor-pointer transition-colors mb-1 md:mb-2 line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 md:pt-4 border-t border-gray-50">
            <div className="flex flex-wrap items-baseline gap-1">
              <span
                className="text-sm md:text-xl font-black"
                style={{ color: FRESHNESS_THEME.primary }}
              >
                {formatPrice(price)}
              </span>
              {compareAtPrice && (
                <span className="text-[10px] md:text-sm text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>

            <div className="self-end md:self-auto">
              <AddToCartButton
                productId={product.id}
                storeId={storeId}
                className="bg-green-100 text-green-600 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function FreshnessTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewFreshnessStore {...props} />;
  }
  return <LiveFreshnessHomepage {...props} />;
}

export default FreshnessTemplate;
