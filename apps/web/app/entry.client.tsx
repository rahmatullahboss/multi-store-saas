/**
 * Entry Client
 *
 * Client-side hydration and initialization.
 * Includes Sentry error tracking for production + staging (disabled in dev/test).
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
const CHUNK_RECOVERY_KEY = 'ozzyl:chunk-recovery-attempted';

function isDynamicImportFetchError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch dynamically imported module') ||
    normalized.includes('importing a module script failed')
  );
}

function recoverFromChunkLoadFailure(): boolean {
  // Prevent infinite reload loops: only one forced recovery per tab session.
  if (sessionStorage.getItem(CHUNK_RECOVERY_KEY) === '1') {
    sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
    return false;
  }

  sessionStorage.setItem(CHUNK_RECOVERY_KEY, '1');
  const url = new URL(window.location.href);
  url.searchParams.set('__chunk_reload', String(Date.now()));
  window.location.replace(url.toString());
  return true;
}

/**
 * Check if we're in a production environment
 * Based on hostname and window.ENV configuration
 */
function getSentryEnvironment(): string | null {
  const env = (window as any).ENV;
  if (!env?.SENTRY_DSN) return null;

  const environment = env?.ENVIRONMENT || env?.NODE_ENV || 'production';
  if (environment === 'development' || environment === 'test') return null;

  // Extra safety: skip obvious local/dev hosts even if env is misconfigured.
  const hostname = window.location.hostname;
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.includes('.local') ||
    hostname.includes('wrangler') ||
    hostname.includes('dev');
  if (isLocal) return null;

  return environment;
}

/**
 * Initialize Sentry for production + staging (disabled for local dev/test)
 */
async function initSentry() {
  const environment = getSentryEnvironment();
  if (!environment) {
    console.log('[Sentry Client] Skipped - disabled environment');
    return;
  }

  try {
    // Dynamic import to reduce initial bundle size in development
    Sentry = await import('@sentry/remix');

    const dsn = (window as any).ENV?.SENTRY_DSN;

    Sentry.init({
      dsn,
      environment,

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
  // Clear any previous recovery marker once app bootstrap starts successfully.
  sessionStorage.removeItem(CHUNK_RECOVERY_KEY);

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

window.addEventListener('error', (event) => {
  if (isDynamicImportFetchError(event.error || event.message)) {
    const recovered = recoverFromChunkLoadFailure();
    if (recovered) {
      event.preventDefault();
    }
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (isDynamicImportFetchError(event.reason)) {
    const recovered = recoverFromChunkLoadFailure();
    if (recovered) {
      event.preventDefault();
    }
  }
});

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
