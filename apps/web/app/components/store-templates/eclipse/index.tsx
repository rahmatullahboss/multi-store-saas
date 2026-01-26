/**
 * Eclipse Premium Template (2025 Edition)
 *
 * A futuristic, high-performance dark mode template with neon accents,
 * spotlight interactions, and bento-grid layouts.
 *
 * DUAL MODE ARCHITECTURE:
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import {
  useState,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { Link, useSearchParams } from '@remix-run/react';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  Star,
  Instagram,
  Facebook,
  Twitter,
  ShoppingBag,
  Heart,
  User,
  Zap,
  Globe,
  Monitor,
  Package,
  Minus,
  Plus,
  Check,
  Phone,
  MessageCircle,
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

import { ECLIPSE_THEME } from './theme';
import { EclipseHeader } from './sections/Header';
import { EclipseFooter } from './sections/Footer';
import { EclipseProductPage } from './pages/ProductPage';
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ type: 'search', query: searchQuery });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500">
      <div
        className="w-full max-w-5xl rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300"
        style={{
          backgroundColor: ECLIPSE_THEME.headerBg,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${ECLIPSE_THEME.border}`,
          boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="flex items-center gap-2 group"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12"
            style={{ background: ECLIPSE_THEME.accentGradient }}
          >
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          {logo ? (
            <img src={logo} alt={storeName} className="h-6 object-contain" />
          ) : (
            <span
              className="font-bold text-lg tracking-tight text-white"
              style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
            >
              {storeName}
            </span>
          )}
        </button>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="text-sm font-medium hover:text-white transition-colors text-white/70"
          >
            Store
          </button>
          {categories.slice(0, 3).map(
            (cat) =>
              cat && (
                <button
                  key={cat}
                  onClick={() => onNavigate({ type: 'category', category: cat })}
                  className="text-sm font-medium hover:text-white transition-colors text-white/70 hover:text-violet-400"
                >
                  {cat}
                </button>
              )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate({ type: 'cart' })} className="relative group p-2">
            <ShoppingBag className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
            {cart.itemCount > 0 && (
              <span
                className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: ECLIPSE_THEME.accent, color: 'white' }}
              >
                {cart.itemCount}
              </span>
            )}
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-gray-900 rounded-2xl p-4 border border-white/10 flex flex-col gap-4">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50"
            />
          </form>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="text-left text-white py-2"
            >
              All Products
            </button>
            {categories.map(
              (cat) =>
                cat && (
                  <button
                    key={cat}
                    onClick={() => {
                      onNavigate({ type: 'category', category: cat });
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-white/70 py-2"
                  >
                    {cat}
                  </button>
                )
            )}
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
  return (
    <footer
      className="relative overflow-hidden pt-20 pb-10 px-4"
      style={{ backgroundColor: ECLIPSE_THEME.footerBg }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: ECLIPSE_THEME.spotlightGradient, filter: 'blur(80px)' }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <h2
              className="text-4xl font-bold leading-tight text-white"
              style={{ fontFamily: ECLIPSE_THEME.fontHeading }}
            >
              {storeName}
            </h2>
            <p className="text-white/50 max-w-xs">Defining the future of commerce.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white">Explore</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'home' })}
                  className="hover:text-white transition-colors"
                >
                  Store
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/30">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
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
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
      className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
      style={{ fontFamily: ECLIPSE_THEME.fontBody }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
          opacity: opacity,
          zIndex: 0,
        }}
      />
      <div className="relative z-10 h-full flex flex-col">
        <div className="block relative aspect-[4/5] overflow-hidden bg-black/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              NO IMAGE
            </div>
          )}
          {isSale && (
            <span className="absolute top-4 left-4 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Sale
            </span>
          )}
          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                cart.addItem(product);
              }}
              className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-white font-medium text-lg leading-snug mb-2 group-hover:text-violet-400 transition-colors">
            {product.title}
          </h3>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-white font-semibold">
              {currency}
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
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

  const serializedProduct = {
    id: product.id,
    storeId: 0,
    title: product.title,
    description: product.description || '',
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    imageUrl: product.imageUrl,
    category: product.category,
    images: product.images ? JSON.stringify(product.images) : null,
    inventory: product.stock || 0,
    sku: product.sku || '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const serializedRelated = relatedProducts.map(
    (p) =>
      ({
        id: p.id,
        storeId: 0,
        title: p.title,
        description: p.description || '',
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        imageUrl: p.imageUrl,
        category: p.category,
        images: p.images ? JSON.stringify(p.images) : null,
        inventory: p.stock || 0,
        sku: p.sku || '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as any
  );

  return (
    <EclipseProductPage
      product={serializedProduct}
      currency={currency}
      relatedProducts={serializedRelated}
      isPreview={true}
      onNavigate={(path) => {
        if (path === '/') onNavigate({ type: 'home' });
        if (path === '/products') onNavigate({ type: 'home' });
      }}
      onNavigateProduct={(id) => onNavigate({ type: 'product', productId: id })}
    />
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-20 text-white">
        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-3xl font-bold mb-4">Your Bag is Empty</h2>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="border-b border-white pb-1 font-bold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-12 text-center">Shopping Bag</h1>
      <div className="space-y-8">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-6 border-b border-white/10 pb-8">
            <div className="w-24 h-32 bg-white/5 rounded-xl overflow-hidden shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <div className="text-white/50">
                  {currency}
                  {item.price.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-white/5 rounded-full px-2">
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
      <div className="mt-12 bg-white/5 p-8 rounded-3xl">
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
          style={{ background: ECLIPSE_THEME.accent }}
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
    <div className="pt-32 pb-20 px-4 max-w-2xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-12 text-center">Checkout</h1>
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
          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 transition-colors outline-none text-white placeholder-white/50"
        />
        <input
          type="tel"
          placeholder="Phone"
          required
          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 transition-colors outline-none text-white placeholder-white/50"
        />
        <textarea
          placeholder="Address"
          required
          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 transition-colors outline-none text-white placeholder-white/50"
          rows={3}
        ></textarea>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>
            {currency}
            {cart.total.toLocaleString()}
          </span>
        </div>
        <button
          type="submit"
          className="w-full py-4 text-white font-bold rounded-full shadow-lg"
          style={{ background: ECLIPSE_THEME.accent }}
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
    <div className="min-h-screen text-white">
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          {config?.bannerUrl && (
            <img
              src={config.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-5xl md:text-8xl font-bold mb-6 tracking-tight">
            {config?.bannerText || 'Future Ready'}
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-medium text-white/80">
            Experience the next generation of shopping.
          </p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform bg-white text-black"
          >
            Explore Now
          </button>
        </div>
      </section>

      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">New Arrivals</h2>
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
function PreviewEclipseStore(props: StoreTemplateProps) {
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
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-white">
            <h1 className="text-4xl font-bold mb-12 text-center">{currentPage.category}</h1>
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
      case 'order-success':
        return (
          <div className="min-h-[60vh] flex items-center justify-center pt-20 flex-col text-white">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
              <Check size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Order Placed!</h2>
            <button
              onClick={() => navigate({ type: 'home' })}
              className="border-b-2 border-white pb-1 font-bold"
            >
              Back to Home
            </button>
          </div>
        );
      case 'search':
        return (
          <div className="pt-32 text-center text-white">
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
          backgroundColor: ECLIPSE_THEME.background,
          fontFamily: ECLIPSE_THEME.fontBody,
          color: ECLIPSE_THEME.text,
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div className="bg-violet-600 text-white text-center py-2 text-xs font-bold tracking-widest uppercase">
          Preview Mode
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
export function LiveEclipseTemplate({
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
  isPreview,
}: StoreTemplateProps) {
  const [scrolled, setScrolled] = useState(false);
  const count = useCartCount();
  const formatPrice = useFormatPrice();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = {
    primary: ECLIPSE_THEME.text,
    accent: ECLIPSE_THEME.accent,
    background: ECLIPSE_THEME.background,
    text: ECLIPSE_THEME.text,
    headingFont: ECLIPSE_THEME.fontHeading,
  };

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen selection:bg-violet-500 selection:text-white"
              style={{
                backgroundColor: ECLIPSE_THEME.background,
                color: ECLIPSE_THEME.text,
                fontFamily: ECLIPSE_THEME.fontBody,
              }}
            >
              <link
                href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
              />

              <EclipseHeader storeName={storeName} logo={logo} categories={validCategories} />

              <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24 pb-20">
                {(config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) return null;

                  return (
                    <div key={section.id} className="relative">
                      <SectionComponent
                        settings={section.settings}
                        theme={theme}
                        products={products}
                        categories={categories}
                        storeId={storeId}
                        currency={currency}
                        store={{ name: storeName }}
                        ProductCardComponent={EclipseProductCard}
                      />
                      <div
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-20"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)',
                        }}
                      />
                    </div>
                  );
                })}
              </main>

              <EclipseFooter
                storeName={storeName}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
              />

              <style>{`
                .section-container { color: ${ECLIPSE_THEME.text}; }
                .section-heading { font-family: ${ECLIPSE_THEME.fontHeading}; letter-spacing: -0.02em; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { bg: #000; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #555; }
              `}</style>
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// COMPONENT: SPOTLIGHT PRODUCT CARD
// ============================================================================
interface EclipseProductCardProps {
  product: any;
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
  addToCartText?: string;
  showWishlist?: boolean;
}

function EclipseProductCard({
  product,
  storeId,
  formatPrice,
  isPreview,
  addToCartText,
  showWishlist,
}: EclipseProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const {
    price,
    compareAtPrice: displayCompareAt,
    isFlashSale,
    isOnSale,
  } = useProductPrice(product);
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10"
      style={{
        fontFamily: ECLIPSE_THEME.fontBody,
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
          opacity: opacity,
          zIndex: 0,
        }}
      />

      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.4), transparent 40%)`,
          WebkitMaskComposite: 'xor',
          opacity: opacity,
          zIndex: 10,
          border: '1px solid transparent',
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        <Link
          to={`/products/${product.id}`}
          className="block relative aspect-[4/5] overflow-hidden bg-black/50"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              NO IMAGE
            </div>
          )}

          {isOnSale && (
            <span
              className={`absolute top-4 left-4 ${isFlashSale ? 'bg-red-600' : 'bg-violet-600'} text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide`}
            >
              {isFlashSale ? 'Flash Sale' : 'Sale'}
            </span>
          )}

          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
            >
              <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <button className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
              <ShoppingBag size={18} />
            </button>
          </div>
        </Link>

        <div className="p-5 flex-1 flex flex-col">
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="text-white font-medium text-lg leading-snug mb-2 group-hover:text-violet-400 transition-colors">
              {product.title}
            </h3>
          </Link>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{formatPrice(price)}</span>
              {isOnSale && displayCompareAt && (
                <span className="text-white/40 line-through text-sm">
                  {formatPrice(displayCompareAt)}
                </span>
              )}
            </div>

            <div className="md:hidden">
              <AddToCartButton
                productId={product.id}
                storeId={storeId}
                className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-full"
                isPreview={isPreview}
              >
                {addToCartText || 'Add'}
              </AddToCartButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT - Routes to Preview or Live mode
// ============================================================================
export function EclipseTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewEclipseStore {...props} />;
  }
  return <LiveEclipseTemplate {...props} />;
}

export default EclipseTemplate;
