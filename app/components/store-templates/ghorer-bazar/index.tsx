/**
 * GhorerBazar Store Template
 * 
 * Bangladeshi Grocery & Organic Food Store
 * Style: Clean, Trust-focused, COD-first, WhatsApp-friendly
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, createContext, useContext, useCallback } from 'react';
import { 
  ShoppingCart, Eye, Star, ChevronRight, X,
  Plus, Minus, MessageCircle, Phone, Truck, Check,
  Mail, MapPin, ChevronDown, Heart, Shield, Award, Leaf
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
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsOpen(true);
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      total, itemCount, isOpen, setIsOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// HELPER: Format Price
// ============================================================================
function formatPrice(price: number): string {
  return `৳${price.toLocaleString('bn-BD')}`;
}

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
          onChange={(e) => { setCode(e.target.value); setStatus('idle'); }}
          className="flex-1 px-3 py-2.5 rounded-lg border focus:outline-none"
          style={{ borderColor: status === 'error' ? '#ef4444' : status === 'success' ? '#22c55e' : theme.border }}
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
      {status === 'success' && <p className="text-xs mt-1 text-green-600">✓ কুপন প্রয়োগ হয়েছে!</p>}
      {status === 'error' && <p className="text-xs mt-1 text-red-500">✗ কুপন কোড সঠিক নয়। DEMO10 ট্রাই করুন।</p>}
    </div>
  );
}

// ============================================================================
// PRODUCT CARD - GhorerBazar Style (White bg, Quick Add, badges)
// ============================================================================
interface ProductCardProps {
  product: SerializedProduct;
  isPreview?: boolean;
}

function GhorerBazarProductCard({ product, isPreview }: ProductCardProps) {
  const cart = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const theme = GHORER_BAZAR_THEME;
  
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    cart.addItem(product);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const productUrl = isPreview ? '#' : `/products/${product.id}`;

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ 
        boxShadow: theme.shadowCard,
        fontFamily: GHORER_BAZAR_FONTS.body,
      }}
    >
      {/* Image Container */}
      <Link to={productUrl} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <img 
          src={product.imageUrl || 'https://placehold.co/400x400/f8f8f8/999999?text=No+Image'} 
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
              -{discount}% OFF
            </span>
          )}
          {product.id % 4 === 0 && (
            <span 
              className="px-2 py-0.5 text-[10px] font-bold text-white rounded"
              style={{ backgroundColor: theme.badgeStock }}
            >
              In Stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        {/* Category */}
        {product.category && (
          <span 
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: theme.textMuted }}
          >
            {product.category}
          </span>
        )}

        {/* Title */}
        <Link to={productUrl}>
          <h3 
            className="mt-1 font-medium line-clamp-2 hover:text-orange-600 transition text-sm leading-tight min-h-[36px]"
            style={{ color: theme.text }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mt-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-3 h-3 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
            />
          ))}
          <span className="text-[10px] ml-1" style={{ color: theme.textMuted }}>(৪.৫)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span 
            className="text-base font-bold"
            style={{ color: theme.text }}
          >
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span 
              className="text-xs line-through"
              style={{ color: theme.priceOld }}
            >
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding}
          className="w-full mt-3 py-2 rounded-lg font-medium text-sm text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
          style={{ backgroundColor: theme.primary }}
        >
          {isAdding ? (
            <>
              <Check className="w-4 h-4" />
              যোগ হয়েছে
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Quick Add
            </>
          )}
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
    <section 
      className="relative py-10 md:py-16"
      style={{ backgroundColor: theme.primaryLight }}
    >
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
              বিশ্বস্ততার সাথে সরাসরি আপনার ঘরে পৌঁছে দিচ্ছি খাঁটি ও ভেজালমুক্ত পণ্য। 
              ক্যাশ অন ডেলিভারি ও ফ্রি হোম ডেলিভারি সুবিধা।
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
                to="/?category=Offer Zone"
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
                src={config?.bannerUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop'}
                alt="Featured Product"
                className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
              />
              {/* Floating Badge */}
              <div 
                className="absolute -bottom-2 -right-2 px-4 py-2 rounded-lg shadow-lg"
                style={{ backgroundColor: 'white' }}
              >
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>থেকে শুরু</p>
                <p className="text-xl font-bold" style={{ color: theme.primary }}>৳২৯৯</p>
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
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => cart.setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2 className="font-bold text-lg" style={{ color: theme.text }}>
            {step === 'cart' ? `শপিং কার্ট (${cart.itemCount})` : step === 'checkout' ? 'অর্ডার করুন' : 'অর্ডার সফল!'}
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
              <p className="text-sm px-4 py-2 rounded-lg inline-block mb-4" style={{ backgroundColor: theme.primaryLight, color: theme.primary }}>
                শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।
              </p>
              <button 
                onClick={() => { cart.setIsOpen(false); setStep('cart'); }}
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
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: theme.textMuted }} />
                  <p style={{ color: theme.textMuted }}>কার্ট খালি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map(item => (
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
                        <h4 className="font-medium text-sm line-clamp-1" style={{ color: theme.text }}>
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
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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
                  ].map(zone => (
                    <label 
                      key={zone.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                        shippingZone === zone.id ? 'border-orange-400 bg-orange-50' : ''
                      }`}
                      style={{ borderColor: shippingZone === zone.id ? theme.primary : theme.border }}
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
                      <span className="text-sm font-medium">৳{zone.cost}</span>
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
                  <span>৳{shippingCost}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1.5 border-t" style={{ borderColor: theme.border, color: theme.text }}>
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
                  onClick={() => alert('অনলাইন পেমেন্ট শীঘ্রই আসছে! এখন ক্যাশ অন ডেলিভারি ব্যবহার করুন।')}
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
// PAGE: About Us - Brand Story, Village Sourcing, Trust
// ============================================================================
function AboutPage({ storeName, businessInfo }: { storeName: string; businessInfo?: any }) {
  const theme = GHORER_BAZAR_THEME;
  
  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Hero */}
      <div 
        className="py-16 px-4 text-center"
        style={{ backgroundColor: theme.primaryLight }}
      >
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
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>আমাদের শুরু</h2>
          </div>
          <p className="leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
            {storeName} শুরু হয়েছিল একটি সাধারণ স্বপ্ন নিয়ে - বাংলাদেশের প্রতিটি ঘরে খাঁটি ও ভেজালমুক্ত পণ্য পৌঁছে দেওয়া। 
            আজকের বাজারে যেখানে ভেজাল পণ্যের ছড়াছড়ি, সেখানে আমরা গ্রাম বাংলার কৃষক ও উৎপাদকদের কাছ থেকে সরাসরি খাঁটি পণ্য সংগ্রহ করি।
          </p>
          <p className="leading-relaxed" style={{ color: theme.textSecondary }}>
            আমাদের প্রতিটি পণ্যের পেছনে আছে একটি গল্প - সুন্দরবনের মৌয়ালদের কষ্টের মধু, রাজশাহীর কৃষকদের যত্নে বড় করা খেজুর, 
            এবং দেশের বিভিন্ন প্রান্ত থেকে সংগৃহীত অর্গানিক মশলা ও তেল।
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
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>গ্রাম থেকে সরাসরি</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>🍯 সুন্দরবনের মধু</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                সুন্দরবনের গভীর থেকে মৌয়ালরা জীবনের ঝুঁকি নিয়ে সংগ্রহ করেন এই খাঁটি মধু। কোনো মিশ্রণ নেই, ১০০% প্রাকৃতিক।
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>🌴 খেজুর ও গুড়</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                রাজশাহী ও যশোরের খেজুর বাগান থেকে সরাসরি আসে আমাদের খেজুর ও খেজুরের গুড়। কোনো কেমিক্যাল প্রিজার্ভেটিভ নেই।
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>🥜 বাদাম ও বীজ</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                দেশি-বিদেশি প্রিমিয়াম বাদাম, কাজু, পেস্তা এবং বিভিন্ন বীজ - সবই ফ্রেশ এবং সেরা মানের।
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: theme.text }}>🫒 খাঁটি তেল</h3>
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
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>আমাদের প্রতিশ্রুতি</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.primaryLight }}>
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>১০০% খাঁটি</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>কোনো ভেজাল বা মিশ্রণ নেই</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.primaryLight }}>
              <div className="text-3xl mb-2">🔬</div>
              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>ল্যাব টেস্টেড</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>মান নিয়ন্ত্রণ পরীক্ষিত</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: theme.primaryLight }}>
              <div className="text-3xl mb-2">💯</div>
              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>মানি ব্যাক</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>সন্তুষ্ট না হলে টাকা ফেরত</p>
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
            বাংলাদেশের প্রতিটি পরিবারে খাঁটি ও স্বাস্থ্যকর খাবার পৌঁছে দেওয়া এবং গ্রামীণ উৎপাদকদের ন্যায্য মূল্য নিশ্চিত করা।
            আমরা বিশ্বাস করি, ভালো খাবারই ভালো স্বাস্থ্যের মূল ভিত্তি।
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
      answer: 'হ্যাঁ, আমাদের সকল পণ্য ১০০% খাঁটি এবং ভেজালমুক্ত। আমরা সরাসরি গ্রামের কৃষক ও উৎপাদকদের কাছ থেকে পণ্য সংগ্রহ করি। প্রতিটি ব্যাচ ল্যাব টেস্টের মাধ্যমে যাচাই করা হয়।'
    },
    {
      question: 'ডেলিভারি কত দিনে হয়?',
      answer: 'ঢাকা সিটিতে ১-২ কার্যদিবসের মধ্যে ডেলিভারি হয়। চট্টগ্রাম সিটিতে ২-৩ দিন এবং দেশের অন্যান্য জেলায় ৩-৫ কার্যদিবস সময় লাগে।'
    },
    {
      question: 'ডেলিভারি চার্জ কত?',
      answer: 'ঢাকা সিটিতে ৬০ টাকা, চট্টগ্রাম সিটিতে ৮০ টাকা এবং দেশের অন্যান্য এলাকায় ১২০ টাকা ডেলিভারি চার্জ। ১০০০ টাকার উপরে অর্ডারে ঢাকায় ফ্রি ডেলিভারি!'
    },
    {
      question: 'পণ্য ফেরত দেওয়া যায়?',
      answer: 'অবশ্যই! পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে যদি কোনো সমস্যা থাকে, আমরা পুরো টাকা ফেরত দিব অথবা নতুন পণ্য পাঠাব। শুধু আমাদের হটলাইনে কল করুন।'
    },
    {
      question: 'অনলাইনে পেমেন্ট করা যায়?',
      answer: 'বর্তমানে আমরা ক্যাশ অন ডেলিভারি (COD) সার্ভিস দিচ্ছি। শীঘ্রই বিকাশ ও নগদ পেমেন্ট চালু হবে।'
    },
    {
      question: 'পাইকারি অর্ডার করা যায়?',
      answer: 'হ্যাঁ, পাইকারি অর্ডারের জন্য আমাদের WhatsApp এ যোগাযোগ করুন। বিশেষ ছাড় এবং আলাদা প্রাইসিং পাবেন।'
    },
    {
      question: 'মধু কীভাবে যাচাই করব খাঁটি কিনা?',
      answer: 'খাঁটি মধু পানিতে দ্রবীভূত হয় না, তলানিতে জমে যায়। আগুনে ধরলে জ্বলে। তুলায় মধু নিয়ে জ্বালালে পটপট শব্দ হয় না। আমাদের মধু এই সব পরীক্ষায় উত্তীর্ণ।'
    },
    {
      question: 'অর্ডার ট্র্যাক করব কীভাবে?',
      answer: 'অর্ডার কনফার্ম হলে আপনার ফোনে SMS এ ট্র্যাকিং লিংক পাঠানো হবে। এছাড়া আমাদের হটলাইনে কল করেও অর্ডার স্ট্যাটাস জানতে পারবেন।'
    },
  ];

  return (
    <div style={{ backgroundColor: theme.background }}>
      {/* Hero */}
      <div 
        className="py-16 px-4 text-center"
        style={{ backgroundColor: theme.primaryLight }}
      >
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
            <div 
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
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
                <div 
                  className="px-6 pb-4 pt-0"
                  style={{ color: theme.textSecondary }}
                >
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
      <div 
        className="py-16 px-4 text-center"
        style={{ backgroundColor: theme.primaryLight }}
      >
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
                <h3 className="font-semibold" style={{ color: theme.text }}>ফোন করুন</h3>
                <p style={{ color: theme.primary }}>{phoneNumber}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>সকাল ১০টা - রাত ১০টা</p>
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
                <h3 className="font-semibold" style={{ color: theme.text }}>WhatsApp</h3>
                <p className="text-green-600">{whatsappNumber}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>দ্রুত রেসপন্স পেতে</p>
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
                <h3 className="font-semibold" style={{ color: theme.text }}>ইমেইল</h3>
                <p style={{ color: theme.primary }}>{email}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>যেকোনো সময় লিখুন</p>
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
                <h3 className="font-semibold" style={{ color: theme.text }}>ঠিকানা</h3>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
  isPreview,
  viewAllLink = '/'
}: { 
  title: string; 
  products: SerializedProduct[]; 
  isPreview?: boolean;
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
              isPreview={isPreview}
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
  isPreview 
}: { 
  title: string; 
  products: SerializedProduct[]; 
  isPreview?: boolean;
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
                isPreview={isPreview}
              />
            </div>
          ))}
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
  currentCategory 
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
              !currentCategory 
                ? 'text-white' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
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
type PageType = 'home' | 'about' | 'faq' | 'contact';

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
  const theme = GHORER_BAZAR_THEME;
  
  // Navigate to a page
  const navigateTo = (page: PageType) => {
    const newParams = new URLSearchParams();
    if (page !== 'home') {
      newParams.set('page', page);
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products by category
  const filteredProducts = categoryFilter
    ? products.filter(p => p.category === categoryFilter)
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
          onCartClick={() => {}}
        />

        {/* Main Content */}
        <main>
          {/* Static Pages */}
          {currentPage === 'about' && (
            <AboutPage storeName={storeName} businessInfo={businessInfo} />
          )}
          {currentPage === 'faq' && (
            <FAQPage />
          )}
          {currentPage === 'contact' && (
            <ContactPage businessInfo={businessInfo} socialLinks={socialLinks} />
          )}
          
          {/* Home/Shop Content - Only show when on home page */}
          {currentPage === 'home' && (
            <>
              {/* Show Hero only when not filtering */}
              {!categoryFilter && (
                <HeroSection storeName={storeName} config={config} />
              )}

              {/* Category Badges for Mobile */}
              <CategoryBadges 
                categories={validCategories} 
                currentCategory={categoryFilter}
              />

          {/* Category Header when filtering */}
          {categoryFilter && (
            <div className="py-6 px-4 bg-white">
              <div className="max-w-7xl mx-auto">
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: theme.text, fontFamily: GHORER_BAZAR_FONTS.heading }}
                >
                  {categoryFilter}
                </h1>
                <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                  {filteredProducts.length}টি পণ্য পাওয়া গেছে
                </p>
              </div>
            </div>
          )}

          {/* Products */}
          {categoryFilter ? (
            <ProductsSection 
              title={`${categoryFilter} (${filteredProducts.length})`}
              products={filteredProducts}
              isPreview={isPreview}
            />
          ) : (
            <>
              {/* Featured / All Products */}
              <ProductsSection 
                title="ALL PRODUCT"
                products={featuredProducts}
                isPreview={isPreview}
              />
              
              {/* More Products */}
              {moreProducts.length > 0 && (
                <ProductsSection 
                  title="আরও পণ্য"
                  products={moreProducts}
                  isPreview={isPreview}
                />
              )}

              {/* Recommendations */}
              {recommendedProducts.length > 0 && (
                <RecommendationSection 
                  title="You Might Also Like"
                  products={recommendedProducts}
                  isPreview={isPreview}
                />
              )}

              {/* All remaining products */}
              {!categoryFilter && products.length > 21 && (
                <ProductsSection 
                  title="Recently Viewed Products"
                  products={products.slice(21, 29)}
                  isPreview={isPreview}
                />
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

        {/* Cart Modal */}
        <CartModal businessInfo={businessInfo} socialLinks={socialLinks} />
      </div>
    </CartProvider>
  );
}

// Default export
export default GhorerBazarTemplate;
