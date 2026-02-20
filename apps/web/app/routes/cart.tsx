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
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { eq, and, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, productVariants } from '@db/schema';
import { type ThemeConfig, type LandingConfig } from '@db/types';
import { type MVPSettingsWithTheme } from '~/config/mvp-theme-settings';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplate,
  getStoreTemplateTheme,
  resolveStoreTemplateId,
} from '~/templates/store-registry';
import { resolveStore } from '~/lib/store.server';
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight } from 'lucide-react';
import { getCustomer } from '~/services/customer-auth.server';
import { formatPrice } from '~/lib/theme-engine';
import { createDb } from '~/lib/db.server';
import {
  getUnifiedStorefrontSettings,
  getShippingConfigFromUnified,
} from '~/services/unified-storefront-settings.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Shopping Cart' }];
  }

  const metaTags = [
    { title: `Shopping Cart | ${data.storeName}` },
    { name: 'description', content: `View and manage your shopping cart at ${data.storeName}` },
    { name: 'robots', content: 'noindex, nofollow' }, // Cart pages shouldn't be indexed
  ];

  // Favicon support
  if (data.favicon) {
    metaTags.push({ tagName: 'link', rel: 'icon', href: data.favicon } as any);
    metaTags.push({ tagName: 'link', rel: 'shortcut icon', href: data.favicon } as any);
  }

  return metaTags;
};

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

  // Use unified settings
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Resolve template ID from unified settings
  const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';

  // Use socialLinks from unified settings (or legacy fallback)
  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? undefined,
    instagram: unifiedSettings.social.instagram ?? undefined,
    whatsapp: unifiedSettings.social.whatsapp ?? undefined,
    twitter: unifiedSettings.social.twitter ?? undefined,
    youtube: unifiedSettings.social.youtube ?? undefined,
    linkedin: unifiedSettings.social.linkedin ?? undefined,
  };

  // Use businessInfo from unified settings
  const businessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };

  // 5. Get Customer (if logged in)
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // 6. Get Categories (Cached)
  // NOTE: This part of the code was not fully provided in the instruction,
  // so I'm using the original category fetching logic to maintain functionality.
  // If D1Cache, collectionsTable, StoreCategory, and desc are new imports,
  // they would need to be added.
  const categoriesResult = await db
    .select({ category: products.category })
    .from(products)
    .where(and(eq(products.storeId, storeId as number), eq(products.isPublished, true)));

  const categories = [
    ...new Set(categoriesResult.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ];

  // Get shipping config directly from unified settings
  const unifiedShippingConfig = getShippingConfigFromUnified(unifiedSettings);

  // Build merged theme from unified settings (same as home page _index.tsx)
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const mergedTheme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary || baseTheme.primary,
    accent: unifiedSettings.theme.accent || baseTheme.accent,
  };

  // Build mvpSettings from unified settings
  const mvpSettings = {
    themeId: storeTemplateId,
    storeName: unifiedSettings.branding.storeName || storeData.name || 'Store',
    logo: unifiedSettings.branding.logo || storeData.logo || null,
    favicon: unifiedSettings.branding.favicon || storeData.favicon || null,
    primaryColor: unifiedSettings.theme.primary || baseTheme.primary,
    accentColor: unifiedSettings.theme.accent || baseTheme.accent,
    showAnnouncement: unifiedSettings.announcement.enabled,
    announcementText: unifiedSettings.announcement.text,
    headline: unifiedSettings.heroBanner?.slides?.[0]?.heading || 'Welcome to our store',
    ctaText: unifiedSettings.heroBanner?.slides?.[0]?.ctaText || 'Shop Now',
    shippingConfig: unifiedShippingConfig,
  };

  return json({
    storeId: storeId as number,
    storeName: unifiedSettings.branding.storeName || storeData.name || 'Store',
    logo: unifiedSettings.branding.logo || storeData.logo || null,
    favicon: unifiedSettings.branding.favicon || storeData.favicon || null,
    currency: storeData.currency || 'BDT',
    storeTemplateId,
    theme: mergedTheme,
    socialLinks,
    businessInfo,
    themeConfig: null, // No longer needed - using unified settings
    planType: storeData.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    categories,
    mvpSettings,
    isCustomerAiEnabled: Boolean(
      (storeData as { isCustomerAiEnabled?: boolean }).isCustomerAiEnabled
    ),
    aiCredits: Number((storeData as { aiCredits?: number }).aiCredits) || 0,
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

    if (typeof cartItemsJson !== 'string') {
      return json({ error: 'Invalid cart payload' }, { status: 400 });
    }

    try {
      const cartItems = JSON.parse(cartItemsJson) as Array<{
        productId: number;
        quantity: number;
        variantId?: number;
      }>;

      if (!Array.isArray(cartItems)) {
        return json({ error: 'Invalid cart payload' }, { status: 400 });
      }

      const normalizedItems = cartItems
        .filter((item) => Number.isFinite(item.productId) && Number.isFinite(item.quantity))
        .map((item) => ({
          productId: Number(item.productId),
          variantId: Number.isFinite(item.variantId) ? Number(item.variantId) : undefined,
          quantity: Math.max(0, Number(item.quantity)),
        }))
        .filter((item) => item.quantity > 0);

      if (normalizedItems.length === 0) {
        return json({ success: true, items: [] });
      }

      const storeContext = await resolveStore(context, request);
      if (!storeContext) {
        console.error('Cart validation error: store not found', {
          url: request.url,
        });
        return json({ error: 'Store not found' }, { status: 404 });
      }

      const { storeId } = storeContext;
      const db = drizzle(context.cloudflare.env.DB);

      // Fetch current product data
      const productIds = normalizedItems.map((item) => item.productId);
      const productData = await db
        .select({
          id: products.id,
          title: products.title,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          imageUrl: products.imageUrl,
          inventory: products.inventory,
          isPublished: products.isPublished,
        })
        .from(products)
        .where(and(eq(products.storeId, storeId), inArray(products.id, productIds)));

      const variantIds = [
        ...new Set(
          normalizedItems
            .map((item) => item.variantId)
            .filter((variantId): variantId is number => Number.isFinite(variantId))
        ),
      ];

      const variantData =
        variantIds.length > 0
          ? await db
              .select({
                id: productVariants.id,
                productId: productVariants.productId,
                option1Value: productVariants.option1Value,
                option2Value: productVariants.option2Value,
                option3Value: productVariants.option3Value,
                price: productVariants.price,
                inventory: productVariants.inventory,
                available: productVariants.available,
                imageUrl: productVariants.imageUrl,
                isAvailable: productVariants.isAvailable,
              })
              .from(productVariants)
              .where(inArray(productVariants.id, variantIds))
          : [];

      const variantMap = new Map(variantData.map((variant) => [variant.id, variant]));

      // Validate each cart item
      const validatedItems = normalizedItems.map((cartItem) => {
        const product = productData.find((p) => p.id === cartItem.productId);
        const variant = cartItem.variantId ? variantMap.get(cartItem.variantId) : undefined;

        if (!product || !product.isPublished) {
          return {
            ...cartItem,
            isValid: false,
            error: 'Product no longer available',
            removed: true,
          };
        }

        if (variant && variant.productId !== cartItem.productId) {
          return {
            ...cartItem,
            isValid: false,
            error: 'Variant mismatch',
            removed: true,
          };
        }

        const effectiveInventory = variant
          ? (variant.available ?? variant.inventory ?? 0)
          : (product.inventory ?? 0);

        if (effectiveInventory <= 0 || (variant && variant.isAvailable === false)) {
          return {
            ...cartItem,
            isValid: false,
            error: 'Out of stock',
            title: variant
              ? `${product.title} (${[variant.option1Value, variant.option2Value, variant.option3Value].filter(Boolean).join(' / ')})`
              : product.title,
            price: variant?.price ?? product.price,
            imageUrl: variant?.imageUrl || product.imageUrl,
          };
        }

        return {
          ...cartItem,
          isValid: true,
          title: variant
            ? `${product.title} (${[variant.option1Value, variant.option2Value, variant.option3Value].filter(Boolean).join(' / ')})`
            : product.title,
          price: variant?.price ?? product.price,
          compareAtPrice: product.compareAtPrice,
          imageUrl: variant?.imageUrl || product.imageUrl,
        };
      });

      return json({
        success: true,
        items: validatedItems,
        hasInvalidItems: validatedItems.some((item) => !item.isValid),
      });
    } catch (error) {
      console.error('Cart validation error:', error, {
        url: request.url,
      });
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
    categories,
    isCustomerAiEnabled,
    aiCredits,
    mvpSettings,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();

  // Cart state
  const [cartItems, setCartItems] = useState<
    Array<{
      productId: number;
      variantId?: number;
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

        // Validate cart items with server (debounced)
        if (items.length > 0) {
          const timeout = window.setTimeout(() => {
            const formData = new FormData();
            formData.append('intent', 'validate-cart');
            formData.append(
              'cartItems',
              JSON.stringify(
                items.map((item: { productId: number; variantId?: number; quantity: number }) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                }))
              )
            );

            fetcher.submit(formData, { method: 'post' });
          }, 1000);

          // Stop loading immediately after scheduling validation
          setIsLoading(false);
          return () => window.clearTimeout(timeout);
        }
      } catch {
        setCartItems([]);
      }
    }
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update localStorage when cart changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  interface CartActionData {
    success?: boolean;
    items?: Array<{
      removed?: boolean;
      productId: number;
      variantId?: number;
      quantity: number;
      title: string;
      price: number;
      imageUrl?: string | null;
      isValid?: boolean;
      error?: string;
    }>;
    error?: string;
  }

  // Handle server validation response
  useEffect(() => {
    const data = fetcher.data as CartActionData | undefined;
    if (data?.success && data.items) {
      const validatedItems = data.items.filter((item) => !item.removed);
      // We need to map back to the state shape if it differs, but here it looks compatible-ish
      // Actually state expects: productId, title, price, compareAtPrice, quantity, imageUrl
      // validatedItems has these.
      setCartItems(validatedItems as any);
    }
  }, [fetcher.data]);

  const updateQuantity = (
    productId: number,
    variantId: number | undefined,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && (item.variantId ?? null) === (variantId ?? null)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: number, variantId: number | undefined) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && (item.variantId ?? null) === (variantId ?? null))
      )
    );
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
        theme={theme as any}
        currency={currency}
        socialLinks={socialLinks || undefined}
        businessInfo={businessInfo || undefined}
        config={themeConfig as unknown as ThemeConfig}
        planType={planType}
        customer={customer || undefined}
        categories={categories}
        isCustomerAiEnabled={isCustomerAiEnabled}
        aiCredits={aiCredits}
        mvpSettings={mvpSettings}
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
              config={themeConfig}
              mvpSettings={mvpSettings}
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
              mvpSettings={mvpSettings}
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
  mvpSettings,
}: {
  items: Array<{
    productId: number;
    variantId?: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    quantity: number;
    imageUrl?: string | null;
  }>;
  currency: string;
  total: number;
  itemCount: number;
  onUpdateQuantity: (productId: number, variantId: number | undefined, quantity: number) => void;
  onRemoveItem: (productId: number, variantId: number | undefined) => void;
  isLoading: boolean;
  mvpSettings?: (LandingConfig & Partial<MVPSettingsWithTheme>) | null;
}) {
  const shippingConfig = mvpSettings?.shippingConfig;
  const shippingEnabled = shippingConfig?.enabled ?? true;
  const deliveryCharge = shippingEnabled ? (shippingConfig?.insideDhaka ?? 60) : 0;
  const freeShippingAbove =
    shippingConfig?.freeDeliveryAbove ?? shippingConfig?.freeShippingAbove ?? 0;

  const isFreeShipping = freeShippingAbove > 0 && total >= freeShippingAbove;
  const shipping = isFreeShipping ? 0 : deliveryCharge;

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
              key={`${item.productId}-${item.variantId ?? 'base'}`}
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
                      onClick={() =>
                        onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                      className="p-2 hover:bg-gray-100 transition"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      className="p-2 hover:bg-gray-100 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.productId, item.variantId)}
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
                <span className="text-[var(--color-accent)]">
                  {shipping === 0 ? 'Free' : formatPrice(shipping, currency)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total + shipping, currency)}</span>
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
