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
import { DarazPageWrapper, DARAZ_THEME } from '~/components/store-layouts/DarazPageWrapper';
import { BDShopPageWrapper, BDSHOP_THEME } from '~/components/store-layouts/BDShopPageWrapper';
import { GhorerBazarPageWrapper, GHORER_BAZAR_THEME } from '~/components/store-layouts/GhorerBazarPageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight } from 'lucide-react';

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
    themeConfig, // Return theme config to check for cart sections
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
    businessInfo,
    themeConfig 
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { t } = useTranslation();
  
  const isDarkTheme = storeTemplateId === 'modern-premium' || storeTemplateId === 'tech-modern';
  const isDaraz = storeTemplateId === 'daraz';
  const isBDShop = storeTemplateId === 'bdshop';
  const isGhorerBazar = storeTemplateId === 'ghorer-bazar';
  
  // Template-aware styling
  const cardBg = isDaraz 
    ? 'bg-white border-gray-200' 
    : isDarkTheme 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200';
  const textPrimary = isDaraz ? 'text-gray-800' : isDarkTheme ? 'text-white' : 'text-gray-900';
  const textMuted = isDaraz ? 'text-gray-500' : isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDaraz ? 'border-gray-200' : isDarkTheme ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDaraz ? 'bg-white border-gray-300' : isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
  
  // Use correct primary color based on template
  const primaryColor = isDaraz ? DARAZ_THEME.orange : theme.primary;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Cart content that will be wrapped by the appropriate wrapper
  let cartContent = (
    <>
      {/* Breadcrumb */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
            <Link to="/" className="text-gray-500 hover:text-orange-500 transition">Home</Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            <span className={textPrimary}>{t('cart')}</span>
          </div>
        </div>
      </nav>
      
      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 lg:py-12">
        <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${textPrimary} mb-4 md:mb-8`}>{t('yourCart')}</h1>
        
        {/* Cart items will be managed client-side and rendered here */}
        <div id="cart-container" className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4" id="cart-items">
            {/* Empty Cart Placeholder - items loaded client-side from localStorage */}
            <div className={`rounded-lg md:rounded-xl border ${cardBg} p-4 md:p-6 lg:p-8 text-center`}>
              <div 
                className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-3 md:mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" style={{ color: primaryColor }} />
              </div>
              <p className={`text-base md:text-lg font-medium ${textPrimary} mb-2`}>{t('cartEmpty')}</p>
              <p className={`${textMuted} text-sm md:text-base mb-4 md:mb-6`}>Add some products to get started!</p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium text-white text-sm md:text-base transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg md:rounded-xl border ${cardBg} p-4 md:p-6 sticky top-20 md:top-24`}>
              <h2 className={`text-base md:text-lg font-semibold ${textPrimary} mb-3 md:mb-4`}>{t('orderSummary')}</h2>
              
              <div className="space-y-2 md:space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={textMuted}>{t('subtotal')}</span>
                  <span className={`font-medium ${textPrimary}`} id="cart-subtotal">{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textMuted}>{t('shipping')}</span>
                  <span className={textMuted}>Calculated at checkout</span>
                </div>
                <div className={`border-t ${borderColor} pt-2 md:pt-3 flex justify-between`}>
                  <span className={`font-semibold ${textPrimary}`}>{t('total')}</span>
                  <span className={`font-bold text-base md:text-lg`} style={{ color: primaryColor }} id="cart-total">{formatPrice(0)}</span>
                </div>
              </div>
              
              <Link 
                to="/checkout"
                className="w-full mt-4 md:mt-6 inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 rounded-lg font-bold text-white text-sm md:text-base transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
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
              <div className={`mt-4 md:mt-6 pt-3 md:pt-4 border-t ${borderColor} space-y-1.5 md:space-y-2`}>
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
    </>
  );

  // Render with appropriate wrapper based on template
  if (isBDShop) {
    return (
      <BDShopPageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        pageTitle={t('cart')}
        showBreadcrumbBanner={true}
        breadcrumb={[{ label: t('cart') }]}
      >
        {cartContent}
      </BDShopPageWrapper>
    );
  }

  if (isGhorerBazar) {
    return (
      <GhorerBazarPageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
        pageTitle={t('cart')}
        showBreadcrumbBanner={true}
        breadcrumb={[{ label: t('cart') }]}
      >
        {cartContent}
      </GhorerBazarPageWrapper>
    );
  }

  if (isDaraz) {
    return (
      <DarazPageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      >
        {cartContent}
      </DarazPageWrapper>
    );
  // CHECK FOR DYNAMIC SECTIONS
  if (themeConfig?.cartSections && themeConfig.cartSections.length > 0) {
    const sectionProps = {
        theme: isDaraz ? DARAZ_THEME : (theme || {}),
        storeId,
        currency,
        storeName,
        businessInfo,
        socialLinks,
        store: {
          name: storeName,
          currency: currency,
          email: businessInfo?.email,
          phone: businessInfo?.phone,
          address: businessInfo?.address
        }
    };
    
    cartContent = (
      <SectionRenderer 
        sections={themeConfig?.cartSections || []}
        {...sectionProps}
      />
    );
  }

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
      {cartContent}
    </StorePageWrapper>
  );
}
}
