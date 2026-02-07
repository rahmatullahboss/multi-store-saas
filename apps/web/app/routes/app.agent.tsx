import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, Outlet, useLocation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getStoreId } from '~/services/auth.server';
import { Sparkles, MessageSquare, Settings, Book, Bot, Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { ASSETS } from '~/config/assets';
import { LazyAreaChart } from '~/components/charts/LazyAreaChart';
import { Coins } from 'lucide-react';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 }); // Or redirect to login

  const db = drizzle(context.cloudflare.env.DB, { schema });

  // Check if store has Agent enabled and get credits
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, storeId),
    columns: { isCustomerAiEnabled: true, aiCredits: true }
  });

  // Fetch Agent
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId)
  });


  // Calculate Metrics
  const [convCount] = await db.select({ count: count() })
    .from(schema.aiConversations)
    .where(eq(schema.aiConversations.agentId, agent?.id || 0));

  const [leadsCount] = await db.select({ count: count() })
    .from(schema.leadsData)
    .innerJoin(schema.aiConversations, eq(schema.leadsData.conversationId, schema.aiConversations.id))
    .where(eq(schema.aiConversations.agentId, agent?.id || 0));

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
    FROM ai_conversations
    WHERE agent_id = ${agent?.id || 0}
    AND created_at >= ${sevenDaysAgo.getTime()}
    GROUP BY date
    ORDER BY date ASC
  `);

  return json({ 
    agent, 
    isLocked: !store?.isCustomerAiEnabled,
    aiCredits: store?.aiCredits || 0,
    stats: {
        conversations: convCount?.count || 0,
        leads: leadsCount?.count || 0, 
        orders: ordersCount?.count || 0,
        daily: dailyDataRaw
    }
  });
};

export default function AgentDashboard() {
  const { agent, isLocked, stats, aiCredits } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { t } = useTranslation();

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('premiumFeature')}</h2>
        <p className="text-gray-500 max-w-md mb-6">
          {t('premiumFeatureDesc')}
        </p>
        <Link 
          to="/app/billing" 
          className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition"
        >
          {t('upgradeNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <img src={ASSETS.brand.logoSmall} alt="Ozzyl" className="w-8 h-8" />
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
                    {/* Credits Card */}
                    <div className="p-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg relative overflow-hidden text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-violet-200 text-sm font-medium">{t('aiCredits')}</span>
                                <div className="text-xs text-violet-300 mt-1">Pay As You Go</div>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <Coins className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="mb-3">
                             <div className="text-3xl font-bold">
                                {aiCredits.toLocaleString()}
                                <span className="text-sm font-normal text-violet-200 ml-1">{t('creditsLabel')}</span>
                             </div>
                        </div>
                        <Link 
                            to="/app/credits" 
                            className="inline-flex items-center gap-1 text-sm text-violet-200 hover:text-white transition-colors"
                        >
                            {t('buyCredits')} <Zap className="w-3 h-3" />
                        </Link>
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
                    <LazyAreaChart
                        data={(stats?.daily && stats.daily.length > 0 ? stats.daily : [{date: 'Today', count: 0}]) as Record<string, unknown>[]}
                        height={300}
                        dataKey="count"
                        xAxisKey="date"
                        stroke="#10B981"
                        fill="#D1FAE5"
                        showGrid={true}
                        showTooltip={true}
                    />
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
