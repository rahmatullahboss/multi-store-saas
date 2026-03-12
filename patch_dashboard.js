const fs = require('fs');
const path = require('path');

const filePath = path.join('apps', 'web', 'app', 'routes', 'app.dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';",
  "import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';\nimport { Suspense } from 'react';"
);
content = content.replace(
  "import { json } from '@remix-run/cloudflare';",
  "import { defer } from '@remix-run/cloudflare';"
);
content = content.replace(
  "import { useNavigate, useLoaderData, Link } from '@remix-run/react';",
  "import { useNavigate, useLoaderData, Link, Await } from '@remix-run/react';"
);
content = content.replace(
  "import { MetricCard, SalesChart, ActionItems, RecentOrders, RevenueChart } from '~/components/dashboard';",
  "import { MetricCard, SalesChart, ActionItems, RecentOrders, RevenueChart, DashboardSkeleton } from '~/components/dashboard';"
);

const replaceTarget = `  const [statsResult, forecast, clv] = await Promise.all([
    getStoreStats(db as any, storeId), // Type assertion to bypass strict mismatch if service isn't updated yet
    getRevenueForecast(db as any, storeId),
    getPredictedCLV(db as any, storeId)
  ]);
  const {
      products: productCount,
      lowStock: lowStockCount,
      orders: orderCount,
      revenue: revenueTotal,
      todaySales,
      salesTrend,
      pendingOrders: pendingCount,
      abandonedCarts: abandonedCount,
      salesData
  } = statsResult;

  // Get last 90 days revenue grouped by date
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const rawRevenueData = await db
    .select({
      date: sql<string>\`DATE(\${orders.createdAt})\`.as('date'),
      revenue: sql<number>\`SUM(\${orders.total})\`.as('revenue'),
      ordersCount: sql<number>\`COUNT(*)\`.as('ordersCount'),
    })
    .from(orders)
    .where(
      and(
        eq(orders.storeId, storeId),
        gte(orders.createdAt, ninetyDaysAgo),
        eq(orders.status, 'confirmed')
      )
    )
    .groupBy(sql\`DATE(\${orders.createdAt})\`)
    .orderBy(sql\`DATE(\${orders.createdAt})\`);

  // Ensure data has the correct keys expected by the component
  const revenueData = rawRevenueData.map((d: any) => ({
    date: d.date,
    revenue: d.revenue || 0,
    orders: d.ordersCount || 0,
  }));

  // Build action items
  const actionItems: Array<{
    id: string;
    type: 'low_stock' | 'pending_order' | 'abandoned_cart' | 'domain_request';
    count: number;
    link: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Recent 5 orders
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  if (pendingCount > 0) {
    actionItems.push({
      id: 'pending-orders',
      type: 'pending_order',
      count: pendingCount,
      link: '/app/orders?status=pending',
      priority: 'high',
    });
  }

  if (lowStockCount > 0) {
    actionItems.push({
      id: 'low-stock',
      type: 'low_stock',
      count: lowStockCount,
      link: '/app/inventory?filter=low',
      priority: 'medium',
    });
  }

  if (abandonedCount > 0) {
    actionItems.push({
      id: 'abandoned-carts',
      type: 'abandoned_cart',
      count: abandonedCount,
      link: '/app/abandoned-carts',
      priority: 'low',
    });
  }

  // Get greeting based on time
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  // Get SAAS_DOMAIN for store URL
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';
  const storeUrl = \`https://\${store.subdomain}.\${saasDomain}\`;

  // Get usage stats for limit warning banner
  const usage = await getUsageStats(context.cloudflare.env.DB, storeId);

  return json({
    storeName: store.name,
    storeUrl,
    currency: store.currency || 'BDT',
    greeting,
    planType: store.planType || 'free',
    storeEnabled: store.storeEnabled ?? true,
    usage,
    stats: {
      products: productCount,
      lowStock: lowStockCount,
      orders: orderCount,
      revenue: revenueTotal,
      todaySales,
      salesTrend,
      pendingOrders: pendingCount,
    },
    salesData: salesData.map(d => ({
        date: d.date,
        label: d.date, // Use date as label
        value: d.amount
    })),
    actionItems,
    forecast,
    clv,
    revenueData,
    recentOrders: recentOrders.map(o => ({
      ...o,
      createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
    })),
  });`;

