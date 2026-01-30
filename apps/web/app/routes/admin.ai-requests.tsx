/**
 * Super Admin - AI Agent Activation Requests
 *
 * Route: /admin/ai-requests
 *
 * Features:
 * - List all pending AI agent activation requests
 * - Approve or reject requests
 * - View store details
 * - Monitor AI Usage Limits
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, or } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import {
  Bot,
  Check,
  X,
  Store,
  Clock,
  Loader2,
  Inbox,
  BarChart3,
  Search,
  Zap,
  Activity,
  CalendarDays,
  Calendar,
} from 'lucide-react';
import { getStoreAIUsage } from '~/lib/rateLimit.server';
import {
  getBulkUsageStats,
  STORE_AI_DAILY_LIMITS,
  AI_PLAN_LIMITS,
  type PlanType,
  type AIPlanType,
} from '~/utils/plans.server';
import { useState } from 'react';
import { formatPrice } from '~/lib/theme-engine';

export const meta: MetaFunction = () => {
  return [{ title: 'AI Activation Requests - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch pending AI requests & Usage Stats
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  const db = drizzle(context.cloudflare.env.DB);

  // 1. Get Pending Requests
  const pendingRequests = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      aiAgentRequestedAt: stores.aiAgentRequestedAt,
      isCustomerAiEnabled: stores.isCustomerAiEnabled,
      aiPlan: stores.aiPlan,
      paymentTransactionId: stores.paymentTransactionId,
      paymentPhone: stores.paymentPhone,
      paymentAmount: stores.paymentAmount,
      paymentStatus: stores.paymentStatus,
    })
    .from(stores)
    .where(eq(stores.aiAgentRequestStatus, 'pending'));

  // 2. Get All Active AI Stores for Usage Stats
  // (Either approved OR manually enabled)
  const activeStores = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      isCustomerAiEnabled: stores.isCustomerAiEnabled,
      aiPlan: stores.aiPlan,
    })
    .from(stores)
    .where(or(eq(stores.aiAgentRequestStatus, 'approved'), eq(stores.isCustomerAiEnabled, true)));

  // 3. Get Monthly Stats (D1) for EVERYONE (Single DB query is cheap)
  // This gives us the "Monthly" usage for anyone who needs it.
  const storeIds = activeStores.map((s) => s.id);
  const monthlyStats = await getBulkUsageStats(context.cloudflare.env.DB, storeIds);

  // 4. Combine Stats based on Active Plan Logic
  const usageStats = await Promise.all(
    activeStores.map(async (store) => {
      const planType = (store.planType as PlanType) || 'free';
      const aiPlan = (store.aiPlan as AIPlanType) || null;

      let usage = 0;
      let limit = 0;
      let mode: 'daily' | 'monthly' = 'daily';

      if (aiPlan) {
        // === MONTHLY MODE (Paid AI Plan) ===
        // Fetch from D1 bulk stats
        usage = monthlyStats.get(store.id)?.aiMessages || 0;
        limit = AI_PLAN_LIMITS[aiPlan];
        mode = 'monthly';
      } else {
        // === DAILY MODE (Store Plan Trial) ===
        // Fetch from KV (Real-time daily)
        usage = await getStoreAIUsage(context.cloudflare.env.AI_RATE_LIMIT, store.id);
        limit = STORE_AI_DAILY_LIMITS[planType];
        mode = 'daily';
      }

      return {
        ...store,
        usage,
        limit,
        mode,
        usagePercent:
          limit === -1
            ? 0
            : limit === 0
              ? usage > 0
                ? 100
                : 0
              : Math.min(100, Math.round((usage / limit) * 100)),
      };
    })
  );

  return json({
    pendingRequests,
    activeUsageStats: usageStats.sort((a, b) => b.usage - a.usage), // Sort by highest usage
    pendingCount: pendingRequests.length,
  });
}

// ============================================================================
// ACTION - Approve or Reject AI requests
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();

  const storeId = Number(formData.get('storeId'));
  const actionType = formData.get('action');

  if (!storeId || isNaN(storeId)) {
    return json({ error: 'Invalid store ID' }, { status: 400 });
  }

  if (actionType === 'approve') {
    await db
      .update(stores)
      .set({
        isCustomerAiEnabled: true,
        aiAgentRequestStatus: 'approved',
        paymentStatus: 'verified',
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, action: 'approved', storeId });
  }

  if (actionType === 'reject') {
    await db
      .update(stores)
      .set({
        aiAgentRequestStatus: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, action: 'rejected', storeId });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function AdminAiRequests() {
  const { pendingRequests, activeUsageStats, pendingCount } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [activeTab, setActiveTab] = useState<'requests' | 'usage'>('requests');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'premium':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'business':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredUsageStats = activeUsageStats.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.subdomain.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-400" />
            AI Administration
          </h1>
          <p className="text-slate-400 mt-1">
            Manage activation requests and monitor AI usage across stores.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-3">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase font-bold">Pending</span>
            <span className="text-xl font-bold text-orange-400">{pendingCount}</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase font-bold">Active</span>
            <span className="text-xl font-bold text-emerald-400">{activeUsageStats.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-4 px-2 text-sm font-medium transition relative ${
              activeTab === 'requests' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Pending Requests
            {pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                {pendingCount}
              </span>
            )}
            {activeTab === 'requests' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-4 px-2 text-sm font-medium transition relative ${
              activeTab === 'usage' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Usage & Analytics
            {activeTab === 'usage' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'requests' ? (
        // ============================================
        // PENDING REQUESTS TAB
        // ============================================
        pendingCount > 0 ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Payment Info
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pendingRequests.map((request) => {
                    const isProcessing = fetcher.formData?.get('storeId') === String(request.id);
                    return (
                      <tr key={request.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Store className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{request.name}</p>
                              <p className="text-sm text-slate-400">
                                {request.subdomain}.store.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPlanBadgeColor(request.planType || 'free')}`}
                          >
                            {request.planType || 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-slate-500" />
                            {formatDate(request.aiAgentRequestedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {request.paymentTransactionId ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                  TRX:
                                </span>
                                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                                  {request.paymentTransactionId}
                                </code>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="font-bold uppercase">Phone:</span>
                                <span>{request.paymentPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="font-bold uppercase">Amount:</span>
                                <span className="text-emerald-400 font-medium">
                                  {formatPrice(Number(request.paymentAmount) || 0)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No payment info</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <fetcher.Form method="post">
                              <input type="hidden" name="storeId" value={request.id} />
                              <input type="hidden" name="action" value="approve" />
                              <button
                                type="submit"
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isProcessing && fetcher.formData?.get('action') === 'approve' ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                            </fetcher.Form>
                            <fetcher.Form method="post">
                              <input type="hidden" name="storeId" value={request.id} />
                              <input type="hidden" name="action" value="reject" />
                              <button
                                type="submit"
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-md transition flex items-center gap-1.5 border border-red-500/30 disabled:opacity-50"
                              >
                                {isProcessing && fetcher.formData?.get('action') === 'reject' ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                Reject
                              </button>
                            </fetcher.Form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              You're all caught up! Pending AI agent requests will appear here.
            </p>
          </div>
        )
      ) : (
        // ============================================
        // USAGE ANALYTICS TAB
        // ============================================
        <div className="space-y-4">
          {/* Search/Filter Bar */}
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 max-w-md">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search stores..."
              className="bg-transparent border-none focus:ring-0 text-white w-full text-sm placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsageStats.length > 0 ? (
                    filteredUsageStats.map((store) => {
                      // Determine progress bar color
                      let progressColor = 'bg-blue-500';
                      if (store.usagePercent > 80) progressColor = 'bg-red-500';
                      else if (store.usagePercent > 50) progressColor = 'bg-amber-500';

                      return (
                        <tr key={store.id} className="hover:bg-slate-800/20 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                                <Zap className="w-5 h-5 text-yellow-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{store.name}</p>
                                <p className="text-xs text-slate-500">{store.subdomain}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`w-fit px-2.5 py-1 text-xs font-medium rounded-full border uppercase ${getPlanBadgeColor(store.planType || 'free')}`}
                              >
                                {store.planType || 'Free'}
                              </span>
                              {store.aiPlan && (
                                <span className="w-fit px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase font-bold tracking-wide">
                                  {store.aiPlan} AI
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[250px]">
                            <div className="flex flex-col gap-2">
                              {/* Values */}
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white font-medium flex items-center gap-1.5">
                                  {store.mode === 'daily' ? (
                                    <CalendarDays className="w-3 h-3 text-slate-400" />
                                  ) : (
                                    <Calendar className="w-3 h-3 text-purple-400" />
                                  )}
                                  {store.usage} used
                                  <span className="text-slate-500 font-normal">
                                    ({store.mode === 'daily' ? 'Today' : 'Month'})
                                  </span>
                                </span>
                                <span className="text-slate-400">
                                  Limit: {store.limit === -1 ? '∞' : store.limit}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              {store.limit !== -1 && (
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                    style={{ width: `${store.usagePercent}%` }}
                                  />
                                </div>
                              )}
                              {store.limit === -1 && (
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500 w-full animate-pulse opacity-50" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 w-fit">
                              <Activity className="w-3 h-3" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                        No stores found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
