/**
 * GhorerBazar Store Template
 *
 * Bangladeshi Grocery & Organic Food Store
 * Style: Clean, Trust-focused, COD-first, WhatsApp-friendly
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, createContext, useContext, useCallback } from 'react';
import {
  ShoppingCart,
  Eye,
  Star,
  ChevronRight,
  X,
  Plus,
  Minus,
  MessageCircle,
  Phone,
  Truck,
  Check,
  Mail,
  MapPin,
  ChevronDown,
  Heart,
  Shield,
  Award,
  Leaf,
  Search,
} from 'lucide-react';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import { GhorerBazarHeader } from './sections/Header';
import { GhorerBazarFooter } from './sections/Footer';
import { GHORER_BAZAR_THEME, GHORER_BAZAR_FONTS } from './theme';

// Export components for registry
export { GhorerBazarHeader } from './sections/Header';
export { GhorerBazarFooter } from './sections/Footer';

// ============================================================================
// CART CONTEXT FOR MODAL
// ============================================================================
interface CartItem extends SerializedProduct {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: SerializedProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: SerializedProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsOpen(true);
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// COMPONENT: Coupon Input (Functional)
// ============================================================================
function CouponInput() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const theme = GHORER_BAZAR_THEME;

  const handleApply = () => {
    if (!code.trim()) return;
    setStatus('checking');
    // Simulate coupon check
    setTimeout(() => {
      if (code.toUpperCase() === 'DEMO10') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 800);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
        কুপন কোড (যদি থাকে)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="কুপন কোড"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setStatus('idle');
          }}
          className="flex-1 px-3 py-2.5 rounded-lg border focus:outline-none"
          style={{
            borderColor:
              status === 'error' ? '#ef4444' : status === 'success' ? '#22c55e' : theme.border,
          }}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={status === 'checking'}
          className="px-4 py-2.5 rounded-lg font-medium text-sm transition hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          {status === 'checking' ? '...' : 'Apply'}
        </button>
      </div>
      {status === 'success' && (
        <p className="text-xs mt-1 text-green-600">✓ কুপন প্রয়োগ হয়েছে!</p>
      )}
      {status === 'error' && (
        <p className="text-xs mt-1 text-red-500">✗ কুপন কোড সঠিক নয়। DEMO10 ট্রাই করুন।</p>
      )}
    </div>
  );
}

// ============================================================================
// PRODUCT CARD - GhorerBazar Style (White bg, Quick Add, badges)
// ============================================================================
interface ProductCardProps {
  product: SerializedProduct;
  onProductClick?: (product: SerializedProduct) => void;
  onQuickAdd?: (product: SerializedProduct) => void;
}

function GhorerBazarProductCard({ product, onProductClick, onQuickAdd }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const theme = GHORER_BAZAR_THEME;

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    onQuickAdd?.(product);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      style={{
        boxShadow: theme.shadowCard,
        fontFamily: GHORER_BAZAR_FONTS.body,
      }}
      onClick={() => onProductClick?.(product)}
    >
      {/* Image Container */}
      <div className="block relative aspect-square bg-white overflow-hidden">
        <img
          src={product.imageUrl || 'https://placehold.co/400x400/ffffff/999999?text=No+Image'}
          alt={product.title}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span
              className="px-2 py-0.5 text-[10px] font-bold text-white rounded"
              style={{ backgroundColor: theme.badgeSale }}
            >
              SALE
            </span>
          )}
          {product.id % 4 === 0 && (
            <span
              className="px-2 py-0.5 text-[10px] font-bold text-white rounded"
              style={{ backgroundColor: theme.badgeStock }}
            >
              IN STOCK
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Title */}
        <h3
          className="mt-1 font-medium line-clamp-2 text-sm leading-tight min-h-[36px]"
          style={{ color: theme.text }}
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold" style={{ color: theme.text }}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs line-through" style={{ color: theme.priceOld }}>
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="w-full mt-3 py-2.5 rounded-lg font-bold text-sm text-white transition hover:opacity-90"
          style={{ backgroundColor: theme.primary }}
        >
          {isAdding ? 'যোগ হচ্ছে...' : 'Quick Add'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HERO SECTION - Full-width banner with product image
// ============================================================================
function HeroSection({ storeName, config }: { storeName: string; config: any }) {
  const theme = GHORER_BAZAR_THEME;

  return (
    <section className="relative py-10 md:py-16" style={{ backgroundColor: theme.primaryLight }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 text-center md:text-left">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: theme.primary, color: 'white' }}
            >
              🎉 ১০০% খাঁটি ও প্রাকৃতিক
            </span>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
              style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
            >
              {config?.bannerText || 'সুন্দরবনের খাঁটি মধু ও অর্গানিক পণ্য'}
            </h1>
            <p
              className="text-base md:text-lg mb-6 max-w-lg mx-auto md:mx-0"
              style={{ color: theme.textSecondary }}
            >
              বিশ্বস্ততার সাথে সরাসরি আপনার ঘরে পৌঁছে দিচ্ছি খাঁটি ও ভেজালমুক্ত পণ্য। ক্যাশ অন
              ডেলিভারি ও ফ্রি হোম ডেলিভারি সুবিধা।
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/?category=Best Seller"
                className="px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: theme.primary }}
              >
                শপিং করুন
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="?category=Offer Zone"
                className="px-6 py-3 rounded-lg font-semibold border-2 transition hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: theme.secondary, color: theme.secondary }}
              >
                অফার দেখুন
              </Link>
            </div>
          </div>

          {/* Right: Product Image */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <img
                src={
                  config?.bannerUrl ||
                  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop'
                }
                alt="Featured Product"
                className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
              />
              {/* Floating Badge */}
              <div
                className="absolute -bottom-2 -right-2 px-4 py-2 rounded-lg shadow-lg"
                style={{ backgroundColor: 'white' }}
              >
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
                  থেকে শুরু
                </p>
                <p className="text-xl font-bold" style={{ color: theme.primary }}>
                  ৳২৯৯
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CART/CHECKOUT MODAL - Popup with COD order form
// ============================================================================
function CartModal({ businessInfo, socialLinks }: { businessInfo: any; socialLinks: any }) {
  const cart = useCart();
  const theme = GHORER_BAZAR_THEME;
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [shippingZone, setShippingZone] = useState('dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = shippingZone === 'dhaka' ? 60 : shippingZone === 'chittagong' ? 80 : 120;
  const grandTotal = cart.total + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      cart.clearCart();
    }, 1500);
  };

  if (!cart.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300]" style={{ fontFamily: GHORER_BAZAR_FONTS.body }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => cart.setIsOpen(false)} />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2 className="font-bold text-lg" style={{ color: theme.text }}>
            {step === 'cart'
              ? `শপিং কার্ট (${cart.itemCount})`
              : step === 'checkout'
                ? 'অর্ডার করুন'
                : 'অর্ডার সফল!'}
          </h2>
          <button
            onClick={() => cart.setIsOpen(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" style={{ color: theme.textMuted }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'success' ? (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Check className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
                ধন্যবাদ! 🎉
              </h3>
              <p className="mb-4" style={{ color: theme.textMuted }}>
                আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।
              </p>
              <p
                className="text-sm px-4 py-2 rounded-lg inline-block mb-4"
                style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
              >
                শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।
              </p>
              <button
                onClick={() => {
                  cart.setIsOpen(false);
                  setStep('cart');
                }}
                className="px-6 py-2.5 rounded-lg text-white font-medium"
                style={{ backgroundColor: theme.primary }}
              >
                ঠিক আছে
              </button>
            </div>
          ) : step === 'cart' ? (
            <>
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart
                    className="w-12 h-12 mx-auto mb-3 opacity-30"
                    style={{ color: theme.textMuted }}
                  />
                  <p style={{ color: theme.textMuted }}>কার্ট খালি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: theme.background }}
                    >
                      <img
                        src={item.imageUrl || ''}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded-lg bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-medium text-sm line-clamp-1"
                          style={{ color: theme.text }}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm font-bold mt-1" style={{ color: theme.primary }}>
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                            style={{ borderColor: theme.border }}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                            style={{ borderColor: theme.border }}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => cart.removeItem(item.id)}
                        className="p-1 h-fit hover:bg-red-50 rounded text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="সম্পূর্ণ নাম"
                  className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.border }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.border }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
                  সম্পূর্ণ ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="বাড়ি নং, রাস্তা, এলাকা, শহর"
                  className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.border }}
                />
              </div>

              {/* Shipping Zone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  ডেলিভারি এলাকা
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'dhaka', label: 'ঢাকা সিটি', cost: 60 },
                    { id: 'chittagong', label: 'চট্টগ্রাম সিটি', cost: 80 },
                    { id: 'outside', label: 'ঢাকা/চট্টগ্রামের বাইরে', cost: 120 },
                  ].map((zone) => (
                    <label
                      key={zone.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                        shippingZone === zone.id ? 'border-orange-400 bg-orange-50' : ''
                      }`}
                      style={{
                        borderColor: shippingZone === zone.id ? theme.primary : theme.border,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value={zone.id}
                          checked={shippingZone === zone.id}
                          onChange={() => setShippingZone(zone.id)}
                          className="accent-orange-500"
                        />
                        <span className="text-sm">{zone.label}</span>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(zone.cost)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <CouponInput />
            </form>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && cart.items.length > 0 && (
          <div className="border-t p-4 space-y-3" style={{ borderColor: theme.border }}>
            {/* Summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between" style={{ color: theme.textMuted }}>
                <span>সাবটোটাল</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              {step === 'checkout' && (
                <div className="flex justify-between" style={{ color: theme.textMuted }}>
                  <span>ডেলিভারি চার্জ</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-bold text-base pt-1.5 border-t"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <span>মোট</span>
                <span style={{ color: theme.primary }}>
                  {formatPrice(step === 'checkout' ? grandTotal : cart.total)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-lg font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: theme.primary }}
              >
                অর্ডার করুন
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="submit"
                  form="checkout-form"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'কনফার্ম অর্ডার (COD)'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    alert('অনলাইন পেমেন্ট শীঘ্রই আসছে! এখন ক্যাশ অন ডেলিভারি ব্যবহার করুন।')
                  }
                  className="w-full py-3 rounded-lg font-bold transition hover:opacity-90"
                  style={{ backgroundColor: theme.warning, color: theme.secondary }}
                >
                  💳 Pay Online (bKash/Nagad)
                </button>
              </div>
            )}

            {/* WhatsApp Order */}
            <a
              href={`https://wa.me/${(socialLinks?.whatsapp || businessInfo?.phone || '').replace(/\D/g, '')}?text=হ্যালো, আমি অর্ডার করতে চাই`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2 transition hover:opacity-90"
              style={{ backgroundColor: '#25d366' }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp এ অর্ডার করুন
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Product Details - Reference Bangladeshi Grocery Store Design
// ============================================================================
function ProductDetailPage({
  product,
  products,
  onAddToCart,
  onBuyNow,
  onProductClick,
  businessInfo,
  socialLinks,
}: {
  product: SerializedProduct;
  products: SerializedProduct[];
  onAddToCart: (product: SerializedProduct, qty: number) => void;
  onBuyNow: (product: SerializedProduct, qty: number) => void;
  onProductClick: (product: SerializedProduct) => void;
  businessInfo?: any;
  socialLinks?: any;
}) {
  const theme = GHORER_BAZAR_THEME;
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(true);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const whatsappNumber = socialLinks?.whatsapp || businessInfo?.phone || '01700000000';
  const formattedPrice = formatPrice(product.price);
  const whatsappMessage = `হ্যালো, আমি "${product.title}" অর্ডার করতে চাই। দাম: ${formattedPrice}`;

  // Related products (same category)
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 6);

  return (
    <div style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {/* LEFT: Product Image */}
          <div
            className="relative bg-white rounded-2xl overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <div className="aspect-square">
              <img
                src={product.imageUrl || 'https://placehold.co/600x600/fff/999?text=No+Image'}
                alt={product.title}
                className={`w-full h-full object-contain p-6 transition-transform duration-300 ${isZoomed ? 'scale-125' : 'scale-100'}`}
              />
            </div>
            {/* Badges */}
            {discount > 0 && (
              <span
                className="absolute top-4 left-4 px-3 py-1 text-sm font-bold text-white rounded-lg"
                style={{ backgroundColor: theme.badgeSale }}
              >
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-5">
            {/* Category */}
            {product.category && (
              <span
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: theme.primary }}
              >
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1
              className="text-2xl md:text-3xl font-bold leading-tight"
              style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: theme.text }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl line-through" style={{ color: theme.textMuted }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <span
                  className="px-2 py-0.5 text-sm font-medium rounded"
                  style={{ backgroundColor: theme.badgeSale, color: '#fff' }}
                >
                  {discount}% ছাড়
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                পরিমাণ
              </label>
              <div className="flex items-center gap-0 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center border rounded-l-lg hover:bg-gray-50 transition"
                  style={{ borderColor: theme.border }}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span
                  className="w-16 h-12 flex items-center justify-center border-t border-b text-lg font-medium"
                  style={{ borderColor: theme.border }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center border rounded-r-lg hover:bg-gray-50 transition"
                  style={{ borderColor: theme.border }}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Add to Cart - Black */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="w-full py-3.5 rounded-lg font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.secondary }}
              >
                <ShoppingCart className="w-5 h-5" />
                কার্টে যোগ করুন
              </button>

              {/* Cash on Delivery Order - Orange */}
              <button
                onClick={() => onBuyNow(product, quantity)}
                className="w-full py-3.5 rounded-lg font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.primary }}
              >
                <Truck className="w-5 h-5" />
                ক্যাশ অন ডেলিভারিতে অর্ডার করুন
              </button>

              {/* WhatsApp & Chat Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 rounded-lg font-medium text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25d366' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={`?page=contact`}
                  className="py-3 rounded-lg font-medium transition hover:opacity-90 flex items-center justify-center gap-2 border"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat করুন
                </a>
              </div>
            </div>

            {/* Description Accordion */}
            <div
              className="border rounded-xl overflow-hidden"
              style={{ borderColor: theme.border }}
            >
              {/* Description */}
              <div className="border-b" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white"
                >
                  <span className="font-medium" style={{ color: theme.text }}>
                    পণ্যের বিবরণ
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${descExpanded ? 'rotate-180' : ''}`}
                    style={{ color: theme.primary }}
                  />
                </button>
                {descExpanded && (
                  <div className="px-4 pb-4 bg-white space-y-3">
                    <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                      {product.description ||
                        'এই পণ্যটি ১০০% খাঁটি এবং প্রাকৃতিক। কোনো কেমিক্যাল বা প্রিজার্ভেটিভ নেই। সরাসরি গ্রাম থেকে সংগৃহীত।'}
                    </p>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                      <strong>উৎস:</strong> গ্রামবাংলার কৃষক ও উৎপাদক
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                      <strong>শুদ্ধতা:</strong> ১০০% খাঁটি, ভেজালমুক্ত
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                      <strong>ব্যবহার:</strong> খাবারের সাথে, পানীয়তে বা দৈনন্দিন রান্নায়
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div>
                <button
                  onClick={() => setBenefitsExpanded(!benefitsExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white"
                >
                  <span className="font-medium" style={{ color: theme.text }}>
                    উপকারিতা ও ব্যবহার
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${benefitsExpanded ? 'rotate-180' : ''}`}
                    style={{ color: theme.primary }}
                  />
                </button>
                {benefitsExpanded && (
                  <div className="px-4 pb-4 bg-white">
                    <ul className="text-sm space-y-2" style={{ color: theme.textSecondary }}>
                      <li className="flex items-start gap-2">
                        <span style={{ color: theme.primary }}>✓</span>
                        ১০০% প্রাকৃতিক ও ভেজালমুক্ত
                      </li>
                      <li className="flex items-start gap-2">
                        <span style={{ color: theme.primary }}>✓</span>
                        রোগ প্রতিরোধ ক্ষমতা বাড়ায়
                      </li>
                      <li className="flex items-start gap-2">
                        <span style={{ color: theme.primary }}>✓</span>
                        শক্তি ও পুষ্টি বৃদ্ধি করে
                      </li>
                      <li className="flex items-start gap-2">
                        <span style={{ color: theme.primary }}>✓</span>
                        ঘরে তৈরি খাবারে দারুণ স্বাদ
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Strip */}
        <div
          className="grid grid-cols-3 gap-4 mt-8 py-6 border-t border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">📦</div>
            <p className="text-sm font-medium" style={{ color: theme.text }}>
              নিরাপদ প্যাকেজিং
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🚚</div>
            <p className="text-sm font-medium" style={{ color: theme.text }}>
              দ্রুত ডেলিভারি
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🌿</div>
            <p className="text-sm font-medium" style={{ color: theme.text }}>
              ১০০% প্রাকৃতিক
            </p>
          </div>
        </div>

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
            >
              আপনার পছন্দ হতে পারে
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-44">
                  <GhorerBazarProductCard
                    product={p}
                    onProductClick={onProductClick}
                    onQuickAdd={(item) => onAddToCart(item, 1)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add to Cart */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden z-40"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {product.title}
            </p>
            <p className="font-bold" style={{ color: theme.primary }}>
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={() => onBuyNow(product, quantity)}
            className="px-6 py-3 rounded-lg font-bold text-white"
            style={{ backgroundColor: theme.primary }}
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: Cart & Checkout - Popup with COD Form
// ============================================================================
function CartCheckoutModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  businessInfo,
  socialLinks,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemoveItem: (id: number) => void;
  businessInfo?: any;
  socialLinks?: any;
}) {
  const theme = GHORER_BAZAR_THEME;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });
  const [deliveryZone, setDeliveryZone] = useState('dhaka');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const deliveryCharges: Record<string, number> = {
    dhaka: 70,
    chittagong: 70,
    outside: 130,
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryCharges[deliveryZone];
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryCharge - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'DEMO10') {
      setCouponApplied(true);
    } else {
      alert('কুপন কোড সঠিক নয়। DEMO10 ট্রাই করুন।');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(true);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500]" style={{ fontFamily: GHORER_BAZAR_FONTS.body }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ backgroundColor: theme.primary }}
        >
          <h2 className="text-lg font-bold text-white">
            {orderSuccess ? 'অর্ডার সফল!' : 'ক্যাশ অন ডেলিভারিতে অর্ডার করুন'}
          </h2>
          <button onClick={onClose} className="p-1 text-white hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {orderSuccess ? (
            <div className="text-center py-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Check className="w-10 h-10" style={{ color: theme.primary }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
                ধন্যবাদ! 🎉
              </h3>
              <p className="mb-4" style={{ color: theme.textSecondary }}>
                আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।
                <br />
                শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
              </p>
              <p
                className="text-sm mb-6 px-4 py-2 rounded-lg inline-block"
                style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
              >
                এটি ডেমো - কোনো অর্ডার তৈরি হয়নি
              </p>
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  onClose();
                }}
                className="px-8 py-3 rounded-lg font-bold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                ঠিক আছে
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart
                className="w-16 h-16 mx-auto mb-4 opacity-30"
                style={{ color: theme.textMuted }}
              />
              <p style={{ color: theme.textMuted }}>আপনার কার্ট খালি</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded-lg bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1" style={{ color: theme.text }}>
                        {item.title}
                      </p>
                      <p className="text-sm" style={{ color: theme.primary }}>
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded border flex items-center justify-center"
                          style={{ borderColor: theme.border }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded border flex items-center justify-center"
                          style={{ borderColor: theme.border }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-2 text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-sm" style={{ color: theme.text }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="আপনার নাম"
                    className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    ঠিকানা *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    placeholder="বাড়ি, রাস্তা, এলাকা, শহর"
                    className="w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.border }}
                  />
                </div>
              </div>

              {/* Delivery Zone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  ডেলিভারি এলাকা
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'dhaka', label: 'ঢাকা সিটি', cost: 70 },
                    { id: 'chittagong', label: 'চট্টগ্রাম সিটি', cost: 70 },
                    { id: 'outside', label: 'অন্যান্য এলাকা', cost: 130 },
                  ].map((zone) => (
                    <label
                      key={zone.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${deliveryZone === zone.id ? 'ring-2' : ''}`}
                      style={{
                        borderColor: deliveryZone === zone.id ? theme.primary : theme.border,
                        outline: theme.primary,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="delivery"
                          value={zone.id}
                          checked={deliveryZone === zone.id}
                          onChange={() => setDeliveryZone(zone.id)}
                          className="accent-orange-500"
                        />
                        <span className="text-sm">{zone.label}</span>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(zone.cost)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  কুপন কোড
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="কুপন কোড"
                    disabled={couponApplied}
                    className="flex-1 px-3 py-2.5 rounded-lg border focus:outline-none disabled:bg-gray-100"
                    style={{ borderColor: couponApplied ? '#22c55e' : theme.border }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponApplied}
                    className="px-4 py-2.5 rounded-lg font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {couponApplied ? '✓' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs mt-1 text-green-600">✓ ১০% ছাড় প্রয়োগ হয়েছে!</p>
                )}
              </div>

              {/* Order Note */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  অর্ডার নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                  placeholder="বিশেষ কোনো নির্দেশনা"
                  className="w-full px-3 py-2.5 rounded-lg border focus:outline-none"
                  style={{ borderColor: theme.border }}
                />
              </div>

              {/* Upsell Checkbox */}
              <label
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer"
                style={{ borderColor: theme.border }}
              >
                <input type="checkbox" className="mt-1 accent-orange-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>
                    অতিরিক্ত পণ্য যোগ করুন
                  </p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    সুন্দরবনের মধু ২৫০গ্রাম (+৳১৯৯)
                  </p>
                </div>
              </label>

              {/* Order Summary */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.background }}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: theme.textSecondary }}>
                    <span>সাবটোটাল</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: theme.textSecondary }}>
                    <span>ডেলিভারি চার্জ</span>
                    <span>{formatPrice(deliveryCharge)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>ডিসকাউন্ট (১০%)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-bold text-lg pt-2 border-t"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    <span>মোট</span>
                    <span style={{ color: theme.primary }}>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => alert('অনলাইন পেমেন্ট শীঘ্রই আসছে!')}
                  className="w-full py-3.5 rounded-lg font-bold transition hover:opacity-90"
                  style={{ backgroundColor: '#fbbf24', color: theme.secondary }}
                >
                  💳 Pay Online (bKash/Nagad)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: About Us - Brand Story, Village Sourcing, Trust
