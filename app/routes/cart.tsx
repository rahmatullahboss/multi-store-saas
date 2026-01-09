/**
 * Cart Page
 * 
 * Template-aware shopping cart with local state and checkout flow.
 * Uses StorePageWrapper for consistent template styling.
 * Fires InitiateCheckout tracking event when proceeding to checkout.
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { eq, and, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, stores, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks, type ThemeConfig, type SocialLinks } from '@db/types';
import { useTranslation } from '~/contexts/LanguageContext';
import { trackingEvents } from '~/utils/tracking';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';

export async function loader({ context }: LoaderFunctionArgs) {
  const { store, storeId, cloudflare } = context;
  
  if (!store || !storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(cloudflare.env.DB);
  
  // Fetch store details for template config
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId as number))
    .limit(1);
  
  const storeData = storeResult[0] as Store | undefined;
  
  const themeConfig = parseThemeConfig(storeData?.themeConfig as string | null);
  const socialLinks = parseSocialLinks(storeData?.socialLinks as string | null);
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  
  // Parse businessInfo safely
  let businessInfo: { phone?: string; email?: string; address?: string } | null = null;
  try {
    if (storeData?.businessInfo) {
      businessInfo = JSON.parse(storeData.businessInfo as string);
    }
  } catch {
    // Ignore parse errors
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
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, cloudflare } = context;
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'get-products') {
    // Get product details for cart items
    const productIds = formData.get('productIds')?.toString().split(',').map(Number) || [];
    
    if (productIds.length === 0) {
      return json({ products: [] });
    }
    
    const db = drizzle(cloudflare.env.DB);
    const cartProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId as number),
          inArray(products.id, productIds)
        )
      );
    
    return json({ products: cartProducts });
  }
  
  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function Cart() {
  const { 
    storeId,
    storeName, 
    logo,
    currency, 
    storeTemplateId, 
    theme,
    socialLinks,
    businessInfo 
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { t } = useTranslation();
  
  const isDarkTheme = storeTemplateId === 'modern-premium' || storeTemplateId === 'tech-modern';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Template-aware styling
  const cardBg = isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';

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
    >
      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-8`}>{t('yourCart')}</h1>
        
        {/* Cart items will be managed client-side and rendered here */}
        <div id="cart-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" id="cart-items">
            {/* Empty Cart Placeholder - items loaded client-side from localStorage */}
            <div className={`rounded-xl border ${cardBg} p-6 sm:p-8 text-center`}>
              <div 
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <ShoppingBag className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
              <p className={`text-lg font-medium ${textPrimary} mb-2`}>{t('cartEmpty')}</p>
              <p className={`${textMuted} mb-6`}>Add some products to get started!</p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: theme.primary }}
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border ${cardBg} p-6 sticky top-24`}>
              <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>{t('orderSummary')}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={textMuted}>{t('subtotal')}</span>
                  <span className={`font-medium ${textPrimary}`} id="cart-subtotal">{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMuted}>{t('shipping')}</span>
                  <span className={textMuted}>Calculated at checkout</span>
                </div>
                <div className={`border-t ${borderColor} pt-3 flex justify-between`}>
                  <span className={`font-semibold ${textPrimary}`}>{t('total')}</span>
                  <span className={`font-bold text-lg`} style={{ color: theme.primary }} id="cart-total">{formatPrice(0)}</span>
                </div>
              </div>
              
              <Link 
                to="/checkout"
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: theme.primary }}
                onClick={() => {
                  // Fire InitiateCheckout tracking event (FB Pixel + GA4)
                  // Note: value and numItems computed client-side from localStorage
                  trackingEvents.initiateCheckout(0, 0, currency);
                  console.log('[Tracking] InitiateCheckout event fired');
                }}
              >
                {t('proceedToCheckout')}
              </Link>
              
              {/* Trust Badges */}
              <div className={`mt-6 pt-4 border-t ${borderColor} space-y-2`}>
                <p className={`text-xs ${textMuted} flex items-center gap-2`}>
                  🔒 Secure checkout
                </p>
                <p className={`text-xs ${textMuted} flex items-center gap-2`}>
                  🚚 Fast delivery
                </p>
                <p className={`text-xs ${textMuted} flex items-center gap-2`}>
                  ↩️ Easy returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client-side cart logic */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const cartCount = document.getElementById('cart-count');
          
          if (cartCount) {
            const total = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = total.toString();
          }
          
          // More cart rendering logic would go here
        })();
      `}} />
    </StorePageWrapper>
  );
}
