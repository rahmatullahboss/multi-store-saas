/**
 * Super Admin - Store Management
 * 
 * Route: /admin/stores
 * 
 * Features:
 * - View all stores
 * - Suspend/Unsuspend stores
 * - Impersonate (Login as) store owners
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Form, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, desc, inArray } from 'drizzle-orm';
import { stores, users, activityLogs, adminAuditLogs, storeTags } from '@db/schema';
import { requireSuperAdmin, createImpersonationSession, requireAdminPermission } from '~/services/auth.server';
import { logAuditAction } from '~/services/audit.server';
import { getBulkUsageStats, PLAN_LIMITS, type PlanType } from '~/utils/plans.server';
import { 
  Store, 
  Search,
  Ban,
  CheckCircle,
  XCircle,
  UserRound,
  AlertTriangle,
  Crown,
  Zap,
  Gift,
  Trash2,
  RotateCcw,
  Download,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'All Stores - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch all stores with owner info
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const url = new URL(request.url);
  const showDeleted = url.searchParams.get('showDeleted') === 'true';
  
  const drizzleDb = drizzle(db);
  
  // Get all stores with owner email
  const storesWithOwners = await drizzleDb
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      isActive: stores.isActive,
      deletedAt: stores.deletedAt,
      createdAt: stores.createdAt,
      ownerId: users.id,
      ownerEmail: users.email,
      ownerName: users.name,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .orderBy(desc(stores.createdAt));
  
  // Filter based on showDeleted flag
  const filteredStores = showDeleted 
    ? storesWithOwners.filter(s => s.deletedAt !== null)
    : storesWithOwners.filter(s => s.deletedAt === null);
  
  // Fetch bulk usage stats for all stores
  const storeIds = filteredStores.map(s => s.id);
  const usageMap = await getBulkUsageStats(db, storeIds);
  
  // Fetch tags for these stores
  const tagsResult = storeIds.length > 0 
    ? await drizzleDb.select().from(storeTags).where(inArray(storeTags.storeId, storeIds))
    : [];
  
  // Group tags by storeId
  const tagsMap = new Map<number, typeof tagsResult>();
  tagsResult.forEach(tag => {
    const existing = tagsMap.get(tag.storeId) || [];
    tagsMap.set(tag.storeId, [...existing, tag]);
  });
  
  // Attach usage stats and tags to each store
  const storesWithUsage = filteredStores.map(store => {
    const usage = usageMap.get(store.id) || { orders: 0, products: 0 };
    const planType = (store.planType as PlanType) || 'free';
    // Safely get limits with fallback to 'free' if planType is invalid
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS['free'];
    const storeTagsList = tagsMap.get(store.id) || [];
    
    return {
      ...store,
      tags: storeTagsList,
      usage: {
        orders: usage.orders,
        ordersLimit: limits.max_orders,
        products: usage.products,
        productsLimit: limits.max_products,
      },
    };
  });
  
  return json({ stores: storesWithUsage, showDeleted });
}

// ============================================================================
// ACTION - Handle suspend/unsuspend and impersonation
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId: adminId, userEmail: adminEmail } = await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  const storeId = Number(formData.get('storeId'));
  const targetUserId = Number(formData.get('userId'));
  const storeName = formData.get('storeName')?.toString() || 'Unknown Store';
  
  const drizzleDb = drizzle(db);
  
  // ============ SUSPEND/UNSUSPEND ============
  if (intent === 'toggleSuspend') {
    await requireAdminPermission(request, context.cloudflare.env, db, 'canSuspend');

    const currentStatus = formData.get('currentStatus') === 'true';
    const newStatus = !currentStatus;
    
    await drizzleDb
      .update(stores)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log to activity logs (store-level)
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: newStatus ? 'store_unsuspended' : 'store_suspended',
      entityType: 'store',
      entityId: storeId,
      details: JSON.stringify({ 
        adminEmail,
        previousStatus: currentStatus,
        newStatus,
      }),
    });
    
    // Log to admin audit logs (Super Admin level)
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: newStatus ? 'store_unsuspend' : 'store_suspend',
      resource: 'store',
      resourceId: storeId,
      diff: { previousStatus: currentStatus, newStatus },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: newStatus ? 'unsuspended' : 'suspended' });
  }
  
  // ============ SOFT DELETE ============
  if (intent === 'softDelete') {
    await requireAdminPermission(request, context.cloudflare.env, db, 'canDelete');

    await drizzleDb
      .update(stores)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log to activity logs
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'store_soft_deleted',
      entityType: 'store',
      entityId: storeId,
      details: JSON.stringify({ adminEmail }),
    });
    
    // Log to admin audit logs
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'store_delete',
      resource: 'store',
      resourceId: storeId,
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'deleted' });
  }
  
  // ============ RESTORE ============
  if (intent === 'restore') {
    await requireAdminPermission(request, context.cloudflare.env, db, 'canDelete'); // Restore falls under delete permission

    await drizzleDb
      .update(stores)
      .set({ 
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log to activity logs
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'store_restored',
      entityType: 'store',
      entityId: storeId,
      details: JSON.stringify({ adminEmail }),
    });
    
    // Log to admin audit logs
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'store_restore',
      resource: 'store',
      resourceId: storeId,
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'restored' });
  }
  
  // ============ BULK SUSPEND ============
  if (intent === 'bulkSuspend') {
    await requireAdminPermission(request, context.cloudflare.env, db, 'canSuspend');

    const storeIds = JSON.parse(formData.get('storeIds')?.toString() || '[]') as number[];
    
    await drizzleDb
      .update(stores)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(stores.id, storeIds));
    
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'bulk_suspend',
      resource: 'store',
      diff: { action: 'bulk_suspend', storeIds, count: storeIds.length },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'bulk_suspended', count: storeIds.length });
  }
  
  // ============ ADD TAG ============
  if (intent === 'addTag') {
    const tag = formData.get('tag')?.toString().trim();
    if (!tag) return json({ error: 'Tag is required' }, { status: 400 });
    
    await drizzleDb.insert(storeTags).values({
      storeId,
      tag,
      createdBy: adminId,
    });
    
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'add_tag',
      resource: 'store',
      resourceId: storeId,
      diff: { action: 'add_tag', tag },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'tag_added' });
  }

  // ============ REMOVE TAG ============
  if (intent === 'removeTag') {
    const tagId = Number(formData.get('tagId'));
    const tagName = formData.get('tagName')?.toString();
    
    await drizzleDb.delete(storeTags).where(eq(storeTags.id, tagId));
    
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'remove_tag',
      resource: 'store',
      resourceId: storeId,
      diff: { action: 'remove_tag', tag: tagName },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    return json({ success: true, action: 'tag_removed' });
  }

  // ============ IMPERSONATE ============
  if (intent === 'impersonate') {
    await requireAdminPermission(request, context.cloudflare.env, db, 'canImpersonate');

    // CRITICAL SECURITY: Only SUPER_ADMIN_EMAIL can impersonate
    const superAdminEmail = context.cloudflare.env.SUPER_ADMIN_EMAIL;
    
    if (!superAdminEmail) {
      console.error('[admin.stores] SUPER_ADMIN_EMAIL not configured!');
      return json({ 
        error: 'Impersonation is not configured. Set SUPER_ADMIN_EMAIL in environment.' 
      }, { status: 500 });
    }
    
    // Log to activity logs (store-level)
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'impersonation_attempt',
      entityType: 'user',
      entityId: targetUserId,
      details: JSON.stringify({ adminEmail }),
    });
    
    // Log to admin audit logs
    await logAuditAction(context.cloudflare.env, {
      storeId: 0,
      actorId: adminId,
      action: 'store_impersonate',
      resource: 'store',
      resourceId: storeId,
      diff: { targetUserId },
      ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
    
    // Create impersonation session (includes strict email check)
    return createImpersonationSession(request, targetUserId, db, context.cloudflare.env);
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminStores() {
  const { stores: allStores, showDeleted } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState('');
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter stores by search
  const filteredStores = allStores.filter(store => 
    store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.subdomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleShowDeleted = () => {
    if (showDeleted) {
      searchParams.delete('showDeleted');
    } else {
      searchParams.set('showDeleted', 'true');
    }
    setSearchParams(searchParams);
  };

  const getPlanBadge = (planType: string | null) => {
    switch (planType) {
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        );
      case 'starter':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">
            <Zap className="w-3 h-3" />
            Starter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-700 text-slate-400">
            <Gift className="w-3 h-3" />
            Free
          </span>
        );
    }
  };

  // Bulk selection state
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  
  const toggleSelectAll = () => {
    if (selectedStores.length === filteredStores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(filteredStores.map(s => s.id));
    }
  };

  const toggleSelectStore = (storeId: number) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleBulkSuspend = () => {
    if (selectedStores.length === 0) return;
    if (!confirm(`Suspend ${selectedStores.length} selected stores?`)) return;
    
    fetcher.submit(
      { intent: 'bulkSuspend', storeIds: JSON.stringify(selectedStores) },
      { method: 'post' }
    );
    setSelectedStores([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {showDeleted ? 'Deleted Stores' : 'All Stores'}
          </h1>
          <p className="text-slate-400">{allStores.length} {showDeleted ? 'deleted' : 'active'} stores</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* CSV Export */}
          <a
            href="/api/admin/export-stores"
            download
            className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          
          {/* Bulk Actions (when stores selected) */}
          {selectedStores.length > 0 && !showDeleted && (
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
              <span className="text-sm text-slate-400">{selectedStores.length} selected</span>
              <button
                onClick={handleBulkSuspend}
                className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30"
              >
                Suspend All
              </button>
              <button
                onClick={() => setSelectedStores([])}
                className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded hover:bg-slate-600"
              >
                Clear
              </button>
            </div>
          )}
          
          {/* Show Deleted Toggle */}
          <button
            onClick={toggleShowDeleted}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              showDeleted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </button>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Stores - Desktop Table / Mobile Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {!showDeleted && (
                  <th className="px-2 py-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-white"
                    >
                      {selectedStores.length === filteredStores.length && filteredStores.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={showDeleted ? 7 : 8} className="px-4 py-8 text-center text-slate-500">
                    No stores found
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className={`hover:bg-slate-800/50 transition ${selectedStores.includes(store.id) ? 'bg-blue-500/10' : ''}`}>
                    {/* Checkbox */}
                    {!showDeleted && (
                      <td className="px-2 py-4">
                        <button
                          onClick={() => toggleSelectStore(store.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {selectedStores.includes(store.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    )}
                    {/* Store */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            store.isActive ? 'bg-blue-500/20' : 'bg-slate-700'
                          }`}>
                            <Store className={`w-5 h-5 ${store.isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{store.name}</p>
                            <p className="text-xs text-slate-500">{store.subdomain}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 items-center">
                          {store.tags?.map(tag => (
                            <span key={tag.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300 border border-slate-600">
                              {tag.tag}
                              {!showDeleted && (
                                <fetcher.Form method="post" className="inline-flex">
                                  <input type="hidden" name="intent" value="removeTag" />
                                  <input type="hidden" name="storeId" value={store.id} />
                                  <input type="hidden" name="storeName" value={store.name || ''} />
                                  <input type="hidden" name="tagId" value={tag.id} />
                                  <input type="hidden" name="tagName" value={tag.tag} />
                                  <button type="submit" className="hover:text-red-400 transition ml-0.5">
                                    <XCircle className="w-2.5 h-2.5" />
                                  </button>
                                </fetcher.Form>
                              )}
                            </span>
                          ))}
                          
                          {!showDeleted && (
                            <fetcher.Form method="post" className="inline-flex items-center" onSubmit={(e) => {
                              const input = e.currentTarget.querySelector('input[name="tag"]') as HTMLInputElement;
                              if (!input.value.trim()) {
                                e.preventDefault();
                                return;
                              }
                            }}>
                              <input type="hidden" name="intent" value="addTag" />
                              <input type="hidden" name="storeId" value={store.id} />
                              <input type="hidden" name="storeName" value={store.name || ''} />
                              <input 
                                type="text" 
                                name="tag" 
                                placeholder="+ Tag" 
                                className="w-12 px-1 py-0.5 bg-transparent border border-slate-700 rounded text-[10px] text-slate-300 placeholder-slate-600 focus:w-20 focus:border-blue-500 focus:bg-slate-800 transition-all outline-none"
                              />
                            </fetcher.Form>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Owner */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-300">{store.ownerName || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{store.ownerEmail || 'No owner'}</p>
                    </td>
                    
                    {/* Plan */}
                    <td className="px-4 py-4">
                      {getPlanBadge(store.planType)}
                    </td>
                    
                    {/* Usage */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {/* Orders */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 w-10">Orders:</span>
                          <span className={`font-medium ${
                            store.usage.ordersLimit !== Infinity && 
                            (store.usage.orders / store.usage.ordersLimit) >= 0.8 
                              ? 'text-amber-400' 
                              : store.usage.ordersLimit !== Infinity && 
                                (store.usage.orders / store.usage.ordersLimit) >= 1 
                                ? 'text-red-400' 
                                : 'text-slate-300'
                          }`}>
                            {store.usage.orders}/{store.usage.ordersLimit === Infinity ? '∞' : store.usage.ordersLimit}
                          </span>
                        </div>
                        {/* Products */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 w-10">Prods:</span>
                          <span className={`font-medium ${
                            store.usage.productsLimit !== Infinity && 
                            (store.usage.products / store.usage.productsLimit) >= 0.8 
                              ? 'text-amber-400' 
                              : store.usage.productsLimit !== Infinity && 
                                (store.usage.products / store.usage.productsLimit) >= 1 
                                ? 'text-red-400' 
                                : 'text-slate-300'
                          }`}>
                            {store.usage.products}/{store.usage.productsLimit === Infinity ? '∞' : store.usage.productsLimit}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-4">
                      {store.isActive ? (
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-red-400">
                          <XCircle className="w-4 h-4" />
                          Suspended
                        </span>
                      )}
                    </td>
                    
                    {/* Created */}
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {store.createdAt 
                        ? new Date(store.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Suspend/Unsuspend */}
                        <fetcher.Form method="post">
                          <input type="hidden" name="intent" value="toggleSuspend" />
                          <input type="hidden" name="storeId" value={store.id} />
                          <input type="hidden" name="storeName" value={store.name || ''} />
                          <input type="hidden" name="currentStatus" value={String(store.isActive)} />
                          <button
                            type="submit"
                            className={`p-2 rounded-lg transition ${
                              store.isActive 
                                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                            }`}
                            title={store.isActive ? 'Suspend Store' : 'Unsuspend Store'}
                          >
                            {store.isActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </fetcher.Form>
                        
                        {/* Impersonate - Only if has owner */}
                        {store.ownerId && (
                          <Form method="post">
                            <input type="hidden" name="intent" value="impersonate" />
                            <input type="hidden" name="storeId" value={store.id} />
                            <input type="hidden" name="storeName" value={store.name || ''} />
                            <input type="hidden" name="userId" value={store.ownerId} />
                            <button
                              type="submit"
                              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition flex items-center gap-2 text-xs font-medium"
                              title="Login as User (Impersonate)"
                            >
                              <UserRound className="w-4 h-4" />
                              Impersonate
                            </button>
                          </Form>
                        )}
                        
                        {/* Delete or Restore */}
                        {showDeleted ? (
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="restore" />
                            <input type="hidden" name="storeId" value={store.id} />
                            <input type="hidden" name="storeName" value={store.name || ''} />
                            <button
                              type="submit"
                              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition"
                              title="Restore Store"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </fetcher.Form>
                        ) : (
                          <fetcher.Form method="post" onSubmit={(e) => {
                            if (!confirm(`Are you sure you want to delete "${store.name}"? This can be undone from the Deleted Stores view.`)) {
                              e.preventDefault();
                            }
                          }}>
                            <input type="hidden" name="intent" value="softDelete" />
                            <input type="hidden" name="storeId" value={store.id} />
                            <input type="hidden" name="storeName" value={store.name || ''} />
                            <button
                              type="submit"
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                              title="Delete Store"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </fetcher.Form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards - Visible only on mobile */}
        <div className="md:hidden divide-y divide-slate-800">
          {filteredStores.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              No stores found
            </div>
          ) : (
            filteredStores.map((store) => (
              <div key={store.id} className="p-4 space-y-3">
                {/* Store Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      store.isActive ? 'bg-blue-500/20' : 'bg-slate-700'
                    }`}>
                      <Store className={`w-5 h-5 ${store.isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.subdomain}</p>
                    </div>
                  </div>
                  {store.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                      <XCircle className="w-3 h-3" />
                      Suspended
                    </span>
                  )}
                </div>
                
                {/* Store Info Grid */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Owner</p>
                    <p className="text-slate-300 truncate">{store.ownerName || 'N/A'}</p>
                    <p className="text-xs text-slate-500 truncate">{store.ownerEmail || 'No owner'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Plan</p>
                    {getPlanBadge(store.planType)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Usage</p>
                    <p className="text-xs text-slate-300">
                      O: {store.usage.orders}/{store.usage.ordersLimit === Infinity ? '∞' : store.usage.ordersLimit}
                    </p>
                    <p className="text-xs text-slate-300">
                      P: {store.usage.products}/{store.usage.productsLimit === Infinity ? '∞' : store.usage.productsLimit}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <fetcher.Form method="post" className="flex-1">
                    <input type="hidden" name="intent" value="toggleSuspend" />
                    <input type="hidden" name="storeId" value={store.id} />
                    <input type="hidden" name="currentStatus" value={String(store.isActive)} />
                    <button
                      type="submit"
                      className={`w-full py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium ${
                        store.isActive 
                          ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {store.isActive ? (
                        <>
                          <Ban className="w-4 h-4" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Unsuspend
                        </>
                      )}
                    </button>
                  </fetcher.Form>
                  
                  {store.ownerId && (
                    <Form method="post" className="flex-1">
                      <input type="hidden" name="intent" value="impersonate" />
                      <input type="hidden" name="storeId" value={store.id} />
                      <input type="hidden" name="userId" value={store.ownerId} />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <UserRound className="w-4 h-4" />
                        Impersonate
                      </button>
                    </Form>
                  )}
                  
                  {/* Delete or Restore */}
                  {showDeleted ? (
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="restore" />
                      <input type="hidden" name="storeId" value={store.id} />
                      <button
                        type="submit"
                        className="py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    </fetcher.Form>
                  ) : (
                    <fetcher.Form method="post" onSubmit={(e) => {
                      if (!confirm(`Delete "${store.name}"?`)) {
                        e.preventDefault();
                      }
                    }}>
                      <input type="hidden" name="intent" value="softDelete" />
                      <input type="hidden" name="storeId" value={store.id} />
                      <button
                        type="submit"
                        className="py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </fetcher.Form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-400">Impersonation Security Notice</h4>
            <p className="text-xs text-red-300/80 mt-1">
              The "Login as User" action creates a session as the selected user. This action is logged 
              and can only be performed by the configured Super Admin email. Use responsibly for support purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
