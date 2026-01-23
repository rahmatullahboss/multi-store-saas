import { useState, useEffect } from 'react';

/**
 * Custom hook to track cart item count reactively.
 * Listens for 'storage' and 'cart-updated' events.
 * 
 * @returns {number} The current total quantity of items in the cart.
 */
export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        if (typeof window === 'undefined') return;

        const cartData = localStorage.getItem('cart');
        if (!cartData) {
          setCount(0);
          return;
        }

        const cart = JSON.parse(cartData);
        if (!Array.isArray(cart)) {
          setCount(0);
          return;
        }

        const total = cart.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) || 0);
        }, 0);
        
        setCount(total);
      } catch (e) {
        console.error('Failed to parse cart', e);
        setCount(0);
      }
    };

    // Initial check
    updateCount();

    // Event listeners
    window.addEventListener('storage', updateCount);
    window.addEventListener('cart-updated', updateCount);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('cart-updated', updateCount);
    };
  }, []);

  return count;
}
