/**
 * Cart Page
 *
 * Shopify OS 2.0 Theme System - Uses ThemeStoreRenderer exclusively
 * for dynamic section rendering with the new theme engine.
 */

import { useState, useEffect, Suspense } from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
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
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';
import { resolveTemplate } from '~/lib/template-resolver.server';
import { resolveStore } from '~/lib/store.server';
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight } from 'lucide-react';
import { getCustomer } from '~/services/customer-auth.server';
import { formatPrice } from '~/lib/theme-engine';

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

  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  const socialLinks = parseSocialLinks(storeData.socialLinks as string | null);

  // Load customer session
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // Template resolution (Shopify OS 2.0)
  let template = null;
  let homeTemplate = null;
  try {
    template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'cart');

    // If no cart template, get home template for header/footer consistency
    if (!template || !template.sections || template.sections.length === 0) {
      homeTemplate = await resolveTemplate(context.cloudflare.env.DB, storeId, 'home');
    }
  } catch (templateError) {
    console.error('[cart] Template resolution failed:', templateError);
  }

  return json({
    storeId: storeId as number,
    storeName: storeData?.name || 'Store',
    logo: storeData?.logo || null,
    currency: storeData?.currency || 'BDT',
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    planType: storeData?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    template,
    homeTemplate, // For header/footer fallback
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const { storeId } = storeContext;
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const productIds = formData.get('productIds');

  if (!productIds) {
    return json({ products: [] });
  }

  const ids = JSON.parse(productIds as string) as number[];

  if (ids.length === 0) {
    return json({ products: [] });
  }

  // Fetch fresh product data
  const cartProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId as number), inArray(products.id, ids)));

  return json({ products: cartProducts });
}

// ============================================================================
// CART ITEM TYPE
// ============================================================================
interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  variantName?: string;
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
    template,
    homeTemplate,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const fetcher = useFetcher<{
    products: Array<{ id: number; title: string; price: number; imageUrl: string | null }>;
  }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart) as CartItem[];
        setCart(items);

        // Fetch fresh product data
        if (items.length > 0) {
          const productIds = items.map((item) => item.productId);
          fetcher.submit({ productIds: JSON.stringify(productIds) }, { method: 'post' });
        }
      } catch {
        // Ignore parse errors
      }
    }
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update cart with fresh prices
  useEffect(() => {
    if (fetcher.data?.products && cart.length > 0) {
      const productMap = new Map(fetcher.data.products.map((p) => [p.id, p]));
      setCart((prev) =>
        prev.map((item) => {
          const fresh = productMap.get(item.productId);
          if (fresh) {
            return { ...item, price: fresh.price, title: fresh.title, imageUrl: fresh.imageUrl };
          }
          return item;
        })
      );
    }
  }, [fetcher.data, cart.length]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [cart, isHydrated]);

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const hasTemplateSections = template?.sections && template.sections.length > 0;
  const hasHomeTemplate = homeTemplate?.sections && homeTemplate.sections.length > 0;
  const useThemeSections = hasTemplateSections || hasHomeTemplate;

  // Get template definition
  const templateDef = getStoreTemplate(storeTemplateId);
  const CartPageComponent = templateDef.CartPage;

  // Render cart content
  const renderCartContent = () => {
    // If template has CartPage component (legacy templates), use it
    if (CartPageComponent) {
      return (
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <CartPageComponent theme={theme} />
        </Suspense>
      );
    }

    // If template has sections, use ThemeStoreRenderer (Shopify OS 2.0)
    if (hasTemplateSections && template?.sections) {
      return (
        <ThemeStoreRenderer
          themeId={storeTemplateId}
          sections={template.sections.map((s) => ({
            id: s.id,
            type: s.type,
            settings: s.props || {},
            blocks:
              s.blocks?.map((b) => ({
                id: b.id,
                type: b.type,
                settings: b.props || {},
              })) || [],
            enabled: s.enabled,
          }))}
          store={{
            id: storeId,
            name: storeName,
            currency,
            logo,
            defaultLanguage: 'en',
            socialLinks,
            businessInfo,
          }}
          pageType="cart"
          cart={{
            items: cart.map((item) => ({
              id: item.productId,
              productId: item.productId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl || undefined,
            })),
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            total: subtotal,
          }}
          skipHeaderFooter={false}
        />
      );
    }

    // If no cart template but home template exists, use home template's header/footer
    if (hasHomeTemplate && homeTemplate?.sections) {
      // Extract header and footer sections from home template
      // Note: Only include header, NOT announcement-bar (keep banner only on homepage)
      const headerSections = homeTemplate.sections.filter((s) => s.type === 'header');
      const footerSections = homeTemplate.sections.filter((s) => s.type === 'footer');

      // Combine: header + cart content (as pseudo-sections) + footer
      const combinedSections = [
        ...headerSections.map((s) => ({
          id: s.id,
          type: s.type,
          settings: s.props || {},
          blocks:
            s.blocks?.map((b) => ({
              id: b.id,
              type: b.type,
              settings: b.props || {},
            })) || [],
          enabled: s.enabled,
        })),
        // Cart items section
        {
          id: 'cart-items-fallback',
          type: 'cart-items',
          settings: {},
          blocks: [],
          enabled: true,
        },
        // Cart summary section
        {
          id: 'cart-summary-fallback',
          type: 'cart-summary',
          settings: {},
          blocks: [],
          enabled: true,
        },
        ...footerSections.map((s) => ({
          id: s.id,
          type: s.type,
          settings: s.props || {},
          blocks:
            s.blocks?.map((b) => ({
              id: b.id,
              type: b.type,
              settings: b.props || {},
            })) || [],
          enabled: s.enabled,
        })),
      ];

      return (
        <ThemeStoreRenderer
          themeId={storeTemplateId}
          sections={combinedSections}
          store={{
            id: storeId,
            name: storeName,
            currency,
            logo,
            defaultLanguage: 'en',
          }}
          pageType="cart"
          cart={{
            items: cart.map((item) => ({
              id: item.productId,
              productId: item.productId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl || undefined,
            })),
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            total: subtotal,
          }}
          skipHeaderFooter={false}
        />
      );
    }

    // Fallback: Default cart display
    return (
      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.background }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>
            {t('shopping_cart')}
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Start Shopping <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-lg font-bold" style={{ color: theme.primary }}>
                      {formatPrice(item.price, currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-8 p-6 bg-white rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Subtotal</span>
                  <span className="text-2xl font-bold" style={{ color: theme.primary }}>
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <a
                  href="/checkout"
                  className="block w-full py-3 text-center rounded-lg font-semibold text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  Proceed to Checkout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <StorePageWrapper
      hideHeaderFooter={useThemeSections}
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      planType={planType}
      customer={customer}
      config={themeConfig}
    >
      {renderCartContent()}
    </StorePageWrapper>
  );
}
