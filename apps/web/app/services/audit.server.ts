import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { adminAuditLogs, stores, users } from '@db/schema';

/** Discriminates who or what triggered an audited action. Added in 0096. */
export type AuditActorType = 'user' | 'api_key' | 'system' | 'webhook';

type AuditPayload = {
  storeId: number;
  /**
   * ID of the user who performed the action.
   * For non-user actors (api_key, system, webhook), pass 0 as a sentinel value
   * and set actorType + actorName to identify the actor in logs.
   */
  actorId: number;
  /**
   * Who triggered this action. Defaults to 'user' for backwards compatibility.
   * - 'user'    → a logged-in merchant/admin (actorId must be a valid users.id)
   * - 'api_key' → an external API key (WooCommerce, Shopify, custom)
   * - 'system'  → cron job or background worker (e.g. courier-sync, ai-agent)
   * - 'webhook' → incoming webhook handler (e.g. wc/order.created)
   */
  actorType?: AuditActorType;
  /**
   * Human-readable display label for the actor. Persisted at write time so
   * the audit log remains readable even after user deletion or key rotation.
   * - 'user'    → users.email resolved automatically if omitted
   * - 'api_key' → e.g. "My WooCommerce Store (ak_••••abcd)"
   * - 'system'  → e.g. "cron/courier-sync"
   * - 'webhook' → e.g. "wc/order.created"
   */
  actorName?: string;
  action: string;
  resource: string;
  resourceId?: string | number;
  diff?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Log a critical admin action to the immutable audit trail.
 * This should be used for all sensitive operations (create/update/delete).
 *
 * For system/api_key/webhook actors (added in 0096_audit_actor_field.sql):
 *   await logAuditAction(env, {
 *     storeId: store.id,
 *     actorId: 0,                        // sentinel — no users row
 *     actorType: 'api_key',
 *     actorName: 'My WooCommerce Store (ak_••••abcd)',
 *     action: 'wc_order_sync',
 *     resource: 'order',
 *     resourceId: wcOrderId,
 *   });
 */
export async function logAuditAction(env: Env, payload: AuditPayload) {
  const db = drizzle(env.DB);

  try {
    const resolvedStoreId = await resolveAuditStoreId(db, payload);
    if (!resolvedStoreId) {
      console.warn(
        `[AUDIT SKIP] Could not resolve valid store_id for action: ${payload.action}`,
        payload
      );
      return;
    }

    const actorType = payload.actorType ?? 'user';

    // Resolve actorName: for 'user' actors with no explicit name, look up email.
    // For system/api_key/webhook actors, actorName should be supplied by caller.
    let actorName = payload.actorName ?? null;
    if (!actorName && actorType === 'user' && payload.actorId > 0) {
      const actor = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, payload.actorId))
        .limit(1);
      actorName = actor[0]?.email ?? null;
    }

    await db.insert(adminAuditLogs).values({
      storeId: resolvedStoreId,
      actorId: payload.actorId,
      actorType,
      actorName,
      action: payload.action,
      resource: payload.resource,
      resourceId: payload.resourceId?.toString(),
      diff: payload.diff ? JSON.stringify(payload.diff) : null,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
  } catch (error) {
    console.error(`[AUDIT FAIL] Failed to log action: ${payload.action}`, error);
    // We intentionally don't throw here to prevent blocking the main action,
    // but in a strict enterprise env, you might want to throw.
  }
}

async function resolveAuditStoreId(
  db: ReturnType<typeof drizzle>,
  payload: AuditPayload
): Promise<number | null> {
  const candidateStoreIds = new Set<number>();

  if (Number.isInteger(payload.storeId) && payload.storeId > 0) {
    candidateStoreIds.add(payload.storeId);
  }

  if (payload.resource === 'store' && payload.resourceId !== undefined) {
    const resourceStoreId = Number(payload.resourceId);
    if (Number.isInteger(resourceStoreId) && resourceStoreId > 0) {
      candidateStoreIds.add(resourceStoreId);
    }
  }

  for (const storeId of candidateStoreIds) {
    const store = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1);
    if (store[0]?.id) {
      return storeId;
    }
  }

  if (payload.actorId > 0) {
    const actor = await db
      .select({ storeId: users.storeId })
      .from(users)
      .where(eq(users.id, payload.actorId))
      .limit(1);
    const actorStoreId = actor[0]?.storeId ?? null;
    if (actorStoreId && actorStoreId > 0) {
      return actorStoreId;
    }
  }

  return null;
}
