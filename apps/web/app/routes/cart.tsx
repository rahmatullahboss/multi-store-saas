/**
 * Cart Page
 *
 * Template-aware shopping cart using the NEW template system.
 * Renders sections from published template via StoreSectionRenderer.
 */

import { useState, useEffect, Suspense } from 'react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { eq, and, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '@db/schema';
import { parseSocialLinks } from '@db/types';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplateTheme,
  getStoreTemplate,
  DEFAULT_STORE_TEMPLATE_ID,
} from '~/templates/store-registry';
import { StoreSectionRenderer } from '~/components/store/StoreSectionRenderer';
import { resolveTemplate, type CartContext } from '~/lib/template-resolver.server';
import { resolveStore } from '~/lib/store.server';
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight } from 'lucide-react';
import { DEFAULT_CART_SECTIONS } from '~/components/store-sections/registry';
import { getCustomer } from '~/services/customer-auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Use resolveStore for dev fallback support
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;

  // Route guard: Check if store routes are enabled
  if (store.storeEnabled === false) {
    throw new Response('Store mode is not enabled for this shop.', { status: 404 });
  }

  // Use store data directly from storeContext
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

  // Template resolution (NEW SYSTEM)
  const template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'cart');

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
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Use resolveStore for dev fallback support
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
  }, [fetcher.data]);

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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasTemplateSections = template?.sections && template.sections.length > 0;

  // Build RenderContext for sections (CartContext)
  const renderContext: CartContext = {
    kind: 'cart',
    shop: {
      name: storeName,
      currency,
      domain: '',
    },
    theme: template?.settings || {
      primaryColor: theme.primary,
      accentColor: theme.accent,
      backgroundColor: theme.background,
      textColor: theme.text,
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    currency,
    cart: {
      items: cart.map((item) => ({
        id: String(item.productId),
        productId: String(item.productId),
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || undefined,
        variantName: item.variantName,
      })),
      subtotal,
      total: subtotal, // Will add shipping in checkout
    },
  };

  // Get template definition
  const templateDef = getStoreTemplate(storeTemplateId);
  const CartPageComponent = templateDef.CartPage;

  return (
    <StorePageWrapper
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
      {/* If template has sections, prefer StoreSectionRenderer (legacy/custom sections) */}
      {hasTemplateSections ? (
        <StoreSectionRenderer sections={template!.sections} context={renderContext} />
      ) : CartPageComponent ? (
        // Use template-specific CartPage component
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <CartPageComponent theme={theme} />
        </Suspense>
      ) : (
        // Fallback: Default cart display (should not be reached if registry is correct)
        <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.background }}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>
              {t('shopping_cart')}
            </h1>
            {/* ... fallback UI ... */}
          </div>
        </div>
      )}
    </StorePageWrapper>
  );
}
