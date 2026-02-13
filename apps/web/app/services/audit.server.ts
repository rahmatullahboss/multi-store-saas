import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { adminAuditLogs, stores, users } from '@db/schema';

type AuditPayload = {
  storeId: number;
  actorId: number;
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

    await db.insert(adminAuditLogs).values({
      storeId: resolvedStoreId,
      actorId: payload.actorId,
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

  const actor = await db
    .select({ storeId: users.storeId })
    .from(users)
    .where(eq(users.id, payload.actorId))
    .limit(1);
  const actorStoreId = actor[0]?.storeId ?? null;
  if (actorStoreId && actorStoreId > 0) {
    return actorStoreId;
  }

  return null;
}