// ============================================================================
function AboutPage({ storeName, businessInfo }: { storeName: string; businessInfo?: any }) {
  const theme = GHORER_BAZAR_THEME;

  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Hero */}
      <div className="py-16 px-4 text-center" style={{ backgroundColor: theme.primaryLight }}>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
        >
          আমাদের গল্প
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
          গ্রাম বাংলার খাঁটি পণ্য, আপনার ঘরে
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Brand Story */}
        <section className="p-6 md:p-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Heart className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>
              আমাদের শুরু
            </h2>
          </div>
          <p className="leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
            {storeName} শুরু হয়েছিল একটি সাধারণ স্বপ্ন নিয়ে - বাংলাদেশের প্রতিটি ঘরে খাঁটি ও
            ভেজালমুক্ত পণ্য পৌঁছে দেওয়া। আজকের বাজারে যেখানে ভেজাল পণ্যের ছড়াছড়ি, সেখানে আমরা
            গ্রাম বাংলার কৃষক ও উৎপাদকদের কাছ থেকে সরাসরি খাঁটি পণ্য সংগ্রহ করি।
          </p>
          <p className="leading-relaxed" style={{ color: theme.textSecondary }}>
            আমাদের প্রতিটি পণ্যের পেছনে আছে একটি গল্প - সুন্দরবনের মৌয়ালদের কষ্টের মধু, রাজশাহীর
            কৃষকদের যত্নে বড় করা খেজুর, এবং দেশের বিভিন্ন প্রান্ত থেকে সংগৃহীত অর্গানিক মশলা ও তেল।
          </p>
        </section>

        {/* Village Sourcing */}
        <section className="p-6 md:p-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Leaf className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>
              গ্রাম থেকে সরাসরি
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                🍯 সুন্দরবনের মধু
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                সুন্দরবনের গভীর থেকে মৌয়ালরা জীবনের ঝুঁকি নিয়ে সংগ্রহ করেন এই খাঁটি মধু। কোনো
                মিশ্রণ নেই, ১০০% প্রাকৃতিক।
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                🌴 খেজুর ও গুড়
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                রাজশাহী ও যশোরের খেজুর বাগান থেকে সরাসরি আসে আমাদের খেজুর ও খেজুরের গুড়। কোনো
                কেমিক্যাল প্রিজার্ভেটিভ নেই।
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                🥜 বাদাম ও বীজ
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                দেশি-বিদেশি প্রিমিয়াম বাদাম, কাজু, পেস্তা এবং বিভিন্ন বীজ - সবই ফ্রেশ এবং সেরা
                মানের।
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                🫒 খাঁটি তেল
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                ঘানিতে ভাঙা সরিষার তেল, নারিকেল তেল এবং অলিভ অয়েল - সবই ভেজালমুক্ত এবং স্বাস্থ্যকর।
              </p>
            </div>
          </div>
        </section>

        {/* Trust & Purity */}
        <section className="p-6 md:p-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Shield className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>
              আমাদের প্রতিশ্রুতি
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                ১০০% খাঁটি
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                কোনো ভেজাল বা মিশ্রণ নেই
              </p>
            </div>
            <div
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <div className="text-3xl mb-2">🔬</div>
              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                ল্যাব টেস্টেড
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                মান নিয়ন্ত্রণ পরীক্ষিত
              </p>
            </div>
            <div
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <div className="text-3xl mb-2">💯</div>
              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                মানি ব্যাক
              </h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                সন্তুষ্ট না হলে টাকা ফেরত
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section
          className="p-6 md:p-8 rounded-2xl text-center text-white"
          style={{ backgroundColor: theme.primary }}
        >
          <Award className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-3">আমাদের লক্ষ্য</h2>
          <p className="max-w-2xl mx-auto opacity-90">
            বাংলাদেশের প্রতিটি পরিবারে খাঁটি ও স্বাস্থ্যকর খাবার পৌঁছে দেওয়া এবং গ্রামীণ উৎপাদকদের
            ন্যায্য মূল্য নিশ্চিত করা। আমরা বিশ্বাস করি, ভালো খাবারই ভালো স্বাস্থ্যের মূল ভিত্তি।
          </p>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: FAQ - Accordion Style with Bangla Q&A
