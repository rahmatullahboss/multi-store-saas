/**
 * useCheckoutModal Hook
 * 
 * Easy-to-use hook for integrating checkout modal in landing pages
 * Manages modal state and provides open/close functions
 */

import { useState, useCallback } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  variants?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
}

interface UseCheckoutModalOptions {
  onOrderSuccess?: (orderId: string) => void;
}

interface UseCheckoutModalReturn {
  isOpen: boolean;
  product: Product | null;
  openCheckout: (product: Product) => void;
  closeCheckout: () => void;
  handleOrderSuccess: (orderId: string) => void;
}

export function useCheckoutModal(options: UseCheckoutModalOptions = {}): UseCheckoutModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openCheckout = useCallback((product: Product) => {
    setProduct(product);
    setIsOpen(true);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
    
    // Restore body scroll
    document.body.style.overflow = '';
  }, []);

  const handleOrderSuccess = useCallback((orderId: string) => {
    options.onOrderSuccess?.(orderId);
    
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        content_ids: [product?.id],
        content_name: product?.name,
        value: product?.price,
        currency: 'BDT',
      });
    }
  }, [options, product]);

  return {
    isOpen,
    product,
    openCheckout,
    closeCheckout,
    handleOrderSuccess,
  };
}

export default useCheckoutModal;
