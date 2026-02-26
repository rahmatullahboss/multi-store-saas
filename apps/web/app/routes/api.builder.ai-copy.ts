/**
 * POST /api/builder/ai-copy
 *
 * Genie Mode 2.0 — Bengali Copy Generation Endpoint
 *
 * - Validates input with Zod
 * - Checks rate limit via AI_RATE_LIMIT KV (10 per store per hour)
 * - Calls generateBengaliCopy() from ai-copy.server.ts
 * - Returns structured GenieCopyResult JSON
 * - Auth: requireAuth() from ~/lib/auth.server
 */

import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { z } from 'zod';
import { requireAuth } from '~/lib/auth.server';
import {
  generateBengaliCopy,
  checkGenieRateLimit,
} from '~/lib/page-builder/ai-copy.server';
import type { GenieInput } from '~/lib/page-builder/ai-copy.server';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const GenieInputSchema = z.object({
  storeName: z.string().min(1, 'স্টোরের নাম আবশ্যক').max(100),
  industry: z.string().min(1, 'ইন্ডাস্ট্রি আবশ্যক').max(100),
  targetAudience: z.string().min(1, 'টার্গেট অডিয়েন্স আবশ্যক').max(200),
  goal: z.string().min(1, 'লক্ষ্য আবশ্যক').max(200),
  products: z
    .array(z.string().min(1).max(100))
    .min(0)
    .max(10)
    .default([]),
});

// ============================================================================
// LOADER — disallow GET
// ============================================================================

export async function loader(_args: LoaderFunctionArgs) {
  return json({ error: 'Method not allowed' }, { status: 405 });
}

// ============================================================================
// ACTION — POST /api/builder/ai-copy
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  // Only accept POST
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  // ── 1. Auth ───────────────────────────────────────────────────────────────
  let storeId: number;
  try {
    const { store } = await requireAuth(request, context);
    storeId = store.id;
  } catch {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = context.cloudflare.env;

  // ── 2. Validate input ─────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = GenieInputSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return json(
      {
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const validatedData = parseResult.data;

  // ── 3. Rate limit check ───────────────────────────────────────────────────
  if (env.AI_RATE_LIMIT) {
    const rateLimitResult = await checkGenieRateLimit(env.AI_RATE_LIMIT, storeId);
    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetAt * 1000).toISOString();
      return json(
        {
          success: false,
          error: `রেট লিমিট অতিক্রান্ত। প্রতি ঘন্টায় সর্বোচ্চ ${10} বার ব্যবহার করা যাবে।`,
          rateLimitExceeded: true,
          resetAt: rateLimitResult.resetAt,
          resetAtISO: resetDate,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.resetAt - Math.floor(Date.now() / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    // Attach rate limit headers for transparency
    const remaining = rateLimitResult.remaining;

    // ── 4. Generate copy ──────────────────────────────────────────────────────
    if (!env.AI) {
      // AI binding not available — return defaults
      const { generateBengaliCopy: gen } = await import('~/lib/page-builder/ai-copy.server');
      const genieInput: GenieInput = { ...validatedData, storeId };
      const { result, usedFallback } = await gen(genieInput, {
        run: async () => { throw new Error('AI binding not available'); },
      });

      return json(
        {
          success: true,
          data: result,
          usedFallback: true,
          model: 'template-defaults',
        },
        {
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    const genieInput: GenieInput = { ...validatedData, storeId };

    try {
      const { result, usedFallback, model } = await generateBengaliCopy(
        genieInput,
        env.AI as { run: (model: string, input: Record<string, unknown>) => Promise<unknown> }
      );

      return json(
        {
          success: true,
          data: result,
          usedFallback,
          model,
        },
        {
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    } catch (err) {
      console.error('[api.builder.ai-copy] generateBengaliCopy error:', err);
      return json(
        { success: false, error: 'কপি তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
        { status: 500 }
      );
    }
  }

  // ── No KV binding: proceed without rate limiting ──────────────────────────
  if (!env.AI) {
    const genieInput: GenieInput = { ...validatedData, storeId };
    const { result } = await generateBengaliCopy(genieInput, {
      run: async () => { throw new Error('AI binding not available'); },
    });
    return json({ success: true, data: result, usedFallback: true, model: 'template-defaults' });
  }

  const genieInput: GenieInput = { ...validatedData, storeId };
  try {
    const { result, usedFallback, model } = await generateBengaliCopy(
      genieInput,
      env.AI as { run: (model: string, input: Record<string, unknown>) => Promise<unknown> }
    );
    return json({ success: true, data: result, usedFallback, model });
  } catch (err) {
    console.error('[api.builder.ai-copy] error (no-KV path):', err);
    return json(
      { success: false, error: 'কপি তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}

export default function () {}
