import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { AccountSidebar } from '~/components/account/AccountSidebar';
import { AccountHeader } from '~/components/account/AccountHeader';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getWishlistCount, getAvailableCouponsCount, getCustomerProfile } from '~/services/customer-account.server';
import { products as productsTable } from '@db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '~/components/ui/sheet';

import { useTranslation } from '~/contexts/LanguageContext';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // 1. Resolve store
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }
  const { store } = storeContext;
  const env = context.cloudflare.env;

  // 2. Check Customer Session
  const customerId = await getCustomerId(request, env);

  if (!customerId) {
    const url = new URL(request.url);
    const redirectTo = url.pathname;
    return redirect(`/store/auth/login?redirectTo=${redirectTo}`);
  }

  // 3. Get Theme & Config
  const themeConfig = parseThemeConfig(store.themeConfig);
  const socialLinks = parseSocialLinks(store.socialLinks);
  const templateId = themeConfig?.storeTemplateId || 'tech-modern';

  // Use store theme color if set, otherwise fallback to template theme
  const theme = getStoreTemplateTheme(templateId);

  // 4. Parse Business Info
  let businessInfo = null;
  try {
    if (store.businessInfo) {
      businessInfo = JSON.parse(store.businessInfo as string);
    }
  } catch {
    // Ignore parse errors
  }

  // 5. Get Categories (Cached)
  const db = createDb(env.DB);
  const cache = new D1Cache(db);
  const categoriesCacheKey = `store:${store.id}:categories:v1`;
  let categories: string[] | null = await cache.get<string[]>(categoriesCacheKey);

  if (!categories) {
    const dbProducts = await db
      .select({ category: productsTable.category })
      .from(productsTable)
      .where(and(eq(productsTable.storeId, store.id), eq(productsTable.isPublished, true)))
      .orderBy(desc(productsTable.createdAt))
      .limit(50);

    categories = [...new Set(dbProducts.map((p) => p.category).filter(Boolean))] as string[];
    await cache.set(categoriesCacheKey, categories, 3600);
  }

  // 6. Get Counts for Sidebar (lightweight — only selects IDs)
  // Also get Customer Profile for Sidebar
  const [wishlistCount, couponsCount, customerProfile] = await Promise.all([
    getWishlistCount(customerId, store.id, db),
    getAvailableCouponsCount(store.id, db),
    getCustomerProfile(customerId, store.id, db)
  ]);

  return json({
    store,
    theme,
    templateId, // Pass generic templateId
    themeConfig, // Pass parsed config
    socialLinks,
    businessInfo,
    categories,
    user: customerProfile || { name: 'Guest' }, // Use real profile
    counts: {
      wishlist: wishlistCount,
      coupons: couponsCount
    }
  });
}

export default function AccountLayout() {
  const { store, theme, templateId, socialLinks, businessInfo, categories, themeConfig, user } =
    useLoaderData<typeof loader>();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <StorePageWrapper
      storeId={store.id}
      storeName={store.name}
      templateId={templateId}
      theme={theme}
      logo={store.logo}
      currency={store.currency || 'USD'}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      categories={categories}
      config={themeConfig}
      hideHeaderFooter={true} // Using custom account header/footer for consistency
    >
      <div className="flex min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200 font-display">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed h-full z-20">
          <AccountSidebar user={user} theme={theme} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          
          {/* Theme-Consistent Account Header */}
          <AccountHeader
            storeName={store.name}
            logo={store.logo}
            userName={user.name}
            loyaltyTier={user.loyaltyTier || 'Member'}
            theme={theme}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            showMobileMenu={isMobileMenuOpen}
          />

          {/* Mobile Sidebar Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-64 border-r border-slate-200">
              <AccountSidebar user={user} theme={theme} />
            </SheetContent>
          </Sheet>

          {/* Page Content */}
          <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </StorePageWrapper>
  );
}
