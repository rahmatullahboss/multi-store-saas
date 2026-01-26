/**
 * Shared Cart Page Component (Theme-Aware)
 *
 * A universal cart page that dynamically adapts to any template's theme.
 * Used as fallback for templates that don't have their own CartPage.
 * Supports both Preview Mode (mock data) and Live Mode (localStorage + API).
 *
 * Features:
 * - Cart items list
 * - Quantity adjustment
 * - Remove items
 * - Order summary
 * - Checkout button
 * - Fully theme-aware
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useFetcher } from '@remix-run/react';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';

interface CartItem {
  id: string;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
  imageUrl?: string; // Standardize this
}

interface SharedCartPageProps {
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}

export default function SharedCartPage({ theme, isPreview = false }: SharedCartPageProps) {
  const params = useParams();
  const templateId = params.templateId;
  const fetcher = useFetcher<{
    products: Array<{ id: number; title: string; price: number; imageUrl: string | null }>;
  }>();

  // Default theme if not provided
  const colors = theme || {
    primary: '#1a1a1a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1a1a1a',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#ffffff',
  };

  const currencySymbol = '৳'; // Default for Bangladesh context

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize cart based on mode
  useEffect(() => {
    // Read from localStorage for BOTH modes (Client-first approach)
    const storedCart = localStorage.getItem('cart');

    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        if (!Array.isArray(items)) return; // Safety check

        if (isPreview) {
          // Preview Mode: Hydrate from DEMO_PRODUCTS
          const hydratedItems = items
            .map((item: any) => {
              // Ensure ID comparison works (string vs number)
              const pId = Number(item.productId);
              const demoProduct = DEMO_PRODUCTS.find((p) => p.id === pId);

              if (!demoProduct) return null;
              return {
                id: String(item.productId),
                productId: pId,
                title: demoProduct.title,
                price: demoProduct.price,
                quantity: Number(item.quantity) || 1,
                image: demoProduct.imageUrl,
                imageUrl: demoProduct.imageUrl,
                variantName: item.variantName,
              };
            })
            .filter(Boolean) as CartItem[];
          setCartItems(hydratedItems);
        } else {
          // Live Mode: Set basic items, fetcher will enrich
          const normalizedItems = items.map((item: any) => ({
            ...item,
            id: String(item.productId), // Ensure ID is string for UI keys
            image: item.image || item.imageUrl,
          }));
          setCartItems(normalizedItems);

          // Fetch fresh product data from server
          if (normalizedItems.length > 0) {
            const productIds = normalizedItems.map((item) => item.productId);
            fetcher.submit({ productIds: JSON.stringify(productIds) }, { method: 'post' });
          }
        }
      } catch (e) {
        console.error('Cart parse error', e);
        localStorage.removeItem('cart');
      }
    }
    setIsHydrated(true);
  }, [isPreview]);

  // Live Mode: Update cart with fresh prices from server
  useEffect(() => {
    if (!isPreview && fetcher.data?.products && cartItems.length > 0) {
      const productMap = new Map(fetcher.data.products.map((p) => [p.id, p]));
      setCartItems((prev) =>
        prev.map((item) => {
          const fresh = productMap.get(item.productId);
          if (fresh) {
            return {
              ...item,
              price: fresh.price,
              title: fresh.title,
              image: fresh.imageUrl || item.image,
            };
          }
          return item;
        })
      );
    }
  }, [fetcher.data, isPreview]);

  // Live Mode: Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isPreview && isHydrated) {
      // Map back to format expected by other components (imageUrl vs image)
      const storageItems = cartItems.map((item) => ({
        ...item,
        imageUrl: item.image, // Ensure consistency
      }));
      localStorage.setItem('cart', JSON.stringify(storageItems));
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [cartItems, isHydrated, isPreview]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id || item.productId === Number(id) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id && item.productId !== Number(id)));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = isPreview ? 100 : 0; // Show shipping in preview, calc at checkout in live
  const total = subtotal + shipping;

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path === '/checkout') return `/store-template-preview/${templateId}/checkout`;
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  if (!isHydrated) {
    return <div className="min-h-screen" style={{ backgroundColor: colors.background }}></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center py-12"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center px-4">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.cardBg }}
          >
            <ShoppingCart className="w-10 h-10 opacity-30" style={{ color: colors.text }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
            Your Cart is Empty
          </h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: colors.muted }}>
            Looks like you haven't added anything to your cart yet. Browse our products and find
            something you love!
          </p>
          <Link
            to={getLink('/')}
            className="px-8 py-3 rounded-lg text-white font-medium inline-block transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>
          Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-sm"
                style={{ backgroundColor: colors.cardBg }}
              >
                {/* Image */}
                <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: colors.text }}>
                      {item.title}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm mt-1" style={{ color: colors.muted }}>
                        Variant: {item.variantName}
                      </p>
                    )}
                  </div>
                  <div className="font-bold mt-2 sm:mt-0" style={{ color: colors.accent }}>
                    {currencySymbol}
                    {item.price.toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-4 mt-2 sm:mt-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div
                    className="flex items-center border rounded-lg overflow-hidden"
                    style={{ borderColor: colors.muted + '40' }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                      style={{ color: colors.text }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      className="w-8 text-center font-medium text-sm"
                      style={{ color: colors.text }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                      style={{ color: colors.text }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div
              className="p-6 rounded-xl shadow-sm sticky top-24"
              style={{ backgroundColor: colors.cardBg }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between" style={{ color: colors.muted }}>
                  <span>Subtotal</span>
                  <span style={{ color: colors.text }}>
                    {currencySymbol}
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: colors.muted }}>
                  <span>Shipping Estimate</span>
                  <span style={{ color: colors.text }}>
                    {shipping > 0
                      ? `${currencySymbol}${shipping.toLocaleString()}`
                      : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-8" style={{ borderColor: colors.muted + '20' }}>
                <div className="flex justify-between items-end">
                  <span className="font-medium" style={{ color: colors.text }}>
                    Total
                  </span>
                  <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                    {currencySymbol}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                to={getLink('/checkout')}
                className="w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-xs text-center mt-4" style={{ color: colors.muted }}>
                Secure Checkout - 100% Money Back Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
