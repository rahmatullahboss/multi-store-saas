/**
 * Ozzyl Guard — Public FDaaS API
 *
 * Route: /api/v1/fraud-check
 * Method: POST
 *
 * Fraud Detection as a Service for external merchants:
 * - WordPress / WooCommerce stores
 * - Shopify stores
 * - Custom e-commerce websites
 *
 * Authentication: Bearer API key (ozg_xxxxxxxxxxxxxxxx)
 *
 * Freemium model:
 *   free      → 100 checks/month
 *   starter   → 5,000 checks/month
 *   pro       → 50,000 checks/month
 *   enterprise→ unlimited
 *
 * Request body:
 * {
 *   "phone": "01712345678",          // BD phone number (required)
 *   "order_total": 1500,             // Order amount in BDT (optional)
 *   "payment_method": "cod",         // "cod" | "prepaid" (optional, default "cod")
 *   "shipping_address": "Dhaka...",  // Optional — improves scoring
 * }
 *
 * Response:
 * {
 *   "risk_score": 72,
 *   "risk_level": "high",
 *   "decision": "hold",
 *   "signals": [...],
 *   "quota": { "used": 45, "limit": 100, "plan": "free" }
 * }
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { createDb } from '~/lib/db.server';
import { fdaasApiKeys, fdaasUsageLog } from '@db/schema';
import { eq, sql } from 'drizzle-orm';
import {
  normalizePhone,
  isValidBDPhone,
  calculateRiskScore,
  getDecision,
  DEFAULT_FRAUD_SETTINGS,
} from '~/services/fraud-engine.server';

// ============================================================================
// PLAN LIMITS
// ============================================================================
const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  starter: 5000,
  pro: 50000,
  enterprise: 999999999,
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Hash a string with SHA-256 using the Web Crypto API (available in CF Workers).
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate and resolve an API key from the Authorization header.
 * Returns the key record or null if invalid/inactive/quota exceeded.
 */
type ApiKeySuccess = { record: typeof fdaasApiKeys.$inferSelect; error?: never; status?: never };
type ApiKeyError = { record?: never; error: string; status: number };
type ApiKeyResult = ApiKeySuccess | ApiKeyError;

async function resolveApiKey(
  authHeader: string | null,
  db: ReturnType<typeof createDb>
): Promise<ApiKeyResult> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing Authorization header. Use: Authorization: Bearer ozg_yourkey', status: 401 };
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith('ozg_') || rawKey.length < 20) {
    return { error: 'Invalid API key format. Keys must start with ozg_', status: 401 };
  }

  const keyHash = await sha256(rawKey);

  const record = await db
    .select()
    .from(fdaasApiKeys)
    .where(eq(fdaasApiKeys.keyHash, keyHash))
    .get();

  if (!record) {
    return { error: 'API key not found. Visit ozzyl.com to get your key.', status: 401 };
  }

  if (!record.isActive) {
    return { error: 'API key is suspended. Contact support@ozzyl.com', status: 403 };
  }

  // Monthly quota reset check
  const now = new Date();
  const lastReset = record.lastResetAt ? new Date(record.lastResetAt) : null;
  const needsReset =
    !lastReset ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear();

  if (needsReset) {
    // Reset counter for new month (non-blocking)
    db.update(fdaasApiKeys)
      .set({ callsThisMonth: 0, lastResetAt: now, updatedAt: now })
      .where(eq(fdaasApiKeys.id, record.id))
      .catch(() => {});
    record.callsThisMonth = 0;
  }

  // Quota check (enterprise = unlimited)
  if (record.plan !== 'enterprise' && record.callsThisMonth >= record.monthlyLimit) {
    return {
      error: `Monthly quota exceeded (${record.monthlyLimit} checks/month on ${record.plan} plan). Upgrade at ozzyl.com/guard`,
      status: 429,
    };
  }

  return { record };
}

