/**
 * Store Preview Frame Route
 *
 * A standalone route used as an iframe source for live preview in the Store Editor.
 * Listens for postMessage updates from parent window to update config in real-time.
 *
 * NEW: Supports internal navigation (home, product detail, cart, checkout) within the preview.
 *
 * Route: /store-preview-frame
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products as productsTable } from '@db/schema';
import {
  parseThemeConfig,
  defaultThemeConfig,
  type ThemeConfig,
  parseSocialLinks,
  type TypographySettings,
} from '@db/types';
import { getStoreId } from '~/services/auth.server';
import {
  getStoreTemplate,
  DEFAULT_STORE_TEMPLATE_ID,
  STORE_TEMPLATE_THEMES,
  type SerializedProduct,
  type StoreTemplateTheme,
} from '~/templates/store-registry';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Home,
  ShoppingCart,
  Check,
  Minus,
  Plus,
  CreditCard,
} from 'lucide-react';
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';

// Demo cart items for preview
const DEMO_CART_ITEMS_COUNT = 3;

// ============================================================================
// TYPES
// ============================================================================
// Use StoreTemplateTheme base but allow for loose typing during live preview updates
type ThemeColors = StoreTemplateTheme & {
  [key: string]: string | undefined;
};

// LiveConfig should basically mirror ThemeConfig but with optional properties for the editor state
interface LiveConfig {
  themeId?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  typography?: TypographySettings;
  fontFamily?: string;
  bannerUrl?: string;
  bannerText?: string;
  announcement?: { text: string; link?: string };
  customCSS?: string;
  storeTemplateId?: string;
  sections?: Record<string, unknown>[];
  productSections?: Record<string, unknown>[];
  collectionSections?: Record<string, unknown>[];
  cartSections?: Record<string, unknown>[];
  checkoutSections?: Record<string, unknown>[];
  logo?: string;
  businessInfo?: Record<string, unknown>;
  socialLinks?: Record<string, unknown>;
  headerLayout?: ThemeConfig['headerLayout'];
  headerShowSearch?: boolean;
  headerShowCart?: boolean;
  footerDescription?: string;
  copyrightText?: string;
  footerColumns?: ThemeConfig['footerColumns']; // Keep any here for complex nested array or define specific type
  floatingWhatsappEnabled?: boolean;
  floatingWhatsappNumber?: string;
  floatingWhatsappMessage?: string;
  floatingCallEnabled?: boolean;
  floatingCallNumber?: string;
  checkoutStyle?: ThemeConfig['checkoutStyle'];
  flashSale?: {
    isActive: boolean;
    text?: string;
    endTime?: string;
    backgroundColor?: string;
    textColor?: string;
    discountPercentage?: number;
    discountType?: 'percent' | 'fixed';
  };
  trustBadges?: {
    showPaymentIcons: boolean;
    showGuaranteeSeals: boolean;
    customText?: string;
  };
  marketingPopup?: {
    isActive: boolean;
    title?: string;
    description?: string;
    delay?: number;
    offerCode?: string;
  };
}

// ============================================================================
// META - Viewport for mobile responsiveness
// ============================================================================
export const meta: MetaFunction = () => {
  return [{ name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }];
};

// ============================================================================
// LOADER - Fetch store data for preview
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Get products
  const storeProducts = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.storeId, storeId), eq(productsTable.isPublished, true)))
    .limit(20);

  const themeConfig = parseThemeConfig(store.themeConfig as string | null) || defaultThemeConfig;
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);

  // Get unique categories
  const categories = [...new Set(storeProducts.map((p) => p.category).filter(Boolean))] as string[];

  return json({
    storeId,
    storeName: store.name,
    logo: store.logo,
    fontFamily: store.fontFamily || 'inter',
    currency: store.currency || 'BDT',
    theme: store.theme || 'default',
    themeConfig,
    socialLinks,
    businessInfo: store.businessInfo ? JSON.parse(store.businessInfo) : null,
    products: storeProducts,
    categories,
  });
}

// ============================================================================
// TYPES (Data)
// ============================================================================
interface StorePreviewData {
  storeId: number;
  storeName: string;
  logo: string | null;
  fontFamily: string;
  currency: string;
  theme: string;
  themeConfig: ThemeConfig;
  socialLinks: Record<string, string> | null;
  businessInfo?: Record<string, string | number | null> | null; // Optional to match Remix serialization behavior
  products: SerializedProduct[];
  categories: string[];
  error?: string;
}

// ============================================================================
// PRODUCT DETAIL VIEW COMPONENT
// ============================================================================
function ProductDetailView({
  product,
  onBack,
  onAddToCart,
  currency,
  themeColors,
}: {
  product: SerializedProduct;
  onBack: () => void;
  onAddToCart: () => void;
  currency: string;
  themeColors: ThemeColors;
}) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    if (currency === 'BDT') return `৳${price.toLocaleString('bn-BD')}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 shadow-sm"
        style={{ backgroundColor: themeColors.headerBg || themeColors.cardBg }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 transition">
            <ArrowLeft className="w-5 h-5" style={{ color: themeColors.text }} />
          </button>
          <span className="font-medium" style={{ color: themeColors.text }}>
            প্রোডাক্ট বিবরণ
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div
            className="aspect-square rounded-2xl overflow-hidden"
            style={{ backgroundColor: themeColors.cardBg }}
          >
            <img
              src={product.imageUrl || 'https://picsum.photos/seed/default/600/600'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {product.category && (
              <span
                className="inline-block text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: themeColors.primary + '20', color: themeColors.primary }}
              >
                {product.category}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: themeColors.text }}>
              {product.title}
            </h1>

            <p style={{ color: themeColors.muted }}>
              {product.description ||
                'প্রিমিয়াম কোয়ালিটি প্রোডাক্ট। দ্রুত ডেলিভারি এবং সহজ রিটার্ন পলিসি।'}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: themeColors.primary }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg line-through" style={{ color: themeColors.muted }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span style={{ color: themeColors.text }}>পরিমাণ:</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border-x min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onAddToCart}
                className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: themeColors.primary }}
              >
                কার্টে যোগ করুন
              </button>
              <button
                onClick={onAddToCart}
                className="flex-1 py-3 px-6 rounded-lg font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: themeColors.accent || themeColors.primary,
                  color: '#fff',
                }}
              >
                এখনই কিনুন
              </button>
            </div>

            {/* Info */}
            <div
              className="p-4 rounded-lg space-y-2"
              style={{ backgroundColor: themeColors.cardBg }}
            >
              <p className="flex items-center gap-2 text-sm" style={{ color: themeColors.muted }}>
                <Check className="w-4 h-4" style={{ color: themeColors.primary }} />
                ১০০% অরিজিনাল প্রোডাক্ট
              </p>
              <p className="flex items-center gap-2 text-sm" style={{ color: themeColors.muted }}>
                <Check className="w-4 h-4" style={{ color: themeColors.primary }} />
                ক্যাশ অন ডেলিভারি সুবিধা
              </p>
              <p className="flex items-center gap-2 text-sm" style={{ color: themeColors.muted }}>
                <Check className="w-4 h-4" style={{ color: themeColors.primary }} />৭ দিনের রিটার্ন
                পলিসি
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CART VIEW COMPONENT
// ============================================================================
function CartView({
  products,
  onBack,
  onCheckout,
  currency,
  themeColors,
}: {
  products: SerializedProduct[];
  onBack: () => void;
  onCheckout: () => void;
  currency: string;
  themeColors: ThemeColors;
}) {
  // Use first few products as demo cart items
  const cartItems = products.slice(0, DEMO_CART_ITEMS_COUNT).map((p, i) => ({
    ...p,
    quantity: i === 0 ? 2 : 1,
  }));

  const formatPrice = (price: number) => {
    if (currency === 'BDT') return `৳${price.toLocaleString('bn-BD')}`;
    return `$${price.toFixed(2)}`;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 60;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 shadow-sm"
        style={{ backgroundColor: themeColors.headerBg || themeColors.cardBg }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 transition">
            <ArrowLeft className="w-5 h-5" style={{ color: themeColors.text }} />
          </button>
          <span className="font-medium flex items-center gap-2" style={{ color: themeColors.text }}>
            <ShoppingCart className="w-5 h-5" />
            কার্ট ({cartItems.length} আইটেম)
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              style={{ color: themeColors.muted }}
            />
            <p style={{ color: themeColors.muted }}>আপনার কার্ট খালি</p>
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2 rounded-lg text-white"
              style={{ backgroundColor: themeColors.primary }}
            >
              শপিং করুন
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{ backgroundColor: themeColors.cardBg }}
                >
                  <img
                    src={item.imageUrl || 'https://picsum.photos/seed/default/200/200'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium" style={{ color: themeColors.text }}>
                      {item.title}
                    </h3>
                    <p className="text-sm" style={{ color: themeColors.muted }}>
                      {item.category}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold" style={{ color: themeColors.primary }}>
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button className="px-3 py-1 hover:bg-gray-100 text-sm">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 border-x text-sm">{item.quantity}</span>
                        <button className="px-3 py-1 hover:bg-gray-100 text-sm">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div
              className="p-6 rounded-xl h-fit sticky top-24"
              style={{ backgroundColor: themeColors.cardBg }}
            >
              <h3 className="font-semibold mb-4" style={{ color: themeColors.text }}>
                অর্ডার সামারি
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between" style={{ color: themeColors.muted }}>
                  <span>সাবটোটাল</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between" style={{ color: themeColors.muted }}>
                  <span>ডেলিভারি চার্জ</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div
                  className="border-t pt-3 flex justify-between font-bold"
                  style={{ color: themeColors.text }}
                >
                  <span>মোট</span>
                  <span style={{ color: themeColors.primary }}>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full mt-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: themeColors.primary }}
              >
                চেকআউট করুন
              </button>

              <p className="text-xs text-center mt-3" style={{ color: themeColors.muted }}>
                ক্যাশ অন ডেলিভারি সুবিধা রয়েছে
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CHECKOUT VIEW COMPONENT
// ============================================================================
function CheckoutView({
  products,
  onBack,
  currency,
  themeColors,
}: {
  products: SerializedProduct[];
  onBack: () => void;
  currency: string;
  themeColors: ThemeColors;
}) {
  const cartItems = products.slice(0, DEMO_CART_ITEMS_COUNT).map((p, i) => ({
    ...p,
    quantity: i === 0 ? 2 : 1,
  }));

  const formatPrice = (price: number) => {
    if (currency === 'BDT') return `৳${price.toLocaleString('bn-BD')}`;
    return `$${price.toFixed(2)}`;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 60;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 shadow-sm"
        style={{ backgroundColor: themeColors.headerBg || themeColors.cardBg }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 transition">
            <ArrowLeft className="w-5 h-5" style={{ color: themeColors.text }} />
          </button>
          <span className="font-medium flex items-center gap-2" style={{ color: themeColors.text }}>
            <CreditCard className="w-5 h-5" />
            চেকআউট
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="p-6 rounded-xl space-y-4" style={{ backgroundColor: themeColors.cardBg }}>
            <h3 className="font-semibold text-lg" style={{ color: themeColors.text }}>
              ডেলিভারি তথ্য
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: themeColors.text }}
                >
                  নাম *
                </label>
                <input
                  type="text"
                  placeholder="আপনার পুরো নাম"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: themeColors.muted + '40',
                    backgroundColor: themeColors.background,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: themeColors.text }}
                >
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: themeColors.muted + '40',
                    backgroundColor: themeColors.background,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: themeColors.text }}
                >
                  ঠিকানা *
                </label>
                <textarea
                  rows={3}
                  placeholder="বাড়ি নং, রাস্তা, এলাকা, শহর"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: themeColors.muted + '40',
                    backgroundColor: themeColors.background,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: themeColors.text }}
                >
                  অতিরিক্ত নোট
                </label>
                <input
                  type="text"
                  placeholder="বিশেষ কোন নির্দেশনা থাকলে লিখুন"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: themeColors.muted + '40',
                    backgroundColor: themeColors.background,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: themeColors.muted + '20' }}>
              <h4 className="font-medium mb-3" style={{ color: themeColors.text }}>
                পেমেন্ট মেথড
              </h4>
              <div className="space-y-2">
                <label
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer"
                  style={{ borderColor: themeColors.primary }}
                >
                  <input
                    type="radio"
                    name="payment"
                    defaultChecked
                    className="accent-current"
                    style={{ accentColor: themeColors.primary }}
                  />
                  <span style={{ color: themeColors.text }}>ক্যাশ অন ডেলিভারি (COD)</span>
                </label>
                <label
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer opacity-50"
                  style={{ borderColor: themeColors.muted + '40' }}
                >
                  <input type="radio" name="payment" disabled />
                  <span style={{ color: themeColors.muted }}>অনলাইন পেমেন্ট (শীঘ্রই আসছে)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              className="p-6 rounded-xl sticky top-24"
              style={{ backgroundColor: themeColors.cardBg }}
            >
              <h3 className="font-semibold mb-4" style={{ color: themeColors.text }}>
                অর্ডার সামারি
              </h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.imageUrl || 'https://picsum.photos/seed/default/100/100'}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium line-clamp-1"
                        style={{ color: themeColors.text }}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs" style={{ color: themeColors.muted }}>
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="space-y-2 text-sm border-t pt-4"
                style={{ borderColor: themeColors.muted + '20' }}
              >
                <div className="flex justify-between" style={{ color: themeColors.muted }}>
                  <span>সাবটোটাল</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between" style={{ color: themeColors.muted }}>
                  <span>ডেলিভারি</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div
                  className="flex justify-between font-bold text-base pt-2 border-t"
                  style={{ borderColor: themeColors.muted + '20', color: themeColors.text }}
                >
                  <span>মোট</span>
                  <span style={{ color: themeColors.primary }}>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                className="w-full mt-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: themeColors.primary }}
              >
                অর্ডার কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW NAVIGATION BAR COMPONENT
