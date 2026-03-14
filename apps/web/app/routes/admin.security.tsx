
import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useRevalidator } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, sql, and, like, gte } from 'drizzle-orm';
import { systemLogs } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  UserX, 
  RefreshCw,
  Search,
  Globe
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Security Overview - Super Admin' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, context.cloudflare.env, db);
  const drizzleDb = drizzle(db);
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // 1. Metrics (Last 24h)
  const metricsResult = await drizzleDb.all<{ count: number }>(sql`
    SELECT count(*) as count
    FROM system_logs
    WHERE created_at >= ${twentyFourHoursAgo.getTime()}
    AND (
      message LIKE 'Login failed%' OR 
      context LIKE '%"type":"auth_failure"%'
    )
  `);
  
  const totalFailedLogins = Number((metricsResult[0] as unknown as { count: number }).count) || 0;

  // 2. Top Offending IPs (Last 24h)
  // Extract IP from JSON context is hard in SQL, so we'll fetch logs and aggregate in JS for simplicity or use text pattern matching
  // Using a simpler approach: Get all auth failure logs and process structure
  const recentFailures = await drizzleDb
    .select()
    .from(systemLogs)
    .where(and(
        gte(systemLogs.createdAt, twentyFourHoursAgo),
        like(systemLogs.message, 'Login failed%')
    ))
    .orderBy(desc(systemLogs.createdAt))
    .limit(100);

  // Process for IPs
  const ipCounts: Record<string, number> = {};
  recentFailures.forEach(log => {
      try {
          const ctx = JSON.parse(log.context || '{}');
          const ip = ctx.ip || 'Unknown';
          ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      } catch (e) {
          // ignore
      }
  });

  const topOffenders = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // 3. Recent Security Logs (paginated)
  const logs = await drizzleDb
    .select()
    .from(systemLogs)
    .where(like(systemLogs.message, 'Login failed%'))
    .orderBy(desc(systemLogs.createdAt))
    .limit(50);
    
  return json({
    metrics: {
        totalFailedLogins,
        suspiciousIPs: topOffenders.length
    },
    topOffenders,
    logs
  });
}

export default function AdminSecurity() {
  const { metrics, topOffenders, logs } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const isRefreshing = revalidator.state === 'loading';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            Security Overview
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor authentication failures and brute force attempts
          </p>
        </div>
        <button 
          onClick={() => revalidator.revalidate()}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
           <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
               <Lock className="w-5 h-5 text-orange-400" />
             </div>
             <span className="text-sm font-medium text-slate-400">Failed Logins (24h)</span>
           </div>
           <p className="text-3xl font-bold text-white">{metrics.totalFailedLogins}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
           <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
               <Globe className="w-5 h-5 text-red-400" />
             </div>
             <span className="text-sm font-medium text-slate-400">Suspicious IPs</span>
           </div>
           <p className="text-3xl font-bold text-white">{metrics.suspiciousIPs}</p>
           <p className="text-xs text-slate-500 mt-1">IPs with multiple failures</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Logs Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <UserX className="w-4 h-4 text-slate-400" />
                    Recent Auth Failures
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Time</th>
                            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Reason</th>
                            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                    No security incidents found. System is safe!
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => {
                                let ctx: any = {};
                                try { ctx = JSON.parse(log.context || '{}'); } catch(e) {}
                                
                                return (
                                    <tr key={log.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                                            {new Date(log.createdAt || '').toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                {ctx.reason || 'AUTH_FAILURE'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            <div>
                                                <span className="text-slate-500">Email:</span> {ctx.email || 'Unknown'}
                                            </div>
                                            <div className="text-xs font-mono text-slate-500 mt-1">
                                                IP: {ctx.ip || 'Unknown'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Top Offenders List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Top Offenders (24h)
            </h3>
            <div className="space-y-3">
                {topOffenders.length === 0 ? (
                    <p className="text-sm text-slate-500">No repeat offenders detected.</p>
                ) : (
                    topOffenders.map((offender, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-mono text-slate-400">
                                    {i + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-mono text-white">{offender.ip}</p>
                                    <p className="text-xs text-red-400 font-medium">Blocked?</p> 
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-slate-200">{offender.count}</span>
                                <p className="text-[10px] text-slate-500 uppercase">Failures</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                    <strong>Tip:</strong> Users with &gt; 5 failures in 10 mins trigger an automated email alert to super admins.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}
