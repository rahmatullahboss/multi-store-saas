/**
 * Admin Payouts Page
 * 
 * Route: /app/admin/payouts
 * 
 * Platform admin page to view and manage merchant payouts.
 * Shows weekly earnings per store, allows marking as paid, CSV export.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';
import { stores, orders, payouts } from '@db/schema';
import { 
  DollarSign, 
  Download, 
  CheckCircle, 
  Clock, 
  Calendar,
  Store,
  Loader2
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Payouts - Admin' }];
};

// Get start and end of current week (Sunday to Saturday)
function getWeekRange(date: Date = new Date()) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  
  // Get selected week (default: current week)
  const { start: weekStart, end: weekEnd } = getWeekRange();
  
  // Get all stores with their weekly sales
  const storesWithSales = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      subdomain: stores.subdomain,
      totalSales: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
    })
    .from(stores)
    .leftJoin(
      orders,
      and(
        eq(orders.storeId, stores.id),
        eq(orders.paymentStatus, 'paid'),
        gte(orders.createdAt, weekStart),
        lte(orders.createdAt, weekEnd)
      )
    )
    .groupBy(stores.id)
    .orderBy(desc(sql`COALESCE(SUM(${orders.total}), 0)`));

  // Get existing payouts for this week
  const existingPayouts = await db
    .select()
    .from(payouts)
    .where(
      and(
        gte(payouts.periodStart, weekStart),
        lte(payouts.periodEnd, weekEnd)
      )
    );

  const payoutMap = new Map(existingPayouts.map(p => [p.storeId, p]));

  // Calculate totals
  const totalGross = storesWithSales.reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const platformFeePercent = 10; // 10% platform fee
  
  const merchantData = storesWithSales.map(store => {
    const gross = store.totalSales || 0;
    const fee = gross * (platformFeePercent / 100);
    const net = gross - fee;
    const existingPayout = payoutMap.get(store.storeId);
    
    return {
      storeId: store.storeId,
      storeName: store.storeName,
      subdomain: store.subdomain,
      orderCount: store.orderCount || 0,
      grossAmount: gross,
      platformFee: fee,
      netAmount: net,
      payoutStatus: existingPayout?.status || 'pending',
      payoutId: existingPayout?.id,
    };
  });

  return json({
    merchants: merchantData,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    summary: {
      totalGross,
      totalFee: totalGross * (platformFeePercent / 100),
      totalNet: totalGross * (1 - platformFeePercent / 100),
      merchantCount: storesWithSales.length,
      platformFeePercent,
    },
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  
  const db = drizzle(context.cloudflare.env.DB);
  
  if (intent === 'mark_paid') {
    const storeId = parseInt(formData.get('storeId') as string);
    const grossAmount = parseFloat(formData.get('grossAmount') as string);
    const platformFee = parseFloat(formData.get('platformFee') as string);
    const netAmount = parseFloat(formData.get('netAmount') as string);
    const periodStart = new Date(formData.get('periodStart') as string);
    const periodEnd = new Date(formData.get('periodEnd') as string);
    const paymentReference = formData.get('paymentReference') as string;
    
    // Create or update payout record
    await db.insert(payouts).values({
      storeId,
      periodStart,
      periodEnd,
      grossAmount,
      platformFee,
      netAmount,
      status: 'paid',
      paidAt: new Date(),
      paymentMethod: 'manual',
      paymentReference: paymentReference || null,
    });
    
    return json({ success: true });
  }
  
  if (intent === 'export_csv') {
    // CSV export is handled client-side
    return json({ success: true });
  }
  
  return json({ error: 'Unknown intent' }, { status: 400 });
}

export default function AdminPayoutsPage() {
  const { merchants, weekStart, weekEnd, summary } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const exportToCSV = () => {
    const headers = ['Store Name', 'Subdomain', 'Orders', 'Gross Sales', 'Platform Fee', 'Net Payout', 'Status'];
    const rows = merchants.map(m => [
      m.storeName,
      m.subdomain,
      m.orderCount,
      m.grossAmount,
      m.platformFee,
      m.netAmount,
      m.payoutStatus,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${formatDate(weekStart)}-to-${formatDate(weekEnd)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchant Payouts</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" />
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Merchants</p>
              <p className="text-xl font-bold text-gray-900">{summary.merchantCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-emerald-600">{formatPrice(summary.totalGross)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform Fee ({summary.platformFeePercent}%)</p>
              <p className="text-xl font-bold text-purple-600">{formatPrice(summary.totalFee)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payouts</p>
              <p className="text-xl font-bold text-orange-600">{formatPrice(summary.totalNet)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee (10%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr key={merchant.storeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{merchant.storeName}</p>
                      <p className="text-sm text-gray-500">{merchant.subdomain}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{merchant.orderCount}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(merchant.grossAmount)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatPrice(merchant.platformFee)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatPrice(merchant.netAmount)}</td>
                  <td className="px-6 py-4">
                    {merchant.payoutStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {merchant.payoutStatus !== 'paid' && merchant.netAmount > 0 && (
                      <Form method="post">
                        <input type="hidden" name="intent" value="mark_paid" />
                        <input type="hidden" name="storeId" value={merchant.storeId} />
                        <input type="hidden" name="grossAmount" value={merchant.grossAmount} />
                        <input type="hidden" name="platformFee" value={merchant.platformFee} />
                        <input type="hidden" name="netAmount" value={merchant.netAmount} />
                        <input type="hidden" name="periodStart" value={weekStart} />
                        <input type="hidden" name="periodEnd" value={weekEnd} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Mark Paid
                        </button>
                      </Form>
                    )}
                  </td>
                </tr>
              ))}
              
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No merchants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
