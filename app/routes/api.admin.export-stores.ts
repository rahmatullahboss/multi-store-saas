/**
 * Admin CSV Export API
 * 
 * Route: /api/admin.export-stores
 * 
 * Exports all stores data as CSV for Super Admin.
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, sql } from 'drizzle-orm';
import { stores, users, orders, products } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { logAuditAction } from '~/services/audit.server';
import { PLAN_LIMITS, type PlanType } from '~/utils/plans.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId: adminId } = await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  
  // Get all active stores with owner info
  const allStores = await drizzleDb
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      isActive: stores.isActive,
      createdAt: stores.createdAt,
      ownerEmail: users.email,
      ownerName: users.name,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .where(sql`${stores.deletedAt} IS NULL`)
    .orderBy(desc(stores.createdAt));
  
  // Get order counts per store
  const orderCounts = await drizzleDb
    .select({
      storeId: orders.storeId,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`SUM(${orders.total})`,
    })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`)
    .groupBy(orders.storeId);
  
  const orderMap = new Map(orderCounts.map(o => [o.storeId, { count: o.count, revenue: o.revenue }]));
  
  // Get product counts per store
  const productCounts = await drizzleDb
    .select({
      storeId: products.storeId,
      count: sql<number>`COUNT(*)`,
    })
    .from(products)
    .groupBy(products.storeId);
  
  const productMap = new Map(productCounts.map(p => [p.storeId, p.count]));
  
  // Build CSV
  const headers = [
    'Store ID',
    'Store Name',
    'Subdomain',
    'Owner Name',
    'Owner Email',
    'Plan',
    'Status',
    'Total Orders',
    'Total Revenue (৳)',
    'Order Limit',
    'Order Usage %',
    'Total Products',
    'Product Limit',
    'Product Usage %',
    'Created At'
  ];
  
  const rows = allStores.map(store => {
    const orderData = orderMap.get(store.id) || { count: 0, revenue: 0 };
    const productCount = productMap.get(store.id) || 0;
    const planType = (store.planType as PlanType) || 'free';
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS['free'];
    
    const orderUsage = limits.max_orders === Infinity 
      ? '0' 
      : Math.round((orderData.count / limits.max_orders) * 100).toString();
    const productUsage = limits.max_products === Infinity 
      ? '0' 
      : Math.round((productCount / limits.max_products) * 100).toString();
    
    return [
      store.id.toString(),
      `"${store.name || ''}"`,
      store.subdomain || '',
      `"${store.ownerName || ''}"`,
      store.ownerEmail || '',
      planType.toUpperCase(),
      store.isActive ? 'Active' : 'Suspended',
      orderData.count.toString(),
      (orderData.revenue || 0).toFixed(2),
      limits.max_orders === Infinity ? 'Unlimited' : limits.max_orders.toString(),
      orderUsage + '%',
      productCount.toString(),
      limits.max_products === Infinity ? 'Unlimited' : limits.max_products.toString(),
      productUsage + '%',
      store.createdAt ? new Date(store.createdAt).toISOString().split('T')[0] : '',
    ].join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  
  // Log the export action
  await logAuditAction(context.cloudflare.env, {
    storeId: 0,
    actorId: adminId,
    action: 'csv_export',
    resource: 'other',
    resourceId: 'stores_export',
    diff: { action: 'csv_export', storeCount: allStores.length },
    ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
    userAgent: request.headers.get('User-Agent') || undefined,
  });
  
  // Return CSV as downloadable file
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="stores-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
