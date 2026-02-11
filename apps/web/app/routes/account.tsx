import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, useLoaderData, useLocation, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { AccountSidebar } from '~/components/account/AccountSidebar';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getCustomerWishlist, getAvailableCoupons } from '~/services/customer-account.server';
import { products as productsTable } from '@db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { Menu, Home, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '~/components/ui/sheet';

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

  // 6. Get Counts for Sidebar
  const [wishlist, coupons] = await Promise.all([
    getCustomerWishlist(customerId, store.id, db),
    getAvailableCoupons(store.id, db)
  ]);

  return json({
    store,
    theme,
    templateId, // Pass generic templateId
    themeConfig, // Pass parsed config
    socialLinks,
    businessInfo,
    categories,
    user: { name: 'Customer' }, // Placeholder
    counts: {
      wishlist: wishlist.length,
      coupons: coupons.length
    }
  });
}

export default function AccountLayout() {
  const { store, theme, templateId, socialLinks, businessInfo, categories, themeConfig } =
    useLoaderData<typeof loader>();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    // paths[0] is 'account'
    const currentSection = paths[1];
    
    let sectionName = t('accountOverview') || 'Overview';
    if (currentSection === 'orders') sectionName = t('orders') || 'Orders';
    if (currentSection === 'addresses') sectionName = t('addresses') || 'Addresses';
    if (currentSection === 'profile') sectionName = t('profile') || 'Profile';
    
    return (
      <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home') || 'Home'}</span>
        </Link>
        <ChevronRight className="w-4 h-4 mx-2 opacity-50 flex-shrink-0" />
        <span className="font-medium text-foreground">{t('myAccount') || 'My Account'}</span>
        {currentSection && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 opacity-50 flex-shrink-0" />
            <span className="font-medium text-foreground capitalize">{sectionName}</span>
          </>
        )}
      </nav>
    );
  };

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
    >
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
        {/* Account Header Background acting as a subtle hero */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-[--color-primary] to-[--color-accent] opacity-10 absolute top-0 left-0 right-0 z-0" />

        <div className="container-store relative z-10 py-8 md:py-12">
          {getBreadcrumbs()}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Navigation Trigger */}
            <div className="lg:hidden flex justify-between items-center bg-card border rounded-xl p-4 shadow-sm mb-4">
              <span className="font-semibold">{t('accountMenu') || 'Account Menu'}</span>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    {t('menu') || 'Menu'}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
                  <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle>{t('myAccount') || 'My Account'}</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">
                    <AccountSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* User Snapshot Card */}
                <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm p-6 text-center">
                   <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-4">
                     {/* Initials could ideally come from user data */}
                     {(t('customer') || 'C').charAt(0)}
                   </div>
                   <h3 className="font-bold text-lg">{t('welcomeBack') || 'Welcome Back'}</h3>
                   <p className="text-sm text-muted-foreground mt-1">{t('manageYourAccount') || 'Manage your account'}</p>
                </div>

                <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
                  <AccountSidebar />
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              <div className="bg-card/80 backdrop-blur-xl rounded-2xl border shadow-sm p-5 md:p-8 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </StorePageWrapper>
  );
}
