/**
 * Entry Server
 *
 * Handles server-side rendering and response generation.
 * Integrates remix-i18next for server-side translations.
 * Includes Sentry error tracking for production environments only.
 */
import { type EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import * as Sentry from '@sentry/remix';
import i18n from './i18n';
import i18next from './services/i18n.server';

// Import locale resources inline — Cloudflare Workers have no filesystem,
// so i18next-http-backend / node:path resolve() won't work.
import commonEn from '../public/locales/en/common.json';
import commonBn from '../public/locales/bn/common.json';
import dashboardEn from '../public/locales/en/dashboard.json';
import dashboardBn from '../public/locales/bn/dashboard.json';
import authEn from '../public/locales/en/auth.json';
import authBn from '../public/locales/bn/auth.json';
import settingsEn from '../public/locales/en/settings.json';
import settingsBn from '../public/locales/bn/settings.json';
import storefrontEn from '../public/locales/en/storefront.json';
import storefrontBn from '../public/locales/bn/storefront.json';
import adminEn from '../public/locales/en/admin.json';
import adminBn from '../public/locales/bn/admin.json';
import componentsEn from '../public/locales/en/components.json';
import componentsBn from '../public/locales/bn/components.json';
import landingEn from '../public/locales/en/landing.json';
import landingBn from '../public/locales/bn/landing.json';

// Sentry initialization is idempotent in Workers; avoid module-level state.

/**
 * Environment interface for Sentry initialization
 */
interface SentryEnv {
  SENTRY_DSN?: string;
  NODE_ENV?: string;
  ENVIRONMENT?: 'development' | 'production' | 'staging';
  CF_VERSION_METADATA?: { id?: string };
}

/**
 * Initialize Sentry only in production environments
 * Skips initialization in development and when DSN is not configured
 */
function initSentry(env: SentryEnv) {
  const environment = env.ENVIRONMENT || env.NODE_ENV || 'production';
  const isEnabled = environment !== 'development' && environment !== 'test';

  if (!isEnabled) {
    console.log('[Sentry] Skipped initialization - disabled environment:', environment);
    return;
  }

  if (!env.SENTRY_DSN) {
    console.log('[Sentry] Skipped initialization - SENTRY_DSN not configured');
    return;
  }

  try {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment,

      // Performance monitoring - 10% of transactions for production
      tracesSampleRate: 0.1,

      // Error sampling - capture 100% of errors
      sampleRate: 1.0,

      // Cloudflare-specific settings
      release: env.CF_VERSION_METADATA?.id || 'unknown',

      // Disable in local wrangler dev mode
      enabled: isEnabled,

      // BeforeSend to filter sensitive data
      beforeSend(event) {
        // Filter out PII (Personally Identifiable Information)
        if (event.request?.headers) {
          const headers = event.request.headers;
          delete headers['authorization'];
          delete headers['cookie'];
          delete headers['x-auth-token'];
        }

        // Add store context if available
        if (event.extra?.storeId) {
          const storeId = String(event.extra.storeId);
          event.tags = { ...event.tags, store_id: storeId };
        }

        return event;
      },
    });

    console.log('[Sentry] Successfully initialized:', { environment });
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: any
) {
  // Initialize Sentry on first request (production only)
  const { env } = loadContext.cloudflare;
  initSentry(env);

  // Create a new instance of i18next for this request
  const instance = createInstance();

  // Detect locale
  const lng = await i18next.getLocale(request);

  // Detect namespace
  const ns = i18next.getRouteNamespaces(remixContext);

  await instance.use(initReactI18next).init({
    ...i18n,
    lng,
    ns,
    // Inline resources — Workers have no filesystem for backend loading
    resources: {
      en: {
        common: commonEn,
        dashboard: dashboardEn,
        auth: authEn,
        settings: settingsEn,
        storefront: storefrontEn,
        admin: adminEn,
        components: componentsEn,
        landing: landingEn,
      },
      bn: {
        common: commonBn,
        dashboard: dashboardBn,
        auth: authBn,
        settings: settingsBn,
        storefront: storefrontBn,
        admin: adminBn,
        components: componentsBn,
        landing: landingBn,
      },
    },
  });

  try {
    const body = await renderToReadableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        signal: request.signal,
        onError(error: unknown) {
          // Log streaming rendering errors from inside the shell
          console.error('[SSR Error]', error);

          Sentry.captureException(error, {
            extra: {
              url: request.url,
              userAgent: request.headers.get('user-agent'),
            },
          });

          responseStatusCode = 500;
        },
      }
    );

    if (isbot(request.headers.get('user-agent') || '')) {
      await body.allReady;
    }

    responseHeaders.set('Content-Type', 'text/html');
    return new Response(body, {
      headers: responseHeaders,
      status: responseStatusCode,
    });
  } catch (error) {
    // Handle critical SSR failures
    console.error('[Critical SSR Error]', error);

    Sentry.captureException(error, {
      level: 'fatal',
      extra: {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
      },
    });

    throw error;
  }
}
