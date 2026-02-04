import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import type { ComponentType } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { inArray, sql } from 'drizzle-orm';
import { stores } from '@db/schema';
import { Activity, AlertTriangle, BarChart3, Eye, Zap } from 'lucide-react';
import { requireSuperAdmin } from '~/services/auth.server';

const TELEMETRY_PREFIX = 'telemetry:worker:v1';
const SAMPLE_RATE = 0.1;

export const meta: MetaFunction = () => [{ title: 'Worker Monitor - Super Admin' }];

type Category = 'document' | 'api' | 'manifest' | 'asset' | 'other';

type StoreAggregate = {
  storeId: number;
  storeName: string;
  subdomain: string;
  estimatedRequests: number;
  uniqueVisitors: number;
  pageViews: number;
  requestsPerVisitor: number | null;
  requestsPerPageView: number | null;
};

function toHourBucketUTC(date: Date): string {
  return date.toISOString().slice(0, 13).replace(/[-T:]/g, '');
}

function parseTelemetryKey(
  key: string
): { bucket: string; category: Category; storeId: number } | null {
  const match = key.match(/^telemetry:worker:v1:(\d{10}):(document|api|manifest|asset|other):s(\d+)$/);
  if (!match) return null;
  return {
    bucket: match[1],
    category: match[2] as Category,
    storeId: Number.parseInt(match[3], 10),
  };
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  const url = new URL(request.url);
  const hours = Math.max(6, Math.min(72, Number.parseInt(url.searchParams.get('hours') || '24', 10)));
  const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  const sinceUnixSeconds = Math.floor(sinceDate.getTime() / 1000);
  const sinceBucket = toHourBucketUTC(sinceDate);

  const db = drizzle(context.cloudflare.env.DB);

  let visitSummaryRows: unknown[] = [];
  let storeVisitRows: unknown[] = [];
  let dataWarnings: string[] = [];

  try {
    visitSummaryRows = await db.all(sql`
      SELECT
        COUNT(*) as pageViews,
        COUNT(DISTINCT visitor_id) as uniqueVisitors
      FROM page_views
      WHERE created_at >= ${sinceUnixSeconds}
    `);

    storeVisitRows = await db.all(sql`
      SELECT
        store_id as storeId,
        COUNT(*) as pageViews,
        COUNT(DISTINCT visitor_id) as uniqueVisitors
      FROM page_views
      WHERE created_at >= ${sinceUnixSeconds}
      GROUP BY store_id
    `);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[admin.worker-monitor] Failed to query page_views:', message);
    dataWarnings.push('Page view data unavailable right now. Showing telemetry-only metrics.');
  }

  const visitSummary = (visitSummaryRows?.[0] ?? { pageViews: 0, uniqueVisitors: 0 }) as {
    pageViews: number;
    uniqueVisitors: number;
  };

  const storeVisitMap = new Map<number, { pageViews: number; uniqueVisitors: number }>();
  for (const row of storeVisitRows as Array<{ storeId: number; pageViews: number; uniqueVisitors: number }>) {
    storeVisitMap.set(Number(row.storeId), {
      pageViews: Number(row.pageViews) || 0,
      uniqueVisitors: Number(row.uniqueVisitors) || 0,
    });
  }

  let sampledTotal = 0;
  const sampledByCategory: Record<Category, number> = {
    document: 0,
    api: 0,
    manifest: 0,
    asset: 0,
    other: 0,
  };
  const sampledByStore = new Map<number, number>();

  if (context.cloudflare.env.STORE_CACHE) {
    try {
      let cursor: string | undefined;
      do {
        const page = await context.cloudflare.env.STORE_CACHE.list({
          prefix: `${TELEMETRY_PREFIX}:`,
          limit: 1000,
          cursor,
        });

        for (const keyInfo of page.keys) {
          const parsed = parseTelemetryKey(keyInfo.name);
          if (!parsed) continue;
          if (parsed.bucket < sinceBucket) continue;

          const raw = await context.cloudflare.env.STORE_CACHE.get(keyInfo.name);
          const sampledCount = Number.parseInt(raw ?? '0', 10);
          if (!Number.isFinite(sampledCount) || sampledCount <= 0) continue;

          sampledTotal += sampledCount;
          sampledByCategory[parsed.category] += sampledCount;
          sampledByStore.set(parsed.storeId, (sampledByStore.get(parsed.storeId) ?? 0) + sampledCount);
        }

        cursor = page.list_complete ? undefined : page.cursor;
      } while (cursor);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[admin.worker-monitor] Failed to read telemetry KV:', message);
      dataWarnings.push('Telemetry cache unavailable right now. Try again in a few minutes.');
    }
  }

  const estimatedTotalRequests = Math.round(sampledTotal / SAMPLE_RATE);
  const estimatedByCategory = {
    document: Math.round(sampledByCategory.document / SAMPLE_RATE),
    api: Math.round(sampledByCategory.api / SAMPLE_RATE),
    manifest: Math.round(sampledByCategory.manifest / SAMPLE_RATE),
    asset: Math.round(sampledByCategory.asset / SAMPLE_RATE),
    other: Math.round(sampledByCategory.other / SAMPLE_RATE),
  };

  const requestsPerVisitor =
    visitSummary.uniqueVisitors > 0
      ? Number((estimatedTotalRequests / visitSummary.uniqueVisitors).toFixed(2))
      : null;
  const requestsPerPageView =
    visitSummary.pageViews > 0 ? Number((estimatedTotalRequests / visitSummary.pageViews).toFixed(2)) : null;

  const manifestShare =
    estimatedTotalRequests > 0
      ? Number(((estimatedByCategory.manifest / estimatedTotalRequests) * 100).toFixed(2))
      : 0;

  const storeIds = [...sampledByStore.keys()].filter((id) => id > 0);
  const storeRows =
    storeIds.length > 0
      ? await db
          .select({ id: stores.id, name: stores.name, subdomain: stores.subdomain })
          .from(stores)
          .where(inArray(stores.id, storeIds))
      : [];
  const storeMetaMap = new Map(storeRows.map((s) => [s.id, s]));

  const storeAgg: StoreAggregate[] = storeIds
    .map((storeId) => {
      const sampled = sampledByStore.get(storeId) ?? 0;
      const estimatedRequests = Math.round(sampled / SAMPLE_RATE);
      const visitStats = storeVisitMap.get(storeId) ?? { pageViews: 0, uniqueVisitors: 0 };
      const meta = storeMetaMap.get(storeId);
      const ratio =
        visitStats.uniqueVisitors > 0
          ? Number((estimatedRequests / visitStats.uniqueVisitors).toFixed(2))
          : null;
      const pageViewRatio =
        visitStats.pageViews > 0 ? Number((estimatedRequests / visitStats.pageViews).toFixed(2)) : null;

      return {
        storeId,
        storeName: meta?.name || `Store #${storeId}`,
        subdomain: meta?.subdomain || '-',
        estimatedRequests,
        uniqueVisitors: visitStats.uniqueVisitors,
        pageViews: visitStats.pageViews,
        requestsPerVisitor: ratio,
        requestsPerPageView: pageViewRatio,
      };
    })
    .sort((a, b) => b.estimatedRequests - a.estimatedRequests)
    .slice(0, 20);

  const alerts: string[] = [];
  if (requestsPerVisitor !== null && requestsPerVisitor > 8) {
    alerts.push(`High worker amplification detected: ${requestsPerVisitor} requests per visitor.`);
  }
  if (requestsPerPageView !== null && requestsPerPageView > 4) {
    alerts.push(`High requests/page-view detected: ${requestsPerPageView}. This can indicate duplicate fetches.`);
  }
  if (manifestShare > 5) {
    alerts.push(`Manifest traffic is high (${manifestShare}%). Check route discovery/prefetch behavior.`);
  }
  if (estimatedByCategory.api > estimatedByCategory.document * 3 && estimatedByCategory.document > 0) {
    alerts.push('API traffic is disproportionately high compared to document requests.');
  }
  const abnormalStores = storeAgg
    .filter((row) => (row.requestsPerVisitor ?? 0) > 10 || (row.requestsPerPageView ?? 0) > 5)
    .slice(0, 10);
  alerts.push(...dataWarnings);

  return json({
    hours,
    sampleRate: SAMPLE_RATE,
    visitSummary,
    estimatedTotalRequests,
    estimatedByCategory,
    requestsPerVisitor,
    requestsPerPageView,
    manifestShare,
    alerts,
    storeAgg,
    abnormalStores,
  });
}

