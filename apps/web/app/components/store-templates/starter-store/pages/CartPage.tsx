/**
 * Starter Store Cart Page
 *
 * A clean, modern cart page aligned with Starter Store theme.
 * Supports both Smart Mode (self-hydrate) and Controlled Mode (props).
 */

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { STARTER_STORE_THEME, STARTER_STORE_FONTS } from '../theme';
import { formatPrice } from '~/lib/theme-engine';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';

const theme = STARTER_STORE_THEME;

interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  compareAtPrice?: number | null;
  id?: string | number;
}

interface StarterStoreCartPageProps {
  items?: CartItem[];
  currency?: string;
  total?: number;
  itemCount?: number;
  onUpdateQuantity?: (productId: number, quantity: number) => void;
  onRemoveItem?: (productId: number) => void;
  onCheckout?: () => void;
  isLoading?: boolean;
  storeName?: string;
  isPreview?: boolean;
}

export function StarterStoreCartPage({
  items: propItems,
  currency = 'BDT',
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoading = false,
  isPreview = false,
}: StarterStoreCartPageProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(propItems || []);
  const [hydrated, setHydrated] = useState(false);

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

  const shipping = subtotal >= 1500 ? 0 : 60;
  const total = subtotal + shipping;

  const updateQty = (productId: number, delta: number) => {
    const next = cartItems.map((item) => {
      const id = Number(item.productId || item.id);
      if (id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });

    if (onUpdateQuantity) {
      const target = next.find((i) => Number(i.productId || i.id) === productId);
      if (target) onUpdateQuantity(productId, target.quantity);
      return;
    }

    setCartItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const removeItem = (productId: number) => {
    if (onRemoveItem) {
      onRemoveItem(productId);
      return;
    }
    const next = cartItems.filter((item) => Number(item.productId || item.id) !== productId);
    setCartItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  if (!hydrated && !propItems) {
    return null;
  }

  return (
    <div
      className="min-h-[70vh] px-4 py-10"
      style={{ backgroundColor: theme.background, fontFamily: STARTER_STORE_FONTS.body }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: theme.text }}>
            আপনার কার্ট
          </h1>
          <span className="text-sm" style={{ color: theme.muted }}>
            {totalItems} টি পণ্য
          </span>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl p-8 shadow-sm">লোড হচ্ছে...</div>
        ) : cartItems.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-12 text-center shadow-sm"
            style={{ border: `1px solid ${theme.borderLight}` }}
          >
            <div
              className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <ShoppingBag className="h-7 w-7" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
              কার্ট খালি
            </h2>
            <p className="text-sm mb-6" style={{ color: theme.muted }}>
              আপনার কার্টে এখনো কোনো পণ্য যোগ করা হয়নি।
            </p>
            <PreviewSafeLink
              to="/products"
              isPreview={isPreview}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              পণ্য দেখুন
            </PreviewSafeLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const id = Number(item.productId || item.id);
                return (
                  <div
                    key={id}
                    className="bg-white rounded-xl p-4 md:p-5 shadow-sm flex gap-4"
                    style={{ border: `1px solid ${theme.borderLight}` }}
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium" style={{ color: theme.text }}>
                            {item.title}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: theme.muted }}>
                            {formatPrice(item.price, currency)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(id)}
                          className="p-2 rounded-lg hover:bg-gray-100"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" style={{ color: theme.muted }} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(id, -1)}
                            className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                            style={{ borderColor: theme.border }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(id, 1)}
                            className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                            style={{ borderColor: theme.border }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="font-semibold" style={{ color: theme.text }}>
                          {formatPrice(item.price * item.quantity, currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-5 shadow-sm h-fit" style={{ border: `1px solid ${theme.borderLight}` }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                অর্ডার সারাংশ
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between" style={{ color: theme.muted }}>
                  <span>সাবটোটাল</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between" style={{ color: theme.muted }}>
                  <span>ডেলিভারি</span>
                  <span>{shipping === 0 ? 'ফ্রি' : formatPrice(shipping, currency)}</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between text-base font-semibold" style={{ color: theme.text }}>
                  <span>মোট</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>

              {onCheckout ? (
                <button
                  onClick={() => onCheckout()}
                  className="w-full mt-5 py-3 rounded-lg text-white font-medium transition hover:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  চেকআউট করুন
                </button>
              ) : (
                <PreviewSafeLink
                  to="/checkout"
                  isPreview={isPreview}
                  className="w-full mt-5 inline-flex items-center justify-center py-3 rounded-lg text-white font-medium transition hover:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  চেকআউট করুন
                </PreviewSafeLink>
              )}

              <PreviewSafeLink
                to="/products"
                isPreview={isPreview}
                className="mt-3 w-full inline-flex items-center justify-center py-3 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                আরো শপিং করুন
              </PreviewSafeLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
