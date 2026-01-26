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
import { Link, useSearchParams } from '@remix-run/react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Star,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  Home as HomeIcon,
  ShoppingCart,
  MessageCircle,
  Heart,
  Sparkles,
  Minus,
  Plus,
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

  const validCategories = categories.filter((c): c is string => Boolean(c));

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
            {validCategories.slice(0, 3).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-70"
                style={{ color: theme.text }}
              >
                {category}
              </button>
            ))}
          </nav>

          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="flex items-center justify-center"
          >
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
            ) : (
              <span
                className="text-2xl lg:text-3xl font-semibold tracking-wider"
                style={{ fontFamily: NOVALUX_THEME.fontHeading, color: theme.primary }}
              >
                {storeName}
              </span>
            )}
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
        </div>
      )}
    </header>
  );
}

// --- Footer ---
function PreviewFooter({
  storeName,
  categories,
  onNavigate,
}: {
  storeName: string;
  categories: (string | null)[];
  onNavigate: (page: PageType) => void;
}) {
  const theme = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    footerBg: NOVALUX_THEME.footerBg,
    footerText: NOVALUX_THEME.footerText,
  };

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: NOVALUX_THEME.fontHeading }}
            >
              {storeName}
            </h4>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Curating exceptional products for those who appreciate the finer things in life.
            </p>
          </div>
          <div>
            <h5
              className="font-semibold uppercase text-sm tracking-wider mb-6"
              style={{ color: theme.accent }}
            >
              Quick Links
            </h5>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'home' })}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'home' })}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Shop All
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h5
              className="font-semibold uppercase text-sm tracking-wider mb-6"
              style={{ color: theme.accent }}
            >
              Contact
            </h5>
            <p className="text-white/70 text-sm">support@example.com</p>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center items-center text-sm text-white/50">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
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
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
          {currency}
          {product.price.toLocaleString()}
          {isSale && (
            <span className="text-xs line-through ml-2 text-gray-400">
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
  onNavigate,
}: {
  productId: number;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const product = getDemoProductById(productId);
  const [quantity, setQuantity] = useState(1);
  const theme = {
    primary: NOVALUX_THEME.primary,
    accent: NOVALUX_THEME.accent,
    text: NOVALUX_THEME.text,
    muted: NOVALUX_THEME.muted,
  };

  if (!product) return <div>Product not found</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] bg-white rounded-lg overflow-hidden">
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
            <h1 className="text-4xl font-serif mb-2" style={{ color: theme.primary }}>
              {product.title}
            </h1>
            <div className="text-2xl font-medium" style={{ color: theme.accent }}>
              {currency}
              {product.price.toLocaleString()}
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {product.description || 'Experience luxury with this premium product.'}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-full"
              >
                -
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-full"
              >
                +
              </button>
            </div>
            <button
              onClick={() => cart.addItem(product, quantity)}
              className="flex-1 py-3 rounded-full font-semibold text-white transition-transform active:scale-95"
              style={{ background: NOVALUX_THEME.primary }}
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

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-serif mb-4">Your Bag is Empty</h2>
        <button onClick={() => onNavigate({ type: 'home' })} className="border-b border-black pb-1">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif mb-12 text-center">Shopping Bag</h1>
      <div className="space-y-8">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-6 border-b pb-6">
            <div className="w-24 h-32 bg-gray-100 shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{item.title}</h3>
              <div className="text-gray-500 mb-4">
                {currency}
                {item.price.toLocaleString()}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1"
                  >
                    -
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => cart.removeItem(item.id)}
                  className="text-sm underline text-gray-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t pt-8">
        <div className="flex justify-between text-xl font-medium mb-8">
          <span>Total</span>
          <span>
            {currency}
            {cart.total.toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => onNavigate({ type: 'checkout' })}
          className="w-full py-4 text-white font-semibold rounded-full"
          style={{ background: NOVALUX_THEME.primary }}
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

  return (
    <div className="pt-32 pb-20 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif mb-8 text-center">Checkout</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          cart.clearCart();
          onNavigate({ type: 'order-success' });
        }}
        className="space-y-6"
      >
        <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded" />
        <input type="tel" placeholder="Phone" required className="w-full p-3 border rounded" />
        <textarea
          placeholder="Address"
          required
          className="w-full p-3 border rounded"
          rows={3}
        ></textarea>
        <div className="bg-gray-50 p-4 rounded flex justify-between font-medium">
          <span>Total</span>
          <span>
            {currency}
            {cart.total.toLocaleString()}
          </span>
        </div>
        <button
          type="submit"
          className="w-full py-4 text-white font-semibold rounded"
          style={{ background: NOVALUX_THEME.primary }}
        >
          Place Order
        </button>
      </form>
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
  return (
    <div className="min-h-screen">
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        {config?.bannerUrl && (
          <img
            src={config.bannerUrl}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="relative z-20 text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-serif mb-6">
            {config?.bannerText || 'Redefining Luxury'}
          </h1>
          <p className="text-xl mb-8 opacity-90">Discover our exclusive collection.</p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition"
          >
            Shop Now
          </button>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif text-center mb-12">Featured Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
function PreviewNovaLuxStore(props: StoreTemplateProps) {
  const { storeName, logo, categories, config, currency } = props;
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
      case 'category':
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
        <div className="bg-gray-900 text-white text-center py-2 text-xs font-bold tracking-widest uppercase">
          Preview Mode - Demo Store
        </div>
        <PreviewHeader
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />
        <main>{renderPage()}</main>
        <PreviewFooter storeName={storeName} categories={validCategories} onNavigate={navigate} />
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
}: StoreTemplateProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

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
                socialLinks={socialLinks}
                config={config}
              />

              <div
                className={`${announcement?.text ? 'h-[104px] lg:h-[120px]' : 'h-[66px] lg:h-[82px]'}`}
              />

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
                    ProductCardComponent={NovaLuxProductCard}
                  />
                );
              })}

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
                      style={{ background: NOVALUX_THEME.accentGradient }}
                      title="Call us"
                    >
                      <Phone className="h-7 w-7" style={{ color: THEME.primary }} />
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-25"
                        style={{ backgroundColor: THEME.accent }}
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
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