// ============================================================================
function PreviewNavBar({
  currentPage,
  onNavigate,
}: {
  currentPage: 'home' | 'product' | 'cart' | 'checkout' | 'collection';
  onNavigate: (page: 'home' | 'product' | 'cart' | 'checkout' | 'collection') => void;
}) {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
    >
      <button
        onClick={() => onNavigate('home')}
        className={`p-2 rounded-full transition ${currentPage === 'home' ? 'bg-white/20' : 'hover:bg-white/10'}`}
        title="হোম"
      >
        <Home className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={() => onNavigate('cart')}
        className={`p-2 rounded-full transition ${currentPage === 'cart' ? 'bg-white/20' : 'hover:bg-white/10'}`}
        title="কার্ট"
      >
        <ShoppingCart className="w-4 h-4 text-white" />
      </button>
      <span className="text-xs text-white/60 px-2">
        {currentPage === 'home' && 'হোম পেজ'}
        {currentPage === 'product' && 'প্রোডাক্ট'}
        {currentPage === 'collection' && 'কালেকশন'}
        {currentPage === 'cart' && 'কার্ট'}
        {currentPage === 'checkout' && 'চেকআউট'}
      </span>
    </div>
  );
}

// ============================================================================
// COMPONENT - Preview Frame
// ============================================================================
// ============================================================================
// COMPONENT - Preview Content (Hooks safely used here)
// ============================================================================
function StorePreviewContent({ data }: { data: StorePreviewData }) {
  // Internal navigation state
  const [currentPage, setCurrentPage] = useState<
    'home' | 'product' | 'cart' | 'checkout' | 'collection'
  >('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Live config state (updated via postMessage)
  const [liveConfig, setLiveConfig] = useState<LiveConfig>({
    themeId: data.themeConfig.storeTemplateId || 'starter-store',
    primaryColor: data.themeConfig.primaryColor,
    accentColor: data.themeConfig.accentColor,
    backgroundColor: data.themeConfig.backgroundColor,
    textColor: data.themeConfig.textColor,
    borderColor: data.themeConfig.borderColor,
    typography: data.themeConfig.typography,
    fontFamily: data.fontFamily,
    bannerUrl: data.themeConfig.bannerUrl,
    bannerText: data.themeConfig.bannerText,
    announcement: data.themeConfig.announcement,
    customCSS: data.themeConfig.customCSS,
    storeTemplateId: data.themeConfig.storeTemplateId,
    sections: data.themeConfig.sections,
    productSections: data.themeConfig.productSections,
    logo: data.logo ?? undefined,
    businessInfo: data.businessInfo || undefined,
    socialLinks: data.socialLinks || undefined,
    headerLayout: data.themeConfig.headerLayout,
    headerShowSearch: data.themeConfig.headerShowSearch,
    headerShowCart: data.themeConfig.headerShowCart,
    footerDescription: data.themeConfig.footerDescription,
    copyrightText: data.themeConfig.copyrightText,
    footerColumns: data.themeConfig.footerColumns,
    floatingWhatsappEnabled: data.themeConfig.floatingWhatsappEnabled,
    floatingWhatsappNumber: data.themeConfig.floatingWhatsappNumber,
    floatingWhatsappMessage: data.themeConfig.floatingWhatsappMessage,
    floatingCallEnabled: data.themeConfig.floatingCallEnabled,
    floatingCallNumber: data.themeConfig.floatingCallNumber,
    checkoutStyle: data.themeConfig.checkoutStyle,
    flashSale: data.themeConfig.flashSale,
    trustBadges: data.themeConfig.trustBadges,
    marketingPopup: data.themeConfig.marketingPopup,
  });

  // Signal to parent that frame is ready
  useEffect(() => {
    window.parent.postMessage({ type: 'STORE_PREVIEW_READY' }, '*');
  }, []);

  // Notify parent of page changes
  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'STORE_PREVIEW_PAGE_CHANGE',
        page: currentPage,
        productId: selectedProductId,
      },
      '*'
    );
  }, [currentPage, selectedProductId]);

  // Listen for config updates and navigation commands from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STORE_PREVIEW_UPDATE') {
        setLiveConfig((prev) => ({
          ...prev,
          ...event.data.config,
        }));
      }
      // Allow parent to control navigation
      if (event.data?.type === 'STORE_PREVIEW_NAVIGATE') {
        if (event.data.page) setCurrentPage(event.data.page);
        if (event.data.productId) setSelectedProductId(event.data.productId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Merge live config with data
  const mergedConfig: ThemeConfig = {
    ...data.themeConfig,
    primaryColor: liveConfig.primaryColor || data.themeConfig.primaryColor,
    accentColor: liveConfig.accentColor || data.themeConfig.accentColor,
    backgroundColor: liveConfig.backgroundColor || data.themeConfig.backgroundColor,
    textColor: liveConfig.textColor || data.themeConfig.textColor,
    borderColor: liveConfig.borderColor || data.themeConfig.borderColor,
    typography: liveConfig.typography || data.themeConfig.typography,
    bannerUrl: liveConfig.bannerUrl ?? data.themeConfig.bannerUrl,
    bannerText: liveConfig.bannerText ?? data.themeConfig.bannerText,
    announcement:
      liveConfig.announcement ||
      (data.themeConfig.announcement
        ? {
            text: data.themeConfig.announcement.text,
            link: data.themeConfig.announcement.link || undefined,
          }
        : undefined),
    customCSS: liveConfig.customCSS ?? data.themeConfig.customCSS,
    storeTemplateId: liveConfig.storeTemplateId || data.themeConfig.storeTemplateId,
    sections: liveConfig.sections || data.themeConfig.sections,
    productSections: liveConfig.productSections || data.themeConfig.productSections,
    headerLayout: liveConfig.headerLayout || data.themeConfig.headerLayout,
    headerShowSearch: liveConfig.headerShowSearch ?? data.themeConfig.headerShowSearch,
    headerShowCart: liveConfig.headerShowCart ?? data.themeConfig.headerShowCart,
    footerDescription: liveConfig.footerDescription ?? data.themeConfig.footerDescription,
    copyrightText: liveConfig.copyrightText ?? data.themeConfig.copyrightText,
    footerColumns: liveConfig.footerColumns ?? data.themeConfig.footerColumns,
    floatingWhatsappEnabled:
      liveConfig.floatingWhatsappEnabled ?? data.themeConfig.floatingWhatsappEnabled,
    floatingWhatsappNumber:
      liveConfig.floatingWhatsappNumber ?? data.themeConfig.floatingWhatsappNumber,
    floatingWhatsappMessage:
      liveConfig.floatingWhatsappMessage ?? data.themeConfig.floatingWhatsappMessage,
    floatingCallEnabled: liveConfig.floatingCallEnabled ?? data.themeConfig.floatingCallEnabled,
    floatingCallNumber: liveConfig.floatingCallNumber ?? data.themeConfig.floatingCallNumber,
    checkoutStyle: liveConfig.checkoutStyle ?? data.themeConfig.checkoutStyle,
    flashSale: liveConfig.flashSale ?? data.themeConfig.flashSale,
    trustBadges: liveConfig.trustBadges ?? data.themeConfig.trustBadges,
    marketingPopup: liveConfig.marketingPopup ?? data.themeConfig.marketingPopup,
  };

  // Get template component and theme colors
  const themeId =
    liveConfig.themeId ||
    liveConfig.storeTemplateId ||
    mergedConfig.storeTemplateId ||
    'starter-store';
  const templateId = mergedConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const { component: StoreTemplateComponent } = getStoreTemplate(templateId);

  // Get theme colors from registry or use config colors
  const themeColors = (STORE_TEMPLATE_THEMES[templateId] || {
    primary: mergedConfig.primaryColor || '#6366f1',
    accent: mergedConfig.accentColor || '#f59e0b',
    background: mergedConfig.backgroundColor || '#f9fafb',
    text: mergedConfig.textColor || '#111827',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1f2937',
    footerText: '#f9fafb',
  }) as ThemeColors;

  // Navigation handlers
  const handleProductClick = useCallback((productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
  }, []);

  const handleCartClick = useCallback(() => {
    setCurrentPage('cart');
  }, []);

  const handleCheckout = useCallback(() => {
    setCurrentPage('checkout');
  }, []);

  const handleBack = useCallback(() => {
    if (currentPage === 'checkout') {
      setCurrentPage('cart');
    } else {
      setCurrentPage('home');
      setSelectedProductId(null);
    }
  }, [currentPage]);

  const handleNavigate = useCallback(
    (page: 'home' | 'product' | 'cart' | 'checkout' | 'collection') => {
      setCurrentPage(page);
      if (page === 'home') setSelectedProductId(null);
    },
    []
  );

  // Get selected product for product detail view
  const selectedProduct = data.products.find((p: SerializedProduct) => p.id === selectedProductId);

  // Determine which sections to render based on current page
  const getCurrentPageSections = useMemo(() => {
    // Try to get sections from liveConfig first (from postMessage)
    switch (currentPage) {
      case 'home':
        return liveConfig.sections || [];
      case 'product':
        return liveConfig.productSections || [];
      case 'collection':
        return liveConfig.collectionSections || [];
      case 'cart':
        return liveConfig.cartSections || [];
      case 'checkout':
        return liveConfig.checkoutSections || [];
      default:
        return liveConfig.sections || [];
    }
  }, [
    currentPage,
    liveConfig.sections,
    liveConfig.productSections,
    liveConfig.collectionSections,
    liveConfig.cartSections,
    liveConfig.checkoutSections,
  ]);

  // Check if we have sections from ThemeStoreRenderer-compatible format
  const hasThemeSections = getCurrentPageSections.length > 0;

  // Render content based on current page
  const renderContent = () => {
    // If we have theme sections, use ThemeStoreRenderer
    if (hasThemeSections) {
      // Convert sections to ThemeStoreRenderer format
      const formattedSections = getCurrentPageSections.map((s: Record<string, unknown>) => ({
        id: String(s.id || `section-${Math.random()}`),
        type: String(s.type || 'unknown'),
        settings: (s.settings as Record<string, unknown>) || (s.props as Record<string, unknown>) || {},
        blocks: Array.isArray(s.blocks)
          ? (s.blocks as Record<string, unknown>[]).map((b) => ({
              id: String(b.id || `block-${Math.random()}`),
              type: String(b.type || 'unknown'),
              settings: (b.settings as Record<string, unknown>) || {},
            }))
          : [],
        disabled: s.disabled as boolean | undefined,
        enabled: s.enabled !== false,
      }));

      return (
        <ThemeStoreRenderer
          key={`renderer-${currentPage}-${selectedProductId || 'list'}`}
          themeId={themeId}
          sections={formattedSections}
          store={{
            id: data.storeId,
            name: data.storeName,
            currency: data.currency,
            logo: liveConfig.logo || data.logo,
          }}
          pageType={currentPage === 'home' ? 'index' : currentPage}
          products={data.products.map((p: SerializedProduct) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            imageUrl: p.imageUrl,
            images: Array.isArray(p.images)
              ? p.images
              : typeof p.images === 'string'
                ? JSON.parse(p.images)
                : p.imageUrl
                  ? [p.imageUrl]
                  : [],
            inventory: p.inventory || 0,
            category: p.category,
          }))}
          product={
            selectedProduct
              ? {
                  id: selectedProduct.id,
                  title: selectedProduct.title,
                  description: selectedProduct.description || '',
                  price: selectedProduct.price,
                  compareAtPrice: selectedProduct.compareAtPrice,
                  imageUrl: selectedProduct.imageUrl,
                  images: Array.isArray(selectedProduct.images)
                    ? selectedProduct.images
                    : typeof selectedProduct.images === 'string'
                      ? JSON.parse(selectedProduct.images)
                      : selectedProduct.imageUrl
                        ? [selectedProduct.imageUrl]
                        : [],
                  inventory: selectedProduct.inventory ?? 0,
                  category: selectedProduct.category,
                }
              : undefined
          }
          collections={data.categories.map((cat: string, idx: number) => ({
            id: idx + 1,
            title: cat,
            slug: cat.toLowerCase().replace(/\s+/g, '-'),
            description: '',
            imageUrl: undefined,
            productCount: data.products.filter((p: SerializedProduct) => p.category === cat).length,
          }))}
          isPreview={true}
          onNavigate={(path) => {
            // Handle internal navigation
            if (path.includes('/products/')) {
              const match = path.match(/\/products\/(\d+)/);
              if (match) handleProductClick(Number(match[1]));
            } else if (path.includes('/cart')) {
              handleCartClick();
            } else if (path === '/' || path === '') {
              setCurrentPage('home');
            }
          }}
          skipHeaderFooter={false}
        />
      );
    }

    // Fallback to old system if no theme sections
    if (currentPage === 'product' && selectedProduct) {
      return (
        <ProductDetailView
          key={`product-detail-${selectedProduct.id}`}
          product={selectedProduct as SerializedProduct}
          onBack={handleBack}
          onAddToCart={() => setCurrentPage('cart')}
          currency={data.currency}
          themeColors={themeColors}
        />
      );
    }

    if (currentPage === 'cart') {
      return (
        <CartView
          products={data.products as SerializedProduct[]}
          onBack={handleBack}
          onCheckout={handleCheckout}
          currency={data.currency}
          themeColors={themeColors}
        />
      );
    }

    if (currentPage === 'checkout') {
      return (
        <CheckoutView
          products={data.products as SerializedProduct[]}
          onBack={handleBack}
          currency={data.currency}
          themeColors={themeColors}
        />
      );
    }

    // Home - Main template with click interception for navigation (fallback)
    return (
      <div
        onClick={(e) => {
          const target = e.target as HTMLElement;

          // Check for product card click (using data-product-id or link to /products/)
          const productCard = target.closest('[data-product-id]');
          if (productCard) {
            e.preventDefault();
            e.stopPropagation();
            const id = productCard.getAttribute('data-product-id');
            if (id) handleProductClick(Number(id));
            return;
          }

          // Check for product link click
          const productLink = target.closest('a[href*="/products/"]');
          if (productLink) {
            e.preventDefault();
            e.stopPropagation();
            const href = productLink.getAttribute('href') || '';
            const match = href.match(/\/products\/(\d+)/);
            if (match) handleProductClick(Number(match[1]));
            return;
          }

          // Check for cart link click
          const cartLink = target.closest('a[href*="/cart"]');
          if (cartLink) {
            e.preventDefault();
            e.stopPropagation();
            handleCartClick();
            return;
          }

          // Check for any PreviewSafeLink (they render as spans in preview mode)
          // Also intercept regular links to prevent navigation outside iframe
          const anyLink = target.closest('a');
          if (anyLink) {
            const href = anyLink.getAttribute('href') || '';
            // Allow external links to open normally
            if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
              return;
            }
            // Prevent internal navigation
            e.preventDefault();
            e.stopPropagation();

            // Handle specific routes
            if (href.includes('/cart')) {
              handleCartClick();
            } else if (href === '/' || href === '') {
              setCurrentPage('home');
            }
          }
        }}
      >
        <StoreTemplateComponent
          storeName={data.storeName}
          storeId={data.storeId}
          logo={liveConfig.logo || data.logo}
          products={data.products}
          categories={data.categories}
          currentCategory={null}
          config={mergedConfig}
          currency={data.currency}
          socialLinks={liveConfig.socialLinks || data.socialLinks}
          businessInfo={liveConfig.businessInfo || data.businessInfo}
          isPreview={true}
        />
      </div>
    );
  };

  return (
    <>
      {/* Inject custom CSS */}
      {mergedConfig.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: mergedConfig.customCSS }} />
      )}

      {/* Inject Google Fonts - English + Bengali */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=NotoSansBengali:wght@400;500;600;700&family=NotoSerifBengali:wght@400;500;600;700&family=Baloo+Da+2:wght@400;500;600;700&family=Tiro+Bangla&family=Anek+Bangla:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Apply font family */}
      <div style={{ fontFamily: getFontFamily(liveConfig.fontFamily || data.fontFamily) }}>
        {renderContent()}
      </div>

      {/* Preview Navigation Bar */}
      <PreviewNavBar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
    </>
  );
}

// ============================================================================
// COMPONENT - Preview Frame (Wrapper)
// ============================================================================
export default function StorePreviewFrame() {
  const data = useLoaderData<typeof loader>();

  // Check for error response - Render error UI here directly without hooks
  if ('error' in data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">{data.error}</p>
        </div>
      </div>
    );
  }

  // If data is valid, render the content component which contains the hooks
  return <StorePreviewContent data={data} />;
}

// Helper to get font family CSS value
function getFontFamily(fontId: string): string {
  const fonts: Record<string, string> = {
    // English
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
    lato: "'Lato', sans-serif",
    'open-sans': "'Open Sans', sans-serif",
    nunito: "'Nunito', sans-serif",
    // Bengali
    'hind-siliguri': "'Hind Siliguri', sans-serif",
    'noto-sans-bengali': "'Noto Sans Bengali', sans-serif",
    'noto-serif-bengali': "'Noto Serif Bengali', serif",
    'baloo-da': "'Baloo Da 2', cursive",
    'tiro-bangla': "'Tiro Bangla', serif",
    'anek-bangla': "'Anek Bangla', sans-serif",
  };
  return fonts[fontId] || fonts.inter;
}
