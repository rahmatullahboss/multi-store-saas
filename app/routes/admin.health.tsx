import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Form, useNavigation, useSubmit, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, sql, like, gte } from 'drizzle-orm';
import { systemLogs } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { logSystemEvent } from '~/services/logger.server';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter, 
  XCircle, 
  Terminal,
  Clock,
  RefreshCw,
  Bug
} from 'lucide-react';
import { useState } from 'react';

export const meta = () => {
  return [{ title: 'System Health - Super Admin' }];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'test_error') {
    await logSystemEvent(
      db, 
      'error', 
      'Manual Test Error Triggered', 
      { triggeredBy: 'admin', component: 'SystemHealth' },
      new Error('This is a simulated system error for testing purposes.')
    );
    return json({ success: true });
  }
  
  return json({ success: false });
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  
  const drizzleDb = drizzle(db);
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || '';
  const level = url.searchParams.get('level') || 'all';
  
  // Metrics (Last 24h)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const metricsRaw = await drizzleDb.all(sql`
    SELECT 
      count(*) as total,
      sum(case when level = 'error' or level = 'fatal' then 1 else 0 end) as errors,
      sum(case when level = 'warn' then 1 else 0 end) as warnings
    FROM system_logs
    WHERE created_at >= ${oneDayAgo.getTime()}
  `);
  
  const metrics = metricsRaw[0] as { total: number, errors: number, warnings: number };
  
  // Logs Query
  let query = drizzleDb.select().from(systemLogs);
  
  // Apply Filters
  const filters = [];
  if (search) {
    filters.push(like(systemLogs.message, `%${search}%`));
  }
  if (level !== 'all') {
    filters.push(eq(systemLogs.level, level as 'info' | 'warn' | 'error'));
  }
  
  const logs = await query
    .where(and(...filters))
    .orderBy(desc(systemLogs.createdAt))
    .limit(100);
    
  return json({ logs, metrics, search, level });
}

export default function AdminHealth() {
  const { logs, metrics, search, level } = useLoaderData<typeof loader>();
  const [searchValue, setSearchValue] = useState(search);
  const submit = useSubmit();
  const navigation = useNavigation();
  const isRefreshing = navigation.state === 'loading';
  const isTesting = navigation.formData?.get('intent') === 'test_error';
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchValue) params.set('q', searchValue);
    else params.delete('q');
    submit(params);
  };
  
  const handleLevelChange = (newLevel: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('level', newLevel);
    submit(params);
  };

  const getLevelColor = (l: string) => {
    switch(l) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'fatal': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'warn': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            System Health
          </h1>
          <p className="text-slate-400">Monitor application performance and error logs</p>
        </div>
        <div className="flex items-center gap-3">
            <Form method="post">
                <button 
                  type="submit" 
                  name="intent" 
                  value="test_error"
                  disabled={isTesting}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
                >
                    <Bug className="w-4 h-4" />
                    {isTesting ? 'Simulating...' : 'Simulate Error'}
                </button>
            </Form>
            <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Refresh"
            >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metrics.errors > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
              {metrics.errors > 0 ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-400">System Status</span>
          </div>
          <p className={`text-2xl font-bold ${metrics.errors > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {metrics.errors > 0 ? 'Degraded' : 'Healthy'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Based on last 24h errors</p>
        </div>
        
        {/* Error Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">Error Count (24h)</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.errors || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Fatal or Error level logs</p>
        </div>
        
        {/* Total Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">Activity (24h)</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.total || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Total log entries</p>
        </div>
      </div>
      
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'info', 'warn', 'error'].map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition ${
                level === l 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Level</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Message</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-xs font-mono font-medium border ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 flex items-center gap-2">
                       <Clock className="w-3 h-3" />
                       {new Date(log.createdAt || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 max-w-lg">
                      <div className="text-sm text-slate-200 font-mono break-all line-clamp-2 group-hover:line-clamp-none transition-all">
                        {log.message}
                      </div>
                      {log.stack && (
                        <details className="mt-1">
                          <summary className="text-xs text-red-400/70 cursor-pointer hover:text-red-400">View Stack Trace</summary>
                          <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono max-w-xs truncate">
                      {log.context || '-'}
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
