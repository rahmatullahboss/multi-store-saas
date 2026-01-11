import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, Outlet, useLocation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sql, gte } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { Sparkles, MessageSquare, Settings, Book, Bot, Zap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '~/contexts/LanguageContext';
import { getUsageStats } from '~/utils/plans.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 }); // Or redirect to login

  const db = drizzle(context.cloudflare.env.DB, { schema });

  // Check if store has Agent enabled
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, storeId),
    columns: { isCustomerAiEnabled: true, aiPlan: true }
  });

  // Fetch Agent
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId)
  });

  // Get Usage Stats
  const usageStats = await getUsageStats(context.cloudflare.env.DB, storeId);

  // Calculate Metrics
  const [convCount] = await db.select({ count: count() })
    .from(schema.conversations)
    .where(eq(schema.conversations.agentId, agent?.id || 0));

  const [leadsCount] = await db.select({ count: count() })
    .from(schema.leadsData)
    .innerJoin(schema.conversations, eq(schema.leadsData.conversationId, schema.conversations.id))
    .where(eq(schema.conversations.agentId, agent?.id || 0));

  const [ordersCount] = await db.select({ count: count() })
      .from(schema.orders)
      .where(eq(schema.orders.storeId, storeId));

  // Daily Stats (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyDataRaw = await db.all(sql`
    SELECT 
        strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') as date,
        count(*) as count
    FROM conversations
    WHERE agent_id = ${agent?.id || 0}
    AND created_at >= ${sevenDaysAgo.getTime()}
    GROUP BY date
    ORDER BY date ASC
  `);

  return json({ 
    agent, 
    isLocked: !store?.isCustomerAiEnabled,
    aiPlan: store?.aiPlan,
    stats: {
        conversations: convCount?.count || 0,
        leads: leadsCount?.count || 0, 
        orders: ordersCount?.count || 0,
        daily: dailyDataRaw,
        usage: usageStats.aiMessages // { current, limit, percentage }
    }
  });
};

export default function AgentDashboard() {
  const { agent, isLocked, stats, aiPlan } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { t, lang } = useTranslation();

  const tabs = [
    { name: t('overview'), to: '/app/agent', icon: Bot, exact: true },
    { name: t('inbox'), to: '/app/agent/history', icon: MessageSquare },
    { name: t('configuration'), to: '/app/agent/config', icon: Settings },
    { name: t('chatSimulator'), to: '/app/agent/chat', icon: Sparkles },
    { name: t('knowledgeBase'), to: '/app/agent/knowledge', icon: Book },
  ];

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
        <p className="text-gray-500 max-w-md mb-6">
          AI Agent is a premium feature. Upgrade your plan to enable 24/7 automated customer support.
        </p>
        <Link 
          to="/app/billing" 
          className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <img src="/ozzyl-logo-small.png" alt="Ozzyl" className="w-8 h-8" />
            {t('aiAgentManager')}
          </h1>
          <p className="text-gray-500">{t('aiAgentDescription')}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${agent?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {agent?.isActive ? t('active') : t('inactive')}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = tab.exact 
                ? location.pathname === tab.to
                : location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.name}
                to={tab.to}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Child Routes */}
      <div className="min-h-[500px]">
        {location.pathname === '/app/agent' ? (
             <div className="space-y-6">
                 {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Usage Card */}
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-gray-500 text-sm font-medium">{lang === 'bn' ? 'ম্যাসেজ লিমিট' : 'Message Usage'}</span>
                                <div className="text-xs text-emerald-600 font-bold mt-1 uppercase">{aiPlan || 'Trial'} Plan</div>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mb-2">
                             <div className="text-2xl font-bold text-gray-900">
                                {stats.usage.current.toLocaleString()} 
                                <span className="text-sm font-normal text-gray-400"> / {stats.usage.limit === Infinity ? '∞' : (stats.usage.limit === 0 && stats.usage.current > 0 ? 'Trial' : stats.usage.limit.toLocaleString())}</span>
                             </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    stats.usage.percentage >= 90 ? 'bg-red-500' : 
                                    stats.usage.percentage >= 70 ? 'bg-amber-500' : 
                                    'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(stats.usage.percentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">{t('totalConversations')}</span>
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats?.conversations || 0}</div>
                    </div>
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">{t('leadsCaptured')}</span>
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats?.leads || 0}</div>
                    </div>
                     <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm font-medium">{t('totalOrders')}</span>
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats?.orders || 0}</div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">{t('activityOverview7Days')}</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.daily && stats.daily.length > 0 ? stats.daily : [{date: 'Today', count: 0}]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Fallback if no agent is configured, though cards will show 0 */}
                {!agent && (
                    <div className="text-center py-4">
                        <p className="text-gray-500 mb-4">{t('noActiveAgentFound')}</p>
                        <Link 
                            to="/app/agent/config" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            {t('setupAgent')}
                        </Link>
                    </div>
                )}
             </div>
        ) : (
             <Outlet />
        )}
      </div>
    </div>
  );
}
