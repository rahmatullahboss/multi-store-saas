import type { Context, MiddlewareHandler } from 'hono';
import type { TenantContext, TenantEnv } from './tenant';

type WorkerTelemetryCategory = 'document' | 'api' | 'manifest' | 'asset' | 'other';

const TELEMETRY_PREFIX = 'telemetry:worker:v1';
const SAMPLE_RATE = 0.1; // 10% sampling to keep write cost low
const TTL_SECONDS = 60 * 60 * 24 * 3; // Keep 3 days of hourly buckets
const MAX_PATH_LENGTH = 120;

function toHourBucketUTC(date: Date): string {
  return date.toISOString().slice(0, 13).replace(/[-T:]/g, '');
}

function classifyPath(pathname: string): WorkerTelemetryCategory {
  if (pathname === '/__manifest' || pathname.startsWith('/__manifest?')) {
    return 'manifest';
  }
  if (pathname.startsWith('/api/')) {
    return 'api';
  }
  if (
    pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|map)$/.test(pathname)
  ) {
    return 'asset';
  }
  if (pathname === '/' || !pathname.includes('.')) {
    return 'document';
  }
  return 'other';
}

function shouldTrackHost(hostname: string, saasDomain: string): boolean {
  const host = hostname.split(':')[0].toLowerCase();
  if (!host || host === 'localhost' || host.startsWith('127.0.0.1')) return false;
  if (host === `app.${saasDomain}`) return false; // skip super admin app traffic
  return true;
}

function normalizeTelemetryPath(pathname: string): string {
  const noTrailingSlash = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const normalized = noTrailingSlash
    // UUIDs
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      ':id'
    )
    // Numeric IDs in route segments
    .replace(/\/\d+(?=\/|$)/g, '/:id');

  return normalized.slice(0, MAX_PATH_LENGTH);
}

async function incrementCounter(kv: KVNamespace, key: string): Promise<void> {
  const current = await kv.get(key);
  const next = (Number.parseInt(current ?? '0', 10) || 0) + 1;
  await kv.put(key, String(next), { expirationTtl: TTL_SECONDS });
}

export const workerTelemetryMiddleware = (): MiddlewareHandler<{
  Bindings: TenantEnv;
  Variables: TenantContext;
}> => {
  return async (c: Context<{ Bindings: TenantEnv; Variables: TenantContext }>, next) => {
    const requestPath = c.req.path;
    const method = c.req.method;

    if (method !== 'GET' || !c.env.STORE_CACHE) {
      return next();
    }

    const hostname = c.req.header('x-forwarded-host') || c.req.header('host') || '';
    const saasDomain = c.env.SAAS_DOMAIN || 'ozzyl.com';

    if (!shouldTrackHost(hostname, saasDomain)) {
      return next();
    }

    // Probabilistic sampling to reduce D1/KV write load and cost.
    if (Math.random() > SAMPLE_RATE) {
      return next();
    }

    const category = classifyPath(requestPath);
    const bucket = toHourBucketUTC(new Date());
    const storeId = c.get('storeId') as number | undefined;
    const storeKey = Number.isFinite(storeId) && storeId && storeId > 0 ? `s${storeId}` : 's0';
    const key = `${TELEMETRY_PREFIX}:${bucket}:${category}:${storeKey}`;

    c.executionCtx.waitUntil(incrementCounter(c.env.STORE_CACHE, key));

    // Keep a small endpoint-level sample for root-cause debugging in monitor UI.
    // Skip very high-cardinality asset/other paths to keep KV cost bounded.
    if (category === 'document' || category === 'api' || category === 'manifest') {
      const normalizedPath = normalizeTelemetryPath(requestPath);
      const encodedPath = encodeURIComponent(normalizedPath);
      const endpointKey = `${TELEMETRY_PREFIX}:endpoint:${bucket}:${storeKey}:${encodedPath}`;
      c.executionCtx.waitUntil(incrementCounter(c.env.STORE_CACHE, endpointKey));
    }

    return next();
  };
};

export const workerTelemetryConfig = {
  prefix: TELEMETRY_PREFIX,
  sampleRate: SAMPLE_RATE,
};
