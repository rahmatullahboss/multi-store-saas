/**
 * API: Create a new store for an already-registered user
 *
 * Used when a merchant deletes their store and wants to create a new one
 * from within the dashboard — without going through the full onboarding flow.
 *
 * POST /api/create-store-for-existing-user
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { getUserId, getSession, commitSession, completeGoogleOnboardingForExistingUser } from '~/services/auth.server';

const CreateStoreSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers and hyphens'),
  phone: z.string().min(11, 'Valid Bangladeshi phone number required').max(15),
});

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // CSRF guard: reject requests not originating from our own app
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  const saasDomain = (context.cloudflare.env as unknown as Record<string, string>).SAAS_DOMAIN || 'ozzyl.com';
  const allowedOrigins = [`https://app.${saasDomain}`, `https://${saasDomain}`];
  const isValidOrigin = allowedOrigins.some((allowed) => origin.startsWith(allowed));
  if (!isValidOrigin) {
    console.error('[create-store] CSRF check failed. Origin:', origin);
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit: max 3 store creation attempts per IP per 10 minutes
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `create-store:ip:${ip}`;
  const kv = (context.cloudflare.env as unknown as Record<string, KVNamespace>).KV;
  if (kv) {
    const current = await kv.get(rateLimitKey);
    const count = current ? parseInt(current, 10) : 0;
    if (count >= 3) {
      return json({ error: 'Too many requests. Please try again in 10 minutes.' }, { status: 429 });
    }
    await kv.put(rateLimitKey, String(count + 1), { expirationTtl: 600 });
  }

  // Must be logged in
  const userId = await getUserId(request, context.cloudflare.env);
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Verify user exists and has no active store
  const userRow = await db
    .select({ id: users.id, storeId: users.storeId, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow[0]) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // If user already has an active store, reject
  if (userRow[0].storeId) {
    const existingStore = await db
      .select({ id: stores.id, isActive: stores.isActive, deletedAt: stores.deletedAt })
      .from(stores)
      .where(eq(stores.id, userRow[0].storeId))
      .limit(1);

    if (existingStore[0] && existingStore[0].isActive && existingStore[0].deletedAt == null) {
      return json({ error: 'You already have an active store' }, { status: 400 });
    }
  }

  // Parse and validate input
  let body: Record<string, unknown>;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = CreateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.errors[0].message, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { storeName, subdomain, phone } = parsed.data;

  // Use existing completeGoogleOnboardingForExistingUser which handles:
  // - subdomain uniqueness check
  // - store creation
  // - linking store to user
  // Re-read user immediately before creation to reduce TOCTOU race window
  const freshUser = await db
    .select({ storeId: users.storeId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (freshUser[0]?.storeId) {
    return json({ error: 'A store already exists for your account. Please refresh.' }, { status: 409 });
  }

  // Pre-check: if user's own phone matches the submitted phone, skip phone_taken check
  // (completeGoogleOnboardingForExistingUser checks phone uniqueness globally, which would
  // incorrectly flag the current user's own existing phone as taken)
  const submittedPhone = phone || userRow[0].phone || '';
  const userOwnPhone = userRow[0].phone;
  const phoneIsOwnNumber = userOwnPhone && userOwnPhone === submittedPhone;

  // If phone is their own number, check only subdomain, then create store directly
  const result = await completeGoogleOnboardingForExistingUser({
    userId,
    phone: submittedPhone,
    storeName,
    subdomain: subdomain.toLowerCase(),
    db: context.cloudflare.env.DB,
  });

  if (!result.success) {
    if (result.error === 'subdomain_taken') {
      return json({ error: `Subdomain "${subdomain}" is already taken. Please choose another.`, field: 'subdomain' }, { status: 400 });
    }
    if (result.error === 'phone_taken' && phoneIsOwnNumber) {
      // This is the user's own phone — not actually a conflict. This shouldn't normally happen
      // since completeGoogleOnboardingForExistingUser should handle this. Log and retry.
      console.error('[create-store-for-existing-user] phone_taken on own phone — unexpected. userId:', userId);
      return json({ error: 'Failed to create store due to a data conflict. Please contact support.' }, { status: 500 });
    }
    if (result.error === 'phone_taken') {
      return json({ error: 'This phone number is already registered to another account.', field: 'phone' }, { status: 400 });
    }
    if (result.error === 'already_has_store' || (result.error || '').includes('UNIQUE constraint failed')) {
      return json({ error: 'A store was already created for your account. Please refresh the page.' }, { status: 409 });
    }
    console.error('[create-store-for-existing-user] Failed:', result.error);
    return json({ error: result.error || 'Failed to create store' }, { status: 500 });
  }

  const newStoreId = result.storeId!;
  console.warn(`[create-store-for-existing-user] New store ${newStoreId} created for user ${userId}`);

  // Update session with new storeId
  const session = await getSession(request, context.cloudflare.env);
  session.set('storeId', newStoreId);

  return json(
    { success: true, storeId: newStoreId },
    { headers: { 'Set-Cookie': await commitSession(session, context.cloudflare.env) } }
  );
}
