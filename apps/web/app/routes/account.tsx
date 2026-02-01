import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Outlet, useLoaderData } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import { AccountSidebar } from '~/components/account/AccountSidebar';
import { parseThemeConfig } from '@db/types';

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

  // 3. Get Theme
  const themeConfig = parseThemeConfig(store.themeConfig);
  const templateId = themeConfig?.storeTemplateId || 'tech-modern';
  
  // Use store theme color if set, otherwise fallback to template theme
  const theme = getStoreTemplateTheme(templateId);

  return json({
    store,
    theme,
    templateId, // Pass generic templateId
    themeConfig, // Pass parsed config
  });
}

export default function AccountLayout() {
  const { store, theme, templateId } = useLoaderData<typeof loader>();

  return (
    <StorePageWrapper 
      storeId={store.id}
      storeName={store.name}
      templateId={templateId} 
      theme={theme}
      logo={store.logo}
      currency={store.currency || 'USD'}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-3 lg:col-span-2">
            <AccountSidebar />
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-9 lg:col-span-10 min-h-[500px]">
            <div className="bg-card rounded-lg border shadow-sm p-6 h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </StorePageWrapper>
  );
}
