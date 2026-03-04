/**
 * PLSummaryCards — P&L Waterfall KPI Cards
 *
 * Displays: Gross Revenue → COGS → Gross Profit → Net Profit
 * Used by: /app/reports (P&L tab) and /app/dashboard
 *
 * @see _bmad-output/planning-artifacts/prd.md — FR-5.2, FR-5.3, FR-6.1
 */

import type { PLSummary } from '~/services/pl-report.server';
import { Link } from '@remix-run/react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ExternalLink } from 'lucide-react';

interface PLSummaryCardsProps {
  summary: PLSummary;
  previousSummary?: PLSummary | null;
  showIncompleteWarning?: boolean;
  productsWithNoCost?: number;
  compact?: boolean; // For dashboard (fewer details)
}

function formatBDT(amount: number): string {
  return '৳' + Math.round(amount).toLocaleString('en-IN');
}

function TrendBadge({ current, previous }: { current: number; previous?: number }) {
  if (!previous || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const isUp = pct > 0;
  const isFlat = Math.abs(pct) < 0.5;

  if (isFlat) return <span className="text-xs text-gray-400 flex items-center gap-0.5"><Minus className="w-3 h-3" /> No change</span>;
  return (
    <span className={`text-xs flex items-center gap-0.5 font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isUp ? '+' : ''}{pct.toFixed(1)}% vs last period
    </span>
  );
}

function KPICard({
  label,
  value,
  sub,
  previous,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  previous?: number;
  accent?: 'red' | 'emerald' | 'blue' | 'gray';
  highlight?: boolean;
}) {
  const borderColor = {
    red: 'border-red-200',
    emerald: 'border-emerald-200',
    blue: 'border-blue-200',
    gray: 'border-gray-200',
  }[accent ?? 'gray'];

  const bgColor = highlight ? 'bg-emerald-50' : 'bg-white';

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4 space-y-1`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>
        {formatBDT(value)}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
      <TrendBadge current={value} previous={previous} />
    </div>
  );
}

export function PLSummaryCards({
  summary,
  previousSummary,
  showIncompleteWarning = true,
  productsWithNoCost = 0,
  compact = false,
}: PLSummaryCardsProps) {
  return (
    <div className="space-y-4">
      {/* Incomplete data warning */}
      {showIncompleteWarning && productsWithNoCost > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              {productsWithNoCost} product{productsWithNoCost > 1 ? 's have' : ' has'} no cost price — COGS may be understated
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              COGS coverage: {summary.cogsCompleteness}% of revenue has cost data
            </p>
          </div>
          <Link
            to="/app/products?filter=missing-cost"
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Fix <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* KPI Cards — 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Gross Revenue"
          value={summary.grossRevenue}
          sub={`${summary.ordersCount} delivered orders`}
          previous={previousSummary?.grossRevenue}
          accent="blue"
        />
        <KPICard
          label="Cost of Goods"
          value={summary.totalCOGS}
          sub={summary.cogsCompleteness < 100 ? `${summary.cogsCompleteness}% coverage` : 'Full coverage'}
          previous={previousSummary?.totalCOGS}
          accent="red"
        />
        <KPICard
          label="Gross Profit"
          value={summary.grossProfit}
          sub={`${summary.grossMarginPct.toFixed(1)}% margin`}
          previous={previousSummary?.grossProfit}
          accent="emerald"
        />
        <KPICard
          label="Net Profit"
          value={summary.netProfit}
          sub={`${summary.netMarginPct.toFixed(1)}% margin (after courier)`}
          previous={previousSummary?.netProfit}
          accent="emerald"
          highlight
        />
      </div>

      {/* Courier cost callout */}
      {!compact && summary.courierCost > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-600">🚚 Total courier charges paid</span>
          <span className="text-sm font-semibold text-gray-900">{formatBDT(summary.courierCost)}</span>
        </div>
      )}
    </div>
  );
}