// ============================================================================
function FAQPage() {
  const theme = GHORER_BAZAR_THEME;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'আপনাদের পণ্য কি সত্যিই খাঁটি?',
      answer:
        'হ্যাঁ, আমাদের সকল পণ্য ১০০% খাঁটি এবং ভেজালমুক্ত। আমরা সরাসরি গ্রামের কৃষক ও উৎপাদকদের কাছ থেকে পণ্য সংগ্রহ করি। প্রতিটি ব্যাচ ল্যাব টেস্টের মাধ্যমে যাচাই করা হয়।',
    },
    {
      question: 'ডেলিভারি কত দিনে হয়?',
      answer:
        'ঢাকা সিটিতে ১-২ কার্যদিবসের মধ্যে ডেলিভারি হয়। চট্টগ্রাম সিটিতে ২-৩ দিন এবং দেশের অন্যান্য জেলায় ৩-৫ কার্যদিবস সময় লাগে।',
    },
    {
      question: 'ডেলিভারি চার্জ কত?',
      answer:
        'ঢাকা সিটিতে ৬০ টাকা, চট্টগ্রাম সিটিতে ৮০ টাকা এবং দেশের অন্যান্য এলাকায় ১২০ টাকা ডেলিভারি চার্জ। ১০০০ টাকার উপরে অর্ডারে ঢাকায় ফ্রি ডেলিভারি!',
    },
    {
      question: 'পণ্য ফেরত দেওয়া যায়?',
      answer:
        'অবশ্যই! পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে যদি কোনো সমস্যা থাকে, আমরা পুরো টাকা ফেরত দিব অথবা নতুন পণ্য পাঠাব। শুধু আমাদের হটলাইনে কল করুন।',
    },
    {
      question: 'অনলাইনে পেমেন্ট করা যায়?',
      answer:
        'বর্তমানে আমরা ক্যাশ অন ডেলিভারি (COD) সার্ভিস দিচ্ছি। শীঘ্রই বিকাশ ও নগদ পেমেন্ট চালু হবে।',
    },
    {
      question: 'পাইকারি অর্ডার করা যায়?',
      answer:
        'হ্যাঁ, পাইকারি অর্ডারের জন্য আমাদের WhatsApp এ যোগাযোগ করুন। বিশেষ ছাড় এবং আলাদা প্রাইসিং পাবেন।',
    },
    {
      question: 'মধু কীভাবে যাচাই করব খাঁটি কিনা?',
      answer:
        'খাঁটি মধু পানিতে দ্রবীভূত হয় না, তলানিতে জমে যায়। আগুনে ধরলে জ্বলে। তুলায় মধু নিয়ে জ্বালালে পটপট শব্দ হয় না। আমাদের মধু এই সব পরীক্ষায় উত্তীর্ণ।',
    },
    {
      question: 'অর্ডার ট্র্যাক করব কীভাবে?',
      answer:
        'অর্ডার কনফার্ম হলে আপনার ফোনে SMS এ ট্র্যাকিং লিংক পাঠানো হবে। এছাড়া আমাদের হটলাইনে কল করেও অর্ডার স্ট্যাটাস জানতে পারবেন।',
    },
  ];

  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Hero */}
      <div className="py-16 px-4 text-center" style={{ backgroundColor: theme.primaryLight }}>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
        >
          সাধারণ জিজ্ঞাসা
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
          আপনার প্রশ্নের উত্তর খুঁজে নিন
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-medium" style={{ color: theme.text }}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: theme.primary }}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 pt-0" style={{ color: theme.textSecondary }}>
                  <div className="border-t pt-4" style={{ borderColor: theme.border }}>
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div
          className="mt-12 p-6 rounded-2xl text-center"
          style={{ backgroundColor: theme.primary }}
        >
          <h3 className="text-xl font-bold text-white mb-2">আরও প্রশ্ন আছে?</h3>
          <p className="text-white/80 mb-4">আমাদের সাথে সরাসরি যোগাযোগ করুন</p>
          <a
            href="https://wa.me/8801700000000?text=হ্যালো, আমার একটি প্রশ্ন আছে"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg font-medium transition hover:opacity-90"
            style={{ color: theme.primary }}
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp এ জিজ্ঞাসা করুন
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Search Results
// ============================================================================
function SearchResultsPage({
  query,
  results,
  onProductClick,
  onAddToCart,
}: {
  query: string;
  results: SerializedProduct[];
  onProductClick: (product: SerializedProduct) => void;
  onAddToCart: (product: SerializedProduct, qty: number) => void;
}) {
  const theme = GHORER_BAZAR_THEME;
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `?search=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Search Header */}
      <div className="py-8 px-4" style={{ backgroundColor: theme.primaryLight }}>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="w-full px-5 py-4 pr-14 rounded-xl border-2 focus:outline-none text-lg"
              style={{ borderColor: theme.primary }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
          "{query}" এর জন্য সার্চ রেজাল্ট
        </h1>
        <p className="mb-6" style={{ color: theme.textMuted }}>
          {results.length}টি পণ্য পাওয়া গেছে
        </p>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {results.map((product) => (
              <GhorerBazarProductCard
                key={product.id}
                product={product}
                onProductClick={onProductClick}
                onQuickAdd={(item) => onAddToCart(item, 1)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              কোনো পণ্য পাওয়া যায়নি
            </h2>
            <p className="mb-6" style={{ color: theme.textMuted }}>
              অন্য কিছু দিয়ে সার্চ করুন
            </p>
            <a
              href="?page=home"
              className="inline-block px-6 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: theme.primary }}
            >
              সব পণ্য দেখুন
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Account - Login/Register with Phone OTP
// ============================================================================
function AccountPage() {
  const theme = GHORER_BAZAR_THEME;
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      alert('সঠিক মোবাইল নম্বর দিন');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert('সঠিক OTP দিন');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 1000);
  };

  return (
    <div
      style={{ backgroundColor: theme.background }}
      className="min-h-[70vh] flex items-center justify-center py-12 px-4"
    >
      <div className="w-full max-w-md">
        {step === 'success' ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Check className="w-10 h-10" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              সফলভাবে {activeTab === 'login' ? 'লগইন' : 'রেজিস্ট্রেশন'} হয়েছে!
            </h2>
            <p className="mb-6" style={{ color: theme.textMuted }}>
              এটি ডেমো - কোনো অ্যাকাউন্ট তৈরি হয়নি
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 rounded-lg font-bold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              শপিং করুন
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: theme.border }}>
              <button
                onClick={() => {
                  setActiveTab('login');
                  setStep('phone');
                }}
                className={`flex-1 py-4 font-medium text-center transition ${activeTab === 'login' ? 'border-b-2' : ''}`}
                style={{
                  borderColor: activeTab === 'login' ? theme.primary : 'transparent',
                  color: activeTab === 'login' ? theme.primary : theme.textMuted,
                }}
              >
                লগইন
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setStep('phone');
                }}
                className={`flex-1 py-4 font-medium text-center transition ${activeTab === 'register' ? 'border-b-2' : ''}`}
                style={{
                  borderColor: activeTab === 'register' ? theme.primary : 'transparent',
                  color: activeTab === 'register' ? theme.primary : theme.textMuted,
                }}
              >
                রেজিস্টার
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.text }}>
                {activeTab === 'login'
                  ? 'আপনার অ্যাকাউন্টে লগইন করুন'
                  : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              </h2>

              {step === 'phone' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      মোবাইল নম্বর
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="w-full px-4 py-3 rounded-lg border text-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: theme.border }}
                    />
                    <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      আমরা এই নম্বরে OTP পাঠাব
                    </p>
                  </div>

                  {activeTab === 'register' && (
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text }}
                      >
                        আপনার নাম
                      </label>
                      <input
                        type="text"
                        placeholder="সম্পূর্ণ নাম"
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: theme.border }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {isLoading ? 'অপেক্ষা করুন...' : 'OTP পাঠান'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      OTP কোড
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXX"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-lg border text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2"
                      style={{ borderColor: theme.border }}
                    />
                    <p className="text-xs mt-2 text-center" style={{ color: theme.textMuted }}>
                      {phone} নম্বরে পাঠানো OTP দিন
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {isLoading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full py-2 text-sm font-medium"
                    style={{ color: theme.primary }}
                  >
                    নম্বর পরিবর্তন করুন
                  </button>
                </form>
              )}

              {/* Demo Note */}
              <p
                className="text-xs text-center mt-6 px-4 py-2 rounded-lg"
                style={{ backgroundColor: theme.primaryLight, color: theme.textMuted }}
              >
                ডেমো: যেকোনো নম্বর ও OTP দিয়ে টেস্ট করুন
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE: Contact - Phone, WhatsApp, Contact Form
// ============================================================================
function ContactPage({ businessInfo, socialLinks }: { businessInfo?: any; socialLinks?: any }) {
  const theme = GHORER_BAZAR_THEME;
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const phoneNumber = businessInfo?.phone || '০১৭০০-০০০০০০';
  const whatsappNumber = socialLinks?.whatsapp || phoneNumber;
  const email = businessInfo?.email || 'info@ghorerbazar.com';
  const address = businessInfo?.address || 'গুলশান-২, ঢাকা-১২১২, বাংলাদেশ';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', phone: '', message: '' });
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Hero */}
      <div className="py-16 px-4 text-center" style={{ backgroundColor: theme.primaryLight }}>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
        >
          যোগাযোগ করুন
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
          আমরা সবসময় আপনার পাশে আছি
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Phone */}
            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Phone className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  ফোন করুন
                </h3>
                <p style={{ color: theme.primary }}>{phoneNumber}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  সকাল ১০টা - রাত ১০টা
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=হ্যালো, আমি অর্ডার করতে চাই`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  WhatsApp
                </h3>
                <p className="text-green-600">{whatsappNumber}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  দ্রুত রেসপন্স পেতে
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Mail className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  ইমেইল
                </h3>
                <p style={{ color: theme.primary }}>{email}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  যেকোনো সময় লিখুন
                </p>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <MapPin className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  ঠিকানা
                </h3>
                <p style={{ color: theme.textSecondary }}>{address}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-6" style={{ color: theme.text }}>
              মেসেজ পাঠান
            </h2>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <Check className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
                  ধন্যবাদ!
                </h3>
                <p className="mb-4" style={{ color: theme.textSecondary }}>
                  আপনার মেসেজ পাঠানো হয়েছে। শীঘ্রই যোগাযোগ করব।
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  নতুন মেসেজ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="সম্পূর্ণ নাম"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
                    আপনার মেসেজ *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="কীভাবে সাহায্য করতে পারি?"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme.border }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  {isSubmitting ? 'পাঠানো হচ্ছে...' : 'মেসেজ পাঠান'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCTS SECTION - "ALL PRODUCT" with 4-column grid
// ============================================================================
function ProductsSection({
  title,
  products,
  onProductClick,
  onQuickAdd,
  viewAllLink = '/',
}: {
  title: string;
  products: SerializedProduct[];
  onProductClick?: (product: SerializedProduct) => void;
  onQuickAdd?: (product: SerializedProduct) => void;
  viewAllLink?: string;
}) {
  const theme = GHORER_BAZAR_THEME;

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-10 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl md:text-2xl font-bold"
            style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
          >
            {title}
          </h2>
          <Link
            to={viewAllLink}
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ color: theme.primary }}
          >
            সব দেখুন <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <GhorerBazarProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// RECOMMENDATION SECTION - "You Might Also Like" / "Recently Viewed"
