/**
 * TurboSale Template (BD - High Urgency)
 *
 * Target: Bangladesh Drop-shipping & Single Product Sales
 *
 * DUAL MODE ARCHITECTURE (NovaLux Pattern):
 * 1. PREVIEW MODE (isPreview=true): Self-contained state-based routing
 * 2. LIVE MODE (isPreview=false): Real Remix routes
 */

import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { Link } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { SECTION_REGISTRY, type StoreSection } from '~/components/store-sections/registry';
import { TURBO_SALE_THEME } from './theme';
import { TurboSaleHeader } from './sections/Header';
import { TurboSaleFooter } from './sections/Footer';
import {
  Phone,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Star,
  Truck,
  Shield,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
  type DemoProduct,
} from '~/utils/store-preview-data';
import { formatPrice } from '~/lib/formatting';

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
  businessInfo,
}: {
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  onNavigate: (page: PageType) => void;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
}) {
  const cart = usePreviewCart();
  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <>
      {/* Urgency Bar */}
      <div
        className="text-center py-2 text-sm font-bold text-white"
        style={{ backgroundColor: TURBO_SALE_THEME.primary }}
      >
        🎁 সারা দেশে ফ্রি হোম ডেলিভারি! সীমিত স্টক!
      </div>

      <header
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: TURBO_SALE_THEME.headerBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 object-contain" />
              ) : (
                <span
                  className="text-xl lg:text-2xl font-bold"
                  style={{ color: TURBO_SALE_THEME.primary }}
                >
                  {storeName}
                </span>
              )}
            </button>

            <nav className="hidden lg:flex items-center gap-4">
              {validCategories.slice(0, 4).map((category) => (
                <button
                  key={category}
                  onClick={() => onNavigate({ type: 'category', category })}
                  className="text-sm font-medium transition-colors hover:text-red-600"
                  style={{ color: TURBO_SALE_THEME.text }}
                >
                  {category}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {businessInfo?.phone && (
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: TURBO_SALE_THEME.accent, color: 'white' }}
                >
                  <Phone className="w-4 h-4" /> কল করুন
                </a>
              )}
              <button
                onClick={() => onNavigate({ type: 'cart' })}
                className="relative p-2.5 rounded-full transition-all hover:bg-gray-100"
              >
                <ShoppingBag className="w-6 h-6" style={{ color: TURBO_SALE_THEME.primary }} />
                {cart.itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: TURBO_SALE_THEME.primary }}
                  >
                    {cart.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
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
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="relative aspect-square overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {isSale && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
            style={{ backgroundColor: TURBO_SALE_THEME.primary }}
          >
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className="font-medium text-sm mb-2 line-clamp-2"
          style={{ color: TURBO_SALE_THEME.text }}
        >
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3"
              fill={i < 4 ? '#FFA500' : 'none'}
              style={{ color: '#FFA500' }}
            />
          ))}
          <span className="text-xs text-gray-500">(১২৩)</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold" style={{ color: TURBO_SALE_THEME.primary }}>
              {formatPrice(product.price, currency)}
            </span>
            {isSale && (
              <span className="text-xs line-through text-gray-400 ml-2">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            cart.addItem(product);
          }}
          className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: TURBO_SALE_THEME.accent }}
        >
          কার্টে যোগ করুন
        </button>
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

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <div className="pt-4 pb-20 px-4 max-w-7xl mx-auto">
      <button
        onClick={() => onNavigate({ type: 'home' })}
        className="flex items-center gap-2 mb-4 text-gray-600"
      >
        <ArrowLeft className="w-4 h-4" /> পিছনে যান
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl overflow-hidden bg-white">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="space-y-6">
          {isSale && (
            <div
              className="inline-block px-3 py-1 rounded text-sm font-bold text-white"
              style={{ backgroundColor: TURBO_SALE_THEME.primary }}
            >
              🔥 {discount}% ছাড়!
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: TURBO_SALE_THEME.text }}>
            {product.title}
          </h1>

          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5" fill="#FFA500" style={{ color: '#FFA500' }} />
            ))}
            <span className="text-gray-600">(১২৩ রিভিউ)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold" style={{ color: TURBO_SALE_THEME.primary }}>
              {formatPrice(product.price, currency)}
            </span>
            {isSale && (
              <span className="text-xl line-through text-gray-400">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description || 'প্রিমিয়াম কোয়ালিটির এই পণ্যটি আপনার জন্য উপযুক্ত।'}
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Truck className="w-6 h-6 mx-auto mb-2" style={{ color: TURBO_SALE_THEME.accent }} />
              <span className="text-xs font-medium">ফ্রি ডেলিভারি</span>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <span className="text-xs font-medium">১০০% অরিজিনাল</span>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span className="text-xs font-medium">১-৩ দিনে ডেলিভারি</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              cart.addItem(product, quantity);
              onNavigate({ type: 'checkout' });
            }}
            className="w-full py-4 rounded-xl font-bold text-white text-lg animate-pulse"
            style={{ backgroundColor: TURBO_SALE_THEME.accent }}
          >
            এখনই অর্ডার করুন
          </button>

          <button
            onClick={() => cart.addItem(product, quantity)}
            className="w-full py-4 rounded-xl font-bold border-2"
            style={{ borderColor: TURBO_SALE_THEME.accent, color: TURBO_SALE_THEME.accent }}
          >
            কার্টে যোগ করুন
          </button>
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-bold mb-4">আপনার কার্ট খালি</h2>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-8 py-3 rounded-full font-bold text-white"
          style={{ backgroundColor: TURBO_SALE_THEME.accent }}
        >
          শপিং করুন
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">আপনার কার্ট</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">{item.title}</h3>
              <div className="font-bold mb-2" style={{ color: TURBO_SALE_THEME.primary }}>
                {formatPrice(item.price, currency)}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1"
                  >
                    -
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1"
                  >
                    +
                  </button>
                </div>
                <button onClick={() => cart.removeItem(item.id)} className="text-sm text-red-500">
                  মুছুন
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>মোট</span>
          <span style={{ color: TURBO_SALE_THEME.primary }}>
            {formatPrice(cart.total, currency)}
          </span>
        </div>
        <button
          onClick={() => onNavigate({ type: 'checkout' })}
          className="w-full py-4 text-white font-bold rounded-xl"
          style={{ backgroundColor: TURBO_SALE_THEME.accent }}
        >
          চেকআউট করুন
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
  const shippingCost = cart.total >= 1000 ? 0 : 60;

  return (
    <div className="pb-20 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">অর্ডার করুন</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          cart.clearCart();
          onNavigate({ type: 'order-success' });
        }}
        className="space-y-4"
      >
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold border-b pb-2">আপনার তথ্য</h3>
          <input
            type="text"
            placeholder="আপনার নাম *"
            required
            className="w-full p-3 border rounded-lg outline-none focus:border-green-500"
          />
          <input
            type="tel"
            placeholder="মোবাইল নম্বর *"
            required
            className="w-full p-3 border rounded-lg outline-none focus:border-green-500"
          />
          <textarea
            placeholder="সম্পূর্ণ ঠিকানা *"
            required
            rows={3}
            className="w-full p-3 border rounded-lg outline-none focus:border-green-500"
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-bold border-b pb-2 mb-4">অর্ডার সামারি</h3>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity, currency)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>সাবটোটাল</span>
              <span>{formatPrice(cart.total, currency)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>ডেলিভারি চার্জ</span>
              <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                {shippingCost === 0 ? 'ফ্রি' : formatPrice(shippingCost, currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>মোট</span>
              <span style={{ color: TURBO_SALE_THEME.primary }}>
                {formatPrice(cart.total + shippingCost, currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-sm text-center">💵 ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা দিন</p>
        </div>

        <button
          type="submit"
          className="w-full py-4 text-white font-bold rounded-xl text-lg"
          style={{ backgroundColor: TURBO_SALE_THEME.accent }}
        >
          অর্ডার কনফার্ম করুন
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  onNavigate: (page: PageType) => void;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-12 px-4 text-center"
        style={{ backgroundColor: TURBO_SALE_THEME.secondary }}
      >
        <h1
          className="text-3xl md:text-5xl font-bold mb-4"
          style={{ color: TURBO_SALE_THEME.text }}
        >
          {config?.bannerText || 'সমস্যার স্থায়ী সমাধান চান?'}
        </h1>
        <p className="text-lg mb-6 text-gray-600">
          মাত্র ৭ দিনে পরিবর্তন লক্ষ্য করুন। ১০০% অরজিনাল পণ্য।
        </p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-8 py-4 rounded-full font-bold text-white text-lg"
          style={{ backgroundColor: TURBO_SALE_THEME.accent }}
        >
          এখনই অর্ডার করুন
        </button>
      </section>

      {/* Trust Badges */}
      <section className="py-6 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          <div className="text-center">
            <Truck className="w-8 h-8 mx-auto mb-2" style={{ color: TURBO_SALE_THEME.accent }} />
            <span className="text-xs font-medium">ফ্রি ডেলিভারি</span>
          </div>
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <span className="text-xs font-medium">১০০% অরিজিনাল</span>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <span className="text-xs font-medium">দ্রুত ডেলিভারি</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">জনপ্রিয় পণ্যসমূহ</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
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

// PreviewFooter removed - using TurboSaleFooter instead

// ============================================================================
// MAIN PREVIEW STORE CONTAINER
// ============================================================================
function PreviewTurboSaleStore(props: StoreTemplateProps) {
  const {
    storeName,
    logo,
    categories,
    config,
    currency,
    businessInfo,
    socialLinks: social,
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
          <div className="py-8 px-4 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-center">{currentPage.category}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="min-h-[60vh] flex items-center justify-center flex-col px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-green-100">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">অর্ডার কনফার্মড!</h2>
            <p className="text-gray-600 mb-6 text-center">
              ধন্যবাদ! আপনার অর্ডার সফলভাবে প্লেস হয়েছে।
            </p>
            <button
              onClick={() => navigate({ type: 'home' })}
              className="px-8 py-3 rounded-full font-bold text-white"
              style={{ backgroundColor: TURBO_SALE_THEME.accent }}
            >
              শপিং চালিয়ে যান
            </button>
          </div>
        );
      case 'search':
        return (
          <div className="py-20 text-center text-gray-600">সার্চ রেজাল্ট: {currentPage.query}</div>
        );
      default:
        return null;
    }
  };

  return (
    <CartProvider>
      <div
        className="min-h-screen pb-20 md:pb-0"
        style={{
          backgroundColor: TURBO_SALE_THEME.background,
          fontFamily: TURBO_SALE_THEME.fontBody,
        }}
      >
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
        />

        <PreviewHeader
          storeName={storeName ?? ''}
          logo={logo}
          categories={validCategories}
          onNavigate={navigate}
          businessInfo={businessInfo ? {
            phone: businessInfo.phone ?? undefined,
            email: businessInfo.email ?? undefined,
            address: businessInfo.address ?? undefined,
          } : undefined}
        />

        <main>{renderPage()}</main>

        <TurboSaleFooter
          storeName={storeName ?? ''}
          logo={logo}
          socialLinks={social ? {
            facebook: social.facebook ?? undefined,
            instagram: social.instagram ?? undefined,
            whatsapp: social.whatsapp ?? undefined,
            twitter: social.twitter ?? undefined,
            youtube: social.youtube ?? undefined,
            linkedin: social.linkedin ?? undefined,
          } : undefined}
          footerConfig={footerConfig}
          businessInfo={businessInfo ? {
            phone: businessInfo.phone ?? undefined,
            email: businessInfo.email ?? undefined,
            address: businessInfo.address ?? undefined,
          } : undefined}
          planType={planType}
          categories={validCategories}
        />

        {/* Mobile Sticky Footer */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-3 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={() => navigate({ type: 'home' })}
            className="flex-1 font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-white animate-pulse"
            style={{ backgroundColor: TURBO_SALE_THEME.accent }}
          >
            <ShoppingBag size={20} />
            অর্ডার করুন
          </button>
        </div>
      </div>
    </CartProvider>
  );
}

// ============================================================================
// LIVE HOMEPAGE (Preserved Original)
// ============================================================================
function LiveTurboSaleHomepage({
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
  // Default Sections optimized for BD Market
  const defaultSections = [
    {
      id: 'urgency-top',
      type: 'urgency-bar',
      settings: {
        message: 'সারা দেশে ফ্রি হোম ডেলিভারি!',
        stockLeft: 12,
        backgroundColor: TURBO_SALE_THEME.primary,
        textColor: '#FFFFFF',
      },
    },
    {
      id: 'turbo-hero',
      type: 'turbo-hero',
      settings: {
        heading: 'সমস্যার স্থায়ী সমাধান চান?',
        subheading: 'মাত্র ৭ দিনে পরিবর্তন লক্ষ্য করুন। ১০০% অরজিনাল পণ্য।',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        offerText: 'ধামাকা অফার',
        primaryAction: { label: 'অর্ডার করতে ক্লিক করুন', url: '/products' },
      },
    },
    {
      id: 'features-list',
      type: 'features',
      settings: {
        heading: 'আমাদের পণ্য কেন সেরা?',
        subheading: 'দ্রুত ডেলিভারি, সহজ রিটার্ন, ক্যাশ অন ডেলিভারি।',
        backgroundColor: '#FFF',
      },
    },
    {
      id: 'main-products',
      type: 'product-grid',
      settings: {
        heading: 'জনপ্রিয় পণ্যসমূহ',
        productCount: 12,
        paddingTop: 'medium',
        paddingBottom: 'medium',
      },
    },
    {
      id: 'banner',
      type: 'banner',
      settings: {
        heading: 'আজই অর্ডার করুন',
        subheading: 'সীমিত সময়ের জন্য বিশেষ অফার',
        primaryAction: { label: 'অর্ডার করুন', url: '/products' },
        image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80',
      },
    },
    {
      id: 'faq-section',
      type: 'faq',
      settings: {
        heading: 'সচরাচর জিজ্ঞাসিত প্রশ্ন',
        backgroundColor: '#F9FAFB',
        faqs: [
          { question: 'ক্যাশ অন ডেলিভারি আছে?', answer: 'হ্যাঁ, ক্যাশ অন ডেলিভারি পাওয়া যায়।' },
          { question: 'ডেলিভারি কত দিনে?', answer: '১-৩ কর্মদিবসের মধ্যে ডেলিভারি হয়।' },
          { question: 'রিটার্ন করা যাবে?', answer: '৭ দিনের মধ্যে রিটার্ন করা যায়।' },
        ],
      },
    },
    {
      id: 'newsletter',
      type: 'newsletter',
      settings: {
        heading: 'অফার আপডেট পেতে সাবস্ক্রাইব করুন',
        subheading: 'সেরা ডিলস পেতে ইমেইল দিন।',
        alignment: 'center',
      },
    },
  ];

  const sectionsToRender =
    config?.sections && config.sections.length > 0 ? config.sections : defaultSections;
  const normalizedCategories = (categories || []).map((category: any) =>
    typeof category === 'string' || category === null ? category : (category.title ?? null)
  );

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly
          fallback={
            <div className="min-h-screen bg-gray-50">
              <SkeletonLoader />
            </div>
          }
        >
          {() => (
            <div
              className="min-h-screen flex flex-col pb-20 md:pb-0"
              style={{
                backgroundColor: TURBO_SALE_THEME.background,
                color: TURBO_SALE_THEME.text,
                fontFamily: TURBO_SALE_THEME.fontBody,
              }}
            >
              <TurboSaleHeader
                storeName={storeName ?? ''}
                logo={logo}
                categories={normalizedCategories}
                currentCategory={currentCategory}
                isPreview={isPreview}
                config={config}
                socialLinks={socialLinks ? {
                  facebook: socialLinks.facebook ?? undefined,
                  instagram: socialLinks.instagram ?? undefined,
                  whatsapp: socialLinks.whatsapp ?? undefined,
                  twitter: socialLinks.twitter ?? undefined,
                  youtube: socialLinks.youtube ?? undefined,
                  linkedin: socialLinks.linkedin ?? undefined,
                } : undefined}
                businessInfo={businessInfo ? {
                  phone: businessInfo.phone ?? undefined,
                  email: businessInfo.email ?? undefined,
                  address: businessInfo.address ?? undefined,
                } : undefined}
              />

              <main className="flex-1">
                {sectionsToRender.map((section: StoreSection) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) return null;

                  return (
                    <SectionComponent
                      key={section.id}
                      settings={section.settings}
                      theme={TURBO_SALE_THEME}
                      products={products}
                      categories={normalizedCategories}
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

              <TurboSaleFooter
                storeName={storeName ?? ''}
                logo={logo}
                socialLinks={socialLinks ? {
                  facebook: socialLinks.facebook ?? undefined,
                  instagram: socialLinks.instagram ?? undefined,
                  whatsapp: socialLinks.whatsapp ?? undefined,
                  twitter: socialLinks.twitter ?? undefined,
                  youtube: socialLinks.youtube ?? undefined,
                  linkedin: socialLinks.linkedin ?? undefined,
                } : undefined}
                footerConfig={footerConfig}
                businessInfo={businessInfo ? {
                  phone: businessInfo.phone ?? undefined,
                  email: businessInfo.email ?? undefined,
                  address: businessInfo.address ?? undefined,
                } : undefined}
                categories={normalizedCategories}
                planType={planType}
              />

              {/* Mobile Sticky Footer */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-3 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <Link
                  to="/products"
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 animate-pulse"
                >
                  <ShoppingBag size={20} />
                  অর্ডার করুন
                </Link>
                <a
                  href={`tel:${businessInfo?.phone || config?.floatingCallNumber}`}
                  className="w-14 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                >
                  <Phone size={24} />
                </a>
              </div>

              <link 
                rel="stylesheet" 
                href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Tiro+Bangla&display=swap"
              />
              <style>{`
                body {
                  font-family: 'Hind Siliguri', sans-serif;
                }
                
                h1, h2, h3, h4, h5, h6 {
                  font-family: 'Hind Siliguri', sans-serif;
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
export function TurboSaleTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewTurboSaleStore {...props} />;
  }
  return <LiveTurboSaleHomepage {...props} />;
}

export default TurboSaleTemplate;
