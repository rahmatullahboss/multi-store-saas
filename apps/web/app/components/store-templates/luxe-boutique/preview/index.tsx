import { useState, useCallback, createContext, useContext, useMemo, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/lib/formatting';
import { getHeroBehavior } from '~/lib/hero-slides';
import {
  buildProxyImageUrl,
  generateProxySrcset,
  optimizeUnsplashUrl,
} from '~/utils/imageOptimization';

import { LUXE_BOUTIQUE_THEME } from '../theme';
import { LuxeBoutiqueProductPage } from '../pages/ProductPage';
import { LuxeCartPage } from '../pages/CartPage';
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
  const { t } = useTranslation();
  const theme = LUXE_BOUTIQUE_THEME;

  const validCategories = categories.filter((c): c is string => Boolean(c));

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: theme.headerBg, borderColor: '#e5e5e5' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button onClick={() => onNavigate({ type: 'home' })} className="flex items-center">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 lg:h-12 object-contain" />
            ) : (
              <span
                className="text-xl lg:text-2xl font-semibold tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", color: theme.primary }}
              >
                {storeName}
              </span>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
              style={{ color: theme.text }}
            >
              {t('allProducts')}
            </button>
            {validCategories.slice(0, 5).map((category) => (
              <button
                key={category}
                onClick={() => onNavigate({ type: 'category', category })}
                className="text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-70"
                style={{ color: theme.text }}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <button className="hidden sm:block p-2 rounded-full transition-colors hover:bg-gray-100">
              <Heart className="w-5 h-5" style={{ color: theme.text }} />
            </button>
            <button
              onClick={() => onNavigate({ type: 'cart' })}
              className="p-2 rounded-full transition-colors hover:bg-gray-100 relative"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: theme.text }} />
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: theme.accent, color: theme.primary }}
              >
                {cart.itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute inset-x-0 top-full bg-white border-b border-gray-200 py-4 px-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-black"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate({ type: 'search', query: e.currentTarget.value });
                  setSearchOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg">
          <nav className="py-4">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
              style={{ color: theme.text }}
            >
              {t('allProducts')}
            </button>
            {validCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onNavigate({ type: 'category', category });
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide"
                style={{ color: theme.text }}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="h-0.5" style={{ backgroundColor: theme.accent }} />
    </header>
  );
}

