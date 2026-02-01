/**
 * Cart Page - MVP Simple Theme System
 *
 * Uses the old React Component System (legacy templates)
 * instead of Shopify OS 2.0 section-based system.
 *
 * Each template provides a CartPage component for cart display.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { useState, useEffect, Suspense } from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '@db/schema';
import { parseSocialLinks } from '@db/types';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplateTheme,
  getStoreTemplate,
  DEFAULT_STORE_TEMPLATE_ID,
} from '~/templates/store-registry';
import { resolveStore } from '~/lib/store.server';
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight } from 'lucide-react';
import { getCustomer } from '~/services/customer-auth.server';
import { formatPrice } from '~/lib/theme-engine';
import { createDb } from '~/lib/db.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;

  // Route guard: Check if store routes are enabled
  if (store.storeEnabled === false) {
    throw new Response('Store mode is not enabled for this shop.', { status: 404 });
  }

  const storeData = store;
  const db = createDb(context.cloudflare.env.DB);

  // Parse theme
  let themeConfig = null;
  try {
    if (storeData.themeConfig) {
      themeConfig = JSON.parse(storeData.themeConfig as string);
    }
  } catch {
    // Ignore parse errors
  }

  let businessInfo = null;
  try {
    if (storeData.businessInfo) {
      businessInfo = JSON.parse(storeData.businessInfo as string);
    }
  } catch {
    // Ignore parse errors
  }

  const storeTemplateId =
    themeConfig?.storeTemplateId || (storeData.theme as string) || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  const socialLinks = parseSocialLinks(storeData.socialLinks as string | null);

  // Load customer session
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // Merge themeConfig colors with template theme
  const mergedTheme = {
    ...theme,
    primary: themeConfig?.primaryColor || theme.primary,
    accent: themeConfig?.accentColor || theme.accent,
  };

  return json({
    storeId: storeId as number,
    storeName: storeData?.name || 'Store',
    logo: storeData?.logo || null,
    currency: storeData?.currency || 'BDT',
    storeTemplateId,
    theme: mergedTheme,
    socialLinks,
    businessInfo,
    themeConfig,
    planType: storeData?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'validate-cart') {
    const cartItemsJson = formData.get('cartItems');

    if (!cartItemsJson) {
      return json({ success: true, items: [] });
    }

    try {
      const cartItems = JSON.parse(cartItemsJson as string) as Array<{
        productId: number;
        quantity: number;
      }>;

      const storeContext = await resolveStore(context, request);
      if (!storeContext) {
        return json({ error: 'Store not found' }, { status: 404 });
      }

      const { storeId } = storeContext;
      const db = drizzle(context.cloudflare.env.DB);

      // Fetch current product data
      const productIds = cartItems.map((item) => item.productId);
      const productData = await db
        .select({
          id: products.id,
          title: products.title,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          imageUrl: products.imageUrl,
          stockStatus: products.stockStatus,
          isPublished: products.isPublished,
        })
        .from(products)
        .where(and(eq(products.storeId, storeId), inArray(products.id, productIds)));

      // Validate each cart item
      const validatedItems = cartItems.map((cartItem) => {
        const product = productData.find((p) => p.id === cartItem.productId);

        if (!product || !product.isPublished) {
          return {
            ...cartItem,
            isValid: false,
            error: 'Product no longer available',
            removed: true,
          };
        }

        if (product.stockStatus === 'out_of_stock') {
          return {
            ...cartItem,
            isValid: false,
            error: 'Out of stock',
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
          };
        }

        return {
          ...cartItem,
          isValid: true,
          title: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          imageUrl: product.imageUrl,
        };
      });

      return json({
        success: true,
        items: validatedItems,
        hasInvalidItems: validatedItems.some((item) => !item.isValid),
      });
    } catch (error) {
      console.error('Cart validation error:', error);
      return json({ error: 'Failed to validate cart' }, { status: 500 });
    }
  }

  return json({ error: 'Unknown intent' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CartPage() {
  const {
    storeId,
    storeName,
    logo,
    currency,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    planType,
    customer,
  } = useLoaderData<typeof loader>();

  const { t } = useTranslation();
  const fetcher = useFetcher<typeof action>();

  // Cart state
  const [cartItems, setCartItems] = useState<
    Array<{
      productId: number;
      title: string;
      price: number;
      compareAtPrice?: number | null;
      quantity: number;
      imageUrl?: string | null;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        setCartItems(items);

        // Validate cart items with server
        if (items.length > 0) {
          const formData = new FormData();
          formData.append('intent', 'validate-cart');
          formData.append(
            'cartItems',
            JSON.stringify(
              items.map((item: { productId: number; quantity: number }) => ({
                productId: item.productId,
                quantity: item.quantity,
              }))
            )
          );

          fetcher.submit(formData, { method: 'post' });
        }
      } catch {
        setCartItems([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Handle server validation response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.items) {
      const validatedItems = fetcher.data.items.filter(
        (item: { removed?: boolean }) => !item.removed
      );
      setCartItems(validatedItems);
    }
  }, [fetcher.data]);

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get template
  const template = getStoreTemplate(storeTemplateId);
  const CartPageComponent = template.CartPage;

  // Generate CSS variables for MVP colors
  const cssVariables = `
    :root {
      --color-primary: ${theme.primary};
      --color-accent: ${theme.accent};
      --color-text: ${theme.text};
      --color-muted: ${theme.muted};
      --color-background: ${theme.background};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <StorePageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        templateId={storeTemplateId}
        theme={theme}
        currency={currency}
        socialLinks={socialLinks || undefined}
        businessInfo={businessInfo || undefined}
        config={themeConfig || undefined}
        planType={planType}
        customer={customer || undefined}
      >
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          {CartPageComponent ? (
            <CartPageComponent
              items={cartItems}
              currency={currency}
              total={cartTotal}
              itemCount={cartItemCount}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              isLoading={isLoading}
              storeName={storeName}
              theme={theme}
            />
          ) : (
            <SimpleCartPage
              items={cartItems}
              currency={currency}
              total={cartTotal}
              itemCount={cartItemCount}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              isLoading={isLoading}
            />
          )}
        </Suspense>
      </StorePageWrapper>
    </>
  );
}

// ============================================================================
// SIMPLE CART PAGE (Fallback)
// ============================================================================
function SimpleCartPage({
  items,
  currency,
  total,
  itemCount,
  onUpdateQuantity,
  onRemoveItem,
  isLoading,
}: {
  items: Array<{
    productId: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    quantity: number;
    imageUrl?: string | null;
  }>;
  currency: string;
  total: number;
  itemCount: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added any items yet.</p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
        >
          Continue Shopping
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              {/* Product Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-semibold text-[var(--color-primary)]">
                    {formatPrice(item.price, currency)}
                  </span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(item.compareAtPrice, currency)}
                    </span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-[var(--color-accent)]">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>

            <a
              href="/checkout"
              className="block w-full py-3 px-4 bg-[var(--color-primary)] text-white text-center font-medium rounded-lg hover:opacity-90 transition"
            >
              Proceed to Checkout
            </a>

            <a
              href="/products"
              className="block w-full mt-3 py-3 px-4 border border-gray-300 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{error.status}</h1>
          <p className="text-gray-600 mb-2">{error.statusText}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
