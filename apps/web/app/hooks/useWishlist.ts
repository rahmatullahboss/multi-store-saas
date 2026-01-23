import { useContext } from 'react';
import { WishlistContext } from '~/contexts/WishlistContext';

// Default fallback for SSR or when provider is missing
const DEFAULT_WISHLIST_CONTEXT = {
  wishlist: [] as number[],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  toggleWishlist: () => {},
  count: 0,
};

/**
 * SSR-safe wishlist hook
 * Returns default values if WishlistProvider is not available (e.g., during SSR)
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  
  // Return defaults during SSR or when provider is missing
  if (context === undefined) {
    return DEFAULT_WISHLIST_CONTEXT;
  }
  
  return context;
}