// ============================================================================
function RecommendationSection({
  title,
  products,
  onProductClick,
  onQuickAdd,
}: {
  title: string;
  products: SerializedProduct[];
  onProductClick?: (product: SerializedProduct) => void;
  onQuickAdd?: (product: SerializedProduct) => void;
}) {
  const theme = GHORER_BAZAR_THEME;

  if (products.length === 0) return null;

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-lg md:text-xl font-bold mb-4"
          style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
        >
          {title}
        </h2>

        {/* Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
              <GhorerBazarProductCard
                product={product}
                onProductClick={onProductClick}
                onQuickAdd={onQuickAdd}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORY SHORTCUT SECTION - Icon Cards
// ============================================================================
function CategoryShortcutSection({
  categories,
  onCategorySelect,
}: {
  categories: string[];
  onCategorySelect: (category: string) => void;
}) {
  const theme = GHORER_BAZAR_THEME;
  const icons = ['🛢️', '🥜', '🍯', '🧈', '🍵', '🥭', '🌿', '🥗', '🫘', '🍬', '🫙', '🥘'];

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.slice(0, 12).map((category, index) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:shadow-sm transition"
              style={{ borderColor: theme.border }}
            >
              <div className="text-2xl">{icons[index % icons.length]}</div>
              <span className="text-xs font-medium text-center" style={{ color: theme.text }}>
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORY LISTING - Breadcrumb + Sorting
// ============================================================================
function CategoryListingSection({
  category,
  products,
  onProductClick,
  onQuickAdd,
}: {
  category: string;
  products: SerializedProduct[];
  onProductClick: (product: SerializedProduct) => void;
  onQuickAdd: (product: SerializedProduct) => void;
}) {
  const theme = GHORER_BAZAR_THEME;
  const [sortBy, setSortBy] = useState('latest');

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return b.id - a.id;
    }
  });

  return (
    <section className="py-6 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm mb-4" style={{ color: theme.textMuted }}>
          Home / {category}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            {category}
          </h1>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: theme.border }}
          >
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {sortedProducts.map((product) => (
            <GhorerBazarProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRUST BADGES SECTION
// ============================================================================
function TrustBadgesSection() {
  const theme = GHORER_BAZAR_THEME;
  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="flex items-center gap-4 p-4 rounded-xl border"
          style={{ borderColor: theme.border }}
        >
          <div className="text-3xl">📦</div>
          <div>
            <h3 className="font-semibold" style={{ color: theme.text }}>
              Safe Packaging
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              নিরাপদ প্যাকেজিং
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-4 p-4 rounded-xl border"
          style={{ borderColor: theme.border }}
        >
          <div className="text-3xl">🚚</div>
          <div>
            <h3 className="font-semibold" style={{ color: theme.text }}>
              Fast Delivery
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              দ্রুত ডেলিভারি
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-4 p-4 rounded-xl border"
          style={{ borderColor: theme.border }}
        >
          <div className="text-3xl">🌿</div>
          <div>
            <h3 className="font-semibold" style={{ color: theme.text }}>
              100% Natural
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              ১০০% প্রাকৃতিক
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORY BADGES - Horizontal scrollable category pills
// ============================================================================
function CategoryBadges({
  categories,
  currentCategory,
}: {
  categories: string[];
  currentCategory?: string | null;
}) {
  const theme = GHORER_BAZAR_THEME;

  return (
    <div className="py-4 px-4 bg-white border-b" style={{ borderColor: theme.border }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            to="/"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              !currentCategory ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
            style={!currentCategory ? { backgroundColor: theme.primary } : {}}
          >
            সব পণ্য
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              to={`?category=${encodeURIComponent(category)}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                currentCategory === category
                  ? 'text-white'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
              style={currentCategory === category ? { backgroundColor: theme.primary } : {}}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================
// PAGE TYPES
// ============================================================================
type PageType = 'home' | 'about' | 'faq' | 'contact' | 'product' | 'cart' | 'account';

// ============================================================================
export function GhorerBazarTemplate({
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
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || currentCategory;
  const currentPage = (searchParams.get('page') as PageType) || 'home';
  const productId = searchParams.get('product');
  const searchQuery = searchParams.get('search') || '';
  const theme = GHORER_BAZAR_THEME;

  // Cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Get current product for detail page
  const currentProduct = productId ? products.find((p) => p.id === Number(productId)) : null;

  // Search results
  const searchResults = searchQuery
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Cart functions
  const addToCart = (product: SerializedProduct, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const updateCartQuantity = (id: number, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
      );
    }
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Navigate to a page
  const navigateTo = (page: PageType, params?: Record<string, string>) => {
    const newParams = new URLSearchParams();
    if (page !== 'home') {
      newParams.set('page', page);
    }
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        newParams.set(key, value);
      });
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to product
  const goToProduct = (product: SerializedProduct) => {
    const newParams = new URLSearchParams();
    newParams.set('product', String(product.id));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Buy now (add to cart and open checkout)
  const buyNow = (product: SerializedProduct, qty: number) => {
    addToCart(product, qty);
    setCartOpen(true);
  };

  // Filter products by category
  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  const validCategories = categories.filter(Boolean) as string[];

  // Group products for different sections
  const featuredProducts = products.slice(0, 8);
  const moreProducts = products.slice(8, 16);
  const recommendedProducts = products.slice(16, 21);

  return (
    <CartProvider>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: theme.background,
          fontFamily: GHORER_BAZAR_FONTS.body,
        }}
      >
        {/* Header */}
        <GhorerBazarHeader
          storeName={storeName}
          logo={logo}
          isPreview={isPreview}
          config={config}
          categories={validCategories}
          currentCategory={categoryFilter}
          socialLinks={socialLinks}
          businessInfo={businessInfo}
          onCartClick={() => setCartOpen(true)}
        />

        {/* Main Content */}
        <main>
          {/* Product Detail Page */}
          {currentProduct && (
            <ProductDetailPage
              product={currentProduct}
              products={products}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              onProductClick={goToProduct}
              businessInfo={businessInfo}
              socialLinks={socialLinks}
            />
          )}

          {/* Search Results Page */}
          {searchQuery && !currentProduct && (
            <SearchResultsPage
              query={searchQuery}
              results={searchResults}
              onProductClick={goToProduct}
              onAddToCart={addToCart}
            />
          )}

          {/* Account Page */}
          {currentPage === 'account' && <AccountPage />}

          {/* Static Pages */}
          {!currentProduct && !searchQuery && currentPage === 'about' && (
            <AboutPage storeName={storeName} businessInfo={businessInfo} />
          )}
          {!currentProduct && !searchQuery && currentPage === 'faq' && <FAQPage />}
          {!currentProduct && !searchQuery && currentPage === 'contact' && (
            <ContactPage businessInfo={businessInfo} socialLinks={socialLinks} />
          )}

          {/* Home/Shop Content - Only show when on home page and no product/search */}
          {currentPage === 'home' && !currentProduct && !searchQuery && (
            <>
              {/* Hero + Category Shortcuts */}
              {!categoryFilter && (
                <>
                  <HeroSection storeName={storeName} config={config} />
                  <CategoryShortcutSection
                    categories={validCategories}
                    onCategorySelect={(cat) =>
                      setSearchParams(new URLSearchParams({ category: cat }))
                    }
                  />
                </>
              )}

              {/* Category Badges for Mobile */}
              <CategoryBadges categories={validCategories} currentCategory={categoryFilter} />

              {/* Category Listing */}
              {categoryFilter ? (
                <CategoryListingSection
                  category={categoryFilter}
                  products={filteredProducts}
                  onProductClick={goToProduct}
                  onQuickAdd={(item) => addToCart(item, 1)}
                />
              ) : (
                <>
                  {/* ALL PRODUCT */}
                  <ProductsSection
                    title="ALL PRODUCT"
                    products={featuredProducts}
                    onProductClick={goToProduct}
                    onQuickAdd={(item) => addToCart(item, 1)}
                  />

                  {/* More Products */}
                  {moreProducts.length > 0 && (
                    <ProductsSection
                      title="আরও পণ্য"
                      products={moreProducts}
                      onProductClick={goToProduct}
                      onQuickAdd={(item) => addToCart(item, 1)}
                    />
                  )}

                  {/* Recommendations */}
                  {recommendedProducts.length > 0 && (
                    <RecommendationSection
                      title="You Might Also Like"
                      products={recommendedProducts}
                      onProductClick={goToProduct}
                      onQuickAdd={(item) => addToCart(item, 1)}
                    />
                  )}

                  {/* Trust Badges */}
                  <TrustBadgesSection />

                  {/* Recently Viewed */}
                  {products.length > 21 && (
                    <ProductsSection
                      title="Recently Viewed Products"
                      products={products.slice(21, 29)}
                      onProductClick={goToProduct}
                      onQuickAdd={(item) => addToCart(item, 1)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <GhorerBazarFooter
          storeName={storeName}
          logo={logo}
          socialLinks={socialLinks}
          footerConfig={footerConfig}
          businessInfo={businessInfo}
          categories={validCategories}
          planType={planType}
        />

        {/* Cart Checkout Modal */}
        <CartCheckoutModal
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          businessInfo={businessInfo}
          socialLinks={socialLinks}
        />
      </div>
    </CartProvider>
  );
}

// Default export
export default GhorerBazarTemplate;
