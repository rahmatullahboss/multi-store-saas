import { drizzle } from 'drizzle-orm/d1';
import { adminAuditLogs } from '@db/schema';

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
    await db.insert(adminAuditLogs).values({
      storeId: payload.storeId,
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
