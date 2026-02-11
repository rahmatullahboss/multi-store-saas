import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { AccountSidebar } from '~/components/account/AccountSidebar';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getWishlistCount, getAvailableCouponsCount, getCustomerProfile } from '~/services/customer-account.server';
import { products as productsTable } from '@db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { Menu, Search, Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';

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
      hideHeaderFooter={true} // We are building a custom dashboard layout
    >
      <div className="flex min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200 font-display">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed h-full z-20">
          <AccountSidebar user={user} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          
          {/* Top Header */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r border-slate-200 dark:border-slate-700">
                  <AccountSidebar user={user} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-700 rounded-lg px-4 py-2 w-96 border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search className="h-5 w-5 text-slate-400" />
              <input 
                className="bg-transparent border-none outline-none text-sm w-full ml-3 text-slate-700 dark:text-slate-200 placeholder-slate-400" 
                placeholder={t('searchProducts') || "Search products..."} 
                type="text" 
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
              </button>
              
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-600 pl-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.loyaltyTier || 'Member'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-300">
                  <User className="h-6 w-6" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </StorePageWrapper>
  );
}
