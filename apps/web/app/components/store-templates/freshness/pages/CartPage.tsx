import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Leaf } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';

interface FreshnessCartProps {
  theme?: Record<string, unknown>;
  isPreview?: boolean;
}

interface CartItem {
  id?: number | string;
  productId: number;
  title: string;
  price: number;
  image?: string | null;
  imageUrl?: string | null;
  category?: string;
  quantity: number;
}

export function FreshnessCartPage({ theme: _theme, isPreview = false }: FreshnessCartProps) {
  const currencySymbol = '৳';
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
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
                      image: demoProduct.imageUrl || null,
                      imageUrl: demoProduct.imageUrl || null,
                      category: demoProduct.category || undefined,
                      quantity: Number(item.quantity) || 1,
                    }
                  : null;
              })
              .filter((item): item is CartItem => item !== null);
            setCartItems(hydratedItems);
          } else {
            setCartItems(items as CartItem[]);
          }
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

  if (!hydrated) return null;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8fafc] text-gray-800">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Leaf className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Basket is Empty</h2>
        <p className="text-gray-500 mb-8">Fill it with fresh goodies!</p>
        <PreviewSafeLink
          to="/"
          isPreview={isPreview}
          className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
        >
          Start Shopping
        </PreviewSafeLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-green-600" />
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="p-6 flex gap-6 items-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image || item.imageUrl || undefined}
                      alt={item.title}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                    {item.category && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    )}
                    <div className="mt-2 font-bold text-gray-900">
                      {formatPrice(item.price, currencySymbol)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => removeItem(Number(item.id || item.productId))}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex items-center border border-gray-200 rounded-lg h-10">
                      <button
                        onClick={() => updateQty(Number(item.id || item.productId), -1)}
                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(Number(item.id || item.productId), 1)}
                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(subtotal, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(subtotal, currencySymbol)}</span>
                </div>
              </div>

              <PreviewSafeLink
                to="/checkout"
                isPreview={isPreview}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-green-200"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </PreviewSafeLink>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Leaf size={16} className="text-green-500" />
                <span>Freshness Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
