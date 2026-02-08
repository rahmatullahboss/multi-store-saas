/**
 * Super Admin Credit Purchases Approval Page
 * 
 * Route: /admin/credit-purchases
 * 
 * Features:
 * - View all pending credit purchase requests
 * - Approve requests to add credits to store
 * - Reject requests with notes
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { creditPurchases, stores, users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { addCredits } from '~/utils/credit.server';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  Hash, 
  Store as StoreIcon,
  Coins,
  Calendar
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  await requireSuperAdmin(request, env);

  const db = drizzle(env.DB);
  
  // Get all credit purchases with store info
  const purchases = await db
    .select({
      id: creditPurchases.id,
      storeId: creditPurchases.storeId,
      storeName: stores.name,
      packageId: creditPurchases.packageId,
      credits: creditPurchases.credits,
      amount: creditPurchases.amount,
      transactionId: creditPurchases.transactionId,
      phone: creditPurchases.phone,
      status: creditPurchases.status,
      adminNotes: creditPurchases.adminNotes,
      createdAt: creditPurchases.createdAt,
    })
    .from(creditPurchases)
    .leftJoin(stores, eq(creditPurchases.storeId, stores.id))
    .orderBy(desc(creditPurchases.createdAt))
    .limit(100);

  return json({ purchases });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const session = await requireSuperAdmin(request, env);
  const adminId = session.get('userId');

  const db = drizzle(env.DB);
  const formData = await request.formData();
  const action = formData.get('action') as string;
  const purchaseId = parseInt(formData.get('purchaseId') as string);
  const notes = formData.get('notes') as string || '';

  // Get the purchase
  const purchase = await db
    .select()
    .from(creditPurchases)
    .where(eq(creditPurchases.id, purchaseId))
    .get();

  if (!purchase) {
    return json({ error: 'Purchase not found' }, { status: 404 });
  }

  if (purchase.status !== 'pending') {
    return json({ error: 'Purchase already processed' }, { status: 400 });
  }

  if (action === 'approve') {
    // Add credits to the store
    await addCredits(
      db,
      purchase.storeId,
      purchase.credits,
      'purchase',
      `bKash Purchase - TrxID: ${purchase.transactionId}`
    );

    // Update purchase status
    await db
      .update(creditPurchases)
      .set({
        status: 'approved',
        adminNotes: notes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(creditPurchases.id, purchaseId));

    return json({ success: true, action: 'approved' });
  }

  if (action === 'reject') {
    // Update purchase status to rejected
    await db
      .update(creditPurchases)
      .set({
        status: 'rejected',
        adminNotes: notes || 'Payment verification failed',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(creditPurchases.id, purchaseId));

    return json({ success: true, action: 'rejected' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function AdminCreditPurchases() {
  const { purchases } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  useEffect(() => {
    const data = fetcher.data as { success?: boolean; action?: string; error?: string } | null;
    if (data?.success) {
      toast.success(data.action === 'approved' ? 'Credits approved and added!' : 'Purchase rejected');
    }
    if (data?.error) {
      toast.error(data.error);
    }
  }, [fetcher.data]);

  const pendingCount = purchases.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Purchase Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve bKash credit purchases</p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium">
            {pendingCount} Pending
          </div>
        )}
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No credit purchase requests yet
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StoreIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{purchase.storeName || `Store #${purchase.storeId}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-violet-500" />
                        <span className="font-medium">{purchase.credits} Credits</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-bold">৳{purchase.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Hash className="w-3 h-3 text-gray-400" />
                          <span className="font-mono">{purchase.transactionId}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{purchase.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        purchase.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        purchase.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {purchase.status === 'pending' && <Clock className="w-3 h-3" />}
                        {purchase.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {purchase.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {purchase.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <fetcher.Form method="post">
                            <input type="hidden" name="purchaseId" value={purchase.id} />
                            <input type="hidden" name="action" value="approve" />
                            <button
                              type="submit"
                              disabled={fetcher.state !== 'idle'}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                          </fetcher.Form>
                          <fetcher.Form method="post">
                            <input type="hidden" name="purchaseId" value={purchase.id} />
                            <input type="hidden" name="action" value="reject" />
                            <button
                              type="submit"
                              disabled={fetcher.state !== 'idle'}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition"
                            >
                              Reject
                            </button>
                          </fetcher.Form>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {purchase.adminNotes || '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
