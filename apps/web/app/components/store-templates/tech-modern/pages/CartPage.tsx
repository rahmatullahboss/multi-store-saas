import { useState, useEffect } from 'react';
import { Link, useParams } from '@remix-run/react';
import { Minus, Plus, Trash2, ArrowRight, Shield } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';

interface TechCartProps {
  theme?: Record<string, unknown>;
  isPreview?: boolean;
  onCheckout?: () => void;
}

interface CartItem {
  id?: number | string;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
  imageUrl?: string | null;
  specs?: string;
}

export function TechCartPage({ theme: _theme, isPreview = false, onCheckout }: TechCartProps) {
  const params = useParams();
  const templateId = params.templateId || 'tech-modern';
  const currencySymbol = '৳';

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (!Array.isArray(items)) return; // Safety check

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
                    quantity: Number(item.quantity) || 1,
                    image: demoProduct.imageUrl || null,
                    imageUrl: demoProduct.imageUrl || null,
                    specs: (demoProduct.description?.slice(0, 30) || '') + '...',
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
        localStorage.removeItem('cart');
      }
    }
    setHydrated(true);
  }, [isPreview]);

  const updateQty = (id: number, delta: number) => {
    setCartItems((items) => {
      const newItems = items.map((item) => {
        if (item.id === id || item.productId === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeItem = (id: number) => {
    setCartItems((items) => {
      const newItems = items.filter((item) => item.id !== id && item.productId !== id);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cart-updated'));
      return newItems;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path === '/checkout') return `/store-template-preview/${templateId}/checkout`;
    }
    return path;
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <span className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center text-sm">
            1
          </span>
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id || item.productId}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex gap-4"
              >
                <div className="w-24 h-24 bg-gray-100 rounded border border-gray-100 flex-shrink-0">
                  <img
                    src={item.image || item.imageUrl || undefined}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    {item.specs && (
                      <p className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">
                        {item.specs}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">
                        {formatPrice(item.price, currencySymbol)}
                      </span>
                      <span className="text-xs text-gray-400">x {item.quantity}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQty(Number(item.id || item.productId), -1)}
                          className="p-1 hover:text-blue-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(Number(item.id || item.productId), 1)}
                          className="p-1 hover:text-blue-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(Number(item.id || item.productId))}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal, currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{currencySymbol}0</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- {currencySymbol}0</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold mb-6 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(subtotal, currencySymbol)}</span>
              </div>

              {onCheckout ? (
                <button
                  onClick={onCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                  Checkout Securely <ArrowRight size={18} />
                </button>
              ) : (
                <Link
                  to={getLink('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                  Checkout Securely <ArrowRight size={18} />
                </Link>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={12} className="text-green-500" />
                <span>SSL Encrypted Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
