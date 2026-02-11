import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, useLoaderData } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { AccountSidebar } from '~/components/account/AccountSidebar';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { products as productsTable } from '@db/schema';
import { desc, eq, and } from 'drizzle-orm';

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

  return json({
    store,
    theme,
    templateId, // Pass generic templateId
    themeConfig, // Pass parsed config
    socialLinks,
    businessInfo,
    categories,
  });
}

export default function AccountLayout() {
  const { store, theme, templateId, socialLinks, businessInfo, categories, themeConfig } =
    useLoaderData<typeof loader>();

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
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Sticky on desktop */}
            <aside className="lg:col-span-3 xl:col-span-3">
              <div className="lg:sticky lg:top-24 bg-card/80 backdrop-blur-xl rounded-2xl border shadow-lg shadow-black/5 overflow-hidden">
                <AccountSidebar />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-9 xl:col-span-9 min-h-[600px]">
              <div className="bg-card/80 backdrop-blur-xl rounded-2xl border shadow-lg shadow-black/5 p-6 lg:p-8 h-full">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </StorePageWrapper>
  );
}
