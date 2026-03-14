import { redirect, type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { Outlet, useLoaderData, useLocation } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { AccountSidebar } from '~/components/account/AccountSidebar';
import { AccountHeader } from '~/components/account/AccountHeader';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import {
  getWishlistCount,
  getAvailableCouponsCount,
  getCustomerProfile,
} from '~/services/customer-account.server';
import { products as productsTable } from '@db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

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
    const redirectTo = `${url.pathname}${url.search}`;
    return redirect(`/store/auth/login?redirectTo=${redirectTo}`);
  }

  // 3. Get unified settings (single source of truth)
  const db = createDb(env.DB);
  const unifiedSettings = await getUnifiedStorefrontSettings(db, store.id, { env: context.cloudflare.env });

  // Get theme from unified settings only (no legacy fallback)
  const templateId = unifiedSettings.theme.templateId || 'starter-store';
  const baseTheme = getStoreTemplateTheme(templateId);
  const theme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary,
    accent: unifiedSettings.theme.accent,
    background: unifiedSettings.theme.background,
    text: unifiedSettings.theme.text,
    muted: unifiedSettings.theme.muted,
  };

  // Social links from unified settings
  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? undefined,
    instagram: unifiedSettings.social.instagram ?? undefined,
    whatsapp: unifiedSettings.social.whatsapp ?? undefined,
    twitter: unifiedSettings.social.twitter ?? undefined,
    youtube: unifiedSettings.social.youtube ?? undefined,
    linkedin: unifiedSettings.social.linkedin ?? undefined,
  };

  // Business info from unified settings
  const businessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };

  // Theme config for StorePageWrapper
  const themeConfig = {
    primaryColor: unifiedSettings.theme.primary,
    accentColor: unifiedSettings.theme.accent,
    backgroundColor: unifiedSettings.theme.background,
    textColor: unifiedSettings.theme.text,
    storeName: unifiedSettings.branding.storeName,
    logo: unifiedSettings.branding.logo,
    tagline: unifiedSettings.branding.tagline,
  };

  // 5. Get Categories (Cached)
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
    getCustomerProfile(customerId, store.id, db),
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
      coupons: couponsCount,
    },
  });
}

export default function AccountLayout() {
  const { store, theme, templateId, socialLinks, businessInfo, categories, themeConfig, user } =
    useLoaderData<typeof loader>();
  const location = useLocation();

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
      config={null}
      hideHeaderFooter={true} // Using custom account header/footer for consistency
    >
      <div className="flex min-h-screen bg-slate-50/50 text-slate-800 transition-colors duration-200 font-sans antialiased selection:bg-primary/10 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed h-full z-20 w-64 p-4">
          <AccountSidebar user={{ name: user.name ?? undefined }} theme={theme} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          {/* Theme-Consistent Account Header */}
          <AccountHeader
            storeName={store.name}
            logo={store.logo}
            userName={user.name || 'Customer'}
            loyaltyTier={user.loyaltyTier || 'Member'}
            theme={theme}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            showMobileMenu={isMobileMenuOpen}
            categories={categories || []}
          />

          {/* Mobile Sidebar Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-72 border-r border-slate-200">
              <div className="p-4 h-full">
                <AccountSidebar user={{ name: user.name ?? undefined }} theme={theme} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 slide-in-from-bottom-2">
            <Outlet />
          </main>
        </div>
      </div>
    </StorePageWrapper>
  );
}
