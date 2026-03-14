import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link, useSearchParams } from 'react-router';
import type { ComponentType } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { inArray, sql } from 'drizzle-orm';
import { stores } from '@db/schema';
import { Activity, AlertTriangle, BarChart3, Eye, Zap } from 'lucide-react';
import { requireSuperAdmin } from '~/services/auth.server';

const TELEMETRY_PREFIX = 'telemetry:worker:v1';
const SAMPLE_RATE = 0.1;
const MIN_VISITORS_FOR_ALERT = 25;
const MIN_PAGE_VIEWS_FOR_ALERT = 100;
const MIN_STORE_VISITORS_FOR_ALERT = 10;
const MIN_STORE_PAGE_VIEWS_FOR_ALERT = 30;
const REQ_PER_VISITOR_WARN = 12;
const REQ_PER_PAGE_VIEW_WARN = 3.5;
const REQ_PER_PAGE_VIEW_CRITICAL = 5;
const MANIFEST_SHARE_WARN = 8;

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

type EndpointAggregate = {
  storeId: number;
  storeName: string;
  subdomain: string;
  path: string;
  estimatedRequests: number;
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

function parseEndpointTelemetryKey(
  key: string
): { bucket: string; storeId: number; path: string } | null {
  const match = key.match(/^telemetry:worker:v1:endpoint:(\d{10}):s(\d+):(.+)$/);
  if (!match) return null;

  let path = '';
  try {
    path = decodeURIComponent(match[3]);
  } catch {
    return null;
  }

  return {
    bucket: match[1],
    storeId: Number.parseInt(match[2], 10),
    path,
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
  const dataWarnings: string[] = [];

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
  const sampledByEndpoint = new Map<string, number>();
  const endpointStoreIds = new Set<number>();

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
        const endpointParsed = parsed ? null : parseEndpointTelemetryKey(keyInfo.name);
        if (!parsed && !endpointParsed) continue;

        const bucket = parsed ? parsed.bucket : endpointParsed!.bucket;
        if (bucket < sinceBucket) continue;

        const raw = await context.cloudflare.env.STORE_CACHE.get(keyInfo.name);
        const sampledCount = Number.parseInt(raw ?? '0', 10);
        if (!Number.isFinite(sampledCount) || sampledCount <= 0) continue;

        if (parsed) {
          sampledTotal += sampledCount;
          sampledByCategory[parsed.category] += sampledCount;
          sampledByStore.set(parsed.storeId, (sampledByStore.get(parsed.storeId) ?? 0) + sampledCount);
          continue;
        }

        const endpointKey = `${endpointParsed!.storeId}|${endpointParsed!.path}`;
        sampledByEndpoint.set(endpointKey, (sampledByEndpoint.get(endpointKey) ?? 0) + sampledCount);
        if (endpointParsed!.storeId > 0) endpointStoreIds.add(endpointParsed!.storeId);
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

  const storeIds = [...new Set([...sampledByStore.keys(), ...endpointStoreIds])].filter((id) => id > 0);
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

  const topEndpoints: EndpointAggregate[] = [...sampledByEndpoint.entries()]
    .map(([key, sampled]) => {
      const [storeIdRaw, path] = key.split('|');
      const storeId = Number.parseInt(storeIdRaw, 10);
      const estimatedRequests = Math.round(sampled / SAMPLE_RATE);
      const meta = storeMetaMap.get(storeId);
      return {
        storeId,
        storeName: meta?.name || `Store #${storeId}`,
        subdomain: meta?.subdomain || '-',
        path,
        estimatedRequests,
      };
    })
    .sort((a, b) => b.estimatedRequests - a.estimatedRequests)
    .slice(0, 15);

  const alerts: string[] = [];
  const enoughGlobalSample =
    Number(visitSummary.uniqueVisitors) >= MIN_VISITORS_FOR_ALERT ||
    Number(visitSummary.pageViews) >= MIN_PAGE_VIEWS_FOR_ALERT;

  if (enoughGlobalSample && requestsPerVisitor !== null && requestsPerVisitor > REQ_PER_VISITOR_WARN) {
    alerts.push(
      `High worker amplification detected: ${requestsPerVisitor} requests per visitor (threshold ${REQ_PER_VISITOR_WARN}).`
    );
  }
  if (enoughGlobalSample && requestsPerPageView !== null && requestsPerPageView > REQ_PER_PAGE_VIEW_WARN) {
    alerts.push(
      `High requests/page-view detected: ${requestsPerPageView} (threshold ${REQ_PER_PAGE_VIEW_WARN}). This can indicate duplicate fetches.`
    );
  }
  if (manifestShare > MANIFEST_SHARE_WARN) {
    alerts.push(`Manifest traffic is high (${manifestShare}%). Check route discovery/prefetch behavior.`);
  }
  if (estimatedByCategory.api > estimatedByCategory.document * 3 && estimatedByCategory.document > 0) {
    alerts.push('API traffic is disproportionately high compared to document requests.');
  }
  const abnormalStores = storeAgg
    .filter(
      (row) =>
        (row.uniqueVisitors >= MIN_STORE_VISITORS_FOR_ALERT ||
          row.pageViews >= MIN_STORE_PAGE_VIEWS_FOR_ALERT) &&
        ((row.requestsPerVisitor ?? 0) > REQ_PER_VISITOR_WARN ||
          (row.requestsPerPageView ?? 0) > REQ_PER_PAGE_VIEW_CRITICAL)
    )
    .slice(0, 10);
  alerts.push(...dataWarnings);

  const recommendations: string[] = [];
  if (!enoughGlobalSample) {
    recommendations.push(
      `Low sample window: collect at least ${MIN_VISITORS_FOR_ALERT} visitors or ${MIN_PAGE_VIEWS_FOR_ALERT} page views before acting on anomalies.`
    );
  }
  if (manifestShare > MANIFEST_SHARE_WARN) {
    recommendations.push(
      'High /__manifest share: keep route discovery in initial mode or reduce aggressive prefetch on links.'
    );
  }
  if (requestsPerPageView !== null && requestsPerPageView > REQ_PER_PAGE_VIEW_WARN) {
    recommendations.push(
      'Check duplicate client fetches: inspect Network tab for repeated calls, disable duplicate loaders/effects, and de-duplicate background polling.'
    );
  }
  if (estimatedByCategory.api > estimatedByCategory.document * 3 && estimatedByCategory.document > 0) {
    recommendations.push(
      'API-heavy pattern: add cache headers for read APIs and move repeated read paths to edge cache/KV where possible.'
    );
  }
  if (abnormalStores.length > 0) {
    recommendations.push(
      'Open affected store in /admin/worker-monitor and compare its top route/category mix; then review theme scripts, third-party widgets, and auto-refresh intervals.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push('No critical anomaly signal. Continue monitoring 24h and compare against 7-day baseline.');
  }

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
    recommendations,
    topEndpoints,
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

      <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4">
        <div className="text-sky-300 font-semibold">Next Steps</div>
        <ul className="mt-2 space-y-1 text-sm text-sky-100">
          {data.recommendations.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>

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

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-white font-semibold">Top Noisy Endpoints (Sampled)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/70 text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-left px-4 py-3">Path</th>
                <th className="text-left px-4 py-3">Estimated Requests</th>
              </tr>
            </thead>
            <tbody>
              {data.topEndpoints.map((row) => (
                <tr key={`${row.storeId}-${row.path}`} className="border-t border-slate-800 text-slate-200">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.storeName}</div>
                    <div className="text-xs text-slate-400">{row.subdomain}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.path}</td>
                  <td className="px-4 py-3">{row.estimatedRequests.toLocaleString()}</td>
                </tr>
              ))}
              {data.topEndpoints.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    No endpoint telemetry yet. Generate traffic and refresh in a few minutes.
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
