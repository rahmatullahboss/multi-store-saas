import { Fragment, useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from '@remix-run/react';

interface CartItem {
  productId: number;
  quantity: number;
  // These would be fetched from localStorage or a more complete solution
  title?: string;
  image?: string;
  price?: number;
  variantName?: string;
}

export function RovoCartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  // Listen for global open event and cart updates
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleCartUpdate = () => loadCart();
    
    window.addEventListener('open-cart-drawer', handleOpen);
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    
    // Initial load
    loadCart();
    
    return () => {
      window.removeEventListener('open-cart-drawer', handleOpen);
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const loadCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      setItems(cartData);
    } catch (e) {
      setItems([]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    const updatedCart = items.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setItems(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (productId: number) => {
    const updatedCart = items.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setItems(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const freeShippingThreshold = 1500;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b">
          <h2 className="text-lg font-medium text-gray-900 uppercase tracking-widest">
            Shopping Cart
          </h2>
          <button
            type="button"
            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close panel</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b">
          {subtotal >= freeShippingThreshold ? (
            <p className="text-sm text-green-600 font-medium mb-2">Congratulations! You've got free shipping!</p>
          ) : (
            <p className="text-sm text-gray-600 mb-2">
              Spend <span className="font-bold text-black">Tk {freeShippingThreshold - subtotal}</span> more for free shipping!
            </p>
          )}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button 
                onClick={() => setOpen(false)}
                className="text-red-600 font-medium hover:underline uppercase text-sm tracking-wide"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="-my-6 divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.productId} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || 'Product'}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                         <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <Link to={`/products/${item.productId}`} onClick={() => setOpen(false)}>
                            {item.title || `Product #${item.productId}`}
                          </Link>
                        </h3>
                        <p className="ml-4">Tk {item.price || 0}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.variantName}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border rounded-md">
                        <button 
                          className="p-1 hover:bg-gray-100"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-2 font-medium">{item.quantity}</span>
                        <button 
                          className="p-1 hover:bg-gray-100"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="font-medium text-red-600 hover:text-red-500 text-sm uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p className="uppercase tracking-wide">Subtotal</p>
              <p>Tk {subtotal}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 mb-6">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="space-y-3">
              <Link
                to="/checkout"
                className="flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-900 uppercase tracking-widest w-full group"
                onClick={() => setOpen(false)}
              >
                Checkout
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/cart"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 uppercase tracking-widest w-full"
                onClick={() => setOpen(false)}
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
