/**
 * Starter Store Template
 * 
 * A complete, immersive e-commerce template with full functionality:
 * - Full store navigation (home, products, collections, cart, checkout)
 * - Working cart with local state
 * - Simulated checkout (no real orders)
 * - Search functionality  
 * - Static pages (About, Contact, FAQ, Policies)
 * - Product reviews, variants, related products
 * - Responsive design (mobile/desktop)
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { 
  ShoppingCart, Search, Menu, X, ChevronLeft, ChevronRight,
  Star, Plus, Minus, Trash2, Check, Phone, Mail, MapPin,
  Facebook, Instagram, ChevronDown, Heart, Share2, Truck, Shield, RotateCcw,
  Home, Grid, Tag, Info, HelpCircle, FileText, Eye
} from 'lucide-react';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { STARTER_STORE_THEME, STARTER_STORE_FONTS } from './theme';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_COLLECTIONS,
  DEMO_REVIEWS,
  DEMO_PAGES,
  DEMO_FAQ,
  DEMO_SOCIAL_LINKS,
  DEMO_BUSINESS_INFO,
  DEMO_FOOTER_CONFIG,
  DEMO_THEME_CONFIG,
  getDemoProductById,
  getDemoProductsByCategory,
  getDemoProductsByCollection,
  getRelatedProducts,
  getProductReviews,
  searchDemoProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';

const theme = STARTER_STORE_THEME;

// ============================================================================
// CART CONTEXT
// ============================================================================
interface CartItem {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: DemoProduct, quantity?: number, variants?: Record<string, string>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: DemoProduct, quantity = 1, variants?: Record<string, string>) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedVariants: variants }];
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
// TYPES
// ============================================================================
type PageType = 
  | { type: 'home' }
  | { type: 'product'; productId: number }
  | { type: 'collection'; collectionId: string }
  | { type: 'category'; category: string }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'order-success' }
  | { type: 'search'; query: string }
  | { type: 'page'; pageId: string };

// ============================================================================
// HELPER: Format Price
// ============================================================================
function formatPrice(price: number): string {
  return `৳${price.toLocaleString('bn-BD')}`;
}

// ============================================================================
// COMPONENT: Store Header
// ============================================================================
function StoreHeader({ 
  storeName, 
  onNavigate,
  categories,
  logo,
}: { 
  storeName: string;
  onNavigate: (page: PageType) => void;
  categories: string[];
  logo?: string | null;
}) {
  const cart = useCart();
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
      {/* Announcement Bar */}
      <div className="py-2 px-4 text-center text-sm text-white" style={{ backgroundColor: theme.primary }}>
        🎉 ফ্রি ডেলিভারি ১০০০৳+ অর্ডারে! সীমিত সময়ের অফার।
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: theme.headerBg }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2">
              <Menu className="w-6 h-6" style={{ color: theme.text }} />
            </button>

            {/* Logo */}
            <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold" style={{ color: theme.text }}>{storeName}</span>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button onClick={() => onNavigate({ type: 'home' })} className="text-sm font-medium hover:opacity-70 transition" style={{ color: theme.text }}>হোম</button>
              {categories.slice(0, 5).map(cat => (
                <button key={cat} onClick={() => onNavigate({ type: 'category', category: cat })} className="text-sm font-medium hover:opacity-70 transition" style={{ color: theme.text }}>{cat}</button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-70 transition">
                <Search className="w-5 h-5" style={{ color: theme.text }} />
              </button>
              <button onClick={() => onNavigate({ type: 'cart' })} className="p-2 hover:opacity-70 transition relative">
                <ShoppingCart className="w-5 h-5" style={{ color: theme.text }} />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white" style={{ backgroundColor: theme.accent }}>{cart.itemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 p-6 overflow-y-auto" style={{ backgroundColor: theme.headerBg }}>
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold" style={{ color: theme.text }}>{storeName}</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" style={{ color: theme.text }} /></button>
            </div>
            <nav className="space-y-4">
              <button onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-medium" style={{ color: theme.text }}>হোম</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => { onNavigate({ type: 'category', category: cat }); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: theme.text }}>{cat}</button>
              ))}
              <hr style={{ borderColor: theme.muted + '30' }} />
              <button onClick={() => { onNavigate({ type: 'page', pageId: 'about' }); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: theme.muted }}>আমাদের সম্পর্কে</button>
              <button onClick={() => { onNavigate({ type: 'page', pageId: 'contact' }); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: theme.muted }}>যোগাযোগ</button>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="absolute top-0 left-0 right-0 p-4" style={{ backgroundColor: theme.headerBg }}>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="পণ্য খুঁজুন..." autoFocus className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} />
              <button type="submit" className="px-6 py-3 rounded-lg text-white" style={{ backgroundColor: theme.primary }}><Search className="w-5 h-5" /></button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-3"><X className="w-5 h-5" style={{ color: theme.text }} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// COMPONENT: Product Card
