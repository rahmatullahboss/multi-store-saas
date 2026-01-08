/**
 * Admin Audit Log Service
 * 
 * Tracks all Super Admin actions for accountability and security.
 */

import { drizzle } from 'drizzle-orm/d1';
import { adminAuditLogs } from '@db/schema';

export type AuditAction = 
  | 'store_suspend' 
  | 'store_unsuspend' 
  | 'store_delete' 
  | 'store_restore'
  | 'store_impersonate'
  | 'payment_approve'
  | 'payment_reject'
  | 'domain_approve'
  | 'domain_reject'
  | 'ai_approve'
  | 'ai_reject'
  | 'coupon_create'
  | 'coupon_delete'
  | 'broadcast_send'
  | 'plan_change'
  | 'bulk_action'
  | 'other';

export type TargetType = 'store' | 'user' | 'payment' | 'domain' | 'coupon' | 'broadcast' | 'other';

interface LogAuditParams {
  db: D1Database;
  adminId: number;
  action: AuditAction;
  targetType?: TargetType;
  targetId?: number;
  targetName?: string;
  details?: Record<string, unknown>;
  request?: Request;
}

/**
 * Log an admin action to the audit trail
 */
export async function logAdminAction({
  db,
  adminId,
  action,
  targetType,
  targetId,
  targetName,
  details,
  request,
}: LogAuditParams): Promise<void> {
  try {
    const drizzleDb = drizzle(db);
    
    // Extract IP and User Agent from request if provided
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    
    if (request) {
      ipAddress = request.headers.get('CF-Connecting-IP') 
        || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
        || null;
      userAgent = request.headers.get('User-Agent') || null;
    }

    await drizzleDb.insert(adminAuditLogs).values({
      adminId,
      action,
      targetType,
      targetId,
      targetName,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent: userAgent?.substring(0, 500), // Limit length
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main flow
    console.error('[audit.server] Failed to log action:', error);
  }
}

/**
 * Get human-readable action description
 */
export function getActionDescription(action: AuditAction): string {
  const descriptions: Record<AuditAction, string> = {
    store_suspend: 'Store সাসপেন্ড করা হয়েছে',
    store_unsuspend: 'Store আনসাসপেন্ড করা হয়েছে',
    store_delete: 'Store ডিলিট করা হয়েছে',
    store_restore: 'Store রিস্টোর করা হয়েছে',
    store_impersonate: 'Store এ লগইন করা হয়েছে (Impersonate)',
    payment_approve: 'পেমেন্ট এপ্রুভ করা হয়েছে',
    payment_reject: 'পেমেন্ট রিজেক্ট করা হয়েছে',
    domain_approve: 'Domain এপ্রুভ করা হয়েছে',
    domain_reject: 'Domain রিজেক্ট করা হয়েছে',
    ai_approve: 'AI Agent এপ্রুভ করা হয়েছে',
    ai_reject: 'AI Agent রিজেক্ট করা হয়েছে',
    coupon_create: 'Coupon তৈরি করা হয়েছে',
    coupon_delete: 'Coupon ডিলিট করা হয়েছে',
    broadcast_send: 'Broadcast পাঠানো হয়েছে',
    plan_change: 'Plan পরিবর্তন করা হয়েছে',
    bulk_action: 'Bulk action সম্পন্ন হয়েছে',
    other: 'অন্যান্য action',
  };
  return descriptions[action] || action;
}

/**
 * Get action badge color
 */
export function getActionColor(action: AuditAction): 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' {
  const colors: Record<AuditAction, 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange'> = {
    store_suspend: 'red',
    store_unsuspend: 'green',
    store_delete: 'red',
    store_restore: 'green',
    store_impersonate: 'yellow',
    payment_approve: 'green',
    payment_reject: 'red',
    domain_approve: 'green',
    domain_reject: 'red',
    ai_approve: 'green',
    ai_reject: 'red',
    coupon_create: 'blue',
    coupon_delete: 'orange',
    broadcast_send: 'purple',
    plan_change: 'blue',
    bulk_action: 'purple',
    other: 'blue',
  };
  return colors[action] || 'blue';
}
