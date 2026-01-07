/**
 * Super Admin - AI Agent Activation Requests
 * 
 * Route: /admin/ai-requests
 * 
 * Features:
 * - List all pending AI agent activation requests
 * - Approve or reject requests
 * - View store details
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  Bot, 
  Check, 
  X, 
  Store,
  Clock,
  Loader2,
  Inbox
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'AI Activation Requests - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch pending AI requests
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env.DB);
  
  const db = drizzle(context.cloudflare.env.DB);

  // Get all stores with pending AI agent requests
  const pendingRequests = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      aiAgentRequestStatus: stores.aiAgentRequestStatus,
      aiAgentRequestedAt: stores.aiAgentRequestedAt,
      isCustomerAiEnabled: stores.isCustomerAiEnabled,
    })
    .from(stores)
    .where(eq(stores.aiAgentRequestStatus, 'pending'));

  return json({
    pendingRequests,
    count: pendingRequests.length,
  });
}

// ============================================================================
// ACTION - Approve or Reject AI requests
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env.DB);
  
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
// MAIN COMPONENT
// ============================================================================
export default function AdminAiRequests() {
  const { pendingRequests, count } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

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
      case 'starter': return 'bg-emerald-500/20 text-emerald-400';
      case 'premium': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agent Requests</h1>
          <p className="text-slate-400 mt-1">
            Manage AI Sales Agent activation requests from merchants
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
          <Bot className="w-5 h-5 text-orange-400" />
          <span className="text-orange-300 font-medium">{count} Pending</span>
        </div>
      </div>

      {/* Requests Table */}
      {count > 0 ? (
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
                            <p className="text-sm text-slate-400">{request.subdomain}.store.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getPlanBadgeColor(request.planType || 'free')}`}>
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
                        <div className="flex items-center justify-end gap-2">
                          <fetcher.Form method="post">
                            <input type="hidden" name="storeId" value={request.id} />
                            <input type="hidden" name="action" value="approve" />
                            <button
                              type="submit"
                              disabled={isProcessing}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                            >
                              {isProcessing && fetcher.formData?.get('action') === 'approve' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
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
                              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition flex items-center gap-2 border border-red-500/30 disabled:opacity-50"
                            >
                              {isProcessing && fetcher.formData?.get('action') === 'reject' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
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
        // Empty State
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            There are no AI Sales Agent activation requests waiting for approval. 
            Requests will appear here when merchants submit them.
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="font-medium text-white mb-2">About AI Sales Agent</h3>
        <p className="text-slate-400 text-sm">
          The AI Sales Agent is a paid add-on (৳500/month) that provides an AI-powered chatbot 
          on merchant storefronts. When you approve a request, the feature will be immediately 
          activated for that store. Future: auto-activation after payment confirmation.
        </p>
      </div>
    </div>
  );
}
