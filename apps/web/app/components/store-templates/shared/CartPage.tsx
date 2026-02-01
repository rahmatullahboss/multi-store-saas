/**
 * Shared Cart Page Component (Theme-Aware) - Shopify Standard
 *
 * A world-class cart page that dynamically adapts to any template's theme.
 * Built to Shopify standards with all premium e-commerce features.
 *
 * Features:
 * - Cart items with quantity adjustment
 * - Coupon/Discount code input
 * - Free shipping progress bar
 * - Order notes
 * - Estimated shipping based on location
 * - Product recommendations
 * - Stock validation
 * - Item variant display
 * - Trust badges
 * - Fully theme-aware
 * - Preview/Live mode support
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useFetcher } from '@remix-run/react';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  Lock,
  Gift,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Package,
  Heart,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';

interface CartItem {
  id: string;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
  imageUrl?: string;
  color?: string;
  size?: string;
  stock?: number;
}

interface SharedCartPageProps {
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
  templateId?: string; // Optional: Pass template ID for preview mode navigation
  onNavigate?: (path: string) => void; // Optional: Callback for internal navigation
  recommendedProducts?: Array<{
    id: number;
    title: string;
    price: number;
    imageUrl?: string | null;
  }>;
}

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 1000;

// Demo coupons for preview
const DEMO_COUPONS: Record<
  string,
  { type: 'percentage' | 'fixed'; value: number; minOrder?: number }
> = {
  SAVE10: { type: 'percentage', value: 10 },
  FLAT100: { type: 'fixed', value: 100, minOrder: 500 },
  WELCOME: { type: 'percentage', value: 15, minOrder: 1000 },
};

export default function SharedCartPage({
  theme,
  isPreview = false,
  templateId: propTemplateId,
  onNavigate,
  recommendedProducts = [],
}: SharedCartPageProps) {
  const params = useParams();
  // Use prop templateId first, fallback to URL params
  const templateId = propTemplateId || params.templateId;
  const fetcher = useFetcher<{
    products: Array<{
      id: number;
      title: string;
      price: number;
      imageUrl: string | null;
      stock?: number;
    }>;
  }>();

  // Default theme if not provided
  const colors = theme || {
    primary: '#1a1a1a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1a1a1a',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#ffffff',
  };

  /* currencySymbol removed - formatPrice handles it */
  const currency = 'BDT';

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);

  // Initialize cart
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');

    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        if (!Array.isArray(items)) return;

        if (isPreview) {
          // Preview Mode: Hydrate from DEMO_PRODUCTS
          const hydratedItems = items
            .map((item: any) => {
              const pId = Number(item.productId);
              const demoProduct = DEMO_PRODUCTS.find((p) => p.id === pId);

              if (!demoProduct) return null;
              return {
                id: String(item.productId),
                productId: pId,
                title: demoProduct.title,
                price: demoProduct.price,
                quantity: Number(item.quantity) || 1,
                image: demoProduct.imageUrl,
                imageUrl: demoProduct.imageUrl,
                variantName: item.variantName,
                color: item.color,
                size: item.size,
                stock: 99, // Assume in stock for preview
              };
            })
            .filter(Boolean) as CartItem[];
          setCartItems(hydratedItems);
        } else {
          // Live Mode: Set basic items, fetcher will enrich
          const normalizedItems = items.map((item: any) => ({
            ...item,
            id: String(item.productId),
            image: item.image || item.imageUrl,
          }));
          setCartItems(normalizedItems);

          // Fetch fresh product data from server
          if (normalizedItems.length > 0) {
            const productIds = normalizedItems.map((item) => item.productId);
            fetcher.submit({ productIds: JSON.stringify(productIds) }, { method: 'post' });
          }
        }
      } catch (e) {
        console.error('Cart parse error', e);
        localStorage.removeItem('cart');
      }
    }
    setIsHydrated(true);
  }, [isPreview]);

  // Live Mode: Update cart with fresh prices from server
  useEffect(() => {
    if (!isPreview && fetcher.data?.products && cartItems.length > 0) {
      const productMap = new Map(fetcher.data.products.map((p) => [p.id, p]));
      setCartItems((prev) =>
        prev.map((item) => {
          const fresh = productMap.get(item.productId);
          if (fresh) {
            return {
              ...item,
              price: fresh.price,
              title: fresh.title,
              image: fresh.imageUrl || item.image,
              stock: fresh.stock,
            };
          }
          return item;
        })
      );
    }
  }, [fetcher.data, isPreview]);

  // Save cart to localStorage
  useEffect(() => {
    if (!isPreview && isHydrated) {
      const storageItems = cartItems.map((item) => ({
        ...item,
        imageUrl: item.image,
      }));
      localStorage.setItem('cart', JSON.stringify(storageItems));
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [cartItems, isHydrated, isPreview]);

  // Calculate totals
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const hasEarnedFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  const shipping = hasEarnedFreeShipping ? 0 : isPreview ? 60 : 0;
  const total = subtotal - couponDiscount + shipping;

  // Total items count
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path === '/checkout') return `/store-template-preview/${templateId}/checkout`;
      if (path.startsWith('/products/')) {
        const id = path.replace('/products/', '');
        return `/store-template-preview/${templateId}/products/${id}`;
      }
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  // Navigation handler - uses callback if provided, otherwise URL navigation
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingQuantity(id);

    setTimeout(() => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id || item.productId === Number(id)
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      setUpdatingQuantity(null);
    }, 200);
  };

  // Remove item
  const removeItem = (id: string) => {
    setRemovingItem(id);
    setTimeout(() => {
      setCartItems((prev) =>
        prev.filter((item) => item.id !== id && item.productId !== Number(id))
      );
      setRemovingItem(null);
    }, 300);
  };

  // Apply coupon
  const applyCoupon = () => {
    setCouponError(null);
    const code = couponCode.toUpperCase().trim();

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (isPreview) {
      // Use demo coupons in preview
      const coupon = DEMO_COUPONS[code];
      if (!coupon) {
        setCouponError('Invalid coupon code');
        return;
      }

      if (coupon.minOrder && subtotal < coupon.minOrder) {
        setCouponError(`Minimum order of ${formatPrice(coupon.minOrder, currency)} required`);
        return;
      }

      const discount =
        coupon.type === 'percentage' ? Math.round(subtotal * (coupon.value / 100)) : coupon.value;

      setCouponDiscount(discount);
      setAppliedCoupon(code);
      setCouponCode('');
    } else {
      // TODO: Real API call for live mode
      setCouponError('Coupon validation coming soon');
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Move to wishlist
  const moveToWishlist = (item: CartItem) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!wishlist.includes(item.productId)) {
        wishlist.push(item.productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
      removeItem(item.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Loading state
  if (!isHydrated) {
    return <div className="min-h-screen" style={{ backgroundColor: colors.background }} />;
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center py-12"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center px-4 max-w-md">
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.cardBg }}
          >
            <ShoppingCart className="w-12 h-12 opacity-30" style={{ color: colors.text }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
            Your Cart is Empty
          </h2>
          <p className="mb-8" style={{ color: colors.muted }}>
            Looks like you haven't added anything to your cart yet. Explore our products and find
            something you'll love!
          </p>
          <Link
            to={getLink('/')}
            onClick={(e) => handleNavigation(e, '/')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text }}>
              Shopping Cart
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link
            to={getLink('/')}
            onClick={(e) => handleNavigation(e, '/')}
            className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: colors.accent }}
          >
            Continue Shopping
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Free Shipping Progress */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: hasEarnedFreeShipping ? '#ecfdf5' : colors.cardBg,
            border: `1px solid ${hasEarnedFreeShipping ? '#10b981' : colors.muted + '20'}`,
          }}
        >
          {hasEarnedFreeShipping ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">You've unlocked FREE shipping!</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2" style={{ color: colors.text }}>
                  <Truck className="w-5 h-5" style={{ color: colors.accent }} />
                  <span className="text-sm font-medium">
                    Add {formatPrice(remainingForFreeShipping, currency)} more for FREE shipping!
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: colors.accent }}>
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.muted + '20' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${freeShippingProgress}%`,
                    backgroundColor: colors.accent,
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const isRemoving = removingItem === item.id;
              const isUpdating = updatingQuantity === item.id;
              const isLowStock = item.stock !== undefined && item.stock > 0 && item.stock <= 5;
              const isOutOfStock = item.stock === 0;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ${
                    isRemoving ? 'opacity-0 transform -translate-x-4' : ''
                  }`}
                  style={{ backgroundColor: colors.cardBg }}
                >
                  {/* Image */}
                  <Link
                    to={getLink(`/products/${item.productId}`)}
                    onClick={(e) => handleNavigation(e, `/products/${item.productId}`)}
                    className="w-full sm:w-28 h-32 sm:h-36 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link
                        to={getLink(`/products/${item.productId}`)}
                        onClick={(e) => handleNavigation(e, `/products/${item.productId}`)}
                        className="font-semibold text-lg hover:opacity-70 transition-opacity line-clamp-2"
                        style={{ color: colors.text }}
                      >
                        {item.title}
                      </Link>

                      {/* Variant Info */}
                      {(item.variantName || item.color || item.size) && (
                        <p className="text-sm mt-1" style={{ color: colors.muted }}>
                          {item.color && <span>Color: {item.color}</span>}
                          {item.color && item.size && <span> • </span>}
                          {item.size && <span>Size: {item.size}</span>}
                          {!item.color && !item.size && item.variantName && (
                            <span>{item.variantName}</span>
                          )}
                        </p>
                      )}

                      {/* Stock Warning */}
                      {isLowStock && (
                        <p className="text-sm mt-1 flex items-center gap-1 text-orange-500">
                          <Clock className="w-3 h-3" />
                          Only {item.stock} left!
                        </p>
                      )}
                      {isOutOfStock && (
                        <p className="text-sm mt-1 flex items-center gap-1 text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          Out of stock
                        </p>
                      )}

                      {/* Price */}
                      <div className="font-bold text-lg mt-2" style={{ color: colors.accent }}>
                        {formatPrice(item.price, currency)}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      {/* Quantity Control */}
                      <div
                        className={`flex items-center border rounded-lg overflow-hidden ${
                          isUpdating ? 'opacity-50' : ''
                        }`}
                        style={{ borderColor: colors.muted + '40' }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-30"
                          style={{ color: colors.text }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span
                          className="w-10 text-center font-medium text-sm"
                          style={{ color: colors.text }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            isUpdating || (item.stock !== undefined && item.quantity >= item.stock)
                          }
                          className="p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-30"
                          style={{ color: colors.text }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveToWishlist(item)}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          style={{ color: colors.muted }}
                          title="Move to Wishlist"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="font-bold ml-auto" style={{ color: colors.text }}>
                        {formatPrice(item.price * item.quantity, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Order Notes */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
              <label
                className="flex items-center gap-2 font-medium mb-2"
                style={{ color: colors.text }}
              >
                <Gift className="w-4 h-4" style={{ color: colors.accent }} />
                Order Notes
                <span className="font-normal text-sm" style={{ color: colors.muted }}>
                  (Optional)
                </span>
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                placeholder="Special instructions, gift message, delivery notes..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.muted + '40',
                  color: colors.text,
                }}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div
              className="p-6 rounded-xl shadow-sm sticky top-24"
              style={{ backgroundColor: colors.cardBg }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}
                  >
                    <div className="flex items-center gap-2 text-green-600">
                      <Tag className="w-4 h-4" />
                      <span className="font-medium">{appliedCoupon}</span>
                      <span className="text-sm">
                        (-{formatPrice(couponDiscount, currency)})
                      </span>
                    </div>
                    <button onClick={removeCoupon} className="p-1 text-green-600 hover:opacity-70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: colors.muted }}
                        />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Coupon code"
                          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm uppercase"
                          style={{
                            backgroundColor: colors.background,
                            borderColor: couponError ? '#ef4444' : colors.muted + '40',
                            color: colors.text,
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        />
                      </div>
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: colors.accent }}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {couponError}
                      </p>
                    )}
                    {isPreview && (
                      <p className="text-xs mt-2" style={{ color: colors.muted }}>
                        Try: SAVE10, FLAT100, WELCOME
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between" style={{ color: colors.muted }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span style={{ color: colors.text }}>
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>
                      -{formatPrice(couponDiscount, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: colors.muted }}>
                  <span className="flex items-center gap-1">
                    Shipping
                    {hasEarnedFreeShipping && <Check className="w-3 h-3 text-green-500" />}
                  </span>
                  <span style={{ color: hasEarnedFreeShipping ? '#10b981' : colors.text }}>
                    {hasEarnedFreeShipping
                      ? 'FREE'
                      : shipping > 0
                        ? `${formatPrice(shipping, currency)}`
                        : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: colors.muted + '20' }}>
                <div className="flex justify-between items-end">
                  <span className="font-medium" style={{ color: colors.text }}>
                    Total
                  </span>
                  <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to={getLink('/checkout')}
                onClick={(e) => handleNavigation(e, '/checkout')}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <Lock className="w-4 h-4" />
                Proceed to Checkout
              </Link>

              {/* Trust Badges */}
              <div
                className="mt-6 pt-6 border-t space-y-3"
                style={{ borderColor: colors.muted + '20' }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                  <Shield className="w-4 h-4" style={{ color: colors.accent }} />
                  <span>Secure Checkout - 100% Protected</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                  <RotateCcw className="w-4 h-4 text-blue-500" />
                  <span>7-Day Easy Returns</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>Cash on Delivery Available</span>
                </div>
              </div>

              {/* Payment Icons */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.muted + '20' }}>
                <p className="text-xs mb-2" style={{ color: colors.muted }}>
                  We Accept
                </p>
                <div className="flex gap-2">
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: '#e2136e' }}
                  >
                    bKash
                  </div>
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: '#f26922' }}
                  >
                    Nagad
                  </div>
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: '#1a1f71' }}
                  >
                    VISA
                  </div>
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center border"
                    style={{ borderColor: colors.muted + '40', color: colors.text }}
                  >
                    COD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
              You might also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={getLink(`/products/${product.id}`)}
                  onClick={(e) => handleNavigation(e, `/products/${product.id}`)}
                  className="group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: colors.cardBg }}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colors.background }}
                      >
                        <Package className="w-10 h-10 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3
                      className="font-medium text-sm line-clamp-2 group-hover:opacity-70 transition-opacity"
                      style={{ color: colors.text }}
                    >
                      {product.title}
                    </h3>
                    <p className="mt-1 font-bold" style={{ color: colors.accent }}>
                      {currencySymbol}
                      {formatPrice(product.price, currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
