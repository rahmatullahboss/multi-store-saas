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

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { 
    rel: 'stylesheet', 
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' 
  },
];

/**
 * Root Loader - Load store information for all pages
 */
export async function loader({ context }: LoaderFunctionArgs) {
  // The tenant middleware has already resolved the store
  // Access it from context (populated by Hono middleware)
  const { storeId, store, isCustomDomain, cloudflare } = context;
  
  return json({
    store: {
      id: storeId,
      name: store?.name || 'Store',
      logo: store?.logo,
      theme: store?.theme || 'default',
      currency: store?.currency || 'USD',
    },
    isCustomDomain,
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
        <Outlet />
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