function PreviewProductCard({
  product,
  currency,
  onNavigate,
}: {
  product: DemoProduct;
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const theme = LUXE_BOUTIQUE_THEME;
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
    >
      <div
        className="aspect-[3/4] overflow-hidden mb-4 relative"
        style={{ backgroundColor: theme.cardBg }}
      >
        {product.imageUrl ? (
          <img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: theme.muted }}
          >
            No Image
          </div>
        )}

        {isSale && (
          <div
            className="absolute top-4 left-4 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5"
            style={{ backgroundColor: theme.accent, color: theme.primary }}
          >
            -{discount}%
          </div>
        )}
      </div>
      <h3
        className="text-sm mb-1 group-hover:opacity-60 transition-opacity"
        style={{ color: theme.text, fontFamily: "'Inter', sans-serif" }}
      >
        {product.title}
      </h3>
      <p className="text-sm" style={{ color: theme.muted }}>
        {formatPrice(product.price, currency)}
        {isSale && (
          <span className="ml-2 line-through opacity-60">
            {formatPrice(product.compareAtPrice, currency)}
          </span>
        )}
      </p>
    </div>
  );
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
  );

  return (
    <LuxeBoutiqueProductPage
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

function PreviewCartPageComponent({
  currency: _currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  return (
    <LuxeCartPage
      isPreview={true}
      onCheckout={() => onNavigate({ type: 'checkout' })}
      onNavigate={() => onNavigate({ type: 'home' })}
    />
  );
}

function PreviewCheckoutPage({
  currency,
  onNavigate,
}: {
  currency: string;
  onNavigate: (page: PageType) => void;
}) {
  const cart = usePreviewCart();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cart.clearCart();
    onNavigate({ type: 'order-success' });
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-serif mb-8 text-center">Checkout</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 border border-[#e5e5e5] space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-xl mb-4">Shipping Details</h3>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
            />
            <textarea
              placeholder="Address"
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>
          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center text-xl font-serif mb-6">
              <span>Total</span>
              <span>{formatPrice(cart.total, currency)}</span>
            </div>
            <button
              type="submit"
              className="w-full bg-[#1a1a1a] text-white font-bold py-4 uppercase tracking-widest text-xs hover:bg-[#c9a961] transition-colors"
            >
              Place Order (Demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewFooter({
  storeName,
  categories: _categories,
  onNavigate,
}: {
  storeName: string;
  categories: (string | null)[];
  onNavigate: (page: PageType) => void;
}) {
  const theme = LUXE_BOUTIQUE_THEME;

  return (
    <footer style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {storeName}
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Curating exceptional products for discerning customers.
            </p>
          </div>
          <div>
            <h5
              className="font-medium uppercase text-sm tracking-wider mb-4"
              style={{ color: theme.accent }}
            >
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm">
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
              className="font-medium uppercase text-sm tracking-wider mb-4"
              style={{ color: theme.accent }}
            >
              Contact Us
            </h5>
            <p className="text-sm text-white/70">support@example.com</p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 py-6 text-center">
          <p className="text-sm text-white/50" suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

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
  const theme = LUXE_BOUTIQUE_THEME;
  const { t } = useTranslation();
  const heroBehavior = getHeroBehavior(config);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlide = heroBehavior.slides[heroIndex];
  const heroImage =
    heroSlide?.imageUrl ||
    config?.bannerUrl ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop';
  const heroBgUrl = heroImage.includes('unsplash.com')
    ? optimizeUnsplashUrl(heroImage, { width: 1600, height: 900, quality: 80, format: 'webp' })
    : buildProxyImageUrl(heroImage, { width: 1600, height: 900, quality: 78 });
  const heroHeading = heroSlide?.heading || config?.bannerText || 'Redefining Elegance';
  const heroSubheading =
    heroSlide?.subheading || 'Discover a world of timeless style and uncompromising quality.';
  const heroCta = heroSlide?.ctaText || 'Shop Collection';
  const whyChooseSection = (Array.isArray(config?.sections) ? config.sections : []).find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s?.type === 'features' || s?.type === 'modern-features'
  );
  const whyChooseFeatures = (
    Array.isArray(whyChooseSection?.settings?.features)
      ? whyChooseSection.settings.features
      : [
          {
            icon: '✨',
            title: 'Premium Quality',
            description: 'Carefully curated luxury selection.',
          },
          {
            icon: '⚡',
            title: 'Fast Delivery',
            description: 'Quick and reliable nationwide shipping.',
          },
          {
            icon: '💬',
            title: '24/7 Support',
            description: 'Dedicated support whenever you need us.',
          },
        ]
  ) as Array<{ icon?: string; title?: string; description?: string }>;
  const whyChooseHeading = String(whyChooseSection?.settings?.heading || 'Why Choose Us');
  const whyChooseSubheading = String(
    whyChooseSection?.settings?.subheading || 'A premium experience from order to delivery.'
  );

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBehavior.slides.length);
    }, heroBehavior.delayMs);
    return () => clearInterval(timer);
  }, [
    heroBehavior.autoplay,
    heroBehavior.delayMs,
    heroBehavior.isCarousel,
    heroBehavior.slides.length,
  ]);

  useEffect(() => {
    if (heroIndex >= heroBehavior.slides.length) {
      setHeroIndex(0);
    }
  }, [heroBehavior.slides.length, heroIndex]);

  return (
    <div className="min-h-screen">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBgUrl})`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${config?.heroOverlayOpacity ?? 0.4})`,
            }}
          />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">{heroHeading}</h1>
          <p className="text-lg md:text-xl mb-8 font-light tracking-wide opacity-90">
            {heroSubheading}
          </p>
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="px-10 py-4 bg-white text-black uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#c9a961] hover:text-white transition-colors"
          >
            {heroCta}
          </button>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs uppercase tracking-[0.2em] block mb-4"
              style={{ color: theme.accent }}
            >
              {t('curatedSelection')}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif" style={{ color: theme.text }}>
              {t('featuredArrivals')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.slice(0, 8).map((product) => (
              <PreviewProductCard
                key={product.id}
                product={product}
                currency={currency}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="inline-block border-b border-black pb-1 uppercase tracking-[0.15em] text-sm hover:opacity-60 transition-opacity"
            >
              {t('viewAllProducts')}
            </button>
          </div>
        </div>
      </section>

      {whyChooseSection && whyChooseFeatures.length > 0 && (
        <section className="py-16 md:py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-3" style={{ color: theme.text }}>
                {whyChooseHeading}
              </h2>
              <p className="text-sm md:text-base text-[#6b6b6b]">{whyChooseSubheading}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyChooseFeatures.slice(0, 3).map((feature, index) => (
                <div
                  key={`${feature?.title || 'feature'}-${index}`}
                  className="p-8 border border-[#ece7de] bg-[#faf9f7] text-center"
                >
                  <div className="text-2xl mb-3">{feature?.icon || '✨'}</div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>
                    {feature?.title || 'Premium Experience'}
                  </h3>
                  <p className="text-sm text-[#6b6b6b]">
                    {feature?.description || 'Built for quality, speed, and trust.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW STORE CONTAINER
// ============================================================================
export function PreviewLuxeStore(props: StoreTemplateProps) {
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
      case 'search':
        return <div className="p-20 text-center">Search results for {currentPage.query}</div>;
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="py-20 bg-[#faf9f7] min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
              <h1 className="text-4xl font-serif mb-12 text-center">{currentPage.category}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filtered.map((product) => (
                  <PreviewProductCard
                    key={product.id}
                    product={product}
                    currency={currency}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'order-success':
        return (
          <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
            <div className="bg-white p-12 border border-[#e5e5e5] max-w-md">
              <h2 className="text-3xl font-serif mb-4">Order Confirmed</h2>
              <p className="text-[#6b6b6b] mb-8 font-light">Thank you for your purchase.</p>
              <button
                onClick={() => navigate({ type: 'home' })}
                className="bg-[#1a1a1a] text-white px-8 py-3 uppercase tracking-widest text-xs"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        );
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
          backgroundColor: LUXE_BOUTIQUE_THEME.background,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
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
