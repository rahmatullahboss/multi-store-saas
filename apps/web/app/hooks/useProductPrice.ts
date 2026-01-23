
/**
 * useProductPrice Hook
 * 
 * Centralized logic for calculating product price.
 * Automatically applies:
 * 1. Flash Sale discounts (if active in StoreConfig)
 * 2. Future: Customer group discounts, bulk pricing, etc.
 * 
 * Returns:
 * - price: The final calculated price to show
 * - originalPrice: The product's base price
 * - compareAtPrice: The product's original compareAt price (or base price if flash sale active)
 * - discountPercent: The applied discount percentage
 * - isFlashSale: Boolean indicating if a flash sale is active
 */

import { useStoreConfig } from '~/contexts/StoreConfigContext';

interface Product {
  price: number;
  compareAtPrice: number | null;
}

interface PriceResult {
  price: number;
  originalPrice: number;
  compareAtPrice: number | null;
  discountPercentage: number;
  isFlashSale: boolean;
  isOnSale: boolean;
}

export function useProductPrice(product: Product): PriceResult {
  const { config } = useStoreConfig();
  
  const originalPrice = product.price;
  let finalPrice = originalPrice;
  let compareAtPrice = product.compareAtPrice;
  let discountPercentage = 0;
  let isFlashSale = false;

  // 1. Check for Flash Sale
  const flashSale = config?.flashSale;
  
  // Logic: 
  // - Flash sale must be Active
  // - Must have a discount amount
  // - Current time must be before EndTime (if set)
  // - (Optional) We could add product inclusion/exclusion logic here later
  
  const isFlashSaleActive = 
    flashSale?.isActive && 
    (flashSale.discountPercentage ?? 0) > 0;
    
  if (isFlashSaleActive) {
    // Check time if needed (assuming server handles strict validation, but UI should reflect it too)
    const isTimeValid = !flashSale?.endTime || new Date(flashSale.endTime) > new Date();

    if (isTimeValid) {
      isFlashSale = true;
      const discount = flashSale!.discountPercentage!;
      
      // Calculate Discount
      if (flashSale?.discountType === 'fixed') {
          // Fixed amount off (e.g. 500 Tk off)
          finalPrice = Math.max(0, originalPrice - discount);
          discountPercentage = Math.round((discount / originalPrice) * 100);
      } else {
          // Percent off (default)
          finalPrice = originalPrice * (1 - discount / 100);
          discountPercentage = discount;
      }

      // If flash sale is active, the "Old Price" becomes the Original Price (if it wasn't already on sale)
      // OR we keep the original compareAtPrice if it was higher.
      // Standard practice: Show the Original Price as the strikethrough.
      compareAtPrice = originalPrice; 

      // If the product was ALREADY on sale (e.g. Price 800, Compare 1000), 
      // and Flash Sale is 20% off (implied usually off the Selling Price):
      // New Price = 800 * 0.8 = 640.
      // Compare At = 800. (Showing the immediate drop).
      // OR Compare At = 1000? Usually standard e-com shows the immediate previous price as strike-through for flash sales.
      // Let's stick to: Strikethrough is the Original Price (product.price).
    }
  }

  // Calculate generic "Is On Sale" status (either Flash Sale OR regular Compare At)
  const isOnSale = finalPrice < (compareAtPrice ?? finalPrice);

  // If NOT flash sale, assume regular sale discount
  if (!isFlashSale && isOnSale && compareAtPrice && compareAtPrice > finalPrice) {
    discountPercentage = Math.round(((compareAtPrice - finalPrice) / compareAtPrice) * 100);
  }

  return {
    price: finalPrice,
    originalPrice,
    compareAtPrice,
    discountPercentage,
    isFlashSale,
    isOnSale
  };
}
