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

import './styles/tailwind.css';
import { GeneralError } from '~/components/GeneralError';
import { LanguageProvider } from '~/contexts/LanguageContext';
import i18nextServer from '~/services/i18n.server';
import { useChangeLanguage } from 'remix-i18next/react';
import { useEffect } from 'react';
import { parseThemeConfig } from '@db/types';

export const links: LinksFunction = () => [
  // DNS prefetch and preconnect for faster font loading
  { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
  { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
  { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'preconnect', href: 'https://images.unsplash.com', crossOrigin: 'anonymous' },
  // Preload fonts CSS for parallel download
  {
    rel: 'preload',
    as: 'style',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&display=swap',
  },
  { rel: 'manifest', href: '/manifest.webmanifest' },
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
  const themeConfig = store?.themeConfig ? parseThemeConfig(store.themeConfig as string) : null;
  const themeColor = themeConfig?.primaryColor || '#4f46e5';

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
      themeConfig: themeConfig || null,
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
 * Layout Component - Provides the base HTML document structure
 *
 * This is the recommended Remix pattern to prevent hydration mismatches.
 * The Layout wraps both the App component and ErrorBoundary.
 *
 * IMPORTANT: We use useTranslation() to get the current language from i18next
 * This ensures the <html lang> attribute matches between server and client.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  // Get the current language from i18next
  // This ensures consistency between server-rendered and client-hydrated HTML
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language} dir={i18n.dir()} className="h-full" suppressHydrationWarning>
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

  // This hook tells remix-i18next to change the language when the locale changes
  // It syncs the client-side i18next instance with the server-detected locale
  useChangeLanguage(locale);

  // Inject analytics scripts client-side to avoid hydration mismatches
  // These are dynamic and should not be server-rendered
  useEffect(() => {
    // Set window.ENV for client-side access
    (window as Window & { ENV?: typeof ENV }).ENV = ENV;

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
import * as Sentry from "@sentry/remix";

export function ErrorBoundary() {
  const error = useRouteError();

  // Capture the error in Sentry
  Sentry.captureException(error);

  // Layout wraps ErrorBoundary, so we don't need isRootError anymore
  // Just return the error content directly
  return <GeneralError error={error} isRootError={false} />;
}
