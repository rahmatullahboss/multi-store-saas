/**
 * Starter Store Cart Page
 *
 * A modern, conversion-optimized cart page with mobile-first design.
 * Supports both Smart Mode (self-hydrate) and Controlled Mode (props).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Lock,
  Truck,
  Tag,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { STARTER_STORE_FONTS, resolveStarterStoreTheme } from '../theme';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import type { ThemeConfig, LandingConfig } from '@db/types';

interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  compareAtPrice?: number | null;
  id?: string | number;
  variantId?: number;
  variantTitle?: string;
}

interface StarterStoreCartPageProps {
  items?: CartItem[];
  currency?: string;
  total?: number;
  itemCount?: number;
  onUpdateQuantity?: (productId: number, variantId: number | undefined, quantity: number) => void;
  onRemoveItem?: (productId: number, variantId?: number) => void;
  onCheckout?: () => void;
  isLoading?: boolean;
  storeName?: string;
  isPreview?: boolean;
  theme?: StoreTemplateTheme;
  config?: ThemeConfig | null;
  mvpSettings?: LandingConfig | null;
}

// Color constants
const COLORS = {
  primary: '#4F46E5',
  accent: '#F59E0B',
};

export function StarterStoreCartPage({
  items: propItems,
  currency: _currency = 'BDT',
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoading = false,
  isPreview = false,
  theme,
  config,
  mvpSettings,
}: StarterStoreCartPageProps) {
  const resolvedTheme = resolveStarterStoreTheme(config, theme);
  const [cartItems, setCartItems] = useState<CartItem[]>(propItems || []);
  const [hydrated, setHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const primaryColor = resolvedTheme.primary || COLORS.primary;
  // accentColor available for future use
  const _accentColor = resolvedTheme.accent || COLORS.accent;

  // Hydrate from props or localStorage
  useEffect(() => {
    if (propItems) {
      setCartItems(propItems);
      setHydrated(true);
      return;
    }

    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored) as CartItem[];
        if (isPreview) {
          const hydratedItems = items
            .map((item) => {
              const demoProduct = DEMO_PRODUCTS.find((p) => p.id === item.productId);
              return demoProduct
                ? {
                    ...item,
                    title: demoProduct.title,
                    price: demoProduct.price,
                    imageUrl: demoProduct.imageUrl,
                    quantity: Number(item.quantity) || 1,
                  }
                : null;
            })
            .filter(Boolean) as CartItem[];
          setCartItems(hydratedItems);
        } else {
          setCartItems(items);
        }
      } catch {
        setCartItems([]);
      }
    }
    setHydrated(true);
  }, [isPreview, propItems]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Parse shipping config
  const shippingConfig = mvpSettings?.shippingConfig;
  const shippingEnabled = shippingConfig?.enabled ?? true;
  const deliveryCharge = shippingEnabled ? (shippingConfig?.insideDhaka ?? 60) : 0;
  const freeShippingAbove = shippingConfig?.freeShippingAbove ?? 1000;

  // Calculate shipping
  const isFreeShipping = freeShippingAbove > 0 && subtotal >= freeShippingAbove;
  const shipping = isFreeShipping ? 0 : deliveryCharge;

  // Promo discount (mock: 10% if code is "SAVE10")
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;

  const total = subtotal + shipping - promoDiscount;

  // Progress to free shipping
  const progressToFreeShipping = freeShippingAbove > 0 
    ? Math.min(100, (subtotal / freeShippingAbove) * 100)
    : 100;
  const amountToFreeShipping = Math.max(0, freeShippingAbove - subtotal);

  const updateQty = (productId: number, variantId: number | undefined, delta: number) => {
    const next = cartItems.map((item) => {
      const id = Number(item.productId || item.id);
      const outputVariantId = item.variantId ? Number(item.variantId) : undefined;

      if (id === productId && outputVariantId === variantId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });

    if (onUpdateQuantity) {
      const target = next.find((i) => {
        const id = Number(i.productId || i.id);
        const vid = i.variantId ? Number(i.variantId) : undefined;
        return id === productId && vid === variantId;
      });

      if (target) onUpdateQuantity(productId, variantId, target.quantity);
      return;
    }

    setCartItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const removeItem = (productId: number, variantId?: number) => {
    if (onRemoveItem) {
      onRemoveItem(productId, variantId);
      return;
    }
    const next = cartItems.filter((item) => {
      const id = Number(item.productId || item.id);
      const vid = item.variantId ? Number(item.variantId) : undefined;
      return !(id === productId && vid === variantId);
    });
    setCartItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoError('');
  };

  // Format price for BDT
  const formatPriceBDT = (price: number) => `৳${price.toLocaleString('en-BD')}`;

  if (!hydrated && !propItems) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: STARTER_STORE_FONTS.body }}
    >
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <PreviewSafeLink
            to="/products"
            isPreview={isPreview}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </PreviewSafeLink>
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Cart</h1>
            <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <PreviewSafeLink
            to="/products"
            isPreview={isPreview}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </PreviewSafeLink>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl p-8 md:p-16 text-center shadow-sm">
            <div
              className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <ShoppingBag className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping and find something you'll love!
            </p>
            <PreviewSafeLink
              to="/products"
              isPreview={isPreview}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px -10px ${primaryColor}80` }}
            >
              Continue Shopping
              <ChevronRight className="w-5 h-5 ml-2" />
            </PreviewSafeLink>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Progress */}
              {!isFreeShipping && freeShippingAbove > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5" style={{ color: primaryColor }} />
                    <p className="text-sm text-gray-700">
                      Add <span className="font-bold" style={{ color: primaryColor }}>{formatPriceBDT(amountToFreeShipping)}</span> more for <span className="font-bold text-green-600">FREE delivery!</span>
                    </p>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressToFreeShipping}%`, backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
              )}

              {isFreeShipping && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-800 font-medium">
                    🎉 Congratulations! You've unlocked FREE delivery!
                  </p>
                </div>
              )}

              {/* Cart Items Table Header (Desktop) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Cart Items */}
              {cartItems.map((item) => {
                const id = Number(item.productId || item.id);
                const itemTotal = item.price * item.quantity;

                return (
                  <div
                    key={`${id}-${item.variantId ?? 'base'}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-4 lg:p-5">
                      <div className="flex gap-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                        {/* Product Image & Info */}
                        <div className="flex gap-4 flex-1 lg:col-span-6">
                          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate pr-2">
                              {item.title}
                            </h3>
                            {item.variantTitle && (
                              <p className="text-sm text-gray-500 mt-0.5">{item.variantTitle}</p>
                            )}
                            {/* Mobile Price */}
                            <p className="lg:hidden text-sm font-medium mt-1" style={{ color: primaryColor }}>
                              {formatPriceBDT(item.price)}
                            </p>
                            {/* Mobile Remove Button */}
                            <button
                              onClick={() => removeItem(id, item.variantId)}
                              className="lg:hidden mt-2 text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Desktop Price */}
                        <div className="hidden lg:block lg:col-span-2 text-center">
                          <span className="font-semibold text-gray-900">
                            {formatPriceBDT(item.price)}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="lg:col-span-2 flex justify-end lg:justify-center">
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQty(id, item.variantId, -1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-10 text-center font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(id, item.variantId, 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Desktop Total & Remove */}
                        <div className="hidden lg:flex lg:col-span-2 items-center justify-end gap-3">
                          <span className="font-bold" style={{ color: primaryColor }}>
                            {formatPriceBDT(itemTotal)}
                          </span>
                          <button
                            onClick={() => removeItem(id, item.variantId)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Total */}
                      <div className="lg:hidden flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Item Total</span>
                        <span className="font-bold text-lg" style={{ color: primaryColor }}>
                          {formatPriceBDT(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-5 lg:p-6 lg:sticky lg:top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h3>

                {/* Summary Rows */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-gray-900">{formatPriceBDT(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={`font-medium ${isFreeShipping ? 'text-green-600' : 'text-gray-900'}`}>
                      {isFreeShipping ? 'FREE' : formatPriceBDT(shipping)}
                    </span>
                  </div>

                  {promoApplied && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Promo (SAVE10)
                        <button
                          onClick={handleRemovePromo}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                      <span className="font-medium">-{formatPriceBDT(promoDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 my-4" />

                {/* Total */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {formatPriceBDT(total)}
                  </span>
                </div>

                {/* Promo Code Section */}
                {!promoApplied && (
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError('');
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-gray-50"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-2 text-sm text-red-500">{promoError}</p>
                    )}
                  </div>
                )}

                {/* Checkout Button */}
                {onCheckout ? (
                  <button
                    onClick={() => onCheckout()}
                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px -10px ${primaryColor}80` }}
                  >
                    <Lock className="w-5 h-5" />
                    Proceed to Checkout
                  </button>
                ) : (
                  <PreviewSafeLink
                    to="/checkout"
                    isPreview={isPreview}
                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px -10px ${primaryColor}80` }}
                  >
                    <Lock className="w-5 h-5" />
                    Proceed to Checkout
                  </PreviewSafeLink>
                )}

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs">Secure Checkout • SSL Encrypted</span>
                </div>

                {/* Continue Shopping */}
                <PreviewSafeLink
                  to="/products"
                  isPreview={isPreview}
                  className="mt-4 w-full inline-flex items-center justify-center py-3 rounded-xl border-2 text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#374151' }}
                >
                  Continue Shopping
                </PreviewSafeLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
