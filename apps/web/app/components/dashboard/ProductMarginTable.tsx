/**
 * ProductMarginTable — Per-product profit margin breakdown
 *
 * Sortable, paginated table showing:
 * - Product name, units sold, revenue, COGS, gross profit, margin %
 * - CSV export button
 * - Color-coded margin badges
 *
 * @see _bmad-output/planning-artifacts/prd.md — FR-5.6, FR-5.7, E5-S1, E5-S2
 */

import { useState } from 'react';
import { useFetcher } from 'react-router';
import type { ProductMarginRow } from '~/services/pl-report.server';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductMarginTableProps {
  rows: ProductMarginRow[];
  total: number;
  page: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
  onPageChange: (page: number) => void;
  onSortChange: (col: SortCol, dir: 'asc' | 'desc') => void;
  currentSort: SortCol;
  currentDir: 'asc' | 'desc';
}

type SortCol = 'grossProfit' | 'revenue' | 'marginPct' | 'unitsSold';

function formatBDT(amount: number | null): string {
  if (amount === null) return '—';
  return '৳' + Math.round(amount).toLocaleString('en-IN');
}

function MarginBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-gray-400 text-xs">—</span>;
  const color =
    pct >= 40
      ? 'bg-emerald-100 text-emerald-700'
      : pct >= 20
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

function SortIcon({ col, currentSort, currentDir }: { col: SortCol; currentSort: SortCol; currentDir: 'asc' | 'desc' }) {
  if (col !== currentSort) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
  return currentDir === 'desc'
    ? <ArrowDown className="w-3 h-3 text-emerald-600" />
    : <ArrowUp className="w-3 h-3 text-emerald-600" />;
}

export function ProductMarginTable({
  rows,
  total,
  page,
  limit,
  periodStart,
  periodEnd,
  onPageChange,
  onSortChange,
  currentSort,
  currentDir,
}: ProductMarginTableProps) {
  const totalPages = Math.ceil(total / limit);
  const exportFetcher = useFetcher();

  function handleSort(col: SortCol) {
    if (col === currentSort) {
      onSortChange(col, currentDir === 'desc' ? 'asc' : 'desc');
    } else {
      onSortChange(col, 'desc');
    }
  }

  function handleExportCSV() {
    // Build CSV client-side from current data (all pages require server action)
    const headers = ['Product', 'Units Sold', 'Revenue (BDT)', 'COGS (BDT)', 'Gross Profit (BDT)', 'Margin %'];
    const csvRows = rows.map((r) => [
      `"${r.productTitle.replace(/"/g, '""')}"`,
      r.unitsSold,
      r.revenue.toFixed(0),
      r.cogs !== null ? r.cogs.toFixed(0) : '',
      r.grossProfit !== null ? r.grossProfit.toFixed(0) : '',
      r.marginPct !== null ? r.marginPct.toFixed(1) : '',
    ]);
    const csv = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-margins-${periodStart}-${periodEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const colHeaders: { label: string; col: SortCol }[] = [
    { label: 'Revenue', col: 'revenue' },
    { label: 'COGS', col: 'grossProfit' }, // Sort by profit but label COGS
    { label: 'Gross Profit', col: 'grossProfit' },
    { label: 'Margin', col: 'marginPct' },
  ];

  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Product Margin Breakdown
          <span className="ml-2 text-xs font-normal text-gray-500">({total} products)</span>
        </h3>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => handleSort('unitsSold')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Units <SortIcon col="unitsSold" currentSort={currentSort} currentDir={currentDir} />
                  </span>
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('revenue')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Revenue <SortIcon col="revenue" currentSort={currentSort} currentDir={currentDir} />
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">COGS</th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('grossProfit')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Profit <SortIcon col="grossProfit" currentSort={currentSort} currentDir={currentDir} />
                  </span>
                </th>
                <th
                  className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('marginPct')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Margin <SortIcon col="marginPct" currentSort={currentSort} currentDir={currentDir} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No sales data for this period
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {row.productTitle}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.unitsSold}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatBDT(row.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatBDT(row.cogs)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatBDT(row.grossProfit)}</td>
                    <td className="px-4 py-3 text-right">
                      <MarginBadge pct={row.marginPct} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} ({total} products)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
