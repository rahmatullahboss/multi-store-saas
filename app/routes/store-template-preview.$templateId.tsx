/**
 * Immersive Store Template Preview
 * 
 * Route: /store-template-preview/:templateId
 * 
 * A full-featured, immersive store preview experience that looks and feels
 * like a real store. No control bars or admin UI - pure store experience.
 * 
 * Features:
 * - Full store navigation (home, products, collections, cart, checkout)
 * - Working cart with local state
 * - Simulated checkout (no real orders)
 * - Search functionality
 * - Static pages (About, Contact, FAQ, Policies)
 * - Responsive design (mobile/desktop)
 * - Subtle preview indicator that can be dismissed
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate, Link } from '@remix-run/react';
import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { 
  ShoppingCart, Search, Menu, X, ChevronLeft, ChevronRight,
  Star, Plus, Minus, Trash2, Check, Phone, Mail, MapPin,
  Facebook, Instagram, ChevronDown, Heart, Share2, Truck, Shield, RotateCcw,
  Home, Grid, Tag, Info, HelpCircle, FileText, Eye
} from 'lucide-react';
import { getStoreTemplate, STORE_TEMPLATES, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { 
  DEMO_PRODUCTS, 
  DEMO_CATEGORIES, 
  DEMO_COLLECTIONS,
  DEMO_SOCIAL_LINKS, 
  DEMO_BUSINESS_INFO, 
  DEMO_FOOTER_CONFIG, 
  DEMO_THEME_CONFIG,
  DEMO_STORE_NAME,
  DEMO_REVIEWS,
  DEMO_PAGES,
  DEMO_FAQ,
  getDemoProductById,
  getDemoProductsByCategory,
  getDemoProductsByCollection,
  getRelatedProducts,
  getProductReviews,
  searchDemoProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';

// ============================================================================
// META
// ============================================================================
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.storeName || 'ডেমো স্টোর'} - ${data?.templateName || 'থিম প্রিভিউ'}` },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ params }: LoaderFunctionArgs) {
  const templateId = params.templateId || 'luxe-boutique';
  const template = getStoreTemplate(templateId);
  const theme = STORE_TEMPLATE_THEMES[templateId] || STORE_TEMPLATE_THEMES['luxe-boutique'];
  
  return json({
    templateId: template.id,
    templateName: template.name,
    templateDescription: template.description,
    theme,
    storeName: DEMO_STORE_NAME,
    products: DEMO_PRODUCTS,
    categories: DEMO_CATEGORIES,
    collections: DEMO_COLLECTIONS,
    socialLinks: DEMO_SOCIAL_LINKS,
    businessInfo: DEMO_BUSINESS_INFO,
    footerConfig: DEMO_FOOTER_CONFIG,
    themeConfig: DEMO_THEME_CONFIG,
    pages: DEMO_PAGES,
    faq: DEMO_FAQ,
    templates: STORE_TEMPLATES.map(t => ({ id: t.id, name: t.name })),
  });
}

// ============================================================================
// CART CONTEXT
// ============================================================================
interface CartItem extends DemoProduct {
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
  theme, 
  storeName, 
  onNavigate,
  categories,
}: { 
  theme: any;
  storeName: string;
  onNavigate: (page: PageType) => void;
  categories: string[];
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
      {DEMO_THEME_CONFIG.announcement && (
        <div 
          className="py-2 px-4 text-center text-sm"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          {DEMO_THEME_CONFIG.announcement.text}
        </div>
      )}

      {/* Main Header */}
      <header 
        className="sticky top-0 z-40 shadow-sm"
        style={{ backgroundColor: theme.headerBg }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2"
            >
              <Menu className="w-6 h-6" style={{ color: theme.text }} />
            </button>

            {/* Logo */}
            <button 
              onClick={() => onNavigate({ type: 'home' })}
              className="flex items-center gap-2"
            >
              <span 
                className="text-xl font-bold"
                style={{ color: theme.text }}
              >
                {storeName}
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button 
                onClick={() => onNavigate({ type: 'home' })}
                className="text-sm font-medium hover:opacity-70 transition"
                style={{ color: theme.text }}
              >
                হোম
              </button>
              {categories.slice(0, 5).map(cat => (
                <button 
                  key={cat}
                  onClick={() => onNavigate({ type: 'category', category: cat })}
                  className="text-sm font-medium hover:opacity-70 transition"
                  style={{ color: theme.text }}
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:opacity-70 transition"
              >
                <Search className="w-5 h-5" style={{ color: theme.text }} />
              </button>
              <button 
                onClick={() => onNavigate({ type: 'cart' })}
                className="p-2 hover:opacity-70 transition relative"
              >
                <ShoppingCart className="w-5 h-5" style={{ color: theme.text }} />
                {cart.itemCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {cart.itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 p-6 overflow-y-auto"
            style={{ backgroundColor: theme.headerBg }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold" style={{ color: theme.text }}>
                {storeName}
              </span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" style={{ color: theme.text }} />
              </button>
            </div>
            <nav className="space-y-4">
              <button 
                onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 font-medium"
                style={{ color: theme.text }}
              >
                হোম
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => { onNavigate({ type: 'category', category: cat }); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2"
                  style={{ color: theme.text }}
                >
                  {cat}
                </button>
              ))}
              <hr style={{ borderColor: theme.muted + '30' }} />
              <button 
                onClick={() => { onNavigate({ type: 'page', pageId: 'about' }); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2"
                style={{ color: theme.muted }}
              >
                আমাদের সম্পর্কে
              </button>
              <button 
                onClick={() => { onNavigate({ type: 'page', pageId: 'contact' }); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2"
                style={{ color: theme.muted }}
              >
                যোগাযোগ
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSearchOpen(false)}
          />
          <div 
            className="absolute top-0 left-0 right-0 p-4"
            style={{ backgroundColor: theme.headerBg }}
          >
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                autoFocus
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: theme.muted + '40',
                  backgroundColor: theme.background,
                }}
              />
              <button 
                type="submit"
                className="px-6 py-3 rounded-lg text-white"
                style={{ backgroundColor: theme.primary }}
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-3"
              >
                <X className="w-5 h-5" style={{ color: theme.text }} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