const replacement = `  // Get greeting based on time
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  // Get SAAS_DOMAIN for store URL
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';
  const storeUrl = \`https://\${store.subdomain}.\${saasDomain}\`;

  const usagePromise = getUsageStats(context.cloudflare.env.DB, storeId);

  // Group all heavy db queries into one promise
  const dashboardDataPromise = Promise.all([
    getStoreStats(db as any, storeId),
    getRevenueForecast(db as any, storeId),
    getPredictedCLV(db as any, storeId),

    // Get last 90 days revenue
    db
      .select({
        date: sql<string>\`DATE(\${orders.createdAt})\`.as('date'),
        revenue: sql<number>\`SUM(\${orders.total})\`.as('revenue'),
        ordersCount: sql<number>\`COUNT(*)\`.as('ordersCount'),
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          gte(orders.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
          eq(orders.status, 'confirmed')
        )
      )
      .groupBy(sql\`DATE(\${orders.createdAt})\`)
      .orderBy(sql\`DATE(\${orders.createdAt})\`),

    // Recent 5 orders
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.storeId, storeId))
      .orderBy(desc(orders.createdAt))
      .limit(5)
  ]).then(([statsResult, forecast, clv, rawRevenueData, recentOrdersData]) => {
    const {
        products: productCount,
        lowStock: lowStockCount,
        orders: orderCount,
        revenue: revenueTotal,
        todaySales,
        salesTrend,
        pendingOrders: pendingCount,
        abandonedCarts: abandonedCount,
        salesData
    } = statsResult;

    const revenueData = rawRevenueData.map((d: any) => ({
      date: d.date,
      revenue: d.revenue || 0,
      orders: d.ordersCount || 0,
    }));

    const actionItems: Array<{
      id: string;
      type: 'low_stock' | 'pending_order' | 'abandoned_cart' | 'domain_request';
      count: number;
      link: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    if (pendingCount > 0) {
      actionItems.push({
        id: 'pending-orders',
        type: 'pending_order',
        count: pendingCount,
        link: '/app/orders?status=pending',
        priority: 'high',
      });
    }

    if (lowStockCount > 0) {
      actionItems.push({
        id: 'low-stock',
        type: 'low_stock',
        count: lowStockCount,
        link: '/app/inventory?filter=low',
        priority: 'medium',
      });
    }

    if (abandonedCount > 0) {
      actionItems.push({
        id: 'abandoned-carts',
        type: 'abandoned_cart',
        count: abandonedCount,
        link: '/app/abandoned-carts',
        priority: 'low',
      });
    }

    return {
      stats: {
        products: productCount,
        lowStock: lowStockCount,
        orders: orderCount,
        revenue: revenueTotal,
        todaySales,
        salesTrend,
        pendingOrders: pendingCount,
      },
      salesData: salesData.map(d => ({
          date: d.date,
          label: d.date,
          value: d.amount
      })),
      actionItems,
      forecast,
      clv,
      revenueData,
      recentOrders: recentOrdersData.map(o => ({
        ...o,
        createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
      })),
    };
  });

  const usage = await usagePromise;

  return defer({
    storeName: store.name,
    storeUrl,
    currency: store.currency || 'BDT',
    greeting,
    planType: store.planType || 'free',
    storeEnabled: store.storeEnabled ?? true,
    usage,
    dashboardData: dashboardDataPromise,
  });`;

content = content.replace(replaceTarget, replacement);


const componentStartStr = `export default function DashboardPage() {
  const {
    storeName,
    storeUrl,
    currency,
    greeting,
    planType,
    storeEnabled,
    usage,
    stats,
    salesData,
    actionItems,
    forecast,
    clv,
    revenueData,
    recentOrders
  } = useLoaderData<typeof loader>();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();`;

const componentReplacement = `export default function DashboardPage() {
  const loaderData = useLoaderData<typeof loader>();
  const {
    storeName,
    storeUrl,
    currency,
    greeting,
    planType,
    storeEnabled,
    usage,
    dashboardData
  } = loaderData as any; // Type override since Remix defer typings can be complex
  const { t, lang } = useTranslation();
  const navigate = useNavigate();`;

content = content.replace(componentStartStr, componentReplacement);

const returnTarget = `  return (
    <div className="space-y-8">`;

const returnReplacement = `  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Await resolve={dashboardData}>
        {(resolvedData) => {
          const { stats, salesData, actionItems, forecast, clv, revenueData, recentOrders } = resolvedData as any;
          return (
            <div className="space-y-8 animate-in fade-in duration-500">`;

content = content.replace(returnTarget, returnReplacement);

const eofTarget = `    </div>
  );
}`;

const eofReplacement = `    </div>
          );
        }}
      </Await>
    </Suspense>
  );
}`;

content = content.replace(eofTarget, eofReplacement);

fs.writeFileSync(filePath, content, 'utf8');
