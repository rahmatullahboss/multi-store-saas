/**
 * Token-Protected Health Check Endpoint
 *
 * Route: GET /api/healthz
 *
 * Used by the post-deploy health monitoring runbook.
 * Requires HEALTH_CHECK_TOKEN header or ?token= query param.
 *
 * Reference: docs/HEALTH_MONITORING_RUNBOOK_2026-02-17.md
 * Reference: AGENTS.md - Post-Deploy Health Monitoring
 *
 * Usage:
 *   curl -H "x-health-token: <HEALTH_CHECK_TOKEN>" https://app.ozzyl.com/api/healthz
 */

import { type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
    kv: 'ok' | 'error';
    env: 'ok' | 'warning';
  };
  uptime_ms: number;
}

const START_TIME = Date.now();

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as any;

  // ── Auth: token required ──────────────────────────────────────────────────
  const HEALTH_CHECK_TOKEN = env.HEALTH_CHECK_TOKEN;

  if (!HEALTH_CHECK_TOKEN) {
    // If token not configured, block all access
    return json({ error: 'Health check not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const providedToken =
    request.headers.get('x-health-token') ||
    url.searchParams.get('token');

  if (providedToken !== HEALTH_CHECK_TOKEN) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Checks ────────────────────────────────────────────────────────────────
  const checks: HealthStatus['checks'] = {
    database: 'ok',
    kv: 'ok',
    env: 'ok',
  };

  // 1. Database check — lightweight ping
  try {
    const db = drizzle(env.DB);
    await db.run(sql`SELECT 1`);
  } catch {
    checks.database = 'error';
  }

  // 2. KV check — lightweight ping
  try {
    await env.KV.put('__healthz__', '1', { expirationTtl: 60 });
    const val = await env.KV.get('__healthz__');
    if (val !== '1') throw new Error('KV read mismatch');
  } catch {
    checks.kv = 'error';
  }

  // 3. Env check — required secrets present
  const requiredSecrets = ['JWT_SECRET', 'CRON_SECRET'];
  const missingSecrets = requiredSecrets.filter((key) => !env[key]);
  if (missingSecrets.length > 0) {
    checks.env = 'warning';
    console.warn(`[healthz] Missing secrets: ${missingSecrets.join(', ')}`);
  }

  // ── Determine overall status ──────────────────────────────────────────────
  const hasError = Object.values(checks).includes('error');
  const hasWarning = Object.values(checks).includes('warning');
  const status: HealthStatus['status'] = hasError
    ? 'down'
    : hasWarning
      ? 'degraded'
      : 'ok';

  const health: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
    uptime_ms: Date.now() - START_TIME,
  };

  const httpStatus = status === 'down' ? 503 : 200;

  return json(health, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
