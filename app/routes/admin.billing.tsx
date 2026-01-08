/**
 * Super Admin - Billing & Subscription Management
 * 
 * Route: /admin/billing
 * 
 * Features:
 * - MRR metrics (Stripe + Manual combined)
 * - Tabbed interface: Active, Pending Approvals, Expired
 * - Payment approval with date picker modal
 * - Confirmation emails on approval
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, ne, sql, isNotNull, lt, gte, or } from 'drizzle-orm';
import { stores, users, activityLogs, adminAuditLogs, payments } from '@db/schema';
import { requireSuperAdmin, requireAdminPermission } from '~/services/auth.server';
import { logAdminAction } from '~/services/audit.server';
import { createEmailService } from '~/services/email.server';
import { 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Copy,
  Check,
  Store,
  Crown,
  Zap,
  Gift,
  Search,
  X,
  Loader2,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const meta: MetaFunction = () => {
  return [{ title: 'Billing Management - Super Admin' }];
};

// Plan config for display
const PLAN_CONFIG = {
  free: { label: 'Free', price: 0, icon: Gift, color: 'gray' },
  starter: { label: 'Starter', price: 500, icon: Zap, color: 'emerald' },
  premium: { label: 'Premium', price: 2000, icon: Crown, color: 'purple' },
} as const;

// ============================================================================
// LOADER - Fetch all subscription data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  const now = new Date();
  
  // Fetch all paid stores with owner info
  const allPaidStores = await drizzleDb
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      planType: stores.planType,
      paymentStatus: stores.paymentStatus,
      paymentTransactionId: stores.paymentTransactionId,
      paymentAmount: stores.paymentAmount,
      paymentPhone: stores.paymentPhone,
      paymentSubmittedAt: stores.paymentSubmittedAt,
      subscriptionPaymentMethod: stores.subscriptionPaymentMethod,
      subscriptionStartDate: stores.subscriptionStartDate,
      subscriptionEndDate: stores.subscriptionEndDate,
      adminNote: stores.adminNote,
      isActive: stores.isActive,
      createdAt: stores.createdAt,
      ownerId: users.id,
      ownerEmail: users.email,
      ownerName: users.name,
    })
    .from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .where(or(
      ne(stores.planType, 'free'),
      eq(stores.paymentStatus, 'pending_verification')
    ))
    .orderBy(desc(stores.createdAt));
  
  // Categorize subscriptions
  const activeSubscribers = allPaidStores.filter(s => {
    const hasValidPlan = s.planType && s.planType !== 'free';
    const hasValidEndDate = s.subscriptionEndDate && new Date(s.subscriptionEndDate) >= now;
    const isVerified = s.paymentStatus === 'verified' || s.paymentStatus === 'none';
    return hasValidPlan && (hasValidEndDate || !s.subscriptionEndDate) && isVerified;
  });
  
  const pendingApprovals = allPaidStores.filter(s => 
    s.paymentStatus === 'pending_verification'
  );
  
  const expiredSubscriptions = allPaidStores.filter(s => {
    const hasValidPlan = s.planType && s.planType !== 'free';
    const hasExpiredEndDate = s.subscriptionEndDate && new Date(s.subscriptionEndDate) < now;
    return hasValidPlan && hasExpiredEndDate;
  });
  
  // Calculate MRR
  const calculateMRR = (subs: typeof activeSubscribers) => {
    return subs.reduce((total, s) => {
      const planPrice = PLAN_CONFIG[s.planType as keyof typeof PLAN_CONFIG]?.price || 0;
      return total + planPrice;
    }, 0);
  };

  // Total MRR = all active subscribers with paid plans
  const totalMRR = calculateMRR(activeSubscribers);
  // Manual MRR = all non-stripe (or no payment method set = assumed manual)
  const stripeMRR = calculateMRR(activeSubscribers.filter(s => s.subscriptionPaymentMethod === 'stripe'));
  const manualMRR = totalMRR - stripeMRR;
  
  // Fetch recent payments (History)
  const recentPayments = await drizzleDb
    .select({
      id: payments.id,
      storeName: stores.name,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      method: payments.method,
      planType: payments.planType,
      createdAt: payments.createdAt,
      adminNote: payments.adminNote,
    })
    .from(payments)
    .leftJoin(stores, eq(payments.storeId, stores.id))
    .orderBy(desc(payments.createdAt))
    .limit(50);

  // ===== CHART DATA (Last 12 Months) =====
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  
  const revenueDataRaw = await drizzleDb.all(sql`
    SELECT 
      strftime('%Y-%m', created_at / 1000, 'unixepoch') as month,
      sum(amount) as revenue
    FROM payments
    WHERE status = 'paid' AND created_at >= ${twelveMonthsAgo.getTime()}
    GROUP BY month
    ORDER BY month ASC
  `);
  
  const revenueData = revenueDataRaw as unknown as { month: string, revenue: number }[];
  
  // Fill gaps
  const chartData = [];
  const currentMonth = new Date(twelveMonthsAgo);
  
  // Loop through last 12 months
  for (let i = 0; i < 12; i++) {
    const mStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
    const entry = revenueData.find(d => d.month === mStr);
    
    chartData.push({
      name: currentMonth.toLocaleString('en-US', { month: 'short' }),
      date: mStr,
      revenue: entry ? entry.revenue : 0
    });
    
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  return json({
    activeSubscribers,
    pendingApprovals,
    expiredSubscriptions,
    recentPayments,
    chartData,
    metrics: {
      totalMRR,
      manualMRR,
      stripeMRR,
      activeCount: activeSubscribers.length,
      pendingCount: pendingApprovals.length,
      expiredCount: expiredSubscriptions.length,
    },
  });
}

// ============================================================================
// ACTION - Handle payment approvals and rejections
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId: adminId, userEmail: adminEmail } = await requireSuperAdmin(request, context.cloudflare.env, db);

  // Enforce Billing Permission for all actions here
  await requireAdminPermission(request, context.cloudflare.env, db, 'canBilling');
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  const storeId = Number(formData.get('storeId'));
  
  const drizzleDb = drizzle(db);
  
  // Get store and owner info
  const storeResult = await drizzleDb
    .select({
      name: stores.name,
      planType: stores.planType,
      paymentAmount: stores.paymentAmount,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  if (!storeResult[0]) {
    return json({ error: 'Store not found' }, { status: 404 });
  }
  
  const ownerResult = await drizzleDb
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.storeId, storeId))
    .limit(1);
  
  // ============ APPROVE PAYMENT ============
  if (intent === 'approve') {
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const planType = formData.get('planType') as string;
    const adminNote = formData.get('adminNote') as string;
    
    if (!startDateStr || !endDateStr) {
      return json({ error: 'Start and end dates are required' }, { status: 400 });
    }
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if (endDate <= startDate) {
      return json({ error: 'End date must be after start date' }, { status: 400 });
    }
    
    // Update store
    await drizzleDb
      .update(stores)
      .set({
        planType: (planType as 'starter' | 'premium') || storeResult[0].planType,
        paymentStatus: 'verified',
        subscriptionPaymentMethod: 'manual',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        adminNote: adminNote || null,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log to activity logs
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'subscription_approved',
      entityType: 'subscription',
      entityId: storeId,
      details: JSON.stringify({
        adminEmail,
        planType: planType || storeResult[0].planType,
        startDate: startDateStr,
        endDate: endDateStr,
        adminNote,
      }),
    });
    
    // RECORD PAYMENT IN HISTORY
    await drizzleDb.insert(payments).values({
      storeId,
      amount: storeResult[0].paymentAmount || 0,
      currency: 'BDT',
      status: 'paid',
      method: 'bkash', // Assuming bkash for manual approvals as per current flow
      planType: (planType as string) || storeResult[0].planType,
      periodStart: startDate,
      periodEnd: endDate,
      adminNote: adminNote || null,
    });
    
    // Log to admin audit logs (Super Admin)
    await logAdminAction({
      db,
      adminId,
      action: 'payment_approve',
      targetType: 'store',
      targetId: storeId,
      targetName: storeResult[0].name || 'Unknown Store',
      details: {
        planType: planType || storeResult[0].planType,
        paymentAmount: storeResult[0].paymentAmount,
        startDate: startDateStr,
        endDate: endDateStr,
        adminNote,
      },
      request,
    });
    
    // Send confirmation email
    if (ownerResult[0]?.email && context.cloudflare.env.RESEND_API_KEY) {
      try {
        const emailService = createEmailService(context.cloudflare.env.RESEND_API_KEY);
        const planLabel = PLAN_CONFIG[(planType as keyof typeof PLAN_CONFIG) || storeResult[0].planType as keyof typeof PLAN_CONFIG]?.label || 'Paid';
        
        await emailService.sendSubscriptionApprovalEmail({
          email: ownerResult[0].email,
          storeName: storeResult[0].name,
          planName: planLabel,
          startDate,
          endDate,
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    return json({ success: true, action: 'approved' });
  }
  
  // ============ REJECT PAYMENT ============
  if (intent === 'reject') {
    const adminNote = formData.get('adminNote') as string;
    
    await drizzleDb
      .update(stores)
      .set({
        paymentStatus: 'rejected',
        adminNote: adminNote || null,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log to activity logs
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'subscription_rejected',
      entityType: 'subscription',
      entityId: storeId,
      details: JSON.stringify({ adminEmail, adminNote }),
    });

    // Log to admin audit logs
    await logAdminAction({
      db,
      adminId,
      action: 'payment_reject',
      targetType: 'store',
      targetId: storeId,
      targetName: storeResult[0].name || 'Unknown Store',
      details: { adminNote },
      request,
    });
    
    return json({ success: true, action: 'rejected' });
  }
  
  // ============ EXTEND SUBSCRIPTION ============
  if (intent === 'extend') {
    const endDateStr = formData.get('endDate') as string;
    const adminNote = formData.get('adminNote') as string;
    
    if (!endDateStr) {
      return json({ error: 'End date is required' }, { status: 400 });
    }
    
    await drizzleDb
      .update(stores)
      .set({
        subscriptionEndDate: new Date(endDateStr),
        adminNote: adminNote || null,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log the action
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'subscription_extended',
      entityType: 'subscription',
      entityId: storeId,
      details: JSON.stringify({ adminEmail, newEndDate: endDateStr, adminNote }),
    });
    
    return json({ success: true, action: 'extended' });
  }
  
  // ============ CHANGE PLAN (Manual Override) ============
  if (intent === 'change_plan') {
    const newPlan = formData.get('planType') as string;
    const adminNote = formData.get('adminNote') as string;
    
    if (!newPlan || !['free', 'starter', 'premium'].includes(newPlan)) {
      return json({ error: 'Invalid plan type' }, { status: 400 });
    }
    
    // Get current plan and subscription dates
    const currentPlan = storeResult[0].planType;
    
    // Get subscription start date to check if it exists
    const storeWithDates = await drizzleDb
      .select({ subscriptionStartDate: stores.subscriptionStartDate })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);
    
    const isUpgradingFromFree = currentPlan === 'free' && newPlan !== 'free';
    const hasNoStartDate = !storeWithDates[0]?.subscriptionStartDate;
    
    // Calculate subscription dates (1 month from now)
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Build update object
    const updateData: Record<string, unknown> = {
      planType: newPlan as 'free' | 'starter' | 'premium',
      adminNote: adminNote || null,
      updatedAt: new Date(),
    };
    
    // Auto-set subscription dates when upgrading to paid OR if no dates exist yet
    if ((isUpgradingFromFree || hasNoStartDate) && newPlan !== 'free') {
      updateData.subscriptionStartDate = now;
      updateData.subscriptionEndDate = endDate;
      updateData.subscriptionPaymentMethod = 'manual';
    }
    
    await drizzleDb
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, storeId));
    
    // Log the action
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'plan_changed_by_admin',
      entityType: 'subscription',
      entityId: storeId,
      details: JSON.stringify({ 
        adminEmail, 
        previousPlan: currentPlan,
        newPlan,
        adminNote,
        datesAutoSet: (isUpgradingFromFree || hasNoStartDate) && newPlan !== 'free',
      }),
    });
    
    return json({ success: true, action: 'plan_changed', newPlan });
  }
  
  // ============ SET DATES (For stores missing subscription dates) ============
  if (intent === 'set_dates') {
    const durationMonths = parseInt(formData.get('duration') as string) || 1;
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    await drizzleDb
      .update(stores)
      .set({
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionPaymentMethod: 'manual',
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    
    // Log the action
    await drizzleDb.insert(activityLogs).values({
      storeId: storeId,
      userId: adminId,
      action: 'subscription_dates_set',
      entityType: 'subscription',
      entityId: storeId,
      details: JSON.stringify({ 
        adminEmail, 
        durationMonths,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });
    
    return json({ success: true, action: 'dates_set', durationMonths });
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminBilling() {
  const { activeSubscribers, pendingApprovals, expiredSubscriptions, metrics, recentPayments, chartData } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<typeof pendingApprovals[0] | null>(null);
  const fetcher = useFetcher();
  
  const activeTab = searchParams.get('tab') || 'active';
  
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const openApprovalModal = (store: typeof pendingApprovals[0]) => {
    setSelectedStore(store);
    setApprovalModalOpen(true);
  };
  
  // Close modal on successful action
  useEffect(() => {
    if (fetcher.data && typeof fetcher.data === 'object' && 'success' in fetcher.data && (fetcher.data as { success: boolean }).success) {
      setApprovalModalOpen(false);
      setSelectedStore(null);
    }
  }, [fetcher.data]);
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };
  
  // Get today's date in YYYY-MM-DD format for date inputs
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const getNextMonthString = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing Management</h1>
        <p className="text-slate-400">Manage subscriptions and approve manual payments</p>
      </div>
      
      {/* MRR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total MRR */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-emerald-400">Total MRR</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(metrics.totalMRR)}</p>
          <p className="text-xs text-slate-400 mt-1">Monthly Recurring Revenue</p>
        </div>
        
        {/* Manual Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">Manual (bKash/Nagad)</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.manualMRR)}</p>
          <p className="text-xs text-slate-500 mt-1">{Math.round((metrics.manualMRR / (metrics.totalMRR || 1)) * 100)}% of total</p>
        </div>
        
        {/* Active Subscribers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">Active Subscribers</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.activeCount}</p>
          <p className="text-xs text-slate-500 mt-1">Paid stores</p>
        </div>
        
        {/* Pending Approvals */}
        <div className={`rounded-xl p-5 ${metrics.pendingCount > 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900 border border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metrics.pendingCount > 0 ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
              <Clock className={`w-5 h-5 ${metrics.pendingCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
            <span className={`text-sm font-medium ${metrics.pendingCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>Pending Approvals</span>
          </div>
          <p className={`text-2xl font-bold ${metrics.pendingCount > 0 ? 'text-amber-400' : 'text-white'}`}>{metrics.pendingCount}</p>
          <p className="text-xs text-slate-500 mt-1">Awaiting verification</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Revenue Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `৳${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number | undefined) => [`৳${(value || 0).toLocaleString()}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="border-b border-slate-800 overflow-x-auto">
          <nav className="flex min-w-max">
            {[
              { id: 'active', label: 'Active', labelFull: 'Active Subscribers', count: metrics.activeCount },
              { id: 'pending', label: 'Pending', labelFull: 'Pending Approvals', count: metrics.pendingCount },
              { id: 'expired', label: 'Expired', labelFull: 'Expired', count: metrics.expiredCount },
              { id: 'history', label: 'History', labelFull: 'Recent Invoices', count: 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 md:px-6 py-3 md:py-4 text-sm font-medium transition relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">{tab.labelFull}</span>
                <span className="sm:hidden">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1.5 md:ml-2 px-1.5 md:px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? tab.id === 'pending' 
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Table Content */}
        <div className="p-4">
          {/* Active Subscribers Tab */}
          {activeTab === 'active' && (
            <SubscriptionTable
              data={activeSubscribers}
              type="active"
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              copyToClipboard={copyToClipboard}
              copiedId={copiedId}
            />
          )}
          
          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
            <div>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-400">No pending approvals</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Store</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Transaction</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Submitted</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {pendingApprovals.map((store) => (
                        <tr key={store.id} className="hover:bg-slate-800/50 transition">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <Store className="w-5 h-5 text-amber-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{store.name}</p>
                                <p className="text-xs text-slate-500">{store.subdomain}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-300">{store.ownerEmail || 'N/A'}</span>
                            </div>
                            {store.paymentPhone && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-400">{store.paymentPhone}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <PlanBadge plan={store.planType || 'starter'} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono text-amber-400">
                                {store.paymentTransactionId || 'N/A'}
                              </code>
                              <button
                                onClick={() => copyToClipboard(store.paymentTransactionId || '')}
                                className="p-1 hover:bg-slate-700 rounded transition"
                              >
                                {copiedId === store.paymentTransactionId ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-white">{formatCurrency(store.paymentAmount || 0)}</span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-400">
                            {formatDate(store.paymentSubmittedAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openApprovalModal(store)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <fetcher.Form method="post">
                                <input type="hidden" name="intent" value="reject" />
                                <input type="hidden" name="storeId" value={store.id} />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg transition flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </fetcher.Form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Expired Tab */}
          {activeTab === 'expired' && (
            <SubscriptionTable
              data={expiredSubscriptions}
              type="expired"
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              copyToClipboard={copyToClipboard}
              copiedId={copiedId}
            />
          )}

          {/* History Tab (Recent Invoices) */}
          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Store</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentPayments && recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-10 h-10 text-slate-600 mb-3" />
                          <p>No payment history found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentPayments?.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-4 py-4">
                          <span className="font-medium text-white block">{payment.storeName || 'Unknown Store'}</span>
                          <span className="text-xs text-slate-500">TRX: {payment.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <PlanBadge plan={payment.planType || 'active'} />
                        </td>
                        <td className="px-4 py-4 font-medium text-white">
                          ৳{payment.amount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                            payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {(payment.status || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-400">
                          {formatDate(payment.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Approval Modal */}
      {approvalModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Approve Payment</h3>
                <button
                  onClick={() => setApprovalModalOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <fetcher.Form method="post" className="p-6 space-y-4">
              <input type="hidden" name="intent" value="approve" />
              <input type="hidden" name="storeId" value={selectedStore.id} />
              
              {/* Store Info */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedStore.name}</p>
                    <p className="text-sm text-slate-400">{selectedStore.ownerEmail}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-sm">
                  <span className="text-slate-400">Transaction ID:</span>
                  <code className="text-amber-400">{selectedStore.paymentTransactionId}</code>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white font-medium">{formatCurrency(selectedStore.paymentAmount || 0)}</span>
                </div>
              </div>
              
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Plan</label>
                <select
                  name="planType"
                  defaultValue={selectedStore.planType || 'starter'}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="starter">Starter (৳500/mo)</option>
                  <option value="premium">Premium (৳2,000/mo)</option>
                </select>
              </div>
              
              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={getTodayString()}
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={getNextMonthString()}
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              </div>
              
              {/* Admin Note */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Admin Note (optional)</label>
                <textarea
                  name="adminNote"
                  rows={2}
                  placeholder="Any internal notes about this subscription..."
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fetcher.state === 'submitting'}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {fetcher.state === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve & Activate
                    </>
                  )}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function PlanBadge({ plan }: { plan: string }) {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
  if (!config) return <span className="text-slate-400">{plan}</span>;
  
  const Icon = config.icon;
  const colorClasses = {
    gray: 'bg-slate-700 text-slate-300',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400',
  }[config.color];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function SubscriptionTable({
  data,
  type,
  formatDate,
  formatCurrency,
  copyToClipboard,
  copiedId,
}: {
  data: Array<any>;
  type: 'active' | 'expired';
  formatDate: (date: Date | string | null) => string;
  formatCurrency: (amount: number) => string;
  copyToClipboard: (text: string) => void;
  copiedId: string | null;
}) {
  const fetcher = useFetcher();
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {type === 'active' ? (
          <>
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No active subscribers yet</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
            <p className="text-slate-400">No expired subscriptions</p>
          </>
        )}
      </div>
    );
  }
  
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Store</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Change Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((store) => (
              <tr key={store.id} className="hover:bg-slate-800/50 transition">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      type === 'active' ? 'bg-emerald-500/20' : 'bg-slate-700'
                    }`}>
                      <Store className={`w-5 h-5 ${type === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.subdomain}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-slate-300">{store.ownerEmail || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{store.ownerName || ''}</p>
                </td>
                <td className="px-4 py-4">
                  <PlanBadge plan={store.planType || 'free'} />
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${
                    store.subscriptionPaymentMethod === 'manual' ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                    {store.subscriptionPaymentMethod === 'manual' ? 'bKash' : store.subscriptionPaymentMethod || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {store.subscriptionStartDate ? (
                    <div className="text-sm">
                      <span className="text-slate-300">{formatDate(store.subscriptionStartDate)}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span className={type === 'expired' ? 'text-red-400' : 'text-slate-300'}>
                        {formatDate(store.subscriptionEndDate)}
                      </span>
                    </div>
                  ) : (
                    <fetcher.Form method="post" className="flex items-center gap-2">
                      <input type="hidden" name="intent" value="set_dates" />
                      <input type="hidden" name="storeId" value={store.id} />
                      <select
                        name="duration"
                        defaultValue="1"
                        className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        <option value="1">1 মাস</option>
                        <option value="3">3 মাস</option>
                        <option value="6">6 মাস</option>
                        <option value="12">12 মাস</option>
                      </select>
                      <button
                        type="submit"
                        disabled={fetcher.state === 'submitting'}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded transition disabled:opacity-50"
                      >
                        Set
                      </button>
                    </fetcher.Form>
                  )}
                </td>
                <td className="px-4 py-4">
                  {type === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-red-400">
                      <XCircle className="w-4 h-4" />
                      Expired
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <fetcher.Form method="post" className="flex items-center justify-end gap-2">
                    <input type="hidden" name="intent" value="change_plan" />
                    <input type="hidden" name="storeId" value={store.id} />
                    <select
                      name="planType"
                      defaultValue={store.planType || 'free'}
                      className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="premium">Premium</option>
                    </select>
                    <button
                      type="submit"
                      disabled={fetcher.state === 'submitting'}
                      className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                    >
                      {fetcher.state === 'submitting' ? '...' : 'Update'}
                    </button>
                  </fetcher.Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-800">
        {data.map((store) => (
          <div key={store.id} className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  type === 'active' ? 'bg-emerald-500/20' : 'bg-slate-700'
                }`}>
                  <Store className={`w-5 h-5 ${type === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <p className="font-medium text-white">{store.name}</p>
                  <p className="text-xs text-slate-500">{store.subdomain}</p>
                </div>
              </div>
              {type === 'active' ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                  <XCircle className="w-3 h-3" />
                  Expired
                </span>
              )}
            </div>
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Owner</p>
                <p className="text-slate-300 truncate">{store.ownerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Plan</p>
                <PlanBadge plan={store.planType || 'free'} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Payment</p>
                <span className={`text-sm ${store.subscriptionPaymentMethod === 'manual' ? 'text-blue-400' : 'text-slate-300'}`}>
                  {store.subscriptionPaymentMethod === 'manual' ? 'bKash/Nagad' : store.subscriptionPaymentMethod || 'N/A'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Period</p>
                <p className="text-slate-300 text-xs">
                  {formatDate(store.subscriptionStartDate)} → {formatDate(store.subscriptionEndDate)}
                </p>
              </div>
            </div>
            
            {/* Change Plan */}
            <fetcher.Form method="post" className="flex items-center gap-2 pt-2">
              <input type="hidden" name="intent" value="change_plan" />
              <input type="hidden" name="storeId" value={store.id} />
              <select
                name="planType"
                defaultValue={store.planType || 'free'}
                className="flex-1 text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="premium">Premium</option>
              </select>
              <button
                type="submit"
                disabled={fetcher.state === 'submitting'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                {fetcher.state === 'submitting' ? '...' : 'Update'}
              </button>
            </fetcher.Form>
          </div>
        ))}
      </div>
    </>
  );
}
