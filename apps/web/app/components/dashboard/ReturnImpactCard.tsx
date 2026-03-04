/**
 * ReturnImpactCard — Return Loss Analytics
 *
 * Shows the financial impact of returned orders:
 * - Return count
 * - COGS lost (products that went out and came back)
 * - Courier cost lost (paid both ways)
 * - Total return loss
 * - Return rate % with color coding
 *
 * @see _bmad-output/planning-artifacts/prd.md — FR-5.8, E4-S3
 */

import type { PLSummary } from '~/services/pl-report.server';
import { PackageX } from 'lucide-react';

interface ReturnImpactCardProps {
  summary: PLSummary;
}

function formatBDT(amount: number): string {
  return '৳' + Math.round(amount).toLocaleString('en-IN');
}

function ReturnRateBadge({ rate }: { rate: number }) {
  if (rate < 10) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
        🟢 {rate.toFixed(1)}% — Excellent
      </span>
    );
  }
  if (rate < 20) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
        🟡 {rate.toFixed(1)}% — Average
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
      🔴 {rate.toFixed(1)}% — High
    </span>
  );
}

export function ReturnImpactCard({ summary }: ReturnImpactCardProps) {
  if (summary.returnedCount === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">No returns this period</p>
          <p className="text-xs text-emerald-600">Keep up the great work!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageX className="w-5 h-5 text-red-500" />
          <p className="text-sm font-semibold text-red-800">Return Impact This Period</p>
        </div>
        <ReturnRateBadge rate={summary.returnRatePct} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Returned Orders</p>
          <p className="text-xl font-bold text-red-700">{summary.returnedCount}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">COGS Lost</p>
          <p className="text-xl font-bold text-red-700">{formatBDT(summary.returnCOGSLoss)}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Courier Lost</p>
          <p className="text-xl font-bold text-red-700">{formatBDT(summary.returnCourierLoss)}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-lg p-3 border-2 border-red-300">
          <p className="text-xs text-gray-500 mb-1">Total Loss</p>
          <p className="text-xl font-bold text-red-700">{formatBDT(summary.totalReturnLoss)}</p>
        </div>
      </div>

      <p className="text-xs text-red-600">
        Industry average return rate for Bangladesh COD e-commerce: 15–25%. Keep it under 10% for best profitability.
      </p>
    </div>
  );
}