// ============================================================================
// POST /api/v1/fraud-check
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const startMs = Date.now();

  // Only POST allowed
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
  }

  const db = createDb(context.cloudflare.env.DB);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  const keyResult = await resolveApiKey(authHeader, db);
  if ('error' in keyResult) {
    return json({ error: keyResult.error }, { status: keyResult.status });
  }
  const { record: apiKey } = keyResult;

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    phone?: string;
    order_total?: number;
    payment_method?: string;
    shipping_address?: string;
  };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { phone, order_total = 0, payment_method = 'cod', shipping_address } = body;

  // ── Validate phone ────────────────────────────────────────────────────────
  if (!phone || typeof phone !== 'string') {
    return json({ error: 'phone is required (e.g. "01712345678")' }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!isValidBDPhone(normalizedPhone)) {
    return json(
      { error: `Invalid Bangladesh phone number: ${phone}. Expected format: 01XXXXXXXXX` },
      { status: 400 }
    );
  }

  // ── Cloudflare edge signals ───────────────────────────────────────────────
  const callerIp = request.headers.get('CF-Connecting-IP') || undefined;
  const cfCountry = request.headers.get('CF-IPCountry') || undefined;
  const cfDeviceType = request.headers.get('CF-Device-Type') || undefined;
  const userAgent = request.headers.get('User-Agent') || undefined;

  // ── Run fraud score (no DB write — FDaaS uses a read-only view of signals) ─
  // We use a dedicated system store_id = 0 for FDaaS lookups.
  // This ensures cross-store signal data is available without leaking merchant data.
  let assessment;
  try {
    assessment = await calculateRiskScore({
      phone: normalizedPhone,
      storeId: 0, // FDaaS system store
      orderTotal: typeof order_total === 'number' ? order_total : 0,
      paymentMethod: payment_method,
      shippingAddress: shipping_address,
      db,
      skipExternalCheck: false, // Always run external courier check for FDaaS
      ipAddress: callerIp,
      cfCountry,
      cfDeviceType,
      userAgent,
    });
  } catch (err) {
    console.error('[FDAAS] Risk calculation failed:', err);
    return json({ error: 'Internal error during risk calculation. Please retry.' }, { status: 500 });
  }

  const decision = getDecision(assessment.clampedScore, DEFAULT_FRAUD_SETTINGS);
  const responseMs = Date.now() - startMs;

  // ── Phone hash for privacy-safe usage log ─────────────────────────────────
  const phoneHash = await sha256(normalizedPhone);

  // ── Update quota + log usage (non-blocking via waitUntil) ─────────────────
  context.cloudflare.ctx.waitUntil(
    (async () => {
      try {
        const now = new Date();
        // ── SECURITY: Use SQL expression for atomic increment to prevent
        // lost-update race conditions under concurrent requests.
        // Reading callsThisMonth at auth time and adding 1 later is non-atomic;
        // concurrent calls would overcount or miss increments (quota drift).
        await db
          .update(fdaasApiKeys)
          .set({
            callsThisMonth: sql`${fdaasApiKeys.callsThisMonth} + 1`,
            callsTotal: sql`${fdaasApiKeys.callsTotal} + 1`,
            lastUsedAt: now,
            updatedAt: now,
          })
          .where(eq(fdaasApiKeys.id, apiKey.id));

        await db.insert(fdaasUsageLog).values({
          apiKeyId: apiKey.id,
          phoneHash,
          riskScore: assessment.clampedScore,
          decision,
          responseMs,
          ipAddress: callerIp || null,
        });
      } catch (err) {
        console.error('[FDAAS] Usage logging failed:', err);
      }
    })()
  );

  // ── Build response ────────────────────────────────────────────────────────
  const riskLevelMap: Record<string, string> = {
    allow: 'low',
    verify: 'moderate',
    hold: 'high',
    block: 'critical',
  };

  return json(
    {
      phone: normalizedPhone,
      risk_score: assessment.clampedScore,
      risk_level: riskLevelMap[decision] || 'moderate',
      decision,
      signals: assessment.signals.map((s) => ({
        name: s.name,
        score: s.score,
        description: s.description,
      })),
      quota: {
        used: apiKey.callsThisMonth + 1,
        limit: apiKey.monthlyLimit,
        plan: apiKey.plan,
        resets: 'monthly',
      },
      meta: {
        response_ms: responseMs,
        powered_by: 'Ozzyl Guard — ozzyl.com/guard',
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(apiKey.monthlyLimit),
        'X-RateLimit-Remaining': String(Math.max(0, apiKey.monthlyLimit - apiKey.callsThisMonth - 1)),
        'Access-Control-Allow-Origin': '*', // CORS for external integrations
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    }
  );
}

// ============================================================================
// GET — API info / health check (no auth required)
// ============================================================================
export async function loader({ request }: LoaderFunctionArgs) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  return json({
    service: 'Ozzyl Guard — Fraud Detection API',
    version: 'v1',
    docs: 'https://ozzyl.com/docs/guard',
    signup: 'https://ozzyl.com/guard',
    plans: {
      free: '100 checks/month — no credit card required',
      starter: '5,000 checks/month — ৳999/month',
      pro: '50,000 checks/month — ৳4,999/month',
      enterprise: 'Unlimited — contact sales@ozzyl.com',
    },
    endpoint: 'POST /api/v1/fraud-check',
    auth: 'Authorization: Bearer ozg_yourkey',
    example_request: {
      phone: '01712345678',
      order_total: 1500,
      payment_method: 'cod',
      shipping_address: 'House 12, Road 5, Dhanmondi, Dhaka',
    },
  });
}

export default function () {}
