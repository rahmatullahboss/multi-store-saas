/**
 * Super Admin — FDaaS (Fraud Detection as a Service) Management
 *
 * Route: /admin/fdaas
 *
 * Provides:
 * - Platform-wide FDaaS stats (active keys, total calls, MRR, blocked orders)
 * - All merchants' API keys with usage bars, plan badges, status toggles
 * - MRR revenue chart (last 6 months)
 * - Abuse alerts (keys hitting rate limits)
 * - Approve / Revoke / Change Plan / Block controls
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql, count, sum, gte, and, lt } from 'drizzle-orm';
import { fdaasApiKeys, fdaasUsageLog } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { useState } from 'react';
import {
  Key,
  Shield,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  ChevronDown,
  Activity,
  Zap,
  Lock,
  Unlock,
  Crown,
} from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'FDaaS Management — Super Admin' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PLAN CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  starter: 5_000,
  pro: 50_000,
  enterprise: 999_999_999,
};

const PLAN_PRICE: Record<string, number> = {
  free: 0,
  starter: 999,
  pro: 4_999,
  enterprise: 0,
};

const PLAN_COLOR: Record<string, string> = {
  free: 'bg-slate-700 text-slate-200',
  starter: 'bg-blue-900 text-blue-200',
  pro: 'bg-violet-900 text-violet-200',
  enterprise: 'bg-amber-900 text-amber-200',
};

// ─────────────────────────────────────────────────────────────────────────────
// LOADER
// ─────────────────────────────────────────────────────────────────────────────
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);
  const db = drizzle(context.cloudflare.env.DB);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const [activeKeys, totalCalls, blockedOrders, allKeys] = await Promise.all([
    // Active API keys count
    db
      .select({ count: count() })
      .from(fdaasApiKeys)
      .where(eq(fdaasApiKeys.isActive, 1))
      .then((r) => r[0]?.count ?? 0),

    // Total API calls all time
    db
      .select({ total: sum(fdaasApiKeys.callsTotal) })
      .from(fdaasApiKeys)
      .then((r) => Number(r[0]?.total ?? 0)),

    // Blocked decisions this month
    db
      .select({ count: count() })
      .from(fdaasUsageLog)
      .where(
        and(
          eq(fdaasUsageLog.decision, 'block'),
          gte(fdaasUsageLog.createdAt, monthStart)
        )
      )
      .then((r) => r[0]?.count ?? 0),

    // All API keys for the table
    db
      .select()
      .from(fdaasApiKeys)
      .orderBy(desc(fdaasApiKeys.createdAt))
      .limit(200),
  ]);

  // ── MRR calculation ─────────────────────────────────────────────────────────
  // Sum monthly price of all active paid plans
  const mrr = allKeys
    .filter((k) => k.isActive === 1 && k.plan !== 'free')
    .reduce((sum, k) => sum + (PLAN_PRICE[k.plan] ?? 0), 0);

  // ── MRR history (simulated from key creation dates) ─────────────────────────
  // Group keys created per month × plan price for a 6-month chart
  const mrrHistory: { month: string; mrr: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en', { month: 'short' });
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthMrr = allKeys
      .filter(
        (k) =>
          k.isActive === 1 &&
          k.plan !== 'free' &&
          k.createdAt !== null &&
          k.createdAt <= monthEnd
      )
      .reduce((s, k) => s + (PLAN_PRICE[k.plan] ?? 0), 0);
    mrrHistory.push({ month: label, mrr: monthMrr });
  }

  // ── Abuse alerts: keys > 90% of monthly limit ───────────────────────────────
  const abuseAlerts = allKeys.filter(
    (k) => k.monthlyLimit > 0 && k.callsThisMonth / k.monthlyLimit >= 0.9
  );

  return json({
    stats: { activeKeys, totalCalls, blockedOrders, mrr },
    allKeys,
    mrrHistory,
    abuseAlerts,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION — toggle status / change plan / revoke
// ─────────────────────────────────────────────────────────────────────────────
export async function action({ request, context }: ActionFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);
  const db = drizzle(context.cloudflare.env.DB);

  const form = await request.formData();
  const intent = form.get('intent') as string;
  const keyId = Number(form.get('keyId'));

  if (!keyId || isNaN(keyId)) {
    return json({ success: false, error: 'Invalid key ID' }, { status: 400 });
  }

  switch (intent) {
    case 'activate':
      await db
        .update(fdaasApiKeys)
        .set({ isActive: 1, updatedAt: new Date() })
        .where(eq(fdaasApiKeys.id, keyId));
      return json({ success: true, message: 'API key activated' });

    case 'deactivate':
      await db
        .update(fdaasApiKeys)
        .set({ isActive: 0, updatedAt: new Date() })
        .where(eq(fdaasApiKeys.id, keyId));
      return json({ success: true, message: 'API key deactivated' });

    case 'change_plan': {
      const plan = form.get('plan') as 'free' | 'starter' | 'pro' | 'enterprise';
      const monthlyLimit = PLAN_LIMITS[plan] ?? 100;
      await db
        .update(fdaasApiKeys)
        .set({ plan, monthlyLimit, updatedAt: new Date() })
        .where(eq(fdaasApiKeys.id, keyId));
      return json({ success: true, message: `Plan changed to ${plan}` });
    }

    case 'reset_usage':
      await db
        .update(fdaasApiKeys)
        .set({ callsThisMonth: 0, lastResetAt: new Date(), updatedAt: new Date() })
        .where(eq(fdaasApiKeys.id, keyId));
      return json({ success: true, message: 'Usage reset' });

    default:
      return json({ success: false, error: 'Unknown intent' }, { status: 400 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminFDaaSPage() {
  const { stats, allKeys, mrrHistory, abuseAlerts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredKeys = allKeys.filter((k) => {
    if (planFilter !== 'all' && k.plan !== planFilter) return false;
    if (statusFilter === 'active' && k.isActive !== 1) return false;
    if (statusFilter === 'inactive' && k.isActive !== 0) return false;
    return true;
  });

  // MRR chart max for bar scaling
  const maxMrr = Math.max(...mrrHistory.map((m) => m.mrr), 1);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-violet-600/20 border border-violet-500/30">
                <Shield className="w-5 h-5 text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Ozzyl Guard API</h1>
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-900/40 text-green-400 border border-green-500/30">
                LIVE
              </span>
            </div>
            <p className="text-slate-400 text-sm ml-12">
              Fraud Detection as a Service — Platform Management
            </p>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Key className="w-5 h-5 text-violet-400" />}
            label="Active API Keys"
            value={stats.activeKeys.toLocaleString()}
            sub="across all plans"
            color="violet"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-blue-400" />}
            label="Total API Calls"
            value={stats.totalCalls.toLocaleString()}
            sub="all time"
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            label="Monthly Revenue"
            value={`৳${stats.mrr.toLocaleString()}`}
            sub="current MRR"
            color="green"
          />
          <StatCard
            icon={<Shield className="w-5 h-5 text-red-400" />}
            label="Blocked Orders"
            value={stats.blockedOrders.toLocaleString()}
            sub="this month"
            color="red"
          />
        </div>

        {/* ── Main Grid: Chart + Abuse Alerts ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MRR Chart */}
          <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              Monthly Recurring Revenue (৳)
            </h2>
            <div className="flex items-end gap-3 h-36">
              {mrrHistory.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">
                    {m.mrr > 0 ? `৳${(m.mrr / 1000).toFixed(1)}k` : '—'}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-violet-600/70 hover:bg-violet-500 transition"
                    style={{ height: `${Math.max((m.mrr / maxMrr) * 100, 4)}%` }}
                  />
                  <span className="text-xs text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Abuse Alerts */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Abuse Alerts
              {abuseAlerts.length > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 text-xs border border-amber-500/30">
                  {abuseAlerts.length}
                </span>
              )}
            </h2>
            {abuseAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-28 text-slate-500 text-sm gap-2">
                <CheckCircle className="w-8 h-8 text-green-600/40" />
                No abuse detected
              </div>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {abuseAlerts.map((k) => {
                  const pct = Math.round((k.callsThisMonth / k.monthlyLimit) * 100);
                  return (
                    <div
                      key={k.id}
                      className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-amber-300 truncate max-w-[120px]">
                          {k.name}
                        </span>
                        <span className="text-xs text-amber-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-amber-400"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{k.ownerEmail}</p>
                      <fetcher.Form method="post" className="mt-2">
                        <input type="hidden" name="keyId" value={k.id} />
                        <button
                          name="intent"
                          value="deactivate"
                          className="text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Block key
                        </button>
                      </fetcher.Form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── API Keys Table ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40">
          {/* Table Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              All API Keys
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs ml-1">
                {allKeys.length}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Plan filter */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="text-xs bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Merchant', 'Key', 'Plan', 'Usage (this month)', 'Last Used', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      No API keys found.
                    </td>
                  </tr>
                ) : (
                  filteredKeys.map((k) => (
                    <KeyRow key={k.id} k={k} fetcher={fetcher} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-slate-700/50 text-xs text-slate-500">
            Showing {filteredKeys.length} of {allKeys.length} keys
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: 'violet' | 'blue' | 'green' | 'red';
}) {
  const borderColors = {
    violet: 'border-violet-500/20',
    blue: 'border-blue-500/20',
    green: 'border-green-500/20',
    red: 'border-red-500/20',
  };
  return (
    <div
      className={`rounded-xl border bg-slate-800/40 p-5 ${borderColors[color]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-slate-700/50">{icon}</div>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function KeyRow({
  k,
  fetcher,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  k: any;
  fetcher: ReturnType<typeof useFetcher>;
}) {
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const pct = k.monthlyLimit > 0 ? Math.min(Math.round((k.callsThisMonth / k.monthlyLimit) * 100), 100) : 0;
  const usageBarColor =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-violet-500';

  const isActive = k.isActive === 1;

  return (
    <tr className="hover:bg-slate-700/20 transition">
      {/* Merchant */}
      <td className="px-4 py-3">
        <p className="font-medium text-slate-200 truncate max-w-[160px]">{k.name}</p>
        <p className="text-xs text-slate-500 truncate max-w-[160px]">{k.ownerEmail}</p>
      </td>

      {/* Key prefix */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
          {k.keyPrefix}••••••••
        </span>
      </td>

      {/* Plan badge */}
      <td className="px-4 py-3">
        <div className="relative inline-block">
          <button
            onClick={() => setShowPlanMenu(!showPlanMenu)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLOR[k.plan] ?? 'bg-slate-700 text-slate-300'}`}
          >
            {k.plan === 'enterprise' && <Crown className="w-3 h-3" />}
            {k.plan === 'pro' && <Zap className="w-3 h-3" />}
            {k.plan.charAt(0).toUpperCase() + k.plan.slice(1)}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showPlanMenu && (
            <div className="absolute z-10 top-7 left-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl min-w-[120px]">
              {['free', 'starter', 'pro', 'enterprise'].map((plan) => (
                <fetcher.Form
                  key={plan}
                  method="post"
                  onSubmit={() => setShowPlanMenu(false)}
                >
                  <input type="hidden" name="keyId" value={k.id} />
                  <input type="hidden" name="plan" value={plan} />
                  <button
                    name="intent"
                    value="change_plan"
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-700 transition first:rounded-t-lg last:rounded-b-lg ${k.plan === plan ? 'text-violet-400' : 'text-slate-300'}`}
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    {plan !== 'enterprise' && ` — ৳${PLAN_PRICE[plan]?.toLocaleString()}`}
                  </button>
                </fetcher.Form>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Usage */}
      <td className="px-4 py-3 min-w-[160px]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">{k.callsThisMonth.toLocaleString()}</span>
          <span className="text-slate-500">/ {k.monthlyLimit === 999_999_999 ? '∞' : k.monthlyLimit.toLocaleString()}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${usageBarColor} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500">{pct}%</span>
          <fetcher.Form method="post" className="inline">
            <input type="hidden" name="keyId" value={k.id} />
            <button
              name="intent"
              value="reset_usage"
              title="Reset monthly usage"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <RefreshCcw className="w-3 h-3" />
            </button>
          </fetcher.Form>
        </div>
      </td>

      {/* Last Used */}
      <td className="px-4 py-3 text-xs text-slate-400">
        {k.lastUsedAt
          ? new Date(k.lastUsedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: '2-digit',
            })
          : '—'}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-900/40 text-green-400 border border-green-500/30'
              : 'bg-red-900/40 text-red-400 border border-red-500/30'
          }`}
        >
          {isActive ? (
            <><CheckCircle className="w-3 h-3" /> Active</>
          ) : (
            <><XCircle className="w-3 h-3" /> Inactive</>
          )}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <fetcher.Form method="post" className="inline">
          <input type="hidden" name="keyId" value={k.id} />
          <button
            name="intent"
            value={isActive ? 'deactivate' : 'activate'}
            title={isActive ? 'Deactivate key' : 'Activate key'}
            className={`p-1.5 rounded-lg transition ${
              isActive
                ? 'bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300'
                : 'bg-green-900/30 hover:bg-green-900/60 text-green-400 hover:text-green-300'
            }`}
          >
            {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </fetcher.Form>
      </td>
    </tr>
  );
}
