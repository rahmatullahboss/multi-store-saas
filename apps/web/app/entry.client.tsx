/**
 * Entry Client
 *
 * Client-side hydration and initialization.
 * Includes Sentry error tracking for production environments only.
 */
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import { startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { getInitialNamespaces } from 'remix-i18next/client';
import i18n from './i18n';

// Import Sentry only if needed
let Sentry: typeof import('@sentry/remix') | null = null;

/**
 * Check if we're in a production environment
 * Based on hostname and window.ENV configuration
 */
function isProductionEnvironment(): boolean {
  // Check if window.ENV exists and has production indicators
  const env = (window as any).ENV;

  // If SENTRY_DSN is not configured, skip Sentry
  if (!env?.SENTRY_DSN) {
    return false;
  }

  // Check hostname - production deployments don't have localhost or dev domains
  const hostname = window.location.hostname;
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('.local') ||
    hostname.includes('wrangler') ||
    hostname.includes('dev');

  return !isLocal;
}

/**
 * Initialize Sentry for production environments only
 */
async function initSentry() {
  if (!isProductionEnvironment()) {
    console.log('[Sentry Client] Skipped - not production environment');
    return;
  }

  try {
    // Dynamic import to reduce initial bundle size in development
    Sentry = await import('@sentry/remix');

    const dsn = (window as any).ENV?.SENTRY_DSN;

    Sentry.init({
      dsn,
      environment: 'production',

      // Performance monitoring - 10% of transactions for cost efficiency
      tracesSampleRate: 0.1,

      // Browser tracing integration for route changes
      integrations: [
        Sentry.browserTracingIntegration({
          useEffect,
          useLocation,
          useMatches,
        }),
        Sentry.replayIntegration({
          maskAllText: false, // Don't mask all text (form inputs still masked)
          blockAllMedia: false, // Allow media but mask sensitive ones
        }),
      ],

      // Session replay settings
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of error sessions

      // BeforeSend to filter sensitive data
      beforeSend(event) {
        // Filter PII from request headers
        if (event.request?.headers) {
          const headers = event.request.headers;
          if (headers['authorization']) delete headers['authorization'];
          if (headers['cookie']) delete headers['cookie'];
          if (headers['x-auth-token']) delete headers['x-auth-token'];
        }

        return event;
      },
    });

    console.log('[Sentry Client] Successfully initialized');
  } catch (error) {
    console.error('[Sentry Client] Failed to initialize:', error);
  }
}

async function hydrate() {
  // Initialize Sentry after first paint to reduce blocking JS on initial load
  const runWhenIdle = (fn: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 1500);
    }
  };
  runWhenIdle(() => void initSentry());

  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
      ...i18n,
      ns: getInitialNamespaces(),
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['htmlTag'],
        caches: [],
      },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>
    );
  });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

hydrate();
