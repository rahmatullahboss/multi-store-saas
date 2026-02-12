/**
 * BDShop Template - DUAL MODE ARCHITECTURE
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
 *
 * PREVIEW MODE (isPreview=true):
 * - Full self-contained store with demo data
 * - Internal state-based routing (no URL changes)
 * - Simulated cart and checkout
 *
 * LIVE MODE (isPreview=false):
 * - Homepage-only component (other pages use Remix routes)
 * - Real products from database via props
 * - Links to actual routes (/products/:id, /checkout, /cart)
 */

import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { BDSHOP_THEME } from './theme';
import { BDShopHeader } from './sections/Header';
import { BDShopFooter } from './sections/Footer';
import { BDShopProductPage } from './pages/ProductPage';
import { BDShopCartPage } from './pages/CartPage';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
  getRelatedProducts,
  searchDemoProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';
import {
  ShoppingCart,
  Search,
  X,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Phone,
  MessageCircle,
  Home,
} from 'lucide-react';
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
  addItem: (product: DemoProduct, quantity?: number) => void;
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

  const addItem = useCallback((product: DemoProduct, quantity = 1) => {
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
// PREVIEW MODE HEADER (with internal navigation)
// ============================================================================
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ type: 'search', query: searchQuery.trim() });
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header
        className="sticky top-0 z-40 shadow-md"
        style={{ backgroundColor: BDSHOP_THEME.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button onClick={() => onNavigate({ type: 'home' })} className="flex-shrink-0">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold text-white">{storeName}</span>
              )}
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`${storeName} এ খুঁজুন...`}
                  className="flex-1 px-4 py-2 rounded-l-md text-sm focus:outline-none bg-white text-gray-800"
                />
                <button
                  type="submit"
                  className="px-6 py-2 rounded-r-md"
                  style={{ backgroundColor: BDSHOP_THEME.accent }}
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={() => setSearchOpen(true)} className="md:hidden p-2 text-white">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate({ type: 'cart' })}
                className="relative p-2 text-white"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: BDSHOP_THEME.accent }}
                  >
                    {cart.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="hidden md:flex items-center gap-4 mt-2 text-white text-sm">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="hover:opacity-80 transition flex items-center gap-1"
            >
              <Home className="w-4 h-4" /> সকল ক্যাটাগরি
            </button>
            {categories
              .filter(Boolean)
              .slice(0, 6)
              .map((cat) => (
                <button
                  key={cat}
                  onClick={() => onNavigate({ type: 'category', category: cat! })}
                  className="hover:opacity-80 transition"
                >
                  {cat}
                </button>
              ))}
          </nav>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="p-4" style={{ backgroundColor: BDSHOP_THEME.primary }}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                autoFocus
                className="flex-1 px-4 py-3 rounded-lg bg-white"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-3 text-white">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// PREVIEW MODE PRODUCT CARD (with internal navigation)
// ============================================================================
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
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group border"
      style={{ borderColor: BDSHOP_THEME.borderLight }}
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imageUrl || ''}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span
            className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded"
            style={{ backgroundColor: BDSHOP_THEME.accent }}
          >
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            cart.addItem(product);
          }}
          className="absolute bottom-2 right-2 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
          style={{ backgroundColor: BDSHOP_THEME.primary }}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-sm line-clamp-2 mb-2" style={{ color: BDSHOP_THEME.text }}>
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold" style={{ color: BDSHOP_THEME.priceBlue }}>
            {formatPrice(product.price, currency)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs line-through text-gray-400">
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#E0F2FE', color: BDSHOP_THEME.priceBlue }}
          >
            স্টকে আছে
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE HOMEPAGE
// ============================================================================
function PreviewHomePage({
  storeName: _storeName,
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
  config: Record<string, unknown>;
  onNavigate: (page: PageType) => void;
}) {
  const topDeals = products.slice(0, 8);
  const speciallyForYou = products.slice(8);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BDSHOP_THEME.background }}>
      {/* Hero Section - BDShop Style Text Banner */}
      <section
        className="py-8 md:py-12"
        style={{
          background: `linear-gradient(135deg, ${BDSHOP_THEME.primary} 0%, #1E3A5F 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
              style={{ backgroundColor: BDSHOP_THEME.accent, color: 'white' }}
            >
              স্টক এভেইলেবল
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
              {(config?.bannerText || 'ইলেক্ট্রনিক পণ্যে সেরা ছাড়') as string}
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-5">
              সেরা ব্র্যান্ড, সেরা কোয়ালিটি, সেরা দাম
            </p>
            <button
              onClick={() => onNavigate({ type: 'category', category: categories[0] || '' })}
              className="px-8 py-3 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: BDSHOP_THEME.accent }}
            >
              এখনই শপিং করুন
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4" style={{ color: BDSHOP_THEME.text }}>
            ক্যাটাগরি
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories
              .filter(Boolean)
              .slice(0, 8)
              .map((cat) => (
                <button
                  key={cat}
                  onClick={() => onNavigate({ type: 'category', category: cat! })}
                  className="text-center hover:opacity-80 transition"
                >
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-full flex items-center justify-center text-xl mb-2"
                    style={{ backgroundColor: BDSHOP_THEME.background }}
                  >
                    📦
                  </div>
                  <span className="text-xs line-clamp-2" style={{ color: BDSHOP_THEME.text }}>
                    {cat}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Top Deals */}
      {topDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg p-4">
            <h2
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{ color: BDSHOP_THEME.primary }}
            >
              🔥 টপ ডিলস
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topDeals.map((product) => (
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
      )}

      {/* Specially For You */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4" style={{ color: BDSHOP_THEME.text }}>
            বিশেষভাবে আপনার জন্য
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {(speciallyForYou.length > 0 ? speciallyForYou : products).map((product) => (
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

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              {
                icon: <Truck className="w-8 h-8" />,
                title: 'দ্রুত ডেলিভারি',
                desc: 'সারাদেশে শিপিং',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'নিরাপদ পেমেন্ট',
                desc: 'একাধিক অপশন',
              },
              {
                icon: <RotateCcw className="w-8 h-8" />,
                title: 'সহজ রিটার্ন',
                desc: '৭ দিনের মধ্যে',
              },
              {
                icon: <Check className="w-8 h-8" />,
                title: '১০০% অরিজিনাল',
                desc: 'গুণমান নিশ্চিত',
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="mb-2" style={{ color: BDSHOP_THEME.primary }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE PRODUCT DETAIL PAGE
// ============================================================================
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
  const relatedProducts = getRelatedProducts(productId, 4);

  if (!product) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ backgroundColor: BDSHOP_THEME.background }}
      >
        <div className="text-center">
          <p className="text-gray-500 mb-4">পণ্য পাওয়া যায়নি</p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: BDSHOP_THEME.primary }}
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    cart.addItem(product, 1);
  };

  const handleBuyNow = () => {
    cart.addItem(product, 1);
    onNavigate({ type: 'checkout' });
  };

  return (
    <BDShopProductPage
      product={
        {
          id: product.id,
          storeId: 0,
          title: product.title,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          imageUrl: product.imageUrl,
          category: product.category,
          sku: `DEMO-${product.id}`,
          inventory: product.stock || 100,
          images: null,
        } as any
      }
      currency={currency}
      relatedProducts={relatedProducts.map(
        (p) =>
          ({
            id: p.id,
            storeId: 0,
            title: p.title,
            description: p.description,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            imageUrl: p.imageUrl,
            category: p.category,
          }) as any
      )}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
      onNavigateProduct={(pid) => onNavigate({ type: 'product', productId: pid })}
    />
  );
}

// ============================================================================
// PREVIEW MODE CART PAGE
// ============================================================================
function PreviewCartPageComponent({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    productId: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
  }));

  return (
    <BDShopCartPage
      items={cartItems}
      currency={currency}
      onUpdateQuantity={(itemId, qty) => cart.updateQuantity(itemId, qty)}
      onRemoveItem={(itemId) => cart.removeItem(itemId)}
      onCheckout={() => onNavigate({ type: 'checkout' })}
    />
  );
}

// ============================================================================
// PREVIEW MODE CATEGORY PAGE
// ============================================================================
function PreviewCategoryPage({
  category,
  products,
  currency,
  onNavigate,
}: {
  category: string;
  products: DemoProduct[];
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const filtered = products.filter((p) => p.category === category);

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: BDSHOP_THEME.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => onNavigate({ type: 'home' })} className="hover:underline">
            হোম
          </button>
          <span>/</span>
          <span style={{ color: BDSHOP_THEME.text }}>{category}</span>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold" style={{ color: BDSHOP_THEME.text }}>
              {category}
            </h1>
            <span className="text-sm text-gray-500">{filtered.length}টি পণ্য</span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {filtered.map((product) => (
                <PreviewProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">এই ক্যাটাগরিতে কোন পণ্য নেই</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE SEARCH PAGE
// ============================================================================
function PreviewSearchPage({
  query,
  currency,
  onNavigate,
}: {
  query: string;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const results = searchDemoProducts(query);

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: BDSHOP_THEME.background }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg p-4">
          <h1 className="text-xl font-bold mb-4" style={{ color: BDSHOP_THEME.text }}>
            "{query}" এর জন্য সার্চ রেজাল্ট
          </h1>
          <p className="text-sm text-gray-500 mb-6">{results.length}টি পণ্য পাওয়া গেছে</p>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {results.map((product) => (
                <PreviewProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">"{query}" এর জন্য কোন পণ্য পাওয়া যায়নি</p>
              <button
                onClick={() => onNavigate({ type: 'home' })}
                className="px-6 py-2 rounded-lg text-white"
                style={{ backgroundColor: BDSHOP_THEME.primary }}
              >
                শপিং চালিয়ে যান
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE CHECKOUT PAGE (BDShop Style)
// ============================================================================
function PreviewCheckoutPage({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });
  const [deliveryOption, setDeliveryOption] = useState<'inside' | 'outside'>('inside');

  const deliveryFee = deliveryOption === 'outside' ? 120 : cart.total >= 500 ? 0 : 60;
  const grandTotal = cart.total + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cart.clearCart();
    onNavigate({ type: 'order-success' });
  };

  if (cart.items.length === 0) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ backgroundColor: BDSHOP_THEME.background }}
      >
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">আপনার কার্ট খালি</p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: BDSHOP_THEME.primary }}
          >
            শপিং শুরু করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BDSHOP_THEME.background }}>
      {/* BDShop Checkout Header */}
      <div
        className="py-6"
        style={{ background: `linear-gradient(135deg, ${BDSHOP_THEME.primary} 0%, #1E3A5F 100%)` }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">চেকআউট</h1>
          <p className="text-white/70 text-sm mt-1">নিরাপদ অর্ডার প্রসেস</p>

          {/* Step Indicators */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold"
                style={{ color: BDSHOP_THEME.primary }}
              >
                ১
              </div>
              <span className="text-white text-sm hidden md:inline">ডেলিভারি তথ্য</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold text-white">
                ২
              </div>
              <span className="text-white/70 text-sm hidden md:inline">পেমেন্ট</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold text-white">
                ৩
              </div>
              <span className="text-white/70 text-sm hidden md:inline">সম্পন্ন</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Shipping & Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping Info - BDShop Style */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F5FF' }}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: BDSHOP_THEME.primary }}
                >
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: BDSHOP_THEME.primary }}>
                    ডেলিভারি তথ্য
                  </h2>
                  <p className="text-xs text-gray-500">আপনার সঠিক তথ্য দিন</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: BDSHOP_THEME.text }}
                    >
                      আপনার নাম
                    </label>
                    <input
                      type="text"
                      placeholder="সম্পূর্ণ নাম লিখুন"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                      style={{ borderColor: formData.name ? BDSHOP_THEME.primary : '#E5E7EB' }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: BDSHOP_THEME.text }}
                    >
                      মোবাইল নম্বর
                    </label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                      style={{ borderColor: formData.phone ? BDSHOP_THEME.primary : '#E5E7EB' }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: BDSHOP_THEME.text }}
                  >
                    সম্পূর্ণ ঠিকানা
                  </label>
                  <textarea
                    placeholder="বাসা নং, রোড, এলাকা..."
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                    style={{ borderColor: formData.address ? BDSHOP_THEME.primary : '#E5E7EB' }}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: BDSHOP_THEME.text }}
                    >
                      শহর/জেলা
                    </label>
                    <input
                      type="text"
                      placeholder="আপনার জেলা"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                      style={{ borderColor: formData.city ? BDSHOP_THEME.primary : '#E5E7EB' }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: BDSHOP_THEME.text }}
                    >
                      অর্ডার নোট
                    </label>
                    <input
                      type="text"
                      placeholder="বিশেষ নির্দেশনা (ঐচ্ছিক)"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Options - BDShop Style Cards */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-3" style={{ backgroundColor: '#F0F5FF' }}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: BDSHOP_THEME.primary }}
                >
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: BDSHOP_THEME.primary }}>
                    ডেলিভারি অপশন
                  </h2>
                  <p className="text-xs text-gray-500">আপনার পছন্দের ডেলিভারি বেছে নিন</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('inside')}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      deliveryOption === 'inside' ? '' : 'hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: deliveryOption === 'inside' ? BDSHOP_THEME.primary : '#E5E7EB',
                      backgroundColor: deliveryOption === 'inside' ? '#F0F5FF' : 'white',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold" style={{ color: BDSHOP_THEME.primary }}>
                        ঢাকার ভেতরে
                      </span>
                      {deliveryOption === 'inside' && <Check className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">১-২ কর্মদিবসে ডেলিভারি</p>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color: cart.total >= 500 ? BDSHOP_THEME.success : BDSHOP_THEME.text,
                      }}
                    >
                      {cart.total >= 500 ? '🎉 ফ্রি ডেলিভারি' : formatPrice(60, currency)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryOption('outside')}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      deliveryOption === 'outside' ? '' : 'hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: deliveryOption === 'outside' ? BDSHOP_THEME.primary : '#E5E7EB',
                      backgroundColor: deliveryOption === 'outside' ? '#F0F5FF' : 'white',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold" style={{ color: BDSHOP_THEME.primary }}>
                        ঢাকার বাইরে
                      </span>
                      {deliveryOption === 'outside' && <Check className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">৩-৫ কর্মদিবসে ডেলিভারি</p>
                    <p className="text-lg font-bold" style={{ color: BDSHOP_THEME.text }}>
                      {currency}120
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items - BDShop Style  */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: '#F0F5FF' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: BDSHOP_THEME.primary }}
                  >
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold" style={{ color: BDSHOP_THEME.primary }}>
                      অর্ডার আইটেম
                    </h2>
                    <p className="text-xs text-gray-500">{cart.itemCount}টি পণ্য</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'cart' })}
                  className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-white"
                  style={{ color: BDSHOP_THEME.primary }}
                >
                  এডিট করুন
                </button>
              </div>
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div
                      className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border"
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-contain bg-white p-1"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium text-sm line-clamp-2"
                        style={{ color: BDSHOP_THEME.text }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">পরিমাণ: {item.quantity}টি</p>
                      <p className="font-bold mt-2" style={{ color: BDSHOP_THEME.primary }}>
                        {formatPrice(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-4">
            <div
              className="rounded-xl shadow-sm overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${BDSHOP_THEME.primary} 0%, #1E3A5F 100%)`,
              }}
            >
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-4">অর্ডার সামারি</h3>
                <div className="space-y-3 text-white/90">
                  <div className="flex justify-between">
                    <span>সাবটোটাল ({cart.itemCount}টি)</span>
                    <span className="font-medium">{formatPrice(cart.total, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>শিপিং</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-300' : ''}`}>
                      {deliveryFee === 0 ? 'ফ্রি! 🎉' : formatPrice(deliveryFee, currency)}
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="flex justify-between text-xl">
                      <span className="font-bold text-white">মোট</span>
                      <span className="font-bold text-white">
                        {formatPrice(grandTotal, currency)}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">সকল ট্যাক্স সহ</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 font-bold text-lg text-white/90 hover:text-white transition-colors"
                style={{ backgroundColor: BDSHOP_THEME.accent }}
              >
                ✓ অর্ডার কনফার্ম করুন
              </button>
            </div>

            <p className="text-xs text-center text-gray-400 px-4">
              ⚠️ এটি প্রিভিউ মোড। কোন অর্ডার প্রসেস হবে না।
            </p>

            {/* Payment Methods - BDShop Style */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold mb-3" style={{ color: BDSHOP_THEME.primary }}>
                পেমেন্ট অপশন
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'ক্যাশ অন ডেলিভারি', icon: '💵' },
                  { name: 'বিকাশ', icon: '📱' },
                  { name: 'নগদ', icon: '💳' },
                  { name: 'রকেট', icon: '🚀' },
                ].map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center gap-2 p-2.5 rounded-lg border"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <span>{method.icon}</span>
                    <span className="text-xs font-medium">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm font-medium text-green-800">১০০% নিরাপদ চেকআউট</p>
              <p className="text-xs text-green-600 mt-1">SSL এনক্রিপ্টেড পেমেন্ট</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE ORDER SUCCESS PAGE
// ============================================================================
function PreviewOrderSuccessPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center"
      style={{ backgroundColor: BDSHOP_THEME.background }}
    >
      <div className="text-center bg-white rounded-lg p-8 shadow-sm max-w-md">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#D1FAE5' }}
        >
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: BDSHOP_THEME.text }}>
          অর্ডার সফল!
        </h1>
        <p className="text-gray-500 mb-6">
          আপনার অর্ডারের জন্য ধন্যবাদ। এটি একটি ডেমো, তাই কোন অর্ডার প্লেস হয়নি।
        </p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-8 py-3 rounded-lg font-medium text-white"
          style={{ backgroundColor: BDSHOP_THEME.primary }}
        >
          শপিং চালিয়ে যান
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE FOOTER
// ============================================================================
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
    <footer style={{ backgroundColor: BDSHOP_THEME.footerBg }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-white">{storeName}</h3>
            <p className="text-sm text-gray-400">আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য।</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">ক্যাটাগরি</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {categories
                .filter(Boolean)
                .slice(0, 5)
                .map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => onNavigate({ type: 'category', category: cat! })}
                      className="hover:text-white"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">সাহায্য</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button className="hover:text-white">প্রশ্নোত্তর</button>
              </li>
              <li>
                <button className="hover:text-white">শিপিং</button>
              </li>
              <li>
                <button className="hover:text-white">রিটার্ন</button>
              </li>
              <li>
                <button className="hover:text-white">যোগাযোগ</button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">পেমেন্ট মেথড</h4>
            <div className="flex flex-wrap gap-2">
              {['বিকাশ', 'নগদ', 'ভিসা', 'COD'].map((method) => (
                <span key={method} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {storeName}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// FULL PREVIEW STORE (State-based routing, demo data)
// ============================================================================
function PreviewBDShopStore(props: StoreTemplateProps) {
  const { storeName, logo, config, currency } = props;
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
            config={(config || {}) as unknown as Record<string, unknown>}
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
      case 'category':
        return (
          <PreviewCategoryPage
            category={currentPage.category}
            products={products}
            currency={currency}
            onNavigate={navigate}
          />
        );
      case 'search':
        return (
          <PreviewSearchPage query={currentPage.query} currency={currency} onNavigate={navigate} />
        );
      case 'cart':
        return <PreviewCartPageComponent currency={currency} onNavigate={navigate} />;
      case 'checkout':
        return <PreviewCheckoutPage currency={currency} onNavigate={navigate} />;
      case 'order-success':
        return <PreviewOrderSuccessPage onNavigate={navigate} />;
      default:
        return (
          <PreviewHomePage
            storeName={storeName}
            products={products}
            categories={validCategories}
            currency={currency}
            config={(config || {}) as unknown as Record<string, unknown>}
            onNavigate={navigate}
          />
        );
    }
  };

  return (
    <CartProvider>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: BDSHOP_THEME.background,
          fontFamily: "'Inter', 'NotoSans', Arial, sans-serif",
        }}
      >
        {/* Header */}
        <PreviewHeader
          storeName={storeName}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
        />

        {/* Main Content */}
        <main>{renderPage()}</main>

        {/* Footer */}
        <PreviewFooter storeName={storeName} categories={validCategories} onNavigate={navigate} />

        {/* Scrollbar Hide CSS */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Real routes, real data)
// ============================================================================
function LiveBDShopHomepage(props: StoreTemplateProps) {
  const {
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
  } = props;

  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: BDSHOP_THEME.background,
                fontFamily: "'Inter', 'NotoSans', Arial, sans-serif",
              }}
            >
              <BDShopHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                isPreview={false}
                config={config}
              />

              {/* Main Content with Dynamic Sections */}
              <main className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
                {(
                  config?.sections ?? [
                    {
                      id: 'hero',
                      type: 'hero',
                      settings: {
                        heading: config?.bannerText || 'Amazing Deals Await!',
                        subheading: 'Shop the best products at unbeatable prices',
                        primaryAction: { label: 'SHOP NOW', url: '/?category=all' },
                        secondaryAction: { label: 'Browse Categories', url: '/#categories' },
                        image: config?.bannerUrl,
                        layout: 'marketplace',
                        alignment: 'left',
                      },
                    },
                    {
                      id: 'categories',
                      type: 'category-list',
                      settings: {
                        layout: 'scroll',
                        limit: 10,
                      },
                    },
                    {
                      id: 'flash-sale',
                      type: 'product-scroll',
                      settings: {
                        heading: 'Top Deals',
                        mode: 'flash-sale',
                        limit: 12,
                      },
                    },
                    {
                      id: 'products',
                      type: 'product-grid',
                      settings: {
                        heading: currentCategory || 'Specially for You',
                        productCount: 18,
                        paddingTop: 'medium',
                        paddingBottom: 'medium',
                      },
                    },
                    {
                      id: 'features',
                      type: 'features',
                      settings: {
                        heading: 'Trusted by Bangladesh Shoppers',
                        subheading: 'Secure payments, fast delivery, easy returns.',
                        backgroundColor: 'white',
                      },
                    },
                  ]
                ).map((section: any) => {
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
                      theme={BDSHOP_THEME}
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

              <BDShopFooter
                storeName={storeName}
                logo={logo}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                categories={categories}
              />

              {/* Floating Contact Buttons */}
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

              {/* Custom Styles */}
              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// MAIN EXPORT - Routes to Preview or Live mode
// ============================================================================
export function BDShopTemplate(props: StoreTemplateProps) {
  // PREVIEW MODE: Full self-contained demo store with internal routing
  if (props.isPreview) {
    return <PreviewBDShopStore {...props} />;
  }

  // LIVE MODE: Homepage with real data and real Remix routes
  return <LiveBDShopHomepage {...props} />;
}

export default BDShopTemplate;
