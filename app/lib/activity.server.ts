/**
 * Activity Logging Utility
 * 
 * Logs user actions to the activity_logs table for audit trail.
 */

import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { activityLogs } from '@db/schema';

// Re-export client-safe utilities
export { getActionLabel, getActionColor } from './activity';

export type ActivityAction =
  | 'staff_invited'
  | 'staff_removed'
  | 'invite_accepted'
  | 'invite_revoked'
  | 'order_created'
  | 'order_updated'
  | 'order_cancelled'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'settings_updated'
  | 'discount_created'
  | 'discount_updated'
  | 'discount_deleted';

export type EntityType =
  | 'staff'
  | 'invite'
  | 'order'
  | 'product'
  | 'settings'
  | 'discount';

interface LogActivityParams {
  storeId: number;
  userId?: number | null;
  action: ActivityAction;
  entityType?: EntityType;
  entityId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an activity to the activity_logs table
 */
export async function logActivity(
  db: DrizzleD1Database,
  params: LogActivityParams
): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      storeId: params.storeId,
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break main flow
    console.error('Failed to log activity:', error);
  }
}
