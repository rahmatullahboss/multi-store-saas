/**
 * /app/new-builder/:pageId/analytics
 *
 * Analytics dashboard for a specific published page.
 * Shows last 7 days stats: views, unique visitors, scroll depth,
 * CTA clicks, device breakdown, daily line chart, and section heatmap.
 *
 * Multi-tenancy: ALL queries filtered by store_id.
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { requireTenant } from '~/lib/tenant-guard.server';
import { getPageAnalytics, getSectionHeatmap } from '~/lib/analytics/analytics.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { builderPages } from '@db/schema_page_builder';
import {
  ArrowLeft,
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.pageTitle ? `Analytics — ${data.pageTitle}` : 'Page Analytics';
  return [{ title: `${title} - Ozzyl` }];
};

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
  const pageId = params.pageId;

  if (!pageId) {
    throw new Response('Page ID required', { status: 400 });
  }

  const env = context.cloudflare.env;
  const db = env.DB;
  const odb = drizzle(db);

  // Verify page belongs to this store (multi-tenancy gate)
  const [page] = await odb
    .select({ id: builderPages.id, title: builderPages.title, slug: builderPages.slug })
    .from(builderPages)
    .where(and(eq(builderPages.id, pageId), eq(builderPages.storeId, storeId)))
    .limit(1);

  if (!page) {
    throw new Response('Page not found or access denied', { status: 404 });
  }

  // Fetch last 7 days analytics + today's section heatmap — parallel
  const [analytics, sectionStats] = await Promise.all([
    getPageAnalytics(db, pageId, storeId, 7),
    getSectionHeatmap(db, pageId, storeId),
  ]);

  return json({
    pageId,
    pageTitle: page.title || page.slug,
    pageSlug: page.slug,
    dailyStats: analytics.dailyStats,
    totals: analytics.totals,
    dateRange: analytics.dateRange,
    sectionStats,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PageAnalyticsDashboard() {
  const { pageId, pageTitle, dailyStats, totals, dateRange, sectionStats } =
    useLoaderData<typeof loader>();

  // Device breakdown percentages
  const totalDeviceViews = totals.mobileViews + totals.tabletViews + totals.desktopViews;
  const mobilePct =
    totalDeviceViews > 0 ? Math.round((totals.mobileViews / totalDeviceViews) * 100) : 0;
  const tabletPct =
    totalDeviceViews > 0 ? Math.round((totals.tabletViews / totalDeviceViews) * 100) : 0;
  const desktopPct =
    totalDeviceViews > 0 ? Math.round((totals.desktopViews / totalDeviceViews) * 100) : 0;

  // SVG line chart data
  const chartWidth = 560;
  const chartHeight = 120;
  const maxViews = Math.max(...dailyStats.map((d) => d.totalViews), 1);
  const points = dailyStats.map((d, i) => {
    const x = dailyStats.length > 1 ? (i / (dailyStats.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - (d.totalViews / maxViews) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = points.join(' ');

  // Section heatmap max for normalising bars
  const maxSectionViews = Math.max(...sectionStats.map((s) => s.viewCount), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            to={`/app/new-builder/${pageId}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            এডিটরে ফিরুন
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
            <p className="text-xs text-gray-500">
              গত ৭ দিন &mdash; {formatDateBn(dateRange.from)} থেকে {formatDateBn(dateRange.to)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            icon={<Eye className="w-5 h-5 text-indigo-500" />}
            label="মোট ভিউ"
            value={totals.totalViews.toLocaleString('bn-BD')}
            bg="bg-indigo-50"
          />
          <KpiCard
            icon={<Users className="w-5 h-5 text-emerald-500" />}
            label="অনন্য ভিজিটর"
            value={totals.uniqueVisitors.toLocaleString('bn-BD')}
            bg="bg-emerald-50"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
            label="গড় স্ক্রল গভীরতা"
            value={`${Math.round(totals.avgScrollDepth)}%`}
            bg="bg-amber-50"
          />
          <KpiCard
            icon={<MousePointerClick className="w-5 h-5 text-rose-500" />}
            label="CTA ক্লিক"
            value={totals.ctaClicks.toLocaleString('bn-BD')}
            bg="bg-rose-50"
          />
        </div>

        {/* ── Line Chart + Device Breakdown side by side ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Line Chart */}
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              দৈনিক পেজ ভিউ (গত ৭ দিন)
            </h2>
            {dailyStats.length === 0 ? (
              <EmptyState text="এখনো কোনো ডেটা নেই" />
            ) : (
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
                  className="w-full"
                  aria-label="দৈনিক পেজ ভিউ চার্ট"
                >
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = chartHeight - frac * chartHeight;
                    return (
                      <line
                        key={frac}
                        x1={0}
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                    );
                  })}

                  {/* Area fill */}
                  {polyline && (
                    <polygon
                      points={`0,${chartHeight} ${polyline} ${chartWidth},${chartHeight}`}
                      fill="rgba(99,102,241,0.1)"
                    />
                  )}

                  {/* Line */}
                  {polyline && (
                    <polyline
                      points={polyline}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data points */}
                  {dailyStats.map((d, i) => {
                    const x =
                      dailyStats.length > 1
                        ? (i / (dailyStats.length - 1)) * chartWidth
                        : chartWidth / 2;
                    const y = chartHeight - (d.totalViews / maxViews) * chartHeight;
                    return (
                      <circle key={d.date} cx={x} cy={y} r={3.5} fill="#6366f1" />
                    );
                  })}

                  {/* X-axis labels */}
                  {dailyStats.map((d, i) => {
                    const x =
                      dailyStats.length > 1
                        ? (i / (dailyStats.length - 1)) * chartWidth
                        : chartWidth / 2;
                    return (
                      <text
                        key={`lbl-${d.date}`}
                        x={x}
                        y={chartHeight + 20}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#9ca3af"
                      >
                        {shortDate(d.date)}
                      </text>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">ডিভাইস বিভাজন</h2>
            <div className="flex flex-col gap-3 flex-1 justify-center">
              <DevicePill
                icon={<Smartphone className="w-4 h-4" />}
                label="মোবাইল"
                pct={mobilePct}
                color="bg-indigo-500"
              />
              <DevicePill
                icon={<Monitor className="w-4 h-4" />}
                label="ডেস্কটপ"
                pct={desktopPct}
                color="bg-emerald-500"
              />
              <DevicePill
                icon={<Tablet className="w-4 h-4" />}
                label="ট্যাবলেট"
                pct={tabletPct}
                color="bg-amber-500"
              />
            </div>
            {totalDeviceViews === 0 && (
              <p className="text-xs text-gray-400 text-center mt-2">এখনো কোনো ডেটা নেই</p>
            )}
          </div>
        </div>

        {/* ── Section Heatmap ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            সেকশন হিটম্যাপ (আজকের ডেটা)
          </h2>
          {sectionStats.length === 0 ? (
            <EmptyState text="আজ কোনো সেকশন ভিউ রেকর্ড হয়নি" />
          ) : (
            <div className="space-y-3">
              {sectionStats.map((s) => {
                const barPct = Math.round((s.viewCount / maxSectionViews) * 100);
                return (
                  <div key={s.sectionId} className="flex items-center gap-3">
                    <div className="w-32 shrink-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{s.sectionType}</p>
                      <p className="text-xs text-gray-400 truncate">{s.sectionId}</p>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <div className="w-24 text-right shrink-0">
                      <span className="text-xs font-semibold text-gray-700">
                        {s.viewCount.toLocaleString('bn-BD')} ভিউ
                      </span>
                      {s.clickCount > 0 && (
                        <span className="ml-1 text-xs text-rose-500">
                          · {s.clickCount.toLocaleString('bn-BD')} ক্লিক
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white/60`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function DevicePill({
  icon,
  label,
  pct,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`p-1.5 rounded-lg ${color} text-white`}>{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 flex items-center justify-center">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

// ── Date formatting helpers ───────────────────────────────────────────────────

/** "2026-02-18" → "১৮ ফেব" */
function formatDateBn(iso: string): string {
  const [, m, d] = iso.split('-');
  const bnMonths = [
    'জান', 'ফেব', 'মার', 'এপ্র', 'মে', 'জুন',
    'জুল', 'আগ', 'সেপ', 'অক্ট', 'নভ', 'ডিস',
  ];
  const month = bnMonths[parseInt(m, 10) - 1] ?? m;
  return `${toBnDigits(parseInt(d, 10))} ${month}`;
}

/** "2026-02-18" → "১৮/২" (short for chart x-axis) */
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${toBnDigits(parseInt(d, 10))}/${toBnDigits(parseInt(m, 10))}`;
}

function toBnDigits(n: number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n)
    .split('')
    .map((c) => bnDigits[parseInt(c)] ?? c)
    .join('');
}
