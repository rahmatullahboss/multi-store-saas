/**
 * AddToCartButton Component
 *
 * Implements client-side cart management using localStorage.
 * Provides optimistic UI feedback when adding items to cart.
 * Fires AddToCart tracking events for FB Pixel + GA4.
 */

import { useState, type ReactNode, type CSSProperties } from 'react';
import { trackingEvents } from '~/utils/tracking';

interface AddToCartButtonProps {
  productId: number;
  variantId?: number;
  storeId?: number;
  disabled?: boolean;
  size?: 'default' | 'large';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  isPreview?: boolean; // When true, shows preview feedback instead of updating cart
  mode?: 'add_to_cart' | 'buy_now'; // NEW: Support "Order Now"
  // For tracking events
  productName?: string;
  productPrice?: number;
  currency?: string;
  quantity?: number;
}

export function AddToCartButton({
  productId,
  variantId,
  storeId,
  disabled = false,
  size = 'default',
  className,
  style,
  children,
  isPreview = false,
  mode = 'add_to_cart',
  productName,
  productPrice,
  currency = 'BDT',
  quantity = 1,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (disabled) return;

    // In preview mode, allow cart update for realistic feel
    if (isPreview) {
      if (mode === 'buy_now') {
        setIsAdding(true);
        setTimeout(() => {
          setIsAdding(false);
          // Redirect simulation if needed, but usually parent handles navigation or simple reload
          // window.location.href = '/store-template-preview/luxe-boutique/cart'; // Cannot guess template ID easily here
        }, 1000);
      } else {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }

      // Update local cart even in preview!
      updateLocalCart(productId, quantity, storeId, variantId);
      return;
    }

    // Fire AddToCart tracking event (FB Pixel + GA4)
    if (productName && productPrice) {
      trackingEvents.addToCart({
        id: String(productId),
        name: productName,
        price: productPrice,
        quantity: quantity,
        currency: currency,
      });
      console.log('[Tracking] AddToCart event fired:', productName, productPrice);
    }

    // Update local cart in localStorage
    updateLocalCart(productId, quantity, storeId, variantId);

    if (mode === 'buy_now') {
      // Redirect to cart/checkout immediately
      window.location.href = '/cart';
      return;
    }

    // Show success state
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // If custom className/style provided, use minimal base styling
  const hasCustomStyles = className || style;

  const defaultClasses = `
    add-to-cart
    ${isAdding ? 'adding' : ''}
    ${isAdded ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
    ${size === 'large' ? 'py-4 text-lg' : ''}
  `.trim();

  const buttonClasses = hasCustomStyles
    ? `${className || ''} ${isAdded ? 'bg-emerald-600!' : ''}`
    : defaultClasses;

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={buttonClasses}
      style={style}
      aria-label={isAdding ? 'Adding to cart...' : 'Add to cart'}
    >
      {children ? (
        isAdding ? (
          'Adding...'
        ) : isAdded ? (
          'Added!'
        ) : (
          children
        )
      ) : (
        <>
          {isAdding ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Adding...</span>
            </>
          ) : isAdded ? (
            <>
              <CheckIcon />
              <span className="ml-2">Added!</span>
            </>
          ) : (
            <>
              <CartIcon />
              <span className="ml-2">Add to Cart</span>
            </>
          )}
        </>
      )}
    </button>
  );
}

// Helper to update cart count in header (client-side)
function updateLocalCart(productId: number, quantity: number, storeId?: number, variantId?: number) {
  // Store in localStorage for persistence
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(
      (item: { productId: number; variantId?: number }) =>
        item.productId === productId && (item.variantId ?? null) === (variantId ?? null)
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ productId, variantId, quantity, storeId });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new Event('cart-updated'));
    // Also dispatch storage event for cross-tab or strict listeners
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to update local cart:', e);
  }
}

// Icons
function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}