// ============================================================================
function ProductCard({ product, onNavigate }: { product: DemoProduct; onNavigate: (page: PageType) => void; }) {
  const cart = useCart();
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  return (
    <div className="group cursor-pointer" onClick={() => onNavigate({ type: 'product', productId: product.id })}>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3" style={{ backgroundColor: theme.cardBg }}>
        <img src={product.imageUrl || ''} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: theme.accent }}>-{discount}%</span>
        )}
        {product.tags?.includes('new') && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: theme.primary }}>নতুন</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); cart.addItem(product); }} className="absolute bottom-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white" style={{ backgroundColor: theme.primary }}>
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium line-clamp-2 group-hover:underline" style={{ color: theme.text }}>{product.title}</h3>
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm" style={{ color: theme.muted }}>{product.rating} ({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: theme.primary }}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="text-sm line-through" style={{ color: theme.muted }}>{formatPrice(product.compareAtPrice)}</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Store Footer
// ============================================================================
function StoreFooter({ storeName, onNavigate }: { storeName: string; onNavigate: (page: PageType) => void; }) {
  return (
    <footer style={{ backgroundColor: theme.footerBg }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.footerText }}>{storeName}</h3>
            <p className="text-sm mb-4" style={{ color: theme.footerText + 'cc' }}>{DEMO_FOOTER_CONFIG.description}</p>
            <div className="flex gap-3">
              <a href={DEMO_SOCIAL_LINKS.facebook || '#'} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:opacity-80 transition" style={{ backgroundColor: theme.footerText + '20' }}><Facebook className="w-4 h-4" style={{ color: theme.footerText }} /></a>
              <a href={DEMO_SOCIAL_LINKS.instagram || '#'} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:opacity-80 transition" style={{ backgroundColor: theme.footerText + '20' }}><Instagram className="w-4 h-4" style={{ color: theme.footerText }} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm" style={{ color: theme.footerText + 'cc' }}>
              <li><button onClick={() => onNavigate({ type: 'home' })} className="hover:underline">হোম</button></li>
              <li><button onClick={() => onNavigate({ type: 'collection', collectionId: 'new-arrivals' })} className="hover:underline">নতুন পণ্য</button></li>
              <li><button onClick={() => onNavigate({ type: 'collection', collectionId: 'best-sellers' })} className="hover:underline">বেস্ট সেলার</button></li>
              <li><button onClick={() => onNavigate({ type: 'collection', collectionId: 'on-sale' })} className="hover:underline">সেল</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>সাহায্য</h4>
            <ul className="space-y-2 text-sm" style={{ color: theme.footerText + 'cc' }}>
              <li><button onClick={() => onNavigate({ type: 'page', pageId: 'faq' })} className="hover:underline">সাধারণ জিজ্ঞাসা</button></li>
              <li><button onClick={() => onNavigate({ type: 'page', pageId: 'shipping' })} className="hover:underline">ডেলিভারি পলিসি</button></li>
              <li><button onClick={() => onNavigate({ type: 'page', pageId: 'returns' })} className="hover:underline">রিটার্ন পলিসি</button></li>
              <li><button onClick={() => onNavigate({ type: 'page', pageId: 'privacy' })} className="hover:underline">প্রাইভেসি পলিসি</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>যোগাযোগ</h4>
            <ul className="space-y-3 text-sm" style={{ color: theme.footerText + 'cc' }}>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" />{DEMO_BUSINESS_INFO.phone}</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" />{DEMO_BUSINESS_INFO.email}</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" />{DEMO_BUSINESS_INFO.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: theme.footerText + '20', color: theme.footerText + '99' }}>
          © {new Date().getFullYear()} {storeName}। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// PAGE: Home
// ============================================================================
function HomePage({ products, collections, onNavigate, config }: { products: DemoProduct[]; collections: typeof DEMO_COLLECTIONS; onNavigate: (page: PageType) => void; config?: any; }) {
  const featuredProducts = products.filter(p => p.tags?.includes('featured')).slice(0, 4);
  const newArrivals = products.filter(p => p.tags?.includes('new')).slice(0, 4);
  const bestSellers = products.filter(p => p.tags?.includes('bestseller')).slice(0, 4);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[60vh] md:h-[70vh]">
        <img src={config?.bannerUrl || DEMO_THEME_CONFIG.bannerUrl || ''} alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{config?.bannerText || DEMO_THEME_CONFIG.bannerText || 'আমাদের নতুন কালেকশন'}</h1>
            <p className="text-lg mb-6 opacity-90">সেরা মানের পণ্য, সেরা দামে</p>
            <button onClick={() => onNavigate({ type: 'collection', collectionId: 'new-arrivals' })} className="px-8 py-3 rounded-lg font-medium transition hover:opacity-90" style={{ backgroundColor: theme.accent, color: '#fff' }}>শপিং করুন</button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: theme.text }}>ক্যাটাগরি</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collections.filter(c => ['electronics', 'fashion', 'home-living', 'beauty'].includes(c.id)).map(col => (
              <button key={col.id} onClick={() => onNavigate({ type: 'collection', collectionId: col.id })} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={col.image} alt={col.nameBn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white font-semibold text-lg">{col.nameBn}</span></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4" style={{ backgroundColor: theme.cardBg }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>ফিচার্ড পণ্য</h2>
              <button onClick={() => onNavigate({ type: 'collection', collectionId: 'featured' })} className="text-sm font-medium hover:underline" style={{ color: theme.primary }}>সব দেখুন →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map(product => <ProductCard key={product.id} product={product} onNavigate={onNavigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* Sale Banner */}
      <section className="py-16 px-4" style={{ backgroundColor: theme.accent }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">🎉 বিশেষ ছাড় চলছে!</h2>
          <p className="text-lg mb-6 opacity-90">সীমিত সময়ের জন্য ৫০% পর্যন্ত ছাড়</p>
          <button onClick={() => onNavigate({ type: 'collection', collectionId: 'on-sale' })} className="px-8 py-3 rounded-lg font-medium bg-white transition hover:opacity-90" style={{ color: theme.accent }}>সেল দেখুন</button>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>নতুন এসেছে</h2>
              <button onClick={() => onNavigate({ type: 'collection', collectionId: 'new-arrivals' })} className="text-sm font-medium hover:underline" style={{ color: theme.primary }}>সব দেখুন →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map(product => <ProductCard key={product.id} product={product} onNavigate={onNavigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-12 px-4" style={{ backgroundColor: theme.cardBg }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>সেরা বিক্রিত</h2>
              <button onClick={() => onNavigate({ type: 'collection', collectionId: 'best-sellers' })} className="text-sm font-medium hover:underline" style={{ color: theme.primary }}>সব দেখুন →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map(product => <ProductCard key={product.id} product={product} onNavigate={onNavigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-12 px-4" style={{ backgroundColor: theme.background }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-6 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
              <div className="p-3 rounded-full" style={{ backgroundColor: theme.primary + '15' }}><Truck className="w-6 h-6" style={{ color: theme.primary }} /></div>
              <div><h3 className="font-semibold" style={{ color: theme.text }}>দ্রুত ডেলিভারি</h3><p className="text-sm" style={{ color: theme.muted }}>ঢাকায় ১-২ দিনে</p></div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
              <div className="p-3 rounded-full" style={{ backgroundColor: theme.primary + '15' }}><Shield className="w-6 h-6" style={{ color: theme.primary }} /></div>
              <div><h3 className="font-semibold" style={{ color: theme.text }}>নিরাপদ পেমেন্ট</h3><p className="text-sm" style={{ color: theme.muted }}>১০০% সিকিউর</p></div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
              <div className="p-3 rounded-full" style={{ backgroundColor: theme.primary + '15' }}><RotateCcw className="w-6 h-6" style={{ color: theme.primary }} /></div>
              <div><h3 className="font-semibold" style={{ color: theme.text }}>ইজি রিটার্ন</h3><p className="text-sm" style={{ color: theme.muted }}>৭ দিনের মধ্যে</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// PAGE: Product Detail (Full featured with reviews, variants)
// ============================================================================
function ProductDetailPage({ productId, onNavigate }: { productId: number; onNavigate: (page: PageType) => void; }) {
  const cart = useCart();
  const product = getDemoProductById(productId);
  const reviews = getProductReviews(productId);
  const relatedProducts = getRelatedProducts(productId, 4);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <p style={{ color: theme.muted }}>পণ্য পাওয়া যায়নি</p>
          <button onClick={() => onNavigate({ type: 'home' })} className="mt-4 px-6 py-2 rounded-lg text-white" style={{ backgroundColor: theme.primary }}>হোমে ফিরুন</button>
        </div>
      </div>
    );
  }

  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  const handleAddToCart = () => {
    cart.addItem(product, quantity, selectedVariants);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
          <button onClick={() => onNavigate({ type: 'home' })} className="hover:underline">হোম</button>
          <span>/</span>
          {product.category && (
            <>
              <button onClick={() => onNavigate({ type: 'category', category: product.category! })} className="hover:underline">{product.category}</button>
              <span>/</span>
            </>
          )}
          <span style={{ color: theme.text }}>{product.title}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
            <img src={product.imageUrl || ''} alt={product.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {discount > 0 && <span className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: theme.accent }}>{discount}% ছাড়</span>}
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: theme.text }}>{product.title}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span style={{ color: theme.muted }}>{product.rating} ({product.reviewCount} রিভিউ)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: theme.primary }}>{formatPrice(product.price)}</span>
              {product.compareAtPrice && <span className="text-xl line-through" style={{ color: theme.muted }}>{formatPrice(product.compareAtPrice)}</span>}
            </div>

            <p style={{ color: theme.muted }}>{product.description}</p>

            {/* Variants */}
            {product.variants?.map(variant => (
              <div key={variant.name}>
                <label className="block font-medium mb-2" style={{ color: theme.text }}>{variant.name}</label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map(option => (
                    <button key={option} onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                      className={`px-4 py-2 rounded-lg border transition ${selectedVariants[variant.name] === option ? 'ring-2' : ''}`}
                      style={{ borderColor: selectedVariants[variant.name] === option ? theme.primary : theme.muted + '40', backgroundColor: theme.cardBg, color: theme.text }}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <label className="block font-medium mb-2" style={{ color: theme.text }}>পরিমাণ</label>
              <div className="flex items-center gap-0 w-fit rounded-lg overflow-hidden border" style={{ borderColor: theme.muted + '40' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 transition"><Minus className="w-4 h-4" /></button>
                <span className="px-6 py-2 min-w-[60px] text-center" style={{ backgroundColor: theme.cardBg }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 transition"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Stock */}
            {product.stock && product.stock < 10 && <p className="text-sm" style={{ color: theme.accent }}>⚡ মাত্র {product.stock}টি বাকি!</p>}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition hover:opacity-90 flex items-center justify-center gap-2" style={{ backgroundColor: theme.primary }}>
                {addedToCart ? <><Check className="w-5 h-5" />কার্টে যোগ হয়েছে</> : <><ShoppingCart className="w-5 h-5" />কার্টে যোগ করুন</>}
              </button>
              <button onClick={() => { cart.addItem(product, quantity, selectedVariants); onNavigate({ type: 'checkout' }); }} className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition hover:opacity-90" style={{ backgroundColor: theme.accent }}>এখনই কিনুন</button>
            </div>

            {/* Trust Info */}
            <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: theme.cardBg }}>
              <div className="flex items-center gap-3 text-sm" style={{ color: theme.muted }}><Truck className="w-5 h-5" style={{ color: theme.primary }} /><span>ঢাকায় ১-২ দিনে ডেলিভারি</span></div>
              <div className="flex items-center gap-3 text-sm" style={{ color: theme.muted }}><RotateCcw className="w-5 h-5" style={{ color: theme.primary }} /><span>৭ দিনের ইজি রিটার্ন</span></div>
              <div className="flex items-center gap-3 text-sm" style={{ color: theme.muted }}><Shield className="w-5 h-5" style={{ color: theme.primary }} /><span>১০০% অরিজিনাল প্রোডাক্ট</span></div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6" style={{ color: theme.text }}>কাস্টমার রিভিউ ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-4 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: theme.text }}>{review.customerName}</span>
                      {review.verified && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">ভেরিফাইড</span>}
                    </div>
                    <span className="text-sm" style={{ color: theme.muted }}>{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p style={{ color: theme.muted }}>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6" style={{ color: theme.text }}>সম্পর্কিত পণ্য</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Collection/Category
// ============================================================================
function CollectionPage({ collectionId, category, onNavigate }: { collectionId?: string; category?: string; onNavigate: (page: PageType) => void; }) {
  const [sortBy, setSortBy] = useState('default');
  
  let title = 'সব পণ্য';
  let description = '';
  let filteredProducts: DemoProduct[] = DEMO_PRODUCTS;

  if (collectionId) {
    const collection = DEMO_COLLECTIONS.find(c => c.id === collectionId);
    if (collection) {
      title = collection.nameBn;
      description = collection.description;
      filteredProducts = getDemoProductsByCollection(collectionId);
    }
  } else if (category) {
    title = category;
    filteredProducts = getDemoProductsByCategory(category);
  }

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'newest': return b.id - a.id;
      default: return 0;
    }
  });

  return (
    <div style={{ backgroundColor: theme.background }}>
      <div className="py-12 px-4 text-center" style={{ backgroundColor: theme.cardBg }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text }}>{title}</h1>
        {description && <p style={{ color: theme.muted }}>{description}</p>}
        <p className="mt-2 text-sm" style={{ color: theme.muted }}>{sortedProducts.length}টি পণ্য</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 rounded-lg border focus:outline-none" style={{ borderColor: theme.muted + '40', backgroundColor: theme.cardBg, color: theme.text }}>
            <option value="default">ডিফল্ট</option>
            <option value="price-low">দাম: কম থেকে বেশি</option>
            <option value="price-high">দাম: বেশি থেকে কম</option>
            <option value="newest">নতুন আগে</option>
          </select>
        </div>
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map(product => <ProductCard key={product.id} product={product} onNavigate={onNavigate} />)}
          </div>
        ) : (
          <div className="text-center py-12"><p style={{ color: theme.muted }}>কোনো পণ্য পাওয়া যায়নি</p></div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Search Results
// ============================================================================
function SearchPage({ query, onNavigate }: { query: string; onNavigate: (page: PageType) => void; }) {
  const results = searchDemoProducts(query);

  return (
    <div style={{ backgroundColor: theme.background }}>
      <div className="py-12 px-4 text-center" style={{ backgroundColor: theme.cardBg }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>"{query}" এর জন্য সার্চ রেজাল্ট</h1>
        <p style={{ color: theme.muted }}>{results.length}টি পণ্য পাওয়া গেছে</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {results.map(product => <ProductCard key={product.id} product={product} onNavigate={onNavigate} />)}
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: theme.muted }}>কোনো পণ্য পাওয়া যায়নি</p>
            <button onClick={() => onNavigate({ type: 'home' })} className="mt-4 px-6 py-2 rounded-lg text-white" style={{ backgroundColor: theme.primary }}>শপিং করুন</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Cart
// ============================================================================
function CartPage({ onNavigate }: { onNavigate: (page: PageType) => void; }) {
  const cart = useCart();
  const shipping = cart.total >= 1000 ? 0 : 60;
  const grandTotal = cart.total + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: theme.muted }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>আপনার কার্ট খালি</h2>
          <p className="mb-6" style={{ color: theme.muted }}>পছন্দের পণ্য যোগ করুন</p>
          <button onClick={() => onNavigate({ type: 'home' })} className="px-8 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: theme.primary }}>শপিং করুন</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.background }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>শপিং কার্ট ({cart.itemCount} আইটেম)</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
                <img src={item.imageUrl || ''} alt={item.title} className="w-24 h-24 object-cover rounded-lg cursor-pointer" onClick={() => onNavigate({ type: 'product', productId: item.id })} />
                <div className="flex-1">
                  <h3 className="font-medium cursor-pointer hover:underline" style={{ color: theme.text }} onClick={() => onNavigate({ type: 'product', productId: item.id })}>{item.title}</h3>
                  <p className="text-sm" style={{ color: theme.muted }}>{item.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold" style={{ color: theme.primary }}>{formatPrice(item.price)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: theme.muted + '40' }}>
                        <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 py-1 border-x" style={{ borderColor: theme.muted + '40' }}>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => cart.removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl h-fit lg:sticky lg:top-24" style={{ backgroundColor: theme.cardBg }}>
            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.text }}>অর্ডার সামারি</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between" style={{ color: theme.muted }}><span>সাবটোটাল ({cart.itemCount} আইটেম)</span><span>{formatPrice(cart.total)}</span></div>
              <div className="flex justify-between" style={{ color: theme.muted }}><span>ডেলিভারি চার্জ</span><span>{shipping === 0 ? 'ফ্রি' : formatPrice(shipping)}</span></div>
              {shipping > 0 && <p className="text-xs" style={{ color: theme.accent }}>৳{1000 - cart.total} আরও কিনলে ফ্রি ডেলিভারি!</p>}
              <div className="border-t pt-3 flex justify-between font-bold text-lg" style={{ borderColor: theme.muted + '20', color: theme.text }}><span>মোট</span><span style={{ color: theme.primary }}>{formatPrice(grandTotal)}</span></div>
            </div>
            <button onClick={() => onNavigate({ type: 'checkout' })} className="w-full mt-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90" style={{ backgroundColor: theme.primary }}>চেকআউট করুন</button>
            <button onClick={() => onNavigate({ type: 'home' })} className="w-full mt-3 py-3 rounded-lg font-medium transition hover:opacity-70" style={{ color: theme.primary }}>শপিং চালিয়ে যান</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Checkout
// ============================================================================
function CheckoutPage({ onNavigate }: { onNavigate: (page: PageType) => void; }) {
  const cart = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shipping = cart.total >= 1000 ? 0 : 60;
  const grandTotal = cart.total + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { cart.clearCart(); onNavigate({ type: 'order-success' }); }, 1500);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <p style={{ color: theme.muted }}>আপনার কার্ট খালি</p>
          <button onClick={() => onNavigate({ type: 'home' })} className="mt-4 px-6 py-2 rounded-lg text-white" style={{ backgroundColor: theme.primary }}>শপিং করুন</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.background }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>চেকআউট</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
                <h2 className="font-semibold text-lg mb-4" style={{ color: theme.text }}>ডেলিভারি তথ্য</h2>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>নাম *</label><input type="text" required placeholder="আপনার নাম" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} /></div>
                  <div><label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>মোবাইল নম্বর *</label><input type="tel" required placeholder="01XXXXXXXXX" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} /></div>
                  <div><label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>ঠিকানা *</label><textarea required rows={3} placeholder="বাড়ি নং, রাস্তা, এলাকা, শহর" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} /></div>
                  <div><label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>অতিরিক্ত নোট</label><input type="text" placeholder="বিশেষ নির্দেশনা (ঐচ্ছিক)" className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} /></div>
                </div>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
                <h2 className="font-semibold text-lg mb-4" style={{ color: theme.text }}>পেমেন্ট মেথড</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer" style={{ borderColor: theme.primary }}>
                    <input type="radio" name="payment" defaultChecked className="accent-current" style={{ accentColor: theme.primary }} />
                    <span style={{ color: theme.text }}>ক্যাশ অন ডেলিভারি (COD)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-not-allowed opacity-50" style={{ borderColor: theme.muted + '40' }}>
                    <input type="radio" name="payment" disabled />
                    <span style={{ color: theme.muted }}>বিকাশ/নগদ (শীঘ্রই আসছে)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl h-fit lg:sticky lg:top-24" style={{ backgroundColor: theme.cardBg }}>
              <h2 className="font-semibold text-lg mb-4" style={{ color: theme.text }}>অর্ডার সামারি</h2>
              <div className="space-y-3 mb-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.imageUrl || ''} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1"><p className="text-sm font-medium line-clamp-1" style={{ color: theme.text }}>{item.title}</p><p className="text-xs" style={{ color: theme.muted }}>{item.quantity} × {formatPrice(item.price)}</p></div>
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-4" style={{ borderColor: theme.muted + '20' }}>
                <div className="flex justify-between" style={{ color: theme.muted }}><span>সাবটোটাল</span><span>{formatPrice(cart.total)}</span></div>
                <div className="flex justify-between" style={{ color: theme.muted }}><span>ডেলিভারি</span><span>{shipping === 0 ? 'ফ্রি' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: theme.muted + '20', color: theme.text }}><span>মোট</span><span style={{ color: theme.primary }}>{formatPrice(grandTotal)}</span></div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: theme.primary }}>{isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}</button>
              <p className="text-xs text-center mt-3" style={{ color: theme.muted }}>⚠️ এটি একটি ডেমো প্রিভিউ। কোনো অর্ডার তৈরি হবে না।</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Order Success
// ============================================================================
function OrderSuccessPage({ onNavigate }: { onNavigate: (page: PageType) => void; }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center" style={{ backgroundColor: theme.background }}>
      <div className="text-center px-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: theme.primary + '15' }}><Check className="w-10 h-10" style={{ color: theme.primary }} /></div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>ধন্যবাদ! 🎉</h1>
        <p className="mb-2" style={{ color: theme.muted }}>আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে।</p>
        <p className="text-sm mb-8 px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: theme.accent + '20', color: theme.accent }}>এটি একটি ডেমো প্রিভিউ - কোনো অর্ডার তৈরি হয়নি</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => onNavigate({ type: 'home' })} className="px-8 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: theme.primary }}>শপিং চালিয়ে যান</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: Contact Form (Functional)
// ============================================================================
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: theme.cardBg }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.primary + '15' }}>
          <Check className="w-8 h-8" style={{ color: theme.primary }} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>ধন্যবাদ!</h3>
        <p style={{ color: theme.muted }}>আপনার মেসেজ পাঠানো হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।</p>
        <button onClick={() => setIsSubmitted(false)} className="mt-4 px-6 py-2 rounded-lg font-medium" style={{ backgroundColor: theme.primary, color: '#fff' }}>আরেকটি মেসেজ পাঠান</button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: theme.cardBg }}>
      <h2 className="font-semibold text-lg mb-4" style={{ color: theme.text }}>মেসেজ পাঠান</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="আপনার নাম" 
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" 
          style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} 
        />
        <input 
          type="email" 
          placeholder="ইমেইল" 
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" 
          style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} 
        />
        <textarea 
          rows={4} 
          placeholder="আপনার মেসেজ" 
          required
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" 
          style={{ borderColor: theme.muted + '40', backgroundColor: theme.background }} 
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-3 rounded-lg text-white font-medium transition hover:opacity-90 disabled:opacity-50" 
          style={{ backgroundColor: theme.primary }}
        >
          {isSubmitting ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// PAGE: Static Pages (About, Contact, FAQ, Policies)
// ============================================================================
function StaticPage({ pageId, onNavigate }: { pageId: string; onNavigate: (page: PageType) => void; }) {
  const page = DEMO_PAGES[pageId];
  
  if (!page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <p style={{ color: theme.muted }}>পেজ পাওয়া যায়নি</p>
          <button onClick={() => onNavigate({ type: 'home' })} className="mt-4 px-6 py-2 rounded-lg text-white" style={{ backgroundColor: theme.primary }}>হোমে ফিরুন</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.background }}>
      <div className="py-12 px-4 text-center" style={{ backgroundColor: theme.cardBg }}>
        <h1 className="text-3xl font-bold" style={{ color: theme.text }}>{page.titleBn}</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {pageId === 'faq' ? (
          <div className="space-y-4">
            {DEMO_FAQ.map((faq, i) => (
              <details key={i} className="p-4 rounded-xl group" style={{ backgroundColor: theme.cardBg }}>
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between" style={{ color: theme.text }}>
                  {faq.question}
                  <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 pt-3 border-t" style={{ color: theme.muted, borderColor: theme.muted + '20' }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        ) : pageId === 'contact' ? (
          <div>
            <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: theme.cardBg }}>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Phone className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
                  <h3 className="font-medium" style={{ color: theme.text }}>ফোন</h3>
                  <p style={{ color: theme.muted }}>{DEMO_BUSINESS_INFO.phone}</p>
                </div>
                <div className="text-center">
                  <Mail className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
                  <h3 className="font-medium" style={{ color: theme.text }}>ইমেইল</h3>
                  <p style={{ color: theme.muted }}>{DEMO_BUSINESS_INFO.email}</p>
                </div>
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
                  <h3 className="font-medium" style={{ color: theme.text }}>ঠিকানা</h3>
                  <p style={{ color: theme.muted }}>{DEMO_BUSINESS_INFO.address}</p>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        ) : (
          <div className="p-6 rounded-xl prose max-w-none" style={{ backgroundColor: theme.cardBg }}>
            <div style={{ color: theme.text, whiteSpace: 'pre-line' }}>{page.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================
export function StarterStoreTemplate({
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
  planType,
  isPreview,
}: StoreTemplateProps) {
  const [currentPage, setCurrentPage] = useState<PageType>({ type: 'home' });

  const navigate = useCallback((page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Use demo data for preview, otherwise use props
  const demoProducts = isPreview ? DEMO_PRODUCTS : (products as unknown as DemoProduct[]);
  const validCategories = (isPreview ? DEMO_CATEGORIES : categories.filter(Boolean)) as string[];

  // Render current page content
  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return <HomePage products={demoProducts} collections={DEMO_COLLECTIONS} onNavigate={navigate} config={config} />;
      case 'product':
        return <ProductDetailPage productId={currentPage.productId} onNavigate={navigate} />;
      case 'collection':
        return <CollectionPage collectionId={currentPage.collectionId} onNavigate={navigate} />;
      case 'category':
        return <CollectionPage category={currentPage.category} onNavigate={navigate} />;
      case 'search':
        return <SearchPage query={currentPage.query} onNavigate={navigate} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} />;
      case 'order-success':
        return <OrderSuccessPage onNavigate={navigate} />;
      case 'page':
        return <StaticPage pageId={currentPage.pageId} onNavigate={navigate} />;
      default:
        return <HomePage products={demoProducts} collections={DEMO_COLLECTIONS} onNavigate={navigate} config={config} />;
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen" style={{ backgroundColor: theme.background, fontFamily: STARTER_STORE_FONTS.body }}>
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Header */}
        <StoreHeader storeName={storeName || 'ডেমো স্টোর'} onNavigate={navigate} categories={validCategories} logo={logo} />

        {/* Main Content */}
        <main>{renderPage()}</main>

        {/* Footer */}
        <StoreFooter storeName={storeName || 'ডেমো স্টোর'} onNavigate={navigate} />
      </div>
    </CartProvider>
  );
}

// Export Header and Footer for registry (they're integrated in template)
export const StarterStoreHeader = () => null;
export const StarterStoreFooter = () => null;

// Default export
export default StarterStoreTemplate;
