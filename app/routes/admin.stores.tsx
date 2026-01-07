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
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, desc } from 'drizzle-orm';
import { stores, users, activityLogs } from '@db/schema';
import { requireSuperAdmin, createImpersonationSession } from '~/services/auth.server';
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
  Gift
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
  await requireSuperAdmin(request, db);
  
  const drizzleDb = drizzle(db);
  
  // Get all stores with owner email
  const storesWithOwners = await drizzleDb
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      isActive: stores.isActive,
      createdAt: stores.createdAt,
      ownerId: users.id,
      ownerEmail: users.email,
      ownerName: users.name,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .orderBy(desc(stores.createdAt));
  
  return json({ stores: storesWithOwners });
}

// ============================================================================
// ACTION - Handle suspend/unsuspend and impersonation
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId: adminId, userEmail: adminEmail } = await requireSuperAdmin(request, db);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  const storeId = Number(formData.get('storeId'));
  const targetUserId = Number(formData.get('userId'));
  
  const drizzleDb = drizzle(db);
  
  // ============ SUSPEND/UNSUSPEND ============
  if (intent === 'toggleSuspend') {
    const currentStatus = formData.get('currentStatus') === 'true';
    const newStatus = !currentStatus;
    
    await drizzleDb
      .update(stores)
      .set({ 
        isActive: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log the action
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
    
    return json({ success: true, action: newStatus ? 'unsuspended' : 'suspended' });
  }
  
  // ============ IMPERSONATE ============
  if (intent === 'impersonate') {
    // CRITICAL SECURITY: Only SUPER_ADMIN_EMAIL can impersonate
    const superAdminEmail = context.cloudflare.env.SUPER_ADMIN_EMAIL;
    
    if (!superAdminEmail) {
      console.error('[admin.stores] SUPER_ADMIN_EMAIL not configured!');
      return json({ 
        error: 'Impersonation is not configured. Set SUPER_ADMIN_EMAIL in environment.' 
      }, { status: 500 });
    }
    
    // Log the impersonation attempt
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'impersonation_attempt',
      entityType: 'user',
      entityId: targetUserId,
      details: JSON.stringify({ adminEmail }),
    });
    
    // Create impersonation session (includes strict email check)
    return createImpersonationSession(request, targetUserId, db, superAdminEmail);
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminStores() {
  const { stores: allStores } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState('');
  const fetcher = useFetcher();
  
  // Filter stores by search
  const filteredStores = allStores.filter(store => 
    store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.subdomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Stores</h1>
          <p className="text-slate-400">{allStores.length} total stores</p>
        </div>
        
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

      {/* Stores Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
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
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No stores found
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-800/50 transition">
                    {/* Store */}
                    <td className="px-4 py-4">
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
                          <fetcher.Form method="post">
                            <input type="hidden" name="intent" value="impersonate" />
                            <input type="hidden" name="storeId" value={store.id} />
                            <input type="hidden" name="userId" value={store.ownerId} />
                            <button
                              type="submit"
                              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition flex items-center gap-2 text-xs font-medium"
                              title="Login as User (Impersonate)"
                            >
                              <UserRound className="w-4 h-4" />
                              Impersonate
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
