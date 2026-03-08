import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';

import tailwindStyles from './styles/tailwind.css?url';
import { GeneralError } from '~/components/GeneralError';
import { LanguageProvider } from '~/contexts/LanguageContext';
import i18nextServer from '~/services/i18n.server';
import { useChangeLanguage } from 'remix-i18next/react';
import { useEffect, useState } from 'react';

export const links: LinksFunction = () => [
  { rel: 'preload', href: tailwindStyles, as: 'style' },
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
  { rel: 'preconnect', href: 'https://images.unsplash.com', crossOrigin: 'anonymous' },
  { rel: 'dns-prefetch', href: 'https://o4509758332141568.ingest.de.sentry.io' },
  {
    rel: 'preconnect',
    href: 'https://o4509758332141568.ingest.de.sentry.io',
    crossOrigin: 'anonymous',
  },
  { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
  { rel: 'preconnect', href: 'https://www.googletagmanager.com', crossOrigin: 'anonymous' },
  { rel: 'dns-prefetch', href: 'https://connect.facebook.net' },
  { rel: 'preconnect', href: 'https://connect.facebook.net', crossOrigin: 'anonymous' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
  // WebMCP Script
  { rel: 'module', href: 'https://esm.sh/@jason.today/webmcp@latest' },
];

/**
 * Default Meta - Provides fallback title for all pages
 * Child routes can override this with their own meta exports
 */
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const storeName = data?.store?.name || 'Ozzyl';
  const themeColor = data?.store?.themeColor || '#4f46e5';
  return [
    { title: storeName },
    { name: 'description', content: `Welcome to ${storeName}` },
    { name: 'theme-color', content: themeColor },
  ];
};

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

  // Use unified settings for theme color - no longer reading legacy themeConfig
  const themeColor = '#4f46e5'; // Default, will be overridden by unified settings in routes

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
      // Using unified settings in routes - no legacy themeConfig in root
      themeConfig: null,
      themeColor,
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

/**
 * SSR-safe language detection for components outside I18nextProvider.
 * Unlike useTranslation(), this won't crash if the i18n context is missing.
 */
function useI18nLanguageSafe(): { lang: string; dir: string } {
  // react-i18next stores the i18n instance on the module-level default export.
  // During SSR, the I18nextProvider may not have wrapped this component yet,
  // but the instance itself is initialized in entry.server.tsx before rendering.
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { i18n } = useTranslation();
    return { lang: i18n.language || 'en', dir: i18n.dir?.() || 'ltr' };
  } catch {
    return { lang: 'en', dir: 'ltr' };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, dir } = useI18nLanguageSafe();

  return (
    <html lang={lang} dir={dir} className="h-full" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { store, ENV, locale, masterPixelId } = useLoaderData<typeof loader>();
  const [webMcpLoaded, setWebMcpLoaded] = useState(false);

  // This hook tells remix-i18next to change the language when the locale changes
  // It syncs the client-side i18next instance with the server-detected locale
  useChangeLanguage(locale);

  // Initialize WebMCP
  useEffect(() => {
    const initWebMCP = async () => {
      try {
        // @ts-expect-error - External CDN module
        const WebMCP = (await import('https://esm.sh/@jason.today/webmcp@latest')).default;

        const mcp = new WebMCP({
          color: '#4F46E5', // Ozzyl brand color
          position: 'bottom-right',
          size: '48px',
          padding: '12px',
        });

        // Register e-commerce tools
        mcp.registerTool('getStoreInfo', 'Get current store information', {}, function () {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    name: store.name,
                    id: store.id,
                    currency: store.currency,
                    theme: store.theme,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        });

        mcp.registerTool(
          'getAnalyticsSummary',
          'Get store analytics summary (orders, revenue, customers)',
          {},
          function () {
            return {
              content: [
                {
                  type: 'text',
                  text: `📊 Analytics Summary for ${store.name}

• Store ID: ${store.id}
• Currency: ${store.currency}
• Theme: ${store.theme}

🔗 Connected Services:
• Google Analytics: ${store.googleAnalyticsId ? 'Yes' : 'No'}
• Facebook Pixel: ${store.facebookPixelId ? 'Yes' : 'No'}`,
                },
              ],
            };
          }
        );

        mcp.registerTool(
          'getQuickActions',
          'Get available quick actions for store management',
          {},
          function () {
            return {
              content: [
                {
                  type: 'text',
                  text: `⚡ Quick Actions for ${store.name}:

1. 📦 Products - Add/Edit products
2. 🛒 Orders - View & manage orders  
3. 👥 Customers - Customer management
4. 🎨 Themes - Customize store appearance
5. 📱 Settings - Store configuration

Navigate to /app to access the admin dashboard.`,
                },
              ],
            };
          }
        );

        mcp.registerTool(
          'searchProducts',
          'Search products in the store',
          {
            query: { type: 'string', description: 'Search query for products' },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          function (args: any) {
            // This is a demo - in real implementation would call API
            return {
              content: [
                {
                  type: 'text',
                  text: `🔍 Search results for "${args.query}":

Demo mode: Product search would return results from your store.

To search products:
1. Go to /app/products
2. Use the search bar
3. Filter by category, price, status`,
                },
              ],
            };
          }
        );

        mcp.registerTool(
          'getOrderStatus',
          'Get status of recent orders',
          {
            limit: { type: 'number', description: 'Number of orders to show (default 5)' },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          function (args: any) {
            const limit = args.limit || 5;
            return {
              content: [
                {
                  type: 'text',
                  text: `📦 Recent Orders (last ${limit}):

Demo mode: Recent orders would appear here.

To view orders:
1. Go to /app/orders
2. View order details
3. Update fulfillment status

Order statuses: Pending → Processing → Shipped → Delivered`,
                },
              ],
            };
          }
        );

        setWebMcpLoaded(true);
        console.log('✅ WebMCP initialized for', store.name);
      } catch (error) {
        console.error('❌ WebMCP failed to load:', error);
      }
    };

    initWebMCP();
  }, [store]);

  // Inject analytics scripts client-side to avoid hydration mismatches
  // These are dynamic and should not be server-rendered
  useEffect(() => {
    const runWhenIdle = (fn: () => void) => {
      if (typeof window === 'undefined') return;
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(fn, { timeout: 2000 });
      } else {
        setTimeout(fn, 1500);
      }
    };

    runWhenIdle(() => {
      // Google Analytics 4
      if (store.googleAnalyticsId) {
        // Load gtag.js
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${store.googleAnalyticsId}`;
        document.head.appendChild(gaScript);

        // Initialize GA4
        const gaInitScript = document.createElement('script');
        gaInitScript.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${store.googleAnalyticsId}');
        `;
        document.head.appendChild(gaInitScript);
      }

      // Facebook Pixel
      const pixelId = store.facebookPixelId || masterPixelId;
      if (pixelId) {
        const fbScript = document.createElement('script');
        fbScript.textContent = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          ${
            store.facebookPixelId && masterPixelId && store.facebookPixelId !== masterPixelId
              ? `fbq('init', '${masterPixelId}');`
              : ''
          }
          fbq('track', 'PageView');
        `;
        document.head.appendChild(fbScript);
      }
    });
  }, [store.googleAnalyticsId, store.facebookPixelId, masterPixelId, ENV]);

  return (
    <LanguageProvider defaultCurrency={store.currency as 'USD' | 'BDT'}>
      <Outlet />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
          className: 'text-sm',
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`,
        }}
      />
    </LanguageProvider>
  );
}

/**
 * Root Error Boundary
 *
 * Catches all unhandled errors at the application level.
 * The Layout component wraps the ErrorBoundary, providing the
 * HTML document structure. We just render the error content.
 *
 * Error Types Handled:
 * - 404: Store Not Found / Page Not Found
 * - 500+: Server Error / Maintenance Mode
 * - Unknown: Generic error fallback
 */
// @sentry/remix is externalized from SSR (Workers don't support its browser/Node APIs).
// Client-side Sentry is initialised in entry.client.tsx via dynamic import.
// During SSR we use a no-op so ErrorBoundary rendering never crashes.
const SentryStub = {
  captureException: (() => {}) as (...args: unknown[]) => void,
};

export function ErrorBoundary() {
  const error = useRouteError();

  // Capture the error in Sentry (no-op during SSR, real on client)
  SentryStub.captureException(error);

  // Layout wraps ErrorBoundary, so we don't need isRootError anymore
  // Just return the error content directly
  return <GeneralError error={error} isRootError={false} />;
}
