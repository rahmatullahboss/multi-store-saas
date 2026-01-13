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
import { getFacebookPixelInitScript, getGA4InitScript, getGA4ScriptUrl } from '~/utils/tracking';
import i18nextServer from '~/services/i18n.server';
import { useChangeLanguage } from 'remix-i18next/react';
import { dir } from 'i18next';

export const links: LinksFunction = () => [
  // Critical font preloading for faster LCP
  { 
    rel: 'preload', 
    href: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { 
    rel: 'stylesheet', 
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&display=swap',
    // font-display:swap is already in the URL query param
  },
  { rel: 'manifest', href: '/manifest.webmanifest' },
];


/**
 * Root Loader - Load store information for all pages
 * 
 * On main domain (ozzyl.com), store will be null.
 * This is expected for auth pages and marketing landing.
 * 
 * Tracking IDs are loaded per-store for data isolation.
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  // The tenant middleware has already resolved the store
  // Access it from context (populated by Hono middleware)
  const { storeId, store, isCustomDomain } = context;
  
  // Get locale from request
  const locale = await i18nextServer.getLocale(request);

  // Handle main domain case where store is null (auth pages, marketing)
  return json({
    locale,
    store: {
      id: storeId || 0,
      name: store?.name || 'Ozzyl',
      logo: store?.logo || null,
      theme: store?.theme || 'default',
      currency: store?.currency || 'BDT',
      // Tracking IDs - each store has their own (data isolation)
      facebookPixelId: store?.facebookPixelId || null,
      googleAnalyticsId: store?.googleAnalyticsId || null,
    },
    isCustomDomain: isCustomDomain || false,
    isMainDomain: !store || storeId === 0,
    ENV: {
      VAPID_PUBLIC_KEY: context.cloudflare.env.VAPID_PUBLIC_KEY,
      SENTRY_DSN: context.cloudflare.env.SENTRY_DSN,
    },
    // Master Pixel for platform-wide audience aggregation
    masterPixelId: context.cloudflare.env.MASTER_FACEBOOK_PIXEL_ID || null,
  });
}

export default function App() {
  const { store, ENV, locale, masterPixelId } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);

  return (
    <html lang={locale} dir={dir(locale)} className="h-full" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>{store.name}</title>
        
        {/* Google Analytics 4 - Load gtag.js library */}
        {store.googleAnalyticsId && (
          <script async src={getGA4ScriptUrl(store.googleAnalyticsId)} />
        )}
        
        {/* Google Analytics 4 - Initialize */}
        {store.googleAnalyticsId && (
          <script
            dangerouslySetInnerHTML={{ __html: getGA4InitScript(store.googleAnalyticsId) }}
          />
        )}
        
        {/* Facebook Pixel - Conversion Tracking (Merchant + Master Pixel) */}
        {(store.facebookPixelId || masterPixelId) && (
          <script
            dangerouslySetInnerHTML={{ 
              __html: store.facebookPixelId 
                ? getFacebookPixelInitScript(store.facebookPixelId, masterPixelId)
                : getFacebookPixelInitScript(masterPixelId!, null) // Only master pixel if no merchant pixel
            }}
          />
        )}
        
        {/* Facebook Pixel - Noscript Fallback */}
        {(store.facebookPixelId || masterPixelId) && (
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${store.facebookPixelId || masterPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
      </head>
      <body className="h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <LanguageProvider defaultCurrency={store.currency as 'USD' | 'BDT'}>
          <Outlet />
        </LanguageProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
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
  
  // Capture the error in Sentry
  // @ts-ignore - Sentry types might not be perfectly resolved in this context without stricter check, but this is safe
  if (typeof window !== 'undefined' && 'Sentry' in window) {
      // (window as any).Sentry?.captureException(error);
  }
  // Better way: import * as Sentry from "@sentry/remix" and use it.
  // But wait, root.tsx is universal.
  
  // GeneralError with isRootError=true wraps content in full HTML document
  // with inline critical CSS for styling without external stylesheets
  return <GeneralError error={error} isRootError={true} />;
}
