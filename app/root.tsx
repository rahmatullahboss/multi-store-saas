import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

import './styles/tailwind.css';
import { GeneralError } from '~/components/GeneralError';
import { LanguageProvider } from '~/contexts/LanguageContext';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { 
    rel: 'stylesheet', 
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&display=swap' 
  },
];


/**
 * Root Loader - Load store information for all pages
 * 
 * On main domain (digitalcare.site), store will be null.
 * This is expected for auth pages and marketing landing.
 */
export async function loader({ context }: LoaderFunctionArgs) {
  // The tenant middleware has already resolved the store
  // Access it from context (populated by Hono middleware)
  const { storeId, store, isCustomDomain } = context;
  
  // Handle main domain case where store is null (auth pages, marketing)
  return json({
    store: {
      id: storeId || 0,
      name: store?.name || 'Multi-Store SaaS',
      logo: store?.logo || null,
      theme: store?.theme || 'default',
      currency: store?.currency || 'BDT',
    },
    isCustomDomain: isCustomDomain || false,
    isMainDomain: !store || storeId === 0,
  });
}

export default function App() {
  const { store } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>{store.name}</title>
      </head>
      <body className="h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <LanguageProvider defaultCurrency={store.currency as 'USD' | 'BDT'}>
          <Outlet />
        </LanguageProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Root Error Boundary
 * 
 * Catches all unhandled errors at the application level.
 * Uses GeneralError component with isRootError=true to render
 * a full HTML document with inline critical CSS (since Tailwind
 * may not be loaded when an error occurs).
 * 
 * Error Types Handled:
 * - 404: Store Not Found / Page Not Found
 * - 500+: Server Error / Maintenance Mode
 * - Unknown: Generic error fallback
 */
export function ErrorBoundary() {
  const error = useRouteError();
  
  // GeneralError with isRootError=true wraps content in full HTML document
  // with inline critical CSS for styling without external stylesheets
  return <GeneralError error={error} isRootError={true} />;
}
