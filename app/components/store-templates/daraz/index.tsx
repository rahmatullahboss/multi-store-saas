/**
 * Daraz Template - DUAL MODE ARCHITECTURE
 * 
 * A Daraz Bangladesh-inspired e-commerce template with:
 * - Orange theme header (#F85606)
 * - Hero carousel with promotional banners
 * - Flash sale horizontal scroll section
 * - Category grid navigation
 * - Product grid layout (Just For You)
 * - Multi-column footer with payment badges
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
import { Link } from '@remix-run/react';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { DARAZ_THEME } from './theme';
import { DarazHeader } from './sections/Header';
import { DarazFooter } from './sections/Footer';
import { DarazHeroCarousel } from './sections/HeroCarousel';
import { DarazFlashSale } from './sections/FlashSale';
import { DarazCategoryGrid } from './sections/CategoryGrid';
import { DarazProductGrid } from './sections/ProductCard';
import { DarazProductPage } from './pages/ProductPage';
import { DarazCartPage } from './pages/CartPage';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_COLLECTIONS,
  getDemoProductById,
  getRelatedProducts,
  searchDemoProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';
import { ShoppingCart, Search, X, Check, Truck, Shield, RotateCcw, Star } from 'lucide-react';

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

interface SectionConfig {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

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
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        id: product.id,
        title: product.title ?? '',
        price: product.price ?? 0,
        compareAtPrice: product.compareAtPrice ?? null,
        imageUrl: product.imageUrl ?? null,
        category: product.category ?? null,
        quantity 
      }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [items]
  );

  const itemCount = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
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
  onNavigate 
}: { 
  storeName: string;
  logo?: string | null;
  categories: (string | null)[];
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* Top Bar */}
      <div 
        className="text-white text-xs py-1.5 px-4 hidden md:block"
        style={{ backgroundColor: DARAZ_THEME.primary }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>Save More on App | Become a Seller</span>
          <span>Help & Support | Login / Sign Up</span>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className="sticky top-0 z-40 shadow-sm"
        style={{ backgroundColor: DARAZ_THEME.primary }}
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
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${storeName}`}
                  className="flex-1 px-4 py-2 rounded-l-md text-sm focus:outline-none"
                />
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-r-md"
                  style={{ backgroundColor: DARAZ_THEME.accent }}
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button 
                onClick={() => setSearchOpen(true)} 
                className="md:hidden p-2 text-white"
              >
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
                    style={{ backgroundColor: '#FF6B6B' }}
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
              className="hover:opacity-80 transition"
            >
              All Categories
            </button>
            {categories.filter(Boolean).slice(0, 6).map(cat => (
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
          <div className="p-4" style={{ backgroundColor: DARAZ_THEME.primary }}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="flex-1 px-4 py-3 rounded-lg"
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
  onNavigate 
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
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.imageUrl || ''} 
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
        />
        {discount > 0 && (
          <span 
            className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded"
            style={{ backgroundColor: DARAZ_THEME.primary }}
          >
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); cart.addItem(product); }}
          className="absolute bottom-2 right-2 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
          style={{ backgroundColor: DARAZ_THEME.primary }}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-sm line-clamp-2 mb-2" style={{ color: DARAZ_THEME.text }}>
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold" style={{ color: DARAZ_THEME.primary }}>
            {currency}{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs line-through text-gray-400">
              {currency}{product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{product.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE HOMEPAGE
// ============================================================================
function PreviewHomePage({ 
  storeName, 
  products, 
  categories, 
  currency, 
  config, 
  onNavigate 
}: { 
  storeName: string;
  products: DemoProduct[];
  categories: (string | null)[];
  currency: string;
  config: any;
  onNavigate: (page: PageType) => void;
}) {
  const flashSaleProducts = products.slice(0, 10);
  const gridProducts = products.slice(10);

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARAZ_THEME.background }}>
      {/* Hero Carousel */}
      <DarazHeroCarousel
        storeName={storeName}
        showAppWidget={false}
        banners={config?.bannerUrl ? [{
          id: 'main',
          image: config.bannerUrl,
          title: config.bannerText || 'Amazing Deals Await!',
          subtitle: 'Shop the best products at unbeatable prices',
          link: '#',
          buttonText: 'Shop Now'
        }] : undefined}
      />

      {/* Flash Sale */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: DARAZ_THEME.primary }}>
              ⚡ Flash Sale
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {flashSaleProducts.slice(0, 5).map(product => (
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

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4" style={{ color: DARAZ_THEME.text }}>Categories</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.filter(Boolean).slice(0, 8).map(cat => (
              <button 
                key={cat}
                onClick={() => onNavigate({ type: 'category', category: cat! })}
                className="text-center hover:opacity-80 transition"
              >
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2"
                  style={{ backgroundColor: DARAZ_THEME.background }}
                >
                  📦
                </div>
                <span className="text-xs line-clamp-2" style={{ color: DARAZ_THEME.text }}>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Just For You */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4" style={{ color: DARAZ_THEME.text }}>Just For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {(gridProducts.length > 0 ? gridProducts : products).map(product => (
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
              { icon: <Truck className="w-8 h-8" />, title: 'Fast Delivery', desc: 'Nationwide shipping' },
              { icon: <Shield className="w-8 h-8" />, title: 'Secure Payment', desc: 'Multiple options' },
              { icon: <RotateCcw className="w-8 h-8" />, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: <Check className="w-8 h-8" />, title: '100% Genuine', desc: 'Quality guaranteed' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="mb-2" style={{ color: DARAZ_THEME.primary }}>{item.icon}</div>
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
  onNavigate 
}: { 
  productId: number;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const product = getDemoProductById(productId);
  const relatedProducts = getRelatedProducts(productId, 4);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: DARAZ_THEME.background }}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found</p>
          <button 
            onClick={() => onNavigate({ type: 'home' })}
            className="px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: DARAZ_THEME.primary }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    cart.addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    cart.addItem(product, quantity);
    onNavigate({ type: 'checkout' });
  };

  return (
    <DarazProductPage
      product={{
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
      }}
      currency={currency}
      relatedProducts={relatedProducts.map(p => ({
        id: p.id,
        storeId: 0,
        title: p.title,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        imageUrl: p.imageUrl,
        category: p.category,
      }))}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
  );
}

// ============================================================================
// PREVIEW MODE CART PAGE
// ============================================================================
function PreviewCartPageComponent({ 
  currency, 
  onNavigate 
}: { 
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();

  const cartItems = cart.items.map(item => ({
    id: item.id,
    productId: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
  }));

  return (
    <DarazCartPage
      items={cartItems}
      currency={currency}
      onUpdateQuantity={(itemId, qty) => cart.updateQuantity(itemId, qty)}
      onRemoveItem={(itemId) => cart.removeItem(itemId)}
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
  onNavigate 
}: { 
  category: string;
  products: DemoProduct[];
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const filtered = products.filter(p => p.category === category);

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: DARAZ_THEME.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => onNavigate({ type: 'home' })} className="hover:underline">Home</button>
          <span>/</span>
          <span style={{ color: DARAZ_THEME.text }}>{category}</span>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold" style={{ color: DARAZ_THEME.text }}>{category}</h1>
            <span className="text-sm text-gray-500">{filtered.length} products</span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {filtered.map(product => (
                <PreviewProductCard 
                  key={product.id} 
                  product={product} 
                  currency={currency}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No products found in this category
            </div>
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
  onNavigate 
}: { 
  query: string;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const results = searchDemoProducts(query);

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: DARAZ_THEME.background }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg p-4">
          <h1 className="text-xl font-bold mb-4" style={{ color: DARAZ_THEME.text }}>
            Search results for "{query}"
          </h1>
          <p className="text-sm text-gray-500 mb-6">{results.length} products found</p>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {results.map(product => (
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
              <p className="text-gray-500 mb-4">No products found for "{query}"</p>
              <button 
                onClick={() => onNavigate({ type: 'home' })}
                className="px-6 py-2 rounded-lg text-white"
                style={{ backgroundColor: DARAZ_THEME.primary }}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE CHECKOUT PAGE
// ============================================================================
function PreviewCheckoutPage({ 
  currency, 
  onNavigate 
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
    note: ''
  });

  const shipping = cart.total >= 1000 ? 0 : 60;
  const grandTotal = cart.total + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cart.clearCart();
    onNavigate({ type: 'order-success' });
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: DARAZ_THEME.background }}>
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button 
            onClick={() => onNavigate({ type: 'home' })}
            className="px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: DARAZ_THEME.primary }}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6" style={{ backgroundColor: DARAZ_THEME.background }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6" style={{ color: DARAZ_THEME.text }}>Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          {/* Shipping Info */}
          <div className="md:col-span-2 bg-white rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
            <input
              type="text"
              placeholder="Full Name *"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e5e5' }}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e5e5' }}
            />
            <textarea
              placeholder="Full Address *"
              required
              rows={3}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e5e5' }}
            />
            <input
              type="text"
              placeholder="City *"
              required
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e5e5' }}
            />
            <textarea
              placeholder="Order Note (optional)"
              rows={2}
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e5e5' }}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 h-fit">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600">{item.title} x{item.quantity}</span>
                  <span>{currency}{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <hr className="my-3" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency}{cart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `${currency}${shipping}`}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span style={{ color: DARAZ_THEME.primary }}>{currency}{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: DARAZ_THEME.primary }}
            >
              Place Order (Cash on Delivery)
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              ⚠️ This is a demo. No real order will be placed.
            </p>
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
    <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: DARAZ_THEME.background }}>
      <div className="text-center bg-white rounded-lg p-8 shadow-sm max-w-md">
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#D1FAE5' }}
        >
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: DARAZ_THEME.text }}>Order Placed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your order. This is a demo, so no actual order was placed.
        </p>
        <button 
          onClick={() => onNavigate({ type: 'home' })}
          className="px-8 py-3 rounded-lg font-medium text-white"
          style={{ backgroundColor: DARAZ_THEME.primary }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODE FOOTER (with internal navigation)
// ============================================================================
function PreviewFooter({ 
  storeName, 
  categories, 
  onNavigate 
}: { 
  storeName: string;
  categories: (string | null)[];
  onNavigate: (page: PageType) => void;
}) {
  return (
    <footer style={{ backgroundColor: DARAZ_THEME.footerBg }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4" style={{ color: DARAZ_THEME.text }}>{storeName}</h3>
            <p className="text-sm text-gray-600">Your trusted online shopping destination.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Categories</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {categories.filter(Boolean).slice(0, 5).map(cat => (
                <li key={cat}>
                  <button onClick={() => onNavigate({ type: 'category', category: cat! })} className="hover:underline">
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Help</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><button className="hover:underline">FAQ</button></li>
              <li><button className="hover:underline">Shipping</button></li>
              <li><button className="hover:underline">Returns</button></li>
              <li><button className="hover:underline">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Payment Methods</h4>
            <div className="flex flex-wrap gap-2">
              {['bKash', 'Nagad', 'Visa', 'COD'].map(method => (
                <span key={method} className="px-2 py-1 text-xs bg-gray-100 rounded">{method}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// FULL PREVIEW STORE (State-based routing, demo data)
// ============================================================================
function PreviewDarazStore(props: StoreTemplateProps) {
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
          <PreviewSearchPage 
            query={currentPage.query}
            currency={currency}
            onNavigate={navigate}
          />
        );
      case 'cart':
        return (
          <PreviewCartPageComponent 
            currency={currency}
            onNavigate={navigate}
          />
        );
      case 'checkout':
        return (
          <PreviewCheckoutPage 
            currency={currency}
            onNavigate={navigate}
          />
        );
      case 'order-success':
        return <PreviewOrderSuccessPage onNavigate={navigate} />;
      default:
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
    }
  };

  return (
    <CartProvider>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: DARAZ_THEME.background, 
          fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif" 
        }}
      >
        {/* Preview Banner */}
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
          ⚠️ Preview Mode - This is a demo. No orders will be placed.
        </div>

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
        <PreviewFooter 
          storeName={storeName} 
          categories={validCategories}
          onNavigate={navigate}
        />

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
function LiveDarazHomepage(props: StoreTemplateProps) {
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

  // Get products for different sections
  const allProducts = currentCategory 
    ? products.filter(p => p.category === currentCategory) 
    : products;
  
  // Split products for flash sale and main grid
  const flashSaleProducts = products.slice(0, 10);
  const gridProducts = currentCategory ? allProducts : products.slice(10);

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div 
              className="min-h-screen pb-16 md:pb-0"
              style={{ 
                backgroundColor: DARAZ_THEME.background, 
                fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif" 
              }}
            >
              {/* Header - Uses real Remix links */}
              <DarazHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                isPreview={false}
                config={config}
              />

              {/* Main Content */}
              <main className="max-w-7xl mx-auto px-4 py-4 min-h-[60vh]">
                
                {/* Hero Carousel - Only on homepage without category filter */}
                {!currentCategory && (
                  <DarazHeroCarousel
                    storeName={storeName}
                    showAppWidget={true}
                    banners={config?.bannerUrl ? [
                      {
                        id: 'main',
                        image: config.bannerUrl,
                        title: config.bannerText || 'Amazing Deals Await!',
                        subtitle: 'Shop the best products at unbeatable prices',
                        link: '/?category=all',
                        buttonText: 'Shop Now'
                      }
                    ] : undefined}
                  />
                )}

                {/* Flash Sale Section - Only on homepage */}
                {!currentCategory && flashSaleProducts.length > 0 && (
                  <DarazFlashSale 
                    products={flashSaleProducts}
                    currency={currency}
                    title="Flash Sale"
                    showTimer={false}
                  />
                )}

                {/* Category Grid - Only on homepage */}
                {!currentCategory && (
                  <DarazCategoryGrid 
                    categories={categories}
                    maxCategories={16}
                  />
                )}

                {/* Product Grid */}
                <DarazProductGrid
                  products={currentCategory ? allProducts : gridProducts}
                  currency={currency}
                  title={currentCategory || 'Just For You'}
                  columns={6}
                />

                {/* Additional Sections from Config */}
                {((config?.sections ?? []) as SectionConfig[]).map((section) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  if (!SectionComponent) return null;
                  
                  // Skip sections we're handling natively
                  if (['hero', 'product-scroll', 'category-list', 'product-grid'].includes(section.type)) {
                    return null;
                  }
                  
                  return (
                    <SectionComponent
                      key={section.id}
                      settings={section.settings}
                      theme={DARAZ_THEME}
                      products={products}
                      categories={categories}
                      storeId={storeId}
                      currency={currency}
                      store={{
                        name: storeName,
                        email: businessInfo?.email,
                        phone: businessInfo?.phone,
                        address: businessInfo?.address,
                        currency: currency
                      }}
                    />
                  );
                })}

                {/* Features Section - Static */}
                {!currentCategory && (
                  <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 
                      className="text-lg font-bold mb-6 text-center"
                      style={{ color: DARAZ_THEME.text }}
                    >
                      Why Shop With Us
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { icon: '🚚', title: 'Fast Delivery', desc: 'Nationwide shipping' },
                        { icon: '🔒', title: 'Secure Payment', desc: 'Multiple options' },
                        { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy' },
                        { icon: '💬', title: '24/7 Support', desc: 'Always here to help' }
                      ].map((feature, i) => (
                        <div key={i} className="text-center">
                          <span className="text-3xl mb-2 block">{feature.icon}</span>
                          <h3 className="font-semibold text-sm" style={{ color: DARAZ_THEME.text }}>
                            {feature.title}
                          </h3>
                          <p className="text-xs" style={{ color: DARAZ_THEME.textSecondary }}>
                            {feature.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </main>

              {/* Footer - Uses real links */}
              <DarazFooter
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
                    className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer"
                    title="WhatsApp এ মেসেজ করুন"
                  >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.789l4.89-1.535A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.137 0-4.146-.535-5.904-1.475l-.417-.253-4.329 1.136 1.157-4.229-.269-.428A9.968 9.968 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
                    </svg>
                  </a>
                )}
                {config?.floatingCallEnabled && config?.floatingCallNumber && (
                  <a
                    href={`tel:${config.floatingCallNumber}`}
                    className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer`}
                    title="কল করুন"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                )}
              </>

              {/* Scrollbar Hide CSS */}
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
export function DarazTemplate(props: StoreTemplateProps) {
  // PREVIEW MODE: Full self-contained demo store with internal routing
  if (props.isPreview) {
    return <PreviewDarazStore {...props} />;
  }

  // LIVE MODE: Homepage with real data and real Remix routes
  return <LiveDarazHomepage {...props} />;
}

export default DarazTemplate;