export default function AdminWorkerMonitorPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const currentHours = Number.parseInt(searchParams.get('hours') || String(data.hours), 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Worker vs Visit Monitor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sampled request telemetry + visitor analytics ({data.sampleRate * 100}% sample rate)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[24, 48, 72].map((h) => (
            <Link
              key={h}
              to={`/admin/worker-monitor?hours=${h}`}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                currentHours === h
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {h}h
            </Link>
          ))}
        </div>
      </div>

      {data.alerts.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="text-amber-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Abnormal Signals
          </div>
          <ul className="mt-2 space-y-1 text-sm text-amber-100">
            {data.alerts.map((alert) => (
              <li key={alert}>- {alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          icon={Zap}
          label="Estimated Worker Requests"
          value={data.estimatedTotalRequests.toLocaleString()}
          color="text-blue-300"
        />
        <MetricCard
          icon={Eye}
          label="Unique Visitors"
          value={Number(data.visitSummary.uniqueVisitors || 0).toLocaleString()}
          color="text-emerald-300"
        />
        <MetricCard
          icon={BarChart3}
          label="Requests / Visitor"
          value={data.requestsPerVisitor !== null ? data.requestsPerVisitor.toFixed(2) : '-'}
          color="text-violet-300"
        />
        <MetricCard
          icon={BarChart3}
          label="Requests / Page View"
          value={data.requestsPerPageView !== null ? data.requestsPerPageView.toFixed(2) : '-'}
          color="text-sky-300"
        />
        <MetricCard
          icon={Activity}
          label="Manifest Share"
          value={`${data.manifestShare.toFixed(2)}%`}
          color="text-amber-300"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-white font-semibold mb-3">Traffic Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <StatBlock label="Document" value={data.estimatedByCategory.document} />
          <StatBlock label="API" value={data.estimatedByCategory.api} />
          <StatBlock label="Manifest" value={data.estimatedByCategory.manifest} />
          <StatBlock label="Assets" value={data.estimatedByCategory.asset} />
          <StatBlock label="Other" value={data.estimatedByCategory.other} />
        </div>
      </div>

      {data.abnormalStores.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="text-red-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Store-Level Anomaly Detection
          </div>
          <ul className="mt-2 space-y-1 text-sm text-red-100">
            {data.abnormalStores.map((row) => (
              <li key={row.storeId}>
                {row.storeName} ({row.subdomain}): req/visitor {row.requestsPerVisitor ?? '-'}, req/page-view{' '}
                {row.requestsPerPageView ?? '-'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-white font-semibold">Top Stores by Estimated Worker Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/70 text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-left px-4 py-3">Estimated Requests</th>
                <th className="text-left px-4 py-3">Unique Visitors</th>
                <th className="text-left px-4 py-3">Page Views</th>
                <th className="text-left px-4 py-3">Requests / Visitor</th>
                <th className="text-left px-4 py-3">Requests / Page View</th>
              </tr>
            </thead>
            <tbody>
              {data.storeAgg.map((row) => (
                <tr key={row.storeId} className="border-t border-slate-800 text-slate-200">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.storeName}</div>
                    <div className="text-xs text-slate-400">{row.subdomain}</div>
                  </td>
                  <td className="px-4 py-3">{row.estimatedRequests.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.uniqueVisitors.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.pageViews.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {row.requestsPerVisitor !== null ? row.requestsPerVisitor.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {row.requestsPerPageView !== null ? row.requestsPerPageView.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
              {data.storeAgg.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No telemetry yet. Wait a few minutes after storefront traffic.
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

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Icon className={`w-4 h-4 ${color}`} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
      <div className="text-slate-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-white font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}
