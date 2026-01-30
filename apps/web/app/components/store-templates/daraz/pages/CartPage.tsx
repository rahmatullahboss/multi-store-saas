/**
 * DarazCartPage - Cart Page for Daraz Template
 *
 * Matches Daraz Bangladesh's cart page design:
 * - Clean item list with quantity controls
 * - Orange (#F85606) accents
 * - Order summary sidebar
 * - Proceed to checkout button
 */

import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, Truck, Shield, Tag } from 'lucide-react';
import { DARAZ_THEME } from '../theme';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';
import { formatPrice } from '~/lib/theme-engine';

interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  variantName?: string;
  // Support both ID formats for compatibility
  id?: string | number;
}

interface CartPageProps {
  // Optional props for Smart Component behavior
  items?: CartItem[];
  currency?: string;
  onUpdateQuantity?: (productId: number, delta: number) => void;
  onRemoveItem?: (productId: number) => void;
  onCheckout?: () => void;
  // Theme aware props
  theme?: typeof DARAZ_THEME;
  isPreview?: boolean;
}

export function DarazCartPage({
  items: propItems,
  currency = '৳',
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isPreview = false,
}: CartPageProps) {
  // Internal state for smart behavior
  const [cartItems, setCartItems] = useState<CartItem[]>(propItems || []);
  const [hydrated, setHydrated] = useState(false);

  // Initialize cart from localStorage if no props provided (Smart Mode)
  useEffect(() => {
    if (propItems) {
      setCartItems(propItems);
      setHydrated(true);
      return;
    }

    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (isPreview) {
          // Hydrate with Demo Data
          const hydratedItems = (items as Array<Record<string, unknown>>)
            .map((item): CartItem | null => {
              const pId = Number(item.productId);
              const demoProduct = DEMO_PRODUCTS.find((p) => p.id === pId);
              return demoProduct
                ? {
                    ...item,
                    productId: pId,
                    title: demoProduct.title,
                    price: demoProduct.price,
                    imageUrl: demoProduct.imageUrl || null,
                    quantity: Number(item.quantity) || 1,
                  }
                : null;
            })
            .filter((item): item is CartItem => item !== null);
          setCartItems(hydratedItems);
        } else {
          setCartItems(items as CartItem[]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setHydrated(true);
  }, [isPreview, propItems]);

  // Internal handlers
  const handleUpdateQuantity = (productId: number, delta: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(productId, delta);
      return;
    }

    setCartItems((items) => {
      const newItems = items.map((item) => {
        const id = Number(item.productId || item.id);
        if (id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const handleRemoveItem = (productId: number) => {
    if (onRemoveItem) {
      onRemoveItem(productId);
      return;
    }

    setCartItems((items) => {
      const newItems = items.filter((item) => {
        const id = Number(item.productId || item.id);
        return id !== productId;
      });
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cart-updated'));
      return newItems;
    });
  };

  const handleCheckoutLink = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      if (isPreview) {
        // Preview link handled via Link usually, but here we might need manual navigation or just alert
        // But checking SharedCheckoutPage it handles preview path.
        // We should construct the correct URL.
        // Since we don't have templateId here easily without hooks, let's assume parent passes onCheckout
        // OR we use relative link if inside the route.
        // In preview route: /store-template-preview/daraz/cart -> /store-template-preview/daraz/checkout
        // window.location.href works but causes full reload.

        // Better: Use window.location to determine base
        const currentPath = window.location.pathname;
        if (currentPath.includes('/cart')) {
          window.location.href = currentPath.replace('/cart', '/checkout');
        } else {
          window.location.href = '/checkout';
        }
      } else {
        window.location.href = '/checkout';
      }
    }
  };

  if (!hydrated && !propItems) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: DARAZ_THEME.background }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium" style={{ color: DARAZ_THEME.text }}>
            Shopping Cart ({itemCount} items)
          </h1>
          <a
            href={isPreview ? window.location.pathname.replace('/cart', '') : '/'}
            className="text-sm hover:underline"
            style={{ color: DARAZ_THEME.primary }}
          >
            Continue Shopping
          </a>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg p-12 text-center">
            <ShoppingBag size={80} className="mx-auto mb-6" style={{ color: DARAZ_THEME.muted }} />
            <h2 className="text-xl font-medium mb-2" style={{ color: DARAZ_THEME.text }}>
              Your cart is empty
            </h2>
            <p className="mb-6" style={{ color: DARAZ_THEME.textSecondary }}>
              Looks like you haven't added any items yet.
            </p>
            <a
              href={isPreview ? window.location.pathname.replace('/cart', '') : '/'}
              className="inline-block px-8 py-3 rounded text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: DARAZ_THEME.primary }}
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Store Header */}
              <div
                className="bg-white rounded-lg p-4 flex items-center gap-3"
                style={{ borderLeft: `4px solid ${DARAZ_THEME.primary}` }}
              >
                <input type="checkbox" checked readOnly className="w-4 h-4" />
                <span style={{ color: DARAZ_THEME.text }}>All Items ({itemCount})</span>
              </div>

              {/* Items List */}
              {cartItems.map((item, index) => (
                <div key={item.productId || index} className="bg-white rounded-lg p-4 flex gap-4">
                  {/* Checkbox */}
                  <input type="checkbox" checked readOnly className="w-4 h-4 mt-1" />

                  {/* Image */}
                  <a
                    href={
                      isPreview
                        ? window.location.pathname.replace('/cart', `/products/${item.productId}`)
                        : `/products/${item.productId}`
                    }
                    className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-50"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </a>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={
                        isPreview
                          ? window.location.pathname.replace('/cart', `/products/${item.productId}`)
                          : `/products/${item.productId}`
                      }
                      className="block mb-1 hover:underline line-clamp-2"
                      style={{ color: DARAZ_THEME.text }}
                    >
                      {item.title}
                    </a>
                    {item.variantName && (
                      <p className="text-sm mb-2" style={{ color: DARAZ_THEME.muted }}>
                        {item.variantName}
                      </p>
                    )}
                    <p className="font-bold text-lg" style={{ color: DARAZ_THEME.priceOrange }}>
                      {formatPrice(item.price, currency)}
                    </p>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(Number(item.productId))}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div
                      className="flex items-center border rounded"
                      style={{ borderColor: DARAZ_THEME.border }}
                    >
                      <button
                        onClick={() => handleUpdateQuantity(Number(item.productId), -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(Number(item.productId), 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-5 sticky top-4">
                <h2
                  className="font-medium mb-4 pb-4"
                  style={{
                    color: DARAZ_THEME.text,
                    borderBottom: `1px solid ${DARAZ_THEME.border}`,
                  }}
                >
                  Order Summary
                </h2>

                {/* Voucher Input */}
                <div className="mb-4">
                  <div
                    className="flex items-center gap-2 p-3 rounded border cursor-pointer hover:bg-gray-50"
                    style={{ borderColor: DARAZ_THEME.border }}
                  >
                    <Tag size={18} style={{ color: DARAZ_THEME.primary }} />
                    <span className="text-sm" style={{ color: DARAZ_THEME.textSecondary }}>
                      Apply Voucher Code
                    </span>
                    <ChevronRight
                      size={16}
                      className="ml-auto"
                      style={{ color: DARAZ_THEME.muted }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: DARAZ_THEME.textSecondary }}>
                      Subtotal ({itemCount} items)
                    </span>
                    <span style={{ color: DARAZ_THEME.text }}>
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: DARAZ_THEME.textSecondary }}>Shipping</span>
                    <span style={{ color: DARAZ_THEME.muted }}>Calculated at checkout</span>
                  </div>
                </div>

                <div
                  className="flex justify-between py-3 mb-4"
                  style={{ borderTop: `1px solid ${DARAZ_THEME.border}` }}
                >
                  <span className="font-medium" style={{ color: DARAZ_THEME.text }}>
                    Total
                  </span>
                  <span className="text-xl font-bold" style={{ color: DARAZ_THEME.priceOrange }}>
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                <button
                  onClick={handleCheckoutLink}
                  className="w-full py-3 rounded text-white font-medium flex items-center justify-center gap-2 transition hover:opacity-90"
                  style={{ backgroundColor: DARAZ_THEME.primary }}
                >
                  Proceed to Checkout ({itemCount})
                  <ChevronRight size={18} />
                </button>

                {/* Trust Badges */}
                <div
                  className="flex items-center justify-center gap-4 mt-4 pt-4"
                  style={{ borderTop: `1px solid ${DARAZ_THEME.border}` }}
                >
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: DARAZ_THEME.textSecondary }}
                  >
                    <Truck size={14} style={{ color: DARAZ_THEME.primary }} />
                    Fast Delivery
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: DARAZ_THEME.textSecondary }}
                  >
                    <Shield size={14} style={{ color: DARAZ_THEME.primary }} />
                    Secure
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
