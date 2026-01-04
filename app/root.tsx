import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

import './styles/tailwind.css';

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
 * Error Boundary for the entire app
 */
export function ErrorBoundary() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Oops!</title>
      </head>
      <body className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We're sorry, but something unexpected happened.</p>
          <a href="/" className="btn btn-primary">
            Go back home
          </a>
        </div>
      </body>
    </html>
  );
}
