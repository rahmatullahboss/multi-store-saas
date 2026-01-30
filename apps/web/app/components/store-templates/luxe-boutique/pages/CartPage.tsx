import { useState, useEffect } from 'react';
import { Link, useParams } from '@remix-run/react';
import { Minus, Plus, X } from 'lucide-react';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';
import { formatPrice } from '~/lib/theme-engine';

interface LuxeCartProps {
  theme?: any;
  isPreview?: boolean;
  onCheckout?: () => void;
  onNavigate?: (path: string) => void;
}

export function LuxeCartPage({ theme, isPreview = false, onCheckout, onNavigate }: LuxeCartProps) {
  const params = useParams();
  const templateId = params.templateId || 'luxe-boutique';
  const currencySymbol = '৳';

  // Helper
  const handleNav = (path: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  // State for Cart
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (isPreview) {
          // Hydrate with Demo Data details
          const hydratedItems = items
            .map((item: any) => {
              const demoProduct = DEMO_PRODUCTS.find((p) => p.id === item.productId);
              return demoProduct
                ? {
                    ...item,
                    title: demoProduct.title,
                    price: demoProduct.price,
                    image: demoProduct.imageUrl,
                  }
                : null;
            })
            .filter(Boolean);
          setCartItems(hydratedItems);
        } else {
          // Live mode: should fetch from API, but for basic rendering use stored
          setCartItems(items);
        }
      } catch (e) {
        console.error(e);
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
      // Sync to localStorage
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeItem = (id: number) => {
    setCartItems((items) => {
      const newItems = items.filter((item) => item.id !== id && item.productId !== id);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cart-updated')); // Notify header
      return newItems;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path === '/checkout') return `/store-template-preview/${templateId}/checkout`;
    }
    return path;
  };

  if (!hydrated) return null;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#faf9f7] text-[#1a1a1a]">
        <h2 className="text-3xl font-serif mb-4">Your Bag is Empty</h2>
        <p className="text-[#6b6b6b] mb-8 font-light">Explore our latest collection.</p>
        {onNavigate ? (
          <button
            onClick={(e) => handleNav('/', e)}
            className="border border-[#1a1a1a] px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            Continue Shopping
          </button>
        ) : (
          <Link
            to={getLink('/')}
            className="border border-[#1a1a1a] px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif mb-12 text-center">Shopping Bag</h1>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="border-b border-[#e5e5e5] pb-4 mb-4 hidden md:flex text-xs uppercase tracking-widest text-[#6b6b6b]">
              <div className="w-1/2">Product</div>
              <div className="w-1/4 text-center">Quantity</div>
              <div className="w-1/4 text-right">Total</div>
            </div>

            <div className="space-y-8">
              {cartItems.map((item, index) => (
                <div
                  key={item.id || item.productId || index}
                  className="flex flex-col md:flex-row gap-6 items-center border-b border-[#e5e5e5] pb-8 last:border-0"
                >
                  <div className="flex gap-6 w-full md:w-1/2">
                    <div className="w-24 h-32 bg-white flex-shrink-0">
                      <img
                        src={item.image || item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-serif text-lg mb-1">{item.title}</h3>
                      {item.variant && (
                        <p className="text-sm text-[#6b6b6b] mb-2">{item.variant}</p>
                      )}
                      <button
                        onClick={() => removeItem(item.id || item.productId)}
                        className="text-xs text-[#999] underline hover:text-[#1a1a1a] w-fit"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-full md:w-1/4">
                    <div className="flex items-center border border-[#e5e5e5]">
                      <button
                        onClick={() => updateQty(item.id || item.productId, -1)}
                        className="p-3 hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id || item.productId, 1)}
                        className="p-3 hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-1/4 text-right font-medium text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-96">
            <div className="bg-white p-8 border border-[#f0f0f0]">
              <h3 className="font-serif text-xl mb-6">Order Summary</h3>

              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b6b6b]">Subtotal</span>
                  <span>
                    {currencySymbol}
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b6b6b]">Shipping</span>
                  <span className="text-[#6b6b6b] italic">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-[#f0f0f0] pt-6 mb-8 flex justify-between items-center">
                <span className="font-serif text-lg">Total</span>
                <span className="font-serif text-xl">
                  {currencySymbol}
                  {subtotal.toLocaleString()}
                </span>
              </div>

              {onCheckout ? (
                <button
                  onClick={onCheckout}
                  className="block w-full bg-[#1a1a1a] text-white text-center py-4 uppercase text-xs tracking-widest font-bold hover:bg-[#c9a961] transition-colors"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <Link
                  to={getLink('/checkout')}
                  className="block w-full bg-[#1a1a1a] text-white text-center py-4 uppercase text-xs tracking-widest font-bold hover:bg-[#c9a961] transition-colors"
                >
                  Proceed to Checkout
                </Link>
              )}

              <p className="text-center text-[#999] text-xs mt-4">Secure Checkout • Free Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
