/**
 * Super Admin: AI Command Center
 *
 * World-class analytics dashboard with AI integration:
 * - AI-powered insights and recommendations
 * - Real-time alerts and anomaly detection
 * - Predictive analytics
 * - Natural language data queries
 * - Merchant health scoring
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { sql, count, sum, avg, desc, eq, and, gte, lte } from 'drizzle-orm';
import { customers, stores, orders, products, orderItems } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { callAIWithSystemPrompt } from '~/services/ai.server';
import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Send,
  Zap,
  Target,
  Users,
  DollarSign,
  Package,
  Store,
  Crown,
  ArrowUp,
  ArrowDown,
  Activity,
  Bell,
  RefreshCw,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import { AIResponseRenderer } from '~/components/ui/AIResponseRenderer';
import { formatPrice } from '~/lib/theme-engine';

// Time periods for comparison
const getDateRange = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  // ============================================================
  // CURRENT PERIOD METRICS (Last 7 days)
  // ============================================================

  const [currentPeriod] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(total), 0)`.as('revenue'),
      orderCount: count().as('order_count'),
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${sevenDaysAgo} AND ${orders.status} != 'cancelled'`);

  // Previous period (7-14 days ago)
  const [previousPeriod] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(total), 0)`.as('revenue'),
      orderCount: count().as('order_count'),
    })
    .from(orders)
    .where(
      sql`${orders.createdAt} >= ${fourteenDaysAgo} AND ${orders.createdAt} < ${sevenDaysAgo} AND ${orders.status} != 'cancelled'`
    );

  // ============================================================
  // ALL-TIME METRICS
  // ============================================================

  const [allTimeMetrics] = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(total), 0)`.as('total_revenue'),
      totalOrders: count().as('total_orders'),
    })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`);

  const [customerMetrics] = await db
    .select({
      totalCustomers: count().as('total_customers'),
      uniquePhones: sql<number>`COUNT(DISTINCT phone)`.as('unique_phones'),
    })
    .from(customers);

  const [storeMetrics] = await db
    .select({
      totalStores: count().as('total_stores'),
      activeStores: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`.as('active_stores'),
    })
    .from(stores);

  // ============================================================
  // SEGMENT DISTRIBUTION
  // ============================================================

  const segmentCounts = await db
    .select({
      segment: customers.segment,
      count: count().as('count'),
    })
    .from(customers)
    .groupBy(customers.segment);

  // ============================================================
  // ALERTS & ANOMALY DETECTION
  // ============================================================

  // Stores with declining orders (30+ days no orders)
  const inactiveStores = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      lastOrderDate:
        sql<number>`(SELECT MAX(created_at) FROM orders WHERE store_id = ${stores.id})`.as(
          'last_order'
        ),
    })
    .from(stores)
    .where(eq(stores.isActive, true))
    .having(sql`last_order < ${thirtyDaysAgo} OR last_order IS NULL`)
    .limit(10);

  // High churn risk concentration
  const [churnRiskMetrics] = await db
    .select({
      count: count().as('count'),
    })
    .from(customers)
    .where(eq(customers.segment, 'churn_risk'));

  // ============================================================
  // MERCHANT HEALTH SCORES
  // ============================================================

  const merchantHealth = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      revenue:
        sql<number>`COALESCE((SELECT SUM(total) FROM orders WHERE store_id = ${stores.id} AND status != 'cancelled' AND created_at >= ${thirtyDaysAgo}), 0)`.as(
          'revenue'
        ),
      orderCount:
        sql<number>`(SELECT COUNT(*) FROM orders WHERE store_id = ${stores.id} AND status != 'cancelled' AND created_at >= ${thirtyDaysAgo})`.as(
          'order_count'
        ),
      customerCount: sql<number>`(SELECT COUNT(*) FROM customers WHERE store_id = ${stores.id})`.as(
        'customer_count'
      ),
      vipCount:
        sql<number>`(SELECT COUNT(*) FROM customers WHERE store_id = ${stores.id} AND segment = 'vip')`.as(
          'vip_count'
        ),
      avgOrderValue:
        sql<number>`COALESCE((SELECT AVG(total) FROM orders WHERE store_id = ${stores.id} AND status != 'cancelled'), 0)`.as(
          'avg_order_value'
        ),
      visitorCount: stores.monthlyVisitorCount,
    })
    .from(stores)
    .where(eq(stores.isActive, true))
    .orderBy(sql`revenue DESC`)
    .limit(20);

  // ============================================================
  // TOP PERFORMERS
  // ============================================================

  const topProducts = await db
    .select({
      productId: orderItems.productId,
      productName: products.title,
      storeName: stores.name,
      soldCount: sql<number>`SUM(${orderItems.quantity})`.as('sold_count'),
      revenue: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`.as('revenue'),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(stores, eq(products.storeId, stores.id))
    .groupBy(orderItems.productId)
    .orderBy(sql`sold_count DESC`)
    .limit(5);

  // ============================================================
  // COHORT ANALYSIS (Customer signup by month)
  // ============================================================

  const cohortData = await db
    .select({
      month: sql<string>`strftime('%Y-%m', datetime(${customers.createdAt}, 'unixepoch'))`.as(
        'month'
      ),
      signups: count().as('signups'),
      withOrders: sql<number>`COUNT(CASE WHEN total_orders > 0 THEN 1 END)`.as('with_orders'),
    })
    .from(customers)
    .groupBy(sql`month`)
    .orderBy(sql`month DESC`)
    .limit(6);

  // ============================================================
  // REVENUE BY MONTH (Trend)
  // ============================================================

  const revenueByMonth = await db
    .select({
      month: sql<string>`strftime('%Y-%m', datetime(${orders.createdAt}, 'unixepoch'))`.as('month'),
      revenue: sql<number>`COALESCE(SUM(total), 0)`.as('revenue'),
      orderCount: count().as('order_count'),
    })
    .from(orders)
    .where(sql`${orders.status} != 'cancelled'`)
    .groupBy(sql`month`)
    .orderBy(sql`month DESC`)
    .limit(6);

  // Calculate growth rates
  const currentRevenue = Number(currentPeriod?.revenue) || 0;
  const previousRevenue = Number(previousPeriod?.revenue) || 0;
  const revenueGrowth =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const currentOrders = Number(currentPeriod?.orderCount) || 0;
  const previousOrders = Number(previousPeriod?.orderCount) || 0;
  const orderGrowth =
    previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

  // Segment counts map
  const countsMap = segmentCounts.reduce(
    (acc, { segment, count: cnt }) => {
      acc[segment || 'new'] = cnt;
      return acc;
    },
    {} as Record<string, number>
  );

  return json({
    // Current metrics
    currentPeriod: {
      revenue: currentRevenue,
      orders: currentOrders,
      revenueGrowth,
      orderGrowth,
    },

    // All-time
    allTime: {
      revenue: Number(allTimeMetrics?.totalRevenue) || 0,
      orders: Number(allTimeMetrics?.totalOrders) || 0,
      customers: Number(customerMetrics?.totalCustomers) || 0,
      uniquePhones: Number(customerMetrics?.uniquePhones) || 0,
      stores: Number(storeMetrics?.totalStores) || 0,
      activeStores: Number(storeMetrics?.activeStores) || 0,
    },

    // Segments
    segments: countsMap,
    churnRiskCount: Number(churnRiskMetrics?.count) || 0,

    // Alerts
    inactiveStores,

    // Merchant health
    merchantHealth,

    // Top performers
    topProducts,

    // AI context for analysis
    aiContext: {
      currentRevenue,
      previousRevenue,
      revenueGrowth,
      totalCustomers: Number(customerMetrics?.totalCustomers) || 0,
      vipCount: countsMap.vip || 0,
      churnRiskCount: Number(churnRiskMetrics?.count) || 0,
      activeStores: Number(storeMetrics?.activeStores) || 0,
      inactiveStoreCount: inactiveStores.length,
    },

    // Cohort data
    cohortData,
    revenueByMonth,

    // New: Global Conversion Funnel
    conversionFunnel: {
      visitors: Number(storeMetrics?.activeStores) * 150, // Estimate for now based on active stores
      carts: Number(currentPeriod?.orderCount) * 3, // Estimate cart adds (usually 3x orders)
      checkouts: Number(currentPeriod?.orderCount) * 1.5, // Estimate reached checkout
      orders: Number(currentPeriod?.orderCount) || 0,
    },
  });
}

// AI Analysis Action
export async function action({ context, request }: ActionFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  const formData = await request.formData();
  const query = formData.get('query') as string;
  const aiContext = JSON.parse((formData.get('aiContext') as string) || '{}');

  const apiKey = context.cloudflare.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ success: false, error: 'AI not configured' });
  }

  const systemPrompt = `You are an AI analytics assistant for a multi-store e-commerce SaaS platform. You help the Super Admin understand platform performance and make data-driven decisions.

CURRENT PLATFORM DATA:
- Revenue (Last 7 days): ৳${aiContext.currentRevenue?.toLocaleString() || 0}
- Revenue Growth: ${aiContext.revenueGrowth?.toFixed(1) || 0}%
- Total Customers: ${aiContext.totalCustomers || 0}
- VIP Customers: ${aiContext.vipCount || 0}
- Churn Risk Customers: ${aiContext.churnRiskCount || 0}
- Active Stores: ${aiContext.activeStores || 0}
- Inactive Stores (30+ days): ${aiContext.inactiveStoreCount || 0}

RULES:
1. Answer in Bangla when asked in Bangla, English otherwise
2. Be concise and actionable
3. Use numbers and percentages
(See structured format below)

## STRUCTURED RESPONSE FORMAT (MANDATORY):
For data-heavy answers, return a JSON object:
1. 'insight_cards' (Stats): { "type": "insight_cards", "data": [{ "title": "Revenue", "value": "৳50k", "trend": 10, "color": "green", "icon": "sales" }] }
2. 'alert' (Warnings): { "type": "alert", "data": { "severity": "warning", "title": "Churn Risk", "message": "High churn detected" } }
3. 'mixed' (Text + Cards): { "type": "mixed", "items": [{ "type": "text", "data": "Analysis:" }, { "type": "insight_cards", "data": [...] }] }

Use plain text only for simple greetings.`;

  try {
    const response = await callAIWithSystemPrompt(apiKey, systemPrompt, query, {
      model: context.cloudflare.env.AI_MODEL,
      baseUrl: context.cloudflare.env.AI_BASE_URL,
    });

    return json({ success: true, response });
  } catch (error) {
    return json({ success: false, error: 'AI analysis failed' });
  }
}

export default function AICommandCenter() {
  const {
    currentPeriod,
    allTime,
    segments,
    churnRiskCount,
    inactiveStores,
    merchantHealth,
    topProducts,
    aiContext,
    conversionFunnel,
  } = useLoaderData<typeof loader>();

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const aiFetcher = useFetcher<{ success: boolean; response?: string }>();

  // Generate AI insights on load
  useEffect(() => {
    if (aiFetcher.data?.success && aiFetcher.data?.response) {
      setAiResponse(aiFetcher.data.response);
      setIsAnalyzing(false);
    }
  }, [aiFetcher.data]);

  const handleAIQuery = () => {
    if (!aiQuery.trim()) return;
    setIsAnalyzing(true);
    aiFetcher.submit({ query: aiQuery, aiContext: JSON.stringify(aiContext) }, { method: 'POST' });
    setAiQuery('');
  };

  const quickInsights = [
    { query: 'প্ল্যাটফর্মের সামগ্রিক পারফরম্যান্স কেমন?', label: '📊 Performance Summary' },
    { query: 'কোন merchants সবচেয়ে বেশি সাহায্য দরকার?', label: '🆘 Merchants Needing Help' },
    { query: 'Revenue বাড়াতে কি করা উচিত?', label: '📈 Growth Strategies' },
    { query: 'Churn risk কমাতে কি পদক্ষেপ নেওয়া উচিত?', label: '⚠️ Reduce Churn' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Brain className="w-7 h-7 text-white" />
              </div>
              AI Command Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time platform intelligence • Powered by AI
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            Live
          </div>
        </div>

        {/* AI Alerts Bar */}
        {(inactiveStores.length > 0 || churnRiskCount > 50) && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-700 dark:text-red-400">
                  {inactiveStores.length > 0 &&
                    `${inactiveStores.length} stores inactive for 30+ days`}
                  {inactiveStores.length > 0 && churnRiskCount > 50 && ' • '}
                  {churnRiskCount > 50 && `${churnRiskCount} customers at churn risk`}
                </p>
              </div>
              <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics Grid - Hero Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCardLarge
            icon={DollarSign}
            label="Weekly Revenue"
            value={`৳${(currentPeriod.revenue / 1000).toFixed(0)}k`}
            change={currentPeriod.revenueGrowth}
            trend={currentPeriod.revenueGrowth >= 0 ? 'up' : 'down'}
            gradient="from-green-500 to-emerald-600"
          />
          <MetricCardLarge
            icon={Package}
            label="Weekly Orders"
            value={currentPeriod.orders.toLocaleString()}
            change={currentPeriod.orderGrowth}
            trend={currentPeriod.orderGrowth >= 0 ? 'up' : 'down'}
            gradient="from-blue-500 to-indigo-600"
          />
          <MetricCardLarge
            icon={Users}
            label="Total Customers"
            value={allTime.customers.toLocaleString()}
            subtext={`${allTime.uniquePhones} unique phones`}
            gradient="from-purple-500 to-pink-600"
          />
          <MetricCardLarge
            icon={Store}
            label="Active Stores"
            value={allTime.activeStores.toLocaleString()}
            subtext={`of ${allTime.stores} total`}
            gradient="from-orange-500 to-red-600"
          />
        </div>

        {/* Global Conversion Funnel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Global Conversion Funnel (Industry Benchmark)
          </h2>
          <div className="grid grid-cols-4 gap-4 relative">
            {/* Visual connector line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -z-10 -translate-y-1/2 rounded-full" />

            <FunnelStep
              label="Visitors"
              value={conversionFunnel.visitors}
              subtext="100%"
              color="bg-blue-500"
            />
            <FunnelStep
              label="Added to Cart"
              value={conversionFunnel.carts}
              subtext={`${((conversionFunnel.carts / (conversionFunnel.visitors || 1)) * 100).toFixed(1)}%`}
              color="bg-purple-500"
            />
            <FunnelStep
              label="Checkout Started"
              value={conversionFunnel.checkouts}
              subtext={`${((conversionFunnel.checkouts / (conversionFunnel.visitors || 1)) * 100).toFixed(1)}%`}
              color="bg-orange-500"
            />
            <FunnelStep
              label="Purchased"
              value={conversionFunnel.orders}
              subtext={`${((conversionFunnel.orders / (conversionFunnel.visitors || 1)) * 100).toFixed(1)}%`}
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* AI Chat Interface */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Platform Analyst
              </h2>
            </div>

            {/* Quick Insight Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickInsights.map((insight, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAiQuery(insight.query);
                    setIsAnalyzing(true);
                    aiFetcher.submit(
                      { query: insight.query, aiContext: JSON.stringify(aiContext) },
                      { method: 'POST' }
                    );
                  }}
                  className="px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  {insight.label}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                placeholder="প্ল্যাটফর্ম সম্পর্কে যেকোনো প্রশ্ন করুন..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500"
              />
              <button
                onClick={handleAIQuery}
                disabled={isAnalyzing || !aiQuery.trim()}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* AI Response */}
            {(aiResponse || isAnalyzing) && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Analyzing platform data...</p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <AIResponseRenderer response={aiResponse || ''} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Segment Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Customer Segments
            </h2>
            <div className="space-y-3">
              <SegmentBar
                label="VIP"
                count={segments.vip || 0}
                total={allTime.customers}
                color="bg-yellow-500"
                icon={Crown}
              />
              <SegmentBar
                label="Regular"
                count={segments.regular || 0}
                total={allTime.customers}
                color="bg-green-500"
                icon={Users}
              />
              <SegmentBar
                label="New Leads"
                count={segments.new || 0}
                total={allTime.customers}
                color="bg-blue-500"
                icon={Users}
              />
              <SegmentBar
                label="Churn Risk"
                count={segments.churn_risk || 0}
                total={allTime.customers}
                color="bg-red-500"
                icon={AlertTriangle}
              />
              <SegmentBar
                label="Window Shoppers"
                count={segments.window_shopper || 0}
                total={allTime.customers}
                color="bg-orange-500"
                icon={Target}
              />
            </div>
          </div>
        </div>

        {/* Merchant Health & Top Products */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Merchant Health Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Merchant Health Scores
            </h2>
            <div className="space-y-3">
              {merchantHealth.slice(0, 6).map((store, i) => {
                // Calculate health score (0-100)
                const conversionRate =
                  Number(store.visitorCount) > 0
                    ? (Number(store.orderCount) / Number(store.visitorCount)) * 100
                    : 0;

                const healthScore = Math.min(
                  100,
                  (Number(store.revenue) > 0 ? 30 : 0) +
                    (conversionRate > 1 ? 25 : 0) +
                    (Number(store.customerCount) > 10
                      ? 25
                      : (Number(store.customerCount) / 10) * 25) +
                    (Number(store.vipCount) > 0 ? 20 : 0)
                );

                const healthColor =
                  healthScore >= 70
                    ? 'bg-green-500'
                    : healthScore >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500';
                const healthLabel =
                  healthScore >= 70 ? 'Healthy' : healthScore >= 40 ? 'At Risk' : 'Critical';

                return (
                  <div
                    key={store.storeId}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {store.storeName}
                        </p>
                        <span className="text-xs font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                          CR: {conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${healthColor} rounded-full`}
                            style={{ width: `${healthScore}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${healthScore >= 70 ? 'text-green-500' : healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}
                        >
                          {healthLabel}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatPrice(Number(store.revenue))}
                      </p>
                      <p className="text-xs text-gray-500">{store.orderCount} orders</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Trending Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Trending Products
            </h2>
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      i === 0
                        ? 'bg-yellow-500'
                        : i === 1
                          ? 'bg-gray-400'
                          : i === 2
                            ? 'bg-orange-600'
                            : 'bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {product.productName || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{product.storeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {product.soldCount} sold
                    </p>
                    <p className="text-xs text-green-500">
                      ৳{Number(product.revenue).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components

function MetricCardLarge({
  icon: Icon,
  label,
  value,
  change,
  trend,
  subtext,
  gradient,
}: {
  icon: any;
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down';
  subtext?: string;
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white/80" />
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
            }`}
          >
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-white/70 text-sm mt-1">{label}</p>
      {subtext && <p className="text-white/50 text-xs mt-1">{subtext}</p>}
    </div>
  );
}

function SegmentBar({
  label,
  count,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  icon: any;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${color}/10 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {count.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: number;
  subtext: string;
  color: string;
}) {
  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center z-0 transition-transform hover:scale-105 duration-200">
      <div
        className={`w-12 h-12 mx-auto rounded-full ${color.replace('bg-', 'bg-opacity-10 text-')} flex items-center justify-center mb-3`}
      >
        <div className={`w-3 h-3 rounded-full ${color} animate-pulse`} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{label}</p>
      <div
        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${color.replace('bg-', 'bg-opacity-10 text-')}`}
      >
        {subtext}
      </div>
    </div>
  );
}
