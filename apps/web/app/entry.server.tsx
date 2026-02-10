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
import Backend from 'i18next-http-backend';
import * as Sentry from '@sentry/remix';
import i18n from './i18n';
import i18next from './services/i18n.server';
import { resolve } from 'node:path';

// Track if Sentry is initialized
let isSentryInitialized = false;

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
  // Skip if already initialized or not production
  if (isSentryInitialized) return;

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

    isSentryInitialized = true;
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
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
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

          // Capture in Sentry if in production
          if (isSentryInitialized) {
            Sentry.captureException(error, {
              extra: {
                url: request.url,
                userAgent: request.headers.get('user-agent'),
              },
            });
          }

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

    if (isSentryInitialized) {
      Sentry.captureException(error, {
        level: 'fatal',
        extra: {
          url: request.url,
          userAgent: request.headers.get('user-agent'),
        },
      });
    }

    throw error;
  }
}
